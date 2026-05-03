import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BACKEND_URL } from '../socket/socket';

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState('');
  const [topic, setTopic] = useState('Random');
  const navigate = useNavigate(); const handleStartPractice = async () => {
    if (!username.trim()) return alert("Please enter a username!");
    setLoading(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/sessions/create`, { topic, language: 'javascript' });
      const { roomId } = response.data;
      navigate(`/room/${roomId}?username=${encodeURIComponent(username)}&topic=${encodeURIComponent(topic)}`);
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Failed to start session. Ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-dark bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-dark to-dark text-white p-6 relative overflow-hidden">

      {/* Background decorations */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-3xl text-center space-y-8 z-10 w-full">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 drop-shadow-xl py-2">
          AlgoRiddle
        </h1>
        <p className="text-xl md:text-2xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
          A premium real-time collaborative platform to practice Data Structures and Algorithms through immersive riddles.
        </p>

        <div className="pt-8">
          <button
            onClick={() => setShowModal(true)}
            className="group relative inline-flex items-center justify-center px-12 py-5 text-xl font-bold text-white transition-all duration-300 bg-blue-600 rounded-2xl shadow-[0_0_40px_-5px_rgba(59,130,246,0.6)] focus:outline-none focus:ring-4 focus:ring-blue-500/50 hover:bg-blue-500 hover:-translate-y-1 hover:shadow-[0_0_60px_-10px_rgba(59,130,246,0.8)] active:translate-y-0 overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-out z-0"></div>
            <span className="relative z-10">Start Practice Session</span>
          </button>
        </div>

        <div className="flex justify-center gap-6 text-sm md:text-base text-slate-400 mt-16 font-medium bg-slate-800/30 w-fit mx-auto px-6 py-3 rounded-full border border-slate-700/50 backdrop-blur-md">
          <span className="flex items-center gap-2 text-emerald-400">⚡ Real-time</span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-2 text-blue-400">📝 Collaborative Code</span>
          <span className="text-slate-600">•</span>
          <span className="flex items-center gap-2 text-purple-400">🎨 Shared Whiteboard</span>
        </div>
      </div>

      {/* Join Modal */}
      {showModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-3xl font-bold mb-6 text-white text-center">Room Setup</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide">Your Name</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-800 text-white border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 rounded-xl px-4 py-3 outline-none transition-all placeholder:text-slate-500 font-medium"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wide mt-6">Select Topic</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-slate-800 text-white border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 rounded-xl px-4 py-3 outline-none transition-all font-medium appearance-none cursor-pointer"
                >
                  <option value="Random">🎲 Random Mix</option>
                  <option value="Sliding Window">🪟 Sliding Window</option>
                  <option value="Two Pointers">👆 Two Pointers</option>
                  <option value="Binary Search">🔍 Binary Search</option>
                  <option value="Stack">📚 Stack / Queue</option>
                  <option value="Graph DFS">🌳 Graph / Trees</option>
                  <option value="Dynamic Programming">💡 Dynamic Programming</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors border border-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleStartPractice}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-colors disabled:opacity-50 flex justify-center items-center cursor-pointer"
              >
                {loading ? 'Creating...' : 'Join Room ->'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
