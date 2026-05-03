import { useState, useEffect, useCallback, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { cpp } from '@codemirror/lang-cpp';
import { socket, BACKEND_URL } from '../socket/socket';
import axios from 'axios';
import { FaPlay, FaCode } from 'react-icons/fa';

export default function CodeEditor({ roomId, initialCode, initialLang = 'javascript', onRunSuccess, mobileTab }) {
  const [code, setCode] = useState(initialCode || '');
  const [language, setLanguage] = useState(initialLang);
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [testCases, setTestCases] = useState([]);

  const isTypingLocal = useRef(true);

  useEffect(() => {
    setCode(initialCode || '');
    setLanguage(initialLang);
    setOutput('');

    axios.get(`${BACKEND_URL}/api/sessions/${roomId}`).then(res => {
      if (res.data && res.data.questionId) {
        setTestCases(res.data.questionId.testCases || []);
      }
    }).catch(err => console.error(err));
  }, [initialCode, initialLang, roomId]);

  useEffect(() => {
    const handleCodeUpdate = (data) => {
      isTypingLocal.current = false;
      setCode(data.code);
      setLanguage(data.language);
    };

    const handleRunResult = (data) => {
      // Receive the full evaluation log from the user who ran the code
      setOutput(data.outputLog || 'No output generated.');
      if (data.allPassed && onRunSuccess) onRunSuccess();
    };

    socket.on('code-update', handleCodeUpdate);
    socket.on('run-result', handleRunResult);

    return () => {
      socket.off('code-update', handleCodeUpdate);
      socket.off('run-result', handleRunResult);
    };
  }, []);

  const onChange = useCallback((val, viewUpdate) => {
    if (!isTypingLocal.current) {
      isTypingLocal.current = true;
      setCode(val);
      return;
    }

    setCode(val);
    if (viewUpdate.transactions.some(tr => tr.docChanged)) {
      socket.emit('code-change', { roomId, code: val, language });
    }
  }, [roomId, language]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);

    const boilerplates = {
      javascript: `// JavaScript Workspace\nconst fs = require('fs');\n\nfunction solve(inputLines, currentLine) {\n    // Write your code here\n    // Return the new currentLine index after you process this testcase\n    return currentLine;\n}\n\nfunction main() {\n    const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\n    if (!input[0]) return;\n    let t = parseInt(input[0]);\n    let currentLine = 1;\n    while(t--) {\n        currentLine = solve(input, currentLine);\n    }\n}\nmain();`,
      python: `# Python Workspace\n\ndef solve():\n    # Write your code here\n    pass\n\nif __name__ == "__main__":\n    try:\n        t = int(input())\n        for _ in range(t):\n            solve()\n    except EOFError:\n        pass`,
      cpp: `// C++ Workspace\n\n#include <iostream>\nusing namespace std;\n\nvoid solve() {\n    // Write your code here\n    \n}\n\nint main() {\n    int t;\n    if (cin >> t) {\n        while(t--) {\n            solve();\n        }\n    }\n    return 0;\n}`
    };

    const newCode = boilerplates[newLang] || '';
    setCode(newCode);

    socket.emit('code-change', { roomId, code: newCode, language: newLang });
  };

  const getLanguageExtension = () => {
    if (language === 'python') return [python()];
    if (language === 'cpp') return [cpp()];
    return [javascript({ jsx: true })];
  };

  const normalize = (str) => str.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0).join('\n');

  const runCode = async () => {
    setRunning(true);
    const total = testCases.length;
    let outputLog = `> Running ${total} Test Cases...\n`;
    setOutput(outputLog);

    if (!testCases || total === 0) {
      setOutput('> No test cases found for this question. Unable to evaluate.');
      setRunning(false);
      return;
    }

    let passedCount = 0;
    let allPassed = true;

    for (let i = 0; i < total; i++) {
      const tc = testCases[i];
      outputLog += `\n━━━ Test Case ${i + 1}/${total} `;
      setOutput(outputLog + '⏳ Running...');

      try {
        const res = await axios.post(`${BACKEND_URL}/api/code/run`, {
          code,
          language,
          stdin: tc.input.trim()
        });

        if (res.data.code !== 0) {
          allPassed = false;
          let err = res.data.stderr || 'Compilation or Runtime Error';
          outputLog += `❌ FAILED\n${err}\n`;
          setOutput(outputLog);
          break;
        }

        const actualNorm = normalize(res.data.stdout || '');
        const expectedNorm = normalize(tc.output);

        if (actualNorm === expectedNorm) {
          passedCount++;
          outputLog += `✅ PASSED`;
          setOutput(outputLog);
        } else {
          allPassed = false;
          if (tc.isPublic !== false) {
            outputLog += `❌ FAILED\n  Input:    ${tc.input.replace(/\n/g, ' | ')}\n  Expected: ${expectedNorm.replace(/\n/g, ' | ')}\n  Actual:   ${actualNorm.replace(/\n/g, ' | ')}\n`;
          } else {
            outputLog += `❌ FAILED (Hidden Test Case)\n`;
          }
          setOutput(outputLog);
          break;
        }
      } catch (err) {
        outputLog += `❌ SYSTEM ERROR\n`;
        setOutput(outputLog);
        allPassed = false;
        break;
      }
    }

    outputLog += `\n\n════════════════════════════════════════`;
    outputLog += `\n  Result: ${passedCount}/${total} Test Cases Passed`;
    outputLog += `\n════════════════════════════════════════`;

    if (allPassed) {
      outputLog += '\n\n🏆 ALL TEST CASES PASSED! Congratulations! 🎉\n   Next question is now unlocked!';
      if (onRunSuccess) onRunSuccess();
    } else {
      outputLog += `\n\n❌ ${passedCount}/${total} passed. Keep trying!`;
    }

    setOutput(outputLog);

    // Emit the COMPLETE evaluation log to all room members (single event)
    socket.emit('run-result', { roomId, result: { outputLog, allPassed } });

    setRunning(false);
  };

  // On mobile, show only editor or output based on mobileTab
  const showEditor = !mobileTab || mobileTab === 'editor' || typeof window !== 'undefined' && window.innerWidth >= 768;
  const showOutput = !mobileTab || mobileTab === 'output' || typeof window !== 'undefined' && window.innerWidth >= 768;

  return (
    <div className="flex flex-col h-full bg-[#1e1e24] w-full shadow-lg md:rounded-tl-2xl overflow-hidden">
      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 border-b border-slate-700/60 bg-[#161b22] z-10 w-full shadow-sm gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <FaCode className="text-slate-500 hidden sm:block" />
          <div className="relative">
            <select
              className="bg-[#0d1117] text-[11px] sm:text-[13px] font-bold text-slate-200 px-2 sm:px-4 py-1.5 sm:py-2 pr-7 sm:pr-10 rounded-lg border border-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 transition-all shadow-inner appearance-none cursor-pointer hover:bg-[#1f2937] max-w-[160px] sm:max-w-none"
              value={language}
              onChange={handleLanguageChange}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python 3</option>
              <option value="cpp">C++ (GCC)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 sm:px-3 text-slate-400">
              <svg className="fill-current h-3 w-3 sm:h-4 sm:w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
            </div>
          </div>
        </div>

        <button
          onClick={runCode}
          disabled={running}
          className="group relative flex items-center gap-1.5 sm:gap-2 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] text-white px-3 sm:px-6 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-black tracking-wide transition-all disabled:opacity-60 disabled:hover:shadow-none active:scale-95 overflow-hidden cursor-pointer shrink-0"
        >
          <FaPlay className="text-[9px] sm:text-[11px] group-hover:scale-125 transition-transform drop-shadow" />
          <span className="hidden sm:inline">{running ? 'EXECUTING...' : 'RUN & EVALUATE'}</span>
          <span className="sm:hidden">{running ? 'RUN...' : 'RUN'}</span>
        </button>
      </div>

      {/* CodeMirror Text Area — hidden on mobile output tab */}
      <div className={`flex-1 overflow-auto bg-[#0d1117] w-full text-base relative ${mobileTab === 'output' ? 'hidden md:block' : ''}`}>
        <CodeMirror
          value={code}
          height="100%"
          theme="dark"
          extensions={getLanguageExtension()}
          onChange={onChange}
          className="text-[13px] sm:text-[14px] font-mono border-none outline-none leading-loose h-full absolute inset-0 custom-codemirror-scroll"
          basicSetup={{
            lineNumbers: true,
            foldGutter: false,
            highlightActiveLine: true,
          }}
        />
        <style jsx="true">{`
          .cm-editor { height: 100% !important; }
          .cm-scroller { background-color: #0d1117 !important; font-family: 'Fira Code', 'Courier New', monospace; -webkit-overflow-scrolling: touch; }
          .cm-gutters { background-color: #0d1117 !important; border-right: 1px solid #30363d !important; color: #6e7681; }
          .cm-activeLineGutter { background-color: #161b22 !important; color: #c9d1d9 !important; }
          .cm-activeLine { background-color: #161b22 !important; }
          .cm-content { min-height: 200px; }
        `}</style>
      </div>

      {/* Console Output Panel — expanded on mobile output tab */}
      <div className={`
        ${mobileTab === 'output' ? 'flex-1' : 'h-48 sm:h-64 min-h-[12rem] sm:min-h-[16rem]'}
        border-t border-[#30363d] bg-[#010409] flex flex-col w-full z-10
        ${mobileTab === 'editor' ? 'hidden md:flex' : 'flex'}
      `}>
        <div className="px-3 sm:px-6 py-2 sm:py-2.5 flex justify-between items-center text-[9px] sm:text-[10px] font-black text-slate-500 border-b border-[#30363d] bg-[#0d1117] uppercase tracking-[0.15em] sm:tracking-[0.2em] shadow-sm">
          <span>Standard Output</span>
          <span className="flex items-center gap-1.5 sm:gap-2">Status: <span className={output.includes('Error') || output.includes('Exception') ? 'text-red-400' : running ? 'text-yellow-500' : 'text-emerald-400'}>{running ? 'Running...' : 'Idle'}</span></span>
        </div>
        <pre className={`p-3 sm:p-6 text-[12px] sm:text-[14px] font-mono overflow-y-auto whitespace-pre-wrap flex-1 shadow-inner leading-relaxed ${output.includes('Error') || output.includes('Exception') ? 'text-red-400/90' : 'text-[#e6edf3]'}`}>
          {output || <span className="text-slate-600 italic">No output. Press Run to compile your code.</span>}
        </pre>
      </div>
    </div>
  );
}
