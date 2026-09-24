import React, { useState, useEffect } from 'react';
import {
  X,
  FileDown,
  Share2,
  Code2,
  Globe,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  BookOpen,
  FileText,
  Sparkles,
  Loader2,
  Lock,
  Download,
  Image as ImageIcon,
  ShoppingCart,
  Printer
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { exportCatalogToPDF } from './pdfExporter';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../../constants';
import { elementToFabricObject } from './fabricRenderer';
import { resolveDynamicText, getPageCategoryName } from '../../utils/dynamicTags';
import { Canvas } from 'fabric';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'download' | 'share' | 'embed' | 'publish';
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'download'
}) => {
  const {
    catalog,
    products,
    categories,
    currentPageIndex,
    uiTheme,
    showToast
  } = useStore();

  const [activeTab, setActiveTab] = useState<'download' | 'share' | 'embed' | 'publish'>(defaultTab);
  
  // Download tab state: Digital PDF (RGB), Print-Ready PDF (CMYK), PNG Image
  const [fileType, setFileType] = useState<'pdf' | 'pdf_cmyk' | 'png'>('pdf');
  const [pageSelection, setPageSelection] = useState<'all' | 'current' | 'custom'>('all');
  const [customRange, setCustomRange] = useState<string>('1');
  const [dpiQuality, setDpiQuality] = useState<'standard' | 'high' | 'ultra'>('high');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number; status: string } | null>(null);

  // Share tab interactive sub-selection state
  const [activeShareFeature, setActiveShareFeature] = useState<'private' | 'form' | 'qr' | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedFeatureLink, setCopiedFeatureLink] = useState<boolean>(false);
  const [copiedEmbed, setCopiedEmbed] = useState<boolean>(false);

  // Embed tab state
  const [embedWidth, setEmbedWidth] = useState<string>('100%');
  const [embedHeight, setEmbedHeight] = useState<string>('650px');
  const [embedMode, setEmbedMode] = useState<'flipbook' | 'scroll'>('flipbook');

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setCopiedLink(false);
      setCopiedFeatureLink(false);
      setCopiedEmbed(false);
      setIsExporting(false);
      setExportProgress(null);
      setActiveShareFeature(null);
    }
  }, [isOpen, defaultTab]);

  if (!isOpen) return null;

  const isDark = uiTheme === 'dark';
  const totalPages = catalog.pages?.length || 1;
  const catalogName = catalog.name || 'Catalog';
  const catalogId = (catalog as any).uuid || catalog.id || 'demo';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://catalogmakerr.com';
  
  const publicShareUrl = `${baseUrl}/viewer/${catalogId}`;
  const privateShareUrl = `${baseUrl}/viewer/${catalogId}?access=private&token=${encodeURIComponent(catalogId.slice(0, 8))}`;
  const flipbookUrl = `${baseUrl}/viewer/${catalogId}?mode=flipbook`;
  const formOrderUrl = `${baseUrl}/viewer/${catalogId}?mode=order`;
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(publicShareUrl)}`;

  const copyToClipboard = async (text: string): Promise<boolean> => {
    if (!text) return false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) {
      console.warn('navigator.clipboard failed, attempting fallback textarea:', err);
    }

    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      textArea.setAttribute('readonly', '');
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (fallbackErr) {
      console.error('Fallback copy to clipboard failed:', fallbackErr);
      return false;
    }
  };

  const handleCopyShareLink = async () => {
    const success = await copyToClipboard(publicShareUrl);
    if (success) {
      setCopiedLink(true);
      if (showToast) showToast('Share link copied to clipboard!', 'success');
      setTimeout(() => setCopiedLink(false), 2500);
    } else {
      if (showToast) showToast('Could not copy link automatically.', 'error');
    }
  };

  const handleCopyCustomLink = async (url: string) => {
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedFeatureLink(true);
      if (showToast) showToast('Link copied to clipboard!', 'success');
      setTimeout(() => setCopiedFeatureLink(false), 2500);
    } else {
      if (showToast) showToast('Could not copy link automatically.', 'error');
    }
  };

  const handleCopyEmbedCode = async () => {
    const code = `<iframe src="${embedMode === 'flipbook' ? flipbookUrl : publicShareUrl}" width="${embedWidth}" height="${embedHeight}" frameborder="0" allowfullscreen></iframe>`;
    const success = await copyToClipboard(code);
    if (success) {
      setCopiedEmbed(true);
      if (showToast) showToast('HTML embed snippet copied!', 'success');
      setTimeout(() => setCopiedEmbed(false), 2500);
    } else {
      if (showToast) showToast('Could not copy embed code automatically.', 'error');
    }
  };

  const handleDownloadQrImage = async () => {
    try {
      const response = await fetch(qrCodeImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${catalogName.replace(/[^a-z0-9_-]/gi, '_')}_QRCode.png`;
      a.click();
      window.URL.revokeObjectURL(url);
      if (showToast) showToast('QR Code image downloaded!', 'success');
    } catch (e) {
      window.open(qrCodeImageUrl, '_blank');
    }
  };

  const handleDownload = async () => {
    if (isExporting) return;
    setIsExporting(true);

    try {
      if (fileType === 'pdf' || fileType === 'pdf_cmyk') {
        let pagesToExport = catalog.pages;
        if (pageSelection === 'current') {
          pagesToExport = [catalog.pages[currentPageIndex] || catalog.pages[0]];
        } else if (pageSelection === 'custom') {
          const indices = customRange
            .split(',')
            .map(s => parseInt(s.trim(), 10) - 1)
            .filter(idx => !isNaN(idx) && idx >= 0 && idx < catalog.pages.length);
          if (indices.length > 0) {
            pagesToExport = indices.map(idx => catalog.pages[idx]);
          }
        }

        const targetCatalog = {
          ...catalog,
          pages: pagesToExport
        };

        const isCmyk = fileType === 'pdf_cmyk';
        await exportCatalogToPDF(targetCatalog, products, {
          colorMode: isCmyk ? 'cmyk' : 'rgb',
          dpiQuality,
          onProgress: (cur, tot, status) => {
            setExportProgress({ current: cur, total: tot, status });
          }
        });

        if (showToast) {
          showToast(isCmyk ? 'Print PDF (CMYK) downloaded successfully!' : 'PDF downloaded successfully!', 'success');
        }
      } else {
        // Image export (PNG)
        const targetPageIdx = pageSelection === 'current' ? currentPageIndex : 0;
        const page = catalog.pages[targetPageIdx] || catalog.pages[0];

        setExportProgress({ current: 1, total: 1, status: 'Rendering PNG Image...' });

        const hiddenCanvasEl = document.createElement('canvas');
        hiddenCanvasEl.width = PAGE_WIDTH;
        hiddenCanvasEl.height = PAGE_HEIGHT;
        hiddenCanvasEl.style.position = 'fixed';
        hiddenCanvasEl.style.left = '-9999px';
        hiddenCanvasEl.style.top = '-9999px';
        document.body.appendChild(hiddenCanvasEl);

        const offscreenCanvas = new Canvas(hiddenCanvasEl, {
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          selection: false,
          interactive: false,
          enableRetinaScaling: false
        });

        try {
          offscreenCanvas.backgroundColor = page.backgroundColor || catalog.backgroundColor || '#ffffff';
          const effectiveFooterHeight = catalog.footerHeight || 38;
          const footerBaseY = PAGE_HEIGHT - effectiveFooterHeight - (catalog.marginBottom || 0);
          const pageCategory = getPageCategoryName(page, categories, products, catalog);
          const dynamicContext = {
            pageNumber: targetPageIdx + 1,
            totalPages: catalog.pages?.length || 1,
            catalogName: catalog.name || 'Catalog',
            categoryName: pageCategory,
            companyName: (catalog as any).company || 'V-TAC',
            year: new Date().getFullYear(),
          };

          const pageHasHeader = page.hasHeader !== undefined ? page.hasHeader : (catalog.hasHeader !== false && (catalog.headerElements?.length || 0) > 0 && page.type !== 'cover');
          const pageHasFooter = page.hasFooter !== undefined ? page.hasFooter : (catalog.hasFooter !== false && (catalog.footerElements?.length || 0) > 0 && page.type !== 'cover');

          const allElements = [
            ...page.elements.map(el => ({
              ...el,
              zIndex: el.zIndex !== undefined ? el.zIndex : 0,
              text: el.type === 'text' ? resolveDynamicText(el.text, dynamicContext) : el.text
            })),
            ...(pageHasHeader ? (catalog.headerElements || []).map((el: any, idx: number) => ({
              ...el,
              zIndex: 1000 + (el.zIndex !== undefined ? el.zIndex : idx),
              text: el.type === 'text' ? resolveDynamicText(el.text, dynamicContext) : el.text
            })) : []),
            ...(pageHasFooter ? (catalog.footerElements || []).map((el: any, idx: number) => ({
              ...el,
              zIndex: 2000 + (el.zIndex !== undefined ? el.zIndex : idx),
              y: (el.y || 0) > 500 ? el.y : ((el.y || 0) + footerBaseY),
              text: el.type === 'text' ? resolveDynamicText(el.text, dynamicContext) : el.text
            })) : []),
          ];

          const objects = await Promise.all(
            allElements
              .filter(el => el.visible !== false)
              .map(el => elementToFabricObject(el, products, catalog))
          );

          const validObjs = objects.filter(Boolean);
          validObjs.sort((a: any, b: any) => (a.zIndex || 0) - (b.zIndex || 0));
          validObjs.forEach(o => offscreenCanvas.add(o));
          offscreenCanvas.renderAll();

          const multiplier = dpiQuality === 'ultra' ? 4 : (dpiQuality === 'high' ? 3 : 2);
          const format = fileType === 'png' ? 'png' : 'jpeg';
          const dataUrl = offscreenCanvas.toDataURL({
            multiplier,
            format,
            quality: 0.98
          });

          const downloadAnchor = document.createElement('a');
          const safeName = (catalog.name || 'Catalog').replace(/[^a-z0-9_-]/gi, '_');
          downloadAnchor.download = `${safeName}_page_${targetPageIdx + 1}.${fileType}`;
          downloadAnchor.href = dataUrl;
          downloadAnchor.click();
          if (showToast) showToast(`${fileType.toUpperCase()} downloaded successfully!`, 'success');
        } finally {
          offscreenCanvas.dispose();
          if (document.body.contains(hiddenCanvasEl)) {
            document.body.removeChild(hiddenCanvasEl);
          }
        }
      }
    } catch (err) {
      console.error('Download export failed:', err);
      if (showToast) showToast('Export failed. Please check console.', 'error');
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-lg rounded-md shadow-2xl border overflow-hidden flex flex-col max-h-[88vh] transition-all duration-200 ${
          isDark 
            ? 'bg-[#141414] border-[#E2DCC8]/20 text-[#F1F1F1]' 
            : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        {/* Header Tabs Navigation (Branded) */}
        <div className={`flex items-center justify-between border-b px-6 pt-3.5 shrink-0 ${isDark ? 'border-[#E2DCC8]/15 bg-[#100F0F]' : 'border-slate-100 bg-slate-50/80'}`}>
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

        {/* Tab Content Body (Scrollable container taking all remaining space) */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {/* ===================== SHARE TAB ===================== */}
          {activeTab === 'share' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Top Row: 3 Share Options */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-[#E2DCC8]/70 mb-2">
                  Share Options
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveShareFeature(activeShareFeature === 'private' ? null : 'private')}
                    className={`p-2.5 rounded-md border flex flex-col items-center justify-center gap-1 transition-all text-center cursor-pointer ${
                      activeShareFeature === 'private'
                        ? (isDark ? 'border-[#E2DCC8] bg-[#0F3D3E]/40 text-[#E2DCC8] ring-1 ring-[#0F3D3E]' : 'border-[#0F3D3E] bg-[#0F3D3E]/10 text-[#0F3D3E] ring-1 ring-[#0F3D3E]/20')
                        : isDark ? 'border-[#E2DCC8]/15 bg-[#100F0F] text-[#E2DCC8]/80 hover:border-[#E2DCC8]/30' : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300'
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
                        ? (isDark ? 'border-[#E2DCC8] bg-[#0F3D3E]/40 text-[#E2DCC8] ring-1 ring-[#0F3D3E]' : 'border-[#0F3D3E] bg-[#0F3D3E]/10 text-[#0F3D3E] ring-1 ring-[#0F3D3E]/20')
                        : isDark ? 'border-[#E2DCC8]/15 bg-[#100F0F] text-[#E2DCC8]/80 hover:border-[#E2DCC8]/30' : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <FileText size={16} className="text-[#E2DCC8]/70" />
                    <span className="text-[11px] font-semibold">Fillable Form</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveShareFeature(activeShareFeature === 'qr' ? null : 'qr')}
                    className={`p-2.5 rounded-md border flex flex-col items-center justify-center gap-1 transition-all text-center cursor-pointer ${
                      activeShareFeature === 'qr'
                        ? (isDark ? 'border-[#E2DCC8] bg-[#0F3D3E]/40 text-[#E2DCC8] ring-1 ring-[#0F3D3E]' : 'border-[#0F3D3E] bg-[#0F3D3E]/10 text-[#0F3D3E] ring-1 ring-[#0F3D3E]/20')
                        : isDark ? 'border-[#E2DCC8]/15 bg-[#100F0F] text-[#E2DCC8]/80 hover:border-[#E2DCC8]/30' : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <QrCode size={16} className="text-[#E2DCC8]/70" />
                    <span className="text-[11px] font-semibold">QR Code</span>
                  </button>
                </div>
              </div>

              {/* Default Public Link Panel (When no sub-option is selected) */}
              {!activeShareFeature && (
                <div className={`p-3.5 rounded-md border space-y-2.5 animate-in fade-in duration-150 ${
                  isDark ? 'bg-[#100F0F] border-[#E2DCC8]/20' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold flex items-center gap-1.5 text-[#E2DCC8]">
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
                    <span className="font-bold flex items-center gap-1.5 text-[#E2DCC8]">
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
                    <ShoppingCart size={16} className="text-[#E2DCC8]" />
                    <div>
                      <p className="text-xs font-bold text-[#F1F1F1]">Interactive Order & Quote Catalog</p>
                      <p className="text-[10px] text-[#E2DCC8]/60">Allows customers to select quantities and request orders directly.</p>
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
                    <p className="text-xs font-bold text-[#E2DCC8]">Instant Mobile Scan</p>
                    <p className="text-[10px] text-[#E2DCC8]/60">Point mobile camera to open catalog on phone immediately</p>
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
          )}

          {/* ===================== DOWNLOAD TAB ===================== */}
          {activeTab === 'download' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* File Format Selection */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-[#E2DCC8]/70 mb-2">
                  File Format
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setFileType('pdf')}
                    className={`p-3 rounded-md border flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                      fileType === 'pdf'
                        ? (isDark ? 'border-[#E2DCC8] bg-[#0F3D3E]/40 text-[#E2DCC8] ring-1 ring-[#0F3D3E]' : 'border-[#0F3D3E] bg-[#0F3D3E]/10 text-[#0F3D3E] ring-1 ring-[#0F3D3E]/20')
                        : isDark ? 'border-[#E2DCC8]/15 bg-[#100F0F] text-[#E2DCC8]/70 hover:border-[#E2DCC8]/30' : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300'
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
                        ? (isDark ? 'border-[#E2DCC8] bg-[#0F3D3E]/40 text-[#E2DCC8] ring-1 ring-[#0F3D3E]' : 'border-[#0F3D3E] bg-[#0F3D3E]/10 text-[#0F3D3E] ring-1 ring-[#0F3D3E]/20')
                        : isDark ? 'border-[#E2DCC8]/15 bg-[#100F0F] text-[#E2DCC8]/70 hover:border-[#E2DCC8]/30' : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300'
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
                        ? (isDark ? 'border-[#E2DCC8] bg-[#0F3D3E]/40 text-[#E2DCC8] ring-1 ring-[#0F3D3E]' : 'border-[#0F3D3E] bg-[#0F3D3E]/10 text-[#0F3D3E] ring-1 ring-[#0F3D3E]/20')
                        : isDark ? 'border-[#E2DCC8]/15 bg-[#100F0F] text-[#E2DCC8]/70 hover:border-[#E2DCC8]/30' : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300'
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
                <label className="block text-[10px] font-black uppercase tracking-wider text-[#E2DCC8]/70 mb-2">
                  Select Pages
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPageSelection('all')}
                    className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-[4px] border transition-all cursor-pointer ${
                      pageSelection === 'all'
                        ? 'bg-[#0F3D3E] text-[#F1F1F1] border-[#E2DCC8]/40 shadow-sm'
                        : isDark ? 'border-[#E2DCC8]/15 bg-[#100F0F] text-[#E2DCC8]/70 hover:border-[#E2DCC8]/30' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
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
                        : isDark ? 'border-[#E2DCC8]/15 bg-[#100F0F] text-[#E2DCC8]/70 hover:border-[#E2DCC8]/30' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
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
                        : isDark ? 'border-[#E2DCC8]/15 bg-[#100F0F] text-[#E2DCC8]/70 hover:border-[#E2DCC8]/30' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
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
                <label className="block text-[10px] font-black uppercase tracking-wider text-[#E2DCC8]/70 mb-2">
                  Resolution & Quality
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setDpiQuality('standard')}
                    className={`py-1.5 px-2 text-xs rounded-[4px] border text-center font-medium transition-all cursor-pointer ${
                      dpiQuality === 'standard'
                        ? 'border-[#E2DCC8] bg-[#0F3D3E]/40 text-[#E2DCC8] font-bold'
                        : isDark ? 'border-[#E2DCC8]/15 text-[#E2DCC8]/60 hover:text-[#F1F1F1]' : 'border-slate-200 text-slate-600'
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
                        : isDark ? 'border-[#E2DCC8]/15 text-[#E2DCC8]/60 hover:text-[#F1F1F1]' : 'border-slate-200 text-slate-600'
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
                        : isDark ? 'border-[#E2DCC8]/15 text-[#E2DCC8]/60 hover:text-[#F1F1F1]' : 'border-slate-200 text-slate-600'
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
          )}

          {/* ===================== EMBED TAB ===================== */}
          {activeTab === 'embed' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-[#E2DCC8]/70 mb-2">
                  Embed Style
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEmbedMode('flipbook')}
                    className={`p-3 rounded-md border flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                      embedMode === 'flipbook'
                        ? (isDark ? 'border-[#E2DCC8] bg-[#0F3D3E]/40 text-[#E2DCC8] ring-1 ring-[#0F3D3E]' : 'border-[#0F3D3E] bg-[#0F3D3E]/10 text-[#0F3D3E] ring-1 ring-[#0F3D3E]/20')
                        : isDark ? 'border-[#E2DCC8]/15 bg-[#100F0F] text-[#E2DCC8]/70 hover:border-[#E2DCC8]/30' : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <BookOpen size={18} />
                    <span className="text-xs font-bold">Interactive Flipbook</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmbedMode('scroll')}
                    className={`p-3 rounded-md border flex flex-col items-center gap-1.5 transition-all text-center cursor-pointer ${
                      embedMode === 'scroll'
                        ? (isDark ? 'border-[#E2DCC8] bg-[#0F3D3E]/40 text-[#E2DCC8] ring-1 ring-[#0F3D3E]' : 'border-[#0F3D3E] bg-[#0F3D3E]/10 text-[#0F3D3E] ring-1 ring-[#0F3D3E]/20')
                        : isDark ? 'border-[#E2DCC8]/15 bg-[#100F0F] text-[#E2DCC8]/70 hover:border-[#E2DCC8]/30' : 'border-slate-200 bg-slate-50/60 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <Globe size={18} />
                    <span className="text-xs font-bold">Web Page Catalog</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-[#E2DCC8]/70 mb-2">
                  HTML Embed Code
                </label>
                <div className={`p-3 rounded-md border font-mono text-xs overflow-x-auto select-all ${
                  isDark ? 'bg-[#100F0F] border-[#E2DCC8]/20 text-[#E2DCC8]' : 'bg-slate-50 border-slate-200 text-[#0F3D3E]'
                }`}>
                  {`<iframe src="${embedMode === 'flipbook' ? flipbookUrl : publicShareUrl}" width="${embedWidth}" height="${embedHeight}" frameborder="0" allowfullscreen></iframe>`}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-[#E2DCC8]/60 uppercase tracking-wider mb-1">
                    Width
                  </label>
                  <input
                    type="text"
                    value={embedWidth}
                    onChange={(e) => setEmbedWidth(e.target.value)}
                    className={`w-full px-3 py-1.5 text-xs rounded-[4px] border ${
                      isDark ? 'bg-[#100F0F] border-[#E2DCC8]/20 text-[#F1F1F1]' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#E2DCC8]/60 uppercase tracking-wider mb-1">
                    Height
                  </label>
                  <input
                    type="text"
                    value={embedHeight}
                    onChange={(e) => setEmbedHeight(e.target.value)}
                    className={`w-full px-3 py-1.5 text-xs rounded-[4px] border ${
                      isDark ? 'bg-[#100F0F] border-[#E2DCC8]/20 text-[#F1F1F1]' : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ===================== PUBLISH TAB ===================== */}
          {activeTab === 'publish' && (
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
                <label className="block text-[10px] font-black uppercase tracking-wider text-[#E2DCC8]/70 mb-2">
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
          )}
        </div>

        {/* Pinned Sticky Bottom Footer (Always stays fixed at the bottom of the modal) */}
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
      </div>
    </div>
  );
};

export default ExportModal;
