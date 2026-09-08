
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
  const { setView, user, products, categories, setActiveCategoryId, savedCatalogs } = useStore();

  const stats = [
    {
      label: 'Total Inventory',
      value: products.length,
      icon: <Package size={20} />,
      color: 'bg-[#0F3D3E]/30 text-[#E2DCC8] border border-[#0F3D3E]',
      action: () => { setActiveCategoryId(null); setView('products-list'); }
    },
    {
      label: 'Product Categories',
      value: categories.length,
      icon: <Layout size={20} />,
      color: 'bg-[#171616] text-[#F1F1F1] border border-[#E2DCC8]/20',
      action: () => setView('category-list')
    },
    {
      label: 'Pending Drafts',
      value: savedCatalogs.length,
      icon: <BookOpen size={20} />,
      color: 'bg-[#171616] text-[#E2DCC8]/70 border border-[#E2DCC8]/20',
      action: () => setView('your-work')
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#100F0F] text-[#F1F1F1] p-8 lg:p-12 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[#E2DCC8]/15">
          <div>
            <p className="text-[10px] font-bold text-[#E2DCC8]/60 uppercase tracking-[0.25em] mb-2 font-heading">Workspace Overview</p>
            <h1 className="text-3xl md:text-5xl font-medium text-[#F1F1F1] tracking-tight leading-none font-heading">
              Welcome, <span className="text-[#E2DCC8]">{user?.name ? user.name.split(' ')[0] : 'Creator'}</span>.
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView('catalog-setup')}
              className="px-6 py-3 bg-[#0F3D3E] hover:bg-[#155455] text-[#F1F1F1] border border-[#E2DCC8]/30 rounded-[4px] font-heading font-semibold text-xs uppercase tracking-wider shadow-lg transition-all flex items-center gap-2.5 active:scale-95"
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
              className="bg-[#141414] border border-[#E2DCC8]/15 p-6 rounded-[4px] flex items-center justify-between group hover:border-[#E2DCC8]/30 hover:bg-[#171616] transition-all cursor-pointer shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.color} rounded-[4px] flex items-center justify-center shrink-0`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-[#E2DCC8]/70 uppercase tracking-wider mb-1 font-heading">{stat.label}</p>
                  <p className="text-3xl font-medium text-[#F1F1F1] tracking-tight font-heading leading-none">{stat.value}</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#555555] group-hover:text-[#E2DCC8] group-hover:translate-x-1 transition-all shrink-0" />
            </div>
          ))}
        </div>

        {/* Lower Two-Column Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
          {/* Global Product Library Preview (Span 2) */}
          <div className="xl:col-span-2">
            <div className="bg-[#141414] border border-[#E2DCC8]/15 rounded-[4px] overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-[#E2DCC8]/15 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-[#F1F1F1] tracking-tight font-heading">Global Product Library</h3>
                  <p className="text-[11px] text-[#E2DCC8]/70 font-medium tracking-wide mt-0.5">Synced inventory ready for catalogue generation</p>
                </div>
                <button
                  onClick={() => { setActiveCategoryId(null); setView('products-list'); }}
                  className="p-2 text-[#E2DCC8]/70 hover:text-[#F1F1F1] hover:bg-[#0F3D3E]/30 rounded-[4px] border border-[#E2DCC8]/15 transition-colors"
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
                    className="p-3.5 rounded-[4px] bg-[#171616] hover:bg-[#1a1919] border border-[#E2DCC8]/15 hover:border-[#E2DCC8]/30 flex items-center justify-between cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-14 h-14 bg-[#100F0F] border border-[#E2DCC8]/15 flex items-center justify-center shrink-0 overflow-hidden rounded-[2px]">
                        {product.image ? (
                          <img
                            src={product.image}
                            className="w-full h-full object-contain p-1 rounded-none"
                            alt={product.name}
                          />
                        ) : (
                          <Package size={20} className="text-[#555555]" />
                        )}
                      </div>
                      <div className="truncate min-w-0 pr-2">
                        <p className="text-xs font-semibold text-[#F1F1F1] truncate font-heading group-hover:text-[#E2DCC8] transition-colors">
                          {product.name}
                        </p>
                        <p className="text-[10px] font-mono text-[#E2DCC8]/60 uppercase mt-0.5 truncate">
                          SKU: {product.sku || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs font-semibold text-[#E2DCC8] font-heading shrink-0 ml-2 whitespace-nowrap">
                      {product.currency || '₹'}{Number(product.price || 0).toFixed(2)}
                    </p>
                  </div>
                ))}
                {products.length === 0 && (
                  <div className="col-span-2 py-12 text-center text-[#E2DCC8]/60 font-heading text-sm">
                    No products yet. Click 'Add Product' to start building inventory.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions Panel (Span 1) */}
          <div className="space-y-6">
            <div className="bg-[#141414] border border-[#E2DCC8]/15 rounded-[4px] p-3.5 space-y-2 shadow-sm">
              <button
                onClick={() => setView('create-category')}
                className="w-full flex items-center gap-4 p-3.5 hover:bg-[#0F3D3E]/20 rounded-[4px] transition-all group text-left border border-transparent hover:border-[#0F3D3E]/40"
              >
                <div className="w-10 h-10 bg-[#0F3D3E]/30 text-[#E2DCC8] border border-[#0F3D3E] rounded-[4px] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <FolderPlus size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#F1F1F1] font-heading group-hover:text-[#E2DCC8] transition-colors">Add Category</p>
                  <p className="text-[10px] text-[#E2DCC8]/60 mt-0.5">Structure your catalog hierarchy</p>
                </div>
              </button>

              <button
                onClick={() => setView('your-work')}
                className="w-full flex items-center gap-4 p-3.5 hover:bg-[#0F3D3E]/20 rounded-[4px] transition-all group text-left border border-transparent hover:border-[#0F3D3E]/40"
              >
                <div className="w-10 h-10 bg-[#171616] text-[#F1F1F1] border border-[#E2DCC8]/15 rounded-[4px] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Briefcase size={18} className="text-[#E2DCC8]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#F1F1F1] font-heading group-hover:text-[#E2DCC8] transition-colors">Your Work</p>
                  <p className="text-[10px] text-[#E2DCC8]/60 mt-0.5">Manage and compile catalogs</p>
                </div>
              </button>

              <button
                onClick={() => setView('settings')}
                className="w-full flex items-center gap-4 p-3.5 hover:bg-[#0F3D3E]/20 rounded-[4px] transition-all group text-left border border-transparent hover:border-[#0F3D3E]/40"
              >
                <div className="w-10 h-10 bg-[#171616] text-[#E2DCC8]/70 border border-[#E2DCC8]/15 rounded-[4px] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Settings size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#F1F1F1] font-heading group-hover:text-[#E2DCC8] transition-colors">Workspace Settings</p>
                  <p className="text-[10px] text-[#E2DCC8]/60 mt-0.5">Company profile & schemas</p>
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

