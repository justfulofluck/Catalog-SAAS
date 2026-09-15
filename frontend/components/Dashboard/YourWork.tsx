import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Trash2,
  Edit3,
  Plus,
  LayoutGrid,
  List,
  Search,
  CheckSquare,
  Square,
  MinusSquare,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X
} from 'lucide-react';
import { useStore } from '../../store/useStore';

const YourWork: React.FC = () => {
  const { savedCatalogs, loadCatalog, deleteCatalog, setView, fetchCatalogs, uiTheme, showConfirm, showToast } = useStore();
  const isDark = uiTheme === 'dark';

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  useEffect(() => {
    fetchCatalogs();
  }, [fetchCatalogs]);

  // Filtered catalogs
  const filteredCatalogs = useMemo(() => {
    if (!searchQuery.trim()) return savedCatalogs;
    const query = searchQuery.toLowerCase().trim();
    return savedCatalogs.filter(c => 
      (c.name && c.name.toLowerCase().includes(query)) ||
      String(c.id).toLowerCase().includes(query)
    );
  }, [savedCatalogs, searchQuery]);

  // Reset pagination on filter or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  // Paginated Catalogs
  const totalPages = Math.max(1, Math.ceil(filteredCatalogs.length / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredCatalogs.length);
  const paginatedCatalogs = useMemo(() => {
    return filteredCatalogs.slice(startIndex, endIndex);
  }, [filteredCatalogs, startIndex, endIndex]);

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllCurrentPage = () => {
    const currentPageIds = paginatedCatalogs.map(c => c.id);
    const allSelected = currentPageIds.every(id => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...currentPageIds])));
    }
  };

  const allCurrentPageSelected = paginatedCatalogs.length > 0 && paginatedCatalogs.every(c => selectedIds.includes(c.id));
  const someCurrentPageSelected = paginatedCatalogs.some(c => selectedIds.includes(c.id)) && !allCurrentPageSelected;

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    showConfirm({
      title: 'Delete Selected Catalogs',
      message: `Are you sure you want to permanently delete ${count} selected project${count > 1 ? 's' : ''}? This action cannot be undone.`,
      confirmText: `Delete ${count} Catalog${count > 1 ? 's' : ''}`,
      type: 'danger',
      onConfirm: async () => {
        setIsDeletingBulk(true);
        try {
          for (const id of selectedIds) {
            await deleteCatalog(id);
          }
          setSelectedIds([]);
          showToast(`Successfully deleted ${count} catalog${count > 1 ? 's' : ''}.`, 'success', 'Catalog Deleted', 5000);
        } catch (err) {
          showToast('Failed to delete selected catalogs.', 'error', 'Error', 5000);
        } finally {
          setIsDeletingBulk(false);
        }
      }
    });
  };

  const handleDeleteSingle = (e: React.MouseEvent, id: string, name?: string) => {
    e.stopPropagation();
    const catalogTitle = name ? `"${name}"` : 'this catalog';
    showConfirm({
      title: 'Delete Catalog',
      message: `Are you sure you want to delete ${catalogTitle}? This action cannot be undone.`,
      confirmText: 'Delete Catalog',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteCatalog(id);
          setSelectedIds(prev => prev.filter(item => item !== id));
          showToast(`Catalog ${catalogTitle} deleted successfully.`, 'success', 'Catalog Deleted', 5000);
        } catch (err) {
          showToast('Failed to delete catalog.', 'error', 'Error', 5000);
        }
      }
    });
  };

  const handleLoad = (id: string) => {
    loadCatalog(id);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recent';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Recent';
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (validCurrentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (validCurrentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', validCurrentPage - 1, validCurrentPage, validCurrentPage + 1, '...', totalPages);
      }
    }

    return pages.map((page, index) => {
      if (page === '...') {
        return (
          <span key={`dots-${index}`} className={`px-2 py-1 text-xs font-mono select-none ${isDark ? 'text-[#666]' : 'text-slate-400'}`}>
            ...
          </span>
        );
      }

      const isCurrent = page === validCurrentPage;
      return (
        <button
          key={page}
          onClick={() => setCurrentPage(Number(page))}
          className={`min-w-[28px] h-7 px-2 flex items-center justify-center rounded-[3px] text-xs font-bold font-heading transition-all ${
            isCurrent
              ? 'bg-[#0F3D3E] text-[#F1F1F1] border border-[#E2DCC8]/40 shadow-sm'
              : (isDark
                  ? 'text-[#E2DCC8]/70 hover:text-white hover:bg-[#1a1a1a] border border-transparent'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent')
          }`}
        >
          {page}
        </button>
      );
    });
  };

  return (
    <div className={`flex-1 flex flex-col h-full w-full overflow-hidden animate-in fade-in duration-500 ${
      isDark ? 'bg-[#100F0F] text-[#F1F1F1]' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Header Toolbar */}
      <div className={`px-8 py-4 border-b flex flex-wrap items-center justify-between gap-4 shrink-0 ${
        isDark ? 'bg-[#141414] border-[#E2DCC8]/15' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        {/* Left: Back button & Title */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setView('dashboard')}
            className={`transition-colors p-1.5 rounded-[4px] ${
              isDark ? 'text-[#E2DCC8]/70 hover:text-[#F1F1F1] hover:bg-[#0F3D3E]/30' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className={`text-xl font-semibold tracking-tight font-heading leading-none ${
              isDark ? 'text-[#F1F1F1]' : 'text-slate-900'
            }`}>Your Work</h1>
            <p className={`text-xs font-medium mt-1 ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
              Manage your collection of digital publications and catalogs ({filteredCatalogs.length} projects).
            </p>
          </div>
        </div>

        {/* Right Controls: Search, View Mode, New Project */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          <div className="relative w-64 md:w-80">
            <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#E2DCC8]/50' : 'text-slate-400'}`} />
            <input 
              type="text"
              placeholder="Search by project name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-8 py-2 border rounded-[4px] text-xs outline-none transition-all ${
                isDark 
                  ? 'bg-[#100F0F] border-[#E2DCC8]/20 text-[#F1F1F1] focus:border-[#0F3D3E] focus:ring-1 focus:ring-[#0F3D3E] placeholder:text-[#E2DCC8]/40' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-[#0F3D3E] focus:ring-1 focus:ring-[#0F3D3E]'
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#E2DCC8]/60 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className={`flex items-center border rounded-[4px] p-0.5 ${
            isDark ? 'bg-[#100F0F] border-[#E2DCC8]/20' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-[3px] transition-colors ${
                viewMode === 'list' 
                  ? (isDark ? 'bg-[#0F3D3E] text-white shadow-sm' : 'bg-white text-[#0F3D3E] shadow-sm') 
                  : (isDark ? 'text-[#E2DCC8]/60 hover:text-white' : 'text-slate-500 hover:text-slate-900')
              }`}
              title="List View"
            >
              <List size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-[3px] transition-colors ${
                viewMode === 'grid' 
                  ? (isDark ? 'bg-[#0F3D3E] text-white shadow-sm' : 'bg-white text-[#0F3D3E] shadow-sm') 
                  : (isDark ? 'text-[#E2DCC8]/60 hover:text-white' : 'text-slate-500 hover:text-slate-900')
              }`}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
          </div>

          <button 
            onClick={() => setView('catalog-setup')}
            className="px-4 py-2 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] font-heading font-semibold text-xs uppercase tracking-wider shadow-md shadow-[#0F3D3E]/20 transition-all flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
          >
            <Plus size={14} /> New Project
          </button>
        </div>
      </div>

      {/* Main Full-Height Body with Scrollable Area and Pinned Footer */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0 w-full relative">
        <div className="flex-1 overflow-y-auto custom-scrollbar w-full">
          {filteredCatalogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 text-center px-4">
              <div className={`w-16 h-16 border border-dashed rounded-[4px] flex items-center justify-center mb-4 ${
                isDark ? 'bg-[#171616] border-[#E2DCC8]/20 text-[#E2DCC8]/50' : 'bg-slate-50 border-slate-300 text-slate-400'
              }`}>
                <BookOpen size={32} />
              </div>
              <h3 className={`text-base font-medium font-heading ${isDark ? 'text-[#F1F1F1]' : 'text-slate-800'}`}>
                {searchQuery ? 'No matching projects found' : 'No saved projects yet'}
              </h3>
              <p className={`mt-1 text-xs ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
                {searchQuery ? 'Try clearing your search query.' : 'Start a new design to populate your workspace.'}
              </p>
              {searchQuery ? (
                <button 
                  onClick={() => setSearchQuery('')}
                  className={`mt-4 px-4 py-1.5 rounded-[3px] text-xs font-medium transition-colors ${
                    isDark ? 'bg-[#222222] hover:bg-[#282828] text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                >
                  Clear Search
                </button>
              ) : (
                <button 
                  onClick={() => setView('catalog-setup')}
                  className="mt-4 px-5 py-2 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[3px] text-xs font-heading font-semibold uppercase tracking-wider transition-all"
                >
                  Start Creating
                </button>
              )}
            </div>
          ) : viewMode === 'list' ? (
            /* ================= LIST VIEW (Edge-to-Edge Sticky Table) ================= */
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className={`border-b ${isDark ? 'bg-[#171616] border-[#E2DCC8]/15' : 'bg-slate-100/90 border-slate-200'}`}>
                  <th className="py-3.5 px-8 w-12 text-center">
                    <button
                      type="button"
                      onClick={handleSelectAllCurrentPage}
                      className={`transition-colors ${isDark ? 'text-[#E2DCC8]/70 hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}
                      title={allCurrentPageSelected ? 'Deselect Page' : 'Select Page'}
                    >
                      {allCurrentPageSelected ? (
                        <CheckSquare size={16} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} />
                      ) : someCurrentPageSelected ? (
                        <MinusSquare size={16} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th className={`px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] font-heading ${isDark ? 'text-[#E2DCC8]/70' : 'text-slate-600'}`}>Project Name</th>
                  <th className={`px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] font-heading ${isDark ? 'text-[#E2DCC8]/70' : 'text-slate-600'}`}>ID</th>
                  <th className={`px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] font-heading ${isDark ? 'text-[#E2DCC8]/70' : 'text-slate-600'}`}>Pages</th>
                  <th className={`px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] font-heading ${isDark ? 'text-[#E2DCC8]/70' : 'text-slate-600'}`}>Status</th>
                  <th className={`px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] font-heading ${isDark ? 'text-[#E2DCC8]/70' : 'text-slate-600'}`}>Last Modified</th>
                  <th className={`px-8 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] text-right font-heading ${isDark ? 'text-[#E2DCC8]/70' : 'text-slate-600'}`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-[#E2DCC8]/10 bg-[#121212]' : 'divide-slate-200 bg-white'}`}>
                {paginatedCatalogs.map(catalog => {
                  const isSelected = selectedIds.includes(catalog.id);
                  const cleanId = String(catalog.id).startsWith('cat-') ? String(catalog.id).slice(4) : catalog.id;
                  const isPublished = catalog.status === 'published';

                  return (
                    <tr 
                      key={catalog.id}
                      onClick={() => handleLoad(catalog.id)}
                      className={`group cursor-pointer transition-colors ${
                        isSelected 
                          ? (isDark ? 'bg-[#0F3D3E]/20 hover:bg-[#0F3D3E]/25' : 'bg-teal-50 hover:bg-teal-100/60') 
                          : (isDark ? 'hover:bg-[#1a1919]' : 'hover:bg-slate-50')
                      }`}
                    >
                      {/* Select checkbox */}
                      <td className="py-3 px-8 text-center" onClick={(e) => handleToggleSelect(catalog.id, e)}>
                        <button type="button" className={`transition-colors ${isDark ? 'text-[#777777] group-hover:text-white' : 'text-slate-400 group-hover:text-slate-700'}`}>
                          {isSelected ? (
                            <CheckSquare size={16} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} />
                          ) : (
                            <Square size={16} />
                          )}
                        </button>
                      </td>

                      {/* Project Name + Icon */}
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-[3px] border flex items-center justify-center transition-colors shrink-0 ${
                            isDark ? 'bg-[#171616] border-[#E2DCC8]/15 text-[#E2DCC8]/70 group-hover:text-[#E2DCC8]' : 'bg-slate-100 border-slate-200 text-slate-500 group-hover:text-[#0F3D3E]'
                          }`}>
                            <BookOpen size={16} />
                          </div>
                          <div className="min-w-0">
                            <span className={`text-xs font-semibold transition-colors block truncate font-heading ${
                              isDark ? 'text-[#F1F1F1] group-hover:text-[#E2DCC8]' : 'text-slate-900 group-hover:text-[#0F3D3E]'
                            }`}>
                              {catalog.name || 'Untitled Catalog'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* ID */}
                      <td className={`py-3 px-6 font-mono text-[11px] ${isDark ? 'text-[#E2DCC8]/70' : 'text-slate-500'}`}>
                        #{cleanId}
                      </td>

                      {/* Pages count */}
                      <td className={`py-3 px-6 ${isDark ? 'text-[#cccccc]' : 'text-slate-600'}`}>
                        <div className="flex items-center gap-1.5">
                          <LayoutGrid size={13} className={isDark ? "text-[#E2DCC8]/50" : "text-slate-400"} />
                          <span className="text-xs font-medium">{catalog.pages?.length || 0}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-6">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-[3px] text-[10px] font-bold uppercase tracking-wider border font-heading ${
                          isPublished 
                            ? (isDark ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-700 border-emerald-200') 
                            : (isDark ? 'bg-[#1c1c1c] text-[#888888] border-[#2c2c2c]' : 'bg-slate-100 text-slate-600 border-slate-200')
                        }`}>
                          {isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>

                      {/* Last Modified */}
                      <td className={`py-3 px-6 text-[11px] ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className={isDark ? "text-[#E2DCC8]/40" : "text-slate-400"} />
                          <span>{formatDate(catalog.updatedAt || catalog.created_at)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-8 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleLoad(catalog.id)}
                            className={`p-1.5 rounded-[4px] border border-transparent transition-all ${
                              isDark ? 'text-[#E2DCC8]/70 hover:text-[#F1F1F1] hover:bg-[#0F3D3E]/30 hover:border-[#E2DCC8]/20' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 hover:border-slate-200'
                            }`}
                            title="Edit in Designer"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteSingle(e, catalog.id, catalog.name)}
                            className={`p-1.5 rounded-[4px] border border-transparent transition-all ${
                              isDark ? 'text-[#E2DCC8]/70 hover:text-red-400 hover:bg-[#100F0F] hover:border-red-500/30' : 'text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200'
                            }`}
                            title="Delete Project"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            /* ================= GRID VIEW ================= */
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedCatalogs.map(catalog => {
                const isSelected = selectedIds.includes(catalog.id);
                const cleanId = String(catalog.id).startsWith('cat-') ? String(catalog.id).slice(4) : catalog.id;
                const isPublished = catalog.status === 'published';

                return (
                  <div
                    key={catalog.id}
                    onClick={() => handleLoad(catalog.id)}
                    className={`group relative rounded-[4px] border transition-all duration-200 cursor-pointer flex flex-col overflow-hidden ${
                      isSelected 
                        ? (isDark ? 'bg-[#141414] border-[#0F3D3E] ring-1 ring-[#0F3D3E]' : 'bg-white border-[#0F3D3E] ring-1 ring-[#0F3D3E]') 
                        : (isDark ? 'bg-[#141414] border-[#222222] hover:border-[#E2DCC8]/30 hover:shadow-xl' : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-lg')
                    }`}
                  >
                    {/* Checkbox top left */}
                    <div className="absolute top-3 left-3 z-20" onClick={(e) => handleToggleSelect(catalog.id, e)}>
                      <button 
                        type="button" 
                        className={`p-1 backdrop-blur rounded-[2px] border transition-colors ${
                          isDark ? 'bg-[#161616]/80 border-[#262626] text-[#777777] hover:text-white' : 'bg-white/80 border-slate-300 text-slate-400 hover:text-slate-800'
                        }`}
                      >
                        {isSelected ? (
                          <CheckSquare size={15} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} />
                        ) : (
                          <Square size={15} />
                        )}
                      </button>
                    </div>

                    {/* Delete Button top right */}
                    <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => handleDeleteSingle(e, catalog.id, catalog.name)}
                        className={`p-1.5 backdrop-blur text-red-500 rounded-[3px] border transition-colors ${
                          isDark ? 'bg-[#161616]/90 hover:bg-red-500/20 border-[#262626]' : 'bg-white/90 hover:bg-red-50 border-slate-200'
                        }`}
                        title="Delete Project"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Preview Area */}
                    <div className={`aspect-[16/10] border-b relative p-6 flex items-center justify-center transition-colors ${
                      isDark ? 'bg-[#100F0F] border-[#E2DCC8]/15 group-hover:bg-[#121212]' : 'bg-slate-50 border-slate-100 group-hover:bg-slate-100/50'
                    }`}>
                      <div className={`w-3/4 h-full rounded-[3px] border flex flex-col p-3 gap-2 opacity-90 group-hover:scale-105 transition-transform duration-200 ${
                        isDark ? 'bg-[#171616] border-[#E2DCC8]/15' : 'bg-white border-slate-200 shadow-sm'
                      }`}>
                        <div className={`h-2 w-2/3 rounded-sm ${isDark ? 'bg-[#262626]' : 'bg-slate-200'}`} />
                        <div className={`h-16 rounded-[2px] w-full mt-1 border ${isDark ? 'bg-[#100F0F] border-[#262626]' : 'bg-slate-50 border-slate-100'}`} />
                        <div className={`h-1.5 w-full rounded-sm mt-auto ${isDark ? 'bg-[#262626]' : 'bg-slate-200'}`} />
                      </div>
                    </div>

                    {/* Info Area */}
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0 pr-2">
                          <h3 className={`text-sm font-semibold font-heading leading-tight transition-colors truncate mb-1 ${
                            isDark ? 'text-white group-hover:text-[#E2DCC8]' : 'text-slate-800 group-hover:text-[#0F3D3E]'
                          }`}>
                            {catalog.name || 'Untitled Catalog'}
                          </h3>
                          <p className={`text-[10px] font-mono uppercase ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-400'}`}>ID: #{cleanId}</p>
                        </div>
                        <div className={`w-7 h-7 rounded-[3px] border flex items-center justify-center transition-colors shrink-0 ${
                          isDark ? 'bg-[#100F0F] border-[#E2DCC8]/15 text-[#E2DCC8]/70 group-hover:bg-[#0F3D3E] group-hover:text-white group-hover:border-[#0F3D3E]' : 'bg-slate-100 border-slate-200 text-slate-500 group-hover:bg-[#0F3D3E] group-hover:text-white group-hover:border-[#0F3D3E]'
                        }`}>
                          <Edit3 size={13} />
                        </div>
                      </div>
                      
                      <div className={`mt-auto flex items-center justify-between pt-3 border-t text-[11px] ${
                        isDark ? 'border-[#E2DCC8]/10 text-[#E2DCC8]/60' : 'border-slate-100 text-slate-500'
                      }`}>
                        <div className="flex items-center gap-1.5">
                          <LayoutGrid size={13} />
                          <span>{catalog.pages?.length || 0} Pages</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} />
                          <span>{formatDate(catalog.updatedAt || catalog.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Floating Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className={`fixed bottom-16 left-1/2 -translate-x-1/2 px-6 py-3 rounded-[4px] shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-[100] flex items-center gap-6 border animate-in slide-in-from-bottom-8 ${
            isDark ? 'bg-[#161616] text-white border-[#262626]' : 'bg-white text-slate-900 border-slate-200 shadow-2xl'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[#0F3D3E] rounded-[3px] flex items-center justify-center font-bold text-xs text-white">
                {selectedIds.length}
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-[#cccccc]' : 'text-slate-700'}`}>Projects Selected</span>
            </div>
            <div className={`w-px h-5 ${isDark ? 'bg-[#262626]' : 'bg-slate-200'}`} />
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedIds([])}
                className={`text-[10px] font-bold uppercase tracking-widest transition-colors ${
                  isDark ? 'text-[#888888] hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isDeletingBulk}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-[3px] text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-1.5 shadow-lg shadow-red-600/20 disabled:opacity-50"
              >
                <Trash2 size={13} /> {isDeletingBulk ? 'Deleting...' : 'Delete Selected'}
              </button>
            </div>
          </div>
        )}

        {/* Pinned Bottom Pagination Footer Bar */}
        {filteredCatalogs.length > 0 && (
          <div className={`px-8 py-3.5 border-t flex flex-wrap items-center justify-between gap-4 shrink-0 z-20 ${
            isDark ? 'bg-[#141414] border-[#E2DCC8]/15' : 'bg-white border-slate-200 shadow-inner'
          }`}>
            {/* Left: Range and Per-page select */}
            <div className="flex items-center gap-4">
              <p className={`text-xs font-medium ${isDark ? 'text-[#E2DCC8]/70' : 'text-slate-600'}`}>
                Showing <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{filteredCatalogs.length === 0 ? 0 : startIndex + 1}</span> to{' '}
                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{endIndex}</span> of{' '}
                <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{filteredCatalogs.length}</span> projects
              </p>

              <div className="flex items-center gap-1.5 text-xs">
                <span className={isDark ? 'text-[#888]' : 'text-slate-500'}>Per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className={`border rounded px-2 py-1 text-xs font-semibold outline-none transition-colors ${
                    isDark 
                      ? 'bg-[#1c1c1c] border-[#2a2a2a] text-white focus:border-[#0F3D3E]' 
                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:border-[#0F3D3E]'
                  }`}
                >
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>

            {/* Right: Navigation Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={validCurrentPage === 1}
                className={`p-1.5 rounded-[4px] border transition-all ${
                  validCurrentPage === 1
                    ? 'opacity-30 cursor-not-allowed border-transparent'
                    : (isDark ? 'border-[#E2DCC8]/15 hover:bg-[#1e1e1e] text-[#E2DCC8]' : 'border-slate-200 hover:bg-slate-100 text-slate-700')
                }`}
                title="First Page"
              >
                <ChevronsLeft size={14} />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={validCurrentPage === 1}
                className={`flex items-center gap-1 px-3 py-1 rounded-[4px] border text-xs font-bold font-heading transition-all ${
                  validCurrentPage === 1
                    ? 'opacity-30 cursor-not-allowed border-transparent'
                    : (isDark ? 'border-[#E2DCC8]/15 hover:bg-[#1e1e1e] text-[#E2DCC8]' : 'border-slate-200 hover:bg-slate-100 text-slate-700')
                }`}
              >
                <ChevronLeft size={13} /> Prev
              </button>

              <div className="flex items-center gap-1 mx-1.5">
                {renderPageNumbers()}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={validCurrentPage >= totalPages}
                className={`flex items-center gap-1 px-3 py-1 rounded-[4px] border text-xs font-bold font-heading transition-all ${
                  validCurrentPage >= totalPages
                    ? 'opacity-30 cursor-not-allowed border-transparent'
                    : (isDark ? 'border-[#E2DCC8]/15 hover:bg-[#1e1e1e] text-[#E2DCC8]' : 'border-slate-200 hover:bg-slate-100 text-slate-700')
                }`}
              >
                Next <ChevronRight size={13} />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={validCurrentPage >= totalPages}
                className={`p-1.5 rounded-[4px] border transition-all ${
                  validCurrentPage >= totalPages
                    ? 'opacity-30 cursor-not-allowed border-transparent'
                    : (isDark ? 'border-[#E2DCC8]/15 hover:bg-[#1e1e1e] text-[#E2DCC8]' : 'border-slate-200 hover:bg-slate-100 text-slate-700')
                }`}
                title="Last Page"
              >
                <ChevronsRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YourWork;
