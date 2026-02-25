
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
  Filter,
  Check,
  CheckSquare,
  Square
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { MediaItem, MediaType } from '../../types';

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
    if (confirm(`Are you sure you want to delete ${selectedIds.length} selected products?`)) {
      removeMediaBatch(selectedIds);
      setSelectedIds([]);
    }
  };

  const handleUploadClick = () => {
    const url = prompt('Enter an image resource URL:');
    if (url) {
      const name = prompt('Enter a name for this product:', 'New Product');
      addMedia({
        id: `m-${Date.now()}`,
        name: name || 'Untitled',
        type: 'image',
        url,
        thumbnailUrl: url,
        createdAt: new Date().toISOString(),
        size: 'N/A'
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#f8fafc] dark:bg-slate-950 animate-in fade-in duration-500 relative transition-colors duration-300">
      {/* Header */}
      <div className="px-8 py-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Media</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 font-medium mt-1">Global repository for high-fidelity brand imagery.</p>
        </div>
        <button 
          onClick={handleUploadClick}
          className="px-6 py-2.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Upload size={16} /> Upload Product
        </button>
      </div>

      {/* Filter Bar */}
      <div className="px-8 py-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 flex items-center gap-6 shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
          <input 
            type="text" 
            placeholder="Search products by name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-600/5 dark:focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 shadow-sm"
          />
        </div>

        <button 
          onClick={handleSelectAll}
          className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2"
        >
          {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? 'Deselect All' : 'Select All'}
        </button>

        <div className="ml-auto flex items-center gap-2">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-2xl transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-300 dark:text-slate-700'}`}
          >
            <LayoutGrid size={18} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-2xl transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-300 dark:text-slate-700'}`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Media Grid/List */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar pb-32">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-6 border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-200 dark:text-slate-800">
              <Images size={40} />
            </div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white">No images found</h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 font-medium mt-1">Your Media is currently empty.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredItems.map(item => (
              <div 
                key={item.id} 
                onClick={() => toggleSelection(item.id)}
                className={`group bg-white dark:bg-slate-900 rounded-2xl border transition-all overflow-hidden relative cursor-pointer ${selectedIds.includes(item.id) ? 'border-indigo-600 dark:border-indigo-500 ring-4 ring-indigo-50 dark:ring-indigo-900/20 shadow-xl' : 'border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1'}`}
              >
                <div className="aspect-square bg-slate-50 dark:bg-slate-800 relative overflow-hidden">
                  <img src={item.thumbnailUrl || item.url} className="w-full h-full object-cover" />
                  
                  {/* Selection Overlay */}
                  <div className={`absolute top-3 left-3 w-6 h-6 rounded-2xl flex items-center justify-center transition-all z-10 ${selectedIds.includes(item.id) ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg' : 'bg-white/40 dark:bg-black/40 text-transparent border border-white/60 dark:border-white/20 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>
                    <Check size={14} />
                  </div>

                  <div className="absolute inset-0 bg-indigo-600/60 dark:bg-indigo-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 text-white">
                     <button 
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-3 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-md transition-all"
                        title="Delete Product"
                      >
                        <Trash2 size={20} />
                      </button>
                      <span className="text-[10px] font-black uppercase tracking-widest">Remove Product</span>
                  </div>
                </div>
                
                <div className="p-4 border-t border-slate-50 dark:border-slate-800">
                  <h4 className="text-xs font-black text-slate-800 dark:text-white truncate mb-1">{item.name}</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                       <FileImage size={10} /> image
                    </div>
                    <span className="text-[9px] font-mono text-slate-300 dark:text-slate-700">{item.size}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 w-12 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    <button onClick={handleSelectAll} className="p-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? <CheckSquare size={16} className="text-indigo-600 dark:text-indigo-400" /> : <Square size={16} className="dark:text-slate-700" />}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Preview</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Name</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Type</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Size</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredItems.map(item => (
                  <tr 
                    key={item.id} 
                    onClick={() => toggleSelection(item.id)}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer ${selectedIds.includes(item.id) ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className={`p-1 ${selectedIds.includes(item.id) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-300 dark:text-slate-700'}`}>
                        {selectedIds.includes(item.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border dark:border-slate-800">
                        <img src={item.thumbnailUrl || item.url} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-black text-slate-800 dark:text-white">{item.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">{item.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-600">{item.size}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button 
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-2 text-slate-300 dark:text-slate-700 hover:text-red-500 dark:hover:text-red-400 transition-colors"
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
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[100] flex items-center gap-10 border border-white/10 dark:border-slate-800 animate-in slide-in-from-bottom-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 dark:bg-indigo-500 rounded-2xl flex items-center justify-center font-black text-sm">
              {selectedIds.length}
            </div>
            <span className="text-xs font-black uppercase tracking-widest">Products Selected</span>
          </div>
          <div className="w-px h-8 bg-white/10 dark:bg-slate-800" />
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedIds([])}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleBulkDelete}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
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
