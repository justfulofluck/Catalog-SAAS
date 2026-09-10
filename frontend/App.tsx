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
import HeaderFooterPanel from './components/Sidebar/HeaderFooterPanel';
import TextPanel from './components/Sidebar/TextPanel';
import ColorPanel from './components/Sidebar/ColorPanel';
import HeaderDesignerModal from './components/Editor/HeaderDesignerModal';
import FooterDesignerModal from './components/Editor/FooterDesignerModal';
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
  Image as ImageIcon,
  Type
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
    checkAuth,
    isHeaderDesignerOpen,
    isFooterDesignerOpen
  } = useStore();

  const [loading, setLoading] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isCategoriesMenuOpen, setCategoriesMenuOpen] = useState(false);
  const [isCatalogMenuOpen, setCatalogMenuOpen] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Global click listener for "click-outside-to-close" behavior
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      // 1. Project Settings closing (Right)
      if (isProjectSettingsOpen && rightPanelRef.current && !rightPanelRef.current.contains(e.target as Node)) {
        setIsProjectSettingsOpen(false);
      }
      // 2. User dropdown menu closing
      if (isUserMenuOpen && userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isProjectSettingsOpen, setIsProjectSettingsOpen, isUserMenuOpen]);

  useEffect(() => {
    const getViewFromPath = (pathname: string): View => {
      if (pathname === '/admin/dashboard') return 'admin-dashboard';
      if (pathname === '/admin') return 'admin-login';
      if (pathname === '/editor') return 'editor';
      if (pathname === '/catalog-setup') return 'catalog-setup';
      if (pathname === '/catalog-products') return 'catalog-products';
      if (pathname === '/your-work') return 'your-work';
      if (pathname === '/publish') return 'publish';
      if (pathname === '/pricing') return 'pricing';
      if (pathname === '/settings') return 'settings';
      if (pathname === '/inventory/products') return 'products-list';
      if (pathname === '/inventory/products/create') return 'create-product';
      if (pathname === '/inventory/products/edit') return 'edit-product';
      if (pathname === '/inventory/categories') return 'category-list';
      if (pathname === '/inventory/categories/create') return 'create-category';
      if (pathname === '/inventory/categories/edit') return 'edit-category';
      if (pathname === '/inventory/media') return 'media-library';
      if (pathname === '/onboarding') return 'business-selection';
      if (pathname === '/onboarding/business') return 'business-onboarding';
      if (pathname === '/' || pathname === '') return 'dashboard';
      return currentView;
    };

    const init = async () => {
      try {
        await checkAuth();
      } catch (err) {
        console.debug('No active session found.');
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
    if (uiTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [uiTheme]);

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#100F0F] flex flex-col items-center justify-center space-y-6">
        <div className="w-12 h-12 border-4 border-[#0F3D3E] border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center">
          <h2 className="text-2xl font-medium text-[#F1F1F1] tracking-tight font-heading">catalogmakerr.</h2>
          <p className="text-[11px] text-[#E2DCC8]/70 font-medium uppercase tracking-[0.25em] mt-1.5">Enterprise Asset Engine</p>
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
  if (!isAuthenticated && !isAdminAuthenticated) {
    return <Login />;
  }

  // Editor View (Fullscreen)
  if (currentView === 'editor') {
    const isDark = uiTheme === 'dark';
    return (
      <div className={`flex flex-col h-screen w-screen overflow-hidden font-sans transition-colors duration-200 ${isDark ? 'bg-[#100F0F] text-[#F1F1F1]' : 'bg-[#f1f5f9] text-slate-800'}`}>
        <EditorToolbar />
        <div className="flex flex-1 overflow-hidden relative">
          {/* Icon rail + Sidebar Content container for click-outside detection */}
          <div ref={leftPanelRef} className="flex h-full z-40 relative">
            {/* Icon rail - always visible, fixed width */}
            <div className={`flex flex-col border-r shrink-0 h-full transition-colors duration-200 ${isDark ? 'border-[#E2DCC8]/15 bg-[#100F0F]' : 'border-slate-200 bg-white'}`}>
              <div className="flex flex-col w-14 items-center py-6 gap-6">
                <button
                  onClick={() => {
                    if (editorTab === 'pages' && isSidebarExpanded) {
                      setSidebarExpanded(false);
                    } else {
                      setEditorTab('pages');
                      setSidebarExpanded(true);
                    }
                  }}
                  className={`p-2.5 rounded-[4px] transition-all ${
                    editorTab === 'pages' && isSidebarExpanded 
                      ? 'bg-[#0F3D3E] text-[#F1F1F1] border border-[#E2DCC8]/30 shadow-md' 
                      : (isDark ? 'text-[#E2DCC8]/60 hover:text-[#F1F1F1] hover:bg-[#0F3D3E]/30' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100')
                  }`}
                  title="Pages"
                >
                  <FileText size={20} />
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
                  className={`p-2.5 rounded-[4px] transition-all ${
                    editorTab === 'products' && isSidebarExpanded 
                      ? 'bg-[#0F3D3E] text-[#F1F1F1] border border-[#E2DCC8]/30 shadow-md' 
                      : (isDark ? 'text-[#E2DCC8]/60 hover:text-[#F1F1F1] hover:bg-[#0F3D3E]/30' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100')
                  }`}
                  title="Product Assets"
                >
                  <Package size={20} />
                </button>
                <button
                  onClick={() => {
                    if (editorTab === 'text' && isSidebarExpanded) {
                      setSidebarExpanded(false);
                    } else {
                      setEditorTab('text');
                      setSidebarExpanded(true);
                    }
                  }}
                  className={`p-2.5 rounded-[4px] transition-all ${
                    editorTab === 'text' && isSidebarExpanded 
                      ? 'bg-[#7c3aed] text-white shadow-lg shadow-purple-900/30' 
                      : (isDark ? 'text-[#E2DCC8]/60 hover:text-[#F1F1F1] hover:bg-[#0F3D3E]/30' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100')
                  }`}
                  title="Text & Typography"
                >
                  <Type size={20} />
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
                  className={`p-2.5 rounded-[4px] transition-all ${
                    editorTab === 'media' && isSidebarExpanded 
                      ? 'bg-[#0F3D3E] text-[#F1F1F1] border border-[#E2DCC8]/30 shadow-md' 
                      : (isDark ? 'text-[#E2DCC8]/60 hover:text-[#F1F1F1] hover:bg-[#0F3D3E]/30' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100')
                  }`}
                  title="Media & Stock Images"
                >
                  <Images size={20} />
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
                  className={`p-2.5 rounded-[4px] transition-all ${
                    editorTab === 'buttons' && isSidebarExpanded 
                      ? 'bg-[#0F3D3E] text-[#F1F1F1] border border-[#E2DCC8]/30 shadow-md' 
                      : (isDark ? 'text-[#E2DCC8]/60 hover:text-[#F1F1F1] hover:bg-[#0F3D3E]/30' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100')
                  }`}
                  title="Buttons"
                >
                  <MousePointer2 size={20} />
                </button>

                <button
                  onClick={() => {
                    if (editorTab === 'header-footer' && isSidebarExpanded) {
                      setSidebarExpanded(false);
                    } else {
                      setEditorTab('header-footer');
                      setSidebarExpanded(true);
                    }
                  }}
                  className={`p-2.5 rounded-[4px] transition-all ${
                    editorTab === 'header-footer' && isSidebarExpanded 
                      ? 'bg-[#0F3D3E] text-[#F1F1F1] border border-[#E2DCC8]/30 shadow-md' 
                      : (isDark ? 'text-[#E2DCC8]/60 hover:text-[#F1F1F1] hover:bg-[#0F3D3E]/30' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100')
                  }`}
                  title="Header & Footer Settings"
                >
                  <LayoutTemplate size={20} />
                </button>
              </div>
            </div>

            {/* Docked Sidebar Content */}
            {isSidebarExpanded && (
              <div className={`h-full z-30 shadow-xl border-r transition-all duration-200 ${
                editorTab === 'products' ? 'w-[430px]' : (editorTab === 'text' || editorTab === 'colors') ? 'w-[360px]' : 'w-[330px]'
              } shrink-0 ${isDark ? 'border-[#E2DCC8]/15 bg-[#141414]' : 'border-slate-200 bg-white'}`}>
                {editorTab === 'pages' && <PagesPanel />}
                {editorTab === 'products' && <ProductLibrary />}
                {editorTab === 'text' && <TextPanel />}
                {editorTab === 'media' && <MediaAssetLibrary />}
                {editorTab === 'templates' && <TemplatesPanel />}
                {editorTab === 'buttons' && <ButtonsPanel />}
                {editorTab === 'header-footer' && <HeaderFooterPanel />}
                {editorTab === 'colors' && <ColorPanel />}
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden relative">
            <EditorCanvas />

            <div ref={rightPanelRef} className="absolute top-0 right-0 h-full z-40 flex pointer-events-none">
              <div className="flex h-full pointer-events-auto shadow-[-20px_0_50px_rgba(0,0,0,0.02)]">
                {isProjectSettingsOpen && <ProjectSettingsPanel />}
              </div>
            </div>
          </div>
        </div>

        {/* Master Header Designer / Studio Modal */}
        {isHeaderDesignerOpen && <HeaderDesignerModal />}
        {/* Master Footer Designer / Studio Modal */}
        {isFooterDesignerOpen && <FooterDesignerModal />}
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

  const isDark = uiTheme === 'dark';

  return (
    <div className={`flex h-screen w-screen overflow-hidden font-sans transition-colors duration-200 ${isDark ? 'bg-[#100F0F] text-[#F1F1F1]' : 'bg-[#f8fafc] text-slate-800'}`}>
      <aside className={`${sidebarWidth} ${isDark ? 'bg-[#161616] border-[#262626] text-[#F1F1F1]' : 'bg-white border-slate-200 text-slate-800'} border-r flex flex-col pt-6 pb-3 z-30 shrink-0 transition-all duration-300 ease-in-out`}>
        <div className={`flex ${isSidebarExpanded ? 'items-center justify-between px-6' : 'flex-col items-center gap-6 px-2'} mb-8`}>
          <div onClick={() => setView('dashboard')} className="flex items-center gap-3 cursor-pointer group shrink-0 overflow-hidden max-w-full">
            {isSidebarExpanded ? (
              <span className={`font-medium text-xl tracking-tight font-heading animate-in fade-in slide-in-from-left-2 duration-300 truncate ${isDark ? 'text-[#F1F1F1]' : 'text-slate-900'}`}>catalogmakerr.</span>
            ) : (
              <span className={`font-medium text-xl tracking-tight font-heading truncate ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>c.</span>
            )}
          </div>
          <button
            onClick={() => setSidebarExpanded(!isSidebarExpanded)}
            className={`transition-colors p-1.5 rounded-[4px] ${isDark ? 'text-[#E2DCC8]/70 hover:text-[#F1F1F1] hover:bg-[#222222]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'} ${!isSidebarExpanded ? 'w-10 h-10 flex items-center justify-center' : ''}`}
            title={isSidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-[4px] font-heading font-medium text-sm transition-all ${currentView === 'dashboard' ? 'bg-[#0F3D3E] text-white border border-[#E2DCC8]/25 shadow-lg shadow-[#0F3D3E]/30' : (isDark ? 'text-[#E2DCC8]/70 hover:bg-[#1e1e1e] hover:text-[#F1F1F1]' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')}`}>
            <LayoutDashboard size={20} className={`shrink-0 ${isDark ? 'text-[#E2DCC8]' : (currentView === 'dashboard' ? 'text-white' : 'text-slate-500')}`} />
            {isSidebarExpanded && <span className="tracking-tight">Dashboard</span>}
          </button>

          <div className={`h-px mx-2 my-3 ${isDark ? 'bg-[#262626]' : 'bg-slate-200'}`}></div>

          <div className="space-y-1">
            <button onClick={() => { if (!isSidebarExpanded) setSidebarExpanded(true); setCategoriesMenuOpen(!isCategoriesMenuOpen); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-[4px] font-heading font-medium text-sm transition-all ${currentView.includes('category') || currentView === 'products-list' || currentView === 'media-library' ? (isDark ? 'text-[#F1F1F1] bg-[#1e1e1e]' : 'text-slate-900 bg-slate-100 font-semibold') : (isDark ? 'text-[#E2DCC8]/70 hover:bg-[#1e1e1e] hover:text-[#F1F1F1]' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')}`}>
              <div className="flex items-center gap-4">
                <FolderOpen size={20} className={`shrink-0 ${isDark ? 'text-[#E2DCC8]' : 'text-slate-500'}`} />
                {isSidebarExpanded && <span className="tracking-tight">Inventory</span>}
              </div>
              {isSidebarExpanded && <ChevronDown size={14} className={`transition-transform ${isCategoriesMenuOpen ? 'rotate-180 text-[#0F3D3E]' : (isDark ? 'text-[#888]' : 'text-slate-400')}`} />}
            </button>
            {isCategoriesMenuOpen && isSidebarExpanded && (
              <div className={`ml-8 space-y-1 animate-in slide-in-from-top-2 duration-200 border-l pl-2 mt-1 ${isDark ? 'border-[#262626]' : 'border-slate-200'}`}>
                <button onClick={() => setView('category-list')} className={`w-full text-left py-2 px-3 rounded-[4px] text-xs font-medium transition-colors ${currentView === 'category-list' ? (isDark ? 'text-[#E2DCC8] bg-[#0F3D3E]/50 font-bold border border-[#E2DCC8]/30' : 'text-[#0F3D3E] bg-teal-50 font-bold border border-teal-200') : (isDark ? 'text-[#E2DCC8]/70 hover:text-[#F1F1F1] hover:bg-[#1e1e1e]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')}`}>Categories</button>
                <button onClick={() => { setActiveCategoryId(null); setView('products-list'); }} className={`w-full text-left py-2 px-3 rounded-[4px] text-xs font-medium transition-colors ${currentView === 'products-list' ? (isDark ? 'text-[#E2DCC8] bg-[#0F3D3E]/50 font-bold border border-[#E2DCC8]/30' : 'text-[#0F3D3E] bg-teal-50 font-bold border border-teal-200') : (isDark ? 'text-[#E2DCC8]/70 hover:text-[#F1F1F1] hover:bg-[#1e1e1e]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')}`}>All Products</button>
                <button onClick={() => setView('media-library')} className={`w-full text-left py-2 px-3 rounded-[4px] text-xs font-medium transition-colors ${currentView === 'media-library' ? (isDark ? 'text-[#E2DCC8] bg-[#0F3D3E]/50 font-bold border border-[#E2DCC8]/30' : 'text-[#0F3D3E] bg-teal-50 font-bold border border-teal-200') : (isDark ? 'text-[#E2DCC8]/70 hover:text-[#F1F1F1] hover:bg-[#1e1e1e]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')}`}>Media</button>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <button onClick={() => { if (!isSidebarExpanded) setSidebarExpanded(true); setCatalogMenuOpen(!isCatalogMenuOpen); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-[4px] font-heading font-medium text-sm transition-all ${currentView.includes('catalog') || currentView === 'your-work' || currentView === 'publish' ? (isDark ? 'text-[#F1F1F1] bg-[#1e1e1e]' : 'text-slate-900 bg-slate-100 font-semibold') : (isDark ? 'text-[#E2DCC8]/70 hover:bg-[#1e1e1e] hover:text-[#F1F1F1]' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900')}`}>
              <div className="flex items-center gap-4">
                <BookOpen size={20} className={`shrink-0 ${isDark ? 'text-[#E2DCC8]' : 'text-slate-500'}`} />
                {isSidebarExpanded && <span className="tracking-tight">Publication</span>}
              </div>
              {isSidebarExpanded && <ChevronDown size={14} className={`transition-transform ${isCatalogMenuOpen ? 'rotate-180 text-[#0F3D3E]' : (isDark ? 'text-[#888]' : 'text-slate-400')}`} />}
            </button>
            {isCatalogMenuOpen && isSidebarExpanded && (
              <div className={`ml-8 space-y-1 animate-in slide-in-from-top-2 duration-200 border-l pl-2 mt-1 ${isDark ? 'border-[#262626]' : 'border-slate-200'}`}>
                <button onClick={() => setView('catalog-setup')} className={`w-full text-left py-2 px-3 rounded-[4px] text-xs font-medium transition-colors ${currentView === 'catalog-setup' ? (isDark ? 'text-[#E2DCC8] bg-[#0F3D3E]/50 font-bold border border-[#E2DCC8]/30' : 'text-[#0F3D3E] bg-teal-50 font-bold border border-teal-200') : (isDark ? 'text-[#E2DCC8]/70 hover:text-[#F1F1F1] hover:bg-[#1e1e1e]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')}`}>New Catalog</button>
                <button onClick={() => setView('your-work')} className={`w-full text-left py-2 px-3 rounded-[4px] text-xs font-medium transition-colors ${currentView === 'your-work' ? (isDark ? 'text-[#E2DCC8] bg-[#0F3D3E]/50 font-bold border border-[#E2DCC8]/30' : 'text-[#0F3D3E] bg-teal-50 font-bold border border-teal-200') : (isDark ? 'text-[#E2DCC8]/70 hover:text-[#F1F1F1] hover:bg-[#1e1e1e]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')}`}>Your Work</button>
                <button onClick={() => setView('publish')} className={`w-full text-left py-2 px-3 rounded-[4px] text-xs font-medium transition-colors ${currentView === 'publish' ? (isDark ? 'text-[#E2DCC8] bg-[#0F3D3E]/50 font-bold border border-[#E2DCC8]/30' : 'text-[#0F3D3E] bg-teal-50 font-bold border border-teal-200') : (isDark ? 'text-[#E2DCC8]/70 hover:text-[#F1F1F1] hover:bg-[#1e1e1e]' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100')}`}>Publish & Manage</button>
              </div>
            )}
          </div>
        </nav>

        <div className="px-3 mt-auto space-y-2">
          {user?.businessId && isSidebarExpanded && (
            <div className={`px-3.5 py-2 rounded-[4px] border ${isDark ? 'bg-[#161616] border-[#262626]' : 'bg-slate-50 border-slate-200'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1.5 ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>
                <Sparkles size={11} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} /> Industry
              </p>
              <p className={`text-xs font-medium truncate ${isDark ? 'text-[#F1F1F1]' : 'text-slate-800'}`}>
                {businessTemplates.find(t => t.id === user.businessId)?.name || user.businessId}
              </p>
            </div>
          )}

          {/* Quick Theme Switcher Button */}
          <button
            onClick={toggleUiTheme}
            className={`w-full flex items-center justify-between p-2 rounded-[4px] border transition-all text-xs font-medium ${
              isDark 
                ? 'bg-[#161616] border-[#262626] text-[#E2DCC8] hover:bg-[#1c1b1b] hover:border-[#E2DCC8]/30' 
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
            }`}
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {isDark ? <Sun size={15} className="text-amber-400 shrink-0" /> : <Moon size={15} className="text-indigo-600 shrink-0" />}
              {isSidebarExpanded && <span className="truncate">{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
            </div>
            {isSidebarExpanded && (
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-[2px] uppercase tracking-wider ${
                isDark ? 'bg-[#222] text-[#888]' : 'bg-white text-slate-500 border border-slate-200'
              }`}>
                {isDark ? 'DARK' : 'LIGHT'}
              </span>
            )}
          </button>

          {/* User & Settings Dropdown Trigger */}
          <div className="relative" ref={userMenuRef}>
            {isUserMenuOpen && (
              <div 
                className={`absolute bottom-full mb-2 border rounded-[4px] shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 ${
                  isDark ? 'bg-[#161616] border-[#262626] text-white' : 'bg-white border-slate-200 text-slate-800'
                } ${isSidebarExpanded ? 'left-0 right-0 w-full' : 'left-0 w-56'}`}
              >
                {/* User Header in Dropdown */}
                <div className={`px-3 py-2 border-b mb-1 ${isDark ? 'border-[#262626]' : 'border-slate-100'}`}>
                  <p className={`text-xs font-semibold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.name || 'User'}</p>
                  <p className={`text-[10px] truncate ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>{user?.email}</p>
                  {user?.businessName && (
                    <p className={`text-[10px] truncate mt-0.5 flex items-center gap-1 font-medium ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`}>
                      <Briefcase size={10} className="text-[#0F3D3E]" /> {user.businessName}
                    </p>
                  )}
                </div>

                {/* Theme Toggle in Dropdown */}
                <button
                  onClick={() => {
                    toggleUiTheme();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${
                    isDark ? 'text-[#cccccc] hover:text-white hover:bg-[#0F3D3E]/20' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {isDark ? <Sun size={15} className="text-amber-400 shrink-0" /> : <Moon size={15} className="text-indigo-600 shrink-0" />}
                    <span>Theme</span>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-[2px] uppercase tracking-wider ${
                    isDark ? 'bg-[#262626] text-[#E2DCC8] border border-[#333]' : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {isDark ? 'Dark' : 'Light'}
                  </span>
                </button>

                {/* Upgrade Plan */}
                <button
                  onClick={() => {
                    setView('pricing');
                    setIsUserMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors ${
                    isDark 
                      ? ((currentView as string) === 'pricing' ? 'text-[#E2DCC8] bg-[#0F3D3E]/30' : 'text-[#cccccc] hover:text-white hover:bg-[#0F3D3E]/20')
                      : ((currentView as string) === 'pricing' ? 'text-[#0F3D3E] bg-teal-50' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100')
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Rocket size={15} className={isDark ? "text-[#E2DCC8] shrink-0" : "text-[#0F3D3E] shrink-0"} />
                    <span>Upgrade Plan</span>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-[2px] bg-[#0F3D3E] text-[#F1F1F1] border border-[#E2DCC8]/30 uppercase tracking-wider">
                    PRO
                  </span>
                </button>

                {/* Settings */}
                <button
                  onClick={() => {
                    setView('settings');
                    setIsUserMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${
                    isDark
                      ? (currentView === 'settings' ? 'text-[#E2DCC8] bg-[#0F3D3E]/30' : 'text-[#cccccc] hover:text-white hover:bg-[#0F3D3E]/20')
                      : (currentView === 'settings' ? 'text-[#0F3D3E] bg-teal-50' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100')
                  }`}
                >
                  <Settings size={15} className={isDark ? "text-[#888888] shrink-0" : "text-slate-400 shrink-0"} />
                  <span>Settings</span>
                </button>

                <div className={`h-px my-1 ${isDark ? 'bg-[#262626]' : 'bg-slate-100'}`} />

                {/* Logout */}
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut size={15} className="shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}

            {/* Profile & Trigger Pill */}
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`w-full flex items-center gap-3 p-2 rounded-[4px] border transition-all text-left group ${
                isUserMenuOpen
                  ? (isDark ? 'bg-[#171616] border-[#0F3D3E] ring-1 ring-[#0F3D3E]/40' : 'bg-slate-100 border-[#0F3D3E] ring-1 ring-[#0F3D3E]/30')
                  : (isDark ? 'bg-[#161616] border-[#262626] hover:bg-[#1a1919] hover:border-[#E2DCC8]/20' : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300')
              }`}
              title="Account & Settings"
            >
              <div className="w-8 h-8 bg-[#0F3D3E] border border-[#E2DCC8]/30 rounded-[3px] flex items-center justify-center text-[#F1F1F1] font-heading font-semibold text-sm shrink-0 shadow-sm">
                {user?.avatar || (user?.name ? user.name[0].toUpperCase() : 'U')}
              </div>

              {isSidebarExpanded && (
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-semibold truncate leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.name}</p>
                  <p className={`text-[10px] truncate leading-tight flex items-center gap-1.5 mt-0.5 ${isDark ? 'text-[#999999]' : 'text-slate-500'}`}>
                    <Briefcase size={10} className={isDark ? "text-[#E2DCC8] shrink-0" : "text-[#0F3D3E] shrink-0"} />
                    <span className="truncate">{user?.businessName || user?.email}</span>
                  </p>
                </div>
              )}

              {isSidebarExpanded && (
                <div className={`${isDark ? 'text-[#777777] group-hover:text-white' : 'text-slate-400 group-hover:text-slate-700'} transition-colors pl-1`}>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180 text-[#0F3D3E]' : ''}`}
                  />
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>
      <div className={`flex flex-1 flex-col overflow-hidden transition-colors duration-200 ${isDark ? 'bg-[#100F0F]' : 'bg-[#f8fafc]'}`}>{renderContent()}</div>
      {isHeaderDesignerOpen && <HeaderDesignerModal />}
      {isFooterDesignerOpen && <FooterDesignerModal />}
    </div>
  );
};

export default App;