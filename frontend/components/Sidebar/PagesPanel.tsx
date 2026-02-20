import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Copy, BookOpen, FileText, List, Sparkles } from 'lucide-react';
import { Stage as KonvaStage, Layer as KonvaLayer, Rect as KonvaRect, Group as KonvaGroup, Image as KonvaImage, Text as KonvaText } from 'react-konva';
import useImage from 'use-image';
import { useStore } from '../../store/useStore';
import { PageType, CatalogPage, CanvasElement, Product } from '../../types';
import { THEMES, PAGE_WIDTH, PAGE_HEIGHT } from '../../constants';

const THUMB_BASE = 140;
const THUMB_SCALE_PORTRAIT = THUMB_BASE / PAGE_WIDTH;
const THUMB_SCALE_LANDSCAPE = THUMB_BASE / PAGE_HEIGHT;

// Renders a single canvas element inside the thumbnail
const ThumbElement: React.FC<{ el: CanvasElement; products: Product[] }> = ({ el, products }) => {
    const imgSrc = el.type === 'product-block'
        ? (products.find(p => p.id === el.productId)?.image || el.src || '')
        : (el.src || '');
    const [img] = useImage(imgSrc, 'anonymous');

    if ((el.type === 'image' || el.type === 'product-block') && img) {
        const containerRatio = el.width / el.height;
        const imgRatio = img.width / img.height;
        let cropW = img.width, cropH = img.height, cropX = 0, cropY = 0;
        if (containerRatio > imgRatio) { cropH = img.width / containerRatio; cropY = (img.height - cropH) / 2; }
        else { cropW = img.height * containerRatio; cropX = (img.width - cropW) / 2; }

        return (
            <KonvaImage
                x={el.x} y={el.y} width={el.width} height={el.height}
                rotation={el.rotation} opacity={el.opacity ?? 1}
                image={img} crop={{ x: cropX, y: cropY, width: cropW, height: cropH }}
                listening={false}
            />
        );
    }

    if (el.type === 'text') {
        return (
            <KonvaText
                x={el.x} y={el.y} width={el.width} height={el.height}
                rotation={el.rotation} opacity={el.opacity ?? 1}
                text={(el.text || '').replace(/<[^>]*>/g, '')}
                fontSize={el.fontSize || 14}
                fontFamily={el.fontFamily || 'Inter'}
                fontStyle={`${el.fontWeight || 'normal'} ${el.fontStyle || 'normal'}`}
                fill={el.fill || '#000'}
                align={el.textAlign || 'left'}
                listening={false}
                wrap="word"
                ellipsis
            />
        );
    }

    if (el.type === 'shape') {
        if (el.shapeType === 'circle') {
            return (
                <KonvaRect
                    x={el.x} y={el.y} width={el.width} height={el.height}
                    rotation={el.rotation} opacity={el.opacity ?? 1}
                    fill={el.fill || '#94a3b8'} cornerRadius={Math.min(el.width, el.height) / 2}
                    listening={false}
                />
            );
        }
        return (
            <KonvaRect
                x={el.x} y={el.y} width={el.width} height={el.height}
                rotation={el.rotation} opacity={el.opacity ?? 1}
                fill={el.fill || '#94a3b8'} listening={false}
            />
        );
    }

    if (el.type === 'product-block') {
        return (
            <KonvaRect
                x={el.x} y={el.y} width={el.width} height={el.height}
                rotation={el.rotation} opacity={(el.opacity ?? 1) * 0.3}
                fill="#6366f1" cornerRadius={4} listening={false}
            />
        );
    }

    return (
        <KonvaRect
            x={el.x} y={el.y} width={el.width} height={el.height}
            rotation={el.rotation} opacity={(el.opacity ?? 1) * 0.6}
            fill={el.fill || '#6366f1'} cornerRadius={4} listening={false}
        />
    );
};

const PageThumbnail: React.FC<{ page: CatalogPage; index: number; isActive: boolean; canvasBg: string; products: Product[]; catalog: any }> = ({ page, index, isActive, canvasBg, products, catalog }) => {
    const isLandscape = page.orientation === 'landscape';
    const curW = isLandscape ? PAGE_HEIGHT : PAGE_WIDTH;
    const curH = isLandscape ? PAGE_WIDTH : PAGE_HEIGHT;

    // Scale so it fits in our 140px wide sidebar container
    const thumbW = THUMB_BASE;
    const thumbH = Math.round(thumbW * (curH / curW));
    const thumbScale = thumbW / curW;

    return (
        <div
            className={`overflow-hidden rounded-sm border transition-all ${isActive ? 'border-indigo-500 ring-2 ring-indigo-400/30' : 'border-slate-200 hover:border-slate-300'}`}
            style={{ width: thumbW, height: thumbH, margin: '0 auto' }}
        >
            <KonvaStage width={thumbW} height={thumbH} scaleX={thumbScale} scaleY={thumbScale} listening={false}>
                <KonvaLayer>
                    <KonvaRect width={curW} height={curH} fill={canvasBg} />

                    {/* Master Header */}
                    {catalog.hasHeader && catalog.headerElements.map((el: any) => (
                        <ThumbElement key={`header-${el.id}`} el={el} products={products} />
                    ))}

                    {/* Master Footer */}
                    {catalog.hasFooter && catalog.footerElements.map((el: any) => {
                        const footerShift = curH - PAGE_HEIGHT;
                        const elWithPage = el.type === 'text' && el.text?.includes('{{page}}')
                            ? { ...el, y: el.y + footerShift, text: el.text.replace('{{page}}', String(index + 1)) }
                            : { ...el, y: el.y + footerShift };
                        return <ThumbElement key={`footer-${el.id}`} el={elWithPage} products={products} />;
                    })}

                    <KonvaGroup>
                        {page.elements.map(el => (
                            <ThumbElement key={el.id} el={el} products={products} />
                        ))}
                    </KonvaGroup>
                </KonvaLayer>
            </KonvaStage>
        </div>
    );
};

