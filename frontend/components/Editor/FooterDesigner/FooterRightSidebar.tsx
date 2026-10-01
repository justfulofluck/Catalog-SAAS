import React from 'react';
import {
  Layers, ChevronsUp, ArrowUp, ArrowDown, ChevronsDown,
  GripVertical, Type, Square, Image as ImageIcon, Copy, Trash2
} from 'lucide-react';
import { CanvasElement } from '../../../types';

interface FooterRightSidebarProps {
  isDark: boolean;
  elements: CanvasElement[];
  selectedElement: CanvasElement | null;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  moveForward: (id: string) => void;
  moveBackward: (id: string) => void;
  duplicateElementLocal: (id: string) => void;
  deleteElementLocal: (id: string) => void;
  reorderLayer: (draggedId: string, targetId: string) => void;
}

export const FooterRightSidebar: React.FC<FooterRightSidebarProps> = ({
  isDark,
  elements,
  selectedElement,
  selectedId,
  setSelectedId,
  bringToFront,
  sendToBack,
  moveForward,
  moveBackward,
  duplicateElementLocal,
  deleteElementLocal,
  reorderLayer,
}) => {
  const [draggedLayerId, setDraggedLayerId] = React.useState<string | null>(null);

  return (
    <div className={`w-72 border-l flex flex-col shrink-0 transition-colors ${
      isDark ? 'bg-[#141416] border-[#262626]' : 'bg-white border-slate-200'
    }`}>
      <div className={`h-12 px-4 border-b flex items-center justify-between shrink-0 transition-colors ${
        isDark ? 'border-[#262626] bg-[#121214]' : 'border-slate-200 bg-slate-50'
      }`}>
        <div className="flex items-center gap-2">
          <Layers size={14} className={isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'} />
          <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Footer Layers
          </h4>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
          isDark ? 'text-[#888] bg-[#1c1c1f] border-[#2a2a2e]' : 'text-slate-600 bg-slate-100 border-slate-300'
        }`}>
          {elements.length}
        </span>
      </div>

      {/* Quick Arrange Controls for Selected Layer */}
      {selectedElement && (
        <div className={`px-3 py-2 border-b flex items-center justify-between gap-1 animate-in fade-in ${
          isDark ? 'bg-[#18181c] border-[#26262a]' : 'bg-slate-50 border-slate-200'
        }`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 min-w-0 ${
            isDark ? 'text-[#888]' : 'text-slate-500'
          }`}>
            <span>Arrange:</span>
            <span className={`truncate max-w-[85px] ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>
              {selectedElement.type === 'text' ? (selectedElement.text || 'Text') : (selectedElement.shapeType || 'Shape')}
            </span>
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => bringToFront(selectedElement.id)}
              className={`p-1 rounded border transition-all ${
                isDark ? 'bg-[#222226] hover:bg-[#2e2e36] text-[#bbb] hover:text-white border-[#333]' : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
              }`}
              title="Bring to Top / Front"
            >
              <ChevronsUp size={13} />
            </button>
            <button
              onClick={() => moveForward(selectedElement.id)}
              className={`p-1 rounded border transition-all ${
                isDark ? 'bg-[#222226] hover:bg-[#2e2e36] text-[#bbb] hover:text-white border-[#333]' : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
              }`}
              title="Move Up / Forward (1 step)"
            >
              <ArrowUp size={13} />
            </button>
            <button
              onClick={() => moveBackward(selectedElement.id)}
              className={`p-1 rounded border transition-all ${
                isDark ? 'bg-[#222226] hover:bg-[#2e2e36] text-[#bbb] hover:text-white border-[#333]' : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
              }`}
              title="Move Down / Backward (1 step)"
            >
              <ArrowDown size={13} />
            </button>
            <button
              onClick={() => sendToBack(selectedElement.id)}
              className={`p-1 rounded border transition-all ${
                isDark ? 'bg-[#222226] hover:bg-[#2e2e36] text-[#bbb] hover:text-white border-[#333]' : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200'
              }`}
              title="Send to Bottom / Back"
            >
              <ChevronsDown size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Layer List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1.5">
        {elements.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs font-medium">
            <Layers size={24} className="mx-auto mb-2 opacity-30" />
            No layers yet
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
                  <div className="flex items-center gap-2 min-w-0 flex-1">
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
                      title="Move Forward"
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
                      title="Move Backward"
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
