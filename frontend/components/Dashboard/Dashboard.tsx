import React, { useEffect, useMemo } from 'react';
import {
  Package,
  Box,
  Layers,
  BookOpen,
  FolderPlus,
  ArrowUpRight,
  Clock,
  LayoutGrid,
  Zap,
  ChevronRight,
  Settings,
  Briefcase,
  Images,
  Plus,
  FileText,
  Sparkles,
  Sliders,
  Eye,
  FolderOpen
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { ProductThumbnail } from '../Common/ProductThumbnail';

const Dashboard: React.FC = () => {
  const {
    setView,
    user,
    products,
    categories,
    setActiveCategoryId,
    savedCatalogs,
    mediaItems,
    fetchProducts,
    fetchCategories,
    fetchCatalogs,
    fetchMedia,
    loadCatalog,
    uiTheme,
    openCreateProductModal
  } = useStore();

  const isDark = uiTheme === 'dark';

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchCatalogs();
    fetchMedia();
  }, [fetchProducts, fetchCategories, fetchCatalogs, fetchMedia]);

  // Compute metrics
  const totalVariants = useMemo(() => {
    return products.reduce((acc, p) => acc + (p.variants?.length || 1), 0);
  }, [products]);

  const totalCatalogPages = useMemo(() => {
    return savedCatalogs.reduce((acc, c) => acc + (c.pages?.length || 0), 0);
  }, [savedCatalogs]);

  // Top categories
  const topCategories = useMemo(() => {
    return categories
      .map(cat => ({
        ...cat,
        productCount: products.filter(p => String(p.categoryId) === String(cat.id)).length
      }))
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, 5);
  }, [categories, products]);

  const stats = [
    {
      label: 'Total Inventory',
      value: products.length,
      unit: 'Products',
      icon: <Package size={16} />,
      color: isDark ? 'bg-teal-950/40 text-teal-300 border border-teal-500/30' : 'bg-teal-50 text-teal-700 border border-teal-200',
      action: () => { setActiveCategoryId(null); setView('products-list'); }
    },
    {
      label: 'Categories',
      value: categories.length,
      unit: 'Collections',
      icon: <Layers size={16} />,
      color: isDark ? 'bg-indigo-950/40 text-indigo-300 border border-indigo-500/30' : 'bg-indigo-50 text-indigo-700 border border-indigo-200',
      action: () => setView('category-list')
    },
    {
      label: 'Saved Catalogs',
      value: savedCatalogs.length,
      unit: 'Projects',
      icon: <BookOpen size={16} />,
      color: isDark ? 'bg-amber-950/40 text-amber-300 border border-amber-500/30' : 'bg-amber-50 text-amber-700 border border-amber-200',
      action: () => setView('your-work')
    },
    {
      label: 'Media Assets',
      value: mediaItems.length,
      unit: 'Files',
      icon: <Images size={16} />,
      color: isDark ? 'bg-sky-950/40 text-sky-300 border border-sky-500/30' : 'bg-sky-50 text-sky-700 border border-sky-200',
      action: () => setView('media-library')
    },
    {
      label: 'Total SKUs',
      value: totalVariants,
      unit: 'Variants',
      icon: <Sliders size={16} />,
      color: isDark ? 'bg-purple-950/40 text-purple-300 border border-purple-500/30' : 'bg-purple-50 text-purple-700 border border-purple-200',
      action: () => { setActiveCategoryId(null); setView('products-list'); }
    },
    {
      label: 'Compiled Pages',
      value: totalCatalogPages,
      unit: 'Pages Built',
      icon: <FileText size={16} />,
      color: isDark ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30' : 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      action: () => setView('your-work')
    }
  ];

  return (
    <div className={`flex-1 overflow-y-auto p-6 md:p-8 w-full animate-in fade-in duration-300 custom-scrollbar ${
      isDark ? 'bg-[#100F0F] text-[#F1F1F1]' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="w-full space-y-6">
        
        {/* Header Section */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
          isDark ? 'border-[#E2DCC8]/15' : 'border-slate-200'
        }`}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded-[3px] text-[9px] font-bold uppercase tracking-widest border ${
                isDark ? 'bg-[#0F3D3E]/30 text-[#E2DCC8] border-[#0F3D3E]' : 'bg-[#0F3D3E]/10 text-[#0F3D3E] border-[#0F3D3E]/30'
              }`}>
                WORKSPACE OVERVIEW
              </span>
            </div>
            <h1 className={`text-2xl md:text-3xl font-bold tracking-tight font-heading leading-tight ${
              isDark ? 'text-[#F1F1F1]' : 'text-slate-900'
            }`}>
              Welcome, <span className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"}>{user?.name ? user.name.split(' ')[0] : 'Creator'}</span>.
            </h1>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => openCreateProductModal()}
              className={`px-3.5 py-2 rounded-[4px] border text-xs font-heading font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                isDark 
                  ? 'bg-[#171616] hover:bg-[#202020] border-[#E2DCC8]/20 text-[#E2DCC8]' 
                  : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <Plus size={13} /> Add Product
            </button>

            <button
              onClick={() => setView('create-category')}
              className={`px-3.5 py-2 rounded-[4px] border text-xs font-heading font-semibold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                isDark 
                  ? 'bg-[#171616] hover:bg-[#202020] border-[#E2DCC8]/20 text-[#E2DCC8]' 
                  : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <FolderPlus size={13} /> Add Category
            </button>

            <button
              onClick={() => setView('catalog-setup')}
              className="px-4 py-2 bg-[#0F3D3E] hover:bg-[#155455] text-white border border-[#E2DCC8]/30 rounded-[4px] font-heading font-semibold text-xs uppercase tracking-wider shadow-md shadow-[#0F3D3E]/20 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <LayoutGrid size={14} className="text-[#E2DCC8]" /> Build Catalog
            </button>
          </div>
        </div>

        {/* 6-Card KPI Parameter Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {stats.map((stat, i) => (
            <div
              key={i}
              onClick={stat.action}
              className={`p-3.5 rounded-[4px] flex items-center justify-between group transition-all cursor-pointer shadow-sm ${
                isDark 
                  ? 'bg-[#141414] border border-[#E2DCC8]/15 hover:border-[#E2DCC8]/35 hover:bg-[#171616]' 
                  : 'bg-white border border-slate-200 hover:border-[#0F3D3E]/40 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 ${stat.color} rounded-[3px] flex items-center justify-center shrink-0`}>
                  {stat.icon}
                </div>
                <div className="min-w-0">
                  <p className={`text-[9px] font-bold uppercase tracking-wider font-heading truncate ${
                    isDark ? 'text-[#E2DCC8]/70' : 'text-slate-500'
                  }`}>
                    {stat.label}
                  </p>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className={`text-xl font-bold font-space leading-tight ${
                      isDark ? 'text-[#F1F1F1]' : 'text-slate-900'
                    }`}>
                      {stat.value}
                    </span>
                    <span className={`text-[9px] font-mono truncate ${isDark ? 'text-[#E2DCC8]/40' : 'text-slate-400'}`}>
                      {stat.unit}
                    </span>
                  </div>
                </div>
              </div>

              <ChevronRight size={13} className={`${
                isDark ? 'text-[#555555] group-hover:text-[#E2DCC8]' : 'text-slate-400 group-hover:text-[#0F3D3E]'
              } group-hover:translate-x-0.5 transition-all shrink-0 ml-1`} />
            </div>
          ))}
        </div>

        {/* Main Content: Left (Catalogs + Products) & Right (Categories + Quick Actions) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Left Column (Col Span 8) */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* Recent Catalogs & Publications */}
            <div className={`rounded-[4px] border overflow-hidden shadow-sm ${
              isDark ? 'bg-[#141414] border-[#E2DCC8]/15' : 'bg-white border-slate-200'
            }`}>
              <div className={`px-5 py-3.5 border-b flex items-center justify-between ${
                isDark ? 'bg-[#171616] border-[#E2DCC8]/15' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-2">
                  <BookOpen size={14} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} />
                  <span className={`font-space text-xs font-bold uppercase tracking-wider ${
                    isDark ? 'text-[#F1F1F1]' : 'text-slate-900'
                  }`}>
                    Recent Catalogs & Publications ({savedCatalogs.length})
                  </span>
                </div>
                
                <button
                  onClick={() => setView('your-work')}
                  className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors ${
                    isDark ? 'text-[#E2DCC8]/80 hover:text-white' : 'text-[#0F3D3E] hover:text-[#155455]'
                  }`}
                >
                  <span>View All</span>
                  <ArrowUpRight size={12} />
                </button>
              </div>

              <div className="p-4">
                {savedCatalogs.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {savedCatalogs.slice(0, 3).map((cat) => (
                      <div
                        key={cat.id}
                        onClick={async () => {
                          await loadCatalog(cat.id);
                          setView('editor');
                        }}
                        className={`p-3.5 rounded-[4px] border transition-all cursor-pointer group flex flex-col justify-between ${
                          isDark 
                            ? 'bg-[#100F0F] border-[#E2DCC8]/15 hover:border-[#0F3D3E] hover:bg-[#161616]' 
                            : 'bg-slate-50 border-slate-200 hover:border-[#0F3D3E] hover:bg-white hover:shadow-sm'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                              isDark ? 'bg-[#0F3D3E]/30 text-[#E2DCC8] border-[#0F3D3E]/50' : 'bg-[#0F3D3E]/10 text-[#0F3D3E] border-[#0F3D3E]/20'
                            }`}>
                              {cat.pages?.length || 1} Pages
                            </span>
                            <span className={`text-[9px] font-mono truncate ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                              {cat.updatedAt ? new Date(cat.updatedAt).toLocaleDateString() : 'Active Draft'}
                            </span>
                          </div>

                          <h3 className={`font-heading text-xs font-semibold truncate transition-colors mb-0.5 ${
                            isDark ? 'text-[#F1F1F1] group-hover:text-[#E2DCC8]' : 'text-slate-900 group-hover:text-[#0F3D3E]'
                          }`}>
                            {cat.name || 'Untitled Catalog'}
                          </h3>
                          <p className={`text-[10px] font-mono truncate ${isDark ? 'text-[#E2DCC8]/50' : 'text-slate-500'}`}>
                            Template: {cat.templateId || 'Classic Catalog'}
                          </p>
                        </div>

                        <div className="mt-3 pt-2.5 border-t flex items-center justify-between border-white/5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F3D3E] group-hover:text-[#E2DCC8] flex items-center gap-1">
                            Open in Editor <ChevronRight size={11} />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-full text-center flex items-center justify-center gap-4 py-4">
                    <BookOpen size={24} className={isDark ? 'text-[#E2DCC8]/30' : 'text-slate-300'} />
                    <div className="text-left">
                      <p className={`text-xs font-semibold ${isDark ? 'text-[#F1F1F1]' : 'text-slate-800'}`}>No catalogs created yet</p>
                      <p className={`text-[10px] ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>Build your first multi-page catalog in seconds.</p>
                    </div>
                    <button
                      onClick={() => setView('catalog-setup')}
                      className="px-3.5 py-1.5 bg-[#0F3D3E] hover:bg-[#155455] text-white rounded-[3px] text-xs font-bold uppercase tracking-wider transition-colors ml-auto"
                    >
                      + Create Catalog
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Global Product Library */}
            <div className={`rounded-[4px] border overflow-hidden shadow-sm ${
              isDark ? 'bg-[#141414] border-[#E2DCC8]/15' : 'bg-white border-slate-200'
            }`}>
              <div className={`px-5 py-3.5 border-b flex items-center justify-between ${
                isDark ? 'bg-[#171616] border-[#E2DCC8]/15' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-2">
                  <Package size={14} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} />
                  <span className={`text-xs font-bold tracking-tight font-space uppercase ${
                    isDark ? 'text-[#F1F1F1]' : 'text-slate-900'
                  }`}>
                    Global Product Library ({products.length})
                  </span>
                </div>

                <button
                  onClick={() => { setActiveCategoryId(null); setView('products-list'); }}
                  className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors ${
                    isDark ? 'text-[#E2DCC8]/80 hover:text-white' : 'text-[#0F3D3E] hover:text-[#155455]'
                  }`}
                  title="View All Products"
                >
                  <span>View All Inventory</span>
                  <ArrowUpRight size={12} />
                </button>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {products.slice(0, 6).map(product => {
                    const prodCat = categories.find(c => String(c.id) === String(product.categoryId));

                    return (
                      <div
                        key={product.id}
                        onClick={() => { setActiveCategoryId(product.categoryId || null); setView('products-list'); }}
                        className={`p-3 rounded-[4px] border flex flex-col justify-between cursor-pointer transition-all group ${
                          isDark 
                            ? 'bg-[#100F0F] hover:bg-[#181818] border-[#E2DCC8]/15 hover:border-[#E2DCC8]/35' 
                            : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-[#0F3D3E]/30'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <ProductThumbnail
                            product={product}
                            src={product.image}
                            alt={product.name}
                            isDark={isDark}
                            className="w-12 h-12"
                            iconSize={20}
                          />

                          <div className="truncate min-w-0 flex-1">
                            <p className={`text-xs font-semibold truncate font-heading transition-colors ${
                              isDark ? 'text-[#F1F1F1] group-hover:text-[#E2DCC8]' : 'text-slate-800 group-hover:text-[#0F3D3E]'
                            }`}>
                              {product.name}
                            </p>
                            <p className={`text-[9px] font-mono uppercase truncate ${
                              isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'
                            }`}>
                              SKU: {product.sku || 'N/A'}
                            </p>
                            {prodCat && (
                              <span className={`inline-block mt-0.5 text-[8px] font-mono font-bold uppercase px-1.5 py-0.2 rounded border ${
                                isDark ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                              }`}>
                                {prodCat.name}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between">
                          <span className={`text-[9px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Price
                          </span>
                          <span className={`text-xs font-bold font-heading ${
                            isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'
                          }`}>
                            {product.currency || '₹'}{Number(product.price || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}

                  {products.length === 0 && (
                    <div className={`col-span-full py-8 text-center font-heading text-xs ${
                      isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'
                    }`}>
                      No products yet. Click 'Add Product' to start building inventory.
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (Col Span 4) */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Top Categories Breakdown Panel */}
            <div className={`rounded-[4px] border overflow-hidden shadow-sm ${
              isDark ? 'bg-[#141414] border-[#E2DCC8]/15' : 'bg-white border-slate-200'
            }`}>
              <div className={`px-5 py-3.5 border-b flex items-center justify-between ${
                isDark ? 'bg-[#171616] border-[#E2DCC8]/15' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className={`text-xs font-bold uppercase tracking-wider font-space ${
                  isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'
                }`}>
                  Top Categories ({categories.length})
                </span>
                <button
                  onClick={() => setView('category-list')}
                  className={`text-[11px] font-bold uppercase tracking-wider ${
                    isDark ? 'text-[#E2DCC8]/70 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  View All
                </button>
              </div>

              <div className="p-4 space-y-2.5">
                {topCategories.map(cat => (
                  <div
                    key={cat.id}
                    onClick={() => { setActiveCategoryId(cat.id); setView('products-list'); }}
                    className={`p-2.5 rounded-[3px] border transition-colors cursor-pointer flex items-center justify-between ${
                      isDark ? 'bg-[#100F0F] border-[#E2DCC8]/10 hover:border-[#E2DCC8]/25' : 'bg-slate-50 border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate pr-2">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color || '#0F3D3E' }} />
                      <span className={`text-xs font-semibold truncate ${
                        isDark ? 'text-[#F1F1F1]' : 'text-slate-800'
                      }`}>
                        {cat.name}
                      </span>
                    </div>

                    <span className={`text-[10px] font-mono font-bold shrink-0 px-2 py-0.5 rounded border ${
                      isDark ? 'bg-white/5 border-white/10 text-[#E2DCC8]' : 'bg-white border-slate-200 text-[#0F3D3E]'
                    }`}>
                      {cat.productCount} {cat.productCount === 1 ? 'Item' : 'Items'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className={`border rounded-[4px] p-3.5 space-y-2 shadow-sm ${
              isDark ? 'bg-[#141414] border-[#E2DCC8]/15' : 'bg-white border-slate-200'
            }`}>
              <button
                onClick={() => setView('create-category')}
                className={`w-full flex items-center gap-3.5 p-2.5 rounded-[4px] transition-all group text-left border ${
                  isDark 
                    ? 'hover:bg-[#0F3D3E]/20 border-transparent hover:border-[#0F3D3E]/40' 
                    : 'hover:bg-slate-50 border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className={`w-8 h-8 rounded-[3px] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
                  isDark 
                    ? 'bg-indigo-950/40 text-indigo-300 border border-indigo-500/30' 
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                }`}>
                  <FolderPlus size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-semibold font-heading truncate transition-colors ${
                    isDark ? 'text-[#F1F1F1] group-hover:text-[#E2DCC8]' : 'text-slate-800 group-hover:text-[#0F3D3E]'
                  }`}>Add Category</p>
                  <p className={`text-[9px] truncate ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>Structure your catalog hierarchy</p>
                </div>
              </button>

              <button
                onClick={() => setView('media-library')}
                className={`w-full flex items-center gap-3.5 p-2.5 rounded-[4px] transition-all group text-left border ${
                  isDark 
                    ? 'hover:bg-[#0F3D3E]/20 border-transparent hover:border-[#0F3D3E]/40' 
                    : 'hover:bg-slate-50 border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className={`w-8 h-8 rounded-[3px] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
                  isDark 
                    ? 'bg-sky-950/40 text-sky-300 border border-sky-500/30' 
                    : 'bg-sky-50 text-sky-700 border border-sky-200'
                }`}>
                  <Images size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-semibold font-heading truncate transition-colors ${
                    isDark ? 'text-[#F1F1F1] group-hover:text-[#E2DCC8]' : 'text-slate-800 group-hover:text-[#0F3D3E]'
                  }`}>Media Library</p>
                  <p className={`text-[9px] truncate ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>Manage images, assets & logos</p>
                </div>
              </button>

              <button
                onClick={() => setView('your-work')}
                className={`w-full flex items-center gap-3.5 p-2.5 rounded-[4px] transition-all group text-left border ${
                  isDark 
                    ? 'hover:bg-[#0F3D3E]/20 border-transparent hover:border-[#0F3D3E]/40' 
                    : 'hover:bg-slate-50 border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className={`w-8 h-8 rounded-[3px] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
                  isDark 
                    ? 'bg-amber-950/40 text-amber-300 border border-amber-500/30' 
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  <Briefcase size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-semibold font-heading truncate transition-colors ${
                    isDark ? 'text-[#F1F1F1] group-hover:text-[#E2DCC8]' : 'text-slate-800 group-hover:text-[#0F3D3E]'
                  }`}>Your Work</p>
                  <p className={`text-[9px] truncate ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>Manage and compile catalogs</p>
                </div>
              </button>

              <button
                onClick={() => setView('settings')}
                className={`w-full flex items-center gap-3.5 p-2.5 rounded-[4px] transition-all group text-left border ${
                  isDark 
                    ? 'hover:bg-[#0F3D3E]/20 border-transparent hover:border-[#0F3D3E]/40' 
                    : 'hover:bg-slate-50 border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className={`w-8 h-8 rounded-[3px] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
                  isDark 
                    ? 'bg-teal-950/40 text-teal-300 border border-teal-500/30' 
                    : 'bg-teal-50 text-teal-700 border border-teal-200'
                }`}>
                  <Settings size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-semibold font-heading truncate transition-colors ${
                    isDark ? 'text-[#F1F1F1] group-hover:text-[#E2DCC8]' : 'text-slate-800 group-hover:text-[#0F3D3E]'
                  }`}>Workspace Settings</p>
                  <p className={`text-[9px] truncate ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>Company profile & schemas</p>
                </div>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
