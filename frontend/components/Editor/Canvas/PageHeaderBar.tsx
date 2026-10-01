import React from 'react';
import { ChevronUp, ChevronDown, Copy, Trash2, Plus } from 'lucide-react';
import { CatalogPage } from '../../../types';

interface PageHeaderBarProps {
  page: CatalogPage;
  pageIdx: number;
  totalPages: number;
  zoom: number;
  pageWidth: number;
  editingSystemTemplate: any;
  onMovePage: (fromIdx: number, toIdx: number) => void;
  onDuplicatePage: (idx: number) => void;
  onRemovePage: (idx: number) => void;
  onAddPage: (type: 'interior', afterIdx: number) => void;
}

export const PageHeaderBar: React.FC<PageHeaderBarProps> = ({
  page,
  pageIdx,
  totalPages,
  zoom,
  pageWidth,
  editingSystemTemplate,
  onMovePage,
  onDuplicatePage,
  onRemovePage,
  onAddPage,
}) => {
  return (
    <div
      className="relative z-[60] flex items-center justify-between px-1 mb-1.5 transition-all select-none pointer-events-auto"
      style={{ width: pageWidth * zoom }}
    >
      {/* Left: Page Index and Type Tag */}
      <div className="flex items-center gap-2">
        <span className="text-[12px] font-black tracking-wider uppercase text-[#E2DCC8] shrink-0">
          Page {pageIdx + 1}
        </span>
        {editingSystemTemplate ? (
          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 shrink-0">
            Cover Blueprint
          </span>
        ) : page.type && (
          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#0F3D3E] text-[#E2DCC8] border border-[#E2DCC8]/30 shrink-0">
            {page.type}
          </span>
        )}
      </div>

      {/* Right: Application Themed Page Actions Toolbar */}
      <div
        className="flex items-center gap-0.5 bg-[#141416] text-[#EDEDED] border border-[#E2DCC8]/25 backdrop-blur-md rounded-[6px] px-1.5 py-1 shadow-[0_8px_30px_rgba(0,0,0,0.6)] relative z-[60] pointer-events-auto"
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        {/* Move Page Up */}
        <button
          type="button"
          disabled={pageIdx === 0}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (pageIdx > 0) {
              onMovePage(pageIdx, pageIdx - 1);
            }
          }}
          className="p-1.5 text-[#E2DCC8]/80 hover:text-white hover:bg-[#0F3D3E] disabled:opacity-20 disabled:hover:bg-transparent transition-all rounded-[4px] active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          title="Move Page Up"
        >
          <ChevronUp size={14} />
        </button>

        {/* Move Page Down */}
        <button
          type="button"
          disabled={pageIdx === totalPages - 1}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (pageIdx < totalPages - 1) {
              onMovePage(pageIdx, pageIdx + 1);
            }
          }}
          className="p-1.5 text-[#E2DCC8]/80 hover:text-white hover:bg-[#0F3D3E] disabled:opacity-20 disabled:hover:bg-transparent transition-all rounded-[4px] active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          title="Move Page Down"
        >
          <ChevronDown size={14} />
        </button>

        {!editingSystemTemplate && (
          <>
            <div className="w-[1px] h-3.5 bg-[#E2DCC8]/20 mx-0.5" />

            {/* Quick Duplicate Page */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDuplicatePage(pageIdx);
              }}
              className="p-1.5 text-[#E2DCC8]/80 hover:text-white hover:bg-[#0F3D3E] transition-all rounded-[4px] active:scale-95 cursor-pointer"
              title="Duplicate Page"
            >
              <Copy size={13} />
            </button>

            {/* Quick Delete Page */}
            {totalPages > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemovePage(pageIdx);
                }}
                className="p-1.5 text-[#E2DCC8]/80 hover:text-red-400 hover:bg-red-500/20 rounded-[4px] transition-all active:scale-95 cursor-pointer"
                title="Delete Page"
              >
                <Trash2 size={13} />
              </button>
            )}

            {/* Quick Add Page Below */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddPage('interior', pageIdx);
              }}
              className="p-1.5 text-[#E2DCC8]/80 hover:text-white hover:bg-[#0F3D3E] transition-all rounded-[4px] active:scale-95 cursor-pointer"
              title="Add Page Below"
            >
              <Plus size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
