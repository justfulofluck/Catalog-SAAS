
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
  Square,
  Link,
  File,
  ArrowRight
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { MediaItem, MediaType } from '../../types';
import { useToast } from '../../components/Shared/ToastProvider';
import ConfirmationModal from '../../components/Shared/ConfirmationModal';

const MediaLibraryView: React.FC = () => {
  const { mediaItems, removeMedia, removeMediaBatch, addMedia } = useStore();
  const { success } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Delete Confirmation State
  const [deleteState, setDeleteState] = useState<{ isOpen: boolean; type: 'single' | 'batch'; id?: string }>({
    isOpen: false,
    type: 'single'
  });

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadStep, setUploadStep] = useState<'method' | 'details'>('method');
  const [uploadType, setUploadType] = useState<'url' | 'file'>('url');
  const [uploadData, setUploadData] = useState({ name: '', url: '', file: null as File | null });

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const [isExiting, setIsExiting] = useState(false);

  const handleViewChange = (mode: 'grid' | 'list') => {
    if (mode === viewMode) return;
    setIsExiting(true);
    setTimeout(() => {
      setViewMode(mode);
      setIsExiting(false);
    }, 300);
  };

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
    setDeleteState({ isOpen: true, type: 'single', id });
  };

  const handleBulkDelete = () => {
    setDeleteState({ isOpen: true, type: 'batch' });
  };

  const executeDelete = () => {
    if (deleteState.type === 'single' && deleteState.id) {
      removeMedia(deleteState.id);
      setSelectedIds(prev => prev.filter(i => i !== deleteState.id));
      success("Asset removed from library");
    } else if (deleteState.type === 'batch') {
      removeMediaBatch(selectedIds);
      setSelectedIds([]);
      success(`${selectedIds.length} assets removed`);
    }
    setDeleteState(prev => ({ ...prev, isOpen: false }));
  };

  const handleUploadClick = () => {
    setUploadStep('method');
    setUploadData({ name: '', url: '', file: null });
    setIsUploadOpen(true);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadData(prev => ({ ...prev, url: e.target?.result as string, file, name: file.name.split('.')[0] }));
      setUploadStep('details');
    };
    reader.readAsDataURL(file);
  };

  const handleUploadSubmit = () => {
    if (!uploadData.name) return;

    addMedia({
      id: `m-${Date.now()}`,
      name: uploadData.name,
      type: 'image',
      url: uploadData.url || 'https://picsum.photos/seed/default/400/400',
      thumbnailUrl: uploadData.url || 'https://picsum.photos/seed/default/400/400',
      createdAt: new Date().toISOString(),
      size: uploadData.file ? `${(uploadData.file.size / 1024 / 1024).toFixed(2)} MB` : 'N/A'
    });

    success("Asset uploaded successfully");
    setIsUploadOpen(false);
  };

  return (
    <div className={`flex-1 flex flex-col overflow-hidden bg-[#f8fafc] dark:bg-slate-950 relative transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0 scale-100 blur-0' : 'opacity-0 translate-y-4 scale-95 blur-sm'}`}>
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
          <Upload size={16} /> Upload Asset
        </button>
      </div>

      {/* Filter Bar */}
      <div className="px-8 py-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 flex items-center gap-6 shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
          <input
            type="text"
            placeholder="Search assets by name..."
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

        <div className="ml-auto relative flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
          {/* Sliding Pill */}
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-slate-700 rounded-xl shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${viewMode === 'grid' ? 'left-1' : 'left-[50%]'}`}
          />

          <button
            onClick={() => handleViewChange('grid')}
            className={`relative z-10 p-2 w-10 flex items-center justify-center transition-colors duration-300 ${viewMode === 'grid' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => handleViewChange('list')}
            className={`relative z-10 p-2 w-10 flex items-center justify-center transition-colors duration-300 ${viewMode === 'list' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Media Grid/List */}
      <div className={`flex-1 overflow-y-auto p-8 custom-scrollbar pb-32 transition-all duration-300 ${isExiting ? 'opacity-0 -translate-x-8' : 'opacity-100 translate-x-0'}`}>
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
                      title="Delete Asset"
                    >
                      <Trash2 size={20} />
                    </button>
                    <span className="text-[10px] font-black uppercase tracking-widest">Remove Asset</span>
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
            <span className="text-xs font-black uppercase tracking-widest">Assets Selected</span>
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
      {/* Upload Toast Form */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-800 p-8 w-[480px] overflow-hidden relative animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setIsUploadOpen(false)}
              className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-500 dark:hover:text-slate-400 transition-colors z-10"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <h3 className="text-lg font-black text-slate-800 dark:text-white">Upload Asset</h3>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                {uploadStep === 'method' ? 'Select Upload Method' : 'Configure Asset Details'}
              </p>
            </div>

            {uploadStep === 'method' ? (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => { setUploadType('url'); setUploadStep('details'); }}
                  className="p-6 rounded-2xl bg-indigo-50 dark:bg-indigo-900/10 border-2 border-transparent hover:border-indigo-600 dark:hover:border-indigo-500 group transition-all text-left"
                >
                  <div className="w-10 h-10 bg-white dark:bg-indigo-900/50 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                    <Link size={20} />
                  </div>
                  <span className="block text-sm font-black text-indigo-900 dark:text-indigo-100 mb-1">Link URL</span>
                  <span className="text-[10px] font-bold text-indigo-400 dark:text-indigo-300 uppercase tracking-wide">Remote Resource</span>
                </button>
                <div className="relative group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadType('file');
                        processFile(file);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="h-full p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent group-hover:border-slate-300 dark:group-hover:border-slate-600 transition-all text-left">
                    <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-400 mb-4 group-hover:scale-110 transition-transform">
                      <File size={20} />
                    </div>
                    <span className="block text-sm font-black text-slate-800 dark:text-white mb-1">Local File</span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Device Storage</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Asset Name</label>
                  <input
                    type="text"
                    value={uploadData.name}
                    onChange={(e) => setUploadData({ ...uploadData, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:border-indigo-600 dark:focus:border-indigo-400 outline-none"
                    placeholder="e.g. Hero Banner 01"
                    autoFocus
                  />
                </div>

                {uploadType === 'url' ? (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Resource Link</label>
                    <input
                      type="text"
                      value={uploadData.url}
                      onChange={(e) => setUploadData({ ...uploadData, url: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none"
                      placeholder="https://..."
                    />
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-700 overflow-hidden shrink-0">
                      {uploadData.url && <img src={uploadData.url} className="w-full h-full object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-slate-700 dark:text-slate-200 truncate">{uploadData.file?.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{((uploadData.file?.size || 0) / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => setUploadStep('method')}
                    className="px-4 py-3 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleUploadSubmit}
                    disabled={!uploadData.name || !uploadData.url}
                    className="flex-1 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl py-3 text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    Save Asset <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <ConfirmationModal
        isOpen={deleteState.isOpen}
        title={deleteState.type === 'single' ? "Remove Asset" : "Delete Multiple Assets"}
        message={deleteState.type === 'single'
          ? "Are you sure you want to permanently delete this media asset? This action cannot be undone."
          : `Are you sure you want to delete ${selectedIds.length} selected assets? This action cannot be undone.`
        }
        confirmLabel="Delete Permanently"
        isDestructive
        onConfirm={executeDelete}
        onCancel={() => setDeleteState(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default MediaLibraryView;
