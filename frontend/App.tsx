import React, { useState, useEffect, useRef } from 'react';
import Login from './components/Auth/Login';
import AdminLogin from './components/Admin/AdminLogin';
import AdminDashboard from './components/Admin/AdminDashboard';
import Dashboard from './components/Dashboard/Dashboard';
import SettingsView from './components/Settings/Settings';
import ProductsListView from './components/Products/ProductsListView';
import CreateProductForm from './components/Products/CreateProductForm';
import EditProductForm from './components/Products/EditProductForm';
import CategoryListView from './components/CategoryList/CategoryListView';
import CreateCategoryForm from './components/CategoryList/CreateCategoryForm';
import EditCategoryForm from './components/CategoryList/EditCategoryForm';
import MediaLibraryView from './components/Inventory/MediaLibraryView';
import CatalogSetup from './components/Setup/CatalogSetup';
import EditorToolbar from './components/Toolbar/EditorToolbar';
import EditorCanvas from './components/Editor/EditorCanvas';
import ProductLibrary from './components/Sidebar/ProductLibrary';
import MediaAssetLibrary from './components/Sidebar/MediaAssetLibrary';
import TemplatesPanel from './components/Sidebar/TemplatesPanel';
import StockImagesPanel from './components/Sidebar/StockImagesPanel';
import PagesPanel from './components/Sidebar/PagesPanel';
import ProjectSettingsPanel from './components/Sidebar/ProjectSettingsPanel';
import ButtonsPanel from './components/Sidebar/ButtonsPanel';
import '@fortawesome/fontawesome-free/css/all.min.css';
import YourWork from './components/Dashboard/YourWork';
import PublishView from './components/Publish/PublishView';
import PublicViewer from './components/Publish/PublicViewer';
import PricingView from './components/Pricing/PricingView';
import { useStore, View } from './store/useStore';
import {
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronDown,
  Menu,
  Package,
  FolderOpen,
  BookOpen,
  Files,
  LayoutTemplate,
  Images,
  Sun,
  Moon,
  Layers,
  Briefcase,
  Rocket,
  Sparkles,
  FileText,
  MousePointer2,
  Image as ImageIcon
} from 'lucide-react';

