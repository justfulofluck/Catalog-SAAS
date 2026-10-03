import React, { useState, useEffect } from 'react';
import { useStore } from '../../../store/useStore';
import { SystemTemplate, CardThemeConfig } from '../../../types';
import {
  Sparkles,
  Save,
  X,
  Eye,
  CheckCircle,
  XCircle,
  Palette,
  Layout,
  Type,
  Sliders,
  Layers,
  RotateCcw,
  Tag,
  Check,
  Package,
  Sun,
  Moon,
  Info
} from 'lucide-react';

// Sample preview products
const SAMPLE_PRODUCTS = [
  {
    id: 'sample-1',
    name: 'Chronograph Tourbillon Watch',
    price: '₹14,999',
    sku: 'WA-702-BLK',
    categoryName: 'LUXURY TIMEPIECE',
    description: 'Precision engineered automatic mechanical timepiece with sapphire crystal glass.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    specs: [
      { label: 'Movement', value: 'Automatic Caliber' },
      { label: 'Water Resist', value: '100 Meters' },
      { label: 'Strap', value: 'Italian Leather' },
      { label: 'Case Material', value: 'Titanium' },
    ]
  },
  {
    id: 'sample-2',
    name: 'Wireless Studio Headphones',
    price: '₹7,490',
    sku: 'AUDIO-X9',
    categoryName: 'PREMIUM AUDIO',
    description: 'Active noise cancelling headphones with 40mm beryllium drivers and 40h battery.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    specs: [
      { label: 'Battery', value: '40 Hours ANC' },
      { label: 'Driver', value: '40mm Beryllium' },
      { label: 'Bluetooth', value: '5.3 LDAC' },
      { label: 'Weight', value: '240 grams' },
    ]
  },
  {
    id: 'sample-3',
    name: 'Handcrafted Ceramic Vase',
    price: '₹2,850',
    sku: 'DECOR-CR-01',
    categoryName: 'HOME LIVING',
    description: 'Minimalist hand-thrown matte stoneware vase with organic sculpted rim.',
    image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=80',
    specs: [
      { label: 'Material', value: 'Matte Stoneware' },
      { label: 'Height', value: '28 cm' },
      { label: 'Finish', value: 'Unglazed Raw' },
      { label: 'Origin', value: 'Artisan Crafted' },
    ]
  }
];

// Curated designer presets for instant starting points
const DESIGNER_PRESETS: { name: string; desc: string; config: CardThemeConfig }[] = [
  {
    name: 'Classic Studio',
    desc: 'Clean white background, top image, stacked specifications',
    config: {
      name: 'Classic Studio',
      layout: 'classic-stack',
      backgroundColor: '#ffffff',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      borderRadius: 4,
      padding: 14,
      titleColor: '#0f172a',
      titleFontSize: 13,
      priceColor: '#00a651',
      priceFontSize: 13,
      priceBadgeStyle: 'pill',
      priceBadgeBg: 'rgba(255, 255, 255, 0.95)',
      priceBadgeTextColor: '#00a651',
      skuColor: '#64748b',
      skuFontSize: 8.5,
      showSku: true,
      specsColor: '#334155',
      specsFontSize: 8.5,
      specsStyle: 'list',
      showCategoryBadge: false,
      showDivider: true,
    }
  },
  {
    name: 'Emerald Luxe',
    desc: 'Deep pine dark aesthetic with warm gold sand accents',
    config: {
      name: 'Emerald Luxe',
      layout: 'classic-stack',
      backgroundColor: '#0F2627',
      borderColor: '#184748',
      borderWidth: 1,
      borderRadius: 4,
      padding: 14,
      titleColor: '#F1F1F1',
      titleFontSize: 13,
      priceColor: '#E2DCC8',
      priceFontSize: 14,
      priceBadgeStyle: 'solid-box',
      priceBadgeBg: '#091A1A',
      priceBadgeTextColor: '#E2DCC8',
      skuColor: '#8E9A99',
      skuFontSize: 8.5,
      showSku: true,
      specsColor: '#C4D1D0',
      specsFontSize: 8.5,
      specsStyle: 'chips',
      showCategoryBadge: true,
      categoryBadgeBg: 'rgba(226, 220, 200, 0.12)',
      categoryBadgeTextColor: '#E2DCC8',
      accentColor: '#E2DCC8',
      showDivider: true,
    }
  },
  {
    name: 'Editorial Hero',
    desc: 'Full cinematic dark gradient overlay with floating metadata',
    config: {
      name: 'Editorial Hero',
      layout: 'editorial-overlay',
      backgroundColor: '#0a0f1d',
      borderColor: '#1e293b',
      borderWidth: 1,
      borderRadius: 4,
      padding: 14,
      titleColor: '#ffffff',
      titleFontSize: 14,
      priceColor: '#38bdf8',
      priceFontSize: 14,
      priceBadgeStyle: 'minimal',
      skuColor: '#94a3b8',
      skuFontSize: 8.5,
      showSku: true,
      specsColor: '#e2e8f0',
      specsFontSize: 8,
      specsStyle: 'chips',
      showCategoryBadge: true,
      categoryBadgeBg: 'rgba(56, 189, 248, 0.15)',
      categoryBadgeTextColor: '#38bdf8',
      showDivider: false,
    }
  },
  {
    name: 'Clean Badge Grid',
    desc: 'Category pill at top, bold header price & 2-column specs',
    config: {
      name: 'Clean Badge Grid',
      layout: 'clean-badge',
      backgroundColor: '#ffffff',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      borderRadius: 4,
      padding: 14,
      titleColor: '#0f172a',
      titleFontSize: 13,
      priceColor: '#4f46e5',
      priceFontSize: 13,
      priceBadgeStyle: 'minimal',
      skuColor: '#64748b',
      skuFontSize: 8,
      showSku: true,
      specsColor: '#1e293b',
      specsFontSize: 8.5,
      specsStyle: '2col-grid',
      showCategoryBadge: true,
      categoryBadgeBg: 'rgba(79, 70, 229, 0.1)',
      categoryBadgeTextColor: '#4f46e5',
      showDivider: false,
    }
  },
  {
    name: 'Compact Horizontal Row',
    desc: 'Side-by-side thumbnail with right column specs',
    config: {
      name: 'Compact Horizontal Row',
      layout: 'minimal-row',
      backgroundColor: '#ffffff',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      borderRadius: 4,
      padding: 12,
      titleColor: '#0f172a',
      titleFontSize: 12,
      priceColor: '#00a651',
      priceFontSize: 12,
      priceBadgeStyle: 'minimal',
      skuColor: '#64748b',
      skuFontSize: 8,
      showSku: true,
      specsColor: '#334155',
      specsFontSize: 8,
      specsStyle: 'list',
      showCategoryBadge: false,
      showDivider: false,
    }
  },
  {
    name: 'Cyber Noir',
    desc: 'High contrast black obsidian card with neon emerald accents',
    config: {
      name: 'Cyber Noir',
      layout: 'classic-stack',
      backgroundColor: '#0c0c0e',
      borderColor: '#222226',
      borderWidth: 1,
      borderRadius: 4,
      padding: 14,
      titleColor: '#f4f4f5',
      titleFontSize: 13,
      priceColor: '#10b981',
      priceFontSize: 13,
      priceBadgeStyle: 'solid-box',
      priceBadgeBg: '#052e16',
      priceBadgeTextColor: '#34d399',
      skuColor: '#71717a',
      skuFontSize: 8.5,
      showSku: true,
      specsColor: '#a1a1aa',
      specsFontSize: 8.5,
      specsStyle: 'chips',
      showCategoryBadge: true,
      categoryBadgeBg: 'rgba(16, 185, 129, 0.15)',
      categoryBadgeTextColor: '#34d399',
      accentColor: '#10b981',
      showDivider: true,
    }
  }
];

