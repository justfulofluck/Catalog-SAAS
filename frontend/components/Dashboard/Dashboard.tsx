
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
  const { setView, user, products, categories, catalog, setActiveCategoryId, savedCatalogs } = useStore();

  const stats = [
    { label: 'Total Inventory', value: products.length, icon: <Package size={22} />, color: 'bg-indigo-600/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400' },
    { label: 'Asset Categories', value: categories.length, icon: <Layout size={22} />, color: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400' },
    { label: 'Pending Drafts', value: savedCatalogs.length, icon: <BookOpen size={22} />, color: 'bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400' }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-slate-950 p-8 lg:p-12 animate-in fade-in duration-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              Welcome, <span className="text-indigo-600 dark:text-indigo-400">{user?.name.split(' ')[0]}</span>.
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setView('catalog-setup')} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-3">
              <LayoutGrid size={18} /> Build Catalog
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none flex items-center justify-between group hover:-translate-y-1 transition-all">
              <div className="flex items-center gap-6">
                <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                </div>
              </div>
              <ChevronRight className="text-slate-200 dark:text-slate-700" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="p-10 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Global Asset Library</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-2">Latest inventory sync</p>
                </div>
                <button onClick={() => { setActiveCategoryId(null); setView('products-list'); }} className="p-3 text-slate-400 hover:text-indigo-600 bg-slate-50 dark:bg-slate-800 rounded-2xl transition-colors">
                  <ArrowUpRight size={24} />
                </button>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.slice(0, 4).map(product => (
                  <div key={product.id} className="p-5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-700 transition-all">
                    <div className="flex items-center gap-5 min-w-0">
                      <img src={product.image} className="w-16 h-16 rounded-2xl object-cover border border-slate-100 dark:border-slate-800" />
                      <div className="truncate">
                        <p className="text-sm font-black text-slate-900 dark:text-white truncate">{product.name}</p>
                        <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase">SKU: {product.sku}</p>
                      </div>
                    </div>
                    <p className="text-base font-black text-slate-900 dark:text-white">{product.currency}{product.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl dark:shadow-none p-4 space-y-2">
               <button onClick={() => setView('create-category')} className="w-full flex items-center gap-5 p-5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all group text-left">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><FolderPlus size={22} /></div>
                  <div><p className="text-sm font-black text-slate-900 dark:text-white">Add Taxonomy</p><p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-1">Classification</p></div>
                </button>
                <button 
                  onClick={() => setView('your-work')} 
                  disabled={savedCatalogs.length === 0}
                  className={`w-full flex items-center gap-5 p-5 rounded-2xl transition-all group text-left ${savedCatalogs.length === 0 ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><Briefcase size={22} /></div>
                  <div><p className="text-sm font-black text-slate-900 dark:text-white">Your Work</p><p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-1">Project History</p></div>
                </button>
                <button onClick={() => setView('settings')} className="w-full flex items-center gap-5 p-5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all group text-left">
                  <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><Settings size={22} /></div>
                  <div><p className="text-sm font-black text-slate-900 dark:text-white">Global Settings</p><p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-1">Workspace Config</p></div>
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
