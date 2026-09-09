import React, { useState, useRef, useEffect } from 'react';
import { Images, Search, X, Upload, Plus, FileImage, Image as ImageIcon, ExternalLink, Loader2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { MediaItem, AdminAsset } from '../../types';
import { normalizeImageUrl } from '../../utils/imageUtils';

const UNSPLASH_ACCESS_KEY = (import.meta as any).env.VITE_UNSPLASH_ACCESS_KEY || '';

interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  user: {
    name: string;
    links: {
      html: string;
    };
  };
  alt_description: string;
}

const MediaAssetLibrary: React.FC = () => {
  const { mediaItems, adminAssets, addElement, currentPageIndex, addMedia, setDraggingItem, uiTheme, setEditorTab } = useStore();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'uploads' | 'stock' | 'system'>('uploads');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Unsplash Stock State
  const [stockSearch, setStockSearch] = useState('nature');
  const [stockImages, setStockImages] = useState<UnsplashImage[]>([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockError, setStockError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('unsplash_access_key') || UNSPLASH_ACCESS_KEY;
  });

  const handleSetKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('unsplash_access_key', key);
    if (key) {
      fetchStockImages(stockSearch, key);
    }
  };

  const fetchStockImages = async (query: string, overridenKey?: string) => {
    const activeKey = overridenKey || apiKey;
    if (!activeKey) {
      setStockError('Please provide an Unsplash Access Key to search for stock images.');
      return;
    }

    setStockLoading(true);
    setStockError(null);
    try {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${query}&per_page=12&client_id=${activeKey}`
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid Unsplash Access Key. Please check your credentials.');
        }
        throw new Error('Failed to fetch stock photos.');
      }

      const data = await response.json();
      setStockImages(data.results || []);
    } catch (err: any) {
      setStockError(err.message || 'Something went wrong fetching stock images.');
    } finally {
      setStockLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'stock' && apiKey && stockImages.length === 0) {
      fetchStockImages(stockSearch);
    }
  }, [activeTab, apiKey]);

  const activeSource = activeTab === 'uploads' ? mediaItems : adminAssets;

  const filteredMedia = activeSource.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddMedia = (item: MediaItem | AdminAsset) => {
    addElement(currentPageIndex, {
      id: `media-${Date.now()}`,
      type: 'image',
      x: 100,
      y: 100,
      width: 300,
      height: 300,
      rotation: 0,
      opacity: 1,
      src: normalizeImageUrl(item.url),
      zIndex: 20
    });
  };

  const handleAddStockImage = (img: UnsplashImage) => {
    addElement(currentPageIndex, {
      id: `stock-${Date.now()}`,
      type: 'image',
      x: 100,
      y: 100,
      width: 400,
      height: 300,
      rotation: 0,
      opacity: 1,
      src: img.urls.regular,
      zIndex: 20
    });
  };

  const handleDragStart = (e: React.DragEvent, item: MediaItem | AdminAsset) => {
    const dragData = {
      type: 'image',
      url: normalizeImageUrl(item.url),
      name: item.name,
      source: 'library'
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'copy';
    setDraggingItem(dragData);
  };

  const handleStockDragStart = (e: React.DragEvent, img: UnsplashImage) => {
    const dragData = {
      type: 'image',
      url: img.urls.regular,
      name: img.alt_description || 'Stock Image',
      source: 'stock'
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'copy';
    setDraggingItem(dragData);
  };

  const handleDragEnd = () => {
    setDraggingItem(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from<File>(files).forEach(async (file) => {
      try {
        const savedItem = await addMedia(file);
        handleAddMedia(savedItem);
      } catch (error) {
        console.error("Upload failed in sidebar:", file.name, error);
      }
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const isDark = uiTheme === 'dark';

  return (
    <div className="flex flex-col h-full w-full shrink-0 z-10 animate-in slide-in-from-left-4 duration-300 font-sans transition-colors bg-[#161616] text-white">
      {/* Top Header */}
      <div className="h-14 px-3 py-2 border-b flex items-center justify-between transition-colors bg-[#161616] border-[#262626]">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 mb-0.5">
            <Images size={13} className="text-[#E2DCC8]" />
            <span className="text-white">Media & Images</span>
          </h3>
          <p className="text-[8px] font-medium text-[#888]">Uploads & Free Stock Photos</p>
        </div>

        <div className="flex items-center gap-1.5">
          {activeTab === 'uploads' && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2 py-1 flex items-center gap-1 bg-[#0F3D3E] text-white rounded-[4px] hover:bg-[#ff5722] text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all"
              title="Upload Image"
            >
              <Upload size={11} />
              <span>Upload</span>
            </button>
          )}
          <button
            onClick={() => setEditorTab(null)}
            className="p-1 rounded-[4px] transition-colors hover:bg-[#262626] text-[#888] hover:text-white"
          >
            <X size={12} />
          </button>
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          multiple
          className="hidden"
        />
      </div>

      {/* 3-Way Segmented Tabs */}
      <div className="p-2 border-b shrink-0 border-[#262626] bg-[#141414]">
        <div className="flex rounded-[4px] p-0.5 bg-[#101010] border border-[#262626]">
          <button
            onClick={() => setActiveTab('uploads')}
            className={`flex-1 py-1 rounded-[3px] text-[10px] font-bold uppercase tracking-wider transition-all ${
              activeTab === 'uploads'
                ? 'bg-[#0F3D3E] text-white shadow-sm'
                : 'text-[#888] hover:text-white'
            }`}
          >
            Uploads
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={`flex-1 py-1 rounded-[3px] text-[10px] font-bold uppercase tracking-wider transition-all ${
              activeTab === 'stock'
                ? 'bg-[#0F3D3E] text-white shadow-sm'
                : 'text-[#888] hover:text-white'
            }`}
          >
            Stock
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`flex-1 py-1 rounded-[3px] text-[10px] font-bold uppercase tracking-wider transition-all ${
              activeTab === 'system'
                ? 'bg-[#0F3D3E] text-white shadow-sm'
                : 'text-[#888] hover:text-white'
            }`}
          >
            Assets
          </button>
        </div>
      </div>

      {/* Stock Tab View */}
      {activeTab === 'stock' ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className={`p-3 border-b transition-colors ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'}`}>
            {!apiKey ? (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Enter Unsplash Access Key</p>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Access Key..."
                    className={`flex-1 border rounded-[4px] px-2.5 py-1.5 text-xs outline-none focus:ring-2 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSetKey(e.currentTarget.value);
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      handleSetKey(input.value);
                    }}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-[4px] text-xs font-bold hover:bg-indigo-700 transition-colors"
                  >
                    Set
                  </button>
                </div>
                <a href="https://unsplash.com/developers" target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-500 flex items-center gap-1 hover:underline">
                  Get Free Key <ExternalLink size={10} />
                </a>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  fetchStockImages(stockSearch);
                }}
                className="relative group"
              >
                <Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-500 group-focus-within:text-indigo-400' : 'text-slate-300 group-focus-within:text-indigo-600'}`} />
                <input
                  type="text"
                  value={stockSearch}
                  onChange={(e) => setStockSearch(e.target.value)}
                  placeholder="Search free stock photos..."
                  className={`w-full border rounded-[4px] pl-9 pr-3 py-2 text-xs font-bold outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-300 focus:border-indigo-600'}`}
                />
                {stockLoading && <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-indigo-500" />}
              </form>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2.5 custom-scrollbar content-start">
            {stockError && (
              <div className="col-span-2 py-8 text-center px-4">
                <p className="text-xs text-red-500 font-medium mb-1">{stockError}</p>
              </div>
            )}

            {stockImages.map((img) => (
              <div
                key={img.id}
                draggable
                onDragStart={(e) => handleStockDragStart(e, img)}
                onDragEnd={handleDragEnd}
                onClick={() => handleAddStockImage(img)}
                className={`group relative rounded-[4px] overflow-hidden border cursor-pointer aspect-square transition-all hover:shadow-md ${isDark ? 'bg-slate-800 border-slate-700 hover:border-indigo-500' : 'bg-slate-50 border-slate-200 hover:border-indigo-500'}`}
              >
                <img
                  src={img.urls.small}
                  alt={img.alt_description}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                  <span className="text-[9px] font-black text-white uppercase tracking-wider">Add to Page</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Uploads & System Assets View */
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className={`p-2.5 border-b transition-colors ${isDark ? 'bg-[#141414] border-[#262626]' : 'bg-slate-50/50 border-slate-100'}`}>
            <div className="relative group">
              <Search size={12} className={`absolute left-2.5 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-[#666] group-focus-within:text-[#E2DCC8]' : 'text-slate-400 group-focus-within:text-[#E2DCC8]'}`} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={activeTab === 'uploads' ? 'Search Uploads...' : 'Search System Assets...'}
                className={`w-full border rounded-[4px] pl-7 pr-7 py-1.5 text-[11px] font-medium outline-none transition-all ${isDark ? 'bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-[#666] focus:border-[#0F3D3E]' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-[#0F3D3E]'}`}
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#666] hover:text-white">
                  <X size={10} />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 grid grid-cols-2 gap-2 custom-scrollbar content-start">
            {filteredMedia.length === 0 ? (
              <div className="col-span-2 flex flex-col items-center justify-center py-14 text-center px-4">
                <div className={`w-10 h-10 rounded-[4px] flex items-center justify-center mb-2.5 border transition-colors ${isDark ? 'bg-[#1a1a1a] border-[#262626] text-[#666]' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                  <FileImage size={18} />
                </div>
                <p className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-[#777]' : 'text-slate-400'}`}>
                  {activeTab === 'uploads' ? 'No uploads yet' : 'No assets found'}
                </p>
                {activeTab === 'uploads' && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-1 text-[11px] font-bold text-[#E2DCC8] hover:underline"
                  >
                    Upload files now
                  </button>
                )}
              </div>
            ) : (
              filteredMedia.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  onDragEnd={handleDragEnd}
                  onClick={() => handleAddMedia(item)}
                  className={`group relative rounded-[4px] overflow-hidden border cursor-pointer aspect-square transition-all hover:shadow-md ${isDark ? 'bg-slate-800 border-slate-700 hover:border-indigo-500' : 'bg-slate-50 border-slate-200 hover:border-indigo-500'}`}
                >
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                    <span className="text-[9px] font-black text-white uppercase tracking-wider truncate px-1">{item.name}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaAssetLibrary;
