import { useState, useEffect, useRef, useMemo } from 'react';
import { ProductGridSection, Category, Product, Catalog } from '../../../../types';
import { normalizeImageUrl, resolveProductImage, resolveProductTitle } from '../../../../utils/imageUtils';
import {
  getCategoryProductsForPage,
  generateSectionForCategory,
  getUnincludedCategories,
  extractSectionsFromPage,
  generateRowFromProduct
} from '../utils/gridDataGenerators';

interface UseSectionsProps {
  catalog: Catalog;
  currentPageIndex: number;
  setCurrentPageIndex: (idx: number) => void;
  products: Product[];
  categories: Category[];
  mediaItems?: any[];
  fetchMedia: () => void;
  addMedia: (file: File) => Promise<any>;
  applyProductGridToPage: (pageIndex: number, sections: ProductGridSection[]) => void;
  addInteriorPageWithInheritedLayout: () => void;
}

export function useSections({
  catalog,
  currentPageIndex,
  setCurrentPageIndex,
  products,
  categories,
  mediaItems,
  fetchMedia,
  addMedia,
  applyProductGridToPage,
  addInteriorPageWithInheritedLayout
}: UseSectionsProps) {
  // Gallery image picker modal state
  const [imageGalleryPickerSectionIdx, setImageGalleryPickerSectionIdx] = useState<number | null>(null);
  const [galleryTab, setGalleryTab] = useState<'all' | 'uploads' | 'categories' | 'products' | 'presets' | 'admin'>('uploads');
  const [gallerySearch, setGallerySearch] = useState('');
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  useEffect(() => {
    if (!mediaItems || mediaItems.length === 0) {
      fetchMedia();
    }
  }, []);

  const [sections, setSections] = useState<ProductGridSection[]>(() => {
    const page = catalog?.pages?.[currentPageIndex];
    if (page?.type === 'cover' || page?.type === 'index' || page?.type === 'closing') {
      return [];
    }
    return extractSectionsFromPage(page);
  });

  const sectionsRef = useRef(sections);
  useEffect(() => { sectionsRef.current = sections; }, [sections]);

  // Add Unincluded Category modal state
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [addCategoryTargetPageIdx, setAddCategoryTargetPageIdx] = useState<number | null>(null);
  const [addCategorySearch, setAddCategorySearch] = useState('');

  // Compute unincluded categories dynamically
  const unincludedCategories = useMemo(() => {
    return getUnincludedCategories(catalog, categories, products, sections, currentPageIndex);
  }, [catalog, categories, products, sections, currentPageIndex]);

  const [productPickerSectionIdx, setProductPickerSectionIdx] = useState<number | null>(null);
  const [pickerCategoryFilter, setPickerCategoryFilter] = useState<string | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [highlightedSecIdx, setHighlightedSecIdx] = useState<number | null>(null);

  // Page switcher navigation
  const navigateToPage = (idx: number) => {
    if (idx < 0 || idx >= catalog.pages.length) return;
    setCurrentPageIndex(idx);
    window.dispatchEvent(new CustomEvent('catalog:scrollToPage', { detail: { pageIndex: idx } }));
  };

  // Re-sync local sections state whenever active page or products change
  useEffect(() => {
    const page = catalog?.pages?.[currentPageIndex];
    if (page) {
      if (page.type === 'cover' || page.type === 'index' || page.type === 'closing') {
        setSections([]);
        return;
      }
      const extracted = extractSectionsFromPage(page);
      setSections(extracted);
    }
  }, [currentPageIndex, catalog?.pages, products, categories]);

  // Listen to catalog:editTable event to auto-scroll to section
  useEffect(() => {
    const handleEditTable = (e: any) => {
      const { id } = e.detail || {};
      if (id) {
        const secIndex = sections.findIndex(s => s.id === id);
        const targetIdx = secIndex !== -1 ? secIndex : 0;
        setHighlightedSecIdx(targetIdx);
        setTimeout(() => {
          const el = document.getElementById(`grid-sec-card-${targetIdx}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 120);
        setTimeout(() => setHighlightedSecIdx(null), 3000);
      }
    };
    window.addEventListener('catalog:editTable', handleEditTable);
    return () => window.removeEventListener('catalog:editTable', handleEditTable);
  }, [sections]);

  // Auto-navigate to first interior/product grid page on mount if currently on cover
  useEffect(() => {
    const activeP = catalog?.pages?.[currentPageIndex];
    if (activeP?.type === 'cover' && catalog?.pages && catalog.pages.length > 1) {
      const firstProductPageIdx = catalog.pages.findIndex(
        p => p.type !== 'cover' && p.type !== 'index' && p.type !== 'closing'
      );
      if (firstProductPageIdx !== -1 && firstProductPageIdx !== currentPageIndex) {
        navigateToPage(firstProductPageIdx);
      }
    }
  }, []);

  // Helper to commit state updates and live-apply immediately to active catalog page
  const updateAndApplySections = (updater: (prev: ProductGridSection[]) => ProductGridSection[]) => {
    const next = updater(sectionsRef.current);
    sectionsRef.current = next;
    const activeP = catalog?.pages?.[currentPageIndex];
    if (activeP && activeP.type !== 'cover' && activeP.type !== 'index' && activeP.type !== 'closing') {
      applyProductGridToPage(currentPageIndex, next);
    }
    setSections(next);
  };

  // Update sections helper
  const handleUpdateSection = (idx: number, updates: Partial<ProductGridSection>) => {
    updateAndApplySections(prev => prev.map((sec, i) => i === idx ? { ...sec, ...updates } : sec));
  };

  const handleUploadImageFile = async (secIdx: number, file: File) => {
    try {
      setIsUploadingMedia(true);
      const newItem = await addMedia(file);
      const imgUrl = normalizeImageUrl(newItem?.url || '');
      if (imgUrl) {
        handleUpdateSection(secIdx, { imageSrc: imgUrl });
      }
    } catch (err) {
      console.error("Failed to upload image file:", err);
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleAddCategoryToCatalog = (cat: Category, targetPageIdx?: number | null) => {
    let pageIdx = targetPageIdx;

    if (pageIdx === undefined || pageIdx === null) {
      // Find first non-cover interior page with < 3 sections
      const availablePageIdx = catalog.pages.findIndex((p, idx) => {
        if (p.type === 'cover' || p.type === 'index' || p.type === 'closing') return false;
        const secs = (idx === currentPageIndex) ? sections : extractSectionsFromPage(p);
        return secs.length < 3;
      });

      if (availablePageIdx !== -1) {
        pageIdx = availablePageIdx;
      } else {
        // Need a new interior page
        addInteriorPageWithInheritedLayout();
        pageIdx = catalog.pages.length;
      }
    }

    const targetPage = catalog.pages[pageIdx];
    const existingSecs = (pageIdx === currentPageIndex)
      ? [...sections]
      : (targetPage ? extractSectionsFromPage(targetPage) : []);

    const newSec = generateSectionForCategory(cat, products, categories, existingSecs.length);
    const updatedSecs = [...existingSecs, newSec];

    // Apply to page
    applyProductGridToPage(pageIdx, updatedSecs);

    if (pageIdx === currentPageIndex) {
      setSections(updatedSecs);
    }

    navigateToPage(pageIdx);
    setShowAddCategoryModal(false);
    setAddCategoryTargetPageIdx(null);
    setAddCategorySearch('');
  };

  const handleMoveSection = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    updateAndApplySections(prev => {
      const copy = [...prev];
      const [moved] = copy.splice(idx, 1);
      copy.splice(targetIdx, 0, moved);
      return copy;
    });
  };

  const handleReorderSections = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= sections.length || fromIdx === toIdx) return;
    updateAndApplySections(prev => {
      const copy = [...prev];
      const [moved] = copy.splice(fromIdx, 1);
      copy.splice(toIdx, 0, moved);
      return copy;
    });
  };

  const handleAddSection = () => {
    if (sections.length >= 4) return;
    const newIdx = sections.length + 1;
    const activePage = catalog.pages[currentPageIndex];
    const { categoryName, categoryProducts } = getCategoryProductsForPage(activePage, currentPageIndex, products, categories);
    const chosenProduct = categoryProducts[newIdx - 1] || categoryProducts[0];
    const targetCat = categories.find(c => c.name === categoryName || String(c.id) === String((chosenProduct as any)?.categoryId));

    const currentFirstSec = sections[0];
    const defaultHeaders = currentFirstSec?.tableData?.headers?.length
      ? currentFirstSec.tableData.headers
      : ['MODEL NO', 'PRODUCTS', 'PRICE'];

    const rows = chosenProduct
      ? (chosenProduct.variants && chosenProduct.variants.length > 0
          ? chosenProduct.variants.map(v => generateRowFromProduct(defaultHeaders, chosenProduct, v, categories))
          : [generateRowFromProduct(defaultHeaders, chosenProduct, undefined, categories)])
      : [['-', `${categoryName.toUpperCase()} SERIES ${newIdx}`, '-']];

    const newSec: ProductGridSection = {
      id: `sec-${Date.now()}`,
      title: resolveProductTitle(chosenProduct, categoryName, newIdx),
      titleColor: '#00a651',
      titleFontSize: 22,
      imageSrc: resolveProductImage(chosenProduct, targetCat, categoryProducts),
      hasBackground: newIdx % 2 === 0,
      backgroundColor: '#e2e8f0',
      tableData: {
        headers: defaultHeaders,
        rows,
        headerBg: '#002b36',
        headerTextColor: '#ffffff',
        alternateRowBg: '#f8fafc',
        rowBg: '#ffffff',
        borderColor: '#002b36',
        fontSize: 7.5,
        headerFontSize: 8,
        cellPadding: 4,
        colWidths: [80, 200, 80]
      }
    };
    updateAndApplySections(prev => [...prev, newSec]);
  };

  const handleDeleteSection = (idx: number) => {
    if (sections.length <= 1) return;
    updateAndApplySections(prev => prev.filter((_, i) => i !== idx));
  };

  // Move a section from one page to another
  const handleMoveSectionToPage = (fromPageIdx: number, toPageIdx: number, secIdx: number) => {
    if (fromPageIdx === toPageIdx) return;
    const fromPage = catalog.pages[fromPageIdx];
    const toPage = catalog.pages[toPageIdx];
    if (!fromPage || !toPage) return;

    const fromSections = fromPageIdx === currentPageIndex ? [...sections] : extractSectionsFromPage(fromPage);
    const toSections = toPageIdx === currentPageIndex ? [...sections] : extractSectionsFromPage(toPage);

    if (secIdx < 0 || secIdx >= fromSections.length) return;

    const [targetSection] = fromSections.splice(secIdx, 1);
    toSections.push(targetSection);

    // Apply changes to both pages
    applyProductGridToPage(fromPageIdx, fromSections);
    applyProductGridToPage(toPageIdx, toSections);

    if (fromPageIdx === currentPageIndex) {
      setSections(fromSections);
    } else if (toPageIdx === currentPageIndex) {
      setSections(toSections);
    }
  };

  const handleSelectProductForSection = (secIdx: number, product: Product) => {
    const targetCat = categories.find(c => String(c.id) === String(product.categoryId));
    const title = resolveProductTitle(product, targetCat?.name || 'PRODUCT', secIdx);
    const imageSrc = resolveProductImage(product, targetCat, products);

    updateAndApplySections(prev => prev.map((sec, i) => {
      if (i !== secIdx) return sec;
      const currentHeaders = sec.tableData?.headers?.length ? sec.tableData.headers : ['MODEL NO', 'PRODUCTS', 'PRICE'];
      let rows: string[][] = [];
      if (product.variants && product.variants.length > 0) {
        rows = product.variants.map(v => generateRowFromProduct(currentHeaders, product, v, categories));
      } else {
        rows = [generateRowFromProduct(currentHeaders, product, undefined, categories)];
      }

      return {
        ...sec,
        title,
        imageSrc,
        tableData: {
          ...sec.tableData,
          rows
        }
      };
    }));

    setProductPickerSectionIdx(null);
  };

  return {
    sections,
    setSections,
    sectionsRef,
    showAddCategoryModal,
    setShowAddCategoryModal,
    addCategoryTargetPageIdx,
    setAddCategoryTargetPageIdx,
    addCategorySearch,
    setAddCategorySearch,
    unincludedCategories,
    handleAddCategoryToCatalog,
    imageGalleryPickerSectionIdx,
    setImageGalleryPickerSectionIdx,
    galleryTab,
    setGalleryTab,
    gallerySearch,
    setGallerySearch,
    isUploadingMedia,
    handleUploadImageFile,
    productPickerSectionIdx,
    setProductPickerSectionIdx,
    pickerCategoryFilter,
    setPickerCategoryFilter,
    pickerSearch,
    setPickerSearch,
    highlightedSecIdx,
    setHighlightedSecIdx,
    navigateToPage,
    updateAndApplySections,
    handleUpdateSection,
    handleMoveSection,
    handleReorderSections,
    handleAddSection,
    handleDeleteSection,
    handleMoveSectionToPage,
    handleSelectProductForSection
  };
}
