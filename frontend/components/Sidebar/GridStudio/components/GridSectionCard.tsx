import React, { useState, useRef } from 'react';
import {
  ImageIcon, Upload, Palette, Plus, Trash2, ArrowUp, ArrowDown,
  Copy, ArrowRightLeft, Check, Sparkles, SlidersHorizontal, Package, X
} from 'lucide-react';
import { ProductGridSection, TableData, Category, Product, ProductVariant } from '../../../types';
import { normalizeImageUrl } from '../../../utils/imageUtils';
import { generateRowFromProduct } from '../utils/gridDataGenerators';
import { PRESET_TITLE_COLORS } from '../templates/defaultStyles';

interface GridSectionCardProps {
  sec: ProductGridSection;
  secIdx: number;
  totalSections: number;
  isHighlighted?: boolean;
  catalogPagesCount: number;
  currentPageIndex: number;
  categories: Category[];
  products: Product[];
  availableProductFields: string[];
  isDark: boolean;
  onUpdateSection: (secIdx: number, updates: Partial<ProductGridSection>) => void;
  onDeleteSection: (secIdx: number) => void;
  onMoveSection: (secIdx: number, direction: 'up' | 'down') => void;
  onMoveSectionToPage?: (fromPageIdx: number, toPageIdx: number, secIdx: number) => void;
  onOpenProductPicker: (secIdx: number) => void;
  onOpenImageGalleryPicker: (secIdx: number) => void;
  onUploadImageFile: (secIdx: number, file: File) => void;
  onOpenLinkRowModal: (secIdx: number, rIdx: number) => void;
  onAddTableRow: (secIdx: number) => void;
  onAddTableRowsWithData: (secIdx: number, rows: string[][], imageSrc?: string) => void;
  onDeleteTableRow: (secIdx: number, rIdx: number) => void;
  onDuplicateTableRow: (secIdx: number, rIdx: number) => void;
  onUpdateTableRowCell: (secIdx: number, rIdx: number, cIdx: number, val: string) => void;
  onAddTableColumn: (secIdx: number, paramName?: string) => void;
  onDeleteTableColumn: (secIdx: number, colIdx: number) => void;
  onAutofillTableColumn: (secIdx: number, colIdx: number, fieldKey: string) => void;
  onUpdateTableStyle: (secIdx: number, styleUpdates: Partial<TableData>) => void;
  isUploadingMedia?: boolean;
}

