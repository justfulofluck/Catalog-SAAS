import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronRight,
  Plus,
  Type,
  Square,
  Circle,
  Triangle,
  Star,
  LayoutDashboard,
  Save,
  TextCursor,
  Heading1,
  Minus,
  RotateCcw,
  Undo2,
  Redo2,
  ChevronDown,
  MousePointer2,
  Hand,
  Layers,
  Hexagon,
  Pentagon,
  Octagon,
  Diamond,
  ArrowRight,
  MoveHorizontal,
  RectangleHorizontal,
  Cloud,
  Flag,
  Plus as PlusIcon,
  Sun,
  Moon
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { ShapeType } from '../../types';
import SceneTreePanel from './SceneTreePanel';

const EditorToolbar: React.FC = () => {
  const {
    zoom, setZoom, addElement, currentPageIndex, catalog, setView, user,
    undo, redo, undoStack, redoStack, uiTheme, toggleUiTheme,
    saveCatalog, activeTool, setActiveTool, isSceneTreeOpen, setIsSceneTreeOpen,
    editingSystemTemplate,
    saveActiveTemplateFromEditor
  } = useStore();
  const [isCommiting, setIsCommiting] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isLineMenuOpen, setIsLineMenuOpen] = useState(false);
  const [isShapeMenuOpen, setIsShapeMenuOpen] = useState(false);
  const [isTextMenuOpen, setIsTextMenuOpen] = useState(false);
  const lineMenuRef = useRef<HTMLDivElement>(null);
  const shapeMenuRef = useRef<HTMLDivElement>(null);
  const textMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (lineMenuRef.current && !lineMenuRef.current.contains(e.target as Node)) {
        setIsLineMenuOpen(false);
      }
    };
    if (isLineMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLineMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shapeMenuRef.current && !shapeMenuRef.current.contains(e.target as Node)) {
        setIsShapeMenuOpen(false);
      }
    };
    if (isShapeMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isShapeMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (textMenuRef.current && !textMenuRef.current.contains(e.target as Node)) {
        setIsTextMenuOpen(false);
      }
    };
    if (isTextMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isTextMenuOpen]);

  const handleAddText = (type: 'heading' | 'subheading' | 'body') => {
    const config = {
      heading: { width: 400, height: 45, text: 'Headings', fontSize: 36, fontWeight: '800' },
      subheading: { width: 350, height: 30, text: 'Sub-headings', fontSize: 22, fontWeight: '700' },
      body: { width: 300, height: 60, text: 'Body text', fontSize: 14, fontWeight: '400' },
    }[type];
    addElement(currentPageIndex, {
      id: `el-${Date.now()}`,
      type: 'text',
      x: 100,
      y: 100,
      width: config.width,
      height: config.height,
      rotation: 0,
      opacity: 1,
      text: config.text,
      fontSize: config.fontSize,
      fontFamily: 'Inter',
      fontWeight: config.fontWeight,
      fill: '#1e293b',
      textAlign: 'left',
      zIndex: 10
    });
    setIsTextMenuOpen(false);
  };

  const handleAddShape = (shapeType: ShapeType = 'rect') => {
    addElement(currentPageIndex, {
      id: `shape-${Date.now()}`,
      type: 'shape',
      shapeType,
      x: 150,
      y: 150,
      width: 100,
      height: 100,
      rotation: 0,
      opacity: 1,
      fill: '#cbd5e1',
      zIndex: 10
    });
    setIsShapeMenuOpen(false);
  };

  const handleAddLine = (lineType: 'line' | 'curved-line' | 'elbow-line' = 'line') => {
    addElement(currentPageIndex, {
      id: `line-${Date.now()}`,
      type: 'shape',
      shapeType: lineType,
      x: 150,
      y: 200,
      width: 260,
      height: lineType === 'line' ? 2 : 40,
      rotation: 0,
      opacity: 1,
      fill: '#0f172a',
      stroke: '#0f172a',
      strokeWidth: 3,
      zIndex: 10
    });
    setIsLineMenuOpen(false);
  };

  const handleSave = async () => {
    setIsCommiting(true);
    try {
      const savedId = await saveCatalog();
      if (savedId) {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl z-50 animate-in slide-in-from-bottom-4 backdrop-blur-xl border border-white/10';
        toast.innerText = 'Product Workspace Synchronized';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
      }
    } catch (error: any) {
      console.error('Failed to save catalog', error);
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-12 left-1/2 -translate-x-1/2 bg-red-600 text-white px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl z-50 animate-in slide-in-from-bottom-4 backdrop-blur-xl border border-white/10';
      const status = error.response?.status;
      if (status === 401) {
        toast.innerText = 'Save Failed: Session expired. Please log in.';
      } else {
        toast.innerText = 'Save Failed: ' + (error.response?.data?.detail || error.message || 'Server error');
      }
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3500);
    } finally {
      setIsCommiting(false);
    }
  };

  const isDark = uiTheme === 'dark';

  return (
    <header className={`h-14 border-b flex items-center justify-between px-6 shrink-0 z-50 font-sans shadow-sm transition-colors duration-200 ${
      isDark ? 'border-[#E2DCC8]/15 bg-[#100F0F] text-[#F1F1F1]' : 'border-slate-200 bg-white text-slate-800'
    }`}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => editingSystemTemplate ? useStore.setState({ editingSystemTemplate: null, currentView: 'admin-dashboard' }) : setView('dashboard')}
          className={`flex items-center gap-2 p-2 rounded-[4px] transition-all group ${
            isDark ? 'hover:bg-[#0F3D3E]/30 text-[#E2DCC8]/70 hover:text-[#F1F1F1]' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
          title="Back to Dashboard"
        >
          <LayoutDashboard size={18} />
        </button>
        <ChevronRight size={14} className={isDark ? "text-[#E2DCC8]/30" : "text-slate-300"} />
        <div className="flex flex-col">
          <span className={`text-[9px] font-black uppercase tracking-widest leading-none mb-1 ${
            isDark ? 'text-[#E2DCC8]/60' : 'text-slate-400'
          }`}>
            {editingSystemTemplate ? 'Global Template Studio' : 'Active Publication'}
          </span>
          <span className={`font-black text-xs uppercase tracking-tight ${
            isDark ? 'text-[#F1F1F1]' : 'text-slate-800'
          }`}>
            {catalog.name || 'Untitled Project'}
          </span>
        </div>
      </div>

      <SceneTreePanel />

      <div className="flex items-center gap-6">
        <div className={`flex items-center p-1 rounded-[4px] border shadow-inner transition-colors ${
          isDark ? 'bg-[#141414] border-[#E2DCC8]/15' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className={`flex gap-1 pr-3 border-r ${isDark ? 'border-[#E2DCC8]/15' : 'border-slate-200'}`}>
            <button
              onClick={() => setActiveTool('select')}
              className={`p-2 rounded-[4px] transition-all ${
                activeTool === 'select' 
                  ? 'bg-[#0F3D3E] text-white border border-[#E2DCC8]/30' 
                  : (isDark ? 'text-[#888888] hover:text-[#F1F1F1] hover:bg-[#0F3D3E]/20' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200')
              }`}
              title="Select Tool"
            >
              <MousePointer2 size={18} />
            </button>
            <button
              onClick={() => setActiveTool('hand')}
              className={`p-2 rounded-[4px] transition-all ${
                activeTool === 'hand' 
                  ? 'bg-[#0F3D3E] text-white border border-[#E2DCC8]/30' 
                  : (isDark ? 'text-[#888888] hover:text-[#F1F1F1] hover:bg-[#0F3D3E]/20' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200')
              }`}
              title="Hand Tool (Pan)"
            >
              <Hand size={18} />
            </button>
            <button
              onClick={() => setIsSceneTreeOpen(!isSceneTreeOpen)}
              className={`p-2 rounded-[4px] transition-all ${
                isSceneTreeOpen 
                  ? 'bg-[#0F3D3E] text-white border border-[#E2DCC8]/30' 
                  : (isDark ? 'text-[#888888] hover:text-[#F1F1F1] hover:bg-[#0F3D3E]/20' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200')
              }`}
              title="Layers Panel"
            >
              <Layers size={18} />
            </button>
          </div>

          <div className={`flex gap-1 px-3 border-r ${isDark ? 'border-[#E2DCC8]/15' : 'border-slate-200'}`}>
            <div className="relative" ref={textMenuRef}>
              <button
                onClick={() => setIsTextMenuOpen(!isTextMenuOpen)}
                className={`p-2 rounded-[4px] transition-all ${
                  isDark ? 'text-[#888888] hover:text-[#F1F1F1] hover:bg-[#0F3D3E]/20' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                }`}
                title="Add Text"
              >
                <Type size={18} />
              </button>
              {isTextMenuOpen && (
                <div className={`absolute top-full left-0 mt-2 w-56 border rounded-[4px] z-[100] py-1.5 shadow-2xl ${
                  isDark ? 'bg-[#161616] border-[#262626] text-white' : 'bg-white border-slate-200 text-slate-800'
                }`}>
                  <button onClick={() => handleAddText('heading')} className={`w-full px-4 py-2.5 flex items-center gap-3 ${isDark ? 'hover:bg-[#0F3D3E] hover:text-[#F1F1F1]' : 'hover:bg-slate-100 hover:text-slate-900'} text-xs font-bold text-left`}><Heading1 size={16} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} /> <span>Heading</span></button>
                  <button onClick={() => handleAddText('subheading')} className={`w-full px-4 py-2.5 flex items-center gap-3 ${isDark ? 'hover:bg-[#0F3D3E] hover:text-[#F1F1F1]' : 'hover:bg-slate-100 hover:text-slate-900'} text-xs font-semibold text-left`}><Heading1 size={14} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} /> <span>Sub-heading</span></button>
                  <button onClick={() => handleAddText('body')} className={`w-full px-4 py-2.5 flex items-center gap-3 ${isDark ? 'hover:bg-[#0F3D3E] hover:text-[#F1F1F1]' : 'hover:bg-slate-100 hover:text-slate-900'} text-xs text-left`}><TextCursor size={14} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} /> <span>Body text</span></button>
                </div>
              )}
            </div>
          </div>

          <div className={`flex gap-1 px-3 border-r ${isDark ? 'border-[#E2DCC8]/15' : 'border-slate-200'}`}>
            {/* Lines & Connectors Menu */}
            <div className="relative" ref={lineMenuRef}>
              <button
                onClick={() => setIsLineMenuOpen(!isLineMenuOpen)}
                className={`p-2 rounded-[4px] transition-all flex items-center gap-1 ${
                  isLineMenuOpen
                    ? 'bg-[#0F3D3E] text-white'
                    : (isDark ? 'text-[#888888] hover:text-[#F1F1F1] hover:bg-[#0F3D3E]/20' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200')
                }`}
                title="Lines & Connectors"
              >
                {/* Diagonal line icon matching Screenshot 1 */}
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] stroke-current" fill="none" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="4" y1="20" x2="20" y2="4" />
                </svg>
                <ChevronDown size={12} />
              </button>
              {isLineMenuOpen && (
                <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 border rounded-[6px] z-[100] p-2.5 w-[230px] shadow-2xl ${
                  isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200'
                }`}>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-2 px-1">
                    Lines & Connectors
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Straight Line */}
                    <button
                      onClick={() => handleAddLine('line')}
                      className={`p-2 rounded-[4px] flex flex-col items-center justify-center gap-1.5 transition-colors border ${
                        isDark ? 'border-[#262626] hover:border-[#0F3D3E] hover:bg-[#0F3D3E]/20 text-[#E2DCC8]' : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-700'
                      }`}
                      title="Straight Line Connector"
                    >
                      <svg viewBox="0 0 40 24" className="w-9 h-6 stroke-current" fill="none">
                        <line x1="6" y1="12" x2="34" y2="12" strokeWidth="2.5" strokeLinecap="round" />
                        <circle cx="6" cy="12" r="3" fill="currentColor" />
                        <circle cx="34" cy="12" r="3" fill="currentColor" />
                      </svg>
                      <span className="text-[9px] font-semibold">Straight</span>
                    </button>

                    {/* Curved Line */}
                    <button
                      onClick={() => handleAddLine('curved-line')}
                      className={`p-2 rounded-[4px] flex flex-col items-center justify-center gap-1.5 transition-colors border ${
                        isDark ? 'border-[#262626] hover:border-[#0F3D3E] hover:bg-[#0F3D3E]/20 text-[#E2DCC8]' : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-700'
                      }`}
                      title="Curved Spline Connector"
                    >
                      <svg viewBox="0 0 40 24" className="w-9 h-6 stroke-current" fill="none">
                        <path d="M 6 17 C 16 7, 24 21, 34 7" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                        <circle cx="6" cy="17" r="3" fill="currentColor" />
                        <circle cx="34" cy="7" r="3" fill="currentColor" />
                      </svg>
                      <span className="text-[9px] font-semibold">Curved</span>
                    </button>

                    {/* Elbow / Step Line */}
                    <button
                      onClick={() => handleAddLine('elbow-line')}
                      className={`p-2 rounded-[4px] flex flex-col items-center justify-center gap-1.5 transition-colors border ${
                        isDark ? 'border-[#262626] hover:border-[#0F3D3E] hover:bg-[#0F3D3E]/20 text-[#E2DCC8]' : 'border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-700'
                      }`}
                      title="Elbow / Step Connector"
                    >
                      <svg viewBox="0 0 40 24" className="w-9 h-6 stroke-current" fill="none">
                        <path d="M 6 18 H 20 V 6 H 34" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        <circle cx="6" cy="18" r="3" fill="currentColor" />
                        <circle cx="34" cy="6" r="3" fill="currentColor" />
                      </svg>
                      <span className="text-[9px] font-semibold">Elbow</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={shapeMenuRef}>
              <button
                onClick={() => setIsShapeMenuOpen(!isShapeMenuOpen)}
                className={`p-2 rounded-[4px] transition-all flex items-center gap-1 ${
                  isDark ? 'text-[#888888] hover:text-[#F1F1F1] hover:bg-[#0F3D3E]/20' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                }`}
                title="Add Shape"
              >
                <Square size={18} />
                <ChevronDown size={12} />
              </button>
              {isShapeMenuOpen && (
                <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 border rounded-[4px] z-[100] p-3 w-[220px] shadow-2xl ${
                  isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200'
                }`}>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[ { type: 'line', icon: <Minus size={18} /> }, { type: 'rect', icon: <Square size={18} /> }, { type: 'roundedRect', icon: <RectangleHorizontal size={18} /> }, { type: 'circle', icon: <Circle size={18} /> }, { type: 'triangle', icon: <Triangle size={18} /> }, { type: 'diamond', icon: <Diamond size={18} /> }, { type: 'pentagon', icon: <Pentagon size={18} /> }, { type: 'hexagon', icon: <Hexagon size={18} /> }, { type: 'octagon', icon: <Octagon size={18} /> }, { type: 'arrow', icon: <ArrowRight size={18} /> }, { type: 'arrow4', icon: <MoveHorizontal size={18} /> }, { type: 'star', icon: <Star size={18} /> }, { type: 'cloud', icon: <Cloud size={18} /> }, { type: 'wave', icon: <Flag size={18} /> }, { type: 'cross', icon: <PlusIcon size={18} /> } ].map(({ type, icon }) => (
                      <button key={type} onClick={() => handleAddShape(type as ShapeType)} className={`w-9 h-9 rounded-[4px] flex items-center justify-center transition-colors ${
                        isDark ? 'text-[#888888] hover:bg-[#0F3D3E] hover:text-[#F1F1F1]' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}>{icon}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={`flex gap-1 px-3 border-r ${isDark ? 'border-[#E2DCC8]/15' : 'border-slate-200'}`}>
            <button onClick={undo} disabled={undoStack.length === 0} className={`p-2 transition-all ${isDark ? 'text-[#888888] hover:text-[#F1F1F1]' : 'text-slate-500 hover:text-slate-900'} disabled:opacity-30 rounded-[4px]`} title="Undo"><Undo2 size={18} /></button>
            <button onClick={redo} disabled={redoStack.length === 0} className={`p-2 transition-all ${isDark ? 'text-[#888888] hover:text-[#F1F1F1]' : 'text-slate-500 hover:text-slate-900'} disabled:opacity-30 rounded-[4px]`} title="Redo"><Redo2 size={18} /></button>
          </div>

          <div className="flex items-center gap-1 pl-3">
            <button onClick={() => setZoom(Math.max(0.1, zoom - 0.1))} className={`p-2 transition-all ${isDark ? 'text-[#888888] hover:text-[#F1F1F1]' : 'text-slate-500 hover:text-slate-900'}`} title="Zoom Out"><Minus size={18} /></button>
            <button className={`px-2 py-1 text-[10px] font-mono font-bold ${isDark ? 'text-[#E2DCC8]' : 'text-slate-700'}`}>{Math.round(zoom * 100)}%</button>
            <button onClick={() => setZoom(Math.min(3, zoom + 0.1))} className={`p-2 transition-all ${isDark ? 'text-[#888888] hover:text-[#F1F1F1]' : 'text-slate-500 hover:text-slate-900'}`} title="Zoom In"><Plus size={18} /></button>
            <button onClick={() => setZoom(1.0)} className={`p-2 transition-all ${isDark ? 'text-[#888888] hover:text-[#F1F1F1]' : 'text-slate-500 hover:text-slate-900'}`} title="Reset Zoom"><RotateCcw size={16} /></button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle Button in Editor Topbar */}
        <button
          onClick={toggleUiTheme}
          className={`p-2 rounded-[4px] border transition-all flex items-center justify-center ${
            isDark 
              ? 'border-[#E2DCC8]/20 bg-[#161616] text-[#E2DCC8] hover:bg-[#222]' 
              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          }`}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-indigo-600" />}
        </button>

        {editingSystemTemplate ? (
          <button onClick={async () => { setIsSavingTemplate(true); await saveActiveTemplateFromEditor(); setIsSavingTemplate(false); }} className="px-4 py-2 bg-[#0F3D3E] hover:bg-[#155455] text-[#F1F1F1] border border-[#E2DCC8]/30 rounded-[4px] text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all active:scale-95">
            {isSavingTemplate ? 'Saving...' : 'Save Global Template'}
          </button>
        ) : (
          <button onClick={handleSave} disabled={isCommiting} className="px-4 py-2 bg-[#0F3D3E] hover:bg-[#155455] text-[#F1F1F1] border border-[#E2DCC8]/30 rounded-[4px] text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50">
            <Save size={14} /> {isCommiting ? 'Saving...' : 'Commit'}
          </button>
        )}
      </div>
    </header>
  );
};

export default EditorToolbar;
