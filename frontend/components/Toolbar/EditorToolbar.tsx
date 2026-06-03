import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronRight,
  Share2,
  Download,
  MoreHorizontal,
  Plus,
  Type,
  Square,
  Circle,
  Triangle,
  Star,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  LayoutDashboard,
  Save,
  Loader2,
  Maximize,
  TextCursor,
  Heading1,
  Minus,
  RotateCcw,
  MessageSquare,
  Settings2,
  Zap,
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
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { jsPDF } from 'jspdf';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../../constants';
import { ShapeType } from '../../types';
import SceneTreePanel from './SceneTreePanel';


const EditorToolbar: React.FC = () => {
  const {
    zoom, setZoom, addElement, currentPageIndex, catalog, setView, user,
    isPropertyPanelOpen, setIsPropertyPanelOpen,
    undo, redo, undoStack, redoStack, uiTheme, toggleUiTheme,
    saveCatalog, activeTool, setActiveTool, isSceneTreeOpen, setIsSceneTreeOpen,
    setCatalogOrientation
  } = useStore();
  const [isCommiting, setIsCommiting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
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
      zIndex: 100 // Always on top
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
      // Optionally show an error toast
    } finally {
      setIsCommiting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: [PAGE_WIDTH, PAGE_HEIGHT]
      });

      const canvas = document.querySelector('canvas');
      if (canvas) {
        for (let i = 0; i < catalog.pages.length; i++) {
          if (i > 0) pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT], 'portrait');
          const imgData = canvas.toDataURL('image/jpeg', 1.0);
          pdf.addImage(imgData, 'JPEG', 0, 0, PAGE_WIDTH, PAGE_HEIGHT);
        }
      }

      pdf.save(`${catalog.name || 'Catalog'}.pdf`);
    } catch (error) {
      console.error('PDF Export Failed', error);
    } finally {
      setIsExporting(false);
    }
  };

  const isDark = uiTheme === 'dark';

  return (
    <header className={`h-14 border-b flex items-center justify-between px-6 shrink-0 z-50 font-sans ${isDark
      ? 'border-slate-700 bg-slate-900 shadow-[0_1px_2px_rgba(0,0,0,0.2)]'
      : 'border-slate-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]'
      }`}>
      {/* Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setView('dashboard')}
          className={`flex items-center gap-2 p-2 rounded-xl transition-all group ${isDark
            ? 'hover:bg-slate-800 text-slate-400 hover:text-white'
            : 'hover:bg-slate-100 text-slate-400 hover:text-slate-600'
            }`}
        >
          <LayoutDashboard size={18} className="group-hover:scale-110 transition-transform" />
        </button>
        <ChevronRight size={14} className={isDark ? 'text-slate-600' : 'text-slate-300'} />
        <div className="flex flex-col">
          <span className={`text-[9px] font-black uppercase tracking-widest leading-none mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Active Publication</span>
          <div className="flex items-center gap-2">
            <span className={`font-black text-xs uppercase tracking-tight truncate max-w-[150px] ${isDark ? 'text-white' : 'text-slate-800'}`}>
              {catalog.name || 'Untitled Project'}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${isDark
              ? 'text-slate-400 bg-slate-800 border-slate-700'
              : 'text-slate-500 bg-slate-100 border-slate-200'
              }`}>Page {currentPageIndex + 1}</span>
          </div>
        </div>
      </div>

      {/* Floating Panels */}
      <SceneTreePanel />

      {/* Center Tools */}
      <div className="flex items-center gap-6">
        <div className={`flex items-center p-1 rounded-2xl border shadow-inner ${isDark
          ? 'bg-slate-800 border-slate-700'
          : 'bg-slate-50 border-slate-200'
          }`}>

          {/* Tool Toggle (Select / Hand) */}
          <div className={`flex gap-1 pr-3 border-r ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <button
              onClick={() => setActiveTool('select')}
              className={`p-2 rounded-xl transition-all ${activeTool === 'select'
                ? (isDark ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-indigo-600 shadow-sm')
                : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700')}`}
              title="Select Tool"
            >
              <MousePointer2 size={18} />
            </button>
            <button
              onClick={() => setActiveTool('hand')}
              className={`p-2 rounded-xl transition-all ${activeTool === 'hand'
                ? (isDark ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-indigo-600 shadow-sm')
                : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700')}`}
              title="Hand Tool (Pan)"
            >
              <Hand size={18} />
            </button>
            <button
              onClick={() => setIsSceneTreeOpen(!isSceneTreeOpen)}
              className={`p-2 rounded-xl transition-all group ${isSceneTreeOpen
                ? (isDark ? 'bg-slate-700 text-white shadow-sm' : 'bg-white text-indigo-600 shadow-sm')
                : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700')}`}
              title="Toggle Layers"
            >
              <Layers size={18} />
            </button>
          </div>

          <div className={`flex gap-1 px-3 border-r ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className="relative" ref={textMenuRef}>
              <button
                onClick={() => setIsTextMenuOpen(!isTextMenuOpen)}
                className={`p-2 hover:shadow-sm rounded-xl transition-all flex items-center gap-0.5 ${isTextMenuOpen
                  ? (isDark ? 'bg-slate-700 shadow-sm text-white' : 'bg-white shadow-sm text-slate-700')
                  : (isDark ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-slate-500 hover:bg-white hover:text-slate-700')
                  }`}
                title="Add Text"
              >
                <Type size={18} />
              </button>

              {isTextMenuOpen && (
                <div className={`absolute top-full left-0 mt-2 w-56 border shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl z-[100] py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                  <div className={`px-4 py-2 border-b mb-1 ${isDark ? 'border-slate-700' : 'border-slate-50'}`}>
                    <p className={`text-[9px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-300'}`}>Insert Text</p>
                  </div>
                  <button onClick={() => handleAddText('heading')} className={`w-full px-4 py-3 flex items-center gap-3 transition-colors text-left group ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'bg-slate-700 text-slate-400 group-hover:text-indigo-400' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                      <Heading1 size={16} />
                    </div>
                    <span className={`text-sm font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Headings</span>
                  </button>
                  <button onClick={() => handleAddText('subheading')} className={`w-full px-4 py-3 flex items-center gap-3 transition-colors text-left group ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'bg-slate-700 text-slate-400 group-hover:text-indigo-400' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                      <Heading1 size={14} />
                    </div>
                    <span className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Sub-headings</span>
                  </button>
                  <button onClick={() => handleAddText('body')} className={`w-full px-4 py-3 flex items-center gap-3 transition-colors text-left group ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-50'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'bg-slate-700 text-slate-400 group-hover:text-indigo-400' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                      <TextCursor size={14} />
                    </div>
                    <span className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Body text</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={`flex gap-1 px-3 border-r ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <div className="relative" ref={shapeMenuRef}>
              <button
                onClick={() => setIsShapeMenuOpen(!isShapeMenuOpen)}
                className={`p-2 hover:shadow-sm rounded-xl transition-all flex items-center gap-0.5 ${isShapeMenuOpen
                  ? (isDark ? 'bg-slate-700 shadow-sm text-white' : 'bg-white shadow-sm text-slate-700')
                  : (isDark ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-slate-500 hover:bg-white hover:text-slate-700')
                  }`}
                title="Add Shape"
              >
                <Square size={18} />
                <ChevronDown size={12} className={`transition-transform duration-200 ${isShapeMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isShapeMenuOpen && (
                <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 border shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl z-[100] p-3 overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`} style={{ width: 220 }}>
                  <div className="grid grid-cols-5 gap-1.5">
                    {([
                      { type: 'line' as ShapeType, icon: <Minus size={18} /> },
                      { type: 'rect' as ShapeType, icon: <Square size={18} /> },
                      { type: 'roundedRect' as ShapeType, icon: <RectangleHorizontal size={18} /> },
                      { type: 'circle' as ShapeType, icon: <Circle size={18} /> },
                      { type: 'triangle' as ShapeType, icon: <Triangle size={18} /> },
                      { type: 'rightTriangle' as ShapeType, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="4 20 4 4 20 20" /></svg> },
                      { type: 'diamond' as ShapeType, icon: <Diamond size={18} /> },
                      { type: 'pentagon' as ShapeType, icon: <Pentagon size={18} /> },
                      { type: 'hexagon' as ShapeType, icon: <Hexagon size={18} /> },
                      { type: 'octagon' as ShapeType, icon: <Octagon size={18} /> },
                      { type: 'arrow' as ShapeType, icon: <ArrowRight size={18} /> },
                      { type: 'arrow4' as ShapeType, icon: <MoveHorizontal size={18} /> },
                      { type: 'star' as ShapeType, icon: <Star size={18} /> },
                      { type: 'parallelogram' as ShapeType, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="6 18 2 6 18 6 22 18" /></svg> },
                      { type: 'cross' as ShapeType, icon: <Plus size={18} /> },
                      { type: 'cloud' as ShapeType, icon: <Cloud size={18} /> },
                      { type: 'wave' as ShapeType, icon: <Flag size={18} /> },
                      { type: 'pill' as ShapeType, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="6" /></svg> },
                    ]).map(({ type, icon }) => (
                      <button
                        key={type}
                        onClick={() => handleAddShape(type)}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${isDark
                          ? 'text-slate-400 hover:bg-slate-700 hover:text-white'
                          : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
                          }`}
                        title={type}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={handleAddComment} className={`p-2 hover:shadow-sm rounded-xl transition-all ${isDark
              ? 'hover:bg-slate-700 text-amber-500 hover:text-amber-400'
              : 'hover:bg-white text-amber-500 hover:text-amber-600'
              }`} title="Add Annotation"><MessageSquare size={18} /></button>
          </div>

          {/* Orientation Toggle */}
          <div className={`flex items-center gap-1 px-3 border-r ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <button
               onClick={() => {
                 const newOrientation = catalog.pages[currentPageIndex]?.orientation === 'landscape' ? 'portrait' : 'landscape';
                 setCatalogOrientation(newOrientation);
               }}
               className={`flex items-center gap-2 p-2 rounded-xl transition-all ${isDark
                 ? 'hover:bg-slate-800 text-slate-400 hover:text-white'
                 : 'hover:bg-white text-slate-500 hover:text-indigo-600'
                 }`}
               title={`Switch all pages to ${catalog.pages[currentPageIndex]?.orientation === 'landscape' ? 'Portrait' : 'Landscape'}`}
            >
               <div className={`p-1 rounded bg-slate-100 flex items-center justify-center transition-transform duration-300 ${catalog.pages[currentPageIndex]?.orientation === 'landscape' ? 'rotate-90' : ''}`}>
                  <div className="w-2.5 h-3.5 border-2 border-slate-600 rounded-[1px]" />
               </div>
               <span className="text-[10px] font-black uppercase tracking-widest hidden xl:inline">{catalog.pages[currentPageIndex]?.orientation === 'landscape' ? 'Landscape' : 'Portrait'}</span>
            </button>
          </div>

          <div className={`flex gap-1 px-3 border-r ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <button
              onClick={undo}
              disabled={undoStack.length === 0}
              className={`p-2 hover:shadow-sm rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent ${isDark
                ? 'hover:bg-slate-700 text-slate-400 hover:text-white'
                : 'hover:bg-white text-slate-500 hover:text-slate-700'
                }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={18} />
            </button>
            <button
              onClick={redo}
              disabled={redoStack.length === 0}
              className={`p-2 hover:shadow-sm rounded-xl transition-all disabled:opacity-30 disabled:hover:bg-transparent ${isDark
                ? 'hover:bg-slate-700 text-slate-400 hover:text-white'
                : 'hover:bg-white text-slate-500 hover:text-slate-700'
                }`}
              title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
            >
              <Redo2 size={18} />
            </button>
          </div>

          <div className="flex items-center gap-1 pl-3">
            <button onClick={() => setZoom(Math.max(0.1, zoom - 0.1))} className={`p-2 hover:shadow-sm rounded-xl transition-all ${isDark ? 'text-slate-400' : 'text-slate-500'}`} title="Zoom Out"><Minus size={18} /></button>
            <button onClick={() => setZoom(0.8)} className={`px-3 py-1.5 hover:shadow-sm rounded-xl transition-all text-[10px] font-black font-mono w-16 text-center ${isDark
              ? 'hover:bg-slate-700 text-white'
              : 'hover:bg-white text-slate-700'
              }`} title="Reset Zoom (80%)">{Math.round(zoom * 100)}%</button>
            <button onClick={() => setZoom(Math.min(3, zoom + 0.1))} className={`p-2 hover:shadow-sm rounded-xl transition-all ${isDark ? 'text-slate-400' : 'text-slate-500'}`} title="Zoom In"><Plus size={18} /></button>
            <button onClick={() => setZoom(1.0)} className={`p-2 hover:shadow-sm rounded-xl transition-all ml-1 ${isDark
              ? 'text-slate-500 hover:bg-slate-700 hover:text-slate-300'
              : 'text-slate-400 hover:bg-white hover:text-slate-600'
              }`} title="Fit to Width (100%)"><RotateCcw size={16} /></button>
          </div>
        </div>

        <div className={`w-px h-6 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2 mr-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 animate-in fade-in zoom-in">
          <Zap size={14} className="animate-pulse" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">Live Sync</span>
        </div>

        <button
          onClick={handleSave}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-transparent flex items-center gap-2 ${isDark
            ? 'text-slate-400 hover:bg-slate-800 hover:border-slate-700'
            : 'text-slate-500 hover:bg-slate-100 hover:border-slate-200'
            }`}
        >
          <Save size={14} />
          {isCommiting ? 'Saving...' : 'Commit'}
        </button>
      </div>
    </header>
  );
};

export default EditorToolbar;
