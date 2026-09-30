import { useState } from 'react';
import { Product, Category, CardTheme, Catalog } from '../../../../types';
import { PAGE_WIDTH, PAGE_HEIGHT } from '../../../../constants';
import { normalizeImageUrl } from '../../../../utils/imageUtils';
import { resolveFieldLabel } from '../../../../utils/fieldUtils';

interface UseSingleItemsProps {
  catalog: Catalog;
  currentPageIndex: number;
  categories: Category[];
  products: Product[];
  addElement: (pageIndex: number, element: any) => void;
  setSelectedElementIds?: (ids: string[]) => void;
  uiTheme?: 'light' | 'dark';
}

export function useSingleItems({
  catalog,
  currentPageIndex,
  categories,
  products,
  addElement,
  setSelectedElementIds,
  uiTheme = 'dark'
}: UseSingleItemsProps) {
  const isDark = uiTheme === 'dark';

  // Single Product Properties Customizer Modal State
  const [customizingProduct, setCustomizingProduct] = useState<Product | null>(null);
  const [customCardTheme, setCustomCardTheme] = useState<CardTheme>('classic-stack');
  const [customShowName, setCustomShowName] = useState(true);
  const [customTitle, setCustomTitle] = useState('');
  const [customTitleColor, setCustomTitleColor] = useState('#F1F1F1');
  const [customTitleFontSize, setCustomTitleFontSize] = useState(13);
  const [customShowPrice, setCustomShowPrice] = useState(true);
  const [customPrice, setCustomPrice] = useState('');
  const [customPriceColor, setCustomPriceColor] = useState('#00a651');
  const [customPriceFontSize, setCustomPriceFontSize] = useState(14);
  const [customShowSku, setCustomShowSku] = useState(true);
  const [customSku, setCustomSku] = useState('');
  const [customFill, setCustomFill] = useState('#181818');
  const [customStroke, setCustomStroke] = useState('#2e2e2e');
  const [customBorderRadius, setCustomBorderRadius] = useState(4);
  const [customVisibleFieldKeys, setCustomVisibleFieldKeys] = useState<string[]>([]);
  const [customFieldOverrides, setCustomFieldOverrides] = useState<Record<string, { label?: string; value?: string }>>({});
  const [customEditingFieldKey, setCustomEditingFieldKey] = useState<string | null>(null);

  // Single Items Placement State
  const [singleCategoryFilter, setSingleCategoryFilter] = useState<string>('all');
  const [singleSearch, setSingleSearch] = useState<string>('');
  const [singleItemFeedback, setSingleItemFeedback] = useState<string | null>(null);

  const showSingleFeedback = (msg: string) => {
    setSingleItemFeedback(msg);
    setTimeout(() => setSingleItemFeedback(null), 3000);
  };

  const calculateElementPlacement = (itemWidth: number, itemHeight: number) => {
    const currentPage = catalog?.pages?.[currentPageIndex];
    const elements = currentPage?.elements || [];
    const marginX = catalog?.marginLeft ? Math.round(catalog.marginLeft) : 45;
    const marginTop = catalog?.marginTop ? Math.round(catalog.marginTop) : 55;
    const marginBottom = catalog?.marginBottom ? Math.round(catalog.marginBottom) : 55;
    const marginRight = catalog?.marginRight ? Math.round(catalog.marginRight) : 45;
    const pageWidth = PAGE_WIDTH || 794;
    const pageHeight = PAGE_HEIGHT || 1123;

    // Check if there is an unoccupied slot
    const slots = elements.filter(el => el.id && el.id.includes('slot'));
    const occupiedSlotIds = new Set(
      elements
        .filter(el => el.productId)
        .map(el => {
          const parts = (el.id || '').split('-');
          const idx = parts.findIndex(p => p === 'slot');
          return idx !== -1 && idx + 1 < parts.length ? `slot-${parts[idx + 1]}` : null;
        })
        .filter(Boolean)
    );

    const targetSlot = slots.find(s => {
      const parts = (s.id || '').split('-');
      const idx = parts.findIndex(p => p === 'slot');
      if (idx !== -1 && idx + 1 < parts.length) {
        return !occupiedSlotIds.has(`slot-${parts[idx + 1]}`);
      }
      return true;
    });

    if (targetSlot) {
      return {
        x: targetSlot.x,
        y: targetSlot.y,
        width: targetSlot.width,
        height: targetSlot.height
      };
    }

    // Place below existing elements if room available
    const nonHeaderElements = elements.filter(el => (el.y || 0) >= marginTop);
    if (nonHeaderElements.length > 0) {
      const maxY = Math.max(...nonHeaderElements.map(el => (el.y || 0) + (el.height || 0)));
      if (maxY + itemHeight + 20 <= pageHeight - marginBottom) {
        return {
          x: marginX,
          y: maxY + 20,
          width: itemWidth,
          height: itemHeight
        };
      }
    }

    // Stagger fallback based on elements count
    const count = elements.length % 6;
    const staggerX = Math.min(marginX + count * 28, pageWidth - itemWidth - marginRight);
    const staggerY = Math.min(marginTop + 20 + count * 28, pageHeight - itemHeight - marginBottom);

    return {
      x: Math.max(marginX, staggerX),
      y: Math.max(marginTop, staggerY),
      width: itemWidth,
      height: itemHeight
    };
  };

  const openProductPropertiesCustomizer = (product: Product) => {
    setCustomizingProduct(product);
    setCustomCardTheme('classic-stack');
    setCustomShowName(true);
    setCustomTitle(product.name || '');
    setCustomTitleColor(isDark ? '#F1F1F1' : '#0f172a');
    setCustomTitleFontSize(13);
    setCustomShowPrice(true);
    setCustomPrice(product.price ? `${product.currency || '₹'}${product.price}` : '');
    setCustomPriceColor('#00a651');
    setCustomPriceFontSize(14);
    setCustomShowSku(true);
    setCustomSku(product.sku || '');
    setCustomFill(isDark ? '#181818' : '#ffffff');
    setCustomStroke(isDark ? '#2e2e2e' : '#e2e8f0');
    setCustomBorderRadius(4);

    const keys: string[] = ['name', 'price'];
    if (product.sku) keys.push('sku');
    if (product.description) keys.push('description');
    if (product.customFields && typeof product.customFields === 'object') {
      Object.keys(product.customFields).forEach(k => {
        if (!keys.includes(k)) keys.push(k);
      });
    }
    setCustomVisibleFieldKeys(keys);
    setCustomFieldOverrides({});
    setCustomEditingFieldKey(null);
  };

  const handleInsertCustomizedProduct = () => {
    if (!customizingProduct) return;
    const timestamp = Date.now();
    const placement = calculateElementPlacement(260, 320);
    const newId = `product-block-${customizingProduct.id}-${timestamp}`;

    addElement(currentPageIndex, {
      id: newId,
      type: 'product-block',
      x: placement.x,
      y: placement.y,
      width: placement.width,
      height: placement.height,
      rotation: 0,
      opacity: 1,
      productId: customizingProduct.id,
      productData: customizingProduct,
      cardTheme: customCardTheme,
      showName: customShowName,
      customTitle: customTitle !== customizingProduct.name ? customTitle : undefined,
      titleColor: customTitleColor,
      titleFontSize: customTitleFontSize,
      showPrice: customShowPrice,
      customPrice: customPrice || undefined,
      priceColor: customPriceColor,
      priceFontSize: customPriceFontSize,
      showSku: customShowSku,
      customSku: customSku || undefined,
      fill: customFill,
      stroke: customStroke,
      borderRadius: customBorderRadius,
      visibleFieldKeys: customVisibleFieldKeys,
      fieldOverrides: Object.keys(customFieldOverrides).length > 0 ? customFieldOverrides : undefined,
      zIndex: 20
    });

    if (setSelectedElementIds) {
      setSelectedElementIds([newId]);
    }

    showSingleFeedback(`Customized card for "${customizingProduct.name}" added to Page ${currentPageIndex + 1}!`);
    setCustomizingProduct(null);
  };

  const handleAddSingleCard = (product: Product) => {
    const timestamp = Date.now();
    const placement = calculateElementPlacement(260, 320);

    addElement(currentPageIndex, {
      id: `product-block-${product.id}-${timestamp}`,
      type: 'product-block',
      x: placement.x,
      y: placement.y,
      width: placement.width,
      height: placement.height,
      rotation: 0,
      opacity: 1,
      productId: product.id,
      productData: product,
      showPrice: true,
      showSku: true,
      showName: true,
      zIndex: 20
    });

    showSingleFeedback(`Card for "${product.name}" added to Page ${currentPageIndex + 1}!`);
  };

  const handleAddSingleImage = (product: Product) => {
    const timestamp = Date.now();
    const imgUrl = normalizeImageUrl(
      product.image ||
      (product.customFields && Object.values(product.customFields).find(v => typeof v === 'string' && (v.startsWith('/media') || v.startsWith('http')))) as string ||
      ''
    );

    if (!imgUrl) {
      alert("This product does not have an image attached.");
      return;
    }

    const placement = calculateElementPlacement(240, 200);

    addElement(currentPageIndex, {
      id: `product-img-${product.id}-${timestamp}`,
      type: 'image',
      x: placement.x,
      y: placement.y,
      width: 240,
      height: 200,
      rotation: 0,
      opacity: 1,
      src: imgUrl,
      productId: product.id,
      zIndex: 15
    });

    showSingleFeedback(`Image for "${product.name}" added to Page ${currentPageIndex + 1}!`);
  };

  const handleAddSingleTable = (product: Product) => {
    const timestamp = Date.now();
    const placement = calculateElementPlacement(480, 160);

    let headers: string[] = [];
    let rows: string[][] = [];

    if (product.variants && product.variants.length > 0) {
      headers = ['MODEL NO', 'PRODUCTS', 'CUT-OUT', 'COLOR', 'PRICE', 'PACKING'];
      rows = product.variants.map(v => [
        v.sku || product.sku || '',
        v.name || product.name || '',
        v.cutOut || '75MM',
        v.color || 'W, W.W, N.W',
        typeof v.price === 'number' ? `${product.currency || '$'}${v.price}` : (v.price || `${product.currency || '$'}${product.price}`),
        v.packing || '20 PCS'
      ]);
    } else {
      headers = ['MODEL / SKU', 'PRODUCT NAME', 'PRICE'];
      rows = [
        [product.sku || '-', product.name || '-', `${product.currency || '$'}${product.price || '-'}`]
      ];
      if (product.customFields) {
        Object.entries(product.customFields).forEach(([k, v]) => {
          if (v && typeof v !== 'object') {
            const label = resolveFieldLabel(k, categories, product) || k;
            rows.push([label.toUpperCase(), String(v), '-']);
          }
        });
      }
    }

    const calculatedHeight = Math.max(85, rows.length * 28 + 35);

    addElement(currentPageIndex, {
      id: `product-table-${product.id}-${timestamp}`,
      type: 'table',
      x: placement.x,
      y: placement.y,
      width: placement.width,
      height: calculatedHeight,
      rotation: 0,
      opacity: 1,
      productId: product.id,
      zIndex: 20,
      tableData: {
        headers,
        rows,
        headerBg: '#002b36',
        headerTextColor: '#ffffff',
        alternateRowBg: '#f8fafc',
        rowBg: '#ffffff',
        borderColor: '#002b36',
        fontSize: 8,
        headerFontSize: 8.5,
        cellPadding: 4
      }
    });

    showSingleFeedback(`Specification table for "${product.name}" added to Page ${currentPageIndex + 1}!`);
  };

  const handleAddSingleFullSection = (product: Product) => {
    const timestamp = Date.now();
    const imgUrl = normalizeImageUrl(
      product.image ||
      (product.customFields && Object.values(product.customFields).find(v => typeof v === 'string' && (v.startsWith('/media') || v.startsWith('http')))) as string ||
      ''
    );

    const placement = calculateElementPlacement(704, 180);
    const startY = placement.y;

    // Title
    addElement(currentPageIndex, {
      id: `sec-title-${product.id}-${timestamp}`,
      type: 'text',
      x: imgUrl ? 320 : 45,
      y: startY,
      width: imgUrl ? 429 : 704,
      height: 30,
      text: product.name.toUpperCase(),
      fontSize: 20,
      fontFamily: 'Montserrat',
      fontWeight: '900',
      fill: '#00a651',
      letterSpacing: 0.5,
      rotation: 0,
      opacity: 1,
      productId: product.id,
      zIndex: 10
    });

    // Hero Image (if available, positioned perpendicular to table)
    if (imgUrl) {
      addElement(currentPageIndex, {
        id: `sec-img-${product.id}-${timestamp}`,
        type: 'image',
        x: 45,
        y: startY + 40,
        width: 240,
        height: 160,
        src: imgUrl,
        rotation: 0,
        opacity: 1,
        productId: product.id,
        zIndex: 5
      });
    }

    // Spec / Variant Table
    let headers = ['MODEL NO', 'PRODUCTS', 'PRICE'];
    let rows: string[][] = [];
    if (product.variants && product.variants.length > 0) {
      headers = ['MODEL NO', 'PRODUCTS', 'CUT-OUT', 'COLOR', 'PRICE', 'PACKING'];
      rows = product.variants.map(v => [
        v.sku || product.sku || '',
        v.name || product.name || '',
        v.cutOut || '75MM',
        v.color || 'W, W.W, N.W',
        typeof v.price === 'number' ? `${product.currency || '$'}${v.price}` : (v.price || `${product.currency || '$'}${product.price}`),
        v.packing || '20 PCS'
      ]);
    } else {
      rows = [
        [product.sku || '-', product.name || '-', `${product.currency || '$'}${product.price || '-'}`]
      ];
    }

    addElement(currentPageIndex, {
      id: `sec-table-${product.id}-${timestamp}`,
      type: 'table',
      x: imgUrl ? 320 : 45,
      y: startY + 35,
      width: imgUrl ? 429 : 704,
      height: Math.max(80, rows.length * 26 + 32),
      rotation: 0,
      opacity: 1,
      productId: product.id,
      zIndex: 20,
      tableData: {
        headers,
        rows,
        headerBg: '#002b36',
        headerTextColor: '#ffffff',
        alternateRowBg: '#f8fafc',
        rowBg: '#ffffff',
        borderColor: '#002b36',
        fontSize: 8,
        headerFontSize: 8.5,
        cellPadding: 4
      }
    });

    showSingleFeedback(`Full showcase for "${product.name}" added to Page ${currentPageIndex + 1}!`);
  };

  const filteredSingleProducts = products.filter(p => {
    const matchesCat = singleCategoryFilter === 'all' || String(p.categoryId) === String(singleCategoryFilter);
    const q = singleSearch.trim().toLowerCase();
    const matchesSearch = !q || (
      p.name.toLowerCase().includes(q) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
    return matchesCat && matchesSearch;
  });

  return {
    customizingProduct,
    setCustomizingProduct,
    customCardTheme,
    setCustomCardTheme,
    customShowName,
    setCustomShowName,
    customTitle,
    setCustomTitle,
    customTitleColor,
    setCustomTitleColor,
    customTitleFontSize,
    setCustomTitleFontSize,
    customShowPrice,
    setCustomShowPrice,
    customPrice,
    setCustomPrice,
    customPriceColor,
    setCustomPriceColor,
    customPriceFontSize,
    setCustomPriceFontSize,
    customShowSku,
    setCustomShowSku,
    customSku,
    setCustomSku,
    customFill,
    setCustomFill,
    customStroke,
    setCustomStroke,
    customBorderRadius,
    setCustomBorderRadius,
    customVisibleFieldKeys,
    setCustomVisibleFieldKeys,
    customFieldOverrides,
    setCustomFieldOverrides,
    customEditingFieldKey,
    setCustomEditingFieldKey,
    singleCategoryFilter,
    setSingleCategoryFilter,
    singleSearch,
    setSingleSearch,
    singleItemFeedback,
    setSingleItemFeedback,
    showSingleFeedback,
    calculateElementPlacement,
    openProductPropertiesCustomizer,
    handleInsertCustomizedProduct,
    handleAddSingleCard,
    handleAddSingleImage,
    handleAddSingleTable,
    handleAddSingleFullSection,
    filteredSingleProducts
  };
}
