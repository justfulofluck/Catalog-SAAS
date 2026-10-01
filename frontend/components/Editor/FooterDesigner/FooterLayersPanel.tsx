import React, { useState } from 'react';
import {
  GripVertical, Type, Square, Image as ImageIcon,
  ArrowUp, ArrowDown, Copy, Trash2, Layers
} from 'lucide-react';
import { CanvasElement } from '../../../types';

interface FooterLayersPanelProps {
  elements: CanvasElement[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  isDark: boolean;
  moveForward: (id: string) => void;
  moveBackward: (id: string) => void;
  duplicateElementLocal: (id: string) => void;
  deleteElementLocal: (id: string) => void;
  reorderLayer: (draggedId: string, targetId: string) => void;
  setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>;
  pushHistory: () => void;
}

export const FooterLayersPanel: React.FC<FooterLayersPanelProps> = ({
  elements,
  selectedId,
  setSelectedId,
  isDark,
  moveForward,
  moveBackward,
  duplicateElementLocal,
  deleteElementLocal,
  reorderLayer,
  setElements,
  pushHistory,
}) => {
  const [draggedLayerId, setDraggedLayerId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>
          Layer Hierarchy
        </h4>
        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-[#1a1a1c] px-2 py-0.5 rounded-full">
          {elements.length} {elements.length === 1 ? 'Item' : 'Items'}
        </span>
      </div>
      <p className={`text-[11px] ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>
        Drag layers to change z-index or use arrows to rearrange.
      </p>

      <div className="space-y-1.5 max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar p-0.5">
        {elements.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs font-medium">
            <Layers size={24} className="mx-auto mb-2 opacity-40" />
            No elements in footer
          </div>
        ) : (
          elements
            .slice()
            .reverse()
            .map((el, revIdx) => {
              const isSelected = el.id === selectedId;
              const isTop = revIdx === 0;
              const isBottom = revIdx === elements.length - 1;
              return (
                <div
                  key={el.id}
                  draggable
                  onDragStart={(e) => {
                    setDraggedLayerId(el.id);
                    e.dataTransfer.setData('text/plain', el.id);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedLayerId && draggedLayerId !== el.id) {
                      reorderLayer(draggedLayerId, el.id);
                    }
                    setDraggedLayerId(null);
                  }}
                  onClick={() => setSelectedId(el.id)}
                  className={`group flex items-center justify-between p-2 rounded-[4px] border cursor-pointer transition-all ${
                    draggedLayerId === el.id ? 'opacity-40 border-dashed border-cyan-400' : ''
                  } ${
                    isSelected
                      ? isDark
                        ? 'bg-[#0F3D3E]/40 border-[#E2DCC8]/60 text-white shadow-sm ring-1 ring-[#E2DCC8]/20'
                        : 'bg-[#0F3D3E]/10 border-[#0F3D3E] text-slate-900 shadow-sm ring-1 ring-[#0F3D3E]/20'
                      : isDark
                        ? 'bg-[#18181a] border-[#26262a] text-[#aaa] hover:text-white hover:bg-[#202024]'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <GripVertical
                      size={13}
                      className={`cursor-grab shrink-0 transition-colors ${
                        isDark ? 'text-[#555] group-hover:text-[#999]' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? isDark
                            ? 'bg-[#0F3D3E] text-[#E2DCC8] border-[#E2DCC8]/50'
                            : 'bg-[#0F3D3E] text-white border-[#0F3D3E]'
                          : isDark
                            ? 'bg-[#121214] text-[#888] border-[#333]'
                            : 'bg-white text-slate-500 border-slate-300'
                      }`}
                    >
                      {el.type === 'text' ? (
                        <Type size={11} />
                      ) : el.type === 'shape' ? (
                        <Square size={11} />
                      ) : (
                        <ImageIcon size={11} />
                      )}
                    </div>
                    <span
                      className={`text-xs truncate font-medium ${
                        isSelected
                          ? isDark
                            ? 'text-white font-bold'
                            : 'text-[#0F3D3E] font-bold'
                          : isDark
                            ? 'text-slate-300'
                            : 'text-slate-700'
                      }`}
                    >
                      {el.type === 'text'
                        ? el.text || 'Empty Text'
                        : el.type === 'shape'
                          ? `${el.shapeType || 'Shape'}`
                          : 'Image/Logo'}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveForward(el.id);
                      }}
                      disabled={isTop}
                      className={`p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${
                        isTop ? 'opacity-30 cursor-not-allowed' : ''
                      }`}
                      title="Bring forward"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveBackward(el.id);
                      }}
                      disabled={isBottom}
                      className={`p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${
                        isBottom ? 'opacity-30 cursor-not-allowed' : ''
                      }`}
                      title="Send backward"
                    >
                      <ArrowDown size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateElementLocal(el.id);
                      }}
                      className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 text-slate-400 hover:text-cyan-400 transition-colors"
                      title="Duplicate"
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteElementLocal(el.id);
                      }}
                      className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={12} />
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
