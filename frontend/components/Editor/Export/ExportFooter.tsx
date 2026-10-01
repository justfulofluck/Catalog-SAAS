import React from 'react';
import {
  FileDown, Printer, Image as ImageIcon, Loader2,
  Check, Copy, Code2, ExternalLink
} from 'lucide-react';

interface ExportFooterProps {
  isDark: boolean;
  activeTab: 'download' | 'share' | 'embed' | 'publish';
  isExporting: boolean;
  fileType: 'pdf' | 'pdf_cmyk' | 'png';
  copiedLink: boolean;
  copiedEmbed: boolean;
  publicShareUrl: string;
  handleDownload: () => void;
  handleCopyShareLink: () => void;
  handleCopyEmbedCode: () => void;
}

export const ExportFooter: React.FC<ExportFooterProps> = ({
  isDark,
  activeTab,
  isExporting,
  fileType,
  copiedLink,
  copiedEmbed,
  publicShareUrl,
  handleDownload,
  handleCopyShareLink,
  handleCopyEmbedCode,
}) => {
  return (
    <div className={`p-3.5 px-6 border-t shrink-0 ${isDark ? 'bg-[#100F0F] border-[#E2DCC8]/15' : 'bg-slate-50 border-slate-200'}`}>
      {activeTab === 'download' && (
        <button
          type="button"
          onClick={handleDownload}
          disabled={isExporting}
          className="w-full py-2.5 px-4 bg-[#0F3D3E] hover:bg-[#155455] active:scale-[0.99] text-[#F1F1F1] border border-[#E2DCC8]/30 font-bold rounded-[4px] shadow-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-xs uppercase tracking-wider cursor-pointer"
        >
          {isExporting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Generating {fileType === 'pdf_cmyk' ? 'Print PDF (CMYK)' : (fileType === 'pdf' ? 'PDF (Digital)' : 'PNG Image')}...
            </>
          ) : (
            <>
              {fileType === 'pdf_cmyk' ? (
                <Printer size={15} />
              ) : fileType === 'pdf' ? (
                <FileDown size={15} />
              ) : (
                <ImageIcon size={15} />
              )}
              {fileType === 'pdf_cmyk'
                ? 'Download Print PDF (CMYK)'
                : fileType === 'pdf'
                ? 'Download PDF (Digital)'
                : 'Download PNG Image'}
            </>
          )}
        </button>
      )}

      {activeTab === 'share' && (
        <button
          type="button"
          onClick={handleCopyShareLink}
          className="w-full py-2.5 px-4 bg-[#0F3D3E] hover:bg-[#155455] active:scale-[0.99] text-[#F1F1F1] border border-[#E2DCC8]/30 font-bold rounded-[4px] shadow-sm flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-wider cursor-pointer"
        >
          {copiedLink ? <Check size={15} /> : <Copy size={15} />}
          {copiedLink ? 'Link Copied to Clipboard!' : 'Copy Share Link'}
        </button>
      )}

      {activeTab === 'embed' && (
        <button
          type="button"
          onClick={handleCopyEmbedCode}
          className="w-full py-2.5 px-4 bg-[#0F3D3E] hover:bg-[#155455] active:scale-[0.99] text-[#F1F1F1] border border-[#E2DCC8]/30 font-bold rounded-[4px] shadow-sm flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-wider cursor-pointer"
        >
          {copiedEmbed ? <Check size={15} /> : <Code2 size={15} />}
          {copiedEmbed ? 'Embed Code Copied!' : 'Copy Embed Code'}
        </button>
      )}

      {activeTab === 'publish' && (
        <button
          type="button"
          onClick={() => window.open(publicShareUrl, '_blank')}
          className="w-full py-2.5 px-4 bg-[#0F3D3E] hover:bg-[#155455] active:scale-[0.99] text-[#F1F1F1] border border-[#E2DCC8]/30 font-bold rounded-[4px] shadow-sm flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-wider cursor-pointer"
        >
          <ExternalLink size={15} />
          Open Live Catalog Viewer
        </button>
      )}
    </div>
  );
};
