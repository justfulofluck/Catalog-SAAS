import React from 'react';
import { Copy, Check } from 'lucide-react';

interface ExportPublishTabProps {
  isDark: boolean;
  publicShareUrl: string;
  copiedLink: boolean;
  handleCopyShareLink: () => void;
}

export const ExportPublishTab: React.FC<ExportPublishTabProps> = ({
  isDark,
  publicShareUrl,
  copiedLink,
  handleCopyShareLink,
}) => {
  return (
    <div className="space-y-5 animate-in fade-in duration-150">
      <div className={`p-3.5 rounded-md border flex items-center justify-between ${
        isDark ? 'bg-[#0F3D3E]/20 border-[#E2DCC8]/25 text-[#E2DCC8]' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <p className="text-xs font-bold">Catalog is Live & Published</p>
            <p className="text-[10px] opacity-80">Accessible worldwide via fast CDN link</p>
          </div>
        </div>
        <span className="text-[9px] font-bold px-2 py-0.5 rounded-[3px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 uppercase">
          LIVE
        </span>
      </div>

      <div>
        <label className={`block text-[10px] font-black uppercase tracking-wider mb-2 ${
          isDark ? 'text-[#E2DCC8]/70' : 'text-slate-500'
        }`}>
          Live Public URL
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={publicShareUrl}
            className={`flex-1 px-3 py-1.5 text-xs rounded-[4px] border font-mono select-all ${
              isDark ? 'bg-[#100F0F] border-[#E2DCC8]/20 text-[#E2DCC8]' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          />
          <button
            type="button"
            onClick={handleCopyShareLink}
            className={`p-1.5 rounded-[4px] border transition-all cursor-pointer ${
              copiedLink
                ? 'bg-emerald-500 text-white border-emerald-500'
                : isDark ? 'border-[#E2DCC8]/20 bg-[#161616] text-[#E2DCC8] hover:bg-[#222]' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
            title="Copy Link"
          >
            {copiedLink ? <Check size={16} /> : <Copy size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};
