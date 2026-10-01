import React from 'react';
import { X } from 'lucide-react';

interface ExportHeaderProps {
  isDark: boolean;
  activeTab: 'download' | 'share' | 'embed' | 'publish';
  setActiveTab: (tab: 'download' | 'share' | 'embed' | 'publish') => void;
  onClose: () => void;
}

export const ExportHeader: React.FC<ExportHeaderProps> = ({
  isDark,
  activeTab,
  setActiveTab,
  onClose,
}) => {
  return (
    <div className={`flex items-center justify-between border-b px-6 pt-3.5 shrink-0 ${
      isDark ? 'border-[#E2DCC8]/15 bg-[#100F0F]' : 'border-slate-100 bg-slate-50/80'
    }`}>
      <div className="flex gap-6">
        <button
          type="button"
          onClick={() => setActiveTab('share')}
          className={`pb-3 font-semibold text-xs uppercase tracking-wider relative transition-colors cursor-pointer ${
            activeTab === 'share'
              ? (isDark ? 'text-[#E2DCC8] font-bold' : 'text-[#0F3D3E] font-bold')
              : isDark ? 'text-[#E2DCC8]/60 hover:text-[#F1F1F1]' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Share
          {activeTab === 'share' && (
            <span className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDark ? 'bg-[#E2DCC8]' : 'bg-[#0F3D3E]'}`} />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('download')}
          className={`pb-3 font-semibold text-xs uppercase tracking-wider relative transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'download'
              ? (isDark ? 'text-[#E2DCC8] font-bold' : 'text-[#0F3D3E] font-bold')
              : isDark ? 'text-[#E2DCC8]/60 hover:text-[#F1F1F1]' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Download
          {activeTab === 'download' && (
            <span className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDark ? 'bg-[#E2DCC8]' : 'bg-[#0F3D3E]'}`} />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('embed')}
          className={`pb-3 font-semibold text-xs uppercase tracking-wider relative transition-colors cursor-pointer ${
            activeTab === 'embed'
              ? (isDark ? 'text-[#E2DCC8] font-bold' : 'text-[#0F3D3E] font-bold')
              : isDark ? 'text-[#E2DCC8]/60 hover:text-[#F1F1F1]' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Embed
          {activeTab === 'embed' && (
            <span className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDark ? 'bg-[#E2DCC8]' : 'bg-[#0F3D3E]'}`} />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('publish')}
          className={`pb-3 font-semibold text-xs uppercase tracking-wider relative transition-colors cursor-pointer ${
            activeTab === 'publish'
              ? (isDark ? 'text-[#E2DCC8] font-bold' : 'text-[#0F3D3E] font-bold')
              : isDark ? 'text-[#E2DCC8]/60 hover:text-[#F1F1F1]' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Publish
          {activeTab === 'publish' && (
            <span className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDark ? 'bg-[#E2DCC8]' : 'bg-[#0F3D3E]'}`} />
          )}
        </button>
      </div>

      <button
        type="button"
        onClick={onClose}
        className={`p-1.5 rounded-[4px] transition-colors mb-2.5 cursor-pointer ${
          isDark ? 'text-[#E2DCC8]/60 hover:text-[#F1F1F1] hover:bg-white/10' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
        }`}
        title="Close"
      >
        <X size={18} />
      </button>
    </div>
  );
};
