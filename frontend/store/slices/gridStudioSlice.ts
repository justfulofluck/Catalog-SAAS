import { AppSlice, GridStudioSlice } from '../types';
import { Product, Category, Catalog, CanvasElement, CatalogPage, GridTemplate, PageTemplate, ProductGridSection, PageType } from '../../types';
import { PAGE_WIDTH, PAGE_HEIGHT, THEMES, COVER_TEMPLATES, INDEX_TEMPLATES, CLOSING_TEMPLATES, FULL_CATALOG_TEMPLATES, HEADER_TEMPLATES, FOOTER_TEMPLATES, GRID_TEMPLATES } from '../../constants';
import { normalizeImageUrl, resolveProductImage, resolveProductTitle } from '../../utils/imageUtils';
import { resolveFieldLabel } from '../../utils/fieldUtils';

export const createGridStudioSlice: AppSlice<GridStudioSlice> = (set, get) => ({
  isGridStudioOpen: false,
  gridStudioPageIndex: null,

  applyFullCatalogTemplate: (templateId) => {
    get().pushHistory();
    set((state) => {
      const template = FULL_CATALOG_TEMPLATES.find(t => t.id === templateId);
      if (!template) return state;

      const theme = THEMES.find(t => t.id === template.themeId) || THEMES[0];
      const stamp = Date.now();

      const newPages: CatalogPage[] = template.pages.map((p, idx) => ({
        ...p,
        id: `tpl-page-${stamp}-${idx}`,
        type: p.type || (idx === 0 ? 'cover' : 'interior'),
        elements: p.elements.map((el, elIdx) => {
          const id = el.id.includes('slot') ? `${el.id}-${stamp}` : `el-${idx}-${elIdx}-${stamp}`;
          return {
            ...el,
            id
          };
        })
      }));

      return {
        catalog: {
          ...state.catalog,
          name: template.name,
          pages: newPages,
          backgroundColor: theme.backgroundColor,
          updatedAt: new Date().toISOString(),
          selectedCategoryIds: ['cat1']
        },
        activeThemeId: template.themeId,
        currentPageIndex: 0,
        selectedElementIds: []
      };
    });
  },

  generateCatalogFromTemplate: (name, template, categoryIds, options = { includeCover: true, includeIndex: true, includeCategoryCovers: true, selectedTemplateId: 'tpl-blank' } as any) => set((state) => {
    const theme = THEMES.find(t => t.id === state.activeThemeId) || THEMES[0];

    // Special Case: Blank Template (4 blank pages: Cover, Index, Product, Closing)
    if ((options as any)?.selectedTemplateId === 'tpl-blank') {
      const blankPages: CatalogPage[] = [
        {
          id: `p-cover-blank-${Date.now()}`,
          pageNumber: 1,
          elements: [],
          type: 'cover',
          backgroundColor: '#ffffff'
        },
        {
          id: `p-index-blank-${Date.now()}`,
          pageNumber: 2,
          elements: [],
          type: 'index',
          backgroundColor: '#ffffff'
        },
        {
          id: `p-product-blank-${Date.now()}`,
          pageNumber: 3,
          elements: [],
          type: 'product',
          backgroundColor: '#ffffff'
        },
        {
          id: `p-closing-blank-${Date.now()}`,
          pageNumber: 4,
          elements: [],
          type: 'closing',
          backgroundColor: '#ffffff'
        }
      ];

      return {
        catalog: {
          ...state.catalog,
          id: `cat-${Date.now()}`,
          name,
          status: 'draft',
          pages: blankPages,
          updatedAt: new Date().toISOString()
        },
        currentView: 'editor',
        currentPageIndex: 0,
        selectedElementIds: []
      };
    }

    const allPages: CatalogPage[] = [];
    let currentPageNumber = 1;

    // Resolve Header Settings
    const headerMode = options?.headerMode || 'none'; // 'none' | 'default' | 'template'
    let resolvedHeaderElements: CanvasElement[] = [];
    let resolvedHeaderHeight = 45;
    let hasHeader = false;

    if (headerMode === 'default') {
      hasHeader = true;
      resolvedHeaderHeight = 45;
      resolvedHeaderElements = [
        {
          id: `header-title-${Date.now()}`,
          type: 'text',
          text: name.toUpperCase(),
          x: 40,
          y: 12,
          width: PAGE_WIDTH - 80,
          height: 25,
          fontSize: 11,
          fontFamily: theme.fontFamily || 'Inter',
          fontWeight: 'bold',
          textAlign: 'center',
          fill: '#475569',
          zIndex: 10,
          rotation: 0,
          opacity: 1,
          verticalAlign: 'middle',
        }
      ];
    } else if (headerMode === 'template' && options?.headerTemplateId) {
      const tmpl = state.systemTemplates.find(t => String(t.id) === String(options.headerTemplateId) || t.uuid === String(options.headerTemplateId));
      if (tmpl) {
        hasHeader = true;
        resolvedHeaderElements = (tmpl.pages_data?.[0]?.elements || tmpl.elements || []) as CanvasElement[];
        
        let calculatedH = Number(tmpl.pages_data?.[0]?.height) || Number((tmpl as any).headerHeight) || Number((tmpl as any).height) || 0;
        if (!calculatedH && resolvedHeaderElements.length > 0) {
          resolvedHeaderElements.forEach(el => {
            const b = (Number(el.y) || 0) + (Number(el.height) || 0);
            if (b > calculatedH) calculatedH = b;
          });
        }
        resolvedHeaderHeight = calculatedH || 113.4;
      }
    }

    // Resolve Footer Settings
    const footerMode = options?.footerMode || 'none'; // 'none' | 'default' | 'template'
    let resolvedFooterElements: CanvasElement[] = [];
    let resolvedFooterHeight = 35;
    let hasFooter = false;

    if (footerMode === 'default') {
      hasFooter = true;
      resolvedFooterHeight = 35;
      resolvedFooterElements = [
        {
          id: `footer-page-${Date.now()}`,
          type: 'text',
          text: 'Page {{page}}',
          x: PAGE_WIDTH - 180,
          y: 8,
          width: 140,
          height: 20,
          fontSize: 9,
          fontFamily: theme.fontFamily || 'Inter',
          fontWeight: 'bold',
          textAlign: 'right',
          fill: '#94a3b8',
          zIndex: 10,
          rotation: 0,
          opacity: 1,
          verticalAlign: 'middle',
        }
      ];
    } else if (footerMode === 'template' && options?.footerTemplateId) {
      const tmpl = state.systemTemplates.find(t => String(t.id) === String(options.footerTemplateId) || t.uuid === String(options.footerTemplateId));
      if (tmpl) {
        hasFooter = true;
        resolvedFooterElements = (tmpl.pages_data?.[0]?.elements || tmpl.elements || []) as CanvasElement[];

        let calculatedH = Number(tmpl.pages_data?.[0]?.height) || Number((tmpl as any).footerHeight) || Number((tmpl as any).height) || 0;
        if (!calculatedH && resolvedFooterElements.length > 0) {
          resolvedFooterElements.forEach(el => {
            const b = (Number(el.y) || 0) + (Number(el.height) || 0);
            if (b > calculatedH) calculatedH = b;
          });
        }
        resolvedFooterHeight = calculatedH || 57;
      }
    }

    // 1. Global Cover Page
    if (options.includeCover) {
      let coverElements: CanvasElement[] = [];
      let coverBg = theme.backgroundColor || '#ffffff';

      if (options.coverTemplateId) {
        const tmpl = state.systemTemplates.find(t => String(t.id) === String(options.coverTemplateId) || t.uuid === String(options.coverTemplateId));
        if (tmpl) {
          coverElements = (tmpl.pages_data?.[0]?.elements || tmpl.elements || []) as CanvasElement[];
          coverBg = tmpl.pages_data?.[0]?.backgroundColor || tmpl.backgroundColor || coverBg;
        }
      }

      if (coverElements.length === 0) {
        const coverTemplate = COVER_TEMPLATES[0];
        coverElements = (coverTemplate?.elements || [])
          .filter(el => !(el.type === 'shape' && el.x === 0 && el.y === 0 && el.width === PAGE_WIDTH && el.height === PAGE_HEIGHT))
          .map((el, idx) => {
            const id = `cover-el-${Date.now()}-${idx}`;
            const base = { rotation: 0, opacity: 1, ...el, id };
            if (el.type === 'text') {
              const isHeading = el.fontSize && el.fontSize >= 30;
              return {
                ...base,
                text: isHeading ? name.toUpperCase() : el.text,
                fontFamily: theme.fontFamily,
                fill: el.fill || (isHeading ? theme.headingColor : theme.bodyColor),
                fontWeight: el.fontWeight || (isHeading ? '900' : '400')
              };
            }
            return base;
          }) as CanvasElement[];
      }

      allPages.push({
        id: `p-cover-global`,
        pageNumber: currentPageNumber++,
        elements: coverElements,
        type: 'cover',
        backgroundColor: coverBg
      });
    }

    // Dynamic safety zones
    const curCatalog = state.catalog;
    const headerH = hasHeader ? (resolvedHeaderHeight || 45) : 0;
    const footerH = hasFooter ? (resolvedFooterHeight || 35) : 0;
    const marginTop = curCatalog.marginTop || 0;
    const marginBottom = curCatalog.marginBottom || 0;

    // Determine initial page counter for content (taking Index into account if enabled)
    // If index is enabled, it will take the current `currentPageNumber` slot, so content starts at `currentPageNumber + 1`
    let contentPageCounter = options.includeIndex ? currentPageNumber + 1 : currentPageNumber;

    // TOC Data container
    const tocEntries: { name: string; pageNumber: number }[] = [];

    const generatePageElements = (productsForPage: Product[]) => {
      const gridElements: CanvasElement[] = [];

      if (template.decorations) {
        template.decorations.forEach((dec, idx) => {
          gridElements.push({
            ...dec,
            id: `dec-${Date.now()}-${Math.random()}-${idx}`,
            zIndex: dec.zIndex || -1
          } as CanvasElement);
        });
      }

      const padding = template.padding;
      const spacing = template.spacing;

      const leftMargin = curCatalog.marginLeft !== undefined ? curCatalog.marginLeft : padding;
      const rightMargin = curCatalog.marginRight !== undefined ? curCatalog.marginRight : padding;
      const topMargin = curCatalog.marginTop !== undefined ? curCatalog.marginTop : padding;
      const bottomMargin = curCatalog.marginBottom !== undefined ? curCatalog.marginBottom : padding;

      const availableWidth = PAGE_WIDTH - leftMargin - rightMargin;
      const availableHeight = PAGE_HEIGHT - topMargin - bottomMargin - headerH - footerH;
      const slotWidth = (availableWidth - (template.cols - 1) * spacing) / template.cols;
      const slotHeight = (availableHeight - (template.rows - 1) * spacing) / template.rows;

      productsForPage.forEach((product, index) => {
        const col = index % template.cols;
        const row = Math.floor(index / template.cols);
        const x = leftMargin + col * (slotWidth + spacing);
        const y = headerH + topMargin + row * (slotHeight + spacing);

        gridElements.push({
          id: `product-block-${row}-${col}-${Date.now()}-${Math.random()}`,
          type: 'product-block',
          x, y, width: slotWidth, height: slotHeight,
          rotation: 0, opacity: 1, productId: product.id, zIndex: 1,
          cardTheme: template.cardTheme || 'classic-stack'
        } as CanvasElement);
      });
      return gridElements;
    };

    // Dynamic target table headers for generated tables
    const targetHeaders: string[] = options?.tableHeaders && options.tableHeaders.length > 0
      ? options.tableHeaders
      : ['MODEL NO', 'PRODUCTS', 'CUT-OUT', 'PRICE', 'COLOR'];

    // Helper to generate a table row matching targetHeaders from a product or variant
    const generateCatalogRow = (headers: string[], p: Product, v?: ProductVariant): string[] => {
      const findCustomValue = (keyQuery: string): string | null => {
        const targetNorm = keyQuery.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!targetNorm) return null;

        const matchingSchemaIds: string[] = [];
        for (const cat of state.categories) {
          if (cat.customSchema && Array.isArray(cat.customSchema)) {
            for (const f of cat.customSchema) {
              const fLabelNorm = (f.label || '').toLowerCase().replace(/[^a-z0-9]/g, '');
              const fKeyNorm = (f.key || '').toLowerCase().replace(/[^a-z0-9]/g, '');
              const fNameNorm = (f.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
              if (fLabelNorm === targetNorm || fKeyNorm === targetNorm || fNameNorm === targetNorm ||
                (fLabelNorm && (fLabelNorm.includes(targetNorm) || targetNorm.includes(fLabelNorm)))) {
                if (f.id) matchingSchemaIds.push(f.id);
              }
            }
          }
        }

        // 1. Check variant.customAttributes
        if (v?.customAttributes && typeof v.customAttributes === 'object') {
          if (v.customAttributes[keyQuery] !== undefined && v.customAttributes[keyQuery] !== null) {
            const val = String(v.customAttributes[keyQuery]).trim();
            if (val && val !== '-') return val;
          }
          for (const [k, val] of Object.entries(v.customAttributes)) {
            if (matchingSchemaIds.some(sId => sId.toLowerCase() === k.toLowerCase())) {
              if (val !== undefined && val !== null) {
                const s = String(val).trim();
                if (s && s !== '-') return s;
              }
            }
          }
          for (const [k, val] of Object.entries(v.customAttributes)) {
            const resolved = resolveFieldLabel(k, state.categories as any, p);
            if (resolved && resolved.toLowerCase().replace(/[^a-z0-9]/g, '') === targetNorm) {
              if (val !== undefined && val !== null) {
                const s = String(val).trim();
                if (s && s !== '-') return s;
              }
            }
          }
        }

        // 2. Check product.customFields
        if (p.customFields && typeof p.customFields === 'object') {
          if (p.customFields[keyQuery] !== undefined && p.customFields[keyQuery] !== null) {
            const val = String(p.customFields[keyQuery]).trim();
            if (val && val !== '-') return val;
          }
          for (const [k, val] of Object.entries(p.customFields)) {
            if (matchingSchemaIds.some(sId => sId.toLowerCase() === k.toLowerCase())) {
              if (val !== undefined && val !== null) {
                const s = String(val).trim();
                if (s && s !== '-') return s;
              }
            }
          }
          for (const [k, val] of Object.entries(p.customFields)) {
            const resolved = resolveFieldLabel(k, state.categories as any, p);
            if (resolved && resolved.toLowerCase().replace(/[^a-z0-9]/g, '') === targetNorm) {
              if (val !== undefined && val !== null) {
                const s = String(val).trim();
                if (s && s !== '-') return s;
              }
            }
          }
        }

        return null;
      };

      return headers.map(hdr => {
        const h = hdr.toLowerCase().replace(/[^a-z0-9]/g, '');

        // Direct custom field match
        const customMatch = findCustomValue(hdr);
        if (customMatch) return customMatch;

        // Model Number (Strictly Model No - never SKU fallback)
        if (h.includes('model') || h.includes('itemno') || h === 'item' || h === 'code' || h === 'itemcode') {
          const modelVal = findCustomValue('model_no') || findCustomValue('model') ||
            findCustomValue('model_number') || findCustomValue('modelno') ||
            findCustomValue('item_code') || findCustomValue('item_no') ||
            findCustomValue('item_number');
          if (modelVal) return modelVal;
          return '-';
        }

        // SKU (Only if explicitly SKU)
        if (h === 'sku') {
          const skuVal = findCustomValue('sku');
          if (skuVal) return skuVal;
          if (v?.sku && v.sku !== '-' && !v.sku.startsWith('Untitled') && !v.sku.startsWith('GEN-') && !v.sku.startsWith('PRE-')) {
            return v.sku;
          }
          if (p.sku && p.sku !== '-' && !p.sku.startsWith('Untitled') && !p.sku.startsWith('GEN-') && !p.sku.startsWith('PRE-')) {
            return p.sku;
          }
          return '-';
        }

        // Product Name / Description
        if (h.includes('product') || h.includes('spec') || h.includes('desc') || h.includes('name') || h.includes('title')) {
          const nameVal = findCustomValue('product_name') || findCustomValue('description') || findCustomValue('spec') || findCustomValue('title');
          if (nameVal) return nameVal;
          if (v?.name && v.name !== 'Untitled Product' && v.name !== '-') return v.name;
          if (p.name && p.name !== 'Untitled Product' && p.name !== '-') return p.name;
          return '-';
        }

        // Cut-out / Size / Dimension
        if (h.includes('cut') || h.includes('size') || h.includes('dim') || h.includes('dia')) {
          const cutVal = findCustomValue('cut_out') || findCustomValue('cutout') || findCustomValue('size') || findCustomValue('dimension') || findCustomValue('dia');
          if (cutVal) return cutVal;
          if (v?.cutOut && v.cutOut !== '-') return v.cutOut;
          return '-';
        }

        // Price / MRP / DLP
        if (h.includes('price') || h.includes('mrp') || h.includes('rate') || h.includes('dlp') || h.includes('dealer')) {
          const priceVal = findCustomValue('price') || findCustomValue('mrp') || findCustomValue('dealer_price') || findCustomValue('dlp') || findCustomValue('rate');
          if (priceVal) return priceVal;
          const numPrice = v?.price ?? p.price;
          if (numPrice !== undefined && numPrice !== null && numPrice !== '' && numPrice !== '-') {
            return String(numPrice).startsWith('₹') || String(numPrice).startsWith('$') ? String(numPrice) : `${p.currency || '₹'}${numPrice}`;
          }
          return '-';
        }

        // Color / CCT / Shade
        if (h.includes('color') || h.includes('cct') || h.includes('shade') || h.includes('temp')) {
          const colorVal = findCustomValue('color') || findCustomValue('cct') || findCustomValue('shade') || findCustomValue('temperature');
          if (colorVal) return colorVal;
          if (v?.color && v.color !== '-') return v.color;
          return '-';
        }

        // Packing / Box Qty
        if (h.includes('pack') || h.includes('box') || h.includes('qty')) {
          const packVal = findCustomValue('packing') || findCustomValue('box_qty') || findCustomValue('qty') || findCustomValue('pack');
          if (packVal) return packVal;
          if (v?.packing && v.packing !== '-') return v.packing;
          return '-';
        }

        // Wattage / Power
        if (h.includes('watt') || h.includes('power')) {
          const powerVal = findCustomValue('wattage') || findCustomValue('power') || findCustomValue('watt') || findCustomValue('watts');
          if (powerVal) return powerVal;
          return '-';
        }

        return '-';
      });
    };

    const categoryLayouts = options?.categoryLayouts || {};
    const defaultLayoutId = options?.defaultLayoutId || (options?.selectedTemplateId === 'tpl-v-tac' || !options?.selectedTemplateId ? 'table-3grid' : 'cards-2x2');

    const getLayoutForCategory = (catId: string): string => {
      return categoryLayouts[catId] || defaultLayoutId;
    };

    // Helper for rendering 2x2 or 3x3 Card Grid pages
    const generateCardElementsForPage = (
      productsForPage: Product[],
      cols: number,
      rows: number,
      cardTheme: string = 'classic-stack'
    ): CanvasElement[] => {
      const gridElements: CanvasElement[] = [];
      const padding = curCatalog.marginLeft !== undefined ? curCatalog.marginLeft : 35;
      const spacing = 16;

      const leftMargin = curCatalog.marginLeft !== undefined ? curCatalog.marginLeft : padding;
      const rightMargin = curCatalog.marginRight !== undefined ? curCatalog.marginRight : padding;
      const topMargin = curCatalog.marginTop !== undefined ? curCatalog.marginTop : padding;
      const bottomMargin = curCatalog.marginBottom !== undefined ? curCatalog.marginBottom : padding;

      const availableWidth = PAGE_WIDTH - leftMargin - rightMargin;
      const availableHeight = PAGE_HEIGHT - topMargin - bottomMargin - headerH - footerH;
      const slotWidth = (availableWidth - (cols - 1) * spacing) / cols;
      const slotHeight = (availableHeight - (rows - 1) * spacing) / rows;

      productsForPage.forEach((product, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        const x = leftMargin + col * (slotWidth + spacing);
        const y = headerH + topMargin + row * (slotHeight + spacing);

        gridElements.push({
          id: `product-block-${row}-${col}-${Date.now()}-${Math.random()}`,
          type: 'product-block',
          x,
          y,
          width: slotWidth,
          height: slotHeight,
          rotation: 0,
          opacity: 1,
          productId: product.id,
          zIndex: 1,
          cardTheme: options?.cardFields?.cardTheme || cardTheme,
          showPrice: options?.cardFields?.showPrice !== false,
          showSku: options?.cardFields?.showSku !== false,
          showName: options?.cardFields?.showTitle !== false
        } as CanvasElement);
      });

      return gridElements;
    };

    // Group selected categories sequentially by layout style
    const categoryGroups: { layout: string; catIds: string[] }[] = [];
    categoryIds.forEach(catId => {
      const layout = getLayoutForCategory(catId);
      const lastGroup = categoryGroups[categoryGroups.length - 1];
      if (lastGroup && lastGroup.layout === layout && layout === 'table-3grid') {
        // Multiple consecutive table categories can share 3-grid pages
        lastGroup.catIds.push(catId);
      } else {
        categoryGroups.push({ layout, catIds: [catId] });
      }
    });

    const leftMargin = curCatalog.marginLeft || 35;
    const rightMargin = curCatalog.marginRight || 35;
    const contentWidth = PAGE_WIDTH - leftMargin - rightMargin;

    // Process each category group
    categoryGroups.forEach((group, gIdx) => {
      if (group.layout === 'table-3grid') {
        // 1. Build 3-Grid specification table sections
        const categorySections: ProductGridSection[] = [];

        group.catIds.forEach((categoryId, catIdx) => {
          const catProducts = state.products.filter(p => String(p.categoryId) === String(categoryId));
          const category = state.categories.find(c => String(c.id) === String(categoryId));
          if (!category && catProducts.length === 0) return;

          const catName = category?.name || `Category ${catIdx + 1}`;
          const catImg = resolveProductImage(catProducts[0], category, catProducts);
          const headers = [...targetHeaders];

          const rows: string[][] = [];
          catProducts.forEach(prod => {
            if (prod.variants && prod.variants.length > 0) {
              prod.variants.forEach(v => rows.push(generateCatalogRow(headers, prod, v)));
            } else {
              rows.push(generateCatalogRow(headers, prod));
            }
          });

          if (rows.length === 0) {
            rows.push(headers.map((h, i) => i === 1 ? `${catName} Series` : '-'));
          }

          categorySections.push({
            id: `sec-${Date.now()}-${catIdx}`,
            title: catName.toUpperCase(),
            titleColor: '#00a651',
            titleFontSize: 22,
            imageSrc: catImg,
            hasBackground: false,
            backgroundColor: '#e2e8f0',
            tableData: {
              headers,
              rows,
              headerBg: '#002b36',
              headerTextColor: '#ffffff',
              alternateRowBg: '#f8fafc',
              rowBg: '#ffffff',
              borderColor: '#002b36',
              fontSize: 7.5,
              headerFontSize: 8,
              cellPadding: 4
            }
          });

          tocEntries.push({
            name: catName,
            pageNumber: contentPageCounter
          });
        });

        // Bucket sections into pages (up to 3 sections per page)
        const pageBuckets: { sections: ProductGridSection[] }[] = [];
        for (let i = 0; i < categorySections.length; i += 3) {
          const chunk = categorySections.slice(i, i + 3).map((sec, sIdx) => ({
            ...sec,
            hasBackground: sIdx % 2 === 1
          }));
          pageBuckets.push({ sections: chunk });
        }

        pageBuckets.forEach((bucket, pIdx) => {
          const pageNumber = contentPageCounter++;
          const pageHasHeader = curCatalog.hasHeader !== false;
          const pageHasFooter = curCatalog.hasFooter !== false;
          const curHeaderH = pageHasHeader ? (curCatalog.headerHeight || 113.4) : 0;
          const curFooterH = pageHasFooter ? (curCatalog.footerHeight || 75.6) : 0;

          const topBound = Math.max(curHeaderH + 15, curCatalog.marginTop || 20);
          const bottomBound = PAGE_HEIGHT - Math.max(curFooterH + 15, curCatalog.marginBottom || 20);
          const availableHeight = bottomBound - topBound;

          const sectionCount = Math.max(1, bucket.sections.length);
          const baseSlotCount = Math.max(3, sectionCount);
          const gap = 15;
          const totalGaps = (baseSlotCount - 1) * gap;
          const standardSlotHeight = Math.max(100, Math.floor((availableHeight - totalGaps) / baseSlotCount));
          const sectionHeight = standardSlotHeight;

          const elements: CanvasElement[] = [];
          const timestamp = Date.now();

          bucket.sections.forEach((sec, idx) => {
            const curY = Math.round(topBound + idx * (sectionHeight + gap));
            const sectionId = `grid-sec-${timestamp}-${gIdx}-${pIdx}-${idx}`;

            // Background Stripe
            if (sec.hasBackground) {
              elements.push({
                id: `${sectionId}-bg`,
                type: 'shape',
                shapeType: 'rect',
                x: 0,
                y: curY - 5,
                width: PAGE_WIDTH,
                height: sectionHeight + 10,
                fill: sec.backgroundColor || '#e2e8f0',
                zIndex: idx * 10 + 1,
                rotation: 0,
                opacity: 1,
                sectionTag: sectionId
              });
            }

            // Right Title
            const rightX = leftMargin + 255;
            const rightWidth = Math.max(200, contentWidth - 255);

            elements.push({
              id: `${sectionId}-title`,
              type: 'text',
              x: rightX,
              y: curY + 4,
              width: rightWidth,
              height: 32,
              text: sec.title || `PRODUCT SERIES ${idx + 1}`,
              fontSize: sec.titleFontSize || 26,
              fontFamily: 'Bebas Neue',
              fontWeight: 'bold',
              fill: sec.titleColor || '#00a651',
              letterSpacing: 0.5,
              zIndex: idx * 10 + 3,
              rotation: 0,
              opacity: 1,
              sectionTag: sectionId
            });

            // Table
            const tableY = curY + 40;
            elements.push({
              id: `${sectionId}-table`,
              type: 'table',
              x: rightX,
              y: tableY,
              width: rightWidth,
              height: Math.max(60, sectionHeight - 45),
              tableData: sec.tableData,
              zIndex: idx * 10 + 4,
              rotation: 0,
              opacity: 1,
              sectionTag: sectionId
            });

            // Product / Category Image — positioned perpendicular (horizontally aligned) to the Table
            const imageWidth = 240;
            const availableImgHeight = Math.max(70, sectionHeight - 45);
            const imageHeight = Math.min(240, availableImgHeight);
            const finalImgSrc = normalizeImageUrl(sec.imageSrc) || 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=600';
            elements.push({
              id: `${sectionId}-img`,
              type: 'image',
              x: leftMargin,
              y: tableY,
              width: imageWidth,
              height: imageHeight,
              src: finalImgSrc,
              zIndex: idx * 10 + 2,
              rotation: 0,
              opacity: 1,
              sectionTag: sectionId
            });
          });

          allPages.push({
            id: `page-gen-table-${timestamp}-${gIdx}-${pIdx}`,
            pageNumber,
            type: 'interior',
            title: `Product Spec Page ${pageNumber}`,
            orientation: 'portrait',
            backgroundColor: '#ffffff',
            elements
          });
        });
      } else {
        // 2. Card Grid Layouts (cards-2x2, cards-3x3, etc.)
        const is3x3 = group.layout === 'cards-3x3';
        const cols = is3x3 ? 3 : 2;
        const rows = is3x3 ? 3 : 2;
        const perPage = cols * rows;

        group.catIds.forEach(categoryId => {
          const catProducts = state.products.filter(p => String(p.categoryId) === String(categoryId));
          const category = state.categories.find(c => String(c.id) === String(categoryId));
          if (catProducts.length === 0) return;

          tocEntries.push({
            name: category?.name || 'Category',
            pageNumber: contentPageCounter
          });

          for (let i = 0; i < catProducts.length; i += perPage) {
            const pageNumber = contentPageCounter++;
            const chunk = catProducts.slice(i, i + perPage);
            const cardElements = generateCardElementsForPage(chunk, cols, rows);

            allPages.push({
              id: `page-gen-cards-${Date.now()}-${categoryId}-${i}`,
              pageNumber,
              type: 'interior',
              title: `${category?.name || 'Category'} - Page ${pageNumber}`,
              orientation: 'portrait',
              backgroundColor: '#ffffff',
              elements: cardElements
            });
          }
        });
      }
    });

    // Generate and Insert Index Page if enabled
    if (options.includeIndex) {
      const indexElements: CanvasElement[] = [
        {
          id: `idx-title-${Date.now()}`,
          type: 'text',
          x: 60, y: marginTop + 40, width: PAGE_WIDTH - 120, height: 80,
          text: 'INDEX',
          fontSize: 52,
          fontFamily: theme.headingFont,
          fontWeight: '900',
          fill: theme.headingColor,
          zIndex: 1, rotation: 0, opacity: 1
        },
        {
          id: `idx-line-${Date.now()}`,
          type: 'shape',
          shapeType: 'rect',
          x: 60, y: marginTop + 125, width: 100, height: 8,
          fill: theme.accentColor,
          zIndex: 1, rotation: 0, opacity: 1
        }
      ];

      let currentY = marginTop + 220;
      tocEntries.forEach((entry, i) => {
        indexElements.push({
          id: `idx-entry-name-${i}-${Date.now()}`,
          type: 'text',
          x: 60, y: currentY, width: 500, height: 30,
          text: entry.name.toUpperCase(),
          fontSize: 14,
          fontFamily: theme.fontFamily,
          fontWeight: '700',
          fill: theme.headingColor,
          zIndex: 2, rotation: 0, opacity: 1
        });

        // Separator line
        indexElements.push({
          id: `idx-entry-line-${i}-${Date.now()}`,
          type: 'shape',
          shapeType: 'rect',
          x: 60, y: currentY + 40, width: PAGE_WIDTH - 120, height: 1,
          fill: theme.bodyColor,
          opacity: 0.1,
          zIndex: 1, rotation: 0
        });

        indexElements.push({
          id: `idx-entry-num-${i}-${Date.now()}`,
          type: 'text',
          x: PAGE_WIDTH - 100, y: currentY, width: 40, height: 30,
          text: entry.pageNumber.toString().padStart(2, '0'),
          fontSize: 14,
          fontFamily: theme.fontFamily,
          fontWeight: '700',
          fill: theme.accentColor,
          textAlign: 'right',
          zIndex: 2, rotation: 0, opacity: 1
        });

        currentY += 80;
      });

      const indexPage: CatalogPage = {
        id: `p-index-generated`,
        pageNumber: currentPageNumber, // Use the slot reserved for index
        elements: indexElements,
        type: 'index',
        backgroundColor: theme.backgroundColor
      };

      // Insert Index Page
      const insertIndex = options.includeCover ? 1 : 0;
      allPages.splice(insertIndex, 0, indexPage);
    }

    const allCategoryProducts = state.products.filter(p => p.categoryId && categoryIds.includes(p.categoryId));

    return {
      catalog: {
        ...state.catalog,
        id: `cat-${Date.now()}`,
        name,
        status: 'draft',
        hasHeader,
        headerElements: resolvedHeaderElements,
        headerHeight: resolvedHeaderHeight,
        hasFooter,
        footerElements: resolvedFooterElements,
        footerHeight: resolvedFooterHeight,
        pages: allPages,
        updatedAt: new Date().toISOString()
      },
      currentView: 'editor',
      currentPageIndex: 0,
      selectedElementIds: []
    };
  }),

  applyCoverTemplate: (pageIndex: number | null, template: PageTemplate) => {
    get().pushHistory();
    set((state) => {
      const theme = THEMES.find(t => t.id === state.activeThemeId) || THEMES[0];
      const newPages = [...state.catalog.pages];

      const applyToPage = (idx: number) => {
        const targetPage = newPages[idx];
        // Guard: Cannot apply cover to intro, index, closing, etc.
        if (targetPage && targetPage.type !== 'cover' && targetPage.type !== 'blank') {
          console.warn(`Cannot apply cover template to a ${targetPage.type} page.`);
          return;
        }

        const themedElements = template.elements
          .filter(el => !(el.type === 'shape' && el.x === 0 && el.y === 0 && el.width === PAGE_WIDTH && el.height === PAGE_HEIGHT))
          .map((el, eIdx) => {
            const id = `cover-el-${Date.now()}-${idx}-${eIdx}`;
            const base = { rotation: 0, opacity: 1, ...el, id };
            if (el.type === 'text') {
              const isHeading = el.fontSize && el.fontSize >= 30;
              return {
                ...base,
                fontFamily: el.fontFamily || theme.fontFamily,
                fill: el.fill || (isHeading ? theme.headingColor : theme.bodyColor),
                fontWeight: el.fontWeight || (isHeading ? '900' : '400')
              };
            }
            return base;
          });
        newPages[idx] = {
          ...newPages[idx],
          elements: themedElements as CanvasElement[],
          type: 'cover',
          backgroundColor: template.backgroundColor || theme.backgroundColor
        };
      };

      if (pageIndex === null) {
        newPages.forEach((p, i) => { if (p.type === 'cover') applyToPage(i); });
      } else {
        applyToPage(pageIndex);
      }

      return { catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() }, selectedElementIds: [] };
    });
  },

  applyIndexTemplate: (pageIndex, template) => {
    get().pushHistory();
    set((state) => {
      const theme = THEMES.find(t => t.id === state.activeThemeId) || THEMES[0];
      const newPages = [...state.catalog.pages];

      const applyToPage = (idx: number) => {
        const targetPage = newPages[idx];
        // Guard: Cannot apply index template to intro, cover, product, closing pages
        if (targetPage && targetPage.type !== 'index' && targetPage.type !== 'blank') {
          console.warn(`Cannot apply index template to a ${targetPage.type} page.`);
          return;
        }

        const themedElements = template.elements
          .filter(el => !(el.type === 'shape' && el.x === 0 && el.y === 0 && el.width === PAGE_WIDTH && el.height === PAGE_HEIGHT))
          .map((el, eIdx) => {
            const id = `index-el-${Date.now()}-${idx}-${eIdx}`;
            const base = { rotation: 0, opacity: 1, ...el, id };
            if (el.type === 'text') {
              const isHeading = el.fontSize && el.fontSize >= 30;
              return {
                ...base,
                fontFamily: el.fontFamily || (isHeading ? theme.headingFont : theme.fontFamily),
                fill: el.fill || (isHeading ? theme.headingColor : theme.bodyColor),
                fontWeight: el.fontWeight || (isHeading ? '900' : '400')
              };
            }
            return base;
          });
        newPages[idx] = {
          ...newPages[idx],
          elements: themedElements as CanvasElement[],
          type: 'index',
          backgroundColor: template.backgroundColor || theme.backgroundColor
        };
      };

      if (pageIndex === null) {
        newPages.forEach((p, i) => { if (p.type === 'index') applyToPage(i); });
      } else {
        applyToPage(pageIndex);
      }

      return { catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() }, selectedElementIds: [] };
    });
  },

  applyClosingTemplate: (pageIndex, template) => {
    get().pushHistory();
    set((state) => {
      const theme = THEMES.find(t => t.id === state.activeThemeId) || THEMES[0];
      const newPages = [...state.catalog.pages];

      const applyToPage = (idx: number) => {
        const targetPage = newPages[idx];
        // Guard: Cannot apply closing template to intro, cover, product, index pages
        if (targetPage && targetPage.type !== 'closing' && targetPage.type !== 'blank') {
          console.warn(`Cannot apply closing template to a ${targetPage.type} page.`);
          return;
        }

        const themedElements = template.elements
          .filter(el => !(el.type === 'shape' && el.x === 0 && el.y === 0 && el.width === PAGE_WIDTH && el.height === PAGE_HEIGHT))
          .map((el, eIdx) => {
            const id = `closing-el-${Date.now()}-${idx}-${eIdx}`;
            const base = { rotation: 0, opacity: 1, ...el, id };
            if (el.type === 'text') {
              const isHeading = el.fontSize && el.fontSize >= 30;
              return {
                ...base,
                fontFamily: el.fontFamily || (isHeading ? theme.headingFont : theme.fontFamily),
                fill: theme.bodyColor, // Default theme color if not specified
                fontWeight: el.fontWeight || (isHeading ? '900' : '400')
              };
            }
            return base;
          });
        newPages[idx] = {
          ...newPages[idx],
          elements: themedElements as CanvasElement[],
          type: 'closing',
          backgroundColor: template.backgroundColor || theme.backgroundColor
        };
      };

      if (pageIndex === null) {
        newPages.forEach((p, i) => { if (p.type === 'closing') applyToPage(i); });
      } else {
        applyToPage(pageIndex);
      }

      return { catalog: { ...state.catalog, pages: newPages, updatedAt: new Date().toISOString() }, selectedElementIds: [] };
    });
  },


  applyInventoryLayout: (pageIndex, template) => {
    get().pushHistory();
    set((state) => {
      const theme = THEMES.find(t => t.id === state.activeThemeId) || THEMES[0];
      let currentCatalogPages = [...state.catalog.pages];

      // In global mode (pageIndex === null), apply cover/index/closing templates to respective pages
      if (pageIndex === null) {
        // Apply cover template to all cover pages
        const coverTemplate = COVER_TEMPLATES[0];
        if (coverTemplate) {
          currentCatalogPages.forEach((p, i) => {
            if (p.type === 'cover') {
              const themedElements = coverTemplate.elements.map((el, eIdx) => {
                const id = `cover-el-${Date.now()}-${i}-${eIdx}`;
                const base = { rotation: 0, opacity: 1, ...el, id };
                if (el.type === 'text') {
                  const isHeading = el.fontSize && el.fontSize >= 30;
                  return {
                    ...base,
                    fontFamily: el.fontFamily || theme.fontFamily,
                    fill: el.fill || (isHeading ? theme.headingColor : theme.bodyColor),
                    fontWeight: el.fontWeight || (isHeading ? '900' : '400')
                  };
                }
                return base;
              });
              currentCatalogPages[i] = { ...p, elements: themedElements as CanvasElement[] };
            }
          });
        }

        // Apply index template to all index pages
        const indexTemplate = INDEX_TEMPLATES[0];
        if (indexTemplate) {
          currentCatalogPages.forEach((p, i) => {
            if (p.type === 'index') {
              const themedElements = indexTemplate.elements.map((el, eIdx) => {
                const id = `index-el-${Date.now()}-${i}-${eIdx}`;
                const base = { rotation: 0, opacity: 1, ...el, id };
                if (el.type === 'text') {
                  const isHeading = el.fontSize && el.fontSize >= 30;
                  return {
                    ...base,
                    fontFamily: el.fontFamily || (isHeading ? theme.headingFont : theme.fontFamily),
                    fill: el.fill || (isHeading ? theme.headingColor : theme.bodyColor),
                    fontWeight: el.fontWeight || (isHeading ? '900' : '400')
                  };
                }
                return base;
              });
              currentCatalogPages[i] = { ...p, elements: themedElements as CanvasElement[] };
            }
          });
        }

        // Apply closing template to all closing pages
        const closingTemplate = CLOSING_TEMPLATES[0];
        if (closingTemplate) {
          currentCatalogPages.forEach((p, i) => {
            if (p.type === 'closing') {
              const themedElements = closingTemplate.elements.map((el, eIdx) => {
                const id = `closing-el-${Date.now()}-${i}-${eIdx}`;
                const base = { rotation: 0, opacity: 1, ...el, id };
                if (el.type === 'text') {
                  const isHeading = el.fontSize && el.fontSize >= 30;
                  return {
                    ...base,
                    fontFamily: el.fontFamily || (isHeading ? theme.headingFont : theme.fontFamily),
                    fill: el.fill || (isHeading ? theme.headingColor : theme.bodyColor),
                    fontWeight: el.fontWeight || (isHeading ? '900' : '400')
                  };
                }
                return base;
              });
              currentCatalogPages[i] = { ...p, elements: themedElements as CanvasElement[] };
            }
          });
        }
      }

      // If pageIndex is NOT null, we ONLY update that specific single page!
      if (pageIndex !== null && pageIndex >= 0 && pageIndex < currentCatalogPages.length) {
        const targetPage = currentCatalogPages[pageIndex];

        // STRICT RULE: Body Grid CANNOT be applied to Cover, Intro, Index, or Closing pages!
        if (targetPage.type === 'cover' || targetPage.type === 'intro' || targetPage.type === 'index' || targetPage.type === 'closing') {
          console.warn(`Cannot apply body grid layout to a ${targetPage.type} page.`);
          return state;
        }
        const existingProductIds = targetPage.elements
          .filter(el => el.type === 'product-block' && el.productId)
          .map(el => el.productId as string);

        let targetProducts: Product[] = existingProductIds
          .map(id => state.products.find(p => p.id === id))
          .filter(Boolean) as Product[];

        if (targetProducts.length === 0) {
          const catId = targetPage.categoryId || state.catalog.selectedCategoryIds?.[0] || state.categories[0]?.id;
          targetProducts = state.products.filter(p => p.categoryId === catId);
        }

        const itemsPerPage = template.cols * template.rows;
        const pageProducts = targetProducts.slice(0, itemsPerPage);

        const curCatalog = state.catalog;
        const headerH = curCatalog.hasHeader ? (curCatalog.headerHeight || 40) : 0;
        const footerH = curCatalog.hasFooter ? (curCatalog.footerHeight || 40) : 0;

        const padding = template.padding || 35;
        const spacing = template.spacing || 20;

        const leftMargin = template.padding !== undefined ? template.padding : (curCatalog.marginLeft ?? 35);
        const rightMargin = template.padding !== undefined ? template.padding : (curCatalog.marginRight ?? 35);
        const topMargin = template.padding !== undefined ? template.padding : (curCatalog.marginTop ?? 35);
        const bottomMargin = template.padding !== undefined ? template.padding : (curCatalog.marginBottom ?? 35);

        const availableWidth = Math.max(100, PAGE_WIDTH - leftMargin - rightMargin);
        const availableHeight = Math.max(100, PAGE_HEIGHT - topMargin - bottomMargin - headerH - footerH);
        const slotWidth = Math.max(50, (availableWidth - (template.cols - 1) * spacing) / template.cols);
        const slotHeight = Math.max(50, (availableHeight - (template.rows - 1) * spacing) / template.rows);

        const newGridElements: CanvasElement[] = [];

        // Add decorations if any
        if (template.decorations) {
          template.decorations.forEach((dec, idx) => {
            newGridElements.push({
              ...dec,
              id: `dec-${Date.now()}-${pageIndex}-${idx}`,
              zIndex: dec.zIndex || -1
            } as CanvasElement);
          });
        }

        // Keep non-product elements (like user added text, shapes, stamps)
        const preservedElements = targetPage.elements.filter(
          el => el.type !== 'product-block' && !el.id?.startsWith('dec-') && !el.id?.startsWith('pb-')
        );

        pageProducts.forEach((product, index) => {
          const col = index % template.cols;
          const row = Math.floor(index / template.cols);
          const x = leftMargin + col * (slotWidth + spacing);
          const y = headerH + topMargin + row * (slotHeight + spacing);

          newGridElements.push({
            id: `pb-${Date.now()}-${pageIndex}-${index}`,
            type: 'product-block',
            x, y, width: slotWidth, height: slotHeight,
            rotation: 0, opacity: 1, productId: product.id, zIndex: 1,
            cardTheme: template.cardTheme || 'classic-stack'
          } as CanvasElement);
        });

        currentCatalogPages[pageIndex] = {
          ...targetPage,
          elements: [...preservedElements, ...newGridElements],
          type: 'product',
          backgroundColor: template.backgroundColor || targetPage.backgroundColor || state.catalog.backgroundColor
        };

        return {
          catalog: {
            ...state.catalog,
            pages: currentCatalogPages,
            updatedAt: new Date().toISOString()
          },
          currentPageIndex: pageIndex,
          selectedElementIds: []
        };
      }

      // Global mode (pageIndex === null): Reflow all product/interior pages across categories
      const pagesToProcess = state.catalog.pages.filter(p => p.type === 'product' || p.type === 'interior');

      const categoryIdsToProcess = Array.from(new Set(pagesToProcess.map(p => {
        if (p.categoryId) return p.categoryId;
        const firstProd = p.elements.find(el => el.productId);
        if (firstProd?.productId) return state.products.find(prod => prod.id === firstProd.productId)?.categoryId;
        return null;
      }).filter(Boolean))) as string[];

      if (categoryIdsToProcess.length === 0) categoryIdsToProcess.push(state.catalog.selectedCategoryIds?.[0] || 'cat1');

      categoryIdsToProcess.forEach(targetCategoryId => {
        const catProducts = state.products.filter(p => p.categoryId === targetCategoryId);
        const itemsPerPage = template.cols * template.rows;

        const generatePageElements = (chunk: Product[], pageOrder: number) => {
          const gridElements: CanvasElement[] = [];

          if (template.decorations) {
            template.decorations.forEach((dec, idx) => {
              gridElements.push({
                ...dec,
                id: `dec-reflow-${Date.now()}-${pageOrder}-${idx}`,
                zIndex: dec.zIndex || -1
              } as CanvasElement);
            });
          }

          const curCatalog = state.catalog;
          const headerH = curCatalog.hasHeader ? (curCatalog.headerHeight || 40) : 0;
          const footerH = curCatalog.hasFooter ? (curCatalog.footerHeight || 40) : 0;

          const padding = template.padding || 35;
          const spacing = template.spacing || 20;

          const leftMargin = template.padding !== undefined ? template.padding : (curCatalog.marginLeft ?? 35);
          const rightMargin = template.padding !== undefined ? template.padding : (curCatalog.marginRight ?? 35);
          const topMargin = template.padding !== undefined ? template.padding : (curCatalog.marginTop ?? 35);
          const bottomMargin = template.padding !== undefined ? template.padding : (curCatalog.marginBottom ?? 35);

          const availableWidth = Math.max(100, PAGE_WIDTH - leftMargin - rightMargin);
          const availableHeight = Math.max(100, PAGE_HEIGHT - topMargin - bottomMargin - headerH - footerH);
          const slotWidth = Math.max(50, (availableWidth - (template.cols - 1) * spacing) / template.cols);
          const slotHeight = Math.max(50, (availableHeight - (template.rows - 1) * spacing) / template.rows);

          chunk.forEach((product, index) => {
            const col = index % template.cols;
            const row = Math.floor(index / template.cols);
            const x = leftMargin + col * (slotWidth + spacing);
            const y = headerH + topMargin + row * (slotHeight + spacing);

            gridElements.push({
              id: `pb-reflow-${Date.now()}-${pageOrder}-${index}`,
              type: 'product-block',
              x, y, width: slotWidth, height: slotHeight,
              rotation: 0, opacity: 1, productId: product.id, zIndex: 1,
              cardTheme: template.cardTheme || 'classic-stack'
            } as CanvasElement);
          });

          return gridElements;
        };

        const categoryPageIndices: number[] = [];
        currentCatalogPages.forEach((p, i) => {
          if (p.categoryId === targetCategoryId) categoryPageIndices.push(i);
        });

        if (categoryPageIndices.length > 0) {
          const insertPosition = categoryPageIndices[0];
          const numPagesNeeded = Math.max(1, Math.ceil(catProducts.length / itemsPerPage));
          const newCatPages: CatalogPage[] = [];

          for (let i = 0; i < numPagesNeeded; i++) {
            const chunk = catProducts.slice(i * itemsPerPage, (i + 1) * itemsPerPage);
            newCatPages.push({
              id: `p-gen-${targetCategoryId}-${Date.now()}-${i}`,
              pageNumber: 0,
              elements: generatePageElements(chunk, i),
              type: 'product' as PageType,
              categoryId: targetCategoryId
            });
          }

          const indicesToRemove = new Set(categoryPageIndices);
          const pagesWithout = currentCatalogPages.filter((_, i) => !indicesToRemove.has(i));
          const safeInsertPos = Math.min(insertPosition, pagesWithout.length);

          const finalPages = [...pagesWithout];
          finalPages.splice(safeInsertPos, 0, ...newCatPages);
          currentCatalogPages = finalPages;
        }
      });

      // Renumber and finalize
      const renumberedPages = currentCatalogPages.map((p, i) => ({ ...p, pageNumber: i + 1 }));

      return {
        catalog: {
          ...state.catalog,
          pages: renumberedPages,
          updatedAt: new Date().toISOString(),
          backgroundColor: template.backgroundColor || state.catalog.backgroundColor
        },
        currentPageIndex: Math.min(state.currentPageIndex, renumberedPages.length - 1),
        selectedElementIds: []
      };
    });
  },

  reflowAllProductPages: (updatedCatalog) => {
    set((state) => {
      const catalog = updatedCatalog || state.catalog;

      // 1. Gather all unique category IDs from existing interior pages
      const interiorPages = catalog.pages.filter(p => p.type === 'interior');
      const categoryIds = Array.from(new Set(interiorPages.map(p => p.categoryId).filter(Boolean))) as string[];

      if (categoryIds.length === 0) {
        categoryIds.push(catalog.selectedCategoryIds?.[0] || 'cat1');
      }

      const newPages: CatalogPage[] = [];

      // 2. Add prefix pages (covers/index before first interior page)
      const firstInteriorIndex = catalog.pages.findIndex(p => p.type === 'interior');
      const prefixPages = firstInteriorIndex !== -1 ? catalog.pages.slice(0, firstInteriorIndex) : [];
      newPages.push(...prefixPages);

      const cols = catalog.gridCols || 2;
      const rows = catalog.gridRows || 2;
      const itemsPerPage = cols * rows;

      const spacing = catalog.gridSpacing ?? 30;
      const padding = catalog.gridPadding ?? 50;

      const headerH = catalog.hasHeader ? (catalog.headerHeight || 113.4) : 0;
      const footerH = catalog.hasFooter ? (catalog.footerHeight || 75.6) : 0;
      const leftMargin = catalog.marginLeft ?? padding;
      const rightMargin = catalog.marginRight ?? padding;
      const topMargin = catalog.marginTop ?? padding;
      const bottomMargin = catalog.marginBottom ?? padding;

      const availableWidth = PAGE_WIDTH - leftMargin - rightMargin;
      const availableHeight = PAGE_HEIGHT - topMargin - bottomMargin - headerH - footerH;
      const slotWidth = (availableWidth - (cols - 1) * spacing) / cols;
      const slotHeight = (availableHeight - (rows - 1) * spacing) / rows;

      let pageOrder = newPages.length + 1;

      categoryIds.forEach(targetCategoryId => {
        const catProducts = state.products.filter(p => p.categoryId && String(p.categoryId) === String(targetCategoryId));
        const numPagesNeeded = Math.max(1, Math.ceil(catProducts.length / itemsPerPage));

        for (let i = 0; i < numPagesNeeded; i++) {
          const chunk = catProducts.slice(i * itemsPerPage, (i + 1) * itemsPerPage);
          const gridElements: CanvasElement[] = [];

          gridElements.push({
            id: `int-bg-${Date.now()}-${pageOrder}-${i}`,
            type: 'shape',
            shapeType: 'rect',
            x: 0,
            y: 0,
            width: PAGE_WIDTH,
            height: PAGE_HEIGHT,
            fill: '#ffffff',
            zIndex: 0
          } as CanvasElement);

          chunk.forEach((product, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            const x = leftMargin + col * (slotWidth + spacing);
            const y = headerH + topMargin + row * (slotHeight + spacing);

            gridElements.push({
              id: `pb-reflow-${Date.now()}-${pageOrder}-${index}`,
              type: 'product-block',
              x,
              y,
              width: slotWidth,
              height: slotHeight,
              rotation: 0,
              opacity: 1,
              productId: product.id,
              zIndex: 1,
              cardTheme: catalog.gridCardTheme || 'classic-stack'
            } as CanvasElement);
          });

          newPages.push({
            id: `p-reflow-${targetCategoryId}-${Date.now()}-${i}`,
            pageNumber: pageOrder++,
            elements: gridElements,
            type: 'interior',
            categoryId: targetCategoryId
          });
        }
      });

      // 3. Add suffix pages (outro/closing pages after last interior page)
      const lastInteriorIndex = catalog.pages.map(p => p.type).lastIndexOf('interior');
      const suffixPages = lastInteriorIndex !== -1 ? catalog.pages.slice(lastInteriorIndex + 1) : [];
      suffixPages.forEach((p) => {
        newPages.push({
          ...p,
          pageNumber: pageOrder++
        });
      });

      return {
        catalog: {
          ...catalog,
          pages: newPages,
          updatedAt: new Date().toISOString()
        },
        selectedElementIds: []
      };
    });
  },

  // Master Actions Implementation

  setIsGridStudioOpen: (isOpen, pageIndex = null) => set({
    isGridStudioOpen: isOpen,
    gridStudioPageIndex: pageIndex !== null ? pageIndex : get().currentPageIndex
  }),

  applyProductGridToPage: (pageIndex, sections, options) => {
    get().pushHistory();
    set((state) => {
      const { catalog } = state;
      const targetPage = catalog.pages[pageIndex];
      if (!targetPage) return state;

      const pageHasHeader = Boolean(catalog.hasHeader !== false && targetPage.hasHeader !== false && (catalog.headerElements?.length || 0) > 0 && targetPage.type !== 'cover');
      const pageHasFooter = Boolean(catalog.hasFooter !== false && targetPage.hasFooter !== false && (catalog.footerElements?.length || 0) > 0 && targetPage.type !== 'cover');

      const headerH = pageHasHeader ? (catalog.headerHeight || 113.4) : 0;
      const footerH = pageHasFooter ? (catalog.footerHeight || 75.6) : 0;

      const topBound = Math.max(headerH + 15, catalog.marginTop || 20);
      const bottomBound = PAGE_HEIGHT - Math.max(footerH + 15, catalog.marginBottom || 20);
      const availableHeight = bottomBound - topBound;

      const sectionCount = Math.max(1, sections.length);
      const baseSlotCount = Math.max(3, sectionCount);
      const gap = options?.gap ?? 15;
      const totalGaps = (baseSlotCount - 1) * gap;
      const sectionHeight = Math.max(100, Math.floor((availableHeight - totalGaps) / baseSlotCount));

      const leftMargin = catalog.marginLeft || 35;
      const rightMargin = catalog.marginRight || 35;
      const contentWidth = PAGE_WIDTH - leftMargin - rightMargin;

      const newElements: CanvasElement[] = [];
      const timestamp = Date.now();

      sections.forEach((sec, idx) => {
        const curY = Math.round(topBound + idx * (sectionHeight + gap));
        const sectionId = `grid-sec-${timestamp}-${idx}`;

        // 1. Background Stripe (if enabled)
        if (sec.hasBackground) {
          newElements.push({
            id: `${sectionId}-bg`,
            type: 'shape',
            shapeType: 'rect',
            x: 0,
            y: curY - 5,
            width: PAGE_WIDTH,
            height: sectionHeight + 10,
            fill: sec.backgroundColor || '#e2e8f0',
            zIndex: idx * 10 + 1,
            rotation: 0,
            opacity: 1,
            sectionTag: sectionId
          });
        }

        // 2. Right Column: Title + Table
        const rightX = leftMargin + 255;
        const rightWidth = Math.max(200, contentWidth - 255);

        // Title
        const titleText = sec.title || `PRODUCT SERIES ${idx + 1}`;
        newElements.push({
          id: `${sectionId}-title`,
          type: 'text',
          x: rightX,
          y: curY + 4,
          width: rightWidth,
          height: 32,
          text: titleText,
          fontSize: sec.titleFontSize || 26,
          fontFamily: 'Bebas Neue',
          fontWeight: 'bold',
          fill: sec.titleColor || '#00a651',
          letterSpacing: 0.5,
          zIndex: idx * 10 + 3,
          rotation: 0,
          opacity: 1,
          sectionTag: sectionId
        });

        // Specs Table
        const tableY = curY + 40;
        const tableData: TableData = sec.tableData || {
          headers: ['MODEL NO', 'PRODUCTS', 'CUT-OUT', 'COLOR', 'DEALER PRICE', 'PACKING PER BOX'],
          rows: [
            ['VT-17012', '12W HONEY COMB SERIES COB', '75MM', 'W, W.W, N.W', '800', '20 PCS'],
            ['VT-17018', '18W HONEY COMB SERIES COB', '95MM', 'W, W.W, N.W', '1,000', '20 PCS']
          ],
          headerBg: '#002838',
          headerTextColor: '#ffffff',
          alternateRowBg: '#ffffff',
          rowBg: '#ffffff',
          borderColor: '#002838',
          fontSize: 9,
          headerFontSize: 12,
          cellPadding: 4
        };

        newElements.push({
          id: `${sectionId}-table`,
          type: 'table',
          x: rightX,
          y: tableY,
          width: rightWidth,
          height: Math.max(65, sectionHeight - 45),
          tableData,
          zIndex: idx * 10 + 4,
          rotation: 0,
          opacity: 1,
          sectionTag: sectionId
        });

        // 3. Product Image on Left (aligned perpendicular to the table)
        const imageWidth = 240;
        const availableImgHeight = Math.max(70, sectionHeight - 45);
        const imageHeight = Math.min(240, availableImgHeight);
        const imgX = leftMargin;
        const imgY = tableY;
        const finalImgSrc = normalizeImageUrl(sec.imageSrc) || 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=600';

        newElements.push({
          id: `${sectionId}-img`,
          type: 'image',
          x: imgX,
          y: imgY,
          width: imageWidth,
          height: imageHeight,
          src: finalImgSrc,
          zIndex: idx * 10 + 2,
          rotation: 0,
          opacity: 1,
          sectionTag: sectionId
        });
      });

      const newPages = [...catalog.pages];
      newPages[pageIndex] = {
        ...targetPage,
        elements: newElements
      };

      return {
        catalog: {
          ...catalog,
          pages: newPages,
          updatedAt: new Date().toISOString()
        },
        currentPageIndex: pageIndex,
        isGridStudioOpen: false,
        gridStudioPageIndex: null,
        selectedElementIds: []
      };
    });
  },

  reflowCatalogPages: (startPageIndex) => {
    get().pushHistory();
    set((state) => {
      const { catalog } = state;
      const pages = [...catalog.pages];

      // Helper to extract sections from a page
      const extractSections = (page: CatalogPage): ProductGridSection[] => {
        if (!page || !page.elements || page.elements.length === 0) return [];
        const titles = page.elements.filter(el => el.type === 'text' && (el.fontSize || 0) >= 16);
        const tables = page.elements.filter(el => el.type === 'table' && el.tableData);
        const images = page.elements.filter(el => el.type === 'image');
        const backgrounds = page.elements.filter(el => el.type === 'shape' && (el.width || 0) >= 500);

        if (titles.length === 0 && tables.length === 0) return [];

        if (titles.length > 0) {
          const sortedTitles = [...titles].sort((a, b) => a.y - b.y);
          return sortedTitles.map((t, idx) => {
            const nearestTable = tables.find(tbl => Math.abs(tbl.y - t.y) < 180);
            const nearestImg = images.find(img => Math.abs(img.y - t.y) < 180);
            const nearestBg = backgrounds.find(bg => Math.abs(bg.y - t.y) < 180);

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
        }

        const sortedTables = [...tables].sort((a, b) => a.y - b.y);
        return sortedTables.map((tbl, idx) => {
          const nearestImg = images.find(img => Math.abs(img.y - tbl.y) < 180);
          const nearestBg = backgrounds.find(bg => Math.abs(bg.y - tbl.y) < 180);
          return {
            id: `sec-${idx + 1}`,
            title: `SERIES ${idx + 1}`,
            titleColor: '#00a651',
            titleFontSize: 22,
            imageSrc: nearestImg?.src || '',
            hasBackground: !!nearestBg,
            backgroundColor: nearestBg?.fill || '#e2e8f0',
            tableData: tbl.tableData || {
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
      };

      // Helper to lay out sections on a page
      const layoutSections = (sections: ProductGridSection[], page: CatalogPage, timestamp: number): CanvasElement[] => {
        if (sections.length === 0) return [];
        const pageHasHeader = Boolean(catalog.hasHeader !== false && page.hasHeader !== false && (catalog.headerElements?.length || 0) > 0 && page.type !== 'cover');
        const pageHasFooter = Boolean(catalog.hasFooter !== false && page.hasFooter !== false && (catalog.footerElements?.length || 0) > 0 && page.type !== 'cover');

        const headerH = pageHasHeader ? (catalog.headerHeight || 113.4) : 0;
        const footerH = pageHasFooter ? (catalog.footerHeight || 75.6) : 0;

        const topBound = Math.max(headerH + 15, catalog.marginTop || 20);
        const bottomBound = PAGE_HEIGHT - Math.max(footerH + 15, catalog.marginBottom || 20);
        const availableHeight = bottomBound - topBound;

        const sectionCount = sections.length;
        const baseSlotCount = Math.max(3, sectionCount);
        const gap = 15;
        const totalGaps = (baseSlotCount - 1) * gap;
        const standardSlotHeight = Math.max(100, Math.floor((availableHeight - totalGaps) / baseSlotCount));

        const weights = sections.map(sec => {
          const rowCount = sec.tableData?.rows?.length || 2;
          return Math.max(1, 0.7 + rowCount * 0.25);
        });
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);

        const effectiveTotalHeight = sectionCount >= 3
          ? (availableHeight - (sectionCount - 1) * gap)
          : (standardSlotHeight * sectionCount);

        const leftMargin = catalog.marginLeft || 35;
        const rightMargin = catalog.marginRight || 35;
        const contentWidth = PAGE_WIDTH - leftMargin - rightMargin;
        const rightX = leftMargin + 255;
        const rightWidth = Math.max(200, contentWidth - 255);

        const newElements: CanvasElement[] = [];
        let curY = topBound;

        sections.forEach((sec, idx) => {
          const sectionHeight = Math.max(
            110,
            Math.floor((effectiveTotalHeight * weights[idx]) / totalWeight)
          );
          const sectionId = `grid-sec-${timestamp}-${idx}`;

          // Background Stripe
          if (sec.hasBackground) {
            newElements.push({
              id: `${sectionId}-bg`,
              type: 'shape',
              shapeType: 'rect',
              x: 0,
              y: curY - 5,
              width: PAGE_WIDTH,
              height: sectionHeight + 10,
              fill: sec.backgroundColor || '#e2e8f0',
              zIndex: idx * 10 + 1,
              rotation: 0,
              opacity: 1,
              sectionTag: sectionId
            });
          }

          // Right Column: Title — calculate dynamic height based on text wrapping
          const titleFontSize = sec.titleFontSize || 22;
          const titleText = String(sec.title || `SERIES ${idx + 1}`);
          // Estimate title height based on text wrapping
          const titleAvgCharWidth = titleFontSize * 0.72; // bold uppercase
          const titleCharsPerLine = Math.max(5, Math.floor(rightWidth / titleAvgCharWidth));
          const titleWords = titleText.split(/\s+/);
          let titleLines = 1;
          let titleLineLen = 0;
          titleWords.forEach(word => {
            if (titleLineLen + word.length > titleCharsPerLine) {
              titleLines++;
              titleLineLen = word.length;
            } else {
              titleLineLen += word.length + 1;
            }
          });
          const titleHeight = Math.max(32, titleLines * (titleFontSize * 1.3) + 6);

          newElements.push({
            id: `${sectionId}-title`,
            type: 'text',
            x: rightX,
            y: curY + 4,
            width: rightWidth,
            height: titleHeight,
            text: titleText,
            fontSize: titleFontSize || 26,
            fontFamily: 'Bebas Neue',
            fontWeight: 'bold',
            fill: sec.titleColor || '#00a651',
            letterSpacing: 0.5,
            zIndex: idx * 10 + 3,
            rotation: 0,
            opacity: 1,
            sectionTag: sectionId
          });

          // Table — positioned dynamically below the title
          const tableY = curY + titleHeight + 8;
          newElements.push({
            id: `${sectionId}-table`,
            type: 'table',
            x: rightX,
            y: tableY,
            width: rightWidth,
            height: Math.max(60, sectionHeight - titleHeight - 12),
            tableData: sec.tableData,
            zIndex: idx * 10 + 4,
            rotation: 0,
            opacity: 1,
            sectionTag: sectionId
          });

          // Left Image — positioned perpendicular (horizontally aligned) to the Table
          const imageWidth = 240;
          const availableImageHeight = Math.max(70, sectionHeight - titleHeight - 12);
          const imageHeight = Math.min(240, availableImageHeight);
          if (sec.imageSrc) {
            newElements.push({
              id: `${sectionId}-img`,
              type: 'image',
              x: leftMargin,
              y: tableY,
              width: imageWidth,
              height: imageHeight,
              src: sec.imageSrc,
              zIndex: idx * 10 + 2,
              rotation: 0,
              opacity: 1,
              sectionTag: sectionId
            });
          }

          curY += sectionHeight + gap;
        });

        return newElements;
      };

      // 1. Identify interior / product page indices strictly (never touch cover, index, or closing pages)
      const interiorIndices = pages
        .map((p, idx) => {
          if (p.type === 'cover' || p.type === 'index' || p.type === 'closing') return -1;
          if (idx === 0 && (p.type === 'cover' || (pages.length > 1 && !p.type))) return -1;
          return idx;
        })
        .filter(idx => idx !== -1);

      if (interiorIndices.length === 0) return state;

      const eligibleIndices = startPageIndex !== undefined
        ? interiorIndices.filter(idx => idx >= startPageIndex)
        : interiorIndices;

      if (eligibleIndices.length === 0) return state;

      // 2. Extract all sections in sequence
      const allSections: ProductGridSection[] = [];
      eligibleIndices.forEach(pIdx => {
        const pSections = extractSections(pages[pIdx]);
        allSections.push(...pSections);
      });

      if (allSections.length === 0) return state;

      // 3. Bucket sections by available height budget
      const getSecEstimatedHeight = (sec: ProductGridSection) => {
        const rows = sec.tableData?.rows?.length || 2;
        return 130 + rows * 28;
      };

      const MAX_PAGE_BUDGET = 880;
      const sectionBuckets: ProductGridSection[][] = [];
      let currentBucket: ProductGridSection[] = [];
      let currentBudget = 0;

      allSections.forEach(sec => {
        const estH = getSecEstimatedHeight(sec);
        if (currentBucket.length >= 4 || (currentBucket.length >= 2 && currentBudget + estH > MAX_PAGE_BUDGET)) {
          sectionBuckets.push(currentBucket);
          currentBucket = [sec];
          currentBudget = estH;
        } else {
          currentBucket.push(sec);
          currentBudget += estH;
        }
      });
      if (currentBucket.length > 0) {
        sectionBuckets.push(currentBucket);
      }

      // 4. Distribute across pages
      const timestamp = Date.now();
      const updatedPages = [...pages];

      // Add extra interior pages if needed
      while (eligibleIndices.length < sectionBuckets.length) {
        const lastEligibleIdx = eligibleIndices[eligibleIndices.length - 1];
        const newPage: CatalogPage = {
          id: `page-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          pageNumber: updatedPages.length + 1,
          type: 'interior',
          orientation: 'portrait',
          backgroundColor: '#ffffff',
          elements: []
        };
        updatedPages.splice(lastEligibleIdx + 1, 0, newPage);
        eligibleIndices.push(lastEligibleIdx + 1);
      }

      // Lay out buckets
      sectionBuckets.forEach((bucket, bIdx) => {
        const pIdx = eligibleIndices[bIdx];
        const targetPage = updatedPages[pIdx];
        const nonGridElements = (targetPage.elements || []).filter(el =>
          !el.sectionTag && !el.id.startsWith('grid-sec-') && !['table', 'shape'].includes(el.type) && (el.type !== 'text' || (el.fontSize || 0) < 16)
        );

        const newGridElements = layoutSections(bucket, targetPage, timestamp + bIdx);
        updatedPages[pIdx] = {
          ...targetPage,
          elements: [...newGridElements, ...nonGridElements]
        };
      });

      // Clear remaining eligible pages that received no sections
      for (let i = sectionBuckets.length; i < eligibleIndices.length; i++) {
        const pIdx = eligibleIndices[i];
        const targetPage = updatedPages[pIdx];
        const nonGridElements = (targetPage.elements || []).filter(el =>
          !el.sectionTag && !el.id.startsWith('grid-sec-') && el.type !== 'table'
        );
        updatedPages[pIdx] = {
          ...targetPage,
          elements: nonGridElements
        };
      }

      return {
        catalog: {
          ...catalog,
          pages: updatedPages,
          updatedAt: new Date().toISOString()
        }
      };
    });
  },

  swapPageSections: (pageIndex, secIdxA, secIdxB) => {
    get().pushHistory();
    set((state) => {
      const { catalog } = state;
      const targetPage = catalog.pages[pageIndex];
      if (!targetPage) return state;

      const titles = (targetPage.elements || []).filter(el => el.type === 'text' && (el.fontSize || 0) >= 16);
      const tables = (targetPage.elements || []).filter(el => el.type === 'table' && el.tableData);
      const images = (targetPage.elements || []).filter(el => el.type === 'image');
      const backgrounds = (targetPage.elements || []).filter(el => el.type === 'shape' && (el.width || 0) >= 500);

      const sortedTitles = [...titles].sort((a, b) => a.y - b.y);
      if (sortedTitles.length < 2) return state;

      const sections: ProductGridSection[] = sortedTitles.map((t, idx) => {
        const nearestTable = tables.find(tbl => Math.abs(tbl.y - t.y) < 180);
        const nearestImg = images.find(img => Math.abs(img.y - t.y) < 180);
        const nearestBg = backgrounds.find(bg => Math.abs(bg.y - t.y) < 180);

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

      if (secIdxA < 0 || secIdxA >= sections.length || secIdxB < 0 || secIdxB >= sections.length) return state;

      const temp = sections[secIdxA];
      sections[secIdxA] = sections[secIdxB];
      sections[secIdxB] = temp;

      const timestamp = Date.now();
      const pageHasHeader = Boolean(catalog.hasHeader !== false && targetPage.hasHeader !== false && (catalog.headerElements?.length || 0) > 0 && targetPage.type !== 'cover');
      const pageHasFooter = Boolean(catalog.hasFooter !== false && targetPage.hasFooter !== false && (catalog.footerElements?.length || 0) > 0 && targetPage.type !== 'cover');

      const headerH = pageHasHeader ? (catalog.headerHeight || 113.4) : 0;
      const footerH = pageHasFooter ? (catalog.footerHeight || 75.6) : 0;

      const topBound = Math.max(headerH + 15, catalog.marginTop || 20);
      const bottomBound = PAGE_HEIGHT - Math.max(footerH + 15, catalog.marginBottom || 20);
      const availableHeight = bottomBound - topBound;

      const sectionCount = sections.length;
      const baseSlotCount = Math.max(3, sectionCount);
      const gap = 15;
      const totalGaps = (baseSlotCount - 1) * gap;
      const standardSlotHeight = Math.max(100, Math.floor((availableHeight - totalGaps) / baseSlotCount));

      const weights = sections.map(sec => {
        const rowCount = sec.tableData?.rows?.length || 2;
        return Math.max(1, 0.7 + rowCount * 0.25);
      });
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);

      const effectiveTotalHeight = sectionCount >= 3
        ? (availableHeight - (sectionCount - 1) * gap)
        : (standardSlotHeight * sectionCount);

      const leftMargin = catalog.marginLeft || 35;
      const rightMargin = catalog.marginRight || 35;
      const contentWidth = PAGE_WIDTH - leftMargin - rightMargin;

      const newElements: CanvasElement[] = [];
      let curY = topBound;

      sections.forEach((sec, idx) => {
        const sectionHeight = Math.max(
          110,
          Math.floor((effectiveTotalHeight * weights[idx]) / totalWeight)
        );
        const sectionId = `grid-sec-${timestamp}-${idx}`;

        if (sec.hasBackground) {
          newElements.push({
            id: `${sectionId}-bg`,
            type: 'shape',
            shapeType: 'rect',
            x: 0,
            y: curY - 5,
            width: PAGE_WIDTH,
            height: sectionHeight + 10,
            fill: sec.backgroundColor || '#e2e8f0',
            zIndex: idx * 10 + 1,
            rotation: 0,
            opacity: 1,
            sectionTag: sectionId
          });
        }

        const rightX = leftMargin + 255;
        const rightWidth = Math.max(200, contentWidth - 255);

        newElements.push({
          id: `${sectionId}-title`,
          type: 'text',
          x: rightX,
          y: curY + 4,
          width: rightWidth,
          height: 32,
          text: sec.title || `SERIES ${idx + 1}`,
          fontSize: sec.titleFontSize || 26,
          fontFamily: 'Bebas Neue',
          fontWeight: 'bold',
          fill: sec.titleColor || '#00a651',
          letterSpacing: 0.5,
          zIndex: idx * 10 + 3,
          rotation: 0,
          opacity: 1,
          sectionTag: sectionId
        });

        const tableY = curY + 40;
        newElements.push({
          id: `${sectionId}-table`,
          type: 'table',
          x: rightX,
          y: tableY,
          width: rightWidth,
          height: Math.max(60, sectionHeight - 45),
          tableData: sec.tableData,
          zIndex: idx * 10 + 4,
          rotation: 0,
          opacity: 1,
          sectionTag: sectionId
        });

        const imageWidth = 240;
        const availableImageHeight = Math.max(70, sectionHeight - 45);
        const imageHeight = Math.min(240, availableImageHeight);
        if (sec.imageSrc) {
          newElements.push({
            id: `${sectionId}-img`,
            type: 'image',
            x: leftMargin,
            y: tableY,
            width: imageWidth,
            height: imageHeight,
            src: sec.imageSrc,
            zIndex: idx * 10 + 2,
            rotation: 0,
            opacity: 1,
            sectionTag: sectionId
          });
        }

        curY += sectionHeight + gap;
      });

      const nonGridElements = (targetPage.elements || []).filter(el =>
        !el.sectionTag && !el.id.startsWith('grid-sec-') && !['table', 'shape'].includes(el.type) && (el.type !== 'text' || (el.fontSize || 0) < 16)
      );

      const newPages = [...catalog.pages];
      newPages[pageIndex] = {
        ...targetPage,
        elements: [...newElements, ...nonGridElements]
      };

      return {
        catalog: {
          ...catalog,
          pages: newPages,
          updatedAt: new Date().toISOString()
        }
      };
    });
  },

  deletePageSection: (pageIndex, secIdx) => {
    get().pushHistory();
    set((state) => {
      const { catalog } = state;
      const targetPage = catalog.pages[pageIndex];
      if (!targetPage) return state;

      const titles = (targetPage.elements || []).filter(el => el.type === 'text' && (el.fontSize || 0) >= 16);
      const tables = (targetPage.elements || []).filter(el => el.type === 'table' && el.tableData);
      const images = (targetPage.elements || []).filter(el => el.type === 'image');
      const backgrounds = (targetPage.elements || []).filter(el => el.type === 'shape' && (el.width || 0) >= 500);

      const sortedTitles = [...titles].sort((a, b) => a.y - b.y);
      if (sortedTitles.length === 0) return state;

      const sections: ProductGridSection[] = sortedTitles.map((t, idx) => {
        const nearestTable = tables.find(tbl => Math.abs(tbl.y - t.y) < 180);
        const nearestImg = images.find(img => Math.abs(img.y - t.y) < 180);
        const nearestBg = backgrounds.find(bg => Math.abs(bg.y - t.y) < 180);

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

      const remainingSections = sections.filter((_, idx) => idx !== secIdx);

      const newPages = [...catalog.pages];
      if (remainingSections.length === 0) {
        newPages[pageIndex] = {
          ...targetPage,
          elements: []
        };
      } else {
        const timestamp = Date.now();
        const pageHasHeader = Boolean(catalog.hasHeader !== false && targetPage.hasHeader !== false && (catalog.headerElements?.length || 0) > 0 && targetPage.type !== 'cover');
        const pageHasFooter = Boolean(catalog.hasFooter !== false && targetPage.hasFooter !== false && (catalog.footerElements?.length || 0) > 0 && targetPage.type !== 'cover');

        const headerH = pageHasHeader ? (catalog.headerHeight || 113.4) : 0;
        const footerH = pageHasFooter ? (catalog.footerHeight || 75.6) : 0;

        const topBound = Math.max(headerH + 15, catalog.marginTop || 20);
        const bottomBound = PAGE_HEIGHT - Math.max(footerH + 15, catalog.marginBottom || 20);
        const availableHeight = bottomBound - topBound;

        const sectionCount = remainingSections.length;
        const baseSlotCount = Math.max(3, sectionCount);
        const gap = 15;
        const totalGaps = (baseSlotCount - 1) * gap;
        const standardSlotHeight = Math.max(100, Math.floor((availableHeight - totalGaps) / baseSlotCount));

        const weights = remainingSections.map(sec => {
          const rowCount = sec.tableData?.rows?.length || 2;
          return Math.max(1, 0.7 + rowCount * 0.25);
        });
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);

        const effectiveTotalHeight = sectionCount >= 3
          ? (availableHeight - (sectionCount - 1) * gap)
          : (standardSlotHeight * sectionCount);

        const leftMargin = catalog.marginLeft || 35;
        const rightMargin = catalog.marginRight || 35;
        const contentWidth = PAGE_WIDTH - leftMargin - rightMargin;

        const newElements: CanvasElement[] = [];
        let curY = topBound;

        remainingSections.forEach((sec, idx) => {
          const sectionHeight = Math.max(
            110,
            Math.floor((effectiveTotalHeight * weights[idx]) / totalWeight)
          );
          const sectionId = `grid-sec-${timestamp}-${idx}`;

          if (sec.hasBackground) {
            newElements.push({
              id: `${sectionId}-bg`,
              type: 'shape',
              shapeType: 'rect',
              x: 0,
              y: curY - 5,
              width: PAGE_WIDTH,
              height: sectionHeight + 10,
              fill: sec.backgroundColor || '#e2e8f0',
              zIndex: idx * 10 + 1,
              rotation: 0,
              opacity: 1,
              sectionTag: sectionId
            });
          }

          const rightX = leftMargin + 255;
          const rightWidth = Math.max(200, contentWidth - 255);

          newElements.push({
            id: `${sectionId}-title`,
            type: 'text',
            x: rightX,
            y: curY + 4,
            width: rightWidth,
            height: 32,
            text: sec.title || `SERIES ${idx + 1}`,
            fontSize: sec.titleFontSize || 26,
            fontFamily: 'Bebas Neue',
            fontWeight: 'bold',
            fill: sec.titleColor || '#00a651',
            letterSpacing: 0.5,
            zIndex: idx * 10 + 3,
            rotation: 0,
            opacity: 1,
            sectionTag: sectionId
          });

          const tableY = curY + 40;
          newElements.push({
            id: `${sectionId}-table`,
            type: 'table',
            x: rightX,
            y: tableY,
            width: rightWidth,
            height: Math.max(60, sectionHeight - 45),
            tableData: sec.tableData,
            zIndex: idx * 10 + 4,
            rotation: 0,
            opacity: 1,
            sectionTag: sectionId
          });

          const imageWidth = 240;
          const availableImageHeight = Math.max(70, sectionHeight - 45);
          const imageHeight = Math.min(240, availableImageHeight);
          if (sec.imageSrc) {
            newElements.push({
              id: `${sectionId}-img`,
              type: 'image',
              x: leftMargin,
              y: tableY,
              width: imageWidth,
              height: imageHeight,
              src: sec.imageSrc,
              zIndex: idx * 10 + 2,
              rotation: 0,
              opacity: 1,
              sectionTag: sectionId
            });
          }

          curY += sectionHeight + gap;
        });

        const nonGridElements = (targetPage.elements || []).filter(el =>
          !el.sectionTag && !el.id.startsWith('grid-sec-') && !['table', 'shape'].includes(el.type) && (el.type !== 'text' || (el.fontSize || 0) < 16)
        );

        newPages[pageIndex] = {
          ...targetPage,
          elements: [...newElements, ...nonGridElements]
        };
      }

      return {
        catalog: {
          ...catalog,
          pages: newPages,
          updatedAt: new Date().toISOString()
        }
      };
    });
  },

  autoGenerateCatalogFromAllCategories: () => {
    get().pushHistory();
    set((state) => {
      const { catalog, categories, products } = state;
      if (!products || products.length === 0) return state;

      // Helper to generate a single table row from a product or variant
      const generateRow = (p: Product, v?: ProductVariant): string[] => {
        const cfValues = p.customFields ? Object.values(p.customFields).filter(val => typeof val === 'string' && val.trim() !== '') as string[] : [];

        // 1. Model / SKU
        let model = v?.sku || p.sku || '-';
        if (model === '-' || model.startsWith('Untitled')) {
          const vtMatch = cfValues.find(val => /^VT-[\w-]+/i.test(val.trim()));
          if (vtMatch) model = vtMatch.trim();
        }

        // 2. Product Name / Specification
        let name = v?.name && v.name !== '-' ? v.name : (p.name && p.name !== '-' ? p.name : '-');
        if (name === '-' || name.toLowerCase() === 'untitled product') {
          const specMatch = cfValues.find(val => /\d+W\b|SERIES|COB|DOWNLIGHT|CYLINDER|TRACK/i.test(val));
          if (specMatch) name = specMatch.trim();
          else if (model !== '-') name = model;
        }

        // 3. Cut-Out
        const directCut = (v as any)?.cutOut || p.customFields?.cutOut || (v?.customAttributes as any)?.cutOut || (v?.customAttributes as any)?.cut_out || p.customFields?.size;
        let cutOut = directCut;
        if (!cutOut) {
          const mmMatch = cfValues.find(val => /\b\d+\s*MM\b/i.test(val));
          cutOut = mmMatch ? mmMatch.trim() : '75MM';
        }

        // 4. Price
        const priceVal = v?.price ?? p.price;
        let price = '₹1200';
        if (priceVal !== undefined && priceVal !== null && priceVal !== '' && priceVal !== '-') {
          price = String(priceVal).startsWith('₹') || String(priceVal).startsWith('$') ? String(priceVal) : `₹${priceVal}`;
        } else {
          const priceMatch = cfValues.find(val => /^₹?\s*\d+(\.\d+)?$/.test(val));
          if (priceMatch) price = priceMatch.startsWith('₹') ? priceMatch : `₹${priceMatch}`;
        }

        // 5. Color
        const directColor = v?.color || p.customFields?.color || (v?.customAttributes as any)?.color || (v?.customAttributes as any)?.cct;
        let color = directColor;
        if (!color) {
          const colorMatch = cfValues.find(val => /W,\s*W\.W|3000K|4000K|6500K|CCT|WARM|WHITE/i.test(val));
          color = colorMatch ? colorMatch.trim() : 'W, W.W, N.W';
        }

        return [model, name, cutOut, price, color];
      };

      // Group products by category
      const categoryGroups: { categoryId?: string | number; categoryName: string; prods: Product[] }[] = [];

      if (categories && categories.length > 0) {
        categories.forEach(cat => {
          const catProds = products.filter(p => String(p.categoryId) === String(cat.id));
          if (catProds.length > 0) {
            categoryGroups.push({
              categoryId: cat.id,
              categoryName: cat.name,
              prods: catProds
            });
          }
        });

        // Uncategorized products
        const uncategorized = products.filter(p => !p.categoryId || !categories.some(c => String(c.id) === String(p.categoryId)));
        if (uncategorized.length > 0) {
          categoryGroups.push({
            categoryId: undefined,
            categoryName: 'General Products',
            prods: uncategorized
          });
        }
      } else {
        categoryGroups.push({
          categoryId: undefined,
          categoryName: 'Catalog Products',
          prods: products
        });
      }

      // Convert each category into 1 dedicated grid section (containing all product models as rows in its table)
      const allCategorySections: ProductGridSection[] = [];

      categoryGroups.forEach((group, catIdx) => {
        const targetCat = categories?.find(c => String(c.id) === String(group.categoryId));
        const catImg = resolveProductImage(group.prods[0], targetCat, group.prods);
        const headers = ['MODEL NO', 'PRODUCTS', 'CUT-OUT', 'PRICE', 'COLOR'];

        // Build all model rows from products in this category
        const rows: string[][] = [];
        group.prods.forEach(prod => {
          if (prod.variants && prod.variants.length > 0) {
            prod.variants.forEach(v => rows.push(generateRow(prod, v)));
          } else {
            rows.push(generateRow(prod));
          }
        });

        if (rows.length === 0) {
          rows.push(['-', `${group.categoryName} Series`, '75MM', '₹1200', 'W, W.W, N.W']);
        }

        allCategorySections.push({
          id: `sec-${Date.now()}-${catIdx}`,
          title: group.categoryName.toUpperCase(),
          titleColor: '#00a651',
          titleFontSize: 22,
          imageSrc: catImg,
          hasBackground: false,
          backgroundColor: '#e2e8f0',
          tableData: {
            headers,
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
      });

      // Bucket sections into pages (exactly 3 distinct categories/sections per page)
      const pageBuckets: { sections: ProductGridSection[] }[] = [];
      for (let i = 0; i < allCategorySections.length; i += 3) {
        const chunk = allCategorySections.slice(i, i + 3).map((sec, sIdx) => ({
          ...sec,
          hasBackground: sIdx % 2 === 1
        }));
        pageBuckets.push({ sections: chunk });
      }

      // Preserve cover page if first page is cover
      const coverPage = catalog.pages[0]?.type === 'cover' ? catalog.pages[0] : null;
      const closingPage = catalog.pages.find(p => p.type === 'closing');

      // Build pages
      const newPages: CatalogPage[] = [];
      if (coverPage) {
        newPages.push({ ...coverPage, pageNumber: 1 });
      }

      const timestamp = Date.now();
      const leftMargin = catalog.marginLeft || 35;
      const rightMargin = catalog.marginRight || 35;
      const contentWidth = PAGE_WIDTH - leftMargin - rightMargin;

      pageBuckets.forEach((bucket, pIdx) => {
        const pageNumber = newPages.length + 1;
        const pageHasHeader = catalog.hasHeader !== false;
        const pageHasFooter = catalog.hasFooter !== false;
        const headerH = pageHasHeader ? (catalog.headerHeight || 113.4) : 0;
        const footerH = pageHasFooter ? (catalog.footerHeight || 75.6) : 0;

        const topBound = Math.max(headerH + 15, catalog.marginTop || 20);
        const bottomBound = PAGE_HEIGHT - Math.max(footerH + 15, catalog.marginBottom || 20);
        const availableHeight = bottomBound - topBound;

        const sectionCount = Math.max(1, bucket.sections.length);
        const baseSlotCount = Math.max(3, sectionCount);
        const gap = 15;
        const totalGaps = (baseSlotCount - 1) * gap;
        const standardSlotHeight = Math.max(100, Math.floor((availableHeight - totalGaps) / baseSlotCount));
        const sectionHeight = standardSlotHeight;

        const elements: CanvasElement[] = [];

        bucket.sections.forEach((sec, idx) => {
          const curY = Math.round(topBound + idx * (sectionHeight + gap));
          const sectionId = `grid-sec-${timestamp}-${pIdx}-${idx}`;

          // Background Stripe
          if (sec.hasBackground) {
            elements.push({
              id: `${sectionId}-bg`,
              type: 'shape',
              shapeType: 'rect',
              x: 0,
              y: curY - 5,
              width: PAGE_WIDTH,
              height: sectionHeight + 10,
              fill: sec.backgroundColor || '#e2e8f0',
              zIndex: idx * 10 + 1,
              rotation: 0,
              opacity: 1,
              sectionTag: sectionId
            });
          }

          // Right Title
          const rightX = leftMargin + 255;
          const rightWidth = Math.max(200, contentWidth - 255);

          elements.push({
            id: `${sectionId}-title`,
            type: 'text',
            x: rightX,
            y: curY + 4,
            width: rightWidth,
            height: 32,
            text: sec.title || `PRODUCT SERIES ${idx + 1}`,
            fontSize: sec.titleFontSize || 26,
            fontFamily: 'Bebas Neue',
            fontWeight: 'bold',
            fill: sec.titleColor || '#00a651',
            letterSpacing: 0.5,
            zIndex: idx * 10 + 3,
            rotation: 0,
            opacity: 1,
            sectionTag: sectionId
          });

          // Table
          const tableY = curY + 40;
          elements.push({
            id: `${sectionId}-table`,
            type: 'table',
            x: rightX,
            y: tableY,
            width: rightWidth,
            height: Math.max(60, sectionHeight - 45),
            tableData: sec.tableData,
            zIndex: idx * 10 + 4,
            rotation: 0,
            opacity: 1,
            sectionTag: sectionId
          });

          // Product Image (bounded to prevent stretching, aligned perpendicular to the table)
          const imageWidth = 240;
          const availableImageHeight = Math.max(70, sectionHeight - 45);
          const imageHeight = Math.min(240, availableImageHeight);
          const finalImgSrc = normalizeImageUrl(sec.imageSrc) || 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=600';
          elements.push({
            id: `${sectionId}-img`,
            type: 'image',
            x: leftMargin,
            y: tableY,
            width: imageWidth,
            height: imageHeight,
            src: finalImgSrc,
            zIndex: idx * 10 + 2,
            rotation: 0,
            opacity: 1,
            sectionTag: sectionId
          });
        });

        newPages.push({
          id: `page-gen-${timestamp}-${pIdx}`,
          pageNumber,
          type: 'interior',
          title: bucket.categoryName,
          categoryId: bucket.categoryId,
          orientation: 'portrait',
          backgroundColor: '#ffffff',
          elements
        });
      });

      if (closingPage) {
        newPages.push({ ...closingPage, pageNumber: newPages.length + 1 });
      }

      return {
        catalog: {
          ...catalog,
          pages: newPages,
          updatedAt: new Date().toISOString()
        },
        currentPageIndex: coverPage && newPages.length > 1 ? 1 : 0
      };
    });
  },


});
