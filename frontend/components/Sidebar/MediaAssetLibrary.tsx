import React, { useState, useRef, useEffect } from 'react';
import { Images, Search, X, Upload, Plus, FileImage, Image as ImageIcon, ExternalLink, Loader2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { MediaItem, AdminAsset } from '../../types';

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
      src: item.url,
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
      url: item.url,
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
    <div className={`flex flex-col h-full w-full shrink-0 z-10 animate-in slide-in-from-left-4 duration-500 font-sans transition-colors ${isDark ? 'bg-[#0f172a]' : 'bg-white'}`}>
      {/* Top Header */}
      <div className={`p-4 border-b flex items-center justify-between transition-colors ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'}`}>
        <div>
          <h3 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-0.5">
            <Images size={14} className={isDark ? 'text-indigo-400' : 'text-indigo-600'} />
            <span className={isDark ? 'text-white' : 'text-slate-800'}>Media & Images</span>
          </h3>
          <p className={`text-[9px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Uploads & Free Stock Photos</p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'uploads' && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-7 h-7 flex items-center justify-center bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all active:scale-95"
              title="Upload Image"
            >
              <Upload size={13} />
            </button>
          )}
          <button
            onClick={() => setEditorTab(null)}
            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-400'}`}
          >
            <X size={14} />
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
      <div className={`p-2 border-b shrink-0 ${isDark ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/70'}`}>
        <div className={`flex rounded-xl p-1 ${isDark ? 'bg-slate-800' : 'bg-slate-200/60'}`}>
          <button
            onClick={() => setActiveTab('uploads')}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
              activeTab === 'uploads'
                ? 'bg-indigo-600 text-white shadow-sm'
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Uploads
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
              activeTab === 'stock'
                ? 'bg-indigo-600 text-white shadow-sm'
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Stock
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
              activeTab === 'system'
                ? 'bg-indigo-600 text-white shadow-sm'
                : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
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
                    className={`flex-1 border rounded-xl px-2.5 py-1.5 text-xs outline-none focus:ring-2 ${isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSetKey(e.currentTarget.value);
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                      handleSetKey(input.value);
                    }}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors"
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
                  className={`w-full border rounded-xl pl-9 pr-3 py-2 text-xs font-bold outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-300 focus:border-indigo-600'}`}
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
                className={`group relative rounded-xl overflow-hidden border cursor-pointer aspect-square transition-all hover:shadow-md ${isDark ? 'bg-slate-800 border-slate-700 hover:border-indigo-500' : 'bg-slate-50 border-slate-200 hover:border-indigo-500'}`}
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
          <div className={`p-3 border-b transition-colors ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50/50 border-slate-100'}`}>
            <div className="relative group">
              <Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-500 group-focus-within:text-indigo-400' : 'text-slate-300 group-focus-within:text-indigo-600'}`} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={activeTab === 'uploads' ? 'Search Uploads...' : 'Search System Assets...'}
                className={`w-full border rounded-xl pl-9 pr-7 py-2 text-xs font-bold outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-300 focus:border-indigo-600'}`}
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2.5 custom-scrollbar content-start">
            {filteredMedia.length === 0 ? (
              <div className="col-span-2 flex flex-col items-center justify-center py-16 text-center px-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 border shadow-inner transition-colors ${isDark ? 'bg-slate-800/50 border-slate-700 text-slate-600' : 'bg-slate-50 border-slate-100 text-slate-200'}`}>
                  <FileImage size={24} />
                </div>
                <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {activeTab === 'uploads' ? 'No uploads yet' : 'No assets found'}
                </p>
                {activeTab === 'uploads' && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
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
                  className={`group relative rounded-xl overflow-hidden border cursor-pointer aspect-square transition-all hover:shadow-md ${isDark ? 'bg-slate-800 border-slate-700 hover:border-indigo-500' : 'bg-slate-50 border-slate-200 hover:border-indigo-500'}`}
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
