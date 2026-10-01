import React from 'react';
import {
  Image as ImageIcon, Plus, Trash2, ArrowUp, ArrowDown,
  Package, Layers, Copy
} from 'lucide-react';
import { ProductGridSection } from '../../../types';

interface GridSectionCardProps {
  sec: ProductGridSection;
  secIdx: number;
  totalSections: number;
  handleUpdateSection: (secIdx: number, updates: Partial<ProductGridSection>) => void;
  handleMoveSection: (secIdx: number, direction: 'up' | 'down') => void;
  handleDeleteSection: (secIdx: number) => void;
  setProductPickerSectionIdx: (idx: number) => void;
  handleUpdateTableCell: (secIdx: number, rowIdx: number, colIdx: number, val: string) => void;
  handleUpdateTableHeader: (secIdx: number, colIdx: number, val: string) => void;
  handleAddTableRow: (secIdx: number) => void;
  handleDuplicateTableRow: (secIdx: number, rowIdx: number) => void;
  handleDeleteTableRow: (secIdx: number, rowIdx: number) => void;
}

export const GridSectionCard: React.FC<GridSectionCardProps> = ({
  sec,
  secIdx,
  totalSections,
  handleUpdateSection,
  handleMoveSection,
  handleDeleteSection,
  setProductPickerSectionIdx,
  handleUpdateTableCell,
  handleUpdateTableHeader,
  handleAddTableRow,
  handleDuplicateTableRow,
  handleDeleteTableRow,
}) => {
  const sectionNumber = secIdx + 1;
  const positionLabel = secIdx === 0 ? 'Top' : (secIdx === totalSections - 1 ? 'Bottom' : 'Middle');

  return (
    <div
      className={`rounded-[6px] border transition-all ${
        sec.hasBackground
          ? 'border-[#0F3D3E]/60 bg-[#161b1c]'
          : 'border-[#262626] bg-[#181818]'
      }`}
    >
      {/* Section Card Top Header Bar */}
      <div className="px-4 py-2.5 border-b border-[#262626] flex items-center justify-between bg-[#141414]">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-[4px] bg-[#0F3D3E] text-[#E2DCC8] flex items-center justify-center text-xs font-black">
            {sectionNumber}
          </span>
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Section #{sectionNumber} ({positionLabel})
          </span>

          {sec.hasBackground && (
            <span className="px-2 py-0.5 rounded-[4px] bg-sky-950/60 border border-sky-600/40 text-sky-400 text-[9px] font-bold uppercase flex items-center gap-1">
              <Layers size={10} /> Highlight Stripe
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Fill from Catalog */}
          <button
            type="button"
            onClick={() => setProductPickerSectionIdx(secIdx)}
            className="px-2.5 py-1 bg-[#0F3D3E]/40 hover:bg-[#0F3D3E] border border-[#0F3D3E] text-[#E2DCC8] rounded-[4px] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Package size={12} />
            <span>Autofill Product</span>
          </button>

          {/* Move Up */}
          <button
            type="button"
            disabled={secIdx === 0}
            onClick={() => handleMoveSection(secIdx, 'up')}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-[#262626] disabled:opacity-20 transition-all"
            title="Move Section Up"
          >
            <ArrowUp size={14} />
          </button>

          {/* Move Down */}
          <button
            type="button"
            disabled={secIdx === totalSections - 1}
            onClick={() => handleMoveSection(secIdx, 'down')}
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-[#262626] disabled:opacity-20 transition-all"
            title="Move Section Down"
          >
            <ArrowDown size={14} />
          </button>

          {/* Delete Section */}
          {totalSections > 1 && (
            <button
              type="button"
              onClick={() => handleDeleteSection(secIdx)}
              className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-red-500/10 transition-all ml-1"
              title="Delete Section"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Section Card Content Grid: Image Left + Content Right */}
      <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (4 cols): Product Image & Controls */}
        <div className="lg:col-span-4 space-y-3">
          <label className="text-[10px] font-black uppercase tracking-wider text-[#888] flex items-center gap-1.5">
            <ImageIcon size={12} /> Product Image
          </label>

          <div className="h-44 rounded-[4px] border border-[#2a2a2a] bg-[#101010] relative flex flex-col items-center justify-center overflow-hidden p-2 group">
            {sec.imageSrc ? (
              <>
                <img
                  src={sec.imageSrc}
                  alt={sec.title}
                  className="w-full h-full object-contain transition-transform group-hover:scale-105"
                />
                <button
                  type="button"
                  onClick={() => handleUpdateSection(secIdx, { imageSrc: '' })}
                  className="absolute top-2 right-2 p-1.5 rounded-[4px] bg-black/70 text-white/80 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove image"
                >
                  <Trash2 size={13} />
                </button>
              </>
            ) : (
              <div className="text-center p-3">
                <div className="w-10 h-10 rounded-full bg-[#181818] border border-[#2a2a2a] flex items-center justify-center mx-auto mb-2 text-[#666]">
                  <ImageIcon size={18} />
                </div>
                <p className="text-[10px] text-[#777] font-medium mb-2">No image set</p>
                <button
                  type="button"
                  onClick={() => setProductPickerSectionIdx(secIdx)}
                  className="px-2.5 py-1 bg-[#222] hover:bg-[#2a2a2a] border border-[#333] text-slate-300 rounded-[4px] text-[9px] font-bold uppercase"
                >
                  Select from Catalog
                </button>
              </div>
            )}
          </div>

          {/* Image URL Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={sec.imageSrc || ''}
              onChange={(e) => handleUpdateSection(secIdx, { imageSrc: e.target.value })}
              placeholder="Paste image URL..."
              className="flex-1 px-2.5 py-1.5 rounded-[4px] bg-[#161616] border border-[#2e2e2e] focus:border-[#0F3D3E] text-[11px] font-mono outline-none text-slate-200 placeholder:text-[#555]"
            />
          </div>
        </div>

        {/* Right Column (8 cols): Title, Highlight Stripe & Table Specs */}
        <div className="lg:col-span-8 space-y-4">
          {/* Top Row: Series Title + Color + Highlight Stripe Toggle */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            {/* Title Input */}
            <div className="md:col-span-7 space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#888] flex items-center gap-1.5">
                Series Title
              </label>
              <input
                type="text"
                value={sec.title}
                onChange={(e) => handleUpdateSection(secIdx, { title: e.target.value })}
                placeholder="e.g. ULTRA SERIES COB DOWNLIGHT"
                className="w-full px-3 py-2 rounded-[4px] bg-[#161616] border border-[#2e2e2e] focus:border-[#0F3D3E] text-xs font-black outline-none tracking-wide text-white uppercase placeholder:text-[#555]"
              />
            </div>

            {/* Title Color */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#888]">
                Color
              </label>
              <div className="flex items-center gap-1.5 p-1 bg-[#161616] border border-[#2e2e2e] rounded-[4px]">
                <input
                  type="color"
                  value={sec.titleColor || '#00a651'}
                  onChange={(e) => handleUpdateSection(secIdx, { titleColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                />
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
                  {sec.titleColor || '#00a651'}
                </span>
              </div>
            </div>

            {/* Highlight Stripe Toggle & Color */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#888]">
                Highlight Stripe
              </label>
              <div className="flex items-center justify-between gap-2 p-1.5 bg-[#161616] border border-[#2e2e2e] rounded-[4px]">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={sec.hasBackground || false}
                    onChange={(e) => handleUpdateSection(secIdx, { hasBackground: e.target.checked })}
                    className="w-3.5 h-3.5 rounded border-[#444] accent-[#0F3D3E] cursor-pointer"
                  />
                  <span className="text-[10px] font-bold text-slate-300">Stripe</span>
                </label>

                {sec.hasBackground && (
                  <input
                    type="color"
                    value={sec.backgroundColor || '#e2e8f0'}
                    onChange={(e) => handleUpdateSection(secIdx, { backgroundColor: e.target.value })}
                    className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                    title="Stripe Color"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Specs Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#888]">
                Specifications & Variant Rows
              </label>

              <button
                type="button"
                onClick={() => handleAddTableRow(secIdx)}
                className="px-2 py-0.5 bg-[#1e1e1e] hover:bg-[#282828] border border-[#333] text-[#E2DCC8] rounded text-[10px] font-bold uppercase flex items-center gap-1 transition-all"
              >
                <Plus size={11} /> Add Row
              </button>
            </div>

            <div className="border border-[#2a2a2a] rounded-[4px] overflow-hidden bg-[#101010]">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr style={{ backgroundColor: sec.tableData?.headerBg || '#002838', color: '#ffffff' }}>
                      {sec.tableData?.headers.map((h, colIdx) => (
                        <th key={colIdx} className="p-1.5 border-r border-white/10 last:border-r-0 min-w-[90px]">
                          <input
                            type="text"
                            value={h}
                            onChange={(e) => handleUpdateTableHeader(secIdx, colIdx, e.target.value)}
                            className="w-full font-bold text-[10px] uppercase bg-transparent outline-none text-white placeholder-white/40"
                          />
                        </th>
                      ))}
                      <th className="w-16 p-1 text-center text-[9px] font-bold uppercase text-white/70">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222]">
                    {sec.tableData?.rows.map((row, rIdx) => (
                      <tr key={rIdx} className={rIdx % 2 === 1 ? 'bg-[#141414]' : 'bg-[#0e0e0e]'}>
                        {sec.tableData?.headers.map((_, colIdx) => (
                          <td key={colIdx} className="p-1 border-r border-[#222] last:border-r-0">
                            <input
                              type="text"
                              value={row[colIdx] ?? ''}
                              onChange={(e) => handleUpdateTableCell(secIdx, rIdx, colIdx, e.target.value)}
                              placeholder="-"
                              className="w-full px-1.5 py-1 bg-transparent text-[11px] font-medium text-slate-200 outline-none border border-transparent focus:border-[#0F3D3E] rounded"
                            />
                          </td>
                        ))}
                        <td className="p-1 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleDuplicateTableRow(secIdx, rIdx)}
                              className="p-1 text-slate-400 hover:text-white rounded"
                              title="Duplicate row"
                            >
                              <Copy size={11} />
                            </button>
                            <button
                              type="button"
                              disabled={(sec.tableData?.rows.length || 0) <= 1}
                              onClick={() => handleDeleteTableRow(secIdx, rIdx)}
                              className="p-1 text-slate-400 hover:text-red-400 rounded disabled:opacity-20"
                              title="Delete row"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
