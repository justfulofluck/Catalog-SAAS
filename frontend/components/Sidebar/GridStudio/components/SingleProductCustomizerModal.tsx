import React from 'react';
import { X, Sliders, LayoutTemplate, Type, DollarSign, Hash, Palette, Layers, Package, RotateCcw } from 'lucide-react';
import { Product, Category, CardTheme } from '../../../types';
import { resolveProductImage } from '../../../utils/imageUtils';
import { resolveFieldLabel } from '../../../utils/fieldUtils';

interface SingleProductCustomizerModalProps {
  customizingProduct: Product | null;
  onClose: () => void;
  currentPageIndex: number;
  categories: Category[];
  products: Product[];
  customCardTheme: CardTheme;
  setCustomCardTheme: (theme: CardTheme) => void;
  customShowName: boolean;
  setCustomShowName: (val: boolean) => void;
  customTitle: string;
  setCustomTitle: (val: string) => void;
  customTitleColor: string;
  setCustomTitleColor: (val: string) => void;
  customTitleFontSize: number;
  setCustomTitleFontSize: (val: number) => void;
  customShowPrice: boolean;
  setCustomShowPrice: (val: boolean) => void;
  customPrice: string;
  setCustomPrice: (val: string) => void;
  customPriceColor: string;
  setCustomPriceColor: (val: string) => void;
  customPriceFontSize: number;
  setCustomPriceFontSize: (val: number) => void;
  customShowSku: boolean;
  setCustomShowSku: (val: boolean) => void;
  customSku: string;
  setCustomSku: (val: string) => void;
  customFill: string;
  setCustomFill: (val: string) => void;
  customStroke: string;
  setCustomStroke: (val: string) => void;
  customBorderRadius: number;
  setCustomBorderRadius: (val: number) => void;
  customVisibleFieldKeys: string[];
  setCustomVisibleFieldKeys: (keys: string[]) => void;
  customFieldOverrides: Record<string, { label?: string; value?: string; color?: string; fontSize?: number }>;
  setCustomFieldOverrides: React.Dispatch<React.SetStateAction<Record<string, { label?: string; value?: string; color?: string; fontSize?: number }>>>;
  customEditingFieldKey: string | null;
  setCustomEditingFieldKey: (key: string | null) => void;
  onResetToDefaults: (product: Product) => void;
  onInsertCustomizedProduct: () => void;
  isDark: boolean;
}