export const GridSectionCard: React.FC<GridSectionCardProps> = ({
  sec,
  secIdx,
  totalSections,
  isHighlighted = false,
  catalogPagesCount,
  currentPageIndex,
  categories,
  products,
  availableProductFields,
  isDark,
  onUpdateSection,
  onDeleteSection,
  onMoveSection,
  onMoveSectionToPage,
  onOpenProductPicker,
  onOpenImageGalleryPicker,
  onUploadImageFile,
  onOpenLinkRowModal,
  onAddTableRow,
  onAddTableRowsWithData,
  onDeleteTableRow,
  onDuplicateTableRow,
  onUpdateTableRowCell,
  onAddTableColumn,
  onDeleteTableColumn,
  onAutofillTableColumn,
  onUpdateTableStyle,
  isUploadingMedia = false
}) => {
  const [openStyleDrawer, setOpenStyleDrawer] = useState(false);
  const [activeFillMenuCol, setActiveFillMenuCol] = useState<number | null>(null);

  const sectionNumber = secIdx + 1;
  const posLabel = secIdx === 0 ? 'Top' : (secIdx === totalSections - 1 ? 'Bottom' : 'Middle');

  return (
    <div
      id={`grid-sec-card-${secIdx}`}
      className={`rounded-xl border transition-all shadow-md overflow-hidden ${
        isHighlighted
          ? isDark ? 'border-emerald-400 ring-2 ring-emerald-400/50 bg-[#162728]' : 'border-emerald-500 ring-2 ring-emerald-400/40 bg-emerald-50/50'
          : sec.hasBackground
          ? isDark ? 'border-[#0F3D3E]/70 bg-[#151b1c]' : 'border-teal-300/80 bg-teal-50/30'
          : isDark ? 'border-[#262626] bg-[#161616] hover:border-[#383838]' : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
      }`}
    >
      {/* Section Header Bar */}
      <div className={`px-3.5 py-2.5 border-b flex items-center justify-between transition-colors ${
        isDark ? 'border-[#242424] bg-[#191919]' : 'border-slate-200 bg-slate-50'
      }`}>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-[#0F3D3E] text-[#E2DCC8] flex items-center justify-center text-[10px] font-black shadow-sm shadow-[#0F3D3E]/40">
            {sectionNumber}
          </span>
          <span className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-[#E2DCC8]' : 'text-slate-800'}`}>
            Section #{sectionNumber} <span className={`${isDark ? 'text-slate-400' : 'text-slate-500'} font-medium text-[9.5px]`}>({posLabel})</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Fill from Product */}
          <button
            type="button"
            onClick={() => onOpenProductPicker(secIdx)}
            className={`px-2.5 py-1 border rounded-md text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm active:scale-95 ${
              isDark
                ? 'bg-[#0F3D3E]/40 hover:bg-[#0F3D3E] border-[#0F3D3E] text-[#E2DCC8]'
                : 'bg-[#0F3D3E] hover:bg-[#155455] border-[#0F3D3E] text-white'
            }`}
            title="Autofill from catalog product"
          >
            <Package size={11} className={isDark ? "text-[#E2DCC8]" : "text-white"} />
            <span>Fill</span>
          </button>

          {/* Move to another page quick selector */}
          {catalogPagesCount > 1 && onMoveSectionToPage && (
            <select
              value=""
              onChange={(e) => {
                const targetP = parseInt(e.target.value, 10);
                if (!isNaN(targetP)) {
                  onMoveSectionToPage(currentPageIndex, targetP, secIdx);
                }
              }}
              className={`px-2 py-1 border text-[8.5px] font-bold rounded-md outline-none cursor-pointer transition-colors ${
                isDark ? 'bg-[#1f1f1f] hover:bg-[#262626] border-[#333] text-[#E2DCC8]' : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
              }`}
              title="Move this section to another page"
            >
              <option value="" disabled>➔ Page...</option>
              {Array.from({ length: catalogPagesCount }).map((_, optIdx) => {
                if (optIdx === 0 || optIdx === currentPageIndex) return null;
                return (
                  <option key={optIdx} value={optIdx}>
                    To P{optIdx + 1}
                  </option>
                );
              })}
            </select>
          )}

          <div className={`flex items-center border rounded-md p-0.5 ${
            isDark ? 'bg-[#1f1f1f] border-[#2a2a2a]' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              type="button"
              disabled={secIdx === 0}
              onClick={() => onMoveSection(secIdx, 'up')}
              className={`p-1 rounded disabled:opacity-20 transition-all ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
              title="Move Section Up"
            >
              <ArrowUp size={11} />
            </button>

            <button
              type="button"
              disabled={secIdx === totalSections - 1}
              onClick={() => onMoveSection(secIdx, 'down')}
              className={`p-1 rounded disabled:opacity-20 transition-all ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
              title="Move Section Down"
            >
              <ArrowDown size={11} />
            </button>
          </div>

          {totalSections > 1 && (
            <button
              type="button"
              onClick={() => onDeleteSection(secIdx)}
              className={`p-1.5 rounded-md border border-transparent transition-all ${
                isDark ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20' : 'text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200'
              }`}
              title="Delete Section"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Section Body */}
      <div className="p-3.5 space-y-3.5">
        {/* 1. Image + Title Rows */}
        <div className="flex gap-3">
          {/* Left: Image thumbnail / upload / category image picker */}
          <div className="w-28 shrink-0 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className={`text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <ImageIcon size={11} className="text-[#0F3D3E]" /> Image
              </label>
              <button
                type="button"
                onClick={() => onOpenImageGalleryPicker(secIdx)}
                className={`text-[8.5px] font-bold px-2 py-0.5 rounded-full transition-colors shadow-sm ${
                  isDark ? 'text-[#E2DCC8] hover:text-white bg-[#0F3D3E] hover:bg-[#155355]' : 'text-white bg-[#0F3D3E] hover:bg-[#155355]'
                }`}
                title="Pick from Category Images & Photos"
              >
                Gallery
              </button>
            </div>

            <div className={`relative w-28 h-28 border rounded-lg overflow-hidden flex items-center justify-center group shadow-inner ${
              isDark ? 'bg-[#0c0c0c] border-[#2d2d2d]' : 'bg-slate-50 border-slate-200'
            }`}>
              {sec.imageSrc ? (
                <img
                  src={normalizeImageUrl(sec.imageSrc)}
                  alt={sec.title}
                  className="w-full h-full object-contain p-1.5 transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="text-center p-1 text-[#666]">
                  <Upload size={16} className={`mx-auto mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <span className={`text-[9px] block leading-none font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No Image</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/85 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-all duration-200 p-2">
                <button
                  type="button"
                  onClick={() => onOpenImageGalleryPicker(secIdx)}
                  className="px-2 py-1 bg-[#0F3D3E] text-[#E2DCC8] rounded-md text-[8.5px] font-bold uppercase tracking-wider w-full text-center hover:bg-[#155456] transition-colors shadow-sm cursor-pointer"
                >
                  Pick Photo
                </button>
                <label className="px-2 py-1 bg-[#242424] text-white rounded-md text-[8.5px] font-bold uppercase tracking-wider w-full text-center cursor-pointer hover:bg-[#333] transition-colors shadow-sm">
                  {isUploadingMedia ? 'Uploading...' : 'Upload'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploadingMedia}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        onUploadImageFile(secIdx, file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Right: Title + Color + Stripe */}
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <label className={`text-[9px] font-black uppercase tracking-wider block mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Series / Section Title
              </label>
              <input
                type="text"
                value={sec.title}
                onChange={(e) => onUpdateSection(secIdx, { title: e.target.value })}
                placeholder="SERIES TITLE..."
                className={`w-full px-3 py-1.5 border rounded-lg text-xs font-black outline-none focus:border-[#0F3D3E] focus:ring-1 focus:ring-[#0F3D3E] shadow-inner transition-all ${
                  isDark ? 'bg-[#0f0f0f] border-[#2d2d2d]' : 'bg-white border-slate-300'
                }`}
                style={{ color: sec.titleColor || '#00a651' }}
              />
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
              <div className="flex items-center gap-1.5">
                <span className={`text-[8.5px] font-bold uppercase ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Color:</span>
                <div className="flex items-center gap-1">
                  {PRESET_TITLE_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => onUpdateSection(secIdx, { titleColor: c })}
                      className={`w-4 h-4 rounded-full border transition-transform cursor-pointer ${
                        sec.titleColor === c ? 'scale-125 ring-2 ring-[#00a651] border-white' : isDark ? 'border-[#333] hover:scale-110' : 'border-slate-300 hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                  <input
                    type="color"
                    value={sec.titleColor || '#00a651'}
                    onChange={(e) => onUpdateSection(secIdx, { titleColor: e.target.value })}
                    className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent"
                    title="Custom Color"
                  />
                </div>
              </div>

              {/* Highlight Stripe Toggle */}
              <label className={`flex items-center gap-1.5 text-[9px] font-bold cursor-pointer select-none px-2.5 py-1 rounded-md border transition-all ${
                sec.hasBackground
                  ? isDark ? 'bg-[#0F3D3E]/30 text-[#E2DCC8] border-[#0F3D3E]' : 'bg-teal-50 text-teal-800 border-teal-300'
                  : isDark ? 'bg-[#141414] text-slate-400 border-[#262626] hover:text-white' : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
              }`}>
                <input
                  type="checkbox"
                  checked={sec.hasBackground}
                  onChange={(e) => onUpdateSection(secIdx, { hasBackground: e.target.checked })}
                  className="rounded text-[#0F3D3E] focus:ring-0 cursor-pointer w-3 h-3"
                />
                <span>Stripe</span>
                {sec.hasBackground && (
                  <input
                    type="color"
                    value={sec.backgroundColor || '#e2e8f0'}
                    onChange={(e) => onUpdateSection(secIdx, { backgroundColor: e.target.value })}
                    className="w-3.5 h-3.5 rounded cursor-pointer border-0 bg-transparent ml-0.5"
                    title="Stripe Background Color"
                  />
                )}
              </label>
            </div>
          </div>
        </div>

        {/* 2. Specifications Table */}
        <div className={`space-y-2 pt-2.5 border-t ${isDark ? 'border-[#242424]' : 'border-slate-200'}`}>
          <div className="flex items-center justify-between flex-wrap gap-1.5">
            <span className={`text-[9.5px] font-black uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-[#E2DCC8]' : 'text-slate-800'}`}>
              <Palette size={12} className="text-[#00a651]" />
              Specs Table <span className={`${isDark ? 'text-slate-400' : 'text-slate-500'} font-normal font-mono text-[8.5px]`}>({sec.tableData.rows.length} rows)</span>
            </span>

            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Style Drawer Toggle */}
              <button
                type="button"
                onClick={() => setOpenStyleDrawer(!openStyleDrawer)}
                className={`px-2 py-1 rounded-md text-[9px] font-bold flex items-center gap-1 transition-all border cursor-pointer ${
                  openStyleDrawer
                    ? isDark ? 'bg-[#0F3D3E] text-[#E2DCC8] border-[#0F3D3E] shadow-sm' : 'bg-[#0F3D3E] text-white border-[#0F3D3E] shadow-sm'
                    : isDark ? 'bg-[#181818] hover:bg-[#222] border-[#333] text-slate-300 hover:text-white' : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700 shadow-sm'
                }`}
                title="Customize Table Style, Colors & Sizing"
              >
                <Palette size={11} />
                <span>Style</span>
              </button>

              {/* Category / Product Row Dropdown */}
              <select
                value=""
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;

                  if (val.startsWith('prod:')) {
                    const prodId = val.replace('prod:', '');
                    const p = products.find(prod => String(prod.id) === String(prodId));
                    if (p) {
                      if (p.variants && p.variants.length > 0) {
                        const rows = p.variants.map(v => generateRowFromProduct(sec.tableData.headers, p, v, categories));
                        onAddTableRowsWithData(secIdx, rows, p.image);
                      } else {
                        const row = generateRowFromProduct(sec.tableData.headers, p, undefined, categories);
                        onAddTableRowsWithData(secIdx, [row], p.image);
                      }
                    }
                  } else if (val.startsWith('cat:')) {
                    const catId = val.replace('cat:', '');
                    const catProducts = products.filter(p => String(p.categoryId) === String(catId));
                    const allRows: string[][] = [];
                    catProducts.forEach(p => {
                      if (p.variants && p.variants.length > 0) {
                        p.variants.forEach(v => allRows.push(generateRowFromProduct(sec.tableData.headers, p, v, categories)));
                      } else {
                        allRows.push(generateRowFromProduct(sec.tableData.headers, p, undefined, categories));
                      }
                    });
                    if (allRows.length > 0) {
                      onAddTableRowsWithData(secIdx, allRows, catProducts[0]?.image);
                    }
                  }
                }}
                className={`px-2.5 py-1 border rounded-md text-[9px] font-bold outline-none cursor-pointer transition-colors shadow-sm ${
                  isDark ? 'bg-[#102728] hover:bg-[#153436] border-[#0F3D3E] text-[#E2DCC8]' : 'bg-teal-50 hover:bg-teal-100 border-teal-300 text-teal-900'
                }`}
              >
                <option value="" disabled>+ Insert Product Rows...</option>
                {categories.map(cat => {
                  const catProds = products.filter(p => p.categoryId === cat.id);
                  if (catProds.length === 0) return null;
                  return (
                    <optgroup key={cat.id} label={`📂 ${cat.name.toUpperCase()}`}>
                      <option value={`cat:${cat.id}`}>⚡ Insert All ({catProds.length} Products)</option>
                      {catProds.map(p => (
                        <option key={p.id} value={`prod:${p.id}`}>
                          • {p.name} {p.sku ? `(${p.sku})` : ''} {p.variants?.length ? `[${p.variants.length} vars]` : ''}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>

              {/* Product Field / Column Selector Dropdown */}
              <select
                value=""
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    onAddTableColumn(secIdx, val);
                  }
                }}
                className={`px-2 py-1 border rounded-md text-[9px] font-bold outline-none cursor-pointer transition-colors shadow-sm ${
                  isDark ? 'bg-[#122827] hover:bg-[#183433] border-[#0F3D3E] text-[#E2DCC8]' : 'bg-teal-50 hover:bg-teal-100 border-teal-300 text-teal-900'
                }`}
                title="Add field / column from product data"
              >
                <option value="" disabled>+ Add Column...</option>
                {availableProductFields.length > 0 && (
                  <optgroup label="📋 Fields in Your Product Data">
                    {availableProductFields.map(fKey => (
                      <option key={fKey} value={fKey}>✨ {fKey}</option>
                    ))}
                  </optgroup>
                )}
              </select>

              <button
                type="button"
                onClick={() => onAddTableRow(secIdx)}
                className={`px-2 py-1 border rounded-md text-[9px] font-bold flex items-center gap-1 transition-all shadow-sm cursor-pointer ${
                  isDark ? 'bg-[#1c1c1c] hover:bg-[#252525] border-[#333] text-[#E2DCC8] hover:text-white' : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
                }`}
                title="Add Blank Row"
              >
                <Plus size={11} className={isDark ? "text-[#E2DCC8]" : "text-slate-700"} />
                <span>Row</span>
              </button>
            </div>
          </div>

          {/* Table Style Customization Drawer */}
          {openStyleDrawer && (
            <div className={`p-2.5 border rounded-lg mb-2 space-y-2 text-[9px] animate-in fade-in duration-150 ${
              isDark ? 'bg-[#101010] border-[#2a2a2a]' : 'bg-slate-50 border-slate-200 shadow-sm'
            }`}>
              <div className={`flex items-center justify-between pb-1 border-b ${isDark ? 'border-[#222]' : 'border-slate-200'}`}>
                <span className={`font-bold uppercase tracking-wider flex items-center gap-1 ${isDark ? 'text-[#E2DCC8]' : 'text-slate-800'}`}>
                  <Palette size={10} className="text-emerald-500" /> Table Styles & Dimensions
                </span>
                <button
                  type="button"
                  onClick={() => setOpenStyleDrawer(false)}
                  className={`transition-colors cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  <X size={11} />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-0.5">
                {/* Header BG */}
                <div>
                  <label className={`block text-[8px] font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Header Background</label>
                  <div className="flex items-center gap-1">
                    {['#002b36', '#0F3D3E', '#0f172a', '#4c0519', '#18181b'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => onUpdateTableStyle(secIdx, { headerBg: c })}
                        className={`w-3.5 h-3.5 rounded-full border transition-transform cursor-pointer ${
                          sec.tableData.headerBg === c ? 'scale-125 ring-2 ring-emerald-400 border-white' : isDark ? 'border-[#333]' : 'border-slate-300'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <input
                      type="color"
                      value={sec.tableData.headerBg || '#002b36'}
                      onChange={(e) => onUpdateTableStyle(secIdx, { headerBg: e.target.value })}
                      className="w-3.5 h-3.5 rounded cursor-pointer border-0 bg-transparent"
                    />
                  </div>
                </div>

                {/* Header Text Color */}
                <div>
                  <label className={`block text-[8px] font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Header Text</label>
                  <div className="flex items-center gap-1">
                    {['#ffffff', '#f8fafc', '#e2e8f0', '#fbbf24'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => onUpdateTableStyle(secIdx, { headerTextColor: c })}
                        className={`w-3.5 h-3.5 rounded-full border transition-transform cursor-pointer ${
                          sec.tableData.headerTextColor === c ? 'scale-125 ring-2 ring-emerald-400 border-white' : isDark ? 'border-[#333]' : 'border-slate-300'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <input
                      type="color"
                      value={sec.tableData.headerTextColor || '#ffffff'}
                      onChange={(e) => onUpdateTableStyle(secIdx, { headerTextColor: e.target.value })}
                      className="w-3.5 h-3.5 rounded cursor-pointer border-0 bg-transparent"
                    />
                  </div>
                </div>

                {/* Alternating Row Color */}
                <div>
                  <label className={`block text-[8px] font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Zebra Row Tint</label>
                  <div className="flex items-center gap-1">
                    {['#f8fafc', '#f1f5f9', '#f0fdf4', '#ecfdf5', '#ffffff'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => onUpdateTableStyle(secIdx, { alternateRowBg: c })}
                        className={`w-3.5 h-3.5 rounded-full border transition-transform cursor-pointer ${
                          sec.tableData.alternateRowBg === c ? 'scale-125 ring-2 ring-emerald-400 border-white' : isDark ? 'border-[#333]' : 'border-slate-300'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <input
                      type="color"
                      value={sec.tableData.alternateRowBg || '#f8fafc'}
                      onChange={(e) => onUpdateTableStyle(secIdx, { alternateRowBg: e.target.value })}
                      className="w-3.5 h-3.5 rounded cursor-pointer border-0 bg-transparent"
                    />
                  </div>
                </div>

                {/* Border Color */}
                <div>
                  <label className={`block text-[8px] font-bold uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Border Color</label>
                  <div className="flex items-center gap-1">
                    {['#002b36', '#0F3D3E', '#cbd5e1', '#94a3b8', '#1e293b'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => onUpdateTableStyle(secIdx, { borderColor: c })}
                        className={`w-3.5 h-3.5 rounded-full border transition-transform cursor-pointer ${
                          sec.tableData.borderColor === c ? 'scale-125 ring-2 ring-emerald-400 border-white' : isDark ? 'border-[#333]' : 'border-slate-300'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <input
                      type="color"
                      value={sec.tableData.borderColor || '#002b36'}
                      onChange={(e) => onUpdateTableStyle(secIdx, { borderColor: e.target.value })}
                      className="w-3.5 h-3.5 rounded cursor-pointer border-0 bg-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Table Spreadsheet Editor */}
          <div className={`border rounded-lg overflow-x-auto shadow-inner ${
            isDark ? 'border-[#262626] bg-[#0c0c0c]' : 'border-slate-300 bg-white'
          }`}>
            <table className="w-full text-left border-collapse text-[9.5px]">
              <thead>
                <tr style={{ backgroundColor: sec.tableData.headerBg || '#002b36', color: sec.tableData.headerTextColor || '#ffffff' }}>
                  <th className="p-1 text-center w-6 border-r border-white/20 text-[8px] font-mono">#</th>
                  {sec.tableData.headers.map((h, colIdx) => (
                    <th key={colIdx} className="p-1 font-black border-r border-white/20 relative group">
                      <div className="flex items-center justify-between gap-1">
                        <input
                          type="text"
                          value={h}
                          onChange={(e) => {
                            const newHeaders = [...sec.tableData.headers];
                            newHeaders[colIdx] = e.target.value;
                            onUpdateSection(secIdx, {
                              tableData: { ...sec.tableData, headers: newHeaders }
                            });
                          }}
                          className="bg-transparent border-none text-[9.5px] font-black outline-none w-full p-0 uppercase"
                          style={{ color: sec.tableData.headerTextColor || '#ffffff' }}
                        />
                        {/* Autofill Magic Button */}
                        <div className="relative shrink-0">
                          <button
                            type="button"
                            onClick={() => setActiveFillMenuCol(activeFillMenuCol === colIdx ? null : colIdx)}
                            className="opacity-60 group-hover:opacity-100 hover:text-amber-300 transition-opacity p-0.5 cursor-pointer"
                            title="Autofill this column from product attributes"
                          >
                            <Sparkles size={10} />
                          </button>
                          {activeFillMenuCol === colIdx && (
                            <div className={`absolute right-0 top-full mt-1 z-50 w-44 rounded-md border shadow-xl p-1 text-[9px] ${
                              isDark ? 'bg-[#1a1a1a] border-[#333] text-white' : 'bg-white border-slate-200 text-slate-800'
                            }`}>
                              <div className="font-bold px-1.5 py-0.5 text-[8px] uppercase tracking-wider text-slate-400 border-b border-slate-200/20 mb-1">
                                Autofill Column with:
                              </div>
                              {availableProductFields.map(f => (
                                <button
                                  key={f}
                                  type="button"
                                  onClick={() => {
                                    onAutofillTableColumn(secIdx, colIdx, f);
                                    setActiveFillMenuCol(null);
                                  }}
                                  className={`w-full text-left px-1.5 py-1 rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
                                    isDark ? 'hover:bg-[#282828]' : 'hover:bg-slate-100'
                                  }`}
                                >
                                  <Sparkles size={9} className="text-amber-400 shrink-0" />
                                  <span className="truncate">{f}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {sec.tableData.headers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => onDeleteTableColumn(secIdx, colIdx)}
                            className="opacity-0 group-hover:opacity-100 text-red-300 hover:text-red-100 transition-opacity p-0.5 cursor-pointer"
                            title="Delete Column"
                          >
                            <Trash2 size={10} />
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="p-1 text-center w-14 border-white/20 text-[8px] font-mono">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sec.tableData.rows.map((row, rIdx) => {
                  const isAlt = rIdx % 2 === 1;
                  return (
                    <tr
                      key={rIdx}
                      className={`border-b group/row ${
                        isDark
                          ? (isAlt ? 'bg-[#141414]' : 'bg-[#0f0f0f]')
                          : (isAlt ? 'bg-slate-50' : 'bg-white')
                      }`}
                      style={{
                        borderColor: sec.tableData.borderColor || (isDark ? '#262626' : '#e2e8f0')
                      }}
                    >
                      <td className="p-1 text-center font-mono text-[8px] opacity-50 border-r border-slate-700/20">
                        {rIdx + 1}
                      </td>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-1 border-r border-slate-700/20">
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) => onUpdateTableRowCell(secIdx, rIdx, cIdx, e.target.value)}
                            className={`w-full bg-transparent border-none text-[9.5px] outline-none p-0 font-medium ${
                              isDark ? 'text-[#F1F1F1]' : 'text-slate-900'
                            }`}
                          />
                        </td>
                      ))}
                      <td className="p-1 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-60 group-hover/row:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => onOpenLinkRowModal(secIdx, rIdx)}
                            className={`p-0.5 rounded transition-colors cursor-pointer ${
                              isDark ? 'text-teal-400 hover:bg-teal-500/20' : 'text-teal-600 hover:bg-teal-50'
                            }`}
                            title="Link / Fill Row from Product"
                          >
                            <ArrowRightLeft size={10} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDuplicateTableRow(secIdx, rIdx)}
                            className={`p-0.5 rounded transition-colors cursor-pointer ${
                              isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                            }`}
                            title="Duplicate Row"
                          >
                            <Copy size={10} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteTableRow(secIdx, rIdx)}
                            className={`p-0.5 rounded transition-colors cursor-pointer ${
                              isDark ? 'text-red-400 hover:bg-red-500/20' : 'text-red-600 hover:bg-red-50'
                            }`}
                            title="Delete Row"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
