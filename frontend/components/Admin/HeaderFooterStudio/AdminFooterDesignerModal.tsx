import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Plus,
  Trash2,
  Copy,
  RotateCcw,
  RotateCw,
  Layers,
  Type,
  Image as ImageIcon,
  Sparkles,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Check,
  Info,
  Sliders,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import { useStore } from '../../../store/useStore';
import { CanvasElement, SystemTemplate } from '../../../types';
import { PAGE_WIDTH, FOOTER_TEMPLATES } from '../../../constants';

interface AdminFooterDesignerModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  template?: SystemTemplate | null;
}

const FONTS = [
  'Inter',
  'Roboto',
  'Playfair Display',
  'Montserrat',
  'Cinzel',
  'Space Grotesk',
  'Poppins',
  'Plus Jakarta Sans'
];

export const AdminFooterDesignerModal: React.FC<AdminFooterDesignerModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  template: propTemplate
}) => {
  const {
    isAdminFooterDesignerOpen,
    editingAdminFooterTemplate,
    setIsAdminFooterDesignerOpen,
    createSystemTemplate,
    updateSystemTemplate,
    showToast,
    fetchAdminAssets
  } = useStore();

  const isOpen = propIsOpen !== undefined ? propIsOpen : isAdminFooterDesignerOpen;
  const initialTemplate = propTemplate !== undefined ? propTemplate : editingAdminFooterTemplate;

  const handleClose = () => {
    if (propOnClose) propOnClose();
    else setIsAdminFooterDesignerOpen(false, null);
  };

  // Form & Blueprint State
  const [templateName, setTemplateName] = useState('Classic Professional Footer');
  const [templateCategory, setTemplateCategory] = useState('General');
  const [templateDescription, setTemplateDescription] = useState('Standard pagination with copyright and dynamic confidentiality disclaimers.');
  const [isActive, setIsActive] = useState(true);
  const [footerHeight, setFooterHeight] = useState(75.6); // 20mm default
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [sideMargin, setSideMargin] = useState(40);

  // Canvas Elements State
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'elements' | 'templates' | 'settings'>('elements');
  const [history, setHistory] = useState<CanvasElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [zoom, setZoom] = useState(1.4); // 140% default zoom for large, clear editing

  // Initialize on template open
  useEffect(() => {
    if (!isOpen) return;

    fetchAdminAssets();

    if (initialTemplate) {
      setTemplateName(initialTemplate.name || 'Footer Template');
      setTemplateCategory(initialTemplate.category || 'General');
      setTemplateDescription(initialTemplate.description || '');
      setIsActive(initialTemplate.is_active ?? true);

      const firstPage = initialTemplate.pages_data?.[0];
      if (firstPage && Array.isArray(firstPage.elements) && firstPage.elements.length > 0) {
        setElements(JSON.parse(JSON.stringify(firstPage.elements)));
        setFooterHeight(firstPage.height || (initialTemplate as any).footerHeight || 75.6);
      } else {
        loadDefaultElements();
      }
    } else {
      setTemplateName('New Master Footer Blueprint');
      setTemplateCategory('General');
      setTemplateDescription('Platform-wide footer template.');
      setIsActive(true);
      loadDefaultElements();
    }
  }, [isOpen, initialTemplate]);

  const loadDefaultElements = () => {
    const defaultElements: CanvasElement[] = [
      {
        id: `admin-ftr-divider-${Date.now()}`,
        type: 'shape',
        shapeType: 'rectangle',
        x: 40,
        y: 8,
        width: 714,
        height: 1,
        fill: '#e2e8f0',
        zIndex: 5,
        rotation: 0,
        opacity: 1
      },
      {
        id: `admin-ftr-disclaimer-${Date.now()}`,
        type: 'text',
        text: 'Proprietary & Confidential • {{company_name}}',
        x: 40,
        y: 20,
        width: 400,
        height: 25,
        fontSize: 9,
        fontFamily: 'Inter',
        fontWeight: 'normal',
        textAlign: 'left',
        fill: '#94a3b8',
        zIndex: 10,
        rotation: 0,
        opacity: 1
      },
      {
        id: `admin-ftr-page-${Date.now()}`,
        type: 'text',
        text: 'Page {{page}}',
        x: 580,
        y: 20,
        width: 174,
        height: 25,
        fontSize: 9,
        fontFamily: 'Inter',
        fontWeight: 'bold',
        textAlign: 'right',
        fill: '#94a3b8',
        zIndex: 10,
        rotation: 0,
        opacity: 1
      }
    ];
    setElements(defaultElements);
    setHistory([defaultElements]);
    setHistoryIndex(0);
  };

  const pushState = (newElements: CanvasElement[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newElements);
    if (newHistory.length > 20) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setElements(newElements);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  };

  const handleAddText = (type: 'page' | 'disclaimer' | 'website' | 'custom') => {
    let defaultText = 'Footer Information';
    let fontSize = 9;
    let fontWeight = 'normal';
    let fill = '#64748b';
    let textAlign: 'left' | 'center' | 'right' = 'left';

    if (type === 'page') {
      defaultText = 'Page {{page}} of {{total_pages}}';
      fontSize = 9;
      fontWeight = 'bold';
      fill = '#475569';
      textAlign = 'right';
    } else if (type === 'disclaimer') {
      defaultText = 'Confidential & Proprietary';
      fontSize = 9;
      fill = '#94a3b8';
      textAlign = 'left';
    } else if (type === 'website') {
      defaultText = 'www.yourbusiness.com';
      fontSize = 9;
      fill = '#0F3D3E';
      textAlign = 'center';
    }

    const newEl: CanvasElement = {
      id: `admin-ftr-txt-${Date.now()}`,
      type: 'text',
      text: defaultText,
      x: textAlign === 'right' ? PAGE_WIDTH - sideMargin - 200 : sideMargin,
      y: 18,
      width: 200,
      height: 25,
      fontSize,
      fontFamily: 'Inter',
      fontWeight,
      textAlign,
      fill,
      zIndex: elements.length + 1,
      rotation: 0,
      opacity: 1
    };

    pushState([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  const handleAddShape = (shapeType: 'rectangle' | 'circle' | 'line') => {
    const isLine = shapeType === 'line';
    const newEl: CanvasElement = {
      id: `admin-ftr-shp-${Date.now()}`,
      type: 'shape',
      shapeType: isLine ? 'rectangle' : shapeType,
      x: sideMargin,
      y: isLine ? 8 : 12,
      width: isLine ? PAGE_WIDTH - sideMargin * 2 : 30,
      height: isLine ? 1 : 30,
      fill: isLine ? '#e2e8f0' : '#0F3D3E',
      zIndex: 1,
      rotation: 0,
      opacity: 1
    };

    pushState([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  const handleUpdateSelected = (updates: Partial<CanvasElement>) => {
    if (!selectedId) return;
    const updated = elements.map(el => (el.id === selectedId ? { ...el, ...updates } : el));
    pushState(updated);
  };

  const handleDeleteSelected = () => {
    if (!selectedId) return;
    const filtered = elements.filter(el => el.id !== selectedId);
    pushState(filtered);
    setSelectedId(null);
  };

  const handleDuplicateSelected = () => {
    if (!selectedId) return;
    const target = elements.find(el => el.id === selectedId);
    if (!target) return;

    const copy: CanvasElement = {
      ...JSON.parse(JSON.stringify(target)),
      id: `admin-ftr-copy-${Date.now()}`,
      x: Math.min(PAGE_WIDTH - target.width, target.x + 15),
      y: Math.min(footerHeight - (target.height || 20), target.y + 5),
      zIndex: elements.length + 1
    };

    pushState([...elements, copy]);
    setSelectedId(copy.id);
  };

  const handleApplyPreset = (preset: typeof FOOTER_TEMPLATES[0]) => {
    const newElements = preset.elements.map((el, idx) => ({
      ...el,
      id: `admin-ftr-preset-${Date.now()}-${idx}`
    })) as CanvasElement[];

    setFooterHeight(preset.height || 75.6);
    pushState(newElements);
    showToast('Applied footer preset blueprint', 'info');
  };

  const handleSaveToSystemTemplates = async () => {
    if (!templateName.trim()) {
      showToast('Please enter a template name', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const templatePayload: Partial<SystemTemplate> = {
        name: templateName,
        category: templateCategory,
        description: templateDescription,
        type: 'footer',
        is_active: isActive,
        pages_data: [
          {
            pageNumber: 1,
            type: 'interior',
            height: footerHeight,
            elements: elements
          } as any
        ]
      };

      if (initialTemplate && initialTemplate.id) {
        await updateSystemTemplate(initialTemplate.id, templatePayload);
        showToast('Super Admin Footer Template updated successfully!', 'success');
      } else {
        await createSystemTemplate(templatePayload);
        showToast('Super Admin Footer Template published globally!', 'success');
      }

      handleClose();
    } catch (e: any) {
      console.error('Failed to save admin footer template:', e);
      showToast(e.message || 'Failed to save template', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedElement = elements.find(el => el.id === selectedId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-[#121212] w-screen h-screen overflow-hidden text-white font-sans animate-in fade-in duration-150">
      
      {/* ================= MODAL HEADER ================= */}
      <div className="px-6 py-3.5 bg-[#181818] border-b border-[#262626] flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-[#0F3D3E] border border-[#E2DCC8]/30 flex items-center justify-center text-[#E2DCC8] shadow-inner">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Super Admin • Master Footer Studio
              </h2>
              <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Global System Template
              </span>
            </div>
            <p className="text-[11px] text-[#888888]">
              Design standardized footer pagination and disclaimer blueprints for all SaaS clients.
            </p>
          </div>
        </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-2 rounded bg-[#202020] hover:bg-[#282828] text-slate-300 disabled:opacity-30 transition-all"
              title="Undo"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-2 rounded bg-[#202020] hover:bg-[#282828] text-slate-300 disabled:opacity-30 transition-all"
              title="Redo"
            >
              <RotateCw size={14} />
            </button>

            <div className="h-6 w-px bg-[#333]" />

            <button
              onClick={handleClose}
              className="px-4 py-2 rounded bg-[#202020] hover:bg-[#282828] text-slate-300 text-xs font-bold uppercase tracking-wider transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveToSystemTemplates}
              disabled={isSaving}
              className="px-5 py-2 rounded bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/40 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#0F3D3E]/30 active:scale-95 transition-all"
            >
              <Save size={14} />
              <span>{isSaving ? 'Publishing...' : initialTemplate ? 'Update Master Template' : 'Publish Master Template'}</span>
            </button>
          </div>
        </div>

        {/* ================= MAIN STUDIO WORKSPACE ================= */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* LEFT TOOLBOX */}
          <div className="w-80 bg-[#181818] border-r border-[#262626] flex flex-col shrink-0">
            {/* Tab Bar */}
            <div className="flex border-b border-[#262626] p-1 gap-1 bg-[#121212]">
              <button
                onClick={() => setActiveTab('elements')}
                className={`flex-1 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'elements' ? 'bg-[#202020] text-[#E2DCC8] shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers size={13} /> Elements
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`flex-1 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'templates' ? 'bg-[#202020] text-[#E2DCC8] shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles size={13} /> Presets
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-1 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'settings' ? 'bg-[#202020] text-[#E2DCC8] shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders size={13} /> Details
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
              {activeTab === 'elements' && (
                <>
                  {/* Footer Tokens */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Type size={12} /> Pagination & Footer Tokens
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={() => handleAddText('page')}
                        className="p-2.5 rounded bg-[#202020] hover:bg-[#282828] border border-[#333] text-left transition-all group"
                      >
                        <div className="text-xs font-bold text-white group-hover:text-[#E2DCC8]">Page Counter Token</div>
                        <div className="text-[10px] text-slate-400 font-mono">{"Page {{page}} of {{total_pages}}"}</div>
                      </button>
                      <button
                        onClick={() => handleAddText('disclaimer')}
                        className="p-2.5 rounded bg-[#202020] hover:bg-[#282828] border border-[#333] text-left transition-all group"
                      >
                        <div className="text-xs font-bold text-white group-hover:text-[#E2DCC8]">Confidentiality Notice</div>
                        <div className="text-[10px] text-slate-400">Proprietary & Legal text</div>
                      </button>
                      <button
                        onClick={() => handleAddText('website')}
                        className="p-2.5 rounded bg-[#202020] hover:bg-[#282828] border border-[#333] text-left transition-all group"
                      >
                        <div className="text-xs font-bold text-white group-hover:text-[#E2DCC8]">Website / URL Slot</div>
                        <div className="text-[10px] text-slate-400 font-mono">{"www.{{company_domain}}"}</div>
                      </button>
                    </div>
                  </div>

                  {/* Accents & Lines */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <ImageIcon size={12} /> Divider & Graphic Bars
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleAddShape('line')}
                        className="p-2.5 rounded bg-[#202020] hover:bg-[#282828] border border-[#333] flex flex-col items-center justify-center gap-1.5 transition-all text-center"
                      >
                        <div className="w-6 h-0.5 bg-slate-300 rounded" />
                        <span className="text-[11px] font-bold text-slate-200">Divider Rule</span>
                      </button>
                      <button
                        onClick={() => handleAddShape('rectangle')}
                        className="p-2.5 rounded bg-[#202020] hover:bg-[#282828] border border-[#333] flex flex-col items-center justify-center gap-1.5 transition-all text-center"
                      >
                        <div className="w-5 h-3 bg-[#0F3D3E] border border-[#E2DCC8]/30 rounded" />
                        <span className="text-[11px] font-bold text-slate-200">Color Bar</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'templates' && (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Choose a preset footer blueprint:
                  </p>
                  <div className="space-y-2">
                    {FOOTER_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={tmpl.id || idx}
                        onClick={() => handleApplyPreset(tmpl)}
                        className="w-full p-3 rounded bg-[#202020] hover:bg-[#282828] border border-[#333] hover:border-[#E2DCC8]/50 text-left transition-all group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white group-hover:text-[#E2DCC8]">
                            {tmpl.name}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#121212] text-slate-400">
                            {tmpl.height}px
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                          {tmpl.elements.length} components included
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={templateName}
                      onChange={e => setTemplateName(e.target.value)}
                      placeholder="e.g. Minimalist Pagination Footer"
                      className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded text-xs font-medium text-white outline-none focus:border-[#0F3D3E]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Category
                    </label>
                    <select
                      value={templateCategory}
                      onChange={e => setTemplateCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded text-xs font-medium text-white outline-none focus:border-[#0F3D3E]"
                    >
                      <option value="General">General</option>
                      <option value="Corporate">Corporate & Professional</option>
                      <option value="Minimalist">Minimalist</option>
                      <option value="Modern Tech">Modern Tech</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={templateDescription}
                      onChange={e => setTemplateDescription(e.target.value)}
                      className="w-full px-3 py-2 bg-[#121212] border border-[#333] rounded text-xs font-medium text-white outline-none focus:border-[#0F3D3E] resize-none"
                    />
                  </div>

                  <div className="pt-2 border-t border-[#262626] flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">Publish Status</span>
                    <button
                      onClick={() => setIsActive(!isActive)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all ${
                        isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700/30 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {isActive ? <Check size={12} /> : null}
                      {isActive ? 'Active (Live)' : 'Draft Mode'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CENTER INTERACTIVE CANVAS WORKSPACE */}
          <div className="flex-1 bg-[#0e0e0e] flex flex-col overflow-hidden">
            {/* Top Canvas Bar (Dimensions, Zoom & Sliders) */}
            <div className="px-6 py-2.5 bg-[#161616] border-b border-[#262626] flex items-center justify-between gap-4 text-xs font-medium shrink-0">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Footer Height:</span>
                  <input
                    type="range"
                    min="40"
                    max="160"
                    value={footerHeight}
                    onChange={e => setFooterHeight(Number(e.target.value))}
                    className="w-28 accent-cyan-500"
                  />
                  <span className="font-mono text-[11px] text-cyan-300 font-bold">{Math.round(footerHeight)}px</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Side Margins:</span>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    value={sideMargin}
                    onChange={e => setSideMargin(Number(e.target.value))}
                    className="w-24 accent-cyan-500"
                  />
                  <span className="font-mono text-[11px] text-cyan-300 font-bold">{sideMargin}px</span>
                </div>
              </div>

              {/* Center Zoom Controls */}
              <div className="flex items-center gap-2 bg-[#121212] px-3 py-1 rounded border border-[#2a2a2a]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">Workspace Zoom:</span>
                <button
                  onClick={() => setZoom(prev => Math.max(0.8, Number((prev - 0.2).toFixed(2))))}
                  className="p-1 text-slate-300 hover:text-white hover:bg-[#202020] rounded transition-all"
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <span className="font-mono text-xs font-bold text-cyan-300 w-12 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom(prev => Math.min(2.5, Number((prev + 0.2).toFixed(2))))}
                  className="p-1 text-slate-300 hover:text-white hover:bg-[#202020] rounded transition-all"
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
                <div className="flex items-center gap-1 ml-1 border-l border-[#2a2a2a] pl-2">
                  <button
                    onClick={() => setZoom(1.0)}
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border transition-all ${
                      zoom === 1.0 ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50' : 'bg-[#202020] text-slate-400 hover:text-white border-[#333]'
                    }`}
                  >
                    100%
                  </button>
                  <button
                    onClick={() => setZoom(1.4)}
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border transition-all ${
                      zoom === 1.4 ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50' : 'bg-[#202020] text-slate-400 hover:text-white border-[#333]'
                    }`}
                  >
                    140%
                  </button>
                  <button
                    onClick={() => setZoom(1.8)}
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border transition-all ${
                      zoom === 1.8 ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50' : 'bg-[#202020] text-slate-400 hover:text-white border-[#333]'
                    }`}
                  >
                    180%
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                <span>Page Width: {PAGE_WIDTH}px</span>
                <span>•</span>
                <span>Components: {elements.length}</span>
              </div>
            </div>

            {/* Canvas Container with Scaled Zoom Workspace */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-12 bg-[#0a0a0a]">
              <div
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.15s ease-out'
                }}
                className="flex flex-col items-center gap-3 shrink-0 my-auto"
              >
                <div className="flex items-center justify-between w-full px-1 text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">
                  <span>Standard A4 Footer Space (Print Boundary)</span>
                  <span>Width: {PAGE_WIDTH}px • Height: {Math.round(footerHeight)}px</span>
                </div>

                {/* THE FOOTER CANVAS CONTAINER */}
                <div
                  style={{
                    width: `${PAGE_WIDTH}px`,
                    height: `${footerHeight}px`,
                    backgroundColor: backgroundColor
                  }}
                  onClick={() => setSelectedId(null)}
                  className="relative rounded shadow-2xl border-2 border-[#333] transition-all overflow-hidden cursor-default select-none"
                >
                  {/* Side Margin Guides */}
                  <div
                    style={{ left: `${sideMargin}px` }}
                    className="absolute top-0 bottom-0 w-px border-l border-dashed border-cyan-500/40 pointer-events-none z-0"
                  />
                  <div
                    style={{ right: `${sideMargin}px` }}
                    className="absolute top-0 bottom-0 w-px border-r border-dashed border-cyan-500/40 pointer-events-none z-0"
                  />

                  {/* Render Canvas Elements */}
                  {elements.map(el => {
                    const isSelected = el.id === selectedId;

                    return (
                      <div
                        key={el.id}
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedId(el.id);
                        }}
                        style={{
                          position: 'absolute',
                          left: `${el.x}px`,
                          top: `${el.y}px`,
                          width: `${el.width}px`,
                          height: el.height ? `${el.height}px` : 'auto',
                          zIndex: el.zIndex || 10,
                          transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                          opacity: el.opacity ?? 1
                        }}
                        className={`group cursor-move transition-shadow ${
                          isSelected ? 'ring-2 ring-cyan-500 ring-offset-1 ring-offset-transparent' : 'hover:ring-1 hover:ring-cyan-400/50'
                        }`}
                      >
                        {el.type === 'text' && (
                          <div
                            style={{
                              fontFamily: el.fontFamily || 'Inter',
                              fontSize: `${el.fontSize || 10}px`,
                              fontWeight: el.fontWeight || 'normal',
                              textAlign: el.textAlign || 'left',
                              color: el.fill || '#64748b',
                              lineHeight: 1.2
                            }}
                            className="w-full h-full flex items-center overflow-hidden whitespace-nowrap"
                          >
                            {el.text}
                          </div>
                        )}

                        {el.type === 'shape' && (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              backgroundColor: el.fill || '#e2e8f0',
                              borderRadius: el.shapeType === 'circle' ? '50%' : '2px'
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PROPERTY INSPECTOR */}
          <div className="w-80 bg-[#181818] border-l border-[#262626] flex flex-col shrink-0">
            <div className="p-4 border-b border-[#262626] flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-white">Element Inspector</span>
              {selectedElement && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleDuplicateSelected}
                    className="p-1.5 rounded bg-[#242424] hover:bg-[#2c2c2c] text-slate-300 transition-all"
                    title="Duplicate Element"
                  >
                    <Copy size={13} />
                  </button>
                  <button
                    onClick={handleDeleteSelected}
                    className="p-1.5 rounded bg-red-950/40 hover:bg-red-900/60 text-red-300 transition-all"
                    title="Delete Element"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {selectedElement ? (
                <>
                  {/* Position & Size */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Position & Dimensions</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[9px] text-slate-500 font-mono">X Pos</span>
                        <input
                          type="number"
                          value={selectedElement.x}
                          onChange={e => handleUpdateSelected({ x: Number(e.target.value) })}
                          className="w-full px-2 py-1.5 bg-[#121212] border border-[#333] rounded text-xs text-white"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 font-mono">Y Pos</span>
                        <input
                          type="number"
                          value={selectedElement.y}
                          onChange={e => handleUpdateSelected({ y: Number(e.target.value) })}
                          className="w-full px-2 py-1.5 bg-[#121212] border border-[#333] rounded text-xs text-white"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 font-mono">Width</span>
                        <input
                          type="number"
                          value={selectedElement.width}
                          onChange={e => handleUpdateSelected({ width: Number(e.target.value) })}
                          className="w-full px-2 py-1.5 bg-[#121212] border border-[#333] rounded text-xs text-white"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 font-mono">Height</span>
                        <input
                          type="number"
                          value={selectedElement.height || 20}
                          onChange={e => handleUpdateSelected({ height: Number(e.target.value) })}
                          className="w-full px-2 py-1.5 bg-[#121212] border border-[#333] rounded text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Text-Specific Properties */}
                  {selectedElement.type === 'text' && (
                    <div className="space-y-3 pt-3 border-t border-[#262626]">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Text Content</label>
                        <input
                          type="text"
                          value={selectedElement.text || ''}
                          onChange={e => handleUpdateSelected({ text: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-[#121212] border border-[#333] rounded text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Font Family</label>
                        <select
                          value={selectedElement.fontFamily || 'Inter'}
                          onChange={e => handleUpdateSelected({ fontFamily: e.target.value })}
                          className="w-full px-2.5 py-1.5 bg-[#121212] border border-[#333] rounded text-xs text-white"
                        >
                          {FONTS.map(f => (
                            <option key={f} value={f}>{f}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[9px] text-slate-500">Size</span>
                          <input
                            type="number"
                            min="6"
                            max="36"
                            value={selectedElement.fontSize || 10}
                            onChange={e => handleUpdateSelected({ fontSize: Number(e.target.value) })}
                            className="w-full px-2 py-1.5 bg-[#121212] border border-[#333] rounded text-xs text-white"
                          />
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500">Weight</span>
                          <select
                            value={selectedElement.fontWeight || 'normal'}
                            onChange={e => handleUpdateSelected({ fontWeight: e.target.value as any })}
                            className="w-full px-2 py-1.5 bg-[#121212] border border-[#333] rounded text-xs text-white"
                          >
                            <option value="normal">Normal</option>
                            <option value="600">Semi Bold</option>
                            <option value="bold">Bold</option>
                          </select>
                        </div>
                      </div>

                      {/* Alignments */}
                      <div>
                        <span className="text-[9px] text-slate-500 block mb-1">Alignment</span>
                        <div className="flex rounded bg-[#121212] p-0.5 border border-[#333]">
                          {(['left', 'center', 'right'] as const).map(align => (
                            <button
                              key={align}
                              onClick={() => handleUpdateSelected({ textAlign: align })}
                              className={`flex-1 py-1 flex items-center justify-center rounded ${
                                selectedElement.textAlign === align ? 'bg-[#0F3D3E] text-white' : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {align === 'left' && <AlignLeft size={13} />}
                              {align === 'center' && <AlignCenter size={13} />}
                              {align === 'right' && <AlignRight size={13} />}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Color Picker */}
                      <div>
                        <span className="text-[9px] text-slate-500 block mb-1">Text Color</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={selectedElement.fill || '#64748b'}
                            onChange={e => handleUpdateSelected({ fill: e.target.value })}
                            className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                          />
                          <input
                            type="text"
                            value={selectedElement.fill || '#64748b'}
                            onChange={e => handleUpdateSelected({ fill: e.target.value })}
                            className="flex-1 px-2 py-1 bg-[#121212] border border-[#333] rounded text-xs font-mono text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Shape Properties */}
                  {selectedElement.type === 'shape' && (
                    <div className="space-y-3 pt-3 border-t border-[#262626]">
                      <div>
                        <span className="text-[9px] text-slate-500 block mb-1">Shape Fill Color</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={selectedElement.fill || '#e2e8f0'}
                            onChange={e => handleUpdateSelected({ fill: e.target.value })}
                            className="w-8 h-8 rounded border-none cursor-pointer bg-transparent"
                          />
                          <input
                            type="text"
                            value={selectedElement.fill || '#e2e8f0'}
                            onChange={e => handleUpdateSelected({ fill: e.target.value })}
                            className="flex-1 px-2 py-1 bg-[#121212] border border-[#333] rounded text-xs font-mono text-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-16 text-center text-slate-500 space-y-2">
                  <Info size={24} className="mx-auto text-slate-600" />
                  <p className="text-xs">Select any footer component on the canvas to inspect and edit its styles.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    );
};

export default AdminFooterDesignerModal;
