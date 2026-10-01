import React from 'react';
import { Sparkles, Palette, Type } from 'lucide-react';
import { TableData } from '../../../types';
import { PRESET_THEMES } from './constants';

interface TableDesignTabProps {
  isDark: boolean;
  tableData: TableData;
  handleApplyTheme: (theme: typeof PRESET_THEMES[0]) => void;
  handleStyleChange: (key: keyof TableData, value: any) => void;
}

export const TableDesignTab: React.FC<TableDesignTabProps> = ({
  isDark,
  tableData,
  handleApplyTheme,
  handleStyleChange,
}) => {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Presets */}
      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
          <Sparkles size={12} /> Curated Theme Presets
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {PRESET_THEMES.map((theme, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyTheme(theme)}
              className={`p-3 rounded-[4px] border text-left flex flex-col gap-2 transition-all hover:scale-[1.02] ${
                tableData.headerBg === theme.headerBg
                  ? isDark ? 'border-teal-400 ring-2 ring-teal-400/20 bg-teal-950/20' : 'border-[#0F3D3E] ring-2 ring-teal-500/20 bg-teal-50'
                  : isDark ? 'border-[#262626] bg-[#141414] hover:border-[#383838]' : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-[4px] border border-slate-300 shadow-sm shrink-0" style={{ backgroundColor: theme.headerBg }} />
                <span className={`text-xs font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{theme.name}</span>
              </div>
              <div className="flex items-center gap-1 text-[9px] text-slate-400 font-mono">
                <span>{theme.headerBg}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Color Customization */}
      <div className={`space-y-4 pt-4 border-t ${isDark ? 'border-[#262626]' : 'border-slate-200'}`}>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
          <Palette size={12} /> Color Palette
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Header Background */}
          <div className="space-y-1.5">
            <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Header Background Color</span>
            <div className={`flex items-center gap-2 p-2 rounded-[4px] border ${
              isDark ? 'border-[#2e2e2e] bg-[#101010]' : 'border-slate-200 bg-slate-50'
            }`}>
              <input
                type="color"
                value={tableData.headerBg || '#002b36'}
                onChange={(e) => handleStyleChange('headerBg', e.target.value)}
                className="w-8 h-8 rounded-[4px] cursor-pointer border-0 bg-transparent"
              />
              <input
                type="text"
                value={tableData.headerBg || '#002b36'}
                onChange={(e) => handleStyleChange('headerBg', e.target.value)}
                className={`flex-1 bg-transparent font-mono text-xs font-bold outline-none uppercase ${isDark ? 'text-white' : 'text-slate-800'}`}
              />
            </div>
          </div>

          {/* Header Text Color */}
          <div className="space-y-1.5">
            <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Header Text Color</span>
            <div className={`flex items-center gap-2 p-2 rounded-[4px] border ${
              isDark ? 'border-[#2e2e2e] bg-[#101010]' : 'border-slate-200 bg-slate-50'
            }`}>
              <input
                type="color"
                value={tableData.headerTextColor || '#ffffff'}
                onChange={(e) => handleStyleChange('headerTextColor', e.target.value)}
                className="w-8 h-8 rounded-[4px] cursor-pointer border-0 bg-transparent"
              />
              <input
                type="text"
                value={tableData.headerTextColor || '#ffffff'}
                onChange={(e) => handleStyleChange('headerTextColor', e.target.value)}
                className={`flex-1 bg-transparent font-mono text-xs font-bold outline-none uppercase ${isDark ? 'text-white' : 'text-slate-800'}`}
              />
            </div>
          </div>

          {/* Row Background */}
          <div className="space-y-1.5">
            <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Row Background Color</span>
            <div className={`flex items-center gap-2 p-2 rounded-[4px] border ${
              isDark ? 'border-[#2e2e2e] bg-[#101010]' : 'border-slate-200 bg-slate-50'
            }`}>
              <input
                type="color"
                value={tableData.rowBg || '#ffffff'}
                onChange={(e) => handleStyleChange('rowBg', e.target.value)}
                className="w-8 h-8 rounded-[4px] cursor-pointer border-0 bg-transparent"
              />
              <input
                type="text"
                value={tableData.rowBg || '#ffffff'}
                onChange={(e) => handleStyleChange('rowBg', e.target.value)}
                className={`flex-1 bg-transparent font-mono text-xs font-bold outline-none uppercase ${isDark ? 'text-white' : 'text-slate-800'}`}
              />
            </div>
          </div>

          {/* Alternate Row Background */}
          <div className="space-y-1.5">
            <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Alternate Row Color (Zebra)</span>
            <div className={`flex items-center gap-2 p-2 rounded-[4px] border ${
              isDark ? 'border-[#2e2e2e] bg-[#101010]' : 'border-slate-200 bg-slate-50'
            }`}>
              <input
                type="color"
                value={tableData.alternateRowBg || '#f8fafc'}
                onChange={(e) => handleStyleChange('alternateRowBg', e.target.value)}
                className="w-8 h-8 rounded-[4px] cursor-pointer border-0 bg-transparent"
              />
              <input
                type="text"
                value={tableData.alternateRowBg || '#f8fafc'}
                onChange={(e) => handleStyleChange('alternateRowBg', e.target.value)}
                className={`flex-1 bg-transparent font-mono text-xs font-bold outline-none uppercase ${isDark ? 'text-white' : 'text-slate-800'}`}
              />
            </div>
          </div>

          {/* Border Color */}
          <div className="space-y-1.5">
            <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Table Border Color</span>
            <div className={`flex items-center gap-2 p-2 rounded-[4px] border ${
              isDark ? 'border-[#2e2e2e] bg-[#101010]' : 'border-slate-200 bg-slate-50'
            }`}>
              <input
                type="color"
                value={tableData.borderColor || '#334155'}
                onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                className="w-8 h-8 rounded-[4px] cursor-pointer border-0 bg-transparent"
              />
              <input
                type="text"
                value={tableData.borderColor || '#334155'}
                onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                className={`flex-1 bg-transparent font-mono text-xs font-bold outline-none uppercase ${isDark ? 'text-white' : 'text-slate-800'}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Typography & Spacing */}
      <div className={`space-y-4 pt-4 border-t ${isDark ? 'border-[#262626]' : 'border-slate-200'}`}>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
          <Type size={12} /> Typography & Spacing
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Header Font Size */}
          <div className={`p-3 rounded-[4px] border space-y-2 ${
            isDark ? 'border-[#2e2e2e] bg-[#101010]' : 'border-slate-200 bg-slate-50'
          }`}>
            <div className="flex justify-between items-center text-xs font-bold">
              <span className={isDark ? "text-slate-300" : "text-slate-700"}>Header Font Size</span>
              <span className="font-mono text-[#0F3D3E] font-black">{tableData.headerFontSize || 9.5}pt</span>
            </div>
            <input
              type="range"
              min={7}
              max={18}
              step={0.5}
              value={tableData.headerFontSize || 9.5}
              onChange={(e) => handleStyleChange('headerFontSize', parseFloat(e.target.value))}
              className="w-full accent-[#0F3D3E] cursor-pointer"
            />
          </div>

          {/* Body Font Size */}
          <div className={`p-3 rounded-[4px] border space-y-2 ${
            isDark ? 'border-[#2e2e2e] bg-[#101010]' : 'border-slate-200 bg-slate-50'
          }`}>
            <div className="flex justify-between items-center text-xs font-bold">
              <span className={isDark ? "text-slate-300" : "text-slate-700"}>Body Font Size</span>
              <span className="font-mono text-[#0F3D3E] font-black">{tableData.fontSize || 8.5}pt</span>
            </div>
            <input
              type="range"
              min={6.5}
              max={16}
              step={0.5}
              value={tableData.fontSize || 8.5}
              onChange={(e) => handleStyleChange('fontSize', parseFloat(e.target.value))}
              className="w-full accent-[#0F3D3E] cursor-pointer"
            />
          </div>

          {/* Cell Padding */}
          <div className={`p-3 rounded-[4px] border space-y-2 ${
            isDark ? 'border-[#2e2e2e] bg-[#101010]' : 'border-slate-200 bg-slate-50'
          }`}>
            <div className="flex justify-between items-center text-xs font-bold">
              <span className={isDark ? "text-slate-300" : "text-slate-700"}>Cell Padding</span>
              <span className="font-mono text-[#0F3D3E] font-black">{tableData.cellPadding || 6}px</span>
            </div>
            <input
              type="range"
              min={2}
              max={14}
              step={1}
              value={tableData.cellPadding || 6}
              onChange={(e) => handleStyleChange('cellPadding', parseInt(e.target.value, 10))}
              className="w-full accent-[#0F3D3E] cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
