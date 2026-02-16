
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
import CatalogSetup from './components/Setup/CatalogSetup';
import EditorToolbar from './components/Toolbar/EditorToolbar';
import EditorCanvas from './components/Editor/EditorCanvas';
import ProductLibrary from './components/Sidebar/ProductLibrary';
import MediaAssetLibrary from './components/Sidebar/MediaAssetLibrary';
import TemplatesPanel from './components/Sidebar/TemplatesPanel';
import LayersPanel from './components/Sidebar/LayersPanel';
import PropertyPanel from './components/Properties/PropertyPanel';
import YourWork from './components/Dashboard/YourWork';
import PublishView from './components/Publish/PublishView';
import PublicViewer from './components/Publish/PublicViewer';
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
  Layers,
  Briefcase,
  Rocket,
  Sparkles
} from 'lucide-react';
import EffectsPanel from './components/Sidebar/EffectsPanel';

const App: React.FC = () => {
  const {
    isAuthenticated,
    logout,
    user,
    currentView,
    setView,
    isSidebarExpanded,
    setSidebarExpanded,
    setActiveCategoryId,
    isPropertyPanelOpen,
    uiTheme,
    toggleUiTheme,
    savedCatalogs,
    editorTab,
    setEditorTab
  } = useStore();

  const [loading, setLoading] = useState(true);
  const [isCategoriesMenuOpen, setCategoriesMenuOpen] = useState(false);
  const [isCatalogMenuOpen, setCatalogMenuOpen] = useState(true);

  // const [editorTab, setEditorTab] = useState<'products' | 'media' | 'templates' | 'layers'>('products');

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
  }, [uiTheme, currentView]);

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

  if (currentView === 'public-viewer') {
    return <PublicViewer />;
  }

  if (currentView === 'editor') {
    return (
      <div className={`flex flex-col h-screen w-screen overflow-hidden font-sans transition-colors ${uiTheme === 'dark' ? 'bg-slate-950 text-slate-200' : 'bg-slate-100 text-slate-700'}`}>
        <EditorToolbar />
        <div className="flex flex-1 overflow-hidden relative">
          <div className="flex flex-col border-r border-slate-800 bg-slate-900 z-40">
            <div className="flex flex-col w-16 items-center py-8 gap-8">
              <button
                onClick={() => setEditorTab('products')}
                className={`p-3 rounded-[10px] transition-all ${editorTab === 'products' ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70_229,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
                title="Product Assets"
              >
                <Package size={22} />
              </button>
              <button
                onClick={() => setEditorTab('media')}
                className={`p-3 rounded-[10px] transition-all ${editorTab === 'media' ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70_229,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
                title="Media Library"
              >
                <Images size={22} />
              </button>
              <button
                onClick={() => setEditorTab('templates')}
                className={`p-3 rounded-[10px] transition-all ${editorTab === 'templates' ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70_229,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
                title="Templates"
              >
                <LayoutTemplate size={22} />
              </button>
              <button
                onClick={() => setEditorTab('layers')}
                className={`p-3 rounded-[10px] transition-all ${editorTab === 'layers' ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70_229,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
                title="Layers"
              >
                <Layers size={22} />
              </button>
              <button
                onClick={() => setEditorTab('effects')}
                className={`p-3 rounded-[10px] transition-all ${editorTab === 'effects' ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70_229,0.4)]' : 'text-slate-500 hover:text-slate-300'}`}
                title="Effects"
              >
                <Sparkles size={22} />
              </button>
            </div>
          </div>
          <div className="z-30 h-full shrink-0 shadow-2xl">
            {editorTab === 'products' && <ProductLibrary />}
            {editorTab === 'media' && <MediaAssetLibrary />}
            {editorTab === 'templates' && <TemplatesPanel />}
            {editorTab === 'layers' && <LayersPanel />}
            {editorTab === 'effects' && <EffectsPanel />}
          </div>
          <EditorCanvas />
          {isPropertyPanelOpen && <PropertyPanel />}
        </div>
      </div>
    );
  }

  const sidebarWidth = isSidebarExpanded ? 'w-72' : 'w-20';

  const renderContent = () => {
    switch (currentView) {
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
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f8fafc] dark:bg-slate-950 font-sans text-slate-700 dark:text-slate-200 transition-colors duration-300">
      <aside className={`${sidebarWidth} bg-slate-900 flex flex-col py-6 z-30 shrink-0 transition-all duration-300 ease-in-out`}>
        <div className={`flex ${isSidebarExpanded ? 'items-center justify-between px-6' : 'flex-col items-center gap-6 px-2'} mb-10`}>
          <div onClick={() => setView('dashboard')} className="flex items-center gap-3 cursor-pointer group shrink-0">
            <div className="w-10 h-10 bg-indigo-600 rounded-[10px] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform text-center shrink-0">C</div>
            {isSidebarExpanded && <span className="text-white font-black text-xl tracking-tight animate-in fade-in slide-in-from-left-2 duration-300">Studio.</span>}
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
        </nav>

        <div className="px-4 mt-auto space-y-4">
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
