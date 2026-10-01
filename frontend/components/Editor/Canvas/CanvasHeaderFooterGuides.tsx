import React from 'react';
import { Catalog, CatalogPage } from '../../../types';

interface CanvasHeaderFooterGuidesProps {
  catalog: Catalog;
  page: CatalogPage;
  isActive: boolean;
  zoom: number;
  curW: number;
  curH: number;
}

export const CanvasHeaderFooterGuides: React.FC<CanvasHeaderFooterGuidesProps> = ({
  catalog,
  page,
  isActive,
  zoom,
  curW,
  curH,
}) => {
  const pageHasHeader = Boolean(
    catalog.hasHeader !== false &&
      page.hasHeader !== false &&
      (catalog.headerElements?.length || 0) > 0 &&
      page.type !== 'cover'
  );
  const pageHasFooter = Boolean(
    catalog.hasFooter !== false &&
      page.hasFooter !== false &&
      (catalog.footerElements?.length || 0) > 0 &&
      page.type !== 'cover'
  );

  let effectiveHHeight = Number(catalog.headerHeight) || 0;
  if (catalog.headerElements && catalog.headerElements.length > 0) {
    catalog.headerElements.forEach((el) => {
      const b = (Number(el.y) || 0) + (Number(el.height) || 0);
      if (b > effectiveHHeight) effectiveHHeight = b;
    });
  }
  if (!effectiveHHeight) effectiveHHeight = 113.4;

  let effectiveFHeight = Number(catalog.footerHeight) || 0;
  if (catalog.footerElements && catalog.footerElements.length > 0) {
    catalog.footerElements.forEach((el) => {
      const b = (Number(el.y) || 0) + (Number(el.height) || 0);
      if (b > effectiveFHeight) effectiveFHeight = b;
    });
  }
  if (!effectiveFHeight) effectiveFHeight = 57;

  return (
    <>
      {(pageHasHeader || pageHasFooter) && (
        <div className="absolute inset-0 pointer-events-none z-[50]">
          {pageHasHeader && (
            <>
              <div
                className="absolute bg-[#1e1e1e] text-[#aaa] border border-[#333] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-l-md shadow-sm transition-all"
                style={{
                  left: 0,
                  top: (effectiveHHeight * zoom) / 2,
                  transform: 'translate(-100%, -50%)',
                  opacity: isActive ? 1 : 0.4,
                }}
              >
                Header
              </div>
              {isActive && (
                <div
                  className="absolute left-0 right-0 border-b border-dashed border-[#0F3D3E]/40 pointer-events-none"
                  style={{ top: effectiveHHeight * zoom }}
                />
              )}
            </>
          )}
          {pageHasFooter && (
            <>
              <div
                className="absolute bg-[#1e1e1e] text-[#aaa] border border-[#333] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-l-md shadow-sm transition-all"
                style={{
                  left: 0,
                  top: (curH - effectiveFHeight / 2) * zoom,
                  transform: 'translate(-100%, -50%)',
                  opacity: isActive ? 1 : 0.4,
                }}
              >
                Footer
              </div>
              {isActive && (
                <div
                  className="absolute left-0 right-0 border-t border-dashed border-[#0F3D3E]/40 pointer-events-none"
                  style={{ top: (curH - effectiveFHeight) * zoom }}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* Canva-style Visual Dotted / Dashed Page Margin Safety Box */}
      {isActive && catalog.showMargins !== false && (
        <div
          className="absolute pointer-events-none z-[45] border border-dashed transition-all duration-150"
          style={{
            left: `${(catalog.marginLeft || 0) * zoom}px`,
            top: `${(catalog.marginTop || 0) * zoom}px`,
            width: `${
              Math.max(0, curW - (catalog.marginLeft || 0) - (catalog.marginRight || 0)) * zoom
            }px`,
            height: `${
              Math.max(0, curH - (catalog.marginTop || 0) - (catalog.marginBottom || 0)) * zoom
            }px`,
            borderColor: 'rgba(15, 61, 62, 0.45)',
            borderWidth: '1px',
          }}
        >
          <span className="absolute left-1 top-1 text-[8px] font-mono font-bold uppercase tracking-wider text-[#0F3D3E]/50 select-none">
            Safety Margin
          </span>
        </div>
      )}
    </>
  );
};
