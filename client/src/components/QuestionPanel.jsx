export default function QuestionPanel({ question }) {
  if (!question) return <div className="p-6 sm:p-8 text-slate-400 font-medium">Loading question...</div>;

  return (
    <div className="flex flex-col h-full bg-[#0a0f1d] selection:bg-blue-500/30 overflow-y-auto custom-scrollbar">
      <div className="p-5 sm:p-8 space-y-5 sm:space-y-8 max-w-2xl mx-auto w-full">
        {/* Header Section */}
        <div className="space-y-3 sm:space-y-4">
          <h2 className="text-xl sm:text-3xl font-black text-white leading-tight tracking-tight drop-shadow-sm">{question.title}</h2>
          <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
            <span className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md border ${question.difficulty === 'Easy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                question.difficulty === 'Medium' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                  'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
              {question.difficulty}
            </span>
            <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md border border-blue-500/20 bg-blue-500/10 text-blue-400">
              {question.pattern}
            </span>
          </div>
        </div>

        {/* Narrative Section */}
        <div className="relative">
          <div className="absolute -left-3 sm:-left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
          <p className="text-slate-300/90 text-[13px] sm:text-[15px] italic leading-relaxed pl-2 bg-slate-800/20 p-3 sm:p-4 rounded-lg border border-slate-700/30">
            "{question.storyContext}"
          </p>
        </div>

        {/* Problem Statement */}
        <div>
          <h3 className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest mb-2 sm:mb-3 border-b border-slate-800 pb-2">Task</h3>
          <p className="text-[13px] sm:text-[15px] text-slate-200 leading-relaxed max-w-none">
            {question.problemStatement}
          </p>
        </div>

        {/* Constraints & Format - Stack on mobile */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4">
          <div className="bg-[#111827] rounded-xl p-4 sm:p-5 border border-slate-800 shadow-inner flex flex-col gap-1.5 sm:gap-2 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-20"></div>
            <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Input Format</span>
            <span className="text-purple-200/90 font-mono text-[11px] sm:text-xs leading-relaxed">{question.inputFormat}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="bg-[#111827] rounded-xl p-4 sm:p-5 border border-slate-800 shadow-inner flex flex-col gap-1.5 sm:gap-2 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-20"></div>
              <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Output</span>
              <span className="text-cyan-200/90 font-mono text-[11px] sm:text-xs leading-relaxed">{question.outputFormat}</span>
            </div>

            <div className="bg-[#111827] rounded-xl p-4 sm:p-5 border border-slate-800 shadow-inner flex flex-col gap-1.5 sm:gap-2 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-20"></div>
              <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Constraints</span>
              <span className="text-emerald-200/90 font-mono text-[11px] sm:text-xs leading-relaxed">{question.constraints}</span>
            </div>
          </div>
        </div>

        {/* Public Test Case Examples */}
        <div className="space-y-3 sm:space-y-4 pt-2 sm:pt-4">
          <h3 className="text-xs sm:text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">Public Test Cases</h3>
          {question.testCases?.filter(tc => tc.isPublic !== false).map((tc, idx) => (
            <div key={idx} className="bg-[#0f1524] rounded-xl p-4 sm:p-5 border border-slate-800/80 shadow-md group hover:border-blue-500/30 transition-colors">
              <span className="block text-[9px] sm:text-[10px] font-black text-slate-600 mb-3 sm:mb-4 tracking-widest uppercase">Example {idx + 1}</span>
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                <div>
                  <span className="text-slate-500 uppercase text-[9px] sm:text-[10px] tracking-wider font-bold mb-1 block">Input</span>
                  <pre className="text-slate-300 bg-black/40 p-2.5 sm:p-3.5 rounded-lg border border-white/5 font-mono text-[11px] sm:text-sm shadow-inner whitespace-pre-wrap break-all">{tc.input}</pre>
                </div>
                <div>
                  <span className="text-slate-500 uppercase text-[9px] sm:text-[10px] tracking-wider font-bold mb-1 block">Expected Output</span>
                  <pre className="text-emerald-400 font-bold bg-black/40 p-2.5 sm:p-3.5 rounded-lg border border-emerald-500/20 font-mono text-[11px] sm:text-sm shadow-inner whitespace-pre-wrap break-all">{tc.output}</pre>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom padding */}
        <div className="h-16 sm:h-20"></div>
      </div>
    </div>
  );
}
