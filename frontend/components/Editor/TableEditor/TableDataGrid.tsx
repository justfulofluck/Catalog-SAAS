import React from 'react';
import {
  Plus, Trash2, ArrowUp, ArrowDown, Copy, Package,
  Zap, X, ChevronDown, ListFilter, Sparkles
} from 'lucide-react';
import { TableData, Product } from '../../../types';
import { matchRowToProduct } from './constants';

interface TableDataGridProps {
  isDark: boolean;
  tableData: TableData;
  products: Product[];
  availableParams: { key: string; label: string; group: string; icon?: string }[];
  isAddColMenuOpen: boolean;
  setIsAddColMenuOpen: (open: boolean) => void;
  addColMenuRef: React.RefObject<HTMLDivElement | null>;
  activeColParamMenu: number | null;
  setActiveColParamMenu: (idx: number | null) => void;
  colParamMenuRef: React.RefObject<HTMLDivElement | null>;
  handleAddColumn: () => void;
  handleAddColumnWithParam: (paramKey: string, paramLabel: string) => void;
  handleHeaderChange: (colIdx: number, val: string) => void;
  handleFillColumnFromParam: (colIdx: number, paramKey: string, paramLabel: string) => void;
  handleDeleteColumn: (colIdx: number) => void;
  handleCellChange: (rowIdx: number, colIdx: number, val: string) => void;
  handleAddRow: () => void;
  handleDuplicateRow: (rowIdx: number) => void;
  handleDeleteRow: (rowIdx: number) => void;
  handleMoveRow: (rowIdx: number, direction: 'up' | 'down') => void;
  setRowToLinkIdx: (idx: number | null) => void;
  setIsProductPickerOpen: (open: boolean) => void;
}

