import React, { useState, useEffect } from 'react';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import SettingsView from './components/Settings/Settings';
import ProductsListView from './components/Products/ProductsListView';
import CreateProductForm from './components/Products/CreateProductForm';
import EditProductForm from './components/Products/EditProductForm';
import CategoryListView from './components/CategoryList/CategoryListView';
import CreateCategoryForm from './components/CategoryList/CreateCategoryForm';
import EditCategoryForm from './components/CategoryList/EditCategoryForm';
import MediaLibraryView from './components/Inventory/MediaLibraryView';
import CatalogsView from './components/Publication/CatalogsView';
import CatalogSetup from './components/Setup/CatalogSetup';
import EditorToolbar from './components/Toolbar/EditorToolbar';
import EditorCanvas from './components/Editor/EditorCanvas';
import ProductDetailView from './components/Products/ProductDetailView';
import ProductLibrary from './components/Sidebar/ProductLibrary';
import MediaAssetLibrary from './components/Sidebar/MediaAssetLibrary';
import TemplatesPanel from './components/Sidebar/TemplatesPanel';
import LayersPanel from './components/Sidebar/LayersPanel';
import PropertyPanel from './components/Properties/PropertyPanel';
import { useStore } from './store/useStore';
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
  Layers
} from 'lucide-react';
import EffectsPanel from './components/Sidebar/EffectsPanel';
import { PanelLeftClose, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const {
    isAuthenticated,
    logout,
    user,
    currentView,
    setView,
    setDashboardExiting,
    isSidebarExpanded,
    setSidebarExpanded,
    setActiveCategoryId,
    isPropertyPanelOpen,
    uiTheme,
    toggleUiTheme,
    isGlobalNavigating,
    setIsGlobalNavigating,
    editorTab,
    setEditorTab,
    isEditorSidebarMinimized,
    setIsEditorSidebarMinimized
  } = useStore();

  const [loading, setLoading] = useState(true);
  const [isCategoriesMenuOpen, setCategoriesMenuOpen] = useState(false);
  const [isCatalogMenuOpen, setCatalogMenuOpen] = useState(true);

  // Removed local state: const [editorTab, setEditorTab] = useState<'products' | 'media' | 'templates' | 'layers'>('products');

  const handleViewTransition = (targetView: string) => {
    setIsGlobalNavigating(true);
    setTimeout(() => {
      // @ts-ignore
      setView(targetView);
      setIsGlobalNavigating(false);
    }, 500); // 500ms matches duration-500
  };

  // Login transition state
  const [showLoginTransition, setShowLoginTransition] = useState(false);
  const [transitionStage, setTransitionStage] = useState<'idle' | 'loading' | 'zooming'>('idle');

  useEffect(() => {
    if (isAuthenticated) {
      setShowLoginTransition(true);
      setTransitionStage('loading');

      // Stage 1: Wait for 1.5s while loading
      const loadTimer = setTimeout(() => {
        setTransitionStage('zooming');
      }, 1500);

      // Stage 2: Finish transition
      const finishTimer = setTimeout(() => {
        setShowLoginTransition(false);
        setTransitionStage('idle');
      }, 2500); // 1.5s + 1s zoom duration

      return () => {
        clearTimeout(loadTimer);
        clearTimeout(finishTimer);
      };
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (uiTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [uiTheme]);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#f8fafc] flex flex-col items-center justify-center space-y-6">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">CatalogStudio</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-1">Enterprise Asset Engine</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  if (currentView === 'editor') {
    return (
      <div className={`flex flex-col h-screen w-screen overflow-hidden font-sans text-slate-700 animate-in fade-in duration-700 ${uiTheme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
        <EditorToolbar />
        <div className="flex flex-1 overflow-hidden relative">
          <div className={`flex flex-col border-r border-slate-800 bg-slate-900 z-40 h-full ${isGlobalNavigating ? 'animate-out slide-out-to-left duration-500' : 'animate-in slide-in-from-left duration-500'}`}>
            <div className="flex flex-col w-16 items-center py-8 gap-6">
              {[
                { id: 'products', icon: Package, title: 'Product Assets', delay: '100ms' },
                { id: 'media', icon: Images, title: 'Media Library', delay: '200ms' },
                { id: 'templates', icon: LayoutTemplate, title: 'Templates', delay: '300ms' },
                { id: 'layers', icon: Layers, title: 'Layers', delay: '400ms' },
                { id: 'effects', icon: Sparkles, title: 'Effects & Filters', delay: '500ms' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setEditorTab(tab.id as any)}
                  className={`p-3 rounded-[10px] transition-all duration-300 relative group ${editorTab === tab.id ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70_229,0.4)]' : 'text-slate-500 hover:text-slate-300'} ${isGlobalNavigating ? 'opacity-0 scale-75' : 'animate-fade-in-scale opacity-0'}`}
                  style={{ animationDelay: tab.delay }}
                  title={tab.title}
                >
                  <tab.icon size={22} />
                  {editorTab === tab.id && <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-1 h-4 bg-white rounded-full" />}
                </button>
              ))}
            </div>
          </div>

          <div className={`z-30 h-full shrink-0 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] relative
            ${isEditorSidebarMinimized ? 'w-0 opacity-0 -translate-x-full' : 'w-[320px] opacity-100 translate-x-0'}
            ${uiTheme === 'dark' ? 'bg-[#0f172a]' : 'bg-white'} border-r ${uiTheme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>

            <div className="h-full flex flex-col relative">
              {/* Header with Close/Minimize Button */}
              <div className={`flex items-center justify-between p-4 border-b ${uiTheme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${uiTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                  {editorTab.toUpperCase()} PANEL
                </span>
                <button
                  onClick={() => setIsEditorSidebarMinimized(true)}
                  className={`p-1.5 rounded-lg transition-colors ${uiTheme === 'dark' ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-100 text-slate-400'}`}
                  title="Minimize Sidebar"
                >
                  <PanelLeftClose size={14} />
                </button>
              </div>

              <div className="flex-1 overflow-hidden relative">
                {editorTab === 'products' && <ProductLibrary />}
                {editorTab === 'media' && <MediaAssetLibrary />}
                {editorTab === 'templates' && <TemplatesPanel />}
                {editorTab === 'layers' && <LayersPanel />}
                {editorTab === 'effects' && <EffectsPanel />}
              </div>
            </div>
          </div>

          <div className={`flex-1 flex relative overflow-hidden transition-all duration-500 ${isGlobalNavigating ? 'opacity-0 scale-95' : ''} ${uiTheme === 'dark' ? 'bg-[#0f172a]' : 'bg-slate-50'}`}>
            {isEditorSidebarMinimized && (
              <button
                onClick={() => setIsEditorSidebarMinimized(false)}
                className={`absolute left-4 top-4 z-50 p-3 rounded-xl shadow-xl border animate-in slide-in-from-left duration-300 ${uiTheme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-100 text-slate-600'}`}
              >
                <Sparkles size={20} className="text-indigo-500" />
              </button>
            )}

            <div className="flex-1 flex flex-col relative overflow-hidden">
              <EditorCanvas />
            </div>

            {/* Property Panel Space */}
            <div className={`shrink-0 transition-all duration-300 ease-in-out h-full z-40 overflow-hidden ${isPropertyPanelOpen ? 'w-[400px] opacity-100' : 'w-0 opacity-0'
              } ${uiTheme === 'dark' ? 'bg-[#0f172a]' : 'bg-slate-50'}`}>
              <div className="w-[400px] h-full">
                <PropertyPanel />
              </div>
            </div>
          </div>
        </div>
      </div >
    );
  }

  const sidebarWidth = isSidebarExpanded ? 'w-72' : 'w-20';

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'products-list': return <ProductsListView />;
      case 'create-product': return <CreateProductForm />;
      case 'edit-product': return <EditProductForm />;
      case 'product-detail': return <ProductDetailView />;
      case 'category-list': return <CategoryListView />;
      case 'create-category': return <CreateCategoryForm />;
      case 'edit-category': return <EditCategoryForm />;
      case 'media-library': return <MediaLibraryView />;
      case 'catalogs-list': return <CatalogsView />;
      case 'catalog-setup': return <CatalogSetup />;
      case 'settings': return <SettingsView />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc] dark:bg-slate-950 font-sans text-slate-700 dark:text-slate-200 transition-colors duration-300">
      <aside className={`${sidebarWidth} bg-slate-900 flex flex-col py-6 z-30 shrink-0 transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] overflow-x-hidden border-r border-slate-800 ${isGlobalNavigating ? 'animate-out slide-out-to-left duration-500' : 'animate-in slide-in-from-left duration-500'}`}>
        {/* ... sidebar content ... */}
        <div className={`flex ${isSidebarExpanded ? 'items-center justify-between px-6' : 'flex-col items-center justify-center px-2'} mb-10 min-h-[40px] transition-all duration-300`}>
          {isSidebarExpanded && (
            <div onClick={() => setView('dashboard')} className={`flex items-center gap-3 cursor-pointer group shrink-0 transition-all duration-500 ${isGlobalNavigating ? 'opacity-0 scale-90' : 'animate-slide-in-left opacity-0'}`}>
              <div className="w-10 h-10 bg-indigo-600 rounded-[10px] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform text-center shrink-0">C</div>
              <span className="text-white font-black text-xl tracking-tight whitespace-nowrap">Studio.</span>
            </div>
          )}
          <button
            onClick={() => setSidebarExpanded(!isSidebarExpanded)}
            className={`text-slate-500 hover:text-white transition-all duration-300 p-1 rounded-[10px] hover:bg-slate-800 ${!isSidebarExpanded ? 'w-12 h-12 bg-slate-800/50 text-white flex items-center justify-center border border-slate-700' : ''}`}
            title={isSidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-[10px] transition-all duration-300 ${currentView === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'} ${isGlobalNavigating ? 'opacity-0 translate-x-[-10px]' : 'animate-slide-in-left opacity-0'}`} style={{ animationDelay: '100ms' }}>
            <LayoutDashboard size={20} className="shrink-0" />
            <span className={`text-sm font-bold tracking-tight whitespace-nowrap transition-all duration-300 ${isSidebarExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0 overflow-hidden'}`}>Dashboard</span>
          </button>

          <div className="h-px bg-slate-800/50 mx-4 my-4"></div>

          <div className="space-y-1">
            <button onClick={() => { if (!isSidebarExpanded) setSidebarExpanded(true); setCategoriesMenuOpen(!isCategoriesMenuOpen); }} className={`w-full flex items-center justify-between px-4 py-3.5 rounded-[10px] transition-all duration-300 ${currentView.includes('category') || currentView === 'products-list' || currentView === 'media-library' ? 'text-white' : 'text-slate-400 hover:text-white'} ${isGlobalNavigating ? 'opacity-0 translate-x-[-10px]' : 'animate-slide-in-left opacity-0'}`} style={{ animationDelay: '200ms' }}>
              <div className="flex items-center gap-4">
                <FolderOpen size={20} className="shrink-0" />
                <span className={`text-sm font-bold tracking-tight whitespace-nowrap transition-all duration-300 ${isSidebarExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0 overflow-hidden'}`}>Inventory</span>
              </div>
              {isSidebarExpanded && <ChevronDown size={14} className={`transition-transform duration-300 ${isCategoriesMenuOpen ? 'rotate-180' : ''}`} />}
            </button>
            <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isCategoriesMenuOpen && isSidebarExpanded ? 'grid-rows-1' : 'grid-rows-0'}`}>
              <div className="overflow-hidden">
                <div className={`ml-10 space-y-1 ${isGlobalNavigating ? 'opacity-0 -translate-x-2' : ''} transition-all duration-300`}>
                  <button onClick={() => setView('category-list')} className={`w-full text-left py-2 px-3 rounded-[10px] text-xs font-medium whitespace-nowrap ${currentView === 'category-list' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>Categories</button>
                  <button onClick={() => { setActiveCategoryId(null); setView('products-list'); }} className={`w-full text-left py-2 px-3 rounded-[10px] text-xs font-medium whitespace-nowrap ${currentView === 'products-list' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>All Products</button>
                  <button onClick={() => setView('media-library')} className={`w-full text-left py-2 px-3 rounded-[10px] text-xs font-medium whitespace-nowrap ${currentView === 'media-library' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>Media</button>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <button onClick={() => { if (!isSidebarExpanded) setSidebarExpanded(true); setCatalogMenuOpen(!isCatalogMenuOpen); }} className={`w-full flex items-center justify-between px-4 py-3.5 rounded-[10px] transition-all duration-300 ${currentView.includes('catalog') ? 'text-white' : 'text-slate-400 hover:text-white'} ${isGlobalNavigating ? 'opacity-0 translate-x-[-10px]' : 'animate-slide-in-left opacity-0'}`} style={{ animationDelay: '300ms' }}>
              <div className="flex items-center gap-4">
                <BookOpen size={20} className="shrink-0" />
                <span className={`text-sm font-bold tracking-tight whitespace-nowrap transition-all duration-300 ${isSidebarExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0 overflow-hidden'}`}>Publication</span>
              </div>
              {isSidebarExpanded && <ChevronDown size={14} className={`transition-transform duration-300 ${isCatalogMenuOpen ? 'rotate-180' : ''}`} />}
            </button>
            <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isCatalogMenuOpen && isSidebarExpanded ? 'grid-rows-1' : 'grid-rows-0'}`}>
              <div className="overflow-hidden">
                <div className={`ml-10 space-y-1 ${isGlobalNavigating ? 'opacity-0 -translate-x-2' : ''} transition-all duration-300`}>
                  <button onClick={() => setView('catalogs-list')} className={`w-full text-left py-2 px-3 rounded-[10px] text-xs font-medium whitespace-nowrap ${currentView === 'catalogs-list' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>Your Catalogs</button>
                  <button onClick={() => {
                    if (currentView === 'dashboard') {
                      setDashboardExiting(true);
                      // setIsGlobalNavigating(true); // Keep sidebar static
                      setTimeout(() => {
                        setView('catalog-setup');
                        setDashboardExiting(false);
                        // setIsGlobalNavigating(false);
                      }, 600);
                    } else {
                      setView('catalog-setup');
                    }
                  }} className={`w-full text-left py-2 px-3 rounded-[10px] text-xs font-medium whitespace-nowrap ${currentView === 'catalog-setup' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}>New Catalog</button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="px-4 mt-auto space-y-4">


          <button onClick={() => setView('settings')} className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-[10px] transition-all duration-300 ${currentView === 'settings' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'} ${isGlobalNavigating ? 'opacity-0 translate-x-[-10px]' : 'animate-slide-in-left opacity-0'}`} style={{ animationDelay: '400ms' }}>
            <Settings size={20} className="shrink-0" />
            <span className={`text-sm font-bold tracking-tight whitespace-nowrap transition-all duration-300 ${isSidebarExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0 overflow-hidden'}`}>Settings</span>
          </button>
          <div className={`flex items-center ${isSidebarExpanded ? 'gap-3 p-3' : 'justify-center p-2'} bg-slate-800/40 rounded-[10px] border border-slate-700/50 relative group/profile transition-all duration-500 ease-out ${isGlobalNavigating ? 'opacity-0 scale-90' : 'animate-slide-in-bottom opacity-0'}`} style={{ animationDelay: '500ms' }}>
            <div className={`w-9 h-9 bg-indigo-500 rounded-[10px] flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-indigo-500/20 ${!isSidebarExpanded ? 'scale-90' : ''} transition-all duration-300 overflow-hidden`}>
              {(user?.avatar && (user.avatar.includes('data:') || user.avatar.includes('http'))) ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.avatar || 'JD'
              )}
            </div>
            {isSidebarExpanded && (
              <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-left-2 duration-500">
                <p className="text-xs font-bold text-white truncate leading-none mb-1">John Doe</p>
                <p className="text-[10px] text-slate-500 truncate">dsa@gmail.com</p>
              </div>
            )}
            {isSidebarExpanded && (
              <button onClick={logout} className="text-slate-500 hover:text-red-400 transition-colors animate-in fade-in slide-in-from-left-2 duration-500 delay-75">
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">{renderContent()}</div>

      {/* Login Transition Overlay */}
      {showLoginTransition && (
        <div
          className={`fixed inset-0 z-[100] bg-[#f8fafc] flex flex-col items-center justify-center transition-all duration-1000 ease-in-out ${transitionStage === 'zooming' ? 'opacity-0 scale-150 rotate-12 pointer-events-none' : 'opacity-100 scale-100 rotate-0'
            }`}
        >
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-center mt-6">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">CatalogStudio</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.3em] mt-2">Preparing Workspace...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
