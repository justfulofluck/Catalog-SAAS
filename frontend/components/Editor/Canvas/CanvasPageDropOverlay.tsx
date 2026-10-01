import React from 'react';
import { Plus, Sparkles } from 'lucide-react';

interface CanvasPageDropOverlayProps {
  isDragOver: boolean;
  dragOverPageIndex: number | null;
  pageIdx: number;
  isActive: boolean;
  snapTarget: { x: number; y: number } | null;
  zoom: number;
}

export const CanvasPageDropOverlay: React.FC<CanvasPageDropOverlayProps> = ({
  isDragOver,
  dragOverPageIndex,
  pageIdx,
  isActive,
  snapTarget,
  zoom,
}) => {
  const isTargetPage =
    isDragOver && (dragOverPageIndex === pageIdx || (dragOverPageIndex === null && isActive));

  return (
    <>
      {isTargetPage && (
        <div className="absolute inset-0 z-[100] border-4 border-dashed border-emerald-500/50 pointer-events-none flex items-center justify-center bg-emerald-600/5 backdrop-blur-[1px]">
          {!snapTarget && (
            <div className="px-8 py-4 bg-white/95 backdrop-blur-md rounded-full shadow-2xl flex items-center gap-3 border border-emerald-200">
              <div className="w-8 h-8 bg-emerald-600 rounded-[10px] flex items-center justify-center text-white shadow-lg">
                <Plus size={20} />
              </div>
              <span className="text-sm font-black text-emerald-900 uppercase tracking-widest">
                Drop on Page {pageIdx + 1}
              </span>
            </div>
          )}
        </div>
      )}

      {isActive && snapTarget && (
        <div
          className="absolute z-[110] px-4 py-2 bg-indigo-600 text-white rounded-[10px] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl"
          style={{ left: snapTarget.x * zoom, top: snapTarget.y * zoom - 45 }}
        >
          <Sparkles size={14} className="animate-pulse" /> Auto-Fitting Asset
        </div>
      )}
    </>
  );
};
