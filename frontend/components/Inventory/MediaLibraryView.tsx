import React, { useState } from 'react';
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
  const { mediaItems, removeMedia, removeMediaBatch, addMedia } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredItems = mediaItems.filter(item => {
    return item.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const toggleSelection = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(item => item.id));
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Permanently remove this image from the Media?')) {
      removeMedia(id);
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected items?`)) {
      removeMediaBatch(selectedIds);
      setSelectedIds([]);
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from<File>(files).forEach(async (file) => {
      try {
        await addMedia(file);
      } catch (error) {
        console.error("Upload failed for file:", file.name);
      }
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#100F0F] text-white animate-in fade-in duration-500 relative">
      {/* Single Line Header & Toolbar */}
      <div className="px-6 py-4 bg-[#161616] border-b border-[#262626] flex flex-wrap items-center justify-between gap-4 shrink-0">
        {/* Title and Subtitle */}
        <div className="flex flex-col min-w-[200px]">
          <h1 className="font-space text-xl font-bold text-white tracking-tight leading-none">Media Library</h1>
          <p className="text-xs text-[#888888] font-medium mt-1">Global repository for high-fidelity brand imagery.</p>
        </div>

        {/* Right Controls: Search, Select All, View Toggle & Upload Button */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          <div className="relative w-64 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666666]" size={15} />
            <input
              type="text"
              placeholder="Search media by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#121212] border border-[#262626] rounded-[4px] pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#666666] focus:border-[#0F3D3E] outline-none transition-all"
            />
          </div>

          <button
            onClick={handleSelectAll}
            className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#888888] hover:text-[#E2DCC8] bg-[#121212] border border-[#262626] rounded-[4px] hover:border-[#3a3a3a] transition-colors whitespace-nowrap"
          >
            {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? 'Deselect All' : 'Select All'}
          </button>

        {/* Right: View switcher & Upload Button */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center bg-[#121212] border border-[#262626] rounded-[4px] p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-[3px] transition-all ${viewMode === 'grid' ? 'bg-[#222222] text-[#E2DCC8]' : 'text-[#666666] hover:text-white'}`}
              title="Grid view"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-[3px] transition-all ${viewMode === 'list' ? 'bg-[#222222] text-[#E2DCC8]' : 'text-[#666666] hover:text-white'}`}
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

      {/* Media Grid/List */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar pb-32">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 bg-[#161616] rounded-[4px] flex items-center justify-center mb-6 border border-[#262626] text-[#666666]">
              <Images size={40} />
            </div>
            <h3 className="font-space text-lg font-bold text-white">No images found</h3>
            <p className="text-sm text-[#888888] font-medium mt-1 mb-6">Your Media library is currently empty.</p>
            <button
              onClick={handleUploadClick}
              className="px-6 py-3 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#0F3D3E]/20 transition-all flex items-center gap-2"
            >
              <Upload size={16} /> Upload Images Now
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredItems.map(item => (
              <div
                key={item.id}
                onClick={() => toggleSelection(item.id)}
                className={`group bg-[#161616] rounded-[4px] border transition-all overflow-hidden relative cursor-pointer ${selectedIds.includes(item.id) ? 'border-[#0F3D3E] ring-2 ring-[#0F3D3E]/30 shadow-xl' : 'border-[#262626] hover:border-[#3a3a3a] hover:-translate-y-1'}`}
              >
                <div className="aspect-square bg-[#121212] relative overflow-hidden">
                  <img src={item.thumbnailUrl || item.url} className="w-full h-full object-cover" alt={item.name} />

                  {/* Selection Overlay */}
                  <div className={`absolute top-3 left-3 w-6 h-6 rounded-[4px] flex items-center justify-center transition-all z-10 ${selectedIds.includes(item.id) ? 'bg-[#0F3D3E] text-white shadow-lg' : 'bg-black/60 text-transparent border border-white/20 group-hover:bg-[#1c1c1c] group-hover:text-[#E2DCC8]'}`}>
                    <Check size={14} />
                  </div>

                  <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 text-white">
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-3 bg-red-600/80 hover:bg-red-600 rounded-full backdrop-blur-md transition-all text-white"
                      title="Delete image"
                    >
                      <Trash2 size={18} />
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#cccccc]">Remove Item</span>
                  </div>
                </div>

                <div className="p-4 border-t border-[#262626]">
                  <h4 className="text-xs font-bold text-white truncate mb-1">{item.name}</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-[#888888] uppercase tracking-wider">
                      <FileImage size={10} /> image
                    </div>
                    <span className="text-[9px] font-mono text-[#666666]">{item.size}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#161616] rounded-[4px] border border-[#262626] overflow-hidden shadow-xl">
            <table className="w-full text-left">
              <thead className="bg-[#121212] border-b border-[#262626]">
                <tr>
                  <th className="px-6 py-4 w-12 text-[10px] font-bold text-[#888888] uppercase tracking-widest">
                    <button onClick={handleSelectAll} className="p-1 hover:text-[#E2DCC8] transition-colors">
                      {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? <CheckSquare size={16} className="text-[#E2DCC8]" /> : <Square size={16} className="text-[#666666]" />}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#888888] uppercase tracking-widest">Preview</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#888888] uppercase tracking-widest">Name</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#888888] uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#888888] uppercase tracking-widest">Size</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#888888] uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {filteredItems.map(item => (
                  <tr
                    key={item.id}
                    onClick={() => toggleSelection(item.id)}
                    className={`hover:bg-[#1c1c1c] transition-colors cursor-pointer ${selectedIds.includes(item.id) ? 'bg-[#0F3D3E]/10' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className={`p-1 ${selectedIds.includes(item.id) ? 'text-[#E2DCC8]' : 'text-[#666666]'}`}>
                        {selectedIds.includes(item.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-[4px] overflow-hidden border border-[#262626] bg-[#121212]">
                        <img src={item.thumbnailUrl || item.url} className="w-full h-full object-cover" alt="" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-white">{item.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-[#888888] uppercase tracking-widest">{item.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-mono text-[#888888]">{item.size}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-2 text-[#666666] hover:text-red-400 transition-colors"
                        title="Delete image"
                      >
                        <Trash2 size={16} />
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
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-[#161616] text-white px-8 py-4 rounded-[4px] shadow-[0_20px_50px_rgba(0,0,0,0.6)] z-[100] flex items-center gap-8 border border-[#262626] animate-in slide-in-from-bottom-8">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[#0F3D3E] rounded-[4px] flex items-center justify-center font-bold text-xs text-white">
              {selectedIds.length}
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#cccccc]">Items Selected</span>
          </div>
          <div className="w-px h-6 bg-[#262626]" />
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedIds([])}
              className="text-[10px] font-bold uppercase tracking-widest text-[#888888] hover:text-white transition-colors"
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
