import { useEffect, useRef, useState } from 'react';
import { socket } from '../socket/socket';
import { FaPen, FaEraser, FaTrash, FaTimes, FaUndo, FaSquare, FaCircle, FaFont } from 'react-icons/fa';
import { BsDashLg } from 'react-icons/bs';

export default function Whiteboard({ roomId, initialActions = [], onClose }) {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);

  const [actions, setActions] = useState(initialActions || []);
  const [color, setColor] = useState('#a855f7');
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState('pen');

  const [textInput, setTextInput] = useState('');
  const [textPos, setTextPos] = useState(null);
  const textInputRef = useRef(null);

  const currentPos = useRef({ x: 0, y: 0 });
  const isDrawing = useRef(false);
  const currentStrokeId = useRef(null);
  const currentPreviewAction = useRef(null);
  const mySocketId = useRef(socket.id);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    context.lineJoin = 'round';
    contextRef.current = context;

    const handleResize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      contextRef.current.lineCap = 'round';
      contextRef.current.lineJoin = 'round';
      redrawCanvas();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load initial actions only once on mount
  useEffect(() => {
    if (initialActions && initialActions.length > 0) {
      setActions(initialActions);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Redraw whenever actions change
  useEffect(() => {
    redrawCanvas();
  }, [actions]); // eslint-disable-line react-hooks/exhaustive-deps

  // Socket listeners for real-time sync
  useEffect(() => {
    const handleDrawUpdate = (action) => {
      setActions(prev => {
        // For pen/eraser strokes, allow multiple actions with same strokeId
        // Only check for exact duplicate (same coordinates)
        if (action.tool === 'pen' || action.tool === 'eraser') {
          const exactDuplicate = prev.some(a => 
            a.strokeId === action.strokeId && 
            a.x0 === action.x0 && 
            a.y0 === action.y0 && 
            a.x1 === action.x1 && 
            a.y1 === action.y1
          );
          if (exactDuplicate) return prev;
          return [...prev, action];
        }
        
        // For shapes (rect, circle, line, text), check strokeId only
        const exists = prev.some(a => a.strokeId === action.strokeId);
        if (exists) return prev;
        return [...prev, action];
      });
    };

    const handleDrawUndo = (strokeId) => {
      setActions(prev => prev.filter(a => a.strokeId !== strokeId));
    };

    const handleDrawClear = () => {
      setActions([]);
    };

    socket.on('draw-update', handleDrawUpdate);
    socket.on('draw-undo', handleDrawUndo);
    socket.on('draw-clear', handleDrawClear);

    return () => {
      socket.off('draw-update', handleDrawUpdate);
      socket.off('draw-undo', handleDrawUndo);
      socket.off('draw-clear', handleDrawClear);
    };
  }, []);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drawItem = (action) => {
      if (!action) return;

      if (action.tool === 'text') {
        ctx.font = `${action.fontSize || 16}px Inter, Arial, sans-serif`;
        ctx.fillStyle = action.color;
        ctx.fillText(action.text, action.x0, action.y0);
        return;
      }

      ctx.beginPath();

      if (action.tool === 'rect') {
        ctx.strokeStyle = action.color;
        ctx.lineWidth = action.width;
        ctx.rect(action.x0, action.y0, action.x1 - action.x0, action.y1 - action.y0);
      } else if (action.tool === 'circle') {
        ctx.strokeStyle = action.color;
        ctx.lineWidth = action.width;
        const radiusX = Math.abs((action.x1 - action.x0) / 2);
        const radiusY = Math.abs((action.y1 - action.y0) / 2);
        const centerX = action.x0 + (action.x1 - action.x0) / 2;
        const centerY = action.y0 + (action.y1 - action.y0) / 2;
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      } else if (action.tool === 'line') {
        ctx.strokeStyle = action.color;
        ctx.lineWidth = action.width;
        ctx.moveTo(action.x0, action.y0);
        ctx.lineTo(action.x1, action.y1);
      } else {
        ctx.moveTo(action.x0, action.y0);
        ctx.lineTo(action.x1, action.y1);
        if (action.tool === 'eraser') {
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 20;
        } else {
          ctx.strokeStyle = action.color;
          ctx.lineWidth = action.width;
        }
      }
      ctx.stroke();
      ctx.closePath();
    };

    actions.forEach(drawItem);

    if (currentPreviewAction.current) {
      drawItem(currentPreviewAction.current);
    }
  };

  const getCoordinates = (e) => {
    if (e.touches && e.touches.length > 0) {
      const rect = canvasRef.current.getBoundingClientRect();
      return {
        offsetX: e.touches[0].clientX - rect.left,
        offsetY: e.touches[0].clientY - rect.top
      };
    }
    return { offsetX: e.nativeEvent.offsetX, offsetY: e.nativeEvent.offsetY };
  };

  const startDrawing = (e) => {
    if (tool === 'text') {
      const { offsetX, offsetY } = getCoordinates(e);
      setTextPos({ x: offsetX, y: offsetY });
      setTextInput('');
      setTimeout(() => textInputRef.current?.focus(), 50);
      return;
    }

    const { offsetX, offsetY } = getCoordinates(e);
    currentPos.current = { x: offsetX, y: offsetY };
    isDrawing.current = true;
    currentStrokeId.current = Date.now().toString() + Math.random().toString(36).substr(2, 5);

    if (['rect', 'circle', 'line'].includes(tool)) {
      currentPreviewAction.current = {
        tool, color, width: lineWidth,
        x0: offsetX, y0: offsetY,
        x1: offsetX, y1: offsetY,
        strokeId: currentStrokeId.current
      };
    }
  };

  const draw = (e) => {
    if (!isDrawing.current) return;
    const { offsetX, offsetY } = getCoordinates(e);

    if (['rect', 'circle', 'line'].includes(tool)) {
      currentPreviewAction.current.x1 = offsetX;
      currentPreviewAction.current.y1 = offsetY;
      redrawCanvas();
    } else {
      const action = {
        x0: currentPos.current.x,
        y0: currentPos.current.y,
        x1: offsetX,
        y1: offsetY,
        color,
        width: lineWidth,
        tool,
        strokeId: currentStrokeId.current
      };

      setActions(prev => [...prev, action]);
      socket.emit('draw-action', { roomId, action });
      currentPos.current = { x: offsetX, y: offsetY };
    }
  };

  const finishDrawing = () => {
    if (!isDrawing.current) return;
    isDrawing.current = false;

    if (['rect', 'circle', 'line'].includes(tool) && currentPreviewAction.current) {
      const finalAction = { ...currentPreviewAction.current };
      currentPreviewAction.current = null;

      if (Math.abs(finalAction.x1 - finalAction.x0) > 2 || Math.abs(finalAction.y1 - finalAction.y0) > 2) {
        setActions(prev => [...prev, finalAction]);
        socket.emit('draw-action', { roomId, action: finalAction });
      } else {
        redrawCanvas();
      }
    }
    currentStrokeId.current = null;
  };

  const commitText = () => {
    if (!textInput.trim() || !textPos) return;
    
    const strokeId = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    const action = {
      tool: 'text',
      text: textInput,
      x0: textPos.x,
      y0: textPos.y,
      color,
      fontSize: Math.max(14, lineWidth * 5),
      strokeId
    };

    setActions(prev => [...prev, action]);
    socket.emit('draw-action', { roomId, action });
    setTextPos(null);
    setTextInput('');
  };

  const handleTextKeyDown = (e) => {
    if (e.key === 'Enter') {
      commitText();
    } else if (e.key === 'Escape') {
      setTextPos(null);
      setTextInput('');
    }
  };

  const undoLastAction = () => {
    if (actions.length === 0) return;
    const lastStrokeId = actions[actions.length - 1].strokeId;
    setActions(prev => prev.filter(a => a.strokeId !== lastStrokeId));
    socket.emit('draw-undo', { roomId, strokeId: lastStrokeId });
  };

  const clearCanvas = () => {
    setActions([]);
    socket.emit('draw-clear', { roomId });
  };

  const TopBar = () => (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center justify-between gap-4 w-[90%] pointer-events-none">
      <button
        onClick={onClose}
        className="pointer-events-auto p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl text-slate-400 hover:text-white transition-colors border border-slate-700 backdrop-blur-md shadow-lg cursor-pointer"
      >
        <FaTimes />
      </button>

      <div className="pointer-events-auto flex items-center gap-2 bg-slate-800/80 backdrop-blur-md border border-slate-700 px-2 py-1.5 rounded-2xl shadow-xl">
        <button
          onClick={undoLastAction}
          className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:bg-slate-700/50 hover:text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          title="Undo Last Stroke"
        >
          <FaUndo /> Undo
        </button>
        <button
          onClick={clearCanvas}
          className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-xl text-xs font-bold transition-colors ml-1 cursor-pointer"
          title="Clear Entire Canvas"
        >
          <FaTrash /> Clear Board
        </button>
      </div>
    </div>
  );

  const LeftToolbar = () => (
    <div className="absolute top-1/2 -translate-y-1/2 left-4 z-20 flex flex-col items-center gap-3 bg-slate-800/90 backdrop-blur-xl border border-slate-700 p-2.5 rounded-2xl shadow-2xl transition-all">
      <div className="flex flex-col gap-1 w-full border-b border-slate-700 pb-3 mb-1">
        <button onClick={() => setTool('pen')} className={`p-3 rounded-xl transition-all w-full flex justify-center cursor-pointer ${tool === 'pen' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`} title="Freehand Pen">
          <FaPen />
        </button>
        <button onClick={() => setTool('rect')} className={`p-3 rounded-xl transition-all w-full flex justify-center cursor-pointer ${tool === 'rect' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`} title="Rectangle">
          <FaSquare />
        </button>
        <button onClick={() => setTool('circle')} className={`p-3 rounded-xl transition-all w-full flex justify-center cursor-pointer ${tool === 'circle' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`} title="Ellipse">
          <FaCircle />
        </button>
        <button onClick={() => setTool('line')} className={`p-3 rounded-xl transition-all w-full flex justify-center cursor-pointer ${tool === 'line' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`} title="Straight Line">
          <BsDashLg />
        </button>
        <button onClick={() => setTool('text')} className={`p-3 rounded-xl transition-all w-full flex justify-center cursor-pointer ${tool === 'text' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`} title="Add Text">
          <FaFont />
        </button>
        <button onClick={() => setTool('eraser')} className={`p-3 rounded-xl transition-all w-full flex justify-center cursor-pointer ${tool === 'eraser' ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'}`} title="Eraser">
          <FaEraser />
        </button>
      </div>

      <div className="flex flex-col gap-3 items-center pt-1">
        <label className="text-[9px] uppercase tracking-wider font-bold text-slate-500">Color</label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-8 h-8 rounded-full cursor-pointer border-0 bg-transparent p-0 overflow-hidden"
          title="Current Color"
        />
        <label className="text-[9px] uppercase tracking-wider font-bold text-slate-500 mt-1">Size</label>
        <input
          type="range"
          min="1" max="15"
          value={lineWidth}
          onChange={(e) => setLineWidth(e.target.value)}
          className="w-24 -rotate-90 mt-10 mb-10 accent-purple-500 cursor-pointer"
          title="Stroke/Font Size"
        />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full bg-[#0f172a] relative select-none">
      <TopBar />
      <LeftToolbar />
      <div className="flex-1 w-full h-full cursor-crosshair overflow-hidden touch-none pattern-grid-lg relative">
        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerUp={finishDrawing}
          onPointerOut={finishDrawing}
          onPointerMove={draw}
          className="w-full h-full bg-[#0f172a]"
        />
        
        {textPos && (
          <div 
            className="absolute z-30 flex items-center gap-1"
            style={{ left: textPos.x, top: textPos.y - 20 }}
          >
            <input
              ref={textInputRef}
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={handleTextKeyDown} 
              onBlur={commitText}
              placeholder="Type here, press Enter..."
              className="bg-slate-900/90 text-white border border-purple-500 rounded-lg px-3 py-1.5 text-sm font-sans outline-none min-w-[200px] shadow-[0_0_15px_rgba(147,51,234,0.4)]"
              style={{ color, fontSize: Math.max(14, lineWidth * 5) + 'px' }}
              autoFocus
            />
          </div>
        )}

        <style jsx="true">{`
          .pattern-grid-lg {
             background-image: linear-gradient(rgba(255,255,255,.02) 1px, transparent 1px),
             linear-gradient(90deg, rgba(255,255,255,.02) 1px, transparent 1px);
             background-size: 24px 24px;
          }
        `}</style>
      </div>
    </div>
  );
}
