import React from 'react';
import { Table as TableIcon, Check, Sliders, Sparkles, X } from 'lucide-react';
import { TableData } from '../../../types';

interface TableTopBarProps {
  isDark: boolean;
  activeTab: 'data' | 'design';
  setActiveTab: (tab: 'data' | 'design') => void;
  tableData: TableData;
  handleAutoMatchAllRows: () => void;
  handleAutoFitWidths: () => void;
  handleClose: () => void;
}

export const TableTopBar: React.FC<TableTopBarProps> = ({
  isDark,
  activeTab,
  setActiveTab,
  tableData,
  handleAutoMatchAllRows,
  handleAutoFitWidths,
  handleClose,
}) => {
  return (
    <div className={`p-4 border-b flex items-center justify-between shrink-0 transition-colors ${
      isDark ? 'border-[#262626] bg-[#121212]' : 'border-slate-200 bg-white'
    }`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-[6px] bg-[#0F3D3E] flex items-center justify-center text-[#E2DCC8] shadow-md shrink-0">
          <TableIcon size={20} />
        </div>
        <div>
          <h3 className={`text-base font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Catalog Specification Table Studio
          </h3>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
            <span>{tableData.headers.length} Columns</span>
            <span>•</span>
            <span>{tableData.rows.length} Rows</span>
          </div>
        </div>
      </div>

      {/* Tabs & Quick Actions */}
      <div className="flex items-center gap-2.5">
        {/* Switcher */}
        <div className={`p-1 rounded-[6px] border flex items-center gap-1 ${
          isDark ? 'bg-[#1a1a1a] border-[#2e2e2e]' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            type="button"
            onClick={() => setActiveTab('data')}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-bold transition-all ${
              activeTab === 'data'
                ? 'bg-[#0F3D3E] text-white shadow-sm'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Spreadsheet Data
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('design')}
            className={`px-3 py-1.5 rounded-[4px] text-xs font-bold transition-all ${
              activeTab === 'design'
                ? 'bg-[#0F3D3E] text-white shadow-sm'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Theme & Styling
          </button>
        </div>

        {activeTab === 'data' && (
          <>
            <button
              type="button"
              onClick={handleAutoMatchAllRows}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-bold border transition-all ${
                isDark
                  ? 'bg-[#1e1e1e] hover:bg-[#282828] text-amber-300 border-amber-400/30'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
              }`}
              title="Auto-match all table rows with catalog products and fill matching specs"
            >
              <Sparkles size={13} className="text-amber-400" />
              <span>Auto-Fill All Specs</span>
            </button>

            <button
              type="button"
              onClick={handleAutoFitWidths}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-bold border transition-all ${
                isDark
                  ? 'bg-[#1e1e1e] hover:bg-[#282828] text-slate-300 border-[#333]'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
              }`}
              title="Evenly balance all column widths"
            >
              <Sliders size={13} />
              <span>Balance Columns</span>
            </button>
          </>
        )}

        <button
          type="button"
          onClick={handleClose}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-[4px] text-xs font-bold bg-[#0F3D3E] hover:bg-[#155354] text-[#E2DCC8] shadow-md transition-all active:scale-95"
        >
          <Check size={14} />
          <span>Done</span>
        </button>

        <button
          type="button"
          onClick={handleClose}
          className={`p-1.5 rounded-[4px] border transition-colors ${
            isDark ? 'border-[#2e2e2e] text-slate-400 hover:text-white' : 'border-slate-200 text-slate-400 hover:text-slate-800'
          }`}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
