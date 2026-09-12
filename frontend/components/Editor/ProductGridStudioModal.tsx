import React, { useState, useEffect } from 'react';
import {
  X, Sparkles, Image as ImageIcon, Plus, Trash2,
  ArrowUp, ArrowDown, Check, Package, Palette,
  Upload, Layers, Zap
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Product, ProductVariant, ProductGridSection, TableData } from '../../types';

interface ProductGridStudioModalProps {
  pageIndex: number | null;
  onClose: () => void;
}

const DEFAULT_SECTIONS: ProductGridSection[] = [
  {
    id: 'sec-1',
    title: 'CRETA SERIES COB DOWNLIGHT',
    titleColor: '#00a651',
    titleFontSize: 22,
    imageSrc: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=600',
    hasBackground: false,
    backgroundColor: '#f1f5f9',
    tableData: {
      headers: ['MODEL NO', 'PRODUCTS', 'CUT-OUT', 'PRICE', 'COLOR'],
      rows: [
        ['VT-08', '20W CRETA SERIES COB', '75MM', '₹1450', 'W, W.W, N.W'],
        ['VT-09', '12W CRETA SERIES COB', '75MM', '₹1200', 'W, W.W, N.W']
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
  },
  {
    id: 'sec-2',
    title: 'ULTRA SERIES COB DOWNLIGHT',
    titleColor: '#00a651',
    titleFontSize: 22,
    imageSrc: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600',
    hasBackground: true,
    backgroundColor: '#e2e8f0',
    tableData: {
      headers: ['MODEL NO', 'PRODUCTS', 'CUT-OUT', 'PRICE', 'COLOR'],
      rows: [
        ['VT-2613', '12W ULTRA SERIES TITANIUM', '75MM', '₹1450', 'W, W.W, N.W'],
        ['VT-2613', '12W ULTRA SERIES COB', '75MM', '₹1200', 'W, W.W, N.W']
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
  },
  {
    id: 'sec-3',
    title: 'MAX SERIES COB DOWNLIGHT',
    titleColor: '#00a651',
    titleFontSize: 22,
    imageSrc: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=600',
    hasBackground: false,
    backgroundColor: '#f1f5f9',
    tableData: {
      headers: ['MODEL NO', 'PRODUCTS', 'CUT-OUT', 'PRICE', 'COLOR'],
      rows: [
        ['VT-2614', '12W MAX SERIES COB', '75MM', '₹900', 'W, W.W, N.W'],
        ['VT-2615', '18W MAX SERIES COB', '90MM', '₹1100', 'W, W.W, N.W']
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
  }
];

const PRESET_TITLE_COLORS = ['#00a651', '#0284c7', '#4f46e5', '#0f172a', '#d97706', '#dc2626', '#059669'];
const PRESET_BG_COLORS = ['#e2e8f0', '#dbeafe', '#f1f5f9', '#fef3c7', '#f0fdf4', '#fce7f3', '#1e293b'];

const generateRowFromProduct = (
  headers: string[],
  product: Product,
  variant?: ProductVariant
): string[] => {
  if (!headers || !headers.length) return [];

  // Helper to extract value from variant.customAttributes or product.customFields
  const findCustomFieldValue = (keyQuery: string): string | null => {
    const targetNorm = keyQuery.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!targetNorm) return null;

    // 1. Check variant.customAttributes (highest priority for row)
    if (variant?.customAttributes && typeof variant.customAttributes === 'object') {
      if (variant.customAttributes[keyQuery] !== undefined && variant.customAttributes[keyQuery] !== null) {
        const val = String(variant.customAttributes[keyQuery]).trim();
        if (val && val !== '-') return val;
      }
      for (const [k, v] of Object.entries(variant.customAttributes)) {
        if (k.toLowerCase().replace(/[^a-z0-9]/g, '') === targetNorm) {
          if (v !== undefined && v !== null) {
            const val = String(v).trim();
            if (val && val !== '-') return val;
          }
        }
      }
    }

    // 2. Check product.customFields
    if (product.customFields && typeof product.customFields === 'object') {
      if (product.customFields[keyQuery] !== undefined && product.customFields[keyQuery] !== null) {
        const val = String(product.customFields[keyQuery]).trim();
        if (val && val !== '-') return val;
      }
      for (const [k, v] of Object.entries(product.customFields)) {
        if (k.toLowerCase().replace(/[^a-z0-9]/g, '') === targetNorm) {
          if (v !== undefined && v !== null) {
            const val = String(v).trim();
            if (val && val !== '-') return val;
          }
        }
      }
    }

    return null;
  };

  return headers.map(hdr => {
    const h = hdr.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Step 1: User's custom field match directly against header name (e.g. "Model No", "Wattage", "CCT", "Model")
    const customMatch = findCustomFieldValue(hdr);
    if (customMatch) return customMatch;

    // Step 2: Model Number - Strictly model number custom field (NO fallback to auto SKU or SKU slugs)
    if (h.includes('model') || h.includes('itemno') || h === 'item' || h === 'code' || h === 'itemcode') {
      const modelVal = findCustomFieldValue('model_no') || findCustomFieldValue('model') || 
                       findCustomFieldValue('model_number') || findCustomFieldValue('modelno') ||
                       findCustomFieldValue('item_code') || findCustomFieldValue('item_no') ||
                       findCustomFieldValue('item_number');
      if (modelVal) return modelVal;
      return '-';
    }

    // SKU (Only if the column header is explicitly named SKU)
    if (h === 'sku') {
      const skuVal = findCustomFieldValue('sku');
      if (skuVal) return skuVal;
      if (variant?.sku && variant.sku !== '-' && !variant.sku.startsWith('Untitled') && !variant.sku.startsWith('GEN-') && !variant.sku.startsWith('PRE-')) {
        return variant.sku;
      }
      if (product.sku && product.sku !== '-' && !product.sku.startsWith('Untitled') && !product.sku.startsWith('GEN-') && !product.sku.startsWith('PRE-')) {
        return product.sku;
      }
      return '-';
    }

    // Product Name / Description / Spec
    if (h.includes('product') || h.includes('spec') || h.includes('desc') || h.includes('name') || h.includes('title')) {
      const nameVal = findCustomFieldValue('product_name') || findCustomFieldValue('description') || findCustomFieldValue('spec') || findCustomFieldValue('title');
      if (nameVal) return nameVal;
      if (variant?.name && variant.name !== 'Untitled Product' && variant.name !== '-') return variant.name;
      if (product.name && product.name !== 'Untitled Product' && product.name !== '-') return product.name;
      return '-';
    }

    // Cut-out / Size / Dimension
    if (h.includes('cut') || h.includes('size') || h.includes('dim') || h.includes('dia')) {
      const cutVal = findCustomFieldValue('cut_out') || findCustomFieldValue('cutout') || findCustomFieldValue('size') || findCustomFieldValue('dimension') || findCustomFieldValue('dia');
      if (cutVal) return cutVal;
      if (variant?.cutOut && variant.cutOut !== '-') return variant.cutOut;
      return '-';
    }

    // Price / MRP / Rate / Dealer Price / DLP
    if (h.includes('price') || h.includes('rate') || h.includes('mrp') || h.includes('cost') || h.includes('amount') || h.includes('dlp')) {
      const priceVal = findCustomFieldValue('price') || findCustomFieldValue('mrp') || findCustomFieldValue('dealer_price') || findCustomFieldValue('dlp') || findCustomFieldValue('rate');
      if (priceVal) return priceVal.startsWith('₹') || priceVal.startsWith('$') ? priceVal : `₹${priceVal}`;

      const rawP = (variant?.price !== undefined && variant?.price !== '' && variant?.price !== null && variant?.price !== '-') 
        ? variant.price 
        : product.price;
      if (rawP !== undefined && rawP !== null && rawP !== '' && rawP !== '-' && Number(rawP) !== 0) {
        return String(rawP).startsWith('₹') || String(rawP).startsWith('$') ? String(rawP) : `₹${rawP}`;
      }
      return '-';
    }

    // Color / CCT / Shade
    if (h.includes('color') || h.includes('cct') || h.includes('shade') || h.includes('temp')) {
      const colorVal = findCustomFieldValue('color') || findCustomFieldValue('cct') || findCustomFieldValue('shade') || findCustomFieldValue('temperature');
      if (colorVal) return colorVal;
      if (variant?.color && variant.color !== '-') return variant.color;
      return '-';
    }

    // Packing / Qty / Box
    if (h.includes('pack') || h.includes('box') || h.includes('qty') || h.includes('carton') || h.includes('pcs')) {
      const packVal = findCustomFieldValue('packing') || findCustomFieldValue('box_qty') || findCustomFieldValue('qty') || findCustomFieldValue('pack');
      if (packVal) return packVal;
      if (variant?.packing && variant.packing !== '-') return variant.packing;
      return '-';
    }

    // Wattage / Power
    if (h.includes('power') || h.includes('watt') || h.includes('wt') || h === 'w') {
      const powerVal = findCustomFieldValue('wattage') || findCustomFieldValue('power') || findCustomFieldValue('watt') || findCustomFieldValue('watts');
      if (powerVal) return powerVal;
      if ((variant as any)?.power) return String((variant as any).power);
      if (product.power) return String(product.power);
      return '-';
    }

    // Step 3: Fuzzy / Partial match in custom attributes/fields
    if (variant?.customAttributes) {
      for (const [key, val] of Object.entries(variant.customAttributes)) {
        const normK = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (normK && (normK === h || h.includes(normK) || normK.includes(h))) {
          if (val !== undefined && val !== null && String(val).trim() !== '') return String(val);
        }
      }
    }
    if (product.customFields) {
      for (const [key, val] of Object.entries(product.customFields)) {
        const normK = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (normK && (normK === h || h.includes(normK) || normK.includes(h))) {
          if (val !== undefined && val !== null && String(val).trim() !== '') return String(val);
        }
      }
    }

    return '-';
  });
};

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
          // Fill up to 3 if only 1 or 2 found
          while (extracted.length < 3) {
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

  const handleUpdateTableData = (secIdx: number, updates: Partial<TableData>) => {
    setSections(prev => prev.map((sec, i) => {
      if (i !== secIdx) return sec;
      return {
        ...sec,
        tableData: {
          ...sec.tableData,
          ...updates
        }
      };
    }));
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

  const handleAddTableRowsWithData = (secIdx: number, newRowsData: string[][]) => {
    if (!newRowsData || newRowsData.length === 0) return;
    setSections(prev => prev.map((sec, i) => {
      if (i !== secIdx) return sec;
      const currentRows = sec.tableData?.rows || [];
      const hasOnlyDummyRow = currentRows.length === 1 && currentRows[0].every(cell => !cell || cell === '-' || cell.trim() === '');
      const newRows = hasOnlyDummyRow ? [...newRowsData] : [...currentRows, ...newRowsData];
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

    // If product has variants, create rows from variants
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
        <div className="px-6 py-4 border-b border-[#262626] flex items-center justify-between bg-[#161616] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[4px] bg-[#0F3D3E] flex items-center justify-center text-[#E2DCC8] shadow-md shadow-[#0F3D3E]/30">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  3-Product Grid Studio
                </h3>
                <span className="px-2 py-0.5 rounded-[4px] bg-[#0F3D3E]/40 border border-[#0F3D3E] text-[#E2DCC8] text-[9px] font-mono font-bold uppercase">
                  Page {targetPageIndex + 1}
                </span>
              </div>
              <p className="text-[10px] text-[#888888] font-medium">
                Design, reorder & auto-align 3 product blocks (Image + Title + Specs Table + Highlight Stripes)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {sections.length < 4 && (
              <button
                type="button"
                onClick={handleAddSection}
                className="px-3 py-1.5 bg-[#1f1f1f] hover:bg-[#282828] border border-[#333] text-slate-200 rounded-[4px] text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Plus size={13} />
                <span>Add Section ({sections.length}/4)</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-[4px] text-[#888] hover:text-white hover:bg-[#222] transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ================= MODAL BODY: SECTIONS LIST ================= */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#121212]">
          {sections.map((sec, secIdx) => {
            const sectionNumber = secIdx + 1;
            const positionLabel = secIdx === 0 ? 'Top' : (secIdx === sections.length - 1 ? 'Bottom' : 'Middle');

            return (
              <div
                key={sec.id}
                className={`rounded-[6px] border transition-all ${
                  sec.hasBackground
                    ? 'border-[#0F3D3E]/60 bg-[#161b1c]'
                    : 'border-[#262626] bg-[#181818]'
                }`}
              >
                {/* Section Card Top Header Bar */}
                <div className="px-4 py-2.5 border-b border-[#262626] flex items-center justify-between bg-[#141414]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-[4px] bg-[#0F3D3E] text-[#E2DCC8] flex items-center justify-center text-xs font-black">
                      {sectionNumber}
                    </span>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Section #{sectionNumber} ({positionLabel})
                    </span>

                    {sec.hasBackground && (
                      <span className="px-2 py-0.5 rounded-[4px] bg-sky-950/60 border border-sky-600/40 text-sky-400 text-[9px] font-bold uppercase flex items-center gap-1">
                        <Layers size={10} /> Highlight Stripe
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Fill from Catalog */}
                    <button
                      type="button"
                      onClick={() => setProductPickerSectionIdx(secIdx)}
                      className="px-2.5 py-1 bg-[#0F3D3E]/40 hover:bg-[#0F3D3E] border border-[#0F3D3E] text-[#E2DCC8] rounded-[4px] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Package size={12} />
                      <span>Autofill Product</span>
                    </button>

                    {/* Move Up */}
                    <button
                      type="button"
                      disabled={secIdx === 0}
                      onClick={() => handleMoveSection(secIdx, 'up')}
                      className="p-1 text-slate-400 hover:text-white rounded hover:bg-[#262626] disabled:opacity-20 transition-all"
                      title="Move Section Up"
                    >
                      <ArrowUp size={14} />
                    </button>

                    {/* Move Down */}
                    <button
                      type="button"
                      disabled={secIdx === sections.length - 1}
                      onClick={() => handleMoveSection(secIdx, 'down')}
                      className="p-1 text-slate-400 hover:text-white rounded hover:bg-[#262626] disabled:opacity-20 transition-all"
                      title="Move Section Down"
                    >
                      <ArrowDown size={14} />
                    </button>

                    {/* Delete Section */}
                    {sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSection(secIdx)}
                        className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-red-500/10 transition-all ml-1"
                        title="Delete Section"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Section Card Content Grid: Image Left + Content Right */}
                <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  
                  {/* Left Column (4 cols): Product Image & Controls */}
                  <div className="lg:col-span-4 space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#888] flex items-center gap-1.5">
                      <ImageIcon size={12} /> Product Image
                    </label>

                    <div className="h-44 rounded-[4px] border border-[#2a2a2a] bg-[#101010] relative flex flex-col items-center justify-center overflow-hidden p-2 group">
                      {sec.imageSrc ? (
                        <>
                          <img
                            src={sec.imageSrc}
                            alt={sec.title}
                            className="w-full h-full object-contain transition-transform group-hover:scale-105"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateSection(secIdx, { imageSrc: '' })}
                            className="absolute top-2 right-2 p-1.5 rounded-[4px] bg-black/70 text-white/80 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove image"
                          >
                            <Trash2 size={13} />
                          </button>
                        </>
                      ) : (
                        <div className="text-center p-3">
                          <div className="w-10 h-10 rounded-full bg-[#181818] border border-[#2a2a2a] flex items-center justify-center mx-auto mb-2 text-[#666]">
                            <ImageIcon size={18} />
                          </div>
                          <p className="text-[10px] text-[#777] font-medium mb-2">No image set</p>
                          <button
                            type="button"
                            onClick={() => setProductPickerSectionIdx(secIdx)}
                            className="px-2.5 py-1 bg-[#222] hover:bg-[#2a2a2a] border border-[#333] text-slate-300 rounded-[4px] text-[9px] font-bold uppercase"
                          >
                            Select from Catalog
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Image URL Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={sec.imageSrc || ''}
                        onChange={(e) => handleUpdateSection(secIdx, { imageSrc: e.target.value })}
                        placeholder="Paste image URL..."
                        className="flex-1 px-2.5 py-1.5 rounded-[4px] bg-[#161616] border border-[#2e2e2e] focus:border-[#0F3D3E] text-[11px] font-mono outline-none text-slate-200 placeholder:text-[#555]"
                      />
                    </div>
                  </div>

                  {/* Right Column (8 cols): Title, Highlight Stripe & Table Specs */}
                  <div className="lg:col-span-8 space-y-4">
                    
                    {/* Top Row: Series Title + Color + Highlight Stripe Toggle */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                      {/* Title Input */}
                      <div className="md:col-span-7 space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-[#888] flex items-center gap-1.5">
                          Series Title
                        </label>
                        <input
                          type="text"
                          value={sec.title}
                          onChange={(e) => handleUpdateSection(secIdx, { title: e.target.value })}
                          placeholder="e.g. ULTRA SERIES COB DOWNLIGHT"
                          className="w-full px-3 py-2 rounded-[4px] bg-[#161616] border border-[#2e2e2e] focus:border-[#0F3D3E] text-xs font-black outline-none tracking-wide text-white uppercase placeholder:text-[#555]"
                        />
                      </div>

                      {/* Title Color */}
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-[#888]">
                          Color
                        </label>
                        <div className="flex items-center gap-1.5 p-1 bg-[#161616] border border-[#2e2e2e] rounded-[4px]">
                          <input
                            type="color"
                            value={sec.titleColor || '#00a651'}
                            onChange={(e) => handleUpdateSection(secIdx, { titleColor: e.target.value })}
                            className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                          />
                          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
                            {sec.titleColor || '#00a651'}
                          </span>
                        </div>
                      </div>

                      {/* Highlight Stripe Toggle & Color */}
                      <div className="md:col-span-3 space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-[#888]">
                          Highlight Stripe
                        </label>
                        <div className="flex items-center justify-between gap-2 p-1.5 bg-[#161616] border border-[#2e2e2e] rounded-[4px]">
                          <label className="flex items-center gap-1.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={sec.hasBackground || false}
                              onChange={(e) => handleUpdateSection(secIdx, { hasBackground: e.target.checked })}
                              className="w-3.5 h-3.5 rounded border-[#444] accent-[#0F3D3E] cursor-pointer"
                            />
                            <span className="text-[10px] font-bold text-slate-300">Stripe</span>
                          </label>

                          {sec.hasBackground && (
                            <input
                              type="color"
                              value={sec.backgroundColor || '#e2e8f0'}
                              onChange={(e) => handleUpdateSection(secIdx, { backgroundColor: e.target.value })}
                              className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                              title="Stripe Color"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Table Specifications Embedded Editor */}
                    <div className="space-y-2 pt-2 border-t border-[#262626]">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#888] flex items-center gap-1.5">
                          <Palette size={11} /> Specifications Table ({sec.tableData.rows.length} rows)
                        </span>

                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Dropdown to add product row from category */}
                          <select
                            value=""
                            onChange={(e) => {
                              const val = e.target.value;
                              if (!val) return;

                              if (val.startsWith('prod:')) {
                                const prodId = val.replace('prod:', '');
                                const p = products.find(prod => String(prod.id) === String(prodId));
                                if (p) {
                                  if (p.variants && p.variants.length > 0) {
                                    const rows = p.variants.map(v => generateRowFromProduct(sec.tableData.headers, p, v));
                                    handleAddTableRowsWithData(secIdx, rows);
                                  } else {
                                    const row = generateRowFromProduct(sec.tableData.headers, p);
                                    handleAddTableRowsWithData(secIdx, [row]);
                                  }
                                  if (!sec.imageSrc && p.image) {
                                    handleUpdateSection(secIdx, { imageSrc: p.image });
                                  }
                                }
                              } else if (val.startsWith('var:')) {
                                const [_, prodId, varId] = val.split(':');
                                const p = products.find(prod => String(prod.id) === String(prodId));
                                const v = p?.variants?.find(vr => String(vr.id) === String(varId));
                                if (p && v) {
                                  const row = generateRowFromProduct(sec.tableData.headers, p, v);
                                  handleAddTableRowsWithData(secIdx, [row]);
                                  if (!sec.imageSrc && p.image) {
                                    handleUpdateSection(secIdx, { imageSrc: p.image });
                                  }
                                }
                              }
                              e.target.value = '';
                            }}
                            className="bg-[#181818] border border-[#0F3D3E] text-[#E2DCC8] hover:border-[#145456] rounded-[4px] px-2.5 py-1 text-[10px] font-bold outline-none cursor-pointer shadow-sm transition-all max-w-[260px]"
                          >
                            <option value="" className="bg-[#161616] text-[#888]">
                              + Add Product from Category...
                            </option>
                            {categories.map(cat => {
                              const catIdStr = String(cat.id);
                              const catProducts = products.filter(p => String(p.categoryId || (p as any).category_id || (p as any).category || '') === catIdStr);
                              if (catProducts.length === 0) return null;
                              return (
                                <optgroup key={cat.id} label={`📁 ${cat.name.toUpperCase()}`} className="bg-[#1a1a1a] text-sky-400 font-bold">
                                  {catProducts.map(p => {
                                    const displayName = (p.name && p.name !== 'Untitled Product') ? p.name : (p.sku || cat.name);
                                    return (
                                      <React.Fragment key={p.id}>
                                        <option value={`prod:${p.id}`} className="bg-[#141414] text-white">
                                          {p.sku ? `[${p.sku}] ` : ''}{displayName} {p.price ? `(₹${p.price})` : ''}
                                        </option>
                                        {p.variants?.map(v => (
                                          <option key={v.id} value={`var:${p.id}:${v.id}`} className="bg-[#141414] text-slate-300">
                                            &nbsp;&nbsp;↳ {v.sku ? `[${v.sku}] ` : ''}{v.name || displayName} {v.price ? `(₹${v.price})` : ''}
                                          </option>
                                        ))}
                                      </React.Fragment>
                                    );
                                  })}
                                </optgroup>
                              );
                            })}
                            {/* Products without category */}
                            {products.filter(p => !p.categoryId || !categories.some(c => String(c.id) === String(p.categoryId))).length > 0 && (
                              <optgroup label="📦 OTHER PRODUCTS" className="bg-[#1a1a1a] text-amber-400 font-bold">
                                {products.filter(p => !p.categoryId || !categories.some(c => String(c.id) === String(p.categoryId))).map(p => {
                                  const displayName = (p.name && p.name !== 'Untitled Product') ? p.name : (p.sku || 'Product');
                                  return (
                                    <option key={p.id} value={`prod:${p.id}`} className="bg-[#141414] text-white">
                                      {p.sku ? `[${p.sku}] ` : ''}{displayName} {p.price ? `(₹${p.price})` : ''}
                                    </option>
                                  );
                                })}
                              </optgroup>
                            )}
                          </select>

                          {/* Add Blank Row button */}
                          <button
                            type="button"
                            onClick={() => handleAddTableRow(secIdx)}
                            className="px-2 py-1 bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-[#333] text-slate-300 rounded-[4px] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all"
                            title="Add blank row"
                          >
                            <Plus size={10} /> Blank Row
                          </button>
                        </div>
                      </div>

                      {/* Mini Spreadsheet Table */}
                      <div className="border border-[#262626] rounded-[4px] overflow-x-auto bg-[#101010]">
                        <table className="w-full text-left border-collapse text-xs">
                          {/* Headers */}
                          <thead>
                            <tr className="bg-[#002b36] border-b border-[#262626] text-white">
                              <th className="w-8 px-2 py-1.5 text-center text-[9px] font-bold text-[#888] border-r border-[#262626]">#</th>
                              {sec.tableData.headers.map((hdr, colIdx) => (
                                <th key={colIdx} className="px-2 py-1.5 border-r border-[#262626] last:border-r-0">
                                  <input
                                    type="text"
                                    value={hdr}
                                    onChange={(e) => handleHeaderChange(secIdx, colIdx, e.target.value)}
                                    className="w-full bg-transparent outline-none text-[10px] font-bold text-white uppercase tracking-wider"
                                  />
                                </th>
                              ))}
                              <th className="w-10 px-1 py-1.5 text-center text-[9px] text-[#888]">Del</th>
                            </tr>
                          </thead>

                          {/* Rows */}
                          <tbody className="divide-y divide-[#202020]">
                            {sec.tableData.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-[#161616]">
                                <td className="px-2 py-1 text-center text-[10px] font-bold text-[#666] border-r border-[#262626]">
                                  {rIdx + 1}
                                </td>
                                {sec.tableData.headers.map((_, colIdx) => (
                                  <td key={colIdx} className="px-1.5 py-1 border-r border-[#262626] last:border-r-0">
                                    <input
                                      type="text"
                                      value={row[colIdx] ?? ''}
                                      onChange={(e) => handleCellChange(secIdx, rIdx, colIdx, e.target.value)}
                                      placeholder="-"
                                      className="w-full bg-transparent px-1 py-0.5 rounded outline-none focus:bg-[#202020] text-[11px] font-medium text-slate-200"
                                    />
                                  </td>
                                ))}
                                <td className="px-1 py-1 text-center">
                                  <button
                                    type="button"
                                    disabled={sec.tableData.rows.length <= 1}
                                    onClick={() => handleDeleteTableRow(secIdx, rIdx)}
                                    className="p-1 text-slate-500 hover:text-red-400 disabled:opacity-20 transition-colors"
                                    title="Delete row"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            );
          })}
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
        <div
          className="fixed inset-0 z-[1100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setProductPickerSectionIdx(null)}
        >
          <div
            className="w-full max-w-lg bg-[#161616] border border-[#262626] rounded-[6px] shadow-2xl flex flex-col max-h-[80vh] overflow-hidden text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 border-b border-[#262626] flex items-center justify-between bg-[#141414]">
              <div className="flex items-center gap-2.5">
                <Package size={16} className="text-[#E2DCC8]" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Select Product for Section #{productPickerSectionIdx + 1}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setProductPickerSectionIdx(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Category Filter & Search */}
            <div className="p-3 border-b border-[#262626] bg-[#141414] space-y-2">
              <input
                type="text"
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                placeholder="Search products by name or SKU..."
                className="w-full px-3 py-1.5 bg-[#1a1a1a] border border-[#333] rounded-[4px] text-xs text-white placeholder-[#666] outline-none focus:border-[#0F3D3E]"
              />

              {categories.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                  <button
                    type="button"
                    onClick={() => setPickerCategoryFilter(null)}
                    className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider shrink-0 transition-all ${
                      pickerCategoryFilter === null
                        ? 'bg-[#0F3D3E] text-white'
                        : 'bg-[#202020] text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({products.length})
                  </button>
                  {categories.map(cat => {
                    const count = products.filter(p => p.categoryId === cat.id).length;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setPickerCategoryFilter(cat.id)}
                        className={`px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider shrink-0 transition-all ${
                          pickerCategoryFilter === cat.id
                            ? 'bg-[#0F3D3E] text-white'
                            : 'bg-[#202020] text-slate-400 hover:text-white'
                        }`}
                      >
                        {cat.name} ({count})
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar bg-[#121212]">
              {(() => {
                const filtered = products.filter(p => {
                  const matchCat = pickerCategoryFilter ? p.categoryId === pickerCategoryFilter : true;
                  const matchQuery = pickerSearch
                    ? (p.name.toLowerCase().includes(pickerSearch.toLowerCase()) || p.sku.toLowerCase().includes(pickerSearch.toLowerCase()))
                    : true;
                  return matchCat && matchQuery;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="py-12 text-center text-[#777] text-xs">
                      No products found matching criteria.
                    </div>
                  );
                }

                return filtered.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleSelectProductForSection(productPickerSectionIdx, p)}
                    className="p-3 rounded-[4px] border border-[#262626] bg-[#161616] hover:border-[#0F3D3E] hover:bg-[#1a1a1a] flex items-center justify-between gap-3 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-10 h-10 rounded-[4px] object-contain bg-[#101010] border border-[#262626] p-1 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-[4px] bg-[#101010] border border-[#262626] flex items-center justify-center text-[#666] shrink-0">
                          <Package size={16} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate group-hover:text-[#E2DCC8] transition-colors">
                          {p.name}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-[#888]">
                          {p.sku && <span className="font-mono font-bold">{p.sku}</span>}
                          {p.price !== undefined && <span className="text-[#E2DCC8] font-bold">• ₹{p.price}</span>}
                          {p.variants && <span>• {p.variants.length} Variants</span>}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1 bg-[#0F3D3E] hover:bg-[#155455] text-white rounded-[4px] text-[10px] font-bold uppercase tracking-wider shrink-0"
                    >
                      Fill Section
                    </button>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGridStudioModal;
