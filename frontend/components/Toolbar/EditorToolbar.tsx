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
  Plus as PlusIcon,
  Sun,
  Moon,
  FileDown,
  Flag,
  Sparkles,
  BookOpen,
  Check,
  X,
  Code,
  FileJson,
  Upload
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { ShapeType } from '../../types';
import { normalizeTemplateFromJSON } from '../../utils/templateJsonParser';
import SceneTreePanel from './SceneTreePanel';
import ExportModal from '../Editor/ExportModal';

const EditorToolbar: React.FC = () => {
  const {
    zoom, setZoom, addElement, currentPageIndex, catalog, setView, user,
    undo, redo, undoStack, redoStack, uiTheme, toggleUiTheme,
    saveCatalog, activeTool, setActiveTool, isSceneTreeOpen, setIsSceneTreeOpen,
    editingSystemTemplate, isAdminAuthenticated,
    saveActiveTemplateFromEditor
  } = useStore();
  const [isCommiting, setIsCommiting] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPublishCoverModalOpen, setIsPublishCoverModalOpen] = useState(false);
  const [isJsonEditorOpen, setIsJsonEditorOpen] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [coverName, setCoverName] = useState('');
  const [coverCategory, setCoverCategory] = useState('General');
  const [coverDescription, setCoverDescription] = useState('');
  const [coverIsActive, setCoverIsActive] = useState(true);

  const [exportDefaultTab, setExportDefaultTab] = useState<'download' | 'share' | 'embed' | 'publish'>('download');
  const [isLineMenuOpen, setIsLineMenuOpen] = useState(false);
  const [isShapeMenuOpen, setIsShapeMenuOpen] = useState(false);
  const [isTextMenuOpen, setIsTextMenuOpen] = useState(false);
  const lineMenuRef = useRef<HTMLDivElement>(null);
  const shapeMenuRef = useRef<HTMLDivElement>(null);
  const textMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingSystemTemplate) {
      setCoverName(editingSystemTemplate.name || catalog.name || 'New Cover Blueprint');
      setCoverCategory(editingSystemTemplate.category || 'General');
      setCoverDescription(editingSystemTemplate.description || '');
      setCoverIsActive(editingSystemTemplate.is_active ?? true);
    }
  }, [editingSystemTemplate, catalog.name]);

  const handleBackFromEditor = () => {
    if (isAdminAuthenticated && editingSystemTemplate) {
      useStore.setState({ editingSystemTemplate: null });
      setView('admin-dashboard');
    } else {
      useStore.setState({ editingSystemTemplate: null });
      setView('dashboard');
    }
  };

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

  const handleAddShape = (shapeType: ShapeType = 'rect', isHollow = false) => {
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
      fill: isHollow ? 'transparent' : '#cbd5e1',
      stroke: isHollow ? '#0f172a' : undefined,
      strokeWidth: isHollow ? 2 : 0,
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
          onClick={handleBackFromEditor}
          className={`flex items-center gap-2 p-2 rounded-[4px] transition-all group ${
            isDark ? 'hover:bg-[#0F3D3E]/30 text-[#E2DCC8]/70 hover:text-[#F1F1F1]' : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
          }`}
          title={isAdminAuthenticated && editingSystemTemplate ? "Back to Super Admin Portal" : "Back to Dashboard"}
        >
          <LayoutDashboard size={18} />
        </button>
        <ChevronRight size={14} className={isDark ? "text-[#E2DCC8]/30" : "text-slate-300"} />
        <div className="flex flex-col">
          <span className={`text-[9px] font-black uppercase tracking-widest leading-none mb-1 ${
            isDark ? 'text-emerald-400/90' : 'text-emerald-700'
          }`}>
            {editingSystemTemplate ? 'Cover Studio • Master Blueprint' : 'Active Publication'}
          </span>
          <span className={`font-black text-xs uppercase tracking-tight ${
            isDark ? 'text-[#F1F1F1]' : 'text-slate-800'
          }`}>
            {catalog.name || (editingSystemTemplate ? 'New Cover Blueprint' : 'Untitled Project')}
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
                <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 border rounded-[6px] z-[100] p-3 w-[240px] shadow-2xl ${
                  isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200'
                }`}>
                  {/* Outline / Border Only Shapes */}
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-1.5 px-1 flex items-center justify-between">
                    <span>Outline Shapes (Border Only)</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5 mb-3">
                    {[
                      { type: 'rect', label: 'Square Outline', icon: <div className="w-4 h-4 border-2 border-current rounded-[1px]" /> },
                      { type: 'roundedRect', label: 'Rounded Square Outline', icon: <div className="w-4 h-4 border-2 border-current rounded-[4px]" /> },
                      { type: 'circle', label: 'Circle Outline', icon: <div className="w-4 h-4 border-2 border-current rounded-full" /> },
                      { type: 'triangle', label: 'Triangle Outline', icon: <Triangle size={18} /> },
                      { type: 'diamond', label: 'Diamond Outline', icon: <Diamond size={18} /> }
                    ].map(({ type, label, icon }) => (
                      <button
                        key={`outline-${type}`}
                        onClick={() => handleAddShape(type as ShapeType, true)}
                        className={`w-9 h-9 rounded-[4px] flex items-center justify-center transition-colors border ${
                          isDark ? 'border-[#262626] hover:bg-[#0F3D3E] text-[#E2DCC8] hover:text-white' : 'border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-slate-900'
                        }`}
                        title={label}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>

                  {/* Solid Shapes */}
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#888888] mb-1.5 px-1">
                    Solid Shapes
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[ { type: 'line', icon: <Minus size={18} /> }, { type: 'rect', icon: <Square size={18} className="fill-current" /> }, { type: 'roundedRect', icon: <RectangleHorizontal size={18} className="fill-current" /> }, { type: 'circle', icon: <Circle size={18} className="fill-current" /> }, { type: 'triangle', icon: <Triangle size={18} className="fill-current" /> }, { type: 'diamond', icon: <Diamond size={18} className="fill-current" /> }, { type: 'pentagon', icon: <Pentagon size={18} className="fill-current" /> }, { type: 'hexagon', icon: <Hexagon size={18} className="fill-current" /> }, { type: 'octagon', icon: <Octagon size={18} className="fill-current" /> }, { type: 'arrow', icon: <ArrowRight size={18} /> }, { type: 'arrow4', icon: <MoveHorizontal size={18} /> }, { type: 'star', icon: <Star size={18} className="fill-current" /> }, { type: 'cloud', icon: <Cloud size={18} className="fill-current" /> }, { type: 'wave', icon: <Flag size={18} className="fill-current" /> }, { type: 'cross', icon: <PlusIcon size={18} /> } ].map(({ type, icon }) => (
                      <button key={type} onClick={() => handleAddShape(type as ShapeType, false)} className={`w-9 h-9 rounded-[4px] flex items-center justify-center transition-colors ${
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

      <div className="flex items-center gap-2.5">
        {/* Theme Toggle Button in Editor Topbar */}
        <button
          onClick={toggleUiTheme}
          className={`p-2 rounded-[4px] border transition-all flex items-center justify-center cursor-pointer ${
            isDark 
              ? 'border-[#E2DCC8]/20 bg-[#161616] text-[#E2DCC8] hover:bg-[#222]' 
              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
          }`}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-indigo-600" />}
        </button>

        {/* Download PDF / Images Icon Button - only in regular catalog editor */}
        {!editingSystemTemplate && (
          <button
            onClick={() => {
              setExportDefaultTab('download');
              setIsExportModalOpen(true);
            }}
            className="p-2 bg-[#0F3D3E] hover:bg-[#155455] text-[#F1F1F1] border border-[#E2DCC8]/30 rounded-[4px] flex items-center justify-center shadow-sm transition-all active:scale-95 cursor-pointer"
            title="Download PDF or Images"
          >
            <FileDown size={16} />
          </button>
        )}

        {editingSystemTemplate ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const currentPage = catalog.pages[currentPageIndex] || catalog.pages[0];
                const currentData = {
                  name: editingSystemTemplate.name || catalog.name || 'Cover Blueprint',
                  category: editingSystemTemplate.category || 'General',
                  type: editingSystemTemplate.type || 'cover',
                  description: editingSystemTemplate.description || '',
                  backgroundColor: currentPage?.backgroundColor || '#ffffff',
                  pages_data: catalog.pages.map((p, idx) => ({
                    pageNumber: idx + 1,
                    type: 'cover',
                    backgroundColor: p.backgroundColor || '#ffffff',
                    elements: p.elements || []
                  }))
                };
                setJsonText(JSON.stringify(currentData, null, 2));
                setJsonError(null);
                setIsJsonEditorOpen(true);
              }}
              className="px-3 py-2 bg-[#1b1b1b] hover:bg-[#252525] border border-[#383838] hover:border-[#E2DCC8]/40 text-[#E2DCC8] rounded-[4px] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
              title="Inspect and live-edit raw template JSON"
            >
              <Code size={13} />
              <span>JSON Code</span>
            </button>

            <button
              onClick={() => {
                setCoverName(editingSystemTemplate.name || catalog.name || 'New Cover Blueprint');
                setCoverCategory(editingSystemTemplate.category || 'General');
                setCoverDescription(editingSystemTemplate.description || '');
                setCoverIsActive(editingSystemTemplate.is_active ?? true);
                setIsPublishCoverModalOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-[#0F3D3E] to-[#155455] hover:from-[#134d4f] hover:to-[#186062] text-white border border-[#E2DCC8]/40 rounded-[4px] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles size={13} className="text-emerald-300" />
              Publish Blueprint
            </button>
          </div>
        ) : (
          <button onClick={handleSave} disabled={isCommiting} className="px-4 py-2 bg-[#0F3D3E] hover:bg-[#155455] text-[#F1F1F1] border border-[#E2DCC8]/30 rounded-[4px] text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer">
            <Save size={14} /> {isCommiting ? 'Saving...' : 'Commit'}
          </button>
        )}
      </div>

      {/* High-Fidelity Export & Download Modal (Download, Share, Embed, Publish) */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        defaultTab={exportDefaultTab}
      />

      {/* Publish Master Cover Blueprint Modal */}
      {isPublishCoverModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in fade-in duration-200">
          <div
            className={`w-full max-w-lg rounded-[8px] border shadow-2xl overflow-hidden flex flex-col ${
              isDark ? 'bg-[#18181b] border-[#2c2c30] text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Modal Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              isDark ? 'border-[#2c2c30] bg-[#141416]' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[4px] bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <BookOpen size={16} />
                </div>
                <div>
                  <h3 className="font-space text-sm font-bold tracking-wide">
                    {editingSystemTemplate?.id ? 'Update Cover Blueprint' : 'Publish Master Cover Blueprint'}
                  </h3>
                  <p className="text-[11px] text-[#888888]">
                    Save this front cover design as a global blueprint for all tenants
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPublishCoverModalOpen(false)}
                className="p-1.5 rounded-[4px] text-[#888888] hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form Body */}
            <div className="p-6 space-y-4">
              {/* Cover Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#cccccc]">
                  Cover Blueprint Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={coverName}
                  onChange={(e) => setCoverName(e.target.value)}
                  placeholder="e.g. Minimalist Bold Editorial Cover"
                  className={`w-full px-3.5 py-2.5 text-xs font-medium rounded-[4px] border outline-none transition-all ${
                    isDark
                      ? 'bg-[#111113] border-[#333338] text-white focus:border-[#0F3D3E]'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-[#0F3D3E]'
                  }`}
                />
              </div>

              {/* Target Industry / Category */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#cccccc]">
                  Target Industry / Category
                </label>
                <select
                  value={coverCategory}
                  onChange={(e) => setCoverCategory(e.target.value)}
                  className={`w-full px-3.5 py-2.5 text-xs font-medium rounded-[4px] border outline-none cursor-pointer transition-all ${
                    isDark
                      ? 'bg-[#111113] border-[#333338] text-white focus:border-[#0F3D3E]'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-[#0F3D3E]'
                  }`}
                >
                  <option value="General">General / Multi-Purpose</option>
                  <option value="Industrial / Lighting">Industrial / Lighting</option>
                  <option value="Electronics & Tech">Electronics & Tech</option>
                  <option value="Fashion & Apparel">Fashion & Apparel</option>
                  <option value="Furniture & Interior">Furniture & Interior</option>
                  <option value="Automotive & Tools">Automotive & Tools</option>
                  <option value="Cosmetics & Beauty">Cosmetics & Beauty</option>
                  <option value="Jewelry & Luxury">Jewelry & Luxury</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Medical & Healthcare">Medical & Healthcare</option>
                  <option value="Real Estate">Real Estate</option>
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#cccccc]">
                  Description / Layout Notes
                </label>
                <textarea
                  rows={2}
                  value={coverDescription}
                  onChange={(e) => setCoverDescription(e.target.value)}
                  placeholder="Brief description of this cover blueprint layout..."
                  className={`w-full px-3.5 py-2.5 text-xs font-medium rounded-[4px] border outline-none resize-none transition-all ${
                    isDark
                      ? 'bg-[#111113] border-[#333338] text-white focus:border-[#0F3D3E]'
                      : 'bg-white border-slate-300 text-slate-900 focus:border-[#0F3D3E]'
                  }`}
                />
              </div>

              {/* Publication Status (Live vs Draft) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#cccccc]">
                  Publication Status
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCoverIsActive(true)}
                    className={`p-3 rounded-[6px] border text-left transition-all flex items-start gap-3 ${
                      coverIsActive
                        ? 'bg-emerald-950/40 border-emerald-500/60 text-white'
                        : isDark
                        ? 'bg-[#111113] border-[#333338] text-[#888888] hover:border-[#44444a]'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className={`mt-0.5 w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      coverIsActive ? 'border-emerald-400 bg-emerald-400' : 'border-[#666666]'
                    }`}>
                      {coverIsActive && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        Live / Published
                      </p>
                      <p className="text-[10px] text-[#888888] mt-0.5">
                        Available immediately for all tenants
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCoverIsActive(false)}
                    className={`p-3 rounded-[6px] border text-left transition-all flex items-start gap-3 ${
                      !coverIsActive
                        ? 'bg-zinc-800/60 border-amber-500/60 text-white'
                        : isDark
                        ? 'bg-[#111113] border-[#333338] text-[#888888] hover:border-[#44444a]'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className={`mt-0.5 w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      !coverIsActive ? 'border-amber-400 bg-amber-400' : 'border-[#666666]'
                    }`}>
                      {!coverIsActive && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        Draft (Inactive)
                      </p>
                      <p className="text-[10px] text-[#888888] mt-0.5">
                        Hidden from tenant template selectors
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`px-6 py-4 border-t flex items-center justify-end gap-3 ${
              isDark ? 'border-[#2c2c30] bg-[#141416]' : 'border-slate-200 bg-slate-50'
            }`}>
              <button
                type="button"
                onClick={() => setIsPublishCoverModalOpen(false)}
                className="px-4 py-2 rounded-[4px] border border-[#333338] hover:bg-white/5 text-xs font-bold text-[#aaaaaa] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingTemplate || !coverName.trim()}
                onClick={async () => {
                  setIsSavingTemplate(true);
                  try {
                    const success = await saveActiveTemplateFromEditor({
                      name: coverName.trim(),
                      category: coverCategory,
                      description: coverDescription.trim(),
                      is_active: coverIsActive,
                      type: 'cover'
                    });
                    if (success) {
                      setIsPublishCoverModalOpen(false);
                    }
                  } catch (err) {
                    console.error('Save cover blueprint error:', err);
                  } finally {
                    setIsSavingTemplate(false);
                  }
                }}
                className="px-5 py-2 rounded-[4px] bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/40 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#0F3D3E]/30 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSavingTemplate ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Save Master Blueprint</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Template JSON Inspector / Code Editor Modal */}
      {isJsonEditorOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-[200] p-4 animate-in fade-in duration-200">
          <div
            className={`w-full max-w-3xl rounded-[8px] border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
              isDark ? 'bg-[#141414] border-[#2e2e2e] text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              isDark ? 'border-[#262626] bg-[#181818]' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[4px] bg-[#0F3D3E] border border-[#E2DCC8]/30 flex items-center justify-center text-[#E2DCC8]">
                  <FileJson size={16} />
                </div>
                <div>
                  <h3 className="font-space text-sm font-bold tracking-wide">
                    Live Blueprint JSON Code Editor
                  </h3>
                  <p className="text-[11px] text-[#888888]">
                    Inspect, edit, or paste full template JSON directly onto the visual canvas
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsJsonEditorOpen(false)}
                className="p-1.5 rounded-[4px] text-[#888888] hover:text-white hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Code Body */}
            <div className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              <div className="relative font-mono">
                <textarea
                  value={jsonText}
                  onChange={(e) => {
                    setJsonText(e.target.value);
                    try {
                      JSON.parse(e.target.value);
                      setJsonError(null);
                    } catch (err: any) {
                      setJsonError(err.message || 'Invalid JSON syntax');
                    }
                  }}
                  rows={15}
                  className="w-full p-4 bg-[#100F0F] border border-[#2e2e2e] focus:border-[#0F3D3E] rounded-[6px] text-xs font-mono text-emerald-300 placeholder-[#444444] outline-none leading-relaxed transition-all resize-y"
                  spellCheck={false}
                />
              </div>

              {jsonError && (
                <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-[4px] text-red-300 text-xs font-mono">
                  <strong>JSON Error:</strong> {jsonError}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`px-6 py-4 border-t flex items-center justify-between ${
              isDark ? 'border-[#262626] bg-[#161616]' : 'border-slate-200 bg-slate-50'
            }`}>
              <button
                type="button"
                onClick={() => setIsJsonEditorOpen(false)}
                className="px-4 py-2 rounded-[4px] border border-[#333338] hover:bg-white/5 text-xs font-bold text-[#aaaaaa] hover:text-white transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={!!jsonError || !jsonText.trim()}
                onClick={() => {
                  try {
                    const parsed = JSON.parse(jsonText);
                    const { template, pages } = normalizeTemplateFromJSON(parsed);

                    useStore.setState({
                      editingSystemTemplate: editingSystemTemplate ? { ...editingSystemTemplate, ...template } : template,
                      catalog: {
                        ...catalog,
                        name: template.name || catalog.name,
                        pages: pages as any
                      },
                      currentPageIndex: 0
                    });

                    setIsJsonEditorOpen(false);
                  } catch (err: any) {
                    setJsonError(err.message);
                  }
                }}
                className="px-5 py-2 rounded-[4px] bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/40 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#0F3D3E]/30 transition-all active:scale-95 disabled:opacity-50"
              >
                <Check size={14} />
                <span>Apply to Visual Canvas</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default EditorToolbar;
