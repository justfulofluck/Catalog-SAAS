import React, { useState, useEffect, useRef } from 'react';
import {
  X, Plus, ChevronRight, ChevronLeft, ChevronDown, Grid,
  Layers, FileText, Package, LayoutTemplate
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Product, ProductVariant, ProductGridSection, TableData, Category } from '../../types';
import { extractSectionsFromPage } from './GridStudio/utils/gridDataGenerators';

import { GridSectionCard } from './GridStudio/components/GridSectionCard';
import { ProductPickerModal } from './GridStudio/components/ProductPickerModal';
import { AddCategoryModal } from './GridStudio/components/AddCategoryModal';
import { LinkRowModal } from './GridStudio/components/LinkRowModal';
import { ImageGalleryModal } from './GridStudio/components/ImageGalleryModal';
import { SingleProductCustomizerModal } from './GridStudio/components/SingleProductCustomizerModal';
import { OverviewView } from './GridStudio/components/OverviewView';
import { SingleItemsView } from './GridStudio/components/SingleItemsView';

import { useSections } from './GridStudio/hooks/useSections';
import { useTableEditing } from './GridStudio/hooks/useTableEditing';
import { useSingleItems } from './GridStudio/hooks/useSingleItems';

export const GridStudioPanel: React.FC = () => {
  const {
    catalog, currentPageIndex, setCurrentPageIndex, products, categories,
    mediaItems, adminAssets, addMedia, fetchMedia, addElement,
    setEditorTab, applyProductGridToPage,
    swapPageSections, deletePageSection, addInteriorPageWithInheritedLayout,
    uiTheme, setSelectedElementIds
  } = useStore();

  const isDark = uiTheme === 'dark';
  const [viewMode, setViewMode] = useState<'editor' | 'overview' | 'single-items'>('editor');
  const [showPageSelector, setShowPageSelector] = useState(false);
  const pageSelectorRef = useRef<HTMLDivElement>(null);

  // Close page selector on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (pageSelectorRef.current && !pageSelectorRef.current.contains(e.target as Node)) {
        setShowPageSelector(false);
      }
    };
    if (showPageSelector) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showPageSelector]);

  // Section Management Hook
  const {
    sections,
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
    navigateToPage,
    updateAndApplySections,
    handleUpdateSection,
    handleMoveSection,
    handleAddSection,
    handleDeleteSection,
    handleMoveSectionToPage,
    handleSelectProductForSection
  } = useSections({
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
  });

  // Table Editing Hook
  const {
    linkRowModal,
    setLinkRowModal,
    linkRowSearch,
    setLinkRowSearch,
    linkRowCategory,
    setLinkRowCategory,
    availableProductFields,
    handleCellChange,
    handleAddTableRow,
    handleAddTableRowsWithData,
    handleDeleteTableRow,
    handleAddTableColumn,
    handleDeleteTableColumn,
    handleFillColumnFromParam,
    handleDuplicateTableRow,
    handleFillRowWithProduct,
    handleUpdateTableStyle
  } = useTableEditing({
    sections,
    updateAndApplySections,
    categories,
    products
  });

  // Single Items Placement Hook
  const {
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
    openProductPropertiesCustomizer,
    handleInsertCustomizedProduct,
    handleAddSingleCard,
    filteredSingleProducts
  } = useSingleItems({
    catalog,
    currentPageIndex,
    categories,
    products,
    addElement,
    setSelectedElementIds,
    uiTheme
  });

  const activePage = catalog.pages[currentPageIndex];
  const isSpecialPage = activePage?.type === 'cover' || activePage?.type === 'index' || activePage?.type === 'closing';
  const firstProductPageIdx = catalog.pages.findIndex(p => p.type !== 'cover' && p.type !== 'index' && p.type !== 'closing');

  return (
    <div className={`flex flex-col h-full w-full font-sans overflow-hidden transition-colors ${
      isDark ? 'bg-[#141414] text-white border-r border-[#262626]' : 'bg-white text-slate-800 border-r border-slate-200'
    }`}>
      
      {/* ================= PANEL TOOLBAR ================= */}
      <div className={`px-2.5 py-1.5 border-b flex items-center justify-between gap-1.5 shrink-0 transition-colors ${
        isDark ? 'border-[#262626] bg-[#161616]' : 'border-slate-200 bg-white'
      }`}>
        {/* Quick Page Prev / Selector / Next */}
        <div className={`relative flex items-center gap-0.5 rounded-[4px] p-0.5 border transition-colors ${
          isDark ? 'bg-[#1e1e1e] border-[#333]' : 'bg-slate-100 border-slate-200'
        }`} ref={pageSelectorRef}>
          <button
            type="button"
            disabled={currentPageIndex <= 0}
            onClick={() => navigateToPage(currentPageIndex - 1)}
            className={`p-1 rounded transition-all disabled:opacity-25 ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-white'
            }`}
            title="Previous Page"
          >
            <ChevronLeft size={13} />
          </button>

          <button
            type="button"
            onClick={() => setShowPageSelector(!showPageSelector)}
            className={`flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold rounded transition-all ${
              isDark ? 'text-[#E2DCC8] hover:bg-white/5' : 'text-slate-800 hover:bg-white shadow-xs'
            }`}
            title="Switch Page"
          >
            <span>Page {currentPageIndex + 1} / {catalog.pages.length}</span>
            <ChevronDown size={11} className={isDark ? "text-slate-400" : "text-slate-500"} />
          </button>

          <button
            type="button"
            disabled={currentPageIndex >= catalog.pages.length - 1}
            onClick={() => navigateToPage(currentPageIndex + 1)}
            className={`p-1 rounded transition-all disabled:opacity-25 ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-900 hover:bg-white'
            }`}
            title="Next Page"
          >
            <ChevronRight size={13} />
          </button>

          {/* Page Selector Dropdown */}
          {showPageSelector && (
            <div className={`absolute top-full left-0 mt-1 w-56 border rounded-[6px] shadow-2xl z-[100] max-h-64 overflow-y-auto p-1 space-y-0.5 custom-scrollbar ${
              isDark ? 'bg-[#181818] border-[#333]' : 'bg-white border-slate-200 shadow-xl'
            }`}>
              <div className={`px-2 py-1 text-[8px] font-black uppercase tracking-wider border-b ${
                isDark ? 'text-slate-500 border-[#262626]' : 'text-slate-400 border-slate-100'
              }`}>
                Catalog Pages & Grids
              </div>
              {catalog.pages.map((p, idx) => {
                const pSections = extractSectionsFromPage(p);
                const isCurrent = idx === currentPageIndex;
                const isCover = p.type === 'cover';
                return (
                  <button
                    key={p.id || idx}
                    type="button"
                    onClick={() => {
                      navigateToPage(idx);
                      setShowPageSelector(false);
                    }}
                    className={`w-full px-2 py-1.5 rounded flex items-center justify-between text-left text-[10px] transition-all ${
                      isCurrent
                        ? 'bg-[#0F3D3E] text-white font-bold'
                        : (isDark ? 'text-slate-300 hover:bg-[#242424]' : 'text-slate-700 hover:bg-slate-100')
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`font-mono text-[9px] shrink-0 ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E] font-bold'}`}>P{idx + 1}</span>
                      <span className="truncate">
                        {isCover ? 'Cover Page' : (p.type === 'index' ? 'Index Page' : (p.title || `Product Page`))}
                      </span>
                    </div>
                    <span className="text-[8px] opacity-75 font-semibold shrink-0 ml-1">
                      {isCover ? '📘' : `${pSections.length} Grids`}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Mode Tabs: [ ✏️ 3-Grid Editor ] | [ 🗂️ Grid Map ] | [ 📦 Single Items ] */}
        <div className={`flex items-center border rounded-[4px] p-0.5 gap-0.5 ${
          isDark ? 'bg-[#1e1e1e] border-[#333]' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            type="button"
            onClick={() => setViewMode('editor')}
            className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
              viewMode === 'editor'
                ? 'bg-[#0F3D3E] text-white shadow-sm'
                : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
            }`}
            title="3-Product Section Grid Editor"
          >
            <Grid size={11} /> 3-Grid Editor
          </button>
          <button
            type="button"
            onClick={() => setViewMode('overview')}
            className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
              viewMode === 'overview'
                ? 'bg-[#0F3D3E] text-white shadow-sm'
                : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
            }`}
            title="Multi-page Grid Organizer"
          >
            <Layers size={11} /> Grid Map
          </button>
          <button
            type="button"
            onClick={() => setViewMode('single-items')}
            className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
              viewMode === 'single-items'
                ? 'bg-[#0F3D3E] text-white shadow-sm'
                : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900')
            }`}
            title="Single Product Cards & Placement"
          >
            <Package size={11} /> Single Items
          </button>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => setEditorTab(null)}
          className={`p-1 rounded transition-colors shrink-0 ${
            isDark ? 'text-[#888] hover:text-white hover:bg-[#222]' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
          }`}
          title="Close Grid Studio"
        >
          <X size={14} />
        </button>
      </div>

      {/* ================= VIEW CONTAINER ================= */}
      {viewMode === 'overview' ? (
        <OverviewView
          catalog={catalog}
          currentPageIndex={currentPageIndex}
          sections={sections}
          isDark={isDark}
          navigateToPage={navigateToPage}
          setViewMode={setViewMode}
          addInteriorPageWithInheritedLayout={addInteriorPageWithInheritedLayout}
          handleMoveSectionToPage={handleMoveSectionToPage}
          handleMoveSection={handleMoveSection}
          swapPageSections={swapPageSections}
          handleDeleteSection={handleDeleteSection}
          deletePageSection={deletePageSection}
          setAddCategoryTargetPageIdx={setAddCategoryTargetPageIdx}
          setShowAddCategoryModal={setShowAddCategoryModal}
        />
      ) : viewMode === 'single-items' ? (
        <SingleItemsView
          isDark={isDark}
          currentPageIndex={currentPageIndex}
          filteredSingleProducts={filteredSingleProducts}
          singleItemFeedback={singleItemFeedback}
          singleSearch={singleSearch}
          setSingleSearch={setSingleSearch}
          singleCategoryFilter={singleCategoryFilter}
          setSingleCategoryFilter={setSingleCategoryFilter}
          products={products}
          categories={categories}
          handleAddSingleCard={handleAddSingleCard}
          openProductPropertiesCustomizer={openProductPropertiesCustomizer}
        />
      ) : (
        /* ================= 3-GRID EDITOR VIEW ================= */
        <div className={`flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar transition-colors ${
          isDark ? 'bg-[#121212]' : 'bg-slate-50'
        }`}>
          {isSpecialPage ? (
            <div className={`py-12 px-6 text-center border rounded-[8px] space-y-4 ${
              isDark ? 'border-[#2a2a2a] bg-[#161616]' : 'border-slate-200 bg-white shadow-sm'
            }`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
                isDark ? 'bg-[#0F3D3E]/40 border border-[#E2DCC8]/20 text-[#E2DCC8]' : 'bg-teal-50 border border-teal-200 text-[#0F3D3E]'
              }`}>
                <FileText size={22} />
              </div>
              <div className="space-y-1">
                <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-[#F1F1F1]' : 'text-slate-900'}`}>
                  Page {currentPageIndex + 1} is a {activePage?.type === 'cover' ? 'Cover' : activePage?.type} Page
                </h3>
                <p className={`text-xs max-w-md mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Cover pages are reserved for branding, hero imagery, and titles. 3-Product Grids are designed for interior product catalog pages.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                {firstProductPageIdx !== -1 && (
                  <button
                    type="button"
                    onClick={() => navigateToPage(firstProductPageIdx)}
                    className="w-full sm:w-auto px-4 py-2 bg-[#0F3D3E] hover:bg-[#155455] text-white rounded-[4px] text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow border border-[#E2DCC8]/30 cursor-pointer"
                  >
                    <span>👉 Jump to Product Grid (Page {firstProductPageIdx + 1})</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setViewMode('single-items')}
                  className={`w-full sm:w-auto px-4 py-2 rounded-[4px] text-xs font-bold flex items-center justify-center gap-1.5 transition-all border cursor-pointer ${
                    isDark ? 'bg-[#202020] hover:bg-[#282828] text-[#E2DCC8] border-[#333]' : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-sm'
                  }`}
                >
                  <Package size={13} />
                  <span>Insert Single Item Instead</span>
                </button>
              </div>
            </div>
          ) : sections.length === 0 ? (
            <div className={`p-6 text-center rounded-xl border border-dashed flex flex-col items-center justify-center gap-3 ${
              isDark ? 'border-[#262626] bg-[#141414]' : 'border-slate-200 bg-slate-50'
            }`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isDark ? 'bg-[#1e1e1e] text-slate-400' : 'bg-white text-slate-500 shadow-sm'
              }`}>
                <LayoutTemplate size={24} />
              </div>
              <div>
                <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Page {currentPageIndex + 1} is Empty
                </h4>
                <p className={`text-[11px] mt-1 max-w-[240px] leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  This page has no grid sections yet. Click below to add a category section.
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAddCategoryTargetPageIdx(currentPageIndex);
                    setShowAddCategoryModal(true);
                  }}
                  className="w-full py-2.5 px-3 bg-[#0F3D3E] hover:bg-[#155455] text-[#F1F1F1] border border-[#E2DCC8]/30 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <Plus size={14} className="text-[#00a651]" />
                  <span>Pick Category Section</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header Bar */}
              <div className={`px-2 py-1.5 border rounded-lg flex items-center justify-between transition-colors ${
                isDark ? 'bg-[#181818] border-[#262626]' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-[#E2DCC8]' : 'text-slate-800'}`}>
                    Grid Sections ({sections.length}/4)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setAddCategoryTargetPageIdx(currentPageIndex);
                      setShowAddCategoryModal(true);
                    }}
                    className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 transition-all border cursor-pointer ${
                      isDark ? 'bg-[#202020] hover:bg-[#282828] text-[#E2DCC8] border-[#333]' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs'
                    }`}
                  >
                    <Plus size={11} className="text-[#00a651]" /> Add Category
                  </button>
                  {sections.length < 4 && (
                    <button
                      type="button"
                      onClick={handleAddSection}
                      className="px-2.5 py-1 bg-[#0F3D3E] hover:bg-[#155455] text-[#F1F1F1] rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                    >
                      <Plus size={11} /> Add Section
                    </button>
                  )}
                </div>
              </div>

              {/* Grid Section Cards */}
              {sections.map((sec, secIdx) => (
                <GridSectionCard
                  key={sec.id || secIdx}
                  sec={sec}
                  secIdx={secIdx}
                  totalSections={sections.length}
                  isHighlighted={highlightedSecIdx === secIdx}
                  catalogPagesCount={catalog.pages.length}
                  currentPageIndex={currentPageIndex}
                  categories={categories}
                  products={products}
                  availableProductFields={availableProductFields}
                  isDark={isDark}
                  onUpdateSection={handleUpdateSection}
                  onDeleteSection={handleDeleteSection}
                  onMoveSection={handleMoveSection}
                  onMoveSectionToPage={handleMoveSectionToPage}
                  onOpenProductPicker={(idx) => setProductPickerSectionIdx(idx)}
                  onOpenImageGalleryPicker={(idx) => setImageGalleryPickerSectionIdx(idx)}
                  onUploadImageFile={handleUploadImageFile}
                  onOpenLinkRowModal={(sIdx, rIdx) => setLinkRowModal({ secIdx: sIdx, rIdx })}
                  onAddTableRow={handleAddTableRow}
                  onAddTableRowsWithData={handleAddTableRowsWithData}
                  onDeleteTableRow={handleDeleteTableRow}
                  onDuplicateTableRow={handleDuplicateTableRow}
                  onUpdateTableRowCell={handleCellChange}
                  onAddTableColumn={handleAddTableColumn}
                  onDeleteTableColumn={handleDeleteTableColumn}
                  onAutofillTableColumn={handleFillColumnFromParam}
                  onUpdateTableStyle={handleUpdateTableStyle}
                  isUploadingMedia={isUploadingMedia}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= MODALS ================= */}
      {/* 1. Add Category Modal */}
      <AddCategoryModal
        isOpen={showAddCategoryModal}
        onClose={() => {
          setShowAddCategoryModal(false);
          setAddCategoryTargetPageIdx(null);
          setAddCategorySearch('');
        }}
        targetPageIdx={addCategoryTargetPageIdx}
        search={addCategorySearch}
        onSearchChange={setAddCategorySearch}
        unincludedCategories={unincludedCategories}
        products={products}
        onAddCategory={handleAddCategoryToCatalog}
        isDark={isDark}
      />

      {/* 2. Product Picker Modal */}
      <ProductPickerModal
        sectionIdx={productPickerSectionIdx}
        onClose={() => setProductPickerSectionIdx(null)}
        search={pickerSearch}
        onSearchChange={setPickerSearch}
        categoryFilter={pickerCategoryFilter}
        onCategoryFilterChange={setPickerCategoryFilter}
        products={products}
        categories={categories}
        onSelectProduct={handleSelectProductForSection}
        isDark={isDark}
      />

      {/* 3. Image Gallery Picker Modal */}
      <ImageGalleryModal
        sectionIdx={imageGalleryPickerSectionIdx}
        onClose={() => setImageGalleryPickerSectionIdx(null)}
        sections={sections}
        onSelectImage={(idx, imgUrl) => {
          handleUpdateSection(idx, { imageSrc: imgUrl });
          setImageGalleryPickerSectionIdx(null);
        }}
        onUploadFile={async (idx, file) => {
          await handleUploadImageFile(idx, file);
          setImageGalleryPickerSectionIdx(null);
        }}
        isUploading={isUploadingMedia}
        galleryTab={galleryTab}
        onTabChange={setGalleryTab}
        search={gallerySearch}
        onSearchChange={setGallerySearch}
        mediaItems={mediaItems}
        categories={categories}
        products={products}
        adminAssets={adminAssets}
        isDark={isDark}
      />

      {/* 4. Link Row to Product Modal */}
      <LinkRowModal
        modalState={linkRowModal}
        onClose={() => setLinkRowModal(null)}
        search={linkRowSearch}
        onSearchChange={setLinkRowSearch}
        selectedCategory={linkRowCategory}
        onCategoryChange={setLinkRowCategory}
        products={products}
        categories={categories}
        onLinkProduct={handleFillRowWithProduct}
        isDark={isDark}
      />

      {/* 5. Single Product Customizer Modal */}
      <SingleProductCustomizerModal
        customizingProduct={customizingProduct}
        onClose={() => setCustomizingProduct(null)}
        currentPageIndex={currentPageIndex}
        categories={categories}
        products={products}
        customCardTheme={customCardTheme}
        setCustomCardTheme={setCustomCardTheme}
        customShowName={customShowName}
        setCustomShowName={setCustomShowName}
        customTitle={customTitle}
        setCustomTitle={setCustomTitle}
        customTitleColor={customTitleColor}
        setCustomTitleColor={setCustomTitleColor}
        customTitleFontSize={customTitleFontSize}
        setCustomTitleFontSize={setCustomTitleFontSize}
        customShowPrice={customShowPrice}
        setCustomShowPrice={setCustomShowPrice}
        customPrice={customPrice}
        setCustomPrice={setCustomPrice}
        customPriceColor={customPriceColor}
        setCustomPriceColor={setCustomPriceColor}
        customPriceFontSize={customPriceFontSize}
        setCustomPriceFontSize={setCustomPriceFontSize}
        customShowSku={customShowSku}
        setCustomShowSku={setCustomShowSku}
        customSku={customSku}
        setCustomSku={setCustomSku}
        customFill={customFill}
        setCustomFill={setCustomFill}
        customStroke={customStroke}
        setCustomStroke={setCustomStroke}
        customBorderRadius={customBorderRadius}
        setCustomBorderRadius={setCustomBorderRadius}
        customVisibleFieldKeys={customVisibleFieldKeys}
        setCustomVisibleFieldKeys={setCustomVisibleFieldKeys}
        customFieldOverrides={customFieldOverrides}
        setCustomFieldOverrides={setCustomFieldOverrides}
        customEditingFieldKey={customEditingFieldKey}
        setCustomEditingFieldKey={setCustomEditingFieldKey}
        onResetToDefaults={openProductPropertiesCustomizer}
        onInsertCustomizedProduct={handleInsertCustomizedProduct}
        isDark={isDark}
      />

    </div>
  );
};

export default GridStudioPanel;
