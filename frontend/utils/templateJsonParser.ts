import { SystemTemplate, CanvasElement, CatalogPage } from '../types';

/**
 * Sanitizes any raw element JSON into a 100% valid CanvasElement
 * that FabricStage and fabricRenderer render cleanly without missing text or fills.
 */
export function sanitizeCanvasElement(rawEl: any, index: number = 0): CanvasElement {
  if (!rawEl || typeof rawEl !== 'object') {
    return {
      id: `el-${Date.now()}-${index}`,
      type: 'text',
      x: 50,
      y: 50,
      width: 200,
      height: 40,
      rotation: 0,
      opacity: 1,
      zIndex: index + 1,
      visible: true,
      text: 'Sample Text',
      fill: '#ffffff',
      fontSize: 14,
      fontFamily: 'Inter',
      fontWeight: 'normal',
      textAlign: 'left'
    };
  }

  let type = rawEl.type || (rawEl.text || rawEl.content || rawEl.body ? 'text' : 'shape');
  let shapeType = rawEl.shapeType || rawEl.shape;
  if (shapeType === 'rectangle') shapeType = 'rect';
  if (shapeType === 'rounded-rect' || shapeType === 'roundedRectangle') shapeType = 'roundedRect';
  if (shapeType === 'circle' || shapeType === 'oval') shapeType = 'circle';
  if (shapeType === 'horizontal-line') shapeType = 'line';

  // Text content resolution
  const text = rawEl.text !== undefined 
    ? rawEl.text 
    : (rawEl.content !== undefined ? rawEl.content : (rawEl.body ?? rawEl.title ?? (type === 'text' ? 'Untitled' : undefined)));

  // Fill / color resolution
  const fill = rawEl.fill !== undefined 
    ? rawEl.fill 
    : (rawEl.fillColor ?? rawEl.color ?? rawEl.fontColor ?? rawEl.textColor ?? (type === 'text' ? '#FFFFFF' : '#cbd5e1'));

  // Stroke resolution
  const stroke = rawEl.stroke !== undefined 
    ? rawEl.stroke 
    : (rawEl.strokeColor ?? rawEl.borderColor ?? undefined);

  const strokeWidth = rawEl.strokeWidth !== undefined 
    ? rawEl.strokeWidth 
    : (rawEl.borderWidth !== undefined ? rawEl.borderWidth : (stroke ? 1 : 0));

  return {
    id: String(rawEl.id || `el-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`),
    type: type,
    shapeType: type === 'shape' ? (shapeType || 'rect') : undefined,
    x: typeof rawEl.x === 'number' ? rawEl.x : 50,
    y: typeof rawEl.y === 'number' ? rawEl.y : 50,
    width: typeof rawEl.width === 'number' ? rawEl.width : (type === 'text' ? 300 : 100),
    height: typeof rawEl.height === 'number' ? rawEl.height : (type === 'text' ? 40 : 100),
    rotation: typeof rawEl.rotation === 'number' ? rawEl.rotation : 0,
    opacity: typeof rawEl.opacity === 'number' ? rawEl.opacity : 1,
    fill: fill,
    stroke: stroke,
    strokeWidth: strokeWidth,
    rx: rawEl.rx !== undefined ? rawEl.rx : (rawEl.cornerRadius ?? rawEl.borderRadius),
    ry: rawEl.ry !== undefined ? rawEl.ry : (rawEl.cornerRadius ?? rawEl.borderRadius),
    text: text !== undefined ? String(text) : undefined,
    fontSize: typeof rawEl.fontSize === 'number' ? rawEl.fontSize : 16,
    fontFamily: rawEl.fontFamily || 'Inter',
    fontWeight: rawEl.fontWeight || 'normal',
    fontStyle: rawEl.fontStyle || 'normal',
    textAlign: rawEl.textAlign || (type === 'text' ? 'left' : undefined),
    lineHeight: typeof rawEl.lineHeight === 'number' ? rawEl.lineHeight : 1.2,
    letterSpacing: typeof rawEl.letterSpacing === 'number' ? rawEl.letterSpacing : 0,
    zIndex: typeof rawEl.zIndex === 'number' ? rawEl.zIndex : index + 1,
    visible: rawEl.visible !== false,
    src: rawEl.src || rawEl.image || rawEl.url || rawEl.imageSrc,
    locked: Boolean(rawEl.locked),
    svgContent: rawEl.svgContent,
    productId: rawEl.productId ? String(rawEl.productId) : undefined,
  };
}

