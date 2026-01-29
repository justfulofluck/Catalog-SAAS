
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
  ChevronDown
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { jsPDF } from 'jspdf';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../../constants';
import { ShapeType } from '../../types';

const EditorToolbar: React.FC = () => {
  const {
    zoom, setZoom, addElement, currentPageIndex, catalog, setView, user,
    isPropertyPanelOpen, setIsPropertyPanelOpen,
    undo, redo, undoStack, redoStack, uiTheme, toggleUiTheme
  } = useStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isShapeMenuOpen, setIsShapeMenuOpen] = useState(false);
  const shapeMenuRef = useRef<HTMLDivElement>(null);

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

  const handleAddText = (type: 'heading' | 'body') => {
    const isHeading = type === 'heading';
    addElement(currentPageIndex, {
      id: `el-${Date.now()}`,
      type: 'text',
      x: 100,
      y: 100,
      width: isHeading ? 400 : 300,
      height: isHeading ? 50 : 100,
      rotation: 0,
      opacity: 1,
      text: isHeading ? 'New Headline' : 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam at varius enim.',
      fontSize: isHeading ? 32 : 14,
      fontFamily: 'Inter',
      fontWeight: isHeading ? '800' : '400',
      fill: '#1e293b',
      textAlign: 'left',
      zIndex: 10
    });
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

  const handleSave = () => {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl z-50 animate-in slide-in-from-bottom-4 backdrop-blur-xl border border-white/10';
    toast.innerText = 'Asset Workspace Synchronized';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
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

      {/* Center Tools */}
      <div className="flex items-center gap-6">
        <div className={`flex items-center p-1 rounded-2xl border shadow-inner ${isDark
          ? 'bg-slate-800 border-slate-700'
          : 'bg-slate-50 border-slate-200'
          }`}>
          <div className={`flex gap-1 pr-3 border-r ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <button onClick={() => handleAddText('heading')} className={`p-2 hover:shadow-sm rounded-xl transition-all ${isDark
              ? 'hover:bg-slate-700 text-slate-400 hover:text-white'
              : 'hover:bg-white text-slate-500 hover:text-slate-700'
              }`} title="Add Heading"><Heading1 size={18} /></button>
            <button onClick={() => handleAddText('body')} className={`p-2 hover:shadow-sm rounded-xl transition-all ${isDark
              ? 'hover:bg-slate-700 text-slate-400 hover:text-white'
              : 'hover:bg-white text-slate-500 hover:text-slate-700'
              }`} title="Add Body Text"><TextCursor size={18} /></button>
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
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-2xl z-[100] py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-4 py-2 border-b border-slate-50 mb-1">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Select Primitive</p>
                  </div>
                  <button onClick={() => handleAddShape('rect')} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left group">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition-colors"><Square size={16} /></div>
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Rectangle</span>
                  </button>
                  <button onClick={() => handleAddShape('circle')} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left group">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition-colors"><Circle size={16} /></div>
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Circle</span>
                  </button>
                  <button onClick={() => handleAddShape('triangle')} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left group">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition-colors"><Triangle size={16} /></div>
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Triangle</span>
                  </button>
                  <button onClick={() => handleAddShape('star')} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left group">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center transition-colors"><Star size={16} /></div>
                    <span className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Star</span>
                  </button>
                </div>
              )}
            </div>
            <button onClick={handleAddComment} className={`p-2 hover:shadow-sm rounded-xl transition-all ${isDark
              ? 'hover:bg-slate-700 text-amber-400 hover:text-amber-300'
              : 'hover:bg-white text-amber-500 hover:text-amber-600'
              }`} title="Add Annotation"><MessageSquare size={18} /></button>
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

        <button
          onClick={() => setIsPropertyPanelOpen(!isPropertyPanelOpen)}
          className={`p-2.5 rounded-xl transition-all ${isPropertyPanelOpen ? 'bg-indigo-600 text-white shadow-lg' : (isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700')}`}
          title="Toggle Properties Panel"
        >
          <Settings2 size={18} />
        </button>
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
          Commit
        </button>

        <div className={`w-px h-6 mx-1 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}></div>

        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-600/10 hover:bg-indigo-700 transition-all disabled:opacity-50 active:scale-95"
        >
          {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          {isExporting ? 'Processing' : 'Export PDF'}
        </button>
      </div>
    </header>
  );
};

export default EditorToolbar;
