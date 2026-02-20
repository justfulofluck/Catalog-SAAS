
import React, { useRef, useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { X, Lock, Unlock, Eye, EyeOff, GripVertical, Box, Type, Image as ImageIcon, MessageSquare, Layers } from 'lucide-react';
import { CanvasElement } from '../../types';

const SceneTreePanel: React.FC = () => {
    const { catalog, currentPageIndex, isSceneTreeOpen, setIsSceneTreeOpen, toggleLockElement, toggleVisibilityElement, reorderElements, uiTheme, selectedElementIds, setSelectedElements } = useStore();

    // Floating Window State
    const [position, setPosition] = useState({ x: window.innerWidth - 320, y: 80 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const panelRef = useRef<HTMLDivElement>(null);

    // List Dragging State
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

    const currentPage = catalog.pages[currentPageIndex];

    // Elements are stored in render order (zIndex 0 is bottom). 
    // For the list, we usually want top-most elements at the top of the list.
    // So we reverse the array for display.
    const displayElements = currentPage ? [...currentPage.elements].reverse() : [];

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

    const handleMouseDown = (e: React.MouseEvent) => {
        // Only allow dragging from header
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

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedItemIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        // Transparent drag image
        const img = new Image();
        img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
        e.dataTransfer.setDragImage(img, 0, 0);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedItemIndex === null || draggedItemIndex === index) return;

        // Calculate new order
        // displayElements is REVERSED render order.
        // Index 0 in display = ID A (Topmost)
        // Index 1 = ID B
        // ...

        // If I drag Item A (0) to Item B (position 1).
        // The new list should have Item A at position 1.
        // [B, A, ...]

        // We need to convert this list manipulation back to "Render Order" IDs.
        // Render Order is Reverse of Display Order.

        const newDisplayList = [...displayElements];
        const [removed] = newDisplayList.splice(draggedItemIndex, 1);
        newDisplayList.splice(index, 0, removed);

        // Convert back to render order (bottom-first) for the store
        // display: [Top, Middle, Bottom]
        // render: [Bottom, Middle, Top]
        const newRenderOrderIds = [...newDisplayList].reverse().map(el => el.id);

        reorderElements(currentPageIndex, newRenderOrderIds);
        setDraggedItemIndex(index);
    };

    const handleDragEnd = () => {
        setDraggedItemIndex(null);
    };

    if (!isSceneTreeOpen || !currentPage) return null;

    const isDark = uiTheme === 'dark';

    return (
        <div
            ref={panelRef}
            className={`fixed w-64 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border flex flex-col overflow-hidden z-[100] backdrop-blur-md transition-shadow ${isDark ? 'bg-slate-900/90 border-slate-700' : 'bg-white/95 border-slate-200'}`}
            style={{ left: position.x, top: position.y, height: '400px' }}
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

            {/* List */}
            <div className="flex-1 overflow-y-auto p-1 custom-scrollbar">
                {displayElements.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2 opacity-50">
                        <Layers size={24} />
                        <span className="text-[10px] uppercase font-bold">No Elements</span>
                    </div>
                ) : (
                    displayElements.map((el, index) => {
                        const isSelected = selectedElementIds.includes(el.id);
                        return (
                            <div
                                key={el.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragEnd={handleDragEnd}
                                onClick={() => setSelectedElements([el.id])}
                                className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg mb-0.5 text-[11px] font-medium border border-transparent transition-all select-none
                            ${isSelected
                                        ? (isDark ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-200' : 'bg-indigo-50 border-indigo-100 text-indigo-700')
                                        : (isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50')
                                    }
                            ${draggedItemIndex === index ? 'opacity-20' : 'opacity-100'}
                        `}
                            >
                                <div className={`cursor-grab active:cursor-grabbing p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-slate-600 hover:text-slate-400' : 'text-slate-300 hover:text-slate-500'}`}>
                                    <GripVertical size={10} />
                                </div>

                                <div className={`shrink-0 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    {getIconForType(el.type)}
                                </div>

                                <span className="truncate flex-1">
                                    {el.type === 'text' ? (el.text?.slice(0, 20) || 'Text Layer') :
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
                    })
                )}
            </div>
        </div>
    );
};

export default SceneTreePanel;
