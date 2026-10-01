import React from 'react';
import { ChevronUp, ChevronDown, Settings, Trash2 } from 'lucide-react';
import { CatalogPage } from '../../../types';

interface PageSectionSummary {
  index: number;
  y: number;
  height: number;
  title: string;
}

export const getPageSectionsSummary = (page: CatalogPage | undefined): PageSectionSummary[] => {
  if (!page || !page.elements || page.elements.length === 0) return [];
  if (page.type === 'cover' || page.type === 'index' || page.type === 'closing') return [];

  const tables = page.elements.filter((el) => el.type === 'table' && el.tableData);
  if (tables.length === 0) return [];

  const titles = page.elements.filter((el) => el.type === 'text' && (el.fontSize || 0) >= 14);
  const shapes = page.elements.filter((el) => el.type === 'shape' && (el.width || 0) >= 400);

  const sortedTables = [...tables].sort((a, b) => a.y - b.y);
  return sortedTables.map((tbl, idx) => {
    const titleCandidates = titles.filter(
      (t) => t.y <= tbl.y + 40 && Math.abs(tbl.y - t.y) < 220
    );
    const nearestTitle = titleCandidates.sort(
      (a, b) => Math.abs(tbl.y - a.y) - Math.abs(tbl.y - b.y)
    )[0];
    const nearestShape = shapes.find((s) => Math.abs(s.y - tbl.y) < 180);

    const minY = Math.min(
      tbl.y,
      nearestTitle ? nearestTitle.y : tbl.y,
      nearestShape ? nearestShape.y : tbl.y
    );
    const maxY = Math.max(
      tbl.y + (tbl.height || 60),
      nearestTitle ? nearestTitle.y + (nearestTitle.height || 30) : tbl.y,
      nearestShape ? nearestShape.y + (nearestShape.height || 120) : tbl.y
    );

    return {
      index: idx,
      y: minY,
      height: Math.max(80, maxY - minY),
      title: nearestTitle?.text?.replace(/<[^>]*>/g, '') || `Section ${idx + 1}`,
    };
  });
};

interface SectionQuickActionsDockProps {
  page: CatalogPage;
  pageIdx: number;
  zoom: number;
  curW: number;
  swapPageSections: (pageIndex: number, idxA: number, idxB: number) => void;
  deletePageSection: (pageIndex: number, sectionIndex: number) => void;
  setCurrentPageIndex: (idx: number) => void;
  setEditorTab: (tab: any) => void;
  setSidebarExpanded: (expanded: boolean) => void;
}

export const SectionQuickActionsDock: React.FC<SectionQuickActionsDockProps> = ({
  page,
  pageIdx,
  zoom,
  curW,
  swapPageSections,
  deletePageSection,
  setCurrentPageIndex,
  setEditorTab,
  setSidebarExpanded,
}) => {
  const sectionsSummary = getPageSectionsSummary(page);
  if (sectionsSummary.length < 1) return null;

  return (
    <>
      {sectionsSummary.map((secSummary, sIdx) => {
        const isFirst = sIdx === 0;
        const isLast = sIdx === sectionsSummary.length - 1;
        const centerY = (secSummary.y + secSummary.height / 2) * zoom;

        return (
          <div
            key={`sec-dock-${sIdx}`}
            className="absolute z-[60] flex flex-col items-center bg-[#141416]/95 border border-[#E2DCC8]/30 backdrop-blur-md rounded-full py-1.5 px-1 shadow-2xl transition-all hover:scale-105 hover:border-[#0F3D3E]"
            style={{
              left: curW * zoom + 12,
              top: Math.max(10, centerY - 55),
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Section number indicator badge */}
            <span className="w-5 h-5 rounded-full bg-[#0F3D3E] text-[#E2DCC8] flex items-center justify-center text-[9px] font-black mb-1 shadow-sm">
              #{sIdx + 1}
            </span>

            {/* ↑ Move Up */}
            <button
              type="button"
              disabled={isFirst}
              onClick={(e) => {
                e.stopPropagation();
                swapPageSections(pageIdx, sIdx, sIdx - 1);
              }}
              className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
              title={`Move Section #${sIdx + 1} Up`}
            >
              <ChevronUp size={14} />
            </button>

            {/* ↓ Move Down */}
            <button
              type="button"
              disabled={isLast}
              onClick={(e) => {
                e.stopPropagation();
                swapPageSections(pageIdx, sIdx, sIdx + 1);
              }}
              className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:hover:bg-transparent transition-all"
              title={`Move Section #${sIdx + 1} Down`}
            >
              <ChevronDown size={14} />
            </button>

            {/* ⚙️ Open in Left Sidebar Studio */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentPageIndex(pageIdx);
                setEditorTab('grid-studio');
                setSidebarExpanded(true);
              }}
              className="p-1 rounded-full text-[#E2DCC8] hover:text-white hover:bg-[#0F3D3E] transition-all my-0.5"
              title={`Configure Section #${sIdx + 1} in Left Sidebar Studio`}
            >
              <Settings size={13} />
            </button>

            {/* 🗑️ Delete Section */}
            {sectionsSummary.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deletePageSection(pageIdx, sIdx);
                }}
                className="p-1 rounded-full text-slate-400 hover:text-red-400 hover:bg-red-500/20 transition-all"
                title={`Delete Section #${sIdx + 1}`}
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        );
      })}
    </>
  );
};
