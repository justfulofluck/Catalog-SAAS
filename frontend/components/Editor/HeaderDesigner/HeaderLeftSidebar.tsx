import React from 'react';
import {
  Type, Square, Image as ImageIcon, Palette, Sparkles, Layers,
  Plus, Tag, Upload, Trash2
} from 'lucide-react';
import { CanvasElement, ShapeType } from '../../../types';
import { HEADER_SHAPES, PRESET_HEADER_THEMES, toMm } from './constants';
import AdvancedColorPicker from '../../Properties/AdvancedColorPicker';
import { HeaderLayersPanel } from './HeaderLayersPanel';

interface HeaderLeftSidebarProps {
  isDark: boolean;
  activeTab: 'text' | 'shapes' | 'media' | 'background' | 'presets' | 'layers';
  setActiveTab: (tab: 'text' | 'shapes' | 'media' | 'background' | 'presets' | 'layers') => void;
  addTextElement: (initialText?: string, fontSize?: number, fontWeight?: string, isTag?: boolean) => void;
  addShapeElement: (shapeType: ShapeType) => void;
  addImageLogo: (url: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  mediaItems: any[];
  headerBg: string;
  setHeaderBg: (bg: string) => void;
  colorPickerTarget: 'bg' | 'element';
  setColorPickerTarget: (target: 'bg' | 'element') => void;
  showColorPicker: boolean;
  setShowColorPicker: (show: boolean) => void;
  category: string;
  setCategory: (cat: string) => void;
  systemTemplates: any[];
  setTemplateName: (name: string) => void;
  setDescription: (desc: string) => void;
  setHeaderHeight: (h: number) => void;
  setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>;
  setSelectedId: (id: string | null) => void;
  deleteSystemTemplate: (id: string) => void;
  // Layers panel props
  elements: CanvasElement[];
  selectedId: string | null;
  moveForward: (id: string) => void;
  moveBackward: (id: string) => void;
  duplicateElementLocal: (id: string) => void;
  deleteElementLocal: (id: string) => void;
  reorderLayer: (draggedId: string, targetId: string) => void;
  pushHistory: () => void;
}

export const HeaderLeftSidebar: React.FC<HeaderLeftSidebarProps> = ({
  isDark,
  activeTab,
  setActiveTab,
  addTextElement,
  addShapeElement,
  addImageLogo,
  fileInputRef,
  handleFileUpload,
  mediaItems,
  headerBg,
  setHeaderBg,
  colorPickerTarget,
  setColorPickerTarget,
  showColorPicker,
  setShowColorPicker,
  category,
  setCategory,
  systemTemplates,
  setTemplateName,
  setDescription,
  setHeaderHeight,
  setElements,
  setSelectedId,
  deleteSystemTemplate,
  elements,
  selectedId,
  moveForward,
  moveBackward,
  duplicateElementLocal,
  deleteElementLocal,
  reorderLayer,
  pushHistory,
}) => {
  return (
    <div className={`w-80 border-r flex flex-col shrink-0 transition-colors ${
      isDark ? 'bg-[#141416] border-[#262626]' : 'bg-white border-slate-200'
    }`}>
      {/* Sidebar Tab Selector */}
      <div className={`grid grid-cols-6 p-2 gap-1 border-b transition-colors ${
        isDark ? 'border-[#262626] bg-[#101012]' : 'border-slate-200 bg-slate-50'
      }`}>
        {[
          { id: 'text', label: 'Text', icon: Type },
          { id: 'shapes', label: 'Shapes', icon: Square },
          { id: 'media', label: 'Logos', icon: ImageIcon },
          { id: 'background', label: 'Theme', icon: Palette },
          { id: 'presets', label: 'Presets', icon: Sparkles },
          { id: 'layers', label: 'Layers', icon: Layers },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center justify-center py-2 rounded-[4px] text-[10px] font-bold transition-all ${
                isActive
                  ? 'bg-[#0F3D3E] text-white shadow'
                  : isDark
                    ? 'text-[#888888] hover:text-white hover:bg-[#1a1a1c]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Icon size={14} className="mb-1" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* TAB 1: TEXT & SMART DYNAMIC TAGS */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <div>
              <h4 className={`text-xs font-black uppercase tracking-wider mb-1 ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>
                Standard Text Elements
              </h4>
              <p className={`text-[11px] mb-3 ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>
                Add standard typography to your header.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => addTextElement('CATALOG HEADER', 18, 'bold')}
                  className={`p-3 border rounded-[6px] text-left transition-all group ${
                    isDark
                      ? 'bg-[#1a1a1c] hover:bg-[#222226] border-[#2a2a2e] hover:border-[#E2DCC8]/40'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-[#0F3D3E]/40'
                  }`}
                >
                  <span className={`block text-sm font-bold ${isDark ? 'text-white group-hover:text-[#E2DCC8]' : 'text-slate-900 group-hover:text-[#0F3D3E]'}`}>Headline</span>
                  <span className={`text-[10px] ${isDark ? 'text-[#777]' : 'text-slate-500'}`}>Bold title (18px)</span>
                </button>

                <button
                  onClick={() => addTextElement('Subheading Text', 12, '600')}
                  className={`p-3 border rounded-[6px] text-left transition-all group ${
                    isDark
                      ? 'bg-[#1a1a1c] hover:bg-[#222226] border-[#2a2a2e] hover:border-[#E2DCC8]/40'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-[#0F3D3E]/40'
                  }`}
                >
                  <span className={`block text-sm font-semibold ${isDark ? 'text-white group-hover:text-[#E2DCC8]' : 'text-slate-900 group-hover:text-[#0F3D3E]'}`}>Subtitle</span>
                  <span className={`text-[10px] ${isDark ? 'text-[#777]' : 'text-slate-500'}`}>Medium (12px)</span>
                </button>

                <button
                  onClick={() => addTextElement('www.company.com', 10, 'normal')}
                  className={`p-3 border rounded-[6px] text-left transition-all group ${
                    isDark
                      ? 'bg-[#1a1a1c] hover:bg-[#222226] border-[#2a2a2e] hover:border-[#E2DCC8]/40'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-[#0F3D3E]/40'
                  }`}
                >
                  <span className={`block text-sm ${isDark ? 'text-slate-300 group-hover:text-[#E2DCC8]' : 'text-slate-700 group-hover:text-[#0F3D3E]'}`}>Caption / URL</span>
                  <span className={`text-[10px] ${isDark ? 'text-[#777]' : 'text-slate-500'}`}>Light spec (10px)</span>
                </button>

                <button
                  onClick={() => addTextElement('— EDITION 2026 —', 11, 'bold')}
                  className={`p-3 border rounded-[6px] text-left transition-all group ${
                    isDark
                      ? 'bg-[#1a1a1c] hover:bg-[#222226] border-[#2a2a2e] hover:border-[#E2DCC8]/40'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-[#0F3D3E]/40'
                  }`}
                >
                  <span className={`block text-sm font-bold tracking-widest ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>Decorated</span>
                  <span className={`text-[10px] ${isDark ? 'text-[#777]' : 'text-slate-500'}`}>Centered dash</span>
                </button>
              </div>
            </div>

            {/* Smart Dynamic Tags Group */}
            <div className={`pt-2 border-t ${isDark ? 'border-[#262626]' : 'border-slate-200'}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Tag size={13} className={isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'} />
                <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>
                  Smart Dynamic Tags
                </h4>
              </div>
              <p className={`text-[11px] mb-3 ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>
                These tags auto-replace with each catalog's name, current page, and category!
              </p>

              <div className="space-y-1.5">
                {[
                  { tag: '{{catalog_name}}', label: 'Catalog Title', desc: 'Auto replaces with catalog name' },
                  { tag: '{{category_name}}', label: 'Category Name', desc: 'Current page category name' },
                  { tag: '{{page_number}}', label: 'Current Page #', desc: 'Dynamic running page number' },
                  { tag: '{{total_pages}}', label: 'Total Pages Count', desc: 'Total catalog page count' },
                  { tag: '{{company_name}}', label: 'Company / Brand', desc: 'Store owner / company name' },
                  { tag: '{{current_year}}', label: 'Current Year', desc: 'e.g. 2026' }
                ].map(item => (
                  <button
                    key={item.tag}
                    onClick={() => addTextElement(item.tag, 11, '600', true)}
                    className={`w-full p-2.5 border rounded-[6px] flex items-center justify-between transition-all group text-left ${
                      isDark
                        ? 'bg-[#1a1a1c] hover:bg-[#222226] border-[#2a2a2e] hover:border-[#E2DCC8]/40'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-[#0F3D3E]/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${isDark ? 'text-white group-hover:text-[#E2DCC8]' : 'text-slate-900 group-hover:text-[#0F3D3E]'}`}>{item.label}</span>
                        <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded border ${
                          isDark
                            ? 'bg-[#0F3D3E]/30 text-[#E2DCC8] border-[#E2DCC8]/20'
                            : 'bg-[#0F3D3E]/10 text-[#0F3D3E] border-[#0F3D3E]/30'
                        }`}>
                          {item.tag}
                        </span>
                      </div>
                      <p className={`text-[10px] mt-0.5 ${isDark ? 'text-[#777]' : 'text-slate-500'}`}>{item.desc}</p>
                    </div>
                    <Plus size={14} className={isDark ? 'text-[#888] group-hover:text-white' : 'text-slate-400 group-hover:text-slate-900'} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SHAPES & GEOMETRIC ELEMENTS */}
        {activeTab === 'shapes' && (
          <div className="space-y-4">
            <div>
              <h4 className={`text-xs font-black uppercase tracking-wider mb-1 ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>
                Geometric Shapes
              </h4>
              <p className={`text-[11px] mb-3 ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>
                Click to add shapes, badges, icons, and dividers to your header.
              </p>

              <div className="grid grid-cols-2 gap-2">
                {HEADER_SHAPES.map((shape) => (
                  <button
                    key={shape.type}
                    onClick={() => addShapeElement(shape.type)}
                    className={`p-3 border rounded-[6px] flex flex-col items-center justify-center gap-2 transition-all group shadow-sm ${
                      isDark
                        ? 'bg-[#1a1a1c] hover:bg-[#252528] border-[#2a2a2e] hover:border-[#E2DCC8]/40 hover:shadow-cyan-950/20'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-[#0F3D3E]/40 hover:shadow-slate-200'
                    }`}
                    title={`Add ${shape.label} shape`}
                  >
                    <div className={`w-9 h-9 rounded border flex items-center justify-center transition-colors ${
                      isDark
                        ? 'bg-[#121214] border-[#2e2e32] group-hover:border-[#E2DCC8]/50 text-[#E2DCC8]'
                        : 'bg-white border-slate-300 group-hover:border-[#0F3D3E]/50 text-[#0F3D3E]'
                    }`}>
                      {shape.icon}
                    </div>
                    <span className={`text-[10px] font-bold transition-colors ${
                      isDark ? 'text-slate-300 group-hover:text-white' : 'text-slate-700 group-hover:text-slate-900'
                    }`}>
                      {shape.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: LOGOS & MEDIA */}
        {activeTab === 'media' && (
          <div className="space-y-4">
            <div>
              <h4 className={`text-xs font-black uppercase tracking-wider mb-1 ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>
                Upload Brand Logo
              </h4>
              <p className={`text-[11px] mb-3 ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>
                Insert your company or brand logo directly into the header.
              </p>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-[6px] text-xs font-bold transition-all shadow-sm ${
                  isDark
                    ? 'bg-gradient-to-r from-[#0F3D3E]/30 to-[#100F0F] hover:bg-[#0F3D3E]/50 border border-[#E2DCC8]/40 text-[#E2DCC8]'
                    : 'bg-gradient-to-r from-[#0F3D3E]/10 to-slate-100 hover:bg-[#0F3D3E]/20 border border-[#0F3D3E]/30 text-[#0F3D3E]'
                }`}
              >
                <Upload size={15} />
                <span>Upload Logo Image</span>
              </button>
            </div>

            {/* Uploaded Media from store */}
            <div className={`pt-2 border-t ${isDark ? 'border-[#262626]' : 'border-slate-200'}`}>
              <h4 className={`text-xs font-black uppercase tracking-wider mb-1 ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>
                From Media Library
              </h4>
              <p className={`text-[10px] mb-2 ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>
                Click any uploaded image to place it on the header.
              </p>

              {mediaItems && mediaItems.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1 custom-scrollbar">
                  {mediaItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => addImageLogo(item.url)}
                      className={`aspect-video border rounded cursor-pointer overflow-hidden p-1 flex items-center justify-center transition-all group ${
                        isDark
                          ? 'bg-[#18181a] border-[#2a2a2e] hover:border-[#E2DCC8]'
                          : 'bg-slate-50 border-slate-200 hover:border-[#0F3D3E]'
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={item.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`p-4 rounded-[6px] border border-dashed text-center ${
                  isDark ? 'border-[#333] text-[#888]' : 'border-slate-300 text-slate-500'
                }`}>
                  <ImageIcon size={20} className={`mx-auto mb-1 ${isDark ? 'text-[#666]' : 'text-slate-400'}`} />
                  <p className="text-[11px]">No media assets yet.</p>
                  <p className={`text-[9px] ${isDark ? 'text-[#666]' : 'text-slate-400'}`}>Upload your logo above.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: HEADER BACKGROUND & THEME */}
        {activeTab === 'background' && (
          <div className="space-y-4">
            <div>
              <h4 className={`text-xs font-black uppercase tracking-wider mb-1 ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>
                Header Strip Background
              </h4>
              <p className={`text-[11px] mb-3 ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>
                Solid color or linear gradient across the header strip.
              </p>

              {/* Current Background Preview */}
              <div
                onClick={() => {
                  setColorPickerTarget('bg');
                  setShowColorPicker(true);
                }}
                className={`p-3 rounded-[6px] border cursor-pointer transition-all flex items-center justify-between mb-3 ${
                  isDark ? 'border-[#38383c] hover:border-[#E2DCC8]' : 'border-slate-300 hover:border-[#0F3D3E]'
                }`}
                style={{ background: headerBg }}
              >
                <span className="text-xs font-black px-2 py-1 bg-black/60 rounded text-white shadow">
                  Current Background
                </span>
                <Palette size={16} className="text-white drop-shadow" />
              </div>

              {/* Palette Swatches */}
              <div className="grid grid-cols-5 gap-2 mb-3">
                {[
                  '#ffffff', '#0f172a', '#081c1c', '#18181b', '#f8fafc',
                  'linear-gradient(90deg, #0f172a, #1e293b)',
                  'linear-gradient(90deg, #081c1c, #0f3d3e)',
                  'linear-gradient(90deg, #4f46e5, #06b6d4)',
                  'linear-gradient(90deg, #111827, #374151)',
                  'linear-gradient(90deg, #312e81, #1e1b4b)'
                ].map((bg, idx) => (
                  <button
                    key={idx}
                    onClick={() => setHeaderBg(bg)}
                    className="h-7 rounded-[4px] border border-white/20 hover:scale-105 transition-all shadow-sm"
                    style={{ background: bg }}
                    title={bg}
                  />
                ))}
              </div>

              {/* Advanced Color Picker Trigger */}
              <button
                onClick={() => {
                  setColorPickerTarget('bg');
                  setShowColorPicker(!showColorPicker);
                }}
                className={`w-full py-2 border rounded-[6px] text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  isDark
                    ? 'bg-[#1a1a1c] hover:bg-[#242428] border-[#333] text-[#E2DCC8]'
                    : 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-[#0F3D3E]'
                }`}
              >
                <Palette size={14} />
                <span>{showColorPicker ? 'Hide Color Studio' : 'Open Color & Gradient Studio'}</span>
              </button>

              {showColorPicker && colorPickerTarget === 'bg' && (
                <div className={`p-3 border rounded-[6px] mt-2 animate-in fade-in ${
                  isDark ? 'bg-[#18181a] border-[#333]' : 'bg-slate-50 border-slate-300'
                }`}>
                  <AdvancedColorPicker
                    color={headerBg}
                    onChange={(newColor) => setHeaderBg(newColor)}
                  />
                </div>
              )}
            </div>

            <div className={`pt-2 border-t ${isDark ? 'border-[#262626]' : 'border-slate-200'}`}>
              <h4 className={`text-xs font-black uppercase tracking-wider mb-1 ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>
                Category Tag
              </h4>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full border text-xs p-2 rounded-[4px] outline-none transition-colors ${
                  isDark
                    ? 'bg-[#18181a] border-[#2a2a2e] focus:border-[#E2DCC8] text-white placeholder:text-gray-500'
                    : 'bg-white border-slate-300 focus:border-[#0F3D3E] text-slate-900 placeholder:text-slate-400'
                }`}
                placeholder="e.g. Corporate, Luxury, Industrial"
              />
            </div>
          </div>
        )}

        {/* TAB 5: PRESETS / STARTERS & SAVED THEMES */}
        {activeTab === 'presets' && (
          <div className="space-y-4">
            {/* Saved User Themes */}
            {(() => {
              const savedHeaders = systemTemplates.filter(st => st.is_active && st.type === 'header');
              if (savedHeaders.length === 0) return null;

              return (
                <div className={`space-y-2.5 pb-3 border-b ${isDark ? 'border-[#28282c]' : 'border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <h4 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>
                      <Sparkles size={12} className={isDark ? 'text-cyan-400' : 'text-[#0F3D3E]'} />
                      <span>My Saved Header Themes</span>
                    </h4>
                    <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-300 dark:border-cyan-800/40">
                      {savedHeaders.length} Saved
                    </span>
                  </div>
                  <p className={`text-[11px] ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>
                    Themes you saved to database. Click to load into studio.
                  </p>

                  <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar p-0.5">
                    {savedHeaders.map(tmpl => {
                      const pData = tmpl.pages_data?.[0];
                      const bg = pData?.backgroundColor || '#ffffff';
                      const h = pData?.height || 113.4;

                      return (
                        <div
                          key={`saved-${tmpl.id || tmpl.uuid}`}
                          onClick={() => {
                            setTemplateName(tmpl.name);
                            setCategory(tmpl.category || 'General');
                            setDescription(tmpl.description || '');
                            if (pData) {
                              setHeaderHeight(h);
                              setHeaderBg(bg);
                              setElements(JSON.parse(JSON.stringify(pData.elements || [])));
                            }
                            setSelectedId(null);
                          }}
                          className={`p-2.5 rounded-[6px] cursor-pointer transition-all group relative border ${
                            isDark
                              ? 'bg-[#17171a] hover:bg-[#202025] border-cyan-900/40 hover:border-cyan-500'
                              : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-cyan-600 shadow-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-bold truncate max-w-[150px] ${
                              isDark ? 'text-white group-hover:text-cyan-300' : 'text-slate-900 group-hover:text-cyan-700'
                            }`}>
                              {tmpl.name}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                                isDark ? 'bg-cyan-950/80 text-cyan-400' : 'bg-cyan-50 text-cyan-700'
                              }`}>
                                {toMm(h)}mm
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm(`Delete saved header theme "${tmpl.name}"?`)) {
                                    deleteSystemTemplate(tmpl.id || tmpl.uuid);
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded transition-all"
                                title="Delete this saved theme"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                          </div>

                          {/* Preview Mini Strip */}
                          <div
                            className="w-full h-7 rounded border border-black/10 my-1 flex items-center justify-between px-2.5 text-[9px] font-mono truncate"
                            style={{ background: bg }}
                          >
                            <span className={bg === '#ffffff' || bg === '#fafafa' ? 'text-slate-800 font-bold' : 'text-white font-bold'}>
                              {tmpl.name.toUpperCase()}
                            </span>
                            <span className="text-[8px] text-slate-500">
                              {pData?.elements?.length || 0} items
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Built-in Preset Themes */}
            <div>
              <h4 className={`text-xs font-black uppercase tracking-wider mb-1 ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>
                Curated Preset Themes
              </h4>
              <p className={`text-[11px] mb-3 ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>
                Start with a professionally crafted header layout.
              </p>

              <div className="space-y-2">
                {PRESET_HEADER_THEMES.map(preset => (
                  <div
                    key={preset.id}
                    onClick={() => {
                      setTemplateName(preset.name);
                      setCategory(preset.category);
                      setHeaderHeight(preset.height);
                      setHeaderBg(preset.backgroundColor);
                      setElements(JSON.parse(JSON.stringify(preset.elements)));
                      setSelectedId(null);
                    }}
                    className={`p-3 rounded-[6px] cursor-pointer transition-all border group ${
                      isDark
                        ? 'bg-[#18181b] hover:bg-[#202024] border-[#2e2e32] hover:border-[#E2DCC8]'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-[#0F3D3E]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs font-bold ${isDark ? 'text-white group-hover:text-[#E2DCC8]' : 'text-slate-900 group-hover:text-[#0F3D3E]'}`}>
                        {preset.name}
                      </span>
                      <span className={`text-[10px] font-mono font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {toMm(preset.height)}mm
                      </span>
                    </div>

                    {/* Preview Mini Strip */}
                    <div
                      className="w-full h-8 rounded border border-black/10 flex items-center justify-between px-3 text-[10px] font-mono truncate shadow-inner"
                      style={{ background: preset.backgroundColor }}
                    >
                      <span className={preset.backgroundColor === '#ffffff' || preset.backgroundColor === '#fafafa' ? 'text-slate-900 font-bold' : 'text-white font-bold'}>
                        {preset.category.toUpperCase()}
                      </span>
                      <span className="text-[9px] opacity-70">
                        {preset.elements.length} Elements
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: LAYERS PANEL */}
        {activeTab === 'layers' && (
          <HeaderLayersPanel
            elements={elements}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            isDark={isDark}
            moveForward={moveForward}
            moveBackward={moveBackward}
            duplicateElementLocal={duplicateElementLocal}
            deleteElementLocal={deleteElementLocal}
            reorderLayer={reorderLayer}
            setElements={setElements}
            pushHistory={pushHistory}
          />
        )}
      </div>
    </div>
  );
};
