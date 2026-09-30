import { useState, useEffect, useMemo } from 'react';
import { Product, ProductVariant, ProductGridSection, TableData, Category } from '../../../../types';
import { resolveFieldLabel } from '../../../../utils/fieldUtils';
import { generateRowFromProduct } from '../utils/gridDataGenerators';

interface UseTableEditingProps {
  sections: ProductGridSection[];
  updateAndApplySections: (updater: (prev: ProductGridSection[]) => ProductGridSection[]) => void;
  categories: Category[];
  products: Product[];
}

export function useTableEditing({
  sections,
  updateAndApplySections,
  categories,
  products
}: UseTableEditingProps) {
  // Table Enhancements State
  const [activeFillMenu, setActiveFillMenu] = useState<{ secIdx: number; colIdx: number } | null>(null);
  const [openStyleSecIdx, setOpenStyleSecIdx] = useState<number | null>(null);
  const [linkRowModal, setLinkRowModal] = useState<{ secIdx: number; rIdx: number } | null>(null);
  const [linkRowSearch, setLinkRowSearch] = useState('');
  const [linkRowCategory, setLinkRowCategory] = useState<string>('all');

  // Close popup menus on outside click
  useEffect(() => {
    const handleOutside = () => {
      setActiveFillMenu(null);
    };
    if (activeFillMenu) {
      document.addEventListener('mousedown', handleOutside);
      return () => document.removeEventListener('mousedown', handleOutside);
    }
  }, [activeFillMenu]);

  // Dynamic extraction of unique product fields / custom attributes present in current products & categories
  const availableProductFields = useMemo(() => {
    const fieldSet = new Set<string>();

    // 1. Gather all schema fields from categories
    categories.forEach((cat: any) => {
      if (cat.customSchema && Array.isArray(cat.customSchema)) {
        cat.customSchema.forEach((f: any) => {
          const lbl = (f.label || f.name || '').trim().toUpperCase();
          if (lbl) {
            fieldSet.add(lbl);
          }
        });
      }
    });

    // 2. Gather actual customFields & customAttributes present in products
    products.forEach(p => {
      if (p.customFields && typeof p.customFields === 'object') {
        Object.entries(p.customFields).forEach(([k, v]) => {
          if (k && k.trim() && v !== undefined && v !== null && String(v).trim() !== '' && String(v).trim() !== '-') {
            const humanLabel = resolveFieldLabel(k, categories as any, p);
            if (humanLabel) {
              fieldSet.add(humanLabel.trim().toUpperCase());
            } else if (!/^(custom|field)[-_]?[0-9]+$/i.test(k) && !/^[0-9]+$/.test(k)) {
              fieldSet.add(k.trim().toUpperCase());
            }
          }
        });
      }
      if (p.variants && Array.isArray(p.variants)) {
        p.variants.forEach(v => {
          if (v.customAttributes && typeof v.customAttributes === 'object') {
            Object.entries(v.customAttributes).forEach(([k, val]) => {
              if (k && k.trim() && val !== undefined && val !== null && String(val).trim() !== '' && String(val).trim() !== '-') {
                const humanLabel = resolveFieldLabel(k, categories as any, p);
                if (humanLabel) {
                  fieldSet.add(humanLabel.trim().toUpperCase());
                } else if (!/^(custom|field)[-_]?[0-9]+$/i.test(k) && !/^[0-9]+$/.test(k)) {
                  fieldSet.add(k.trim().toUpperCase());
                }
              }
            });
          }
        });
      }
    });

    const fields = Array.from(fieldSet);

    // Build clean list without duplicate fields
    const result: string[] = [];

    // 1. Model field (prefer user's exact schema name e.g. "MODEL NUMBER" or "MODEL NO")
    const modelMatch = fields.find(f => f === 'MODEL NUMBER' || f === 'MODEL NO' || f === 'MODEL' || f === 'ITEM NO');
    result.push(modelMatch || 'MODEL NO');

    // 2. Product Name / Description field
    const prodMatch = fields.find(f => f === 'PRODUCT NAME' || f === 'PRODUCTS' || f === 'PRODUCT' || f === 'DESCRIPTION');
    result.push(prodMatch || 'PRODUCTS');

    // 3. Price / MRP field (only one price field, prefer MRP if present, else PRICE)
    const hasMrp = fields.some(f => f === 'MRP' || f.includes('MRP'));
    if (hasMrp) {
      result.push('MRP');
    } else {
      result.push('PRICE');
    }

    // 4. Any other custom fields defined in schema or products without duplicating the above
    fields.forEach(f => {
      const norm = f.replace(/[^A-Z0-9]/g, '');
      const isModel = norm.includes('MODEL') || norm === 'SKU' || norm === 'ITEMNO';
      const isProd = norm.includes('PRODUCT') || norm === 'DESCRIPTION' || norm === 'NAME' || norm === 'ID';
      const isPrice = norm === 'PRICE' || norm === 'MRP' || norm === 'RATE' || norm === 'COST';

      if (!isModel && !isProd && !isPrice && !result.includes(f)) {
        result.push(f);
      }
    });

    return result;
  }, [products, categories]);

  // Helper to accurately match a table row to its product and variant using candidate scoring
  const matchProductAndVariantForRow = (
    row: string[],
    secContext?: ProductGridSection
  ): { matchedProd?: Product; matchedVar?: ProductVariant } => {
    const rowTokens = row
      .map(c => (c || '').trim().toLowerCase().replace(/^[₹$]/, ''))
      .filter(c => c && c !== '-');
    if (rowTokens.length === 0 || !products || products.length === 0) return {};

    const secTitleNorm = (secContext?.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    let bestScore = 0;
    let bestMatch: { matchedProd?: Product; matchedVar?: ProductVariant } = {};

    for (const p of products) {
      const pSku = (p.sku || '').trim().toLowerCase();
      const pName = (p.name || '').trim().toLowerCase();
      const pPrice = p.price !== undefined ? String(p.price).trim().toLowerCase() : '';

      const isSecCat = secTitleNorm && (
        (p.name || '').toLowerCase().replace(/[^a-z0-9]/g, '').includes(secTitleNorm) ||
        categories.some(cat => String(cat.id) === String(p.categoryId) && cat.name.toLowerCase().replace(/[^a-z0-9]/g, '').includes(secTitleNorm))
      );

      const checkCandidate = (variant?: ProductVariant) => {
        let score = 0;
        const vSku = (variant?.sku || '').trim().toLowerCase();
        const vName = (variant?.name || '').trim().toLowerCase();
        const vPrice = (variant?.price !== undefined && variant?.price !== null && String(variant.price).trim() !== '')
          ? String(variant.price).trim().toLowerCase()
          : pPrice;
        const vCutOut = (variant?.cutOut || '').trim().toLowerCase();

        // 1. Exact SKU / Model Number Match (Highest confidence)
        if (vSku && rowTokens.some(tok => tok === vSku)) score += 100;
        else if (pSku && rowTokens.some(tok => tok === pSku)) score += 80;

        // 2. Exact Name Match
        if (vName && rowTokens.some(tok => tok === vName)) score += 75;
        else if (pName && rowTokens.some(tok => tok === pName)) score += 65;

        // 3. Exact Price Match (Crucial when products share generic category names)
        if (vPrice && rowTokens.some(tok => tok === vPrice || tok === `₹${vPrice}` || tok === `$${vPrice}`)) score += 50;

        // 4. Exact Cut-Out / Dimensions Match
        if (vCutOut && rowTokens.some(tok => tok === vCutOut)) score += 40;

        // 5. Custom Attributes / Fields matching
        const customObj = { ...(p.customFields || {}), ...(variant?.customAttributes || {}) };
        for (const [k, val] of Object.entries(customObj)) {
          const valStr = String(val || '').trim().toLowerCase().replace(/^[₹$]/, '');
          if (!valStr || valStr === '-') continue;

          const isModelKey = /model|item|sku|code/i.test(k);
          const isPriceKey = /price|rate|mrp|cost|dlp/i.test(k);
          const isCutKey = /cut|size|dim/i.test(k);

          if (rowTokens.some(tok => tok === valStr)) {
            if (isModelKey) score += 90;
            else if (isPriceKey) score += 50;
            else if (isCutKey) score += 40;
            else score += 15;
          }
        }

        // 6. Distinct word matching (avoiding common short noise tokens)
        for (const tok of rowTokens) {
          if (tok.length >= 4 && !['downlight', 'series', 'light', 'white', 'black', 'warm'].includes(tok)) {
            if (pName.includes(tok)) score += 6;
            if (vName && vName.includes(tok)) score += 8;
          }
        }

        if (isSecCat) score += 10;

        if (score > bestScore) {
          bestScore = score;
          bestMatch = { matchedProd: p, matchedVar: variant || p.variants?.[0] };
        }
      };

      if (p.variants && p.variants.length > 0) {
        for (const v of p.variants) {
          checkCandidate(v);
        }
      } else {
        checkCandidate();
      }
    }

    return bestScore > 0 ? bestMatch : {};
  };

  const handleCellChange = (secIdx: number, rIdx: number, cIdx: number, val: string) => {
    updateAndApplySections(prev => prev.map((sec, i) => {
      if (i !== secIdx) return sec;
      const newRows = sec.tableData.rows.map((row, rowIdx) => {
        if (rowIdx !== rIdx) return row;
        const newRow = [...row];
        newRow[cIdx] = val;
        return newRow;
      });
      return {
        ...sec,
        tableData: { ...sec.tableData, rows: newRows }
      };
    }));
  };

  const handleHeaderChange = (secIdx: number, cIdx: number, val: string) => {
    updateAndApplySections(prev => prev.map((sec, i) => {
      if (i !== secIdx) return sec;
      const newHeaders = [...sec.tableData.headers];
      newHeaders[cIdx] = val;
      return {
        ...sec,
        tableData: { ...sec.tableData, headers: newHeaders }
      };
    }));
  };

  const handleAddTableRow = (secIdx: number) => {
    updateAndApplySections(prev => prev.map((sec, i) => {
      if (i !== secIdx) return sec;
      const newRow = new Array(sec.tableData.headers.length).fill('-');
      return {
        ...sec,
        tableData: { ...sec.tableData, rows: [...sec.tableData.rows, newRow] }
      };
    }));
  };

  const handleAddTableRowsWithData = (secIdx: number, newRowsData: string[][], autoImageSrc?: string) => {
    if (!newRowsData || newRowsData.length === 0) return;
    updateAndApplySections(prev => prev.map((sec, i) => {
      if (i !== secIdx) return sec;
      const currentRows = sec.tableData?.rows || [];
      const hasOnlyDummyRow = currentRows.length === 1 && currentRows[0].every(cell => !cell || cell === '-' || cell.trim() === '');
      const newRows = hasOnlyDummyRow ? [...newRowsData] : [...currentRows, ...newRowsData];
      return {
        ...sec,
        imageSrc: (!sec.imageSrc && autoImageSrc) ? autoImageSrc : sec.imageSrc,
        tableData: { ...sec.tableData, rows: newRows }
      };
    }));
  };

  const handleDeleteTableRow = (secIdx: number, rIdx: number) => {
    updateAndApplySections(prev => prev.map((sec, i) => {
      if (i !== secIdx || sec.tableData.rows.length <= 1) return sec;
      return {
        ...sec,
        tableData: {
          ...sec.tableData,
          rows: sec.tableData.rows.filter((_, idx) => idx !== rIdx)
        }
      };
    }));
  };

  const handleAddTableColumn = (secIdx: number, paramName: string = 'NEW PARAM') => {
    const cleanParam = paramName.trim().toUpperCase();
    updateAndApplySections(prev => prev.map((sec, i) => {
      if (i !== secIdx) return sec;
      const headers = [...sec.tableData.headers, cleanParam];
      const rows = sec.tableData.rows.map(row => {
        const { matchedProd, matchedVar } = matchProductAndVariantForRow(row, sec);
        let val = '-';
        if (matchedProd) {
          const gen = generateRowFromProduct([cleanParam], matchedProd, matchedVar, categories);
          if (gen && gen[0]) {
            val = gen[0];
          }
        }
        return [...row, val];
      });

      return {
        ...sec,
        tableData: {
          ...sec.tableData,
          headers,
          rows
        }
      };
    }));
  };

  const handleDeleteTableColumn = (secIdx: number, colIdx: number) => {
    updateAndApplySections(prev => prev.map((sec, i) => {
      if (i !== secIdx || sec.tableData.headers.length <= 1) return sec;
      const headers = sec.tableData.headers.filter((_, idx) => idx !== colIdx);
      const rows = sec.tableData.rows.map(row => row.filter((_, idx) => idx !== colIdx));
      return {
        ...sec,
        tableData: {
          ...sec.tableData,
          headers,
          rows
        }
      };
    }));
  };

  const handleMoveColumn = (secIdx: number, colIdx: number, direction: 'left' | 'right') => {
    const targetIdx = direction === 'left' ? colIdx - 1 : colIdx + 1;
    updateAndApplySections(prev => prev.map((sec, i) => {
      if (i !== secIdx) return sec;
      if (targetIdx < 0 || targetIdx >= sec.tableData.headers.length) return sec;
      
      const newHeaders = [...sec.tableData.headers];
      const [movedHdr] = newHeaders.splice(colIdx, 1);
      newHeaders.splice(targetIdx, 0, movedHdr);

      const newRows = sec.tableData.rows.map(row => {
        const newRow = [...row];
        const [movedCell] = newRow.splice(colIdx, 1);
        newRow.splice(targetIdx, 0, movedCell);
        return newRow;
      });

      return {
        ...sec,
        tableData: {
          ...sec.tableData,
          headers: newHeaders,
          rows: newRows
        }
      };
    }));
  };

  const handleFillColumnFromParam = (secIdx: number, colIdx: number, paramKeyOrName: string) => {
    const cleanParam = paramKeyOrName.trim().toUpperCase();
    updateAndApplySections(prev => prev.map((sec, i) => {
      if (i !== secIdx) return sec;
      const newRows = sec.tableData.rows.map(row => {
        const { matchedProd, matchedVar } = matchProductAndVariantForRow(row, sec);
        const newRow = [...row];
        if (matchedProd) {
          const gen = generateRowFromProduct([cleanParam], matchedProd, matchedVar, categories);
          if (gen && gen[0]) {
            newRow[colIdx] = gen[0];
          }
        }
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
    setActiveFillMenu(null);
  };

  const handleMoveTableRow = (secIdx: number, rIdx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? rIdx - 1 : rIdx + 1;
    updateAndApplySections(prev => prev.map((sec, i) => {
      if (i !== secIdx) return sec;
      if (targetIdx < 0 || targetIdx >= sec.tableData.rows.length) return sec;
      const newRows = [...sec.tableData.rows];
      const [movedRow] = newRows.splice(rIdx, 1);
      newRows.splice(targetIdx, 0, movedRow);
      return {
        ...sec,
        tableData: { ...sec.tableData, rows: newRows }
      };
    }));
  };

  const handleDuplicateTableRow = (secIdx: number, rIdx: number) => {
    updateAndApplySections(prev => prev.map((sec, i) => {
      if (i !== secIdx) return sec;
      const targetRow = sec.tableData.rows[rIdx];
      if (!targetRow) return sec;
      const newRows = [...sec.tableData.rows];
      newRows.splice(rIdx + 1, 0, [...targetRow]);
      return {
        ...sec,
        tableData: { ...sec.tableData, rows: newRows }
      };
    }));
  };

  const handleFillRowWithProduct = (secIdx: number, rIdx: number, prod: Product, variant?: ProductVariant) => {
    updateAndApplySections(prev => {
      const copy = [...prev];
      const targetSec = copy[secIdx];
      if (!targetSec) return copy;

      const headers = targetSec.tableData?.headers || ['MODEL NO', 'PRODUCTS', 'PRICE'];
      const generatedRow = generateRowFromProduct(headers, prod, variant, categories);

      const newRows = [...targetSec.tableData.rows];
      newRows[rIdx] = generatedRow;

      copy[secIdx] = {
        ...targetSec,
        imageSrc: !targetSec.imageSrc && (variant?.image || prod.image) ? (variant?.image || prod.image || '') : targetSec.imageSrc,
        tableData: {
          ...targetSec.tableData,
          rows: newRows
        }
      };
      return copy;
    });
    setLinkRowModal(null);
  };

  const handleUpdateTableStyle = (secIdx: number, styleUpdates: Partial<TableData>) => {
    updateAndApplySections(prev => prev.map((sec, i) => {
      if (i !== secIdx) return sec;
      return {
        ...sec,
        tableData: {
          ...sec.tableData,
          ...styleUpdates
        }
      };
    }));
  };

  const isRowMatchedToProduct = (row: string[]): boolean => {
    if (!products || products.length === 0) return false;
    const rowSku = (row[0] || '').trim().toLowerCase();
    const rowName = (row[1] || '').trim().toLowerCase();
    if (!rowSku && !rowName) return false;
    return products.some(p =>
      (p.sku && p.sku.toLowerCase() === rowSku) ||
      (p.name && p.name.toLowerCase() === rowName) ||
      p.variants?.some(v => (v.sku && v.sku.toLowerCase() === rowSku) || (v.name && v.name.toLowerCase() === rowName))
    );
  };

  return {
    activeFillMenu,
    setActiveFillMenu,
    openStyleSecIdx,
    setOpenStyleSecIdx,
    linkRowModal,
    setLinkRowModal,
    linkRowSearch,
    setLinkRowSearch,
    linkRowCategory,
    setLinkRowCategory,
    availableProductFields,
    matchProductAndVariantForRow,
    handleCellChange,
    handleHeaderChange,
    handleAddTableRow,
    handleAddTableRowsWithData,
    handleDeleteTableRow,
    handleAddTableColumn,
    handleDeleteTableColumn,
    handleMoveColumn,
    handleFillColumnFromParam,
    handleMoveTableRow,
    handleDuplicateTableRow,
    handleFillRowWithProduct,
    handleUpdateTableStyle,
    isRowMatchedToProduct
  };
}
