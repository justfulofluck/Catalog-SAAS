import React from 'react';
import { FileText, Printer, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ExportDownloadTabProps {
  isDark: boolean;
  fileType: 'pdf' | 'pdf_cmyk' | 'png';
  setFileType: (t: 'pdf' | 'pdf_cmyk' | 'png') => void;
  pageSelection: 'all' | 'current' | 'custom';
  setPageSelection: (s: 'all' | 'current' | 'custom') => void;
  customRange: string;
  setCustomRange: (r: string) => void;
  dpiQuality: 'standard' | 'high' | 'ultra';
  setDpiQuality: (q: 'standard' | 'high' | 'ultra') => void;
  totalPages: number;
  currentPageIndex: number;
  isExporting: boolean;
  exportProgress: { current: number; total: number; status: string } | null;
}

export const ExportDownloadTab: React.FC<ExportDownloadTabProps> = ({
  isDark,
  fileType,
  setFileType,
  pageSelection,
  setPageSelection,
  customRange,
  setCustomRange,
  dpiQuality,
  setDpiQuality,
  totalPages,
  currentPageIndex,
  isExporting,
  exportProgress,
}) => {
  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      {/* File Format Selection */}
      <div>
        <label className={`block text-[10px] font-black uppercase tracking-wider mb-2 ${
          isDark ? 'text-[#E2DCC8]/70' : 'text-slate-500'
        }`}>
          File Format
        </label>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setFileType('pdf')}
            className={`p-3 rounded-md border flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
              fileType === 'pdf'
                ? isDark
                  ? 'border-[#E2DCC8] bg-[#0F3D3E]/40 text-[#E2DCC8] ring-1 ring-[#0F3D3E]'
                  : 'border-[#0F3D3E] bg-[#0F3D3E]/10 text-[#0F3D3E] ring-1 ring-[#0F3D3E]/20'
                : isDark
                  ? 'border-[#E2DCC8]/15 bg-[#100F0F] text-[#E2DCC8]/70 hover:border-[#E2DCC8]/30'
                  : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300'
            }`}
          >
            <FileText size={18} />
            <span className="text-xs font-bold">PDF (Digital)</span>
            <span className="text-[10px] opacity-70">Web & Screen • RGB</span>
          </button>

          <button
            type="button"
            onClick={() => setFileType('pdf_cmyk')}
            className={`p-3 rounded-md border flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
              fileType === 'pdf_cmyk'
                ? isDark
                  ? 'border-[#E2DCC8] bg-[#0F3D3E]/40 text-[#E2DCC8] ring-1 ring-[#0F3D3E]'
                  : 'border-[#0F3D3E] bg-[#0F3D3E]/10 text-[#0F3D3E] ring-1 ring-[#0F3D3E]/20'
                : isDark
                  ? 'border-[#E2DCC8]/15 bg-[#100F0F] text-[#E2DCC8]/70 hover:border-[#E2DCC8]/30'
                  : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300'
            }`}
          >
            <Printer size={18} />
            <span className="text-xs font-bold">PDF (CMYK)</span>
            <span className="text-[10px] opacity-70">Print Ready • 300 DPI</span>
          </button>

          <button
            type="button"
            onClick={() => setFileType('png')}
            className={`p-3 rounded-md border flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
              fileType === 'png'
                ? isDark
                  ? 'border-[#E2DCC8] bg-[#0F3D3E]/40 text-[#E2DCC8] ring-1 ring-[#0F3D3E]'
                  : 'border-[#0F3D3E] bg-[#0F3D3E]/10 text-[#0F3D3E] ring-1 ring-[#0F3D3E]/20'
                : isDark
                  ? 'border-[#E2DCC8]/15 bg-[#100F0F] text-[#E2DCC8]/70 hover:border-[#E2DCC8]/30'
                  : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300'
            }`}
          >
            <ImageIcon size={18} />
            <span className="text-xs font-bold">PNG Image</span>
            <span className="text-[10px] opacity-70">Lossless • Crisp</span>
          </button>
        </div>
      </div>

      {/* Page Selection */}
      <div>
        <label className={`block text-[10px] font-black uppercase tracking-wider mb-2 ${
          isDark ? 'text-[#E2DCC8]/70' : 'text-slate-500'
        }`}>
          Select Pages
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPageSelection('all')}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-[4px] border transition-all cursor-pointer ${
              pageSelection === 'all'
                ? 'bg-[#0F3D3E] text-[#F1F1F1] border-[#E2DCC8]/40 shadow-sm'
                : isDark
                  ? 'border-[#E2DCC8]/15 bg-[#100F0F] text-[#E2DCC8]/70 hover:border-[#E2DCC8]/30'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
            }`}
          >
            All Pages ({totalPages})
          </button>
          <button
            type="button"
            onClick={() => setPageSelection('current')}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-[4px] border transition-all cursor-pointer ${
              pageSelection === 'current'
                ? 'bg-[#0F3D3E] text-[#F1F1F1] border-[#E2DCC8]/40 shadow-sm'
                : isDark
                  ? 'border-[#E2DCC8]/15 bg-[#100F0F] text-[#E2DCC8]/70 hover:border-[#E2DCC8]/30'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
            }`}
          >
            Current Page ({currentPageIndex + 1})
          </button>
          <button
            type="button"
            onClick={() => setPageSelection('custom')}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-[4px] border transition-all cursor-pointer ${
              pageSelection === 'custom'
                ? 'bg-[#0F3D3E] text-[#F1F1F1] border-[#E2DCC8]/40 shadow-sm'
                : isDark
                  ? 'border-[#E2DCC8]/15 bg-[#100F0F] text-[#E2DCC8]/70 hover:border-[#E2DCC8]/30'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
            }`}
          >
            Custom Range
          </button>
        </div>
        {pageSelection === 'custom' && (
          <input
            type="text"
            value={customRange}
            onChange={(e) => setCustomRange(e.target.value)}
            placeholder="e.g. 1, 2 or 1-2"
            className={`mt-2 w-full px-3 py-1.5 text-xs rounded-[4px] border ${
              isDark ? 'bg-[#100F0F] border-[#E2DCC8]/20 text-[#F1F1F1]' : 'bg-white border-slate-200 text-slate-800'
            }`}
          />
        )}
      </div>

      {/* Quality Preset */}
      <div>
        <label className={`block text-[10px] font-black uppercase tracking-wider mb-2 ${
          isDark ? 'text-[#E2DCC8]/70' : 'text-slate-500'
        }`}>
          Resolution & Quality
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setDpiQuality('standard')}
            className={`py-1.5 px-2 text-xs rounded-[4px] border text-center font-medium transition-all cursor-pointer ${
              dpiQuality === 'standard'
                ? 'border-[#E2DCC8] bg-[#0F3D3E]/40 text-[#E2DCC8] font-bold'
                : isDark
                  ? 'border-[#E2DCC8]/15 text-[#E2DCC8]/60 hover:text-[#F1F1F1]'
                  : 'border-slate-200 text-slate-600'
            }`}
          >
            Standard (150 DPI)
          </button>
          <button
            type="button"
            onClick={() => setDpiQuality('high')}
            className={`py-1.5 px-2 text-xs rounded-[4px] border text-center font-medium transition-all cursor-pointer ${
              dpiQuality === 'high'
                ? 'border-[#E2DCC8] bg-[#0F3D3E]/40 text-[#E2DCC8] font-bold'
                : isDark
                  ? 'border-[#E2DCC8]/15 text-[#E2DCC8]/60 hover:text-[#F1F1F1]'
                  : 'border-slate-200 text-slate-600'
            }`}
          >
            High (300 DPI)
          </button>
          <button
            type="button"
            onClick={() => setDpiQuality('ultra')}
            className={`py-1.5 px-2 text-xs rounded-[4px] border text-center font-medium transition-all cursor-pointer ${
              dpiQuality === 'ultra'
                ? 'border-[#E2DCC8] bg-[#0F3D3E]/40 text-[#E2DCC8] font-bold'
                : isDark
                  ? 'border-[#E2DCC8]/15 text-[#E2DCC8]/60 hover:text-[#F1F1F1]'
                  : 'border-slate-200 text-slate-600'
            }`}
          >
            Ultra (600 DPI)
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {isExporting && exportProgress && (
        <div className={`p-3 rounded-md border space-y-2 ${
          isDark ? 'bg-[#100F0F] border-[#E2DCC8]/20' : 'bg-[#0F3D3E]/5 border-[#0F3D3E]/20'
        }`}>
          <div className="flex justify-between items-center text-xs font-semibold">
            <span className="text-[#E2DCC8] flex items-center gap-1.5">
              <Loader2 size={13} className="animate-spin" /> {exportProgress.status}
            </span>
            <span className="text-[#E2DCC8]/80 font-mono">
              {Math.round((exportProgress.current / exportProgress.total) * 100)}%
            </span>
          </div>
          <div className="w-full bg-[#1e1e1e] rounded-[2px] h-1.5 overflow-hidden">
            <div
              className="bg-[#0F3D3E] h-full transition-all duration-200 border-r border-[#E2DCC8]"
              style={{ width: `${(exportProgress.current / exportProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
