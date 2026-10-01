import React, { useState } from 'react';
import { Zap, Check } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Product, ProductGridSection, TableData } from '../../types';
import { DEFAULT_SECTIONS } from './ProductGridStudio/constants';
import { GridTopBar } from './ProductGridStudio/GridTopBar';
import { GridSectionCard } from './ProductGridStudio/GridSectionCard';
import { GridProductPickerModal } from './ProductGridStudio/GridProductPickerModal';

interface ProductGridStudioModalProps {
  pageIndex: number | null;
  onClose: () => void;
}

export const ProductGridStudioModal: React.FC<ProductGridStudioModalProps> = ({ pageIndex, onClose }) => {
  const { catalog, products, categories, applyProductGridToPage, reflowCatalogPages } = useStore();
  const targetPageIndex = pageIndex !== null ? pageIndex : 0;

  const [sections, setSections] = useState<ProductGridSection[]>(() => {
    // Try to extract existing sections from page elements if present
    const page = catalog?.pages?.[targetPageIndex];
    if (page && page.elements.length > 0) {
      const titles = page.elements.filter(el => el.type === 'text' && (el.fontSize || 0) >= 18);
      const tables = page.elements.filter(el => el.type === 'table' && el.tableData);
      const images = page.elements.filter(el => el.type === 'image');
      const backgrounds = page.elements.filter(el => el.type === 'shape' && (el.width || 0) >= 600);

      if (titles.length >= 2 || tables.length >= 2) {
        // Build sections from existing canvas elements sorted by Y
        const sortedTitles = [...titles].sort((a, b) => a.y - b.y);
        const extracted: ProductGridSection[] = sortedTitles.slice(0, 4).map((t, idx) => {
          const nearestTable = tables.find(tbl => Math.abs(tbl.y - t.y) < 160);
          const nearestImg = images.find(img => Math.abs(img.y - t.y) < 160);
          const nearestBg = backgrounds.find(bg => Math.abs(bg.y - t.y) < 160);

          return {
            id: `sec-${idx + 1}`,
            title: t.text?.replace(/<[^>]*>/g, '') || `SERIES ${idx + 1}`,
            titleColor: t.fill || '#00a651',
            titleFontSize: t.fontSize || 22,
            imageSrc: nearestImg?.src || '',
            hasBackground: !!nearestBg,
            backgroundColor: nearestBg?.fill || '#e2e8f0',
            tableData: nearestTable?.tableData || {
              headers: ['MODEL NO', 'PRODUCTS', 'CUT-OUT', 'PRICE', 'COLOR'],
              rows: [['VT-01', '12W COB', '75MM', '₹1200', 'W, W.W']],
              headerBg: '#002b36',
              headerTextColor: '#ffffff',
              alternateRowBg: '#f8fafc',
              rowBg: '#ffffff',
              borderColor: '#002b36',
              fontSize: 7.5,
              headerFontSize: 8,
              cellPadding: 4
            }
          };
        });

        if (extracted.length >= 1) {
          while (extracted.length < 3 && DEFAULT_SECTIONS[extracted.length]) {
            const def = DEFAULT_SECTIONS[extracted.length];
            extracted.push({ ...def, id: `sec-${extracted.length + 1}` });
          }
          return extracted;
        }
      }
    }
    return JSON.parse(JSON.stringify(DEFAULT_SECTIONS));
  });

  const [productPickerSectionIdx, setProductPickerSectionIdx] = useState<number | null>(null);
  const [pickerCategoryFilter, setPickerCategoryFilter] = useState<string | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');

  // Section manipulation helpers
  const handleUpdateSection = (idx: number, updates: Partial<ProductGridSection>) => {
    setSections(prev => prev.map((sec, i) => i === idx ? { ...sec, ...updates } : sec));
  };

  const handleCellChange = (secIdx: number, rIdx: number, cIdx: number, val: string) => {
    setSections(prev => prev.map((sec, i) => {
      if (i !== secIdx) return sec;
      const newRows = sec.tableData.rows.map((row, rowIdx) => {
        if (rowIdx !== rIdx) return row;
        const newRow = [...row];
        newRow[cIdx] = val;
        return newRow;
      });
      return {
        ...sec,
        tableData: {
          ...sec.tableData,
          rows: newRows
        }
      };
    }));
  };

  const handleHeaderChange = (secIdx: number, cIdx: number, val: string) => {
    setSections(prev => prev.map((sec, i) => {
      if (i !== secIdx) return sec;
      const newHeaders = [...sec.tableData.headers];
      newHeaders[cIdx] = val;
      return {
        ...sec,
        tableData: {
          ...sec.tableData,
          headers: newHeaders
        }
      };
    }));
  };

  const handleAddTableRow = (secIdx: number) => {
    setSections(prev => prev.map((sec, i) => {
      if (i !== secIdx) return sec;
      const newRow = new Array(sec.tableData.headers.length).fill('-');
      return {
        ...sec,
        tableData: {
          ...sec.tableData,
          rows: [...sec.tableData.rows, newRow]
        }
      };
    }));
  };

  const handleDuplicateTableRow = (secIdx: number, rIdx: number) => {
    setSections(prev => prev.map((sec, i) => {
      if (i !== secIdx) return sec;
      const targetRow = [...sec.tableData.rows[rIdx]];
      const newRows = [...sec.tableData.rows];
      newRows.splice(rIdx + 1, 0, targetRow);
      return {
        ...sec,
        tableData: {
          ...sec.tableData,
          rows: newRows
        }
      };
    }));
  };

  const handleDeleteTableRow = (secIdx: number, rIdx: number) => {
    setSections(prev => prev.map((sec, i) => {
      if (i !== secIdx || sec.tableData.rows.length <= 1) return sec;
      const newRows = sec.tableData.rows.filter((_, idx) => idx !== rIdx);
      return {
        ...sec,
        tableData: {
          ...sec.tableData,
          rows: newRows
        }
      };
    }));
  };

  const handleMoveSection = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    setSections(prev => {
      const copy = [...prev];
      const [moved] = copy.splice(idx, 1);
      copy.splice(targetIdx, 0, moved);
      return copy;
    });
  };

  const handleAddSection = () => {
    if (sections.length >= 4) return;
    const newIdx = sections.length + 1;
    const newSec: ProductGridSection = {
      id: `sec-${Date.now()}`,
      title: `SERIES ${newIdx} COB DOWNLIGHT`,
      titleColor: '#00a651',
      titleFontSize: 22,
      imageSrc: '',
      hasBackground: newIdx % 2 === 0,
      backgroundColor: '#e2e8f0',
      tableData: {
        headers: ['MODEL NO', 'PRODUCTS', 'CUT-OUT', 'PRICE', 'COLOR'],
        rows: [
          [`VT-0${newIdx}`, `20W SERIES ${newIdx}`, '75MM', '₹1500', 'W, W.W, N.W'],
          [`VT-0${newIdx}B`, `12W SERIES ${newIdx}`, '75MM', '₹1200', 'W, W.W, N.W']
        ],
        headerBg: '#002b36',
        headerTextColor: '#ffffff',
        alternateRowBg: '#f8fafc',
        rowBg: '#ffffff',
        borderColor: '#002b36',
        fontSize: 7.5,
        headerFontSize: 8,
        cellPadding: 4,
        colWidths: [65, 140, 55, 55, 60]
      }
    };
    setSections(prev => [...prev, newSec]);
  };

  const handleDeleteSection = (idx: number) => {
    if (sections.length <= 1) return;
    setSections(prev => prev.filter((_, i) => i !== idx));
  };

  // Populate section from a chosen product
  const handleSelectProductForSection = (secIdx: number, product: Product) => {
    const title = product.name?.toUpperCase() || 'PRODUCT SERIES';
    const imageSrc = product.image || '';

    let rows: string[][] = [];
    if (product.variants && product.variants.length > 0) {
      rows = product.variants.map(v => [
        v.sku || product.sku || '-',
        v.name || product.name || '-',
        (v as any).cutOut || product.customFields?.cutOut || '75MM',
        v.price ? `₹${v.price}` : (product.price ? `₹${product.price}` : '-'),
        (v as any).color || product.customFields?.color || 'W, W.W, N.W'
      ]);
    } else {
      rows = [
        [
          product.sku || 'VT-01',
          product.name || 'LED LIGHT',
          product.customFields?.cutOut || '75MM',
          product.price ? `₹${product.price}` : '₹1200',
          product.customFields?.color || 'W, W.W, N.W'
        ]
      ];
    }

    handleUpdateSection(secIdx, {
      title,
      imageSrc,
      tableData: {
        headers: ['MODEL NO', 'PRODUCTS', 'CUT-OUT', 'PRICE', 'COLOR'],
        rows,
        headerBg: '#002b36',
        headerTextColor: '#ffffff',
        alternateRowBg: '#f8fafc',
        rowBg: '#ffffff',
        borderColor: '#002b36',
        fontSize: 7.5,
        headerFontSize: 8,
        cellPadding: 4,
        colWidths: [65, 140, 55, 55, 60]
      }
    });

    setProductPickerSectionIdx(null);
  };

  const handleApply = () => {
    applyProductGridToPage(targetPageIndex, sections);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-[#141414] border border-[#262626] rounded-[6px] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-white animate-in zoom-in-95 duration-150">
        
        {/* ================= MODAL TOP HEADER ================= */}
        <GridTopBar
          targetPageIndex={targetPageIndex}
          sections={sections}
          handleAddSection={handleAddSection}
          onClose={onClose}
        />

        {/* ================= MODAL BODY: SECTIONS LIST ================= */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#121212]">
          {sections.map((sec, secIdx) => (
            <GridSectionCard
              key={sec.id}
              sec={sec}
              secIdx={secIdx}
              totalSections={sections.length}
              handleUpdateSection={handleUpdateSection}
              handleMoveSection={handleMoveSection}
              handleDeleteSection={handleDeleteSection}
              setProductPickerSectionIdx={setProductPickerSectionIdx}
              handleUpdateTableCell={handleCellChange}
              handleUpdateTableHeader={handleHeaderChange}
              handleAddTableRow={handleAddTableRow}
              handleDuplicateTableRow={handleDuplicateTableRow}
              handleDeleteTableRow={handleDeleteTableRow}
            />
          ))}
        </div>

        {/* ================= MODAL BOTTOM ACTION FOOTER ================= */}
        <div className="px-6 py-4 border-t border-[#262626] bg-[#161616] flex items-center justify-between shrink-0">
          <div className="text-[11px] text-[#888888]">
            Generates {sections.length} perfectly proportioned sections on <strong className="text-white">Page {targetPageIndex + 1}</strong>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#202020] hover:bg-[#282828] border border-[#333] text-slate-300 rounded-[4px] text-xs font-bold uppercase tracking-wider transition-all"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => {
                applyProductGridToPage(targetPageIndex, sections);
                reflowCatalogPages();
                onClose();
              }}
              className="px-4 py-2.5 bg-[#1e293b] hover:bg-[#334155] border border-sky-500/40 text-sky-300 rounded-[4px] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all hover:scale-105 active:scale-95"
              title="Apply grid to this page and automatically cascade/pack remaining sections across all catalog pages"
            >
              <Zap size={14} className="text-sky-400" /> Apply & Reflow All Pages
            </button>

            <button
              type="button"
              onClick={handleApply}
              className="px-6 py-2.5 bg-gradient-to-r from-[#0F3D3E] to-[#155455] hover:from-[#134d4f] hover:to-[#175b5d] border border-[#E2DCC8]/30 text-white rounded-[4px] text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#0F3D3E]/30 transition-all hover:scale-105 active:scale-95"
            >
              <Check size={16} /> Apply Grid to Page
            </button>
          </div>
        </div>
      </div>

      {/* ================= PRODUCT PICKER SUB-MODAL ================= */}
      {productPickerSectionIdx !== null && (
        <GridProductPickerModal
          productPickerSectionIdx={productPickerSectionIdx}
          pickerSearch={pickerSearch}
          setPickerSearch={setPickerSearch}
          pickerCategoryFilter={pickerCategoryFilter}
          setPickerCategoryFilter={setPickerCategoryFilter}
          categories={categories}
          products={products}
          handleSelectProductForSection={handleSelectProductForSection}
          onClose={() => setProductPickerSectionIdx(null)}
        />
      )}
    </div>
  );
};

export default ProductGridStudioModal;
