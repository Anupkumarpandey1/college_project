import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useRoom } from '../hooks/useRoom';
import QuestionPanel from '../components/QuestionPanel';
import CodeEditor from '../components/CodeEditor';
import Whiteboard from '../components/Whiteboard';
import VoiceChat from '../components/VoiceChat';
import { FaPen, FaShareAlt, FaForward, FaChevronLeft, FaTrophy, FaUsers, FaChevronDown, FaBook, FaCode, FaTerminal } from 'react-icons/fa';
import axios from 'axios';
import { socket, BACKEND_URL } from '../socket/socket';
import toast, { Toaster } from 'react-hot-toast';

export default function RoomPage() {
  const { roomId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const urlUsername = queryParams.get('username');

  const [hasJoined, setHasJoined] = useState(!!urlUsername);
  const [tempName, setTempName] = useState(urlUsername || '');
  const [nameError, setNameError] = useState('');

  const handleJoin = (e) => {
    e.preventDefault();
    if (!tempName.trim()) return alert("Please enter a name");
    setNameError('');
    window.history.replaceState(null, '', `?username=${encodeURIComponent(tempName)}`);
    setHasJoined(true);
  };

  const handleRetry = () => {
    setHasJoined(false);
    setTempName('');
    setNameError('That name is already taken. Pick a different one.');
  };

  if (!hasJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-[#0b1120] to-[#0b1120] text-white p-4 sm:p-6 relative overflow-hidden">
        <Toaster position="top-center" />
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>

        <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-300 z-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-white text-center">Join Room</h2>
          <p className="text-slate-400 text-center mb-6 sm:mb-8 text-sm">Enter your display name to start collaborating</p>
          {nameError && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium">
              {nameError}
            </div>
          )}
          <form onSubmit={handleJoin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide">Display Name</label>
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="e.g. Code Ninja"
                className="w-full bg-slate-800 text-white border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 rounded-xl px-4 py-3 outline-none transition-all placeholder:text-slate-500 font-medium text-base"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5"
            >
              Enter Room -&gt;
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <RoomContent roomId={roomId} username={tempName} onUsernameTaken={handleRetry} />;
}

function RoomContent({ roomId, username, onUsernameTaken }) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTopic = queryParams.get('topic') || 'Random';

  const { session, participants, loading, error, setSession, usernameTaken } = useRoom(roomId, username);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);

  // Scoring / Unlock Logic
  const [isSolved, setIsSolved] = useState(false);
  const [score, setScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  // Mobile tab state: 'question' | 'editor' | 'output'
  const [mobileTab, setMobileTab] = useState('editor');

  // If username is taken, kick back to name picker
  useEffect(() => {
    if (usernameTaken) onUsernameTaken();
  }, [usernameTaken, onUsernameTaken]);

  // Disconnect socket when leaving the room page
  useEffect(() => {
    return () => {
      console.log('[RoomContent] Unmounting - disconnecting socket');
      socket.disconnect();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1120]">
        <div className="flex flex-col items-center gap-6">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)]"></div>
          <p className="text-blue-400 font-bold tracking-[0.2em] uppercase text-sm animate-pulse">Connecting to Room...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b1120] text-white gap-4 sm:gap-6 p-4">
        <div className="text-red-500 text-5xl sm:text-7xl drop-shadow-2xl animate-bounce">⚠️</div>
        <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-200 text-center">Room Not Found</h2>
        <p className="text-slate-400 text-base sm:text-lg text-center">{error || 'Unknown error'}</p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-8 w-full sm:w-auto">
          <button onClick={() => {
            const url = new URL(window.location.href);
            url.searchParams.delete('username');
            window.history.replaceState(null, '', url.search);
            window.location.reload();
          }} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-transform hover:-translate-y-1 text-center">
            Try Different Name
          </button>
          <button onClick={() => navigate('/')} className="px-8 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition-transform hover:-translate-y-1 text-center">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const copyLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('username');
    navigator.clipboard.writeText(url.toString());
    toast.success('Room link copied to clipboard!');
  };

  const handleNextQuestion = async () => {
    if (!isSolved) {
      toast.error("You must successfully solve the current question to unlock the next one!");
      return;
    }

    setLoadingNext(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/sessions/${roomId}/next`, {
        topic: initialTopic,
        language: session.language
      });
      setSession(response.data);
      socket.emit('next-question-triggered', { roomId, session: response.data });

      toast.success("Loaded Next Question!");
      setIsSolved(false);
      setScore(s => s + 1);
      setMobileTab('question'); // Show question tab on mobile after loading next
    } catch (err) {
      console.error(err);
      toast.error("Failed to load next question.");
    } finally {
      setLoadingNext(false);
    }
  };

  const handleRunSuccess = () => {
    if (!isSolved) {
      setIsSolved(true);
      setShowCelebration(true);
      toast.success("🏆 ALL TEST CASES PASSED! Next question unlocked!", { duration: 5000 });
      setTimeout(() => setShowCelebration(false), 4000);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0b1120] overflow-hidden font-sans">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Celebration Confetti Overlay */}
      {showCelebration && (
        <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 animate-pulse"></div>
          <div className="relative z-10 flex flex-col items-center animate-bounce">
            <div className="text-6xl sm:text-8xl mb-4">🏆</div>
            <div className="text-white text-xl sm:text-3xl font-black tracking-tight text-center drop-shadow-[0_0_30px_rgba(255,215,0,0.8)] px-4">
              ALL TEST CASES PASSED!
            </div>
            <div className="text-emerald-400 text-base sm:text-lg font-bold mt-2 animate-pulse">
              Congratulations! 🎉
            </div>
          </div>
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-sm"
              style={{
                width: Math.random() * 10 + 5 + 'px',
                height: Math.random() * 10 + 5 + 'px',
                backgroundColor: ['#f43f5e', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#06b6d4', '#f97316'][i % 7],
                left: Math.random() * 100 + '%',
                top: '-5%',
                animation: `confetti-fall ${1.5 + Math.random() * 2}s ease-in forwards`,
                animationDelay: Math.random() * 1.5 + 's',
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
          <style>{`
            @keyframes confetti-fall {
              0% { opacity: 1; transform: translateY(0) rotate(0deg); }
              100% { opacity: 0; transform: translateY(100vh) rotate(720deg); }
            }
          `}</style>
        </div>
      )}

      {/* Top Navbar */}
      <header className="h-14 sm:h-16 bg-[#0f172a] border-b border-slate-700/60 flex items-center justify-between px-3 sm:px-6 shrink-0 z-20 shadow-md">

        <div className="flex items-center gap-2 sm:gap-6">
          <button onClick={() => navigate('/')} className="text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 p-2 rounded-lg cursor-pointer">
            <FaChevronLeft />
          </button>
          <h1 className="text-lg sm:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 cursor-pointer drop-shadow-sm hidden sm:block" onClick={() => navigate('/')}>
            AlgoRiddle
          </h1>
          <div className="hidden sm:block h-6 w-px bg-slate-700"></div>
          <div className="flex items-center gap-1.5 sm:gap-2 bg-emerald-500/10 border border-emerald-500/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-[8px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] sm:text-xs font-mono font-bold text-emerald-400 tracking-wider">
              {roomId.split('-')[0]}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 sm:px-4 py-1 sm:py-1.5 rounded-full font-bold shadow-inner">
            <FaTrophy className="text-xs sm:text-sm" />
            <span className="text-xs sm:text-sm">{score}</span>
          </div>
        </div>

        {/* Team Members Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMembers(prev => !prev)}
            className="flex items-center gap-1.5 sm:gap-2 bg-slate-800/80 hover:bg-slate-700 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-slate-700/80 shadow-sm transition-all cursor-pointer"
          >
            <FaUsers className="text-blue-400 text-sm" />
            <span className="text-[10px] sm:text-xs font-bold text-slate-200 hidden sm:inline">{participants.length} Member{participants.length !== 1 ? 's' : ''}</span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-200 sm:hidden">{participants.length}</span>
            <FaChevronDown className={`text-[10px] text-slate-400 transition-transform ${showMembers ? 'rotate-180' : ''}`} />
          </button>

          {showMembers && (
            <div className="absolute top-full mt-2 right-0 w-56 sm:w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-slate-800 bg-slate-800/50">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Team Members</h3>
              </div>
              <div className="max-h-60 overflow-y-auto">
                {participants.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800/50 transition-colors border-b border-slate-800/50 last:border-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-black text-white shadow-inner shrink-0">
                      {p.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-slate-200 truncate block">{p.username}</span>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" title="Online"></span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <VoiceChat roomId={roomId} />

          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-600 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all hover:shadow-lg active:scale-95 cursor-pointer"
          >
            <FaShareAlt className="text-blue-400" /> <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </header>

      {/* ══════════ MOBILE TAB BAR (visible on small screens only) ══════════ */}
      <div className="md:hidden flex items-center bg-[#0f172a] border-b border-slate-800 shrink-0">
        {[
          { id: 'question', icon: FaBook, label: 'Problem' },
          { id: 'editor', icon: FaCode, label: 'Editor' },
          { id: 'output', icon: FaTerminal, label: 'Output' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setMobileTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${mobileTab === tab.id
                ? 'text-blue-400 border-blue-500 bg-blue-500/5'
                : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
          >
            <tab.icon className="text-sm" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden relative">

        {/* ══════════ LEFT PANEL: Question (Desktop always visible, Mobile tab-controlled) ══════════ */}
        <div className={`
          ${mobileTab === 'question' ? 'flex' : 'hidden'} md:flex
          w-full md:w-[32%] md:min-w-[320px] md:max-w-[500px] 
          h-full shrink-0 z-10 bg-[#0f172a] shadow-[5px_0_20px_rgba(0,0,0,0.5)] md:border-r border-slate-800 flex-col relative
        `}>
          <div className="flex-1 overflow-y-auto">
            <QuestionPanel question={session.questionId} />
          </div>

          {/* Next Question Footer */}
          <div className="p-3 sm:p-4 border-t border-slate-800 bg-[#0b1120]">
            <button
              onClick={handleNextQuestion}
              disabled={loadingNext || !isSolved}
              className={`w-full flex justify-center items-center gap-2 font-bold py-3 rounded-xl shadow-lg transition-all active:scale-[0.98] cursor-pointer 
                     ${isSolved
                  ? 'bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 hover:shadow-emerald-500/25 text-white'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'}
                   `}
            >
              {loadingNext ? 'Loading...' : isSolved ? 'Next Question' : 'Solve to Unlock Next!'}
              <FaForward className="text-xs" />
            </button>
            <p className="text-[10px] text-center text-slate-500 mt-2">Topic: {initialTopic}</p>
          </div>

          {isSolved && <div className="absolute inset-0 pointer-events-none bg-emerald-500/5 animate-pulse mix-blend-overlay z-50"></div>}
        </div>

        {/* ══════════ CENTER PANEL: Code Editor (Desktop always visible, Mobile tab-controlled) ══════════ */}
        <div className={`
          ${mobileTab === 'editor' || mobileTab === 'output' ? 'flex' : 'hidden'} md:flex
          flex-1 h-full relative z-0 flex-col min-w-0 bg-[#1e1e24] w-full
        `}>
          <CodeEditor
            roomId={roomId}
            initialCode={session.currentCode}
            initialLang={session.language}
            onRunSuccess={handleRunSuccess}
            mobileTab={mobileTab}
          />

          {/* Floating Draw Button (hidden on very small screens) */}
          {!showWhiteboard && (
            <button
              onClick={() => setShowWhiteboard(true)}
              className="hidden sm:flex mt-[8%] absolute top-6 right-6 bg-purple-600 hover:bg-purple-500 text-white p-3 sm:p-4 rounded-2xl shadow-[0_10px_30px_-5px_rgba(147,51,234,0.6)] hover:shadow-[0_10px_40px_-5px_rgba(147,51,234,0.8)] transition-all duration-300 transform hover:-translate-y-1 active:scale-95 z-20 items-center gap-3 group border border-purple-400/30 cursor-pointer"
            >
              <FaPen className="text-lg group-hover:rotate-12 transition-transform" />
              <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 ease-in-out font-bold text-sm">
                Open Whiteboard
              </span>
            </button>
          )}
        </div>

        {/* ══════════ RIGHT PANEL: Whiteboard Drawer ══════════ */}
        <div className={`fixed top-14 sm:top-16 bottom-0 right-0 w-full sm:w-[50%] sm:min-w-[500px] bg-[#0f172a] shadow-[-20px_0_50px_-10px_rgba(0,0,0,0.8)] border-l border-slate-700 z-[100] transform transition-transform duration-[400ms] ease-out ${showWhiteboard ? 'translate-x-[0%]' : 'translate-x-[100%]'}`}>
          {showWhiteboard && (
            <Whiteboard
              roomId={roomId}
              initialActions={session.drawingActions}
              onClose={() => setShowWhiteboard(false)}
            />
          )}
        </div>
      </main>

      {/* Mobile Whiteboard FAB */}
      {!showWhiteboard && (
        <button
          onClick={() => setShowWhiteboard(true)}
          className="sm:hidden fixed bottom-4 right-4 z-50 bg-purple-600 hover:bg-purple-500 text-white p-4 rounded-full shadow-[0_10px_30px_-5px_rgba(147,51,234,0.6)] active:scale-90 transition-all cursor-pointer"
        >
          <FaPen className="text-base" />
        </button>
      )}
    </div>
  );
}
