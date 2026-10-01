import { Rect, Textbox, Line, Circle, Group } from 'fabric';
import { CanvasElement } from '../../../types';

export function renderTableElement(el: CanvasElement): Group {
  const td = el.tableData || {
    headers: ['MODEL NO', 'PRODUCTS', 'CUT-OUT', 'COLOR', 'DEALER PRICE', 'PACKING PER BOX'],
    rows: [
      ['VT-17012', '12W HONEY COMB SERIES COB', '75MM', 'W, W.W, N.W', '800', '20 PCS'],
      ['VT-17018', '18W HONEY COMB SERIES COB', '95MM', 'W, W.W, N.W', '1,000', '20 PCS'],
      ['VT-17024', '24W HONEY COMB SERIES COB', '115MM', 'W, W.W, N.W', '1,200', '20 PCS']
    ]
  };

  const is3GridTable = Boolean(
    el.sectionTag ||
    el.id?.includes('sec-table') ||
    el.id?.includes('product-table') ||
    el.id?.includes('grid-sec') ||
    (el as any).isGridTable ||
    td.variant === 'grid-spec' ||
    (!el.groupId && td.headers?.some(h => {
      const up = String(h || '').toUpperCase();
      return up.includes('MODEL') || up.includes('PRODUCT') || up.includes('CUT-OUT') || up.includes('CUT OUT') || up.includes('DEALER');
    }))
  );

  const formatHeaderForDisplay = (h: any): string => {
    const s = String(h ?? '').trim();
    if (!is3GridTable) return s.toUpperCase();
    const up = s.toUpperCase();
    if (up === 'DEALER PRICE') return 'DEALER\nPRICE';
    if (up === 'PACKING PER BOX' || up === 'PACKING PERBOX' || up === 'PACKING/BOX') return 'PACKING\nPER BOX';
    if (up === 'PACKING BOX') return 'PACKING\nBOX';
    if (up === 'CUT OUT' || up === 'CUTOUT') return 'CUT-OUT';
    if (up === 'MODEL NUMBER') return 'MODEL\nNUMBER';
    return up;
  };

  const headerBg = td.headerBg || (is3GridTable ? '#002838' : '#334155');
  const headerTextColor = td.headerTextColor || '#ffffff';
  const rowBg = td.rowBg || '#ffffff';
  const alternateRowBg = is3GridTable ? (td.rowBg || '#ffffff') : (td.alternateRowBg || '#f8fafc');
  const borderColor = td.borderColor || (is3GridTable ? '#002838' : '#cbd5e1');
  const cellPadding = td.cellPadding !== undefined ? td.cellPadding : (is3GridTable ? 4 : 6);

  const numCols = Math.max(1, td.headers?.length || 1);
  const numRows = Math.max(1, td.rows?.length || 1);

  // Dynamic header font size (crisp, bold, condensed font Bebas Neue or Montserrat)
  const dynamicHeaderFontSize = td.headerFontSize !== undefined && td.headerFontSize > 0
    ? td.headerFontSize
    : (td.fontSize !== undefined && td.fontSize > 0
      ? (td.fontSize + (is3GridTable ? 1 : 1))
      : (is3GridTable
        ? (numCols >= 8 ? 9 : (numCols >= 6 ? 10 : Math.max(10.5, Math.min(12, el.width / (numCols * 5.5)))))
        : (numCols > 6 ? Math.max(8.0, Math.min(9.0, el.width / (numCols * 7.5))) : 9.5)
      )
    );

  const dynamicBodyFontSize = td.fontSize !== undefined && td.fontSize > 0
    ? td.fontSize
    : (is3GridTable
      ? (numCols >= 8 ? 7.5 : (numCols >= 6 ? 8.2 : Math.max(8.5, Math.min(9.5, el.width / (numCols * 7.0)))))
      : (numCols > 6 ? Math.max(7.5, Math.min(8.5, el.width / (numCols * 8.0))) : 8.5)
    );

  // Helper 2D canvas context for exact text measurement matching browser and Fabric font rendering
  const measureCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
  const measureCtx = measureCanvas ? measureCanvas.getContext('2d') : null;

  // Dynamic Text Line Estimation for accurate row height and padding
  const estimateTextLines = (text: any, colW: number, fSize: number, isHeader: boolean = false): number => {
    if (text === undefined || text === null) return 1;
    const clean = String(text).trim();
    if (!clean) return 1;

    const explicitLines = clean.split('\n');
    let totalLines = 0;
    const usableWidth = Math.max(10, colW - cellPadding * 2);

    const fFamily = isHeader && is3GridTable
      ? 'Bebas Neue, Oswald, sans-serif'
      : (td.fontFamily || 'Inter, Arial, sans-serif');
    const fWeight = isHeader
      ? (is3GridTable ? 'bold' : (td.headerFontWeight || '900'))
      : (td.fontWeight || '500');

    if (measureCtx) {
      measureCtx.font = `${fWeight} ${fSize}px ${fFamily}`;
    }

    explicitLines.forEach(expLine => {
      const lineStr = expLine.trim();
      if (!lineStr) {
        totalLines += 1;
        return;
      }

      if (measureCtx) {
        const words = lineStr.split(/\s+/);
        let currentLine = '';
        let subLines = 1;

        for (let i = 0; i < words.length; i++) {
          const word = words[i];
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const testWidth = measureCtx.measureText(testLine).width;

          if (testWidth > usableWidth && currentLine !== '') {
            subLines++;
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        totalLines += subLines;
      } else {
        const hasUpper = lineStr === lineStr.toUpperCase();
        const avgCharWidth = fSize * (isHeader && is3GridTable ? 0.38 : (hasUpper ? 0.62 : 0.52));
        const charsPerLine = Math.max(3, Math.floor(usableWidth / avgCharWidth));
        const words = lineStr.split(/\s+/);
        let curLineLen = 0;
        let subLines = 1;

        words.forEach(word => {
          if (word.length > charsPerLine) {
            if (curLineLen > 0) {
              subLines++;
              curLineLen = 0;
            }
            subLines += Math.ceil(word.length / charsPerLine) - 1;
            curLineLen = word.length % charsPerLine || charsPerLine;
          } else if (curLineLen > 0 && (curLineLen + 1 + word.length) > charsPerLine) {
            subLines++;
            curLineLen = word.length;
          } else {
            curLineLen += (curLineLen === 0 ? 0 : 1) + word.length;
          }
        });
        totalLines += subLines;
      }
    });

    return Math.max(1, totalLines);
  };

  // Calculate column widths
  const colWidths: number[] = [];
  if (is3GridTable) {
    // Smart proportional column weights for 3-Grid Specification Tables
    const prodWeight = numCols >= 8 ? 2.2 : (numCols >= 6 ? 2.6 : 3.4);
    const weights = (td.headers || []).map((h) => {
      const lower = String(h || '').toLowerCase().trim();
      if (lower.includes('product') || lower.includes('name') || lower.includes('desc') || lower.includes('title') || lower.includes('item')) return prodWeight;
      if (lower.includes('model') || lower.includes('code') || lower.includes('sku')) return 1.35;
      if (lower.includes('cut') || lower.includes('dim') || lower.includes('size')) return 1.15;
      if (lower.includes('color') || lower.includes('cct') || lower.includes('temp')) return 1.25;
      if (lower.includes('dealer') || lower.includes('price') || lower.includes('mrp') || lower.includes('rate') || lower.includes('cost')) return 1.1;
      if (lower.includes('pack') || lower.includes('box') || lower.includes('qty')) return 1.25;
      return 1.0;
    });
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    weights.forEach(w => colWidths.push((w / totalWeight) * el.width));
  } else if (td.colWidths && td.colWidths.length === numCols) {
    const totalRel = td.colWidths.reduce((a, b) => a + b, 0);
    td.colWidths.forEach(w => colWidths.push((w / totalRel) * el.width));
  } else {
    const evenW = el.width / numCols;
    for (let i = 0; i < numCols; i++) colWidths.push(evenW);
  }

  // Dynamic Header Row Height (snug fit around text + cellPadding)
  let maxHeaderLines = 1;
  (td.headers || []).forEach((headerText, colIdx) => {
    const colW = colWidths[colIdx] || (el.width / numCols);
    const hStr = formatHeaderForDisplay(headerText);
    const l = estimateTextLines(hStr, colW, dynamicHeaderFontSize, true);
    if (l > maxHeaderLines) maxHeaderLines = l;
  });
  const headerTextTotalH = maxHeaderLines * dynamicHeaderFontSize * (maxHeaderLines > 1 ? 1.1 : 1.0);
  const headerRowHeight = Math.max(18, Math.round(headerTextTotalH + cellPadding * 2 + (maxHeaderLines > 1 ? 2 : 0)));

  // Dynamic Row Heights based on cell text content & line wrapping (snug fit, no excess empty gap)
  const rowHeights: number[] = (td.rows || []).map((row) => {
    let maxLinesInRow = 1;
    (row || []).forEach((cellText: any, colIdx: number) => {
      const colW = colWidths[colIdx] || (el.width / numCols);
      const cellStr = cellText !== undefined && cellText !== null ? String(cellText) : '';
      const l = estimateTextLines(cellStr, colW, dynamicBodyFontSize, false);
      if (l > maxLinesInRow) maxLinesInRow = l;
    });
    const textBlockH = maxLinesInRow * dynamicBodyFontSize * 1.15;
    const minRowH = is3GridTable ? 20 : 22;
    return Math.max(minRowH, Math.round(textBlockH + cellPadding * 2 + (maxLinesInRow > 1 ? 4 : 2)));
  });

  const totalRenderedH = headerRowHeight + rowHeights.reduce((sum, h) => sum + h, 0);

  const tableObjs: any[] = [];

  // 1. Table Outer Frame & Header Background
  const headerRect = new Rect({
    left: 0,
    top: 0,
    width: el.width,
    height: headerRowHeight,
    fill: headerBg,
    originX: 'left',
    originY: 'top',
  });
  tableObjs.push(headerRect);

  // 2. Render Headers
  let currentX = 0;
  td.headers.forEach((headerText, colIdx) => {
    const colW = colWidths[colIdx];
    const hStr = formatHeaderForDisplay(headerText);
    if (hStr.trim() !== '') {
      const lineCount = estimateTextLines(hStr, colW, dynamicHeaderFontSize, true);
      const textHeight = lineCount * dynamicHeaderFontSize * (lineCount > 1 ? 1.05 : 1.0);
      const vOffsetHeader = Math.max(cellPadding, (headerRowHeight - textHeight) / 2);

      const headerTb = new Textbox(hStr, {
        left: currentX + cellPadding,
        top: vOffsetHeader,
        width: Math.max(10, colW - cellPadding * 2),
        originX: 'left',
        originY: 'top',
        fontSize: dynamicHeaderFontSize,
        fontFamily: is3GridTable ? 'Bebas Neue, Oswald, sans-serif' : (td.fontFamily || 'Montserrat'),
        fontWeight: is3GridTable ? 'normal' : (td.headerFontWeight || (td.fontWeight === 'normal' ? '600' : '900')),
        fontStyle: td.fontStyle || 'normal',
        underline: td.textDecoration?.includes('underline'),
        fill: headerTextColor,
        textAlign: 'center',
        splitByGrapheme: false,
        lineHeight: 1.05,
        charSpacing: 0,
        objectCaching: false,
      });
      tableObjs.push(headerTb);
    }

    // Header vertical border (pure white crisp divider in 3-grid headers!)
    if (colIdx < numCols - 1) {
      const headerDividerColor = is3GridTable ? '#ffffff' : borderColor;
      tableObjs.push(new Line([currentX + colW, 0, currentX + colW, headerRowHeight], {
        stroke: headerDividerColor,
        strokeWidth: is3GridTable ? 1.2 : 1,
        originX: 'left',
        originY: 'top',
        objectCaching: false,
      }));
    }

    currentX += colW;
  });

  // 3. Render Body Rows
  let curY = headerRowHeight;
  (td.rows || []).forEach((row, rowIdx) => {
    const rHeight = rowHeights[rowIdx] || 24;
    const bg = rowIdx % 2 === 1 ? alternateRowBg : rowBg;

    // Row Background
    tableObjs.push(new Rect({
      left: 0,
      top: curY,
      width: el.width,
      height: rHeight,
      fill: bg,
      originX: 'left',
      originY: 'top',
      objectCaching: false,
    }));

    let cellX = 0;
    (row || []).forEach((cellText: any, colIdx: number) => {
      const colW = colWidths[colIdx];
      const cellStr = cellText !== undefined && cellText !== null ? String(cellText) : '';
      if (cellStr.trim() !== '') {
        const cellLines = estimateTextLines(cellStr, colW, dynamicBodyFontSize, false);
        const cellTextHeight = cellLines * dynamicBodyFontSize * (cellLines > 1 ? 1.1 : 1.0);
        const vOffsetBody = Math.max(cellPadding, (rHeight - cellTextHeight) / 2);

        const cellTb = new Textbox(cellStr, {
          left: cellX + cellPadding,
          top: curY + vOffsetBody,
          width: Math.max(10, colW - cellPadding * 2),
          originX: 'left',
          originY: 'top',
          fontSize: dynamicBodyFontSize,
          fontFamily: td.fontFamily || 'Inter, Arial, sans-serif',
          fontWeight: is3GridTable ? (colIdx === 0 ? '600' : '400') : (td.fontWeight || (colIdx === 0 ? '700' : '500')),
          fontStyle: td.fontStyle || 'normal',
          underline: td.textDecoration?.includes('underline'),
          fill: td.textColor || (is3GridTable ? '#002838' : '#0f172a'),
          textAlign: 'center',
          splitByGrapheme: false,
          lineHeight: 1.15,
          objectCaching: false,
        });
        tableObjs.push(cellTb);
      }

      // Vertical cell divider
      if (colIdx < numCols - 1) {
        tableObjs.push(new Line([cellX + colW, curY, cellX + colW, curY + rHeight], {
          stroke: borderColor,
          strokeWidth: is3GridTable ? 1.0 : 0.8,
          originX: 'left',
          originY: 'top',
          objectCaching: false,
        }));
      }

      cellX += colW;
    });

    // Horizontal Row Border at top of this row
    tableObjs.push(new Line([0, curY, el.width, curY], {
      stroke: borderColor,
      strokeWidth: 1.0,
      originX: 'left',
      originY: 'top',
      objectCaching: false,
    }));

    curY += rHeight;
  });

  // Outer table border
  tableObjs.push(new Rect({
    left: 0,
    top: 0,
    width: el.width,
    height: totalRenderedH,
    fill: 'transparent',
    stroke: borderColor,
    strokeWidth: is3GridTable ? 1.5 : 1.2,
    originX: 'left',
    originY: 'top',
    objectCaching: false,
  }));

  const tableGroup = new Group(tableObjs, {
    left: el.x,
    top: el.y,
    angle: el.rotation || 0,
    width: el.width,
    height: totalRenderedH,
    originX: 'left',
    originY: 'top',
    opacity: el.opacity ?? 1,
    objectCaching: false,
    subTargetCheck: true,
  });

  (tableGroup as any).id = el.id;
  (tableGroup as any)._rendererVersion = 4;
  (tableGroup as any)._tableDataJSON = JSON.stringify(el.tableData || {});
  return tableGroup;
}

export function renderChecklistElement(el: CanvasElement): Group {
  const data = el.checklistData || {
    themeId: 'customer-feedback-checklist',
    title: 'Checklist',
    rows: [
      { id: 'r1', text: 'Task 1', checked: false },
      { id: 'r2', text: 'Task 2', checked: true },
    ],
  };

  const themeId = data.themeId || 'customer-feedback-checklist';
  const rows = data.rows || [];
  const checklistObjs: any[] = [];
  const w = el.width || 380;
  const baseFontSize = data.fontSize || 11;
  const textColor = data.textColor || '#334155';

  if (themeId === 'customer-feedback-checklist') {
    const rowHeight = 44;
    const totalH = Math.max(el.height || 180, rows.length * rowHeight);

    // Outer Box
    checklistObjs.push(new Rect({
      left: 0,
      top: 0,
      width: w,
      height: totalH,
      rx: 4,
      ry: 4,
      fill: data.cardBg || '#FFFFFF',
      stroke: data.borderColor || '#CBD5E1',
      strokeWidth: 1.5,
      originX: 'left',
      originY: 'top',
      objectCaching: false,
    }));

    // Vertical divider between check column and text
    checklistObjs.push(new Line([48, 0, 48, totalH], {
      stroke: '#F1F5F9',
      strokeWidth: 1,
      originX: 'left',
      originY: 'top',
      objectCaching: false,
    }));

    rows.forEach((row, i) => {
      const rowY = i * rowHeight;

      // Row divider
      if (i > 0) {
        checklistObjs.push(new Line([0, rowY, w, rowY], {
          stroke: '#E2E8F0',
          strokeWidth: 1,
          originX: 'left',
          originY: 'top',
          objectCaching: false,
        }));
      }

      // Checkbox circle
      if (row.checked) {
        checklistObjs.push(new Circle({
          left: 24,
          top: rowY + 22,
          radius: 7.5,
          fill: '#E2E8F0',
          originX: 'center',
          originY: 'center',
          objectCaching: false,
        }));
        checklistObjs.push(new Textbox('✓', {
          left: 24,
          top: rowY + 22,
          fontSize: 11,
          fontWeight: 'bold',
          fill: '#475569',
          originX: 'center',
          originY: 'center',
          fontFamily: 'Inter, sans-serif',
          objectCaching: false,
        }));
      } else {
        checklistObjs.push(new Circle({
          left: 24,
          top: rowY + 22,
          radius: 7,
          fill: '#CBD5E1',
          originX: 'center',
          originY: 'center',
          objectCaching: false,
        }));
      }

      // Task text
      checklistObjs.push(new Textbox(String(row.text || ''), {
        left: 56,
        top: rowY + 14,
        width: w - 70,
        fontSize: baseFontSize,
        fontFamily: 'Inter, sans-serif',
        fontWeight: '500',
        fill: textColor,
        originX: 'left',
        originY: 'top',
        objectCaching: false,
      }));
    });

  } else if (themeId === 'lesson-planning-checklist') {
    let curY = 10;

    // Title
    checklistObjs.push(new Textbox(String(data.title || 'Lesson Planning Checklist'), {
      left: w / 2,
      top: curY,
      width: w - 20,
      fontSize: 16,
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: '900',
      fill: '#0F172A',
      textAlign: 'center',
      originX: 'center',
      originY: 'top',
      objectCaching: false,
    }));
    curY += 36;

    rows.forEach((row) => {
      const rowH = 38;
      const boxColor = row.checked ? (data.checkboxColor || '#A7DCD7') : '#BCE3DF';

      // Square Checkbox
      checklistObjs.push(new Rect({
        left: 25,
        top: curY + 2,
        width: 18,
        height: 18,
        rx: 3,
        ry: 3,
        fill: boxColor,
        originX: 'left',
        originY: 'top',
        objectCaching: false,
      }));

      if (row.checked) {
        checklistObjs.push(new Textbox('✓', {
          left: 34,
          top: curY + 11,
          fontSize: 12,
          fontWeight: '900',
          fill: '#2D6A65',
          originX: 'center',
          originY: 'center',
          fontFamily: 'Inter, sans-serif',
          objectCaching: false,
        }));
      }

      // Task text
      checklistObjs.push(new Textbox(String(row.text || ''), {
        left: 56,
        top: curY + 3,
        width: w - 70,
        fontSize: baseFontSize,
        fontFamily: 'Inter, sans-serif',
        fontWeight: '500',
        fill: textColor,
        originX: 'left',
        originY: 'top',
        objectCaching: false,
      }));

      curY += rowH;
    });

  } else if (themeId === 'employee-development-progress') {
    const headerH = 34;
    const rowHeight = 46;
    const totalH = headerH + rows.length * rowHeight;
    const colSplit = w - 90;

    // Header Bar
    checklistObjs.push(new Rect({
      left: 0,
      top: 0,
      width: w,
      height: headerH,
      rx: 2,
      ry: 2,
      fill: data.headerBg || '#132B50',
      originX: 'left',
      originY: 'top',
      objectCaching: false,
    }));

    // Header Title
    checklistObjs.push(new Textbox(String(data.title || 'Employee Development Progress'), {
      left: 14,
      top: 9,
      width: colSplit - 20,
      fontSize: 12,
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: '800',
      fill: data.headerTextColor || '#FFFFFF',
      originX: 'left',
      originY: 'top',
      objectCaching: false,
    }));

    // Header Column "Done"
    checklistObjs.push(new Textbox('Done', {
      left: colSplit + 45,
      top: 9,
      width: 80,
      fontSize: 12,
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: '800',
      fill: data.headerTextColor || '#FFFFFF',
      textAlign: 'center',
      originX: 'center',
      originY: 'top',
      objectCaching: false,
    }));

    // Outer Body Box
    checklistObjs.push(new Rect({
      left: 0,
      top: headerH,
      width: w,
      height: rows.length * rowHeight,
      fill: data.cardBg || '#FFFFFF',
      stroke: data.borderColor || '#CBD5E1',
      strokeWidth: 1.2,
      originX: 'left',
      originY: 'top',
      objectCaching: false,
    }));

    // Vertical Column Divider in body
    checklistObjs.push(new Line([colSplit, headerH, colSplit, totalH], {
      stroke: '#CBD5E1',
      strokeWidth: 1.2,
      originX: 'left',
      originY: 'top',
      objectCaching: false,
    }));

    rows.forEach((row, i) => {
      const rowY = headerH + i * rowHeight;

      if (i > 0) {
        checklistObjs.push(new Line([0, rowY, w, rowY], {
          stroke: '#E2E8F0',
          strokeWidth: 1,
          originX: 'left',
          originY: 'top',
          objectCaching: false,
        }));
      }

      // Text
      checklistObjs.push(new Textbox(String(row.text || ''), {
        left: 14,
        top: rowY + 14,
        width: colSplit - 28,
        fontSize: baseFontSize,
        fontFamily: 'Inter, sans-serif',
        fontWeight: '600',
        fill: textColor,
        originX: 'left',
        originY: 'top',
        objectCaching: false,
      }));

      // Circular Done Badge
      checklistObjs.push(new Circle({
        left: colSplit + 45,
        top: rowY + 23,
        radius: 10,
        fill: data.checkboxColor || '#1B3A68',
        originX: 'center',
        originY: 'center',
        objectCaching: false,
      }));

      if (row.checked) {
        checklistObjs.push(new Textbox('✓', {
          left: colSplit + 45,
          top: rowY + 23,
          fontSize: 12,
          fontWeight: 'bold',
          fill: '#FFFFFF',
          originX: 'center',
          originY: 'center',
          fontFamily: 'Inter, sans-serif',
          objectCaching: false,
        }));
      }
    });

  } else if (themeId === 'recruitment-hiring-checklist') {
    let curY = 8;

    // Title
    checklistObjs.push(new Textbox(String(data.title || 'Recruitment & Hiring To-Do Checklist'), {
      left: w / 2,
      top: curY,
      width: w - 20,
      fontSize: 15,
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: '900',
      fill: '#0F172A',
      textAlign: 'center',
      originX: 'center',
      originY: 'top',
      objectCaching: false,
    }));
    curY += 36;

    rows.forEach((row) => {
      const rowH = 38;

      // Circle outline
      checklistObjs.push(new Circle({
        left: 34,
        top: curY + 10,
        radius: 8,
        fill: '#FFFFFF',
        stroke: data.checkboxColor || '#334155',
        strokeWidth: 1.5,
        originX: 'center',
        originY: 'center',
        objectCaching: false,
      }));

      if (row.checked) {
        checklistObjs.push(new Textbox('✓', {
          left: 34,
          top: curY + 10,
          fontSize: 11,
          fontWeight: 'bold',
          fill: data.checkboxColor || '#334155',
          originX: 'center',
          originY: 'center',
          fontFamily: 'Inter, sans-serif',
          objectCaching: false,
        }));
      }

      // Text
      checklistObjs.push(new Textbox(String(row.text || ''), {
        left: 56,
        top: curY + 2,
        width: w - 70,
        fontSize: baseFontSize,
        fontFamily: 'Inter, sans-serif',
        fontWeight: '500',
        fill: textColor,
        originX: 'left',
        originY: 'top',
        objectCaching: false,
      }));

      curY += rowH;
    });

  } else if (themeId === 'color-band-process-checklist') {
    let curY = 0;
    const sections = data.sections || [
      { id: 's1', title: 'Feedback and Development', color: '#38BDF8' },
      { id: 's2', title: 'Future Planning and Goal Setting', color: '#2DD4BF' },
      { id: 's3', title: 'Open Discussion and Wrap-up', color: '#84CC16' },
    ];

    sections.forEach((sec) => {
      const secRows = rows.filter(r => r.section === sec.id || (!r.section && sec.id === sections[0].id));
      const secRowsH = Math.max(38, (secRows.length || 1) * 22 + 8);

      // Color Header Band
      checklistObjs.push(new Rect({
        left: 0,
        top: curY,
        width: w,
        height: 18,
        rx: 2,
        ry: 2,
        fill: sec.color,
        originX: 'left',
        originY: 'top',
        objectCaching: false,
      }));

      // Header Title
      checklistObjs.push(new Textbox(String(sec.title), {
        left: 10,
        top: curY + 3,
        width: w - 20,
        fontSize: 9,
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: '800',
        fill: '#0F172A',
        originX: 'left',
        originY: 'top',
        objectCaching: false,
      }));
      curY += 18;

      // Content Box
      checklistObjs.push(new Rect({
        left: 0,
        top: curY,
        width: w,
        height: secRowsH,
        fill: '#FFFFFF',
        stroke: '#E2E8F0',
        strokeWidth: 1,
        originX: 'left',
        originY: 'top',
        objectCaching: false,
      }));

      secRows.forEach((row, rIdx) => {
        const itemY = curY + 5 + rIdx * 20;

        // Square Checkbox
        checklistObjs.push(new Rect({
          left: 14,
          top: itemY,
          width: 10,
          height: 10,
          rx: 1,
          ry: 1,
          fill: 'none',
          stroke: '#64748B',
          strokeWidth: 1,
          originX: 'left',
          originY: 'top',
          objectCaching: false,
        }));

        if (row.checked) {
          checklistObjs.push(new Textbox('✓', {
            left: 19,
            top: itemY + 5,
            fontSize: 8,
            fontWeight: '900',
            fill: '#0F172A',
            originX: 'center',
            originY: 'center',
            fontFamily: 'Inter, sans-serif',
            objectCaching: false,
          }));
        }

        // Text
        checklistObjs.push(new Textbox(String(row.text || ''), {
          left: 32,
          top: itemY,
          width: w - 45,
          fontSize: baseFontSize,
          fontFamily: 'Inter, sans-serif',
          fontWeight: '500',
          fill: textColor,
          originX: 'left',
          originY: 'top',
          objectCaching: false,
        }));
      });

      curY += secRowsH + 6;
    });

  } else if (themeId === 'goals-matrix-checklist') {
    const headerH = 28;
    const rowH = 32;
    const totalH = headerH + rows.length * rowH;
    const col1Split = w - 160;
    const col2Split = w - 80;

    // Header Row
    checklistObjs.push(new Rect({
      left: 0,
      top: 0,
      width: w,
      height: headerH,
      fill: data.headerBg || '#BDD3F5',
      stroke: data.borderColor || '#93B4E4',
      strokeWidth: 1,
      originX: 'left',
      originY: 'top',
      objectCaching: false,
    }));

    // Title "Goals"
    checklistObjs.push(new Textbox(String(data.title || 'Goals'), {
      left: 12,
      top: 7,
      width: col1Split - 20,
      fontSize: 11,
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: '900',
      fill: data.headerTextColor || '#0F172A',
      originX: 'left',
      originY: 'top',
      objectCaching: false,
    }));

    // Col 1 Header "In Progress"
    checklistObjs.push(new Textbox('In Progress', {
      left: col1Split + 40,
      top: 7,
      width: 75,
      fontSize: 10,
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: '800',
      fill: data.headerTextColor || '#0F172A',
      textAlign: 'center',
      originX: 'center',
      originY: 'top',
      objectCaching: false,
    }));

    // Col 2 Header "Completed"
    checklistObjs.push(new Textbox('Completed', {
      left: col2Split + 40,
      top: 7,
      width: 75,
      fontSize: 10,
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: '800',
      fill: data.headerTextColor || '#0F172A',
      textAlign: 'center',
      originX: 'center',
      originY: 'top',
      objectCaching: false,
    }));

    // Outer Body Box
    checklistObjs.push(new Rect({
      left: 0,
      top: headerH,
      width: w,
      height: rows.length * rowH,
      fill: data.cardBg || '#FFFFFF',
      stroke: data.borderColor || '#93B4E4',
      strokeWidth: 1,
      originX: 'left',
      originY: 'top',
      objectCaching: false,
    }));

    // Vertical Grid Lines
    checklistObjs.push(new Line([col1Split, 0, col1Split, totalH], {
      stroke: data.borderColor || '#93B4E4',
      strokeWidth: 1,
      originX: 'left',
      originY: 'top',
      objectCaching: false,
    }));

    checklistObjs.push(new Line([col2Split, 0, col2Split, totalH], {
      stroke: data.borderColor || '#93B4E4',
      strokeWidth: 1,
      originX: 'left',
      originY: 'top',
      objectCaching: false,
    }));

    rows.forEach((row, i) => {
      const rowY = headerH + i * rowH;

      if (i > 0) {
        checklistObjs.push(new Line([0, rowY, w, rowY], {
          stroke: '#E2E8F0',
          strokeWidth: 1,
          originX: 'left',
          originY: 'top',
          objectCaching: false,
        }));
      }

      // Text
      checklistObjs.push(new Textbox(String(row.text || ''), {
        left: 12,
        top: rowY + 9,
        width: col1Split - 20,
        fontSize: baseFontSize,
        fontFamily: 'Inter, sans-serif',
        fontWeight: '600',
        fill: textColor,
        originX: 'left',
        originY: 'top',
        objectCaching: false,
      }));

      // Checkbox In Progress
      const inProgressChecked = Boolean(row.columnValues?.['In Progress']);
      checklistObjs.push(new Rect({
        left: col1Split + 32,
        top: rowY + 8,
        width: 16,
        height: 16,
        rx: 4,
        ry: 4,
        fill: inProgressChecked ? '#93B4E4' : 'none',
        stroke: '#64748B',
        strokeWidth: 1.2,
        originX: 'left',
        originY: 'top',
        objectCaching: false,
      }));
      if (inProgressChecked) {
        checklistObjs.push(new Textbox('✓', {
          left: col1Split + 40,
          top: rowY + 16,
          fontSize: 10,
          fontWeight: 'bold',
          fill: '#FFFFFF',
          originX: 'center',
          originY: 'center',
          fontFamily: 'Inter, sans-serif',
          objectCaching: false,
        }));
      }

      // Checkbox Completed
      const completedChecked = Boolean(row.columnValues?.['Completed'] || row.checked);
      checklistObjs.push(new Rect({
        left: col2Split + 32,
        top: rowY + 8,
        width: 16,
        height: 16,
        rx: 4,
        ry: 4,
        fill: completedChecked ? '#93B4E4' : 'none',
        stroke: '#64748B',
        strokeWidth: 1.2,
        originX: 'left',
        originY: 'top',
        objectCaching: false,
      }));
      if (completedChecked) {
        checklistObjs.push(new Textbox('✓', {
          left: col2Split + 40,
          top: rowY + 16,
          fontSize: 10,
          fontWeight: 'bold',
          fill: '#FFFFFF',
          originX: 'center',
          originY: 'center',
          fontFamily: 'Inter, sans-serif',
          objectCaching: false,
        }));
      }
    });

  } else {
    // Default: Task list with Amber/Gold Banner & Alternating rows
    const headerH = 28;
    const rowH = 28;
    let curY = 6;

    // Header Banner
    checklistObjs.push(new Rect({
      left: 25,
      top: curY,
      width: w - 50,
      height: headerH,
      rx: 2,
      ry: 2,
      fill: data.headerBg || '#E58E26',
      originX: 'left',
      originY: 'top',
      objectCaching: false,
    }));

    // Header Title
    checklistObjs.push(new Textbox(String(data.title || 'Task List:'), {
      left: w / 2,
      top: curY + 6,
      width: w - 70,
      fontSize: 14,
      fontFamily: 'Montserrat, sans-serif',
      fontWeight: '900',
      fill: data.headerTextColor || '#1C1917',
      textAlign: 'center',
      originX: 'center',
      originY: 'top',
      objectCaching: false,
    }));
    curY += headerH + 6;

    rows.forEach((row, i) => {
      const isAlternate = i % 2 === 1;

      if (isAlternate) {
        checklistObjs.push(new Rect({
          left: 25,
          top: curY,
          width: w - 50,
          height: rowH - 4,
          rx: 2,
          ry: 2,
          fill: data.alternateRowBg || '#FFE8CC',
          originX: 'left',
          originY: 'top',
          objectCaching: false,
        }));
      }

      // Square Checkbox
      checklistObjs.push(new Rect({
        left: 42,
        top: curY + 4,
        width: 14,
        height: 14,
        rx: 2.5,
        ry: 2.5,
        fill: '#FFFFFF',
        stroke: '#94A3B8',
        strokeWidth: 1.3,
        originX: 'left',
        originY: 'top',
        objectCaching: false,
      }));

      if (row.checked) {
        checklistObjs.push(new Textbox('✓', {
          left: 49,
          top: curY + 11,
          fontSize: 10,
          fontWeight: 'bold',
          fill: '#1C1917',
          originX: 'center',
          originY: 'center',
          fontFamily: 'Inter, sans-serif',
          objectCaching: false,
        }));
      }

      // Text
      checklistObjs.push(new Textbox(String(row.text || ''), {
        left: 64,
        top: curY + 4,
        width: w - 120,
        fontSize: baseFontSize,
        fontFamily: 'Inter, sans-serif',
        fontWeight: '500',
        fill: textColor,
        originX: 'left',
        originY: 'top',
        objectCaching: false,
      }));

      curY += rowH;
    });
  }

  const calculatedHeight = Math.max(el.height || 180, (checklistObjs[checklistObjs.length - 1]?.top || 0) + 40);

  const checklistGroup = new Group(checklistObjs, {
    left: el.x,
    top: el.y,
    angle: el.rotation || 0,
    width: el.width,
    height: calculatedHeight,
    originX: 'left',
    originY: 'top',
    opacity: el.opacity ?? 1,
    objectCaching: false,
    subTargetCheck: true,
  });

  (checklistGroup as any).id = el.id;
  (checklistGroup as any)._checklistDataJSON = JSON.stringify(data);
  return checklistGroup;
}
