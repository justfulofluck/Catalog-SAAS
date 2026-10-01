import React, { useState } from 'react';
import {
  GripVertical, Type, Square, Image as ImageIcon,
  ArrowUp, ArrowDown, Copy, Trash2, Layers
} from 'lucide-react';
import { CanvasElement } from '../../../types';

interface HeaderLayersPanelProps {
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

export const HeaderLayersPanel: React.FC<HeaderLayersPanelProps> = ({
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
            No elements in header
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
                    {el.type === 'text' ? (
                      <Type
                        size={13}
                        className={
                          isSelected
                            ? isDark
                              ? 'text-[#E2DCC8]'
                              : 'text-[#0F3D3E]'
                            : isDark
                              ? 'text-[#777]'
                              : 'text-slate-400'
                        }
                      />
                    ) : el.type === 'shape' ? (
                      <Square
                        size={13}
                        className={
                          isSelected
                            ? isDark
                              ? 'text-[#E2DCC8]'
                              : 'text-[#0F3D3E]'
                            : isDark
                              ? 'text-[#777]'
                              : 'text-slate-400'
                        }
                      />
                    ) : (
                      <ImageIcon
                        size={13}
                        className={
                          isSelected
                            ? isDark
                              ? 'text-[#E2DCC8]'
                              : 'text-[#0F3D3E]'
                            : isDark
                              ? 'text-[#777]'
                              : 'text-slate-400'
                        }
                      />
                    )}
                    <span className="text-xs font-bold truncate">
                      {el.type === 'text' ? el.text || 'Text' : el.shapeType || 'Shape'}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0 ml-1">
                    {/* Move Up in Stack */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveForward(el.id);
                      }}
                      disabled={isTop}
                      className={`p-1 rounded transition-all ${
                        isTop
                          ? 'text-slate-300 dark:text-[#383838] cursor-not-allowed'
                          : isDark
                            ? 'text-[#888] hover:text-white hover:bg-[#2c2c32]'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                      title={isTop ? 'Already at Top' : 'Move Up (Bring Forward)'}
                    >
                      <ArrowUp size={12} />
                    </button>

                    {/* Move Down in Stack */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveBackward(el.id);
                      }}
                      disabled={isBottom}
                      className={`p-1 rounded transition-all ${
                        isBottom
                          ? 'text-slate-300 dark:text-[#383838] cursor-not-allowed'
                          : isDark
                            ? 'text-[#888] hover:text-white hover:bg-[#2c2c32]'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                      title={isBottom ? 'Already at Bottom' : 'Move Down (Send Backward)'}
                    >
                      <ArrowDown size={12} />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateElementLocal(el.id);
                      }}
                      className={`p-1 rounded transition-all ${
                        isDark ? 'hover:bg-[#333] text-[#888] hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'
                      }`}
                      title="Duplicate"
                    >
                      <Copy size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteElementLocal(el.id);
                      }}
                      className={`p-1 rounded transition-all ${
                        isDark ? 'hover:bg-rose-950/50 text-rose-400 hover:text-rose-300' : 'hover:bg-rose-100 text-rose-600 hover:text-rose-700'
                      }`}
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

      {/* Quick Clear Button */}
      {elements.length > 0 && (
        <div className={`pt-3 border-t ${isDark ? 'border-[#262626]' : 'border-slate-200'}`}>
          <button
            onClick={() => {
              if (confirm('Clear all elements from header canvas?')) {
                pushHistory();
                setElements([]);
                setSelectedId(null);
              }
            }}
            className="w-full py-1.5 px-3 rounded-[4px] border border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <Trash2 size={12} />
            <span>Clear Header Elements</span>
          </button>
        </div>
      )}
    </div>
  );
};