export const TableDataGrid: React.FC<TableDataGridProps> = ({
  isDark,
  tableData,
  products,
  availableParams,
  isAddColMenuOpen,
  setIsAddColMenuOpen,
  addColMenuRef,
  activeColParamMenu,
  setActiveColParamMenu,
  colParamMenuRef,
  handleAddColumn,
  handleAddColumnWithParam,
  handleHeaderChange,
  handleFillColumnFromParam,
  handleDeleteColumn,
  handleCellChange,
  handleAddRow,
  handleDuplicateRow,
  handleDeleteRow,
  handleMoveRow,
  setRowToLinkIdx,
  setIsProductPickerOpen,
}) => {
  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Add Column Button with Dropdown */}
          <div className="relative" ref={addColMenuRef}>
            <button
              type="button"
              onClick={() => setIsAddColMenuOpen(!isAddColMenuOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-bold border transition-all ${
                isDark
                  ? 'bg-[#181818] hover:bg-[#222222] text-white border-[#2e2e2e]'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-sm'
              }`}
            >
              <Plus size={13} />
              <span>Add Column</span>
              <ChevronDown size={11} className={`ml-1 transition-transform ${isAddColMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isAddColMenuOpen && (
              <div className={`absolute left-0 top-full mt-1 w-60 rounded-[4px] shadow-2xl border z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150 ${
                isDark ? 'bg-[#1a1a1a] border-[#2e2e2e] text-white' : 'bg-white border-slate-200 text-slate-800 shadow-xl'
              }`}>
                <button
                  type="button"
                  onClick={handleAddColumn}
                  className={`w-full text-left px-2.5 py-1.5 rounded-[4px] text-xs font-bold flex items-center gap-2 ${
                    isDark ? 'hover:bg-[#262626] text-white' : 'hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  <Plus size={13} />
                  <span>Blank Column</span>
                </button>

                <div className={`my-1 border-t ${isDark ? 'border-[#262626]' : 'border-slate-200'}`} />

                <span className={`px-2 text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                  isDark ? 'text-[#888]' : 'text-slate-400'
                }`}>
                  Auto-fill Product Parameter
                </span>

                <div className="max-h-52 overflow-y-auto custom-scrollbar space-y-0.5">
                  {availableParams.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleAddColumnWithParam(p.key, p.label)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-[4px] text-xs font-medium flex items-center justify-between transition-colors ${
                        isDark ? 'text-slate-200 hover:bg-[#0F3D3E]/20 hover:text-[#E2DCC8]' : 'text-slate-700 hover:bg-teal-50 hover:text-teal-900'
                      }`}
                    >
                      <span className="truncate">{p.label}</span>
                      <span className={`text-[9px] uppercase tracking-wider shrink-0 ${isDark ? 'text-[#888]' : 'text-slate-400'}`}>
                        {p.group}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Add Row Button */}
          <button
            type="button"
            onClick={handleAddRow}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-bold border transition-all ${
              isDark
                ? 'bg-[#181818] hover:bg-[#222222] text-white border-[#2e2e2e]'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-sm'
            }`}
          >
            <Plus size={13} />
            <span>Add Row</span>
          </button>

          {/* Add Product as Row */}
          <button
            type="button"
            onClick={() => {
              setRowToLinkIdx(null);
              setIsProductPickerOpen(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-bold border transition-all ${
              isDark
                ? 'bg-[#181818] hover:bg-[#222222] text-[#E2DCC8] border-[#E2DCC8]/30'
                : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border-teal-300 shadow-sm'
            }`}
          >
            <Package size={13} className={isDark ? 'text-[#E2DCC8]' : 'text-teal-600'} />
            <span>Add from Catalog</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 font-medium">
          Tip: Click <span className="text-amber-400 font-bold">Fill</span> on any header to auto-populate from catalog products!
        </div>
      </div>

      {/* Main Table Spreadsheet Grid */}
      <div className={`border rounded-[6px] overflow-hidden shadow-md ${
        isDark ? 'border-[#262626] bg-[#121212]' : 'border-slate-200 bg-white'
      }`}>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            {/* Table Headers */}
            <thead>
              <tr style={{ backgroundColor: tableData.headerBg || '#002b36', color: tableData.headerTextColor || '#ffffff' }}>
                <th className="w-10 px-2 py-2 text-center text-[10px] font-bold uppercase tracking-wider opacity-70 border-r border-white/10">
                  #
                </th>
                {tableData.headers.map((header, colIdx) => (
                  <th
                    key={colIdx}
                    className="p-1.5 border-r border-white/10 last:border-r-0 min-w-[140px] max-w-[240px]"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between gap-1">
                        <input
                          type="text"
                          value={header}
                          onChange={(e) => handleHeaderChange(colIdx, e.target.value)}
                          className="w-full font-black text-xs px-2 py-1 rounded-[3px] bg-black/20 hover:bg-black/30 focus:bg-black/40 outline-none text-white transition-all border border-transparent focus:border-white/40"
                          placeholder={`COL ${colIdx + 1}`}
                        />

                        {/* Quick fill column with parameter */}
                        <div className="flex items-center gap-0.5 shrink-0">
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveColParamMenu(activeColParamMenu === colIdx ? null : colIdx);
                              }}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all ${
                                activeColParamMenu === colIdx
                                  ? 'bg-[#0F3D3E] text-white shadow-sm'
                                  : 'bg-white/15 hover:bg-white/25 text-amber-300'
                              }`}
                              title="Auto-fill this column with product parameter data"
                            >
                              <Zap size={10} className="text-amber-400" />
                              <span>Fill</span>
                            </button>

                            {/* Parameter autofill menu for this column */}
                            {activeColParamMenu === colIdx && (
                              <div
                                ref={colParamMenuRef}
                                className={`absolute left-0 top-full mt-2 w-64 rounded-[4px] shadow-2xl border z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150 ${
                                  isDark ? 'bg-[#1a1a1a] border-[#2e2e2e] text-white' : 'bg-white border-slate-200 text-slate-800 shadow-xl'
                                }`}
                              >
                                <div className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider border-b flex justify-between items-center ${
                                  isDark ? 'text-[#888] border-[#262626]' : 'text-slate-500 border-slate-200'
                                }`}>
                                  <span>Auto-fill &quot;{header}&quot;</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveColParamMenu(null);
                                    }}
                                    className={isDark ? "text-[#888] hover:text-white" : "text-slate-400 hover:text-slate-800"}
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                                <p className={`px-2 py-1 text-[10px] leading-tight ${isDark ? 'text-[#888]' : 'text-slate-500'}`}>
                                  Select a parameter to populate all rows:
                                </p>
                                <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-0.5">
                                  {availableParams.map((p, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => handleFillColumnFromParam(colIdx, p.key, p.label)}
                                      className={`w-full text-left px-2.5 py-1.5 rounded-[4px] text-xs font-medium flex items-center justify-between transition-colors ${
                                        isDark ? 'text-slate-200 hover:bg-[#0F3D3E]/20 hover:text-[#E2DCC8]' : 'text-slate-700 hover:bg-teal-50 hover:text-teal-900'
                                      }`}
                                    >
                                      <span>{p.label}</span>
                                      <span className={`text-[9px] uppercase ${isDark ? 'text-[#888]' : 'text-slate-400'}`}>{p.group}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={tableData.headers.length <= 1}
                          onClick={() => handleDeleteColumn(colIdx)}
                          className="p-1 hover:text-red-300 hover:bg-red-500/20 rounded disabled:opacity-20 transition-all"
                          title="Delete Column"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </div>
                  </th>
                ))}
                <th className="w-24 px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wider opacity-70">
                  Actions
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className={`divide-y ${isDark ? 'divide-[#262626]' : 'divide-slate-200'}`}>
              {tableData.rows.map((row, rIdx) => {
                const matchedProd = matchRowToProduct(row, products);

                return (
                  <tr
                    key={rIdx}
                    className={`group transition-colors ${
                      isDark
                        ? `${rIdx % 2 === 1 ? 'bg-[#141414]' : 'bg-[#101010]'} hover:bg-[#1f1f1f]`
                        : `${rIdx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'} hover:bg-teal-50/40`
                    }`}
                  >
                    {/* Row Index Badge */}
                    <td className={`px-2 py-2 text-center text-[11px] font-bold select-none border-r ${
                      isDark ? 'text-[#666] border-[#262626]' : 'text-slate-400 border-slate-200'
                    }`}>
                      <div className="flex flex-col items-center">
                        <span>{rIdx + 1}</span>
                        {matchedProd && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5" title={`Linked: ${matchedProd.product.name}`} />
                        )}
                      </div>
                    </td>

                    {/* Cells */}
                    {tableData.headers.map((_, colIdx) => {
                      const cellValue = row[colIdx] ?? '';
                      return (
                        <td key={colIdx} className={`p-1 border-r last:border-r-0 ${
                          isDark ? 'border-[#262626]' : 'border-slate-200'
                        }`}>
                          <input
                            type="text"
                            value={cellValue}
                            onChange={(e) => handleCellChange(rIdx, colIdx, e.target.value)}
                            placeholder="-"
                            className={`w-full px-2.5 py-1.5 rounded-[4px] text-xs font-medium outline-none transition-all border border-transparent focus:border-[#0F3D3E] bg-transparent ${
                              isDark
                                ? 'text-slate-100 placeholder:text-[#555] hover:bg-[#1a1a1a]'
                                : 'text-slate-800 placeholder:text-slate-400 hover:bg-slate-50'
                            }`}
                          />
                        </td>
                      );
                    })}

                    {/* Row Actions */}
                    <td className="px-2 py-1 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                        {/* Fill row from Product */}
                        <button
                          type="button"
                          onClick={() => {
                            setRowToLinkIdx(rIdx);
                            setIsProductPickerOpen(true);
                          }}
                          className={`p-1 rounded ${
                            isDark ? 'text-slate-400 hover:text-teal-400 hover:bg-[#202020]' : 'text-slate-500 hover:text-[#0F3D3E] hover:bg-slate-100'
                          }`}
                          title="Fill row from a catalog product"
                        >
                          <Package size={12} />
                        </button>
                        <button
                          type="button"
                          disabled={rIdx === 0}
                          onClick={() => handleMoveRow(rIdx, 'up')}
                          className={`p-1 rounded disabled:opacity-20 ${
                            isDark ? 'text-slate-400 hover:text-white hover:bg-[#202020]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                          title="Move Row Up"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          type="button"
                          disabled={rIdx === tableData.rows.length - 1}
                          onClick={() => handleMoveRow(rIdx, 'down')}
                          className={`p-1 rounded disabled:opacity-20 ${
                            isDark ? 'text-slate-400 hover:text-white hover:bg-[#202020]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                          title="Move Row Down"
                        >
                          <ArrowDown size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDuplicateRow(rIdx)}
                          className={`p-1 rounded ${
                            isDark ? 'text-slate-400 hover:text-white hover:bg-[#202020]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                          title="Duplicate Row"
                        >
                          <Copy size={12} />
                        </button>
                        <button
                          type="button"
                          disabled={tableData.rows.length <= 1}
                          onClick={() => handleDeleteRow(rIdx)}
                          className={`p-1 rounded disabled:opacity-20 ${
                            isDark ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
                          }`}
                          title="Delete Row"
                        >
                          <Trash2 size={12} />
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
  );
};
