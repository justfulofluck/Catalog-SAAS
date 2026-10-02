import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { exportCatalogToPDF } from './pdfExporter';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../../constants';
import { elementToFabricObject } from './fabricRenderer';
import { resolveDynamicText, getPageCategoryName } from '../../utils/dynamicTags';
import { Canvas } from 'fabric';
import {
  ExportHeader,
  ExportShareTab,
  ExportDownloadTab,
  ExportEmbedTab,
  ExportPublishTab,
  ExportFooter,
} from './Export';

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

          const pageHasHeader = Boolean(catalog.hasHeader !== false && page.hasHeader !== false && (catalog.headerElements?.length || 0) > 0 && page.type !== 'cover');
          const pageHasFooter = Boolean(catalog.hasFooter !== false && page.hasFooter !== false && (catalog.footerElements?.length || 0) > 0 && page.type !== 'cover');

          const pageIsLandscape = page.orientation === 'landscape';
          const allElements = [
            ...(page.backgroundImage ? [{
              id: `bg-img-${page.id}`,
              type: 'image' as const,
              x: 0,
              y: 0,
              width: pageIsLandscape ? PAGE_HEIGHT : PAGE_WIDTH,
              height: pageIsLandscape ? PAGE_WIDTH : PAGE_HEIGHT,
              src: page.backgroundImage,
              opacity: page.backgroundOpacity ?? 1,
              zIndex: -9999,
            }] : []),
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
        {/* Header Tabs Navigation */}
        <ExportHeader
          isDark={isDark}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onClose={onClose}
        />

        {/* Tab Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {activeTab === 'share' && (
            <ExportShareTab
              isDark={isDark}
              activeShareFeature={activeShareFeature}
              setActiveShareFeature={setActiveShareFeature}
              publicShareUrl={publicShareUrl}
              privateShareUrl={privateShareUrl}
              formOrderUrl={formOrderUrl}
              qrCodeImageUrl={qrCodeImageUrl}
              copiedLink={copiedLink}
              copiedFeatureLink={copiedFeatureLink}
              handleCopyShareLink={handleCopyShareLink}
              handleCopyCustomLink={handleCopyCustomLink}
              handleDownloadQrImage={handleDownloadQrImage}
            />
          )}

          {activeTab === 'download' && (
            <ExportDownloadTab
              isDark={isDark}
              fileType={fileType}
              setFileType={setFileType}
              pageSelection={pageSelection}
              setPageSelection={setPageSelection}
              customRange={customRange}
              setCustomRange={setCustomRange}
              dpiQuality={dpiQuality}
              setDpiQuality={setDpiQuality}
              totalPages={totalPages}
              currentPageIndex={currentPageIndex}
              isExporting={isExporting}
              exportProgress={exportProgress}
            />
          )}

          {activeTab === 'embed' && (
            <ExportEmbedTab
              isDark={isDark}
              embedMode={embedMode}
              setEmbedMode={setEmbedMode}
              embedWidth={embedWidth}
              setEmbedWidth={setEmbedWidth}
              embedHeight={embedHeight}
              setEmbedHeight={setEmbedHeight}
              flipbookUrl={flipbookUrl}
              publicShareUrl={publicShareUrl}
            />
          )}

          {activeTab === 'publish' && (
            <ExportPublishTab
              isDark={isDark}
              publicShareUrl={publicShareUrl}
              copiedLink={copiedLink}
              handleCopyShareLink={handleCopyShareLink}
            />
          )}
        </div>

        {/* Sticky Bottom Footer */}
        <ExportFooter
          isDark={isDark}
          activeTab={activeTab}
          isExporting={isExporting}
          fileType={fileType}
          copiedLink={copiedLink}
          copiedEmbed={copiedEmbed}
          publicShareUrl={publicShareUrl}
          handleDownload={handleDownload}
          handleCopyShareLink={handleCopyShareLink}
          handleCopyEmbedCode={handleCopyEmbedCode}
        />
      </div>
    </div>
  );
};

export default ExportModal;
