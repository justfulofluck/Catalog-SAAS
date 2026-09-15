import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Images,
  Upload,
  Search,
  Trash2,
  FileImage,
  LayoutGrid,
  List,
  X,
  Check,
  CheckSquare,
  Square
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { MediaItem } from '../../types';

const MediaLibraryView: React.FC = () => {
  const { mediaItems, removeMedia, removeMediaBatch, addMedia, fetchMedia, fetchCategories, fetchProducts, categories, products, uiTheme, showConfirm, showToast } = useStore();
  const isDark = uiTheme === 'dark';
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMedia();
    fetchCategories();
    fetchProducts();
  }, [fetchMedia, fetchCategories, fetchProducts]);

  // Aggregate mediaItems with any category and product images so all workspace assets are visible in Media Library
  const allMediaItems = useMemo(() => {
    const existingUrls = new Set<string>();
    const combined: MediaItem[] = [];

    // 1. First add regular mediaItems
    mediaItems.forEach(m => {
      if (m.url && !existingUrls.has(m.url)) {
        existingUrls.add(m.url);
        combined.push(m);
      }
    });

    // 2. Add category images
    categories.forEach(c => {
      const catImages = [c.thumbnail, ...(c.images || [])].filter(Boolean) as string[];
      catImages.forEach((url, idx) => {
        if (url && !existingUrls.has(url)) {
          existingUrls.add(url);
          combined.push({
            id: `cat-${c.id}-${idx}`,
            name: `${c.name} (Category Image)`,
            type: 'image',
            url,
            createdAt: new Date().toISOString(),
            size: 'Media Asset'
          });
        }
      });
    });

    // 3. Add product images
    products.forEach(p => {
      const prodImages = [p.image, ...(p.images || [])].filter(Boolean) as string[];
      prodImages.forEach((url, idx) => {
        if (url && !existingUrls.has(url)) {
          existingUrls.add(url);
          combined.push({
            id: `prod-${p.id}-${idx}`,
            name: `${p.name} (Product Image)`,
            type: 'image',
            url,
            createdAt: new Date().toISOString(),
            size: 'Media Asset'
          });
        }
      });
    });

    return combined;
  }, [mediaItems, categories, products]);

  const filteredItems = allMediaItems.filter(item => {
    return item.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const toggleSelection = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(item => item.id));
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    showConfirm({
      title: 'Remove Image',
      message: 'Are you sure you want to permanently remove this image from the Media Library?',
      confirmText: 'Remove Image',
      type: 'danger',
      onConfirm: async () => {
        try {
          await removeMedia(id);
          setSelectedIds(prev => prev.filter(i => i !== id));
          showToast('Image removed from library.', 'success', 'Media Removed', 5000);
        } catch (err) {
          showToast('Failed to remove image.', 'error', 'Error', 5000);
        }
      }
    });
  };

  const handleBulkDelete = () => {
    const count = selectedIds.length;
    if (count === 0) return;
    showConfirm({
      title: 'Delete Selected Media',
      message: `Are you sure you want to delete ${count} selected media asset${count > 1 ? 's' : ''}?`,
      confirmText: `Delete ${count} Item${count > 1 ? 's' : ''}`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await removeMediaBatch(selectedIds);
          setSelectedIds([]);
          showToast(`Successfully removed ${count} media asset${count > 1 ? 's' : ''}.`, 'success', 'Media Deleted', 5000);
        } catch (err) {
          showToast('Failed to delete selected media assets.', 'error', 'Error', 5000);
        }
      }
    });
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      try {
        await addMedia(file);
      } catch (error) {
        console.error("Upload failed for file:", file.name);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`flex-1 flex flex-col h-full w-full overflow-hidden animate-in fade-in duration-500 relative ${
      isDark ? 'bg-[#100F0F] text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Single Line Header & Toolbar */}
      <div className={`px-8 py-4 border-b flex flex-wrap items-center justify-between gap-4 shrink-0 ${
        isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        {/* Title and Subtitle */}
        <div className="flex flex-col min-w-[200px]">
          <h1 className={`font-space text-xl font-bold tracking-tight leading-none ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>Media Library</h1>
          <p className={`text-xs font-medium mt-1 ${
            isDark ? 'text-[#888888]' : 'text-slate-500'
          }`}>Global repository for high-fidelity brand and category imagery ({allMediaItems.length} assets).</p>
        </div>

        {/* Right Controls: Search, Select All, View Toggle & Upload Button */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          <div className="relative w-64 md:w-80">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${
              isDark ? 'text-[#666666]' : 'text-slate-400'
            }`} size={14} />
            <input
              type="text"
              placeholder="Search media by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full border rounded-[4px] pl-9 pr-3 py-1.5 text-xs outline-none transition-all ${
                isDark 
                  ? 'bg-[#121212] border-[#262626] text-white placeholder-[#666666] focus:border-[#0F3D3E]' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:border-[#0F3D3E]'
              }`}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#666] hover:text-white' : 'text-slate-400 hover:text-slate-700'}`}>
                <X size={12} />
              </button>
            )}
          </div>

          <button
            onClick={handleSelectAll}
            className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-[4px] transition-colors whitespace-nowrap border ${
              isDark 
                ? 'text-[#888888] hover:text-[#E2DCC8] bg-[#121212] border-[#262626] hover:border-[#3a3a3a]' 
                : 'text-slate-600 hover:text-slate-900 bg-slate-100 border-slate-200 hover:border-slate-300'
            }`}
          >
            {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? 'Deselect All' : 'Select All'}
          </button>

          {/* Right: View switcher & Upload Button */}
          <div className="flex items-center gap-3 shrink-0">
            <div className={`flex items-center border rounded-[4px] p-0.5 ${
              isDark ? 'bg-[#121212] border-[#262626]' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-[3px] transition-all ${
                  viewMode === 'grid' 
                    ? (isDark ? 'bg-[#222222] text-[#E2DCC8]' : 'bg-white text-[#0F3D3E] shadow-sm') 
                    : (isDark ? 'text-[#666666] hover:text-white' : 'text-slate-400 hover:text-slate-700')
                }`}
                title="Grid view"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-[3px] transition-all ${
                  viewMode === 'list' 
                    ? (isDark ? 'bg-[#222222] text-[#E2DCC8]' : 'bg-white text-[#0F3D3E] shadow-sm') 
                    : (isDark ? 'text-[#666666] hover:text-white' : 'text-slate-400 hover:text-slate-700')
                }`}
                title="List view"
              >
                <List size={15} />
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              multiple
              onChange={handleFileUpload}
            />
            <button
              onClick={handleUploadClick}
              className="px-4 py-2 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] font-bold text-xs uppercase tracking-wider shadow-md shadow-[#0F3D3E]/20 transition-all flex items-center gap-2 active:scale-95 whitespace-nowrap"
            >
              <Upload size={14} /> Upload Media
            </button>
          </div>
        </div>
      </div>

      {/* Media Grid/List (Edge to Edge, Scrollable) */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar pb-24">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div className={`w-20 h-20 rounded-[4px] flex items-center justify-center mb-6 border ${
              isDark ? 'bg-[#161616] border-[#262626] text-[#666666]' : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}>
              <Images size={40} />
            </div>
            <h3 className={`font-space text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>No images found</h3>
            <p className={`text-sm font-medium mt-1 mb-6 ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>Your Media library is currently empty.</p>
            <button
              onClick={handleUploadClick}
              className="px-6 py-3 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#0F3D3E]/20 transition-all flex items-center gap-2"
            >
              <Upload size={16} /> Upload Images Now
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {filteredItems.map(item => (
              <div
                key={item.id}
                onClick={() => toggleSelection(item.id)}
                className={`group rounded-[4px] border transition-all overflow-hidden relative cursor-pointer ${
                  selectedIds.includes(item.id) 
                    ? 'border-[#0F3D3E] ring-2 ring-[#0F3D3E]/30 shadow-xl' 
                    : (isDark ? 'bg-[#161616] border-[#262626] hover:border-[#3a3a3a] hover:-translate-y-1' : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-1')
                }`}
              >
                <div className={`aspect-square relative overflow-hidden ${isDark ? 'bg-[#121212]' : 'bg-slate-100'}`}>
                  <img src={item.thumbnailUrl || item.url} className="w-full h-full object-cover" alt={item.name} />

                  {/* Selection Overlay */}
                  <div className={`absolute top-2.5 left-2.5 w-5 h-5 rounded-[3px] flex items-center justify-center transition-all z-10 ${
                    selectedIds.includes(item.id) 
                      ? 'bg-[#0F3D3E] text-white shadow-lg' 
                      : 'bg-black/60 text-transparent border border-white/20 group-hover:bg-[#1c1c1c] group-hover:text-[#E2DCC8]'
                  }`}>
                    <Check size={12} />
                  </div>

                  <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 text-white">
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-2.5 bg-red-600/80 hover:bg-red-600 rounded-full backdrop-blur-md transition-all text-white"
                      title="Delete image"
                    >
                      <Trash2 size={16} />
                    </button>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#cccccc]">Remove</span>
                  </div>
                </div>

                <div className={`p-3 border-t ${
                  isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200'
                }`}>
                  <h4 className={`text-xs font-bold truncate mb-1 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>{item.name}</h4>
                  <div className="flex items-center justify-between">
                    <div className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider ${
                      isDark ? 'text-[#888888]' : 'text-slate-500'
                    }`}>
                      <FileImage size={10} /> image
                    </div>
                    <span className={`text-[9px] font-mono ${
                      isDark ? 'text-[#666666]' : 'text-slate-400'
                    }`}>{item.size}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`rounded-[4px] border overflow-hidden shadow-sm ${
            isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <table className="w-full text-left">
              <thead className={`border-b ${
                isDark ? 'bg-[#121212] border-[#262626]' : 'bg-slate-50 border-slate-200'
              }`}>
                <tr>
                  <th className={`px-6 py-3.5 w-12 text-[10px] font-bold uppercase tracking-widest ${
                    isDark ? 'text-[#888888]' : 'text-slate-500'
                  }`}>
                    <button onClick={handleSelectAll} className="p-1 transition-colors">
                      {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? (
                        <CheckSquare size={16} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} />
                      ) : (
                        <Square size={16} className={isDark ? "text-[#666666]" : "text-slate-400"} />
                      )}
                    </button>
                  </th>
                  <th className={`px-6 py-3.5 text-[10px] font-bold uppercase tracking-widest ${
                    isDark ? 'text-[#888888]' : 'text-slate-500'
                  }`}>Preview</th>
                  <th className={`px-6 py-3.5 text-[10px] font-bold uppercase tracking-widest ${
                    isDark ? 'text-[#888888]' : 'text-slate-500'
                  }`}>Name</th>
                  <th className={`px-6 py-3.5 text-[10px] font-bold uppercase tracking-widest ${
                    isDark ? 'text-[#888888]' : 'text-slate-500'
                  }`}>Type</th>
                  <th className={`px-6 py-3.5 text-[10px] font-bold uppercase tracking-widest ${
                    isDark ? 'text-[#888888]' : 'text-slate-500'
                  }`}>Size</th>
                  <th className={`px-6 py-3.5 text-[10px] font-bold uppercase tracking-widest text-right ${
                    isDark ? 'text-[#888888]' : 'text-slate-500'
                  }`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-[#262626]' : 'divide-slate-200'}`}>
                {filteredItems.map(item => (
                  <tr
                    key={item.id}
                    onClick={() => toggleSelection(item.id)}
                    className={`transition-colors cursor-pointer ${
                      isDark 
                        ? (selectedIds.includes(item.id) ? 'bg-[#0F3D3E]/10 hover:bg-[#0F3D3E]/20' : 'hover:bg-[#1c1c1c]') 
                        : (selectedIds.includes(item.id) ? 'bg-[#0F3D3E]/10 hover:bg-[#0F3D3E]/15' : 'hover:bg-slate-50')
                    }`}
                  >
                    <td className="px-6 py-3">
                      <div className={`p-1 ${selectedIds.includes(item.id) ? (isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]') : (isDark ? 'text-[#666666]' : 'text-slate-400')}`}>
                        {selectedIds.includes(item.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className={`w-11 h-11 rounded-[4px] overflow-hidden border ${
                        isDark ? 'border-[#262626] bg-[#121212]' : 'border-slate-200 bg-slate-100'
                      }`}>
                        <img src={item.thumbnailUrl || item.url} className="w-full h-full object-cover" alt="" />
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.name}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>{item.type}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-[10px] font-mono ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>{item.size}</span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className={`p-2 transition-colors ${isDark ? 'text-[#666666] hover:text-red-400' : 'text-slate-400 hover:text-red-600'}`}
                        title="Delete image"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bulk Action Floating Bar */}
      {selectedIds.length > 0 && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 rounded-[4px] shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-[100] flex items-center gap-8 border animate-in slide-in-from-bottom-8 ${
          isDark ? 'bg-[#161616] text-white border-[#262626]' : 'bg-white text-slate-900 border-slate-200 shadow-2xl'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[#0F3D3E] rounded-[4px] flex items-center justify-center font-bold text-xs text-white">
              {selectedIds.length}
            </div>
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-[#cccccc]' : 'text-slate-700'}`}>Items Selected</span>
          </div>
          <div className={`w-px h-6 ${isDark ? 'bg-[#262626]' : 'bg-slate-200'}`} />
          <div className="flex items-center gap-4">
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
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-[4px] text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-red-600/20"
            >
              <Trash2 size={14} /> Delete Selected
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaLibraryView;
