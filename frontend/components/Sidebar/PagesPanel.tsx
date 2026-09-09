import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Copy, BookOpen, FileText, List, Sparkles, LayoutGrid, Layers, LogOut, LayoutTemplate, SlidersHorizontal, Palette, X } from 'lucide-react';
import { Canvas, Textbox } from 'fabric';
import { useStore } from '../../store/useStore';
import { PageType, CatalogPage, CanvasElement } from '../../types';
import { THEMES, PAGE_WIDTH, PAGE_HEIGHT } from '../../constants';
import { elementToFabricObject } from '../Editor/fabricRenderer';
import { normalizeImageUrl } from '../../utils/imageUtils';
import TemplatesPanel from './TemplatesPanel';

const THUMB_BASE = 140;

const FabricThumb: React.FC<{ page: CatalogPage; canvasBg: string; catalog: any; products: any[]; pageNum: number }> = ({ page, canvasBg, catalog, products, pageNum }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uiTheme = useStore(state => state.uiTheme);
  const isDark = uiTheme === 'dark';

  const thumbW = THUMB_BASE;
  const thumbH = Math.round(thumbW * (PAGE_HEIGHT / PAGE_WIDTH));
  const [renderTrigger, setRenderTrigger] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;
    const scale = thumbW / PAGE_WIDTH;

    // Reset transform & clear
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, thumbW, thumbH);

    // Background fill
    ctx.fillStyle = page.backgroundColor || canvasBg || '#ffffff';
    ctx.fillRect(0, 0, thumbW, thumbH);

    // Scale to thumbnail coordinates
    ctx.scale(scale, scale);

    const pageHasHeader = page.hasHeader !== undefined ? page.hasHeader : (catalog.hasHeader && page.type !== 'cover');
    const pageHasFooter = page.hasFooter !== undefined ? page.hasFooter : (catalog.hasFooter && page.type !== 'cover');
    const footerBaseY = PAGE_HEIGHT - (catalog.footerHeight || 38) - (catalog.marginBottom || 0);
    const allElements = [
      ...(pageHasHeader ? catalog.headerElements || [] : []),
      ...page.elements,
      ...(pageHasFooter ? (catalog.footerElements || []).map((el: any) => ({
        ...el,
        y: (el.y || 0) > 500 ? el.y : ((el.y || 0) + footerBaseY),
        text: el.type === 'text' && el.text?.includes('{{page}}')
          ? el.text.replace(/\{\{page\}\}/gi, String(pageNum + 1))
          : el.text,
      })) : []),
    ];

    // Sort elements by zIndex
    const sortedElements = [...allElements].filter(el => el.visible !== false).sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

    sortedElements.forEach((el) => {
      ctx.save();
      ctx.globalAlpha = el.opacity ?? 1;

      // Translate to element position
      ctx.translate(el.x, el.y);
      if (el.rotation) {
        ctx.rotate((el.rotation * Math.PI) / 180);
      }

      if (el.type === 'shape' || el.type === 'comment') {
        const getCanvasFill = () => {
          if (!el.fill) return '#cbd5e1';
          if (el.fill.includes('linear-gradient')) {
            const match = el.fill.match(/linear-gradient\s*\(\s*([^,]+)\s*,\s*(#[a-fA-F0-9]+)\s*,\s*(#[a-fA-F0-9]+)\s*\)/i);
            if (match) {
              const dir = match[1].trim();
              const c1 = match[2].trim();
              const c2 = match[3].trim();
              let x1 = 0, y1 = 0, x2 = 0, y2 = 0;
              switch (dir) {
                case 'to right': x2 = el.width; break;
                case 'to bottom': y2 = el.height; break;
                case 'to bottom right': x2 = el.width; y2 = el.height; break;
                case 'to top right': y1 = el.height; x2 = el.width; break;
                default: x2 = el.width;
              }
              const grad = ctx.createLinearGradient(x1, y1, x2, y2);
              grad.addColorStop(0, c1);
              grad.addColorStop(1, c2);
              return grad;
            }
          }
          return el.fill;
        };

        ctx.fillStyle = getCanvasFill();
        if (el.shapeType === 'circle') {
          const r = Math.min(el.width, el.height) / 2;
          ctx.beginPath();
          ctx.arc(r, r, r, 0, Math.PI * 2);
          ctx.fill();
        } else if (el.shapeType === 'line') {
          ctx.strokeStyle = el.stroke || (typeof ctx.fillStyle === 'string' ? ctx.fillStyle : '#000000');
          ctx.lineWidth = el.strokeWidth || 2;
          ctx.beginPath();
          ctx.moveTo(0, el.height / 2);
          ctx.lineTo(el.width, el.height / 2);
          ctx.stroke();
        } else if (el.shapeType === 'roundedRect' || el.shapeType === 'pill') {
          const r = el.shapeType === 'pill' ? Math.min(el.width, el.height) / 2 : Math.min(el.width, el.height) * 0.15;
          ctx.beginPath();
          if (typeof (ctx as any).roundRect === 'function') {
            (ctx as any).roundRect(0, 0, el.width, el.height, r);
          } else {
            ctx.rect(0, 0, el.width, el.height);
          }
          ctx.fill();
        } else {
          ctx.fillRect(0, 0, el.width, el.height);
        }

        if (el.stroke && el.strokeWidth && el.shapeType !== 'line') {
          ctx.strokeStyle = el.stroke;
          ctx.lineWidth = el.strokeWidth;
          if (el.shapeType === 'circle') {
            const r = Math.min(el.width, el.height) / 2;
            ctx.beginPath();
            ctx.arc(r, r, r, 0, Math.PI * 2);
            ctx.stroke();
          } else if ((el.shapeType === 'roundedRect' || el.shapeType === 'pill') && typeof (ctx as any).roundRect === 'function') {
            ctx.beginPath();
            (ctx as any).roundRect(0, 0, el.width, el.height, el.shapeType === 'pill' ? Math.min(el.width, el.height) / 2 : Math.min(el.width, el.height) * 0.15);
            ctx.stroke();
          } else {
            ctx.strokeRect(0, 0, el.width, el.height);
          }
        }

        if (el.iconConfig) {
          ctx.save();
          const ic = el.iconConfig;
          const iSize = ic.size || (Math.min(el.width, el.height) * 0.5);
          const iFontFamily = (ic as any).fontFamily || 'Font Awesome 6 Free';
          const iWeight = (ic as any).fontWeight || '900';
          ctx.font = `${iWeight} ${iSize}px "${iFontFamily}", sans-serif`;
          ctx.fillStyle = ic.color || '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(ic.iconName, el.width / 2, el.height / 2);
          ctx.restore();
        }
      } else if (el.type === 'text') {
        let textContent = (el.text || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '');
        if (textContent.includes('{{page}}')) {
          textContent = textContent.replace(/\{\{page\}\}/gi, String(page.pageNumber || pageNum + 1));
        }
        ctx.fillStyle = el.fill || '#000000';
        const fontSize = el.fontSize || 16;
        ctx.font = `${el.fontWeight || 'normal'} ${fontSize}px ${el.fontFamily || 'Inter, sans-serif'}`;
        ctx.textBaseline = 'top';
        
        const textAlign = el.textAlign || 'left';
        ctx.textAlign = textAlign;
        let textX = 0;
        if (textAlign === 'center') textX = el.width / 2;
        else if (textAlign === 'right') textX = el.width;

        const lines = textContent.split('\n');
        const lineHeight = fontSize * (el.lineHeight || 1.2);
        lines.forEach((line, idx) => {
          ctx.fillText(line, textX, idx * lineHeight, el.width);
        });
      } else if (el.type === 'image' && el.src) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = normalizeImageUrl(el.src);
        if (img.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, 0, 0, el.width, el.height);
        } else {
          img.onload = () => {
            if (!isMounted) return;
            setRenderTrigger(prev => prev + 1);
          };
        }
      } else if (el.type === 'table' || el.tableData) {
        const td = el.tableData || {
          headers: ['MODEL NO', 'PRODUCTS', 'CUT-OUT', 'COLOR', 'DEALER PRICE', 'PACKING'],
          rows: [
            ['VT-2612', '12W V-TAC COB WHITE BODY', '75MM', 'W, W.W, N.W', '580', '20 PCS'],
            ['VT-2612', '12W VTAC 3IN1 ON SWITCH', '75MM', 'W, W.W, N.W', '1,000', '20 PCS'],
            ['VT-2612', '12W V-TAC COB DIMMABLE', '75MM', 'W, W.W, N.W', '1,500', '20 PCS']
          ]
        };

        const headerBg = td.headerBg || '#002b36';
        const headerTextColor = td.headerTextColor || '#ffffff';
        const rowBg = td.rowBg || '#ffffff';
        const alternateRowBg = td.alternateRowBg || '#f8fafc';
        const borderColor = td.borderColor || '#334155';
        const cellPadding = td.cellPadding || 6;
        const headerFontSize = td.headerFontSize || 9.5;
        const bodyFontSize = td.fontSize || 8.5;

        const numCols = td.headers?.length || 1;
        const dynamicHeaderFontSize = numCols > 6 ? Math.max(8.5, Math.min(headerFontSize, el.width / (numCols * 7.5))) : headerFontSize;
        const dynamicBodyFontSize = numCols > 6 ? Math.max(8.0, Math.min(bodyFontSize, el.width / (numCols * 8.0))) : bodyFontSize;

        const colWidths: number[] = [];
        if (td.colWidths && td.colWidths.length === numCols) {
          const totalRel = td.colWidths.reduce((a, b) => a + b, 0);
          td.colWidths.forEach(w => colWidths.push((w / totalRel) * el.width));
        } else {
          const weights = td.headers.map((h) => {
            const lower = (h || '').toLowerCase();
            if (lower.includes('product') || lower.includes('spec') || lower.includes('name') || lower.includes('desc')) return 2.2;
            if (lower.includes('model') || lower.includes('sku') || lower.includes('code')) return 1.5;
            if (lower.includes('cut') || lower.includes('dim')) return 1.1;
            if (lower.includes('color') || lower.includes('cct')) return 1.2;
            if (lower.includes('price') || lower.includes('mrp')) return 1.1;
            if (lower.includes('pack') || lower.includes('box')) return 1.1;
            return 1.0;
          });
          const totalWeight = weights.reduce((a, b) => a + b, 0);
          weights.forEach(w => colWidths.push((w / totalWeight) * el.width));
        }

        const estimateLines = (text: string, colW: number, fSize: number): number => {
          if (!text) return 1;
          const clean = text.toString().trim();
          const avgCharWidth = fSize * 0.58;
          const usableWidth = Math.max(15, colW - cellPadding * 2);
          const charsPerLine = Math.max(3, Math.floor(usableWidth / avgCharWidth));
          const words = clean.split(/\s+/);
          let lines = 1;
          let curLineLen = 0;
          words.forEach(word => {
            if (curLineLen + word.length > charsPerLine) {
              lines++;
              curLineLen = word.length;
            } else {
              curLineLen += word.length + 1;
            }
          });
          return lines;
        };

        let maxHeaderLines = 1;
        td.headers.forEach((h, colIdx) => {
          const l = estimateLines(h, colWidths[colIdx], dynamicHeaderFontSize);
          if (l > maxHeaderLines) maxHeaderLines = l;
        });
        const headerRowHeight = Math.max(28, maxHeaderLines * (dynamicHeaderFontSize * 1.3) + cellPadding * 2);

        const rowHeights: number[] = [];
        (td.rows || []).forEach(row => {
          let maxLinesInRow = 1;
          row.forEach((cellText, colIdx) => {
            const l = estimateLines(cellText, colWidths[colIdx] || (el.width / numCols), dynamicBodyFontSize);
            if (l > maxLinesInRow) maxLinesInRow = l;
          });
          rowHeights.push(Math.max(26, maxLinesInRow * (dynamicBodyFontSize * 1.35) + cellPadding * 2));
        });

        const totalTableHeight = headerRowHeight + rowHeights.reduce((a, b) => a + b, 0);

        // 1. Header Background
        ctx.fillStyle = headerBg;
        ctx.fillRect(0, 0, el.width, headerRowHeight);

        // 2. Header Cells
        let currentX = 0;
        td.headers.forEach((headerText, colIdx) => {
          const colW = colWidths[colIdx];
          ctx.fillStyle = headerTextColor;
          ctx.font = `900 ${dynamicHeaderFontSize}px Montserrat, sans-serif`;
          ctx.textBaseline = 'middle';
          
          const isLeft = colIdx === 0 || colIdx === 1;
          ctx.textAlign = isLeft ? 'left' : 'center';
          const textX = isLeft ? currentX + cellPadding : currentX + colW / 2;
          const textY = headerRowHeight / 2;

          ctx.save();
          ctx.beginPath();
          ctx.rect(currentX, 0, colW, headerRowHeight);
          ctx.clip();
          ctx.fillText((headerText || '').toUpperCase(), textX, textY, colW - cellPadding * 2);
          ctx.restore();

          if (colIdx < numCols - 1) {
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(currentX + colW, 0);
            ctx.lineTo(currentX + colW, headerRowHeight);
            ctx.stroke();
          }
          currentX += colW;
        });

        // 3. Body Rows
        let curY = headerRowHeight;
        (td.rows || []).forEach((row, rowIdx) => {
          const rHeight = rowHeights[rowIdx] || 26;
          const bg = rowIdx % 2 === 1 ? alternateRowBg : rowBg;

          ctx.fillStyle = bg;
          ctx.fillRect(0, curY, el.width, rHeight);

          // Horizontal row divider line
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, curY);
          ctx.lineTo(el.width, curY);
          ctx.stroke();

          let cellX = 0;
          row.forEach((cellText, colIdx) => {
            const colW = colWidths[colIdx] || (el.width / numCols);
            ctx.fillStyle = '#0f172a';
            ctx.font = `${colIdx === 0 ? '700' : '500'} ${dynamicBodyFontSize}px Inter, sans-serif`;
            ctx.textBaseline = 'middle';
            
            const isLeft = colIdx === 0 || colIdx === 1;
            ctx.textAlign = isLeft ? 'left' : 'center';
            const textX = isLeft ? cellX + cellPadding : cellX + colW / 2;
            const textY = curY + rHeight / 2;

            ctx.save();
            ctx.beginPath();
            ctx.rect(cellX, curY, colW, rHeight);
            ctx.clip();
            ctx.fillText(cellText || '-', textX, textY, colW - cellPadding * 2);
            ctx.restore();

            if (colIdx < numCols - 1) {
              ctx.strokeStyle = borderColor;
              ctx.lineWidth = 0.8;
              ctx.beginPath();
              ctx.moveTo(cellX + colW, curY);
              ctx.lineTo(cellX + colW, curY + rHeight);
              ctx.stroke();
            }

            cellX += colW;
          });

          curY += rHeight;
        });

        // 4. Outer table border
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(0, 0, el.width, totalTableHeight);
      } else if (el.type === 'product-block') {
        const prod = products.find(p => p.id === el.productId);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, el.width, el.height);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(0, 0, el.width, el.height);

        const imgSrc = el.src || prod?.image;
        const imgH = Math.max(30, el.height * 0.48);
        if (imgSrc) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = normalizeImageUrl(imgSrc);
          if (img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, 8, 8, el.width - 16, imgH - 12);
          } else {
            img.onload = () => {
              if (!isMounted) return;
              setRenderTrigger(prev => prev + 1);
            };
          }
        }

        let curTop = 8 + imgH;
        if (prod?.name) {
          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 12px Inter, sans-serif';
          ctx.textBaseline = 'top';
          ctx.textAlign = 'left';
          ctx.fillText(prod.name, 8, curTop, el.width - 16);
          curTop += 16;
        }

        if (prod?.price) {
          ctx.fillStyle = '#4f46e5';
          ctx.font = 'bold 11px Inter, sans-serif';
          ctx.textBaseline = 'top';
          ctx.textAlign = 'left';
          ctx.fillText(`${prod.currency || '₹'}${prod.price}`, 8, curTop, el.width - 16);
        }
      }

      ctx.restore();
    });

    return () => {
      isMounted = false;
    };
  }, [page, canvasBg, catalog, products, pageNum, thumbW, thumbH, renderTrigger]);

  return (
    <div className={`flex justify-center items-center py-2 w-full rounded-[4px] overflow-hidden ${isDark ? 'bg-[#121212]' : 'bg-slate-50/50'}`}>
      <canvas
        ref={canvasRef}
        width={thumbW}
        height={thumbH}
        className={`rounded-[3px] shadow-sm border ${isDark ? 'border-[#262626] bg-[#1a1a1a]' : 'border-slate-200 bg-white'}`}
        style={{ width: `${thumbW}px`, height: `${thumbH}px` }}
      />
    </div>
  );
};