export const AdminCardThemeDesignerModal: React.FC = () => {
  const {
    isAdminCardThemeDesignerOpen,
    editingAdminCardTheme,
    setIsAdminCardThemeDesignerOpen,
    createSystemTemplate,
    updateSystemTemplate,
    fetchSystemTemplates,
    showToast
  } = useStore();

  // Template Form Metadata
  const [templateName, setTemplateName] = useState('New Card Theme');
  const [category, setCategory] = useState('General');
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Card Configuration
  const [config, setConfig] = useState<CardThemeConfig>(DESIGNER_PRESETS[0].config);

  // Preview Workspace settings
  const [selectedSampleIdx, setSelectedSampleIdx] = useState(0);
  const [previewBgMode, setPreviewBgMode] = useState<'dark' | 'light' | 'grid'>('dark');
  const [activeTab, setActiveTab] = useState<'layout' | 'colors' | 'typography' | 'badges'>('layout');

  const sampleProduct = SAMPLE_PRODUCTS[selectedSampleIdx];

  // Initialize from editingAdminCardTheme if editing existing template
  useEffect(() => {
    if (editingAdminCardTheme) {
      setTemplateName(editingAdminCardTheme.name || 'Custom Card Theme');
      setCategory(editingAdminCardTheme.category || 'General');
      setIsActive(editingAdminCardTheme.is_active !== undefined ? editingAdminCardTheme.is_active : true);
      if (editingAdminCardTheme.grid_data && typeof editingAdminCardTheme.grid_data === 'object') {
        setConfig({
          ...DESIGNER_PRESETS[0].config,
          ...editingAdminCardTheme.grid_data,
          name: editingAdminCardTheme.name
        });
      }
    } else {
      setTemplateName('New Card Theme');
      setCategory('General');
      setIsActive(true);
      setConfig(DESIGNER_PRESETS[0].config);
    }
  }, [editingAdminCardTheme]);

  if (!isAdminCardThemeDesignerOpen) return null;

  const updateConfig = (patch: Partial<CardThemeConfig>) => {
    setConfig(prev => ({ ...prev, ...patch }));
  };

  const handleApplyPreset = (preset: typeof DESIGNER_PRESETS[0]) => {
    setConfig({ ...preset.config });
    if (!editingAdminCardTheme) {
      setTemplateName(preset.name);
    }
    showToast?.(`Loaded preset "${preset.name}"`, 'info');
  };

  const handleSave = async () => {
    if (!templateName.trim()) {
      alert('Please enter a theme name');
      return;
    }

    setIsSaving(true);
    try {
      const payload: Partial<SystemTemplate> = {
        name: templateName.trim(),
        category: category.trim() || 'General',
        type: 'card_theme',
        description: `Product Card Theme: ${config.layout} layout with ${config.backgroundColor} background`,
        is_active: isActive,
        theme_id: config.layout,
        pages_data: [],
        grid_data: {
          ...config,
          name: templateName.trim(),
          category: category.trim()
        }
      };

      if (editingAdminCardTheme?.id) {
        await updateSystemTemplate(editingAdminCardTheme.id, payload);
        showToast?.(`Card Theme "${templateName}" updated successfully!`, 'success');
      } else {
        await createSystemTemplate(payload);
        showToast?.(`Card Theme "${templateName}" created successfully!`, 'success');
      }

      await fetchSystemTemplates();
      setIsAdminCardThemeDesignerOpen(false, null);
    } catch (err: any) {
      console.error('Failed to save card theme:', err);
      alert('Error saving theme: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#09090b] text-[#f1f1f1] flex flex-col overflow-hidden font-sans select-none animate-in fade-in duration-200">
      {/* ── TOP NAV BAR ────────────────────────────────────────── */}
      <header className="h-14 bg-[#121214] border-b border-[#26262a] px-5 flex items-center justify-between gap-4 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[4px] bg-[#0F3D3E] text-[#E2DCC8] border border-[#E2DCC8]/30 flex items-center justify-center shadow-sm">
            <Sparkles size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#E2DCC8] font-bold">
                SUPERADMIN STUDIO
              </span>
              <span className="px-1.5 py-0.5 rounded-[3px] bg-[#0F3D3E]/40 border border-[#E2DCC8]/20 text-[9px] text-[#E2DCC8] font-mono">
                CARD BLUEPRINT
              </span>
            </div>
            <h1 className="text-xs font-bold text-white tracking-wide">
              {editingAdminCardTheme ? `Edit Theme: ${editingAdminCardTheme.name}` : 'Card Theme Visual Designer'}
            </h1>
          </div>
        </div>

        {/* Middle: Theme Name & Category */}
        <div className="flex items-center gap-3 flex-1 max-w-lg mx-auto">
          <div className="flex-1 relative">
            <input
              type="text"
              value={templateName}
              onChange={e => setTemplateName(e.target.value)}
              placeholder="Card Theme Name (e.g. Minimalist Gold)"
              className="w-full bg-[#18181b] border border-[#2e2e34] focus:border-[#0F3D3E] px-3 py-1.5 rounded-[4px] text-xs font-bold text-white placeholder-zinc-500 outline-none transition-colors"
            />
          </div>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="bg-[#18181b] border border-[#2e2e34] focus:border-[#0F3D3E] px-2.5 py-1.5 rounded-[4px] text-xs font-medium text-zinc-300 outline-none transition-colors"
          >
            <option value="General">General</option>
            <option value="Luxury & Jewelry">Luxury & Jewelry</option>
            <option value="Fashion & Apparel">Fashion & Apparel</option>
            <option value="Electronics & Tech">Electronics & Tech</option>
            <option value="Industrial & Hardware">Industrial & Hardware</option>
            <option value="Home & Furniture">Home & Furniture</option>
          </select>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Active / Draft toggle */}
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`px-2.5 py-1.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border transition-all ${
              isActive
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
            }`}
          >
            {isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
            {isActive ? 'Status: Live' : 'Status: Draft'}
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={() => setIsAdminCardThemeDesignerOpen(false, null)}
            className="px-3 py-1.5 bg-[#18181b] hover:bg-[#222226] border border-[#2e2e34] text-zinc-400 hover:text-white rounded-[4px] text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <X size={13} /> Cancel
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-1.5 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] text-xs font-bold transition-all shadow-md shadow-[#0F3D3E]/30 flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            <Save size={13} />
            <span>{isSaving ? 'Saving...' : 'Save Theme Blueprint'}</span>
          </button>
        </div>
      </header>

      {/* ── MAIN STUDIO BODY ────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: CONTROLS & SETTINGS (440px) */}
        <aside className="w-[440px] border-r border-[#26262a] bg-[#121214] flex flex-col shrink-0 overflow-hidden">
          {/* Preset Chips Bar */}
          <div className="p-3 border-b border-[#26262a] bg-[#151518]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#E2DCC8] flex items-center gap-1">
                <Sparkles size={11} className="text-amber-400" /> Starter Presets
              </span>
              <span className="text-[9px] text-zinc-500 font-mono">Click to load</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {DESIGNER_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className={`px-2 py-1.5 rounded-[4px] text-[10px] font-bold truncate text-left border transition-all ${
                    config.name === p.name
                      ? 'bg-[#0F3D3E] text-white border-[#E2DCC8]/40 shadow-xs'
                      : 'bg-[#1a1a1e] hover:bg-[#222228] text-zinc-300 border-[#2a2a30]'
                  }`}
                  title={p.desc}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex border-b border-[#26262a] bg-[#141416] p-1 gap-1">
            {[
              { id: 'layout', label: 'Layout', icon: Layout },
              { id: 'colors', label: 'Colors & Shape', icon: Palette },
              { id: 'typography', label: 'Typography', icon: Type },
              { id: 'badges', label: 'Badges & Specs', icon: Sliders },
            ].map(tab => {
              const Icon = tab.icon;
              const isCur = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-1.5 px-2 rounded-[3px] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isCur
                      ? 'bg-[#222226] text-[#E2DCC8] shadow-sm border border-[#33333a]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Icon size={12} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Panels (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {/* 1. LAYOUT TAB */}
            {activeTab === 'layout' && (
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                    Card Architecture Layout
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      {
                        id: 'classic-stack',
                        title: 'Classic Stack',
                        desc: 'Top Hero Image + Clean Details Stack',
                        tag: 'Standard'
                      },
                      {
                        id: 'editorial-overlay',
                        title: 'Editorial Overlay',
                        desc: 'Cinematic Dark Gradient with Overlaid Specs',
                        tag: 'Luxe'
                      },
                      {
                        id: 'clean-badge',
                        title: 'Clean Badge',
                        desc: 'Category Badge Header & 2-Col Specs Grid',
                        tag: 'Technical'
                      },
                      {
                        id: 'minimal-row',
                        title: 'Compact Row',
                        desc: 'Side-by-side Thumbnail with Right Specs',
                        tag: 'Dense'
                      }
                    ].map(lay => {
                      const isSel = config.layout === lay.id;
                      return (
                        <button
                          key={lay.id}
                          type="button"
                          onClick={() => updateConfig({ layout: lay.id as any })}
                          className={`p-3 rounded-[4px] border text-left flex flex-col justify-between transition-all ${
                            isSel
                              ? 'bg-[#0F3D3E]/30 border-[#0F3D3E] shadow-sm ring-1 ring-[#0F3D3E]/50 text-white'
                              : 'bg-[#18181b] border-[#27272a] text-zinc-400 hover:text-zinc-200 hover:border-[#38383e]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-white">{lay.title}</span>
                              <span className="text-[8px] font-mono px-1 py-0.5 rounded bg-zinc-800 text-zinc-400">
                                {lay.tag}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-400 leading-snug">{lay.desc}</p>
                          </div>
                          {isSel && (
                            <div className="mt-2 text-[9px] font-bold text-[#E2DCC8] flex items-center gap-1">
                              <Check size={10} /> Active
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Card Padding & Density */}
                <div className="p-3 bg-[#18181b] rounded-[4px] border border-[#27272a] space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase">
                    <span>Card Padding</span>
                    <span className="font-mono text-[#E2DCC8] font-bold">{config.padding || 14}px</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="24"
                    step="1"
                    value={config.padding || 14}
                    onChange={e => updateConfig({ padding: parseInt(e.target.value, 10) })}
                    className="w-full h-1.5 bg-[#27272a] rounded-full appearance-none cursor-pointer accent-[#0F3D3E]"
                  />
                </div>

                {/* Divider Line Toggle */}
                <div className="p-3 bg-[#18181b] rounded-[4px] border border-[#27272a] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-zinc-200 block">Separator Divider Line</span>
                    <span className="text-[10px] text-zinc-400">Shows a subtle line between image and specs</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.showDivider !== false}
                    onChange={e => updateConfig({ showDivider: e.target.checked })}
                    className="w-4 h-4 rounded accent-[#0F3D3E] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* 2. COLORS & SHAPE TAB */}
            {activeTab === 'colors' && (
              <div className="space-y-4">
                {/* Surface Quick Palettes */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                    Quick Surface Palettes
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { name: 'Pure White', bg: '#ffffff', stroke: '#e2e8f0', title: '#0f172a', price: '#00a651', specs: '#334155' },
                      { name: 'Warm Cream', bg: '#FDFBF7', stroke: '#E7E5E4', title: '#1C1917', price: '#EA580C', specs: '#44403C' },
                      { name: 'Pine Luxe', bg: '#0F2627', stroke: '#184748', title: '#F1F1F1', price: '#E2DCC8', specs: '#C4D1D0' },
                      { name: 'Dark Noir', bg: '#0C0C0E', stroke: '#222226', title: '#F4F4F5', price: '#34D399', specs: '#A1A1AA' },
                    ].map(pal => (
                      <button
                        key={pal.name}
                        type="button"
                        onClick={() => {
                          updateConfig({
                            backgroundColor: pal.bg,
                            borderColor: pal.stroke,
                            titleColor: pal.title,
                            priceColor: pal.price,
                            specsColor: pal.specs
                          });
                        }}
                        className="p-2 bg-[#18181b] hover:bg-[#222228] border border-[#27272a] rounded-[4px] text-center transition-all group"
                      >
                        <div
                          className="w-full h-5 rounded-[2px] mb-1.5 border"
                          style={{ backgroundColor: pal.bg, borderColor: pal.stroke }}
                        />
                        <span className="text-[9px] font-bold text-zinc-300 block truncate group-hover:text-white">
                          {pal.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Background Color */}
                <div className="p-3 bg-[#18181b] rounded-[4px] border border-[#27272a] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-zinc-200 block">Card Background</span>
                    <span className="text-[10px] text-zinc-400 font-mono">{config.backgroundColor}</span>
                  </div>
                  <div className="relative w-8 h-8 rounded-[4px] border border-white/20 overflow-hidden cursor-pointer shadow-xs">
                    <input
                      type="color"
                      value={config.backgroundColor}
                      onChange={e => updateConfig({ backgroundColor: e.target.value })}
                      className="w-10 h-10 -top-1 -left-1 absolute cursor-pointer bg-transparent border-0"
                    />
                  </div>
                </div>

                {/* Card Border Stroke & Width */}
                <div className="p-3 bg-[#18181b] rounded-[4px] border border-[#27272a] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-zinc-200 block">Border Stroke Color</span>
                      <span className="text-[10px] text-zinc-400 font-mono">{config.borderColor}</span>
                    </div>
                    <div className="relative w-8 h-8 rounded-[4px] border border-white/20 overflow-hidden cursor-pointer shadow-xs">
                      <input
                        type="color"
                        value={config.borderColor}
                        onChange={e => updateConfig({ borderColor: e.target.value })}
                        className="w-10 h-10 -top-1 -left-1 absolute cursor-pointer bg-transparent border-0"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#26262a]">
                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase mb-1.5">
                      <span>Border Width</span>
                      <span className="font-mono text-[#E2DCC8]">{config.borderWidth}px</span>
                    </div>
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map(bw => (
                        <button
                          key={bw}
                          type="button"
                          onClick={() => updateConfig({ borderWidth: bw })}
                          className={`flex-1 py-1 rounded-[3px] text-[10px] font-bold border transition-colors ${
                            config.borderWidth === bw
                              ? 'bg-[#0F3D3E] text-white border-[#E2DCC8]/40'
                              : 'bg-[#141416] text-zinc-400 border-[#26262a] hover:text-white'
                          }`}
                        >
                          {bw}px
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Corner Roundness */}
                <div className="p-3 bg-[#18181b] rounded-[4px] border border-[#27272a] space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase">
                    <span>Corner Roundness (Radius)</span>
                    <span className="font-mono text-[#E2DCC8]">{config.borderRadius}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="16"
                    step="1"
                    value={config.borderRadius}
                    onChange={e => updateConfig({ borderRadius: parseInt(e.target.value, 10) })}
                    className="w-full h-1.5 bg-[#27272a] rounded-full appearance-none cursor-pointer accent-[#0F3D3E]"
                  />
                  <div className="flex justify-between text-[9px] text-zinc-500 font-mono">
                    <span>0px (Crisp Square)</span>
                    <span>4px (Standard Brand)</span>
                    <span>16px (Pill Soft)</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. TYPOGRAPHY TAB */}
            {activeTab === 'typography' && (
              <div className="space-y-4">
                {/* Title Styling */}
                <div className="p-3 bg-[#18181b] rounded-[4px] border border-[#27272a] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-zinc-200 block">Product Title Color</span>
                      <span className="text-[10px] text-zinc-400 font-mono">{config.titleColor}</span>
                    </div>
                    <div className="relative w-8 h-8 rounded-[4px] border border-white/20 overflow-hidden cursor-pointer shadow-xs">
                      <input
                        type="color"
                        value={config.titleColor}
                        onChange={e => updateConfig({ titleColor: e.target.value })}
                        className="w-10 h-10 -top-1 -left-1 absolute cursor-pointer bg-transparent border-0"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#26262a]">
                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase mb-1.5">
                      <span>Title Font Size</span>
                      <span className="font-mono text-[#E2DCC8]">{config.titleFontSize || 13}px</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="18"
                      step="0.5"
                      value={config.titleFontSize || 13}
                      onChange={e => updateConfig({ titleFontSize: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-[#27272a] rounded-full appearance-none cursor-pointer accent-[#0F3D3E]"
                    />
                  </div>
                </div>

                {/* Price Styling */}
                <div className="p-3 bg-[#18181b] rounded-[4px] border border-[#27272a] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-zinc-200 block">Price Color</span>
                      <span className="text-[10px] text-zinc-400 font-mono">{config.priceColor}</span>
                    </div>
                    <div className="relative w-8 h-8 rounded-[4px] border border-white/20 overflow-hidden cursor-pointer shadow-xs">
                      <input
                        type="color"
                        value={config.priceColor}
                        onChange={e => updateConfig({ priceColor: e.target.value })}
                        className="w-10 h-10 -top-1 -left-1 absolute cursor-pointer bg-transparent border-0"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#26262a]">
                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase mb-1.5">
                      <span>Price Font Size</span>
                      <span className="font-mono text-[#E2DCC8]">{config.priceFontSize || 13}px</span>
                    </div>
                    <input
                      type="range"
                      min="11"
                      max="20"
                      step="0.5"
                      value={config.priceFontSize || 13}
                      onChange={e => updateConfig({ priceFontSize: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-[#27272a] rounded-full appearance-none cursor-pointer accent-[#0F3D3E]"
                    />
                  </div>
                </div>

                {/* Specs Text Color */}
                <div className="p-3 bg-[#18181b] rounded-[4px] border border-[#27272a] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-zinc-200 block">Specifications Text Color</span>
                      <span className="text-[10px] text-zinc-400 font-mono">{config.specsColor}</span>
                    </div>
                    <div className="relative w-8 h-8 rounded-[4px] border border-white/20 overflow-hidden cursor-pointer shadow-xs">
                      <input
                        type="color"
                        value={config.specsColor}
                        onChange={e => updateConfig({ specsColor: e.target.value })}
                        className="w-10 h-10 -top-1 -left-1 absolute cursor-pointer bg-transparent border-0"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#26262a]">
                    <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase mb-1.5">
                      <span>Specs Font Size</span>
                      <span className="font-mono text-[#E2DCC8]">{config.specsFontSize || 8.5}px</span>
                    </div>
                    <input
                      type="range"
                      min="7"
                      max="11"
                      step="0.5"
                      value={config.specsFontSize || 8.5}
                      onChange={e => updateConfig({ specsFontSize: parseFloat(e.target.value) })}
                      className="w-full h-1.5 bg-[#27272a] rounded-full appearance-none cursor-pointer accent-[#0F3D3E]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. BADGES & SPECS TAB */}
            {activeTab === 'badges' && (
              <div className="space-y-4">
                {/* Category Badge Toggle & Colors */}
                <div className="p-3 bg-[#18181b] rounded-[4px] border border-[#27272a] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-zinc-200 block">Category Pill Badge</span>
                      <span className="text-[10px] text-zinc-400">Display category tag on card header</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.showCategoryBadge !== false}
                      onChange={e => updateConfig({ showCategoryBadge: e.target.checked })}
                      className="w-4 h-4 rounded accent-[#0F3D3E] cursor-pointer"
                    />
                  </div>

                  {config.showCategoryBadge !== false && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#26262a]">
                      <div>
                        <span className="text-[9px] font-bold text-zinc-400 block mb-1 uppercase">Badge BG</span>
                        <input
                          type="text"
                          value={config.categoryBadgeBg || 'rgba(99, 102, 241, 0.15)'}
                          onChange={e => updateConfig({ categoryBadgeBg: e.target.value })}
                          className="w-full bg-[#121214] border border-[#2e2e34] px-2 py-1 rounded text-[10px] font-mono text-zinc-200 outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-zinc-400 block mb-1 uppercase">Badge Text Color</span>
                        <input
                          type="text"
                          value={config.categoryBadgeTextColor || '#a5b4fc'}
                          onChange={e => updateConfig({ categoryBadgeTextColor: e.target.value })}
                          className="w-full bg-[#121214] border border-[#2e2e34] px-2 py-1 rounded text-[10px] font-mono text-zinc-200 outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Price Badge Style */}
                <div className="p-3 bg-[#18181b] rounded-[4px] border border-[#27272a] space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Price Tag Style
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'pill', label: 'Floating Pill' },
                      { id: 'solid-box', label: 'Dark Solid' },
                      { id: 'minimal', label: 'Minimal Text' },
                    ].map(style => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => updateConfig({ priceBadgeStyle: style.id as any })}
                        className={`py-1.5 px-2 rounded-[3px] text-[10px] font-bold border transition-colors ${
                          config.priceBadgeStyle === style.id
                            ? 'bg-[#0F3D3E] text-white border-[#E2DCC8]/40'
                            : 'bg-[#141416] text-zinc-400 border-[#26262a] hover:text-white'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SKU Code Toggle & Color */}
                <div className="p-3 bg-[#18181b] rounded-[4px] border border-[#27272a] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-zinc-200 block">Show SKU / Model Code</span>
                      <span className="text-[10px] text-zinc-400">Display product SKU identifier</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={config.showSku !== false}
                      onChange={e => updateConfig({ showSku: e.target.checked })}
                      className="w-4 h-4 rounded accent-[#0F3D3E] cursor-pointer"
                    />
                  </div>

                  {config.showSku !== false && (
                    <div className="flex items-center justify-between pt-2 border-t border-[#26262a]">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">SKU Text Color</span>
                      <div className="relative w-7 h-7 rounded-[4px] border border-white/20 overflow-hidden cursor-pointer">
                        <input
                          type="color"
                          value={config.skuColor || '#64748b'}
                          onChange={e => updateConfig({ skuColor: e.target.value })}
                          className="w-9 h-9 -top-1 -left-1 absolute cursor-pointer bg-transparent border-0"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Specifications Layout Style */}
                <div className="p-3 bg-[#18181b] rounded-[4px] border border-[#27272a] space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Specs List Format
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'list', label: 'Row List' },
                      { id: 'chips', label: 'Pill Chips' },
                      { id: '2col-grid', label: '2-Col Grid' },
                    ].map(st => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => updateConfig({ specsStyle: st.id as any })}
                        className={`py-1.5 px-2 rounded-[3px] text-[10px] font-bold border transition-colors ${
                          (config.specsStyle || 'list') === st.id
                            ? 'bg-[#0F3D3E] text-white border-[#E2DCC8]/40'
                            : 'bg-[#141416] text-zinc-400 border-[#26262a] hover:text-white'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT COLUMN: INTERACTIVE LIVE PREVIEW */}
        <main className="flex-1 flex flex-col bg-[#09090b] overflow-hidden">
          {/* Preview Toolbar */}
          <div className="h-11 border-b border-[#26262a] px-6 bg-[#121214] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Eye size={12} className="text-[#00a651]" /> Live Render Preview
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                Layout: {config.layout}
              </span>
            </div>

            {/* Test Sample Selector & Canvas Background Switch */}
            <div className="flex items-center gap-3">
              {/* Product switcher */}
              <div className="flex items-center gap-1.5 bg-[#18181b] p-0.5 rounded-[4px] border border-[#27272a]">
                <span className="text-[9px] font-bold text-zinc-500 uppercase px-1.5">Sample:</span>
                {SAMPLE_PRODUCTS.map((prod, idx) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => setSelectedSampleIdx(idx)}
                    className={`px-2 py-0.5 rounded-[3px] text-[10px] font-bold transition-all ${
                      selectedSampleIdx === idx
                        ? 'bg-[#0F3D3E] text-white shadow-xs'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {prod.id === 'sample-1' ? 'Watch' : prod.id === 'sample-2' ? 'Audio' : 'Decor'}
                  </button>
                ))}
              </div>

              {/* Background mode switcher */}
              <div className="flex items-center gap-1 bg-[#18181b] p-0.5 rounded-[4px] border border-[#27272a]">
                <button
                  type="button"
                  onClick={() => setPreviewBgMode('dark')}
                  className={`p-1 rounded-[3px] transition-colors ${
                    previewBgMode === 'dark' ? 'bg-[#27272a] text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="Dark Workspace Canvas"
                >
                  <Moon size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBgMode('light')}
                  className={`p-1 rounded-[3px] transition-colors ${
                    previewBgMode === 'light' ? 'bg-[#27272a] text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="White Paper Canvas"
                >
                  <Sun size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBgMode('grid')}
                  className={`p-1 rounded-[3px] transition-colors ${
                    previewBgMode === 'grid' ? 'bg-[#27272a] text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                  title="Blueprint Grid Canvas"
                >
                  <Layers size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Central Preview Stage */}
          <div
            className={`flex-1 flex items-center justify-center p-8 overflow-auto transition-colors ${
              previewBgMode === 'dark'
                ? 'bg-[#0c0c0e]'
                : previewBgMode === 'light'
                ? 'bg-[#f4f4f5]'
                : 'bg-[#0f172a] bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px]'
            }`}
          >
            {/* The Live Rendered Card Component */}
            <div
              className="w-[300px] shadow-2xl transition-all relative overflow-hidden"
              style={{
                backgroundColor: config.backgroundColor,
                borderColor: config.borderColor,
                borderWidth: `${config.borderWidth}px`,
                borderStyle: config.borderWidth > 0 ? 'solid' : 'none',
                borderRadius: `${config.borderRadius}px`,
                padding: `${config.padding}px`,
              }}
            >
              {/* ── LAYOUT 1: CLEAN BADGE ── */}
              {config.layout === 'clean-badge' && (
                <div className="space-y-3 flex flex-col justify-between h-full">
                  {/* Header Row: Category Badge + Price */}
                  <div className="flex items-center justify-between gap-2">
                    {config.showCategoryBadge !== false ? (
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[3px] border"
                        style={{
                          backgroundColor: config.categoryBadgeBg || 'rgba(99, 102, 241, 0.12)',
                          color: config.categoryBadgeTextColor || '#6366f1',
                          borderColor: 'rgba(99, 102, 241, 0.25)'
                        }}
                      >
                        {sampleProduct.categoryName}
                      </span>
                    ) : <div />}
                    <span
                      className="font-bold tracking-tight"
                      style={{
                        color: config.priceColor,
                        fontSize: `${config.priceFontSize || 13}px`
                      }}
                    >
                      {sampleProduct.price}
                    </span>
                  </div>

                  {/* Centered Image Container */}
                  <div className="w-full h-36 rounded-[3px] bg-black/5 dark:bg-white/5 overflow-hidden flex items-center justify-center p-2 relative">
                    <img
                      src={sampleProduct.image}
                      alt={sampleProduct.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  {/* Title & SKU */}
                  <div className="space-y-0.5">
                    <h3
                      className="font-bold leading-tight line-clamp-2"
                      style={{
                        color: config.titleColor,
                        fontSize: `${config.titleFontSize || 13}px`
                      }}
                    >
                      {sampleProduct.name}
                    </h3>
                    {config.showSku !== false && (
                      <span
                        className="text-[8.5px] font-mono block"
                        style={{ color: config.skuColor || '#64748b' }}
                      >
                        SKU: {sampleProduct.sku}
                      </span>
                    )}
                  </div>

                  {/* Specs Layout: 2-Col Grid or Chips */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {sampleProduct.specs.map(s => (
                      <div
                        key={s.label}
                        className="p-1.5 rounded-[3px] bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10"
                      >
                        <span className="text-[7px] uppercase font-bold tracking-wider block opacity-70" style={{ color: config.specsColor }}>
                          {s.label}
                        </span>
                        <span className="text-[8.5px] font-bold block truncate" style={{ color: config.specsColor }}>
                          {s.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── LAYOUT 2: EDITORIAL OVERLAY ── */}
              {config.layout === 'editorial-overlay' && (
                <div className="relative min-h-[360px] flex flex-col justify-between -m-[14px] p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
                  {/* Background Image Container */}
                  <div className="absolute inset-0 z-0 overflow-hidden">
                    <img
                      src={sampleProduct.image}
                      alt={sampleProduct.name}
                      className="w-full h-full object-cover opacity-60 scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#090d16]/80 to-transparent" />
                  </div>

                  {/* Top: Category Tag */}
                  <div className="relative z-10 flex items-center justify-between">
                    {config.showCategoryBadge !== false && (
                      <span
                        className="text-[8.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded-[3px] border backdrop-blur-md"
                        style={{
                          backgroundColor: config.categoryBadgeBg || 'rgba(56, 189, 248, 0.15)',
                          color: config.categoryBadgeTextColor || '#38bdf8',
                          borderColor: 'rgba(56, 189, 248, 0.3)'
                        }}
                      >
                        {sampleProduct.categoryName}
                      </span>
                    )}
                  </div>

                  {/* Bottom Overlaid Details Stack */}
                  <div className="relative z-10 space-y-2 mt-auto pt-16">
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className="font-black tracking-tight"
                        style={{
                          color: config.priceColor,
                          fontSize: `${config.priceFontSize || 15}px`
                        }}
                      >
                        {sampleProduct.price}
                      </span>
                      {config.showSku !== false && (
                        <span className="text-[8px] font-mono text-zinc-400">
                          {sampleProduct.sku}
                        </span>
                      )}
                    </div>

                    <h3
                      className="font-bold leading-snug text-white"
                      style={{
                        fontSize: `${config.titleFontSize || 13}px`,
                        color: config.titleColor
                      }}
                    >
                      {sampleProduct.name}
                    </h3>

                    {/* Chips format specs */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {sampleProduct.specs.map(s => (
                        <span
                          key={s.label}
                          className="px-2 py-0.5 rounded-[3px] text-[7.5px] font-medium bg-white/10 backdrop-blur-md border border-white/15 text-white"
                        >
                          {s.label}: <strong>{s.value}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── LAYOUT 3: MINIMAL ROW (SIDE-BY-SIDE) ── */}
              {config.layout === 'minimal-row' && (
                <div className="flex gap-3 items-center">
                  {/* Left Thumbnail */}
                  <div className="w-24 h-24 rounded-[3px] bg-black/5 dark:bg-white/5 overflow-hidden flex items-center justify-center p-1.5 shrink-0 border border-black/5 dark:border-white/10">
                    <img
                      src={sampleProduct.image}
                      alt={sampleProduct.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  {/* Right Details Column */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3
                      className="font-bold leading-tight truncate"
                      style={{
                        color: config.titleColor,
                        fontSize: `${config.titleFontSize || 12}px`
                      }}
                    >
                      {sampleProduct.name}
                    </h3>

                    <div
                      className="font-bold"
                      style={{
                        color: config.priceColor,
                        fontSize: `${config.priceFontSize || 12}px`
                      }}
                    >
                      {sampleProduct.price}
                    </div>

                    {config.showSku !== false && (
                      <span
                        className="text-[8px] font-mono block truncate"
                        style={{ color: config.skuColor }}
                      >
                        SKU: {sampleProduct.sku}
                      </span>
                    )}

                    <div className="space-y-0.5 pt-1">
                      {sampleProduct.specs.slice(0, 2).map(s => (
                        <div key={s.label} className="text-[7.5px] truncate" style={{ color: config.specsColor }}>
                          <span className="opacity-70">{s.label}:</span> <strong>{s.value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── LAYOUT 4: CLASSIC STACK (IMAGE TOP + DETAILS BOTTOM) ── */}
              {config.layout === 'classic-stack' && (
                <div className="space-y-3 flex flex-col justify-between h-full">
                  {/* Top Image Hero Box with floating Price Pill */}
                  <div className="w-full h-36 rounded-[3px] bg-black/5 dark:bg-white/5 overflow-hidden flex items-center justify-center p-2 relative border border-black/5 dark:border-white/10">
                    <img
                      src={sampleProduct.image}
                      alt={sampleProduct.name}
                      className="max-h-full max-w-full object-contain"
                    />

                    {/* Price Badge Overlay */}
                    {config.priceBadgeStyle === 'pill' && (
                      <div
                        className="absolute right-2 bottom-2 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-md border"
                        style={{
                          backgroundColor: config.priceBadgeBg || 'rgba(0,0,0,0.85)',
                          color: config.priceBadgeTextColor || config.priceColor,
                          borderColor: 'rgba(255,255,255,0.1)'
                        }}
                      >
                        {sampleProduct.price}
                      </div>
                    )}

                    {config.priceBadgeStyle === 'solid-box' && (
                      <div
                        className="absolute right-2 bottom-2 px-2 py-0.5 rounded-[3px] text-[10px] font-black uppercase tracking-wider shadow-md"
                        style={{
                          backgroundColor: config.priceBadgeBg || '#0F3D3E',
                          color: config.priceBadgeTextColor || '#E2DCC8',
                        }}
                      >
                        {sampleProduct.price}
                      </div>
                    )}
                  </div>

                  {/* Title & Price (if minimal) */}
                  <div className="space-y-1">
                    {config.priceBadgeStyle === 'minimal' && (
                      <div
                        className="font-bold text-xs"
                        style={{ color: config.priceColor }}
                      >
                        {sampleProduct.price}
                      </div>
                    )}

                    <h3
                      className="font-bold leading-tight"
                      style={{
                        color: config.titleColor,
                        fontSize: `${config.titleFontSize || 13}px`
                      }}
                    >
                      {sampleProduct.name}
                    </h3>

                    {config.showSku !== false && (
                      <span
                        className="text-[8.5px] font-mono block"
                        style={{ color: config.skuColor || '#64748b' }}
                      >
                        SKU: {sampleProduct.sku}
                      </span>
                    )}
                  </div>

                  {/* Separator Divider */}
                  {config.showDivider !== false && (
                    <div
                      className="h-[1px] w-full"
                      style={{
                        backgroundColor: config.borderColor || 'rgba(255,255,255,0.1)'
                      }}
                    />
                  )}

                  {/* Specs Section */}
                  {config.specsStyle === 'chips' ? (
                    <div className="flex flex-wrap gap-1">
                      {sampleProduct.specs.map(s => (
                        <span
                          key={s.label}
                          className="px-2 py-0.5 rounded-[3px] text-[7.5px] font-medium bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10"
                          style={{ color: config.specsColor }}
                        >
                          {s.label}: <strong>{s.value}</strong>
                        </span>
                      ))}
                    </div>
                  ) : config.specsStyle === '2col-grid' ? (
                    <div className="grid grid-cols-2 gap-1">
                      {sampleProduct.specs.map(s => (
                        <div key={s.label} className="p-1 rounded bg-black/5 dark:bg-white/5 text-[7.5px] truncate" style={{ color: config.specsColor }}>
                          <span className="opacity-70">{s.label}:</span> <strong>{s.value}</strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {sampleProduct.specs.map(s => (
                        <div
                          key={s.label}
                          className="flex items-center justify-between text-[8px]"
                        >
                          <span className="opacity-70" style={{ color: config.specsColor }}>
                            {s.label}:
                          </span>
                          <span className="font-bold" style={{ color: config.specsColor }}>
                            {s.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer Bar: Info specs banner */}
          <footer className="h-10 border-t border-[#26262a] bg-[#121214] px-6 flex items-center justify-between text-[10px] text-zinc-400 font-mono shrink-0">
            <div className="flex items-center gap-2">
              <Info size={11} className="text-[#E2DCC8]" />
              <span>Theme Blueprint will automatically be available in Catalog Generation & Page Editor.</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Card Base: {config.layout}</span>
              <span>Radius: {config.borderRadius}px</span>
              <span>Pad: {config.padding}px</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
};
