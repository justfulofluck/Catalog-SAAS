import React, { useState, useMemo } from 'react';
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
  Copy,
  ExternalLink,
  SlidersHorizontal,
  FolderOpen
} from 'lucide-react';
import { useStore } from '../../store/useStore';

const YourWork: React.FC = () => {
  const { savedCatalogs, loadCatalog, deleteCatalog, setView, fetchCatalogs, openPublicViewer } = useStore();

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);

  React.useEffect(() => {
    fetchCatalogs();
  }, [fetchCatalogs]);

  // Filtered catalogs
  const filteredCatalogs = useMemo(() => {
    return savedCatalogs.filter(catalog => {
      const nameMatch = (catalog.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      const idMatch = String(catalog.id).toLowerCase().includes(searchQuery.toLowerCase());
      return nameMatch || idMatch;
    });
  }, [savedCatalogs, searchQuery]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredCatalogs.length / pageSize));
  
  // Reset page if out of bounds after filtering
  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedCatalogs = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredCatalogs.slice(startIndex, startIndex + pageSize);
  }, [filteredCatalogs, currentPage, pageSize]);

  // Selection handlers
  const allCurrentPageSelected = paginatedCatalogs.length > 0 && paginatedCatalogs.every(c => selectedIds.includes(c.id));
  const someCurrentPageSelected = paginatedCatalogs.some(c => selectedIds.includes(c.id)) && !allCurrentPageSelected;

  const handleSelectAllCurrentPage = () => {
    if (allCurrentPageSelected) {
      const pageIds = new Set(paginatedCatalogs.map(c => c.id));
      setSelectedIds(prev => prev.filter(id => !pageIds.has(id)));
    } else {
      const pageIds = paginatedCatalogs.map(c => c.id);
      setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleLoad = (id: string) => {
    loadCatalog(id);
  };

  const handleDeleteSingle = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      deleteCatalog(id);
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    if (confirm(`Are you sure you want to delete ${count} selected project${count > 1 ? 's' : ''}? This action cannot be undone.`)) {
      setIsDeletingBulk(true);
      try {
        for (const id of selectedIds) {
          await deleteCatalog(id);
        }
        setSelectedIds([]);
      } catch (err) {
        console.error('Error during bulk delete', err);
      } finally {
        setIsDeletingBulk(false);
      }
    }
  };

  const formatDate = (dateValue: any) => {
    if (!dateValue) return 'Recently';
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#100F0F] text-white animate-in fade-in duration-300">
      {/* Single Line Header & Toolbar */}
      <div className="px-6 py-4 bg-[#161616] border-b border-[#262626] flex flex-wrap items-center justify-between gap-4 shrink-0">
        {/* Left: Back button & Title */}
        <div className="flex flex-col min-w-[200px]">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setView('dashboard')}
              className="text-[#888888] hover:text-[#E2DCC8] transition-colors p-1 -ml-1 rounded-[3px] hover:bg-[#222222]"
              title="Back to Dashboard"
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className="text-xl font-semibold text-white tracking-tight leading-none font-heading">Your Work</h1>
          </div>
          <p className="text-xs text-[#888888] font-normal mt-1 ml-7">Manage your collection of digital publications and catalogs.</p>
        </div>

        {/* Right Controls: Search, View Mode, Page Size, New Project */}
        <div className="flex items-center gap-2.5 shrink-0 ml-auto">
          <div className="relative w-64 md:w-80">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#777777]" />
            <input 
              type="text"
              placeholder="Search by project name or ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 bg-[#121212] border border-[#262626] rounded-[4px] text-xs text-white placeholder-[#666666] focus:outline-none focus:border-[#0F3D3E] transition-colors"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-[#121212] border border-[#262626] rounded-[4px] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-[3px] transition-colors ${viewMode === 'list' ? 'bg-[#222222] text-[#E2DCC8]' : 'text-[#777777] hover:text-white'}`}
              title="List View"
            >
              <List size={15} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-[3px] transition-colors ${viewMode === 'grid' ? 'bg-[#222222] text-[#E2DCC8]' : 'text-[#777777] hover:text-white'}`}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
          </div>

          {/* Page size select */}
          <div className="flex items-center gap-1.5 text-xs text-[#777777] pl-2 border-l border-[#262626]">
            <span className="text-[11px]">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-[#121212] border border-[#262626] text-white text-xs rounded-[4px] px-2 py-1 focus:outline-none focus:border-[#0F3D3E]"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <button 
            onClick={() => setView('catalog-setup')}
            className="px-4 py-2 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] font-heading font-semibold text-xs uppercase tracking-wider shadow-md shadow-[#0F3D3E]/20 transition-all flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
          >
            <Plus size={14} /> New Project
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">

        {/* Multi-Select Floating Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between bg-[#1f1a18] border border-[#0F3D3E]/40 rounded-[4px] px-4 py-2.5 animate-in fade-in slide-in-from-top-2 duration-200 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-[2px] bg-[#0F3D3E] text-white flex items-center justify-center text-[10px] font-bold">
                  {selectedIds.length}
                </span>
                <span>Project{selectedIds.length > 1 ? 's' : ''} Selected</span>
              </span>
              <button
                onClick={() => setSelectedIds([])}
                className="text-[11px] text-[#999999] hover:text-white underline ml-1"
              >
                Deselect All
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkDelete}
                disabled={isDeletingBulk}
                className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-[3px] text-xs font-medium transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Trash2 size={13} />
                <span>{isDeletingBulk ? 'Deleting...' : `Delete Selected (${selectedIds.length})`}</span>
              </button>
            </div>
          </div>
        )}

        {/* Projects Content: Empty State / List View / Grid View */}
        {filteredCatalogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-[#161616] rounded-[4px] border border-dashed border-[#262626]">
            <div className="w-12 h-12 bg-[#1c1c1c] border border-[#262626] rounded-[4px] flex items-center justify-center mb-3 text-[#777777]">
              <BookOpen size={24} />
            </div>
            <h3 className="text-base font-medium text-white font-heading">
              {searchQuery ? 'No matching projects found' : 'No saved projects yet'}
            </h3>
            <p className="text-[#777777] mt-1 text-xs">
              {searchQuery ? 'Try clearing your search query.' : 'Start a new design to populate your workspace.'}
            </p>
            {searchQuery ? (
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-4 px-4 py-1.5 bg-[#222222] hover:bg-[#282828] text-white rounded-[3px] text-xs font-medium transition-colors"
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
          /* ================= LIST VIEW (Requested) ================= */
          <div className="bg-[#161616] rounded-[4px] border border-[#262626] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#262626] bg-[#121212] text-[10px] font-bold text-[#777777] uppercase tracking-wider">
                    <th className="py-3 px-4 w-10 text-center">
                      <button
                        type="button"
                        onClick={handleSelectAllCurrentPage}
                        className="text-[#777777] hover:text-white transition-colors"
                        title={allCurrentPageSelected ? 'Deselect Page' : 'Select Page'}
                      >
                        {allCurrentPageSelected ? (
                          <CheckSquare size={16} className="text-[#E2DCC8]" />
                        ) : someCurrentPageSelected ? (
                          <MinusSquare size={16} className="text-[#E2DCC8]" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </th>
                    <th className="py-3 px-4">Project Name</th>
                    <th className="py-3 px-4">ID</th>
                    <th className="py-3 px-4">Pages</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Modified</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222222] text-xs">
                  {paginatedCatalogs.map(catalog => {
                    const isSelected = selectedIds.includes(catalog.id);
                    const cleanId = String(catalog.id).startsWith('cat-') ? String(catalog.id).slice(4) : catalog.id;
                    const isPublished = catalog.status === 'published';

                    return (
                      <tr 
                        key={catalog.id}
                        onClick={() => handleLoad(catalog.id)}
                        className={`group cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#0F3D3E]/5 hover:bg-[#0F3D3E]/10' : 'hover:bg-[#1c1c1c]'
                        }`}
                      >
                        {/* Select checkbox */}
                        <td className="py-3 px-4 text-center" onClick={(e) => handleToggleSelect(catalog.id, e)}>
                          <button type="button" className="text-[#777777] group-hover:text-white transition-colors">
                            {isSelected ? (
                              <CheckSquare size={15} className="text-[#E2DCC8]" />
                            ) : (
                              <Square size={15} />
                            )}
                          </button>
                        </td>

                        {/* Project Name + Icon */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-[3px] bg-[#121212] border border-[#262626] flex items-center justify-center text-[#777777] group-hover:text-[#E2DCC8] group-hover:border-[#0F3D3E]/40 transition-colors shrink-0">
                              <BookOpen size={14} />
                            </div>
                            <div className="min-w-0">
                              <span className="font-semibold text-white group-hover:text-[#E2DCC8] transition-colors block truncate">
                                {catalog.name || 'Untitled Catalog'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* ID */}
                        <td className="py-3 px-4 font-mono text-[#888888] text-[11px]">
                          #{cleanId}
                        </td>

                        {/* Pages count */}
                        <td className="py-3 px-4 text-[#cccccc]">
                          <div className="flex items-center gap-1.5">
                            <LayoutGrid size={13} className="text-[#777777]" />
                            <span>{catalog.pages?.length || 0}</span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-[2px] text-[10px] font-bold uppercase tracking-wider border ${
                            isPublished 
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40' 
                              : 'bg-[#222222] text-[#888888] border-[#333333]'
                          }`}>
                            {isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>

                        {/* Last Modified */}
                        <td className="py-3 px-4 text-[#888888] text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} className="text-[#666666]" />
                            <span>{formatDate(catalog.updatedAt || catalog.created_at)}</span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleLoad(catalog.id)}
                              className="p-1.5 hover:bg-[#222222] text-[#999999] hover:text-white rounded-[3px] transition-colors"
                              title="Edit in Designer"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={(e) => handleDeleteSingle(e, catalog.id)}
                              className="p-1.5 hover:bg-red-500/10 text-[#999999] hover:text-red-400 rounded-[3px] transition-colors"
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
            </div>
          </div>
        ) : (
          /* ================= GRID VIEW ================= */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedCatalogs.map(catalog => {
              const isSelected = selectedIds.includes(catalog.id);
              const cleanId = String(catalog.id).startsWith('cat-') ? String(catalog.id).slice(4) : catalog.id;

              return (
                <div 
                  key={catalog.id} 
                  onClick={() => handleLoad(catalog.id)}
                  className={`group bg-[#161616] rounded-[4px] border transition-all cursor-pointer overflow-hidden flex flex-col h-full relative ${
                    isSelected ? 'border-[#0F3D3E] bg-[#0F3D3E]/5' : 'border-[#262626] hover:border-[#0F3D3E]/50'
                  }`}
                >
                  {/* Select Checkbox at top left */}
                  <div 
                    className="absolute top-3 left-3 z-20"
                    onClick={(e) => handleToggleSelect(catalog.id, e)}
                  >
                    <button 
                      type="button" 
                      className="p-1 bg-[#161616]/80 backdrop-blur rounded-[2px] border border-[#262626] text-[#777777] hover:text-white transition-colors"
                    >
                      {isSelected ? (
                        <CheckSquare size={15} className="text-[#E2DCC8]" />
                      ) : (
                        <Square size={15} />
                      )}
                    </button>
                  </div>

                  {/* Delete Button top right */}
                  <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => handleDeleteSingle(e, catalog.id)}
                      className="p-1.5 bg-[#161616]/90 backdrop-blur text-red-400 hover:bg-red-500/20 rounded-[3px] border border-[#262626] transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Preview Area */}
                  <div className="aspect-[16/10] bg-[#121212] border-b border-[#262626] relative p-6 flex items-center justify-center group-hover:bg-[#141414] transition-colors">
                    <div className="w-3/4 h-full bg-[#1c1c1c] rounded-[3px] border border-[#262626] flex flex-col p-3 gap-2 opacity-90 group-hover:scale-105 transition-transform duration-200">
                      <div className="h-2 w-2/3 bg-[#262626] rounded-sm" />
                      <div className="h-20 bg-[#141414] rounded-[2px] w-full mt-1 border border-[#262626]" />
                      <div className="h-1.5 w-full bg-[#262626] rounded-sm mt-auto" />
                    </div>
                  </div>

                  {/* Info Area */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div className="min-w-0 pr-2">
                        <h3 className="text-sm font-semibold text-white font-heading leading-tight group-hover:text-[#E2DCC8] transition-colors truncate mb-1">
                          {catalog.name || 'Untitled Catalog'}
                        </h3>
                        <p className="text-[10px] font-mono text-[#777777] uppercase">ID: #{cleanId}</p>
                      </div>
                      <div className="w-7 h-7 rounded-[3px] bg-[#121212] border border-[#262626] flex items-center justify-center text-[#777777] group-hover:bg-[#0F3D3E] group-hover:text-white group-hover:border-[#0F3D3E] transition-colors shrink-0">
                        <Edit3 size={13} />
                      </div>
                    </div>
                    
                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-[#262626] text-[#777777] text-[11px]">
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

        {/* Pagination Bar */}
        {filteredCatalogs.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#161616] px-4 py-3 rounded-[4px] border border-[#262626] text-xs text-[#888888]">
            <div className="flex items-center gap-2">
              <span>
                Showing <strong className="text-white">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
                <strong className="text-white">
                  {Math.min(currentPage * pageSize, filteredCatalogs.length)}
                </strong>{' '}
                of <strong className="text-white">{filteredCatalogs.length}</strong> project{filteredCatalogs.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-[3px] hover:bg-[#222222] hover:text-white text-[#777777] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#777777] transition-colors"
                title="First Page"
              >
                <ChevronsLeft size={15} />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-[3px] hover:bg-[#222222] hover:text-white text-[#777777] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#777777] transition-colors"
                title="Previous Page"
              >
                <ChevronLeft size={15} />
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show current page, first, last, and 1 adjacent
                    return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                  })
                  .map((page, idx, arr) => {
                    const prevPage = arr[idx - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

                    return (
                      <React.Fragment key={page}>
                        {showEllipsis && <span className="px-1 text-[#555555]">...</span>}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`min-w-7 h-7 px-2 flex items-center justify-center rounded-[3px] text-xs font-semibold transition-colors ${
                            currentPage === page
                              ? 'bg-[#0F3D3E] text-white'
                              : 'bg-[#121212] border border-[#262626] text-[#888888] hover:text-white hover:border-[#3a3a3a]'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-[3px] hover:bg-[#222222] hover:text-white text-[#777777] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#777777] transition-colors"
                title="Next Page"
              >
                <ChevronRight size={15} />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-[3px] hover:bg-[#222222] hover:text-white text-[#777777] disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#777777] transition-colors"
                title="Last Page"
              >
                <ChevronsRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YourWork;