const PagesPanel: React.FC = () => {
    const {
        catalog, activeThemeId, currentPageIndex, setCurrentPageIndex,
        addPage, removePage, duplicatePage, reorderPages, uiTheme, products,
    } = useStore();

    const theme = THEMES.find(t => t.id === activeThemeId) || THEMES[0];
    const canvasBg = catalog.backgroundColor || theme.backgroundColor;

    const [isAddMenuOpen, setAddMenuOpen] = useState(false);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
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
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '0.4';
        }
    };

    const handleDragEnd = (e: React.DragEvent) => {
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '1';
        }
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

    return (
        <div className={`flex flex-col h-full w-[200px] border-r overflow-hidden ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            {/* Header */}
            <div className={`flex items-center justify-between px-3 py-3 border-b shrink-0 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <span className={`text-[11px] font-black uppercase tracking-widest ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Pages</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                    {catalog.pages.length}
                </span>
            </div>

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
                            className={`group relative rounded-lg cursor-grab active:cursor-grabbing transition-all p-1.5
                                ${isDropTarget ? 'border-t-2 border-indigo-500' : 'border-t-2 border-transparent'}
                                ${isActive
                                    ? isDark ? 'bg-indigo-600/20' : 'bg-indigo-50'
                                    : isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'
                                }
                                ${dragPageIndex === index ? 'opacity-40' : ''}`}
                            onClick={() => {
                                setCurrentPageIndex(index);
                                window.dispatchEvent(new CustomEvent('catalog:scrollToPage', { detail: { pageIndex: index } }));
                            }}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <PageThumbnail page={page} index={index} isActive={isActive} canvasBg={canvasBg} products={products} catalog={catalog} />

                            <div className="flex items-center justify-between mt-1.5 px-0.5">
                                <span className={`text-[10px] font-bold uppercase tracking-wide ${isActive ? 'text-indigo-600' : isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    Page {index + 1}
                                </span>
                                <span className={`text-[9px] capitalize ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{page.type}</span>
                            </div>

                            {hoveredIndex === index && (
                                <div className="absolute top-2 right-2 flex flex-col gap-1 z-10">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); useStore.getState().setPageOrientation(index, page.orientation === 'landscape' ? 'portrait' : 'landscape'); }}
                                        className="p-1.5 bg-white text-indigo-600 rounded-lg shadow-lg hover:bg-indigo-50 border border-indigo-100 transition-all active:scale-95"
                                        title={`Switch to ${page.orientation === 'landscape' ? 'Portrait' : 'Landscape'}`}
                                    >
                                        <div className={`transition-transform duration-300 ${page.orientation === 'landscape' ? 'rotate-90' : ''}`}>
                                            <div className="w-2.5 h-3.5 border-2 border-current rounded-[2px]" />
                                        </div>
                                    </button>
                                    <div className="h-px bg-slate-100 my-0.5" />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); duplicatePage(index); }}
                                        className="p-1.5 bg-white text-slate-600 rounded-lg shadow-md hover:bg-slate-50 border border-slate-200"
                                        title="Duplicate page"
                                    >
                                        <Copy size={12} />
                                    </button>
                                    {catalog.pages.length > 1 && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removePage(index); }}
                                            className="p-1.5 bg-white text-red-500 rounded-lg shadow-md hover:bg-red-50 border border-slate-200"
                                            title="Delete page"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    )}
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
                        className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg border-2 border-dashed text-[11px] font-bold uppercase tracking-wide transition-all ${isDark
                            ? 'border-slate-700 text-slate-500 hover:border-indigo-500 hover:text-indigo-400 hover:bg-indigo-500/10'
                            : 'border-slate-200 text-slate-400 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50'
                            }`}
                    >
                        <Plus size={13} /> Add Page
                    </button>

                    {isAddMenuOpen && (
                        <div className={`absolute bottom-full mb-2 left-0 right-0 border shadow-2xl rounded-xl overflow-hidden z-50 py-1 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                            <p className={`px-3 py-2 text-[9px] font-black uppercase tracking-widest border-b ${isDark ? 'text-slate-500 border-slate-700' : 'text-slate-400 border-slate-100'}`}>
                                Select Page Type
                            </p>
                            <div className="p-1 space-y-0.5">
                                {[
                                    { icon: BookOpen, label: 'Hero Cover', type: 'cover' as PageType },
                                    { icon: List, label: 'Index Page', type: 'index' as PageType },
                                    { icon: FileText, label: 'Blank Interior', type: 'interior' as PageType },
                                    { icon: FileText, label: 'Closing Page', type: 'closing' as PageType },
                                ].map(({ icon: Icon, label, type }) => (
                                    <button
                                        key={type}
                                        onClick={() => handleAddPage(type)}
                                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-indigo-50 text-slate-700'}`}
                                    >
                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
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
                                    onClick={() => { addPage('interior'); setAddMenuOpen(false); }}
                                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${isDark ? 'hover:bg-indigo-600/20 text-slate-300' : 'hover:bg-indigo-50 text-slate-700'}`}
                                >
                                    <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
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
        </div>
    );
};

export default PagesPanel;
