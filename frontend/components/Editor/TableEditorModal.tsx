import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Table as TableIcon, Plus, Trash2, X, Check, Palette,
  Type, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Copy,
  Sliders, Sparkles, MoveLeft, MoveRight, Zap, Search,
  ChevronDown, Package, ListFilter
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { CanvasElement, TableData, Product, ProductVariant } from '../../types';
import { resolveFieldLabel } from '../../utils/fieldUtils';

interface TableEditorModalProps {
  elementId?: string | null;
  onClose?: () => void;
}

const PRESET_THEMES = [
  { name: 'Dark Teal (V-TAC)', headerBg: '#002b36', headerTextColor: '#ffffff', rowBg: '#ffffff', alternateRowBg: '#f8fafc', borderColor: '#334155' },
  { name: 'Modern Indigo', headerBg: '#4f46e5', headerTextColor: '#ffffff', rowBg: '#ffffff', alternateRowBg: '#eef2ff', borderColor: '#6366f1' },
  { name: 'Deep Slate', headerBg: '#0f172a', headerTextColor: '#ffffff', rowBg: '#ffffff', alternateRowBg: '#f1f5f9', borderColor: '#334155' },
  { name: 'Forest Emerald', headerBg: '#064e3b', headerTextColor: '#ffffff', rowBg: '#ffffff', alternateRowBg: '#f0fdf4', borderColor: '#047857' },
  { name: 'Luxury Wine', headerBg: '#4c0519', headerTextColor: '#ffffff', rowBg: '#ffffff', alternateRowBg: '#fff1f2', borderColor: '#9f1239' },
  { name: 'Clean Minimalist', headerBg: '#e2e8f0', headerTextColor: '#0f172a', rowBg: '#ffffff', alternateRowBg: '#f8fafc', borderColor: '#cbd5e1' },
];

