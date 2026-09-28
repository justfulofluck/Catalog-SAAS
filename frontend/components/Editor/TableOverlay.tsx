import React, { useState, useRef, useEffect } from 'react';
import { CanvasElement } from '../../types';
import { useStore } from '../../store/useStore';
import { 
  Plus, 
  Trash2, 
  Columns, 
  Rows, 
  ArrowLeftToLine, 
  ArrowRightToLine, 
  ArrowUpToLine, 
  ArrowDownToLine 
} from 'lucide-react';

interface TableOverlayProps {
  element: CanvasElement;
  pageIndex: number;
  zoom: number;
  onClose?: () => void;
}

export const TableOverlay: React.FC<TableOverlayProps> = ({
  element,
  pageIndex,
  zoom,
  onClose,
}) => {
  const { updateElement } = useStore();
  const td = element.tableData || {
    headers: ['', '', ''],
    rows: [
      ['', '', ''],
      ['', '', ''],
      ['', '', ''],
      ['', '', ''],
    ],
  };

  const headers = td.headers || ['', '', ''];
  const rows = td.rows || [['', '', ''], ['', '', ''], ['', '', ''], ['', '', '']];
  const numCols = Math.max(1, headers.length);
  const numRows = Math.max(1, rows.length);

  // Selected cell state
  const [selectedCell, setSelectedCell] = useState<{
    isHeader: boolean;
    rowIdx: number;
    colIdx: number;
  }>({ isHeader: true, rowIdx: 0, colIdx: 0 });

  // Inline text editing state
  const [editingCell, setEditingCell] = useState<{
    isHeader: boolean;
    rowIdx: number;
    colIdx: number;
  } | null>(null);

  const [activeMenu, setActiveMenu] = useState<'col' | 'row' | null>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Calculate Column Widths
  const colWidths = React.useMemo(() => {
    if (td.colWidths && td.colWidths.length === numCols) {
      const total = td.colWidths.reduce((a, b) => a + b, 0);
      return td.colWidths.map(w => (w / total) * element.width);
    }
    const evenW = element.width / numCols;
    return new Array(numCols).fill(evenW);
  }, [td.colWidths, numCols, element.width]);

  // Calculate Row Heights (evenly divided across 1 header + N body rows)
  const totalRowCount = numRows + 1;
  const rowHeight = element.height / totalRowCount;
  const headerHeight = rowHeight;
  const bodyRowHeight = rowHeight;

  const getColLeft = (colIdx: number) => {
    let left = 0;
    for (let i = 0; i < colIdx; i++) {
      left += colWidths[i] || (element.width / numCols);
    }
    return left;
  };

  const getRowTop = (isHeader: boolean, rowIdx: number) => {
    if (isHeader) return 0;
    return (rowIdx + 1) * rowHeight;
  };

  const getRowHeight = (_isHeader: boolean) => {
    return rowHeight;
  };

  // Focus textarea when entering edit mode
  useEffect(() => {
    if (editingCell && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingCell]);

  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    if (activeMenu) {
      document.addEventListener('mousedown', handleOutsideClick);
      return () => document.removeEventListener('mousedown', handleOutsideClick);
    }
  }, [activeMenu]);

  // Update cell text
  const handleUpdateCell = (isHeader: boolean, rIdx: number, cIdx: number, val: string) => {
    if (isHeader) {
      const newHeaders = [...headers];
      newHeaders[cIdx] = val;
      updateElement(pageIndex, element.id, {
        tableData: { ...td, headers: newHeaders },
      });
    } else {
      const newRows = rows.map((r, i) => (i === rIdx ? [...r] : r));
      if (!newRows[rIdx]) {
        newRows[rIdx] = new Array(numCols).fill('');
      }
      newRows[rIdx][cIdx] = val;
      updateElement(pageIndex, element.id, {
        tableData: { ...td, rows: newRows },
      });
    }
  };

  // Add Column
  const handleAddColumn = (colIdx: number, position: 'before' | 'after') => {
    const insertIdx = position === 'before' ? colIdx : colIdx + 1;
    const newHeaders = [...headers];
    newHeaders.splice(insertIdx, 0, '');

    const newRows = rows.map(r => {
      const newR = [...r];
      newR.splice(insertIdx, 0, '');
      return newR;
    });

    const newColWidths = colWidths.map(w => (w * numCols) / (numCols + 1));
    newColWidths.splice(insertIdx, 0, element.width / (numCols + 1));

    updateElement(pageIndex, element.id, {
      tableData: {
        ...td,
        headers: newHeaders,
        rows: newRows,
        colWidths: newColWidths,
      },
    });
    setSelectedCell({ isHeader: true, rowIdx: 0, colIdx: insertIdx });
    setEditingCell(null);
    setActiveMenu(null);
  };

  // Delete Column
  const handleDeleteColumn = (colIdx: number) => {
    if (numCols <= 1) return;
    const newHeaders = headers.filter((_, i) => i !== colIdx);
    const newRows = rows.map(r => r.filter((_, i) => i !== colIdx));

    updateElement(pageIndex, element.id, {
      tableData: {
        ...td,
        headers: newHeaders,
        rows: newRows,
        colWidths: undefined,
      },
    });
    const nextCol = Math.min(colIdx, newHeaders.length - 1);
    setSelectedCell({ isHeader: true, rowIdx: 0, colIdx: nextCol });
    setEditingCell(null);
    setActiveMenu(null);
  };

  // Add Row
  const handleAddRow = (rowIdx: number, position: 'above' | 'below') => {
    const insertIdx = position === 'above' ? rowIdx : rowIdx + 1;
    const newRows = [...rows];
    newRows.splice(insertIdx, 0, new Array(numCols).fill(''));

    const newHeight = element.height + bodyRowHeight;

    updateElement(pageIndex, element.id, {
      height: newHeight,
      tableData: {
        ...td,
        rows: newRows,
      },
    });
    setSelectedCell({ isHeader: false, rowIdx: insertIdx, colIdx: selectedCell?.colIdx || 0 });
    setEditingCell(null);
    setActiveMenu(null);
  };

  // Delete Row
  const handleDeleteRow = (rowIdx: number, isHeader: boolean) => {
    if (isHeader) return; // Header cannot be deleted
    if (numRows <= 1) return;
    const newRows = rows.filter((_, i) => i !== rowIdx);
    const newHeight = Math.max(80, element.height - bodyRowHeight);

    updateElement(pageIndex, element.id, {
      height: newHeight,
      tableData: {
        ...td,
        rows: newRows,
      },
    });
    const nextRow = Math.min(rowIdx, newRows.length - 1);
    setSelectedCell({ isHeader: false, rowIdx: nextRow, colIdx: selectedCell?.colIdx || 0 });
    setEditingCell(null);
    setActiveMenu(null);
  };

  // Distribute Columns Evenly
  const handleSizeColsEqually = () => {
    updateElement(pageIndex, element.id, {
      tableData: {
        ...td,
        colWidths: undefined,
      },
    });
    setActiveMenu(null);
  };

  // Key navigation in inline editor
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!editingCell) return;
    const { isHeader, rowIdx, colIdx } = editingCell;

    if (e.key === 'Tab') {
      e.preventDefault();
      if (!e.shiftKey) {
        // Move to next cell to the right
        if (colIdx < numCols - 1) {
          setEditingCell({ isHeader, rowIdx, colIdx: colIdx + 1 });
          setSelectedCell({ isHeader, rowIdx, colIdx: colIdx + 1 });
        } else if (isHeader) {
          // Wrap from header to first row
          setEditingCell({ isHeader: false, rowIdx: 0, colIdx: 0 });
          setSelectedCell({ isHeader: false, rowIdx: 0, colIdx: 0 });
        } else if (rowIdx < numRows - 1) {
          // Next row first cell
          setEditingCell({ isHeader: false, rowIdx: rowIdx + 1, colIdx: 0 });
          setSelectedCell({ isHeader: false, rowIdx: rowIdx + 1, colIdx: 0 });
        } else {
          // Bottom-right cell: add new row automatically
          handleAddRow(rowIdx, 'below');
        }
      } else {
        // Shift+Tab: previous cell
        if (colIdx > 0) {
          setEditingCell({ isHeader, rowIdx, colIdx: colIdx - 1 });
          setSelectedCell({ isHeader, rowIdx, colIdx: colIdx - 1 });
        } else if (!isHeader && rowIdx > 0) {
          setEditingCell({ isHeader: false, rowIdx: rowIdx - 1, colIdx: numCols - 1 });
          setSelectedCell({ isHeader: false, rowIdx: rowIdx - 1, colIdx: numCols - 1 });
        } else if (!isHeader && rowIdx === 0) {
          setEditingCell({ isHeader: true, rowIdx: 0, colIdx: numCols - 1 });
          setSelectedCell({ isHeader: true, rowIdx: 0, colIdx: numCols - 1 });
        }
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isHeader) {
        setEditingCell({ isHeader: false, rowIdx: 0, colIdx });
        setSelectedCell({ isHeader: false, rowIdx: 0, colIdx });
      } else if (rowIdx < numRows - 1) {
        setEditingCell({ isHeader: false, rowIdx: rowIdx + 1, colIdx });
        setSelectedCell({ isHeader: false, rowIdx: rowIdx + 1, colIdx });
      } else {
        handleAddRow(rowIdx, 'below');
      }
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const selectedColLeft = getColLeft(selectedCell.colIdx) * zoom;
  const selectedColWidth = (colWidths[selectedCell.colIdx] || (element.width / numCols)) * zoom;

  const selectedRowTop = getRowTop(selectedCell.isHeader, selectedCell.rowIdx) * zoom;
  const selectedRowHeight = getRowHeight(selectedCell.isHeader) * zoom;

  return (
    <div
      className="absolute pointer-events-auto select-none z-[120]"
      style={{
        left: element.x * zoom,
        top: element.y * zoom,
        width: element.width * zoom,
        height: element.height * zoom,
        transform: `rotate(${element.rotation || 0}deg)`,
        transformOrigin: 'top left',
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* 2. Top Column Pill Button (•••) */}
      <div
        ref={activeMenu === 'col' ? menuRef : undefined}
        className="absolute z-[160] -top-8 flex flex-col items-center pointer-events-auto"
        style={{
          left: selectedColLeft + selectedColWidth / 2,
          transform: 'translateX(-50%)',
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveMenu(activeMenu === 'col' ? null : 'col');
          }}
          className="px-2.5 py-1 rounded-full bg-white border border-[#8B5CF6] text-[#8B5CF6] shadow-md flex items-center justify-center gap-1 hover:bg-[#8B5CF6] hover:text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
          title="Column options"
        >
          <span className="w-1 h-1 rounded-full bg-current inline-block"></span>
          <span className="w-1 h-1 rounded-full bg-current inline-block"></span>
          <span className="w-1 h-1 rounded-full bg-current inline-block"></span>
        </button>

        {/* Canva Column Context Dropdown Menu (Exact Match with Screenshot) */}
        {activeMenu === 'col' && (
          <div 
            className="absolute top-8 left-0 w-52 bg-white rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.18)] border border-slate-200/90 py-1.5 z-[250] text-[#1E293B] text-[12px] font-medium animate-in fade-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => handleAddColumn(selectedCell.colIdx, 'before')}
              className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 cursor-pointer transition-colors"
            >
              <ArrowLeftToLine size={15} className="text-slate-500 stroke-[1.8]" />
              <span>Add column before</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddColumn(selectedCell.colIdx, 'after')}
              className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 cursor-pointer transition-colors"
            >
              <ArrowRightToLine size={15} className="text-slate-500 stroke-[1.8]" />
              <span>Add column after</span>
            </button>

            <div className="h-[1px] bg-slate-100 my-1"></div>

            <button
              type="button"
              onClick={handleSizeColsEqually}
              className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 cursor-pointer transition-colors"
            >
              <Columns size={15} className="text-slate-500 stroke-[1.8]" />
              <span>Size columns equally</span>
            </button>

            <div className="h-[1px] bg-slate-100 my-1"></div>

            <button
              type="button"
              disabled={numCols <= 1}
              onClick={() => handleDeleteColumn(selectedCell.colIdx)}
              className={`w-full px-3.5 py-2 text-left flex items-center gap-2.5 transition-colors ${
                numCols <= 1 
                  ? 'text-slate-300 cursor-not-allowed' 
                  : 'text-rose-600 hover:bg-rose-50 cursor-pointer font-medium'
              }`}
            >
              <Trash2 size={15} className="stroke-[1.8]" />
              <span>Delete column</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Left Row Pill Button (⋮) */}
      <div
        ref={activeMenu === 'row' ? menuRef : undefined}
        className="absolute z-[160] -left-8 flex items-center pointer-events-auto"
        style={{
          top: selectedRowTop + selectedRowHeight / 2,
          transform: 'translateY(-50%)',
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setActiveMenu(activeMenu === 'row' ? null : 'row');
          }}
          className="px-1 py-2 rounded-full bg-white border border-[#8B5CF6] text-[#8B5CF6] shadow-md flex flex-col items-center justify-center gap-0.5 hover:bg-[#8B5CF6] hover:text-white transition-all cursor-pointer hover:scale-105 active:scale-95"
          title="Row options"
        >
          <span className="w-1 h-1 rounded-full bg-current block"></span>
          <span className="w-1 h-1 rounded-full bg-current block"></span>
          <span className="w-1 h-1 rounded-full bg-current block"></span>
        </button>

        {/* Canva Row Context Dropdown Menu */}
        {activeMenu === 'row' && (
          <div 
            className="absolute left-8 top-0 w-48 bg-white rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.18)] border border-slate-200/90 py-1.5 z-[250] text-[#1E293B] text-[12px] font-medium animate-in fade-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => handleAddRow(selectedCell.rowIdx, 'above')}
              className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 cursor-pointer transition-colors"
            >
              <ArrowUpToLine size={15} className="text-slate-500 stroke-[1.8]" />
              <span>Add row above</span>
            </button>
            <button
              type="button"
              onClick={() => handleAddRow(selectedCell.rowIdx, 'below')}
              className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-slate-700 cursor-pointer transition-colors"
            >
              <ArrowDownToLine size={15} className="text-slate-500 stroke-[1.8]" />
              <span>Add row below</span>
            </button>

            <div className="h-[1px] bg-slate-100 my-1"></div>

            <button
              type="button"
              disabled={numRows <= 1 || selectedCell.isHeader}
              onClick={() => handleDeleteRow(selectedCell.rowIdx, selectedCell.isHeader)}
              className={`w-full px-3.5 py-2 text-left flex items-center gap-2.5 transition-colors ${
                numRows <= 1 || selectedCell.isHeader 
                  ? 'text-slate-300 cursor-not-allowed' 
                  : 'text-rose-600 hover:bg-rose-50 cursor-pointer font-medium'
              }`}
            >
              <Trash2 size={15} className="stroke-[1.8]" />
              <span>Delete row</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Quick Add Column (+) Button on Right Edge */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleAddColumn(numCols - 1, 'after');
        }}
        className="absolute -right-7 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white hover:bg-[#8B5CF6] text-slate-700 hover:text-white border border-slate-300 hover:border-[#8B5CF6] shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer z-[140]"
        title="Add column"
      >
        <Plus size={12} strokeWidth={2.5} />
      </button>

      {/* 5. Quick Add Row (+) Button on Bottom Edge */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleAddRow(numRows - 1, 'below');
        }}
        className="absolute -bottom-7 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-white hover:bg-[#8B5CF6] text-slate-700 hover:text-white border border-slate-300 hover:border-[#8B5CF6] shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer z-[140]"
        title="Add row"
      >
        <Plus size={12} strokeWidth={2.5} />
      </button>

      {/* 6. Interactive Cell Grid */}
      <div className="absolute inset-0">
        {/* Header Cells */}
        {headers.map((hText, cIdx) => {
          const isSelected = selectedCell.isHeader && selectedCell.colIdx === cIdx;
          const isEditing = editingCell?.isHeader && editingCell?.colIdx === cIdx;
          const cLeft = getColLeft(cIdx) * zoom;
          const cWidth = (colWidths[cIdx] || (element.width / numCols)) * zoom;
          const cHeight = headerHeight * zoom;

          return (
            <div
              key={`hdr-cell-${cIdx}`}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedCell({ isHeader: true, rowIdx: 0, colIdx: cIdx });
                setActiveMenu(null);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setSelectedCell({ isHeader: true, rowIdx: 0, colIdx: cIdx });
                setEditingCell({ isHeader: true, rowIdx: 0, colIdx: cIdx });
                setActiveMenu(null);
              }}
              className="absolute cursor-pointer flex items-center transition-all"
              style={{
                left: cLeft,
                top: 0,
                width: cWidth,
                height: cHeight,
              }}
            >
              {isSelected && (
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    border: '2px solid #8B5CF6',
                    backgroundColor: isEditing ? '#FFFFFF' : 'rgba(139, 92, 246, 0.08)',
                    zIndex: 20,
                  }}
                />
              )}

              {/* Inline Textarea for Header */}
              {isEditing && (
                <textarea
                  ref={editInputRef}
                  value={hText}
                  placeholder=""
                  onChange={(e) => handleUpdateCell(true, 0, cIdx, e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={() => setEditingCell(null)}
                  className="w-full h-full px-1 resize-none outline-none border-none text-slate-900 font-bold uppercase z-30"
                  style={{
                    backgroundColor: td.headerBg || element.fill || '#FFFFFF',
                    color: td.headerTextColor || '#0F172A',
                    fontSize: `${Math.max(10, (td.headerFontSize || 11) * zoom)}px`,
                    fontFamily: td.fontFamily || 'Montserrat',
                    fontWeight: td.headerFontWeight || (td.fontWeight === 'normal' ? '600' : '900'),
                    fontStyle: td.fontStyle || 'normal',
                    textAlign: (td.textAlign || 'center') as any,
                    paddingTop: `${Math.max(2, (cHeight - Math.max(10, (td.headerFontSize || 11) * zoom) * 1.3) / 2)}px`,
                    lineHeight: '1.2',
                  }}
                />
              )}
            </div>
          );
        })}

        {/* Body Row Cells */}
        {rows.map((row, rIdx) => {
          const rTop = getRowTop(false, rIdx) * zoom;
          const rHeight = bodyRowHeight * zoom;

          return row.map((cellText, cIdx) => {
            const isSelected = !selectedCell.isHeader && selectedCell.rowIdx === rIdx && selectedCell.colIdx === cIdx;
            const isEditing = !editingCell?.isHeader && editingCell?.rowIdx === rIdx && editingCell?.colIdx === cIdx;
            const cLeft = getColLeft(cIdx) * zoom;
            const cWidth = (colWidths[cIdx] || (element.width / numCols)) * zoom;

            return (
              <div
                key={`cell-${rIdx}-${cIdx}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCell({ isHeader: false, rowIdx: rIdx, colIdx: cIdx });
                  setActiveMenu(null);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setSelectedCell({ isHeader: false, rowIdx: rIdx, colIdx: cIdx });
                  setEditingCell({ isHeader: false, rowIdx: rIdx, colIdx: cIdx });
                  setActiveMenu(null);
                }}
                className="absolute cursor-pointer flex items-center transition-all"
                style={{
                  left: cLeft,
                  top: rTop,
                  width: cWidth,
                  height: rHeight,
                }}
              >
                {isSelected && (
                  <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      border: '2px solid #8B5CF6',
                      backgroundColor: isEditing ? '#FFFFFF' : 'rgba(139, 92, 246, 0.08)',
                      zIndex: 20,
                    }}
                  />
                )}

                {/* Inline Textarea for Body Cell */}
                {isEditing && (
                  <textarea
                    ref={editInputRef}
                    value={cellText}
                    placeholder=""
                    onChange={(e) => handleUpdateCell(false, rIdx, cIdx, e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => setEditingCell(null)}
                    className="w-full h-full px-1 resize-none outline-none border-none text-slate-900 z-30 font-medium"
                    style={{
                      backgroundColor: (rIdx % 2 === 1 && td.alternateRowBg) ? td.alternateRowBg : (td.rowBg || '#FFFFFF'),
                      color: td.textColor || '#0F172A',
                      fontSize: `${Math.max(9, (td.fontSize || 10) * zoom)}px`,
                      fontFamily: td.fontFamily || 'Inter',
                      fontWeight: td.fontWeight || (cIdx === 0 ? '700' : '500'),
                      fontStyle: td.fontStyle || 'normal',
                      textAlign: (td.textAlign || 'center') as any,
                      paddingTop: `${Math.max(2, (rHeight - Math.max(9, (td.fontSize || 10) * zoom) * 1.3) / 2)}px`,
                      lineHeight: '1.2',
                    }}
                  />
                )}
              </div>
            );
          });
        })}
      </div>
    </div>
  );
};