/**
 * Universal JSON Parser for Cover & Catalog Templates.
 * Seamlessly parses:
 * 1. Catalog & Product datasets (e.g. { catalog_metadata: {...}, products: [...] })
 * 2. Canvas blueprint JSON with pages_data / pages / elements
 * 3. Raw array of canvas elements
 */
export function normalizeTemplateFromJSON(raw: any): { template: SystemTemplate; pages: CatalogPage[] } {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Provided input is not a valid JSON object or array.');
  }

  let pagesData: any[] = [];
  let name = raw.catalog_metadata?.title 
    ? `${raw.catalog_metadata?.brand_name || 'Catalog'} - ${raw.catalog_metadata.title}`
    : (raw.name || 'Imported Cover Template');
  let category = raw.category || (raw.products?.[0]?.category?.split('/')?.[0]?.trim()) || 'General';
  let type = raw.type || 'cover';
  let description = raw.description || `Collection catalog for ${raw.catalog_metadata?.brand_name || 'Brand'}`;
  let backgroundColor = raw.backgroundColor || '#0F0F0F';

  // CASE 1: Rich Catalog Data JSON (catalog_metadata + products)
  if (raw.catalog_metadata || (Array.isArray(raw.products) && raw.products.length > 0)) {
    const meta = raw.catalog_metadata || {};
    const brand = meta.brand_name || raw.brand_name || 'CATALOG BRAND';
    const title = meta.title || raw.title || 'PRODUCT CATALOG';
    const year = meta.year || new Date().getFullYear();
    const contact = meta.contact || {};
    const website = contact.website || '';
    const social = contact.social?.handle || '';
    const address = contact.address || '';
    const productsList: any[] = Array.isArray(raw.products) ? raw.products : [];

    // PAGE 1: Master Front Cover
    const coverElements: any[] = [
      // Outer Luxury Border Frame
      {
        id: "cover-frame",
        type: "shape",
        shapeType: "rect",
        x: 35,
        y: 35,
        width: 724,
        height: 1053,
        fill: "transparent",
        stroke: "#E2DCC8",
        strokeWidth: 1.5,
        opacity: 0.35
      },
      // Inner Accent Dark Panel
      {
        id: "cover-inner-frame",
        type: "shape",
        shapeType: "rect",
        x: 50,
        y: 50,
        width: 694,
        height: 1023,
        fill: "#141414",
        stroke: "#222222",
        strokeWidth: 1,
        opacity: 0.95
      },
      // Top Tagline Badge
      {
        id: "cover-badge",
        type: "text",
        x: 70,
        y: 90,
        width: 654,
        height: 30,
        text: `OFFICIAL CATALOG • VOL. ${year}`,
        fill: "#E2DCC8",
        fontSize: 11,
        fontFamily: "Space Grotesk",
        fontWeight: "bold",
        letterSpacing: 4,
        textAlign: "center"
      },
      // Brand Name Big Headline
      {
        id: "cover-brand-title",
        type: "text",
        x: 70,
        y: 260,
        width: 654,
        height: 100,
        text: brand.toUpperCase(),
        fill: "#FFFFFF",
        fontSize: 46,
        fontFamily: "Playfair Display",
        fontWeight: "bold",
        lineHeight: 1.1,
        letterSpacing: 3,
        textAlign: "center"
      },
      // Catalog Title Subhead
      {
        id: "cover-title-subhead",
        type: "text",
        x: 70,
        y: 380,
        width: 654,
        height: 40,
        text: title.toUpperCase(),
        fill: "#E2DCC8",
        fontSize: 20,
        fontFamily: "Space Grotesk",
        fontWeight: "bold",
        letterSpacing: 6,
        textAlign: "center"
      },
      // Center Geometric Accent Line
      {
        id: "cover-center-line",
        type: "shape",
        shapeType: "line",
        x: 327,
        y: 450,
        width: 140,
        height: 2,
        fill: "#E2DCC8",
        stroke: "#E2DCC8",
        strokeWidth: 2,
        opacity: 0.9
      },
      // Subtitle Description
      {
        id: "cover-desc",
        type: "text",
        x: 100,
        y: 490,
        width: 594,
        height: 60,
        text: `Complete ${year} Collection & Showcase Featuring Premium Lineup`,
        fill: "#888888",
        fontSize: 14,
        fontFamily: "Inter",
        fontWeight: "normal",
        letterSpacing: 0.5,
        textAlign: "center"
      },
      // Bottom Contact & Website Info
      {
        id: "cover-contact-footer",
        type: "text",
        x: 70,
        y: 960,
        width: 654,
        height: 60,
        text: `${website ? website.replace(/^https?:\/\//, '') : brand.toLowerCase() + '.com'}${social ? `  •  ${social}` : ''}\n${address ? address : 'All Rights Reserved.'}`,
        fill: "#777777",
        fontSize: 10,
        fontFamily: "Space Grotesk",
        fontWeight: "bold",
        letterSpacing: 2,
        textAlign: "center",
        lineHeight: 1.6
      }
    ];

    pagesData.push({
      pageNumber: 1,
      type: "cover",
      backgroundColor: "#0F0F0F",
      elements: coverElements.map((el, i) => sanitizeCanvasElement(el, i))
    });

    // PAGE 2+: Product Grid Pages (2 products per page)
    if (productsList.length > 0) {
      const itemsPerPage = 2;
      const totalProdPages = Math.ceil(productsList.length / itemsPerPage);

      for (let pageIdx = 0; pageIdx < totalProdPages; pageIdx++) {
        const pageProducts = productsList.slice(pageIdx * itemsPerPage, (pageIdx + 1) * itemsPerPage);
        const prodElements: any[] = [];

        // Top Page Header Banner
        prodElements.push({
          id: `prod-header-${pageIdx}`,
          type: "text",
          x: 50,
          y: 40,
          width: 694,
          height: 35,
          text: `${brand} • ${title} (Page ${pageIdx + 2})`,
          fill: "#E2DCC8",
          fontSize: 10,
          fontFamily: "Space Grotesk",
          fontWeight: "bold",
          letterSpacing: 3,
          textAlign: "left"
        });
        prodElements.push({
          id: `prod-header-line-${pageIdx}`,
          type: "shape",
          shapeType: "line",
          x: 50,
          y: 75,
          width: 694,
          height: 1,
          fill: "#262626",
          stroke: "#262626",
          strokeWidth: 1
        });

        // Render Product Blocks (2 cards per page vertically)
        pageProducts.forEach((prod, itemIdx) => {
          const topY = 100 + itemIdx * 460;

          // Card Container Box
          prodElements.push({
            id: `prod-card-${prod.id || itemIdx}`,
            type: "shape",
            shapeType: "rect",
            x: 50,
            y: topY,
            width: 694,
            height: 430,
            fill: "#141414",
            stroke: "#262626",
            strokeWidth: 1,
            opacity: 0.95
          });

          // Image Container Frame on the Left
          prodElements.push({
            id: `prod-img-${prod.id || itemIdx}`,
            type: "shape",
            shapeType: "rect",
            x: 75,
            y: topY + 25,
            width: 250,
            height: 380,
            fill: "#1a1a1a",
            stroke: "#333333",
            strokeWidth: 1
          });

          // Image Placeholder Label
          prodElements.push({
            id: `prod-img-label-${prod.id || itemIdx}`,
            type: "text",
            x: 85,
            y: topY + 190,
            width: 230,
            height: 40,
            text: `[ Image: ${prod.name} ]`,
            fill: "#666666",
            fontSize: 11,
            fontFamily: "Space Grotesk",
            fontWeight: "bold",
            textAlign: "center"
          });

          // Right Side Details: Category Tag
          if (prod.category) {
            prodElements.push({
              id: `prod-cat-${prod.id || itemIdx}`,
              type: "text",
              x: 350,
              y: topY + 30,
              width: 370,
              height: 25,
              text: String(prod.category).toUpperCase(),
              fill: "#E2DCC8",
              fontSize: 10,
              fontFamily: "Space Grotesk",
              fontWeight: "bold",
              letterSpacing: 2,
              textAlign: "left"
            });
          }

          // Product Name Headline
          prodElements.push({
            id: `prod-title-${prod.id || itemIdx}`,
            type: "text",
            x: 350,
            y: topY + 60,
            width: 370,
            height: 60,
            text: prod.name || 'Untitled Product',
            fill: "#FFFFFF",
            fontSize: 22,
            fontFamily: "Playfair Display",
            fontWeight: "bold",
            lineHeight: 1.2,
            textAlign: "left"
          });

          // SKU / ID Pill
          if (prod.id) {
            prodElements.push({
              id: `prod-sku-${prod.id || itemIdx}`,
              type: "text",
              x: 350,
              y: topY + 125,
              width: 370,
              height: 20,
              text: `SKU / REF: ${prod.id}`,
              fill: "#34d399",
              fontSize: 10,
              fontFamily: "monospace",
              fontWeight: "bold",
              textAlign: "left"
            });
          }

          // Specs: Materials & Color
          let specsText = '';
          if (prod.color) specsText += `Color: ${prod.color}\n`;
          if (prod.materials) {
            specsText += `Materials: ${Array.isArray(prod.materials) ? prod.materials.join(', ') : prod.materials}\n`;
          }
          if (specsText) {
            prodElements.push({
              id: `prod-specs-${prod.id || itemIdx}`,
              type: "text",
              x: 350,
              y: topY + 155,
              width: 370,
              height: 50,
              text: specsText.trim(),
              fill: "#E2DCC8",
              fontSize: 11,
              fontFamily: "Inter",
              fontWeight: "500",
              lineHeight: 1.5,
              textAlign: "left"
            });
          }

          // Description or Features
          let detailsText = prod.description || '';
          if (Array.isArray(prod.features) && prod.features.length > 0) {
            detailsText += (detailsText ? '\n\nFeatures:\n' : 'Features:\n') + prod.features.map((f: string) => `• ${f}`).join('\n');
          }
          if (detailsText) {
            prodElements.push({
              id: `prod-desc-${prod.id || itemIdx}`,
              type: "text",
              x: 350,
              y: topY + 225,
              width: 370,
              height: 160,
              text: detailsText,
              fill: "#999999",
              fontSize: 12,
              fontFamily: "Inter",
              fontWeight: "normal",
              lineHeight: 1.5,
              textAlign: "left"
            });
          }
        });

        pagesData.push({
          pageNumber: pageIdx + 2,
          type: "product",
          backgroundColor: "#100F0F",
          elements: prodElements.map((el, i) => sanitizeCanvasElement(el, i))
        });
      }
    }
  } 
  // CASE 2: Standard Canvas / Blueprint JSON
  else if (Array.isArray(raw.pages_data) && raw.pages_data.length > 0) {
    pagesData = raw.pages_data;
  } else if (Array.isArray(raw.pages) && raw.pages.length > 0) {
    pagesData = raw.pages;
  } else if (Array.isArray(raw.elements)) {
    pagesData = [{
      pageNumber: 1,
      type: type,
      backgroundColor: backgroundColor,
      elements: raw.elements
    }];
  } else if (Array.isArray(raw)) {
    if (raw.length > 0 && raw[0].elements) {
      pagesData = raw;
    } else {
      pagesData = [{
        pageNumber: 1,
        type: type,
        backgroundColor: backgroundColor,
        elements: raw
      }];
    }
  } else {
    pagesData = [{
      pageNumber: 1,
      type: type,
      backgroundColor: backgroundColor,
      elements: []
    }];
  }

  const normalizedPages: CatalogPage[] = pagesData.map((p: any, idx: number) => ({
    id: `p-${idx + 1}`,
    pageNumber: idx + 1,
    type: p.type || (idx === 0 ? 'cover' : 'product'),
    elements: (Array.isArray(p.elements) ? p.elements : []).map((el: any, elIdx: number) => sanitizeCanvasElement(el, elIdx)),
    backgroundColor: p.backgroundColor || backgroundColor || '#ffffff'
  }));

  const templateObj: SystemTemplate = {
    id: raw.id || 0,
    uuid: raw.uuid || `tmp-${Date.now()}`,
    name,
    category,
    type,
    description,
    pages_data: normalizedPages,
    is_active: true
  };

  return { template: templateObj, pages: normalizedPages };
}