export const SingleProductCustomizerModal: React.FC<SingleProductCustomizerModalProps> = ({
  customizingProduct,
  onClose,
  currentPageIndex,
  categories,
  products,
  customCardTheme,
  setCustomCardTheme,
  customShowName,
  setCustomShowName,
  customTitle,
  setCustomTitle,
  customTitleColor,
  setCustomTitleColor,
  customTitleFontSize,
  setCustomTitleFontSize,
  customShowPrice,
  setCustomShowPrice,
  customPrice,
  setCustomPrice,
  customPriceColor,
  setCustomPriceColor,
  customPriceFontSize,
  setCustomPriceFontSize,
  customShowSku,
  setCustomShowSku,
  customSku,
  setCustomSku,
  customFill,
  setCustomFill,
  customStroke,
  setCustomStroke,
  customBorderRadius,
  setCustomBorderRadius,
  customVisibleFieldKeys,
  setCustomVisibleFieldKeys,
  customFieldOverrides,
  setCustomFieldOverrides,
  customEditingFieldKey,
  setCustomEditingFieldKey,
  onResetToDefaults,
  onInsertCustomizedProduct,
  isDark
}) => {
  if (!customizingProduct) return null;

  const cat = categories.find(c => String(c.id) === String(customizingProduct.categoryId));
  const img = resolveProductImage(customizingProduct, cat as any, products);
  const displayPrice = customPrice || (customizingProduct.price ? `${customizingProduct.currency || '₹'}${customizingProduct.price}` : '');
  const displaySku = customSku || customizingProduct.sku || '';
  const displayTitle = customTitle || customizingProduct.name || 'Product Title';

  const activeCustomFields = customVisibleFieldKeys
    .filter(k => k !== 'name' && k !== 'price' && k !== 'sku')
    .map(k => {
      const lbl = resolveFieldLabel(k, categories, customizingProduct) || k;
      const val = customFieldOverrides[k]?.value !== undefined
        ? customFieldOverrides[k].value
        : (k === 'description' ? customizingProduct.description : customizingProduct.customFields?.[k]);
      return { key: k, label: lbl, value: val || '-' };
    })
    .filter(f => f.value !== '-');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`w-full max-w-3xl max-h-[90vh] rounded-xl border flex flex-col shadow-2xl overflow-hidden ${
        isDark ? 'bg-[#121212] border-[#2e2e2e]' : 'bg-white border-slate-200'
      }`}>
        {/* Modal Header */}
        <div className={`px-5 py-4 border-b flex items-center justify-between ${
          isDark ? 'bg-[#181818] border-[#262626]' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0F3D3E] border border-[#E2DCC8]/30 flex items-center justify-center text-[#E2DCC8] shadow-sm">
              <Sliders size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-sm font-black uppercase tracking-wider ${isDark ? 'text-[#F1F1F1]' : 'text-slate-900'}`}>
                  Single Product Properties
                </h3>
                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-[#0F3D3E] text-[#E2DCC8] border border-[#E2DCC8]/20">
                  Target: Page {currentPageIndex + 1}
                </span>
              </div>
              <p className={`text-[10px] mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Customize card theme, fields, typography, and styling before placing on page.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors ${
              isDark ? 'text-slate-400 hover:text-white border-[#333] hover:bg-[#252525]' : 'text-slate-500 hover:text-slate-800 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body: 2 Columns (Controls + Live Preview) */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-12 gap-5 custom-scrollbar">
          {/* Left Column: Properties Controls (7 cols) */}
          <div className="md:col-span-7 space-y-4">
            {/* 1. Card Theme Selector */}
            <div className={`p-3.5 rounded-lg border space-y-2.5 ${isDark ? 'bg-[#181818] border-[#262626]' : 'bg-slate-50 border-slate-200'}`}>
              <label className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-[#E2DCC8]' : 'text-slate-800'}`}>
                <LayoutTemplate size={12} className="text-[#00a651]" /> Card Theme / Layout
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'classic-stack', label: 'Classic Stack', desc: 'Standard top image' },
                  { id: 'split-row', label: 'Split Row', desc: 'Side-by-side' },
                  { id: 'editorial-overlay', label: 'Editorial', desc: 'Badge overlay' },
                  { id: 'minimal-image', label: 'Minimal', desc: 'Clean photo focus' },
                  { id: 'minimal-pill', label: 'Minimal Pill', desc: 'Pill tags' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setCustomCardTheme(t.id as CardTheme)}
                    className={`p-2 rounded border text-left transition-all ${
                      customCardTheme === t.id
                        ? 'bg-[#0F3D3E] text-[#E2DCC8] border-[#E2DCC8]/50 shadow-sm ring-1 ring-[#0F3D3E]'
                        : (isDark ? 'bg-[#141414] text-slate-400 border-[#2a2a2a] hover:bg-[#1c1c1c] hover:text-white' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100')
                    }`}
                  >
                    <div className="text-[10px] font-bold leading-tight">{t.label}</div>
                    <div className="text-[8px] opacity-60 mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Title & Typography */}
            <div className={`p-3.5 rounded-lg border space-y-3 ${isDark ? 'bg-[#181818] border-[#262626]' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between">
                <label className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-[#E2DCC8]' : 'text-slate-800'}`}>
                  <Type size={12} className="text-[#00a651]" /> Product Title
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customShowName}
                    onChange={(e) => setCustomShowName(e.target.checked)}
                    className="rounded accent-[#0F3D3E]"
                  />
                  <span className={`text-[9px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Show</span>
                </label>
              </div>

              {customShowName && (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="Product title..."
                    className={`w-full px-3 py-1.5 text-xs rounded border outline-none font-bold ${
                      isDark ? 'bg-[#141414] border-[#333] text-[#F1F1F1] focus:border-[#0F3D3E]' : 'bg-white border-slate-300 text-slate-900 focus:border-[#0F3D3E]'
                    }`}
                  />
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Color:</span>
                      <input
                        type="color"
                        value={customTitleColor}
                        onChange={(e) => setCustomTitleColor(e.target.value)}
                        className="w-5 h-5 rounded cursor-pointer border border-slate-600 bg-transparent"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Size: {customTitleFontSize}px</span>
                      <input
                        type="range"
                        min={9}
                        max={22}
                        value={customTitleFontSize}
                        onChange={(e) => setCustomTitleFontSize(parseInt(e.target.value, 10))}
                        className="w-20 accent-[#0F3D3E]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Price & SKU */}
            <div className={`p-3.5 rounded-lg border grid grid-cols-2 gap-3 ${isDark ? 'bg-[#181818] border-[#262626]' : 'bg-slate-50 border-slate-200'}`}>
              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${isDark ? 'text-[#E2DCC8]' : 'text-slate-800'}`}>
                    <DollarSign size={11} className="text-[#00a651]" /> Price
                  </label>
                  <input
                    type="checkbox"
                    checked={customShowPrice}
                    onChange={(e) => setCustomShowPrice(e.target.checked)}
                    className="rounded accent-[#0F3D3E]"
                  />
                </div>
                {customShowPrice && (
                  <input
                    type="text"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    placeholder="₹290"
                    className={`w-full px-2.5 py-1 text-xs rounded border outline-none font-mono font-bold ${
                      isDark ? 'bg-[#141414] border-[#333] text-[#00a651] focus:border-[#0F3D3E]' : 'bg-white border-slate-300 text-[#00a651] focus:border-[#0F3D3E]'
                    }`}
                  />
                )}
              </div>

              {/* SKU */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${isDark ? 'text-[#E2DCC8]' : 'text-slate-800'}`}>
                    <Hash size={11} className="text-[#00a651]" /> SKU / Model
                  </label>
                  <input
                    type="checkbox"
                    checked={customShowSku}
                    onChange={(e) => setCustomShowSku(e.target.checked)}
                    className="rounded accent-[#0F3D3E]"
                  />
                </div>
                {customShowSku && (
                  <input
                    type="text"
                    value={customSku}
                    onChange={(e) => setCustomSku(e.target.value)}
                    placeholder="SKU-100"
                    className={`w-full px-2.5 py-1 text-xs rounded border outline-none font-mono ${
                      isDark ? 'bg-[#141414] border-[#333] text-[#F1F1F1] focus:border-[#0F3D3E]' : 'bg-white border-slate-300 text-slate-800 focus:border-[#0F3D3E]'
                    }`}
                  />
                )}
              </div>
            </div>

            {/* 4. Card Shell Styling */}
            <div className={`p-3.5 rounded-lg border space-y-2.5 ${isDark ? 'bg-[#181818] border-[#262626]' : 'bg-slate-50 border-slate-200'}`}>
              <label className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-[#E2DCC8]' : 'text-slate-800'}`}>
                <Palette size={12} className="text-[#00a651]" /> Card Style & Corners
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className={`text-[9px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Fill Color</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={customFill}
                      onChange={(e) => setCustomFill(e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border border-slate-600 bg-transparent"
                    />
                    <span className="text-[9px] font-mono opacity-80">{customFill}</span>
                  </div>
                </div>
                <div>
                  <span className={`text-[9px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Border Color</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={customStroke}
                      onChange={(e) => setCustomStroke(e.target.value)}
                      className="w-5 h-5 rounded cursor-pointer border border-slate-600 bg-transparent"
                    />
                    <span className="text-[9px] font-mono opacity-80">{customStroke}</span>
                  </div>
                </div>
                <div>
                  <span className={`text-[9px] block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Radius</span>
                  <div className="flex gap-1">
                    {[0, 4, 8, 16].map(r => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setCustomBorderRadius(r)}
                        className={`px-1.5 py-0.5 rounded text-[8px] font-bold border transition-colors ${
                          customBorderRadius === r
                            ? 'bg-[#0F3D3E] text-[#E2DCC8] border-[#E2DCC8]/40'
                            : (isDark ? 'bg-[#141414] text-slate-400 border-[#333]' : 'bg-white text-slate-600 border-slate-200')
                        }`}
                      >
                        {r}px
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Visible Fields & Custom Variables */}
            {customizingProduct.customFields && Object.keys(customizingProduct.customFields).length > 0 && (
              <div className={`p-3.5 rounded-lg border space-y-2.5 ${isDark ? 'bg-[#181818] border-[#262626]' : 'bg-slate-50 border-slate-200'}`}>
                <label className={`text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-[#E2DCC8]' : 'text-slate-800'}`}>
                  <Layers size={12} className="text-[#00a651]" /> Dynamic Custom Fields
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto custom-scrollbar">
                  {Object.entries(customizingProduct.customFields).map(([k, v]) => {
                    const isVisible = customVisibleFieldKeys.includes(k);
                    const resolvedLabel = resolveFieldLabel(k, categories, customizingProduct) || k;
                    const overrideVal = customFieldOverrides[k]?.value !== undefined ? customFieldOverrides[k].value : String(v || '');

                    return (
                      <div
                        key={k}
                        className={`p-2 rounded border flex items-center justify-between gap-2 transition-all ${
                          isVisible
                            ? (isDark ? 'bg-[#141414] border-[#333]' : 'bg-white border-slate-200')
                            : (isDark ? 'bg-[#141414]/40 border-[#222] opacity-50' : 'bg-slate-100 border-slate-200 opacity-50')
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <input
                            type="checkbox"
                            checked={isVisible}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCustomVisibleFieldKeys([...customVisibleFieldKeys, k]);
                              } else {
                                setCustomVisibleFieldKeys(customVisibleFieldKeys.filter(x => x !== k));
                              }
                            }}
                            className="rounded accent-[#0F3D3E]"
                          />
                          <span className={`text-[9.5px] font-bold truncate ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            {resolvedLabel}:
                          </span>
                          {customEditingFieldKey === k ? (
                            <input
                              type="text"
                              value={overrideVal}
                              onChange={(e) => setCustomFieldOverrides((prev: any) => ({
                                ...prev,
                                [k]: { ...prev[k], value: e.target.value }
                              }))}
                              onBlur={() => setCustomEditingFieldKey(null)}
                              autoFocus
                              className={`flex-1 px-1.5 py-0.5 text-[9px] rounded border outline-none ${
                                isDark ? 'bg-[#1c1c1c] border-[#0F3D3E] text-white' : 'bg-white border-[#0F3D3E] text-black'
                              }`}
                            />
                          ) : (
                            <span className={`text-[9px] truncate font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {overrideVal || '-'}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => setCustomEditingFieldKey(customEditingFieldKey === k ? null : k)}
                          className="text-[8.5px] font-bold text-[#00a651] hover:underline shrink-0"
                        >
                          {customEditingFieldKey === k ? 'Done' : 'Edit'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Visual Card Preview (5 cols) */}
          <div className="md:col-span-5 flex flex-col">
            <div className={`p-4 rounded-xl border flex-1 flex flex-col justify-between ${
              isDark ? 'bg-[#181818] border-[#262626]' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-[#2e2e2e]">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-black uppercase tracking-wider ${isDark ? 'text-[#E2DCC8]' : 'text-slate-700'}`}>
                      Live Card Preview
                    </span>
                    <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-slate-500/20 text-slate-400">
                      1:1 Real Canvas
                    </span>
                  </div>
                  <span className="text-[8.5px] font-mono uppercase bg-emerald-500/15 text-[#00a651] border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                    {customCardTheme.replace('-', ' ')}
                  </span>
                </div>

                {/* Resolved Product Image Preview */}
                <div
                  className="shadow-xl transition-all overflow-hidden relative"
                  style={{
                    backgroundColor: customFill,
                    borderColor: customStroke,
                    borderWidth: 1.5,
                    borderRadius: `${customBorderRadius}px`
                  }}
                >
                  {/* THEME 1: SPLIT ROW */}
                  {customCardTheme === 'split-row' ? (
                    <div className="p-3 grid grid-cols-12 gap-3 items-center min-h-[170px]">
                      <div className={`col-span-5 h-36 rounded overflow-hidden flex items-center justify-center border ${
                        isDark ? 'bg-[#0d0d0d] border-[#222]' : 'bg-slate-100 border-slate-200'
                      }`}>
                        {img ? (
                          <img src={img} alt={displayTitle} className="w-full h-full object-contain p-1" />
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-slate-500">
                            <Package size={22} />
                            <span className="text-[7.5px] uppercase">No Image</span>
                          </div>
                        )}
                      </div>

                      <div className="col-span-7 flex flex-col justify-between h-full space-y-2">
                        <div>
                          {customShowName && (
                            <h4
                              className="font-bold line-clamp-2 leading-tight"
                              style={{ color: customTitleColor, fontSize: `${customTitleFontSize}px` }}
                            >
                              {displayTitle}
                            </h4>
                          )}
                          {customShowSku && displaySku && (
                            <div className="text-[8.5px] font-mono mt-0.5 opacity-60">
                              SKU: {displaySku}
                            </div>
                          )}
                        </div>

                        {customShowPrice && displayPrice && (
                          <div
                            className="font-black font-mono"
                            style={{ color: customPriceColor, fontSize: `${customPriceFontSize}px` }}
                          >
                            {displayPrice}
                          </div>
                        )}

                        {activeCustomFields.length > 0 && (
                          <div className="border-t border-white/10 pt-1.5 space-y-0.5">
                            {activeCustomFields.slice(0, 3).map(f => (
                              <div key={f.key} className="flex justify-between text-[8px] font-mono">
                                <span className="opacity-60">{f.label}:</span>
                                <span className="font-bold truncate max-w-[80px]">{String(f.value)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : customCardTheme === 'editorial-overlay' ? (
                    /* THEME 2: EDITORIAL OVERLAY */
                    <div className="relative min-h-[220px] flex flex-col justify-between p-3 overflow-hidden">
                      <div className="absolute inset-0 z-0">
                        {img ? (
                          <img src={img} alt={displayTitle} className="w-full h-full object-cover opacity-80" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#0d0d0d] text-slate-600">
                            <Package size={40} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                      </div>

                      <div className="relative z-10 flex items-center justify-between gap-2">
                        {customShowSku && displaySku ? (
                          <span className="px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
                            {displaySku}
                          </span>
                        ) : <div />}
                        {customShowPrice && displayPrice && (
                          <span
                            className="px-2.5 py-0.5 rounded text-[10px] font-black font-mono shadow-md"
                            style={{ backgroundColor: customPriceColor, color: '#000000' }}
                          >
                            {displayPrice}
                          </span>
                        )}
                      </div>

                      <div className="relative z-10 mt-16 p-2 rounded bg-black/70 backdrop-blur-md border border-white/10 space-y-1">
                        {customShowName && (
                          <h4
                            className="font-bold line-clamp-2 leading-tight text-white"
                            style={{ fontSize: `${customTitleFontSize}px` }}
                          >
                            {displayTitle}
                          </h4>
                        )}
                        {activeCustomFields.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {activeCustomFields.slice(0, 3).map(f => (
                              <span key={f.key} className="text-[7.5px] font-mono bg-white/10 text-slate-200 px-1.5 py-0.5 rounded">
                                {f.label}: {String(f.value)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : customCardTheme === 'minimal-image' ? (
                    /* THEME 3: MINIMAL IMAGE */
                    <div className="p-2.5 space-y-2">
                      <div className={`w-full h-44 rounded overflow-hidden flex items-center justify-center border ${
                        isDark ? 'bg-[#0d0d0d] border-[#222]' : 'bg-slate-100 border-slate-200'
                      }`}>
                        {img ? (
                          <img src={img} alt={displayTitle} className="w-full h-full object-contain p-2" />
                        ) : (
                          <Package size={32} className="text-slate-500" />
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2 px-1">
                        {customShowName && (
                          <h4
                            className="font-bold truncate flex-1 leading-tight"
                            style={{ color: customTitleColor, fontSize: `${customTitleFontSize}px` }}
                          >
                            {displayTitle}
                          </h4>
                        )}
                        {customShowPrice && displayPrice && (
                          <span
                            className="font-bold font-mono shrink-0"
                            style={{ color: customPriceColor, fontSize: `${customPriceFontSize}px` }}
                          >
                            {displayPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : customCardTheme === 'minimal-pill' ? (
                    /* THEME 4: MINIMAL PILL */
                    <div className="p-3 space-y-2.5">
                      <div className={`w-full h-32 rounded overflow-hidden flex items-center justify-center border ${
                        isDark ? 'bg-[#0d0d0d] border-[#222]' : 'bg-slate-100 border-slate-200'
                      }`}>
                        {img ? (
                          <img src={img} alt={displayTitle} className="w-full h-full object-contain p-1" />
                        ) : (
                          <Package size={26} className="text-slate-500" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        {customShowName && (
                          <h4
                            className="font-bold truncate leading-tight"
                            style={{ color: customTitleColor, fontSize: `${customTitleFontSize}px` }}
                          >
                            {displayTitle}
                          </h4>
                        )}
                        {customShowPrice && displayPrice && (
                          <span
                            className="font-bold font-mono shrink-0"
                            style={{ color: customPriceColor, fontSize: `${customPriceFontSize}px` }}
                          >
                            {displayPrice}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {customShowSku && displaySku && (
                          <span className="px-2 py-0.5 rounded-full text-[8.5px] font-mono font-bold bg-[#0F3D3E] text-[#E2DCC8] border border-[#E2DCC8]/30">
                            SKU: {displaySku}
                          </span>
                        )}
                        {activeCustomFields.map(f => (
                          <span key={f.key} className="px-2 py-0.5 rounded-full text-[8px] font-mono bg-emerald-500/10 text-[#00a651] border border-emerald-500/30">
                            {f.label}: {String(f.value)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* THEME 5: CLASSIC STACK (DEFAULT) */
                    <div className="p-3 space-y-2.5">
                      <div className={`w-full h-32 rounded overflow-hidden flex items-center justify-center border ${
                        isDark ? 'bg-[#0f0f0f] border-[#222]' : 'bg-slate-100 border-slate-200'
                      }`}>
                        {img ? (
                          <img src={img} alt={displayTitle} className="w-full h-full object-contain p-1" />
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-slate-500">
                            <Package size={26} />
                            <span className="text-[8px] uppercase font-mono">No Image</span>
                          </div>
                        )}
                      </div>

                      {customShowName && (
                        <h4
                          className="font-bold line-clamp-2 leading-snug"
                          style={{ color: customTitleColor, fontSize: `${customTitleFontSize}px` }}
                        >
                          {displayTitle}
                        </h4>
                      )}

                      <div className="flex items-center justify-between gap-1">
                        {customShowPrice && displayPrice && (
                          <span
                            className="font-black font-mono"
                            style={{ color: customPriceColor, fontSize: `${customPriceFontSize}px` }}
                          >
                            {displayPrice}
                          </span>
                        )}
                        {customShowSku && displaySku && (
                          <span className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded border ${
                            isDark ? 'text-slate-400 bg-[#141414] border-[#262626]' : 'text-slate-600 bg-slate-100 border-slate-200'
                          }`}>
                            {displaySku}
                          </span>
                        )}
                      </div>

                      {activeCustomFields.length > 0 && (
                        <div className={`pt-2 border-t space-y-1 ${
                          isDark ? 'border-[#262626]' : 'border-slate-200'
                        }`}>
                          {activeCustomFields.map((f, idx) => (
                            <div
                              key={f.key}
                              className={`flex items-center justify-between px-1.5 py-0.5 rounded text-[8.5px] font-mono ${
                                idx % 2 === 1 ? (isDark ? 'bg-[#141414]/60' : 'bg-slate-100/60') : ''
                              }`}
                            >
                              <span className={`uppercase font-semibold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {f.label}:
                              </span>
                              <span className={`font-bold truncate max-w-[120px] ${isDark ? 'text-[#E2DCC8]' : 'text-slate-800'}`}>
                                {String(f.value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className={`mt-4 pt-3 border-t text-center text-[9px] ${isDark ? 'border-[#262626] text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                Real-time preview reflects chosen layout theme and canvas properties.
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className={`px-5 py-3.5 border-t flex items-center justify-between ${
          isDark ? 'bg-[#181818] border-[#262626]' : 'bg-slate-50 border-slate-200'
        }`}>
          <button
            type="button"
            onClick={() => onResetToDefaults(customizingProduct)}
            className={`px-3 py-1.5 rounded text-[10px] font-bold flex items-center gap-1.5 transition-colors ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <RotateCcw size={12} /> Reset to Defaults
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-3.5 py-1.5 rounded-[4px] border text-xs font-bold transition-colors ${
                isDark ? 'border-[#333] hover:bg-[#252525] text-slate-300' : 'border-slate-300 hover:bg-slate-100 text-slate-700'
              }`}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onInsertCustomizedProduct}
              className="px-4 py-1.5 rounded-[4px] bg-[#0F3D3E] hover:bg-[#155455] text-[#E2DCC8] border border-[#E2DCC8]/30 text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Package size={14} /> + Add Customized Card Block to Page {currentPageIndex + 1}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
