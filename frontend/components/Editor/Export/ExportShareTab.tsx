import React from 'react';
import {
  Share2, FileText, QrCode, Globe, Copy, Check,
  ExternalLink, Lock, ShoppingCart, Download
} from 'lucide-react';

interface ExportShareTabProps {
  isDark: boolean;
  activeShareFeature: 'private' | 'form' | 'qr' | null;
  setActiveShareFeature: (f: 'private' | 'form' | 'qr' | null) => void;
  publicShareUrl: string;
  privateShareUrl: string;
  formOrderUrl: string;
  qrCodeImageUrl: string;
  copiedLink: boolean;
  copiedFeatureLink: boolean;
  handleCopyShareLink: () => void;
  handleCopyCustomLink: (url: string) => void;
  handleDownloadQrImage: () => void;
}

export const ExportShareTab: React.FC<ExportShareTabProps> = ({
  isDark,
  activeShareFeature,
  setActiveShareFeature,
  publicShareUrl,
  privateShareUrl,
  formOrderUrl,
  qrCodeImageUrl,
  copiedLink,
  copiedFeatureLink,
  handleCopyShareLink,
  handleCopyCustomLink,
  handleDownloadQrImage,
}) => {
  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* Top Row: 3 Share Options */}
      <div>
        <label className={`block text-[10px] font-black uppercase tracking-wider mb-2 ${
          isDark ? 'text-[#E2DCC8]/70' : 'text-slate-500'
        }`}>
          Share Options
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => setActiveShareFeature(activeShareFeature === 'private' ? null : 'private')}
            className={`p-2.5 rounded-md border flex flex-col items-center justify-center gap-1 transition-all text-center cursor-pointer ${
              activeShareFeature === 'private'
                ? isDark
                  ? 'border-[#E2DCC8] bg-[#0F3D3E]/40 text-[#E2DCC8] ring-1 ring-[#0F3D3E]'
                  : 'border-[#0F3D3E] bg-[#0F3D3E]/10 text-[#0F3D3E] ring-1 ring-[#0F3D3E]/20'
                : isDark
                  ? 'border-[#E2DCC8]/15 bg-[#100F0F] text-[#E2DCC8]/80 hover:border-[#E2DCC8]/30'
                  : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300'
            }`}
          >
            <Share2 size={16} />
            <span className="text-[11px] font-bold">Private Link</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveShareFeature(activeShareFeature === 'form' ? null : 'form')}
            className={`p-2.5 rounded-md border flex flex-col items-center justify-center gap-1 transition-all text-center cursor-pointer ${
              activeShareFeature === 'form'
                ? isDark
                  ? 'border-[#E2DCC8] bg-[#0F3D3E]/40 text-[#E2DCC8] ring-1 ring-[#0F3D3E]'
                  : 'border-[#0F3D3E] bg-[#0F3D3E]/10 text-[#0F3D3E] ring-1 ring-[#0F3D3E]/20'
                : isDark
                  ? 'border-[#E2DCC8]/15 bg-[#100F0F] text-[#E2DCC8]/80 hover:border-[#E2DCC8]/30'
                  : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300'
            }`}
          >
            <FileText size={16} className={isDark ? 'text-[#E2DCC8]/70' : 'text-slate-500'} />
            <span className="text-[11px] font-semibold">Fillable Form</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveShareFeature(activeShareFeature === 'qr' ? null : 'qr')}
            className={`p-2.5 rounded-md border flex flex-col items-center justify-center gap-1 transition-all text-center cursor-pointer ${
              activeShareFeature === 'qr'
                ? isDark
                  ? 'border-[#E2DCC8] bg-[#0F3D3E]/40 text-[#E2DCC8] ring-1 ring-[#0F3D3E]'
                  : 'border-[#0F3D3E] bg-[#0F3D3E]/10 text-[#0F3D3E] ring-1 ring-[#0F3D3E]/20'
                : isDark
                  ? 'border-[#E2DCC8]/15 bg-[#100F0F] text-[#E2DCC8]/80 hover:border-[#E2DCC8]/30'
                  : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300'
            }`}
          >
            <QrCode size={16} className={isDark ? 'text-[#E2DCC8]/70' : 'text-slate-500'} />
            <span className="text-[11px] font-semibold">QR Code</span>
          </button>
        </div>
      </div>

      {/* Default Public Link Panel */}
      {!activeShareFeature && (
        <div className={`p-3.5 rounded-md border space-y-2.5 animate-in fade-in duration-150 ${
          isDark ? 'bg-[#100F0F] border-[#E2DCC8]/20' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs">
            <span className={`font-bold flex items-center gap-1.5 ${isDark ? 'text-[#E2DCC8]' : 'text-slate-800'}`}>
              <Globe size={13} className="text-emerald-400" /> Public Shareable URL
            </span>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Live & Ready</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={publicShareUrl}
              className={`flex-1 px-3 py-1.5 text-xs rounded-[4px] border font-mono select-all ${
                isDark ? 'bg-[#161616] border-[#E2DCC8]/20 text-[#E2DCC8]' : 'bg-white border-slate-200 text-slate-700'
              }`}
            />
            <button
              type="button"
              onClick={handleCopyShareLink}
              className="px-3.5 py-1.5 bg-[#0F3D3E] hover:bg-[#155455] text-[#F1F1F1] border border-[#E2DCC8]/30 rounded-[4px] text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              {copiedLink ? <Check size={14} /> : <Copy size={14} />} Copy
            </button>
            <button
              type="button"
              onClick={() => window.open(publicShareUrl, '_blank')}
              className={`p-1.5 rounded-[4px] border transition-all cursor-pointer ${
                isDark ? 'border-[#E2DCC8]/20 hover:bg-white/5 text-[#E2DCC8]' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
              title="Open in new tab"
            >
              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Private Link Expand Panel */}
      {activeShareFeature === 'private' && (
        <div className={`p-3.5 rounded-md border space-y-2.5 animate-in fade-in duration-150 ${
          isDark ? 'bg-[#100F0F] border-[#E2DCC8]/20' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between text-xs">
            <span className={`font-bold flex items-center gap-1.5 ${isDark ? 'text-[#E2DCC8]' : 'text-slate-800'}`}>
              <Lock size={13} className="text-amber-400" /> Private Restricted Access URL
            </span>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Token Protected</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={privateShareUrl}
              className={`flex-1 px-3 py-1.5 text-xs rounded-[4px] border font-mono select-all ${
                isDark ? 'bg-[#161616] border-[#E2DCC8]/20 text-[#E2DCC8]' : 'bg-white border-slate-200 text-slate-700'
              }`}
            />
            <button
              type="button"
              onClick={() => handleCopyCustomLink(privateShareUrl)}
              className="px-3.5 py-1.5 bg-[#0F3D3E] hover:bg-[#155455] text-[#F1F1F1] border border-[#E2DCC8]/30 rounded-[4px] text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              {copiedFeatureLink ? <Check size={14} /> : <Copy size={14} />} Copy
            </button>
            <button
              type="button"
              onClick={() => window.open(privateShareUrl, '_blank')}
              className={`p-1.5 rounded-[4px] border transition-all cursor-pointer ${
                isDark ? 'border-[#E2DCC8]/20 hover:bg-white/5 text-[#E2DCC8]' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
              title="Open in new tab"
            >
              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Fillable Form Feature Panel */}
      {activeShareFeature === 'form' && (
        <div className={`p-3.5 rounded-md border space-y-3 animate-in fade-in duration-150 ${
          isDark ? 'bg-[#100F0F] border-[#E2DCC8]/20' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <ShoppingCart size={16} className={isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'} />
            <div>
              <p className={`text-xs font-bold ${isDark ? 'text-[#F1F1F1]' : 'text-slate-900'}`}>Interactive Order & Quote Catalog</p>
              <p className={`text-[10px] ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>Allows customers to select quantities and request orders directly.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={formOrderUrl}
              className={`flex-1 px-3 py-1.5 text-xs rounded-[4px] border font-mono select-all ${
                isDark ? 'bg-[#161616] border-[#E2DCC8]/20 text-[#E2DCC8]' : 'bg-white border-slate-200 text-slate-700'
              }`}
            />
            <button
              type="button"
              onClick={() => handleCopyCustomLink(formOrderUrl)}
              className="px-3.5 py-1.5 bg-[#0F3D3E] hover:bg-[#155455] text-[#F1F1F1] border border-[#E2DCC8]/30 rounded-[4px] text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
            >
              {copiedFeatureLink ? <Check size={14} /> : <Copy size={14} />} Copy
            </button>
            <button
              type="button"
              onClick={() => window.open(formOrderUrl, '_blank')}
              className={`p-1.5 rounded-[4px] border transition-all cursor-pointer ${
                isDark ? 'border-[#E2DCC8]/20 hover:bg-white/5 text-[#E2DCC8]' : 'border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
              title="Launch Order Catalog"
            >
              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      )}

      {/* QR Code Feature Panel */}
      {activeShareFeature === 'qr' && (
        <div className={`p-3.5 rounded-md border flex flex-col items-center gap-3 animate-in fade-in duration-150 ${
          isDark ? 'bg-[#100F0F] border-[#E2DCC8]/20' : 'bg-slate-50 border-slate-200'
        }`}>
          <img src={qrCodeImageUrl} alt="Catalog QR Code" className="w-28 h-28 rounded-[4px] bg-white p-1.5 shadow-sm" />
          <div className="text-center">
            <p className={`text-xs font-bold ${isDark ? 'text-[#E2DCC8]' : 'text-slate-800'}`}>Instant Mobile Scan</p>
            <p className={`text-[10px] ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>Point mobile camera to open catalog on phone immediately</p>
          </div>
          <div className="w-full">
            <button
              type="button"
              onClick={handleDownloadQrImage}
              className="w-full py-2 px-3 bg-[#0F3D3E] hover:bg-[#155455] text-[#F1F1F1] border border-[#E2DCC8]/30 rounded-[4px] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <Download size={14} /> Download QR Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
