
import React, { useRef, useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { X, Lock, Unlock, Eye, EyeOff, GripVertical, Box, Type, Image as ImageIcon, MessageSquare, Layers } from 'lucide-react';
import { CanvasElement } from '../../types';

const SceneTreePanel: React.FC = () => {
    const {
        catalog, currentPageIndex, isSceneTreeOpen, setIsSceneTreeOpen,
        toggleLockElement, toggleVisibilityElement, reorderElements,
        reorderHeaderElements, reorderFooterElements,
        uiTheme, selectedElementIds, setSelectedElements
    } = useStore();

    // Floating Window State
    const [position, setPosition] = useState({ x: window.innerWidth - 320, y: 80 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const panelRef = useRef<HTMLDivElement>(null);

    // List Dragging State
    const [draggedItemIndex, setDraggedItemIndex] = useState<{ section: 'header' | 'page' | 'footer', index: number } | null>(null);

    const currentPage = catalog.pages[currentPageIndex];

    const isDark = uiTheme === 'dark';

    const renderElementItem = (el: CanvasElement, section: 'header' | 'page' | 'footer', index: number, displayList: CanvasElement[]) => {
        const isSelected = selectedElementIds.includes(el.id);
        const hasGroup = !!el.groupId;
        const isNextInGroup = hasGroup && index < displayList.length - 1 && displayList[index + 1].groupId === el.groupId;
        const isPrevInGroup = hasGroup && index > 0 && displayList[index - 1].groupId === el.groupId;

        return (
            <div
                key={el.id}
                draggable
                onDragStart={(e) => handleDragStart(e, section, index)}
                onDragOver={(e) => handleDragOver(e, section, index, displayList)}
                onDragEnd={handleDragEnd}
                onClick={() => setSelectedElements([el.id])}
                className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg mb-0.5 text-[11px] font-medium border border-transparent transition-all select-none relative
                    ${isSelected
                        ? (isDark ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-200' : 'bg-indigo-50 border-indigo-100 text-indigo-700')
                        : (isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50')
                    }
                    ${draggedItemIndex?.section === section && draggedItemIndex?.index === index ? 'opacity-20' : 'opacity-100'}
                    ${hasGroup ? 'pl-4' : ''}
                `}
            >
                {/* Group Indicator line */}
                {hasGroup && (
                    <div className={`absolute left-2 w-[2px] ${isNextInGroup ? 'h-full' : 'h-1/2'} ${isPrevInGroup && !isNextInGroup ? 'bottom-1/2 h-1/2 rounded-b-md' : (isPrevInGroup ? 'top-0' : 'top-1/2 rounded-t-md h-1/2')} ${isSelected ? 'bg-indigo-500/50' : (isDark ? 'bg-slate-700' : 'bg-slate-200')}`} />
                )}

                <div className={`cursor-grab active:cursor-grabbing p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-slate-600 hover:text-slate-400' : 'text-slate-300 hover:text-slate-500'}`}>
                    <GripVertical size={10} />
                </div>

                <div className={`shrink-0 ${isDark ? (isSelected ? 'text-indigo-400' : 'text-slate-500') : (isSelected ? 'text-indigo-500' : 'text-slate-400')}`}>
                    {hasGroup && !isPrevInGroup ? <Layers size={12} className="text-indigo-500" /> : getIconForType(el.type)}
                </div>

                <span className="truncate flex-1">
                    {el.type === 'text' ? (el.text?.replace(/<[^>]*>/g, '').slice(0, 20) || 'Text Layer') :
                        el.type === 'product-block' ? 'Product Block' :
                            el.type === 'image' ? 'Image Layer' :
                                el.type === 'shape' ? 'Shape Layer' : 'Element'}
                </span>

                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleLockElement(el.id); }}
                        className={`p-1 rounded hover:bg-black/5 ${el.locked ? (isDark ? 'text-amber-400' : 'text-amber-500') : (isDark ? 'text-slate-600' : 'text-slate-300')}`}
                    >
                        {el.locked ? <Lock size={10} /> : <Unlock size={10} />}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); toggleVisibilityElement(el.id); }}
                        className={`p-1 rounded hover:bg-black/5 ${el.visible === false ? (isDark ? 'text-slate-600' : 'text-slate-300') : (isDark ? 'text-slate-400' : 'text-slate-500')}`}
                    >
                        {el.visible === false ? <EyeOff size={10} /> : <Eye size={10} />}
                    </button>
                </div>
            </div>
        );
    };

    const handleDragStart = (e: React.DragEvent, section: 'header' | 'page' | 'footer', index: number) => {
        setDraggedItemIndex({ section, index });
        e.dataTransfer.effectAllowed = 'move';
        const img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        e.dataTransfer.setDragImage(img, 0, 0);
    };

    const handleDragOver = (e: React.DragEvent, section: 'header' | 'page' | 'footer', index: number, displayList: CanvasElement[]) => {
        e.preventDefault();
        if (!draggedItemIndex || draggedItemIndex.section !== section || draggedItemIndex.index === index) return;

        const newDisplayList = [...displayList];
        const [removed] = newDisplayList.splice(draggedItemIndex.index, 1);
        newDisplayList.splice(index, 0, removed);

        const newRenderOrderIds = [...newDisplayList].reverse().map(el => el.id);

        if (section === 'page') reorderElements(currentPageIndex, newRenderOrderIds);
        else if (section === 'header') reorderHeaderElements(newRenderOrderIds);
        else if (section === 'footer') reorderFooterElements(newRenderOrderIds);

        setDraggedItemIndex({ section, index });
    };

    const handleDragEnd = () => {
        setDraggedItemIndex(null);
    };

    useEffect(() => {
        if (isDragging) {
            const handleMouseMove = (e: MouseEvent) => {
                setPosition({
                    x: e.clientX - dragOffset.x,
                    y: e.clientY - dragOffset.y
                });
            };
            const handleMouseUp = () => {
                setIsDragging(false);
            };
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [isDragging, dragOffset]);

    // Click outside to close implementation
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (isSceneTreeOpen && panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsSceneTreeOpen(false);
            }
        };
        if (isSceneTreeOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSceneTreeOpen, setIsSceneTreeOpen]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };

    const getIconForType = (type: string) => {
        switch (type) {
            case 'text': return <Type size={12} />;
            case 'image': return <ImageIcon size={12} />;
            case 'shape': return <Box size={12} />;
            case 'comment': return <MessageSquare size={12} />;
            case 'product-block': return <Box size={12} className="text-indigo-500" />;
            default: return <Box size={12} />;
        }
    };

    if (!isSceneTreeOpen || !currentPage) return null;

    const displayElements = [...currentPage.elements].reverse();
    const headerDisplayElements = [...(catalog.headerElements || [])].reverse();
    const footerDisplayElements = [...(catalog.footerElements || [])].reverse();

    return (
        <div
            ref={panelRef}
            className={`fixed w-64 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border flex flex-col overflow-hidden z-[100] backdrop-blur-md transition-shadow ${isDark ? 'bg-slate-900/90 border-slate-700' : 'bg-white/95 border-slate-200'}`}
            style={{ left: position.x, top: position.y, height: '500px' }}
        >
            {/* Header - Draggable */}
            <div
                onMouseDown={handleMouseDown}
                className={`px-3 py-2 border-b flex items-center justify-between cursor-move select-none ${isDark ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50/50'}`}
            >
                <div className="flex items-center gap-2">
                    <Layers size={14} className={isDark ? 'text-indigo-400' : 'text-indigo-600'} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-700'}`}>Scene Tree</span>
                </div>
                <button
                    onClick={() => setIsSceneTreeOpen(false)}
                    className={`p-1 rounded-md transition-colors ${isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-400'}`}
                >
                    <X size={12} />
                </button>
            </div>

            {/* List Sections */}
            <div className="flex-1 overflow-y-auto p-1 custom-scrollbar space-y-4">

                {/* Master Header Section */}
                {catalog.hasHeader && (
                    <div>
                        <div className="px-2 py-1 mb-1 bg-slate-100/50 rounded flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Master Header</span>
                        </div>
                        {headerDisplayElements.length === 0 ? (
                            <div className="px-2 py-3 text-center text-[9px] text-slate-400 italic">No elements</div>
                        ) : (
                            headerDisplayElements.map((el, idx) => renderElementItem(el, 'header', idx, headerDisplayElements))
                        )}
                    </div>
                )}

                {/* Page Content Section */}
                <div>
                    <div className="px-2 py-1 mb-1 bg-slate-100/50 rounded flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Page Content</span>
                    </div>
                    {displayElements.length === 0 ? (
                        <div className="px-2 py-8 text-center text-[10px] text-slate-400 italic">Canvas is empty</div>
                    ) : (
                        displayElements.map((el, idx) => renderElementItem(el, 'page', idx, displayElements))
                    )}
                </div>

                {/* Master Footer Section */}
                {catalog.hasFooter && (
                    <div>
                        <div className="px-2 py-1 mb-1 bg-slate-100/50 rounded flex items-center justify-between">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Master Footer</span>
                        </div>
                        {footerDisplayElements.length === 0 ? (
                            <div className="px-2 py-3 text-center text-[9px] text-slate-400 italic">No elements</div>
                        ) : (
                            footerDisplayElements.map((el, idx) => renderElementItem(el, 'footer', idx, footerDisplayElements))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SceneTreePanel;
