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
    if (uiTheme === 'dark' || currentView === 'editor' || currentView === 'admin-dashboard') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [uiTheme, currentView]);

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
    return (
      <div className="flex flex-col h-screen w-screen bg-[#100F0F] overflow-hidden font-sans text-[#F1F1F1]">
        <EditorToolbar />
        <div className="flex flex-1 overflow-hidden relative">
          {/* Icon rail + Sidebar Content container for click-outside detection */}
          <div ref={leftPanelRef} className="flex h-full z-40 relative">
            {/* Icon rail - always visible, fixed width */}
            <div className="flex flex-col border-r border-[#E2DCC8]/15 bg-[#100F0F] shrink-0 h-full">
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
                  className={`p-2.5 rounded-[4px] transition-all ${editorTab === 'pages' && isSidebarExpanded ? 'bg-[#0F3D3E] text-[#F1F1F1] border border-[#E2DCC8]/30 shadow-md' : 'text-[#E2DCC8]/60 hover:text-[#F1F1F1] hover:bg-[#0F3D3E]/30'}`}
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
                  className={`p-2.5 rounded-[4px] transition-all ${editorTab === 'products' && isSidebarExpanded ? 'bg-[#0F3D3E] text-[#F1F1F1] border border-[#E2DCC8]/30 shadow-md' : 'text-[#E2DCC8]/60 hover:text-[#F1F1F1] hover:bg-[#0F3D3E]/30'}`}
                  title="Product Assets"
                >
                  <Package size={20} />
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
                  className={`p-2.5 rounded-[4px] transition-all ${editorTab === 'media' && isSidebarExpanded ? 'bg-[#0F3D3E] text-[#F1F1F1] border border-[#E2DCC8]/30 shadow-md' : 'text-[#E2DCC8]/60 hover:text-[#F1F1F1] hover:bg-[#0F3D3E]/30'}`}
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
                  className={`p-2.5 rounded-[4px] transition-all ${editorTab === 'buttons' && isSidebarExpanded ? 'bg-[#0F3D3E] text-[#F1F1F1] border border-[#E2DCC8]/30 shadow-md' : 'text-[#E2DCC8]/60 hover:text-[#F1F1F1] hover:bg-[#0F3D3E]/30'}`}
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
                  className={`p-2.5 rounded-[4px] transition-all ${editorTab === 'header-footer' && isSidebarExpanded ? 'bg-[#0F3D3E] text-[#F1F1F1] border border-[#E2DCC8]/30 shadow-md' : 'text-[#E2DCC8]/60 hover:text-[#F1F1F1] hover:bg-[#0F3D3E]/30'}`}
                  title="Header & Footer Settings"
                >
                  <LayoutTemplate size={20} />
                </button>
              </div>
            </div>

            {/* Docked Sidebar Content */}
            {isSidebarExpanded && (
              <div className={`h-full z-30 shadow-xl border-r border-[#E2DCC8]/15 transition-all duration-200 ${editorTab === 'products' ? 'w-[430px]' : 'w-[330px]'} shrink-0 bg-[#141414]`}>
                {editorTab === 'pages' && <PagesPanel />}
                {editorTab === 'products' && <ProductLibrary />}
                {editorTab === 'media' && <MediaAssetLibrary />}
                {editorTab === 'templates' && <TemplatesPanel />}
                {editorTab === 'buttons' && <ButtonsPanel />}
                {editorTab === 'header-footer' && <HeaderFooterPanel />}
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
    <div className="flex h-screen w-screen overflow-hidden bg-[#100F0F] font-sans text-[#F1F1F1]">
      <aside className={`${sidebarWidth} bg-[#161616] border-r border-[#262626] flex flex-col pt-6 pb-3 z-30 shrink-0 transition-all duration-300 ease-in-out`}>
        <div className={`flex ${isSidebarExpanded ? 'items-center justify-between px-6' : 'flex-col items-center gap-6 px-2'} mb-8`}>
          <div onClick={() => setView('dashboard')} className="flex items-center gap-3 cursor-pointer group shrink-0 overflow-hidden max-w-full">
            {isSidebarExpanded ? (
              <span className="text-[#F1F1F1] font-medium text-xl tracking-tight font-heading animate-in fade-in slide-in-from-left-2 duration-300 truncate">catalogmakerr.</span>
            ) : (
              <span className="text-[#E2DCC8] font-medium text-xl tracking-tight font-heading truncate">c.</span>
            )}
          </div>
          <button
            onClick={() => setSidebarExpanded(!isSidebarExpanded)}
            className={`text-[#E2DCC8]/70 hover:text-[#F1F1F1] transition-colors p-1.5 rounded-[4px] hover:bg-[#222222] ${!isSidebarExpanded ? 'w-10 h-10 flex items-center justify-center' : ''}`}
            title={isSidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-4 px-4 py-3 rounded-[4px] font-heading font-medium text-sm transition-all ${currentView === 'dashboard' ? 'bg-[#0F3D3E] text-[#F1F1F1] border border-[#E2DCC8]/25 shadow-lg shadow-[#0F3D3E]/30' : 'text-[#E2DCC8]/70 hover:bg-[#1e1e1e] hover:text-[#F1F1F1]'}`}>
            <LayoutDashboard size={20} className="shrink-0 text-[#E2DCC8]" />
            {isSidebarExpanded && <span className="tracking-tight">Dashboard</span>}
          </button>

          <div className="h-px bg-[#262626] mx-2 my-3"></div>

          <div className="space-y-1">
            <button onClick={() => { if (!isSidebarExpanded) setSidebarExpanded(true); setCategoriesMenuOpen(!isCategoriesMenuOpen); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-[4px] font-heading font-medium text-sm transition-all ${currentView.includes('category') || currentView === 'products-list' || currentView === 'media-library' ? 'text-[#F1F1F1] bg-[#1e1e1e]' : 'text-[#E2DCC8]/70 hover:bg-[#1e1e1e] hover:text-[#F1F1F1]'}`}>
              <div className="flex items-center gap-4">
                <FolderOpen size={20} className="shrink-0 text-[#E2DCC8]" />
                {isSidebarExpanded && <span className="tracking-tight">Inventory</span>}
              </div>
              {isSidebarExpanded && <ChevronDown size={14} className={`transition-transform ${isCategoriesMenuOpen ? 'rotate-180 text-[#E2DCC8]' : ''}`} />}
            </button>
            {isCategoriesMenuOpen && isSidebarExpanded && (
              <div className="ml-8 space-y-1 animate-in slide-in-from-top-2 duration-200 border-l border-[#262626] pl-2 mt-1">
                <button onClick={() => setView('category-list')} className={`w-full text-left py-2 px-3 rounded-[4px] text-xs font-medium transition-colors ${currentView === 'category-list' ? 'text-[#E2DCC8] bg-[#0F3D3E]/50 font-bold border border-[#E2DCC8]/30' : 'text-[#E2DCC8]/70 hover:text-[#F1F1F1] hover:bg-[#1e1e1e]'}`}>Categories</button>
                <button onClick={() => { setActiveCategoryId(null); setView('products-list'); }} className={`w-full text-left py-2 px-3 rounded-[4px] text-xs font-medium transition-colors ${currentView === 'products-list' ? 'text-[#E2DCC8] bg-[#0F3D3E]/50 font-bold border border-[#E2DCC8]/30' : 'text-[#E2DCC8]/70 hover:text-[#F1F1F1] hover:bg-[#1e1e1e]'}`}>All Products</button>
                <button onClick={() => setView('media-library')} className={`w-full text-left py-2 px-3 rounded-[4px] text-xs font-medium transition-colors ${currentView === 'media-library' ? 'text-[#E2DCC8] bg-[#0F3D3E]/50 font-bold border border-[#E2DCC8]/30' : 'text-[#E2DCC8]/70 hover:text-[#F1F1F1] hover:bg-[#1e1e1e]'}`}>Media</button>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <button onClick={() => { if (!isSidebarExpanded) setSidebarExpanded(true); setCatalogMenuOpen(!isCatalogMenuOpen); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-[4px] font-heading font-medium text-sm transition-all ${currentView.includes('catalog') || currentView === 'your-work' || currentView === 'publish' ? 'text-[#F1F1F1] bg-[#1e1e1e]' : 'text-[#E2DCC8]/70 hover:bg-[#1e1e1e] hover:text-[#F1F1F1]'}`}>
              <div className="flex items-center gap-4">
                <BookOpen size={20} className="shrink-0 text-[#E2DCC8]" />
                {isSidebarExpanded && <span className="tracking-tight">Publication</span>}
              </div>
              {isSidebarExpanded && <ChevronDown size={14} className={`transition-transform ${isCatalogMenuOpen ? 'rotate-180 text-[#E2DCC8]' : ''}`} />}
            </button>
            {isCatalogMenuOpen && isSidebarExpanded && (
              <div className="ml-8 space-y-1 animate-in slide-in-from-top-2 duration-200 border-l border-[#262626] pl-2 mt-1">
                <button onClick={() => setView('catalog-setup')} className={`w-full text-left py-2 px-3 rounded-[4px] text-xs font-medium transition-colors ${currentView === 'catalog-setup' ? 'text-[#E2DCC8] bg-[#0F3D3E]/50 font-bold border border-[#E2DCC8]/30' : 'text-[#E2DCC8]/70 hover:text-[#F1F1F1] hover:bg-[#1e1e1e]'}`}>New Catalog</button>
                <button onClick={() => setView('your-work')} className={`w-full text-left py-2 px-3 rounded-[4px] text-xs font-medium transition-colors ${currentView === 'your-work' ? 'text-[#E2DCC8] bg-[#0F3D3E]/50 font-bold border border-[#E2DCC8]/30' : 'text-[#E2DCC8]/70 hover:text-[#F1F1F1] hover:bg-[#1e1e1e]'}`}>Your Work</button>
                <button onClick={() => setView('publish')} className={`w-full text-left py-2 px-3 rounded-[4px] text-xs font-medium transition-colors ${currentView === 'publish' ? 'text-[#E2DCC8] bg-[#0F3D3E]/50 font-bold border border-[#E2DCC8]/30' : 'text-[#E2DCC8]/70 hover:text-[#F1F1F1] hover:bg-[#1e1e1e]'}`}>Publish & Manage</button>
              </div>
            )}
          </div>
        </nav>

        <div className="px-3 mt-auto space-y-2">
          {user?.businessId && isSidebarExpanded && (
            <div className="px-3.5 py-2 bg-[#161616] rounded-[4px] border border-[#262626]">
              <p className="text-[10px] font-bold text-[#888888] uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
                <Sparkles size={11} className="text-[#E2DCC8]" /> Industry
              </p>
              <p className="text-xs font-medium text-[#F1F1F1] truncate">
                {businessTemplates.find(t => t.id === user.businessId)?.name || user.businessId}
              </p>
            </div>
          )}

          {/* User & Settings Dropdown Trigger */}
          <div className="relative" ref={userMenuRef}>
            {isUserMenuOpen && (
              <div 
                className={`absolute bottom-full mb-2 bg-[#161616] border border-[#262626] rounded-[4px] shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 ${
                  isSidebarExpanded ? 'left-0 right-0 w-full' : 'left-0 w-56'
                }`}
              >
                {/* User Header in Dropdown */}
                <div className="px-3 py-2 border-b border-[#262626] mb-1">
                  <p className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</p>
                  <p className="text-[10px] text-[#888888] truncate">{user?.email}</p>
                  {user?.businessName && (
                    <p className="text-[10px] text-[#E2DCC8] truncate mt-0.5 flex items-center gap-1 font-medium">
                      <Briefcase size={10} className="text-[#0F3D3E]" /> {user.businessName}
                    </p>
                  )}
                </div>

                {/* Upgrade Plan */}
                <button
                  onClick={() => {
                    setView('pricing');
                    setIsUserMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors hover:bg-[#0F3D3E]/20 ${
                    (currentView as string) === 'pricing' ? 'text-[#E2DCC8] bg-[#0F3D3E]/30' : 'text-[#cccccc] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Rocket size={15} className="text-[#E2DCC8] shrink-0" />
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
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors hover:bg-[#0F3D3E]/20 ${
                    currentView === 'settings' ? 'text-[#E2DCC8] bg-[#0F3D3E]/30' : 'text-[#cccccc] hover:text-white'
                  }`}
                >
                  <Settings size={15} className="text-[#888888] shrink-0" />
                  <span>Settings</span>
                </button>

                <div className="h-px bg-[#262626] my-1" />

                {/* Logout */}
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
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
                  ? 'bg-[#171616] border-[#0F3D3E] ring-1 ring-[#0F3D3E]/40'
                  : 'bg-[#161616] border-[#262626] hover:bg-[#1a1919] hover:border-[#E2DCC8]/20'
              }`}
              title="Account & Settings"
            >
              <div className="w-8 h-8 bg-[#0F3D3E] border border-[#E2DCC8]/30 rounded-[3px] flex items-center justify-center text-[#F1F1F1] font-heading font-semibold text-sm shrink-0 shadow-sm">
                {user?.avatar || (user?.name ? user.name[0].toUpperCase() : 'U')}
              </div>

              {isSidebarExpanded && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-white truncate leading-snug">{user?.name}</p>
                  <p className="text-[10px] text-[#999999] truncate leading-tight flex items-center gap-1.5 mt-0.5">
                    <Briefcase size={10} className="text-[#E2DCC8] shrink-0" />
                    <span className="truncate">{user?.businessName || user?.email}</span>
                  </p>
                </div>
              )}

              {isSidebarExpanded && (
                <div className="text-[#777777] group-hover:text-white transition-colors pl-1">
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180 text-[#E2DCC8]' : ''}`}
                  />
                </div>
              )}
            </button>
          </div>
        </div>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden bg-[#100F0F]">{renderContent()}</div>
    </div>
  );
};

export default App;