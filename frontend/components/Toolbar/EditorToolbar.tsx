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
  MessageSquare,
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
  Table as TableIcon,
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

  const handleAddComment = () => {
    addElement(currentPageIndex, {
      id: `comment-${Date.now()}`,
      type: 'comment',
      x: 200,
      y: 200,
      width: 180,
      height: 180,
      rotation: 0,
      opacity: 1,
      text: 'Add your review notes here...',
      fill: '#fef08a',
      author: user?.avatar || 'JD',
      zIndex: 100
    });
  };

  const handleAddTable = () => {
    addElement(currentPageIndex, {
      id: `table-${Date.now()}`,
      type: 'table',
      x: 350,
      y: 120,
      width: 380,
      height: 120,
      rotation: 0,
      opacity: 1,
      zIndex: 20,
      tableData: {
        headers: ['MODEL NO', 'PRODUCTS', 'CUT-OUT', 'COLOR', 'PRICE', 'PACKING'],
        rows: [
          ['VT-2612', '12W V-TAC COB WHITE BODY', '75MM', 'W, W.W, N.W', '', '20 PCS'],
          ['VT-2612', '12W VTAC 3IN1 ON SWITCH', '75MM', 'W, W.W, N.W', ',000', '20 PCS'],
          ['VT-2612', '12W V-TAC COB DIMMABLE', '75MM', 'W, W.W, N.W', ',500', '20 PCS']
        ],
        headerBg: '#002b36',
        headerTextColor: '#ffffff',
        alternateRowBg: '#f8fafc',
        rowBg: '#ffffff',
        borderColor: '#334155',
        fontSize: 8.5,
        headerFontSize: 9.5,
        cellPadding: 5
      }
    });
  };

  const handleSave = async () => {
    setIsCommiting(true);
    try {
      await saveCatalog();
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl z-50 animate-in slide-in-from-bottom-4 backdrop-blur-xl border border-white/10';
      toast.innerText = 'Product Workspace Synchronized';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2500);
    } catch (error) {
      console.error('Failed to save catalog', error);
    } finally {
      setIsCommiting(false);
    }
  };

  const isDark = uiTheme === 'dark';

  return (
    <header className={`h-14 border-b flex items-center justify-between px-6 shrink-0 z-50 font-sans ${isDark ? 'border-slate-700 bg-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.2)]' : 'border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]'}`}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => editingSystemTemplate ? useStore.setState({ editingSystemTemplate: null, currentView: 'admin-dashboard' }) : setView('dashboard')}
          className={`flex items-center gap-2 p-2 rounded-xl transition-all group ${isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'}`}
        >
          <LayoutDashboard size={18} />
        </button>
        <ChevronRight size={14} className={isDark ? 'text-slate-600' : 'text-slate-300'} />
        <div className="flex flex-col">
          <span className={`text-[9px] font-black uppercase tracking-widest leading-none mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {editingSystemTemplate ? 'Global Template Studio' : 'Active Publication'}
          </span>
          <span className={`font-black text-xs uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {catalog.name || 'Untitled Project'}
          </span>
        </div>
      </div>

      <SceneTreePanel />

      <div className="flex items-center gap-6">
        <div className={`flex items-center p-1 rounded-2xl border shadow-inner ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
          <div className={`flex gap-1 pr-3 border-r ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <button onClick={() => setActiveTool('select')} className={`p-2 rounded-xl transition-all ${activeTool === 'select' ? (isDark ? 'bg-slate-700 text-white' : 'bg-white text-indigo-600') : (isDark ? 'text-slate-400' : 'text-slate-500')}`}><MousePointer2 size={18} /></button>
            <button onClick={() => setActiveTool('hand')} className={`p-2 rounded-xl transition-all ${activeTool === 'hand' ? (isDark ? 'bg-slate-700 text-white' : 'bg-white text-indigo-600') : (isDark ? 'text-slate-400' : 'text-slate-500')}`}><Hand size={18} /></button>
            <button onClick={() => setIsSceneTreeOpen(!isSceneTreeOpen)} className={`p-2 rounded-xl transition-all ${isSceneTreeOpen ? (isDark ? 'bg-slate-700 text-white' : 'bg-white text-indigo-600') : (isDark ? 'text-slate-400' : 'text-slate-500')}`}><Layers size={18} /></button>
          </div>

          <div className={`flex gap-1 px-3 border-r ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className="relative" ref={textMenuRef}>
              <button onClick={() => setIsTextMenuOpen(!isTextMenuOpen)} className={`p-2 rounded-xl ${isDark ? 'text-slate-400' : 'text-slate-500'}`}><Type size={18} /></button>
              {isTextMenuOpen && (
                <div className={`absolute top-full left-0 mt-2 w-56 border rounded-2xl z-[100] py-2 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                  <button onClick={() => handleAddText('heading')} className="w-full px-4 py-3 flex items-center gap-3"><Heading1 size={16} /> <span className="text-sm">Headings</span></button>
                  <button onClick={() => handleAddText('subheading')} className="w-full px-4 py-3 flex items-center gap-3"><Heading1 size={14} /> <span className="text-sm">Sub-headings</span></button>
                  <button onClick={() => handleAddText('body')} className="w-full px-4 py-3 flex items-center gap-3"><TextCursor size={14} /> <span className="text-sm">Body text</span></button>
                </div>
              )}
            </div>
          </div>

          <div className={`flex gap-1 px-3 border-r ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className="relative" ref={shapeMenuRef}>
              <button onClick={() => setIsShapeMenuOpen(!isShapeMenuOpen)} className={`p-2 rounded-xl ${isDark ? 'text-slate-400' : 'text-slate-500'}`}><Square size={18} /><ChevronDown size={12} /></button>
              {isShapeMenuOpen && (
                <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 border rounded-2xl z-[100] p-3 w-[220px] ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[ { type: 'line', icon: <Minus size={18} /> }, { type: 'rect', icon: <Square size={18} /> }, { type: 'roundedRect', icon: <RectangleHorizontal size={18} /> }, { type: 'circle', icon: <Circle size={18} /> }, { type: 'triangle', icon: <Triangle size={18} /> }, { type: 'diamond', icon: <Diamond size={18} /> }, { type: 'pentagon', icon: <Pentagon size={18} /> }, { type: 'hexagon', icon: <Hexagon size={18} /> }, { type: 'octagon', icon: <Octagon size={18} /> }, { type: 'arrow', icon: <ArrowRight size={18} /> }, { type: 'arrow4', icon: <MoveHorizontal size={18} /> }, { type: 'star', icon: <Star size={18} /> }, { type: 'cloud', icon: <Cloud size={18} /> }, { type: 'wave', icon: <Flag size={18} /> }, { type: 'cross', icon: <PlusIcon size={18} /> } ].map(({ type, icon }) => (
                      <button key={type} onClick={() => handleAddShape(type as ShapeType)} className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-indigo-50 hover:text-indigo-600">{icon}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={handleAddTable} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-xl" title="Insert Spec / Variants Table"><TableIcon size={18} /></button>
            <button onClick={handleAddComment} className="p-2 text-amber-500 hover:bg-amber-50 rounded-xl" title="Add Annotation"><MessageSquare size={18} /></button>
          </div>

          <div className={`flex gap-1 px-3 border-r ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <button onClick={undo} disabled={undoStack.length === 0} className="p-2 text-slate-400 disabled:opacity-30"><Undo2 size={18} /></button>
            <button onClick={redo} disabled={redoStack.length === 0} className="p-2 text-slate-400 disabled:opacity-30"><Redo2 size={18} /></button>
          </div>

          <div className="flex items-center gap-1 pl-3">
            <button onClick={() => setZoom(Math.max(0.1, zoom - 0.1))} className="p-2"><Minus size={18} /></button>
            <button className="px-3 py-1.5 text-[10px] font-black">{Math.round(zoom * 100)}%</button>
            <button onClick={() => setZoom(Math.min(3, zoom + 0.1))} className="p-2"><Plus size={18} /></button>
            <button onClick={() => setZoom(1.0)} className="p-2"><RotateCcw size={16} /></button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {editingSystemTemplate ? (
          <button onClick={async () => { setIsSavingTemplate(true); await saveActiveTemplateFromEditor(); setIsSavingTemplate(false); }} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase">
            {isSavingTemplate ? 'Saving...' : 'Save Global Template'}
          </button>
        ) : (
          <button onClick={handleSave} className="px-4 py-2 text-[10px] font-black uppercase flex items-center gap-2">
            <Save size={14} /> {isCommiting ? 'Saving...' : 'Commit'}
          </button>
        )}
      </div>
    </header>
  );
};

export default EditorToolbar;