const PagesPanel: React.FC = () => {
  const {
    catalog, activeThemeId, currentPageIndex, setCurrentPageIndex,
    addPage, removePage, duplicatePage, reorderPages, setPageBackground, uiTheme, products,
  } = useStore();

  const theme = THEMES.find(t => t.id === activeThemeId) || THEMES[0];
  const canvasBg = catalog.backgroundColor || theme.backgroundColor;

  const [isAddMenuOpen, setAddMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [configPageIndex, setConfigPageIndex] = useState<number | null>(null);
  const [dragPageIndex, setDragPageIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const isDark = uiTheme === 'dark';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) setAddMenuOpen(false);
    };
    if (isAddMenuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAddMenuOpen]);

  const handleAddPage = (type: PageType) => { addPage(type); setAddMenuOpen(false); };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragPageIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '0.4';
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '1';
    if (dragPageIndex !== null && dropTargetIndex !== null && dragPageIndex !== dropTargetIndex) {
      const newOrder = [...catalog.pages.map(p => p.id)];
      const [movedId] = newOrder.splice(dragPageIndex, 1);
      newOrder.splice(dropTargetIndex, 0, movedId);
      reorderPages(newOrder);
      setCurrentPageIndex(dropTargetIndex);
    }
    setDragPageIndex(null);
    setDropTargetIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetIndex(index);
  };

  const [activeTab, setActiveTab] = useState<'pages' | 'templates'>('pages');

  return (
    <div className={`flex flex-col h-full w-full border-r overflow-hidden ${isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200'}`}>
      {/* Header with Segmented Tabs for Pages & Templates */}
      <div className={`p-2.5 border-b shrink-0 ${isDark ? 'border-[#262626]' : 'border-slate-100'}`}>
        <div className={`flex rounded-[4px] p-0.5 ${isDark ? 'bg-[#121212] border border-[#262626]' : 'bg-slate-100'}`}>
          <button
            onClick={() => setActiveTab('pages')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-[3px] text-[11px] font-bold transition-all ${
              activeTab === 'pages'
                ? 'bg-[#0F3D3E] text-white shadow-sm'
                : isDark ? 'text-[#888] hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText size={13} />
            <span>Pages ({catalog.pages.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-[3px] text-[11px] font-bold transition-all ${
              activeTab === 'templates'
                ? 'bg-[#0F3D3E] text-white shadow-sm'
                : isDark ? 'text-[#888] hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LayoutTemplate size={13} />
            <span>Templates</span>
          </button>
        </div>
      </div>

      {activeTab === 'templates' ? (
        <div className="flex-1 overflow-hidden">
          <TemplatesPanel hideHeader={true} />
        </div>
      ) : (
        <>
          {/* Pages List — Drag & Drop */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
            {catalog.pages.map((page, index) => {
              const isActive = currentPageIndex === index;
              const isDropTarget = dropTargetIndex === index && dragPageIndex !== null && dragPageIndex !== index;
              return (
                <div
                  key={page.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, index)}
                  className={`group relative rounded-[4px] cursor-grab active:cursor-grabbing transition-all p-2 border
                    ${isDropTarget ? 'border-t-2 border-[#0F3D3E]' : ''}
                    ${isActive ? (isDark ? 'bg-[#1f1f1f] border-[#0F3D3E] shadow-sm' : 'bg-orange-50/50 border-[#0F3D3E]') : (isDark ? 'bg-[#141414] border-[#262626] hover:border-[#3a3a3a] hover:bg-[#1a1a1a]' : 'bg-white border-slate-200 hover:bg-slate-50')}
                    ${dragPageIndex === index ? 'opacity-40' : ''}`}
                  onClick={() => {
                    setCurrentPageIndex(index);
                    window.dispatchEvent(new CustomEvent('catalog:scrollToPage', { detail: { pageIndex: index } }));
                  }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <FabricThumb page={page} canvasBg={canvasBg} catalog={catalog} products={products} pageNum={index} />

                  <div className="flex items-center justify-between mt-2 px-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-[#E2DCC8]' : (isDark ? 'text-white' : 'text-slate-700')}`}>Page {index + 1}</span>
                    <span className={`text-[9px] font-medium capitalize px-1.5 py-0.5 rounded-[3px] ${isDark ? 'bg-[#222] text-[#888]' : 'bg-slate-100 text-slate-500'}`}>{page.type}</span>
                  </div>

                  {/* Action Icons on Thumbnail Hover */}
                  {hoveredIndex === index && (
                    <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfigPageIndex(configPageIndex === index ? null : index);
                        }}
                        className={`p-1.5 rounded-[4px] shadow-md border transition-all ${
                          configPageIndex === index
                            ? 'bg-[#0F3D3E] text-white border-[#0F3D3E]'
                            : isDark ? 'bg-[#1e1e1e] text-[#aaa] border-[#333] hover:text-white hover:bg-[#252525]' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                        }`}
                        title="Page Settings (Background Color & Role)"
                      >
                        <SlidersHorizontal size={12} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); duplicatePage(index); }}
                        className={`p-1.5 rounded-[4px] shadow-md border transition-all ${isDark ? 'bg-[#1e1e1e] text-[#aaa] border-[#333] hover:text-white hover:bg-[#252525]' : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'}`}
                        title="Duplicate page"
                      >
                        <Copy size={12} />
                      </button>
                      {catalog.pages.length > 1 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); removePage(index); }}
                          className={`p-1.5 rounded-[4px] shadow-md border transition-all ${isDark ? 'bg-[#1e1e1e] text-red-400 border-[#333] hover:bg-red-500/20' : 'bg-white text-red-500 hover:bg-red-50 border-slate-200'}`}
                          title="Delete page"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Page Configuration Popover */}
                  {configPageIndex === index && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className={`mt-2 p-3 rounded-[6px] border shadow-xl animate-in fade-in zoom-in-95 duration-150 z-20 ${
                        isDark ? 'bg-[#1c1c1c] border-[#333] text-white' : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#262626]">
                        <div className="flex items-center gap-1.5">
                          <Palette size={13} className="text-indigo-600 dark:text-indigo-400" />
                          <span className="text-[11px] font-black uppercase tracking-wider">Page {index + 1} Settings</span>
                        </div>
                        <button
                          onClick={() => setConfigPageIndex(null)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          <X size={12} />
                        </button>
                      </div>

                      {/* 1. Background Color */}
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                          Background Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={page.backgroundColor || canvasBg}
                            onChange={(e) => setPageBackground(index, e.target.value)}
                            className="w-8 h-8 rounded-[4px] cursor-pointer border border-slate-200 dark:border-slate-700 p-0.5 bg-transparent"
                          />
                          <input
                            type="text"
                            value={page.backgroundColor || canvasBg}
                            onChange={(e) => setPageBackground(index, e.target.value)}
                            className={`flex-1 px-2 py-1 rounded-[4px] text-xs font-mono font-bold border uppercase ${
                              isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                            }`}
                            placeholder="#ffffff"
                          />
                        </div>

                        {/* Color Presets */}
                        <div className="flex items-center gap-1.5 pt-1">
                          {[
                            { color: '#ffffff', label: 'White' },
                            { color: '#f8fafc', label: 'Off-White' },
                            { color: '#0f172a', label: 'Dark Navy' },
                            { color: '#18181b', label: 'Zinc Dark' },
                            { color: '#fef2f2', label: 'Warm Red' },
                            { color: '#eff6ff', label: 'Soft Blue' },
                            { color: '#f0fdf4', label: 'Mint Green' },
                          ].map((preset) => (
                            <button
                              key={preset.color}
                              onClick={() => setPageBackground(index, preset.color)}
                              className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 transition-transform hover:scale-110 shadow-sm"
                              style={{ backgroundColor: preset.color }}
                              title={preset.label}
                            />
                          ))}
                        </div>
                      </div>

                      {/* 2. Page Type Selection */}
                      <div className="space-y-1.5 pt-3 mt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                          Page Role / Type
                        </label>
                        <div className="grid grid-cols-2 gap-1">
                          {(['cover', 'product', 'intro', 'index', 'closing', 'blank'] as PageType[]).map((type) => (
                            <button
                              key={type}
                              onClick={() => {
                                const newPages = [...catalog.pages];
                                newPages[index] = { ...newPages[index], type };
                                useStore.setState({ catalog: { ...catalog, pages: newPages } });
                              }}
                              className={`py-1 px-2 rounded-[4px] text-[10px] font-bold capitalize transition-all border text-left ${
                                page.type === type
                                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                                  : isDark ? 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Page Button */}
          <div className={`shrink-0 p-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`} ref={addMenuRef}>
            <div className="relative">
              <button
                onClick={() => setAddMenuOpen(!isAddMenuOpen)}
                className={`w-full flex items-center justify-center gap-2 py-2 rounded-[4px] border-2 border-dashed text-[11px] font-bold uppercase tracking-wide transition-all ${isDark ? 'border-slate-700 text-slate-500 hover:border-indigo-500 hover:text-indigo-400 hover:bg-indigo-500/10' : 'border-slate-200 text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50'}`}
              >
                <Plus size={13} /> Add Page
              </button>

              {isAddMenuOpen && (
                <div className={`absolute bottom-full mb-2 left-0 right-0 border shadow-2xl rounded-[4px] overflow-hidden z-50 py-1 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                  <p className={`px-3 py-2 text-[9px] font-black uppercase tracking-widest border-b ${isDark ? 'text-slate-500 border-slate-700' : 'text-slate-400 border-slate-100'}`}>Select Page Type</p>
                  <div className="p-1 space-y-0.5">
                    {[
                      { icon: BookOpen, label: '1. Cover Page', type: 'cover' as PageType },
                      { icon: LayoutGrid, label: '2. Product Page', type: 'product' as PageType },
                      { icon: List, label: '3. Index Page', type: 'index' as PageType },
                      { icon: Layers, label: '4. Intro / Section', type: 'intro' as PageType },
                      { icon: LogOut, label: '5. Outro / Closing', type: 'closing' as PageType },
                      { icon: FileText, label: '6. Blank Page', type: 'blank' as PageType },
                    ].map(({ icon: Icon, label, type }) => (
                      <button
                        key={type}
                        onClick={() => handleAddPage(type)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-left transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-indigo-50 text-slate-700'}`}
                      >
                        <div className={`w-7 h-7 rounded-[4px] flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                          <Icon size={13} className={isDark ? 'text-slate-400' : 'text-slate-500'} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold leading-none mb-0.5">{label}</p>
                          <p className={`text-[9px] uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{type}</p>
                        </div>
                      </button>
                    ))}
                    <div className={`h-px mx-2 my-1 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`} />
                    <button
                      onClick={() => { addPage('product'); setAddMenuOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[4px] text-left transition-colors ${isDark ? 'hover:bg-indigo-600/20 text-slate-300' : 'hover:bg-indigo-50 text-slate-700'}`}
                    >
                      <div className="w-7 h-7 rounded-[4px] bg-indigo-600 flex items-center justify-center">
                        <Sparkles size={13} className="text-white" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold leading-none mb-0.5">Inherit Layout</p>
                        <p className={`text-[9px] uppercase tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Clone current</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PagesPanel;
