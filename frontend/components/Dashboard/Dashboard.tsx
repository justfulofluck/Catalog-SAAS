
import React from 'react';
import {
  Package,
  Box,
  Layout,
  BookOpen,
  FolderPlus,
  ArrowUpRight,
  Clock,
  LayoutGrid,
  Zap,
  LayoutTemplate,
  ChevronRight,
  Settings,
  Briefcase
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { GRID_TEMPLATES } from '../../constants';

const Dashboard: React.FC = () => {
  const { setView, user, products, categories, setActiveCategoryId, savedCatalogs, uiTheme } = useStore();
  const isDark = uiTheme === 'dark';

  const stats = [
    {
      label: 'Total Inventory',
      value: products.length,
      icon: <Package size={20} />,
      color: isDark ? 'bg-[#0F3D3E]/30 text-[#E2DCC8] border border-[#0F3D3E]' : 'bg-[#0F3D3E]/10 text-[#0F3D3E] border border-[#0F3D3E]/20',
      action: () => { setActiveCategoryId(null); setView('products-list'); }
    },
    {
      label: 'Product Categories',
      value: categories.length,
      icon: <Layout size={20} />,
      color: isDark ? 'bg-[#171616] text-[#F1F1F1] border border-[#E2DCC8]/20' : 'bg-slate-50 text-slate-700 border border-slate-200',
      action: () => setView('category-list')
    },
    {
      label: 'Pending Drafts',
      value: savedCatalogs.length,
      icon: <BookOpen size={20} />,
      color: isDark ? 'bg-[#171616] text-[#E2DCC8]/70 border border-[#E2DCC8]/20' : 'bg-slate-50 text-slate-700 border border-slate-200',
      action: () => setView('your-work')
    }
  ];

  return (
    <div className={`flex-1 overflow-y-auto p-8 lg:p-12 animate-in fade-in duration-500 ${
      isDark ? 'bg-[#100F0F] text-[#F1F1F1]' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b ${
          isDark ? 'border-[#E2DCC8]/15' : 'border-slate-200'
        }`}>
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-[0.25em] mb-2 font-heading ${
              isDark ? 'text-[#E2DCC8]/60' : 'text-[#0F3D3E]'
            }`}>Workspace Overview</p>
            <h1 className={`text-3xl md:text-5xl font-medium tracking-tight leading-none font-heading ${
              isDark ? 'text-[#F1F1F1]' : 'text-slate-900'
            }`}>
              Welcome, <span className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"}>{user?.name ? user.name.split(' ')[0] : 'Creator'}</span>.
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView('catalog-setup')}
              className="px-6 py-3 bg-[#0F3D3E] hover:bg-[#155455] text-white border border-[#E2DCC8]/30 rounded-[4px] font-heading font-semibold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center gap-2.5 active:scale-95"
            >
              <LayoutGrid size={15} className="text-[#E2DCC8]" /> Build Catalog
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {stats.map((stat, i) => (
            <div
              key={i}
              onClick={stat.action}
              className={`p-6 rounded-[4px] flex items-center justify-between group transition-all cursor-pointer shadow-sm ${
                isDark 
                  ? 'bg-[#141414] border border-[#E2DCC8]/15 hover:border-[#E2DCC8]/30 hover:bg-[#171616]' 
                  : 'bg-white border border-slate-200 hover:border-[#0F3D3E]/40 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.color} rounded-[4px] flex items-center justify-center shrink-0`}>
                  {stat.icon}
                </div>
                <div>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 font-heading ${
                    isDark ? 'text-[#E2DCC8]/70' : 'text-slate-500'
                  }`}>{stat.label}</p>
                  <p className={`text-3xl font-medium tracking-tight font-heading leading-none ${
                    isDark ? 'text-[#F1F1F1]' : 'text-slate-900'
                  }`}>{stat.value}</p>
                </div>
              </div>
              <ChevronRight size={16} className={`${
                isDark ? 'text-[#555555] group-hover:text-[#E2DCC8]' : 'text-slate-400 group-hover:text-[#0F3D3E]'
              } group-hover:translate-x-1 transition-all shrink-0`} />
            </div>
          ))}
        </div>

        {/* Lower Two-Column Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          {/* Global Product Library Preview (Span 2) */}
          <div className="xl:col-span-2">
            <div className={`rounded-[4px] overflow-hidden shadow-sm border ${
              isDark ? 'bg-[#141414] border-[#E2DCC8]/15' : 'bg-white border-slate-200'
            }`}>
              <div className={`px-6 py-5 border-b flex items-center justify-between ${
                isDark ? 'border-[#E2DCC8]/15' : 'border-slate-100'
              }`}>
                <div>
                  <h3 className={`text-lg font-medium tracking-tight font-heading ${
                    isDark ? 'text-[#F1F1F1]' : 'text-slate-900'
                  }`}>Global Product Library</h3>
                  <p className={`text-[11px] font-medium tracking-wide mt-0.5 ${
                    isDark ? 'text-[#E2DCC8]/70' : 'text-slate-500'
                  }`}>Synced inventory ready for catalogue generation</p>
                </div>
                <button
                  onClick={() => { setActiveCategoryId(null); setView('products-list'); }}
                  className={`p-2 rounded-[4px] border transition-colors ${
                    isDark 
                      ? 'text-[#E2DCC8]/70 hover:text-[#F1F1F1] hover:bg-[#0F3D3E]/30 border-[#E2DCC8]/15' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
                  }`}
                  title="View All Products"
                >
                  <ArrowUpRight size={18} />
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {products.slice(0, 4).map(product => (
                  <div
                    key={product.id}
                    onClick={() => { setActiveCategoryId(product.categoryId || null); setView('products-list'); }}
                    className={`p-3.5 rounded-[4px] border flex items-center justify-between cursor-pointer transition-all group ${
                      isDark 
                        ? 'bg-[#171616] hover:bg-[#1a1919] border-[#E2DCC8]/15 hover:border-[#E2DCC8]/30' 
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-[#0F3D3E]/30'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-14 h-14 border flex items-center justify-center shrink-0 overflow-hidden rounded-[2px] ${
                        isDark ? 'bg-[#100F0F] border-[#E2DCC8]/15' : 'bg-white border-slate-200'
                      }`}>
                        {product.image ? (
                          <img
                            src={product.image}
                            className="w-full h-full object-contain p-1 rounded-none"
                            alt={product.name}
                          />
                        ) : (
                          <Package size={20} className={isDark ? "text-[#555555]" : "text-slate-400"} />
                        )}
                      </div>
                      <div className="truncate min-w-0 pr-2">
                        <p className={`text-xs font-semibold truncate font-heading transition-colors ${
                          isDark ? 'text-[#F1F1F1] group-hover:text-[#E2DCC8]' : 'text-slate-800 group-hover:text-[#0F3D3E]'
                        }`}>
                          {product.name}
                        </p>
                        <p className={`text-[10px] font-mono uppercase mt-0.5 truncate ${
                          isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'
                        }`}>
                          SKU: {product.sku || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <p className={`text-xs font-semibold font-heading shrink-0 ml-2 whitespace-nowrap ${
                      isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'
                    }`}>
                      {product.currency || '₹'}{Number(product.price || 0).toFixed(2)}
                    </p>
                  </div>
                ))}
                {products.length === 0 && (
                  <div className={`col-span-2 py-12 text-center font-heading text-sm ${
                    isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'
                  }`}>
                    No products yet. Click 'Add Product' to start building inventory.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions Panel (Span 1) */}
          <div className="space-y-6">
            <div className={`border rounded-[4px] p-3.5 space-y-2 shadow-sm ${
              isDark ? 'bg-[#141414] border-[#E2DCC8]/15' : 'bg-white border-slate-200'
            }`}>
              <button
                onClick={() => setView('create-category')}
                className={`w-full flex items-center gap-4 p-3.5 rounded-[4px] transition-all group text-left border ${
                  isDark 
                    ? 'hover:bg-[#0F3D3E]/20 border-transparent hover:border-[#0F3D3E]/40' 
                    : 'hover:bg-slate-50 border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-[4px] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
                  isDark 
                    ? 'bg-[#0F3D3E]/30 text-[#E2DCC8] border border-[#0F3D3E]' 
                    : 'bg-[#0F3D3E]/10 text-[#0F3D3E] border border-[#0F3D3E]/20'
                }`}>
                  <FolderPlus size={18} />
                </div>
                <div>
                  <p className={`text-xs font-semibold font-heading transition-colors ${
                    isDark ? 'text-[#F1F1F1] group-hover:text-[#E2DCC8]' : 'text-slate-800 group-hover:text-[#0F3D3E]'
                  }`}>Add Category</p>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>Structure your catalog hierarchy</p>
                </div>
              </button>

              <button
                onClick={() => setView('your-work')}
                className={`w-full flex items-center gap-4 p-3.5 rounded-[4px] transition-all group text-left border ${
                  isDark 
                    ? 'hover:bg-[#0F3D3E]/20 border-transparent hover:border-[#0F3D3E]/40' 
                    : 'hover:bg-slate-50 border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-[4px] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
                  isDark 
                    ? 'bg-[#171616] text-[#F1F1F1] border border-[#E2DCC8]/15' 
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  <Briefcase size={18} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} />
                </div>
                <div>
                  <p className={`text-xs font-semibold font-heading transition-colors ${
                    isDark ? 'text-[#F1F1F1] group-hover:text-[#E2DCC8]' : 'text-slate-800 group-hover:text-[#0F3D3E]'
                  }`}>Your Work</p>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>Manage and compile catalogs</p>
                </div>
              </button>

              <button
                onClick={() => setView('settings')}
                className={`w-full flex items-center gap-4 p-3.5 rounded-[4px] transition-all group text-left border ${
                  isDark 
                    ? 'hover:bg-[#0F3D3E]/20 border-transparent hover:border-[#0F3D3E]/40' 
                    : 'hover:bg-slate-50 border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className={`w-10 h-10 rounded-[4px] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
                  isDark 
                    ? 'bg-[#171616] text-[#E2DCC8]/70 border border-[#E2DCC8]/15' 
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  <Settings size={18} />
                </div>
                <div>
                  <p className={`text-xs font-semibold font-heading transition-colors ${
                    isDark ? 'text-[#F1F1F1] group-hover:text-[#E2DCC8]' : 'text-slate-800 group-hover:text-[#0F3D3E]'
                  }`}>Workspace Settings</p>
                  <p className={`text-[10px] mt-0.5 ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>Company profile & schemas</p>
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

