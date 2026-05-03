import { useEffect, useRef, useState } from 'react';
import { socket } from '../socket/socket';
import { FaMicrophone, FaMicrophoneSlash, FaHeadphones, FaPhoneSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function VoiceChat({ roomId }) {
  const [inVoice, setInVoice] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [connectedPeers, setConnectedPeers] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false); // Local mic activity
  const [remoteSpeaking, setRemoteSpeaking] = useState({}); // { peerId: boolean }

  const localStream = useRef(null);
  const peerConnections = useRef({}); // { socketId: RTCPeerConnection }
  const audioElements = useRef({});   // { socketId: HTMLAudioElement }
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  const ICE_SERVERS = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ]
  };

  // ── Audio level detection ────────────────────────────────────────────────

  const startAudioLevelDetection = (stream) => {
    try {
      console.log('[Voice] Starting audio level detection...');
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;
      
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const detectLevel = () => {
        if (!analyserRef.current) return;
        
        analyser.getByteTimeDomainData(dataArray);
        
        // Calculate RMS (root mean square) for better volume detection
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const normalized = (dataArray[i] - 128) / 128;
          sum += normalized * normalized;
        }
        const rms = Math.sqrt(sum / dataArray.length);
        const volume = Math.max(0, Math.min(100, rms * 100));
        
        console.log('[Voice] Audio level:', volume.toFixed(2));
        setIsSpeaking(volume > 1); // Lower threshold - 1% volume
        
        animationFrameRef.current = requestAnimationFrame(detectLevel);
      };
      
      detectLevel();
      console.log('[Voice] Audio level detection started');
    } catch (err) {
      console.error('[Voice] Audio level detection error:', err);
    }
  };

  const stopAudioLevelDetection = () => {
    console.log('[Voice] Stopping audio level detection');
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setIsSpeaking(false);
  };

  // ── Remote audio level detection ─────────────────────────────────────────

  const monitorRemoteAudio = (peerId, stream) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      
      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 512;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const detect = () => {
        if (!audioElements.current[peerId]) return; // Stop if peer disconnected
        
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        
        setRemoteSpeaking(prev => ({ ...prev, [peerId]: average > 10 }));
        requestAnimationFrame(detect);
      };
      
      detect();
    } catch (err) {
      console.error('[Voice] Remote audio monitoring error:', err);
    }
  };

  // ── helpers ──────────────────────────────────────────────────────────────

  const playStream = (peerId, stream) => {
    console.log('[Voice] Playing stream from peer:', peerId);
    
    if (audioElements.current[peerId]) {
      audioElements.current[peerId].srcObject = stream;
      return;
    }
    
    const audio = document.createElement('audio');
    audio.autoplay = true;
    audio.playsInline = true;
    audio.volume = 1.0;
    audio.srcObject = stream;
    document.body.appendChild(audio);
    
    audio.play()
      .then(() => {
        console.log('[Voice] Audio playing successfully for peer:', peerId);
        toast.success(`Voice connected with peer!`, { duration: 2000 });
      })
      .catch(err => {
        console.error('[Voice] Audio play failed:', err);
        toast.error('Audio play failed - check browser permissions');
      });
    
    audioElements.current[peerId] = audio;
    setConnectedPeers(prev => [...new Set([...prev, peerId])]);
    
    // Monitor remote audio levels
    monitorRemoteAudio(peerId, stream);
  };

  const removeStream = (peerId) => {
    console.log('[Voice] Removing stream for peer:', peerId);
    if (audioElements.current[peerId]) {
      audioElements.current[peerId].pause();
      audioElements.current[peerId].srcObject = null;
      audioElements.current[peerId].remove();
      delete audioElements.current[peerId];
    }
    setConnectedPeers(prev => prev.filter(id => id !== peerId));
    setRemoteSpeaking(prev => {
      const updated = { ...prev };
      delete updated[peerId];
      return updated;
    });
  };

  const createPC = (peerId) => {
    if (peerConnections.current[peerId]) {
      console.log('[Voice] Reusing existing peer connection for:', peerId);
      return peerConnections.current[peerId];
    }

    console.log('[Voice] Creating new peer connection for:', peerId);
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks
    if (localStream.current) {
      localStream.current.getTracks().forEach(track => {
        console.log('[Voice] Adding local track to peer connection:', track.kind);
        pc.addTrack(track, localStream.current);
      });
    }

    // When we get remote audio
    pc.ontrack = (e) => {
      console.log('[Voice] Received remote track from:', peerId, 'Stream:', e.streams[0]);
      playStream(peerId, e.streams[0]);
    };

    // Send ICE candidates to the other peer via socket
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        console.log('[Voice] Sending ICE candidate to:', peerId);
        socket.emit('webrtc-ice-candidate', { to: peerId, candidate: e.candidate });
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('[Voice] Connection state changed for', peerId, ':', pc.connectionState);
      if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
        removeStream(peerId);
        delete peerConnections.current[peerId];
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[Voice] ICE connection state for', peerId, ':', pc.iceConnectionState);
    };

    peerConnections.current[peerId] = pc;
    return pc;
  };

  const closeAll = () => {
    console.log('[Voice] Closing all connections');
    Object.entries(peerConnections.current).forEach(([id, pc]) => {
      try { pc.close(); } catch (_) {}
    });
    peerConnections.current = {};

    Object.keys(audioElements.current).forEach(removeStream);

    if (localStream.current) {
      localStream.current.getTracks().forEach(t => t.stop());
      localStream.current = null;
    }
    
    stopAudioLevelDetection();
    setConnectedPeers([]);
    setRemoteSpeaking({});
  };

  // ── main effect ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!inVoice) return;
    let active = true;

    const start = async () => {
      try {
        console.log('[Voice] Requesting microphone access...');
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { 
            echoCancellation: true, 
            noiseSuppression: true, 
            autoGainControl: true 
          }
        });
        
        if (!active) { 
          stream.getTracks().forEach(t => t.stop()); 
          return; 
        }

        console.log('[Voice] Microphone access granted');
        console.log('[Voice] Audio tracks:', stream.getAudioTracks());
        console.log('[Voice] Track settings:', stream.getAudioTracks()[0]?.getSettings());
        console.log('[Voice] Track enabled:', stream.getAudioTracks()[0]?.enabled);
        console.log('[Voice] Track muted:', stream.getAudioTracks()[0]?.muted);
        console.log('[Voice] Track readyState:', stream.getAudioTracks()[0]?.readyState);
        
        // CRITICAL: Check if track is muted by browser/OS
        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack.muted) {
          console.warn('[Voice] ⚠️ MICROPHONE IS MUTED BY BROWSER/OS!');
          toast.error('Your microphone is muted in Windows! Check sound settings.', { duration: 8000 });
        }
        
        localStream.current = stream;
        localStream.current.getAudioTracks()[0].enabled = !isMuted;
        
        // Start audio level detection
        startAudioLevelDetection(stream);
        
        toast.success('Microphone connected!', { duration: 2000 });

        // Tell everyone else in the room we joined voice
        console.log('[Voice] Emitting webrtc-join to room:', roomId);
        socket.emit('webrtc-join', roomId);

      } catch (err) {
        if (!active) return;
        console.error('[Voice] Microphone access error:', err);
        setInVoice(false);
        toast.error(
          err.name === 'NotAllowedError'
            ? "Mic blocked — allow microphone access and try again."
            : "Mic error: " + err.message,
          { duration: 5000 }
        );
      }
    };

    // ── socket handlers ───────────────────────────────────────────────────

    // Someone else joined voice → we create an offer to them
    const onUserConnected = async (remoteId) => {
      console.log('[Voice] User connected to voice:', remoteId);
      if (!localStream.current) {
        console.warn('[Voice] Local stream not ready yet');
        return;
      }
      
      const pc = createPC(remoteId);
      try {
        console.log('[Voice] Creating offer for:', remoteId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        console.log('[Voice] Sending offer to:', remoteId);
        socket.emit('webrtc-offer', { to: remoteId, offer });
      } catch (e) {
        console.error('[Voice] Offer creation error:', e);
      }
    };

    // We received an offer → answer it
    const onOffer = async ({ from, offer }) => {
      console.log('[Voice] Received offer from:', from);
      if (!localStream.current) {
        console.warn('[Voice] Local stream not ready to answer');
        return;
      }
      
      const pc = createPC(from);
      try {
        console.log('[Voice] Setting remote description and creating answer for:', from);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        console.log('[Voice] Sending answer to:', from);
        socket.emit('webrtc-answer', { to: from, answer });
      } catch (e) {
        console.error('[Voice] Answer creation error:', e);
      }
    };

    // We received an answer to our offer
    const onAnswer = async ({ from, answer }) => {
      console.log('[Voice] Received answer from:', from);
      const pc = peerConnections.current[from];
      if (!pc) {
        console.warn('[Voice] No peer connection found for:', from);
        return;
      }
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log('[Voice] Remote description set for:', from);
      } catch (e) {
        console.error('[Voice] Set remote description error:', e);
      }
    };

    // ICE candidate from remote
    const onIce = async ({ from, candidate }) => {
      console.log('[Voice] Received ICE candidate from:', from);
      const pc = peerConnections.current[from];
      if (!pc) {
        console.warn('[Voice] No peer connection for ICE candidate from:', from);
        return;
      }
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('[Voice] ICE candidate added for:', from);
      } catch (e) {
        console.error('[Voice] Add ICE candidate error:', e);
      }
    };

    // Remote peer left
    const onUserDisconnected = (remoteId) => {
      console.log('[Voice] User disconnected from voice:', remoteId);
      if (peerConnections.current[remoteId]) {
        peerConnections.current[remoteId].close();
        delete peerConnections.current[remoteId];
      }
      removeStream(remoteId);
    };

    socket.on('webrtc-user-connected', onUserConnected);
    socket.on('webrtc-offer', onOffer);
    socket.on('webrtc-answer', onAnswer);
    socket.on('webrtc-ice-candidate', onIce);
    socket.on('webrtc-user-disconnected', onUserDisconnected);

    start();

    return () => {
      active = false;
      socket.off('webrtc-user-connected', onUserConnected);
      socket.off('webrtc-offer', onOffer);
      socket.off('webrtc-answer', onAnswer);
      socket.off('webrtc-ice-candidate', onIce);
      socket.off('webrtc-user-disconnected', onUserDisconnected);
      socket.emit('webrtc-disconnect', roomId);
      closeAll();
    };
  }, [inVoice, roomId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── mute toggle ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (localStream.current?.getAudioTracks()[0]) {
      localStream.current.getAudioTracks()[0].enabled = !isMuted;
    }
  }, [isMuted]);

  const toggleVoice = () => {
    if (inVoice) {
      setInVoice(false);
      setIsMuted(false);
      toast('Voice disconnected', { icon: '🔇' });
    } else {
      setInVoice(true);
    }
  };

  // Check if anyone is speaking
  const anyoneSpeaking = Object.values(remoteSpeaking).some(Boolean);

  return (
    <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/50 shadow-inner">
      <button
        onClick={toggleVoice}
        className={`flex items-center gap-2 text-[11px] uppercase tracking-wider font-bold px-4 py-2 rounded-lg transition-all cursor-pointer ${
          inVoice
            ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 ring-1 ring-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
            : 'bg-slate-700 hover:bg-slate-600 text-slate-300 shadow-sm'
        }`}
      >
        {inVoice ? <FaPhoneSlash /> : <FaHeadphones />}
        {inVoice ? 'Disconnect' : 'Engage Voice'}
      </button>

      {inVoice && (
        <button
          onClick={() => setIsMuted(m => !m)}
          className={`p-2 rounded-lg transition-all cursor-pointer relative ${
            isMuted
              ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 outline outline-1 outline-red-500/50'
              : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
          
          {/* Speaking indicator - pulsing ring when you speak */}
          {!isMuted && isSpeaking && (
            <span className="absolute -inset-1 bg-emerald-500 rounded-lg animate-ping opacity-75"></span>
          )}
        </button>
      )}

      {/* Connected peers indicator with speaking animation */}
      {connectedPeers.length > 0 && (
        <div className="flex items-center ml-2 border-l border-slate-700 pl-3 gap-1.5">
          <span className={`w-2 h-2 rounded-full transition-all ${
            anyoneSpeaking 
              ? 'bg-emerald-500 animate-pulse scale-150' 
              : 'bg-emerald-500 animate-pulse'
          }`}></span>
          <span className={`text-[10px] font-black tracking-widest uppercase transition-colors ${
            anyoneSpeaking ? 'text-emerald-300' : 'text-emerald-400'
          }`}>
            {connectedPeers.length} Live {anyoneSpeaking && '🔊'}
          </span>
        </div>
      )}
      
      {/* Your mic indicator */}
      {inVoice && !isMuted && (
        <div className="flex items-center ml-2 border-l border-slate-700 pl-3 gap-1.5">
          <span className={`text-[10px] font-bold transition-all ${
            isSpeaking ? 'text-yellow-400 animate-pulse' : 'text-slate-500'
          }`}>
            {isSpeaking ? '🎤 Speaking' : '🎤 Silent'}
          </span>
        </div>
      )}
    </div>
  );
}
