import { Rect, Textbox, Image as FabricImage, Group, Line, Gradient } from 'fabric';
import { CanvasElement, Product, Catalog } from '../../../types';
import { useStore } from '../../../store/useStore';
import { resolveFieldLabel } from '../../../utils/fieldUtils';
import { normalizeImageUrl } from '../../../utils/imageUtils';
import { getCachedImageElement, isDarkColor } from './shapes';
import { measureWrappedTextHeight, estimateTextWidth } from './textEffects';

export async function renderProductBlock(
  el: CanvasElement,
  products: Product[],
  catalog?: Catalog,
): Promise<Group> {
  const objs: any[] = [];

  const theme = (el as any).cardTheme || (el as any).productData?.cardTheme || 'classic-stack';
  const cardFill = el.fill || (theme === 'editorial-overlay' ? '#0f172a' : '#ffffff');
  const cardStroke = el.stroke && el.stroke !== 'transparent' ? el.stroke : '#e2e8f0';
  const cardStrokeWidth = el.stroke && el.stroke !== 'transparent'
    ? (el.strokeWidth !== undefined ? el.strokeWidth : 1.5)
    : (el.stroke === 'transparent' ? 0 : 1);
  const cardRx = (el as any).borderRadius !== undefined ? (el as any).borderRadius : 4;

  const isDark = isDarkColor(cardFill);
  const defaultTitleColor = isDark ? '#ffffff' : '#0f172a';
  const defaultPriceColor = isDark ? '#34d399' : '#00a651';
  const defaultTextColor = isDark ? '#cbd5e1' : '#334155';

  // Auto-contrast: If text is light on light card or dark on dark card, automatically adapt
  let titleColor = el.titleColor || defaultTitleColor;
  if (isDark && isDarkColor(titleColor)) {
    titleColor = '#ffffff';
  } else if (!isDark && !isDarkColor(titleColor)) {
    titleColor = '#0f172a';
  }

  let textColor = el.textColor || defaultTextColor;
  if (isDark && isDarkColor(textColor)) {
    textColor = '#cbd5e1';
  } else if (!isDark && !isDarkColor(textColor)) {
    textColor = '#334155';
  }

  let priceColor = el.priceColor || defaultPriceColor;

  // Base card background rect
  objs.push(new Rect({
    left: 0, top: 0, width: el.width, height: el.height,
    originX: 'left', originY: 'top',
    fill: cardFill,
    stroke: cardStroke,
    strokeWidth: cardStrokeWidth,
    rx: cardRx,
    ry: cardRx,
    objectCaching: false,
  }));

  const product = products.find(p => String(p.id) === String(el.productId)) || (el as any).productData;
  if (product) {
    const cardPadding = Math.max(10, Math.min(18, Math.round(el.width * 0.045)));
    const contentWidth = el.width - cardPadding * 2;
    const categories = useStore.getState().categories || [];

    const displayName = String(el.customTitle !== undefined ? el.customTitle : (product.name || 'Product Title'));
    const displayPrice = String(el.customPrice !== undefined ? el.customPrice : (product.price ? `${product.currency || '₹'}${product.price}` : '₹0.00'));
    const displaySku = String(el.customSku !== undefined ? el.customSku : (product.sku || ''));
    const catObj = product.categoryId ? categories.find(c => String(c.id) === String(product.categoryId)) : null;
    const categoryName = String(catObj?.name || (product as any).categoryName || 'FEATURED');

    const showTitle = el.showName !== false && (el.visibleFieldKeys ? (el.visibleFieldKeys.includes('name') || el.visibleFieldKeys.includes('title')) : true);
    const showPrice = el.showPrice !== false && (el.visibleFieldKeys ? el.visibleFieldKeys.includes('price') : true);
    const showSku = el.showSku !== false && (el.visibleFieldKeys ? el.visibleFieldKeys.includes('sku') : true) && Boolean(displaySku);

    const cardFontFamily = (el as any).fontFamily || (catalog as any)?.fontFamily || 'Inter';
    const autoTitleFontSize = Math.max(11, Math.min(18, Math.round(el.width * 0.062)));
    const titleFontSize = el.titleFontSize || autoTitleFontSize;
    const autoPriceFontSize = Math.max(11, Math.min(16, Math.round(el.width * 0.055)));
    const priceFontSize = el.priceFontSize || autoPriceFontSize;
    const specsFontSize = el.fontSize || 8.5;

    // Extract structured spec items according to user visibleFieldKeys order
    const specItems: { label: string; value: string }[] = [];
    if (el.visibleFieldKeys && el.visibleFieldKeys.length > 0) {
      el.visibleFieldKeys.forEach(k => {
        const normKey = String(k || '').trim().toLowerCase();
        if (
          normKey === 'name' ||
          normKey === 'title' ||
          normKey === 'price' ||
          normKey === 'product' ||
          normKey === 'products' ||
          normKey === 'product_name' ||
          normKey === 'product name'
        ) return;
        const override = el.fieldOverrides?.[k];
        if (override?.enabled === false) return;

        if (k === 'sku') {
          if (showSku && displaySku) {
            specItems.push({ label: String(override?.label || 'SKU'), value: displaySku });
          }
        } else if (k === 'description') {
          const val = override?.value !== undefined ? override.value : product.description;
          if (val) specItems.push({ label: String(override?.label || 'Description'), value: String(val) });
        } else {
          const label = override?.label || resolveFieldLabel(k, categories, product) || k;
          const val = override?.value !== undefined ? override.value : product.customFields?.[k];
          if (val !== undefined && val !== null && val !== '') {
            specItems.push({ label: String(label), value: String(val) });
          }
        }
      });
    } else {
      if (showSku && displaySku) {
        specItems.push({ label: 'SKU', value: displaySku });
      }
      if (product.description) {
        specItems.push({ label: 'Description', value: String(product.description) });
      }
      if (product.customFields) {
        Object.entries(product.customFields).forEach(([k, v]) => {
          const normKey = String(k || '').trim().toLowerCase();
          if (
            normKey === 'name' ||
            normKey === 'title' ||
            normKey === 'price' ||
            normKey === 'product' ||
            normKey === 'products' ||
            normKey === 'product_name' ||
            normKey === 'product name'
          ) return;
          if (v !== undefined && v !== null && v !== '' && typeof v !== 'object') {
            const label = resolveFieldLabel(k, categories, product) || k;
            specItems.push({ label: String(label), value: String(v) });
          }
        });
      }
    }

    // Load Product Image if available
    const rawImgUrl = el.src || product.image || (product.customFields && Object.values(product.customFields).find((v: any) => typeof v === 'string' && (v.startsWith('/media') || v.startsWith('http'))));
    let loadedImg: FabricImage | null = null;
    if (rawImgUrl) {
      try {
        const imgUrl = normalizeImageUrl(rawImgUrl);
        const htmlImg = await getCachedImageElement(imgUrl);
        loadedImg = new FabricImage(htmlImg);
      } catch { }
    }

    // ─────────────────────────────────────────────────────────────
    // THEME 1: Clean Badge Layout (Top Badge + Top Price + Centered Image + Title + 2-Column Spec Badges)
    // ─────────────────────────────────────────────────────────────
    if (theme === 'clean-badge') {
      let curY = cardPadding;

      // Header Row: Category Badge (Left) & Price (Right)
      const badgeW = estimateTextWidth(categoryName.toUpperCase(), 7.5, 'bold') + 14;
      const badgeH = 16;
      const badgeRect = new Rect({
        left: cardPadding,
        top: curY,
        width: badgeW,
        height: badgeH,
        fill: isDark ? 'rgba(99, 102, 241, 0.18)' : 'rgba(99, 102, 241, 0.1)',
        stroke: isDark ? 'rgba(99, 102, 241, 0.35)' : 'rgba(99, 102, 241, 0.25)',
        strokeWidth: 1,
        rx: 3,
        ry: 3,
        originX: 'left',
        originY: 'top',
        objectCaching: false
      });
      objs.push(badgeRect);

      const badgeText = new Textbox(categoryName.toUpperCase(), {
        left: cardPadding + 6,
        top: curY + 2.5,
        width: badgeW - 8,
        fontSize: 7.5,
        fontFamily: cardFontFamily,
        fontWeight: 'bold',
        fill: isDark ? '#a5b4fc' : '#4f46e5',
        originX: 'left',
        originY: 'top',
        splitByGrapheme: false,
        objectCaching: false
      });
      if (typeof (badgeText as any).initDimensions === 'function') (badgeText as any).initDimensions();
      objs.push(badgeText);

      if (showPrice) {
        const priceText = new Textbox(displayPrice, {
          left: cardPadding,
          top: curY - 1,
          width: contentWidth,
          fontSize: priceFontSize,
          fontFamily: cardFontFamily,
          fontWeight: 'bold',
          fill: priceColor,
          textAlign: 'right',
          originX: 'left',
          originY: 'top',
          splitByGrapheme: false,
          objectCaching: false
        });
        if (typeof (priceText as any).initDimensions === 'function') (priceText as any).initDimensions();
        objs.push(priceText);
      }

      curY += badgeH + 8;

      // Image Box Container
      const imageBoxH = Math.max(50, Math.min(el.height * 0.36, 140));
      const imgBgRect = new Rect({
        left: cardPadding,
        top: curY,
        width: contentWidth,
        height: imageBoxH,
        fill: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
        rx: 3,
        ry: 3,
        originX: 'left',
        originY: 'top',
        objectCaching: false
      });
      objs.push(imgBgRect);

      if (loadedImg) {
        const natW = loadedImg.width || 1;
        const natH = loadedImg.height || 1;
        const scale = Math.min((contentWidth - 10) / natW, (imageBoxH - 10) / natH, 1.5);
        const rW = natW * scale;
        const rH = natH * scale;
        loadedImg.set({
          left: cardPadding + (contentWidth - rW) / 2,
          top: curY + (imageBoxH - rH) / 2,
          scaleX: scale,
          scaleY: scale,
          originX: 'left',
          originY: 'top',
          objectCaching: false
        });
        objs.push(loadedImg);
      }

      curY += imageBoxH + 8;

      // Product Title
      if (showTitle) {
        const titleH = measureWrappedTextHeight(displayName, contentWidth, titleFontSize, 1.15, 'bold');
        const titleText = new Textbox(displayName, {
          left: cardPadding,
          top: curY,
          width: contentWidth,
          fontSize: titleFontSize,
          fontFamily: cardFontFamily,
          fontWeight: 'bold',
          fill: titleColor,
          lineHeight: 1.15,
          originX: 'left',
          originY: 'top',
          splitByGrapheme: false,
          objectCaching: false
        });
        if (typeof (titleText as any).initDimensions === 'function') (titleText as any).initDimensions();
        objs.push(titleText);
        curY += Math.max(titleText.height || 0, titleH) + 6;
      }

      // Specs 2-Column Grid
      if (specItems.length > 0 && el.height - curY > 15) {
        const colW = (contentWidth - 6) / 2;
        const boxH = Math.max(26, specsFontSize * 2 + 8);
        const maxRows = Math.floor((el.height - curY - cardPadding) / (boxH + 4));

        specItems.slice(0, maxRows * 2).forEach((item, idx) => {
          const col = idx % 2;
          const row = Math.floor(idx / 2);
          const boxX = cardPadding + col * (colW + 6);
          const boxY = curY + row * (boxH + 4);

          const specBox = new Rect({
            left: boxX,
            top: boxY,
            width: colW,
            height: boxH,
            fill: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
            stroke: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)',
            strokeWidth: 1,
            rx: 3,
            ry: 3,
            originX: 'left',
            originY: 'top',
            objectCaching: false
          });
          objs.push(specBox);

          const labelText = new Textbox(item.label.toUpperCase(), {
            left: boxX + 4,
            top: boxY + 2.5,
            width: colW - 8,
            fontSize: 6.8,
            fontFamily: cardFontFamily,
            fontWeight: '600',
            fill: isDark ? '#94a3b8' : '#64748b',
            originX: 'left',
            originY: 'top',
            splitByGrapheme: false,
            objectCaching: false
          });
          if (typeof (labelText as any).initDimensions === 'function') (labelText as any).initDimensions();
          objs.push(labelText);

          const valText = new Textbox(item.value, {
            left: boxX + 4,
            top: boxY + 11.5,
            width: colW - 8,
            fontSize: specsFontSize,
            fontFamily: cardFontFamily,
            fontWeight: 'bold',
            fill: textColor,
            originX: 'left',
            originY: 'top',
            splitByGrapheme: false,
            objectCaching: false
          });
          if (typeof (valText as any).initDimensions === 'function') (valText as any).initDimensions();
          objs.push(valText);
        });
      }
    }

    // ─────────────────────────────────────────────────────────────
    // THEME 2: Editorial Overlay (Hero Background Image + Dark Gradient + Overlay Details)
    // ─────────────────────────────────────────────────────────────
    else if (theme === 'editorial-overlay') {
      // 1. Dark Gradient Background covering exact card bounds
      const gradOverlay = new Rect({
        left: 0,
        top: 0,
        width: el.width,
        height: el.height,
        originX: 'left',
        originY: 'top',
        rx: cardRx,
        ry: cardRx,
        fill: new Gradient({
          type: 'linear',
          coords: { x1: 0, y1: 0, x2: 0, y2: el.height },
          colorStops: [
            { offset: 0, color: '#1e293b' },
            { offset: 0.40, color: '#0f172a' },
            { offset: 0.70, color: '#090d16' },
            { offset: 1, color: '#020617' }
          ]
        }),
        objectCaching: false
      });
      objs.push(gradOverlay);

      // 2. Measure bottom stack heights so we allocate proper space
      const chipsToRender = specItems.filter(s => s.label !== 'SKU').slice(0, 3);
      const priceH = showPrice ? Math.ceil((priceFontSize + 2) * 1.3) + 4 : 0;
      const titleEstimatedH = showTitle ? measureWrappedTextHeight(displayName, contentWidth, titleFontSize, 1.15, 'bold') + 4 : 0;
      const skuEstimatedH = (showSku && displaySku) ? measureWrappedTextHeight(`SKU: ${displaySku}`, contentWidth, 8.5, 1.2, 'normal') + 4 : 0;

      // Calculate chips rows & total height
      let chipsRows = 0;
      if (chipsToRender.length > 0) {
        let tempX = cardPadding;
        chipsRows = 1;
        chipsToRender.forEach(c => {
          const textContent = `${c.label}: ${c.value}`;
          const chipW = Math.min(estimateTextWidth(textContent, 7.5, 'normal') + 12, contentWidth);
          if (tempX + chipW > cardPadding + contentWidth && tempX > cardPadding) {
            tempX = cardPadding;
            chipsRows++;
          }
          tempX += chipW + 4;
        });
      }
      const chipsTotalH = chipsRows * 20;
      const totalContentH = priceH + titleEstimatedH + skuEstimatedH + chipsTotalH;

      // Bottom stack placement
      const bottomStackY = Math.max(cardPadding + 60, el.height - cardPadding - totalContentH);
      const heroAreaH = bottomStackY - cardPadding;

      // 3. Render Product Image cleanly contained within top hero area
      if (loadedImg) {
        const natW = loadedImg.width || 1;
        const natH = loadedImg.height || 1;
        const maxImgW = contentWidth - 4;
        const maxImgH = Math.max(40, heroAreaH - 4);
        const scale = Math.min(maxImgW / natW, maxImgH / natH, 1.5);
        const rW = natW * scale;
        const rH = natH * scale;
        loadedImg.set({
          left: cardPadding + (contentWidth - rW) / 2,
          top: cardPadding + (heroAreaH - rH) / 2,
          scaleX: scale,
          scaleY: scale,
          originX: 'left',
          originY: 'top',
          objectCaching: false
        });
        objs.push(loadedImg);
      }

      // 4. Render Price
      let currentStackY = bottomStackY;
      if (showPrice) {
        const priceTextObj = new Textbox(displayPrice, {
          left: cardPadding,
          top: currentStackY,
          width: contentWidth,
          fontSize: priceFontSize + 2,
          fontFamily: cardFontFamily,
          fontWeight: 'bold',
          fill: priceColor,
          originX: 'left',
          originY: 'top',
          splitByGrapheme: false,
          objectCaching: false
        });
        if (typeof (priceTextObj as any).initDimensions === 'function') (priceTextObj as any).initDimensions();
        objs.push(priceTextObj);
        currentStackY += priceH;
      }

      // 5. Render Title
      if (showTitle) {
        const titleTextObj = new Textbox(displayName, {
          left: cardPadding,
          top: currentStackY,
          width: contentWidth,
          fontSize: titleFontSize,
          fontFamily: cardFontFamily,
          fontWeight: 'bold',
          fill: '#ffffff',
          lineHeight: 1.15,
          originX: 'left',
          originY: 'top',
          splitByGrapheme: false,
          objectCaching: false
        });
        if (typeof (titleTextObj as any).initDimensions === 'function') (titleTextObj as any).initDimensions();
        objs.push(titleTextObj);
        const actualTitleH = Math.max(titleTextObj.height || 0, titleEstimatedH);
        currentStackY += actualTitleH;
      }

      // 6. Render SKU
      if (showSku && displaySku) {
        const skuTextObj = new Textbox(`SKU: ${displaySku}`, {
          left: cardPadding,
          top: currentStackY,
          width: contentWidth,
          fontSize: 8.5,
          fontFamily: cardFontFamily,
          fill: '#cbd5e1',
          originX: 'left',
          originY: 'top',
          splitByGrapheme: false,
          objectCaching: false
        });
        if (typeof (skuTextObj as any).initDimensions === 'function') (skuTextObj as any).initDimensions();
        objs.push(skuTextObj);
        const actualSkuH = Math.max(skuTextObj.height || 0, skuEstimatedH);
        currentStackY += actualSkuH;
      }

      // 7. Render Chips / Spec Badges
      if (chipsToRender.length > 0 && currentStackY + 16 <= el.height) {
        let chipX = cardPadding;
        let chipY = currentStackY + 2;
        const chipH = 16;
        const chipGap = 4;

        chipsToRender.forEach(c => {
          const textContent = `${c.label}: ${c.value}`;
          const textW = estimateTextWidth(textContent, 7.5, 'normal');
          const chipW = Math.min(textW + 12, contentWidth);

          if (chipX + chipW > cardPadding + contentWidth && chipX > cardPadding) {
            chipX = cardPadding;
            chipY += chipH + chipGap;
          }

          if (chipY + chipH <= el.height - 4) {
            const chipRect = new Rect({
              left: chipX,
              top: chipY,
              width: chipW,
              height: chipH,
              fill: 'rgba(255, 255, 255, 0.15)',
              stroke: 'rgba(255, 255, 255, 0.25)',
              strokeWidth: 1,
              rx: 3,
              ry: 3,
              originX: 'left',
              originY: 'top',
              objectCaching: false
            });
            objs.push(chipRect);

            const chipText = new Textbox(textContent, {
              left: chipX + 5,
              top: chipY + 2.5,
              width: chipW - 8,
              fontSize: 7.5,
              fontFamily: cardFontFamily,
              fill: '#ffffff',
              originX: 'left',
              originY: 'top',
              splitByGrapheme: false,
              objectCaching: false
            });
            if (typeof (chipText as any).initDimensions === 'function') (chipText as any).initDimensions();
            objs.push(chipText);

            chipX += chipW + chipGap;
          }
        });
      }
    }

    // ─────────────────────────────────────────────────────────────
    // THEME 3: Minimal Row Layout (Thumbnail on Left, Info on Right)
    // ─────────────────────────────────────────────────────────────
    else if (theme === 'minimal-row') {
      const thumbW = Math.max(60, el.width * 0.32);
      const thumbH = el.height - cardPadding * 2;

      const thumbBg = new Rect({
        left: cardPadding,
        top: cardPadding,
        width: thumbW,
        height: thumbH,
        fill: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
        rx: 3,
        ry: 3,
        originX: 'left',
        originY: 'top',
        objectCaching: false
      });
      objs.push(thumbBg);

      if (loadedImg) {
        const natW = loadedImg.width || 1;
        const natH = loadedImg.height || 1;
        const scale = Math.min((thumbW - 8) / natW, (thumbH - 8) / natH, 1.5);
        const rW = natW * scale;
        const rH = natH * scale;
        loadedImg.set({
          left: cardPadding + (thumbW - rW) / 2,
          top: cardPadding + (thumbH - rH) / 2,
          scaleX: scale,
          scaleY: scale,
          originX: 'left',
          originY: 'top',
          objectCaching: false
        });
        objs.push(loadedImg);
      }

      const rightX = cardPadding + thumbW + 10;
      const rightW = el.width - rightX - cardPadding;
      let rightY = cardPadding + 2;

      if (showTitle) {
        const titleH = measureWrappedTextHeight(displayName, rightW, titleFontSize, 1.15, 'bold');
        const titleText = new Textbox(displayName, {
          left: rightX,
          top: rightY,
          width: rightW,
          fontSize: titleFontSize,
          fontFamily: cardFontFamily,
          fontWeight: 'bold',
          fill: titleColor,
          lineHeight: 1.15,
          originX: 'left',
          originY: 'top',
          splitByGrapheme: false,
          objectCaching: false
        });
        if (typeof (titleText as any).initDimensions === 'function') (titleText as any).initDimensions();
        objs.push(titleText);
        rightY += Math.max(titleText.height || 0, titleH) + 4;
      }

      if (showPrice) {
        const priceText = new Textbox(displayPrice, {
          left: rightX,
          top: rightY,
          width: rightW,
          fontSize: priceFontSize,
          fontFamily: cardFontFamily,
          fontWeight: 'bold',
          fill: priceColor,
          originX: 'left',
          originY: 'top',
          splitByGrapheme: false,
          objectCaching: false
        });
        if (typeof (priceText as any).initDimensions === 'function') (priceText as any).initDimensions();
        objs.push(priceText);
        rightY += Math.max(priceText.height || 0, priceFontSize * 1.2) + 4;
      }

      if (showSku && displaySku) {
        const skuText = new Textbox(`SKU: ${displaySku}`, {
          left: rightX,
          top: rightY,
          width: rightW,
          fontSize: 8,
          fontFamily: cardFontFamily,
          fill: isDark ? '#94a3b8' : '#64748b',
          originX: 'left',
          originY: 'top',
          splitByGrapheme: false,
          objectCaching: false
        });
        if (typeof (skuText as any).initDimensions === 'function') (skuText as any).initDimensions();
        objs.push(skuText);
        rightY += Math.max(skuText.height || 0, 11) + 4;
      }

      if (specItems.length > 0 && el.height - rightY > 12) {
        const remainingSpecs = specItems.filter(s => s.label !== 'SKU').slice(0, 4);
        remainingSpecs.forEach(s => {
          if (el.height - rightY < 12) return;
          const specText = new Textbox(`${s.label}: ${s.value}`, {
            left: rightX,
            top: rightY,
            width: rightW,
            fontSize: 7.8,
            fontFamily: cardFontFamily,
            fill: textColor,
            originX: 'left',
            originY: 'top',
            splitByGrapheme: false,
            objectCaching: false
          });
          if (typeof (specText as any).initDimensions === 'function') (specText as any).initDimensions();
          objs.push(specText);
          rightY += 12;
        });
      }
    }

    // ─────────────────────────────────────────────────────────────
    // THEME 4: Classic Stack (Image on Top + Overlaid Price Pill + Title + Specs List)
    // ─────────────────────────────────────────────────────────────
    else {
      const imgH = Math.max(50, Math.min(el.height * 0.44, 160));
      const imgBox = new Rect({
        left: cardPadding,
        top: cardPadding,
        width: contentWidth,
        height: imgH,
        fill: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
        rx: 3,
        ry: 3,
        originX: 'left',
        originY: 'top',
        objectCaching: false
      });
      objs.push(imgBox);

      if (loadedImg) {
        const natW = loadedImg.width || 1;
        const natH = loadedImg.height || 1;
        const scale = Math.min((contentWidth - 10) / natW, (imgH - 10) / natH, 1.5);
        const rW = natW * scale;
        const rH = natH * scale;
        loadedImg.set({
          left: cardPadding + (contentWidth - rW) / 2,
          top: cardPadding + (imgH - rH) / 2,
          scaleX: scale,
          scaleY: scale,
          originX: 'left',
          originY: 'top',
          objectCaching: false
        });
        objs.push(loadedImg);
      }

      // Price Pill over Image
      if (showPrice) {
        const pillW = estimateTextWidth(displayPrice, priceFontSize, 'bold') + 14;
        const pillH = priceFontSize + 6;
        const pillBg = new Rect({
          left: cardPadding + contentWidth - pillW - 4,
          top: cardPadding + imgH - pillH - 4,
          width: pillW,
          height: pillH,
          fill: isDark ? 'rgba(0, 0, 0, 0.85)' : 'rgba(255, 255, 255, 0.95)',
          rx: 3,
          ry: 3,
          originX: 'left',
          originY: 'top',
          objectCaching: false
        });
        objs.push(pillBg);

        const pillText = new Textbox(displayPrice, {
          left: cardPadding + contentWidth - 8,
          top: cardPadding + imgH - pillH - 2,
          width: pillW,
          fontSize: priceFontSize,
          fontFamily: cardFontFamily,
          fontWeight: 'bold',
          fill: priceColor,
          originX: 'right',
          originY: 'top',
          splitByGrapheme: false,
          objectCaching: false
        });
        if (typeof (pillText as any).initDimensions === 'function') (pillText as any).initDimensions();
        objs.push(pillText);
      }

      let curY = cardPadding + imgH + 8;

      if (showTitle) {
        const titleH = measureWrappedTextHeight(displayName, contentWidth, titleFontSize, 1.15, 'bold');
        const titleText = new Textbox(displayName, {
          left: cardPadding,
          top: curY,
          width: contentWidth,
          fontSize: titleFontSize,
          fontFamily: cardFontFamily,
          fontWeight: 'bold',
          fill: titleColor,
          lineHeight: 1.15,
          originX: 'left',
          originY: 'top',
          splitByGrapheme: false,
          objectCaching: false
        });
        if (typeof (titleText as any).initDimensions === 'function') (titleText as any).initDimensions();
        objs.push(titleText);
        curY += Math.max(titleText.height || 0, titleH) + 5;
      }

      if (showSku && displaySku) {
        const skuText = new Textbox(`SKU: ${displaySku}`, {
          left: cardPadding,
          top: curY,
          width: contentWidth,
          fontSize: 8.5,
          fontFamily: cardFontFamily,
          fill: isDark ? '#94a3b8' : '#64748b',
          originX: 'left',
          originY: 'top',
          splitByGrapheme: false,
          objectCaching: false
        });
        if (typeof (skuText as any).initDimensions === 'function') (skuText as any).initDimensions();
        objs.push(skuText);
        curY += Math.max(skuText.height || 0, 12) + 5;
      }

      if (specItems.length > 0 && el.height - curY > 12) {
        // Divider line
        objs.push(new Line([cardPadding, curY, cardPadding + contentWidth, curY], {
          stroke: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
          strokeWidth: 1,
          originX: 'left',
          originY: 'top',
          objectCaching: false
        }));
        curY += 5;

        const remainingSpecs = specItems.filter(s => s.label !== 'SKU');
        remainingSpecs.forEach(s => {
          if (el.height - curY < 12) return;
          const specH = Math.max(12, specsFontSize + 3);
          const specLabel = new Textbox(`${s.label}:`, {
            left: cardPadding,
            top: curY,
            width: contentWidth * 0.5,
            fontSize: specsFontSize,
            fontFamily: cardFontFamily,
            fill: isDark ? '#94a3b8' : '#64748b',
            originX: 'left',
            originY: 'top',
            splitByGrapheme: false,
            objectCaching: false
          });
          const specVal = new Textbox(s.value, {
            left: cardPadding + contentWidth,
            top: curY,
            width: contentWidth * 0.5,
            fontSize: specsFontSize,
            fontFamily: cardFontFamily,
            fontWeight: 'bold',
            fill: textColor,
            textAlign: 'right',
            originX: 'right',
            originY: 'top',
            splitByGrapheme: false,
            objectCaching: false
          });
          objs.push(specLabel);
          objs.push(specVal);
          curY += specH;
        });
      }
    }
  } else {
    objs.push(new Textbox('EMPTY SLOT', {
      left: 0, top: el.height / 2 - 10, width: el.width,
      originX: 'left', originY: 'top',
      fontSize: 12, fontFamily: 'Inter', fontWeight: 'bold', fill: '#94a3b8',
      textAlign: 'center', splitByGrapheme: false,
      objectCaching: false
    }));
  }

  const group = new Group(objs, {
    left: el.x,
    top: el.y,
    angle: el.rotation || 0,
    width: el.width,
    height: el.height,
    originX: 'left',
    originY: 'top',
    opacity: el.opacity ?? 1,
    objectCaching: false,
    subTargetCheck: true,
  });

  (group as any).id = el.id;
  (group as any)._cardTheme = theme;
  return group;
}
