import { useEffect, useState } from 'react';
import { socket, BACKEND_URL } from '../socket/socket';
import axios from 'axios';
import toast from 'react-hot-toast';

export function useRoom(roomId, username) {
  const [session, setSession] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usernameTaken, setUsernameTaken] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Fetch session data
    axios.get(`${BACKEND_URL}/api/sessions/${roomId}`)
      .then(res => {
        if (isMounted) {
          setSession(res.data);
          setParticipants(res.data.participants || []);
          setLoading(false);
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.response?.data?.error || 'Failed to load room session');
          setLoading(false);
        }
      });

    // Socket handlers
    const handleRoomParticipants = (participantsList) => {
      if (!isMounted) return;
      console.log('[useRoom] Received room-participants:', participantsList);
      const unique = [];
      const seen = new Set();
      for (const p of participantsList) {
        if (!seen.has(p.username)) {
          seen.add(p.username);
          unique.push(p);
        }
      }
      setParticipants(unique);
    };

    const handleUserToast = (name) => {
      console.log('[useRoom] User joined toast:', name);
      toast.success(`${name} joined the room!`, { icon: '👋' });
    };

    const handleLeaveToast = (name) => {
      console.log('[useRoom] User left toast:', name);
      if (name) toast(`${name} left.`, { icon: '🏃' });
    };

    const handleSessionUpdated = (newSession) => {
      if (isMounted) setSession(newSession);
    };

    const handleJoinError = (errorMessage) => {
      if (!isMounted) return;
      console.log('[useRoom] Join error:', errorMessage);
      toast.error(errorMessage, { duration: 5000 });
      setUsernameTaken(true);
      setLoading(false);
    };

    const handleJoinSuccess = () => {
      console.log('[useRoom] Join success!');
    };

    // Register listeners FIRST
    socket.on('room-participants', handleRoomParticipants);
    socket.on('user-connected-toast', handleUserToast);
    socket.on('user-disconnected-toast', handleLeaveToast);
    socket.on('session-updated', handleSessionUpdated);
    socket.on('join-error', handleJoinError);
    socket.on('join-success', handleJoinSuccess);

    // Always connect (even if already connected, this is idempotent)
    console.log('[useRoom] Socket connected status:', socket.connected, 'Socket ID:', socket.id);
    if (!socket.connected) {
      console.log('[useRoom] Connecting socket...');
      socket.connect();
    } else {
      console.log('[useRoom] Socket already connected');
    }

    // Wait a tick to ensure connection is established
    setTimeout(() => {
      console.log('[useRoom] Emitting join-room:', { roomId, username }, 'Socket ID:', socket.id);
      socket.emit('join-room', { roomId, username });
    }, 100);

    return () => {
      isMounted = false;
      console.log('[useRoom] Cleanup - removing listeners');
      socket.off('room-participants', handleRoomParticipants);
      socket.off('user-connected-toast', handleUserToast);
      socket.off('user-disconnected-toast', handleLeaveToast);
      socket.off('session-updated', handleSessionUpdated);
      socket.off('join-error', handleJoinError);
      socket.off('join-success', handleJoinSuccess);
      
      // DON'T disconnect socket here - let it stay connected for the session
      // Only disconnect when user actually leaves the room page (handled by RoomPage unmount)
    };
  }, [roomId, username]);

  return { session, participants, loading, error, setSession, usernameTaken };
}
