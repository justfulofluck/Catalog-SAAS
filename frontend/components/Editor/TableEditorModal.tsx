import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import { TableData, Product } from '../../types';
import {
  PRESET_THEMES,
  matchRowToProduct,
  extractParamValue,
  buildAvailableParams
} from './TableEditor/constants';
import { TableTopBar } from './TableEditor/TableTopBar';
import { TableDataGrid } from './TableEditor/TableDataGrid';
import { TableDesignTab } from './TableEditor/TableDesignTab';
import { TableProductLinkModal } from './TableEditor/TableProductLinkModal';

interface TableEditorModalProps {
  elementId?: string | null;
  onClose?: () => void;
}

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

  // Available parameters list compiled from catalog products & category schema
  const availableParams = useMemo(() => {
    return buildAvailableParams(products, categories);
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
      const match = matchRowToProduct(row, products);
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
    newHeaders[colIdx] = paramLabel;

    const newRows = tableData.rows.map(row => {
      const match = matchRowToProduct(row, products);
      const val = match ? extractParamValue(match.product, match.variant, paramKey, paramLabel) : '-';
      const updatedRow = [...row];
      updatedRow[colIdx] = val;
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

  // ================= ROW ACTIONS =================
  const handleCellChange = (rowIdx: number, colIdx: number, val: string) => {
    const newRows = tableData.rows.map((row, rI) => {
      if (rI !== rowIdx) return row;
      const updatedRow = [...row];
      updatedRow[colIdx] = val;
      return updatedRow;
    });
    syncToCanvas({ ...tableData, rows: newRows });
  };

  const handleAddRow = () => {
    const emptyRow = new Array(tableData.headers.length).fill('');
    syncToCanvas({ ...tableData, rows: [...tableData.rows, emptyRow] });
  };

  const handleDuplicateRow = (rowIdx: number) => {
    const clonedRow = [...tableData.rows[rowIdx]];
    const newRows = [...tableData.rows];
    newRows.splice(rowIdx + 1, 0, clonedRow);
    syncToCanvas({ ...tableData, rows: newRows });
  };

  const handleDeleteRow = (rowIdx: number) => {
    if (tableData.rows.length <= 1) return;
    const newRows = tableData.rows.filter((_, i) => i !== rowIdx);
    syncToCanvas({ ...tableData, rows: newRows });
  };

  const handleMoveRow = (rowIdx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? rowIdx - 1 : rowIdx + 1;
    if (targetIdx < 0 || targetIdx >= tableData.rows.length) return;
    const newRows = [...tableData.rows];
    const temp = newRows[rowIdx];
    newRows[rowIdx] = newRows[targetIdx];
    newRows[targetIdx] = temp;
    syncToCanvas({ ...tableData, rows: newRows });
  };

  // Auto-fill an entire row from a selected catalog product
  const handleFillRowFromProduct = (rowIdx: number, prod: Product) => {
    const newRow = tableData.headers.map(header => {
      return extractParamValue(prod, null, header, header);
    });
    const newRows = [...tableData.rows];
    newRows[rowIdx] = newRow;
    syncToCanvas({ ...tableData, rows: newRows });
    setIsProductPickerOpen(false);
    setRowToLinkIdx(null);
  };

  // Add a brand new row from a selected catalog product
  const handleAddProductAsRow = (prod: Product) => {
    const newRow = tableData.headers.map(header => {
      return extractParamValue(prod, null, header, header);
    });
    syncToCanvas({ ...tableData, rows: [...tableData.rows, newRow] });
    setIsProductPickerOpen(false);
  };

  // Auto-match all existing rows in table against catalog products and populate empty/dash values
  const handleAutoMatchAllRows = () => {
    const newRows = tableData.rows.map(row => {
      const match = matchRowToProduct(row, products);
      if (!match) return row;

      return tableData.headers.map((header, colIdx) => {
        const existingVal = row[colIdx];
        if (existingVal && existingVal !== '-' && existingVal.trim() !== '') {
          return existingVal;
        }
        const extracted = extractParamValue(match.product, match.variant, header, header);
        return extracted !== '-' ? extracted : (existingVal || '-');
      });
    });

    syncToCanvas({ ...tableData, rows: newRows });
  };

  // Balance column widths
  const handleAutoFitWidths = () => {
    const numCols = tableData.headers.length;
    const equalWidths = new Array(numCols).fill(1);
    syncToCanvas({ ...tableData, colWidths: equalWidths });
  };

  // ================= DESIGN & STYLING ACTIONS =================
  const handleApplyTheme = (theme: typeof PRESET_THEMES[0]) => {
    syncToCanvas({
      ...tableData,
      headerBg: theme.headerBg,
      headerTextColor: theme.headerTextColor,
      rowBg: theme.rowBg,
      alternateRowBg: theme.alternateRowBg,
      borderColor: theme.borderColor,
    });
  };

  const handleStyleChange = (key: keyof TableData, value: any) => {
    syncToCanvas({ ...tableData, [key]: value });
  };

  // Filter products for the picker modal
  const filteredProducts = products.filter(p => {
    const q = productSearchQuery.toLowerCase();
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.customFields?.model && String(p.customFields.model).toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className={`w-full max-w-6xl max-h-[90vh] rounded-[4px] shadow-2xl border flex flex-col overflow-hidden transition-colors ${
        isDark ? 'bg-[#161616] border-[#262626] text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* ================= MODAL HEADER ================= */}
        <TableTopBar
          isDark={isDark}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tableData={tableData}
          handleAutoMatchAllRows={handleAutoMatchAllRows}
          handleAutoFitWidths={handleAutoFitWidths}
          handleClose={handleClose}
        />

        {/* ================= MODAL BODY ================= */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {activeTab === 'data' ? (
            <TableDataGrid
              isDark={isDark}
              tableData={tableData}
              products={products}
              availableParams={availableParams}
              isAddColMenuOpen={isAddColMenuOpen}
              setIsAddColMenuOpen={setIsAddColMenuOpen}
              addColMenuRef={addColMenuRef}
              activeColParamMenu={activeColParamMenu}
              setActiveColParamMenu={setActiveColParamMenu}
              colParamMenuRef={colParamMenuRef}
              handleAddColumn={handleAddColumn}
              handleAddColumnWithParam={handleAddColumnWithParam}
              handleHeaderChange={handleHeaderChange}
              handleFillColumnFromParam={handleFillColumnFromParam}
              handleDeleteColumn={handleDeleteColumn}
              handleCellChange={handleCellChange}
              handleAddRow={handleAddRow}
              handleDuplicateRow={handleDuplicateRow}
              handleDeleteRow={handleDeleteRow}
              handleMoveRow={handleMoveRow}
              setRowToLinkIdx={setRowToLinkIdx}
              setIsProductPickerOpen={setIsProductPickerOpen}
            />
          ) : (
            <TableDesignTab
              isDark={isDark}
              tableData={tableData}
              handleApplyTheme={handleApplyTheme}
              handleStyleChange={handleStyleChange}
            />
          )}
        </div>

        {/* ================= MODAL FOOTER ================= */}
        <div className={`px-6 py-4 border-t flex items-center justify-end shrink-0 ${
          isDark ? 'border-[#262626] bg-[#141414]' : 'border-slate-200 bg-slate-50'
        }`}>
          <button
            onClick={handleClose}
            className="px-6 py-2.5 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#0F3D3E]/25 transition-all hover:scale-105 active:scale-95"
          >
            Done
          </button>
        </div>
      </div>

      {/* ================= PRODUCT PICKER MODAL ================= */}
      {isProductPickerOpen && (
        <TableProductLinkModal
          isDark={isDark}
          rowToLinkIdx={rowToLinkIdx}
          productSearchQuery={productSearchQuery}
          setProductSearchQuery={setProductSearchQuery}
          filteredProducts={filteredProducts}
          handleFillRowFromProduct={handleFillRowFromProduct}
          handleAddProductAsRow={handleAddProductAsRow}
          onClose={() => {
            setIsProductPickerOpen(false);
            setRowToLinkIdx(null);
          }}
        />
      )}
    </div>
  );
};

export default TableEditorModal;