export const TableEditorModal: React.FC<TableEditorModalProps> = ({ elementId, onClose }) => {
  const {
    catalog,
    currentPageIndex,
    products = [],
    categories = [],
    isTableEditorOpen,
    editingTableElementId,
    setIsTableEditorOpen,
    updateElement,
    updateHeaderElement,
    updateFooterElement,
    uiTheme
  } = useStore();

  const isDark = uiTheme === 'dark';

  const activeElementId = elementId || editingTableElementId;

  // Find which page the element belongs to
  const targetPageIndex = useMemo(() => {
    if (!activeElementId) return currentPageIndex;
    const idx = catalog.pages?.findIndex(p => p.elements?.some(el => el.id === activeElementId));
    return idx !== undefined && idx !== -1 ? idx : currentPageIndex;
  }, [catalog?.pages, activeElementId, currentPageIndex]);

  // Find target element in current page or header/footer
  const targetElement = useMemo(() => {
    if (!activeElementId) return null;
    return catalog?.pages?.[targetPageIndex]?.elements?.find(el => el.id === activeElementId) ||
           catalog?.headerElements?.find(el => el.id === activeElementId) ||
           catalog?.footerElements?.find(el => el.id === activeElementId) ||
           null;
  }, [activeElementId, catalog?.pages, targetPageIndex, catalog?.headerElements, catalog?.footerElements]);

  // Tab: 'data' (Spreadsheet) vs 'design' (Colors & typography)
  const [activeTab, setActiveTab] = useState<'data' | 'design'>('data');

  // Local state for fast editing before committing or live updating
  const [tableData, setTableData] = useState<TableData | null>(null);

  // Popover / menu states for parameter autofill & product picker
  const [activeColParamMenu, setActiveColParamMenu] = useState<number | null>(null);
  const [isAddColMenuOpen, setIsAddColMenuOpen] = useState(false);
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [rowToLinkIdx, setRowToLinkIdx] = useState<number | null>(null);

  const addColMenuRef = useRef<HTMLDivElement>(null);
  const colParamMenuRef = useRef<HTMLDivElement>(null);

  // Close popup menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (addColMenuRef.current && !addColMenuRef.current.contains(e.target as Node)) {
        setIsAddColMenuOpen(false);
      }
      if (colParamMenuRef.current && !colParamMenuRef.current.contains(e.target as Node)) {
        setActiveColParamMenu(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Initialize table data from element
  useEffect(() => {
    if (targetElement) {
      const td: TableData = targetElement.tableData ? JSON.parse(JSON.stringify(targetElement.tableData)) : {
        headers: ['COL 1', 'COL 2', 'COL 3', 'COL 4'],
        rows: [
          ['Value 1', 'Value 2', 'Value 3', 'Value 4'],
          ['Value 5', 'Value 6', 'Value 7', 'Value 8'],
        ],
        headerBg: '#002b36',
        headerTextColor: '#ffffff',
        alternateRowBg: '#f8fafc',
        rowBg: '#ffffff',
        borderColor: '#334155',
        fontSize: 8.5,
        headerFontSize: 9.5,
        cellPadding: 6
      };
      setTableData(td);
    }
  }, [targetElement?.id]);

  // Close handler
  const handleClose = () => {
    if (tableData && targetElement) {
      syncToCanvas(tableData);
    }
    setIsTableEditorOpen(false, null);
    onClose?.();
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isProductPickerOpen) {
          setIsProductPickerOpen(false);
          setRowToLinkIdx(null);
        } else if (activeColParamMenu !== null) {
          setActiveColParamMenu(null);
        } else if (isAddColMenuOpen) {
          setIsAddColMenuOpen(false);
        } else {
          handleClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tableData, targetElement, isProductPickerOpen, activeColParamMenu, isAddColMenuOpen]);

  // Recalculate suitable height and broadcast to store
  const syncToCanvas = (newTd: TableData) => {
    setTableData(newTd);
    if (!targetElement) return;

    const cellPadding = newTd.cellPadding ?? 6;
    const headerFontSize = newTd.headerFontSize ?? 9.5;
    const bodyFontSize = newTd.fontSize ?? 8.5;
    const numRows = newTd.rows.length;
    const headerRowHeight = Math.max(28, (headerFontSize * 1.3) + cellPadding * 2);
    const avgRowHeight = Math.max(26, (bodyFontSize * 1.35) + cellPadding * 2);
    const calculatedHeight = Math.max(80, Math.round(headerRowHeight + (numRows * avgRowHeight) + 4));

    const updates = {
      tableData: newTd,
      height: calculatedHeight
    };

    if (catalog?.headerElements?.some(el => el.id === targetElement.id)) {
      updateHeaderElement(targetElement.id, updates);
    } else if (catalog?.footerElements?.some(el => el.id === targetElement.id)) {
      updateFooterElement(targetElement.id, updates);
    } else {
      updateElement(targetPageIndex, targetElement.id, updates);
    }
  };

  // ================= MATCHING & PRODUCT PARAMETER EXTRACTION =================
  const matchRowToProduct = useCallback((row: string[]): { product: Product; variant: ProductVariant | null } | null => {
    if (!products || products.length === 0) return null;

    for (const cell of row) {
      if (!cell || cell === '-' || cell.trim() === '') continue;
      const cleanCell = cell.trim().toLowerCase();

      // 1. Try SKU match
      for (const p of products) {
        if (p.sku && p.sku.toLowerCase() === cleanCell) {
          return { product: p, variant: null };
        }
        if (p.variants && p.variants.length > 0) {
          const matchedVariant = p.variants.find(v => v.sku && v.sku.toLowerCase() === cleanCell);
          if (matchedVariant) return { product: p, variant: matchedVariant };
        }
      }

      // 2. Try Name match
      for (const p of products) {
        if (p.name && (p.name.toLowerCase() === cleanCell || cleanCell.includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(cleanCell))) {
          const matchedVariant = p.variants?.find(v => v.name && (v.name.toLowerCase() === cleanCell || cleanCell.includes(v.name.toLowerCase())));
          return { product: p, variant: matchedVariant || p.variants?.[0] || null };
        }
      }
    }

    return null;
  }, [products]);

  const extractParamValue = useCallback((product: Product, variant: ProductVariant | null, paramKey: string, paramLabel?: string): string => {
    const normKey = (paramKey || '').toLowerCase();
    const normLabel = (paramLabel || '').toLowerCase();

    // Model Number (Strictly Model No - never SKU fallback)
    if (normKey.includes('model') || normLabel.includes('model')) {
      return variant?.customAttributes?.model || variant?.customAttributes?.model_no || product.customFields?.model || product.customFields?.model_no || (product as any).modelNo || '-';
    }

    // SKU (Only if explicitly SKU)
    if (normKey === 'sku' || normLabel === 'sku') {
      return variant?.sku || product.sku || '-';
    }

    // Product Name / Specification
    if (normKey === 'name' || normLabel.includes('product') || normLabel.includes('spec') || normLabel.includes('name') || normLabel.includes('desc')) {
      return variant?.name || product.name || '-';
    }

    // Cut-out / Dimensions
    if (normKey.includes('cut') || normLabel.includes('cut') || normLabel.includes('dim')) {
      return variant?.cutOut || product.customFields?.cutOut || product.customFields?.cut_out || product.customFields?.['cut-out'] || product.customFields?.cutout || '-';
    }

    // Color / CCT
    if (normKey.includes('color') || normKey.includes('cct') || normLabel.includes('color') || normLabel.includes('cct')) {
      return variant?.color || product.customFields?.color || product.customFields?.cct || product.customFields?.['color/cct'] || '-';
    }

    // Price
    if (normKey.includes('price') || normLabel.includes('price') || normLabel.includes('mrp') || normLabel.includes('rate') || normLabel.includes('dealer')) {
      const p = variant?.price ?? product.price;
      if (p !== undefined && p !== null) {
        return typeof p === 'number' ? `${product.currency || '₹'}${p}` : String(p);
      }
      return '-';
    }

    // Packing
    if (normKey.includes('pack') || normLabel.includes('pack') || normLabel.includes('box')) {
      return variant?.packing || product.customFields?.packing || product.customFields?.packing_per_box || product.customFields?.['packing per box'] || '-';
    }

    // Custom attributes on variant or product
    if (variant?.customAttributes && variant.customAttributes[paramKey] !== undefined) {
      return String(variant.customAttributes[paramKey]);
    }
    if (product.customFields && product.customFields[paramKey] !== undefined) {
      return String(product.customFields[paramKey]);
    }

    // Fuzzy match on product.customFields keys
    if (product.customFields) {
      const matchedKey = Object.keys(product.customFields).find(k =>
        k.toLowerCase() === normKey ||
        k.toLowerCase().replace(/[^a-z0-9]/g, '') === normLabel.replace(/[^a-z0-9]/g, '')
      );
      if (matchedKey && product.customFields[matchedKey] !== undefined) {
        return String(product.customFields[matchedKey]);
      }
    }

    return '-';
  }, []);

  // Available parameters list compiled from catalog products & category schema
  const availableParams = useMemo(() => {
    const list: { key: string; label: string; group: string; icon?: string }[] = [
      { key: 'cutOut', label: 'CUT-OUT', group: 'Standard Specs' },
      { key: 'color', label: 'COLOR / CCT', group: 'Standard Specs' },
      { key: 'price', label: 'DEALER PRICE', group: 'Standard Specs' },
      { key: 'packing', label: 'PACKING PER BOX', group: 'Standard Specs' },
      { key: 'sku', label: 'MODEL NO', group: 'Standard Specs' },
      { key: 'name', label: 'PRODUCTS / SPEC', group: 'Standard Specs' },
    ];

    const seenLabels = new Set(list.map(p => p.label.toLowerCase().replace(/[^a-z0-9]/g, '')));

    // Collect custom fields from products
    products.forEach(p => {
      if (p.customFields) {
        Object.keys(p.customFields).forEach(k => {
          if (typeof p.customFields![k] === 'object') return;
          const resolved = resolveFieldLabel(k, categories, p);
          if (!resolved) return;
          const label = resolved.toUpperCase();
          const norm = label.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (!seenLabels.has(norm)) {
            seenLabels.add(norm);
            list.push({ key: k, label, group: 'Product Attributes' });
          }
        });
      }
    });

    // Collect fields from category customSchema
    categories.forEach(cat => {
      if (cat.customSchema) {
        cat.customSchema.forEach(field => {
          if (field.type === 'image') return;
          const label = field.label.toUpperCase();
          const norm = label.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (!seenLabels.has(norm)) {
            seenLabels.add(norm);
            list.push({ key: field.id, label, group: 'Category Schema' });
          }
        });
      }
    });

    return list;
  }, [products, categories]);

  if (!isTableEditorOpen && !elementId) return null;
  if (!targetElement || !tableData) return null;

  // ================= COLUMN ACTIONS =================
  const handleHeaderChange = (colIdx: number, val: string) => {
    const newHeaders = [...tableData.headers];
    newHeaders[colIdx] = val;
    syncToCanvas({ ...tableData, headers: newHeaders });
  };

  const handleAddColumn = () => {
    const newColNum = tableData.headers.length + 1;
    const newHeaders = [...tableData.headers, `COL ${newColNum}`];
    const newRows = tableData.rows.map(r => [...r, '']);
    const newColWidths = tableData.colWidths ? [...tableData.colWidths, 1] : undefined;
    syncToCanvas({ ...tableData, headers: newHeaders, rows: newRows, colWidths: newColWidths });
    setIsAddColMenuOpen(false);
  };

  // Add a new column directly bound to a product parameter with instant data autofill
  const handleAddColumnWithParam = (paramKey: string, paramLabel: string) => {
    const newHeaders = [...tableData.headers, paramLabel];
    const newRows = tableData.rows.map(row => {
      const match = matchRowToProduct(row);
      const val = match ? extractParamValue(match.product, match.variant, paramKey, paramLabel) : '-';
      return [...row, val];
    });
    const newColWidths = tableData.colWidths ? [...tableData.colWidths, 1] : undefined;
    syncToCanvas({ ...tableData, headers: newHeaders, rows: newRows, colWidths: newColWidths });
    setIsAddColMenuOpen(false);
  };

  // Autofill an existing column from a selected product parameter
  const handleFillColumnFromParam = (colIdx: number, paramKey: string, paramLabel: string) => {
    const newHeaders = [...tableData.headers];
    // If the column header is generic (like 'COL 4' or empty), rename it to the parameter name
    if (/^COL\s*\d*$/i.test(newHeaders[colIdx]) || !newHeaders[colIdx] || newHeaders[colIdx].trim() === '') {
      newHeaders[colIdx] = paramLabel;
    }

    const newRows = tableData.rows.map(row => {
      const match = matchRowToProduct(row);
      const updatedRow = [...row];
      if (match) {
        const val = extractParamValue(match.product, match.variant, paramKey, paramLabel);
        updatedRow[colIdx] = val;
      }
      return updatedRow;
    });

    syncToCanvas({ ...tableData, headers: newHeaders, rows: newRows });
    setActiveColParamMenu(null);
  };

  const handleDeleteColumn = (colIdx: number) => {
    if (tableData.headers.length <= 1) return;
    const newHeaders = tableData.headers.filter((_, i) => i !== colIdx);
    const newRows = tableData.rows.map(r => r.filter((_, i) => i !== colIdx));
    const newColWidths = tableData.colWidths ? tableData.colWidths.filter((_, i) => i !== colIdx) : undefined;
    syncToCanvas({ ...tableData, headers: newHeaders, rows: newRows, colWidths: newColWidths });
  };

  const handleMoveColumn = (colIdx: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? colIdx - 1 : colIdx + 1;
    if (targetIdx < 0 || targetIdx >= tableData.headers.length) return;

    const newHeaders = [...tableData.headers];
    const [movedHeader] = newHeaders.splice(colIdx, 1);
    newHeaders.splice(targetIdx, 0, movedHeader);

    const newRows = tableData.rows.map(row => {
      const newRow = [...row];
      const [movedCell] = newRow.splice(colIdx, 1);
      newRow.splice(targetIdx, 0, movedCell);
      return newRow;
    });

    let newColWidths = tableData.colWidths ? [...tableData.colWidths] : undefined;
    if (newColWidths && newColWidths.length === tableData.headers.length) {
      const [movedWidth] = newColWidths.splice(colIdx, 1);
      newColWidths.splice(targetIdx, 0, movedWidth);
    }

    syncToCanvas({ ...tableData, headers: newHeaders, rows: newRows, ...(newColWidths ? { colWidths: newColWidths } : {}) });
  };

  // ================= ROW ACTIONS =================
  const handleCellChange = (rIdx: number, cIdx: number, val: string) => {
    const newRows = tableData.rows.map((row, i) => {
      if (i !== rIdx) return row;
      const newRow = [...row];
      newRow[cIdx] = val;
      return newRow;
    });
    syncToCanvas({ ...tableData, rows: newRows });
  };

  const handleAddRow = () => {
    const newRow = new Array(tableData.headers.length).fill('-');
    syncToCanvas({ ...tableData, rows: [...tableData.rows, newRow] });
  };

  // Add a product from catalog as a fully-populated row
  const handleAddProductAsRow = (product: Product, variant?: ProductVariant | null) => {
    const newRow = tableData.headers.map(header => {
      return extractParamValue(product, variant || null, header, header);
    });
    syncToCanvas({ ...tableData, rows: [...tableData.rows, newRow] });
    setIsProductPickerOpen(false);
    setRowToLinkIdx(null);
  };

  // Fill/link an existing row from a selected product
  const handleFillRowFromProduct = (rowIdx: number, product: Product, variant?: ProductVariant | null) => {
    const newRows = tableData.rows.map((row, idx) => {
      if (idx !== rowIdx) return row;
      return tableData.headers.map(header => {
        return extractParamValue(product, variant || null, header, header);
      });
    });
    syncToCanvas({ ...tableData, rows: newRows });
    setRowToLinkIdx(null);
    setIsProductPickerOpen(false);
  };

  const handleDuplicateRow = (rIdx: number) => {
    const rowToCopy = [...tableData.rows[rIdx]];
    const newRows = [...tableData.rows];
    newRows.splice(rIdx + 1, 0, rowToCopy);
    syncToCanvas({ ...tableData, rows: newRows });
  };

  const handleDeleteRow = (rIdx: number) => {
    if (tableData.rows.length <= 1) return;
    const newRows = tableData.rows.filter((_, i) => i !== rIdx);
    syncToCanvas({ ...tableData, rows: newRows });
  };

  const handleMoveRow = (rIdx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? rIdx - 1 : rIdx + 1;
    if (targetIdx < 0 || targetIdx >= tableData.rows.length) return;

    const newRows = [...tableData.rows];
    const [movedRow] = newRows.splice(rIdx, 1);
    newRows.splice(targetIdx, 0, movedRow);
    syncToCanvas({ ...tableData, rows: newRows });
  };

  // ================= STYLE ACTIONS =================
  const handleStyleChange = (key: keyof TableData, val: any) => {
    syncToCanvas({ ...tableData, [key]: val });
  };

  const handleApplyTheme = (theme: typeof PRESET_THEMES[0]) => {
    syncToCanvas({
      ...tableData,
      headerBg: theme.headerBg,
      headerTextColor: theme.headerTextColor,
      rowBg: theme.rowBg,
      alternateRowBg: theme.alternateRowBg,
      borderColor: theme.borderColor
    });
  };

  // Filtered products for product picker modal
  const filteredProducts = products.filter(p => {
    const q = productSearchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q));
  });

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
      role="dialog"
      data-modal="true"
      onClick={handleClose}
      onWheel={(e) => e.stopPropagation()}
    >
      <div
        className={`w-full max-w-5xl rounded-[4px] shadow-2xl border flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 ${
          isDark ? 'bg-[#161616] border-[#262626] text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        {/* ================= MODAL HEADER ================= */}
        <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'border-[#262626] bg-[#141414]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[4px] bg-[#0F3D3E] text-white flex items-center justify-center shadow-lg shadow-[#0F3D3E]/25">
              <TableIcon size={20} />
            </div>
            <div>
              <h2 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Edit Table & Specifications</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Tabs */}
            <div className={`flex p-1 rounded-[4px] border ${isDark ? 'bg-[#101010] border-[#262626]' : 'bg-slate-100 border-slate-200'}`}>
              <button
                onClick={() => setActiveTab('data')}
                className={`px-3 py-1.5 rounded-[4px] text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'data'
                    ? 'bg-[#0F3D3E] text-white shadow-sm'
                    : isDark ? 'text-[#888] hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TableIcon size={14} /> Spreadsheet Data
              </button>
              <button
                onClick={() => setActiveTab('design')}
                className={`px-3 py-1.5 rounded-[4px] text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'design'
                    ? 'bg-[#0F3D3E] text-white shadow-sm'
                    : isDark ? 'text-[#888] hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Palette size={14} /> Design & Styles
              </button>
            </div>

            <button
              onClick={handleClose}
              className={`p-2 rounded-[4px] transition-colors ${
                isDark ? 'text-[#888] hover:text-white hover:bg-[#262626]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Close Table Editor"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ================= MODAL BODY ================= */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar p-6 ${isDark ? 'bg-[#161616]' : 'bg-slate-50/50'}`}>
          {activeTab === 'data' ? (
            <div className="space-y-4">
              {/* Quick Actions Bar */}
              <div className={`flex items-center gap-2 flex-wrap pb-3 border-b ${isDark ? 'border-[#262626]' : 'border-slate-200'}`}>
                  {/* Add Column Button with Dropdown for Parameter selection */}
                  <div className="relative" ref={addColMenuRef}>
                    <div className="inline-flex rounded-[4px] shadow-sm">
                      <button
                        onClick={handleAddColumn}
                        className={`px-3.5 py-2 rounded-l-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all border ${
                          isDark ? 'bg-[#202020] hover:bg-[#282828] text-white border-[#2e2e2e]' : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-sm'
                        }`}
                      >
                        <Plus size={14} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} /> Add Column
                      </button>
                      <button
                        onClick={() => setIsAddColMenuOpen(!isAddColMenuOpen)}
                        className={`px-2.5 py-2 rounded-r-xl border-y border-r flex items-center justify-center transition-all ${
                          isDark ? 'bg-[#262626] hover:bg-[#303030] text-[#aaa] hover:text-white border-[#2e2e2e]' : 'bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-300'
                        }`}
                        title="Add column from product parameter"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>

                    {/* Dropdown Menu for Add Column */}
                    {isAddColMenuOpen && (
                      <div className={`absolute left-0 top-full mt-2 w-64 rounded-[4px] shadow-2xl border z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150 ${
                        isDark ? 'bg-[#1a1a1a] border-[#2e2e2e] text-white' : 'bg-white border-slate-200 text-slate-800 shadow-xl'
                      }`}>
                        <div className={`px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider border-b ${
                          isDark ? 'text-[#888] border-[#262626]' : 'text-slate-500 border-slate-200'
                        }`}>
                          Add Column With Parameter
                        </div>
                        <button
                          onClick={handleAddColumn}
                          className={`w-full text-left px-2.5 py-1.5 rounded-[4px] text-xs font-bold flex items-center justify-between ${
                            isDark ? 'text-slate-200 hover:bg-[#262626] hover:text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                          }`}
                        >
                          <span>Empty Blank Column</span>
                          <span className={`text-[10px] ${isDark ? 'text-[#888]' : 'text-slate-400'}`}>Custom</span>
                        </button>
                        <div className="pt-1 pb-1">
                          <div className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                            isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'
                          }`}>
                            <Zap size={10} /> Auto-populate from Product
                          </div>
                          <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-0.5">
                            {availableParams.map((p, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleAddColumnWithParam(p.key, p.label)}
                                className={`w-full text-left px-2.5 py-1.5 rounded-[4px] text-xs font-medium flex items-center justify-between transition-colors ${
                                  isDark ? 'text-slate-200 hover:bg-[#0F3D3E]/20 hover:text-[#E2DCC8]' : 'text-slate-700 hover:bg-teal-50 hover:text-teal-900'
                                }`}
                              >
                                <span>{p.label}</span>
                                <span className={`text-[9px] uppercase ${isDark ? 'text-[#888]' : 'text-slate-400'}`}>{p.group}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Add Row Button */}
                  <button
                    onClick={handleAddRow}
                    className={`px-3.5 py-2 border rounded-[4px] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                      isDark ? 'bg-[#202020] hover:bg-[#282828] text-white border-[#2e2e2e]' : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-sm'
                    }`}
                  >
                    <Plus size={14} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} /> Add Blank Row
                  </button>

                  {/* Add Product Row Button */}
                  <button
                    onClick={() => {
                      setRowToLinkIdx(null);
                      setIsProductPickerOpen(true);
                    }}
                    className="px-4 py-2 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-[#0F3D3E]/20 active:scale-95"
                    title="Add a product from your catalog and automatically populate its parameters into columns"
                  >
                    <Package size={14} /> + Add Product Row
                  </button>
              </div>

              {/* Spreadsheet Grid View */}
              <div className={`border rounded-[4px] overflow-hidden shadow-sm ${
                isDark ? 'border-[#262626] bg-[#121212]' : 'border-slate-200 bg-white'
              }`}>
                <div className="overflow-x-auto max-h-[55vh] custom-scrollbar">
                  <table className="w-full border-collapse text-left text-xs min-w-[750px]">
                    {/* Table Headers */}
                    <thead className="sticky top-0 z-10 shadow-sm" style={{ backgroundColor: tableData.headerBg || '#1e293b', color: tableData.headerTextColor || '#ffffff' }}>
                      <tr>
                        <th className="w-14 px-3 py-3 text-center text-[10px] font-bold uppercase tracking-wider opacity-70 border-r border-white/10">
                          #
                        </th>
                        {tableData.headers.map((header, colIdx) => (
                          <th key={colIdx} className="px-3 py-2 border-r border-white/10 min-w-[155px] last:border-r-0 relative">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={header}
                                  onChange={(e) => handleHeaderChange(colIdx, e.target.value)}
                                  placeholder={`Column ${colIdx + 1}`}
                                  className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 text-inherit font-bold text-xs px-2 py-1 rounded-[4px] border border-transparent focus:border-white/40 outline-none transition-all placeholder:text-white/40"
                                />
                              </div>

                              {/* Header Sub-Bar: Reorder, Auto-fill Parameter, Delete */}
                              <div className="flex items-center justify-between px-1 opacity-75 hover:opacity-100 transition-opacity">
                                <div className="flex items-center gap-0.5">
                                  <button
                                    type="button"
                                    disabled={colIdx === 0}
                                    onClick={() => handleMoveColumn(colIdx, 'left')}
                                    className="p-1 hover:bg-white/20 rounded disabled:opacity-20 transition-all"
                                    title="Move Column Left"
                                  >
                                    <MoveLeft size={11} />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={colIdx === tableData.headers.length - 1}
                                    onClick={() => handleMoveColumn(colIdx, 'right')}
                                    className="p-1 hover:bg-white/20 rounded disabled:opacity-20 transition-all"
                                    title="Move Column Right"
                                  >
                                    <MoveRight size={11} />
                                  </button>

                                  {/* Auto-fill from parameter button */}
                                  <div className="relative">
                                    <button
                                      type="button"
                                      onClick={() => setActiveColParamMenu(activeColParamMenu === colIdx ? null : colIdx)}
                                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all ${
                                        activeColParamMenu === colIdx
                                          ? 'bg-[#0F3D3E] text-white shadow-sm'
                                          : 'bg-white/15 hover:bg-white/25 text-amber-300'
                                      }`}
                                      title="Auto-fill this column with product parameter data"
                                    >
                                      <Zap size={10} className="text-amber-400" />
                                      <span>Fill</span>
                                    </button>

                                    {/* Parameter autofill menu for this column */}
                                    {activeColParamMenu === colIdx && (
                                      <div
                                        ref={colParamMenuRef}
                                        className={`absolute left-0 top-full mt-2 w-64 rounded-[4px] shadow-2xl border z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150 ${
                                          isDark ? 'bg-[#1a1a1a] border-[#2e2e2e] text-white' : 'bg-white border-slate-200 text-slate-800 shadow-xl'
                                        }`}
                                      >
                                        <div className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider border-b flex justify-between items-center ${
                                          isDark ? 'text-[#888] border-[#262626]' : 'text-slate-500 border-slate-200'
                                        }`}>
                                          <span>Auto-fill &quot;{header}&quot;</span>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setActiveColParamMenu(null);
                                            }}
                                            className={isDark ? "text-[#888] hover:text-white" : "text-slate-400 hover:text-slate-800"}
                                          >
                                            <X size={12} />
                                          </button>
                                        </div>
                                        <p className={`px-2 py-1 text-[10px] leading-tight ${isDark ? 'text-[#888]' : 'text-slate-500'}`}>
                                          Select a parameter to populate all rows:
                                        </p>
                                        <div className="max-h-56 overflow-y-auto custom-scrollbar space-y-0.5">
                                          {availableParams.map((p, idx) => (
                                            <button
                                              key={idx}
                                              type="button"
                                              onClick={() => handleFillColumnFromParam(colIdx, p.key, p.label)}
                                              className={`w-full text-left px-2.5 py-1.5 rounded-[4px] text-xs font-medium flex items-center justify-between transition-colors ${
                                                isDark ? 'text-slate-200 hover:bg-[#0F3D3E]/20 hover:text-[#E2DCC8]' : 'text-slate-700 hover:bg-teal-50 hover:text-teal-900'
                                              }`}
                                            >
                                              <span>{p.label}</span>
                                              <span className={`text-[9px] uppercase ${isDark ? 'text-[#888]' : 'text-slate-400'}`}>{p.group}</span>
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  disabled={tableData.headers.length <= 1}
                                  onClick={() => handleDeleteColumn(colIdx)}
                                  className="p-1 hover:text-red-300 hover:bg-red-500/20 rounded disabled:opacity-20 transition-all"
                                  title="Delete Column"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>
                          </th>
                        ))}
                        <th className="w-24 px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wider opacity-70">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody className={`divide-y ${isDark ? 'divide-[#262626]' : 'divide-slate-200'}`}>
                      {tableData.rows.map((row, rIdx) => {
                        const matchedProd = matchRowToProduct(row);

                        return (
                          <tr
                            key={rIdx}
                            className={`group transition-colors ${
                              isDark
                                ? `${rIdx % 2 === 1 ? 'bg-[#141414]' : 'bg-[#101010]'} hover:bg-[#1f1f1f]`
                                : `${rIdx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'} hover:bg-teal-50/40`
                            }`}
                          >
                            {/* Row Index Badge */}
                            <td className={`px-2 py-2 text-center text-[11px] font-bold select-none border-r ${
                              isDark ? 'text-[#666] border-[#262626]' : 'text-slate-400 border-slate-200'
                            }`}>
                              <div className="flex flex-col items-center">
                                <span>{rIdx + 1}</span>
                                {matchedProd && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-0.5" title={`Linked: ${matchedProd.product.name}`} />
                                )}
                              </div>
                            </td>

                            {/* Cells */}
                            {tableData.headers.map((_, colIdx) => {
                              const cellValue = row[colIdx] ?? '';
                              return (
                                <td key={colIdx} className={`p-1 border-r last:border-r-0 ${
                                  isDark ? 'border-[#262626]' : 'border-slate-200'
                                }`}>
                                  <input
                                    type="text"
                                    value={cellValue}
                                    onChange={(e) => handleCellChange(rIdx, colIdx, e.target.value)}
                                    placeholder="-"
                                    className={`w-full px-2.5 py-1.5 rounded-[4px] text-xs font-medium outline-none transition-all border border-transparent focus:border-[#0F3D3E] bg-transparent ${
                                      isDark
                                        ? 'text-slate-100 placeholder:text-[#555] hover:bg-[#1a1a1a]'
                                        : 'text-slate-800 placeholder:text-slate-400 hover:bg-slate-50'
                                    }`}
                                  />
                                </td>
                              );
                            })}

                            {/* Row Actions */}
                            <td className="px-2 py-1 text-center">
                              <div className="flex items-center justify-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                {/* Fill row from Product */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setRowToLinkIdx(rIdx);
                                    setIsProductPickerOpen(true);
                                  }}
                                  className={`p-1 rounded ${
                                    isDark ? 'text-slate-400 hover:text-teal-400 hover:bg-[#202020]' : 'text-slate-500 hover:text-[#0F3D3E] hover:bg-slate-100'
                                  }`}
                                  title="Fill row from a catalog product"
                                >
                                  <Package size={12} />
                                </button>
                                <button
                                  type="button"
                                  disabled={rIdx === 0}
                                  onClick={() => handleMoveRow(rIdx, 'up')}
                                  className={`p-1 rounded disabled:opacity-20 ${
                                    isDark ? 'text-slate-400 hover:text-white hover:bg-[#202020]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                  }`}
                                  title="Move Row Up"
                                >
                                  <ArrowUp size={12} />
                                </button>
                                <button
                                  type="button"
                                  disabled={rIdx === tableData.rows.length - 1}
                                  onClick={() => handleMoveRow(rIdx, 'down')}
                                  className={`p-1 rounded disabled:opacity-20 ${
                                    isDark ? 'text-slate-400 hover:text-white hover:bg-[#202020]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                  }`}
                                  title="Move Row Down"
                                >
                                  <ArrowDown size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDuplicateRow(rIdx)}
                                  className={`p-1 rounded ${
                                    isDark ? 'text-slate-400 hover:text-white hover:bg-[#202020]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                                  }`}
                                  title="Duplicate Row"
                                >
                                  <Copy size={12} />
                                </button>
                                <button
                                  type="button"
                                  disabled={tableData.rows.length <= 1}
                                  onClick={() => handleDeleteRow(rIdx)}
                                  className={`p-1 rounded disabled:opacity-20 ${
                                    isDark ? 'text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
                                  }`}
                                  title="Delete Row"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : (
            /* ================= DESIGN & STYLING TAB ================= */
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Presets */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Sparkles size={12} /> Curated Theme Presets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PRESET_THEMES.map((theme, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyTheme(theme)}
                      className={`p-3 rounded-[4px] border text-left flex flex-col gap-2 transition-all hover:scale-[1.02] ${
                        tableData.headerBg === theme.headerBg
                          ? isDark ? 'border-teal-400 ring-2 ring-teal-400/20 bg-teal-950/20' : 'border-[#0F3D3E] ring-2 ring-teal-500/20 bg-teal-50'
                          : isDark ? 'border-[#262626] bg-[#141414] hover:border-[#383838]' : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-[4px] border border-slate-300 shadow-sm shrink-0" style={{ backgroundColor: theme.headerBg }} />
                        <span className={`text-xs font-black truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{theme.name}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-slate-400 font-mono">
                        <span>{theme.headerBg}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Customization */}
              <div className={`space-y-4 pt-4 border-t ${isDark ? 'border-[#262626]' : 'border-slate-200'}`}>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Palette size={12} /> Color Palette
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Header Background */}
                  <div className="space-y-1.5">
                    <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Header Background Color</span>
                    <div className={`flex items-center gap-2 p-2 rounded-[4px] border ${
                      isDark ? 'border-[#2e2e2e] bg-[#101010]' : 'border-slate-200 bg-slate-50'
                    }`}>
                      <input
                        type="color"
                        value={tableData.headerBg || '#002b36'}
                        onChange={(e) => handleStyleChange('headerBg', e.target.value)}
                        className="w-8 h-8 rounded-[4px] cursor-pointer border-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={tableData.headerBg || '#002b36'}
                        onChange={(e) => handleStyleChange('headerBg', e.target.value)}
                        className={`flex-1 bg-transparent font-mono text-xs font-bold outline-none uppercase ${isDark ? 'text-white' : 'text-slate-800'}`}
                      />
                    </div>
                  </div>

                  {/* Header Text Color */}
                  <div className="space-y-1.5">
                    <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Header Text Color</span>
                    <div className={`flex items-center gap-2 p-2 rounded-[4px] border ${
                      isDark ? 'border-[#2e2e2e] bg-[#101010]' : 'border-slate-200 bg-slate-50'
                    }`}>
                      <input
                        type="color"
                        value={tableData.headerTextColor || '#ffffff'}
                        onChange={(e) => handleStyleChange('headerTextColor', e.target.value)}
                        className="w-8 h-8 rounded-[4px] cursor-pointer border-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={tableData.headerTextColor || '#ffffff'}
                        onChange={(e) => handleStyleChange('headerTextColor', e.target.value)}
                        className={`flex-1 bg-transparent font-mono text-xs font-bold outline-none uppercase ${isDark ? 'text-white' : 'text-slate-800'}`}
                      />
                    </div>
                  </div>

                  {/* Alternate Row Background (Zebra striping) */}
                  <div className="space-y-1.5">
                    <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Alternate Row Color (Striping)</span>
                    <div className={`flex items-center gap-2 p-2 rounded-[4px] border ${
                      isDark ? 'border-[#2e2e2e] bg-[#101010]' : 'border-slate-200 bg-slate-50'
                    }`}>
                      <input
                        type="color"
                        value={tableData.alternateRowBg || '#f8fafc'}
                        onChange={(e) => handleStyleChange('alternateRowBg', e.target.value)}
                        className="w-8 h-8 rounded-[4px] cursor-pointer border-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={tableData.alternateRowBg || '#f8fafc'}
                        onChange={(e) => handleStyleChange('alternateRowBg', e.target.value)}
                        className={`flex-1 bg-transparent font-mono text-xs font-bold outline-none uppercase ${isDark ? 'text-white' : 'text-slate-800'}`}
                      />
                    </div>
                  </div>

                  {/* Border Color */}
                  <div className="space-y-1.5">
                    <span className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Border Color</span>
                    <div className={`flex items-center gap-2 p-2 rounded-[4px] border ${
                      isDark ? 'border-[#2e2e2e] bg-[#101010]' : 'border-slate-200 bg-slate-50'
                    }`}>
                      <input
                        type="color"
                        value={tableData.borderColor || '#334155'}
                        onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                        className="w-8 h-8 rounded-[4px] cursor-pointer border-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={tableData.borderColor || '#334155'}
                        onChange={(e) => handleStyleChange('borderColor', e.target.value)}
                        className={`flex-1 bg-transparent font-mono text-xs font-bold outline-none uppercase ${isDark ? 'text-white' : 'text-slate-800'}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography & Sizing */}
              <div className={`space-y-4 pt-4 border-t ${isDark ? 'border-[#262626]' : 'border-slate-200'}`}>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Type size={12} /> Typography & Spacing
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Header Font Size */}
                  <div className={`p-3 rounded-[4px] border space-y-2 ${
                    isDark ? 'border-[#2e2e2e] bg-[#101010]' : 'border-slate-200 bg-slate-50'
                  }`}>
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className={isDark ? "text-slate-300" : "text-slate-700"}>Header Font Size</span>
                      <span className="font-mono text-[#0F3D3E] font-black">{tableData.headerFontSize || 9.5}px</span>
                    </div>
                    <input
                      type="range"
                      min={7}
                      max={18}
                      step={0.5}
                      value={tableData.headerFontSize || 9.5}
                      onChange={(e) => handleStyleChange('headerFontSize', parseFloat(e.target.value))}
                      className="w-full accent-[#0F3D3E] cursor-pointer"
                    />
                  </div>

                  {/* Body Font Size */}
                  <div className={`p-3 rounded-[4px] border space-y-2 ${
                    isDark ? 'border-[#2e2e2e] bg-[#101010]' : 'border-slate-200 bg-slate-50'
                  }`}>
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className={isDark ? "text-slate-300" : "text-slate-700"}>Body Font Size</span>
                      <span className="font-mono text-[#0F3D3E] font-black">{tableData.fontSize || 8.5}px</span>
                    </div>
                    <input
                      type="range"
                      min={6.5}
                      max={16}
                      step={0.5}
                      value={tableData.fontSize || 8.5}
                      onChange={(e) => handleStyleChange('fontSize', parseFloat(e.target.value))}
                      className="w-full accent-[#0F3D3E] cursor-pointer"
                    />
                  </div>

                  {/* Cell Padding */}
                  <div className={`p-3 rounded-[4px] border space-y-2 ${
                    isDark ? 'border-[#2e2e2e] bg-[#101010]' : 'border-slate-200 bg-slate-50'
                  }`}>
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className={isDark ? "text-slate-300" : "text-slate-700"}>Cell Padding</span>
                      <span className="font-mono text-[#0F3D3E] font-black">{tableData.cellPadding || 6}px</span>
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={14}
                      step={1}
                      value={tableData.cellPadding || 6}
                      onChange={(e) => handleStyleChange('cellPadding', parseInt(e.target.value, 10))}
                      className="w-full accent-[#0F3D3E] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= MODAL FOOTER ================= */}
        <div className={`px-6 py-4 border-t flex items-center justify-end shrink-0 ${
          isDark ? 'border-[#262626] bg-[#141414]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-2.5 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#0F3D3E]/25 transition-all hover:scale-105 active:scale-95"
            >
              <Check size={16} /> Done
            </button>
          </div>
        </div>
      </div>

      {/* ================= PRODUCT PICKER MODAL ================= */}
      {isProductPickerOpen && (
        <div
          className="fixed inset-0 z-[1100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => {
            setIsProductPickerOpen(false);
            setRowToLinkIdx(null);
          }}
        >
          <div
            className={`w-full max-w-lg rounded-[4px] shadow-2xl border flex flex-col max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-150 ${
              isDark ? 'bg-[#161616] border-[#262626] text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`px-6 py-4 border-b flex items-center justify-between ${
              isDark ? 'border-[#262626] bg-[#141414]' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[4px] bg-[#0F3D3E] text-white flex items-center justify-center shadow-md shadow-[#0F3D3E]/25">
                  <Package size={18} />
                </div>
                <div>
                  <h3 className={`text-sm font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {rowToLinkIdx !== null ? `Fill Row #${rowToLinkIdx + 1} with Product` : 'Add Product to Table'}
                  </h3>
                  <p className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Select a product to automatically map its specs into table columns
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsProductPickerOpen(false);
                  setRowToLinkIdx(null);
                }}
                className={`p-1.5 rounded-[4px] transition-colors ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <X size={16} />
              </button>
            </div>

            {/* Search Input */}
            <div className={`p-4 border-b ${isDark ? 'border-[#262626] bg-[#141414]' : 'border-slate-200 bg-slate-50/50'}`}>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                  placeholder="Search products by title, SKU, or model..."
                  className={`w-full pl-9 pr-4 py-2 rounded-[4px] text-xs font-medium outline-none border transition-all ${
                    isDark
                      ? 'bg-[#1a1a1a] border-[#2e2e2e] focus:border-[#0F3D3E] text-white placeholder:text-[#666]'
                      : 'bg-white border-slate-300 focus:border-[#0F3D3E] text-slate-900 placeholder:text-slate-400 shadow-sm'
                  }`}
                  autoFocus
                />
              </div>
            </div>

            {/* Product List */}
            <div className={`flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2 ${
              isDark ? 'bg-[#161616]' : 'bg-slate-50/50'
            }`}>
              {filteredProducts.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-medium">
                  No products found matching &quot;{productSearchQuery}&quot;
                </div>
              ) : (
                filteredProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className={`p-3 rounded-[4px] border transition-all flex items-center justify-between gap-3 group cursor-pointer ${
                      isDark
                        ? 'border-[#262626] bg-[#141414] hover:border-[#0F3D3E] hover:bg-[#1a1a1a]'
                        : 'border-slate-200 bg-white hover:border-[#0F3D3E] hover:bg-teal-50/40 shadow-sm'
                    }`}
                    onClick={() => {
                      if (rowToLinkIdx !== null) {
                        handleFillRowFromProduct(rowToLinkIdx, prod);
                      } else {
                        handleAddProductAsRow(prod);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {prod.image ? (
                        <img src={prod.image} alt={prod.name} className={`w-10 h-10 rounded-[4px] object-contain p-1 border shrink-0 ${
                          isDark ? 'bg-[#101010] border-[#262626]' : 'bg-slate-50 border-slate-200'
                        }`} />
                      ) : (
                        <div className={`w-10 h-10 rounded-[4px] border flex items-center justify-center shrink-0 ${
                          isDark ? 'bg-[#101010] border-[#262626] text-[#666]' : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}>
                          <Package size={16} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className={`text-xs font-bold truncate transition-colors ${
                          isDark ? 'text-white group-hover:text-[#E2DCC8]' : 'text-slate-800 group-hover:text-[#0F3D3E]'
                        }`}>
                          {prod.name}
                        </p>
                        <div className={`flex items-center gap-2 mt-0.5 text-[10px] ${isDark ? 'text-[#888]' : 'text-slate-500'}`}>
                          {prod.sku && <span className="font-mono font-bold">{prod.sku}</span>}
                          {prod.price !== undefined && <span className={`font-bold ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>• {prod.currency || '₹'}{prod.price}</span>}
                          {prod.customFields?.cutOut && <span>• {prod.customFields.cutOut}</span>}
                          {prod.customFields?.color && <span>• {prod.customFields.color}</span>}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="px-3 py-1.5 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] text-[10px] font-bold uppercase tracking-wider shrink-0 shadow-sm transition-all"
                    >
                      {rowToLinkIdx !== null ? 'Fill Row' : 'Add Row'}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableEditorModal;
