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
  Plus as PlusIcon
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { ShapeType } from '../../types';
import SceneTreePanel from './SceneTreePanel';

const EditorToolbar: React.FC = () => {
  const {
    zoom, setZoom, addElement, currentPageIndex, catalog, setView, user,
    undo, redo, undoStack, redoStack, uiTheme,
    saveCatalog, activeTool, setActiveTool, isSceneTreeOpen, setIsSceneTreeOpen,
    editingSystemTemplate,
    saveActiveTemplateFromEditor
  } = useStore();
  const [isCommiting, setIsCommiting] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isShapeMenuOpen, setIsShapeMenuOpen] = useState(false);
  const [isTextMenuOpen, setIsTextMenuOpen] = useState(false);
  const shapeMenuRef = useRef<HTMLDivElement>(null);
  const textMenuRef = useRef<HTMLDivElement>(null);

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
    <header className="h-14 border-b flex items-center justify-between px-6 shrink-0 z-50 font-sans border-[#E2DCC8]/15 bg-[#100F0F] text-[#F1F1F1] shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={() => editingSystemTemplate ? useStore.setState({ editingSystemTemplate: null, currentView: 'admin-dashboard' }) : setView('dashboard')}
          className="flex items-center gap-2 p-2 rounded-[4px] transition-all group hover:bg-[#0F3D3E]/30 text-[#E2DCC8]/70 hover:text-[#F1F1F1]"
        >
          <LayoutDashboard size={18} />
        </button>
        <ChevronRight size={14} className="text-[#E2DCC8]/30" />
        <div className="flex flex-col">
          <span className="text-[9px] font-black uppercase tracking-widest leading-none mb-1 text-[#E2DCC8]/60">
            {editingSystemTemplate ? 'Global Template Studio' : 'Active Publication'}
          </span>
          <span className="font-black text-xs uppercase tracking-tight text-[#F1F1F1]">
            {catalog.name || 'Untitled Project'}
          </span>
        </div>
      </div>

      <SceneTreePanel />

      <div className="flex items-center gap-6">
        <div className="flex items-center p-1 rounded-[4px] border shadow-inner bg-[#141414] border-[#E2DCC8]/15">
          <div className="flex gap-1 pr-3 border-r border-[#E2DCC8]/15">
            <button
              onClick={() => setActiveTool('select')}
              className={`p-2 rounded-[4px] transition-all ${activeTool === 'select' ? 'bg-[#0F3D3E] text-[#F1F1F1] border border-[#E2DCC8]/30' : 'text-[#888888] hover:text-[#F1F1F1] hover:bg-[#0F3D3E]/20'}`}
              title="Select Tool"
            >
              <MousePointer2 size={18} />
            </button>
            <button
              onClick={() => setActiveTool('hand')}
              className={`p-2 rounded-[4px] transition-all ${activeTool === 'hand' ? 'bg-[#0F3D3E] text-[#F1F1F1] border border-[#E2DCC8]/30' : 'text-[#888888] hover:text-[#F1F1F1] hover:bg-[#0F3D3E]/20'}`}
              title="Hand Tool (Pan)"
            >
              <Hand size={18} />
            </button>
            <button
              onClick={() => setIsSceneTreeOpen(!isSceneTreeOpen)}
              className={`p-2 rounded-[4px] transition-all ${isSceneTreeOpen ? 'bg-[#0F3D3E] text-[#F1F1F1] border border-[#E2DCC8]/30' : 'text-[#888888] hover:text-[#F1F1F1] hover:bg-[#0F3D3E]/20'}`}
              title="Layers Panel"
            >
              <Layers size={18} />
            </button>
          </div>

          <div className="flex gap-1 px-3 border-r border-[#E2DCC8]/15">
            <div className="relative" ref={textMenuRef}>
              <button
                onClick={() => setIsTextMenuOpen(!isTextMenuOpen)}
                className="p-2 rounded-[4px] text-[#888888] hover:text-[#F1F1F1] hover:bg-[#0F3D3E]/20"
                title="Add Text"
              >
                <Type size={18} />
              </button>
              {isTextMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 border rounded-[4px] z-[100] py-1.5 shadow-2xl bg-[#161616] border-[#262626]">
                  <button onClick={() => handleAddText('heading')} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#0F3D3E] hover:text-[#F1F1F1] text-xs font-bold text-left"><Heading1 size={16} className="text-[#E2DCC8]" /> <span>Heading</span></button>
                  <button onClick={() => handleAddText('subheading')} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#0F3D3E] hover:text-[#F1F1F1] text-xs font-semibold text-left"><Heading1 size={14} className="text-[#E2DCC8]" /> <span>Sub-heading</span></button>
                  <button onClick={() => handleAddText('body')} className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#0F3D3E] hover:text-[#F1F1F1] text-xs text-left"><TextCursor size={14} className="text-[#E2DCC8]" /> <span>Body text</span></button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-1 px-3 border-r border-[#E2DCC8]/15">
            <div className="relative" ref={shapeMenuRef}>
              <button
                onClick={() => setIsShapeMenuOpen(!isShapeMenuOpen)}
                className="p-2 rounded-[4px] text-[#888888] hover:text-[#F1F1F1] hover:bg-[#0F3D3E]/20 flex items-center gap-1"
                title="Add Shape"
              >
                <Square size={18} />
                <ChevronDown size={12} />
              </button>
              {isShapeMenuOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 border rounded-[4px] z-[100] p-3 w-[220px] shadow-2xl bg-[#161616] border-[#262626]">
                  <div className="grid grid-cols-5 gap-1.5">
                    {[ { type: 'line', icon: <Minus size={18} /> }, { type: 'rect', icon: <Square size={18} /> }, { type: 'roundedRect', icon: <RectangleHorizontal size={18} /> }, { type: 'circle', icon: <Circle size={18} /> }, { type: 'triangle', icon: <Triangle size={18} /> }, { type: 'diamond', icon: <Diamond size={18} /> }, { type: 'pentagon', icon: <Pentagon size={18} /> }, { type: 'hexagon', icon: <Hexagon size={18} /> }, { type: 'octagon', icon: <Octagon size={18} /> }, { type: 'arrow', icon: <ArrowRight size={18} /> }, { type: 'arrow4', icon: <MoveHorizontal size={18} /> }, { type: 'star', icon: <Star size={18} /> }, { type: 'cloud', icon: <Cloud size={18} /> }, { type: 'wave', icon: <Flag size={18} /> }, { type: 'cross', icon: <PlusIcon size={18} /> } ].map(({ type, icon }) => (
                      <button key={type} onClick={() => handleAddShape(type as ShapeType)} className="w-9 h-9 rounded-[4px] flex items-center justify-center text-[#888888] hover:bg-[#0F3D3E] hover:text-[#F1F1F1]">{icon}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-1 px-3 border-r border-[#E2DCC8]/15">
            <button onClick={undo} disabled={undoStack.length === 0} className="p-2 text-[#888888] hover:text-[#F1F1F1] disabled:opacity-30 rounded-[4px]" title="Undo"><Undo2 size={18} /></button>
            <button onClick={redo} disabled={redoStack.length === 0} className="p-2 text-[#888888] hover:text-[#F1F1F1] disabled:opacity-30 rounded-[4px]" title="Redo"><Redo2 size={18} /></button>
          </div>

          <div className="flex items-center gap-1 pl-3">
            <button onClick={() => setZoom(Math.max(0.1, zoom - 0.1))} className="p-2 text-[#888888] hover:text-[#F1F1F1]" title="Zoom Out"><Minus size={18} /></button>
            <button className="px-2 py-1 text-[10px] font-mono font-bold text-[#E2DCC8]">{Math.round(zoom * 100)}%</button>
            <button onClick={() => setZoom(Math.min(3, zoom + 0.1))} className="p-2 text-[#888888] hover:text-[#F1F1F1]" title="Zoom In"><Plus size={18} /></button>
            <button onClick={() => setZoom(1.0)} className="p-2 text-[#888888] hover:text-[#F1F1F1]" title="Reset Zoom"><RotateCcw size={16} /></button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
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
