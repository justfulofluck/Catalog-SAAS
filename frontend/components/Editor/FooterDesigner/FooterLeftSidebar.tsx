import React from 'react';
import {
  Type, Square, Image as ImageIcon, Palette, Sparkles, Layers,
  Plus, Tag, Upload, Trash2
} from 'lucide-react';
import { CanvasElement, ShapeType } from '../../../types';
import { FOOTER_SHAPES, PRESET_FOOTER_THEMES, toMm } from './constants';
import AdvancedColorPicker from '../../Properties/AdvancedColorPicker';
import { FooterLayersPanel } from './FooterLayersPanel';

interface FooterLeftSidebarProps {
  isDark: boolean;
  activeTab: 'text' | 'shapes' | 'media' | 'background' | 'presets' | 'layers';
  setActiveTab: (tab: 'text' | 'shapes' | 'media' | 'background' | 'presets' | 'layers') => void;
  addTextElement: (initialText?: string, fontSize?: number, fontWeight?: string, isTag?: boolean) => void;
  addShapeElement: (shapeType: ShapeType) => void;
  addImageLogo: (url: string) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  mediaItems: any[];
  footerBg: string;
  setFooterBg: (bg: string) => void;
  colorPickerTarget: 'bg' | 'element';
  setColorPickerTarget: (target: 'bg' | 'element') => void;
  showColorPicker: boolean;
  setShowColorPicker: (show: boolean) => void;
  category: string;
  setCategory: (cat: string) => void;
  systemTemplates: any[];
  setTemplateName: (name: string) => void;
  setDescription: (desc: string) => void;
  setFooterHeight: (h: number) => void;
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

export const FooterLeftSidebar: React.FC<FooterLeftSidebarProps> = ({
  isDark,
  activeTab,
  setActiveTab,
  addTextElement,
  addShapeElement,
  addImageLogo,
  fileInputRef,
  handleFileUpload,
  mediaItems,
  footerBg,
  setFooterBg,
  colorPickerTarget,
  setColorPickerTarget,
  showColorPicker,
  setShowColorPicker,
  category,
  setCategory,
  systemTemplates,
  setTemplateName,
  setDescription,
  setFooterHeight,
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
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-[4px] transition-all ${
                isActive
                  ? isDark
                    ? 'bg-[#0F3D3E] text-[#E2DCC8] shadow-sm font-bold border border-[#E2DCC8]/30'
                    : 'bg-[#0F3D3E] text-white shadow-sm font-bold border border-[#0F3D3E]'
                  : isDark
                    ? 'text-[#888888] hover:text-white hover:bg-[#1a1a1c]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
              title={tab.label}
            >
              <Icon size={16} />
              <span className="text-[10px] mt-1">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sidebar Tab Panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {/* TAB 1: TEXT ELEMENTS */}
        {activeTab === 'text' && (
          <div className="space-y-4">
            <div>
              <h4 className={`text-xs font-black uppercase tracking-wider mb-1 ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>
                Standard Text
              </h4>
              <p className={`text-[11px] mb-3 ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>
                Add customizable text blocks with one click.
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => addTextElement('PAGE {{page_number}}', 12, 'bold')}
                  className={`w-full p-2.5 rounded-[6px] border flex items-center justify-between text-left transition-all group ${
                    isDark
                      ? 'bg-[#1a1a1c] hover:bg-[#252528] border-[#2a2a2e] hover:border-[#E2DCC8]/40'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-[#0F3D3E]/40'
                  }`}
                >
                  <div>
                    <div className={`text-xs font-black ${isDark ? 'text-white group-hover:text-[#E2DCC8]' : 'text-slate-900 group-hover:text-[#0F3D3E]'}`}>Page Counter</div>
                    <div className={`text-[10px] ${isDark ? 'text-[#888]' : 'text-slate-500'}`}>e.g. PAGE 1</div>
                  </div>
                  <Plus size={14} className={isDark ? 'text-[#888] group-hover:text-white' : 'text-slate-400 group-hover:text-slate-800'} />
                </button>

                <button
                  onClick={() => addTextElement('{{company_name}} • Confidential', 10, 'normal')}
                  className={`w-full p-2.5 rounded-[6px] border flex items-center justify-between text-left transition-all group ${
                    isDark
                      ? 'bg-[#1a1a1c] hover:bg-[#252528] border-[#2a2a2e] hover:border-[#E2DCC8]/40'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-[#0F3D3E]/40'
                  }`}
                >
                  <div>
                    <div className={`text-xs font-bold ${isDark ? 'text-white group-hover:text-[#E2DCC8]' : 'text-slate-900 group-hover:text-[#0F3D3E]'}`}>Confidentiality Notice</div>
                    <div className={`text-[10px] ${isDark ? 'text-[#888]' : 'text-slate-500'}`}>Company & Legal notice</div>
                  </div>
                  <Plus size={14} className={isDark ? 'text-[#888] group-hover:text-white' : 'text-slate-400 group-hover:text-slate-800'} />
                </button>

                <button
                  onClick={() => addTextElement('www.company.com  |  info@company.com', 9.5, '500')}
                  className={`w-full p-2.5 rounded-[6px] border flex items-center justify-between text-left transition-all group ${
                    isDark
                      ? 'bg-[#1a1a1c] hover:bg-[#252528] border-[#2a2a2e] hover:border-[#E2DCC8]/40'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-[#0F3D3E]/40'
                  }`}
                >
                  <div>
                    <div className={`text-xs font-medium ${isDark ? 'text-white group-hover:text-[#E2DCC8]' : 'text-slate-900 group-hover:text-[#0F3D3E]'}`}>Contact / Website URL</div>
                    <div className={`text-[10px] ${isDark ? 'text-[#888]' : 'text-slate-500'}`}>Email & Web address strip</div>
                  </div>
                  <Plus size={14} className={isDark ? 'text-[#888] group-hover:text-white' : 'text-slate-400 group-hover:text-slate-800'} />
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
                  { tag: '{{page_number}}', label: 'Current Page #', desc: 'Dynamic running page number' },
                  { tag: '{{total_pages}}', label: 'Total Pages Count', desc: 'Total catalog page count' },
                  { tag: '{{catalog_name}}', label: 'Catalog Title', desc: 'Auto replaces with catalog name' },
                  { tag: '{{category_name}}', label: 'Category Name', desc: 'Current page category name' },
                  { tag: '{{company_name}}', label: 'Company / Brand', desc: 'Store owner / company name' },
                  { tag: '{{current_year}}', label: 'Current Year', desc: 'e.g. 2026' }
                ].map(item => (
                  <button
                    key={item.tag}
                    onClick={() => addTextElement(item.tag, 10, '600', true)}
                    className={`w-full p-2.5 rounded-[6px] border flex items-center justify-between transition-all group text-left ${
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
                            : 'bg-[#0F3D3E]/10 text-[#0F3D3E] border-[#0F3D3E]/20'
                        }`}>
                          {item.tag}
                        </span>
                      </div>
                      <p className={`text-[10px] mt-0.5 ${isDark ? 'text-[#777]' : 'text-slate-500'}`}>{item.desc}</p>
                    </div>
                    <Plus size={14} className={isDark ? 'text-[#888] group-hover:text-white' : 'text-slate-400 group-hover:text-slate-800'} />
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
                Click to add shapes, badges, icons, and dividers to your footer.
              </p>

              <div className="grid grid-cols-2 gap-2">
                {FOOTER_SHAPES.map((shape) => (
                  <button
                    key={shape.type}
                    onClick={() => addShapeElement(shape.type)}
                    className={`p-3 rounded-[6px] border flex flex-col items-center justify-center gap-2 transition-all group shadow-sm ${
                      isDark
                        ? 'bg-[#1a1a1c] hover:bg-[#252528] border-[#2a2a2e] hover:border-[#E2DCC8]/40 hover:shadow-cyan-950/20'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-[#0F3D3E]/40 hover:shadow-slate-300'
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
                Logos & Brand Graphics
              </h4>
              <p className={`text-[11px] mb-3 ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>
                Upload your company logo, certification emblems, or QR codes into the footer.
              </p>

              {/* Upload button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/*"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-full py-3 px-4 border border-dashed rounded-[6px] flex flex-col items-center justify-center gap-1.5 transition-all group mb-4 ${
                  isDark
                    ? 'bg-[#1a1a1c] hover:bg-[#242428] border-[#38383c] hover:border-[#E2DCC8] text-[#E2DCC8]'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-300 hover:border-[#0F3D3E] text-[#0F3D3E]'
                }`}
              >
                <Upload size={18} className="group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Upload Custom Logo / Image</span>
                <span className={`text-[10px] ${isDark ? 'text-[#888]' : 'text-slate-500'}`}>PNG, SVG, or JPG supported</span>
              </button>

              {/* Existing Media Assets */}
              {mediaItems && mediaItems.length > 0 && (
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider mb-2 block ${isDark ? 'text-[#888]' : 'text-slate-500'}`}>
                    Media Library Assets
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {mediaItems.slice(0, 9).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => addImageLogo(item.url)}
                        className={`aspect-video border rounded p-1 cursor-pointer flex items-center justify-center group overflow-hidden transition-all ${
                          isDark
                            ? 'bg-[#121214] border-[#28282c] hover:border-[#E2DCC8]'
                            : 'bg-slate-50 border-slate-200 hover:border-[#0F3D3E]'
                        }`}
                        title="Add to Footer"
                      >
                        <img
                          src={item.url}
                          alt={item.name}
                          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: THEME / BACKGROUND */}
        {activeTab === 'background' && (
          <div className="space-y-4">
            <div>
              <h4 className={`text-xs font-black uppercase tracking-wider mb-1 ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>
                Footer Strip Background
              </h4>
              <p className={`text-[11px] mb-3 ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>
                Choose a solid color, rich gradient, or transparent overlay for the footer strip.
              </p>

              {/* Current background preview */}
              <div
                onClick={() => {
                  setColorPickerTarget('bg');
                  setShowColorPicker(!showColorPicker);
                }}
                className={`p-3 rounded-[6px] border cursor-pointer transition-all flex items-center justify-between mb-3 ${
                  isDark ? 'border-[#38383c] hover:border-[#E2DCC8]' : 'border-slate-300 hover:border-[#0F3D3E]'
                }`}
                style={{ background: footerBg }}
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
                    onClick={() => setFooterBg(bg)}
                    className="h-7 rounded-[4px] border border-black/10 dark:border-white/20 hover:scale-105 transition-all shadow-sm"
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
                className={`w-full py-2 border rounded-[6px] text-xs font-bold flex items-center justify-center gap-2 ${
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
                  isDark ? 'bg-[#18181a] border-[#333]' : 'bg-slate-50 border-slate-200 shadow-sm'
                }`}>
                  <AdvancedColorPicker
                    color={footerBg}
                    onChange={(newColor) => setFooterBg(newColor)}
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
                className={`w-full text-xs p-2 rounded-[4px] outline-none border ${
                  isDark
                    ? 'bg-[#18181a] border-[#2a2a2e] focus:border-[#E2DCC8] text-white'
                    : 'bg-white border-slate-300 focus:border-[#0F3D3E] text-slate-800'
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
              const savedFooters = systemTemplates.filter(st => st.is_active && st.type === 'footer');
              if (savedFooters.length === 0) return null;

              return (
                <div className={`space-y-2.5 pb-3 border-b ${isDark ? 'border-[#28282c]' : 'border-slate-200'}`}>
                  <div className="flex items-center justify-between">
                    <h4 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>
                      <Sparkles size={12} className="text-cyan-400" />
                      <span>My Saved Footer Themes</span>
                    </h4>
                    <span className={`text-[10px] font-bold ${isDark ? 'text-[#888]' : 'text-slate-500'}`}>{savedFooters.length}</span>
                  </div>

                  <div className="space-y-2">
                    {savedFooters.map((tmpl) => (
                      <div
                        key={tmpl.id}
                        className={`p-2.5 rounded-[6px] border transition-all flex items-center justify-between group ${
                          isDark
                            ? 'bg-[#18181a] hover:bg-[#202024] border-[#2a2a2e] hover:border-[#E2DCC8]/50'
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-[#0F3D3E]/50'
                        }`}
                      >
                        <div
                          onClick={() => {
                            const pageData = tmpl.pages_data?.[0] || {};
                            setTemplateName(tmpl.name);
                            setCategory(tmpl.category);
                            setFooterHeight(pageData.height || 75.6);
                            setFooterBg(pageData.backgroundColor || '#ffffff');
                            setElements(JSON.parse(JSON.stringify(pageData.elements || [])));
                            setSelectedId(null);
                          }}
                          className="cursor-pointer flex-1 min-w-0 pr-2"
                        >
                          <div className={`text-xs font-bold truncate ${isDark ? 'text-white group-hover:text-[#E2DCC8]' : 'text-slate-900 group-hover:text-[#0F3D3E]'}`}>
                            {tmpl.name}
                          </div>
                          <div className={`text-[10px] flex items-center gap-2 mt-0.5 ${isDark ? 'text-[#888]' : 'text-slate-500'}`}>
                            <span>{tmpl.category}</span>
                            <span>•</span>
                            <span>{Math.round((tmpl.pages_data?.[0]?.height || 75.6) / 3.78)}mm</span>
                          </div>
                        </div>

                        <button
                          onClick={async () => {
                            if (window.confirm(`Delete theme "${tmpl.name}"?`)) {
                              await deleteSystemTemplate(tmpl.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all rounded hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete saved footer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Built-in Preset Starters */}
            <div>
              <h4 className={`text-xs font-black uppercase tracking-wider mb-1 ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>
                Starter Templates
              </h4>
              <p className={`text-[11px] mb-3 ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>
                Quick-load professionally designed footer presets.
              </p>

              <div className="space-y-2">
                {PRESET_FOOTER_THEMES.map((preset) => (
                  <div
                    key={preset.id}
                    onClick={() => {
                      setTemplateName(preset.name);
                      setCategory(preset.category);
                      setDescription(preset.name);
                      setFooterHeight(preset.height);
                      setFooterBg(preset.backgroundColor);
                      setElements(JSON.parse(JSON.stringify(preset.elements)));
                      setSelectedId(null);
                    }}
                    className={`p-3 rounded-[6px] border cursor-pointer transition-all group ${
                      isDark
                        ? 'bg-[#18181a] hover:bg-[#202024] border-[#2a2a2e] hover:border-[#E2DCC8]/50'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-[#0F3D3E]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isDark ? 'text-white group-hover:text-[#E2DCC8]' : 'text-slate-900 group-hover:text-[#0F3D3E]'}`}>
                        {preset.name}
                      </span>
                      <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-mono ${
                        isDark ? 'bg-[#222] text-[#888]' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {preset.category}
                      </span>
                    </div>
                    <div className={`text-[10px] flex items-center gap-2 mt-1 ${isDark ? 'text-[#888]' : 'text-slate-500'}`}>
                      <span>Height: {toMm(preset.height)}mm</span>
                      <span>•</span>
                      <span>{preset.elements.length} elements</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: LAYERS */}
        {activeTab === 'layers' && (
          <FooterLayersPanel
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
