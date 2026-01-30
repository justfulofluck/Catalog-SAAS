import React from 'react';
import {
  Package,
  Box,
  Layout,
  BookOpen,
  FolderPlus,
  ArrowUpRight,
  LayoutGrid,
  Zap,
  LayoutTemplate,
  ChevronRight,
  Settings,
  Moon,
  Sun,
  Star
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { GRID_TEMPLATES } from '../../constants';
import { useToast } from '../../components/Shared/ToastProvider';

const Dashboard: React.FC = () => {
  const { setView, user, products, categories, catalog, setActiveCategoryId, uiTheme, toggleUiTheme, sessionStartTime, isDashboardExiting, isGlobalNavigating, setIsGlobalNavigating, setSidebarExpanded, setViewingProductId } = useStore();
  const { info } = useToast();
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);


  const stats = [
    {
      label: 'Total Inventory',
      value: products.length,
      icon: <Package size={22} />,
      color: 'bg-indigo-600/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400',
      hoverColor: 'hover:bg-indigo-600/10 hover:border-indigo-600/20 dark:hover:bg-indigo-900/50 dark:hover:border-indigo-500/30',
      onClick: () => {
        setActiveCategoryId(null);
        setView('products-list');
      }
    },
    {
      label: 'Asset Categories',
      value: categories.length,
      icon: <Layout size={22} />,
      color: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400',
      hoverColor: 'hover:bg-emerald-500/10 hover:border-emerald-500/20 dark:hover:bg-emerald-900/50 dark:hover:border-emerald-500/30',
      onClick: () => {
        setView('category-list');
      }
    },
    {
      label: 'Pending Drafts',
      value: 1,
      icon: <BookOpen size={22} />,
      color: 'bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400',
      hoverColor: 'hover:bg-amber-500/10 hover:border-amber-500/20 dark:hover:bg-amber-900/50 dark:hover:border-amber-500/30',
      onClick: () => {
        setSidebarExpanded(false); // Collapse sidebar first
        setTimeout(() => {
          setIsGlobalNavigating(true);
          setTimeout(() => {
            setView('editor');
            setIsGlobalNavigating(false);
          }, 600);
        }, 300); // Wait for collapse animation width transition
      }
    }
  ];

  return (
    <div className={`flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-slate-950 p-8 lg:p-12 transition-all duration-700 ${isVisible && !isGlobalNavigating && !isDashboardExiting ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-95 blur-sm'}`}>
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <span className="px-4 py-1.5 bg-indigo-600/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-indigo-600/20 dark:border-indigo-400/20">Pro Workspace</span>
              <span className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Asset Engine v3.1</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
              Welcome, <span className="text-indigo-600 dark:text-indigo-400">{user?.name.split(' ')[0]}</span>.
            </h1>
          </div>
          <div className="flex flex-col items-end gap-3">
            {/* Custom Theme Toggle */}


            <button onClick={() => {
              setView('catalog-setup');
            }} className="hidden md:flex px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all items-center gap-3">
              <LayoutGrid size={18} /> <span className="hidden lg:inline">Build Catalog</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <div key={i} onClick={stat.onClick} className={`bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-md shadow-slate-200/10 dark:shadow-none flex items-center justify-between group hover:-translate-y-0.5 transition-all duration-300 cursor-pointer ${stat.hoverColor}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center transition-colors`}>
                  {stat.icon}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
              <ChevronRight className="text-slate-300 dark:text-slate-600 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden">
              <div className="p-10 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between relative overflow-hidden">
                <div className={`transition-all duration-500 ${isGlobalNavigating ? 'opacity-0 translate-y-4' : 'opacity-100'}`}>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Global Asset Library</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-2">Latest inventory sync</p>
                </div>
                <button
                  onClick={() => {
                    setIsGlobalNavigating(true);
                    setTimeout(() => {
                      setActiveCategoryId(null);
                      setView('products-list');
                      setIsGlobalNavigating(false);
                    }, 600);
                  }}
                  className={`group p-3 text-slate-400 hover:text-indigo-600 bg-slate-50 dark:bg-slate-800 rounded-2xl transition-all duration-700 ease-in-out relative z-10 ${isGlobalNavigating ? '-translate-y-20 translate-x-12 opacity-0 bg-indigo-600 text-white shadow-2xl shadow-indigo-500/50 rotate-45' : ''}`}
                >
                  <ArrowUpRight size={24} className={`transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:scale-110 ${isGlobalNavigating ? 'scale-150' : ''}`} />
                </button>

              </div>
              <div className={`p-2 flex flex-col transition-all duration-500 delay-100 ${isGlobalNavigating ? 'opacity-0 translate-y-10 blur-sm' : 'opacity-100'}`}>
                {products.slice(0, 4).map((product, idx) => {
                  // Mock data for Amazon style
                  const discount = [42, 18, 25, 10][idx % 4];
                  const reviews = [1420, 856, 2300, 150][idx % 4];
                  const rating = [4.5, 4.0, 4.8, 3.5][idx % 4];
                  const mrp = (product.price * (100 / (100 - discount))).toFixed(2);
                  const isPrime = idx % 2 === 0;

                  return (
                    <div
                      key={product.id}
                      onClick={() => {
                        setViewingProductId(product.id);
                        setView('product-detail');
                      }}
                      className="group p-4 flex gap-6 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all cursor-pointer rounded-lg"
                    >
                      {/* Image Section */}
                      <div className="w-48 h-48 bg-[#f7f7f7] dark:bg-slate-800/50 rounded-lg flex-shrink-0 p-4 flex items-center justify-center relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
                        <img src={product.image} className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal" alt={product.name} />
                      </div>

                      {/* Content Section */}
                      {/* Content Section */}
                      <div className="flex-1 py-1 flex flex-col justify-center">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-lg font-medium text-slate-900 dark:text-white leading-snug group-hover:text-[#337ab7] dark:group-hover:text-indigo-400 transition-colors mb-2 line-clamp-2">
                              {product.name}
                            </h4>
                          </div>
                        </div>

                        {/* Price Block */}
                        <div className="mb-2">
                          <div className="flex items-baseline gap-2 mt-1">
                            <span className="text-2xl font-medium text-slate-900 dark:text-white flex items-start">
                              <span className="text-xs relative top-1 mr-0.5">{product.currency}</span>
                              {Math.floor(product.price)}
                              <span className="text-xs relative top-1 ml-0.5">{(product.price % 1).toFixed(2).split('.')[1]}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <div className="bg-slate-900 dark:bg-indigo-950 rounded-2xl p-10 text-white shadow-2xl relative overflow-hidden group min-h-[380px] flex flex-col">
              <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px]"></div>
              <div className="relative z-10 flex-1 flex flex-col justify-center">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Username</p>
                <h4 className="text-3xl font-black mb-12 truncate leading-tight">{user?.name || 'Designer'}</h4>
                <button onClick={() => info('No Previous Work Found!')} className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl">Resume Design</button>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl dark:shadow-none p-4 space-y-2">
              <button onClick={() => setView('create-category')} className="w-full flex items-center gap-5 p-5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all group text-left">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><FolderPlus size={22} /></div>
                <div><p className="text-sm font-black text-slate-900 dark:text-white">Add Taxonomy</p><p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-1">Classification</p></div>
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