const App: React.FC = () => {
  const {
    isAuthenticated,
    isAdminAuthenticated,
    logout,
    user,
    currentView,
    setView,
    isSidebarExpanded,
    setSidebarExpanded,
    setActiveCategoryId,
    savedCatalogs,
    editorTab,
    setEditorTab,
    isProjectSettingsOpen,
    setIsProjectSettingsOpen,
    uiTheme,
    toggleUiTheme,
    businessTemplates,
    checkAuth
  } = useStore();

  const [loading, setLoading] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isCategoriesMenuOpen, setCategoriesMenuOpen] = useState(false);
  const [isCatalogMenuOpen, setCatalogMenuOpen] = useState(true);

  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  // Global click listener for "click-outside-to-close" behavior
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      // 1. Sidebar closing (Left)
      if (isSidebarExpanded && leftPanelRef.current && !leftPanelRef.current.contains(e.target as Node)) {
        setSidebarExpanded(false);
      }

      // 2. Project Settings closing (Right)
      if (isProjectSettingsOpen && rightPanelRef.current && !rightPanelRef.current.contains(e.target as Node)) {
        setIsProjectSettingsOpen(false);
      }
    };

    if (isSidebarExpanded || isProjectSettingsOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isSidebarExpanded, isProjectSettingsOpen, setSidebarExpanded, setIsProjectSettingsOpen]);

  useEffect(() => {
    const getViewFromPath = (pathname: string): View => {
      if (pathname === '/admin/dashboard') return 'admin-dashboard';
      if (pathname === '/admin') return 'admin-login';
      if (pathname === '/editor') return 'editor';
      if (pathname === '/catalog-setup') return 'catalog-setup';
      if (pathname === '/your-work') return 'your-work';
      if (pathname === '/publish') return 'publish';
      if (pathname === '/pricing') return 'pricing';
      if (pathname === '/settings') return 'settings';
      return currentView;
    };

    const init = async () => {
      if (sessionStorage.getItem('cs_session')) {
        await checkAuth();
      }

      const path = window.location.pathname;

      const viewerMatch = path.match(/\/viewer\/([^\/]+)/);
      if (viewerMatch) {
        const uuid = viewerMatch[1];
        const { openPublicViewer } = useStore.getState();
        openPublicViewer(uuid);
      } else {
        const viewFromPath = getViewFromPath(path);
        if (viewFromPath !== currentView) {
          setView(viewFromPath);
        }
      }

      setLoading(false);
    };
    init();

    const handlePopState = () => {
      const path = window.location.pathname;
      const viewerMatch = path.match(/\/viewer\/([^\/]+)/);
      if (viewerMatch) {
        const uuid = viewerMatch[1];
        const { openPublicViewer } = useStore.getState();
        openPublicViewer(uuid);
      } else {
        const viewFromPath = getViewFromPath(path);
        setView(viewFromPath);
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [checkAuth]); // Removed currentView and setView from dependencies to prevent re-running checkAuth on view change

  useEffect(() => {
    if (document.fonts) {
      document.fonts.ready.then(() => {
        setFontsLoaded(true);
      });
    } else {
      setFontsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (uiTheme === 'dark' && currentView !== 'editor' && currentView !== 'admin-dashboard') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [uiTheme, currentView]);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#f8fafc] flex flex-col items-center justify-center space-y-6">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">catalogmakerr.</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-1">Enterprise Asset Engine</p>
        </div>
      </div>
    );
  }

  // Admin Routes
  if (currentView === 'admin-login') {
    return <AdminLogin />;
  }

  if (isAdminAuthenticated && currentView === 'admin-dashboard') {
    return <AdminDashboard />;
  }

  // Public Viewers
  if (currentView === 'public-viewer') {
    return <PublicViewer />;
  }

  // Pricing View (Fullscreen)
  if (currentView === 'pricing') {
    return <PricingView />;
  }

  // Standard Authentication Check
  if (!isAuthenticated) {
    return <Login />;
  }

  // Editor View (Fullscreen)
  if (currentView === 'editor') {
    return (
      <div className="flex flex-col h-screen w-screen bg-slate-100 overflow-hidden font-sans text-slate-700">
        <EditorToolbar />
        <div className="flex flex-1 overflow-hidden relative">
          {/* Icon rail + Sidebar Content container for click-outside detection */}
          <div ref={leftPanelRef} className="flex h-full z-40 relative">
            {/* Icon rail - always visible, fixed width */}
            <div className="flex flex-col border-r bg-slate-900 shrink-0 h-full">
              <div className="flex flex-col w-16 items-center py-8 gap-8">
                <button
                  onClick={() => {
                    if (editorTab === 'pages' && isSidebarExpanded) {
                      setSidebarExpanded(false);
                    } else {
                      setEditorTab('pages');
                      setSidebarExpanded(true);
                    }
                  }}
                  className={`p-3 rounded-[10px] transition-all ${editorTab === 'pages' && isSidebarExpanded ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
                  title="Pages"
                >
                  <FileText size={22} />
                </button>
                <button
                  onClick={() => {
                    if (editorTab === 'products' && isSidebarExpanded) {
                      setSidebarExpanded(false);
                    } else {
                      setEditorTab('products');
                      setSidebarExpanded(true);
                    }
                  }}
                  className={`p-3 rounded-[10px] transition-all ${editorTab === 'products' && isSidebarExpanded ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70_229,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
                  title="Product Assets"
                >
                  <Package size={22} />
                </button>
                <button
                  onClick={() => {
                    if (editorTab === 'media' && isSidebarExpanded) {
                      setSidebarExpanded(false);
                    } else {
                      setEditorTab('media');
                      setSidebarExpanded(true);
                    }
                  }}
                  className={`p-3 rounded-[10px] transition-all ${editorTab === 'media' && isSidebarExpanded ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70_229,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
                  title="My Images"
                >
                  <Images size={22} />
                </button>
                <button
                  onClick={() => {
                    if (editorTab === 'stock' && isSidebarExpanded) {
                      setSidebarExpanded(false);
                    } else {
                      setEditorTab('stock');
                      setSidebarExpanded(true);
                    }
                  }}
                  className={`p-3 rounded-[10px] transition-all ${editorTab === 'stock' && isSidebarExpanded ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70_229,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
                  title="Stock Images"
                >
                  <ImageIcon size={22} />
                </button>
                <button
                  onClick={() => {
                    if (editorTab === 'templates' && isSidebarExpanded) {
                      setSidebarExpanded(false);
                    } else {
                      setEditorTab('templates');
                      setSidebarExpanded(true);
                    }
                  }}
                  className={`p-3 rounded-[10px] transition-all ${editorTab === 'templates' && isSidebarExpanded ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70_229,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
                  title="Templates"
                >
                  <LayoutTemplate size={22} />
                </button>

                <button
                  onClick={() => {
                    if (editorTab === 'buttons' && isSidebarExpanded) {
                      setSidebarExpanded(false);
                    } else {
                      setEditorTab('buttons');
                      setSidebarExpanded(true);
                    }
                  }}
                  className={`p-3 rounded-[10px] transition-all ${editorTab === 'buttons' && isSidebarExpanded ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70_229,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
                  title="Buttons"
                >
                  <MousePointer2 size={22} />
                </button>
              </div>

              {/* Floating Sidebar Content (Attached to rail) */}
              {isSidebarExpanded && (
                <div className="absolute left-full top-0 h-[calc(100%-48px)] z-30 shadow-2xl bg-white min-w-[300px]">
                  {editorTab === 'pages' && <PagesPanel />}
                  {editorTab === 'products' && <ProductLibrary />}
                  {editorTab === 'media' && <MediaAssetLibrary />}
                  {editorTab === 'stock' && <StockImagesPanel />}
                  {editorTab === 'templates' && <TemplatesPanel />}
                  {editorTab === 'buttons' && <ButtonsPanel />}

                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden relative">
            <EditorCanvas />

            <div ref={rightPanelRef} className="absolute top-0 right-0 h-[calc(100%-48px)] z-40 flex pointer-events-none">
              <div className="flex h-full pointer-events-auto shadow-[-20px_0_50px_rgba(0,0,0,0.02)]">
                {isProjectSettingsOpen && <ProjectSettingsPanel />}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sidebarWidth = isSidebarExpanded ? 'w-72' : 'w-20';

  const renderContent = () => {
    switch (currentView as string) {
      case 'dashboard': return <Dashboard />;
      case 'products-list': return <ProductsListView />;
      case 'create-product': return <CreateProductForm />;
      case 'edit-product': return <EditProductForm />;
      case 'category-list': return <CategoryListView />;
      case 'create-category': return <CreateCategoryForm />;
      case 'edit-category': return <EditCategoryForm />;
      case 'media-library': return <MediaLibraryView />;
      case 'catalog-setup': return <CatalogSetup />;
      case 'settings': return <SettingsView />;
      case 'your-work': return <YourWork />;
      case 'publish': return <PublishView />;
      case 'pricing': return <PricingView />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc] dark:bg-slate-950 font-sans text-slate-700 dark:text-slate-200 transition-colors duration-300">
      <aside className={`${sidebarWidth} bg-slate-900 flex flex-col py-6 z-30 shrink-0 transition-all duration-300 ease-in-out`}>
        <div className={`flex ${isSidebarExpanded ? 'items-center justify-between px-6' : 'flex-col items-center gap-6 px-2'} mb-10`}>
          <div onClick={() => setView('dashboard')} className="flex items-center gap-3 cursor-pointer group shrink-0 overflow-hidden max-w-full">
            {isSidebarExpanded ? (
              <span className="text-white font-black text-xl tracking-tight animate-in fade-in slide-in-from-left-2 duration-300 truncate">catalogmakerr.</span>
            ) : (
              <span className="text-white font-black text-xl tracking-tight truncate">c.</span>
            )}
          </div>
          <button
            onClick={() => setSidebarExpanded(!isSidebarExpanded)}
            className={`text-slate-500 hover:text-white transition-colors p-1 rounded-[10px] hover:bg-slate-800 ${!isSidebarExpanded ? 'w-10 h-10 flex items-center justify-center' : ''}`}
            title={isSidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-[10px] transition-all ${currentView === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>
            <LayoutDashboard size={20} className="shrink-0" />
            {isSidebarExpanded && <span className="text-sm font-bold tracking-tight">Dashboard</span>}
          </button>

          <div className="h-px bg-slate-800/50 mx-4 my-4"></div>

          <div className="space-y-1">
            <button onClick={() => { if (!isSidebarExpanded) setSidebarExpanded(true); setCategoriesMenuOpen(!isCategoriesMenuOpen); }} className={`w-full flex items-center justify-between px-4 py-3.5 rounded-[10px] transition-all ${currentView.includes('category') || currentView === 'products-list' || currentView === 'media-library' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
              <div className="flex items-center gap-4">
                <FolderOpen size={20} className="shrink-0" />
                {isSidebarExpanded && <span className="text-sm font-bold tracking-tight">Inventory</span>}
              </div>
              {isSidebarExpanded && <ChevronDown size={14} className={`transition-transform ${isCategoriesMenuOpen ? 'rotate-180' : ''}`} />}
            </button>
            {isCategoriesMenuOpen && isSidebarExpanded && (
              <div className="ml-10 space-y-1 animate-in slide-in-from-top-2 duration-200">
                <button onClick={() => setView('category-list')} className={`w-full text-left py-2 px-3 rounded-[10px] text-xs font-medium ${currentView === 'category-list' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>Categories</button>
                <button onClick={() => { setActiveCategoryId(null); setView('products-list'); }} className={`w-full text-left py-2 px-3 rounded-[10px] text-xs font-medium ${currentView === 'products-list' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>All Products</button>
                <button onClick={() => setView('media-library')} className={`w-full text-left py-2 px-3 rounded-[10px] text-xs font-medium ${currentView === 'media-library' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>Media</button>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <button onClick={() => { if (!isSidebarExpanded) setSidebarExpanded(true); setCatalogMenuOpen(!isCatalogMenuOpen); }} className={`w-full flex items-center justify-between px-4 py-3.5 rounded-[10px] transition-all ${currentView.includes('catalog') || currentView === 'your-work' || currentView === 'publish' ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
              <div className="flex items-center gap-4">
                <BookOpen size={20} className="shrink-0" />
                {isSidebarExpanded && <span className="text-sm font-bold tracking-tight">Publication</span>}
              </div>
              {isSidebarExpanded && <ChevronDown size={14} className={`transition-transform ${isCatalogMenuOpen ? 'rotate-180' : ''}`} />}
            </button>
            {isCatalogMenuOpen && isSidebarExpanded && (
              <div className="ml-10 space-y-1 animate-in slide-in-from-top-2 duration-200">
                <button onClick={() => setView('catalog-setup')} className={`w-full text-left py-2 px-3 rounded-[10px] text-xs font-medium ${currentView === 'catalog-setup' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>New Catalog</button>
                {savedCatalogs.length > 0 && (
                  <>
                    <button onClick={() => setView('your-work')} className={`w-full text-left py-2 px-3 rounded-[10px] text-xs font-medium ${currentView === 'your-work' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>Your Work</button>
                    <button onClick={() => setView('publish')} className={`w-full text-left py-2 px-3 rounded-[10px] text-xs font-medium ${currentView === 'publish' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>Publish & Manage</button>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="h-px bg-slate-800/50 mx-4 my-2"></div>

          <button onClick={() => setView('pricing')} className={`w-full flex items-center justify-between px-4 py-3.5 rounded-[10px] transition-all group ${(currentView as string) === 'pricing' ? 'bg-indigo-600/10 text-indigo-400' : 'text-slate-400 hover:text-white'}`}>
            <div className="flex items-center gap-4">
              <Rocket size={20} className={`shrink-0 ${(currentView as string) === 'pricing' ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-400 transition-colors'}`} />
              {isSidebarExpanded && <span className="text-sm font-bold tracking-tight">Upgrade Plan</span>}
            </div>
            {isSidebarExpanded && <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>}
          </button>
        </nav>

        <div className="px-4 mt-auto space-y-4">
          {user?.businessName && isSidebarExpanded && (
            <div className="px-4 py-3 bg-slate-800/40 rounded-xl border border-slate-700/30">
              <p className="text-[10px] font-black text-slate-400/60 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                <Briefcase size={10} className="text-indigo-400" /> Current Organization
              </p>
              <p className="text-xs font-bold text-white truncate">{user.businessName}</p>
            </div>
          )}

          {user?.businessId && isSidebarExpanded && (
            <div className="px-4 py-3 bg-slate-800/40 rounded-xl border border-slate-700/30">
              <p className="text-[10px] font-black text-slate-400/60 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                <Sparkles size={10} className="text-indigo-400" /> Industry Vertical
              </p>
              <p className="text-xs font-bold text-white truncate">
                {businessTemplates.find(t => t.id === user.businessId)?.name || user.businessId}
              </p>
            </div>
          )}

          <button
            onClick={toggleUiTheme}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-[10px] transition-all text-slate-400 hover:text-white bg-slate-800/20 hover:bg-slate-800/50"
            title={`Switch to ${uiTheme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {uiTheme === 'light' ? <Moon size={20} className="shrink-0" /> : <Sun size={20} className="shrink-0" />}
            {isSidebarExpanded && <span className="text-sm font-bold tracking-tight">{uiTheme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
          </button>

          <button onClick={() => setView('settings')} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-[10px] transition-all ${currentView === 'settings' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'}`}>
            <Settings size={20} className="shrink-0" />
            {isSidebarExpanded && <span className="text-sm font-bold tracking-tight">Settings</span>}
          </button>

          <div className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-[10px] border border-slate-700/50">
            <div className="w-9 h-9 bg-indigo-500 rounded-[10px] flex items-center justify-center text-white font-bold shrink-0">{user?.avatar || 'JD'}</div>
            {isSidebarExpanded && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate leading-none mb-1">{user?.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>
            )}
            {isSidebarExpanded && (
              <button onClick={logout} className="text-slate-500 hover:text-red-400 transition-colors">
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">{renderContent()}</div>
    </div>
  );
};

export default App;