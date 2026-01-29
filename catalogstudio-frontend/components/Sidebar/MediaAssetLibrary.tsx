
import React, { useState, useRef } from 'react';
import { Images, Search, X, Upload, Plus, FileImage } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { MediaItem } from '../../types';

const MediaAssetLibrary: React.FC = () => {
  const { mediaItems, addElement, currentPageIndex, addMedia, setDraggingItem, uiTheme } = useStore();
  const [search, setSearch] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredMedia = mediaItems.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddMedia = (item: MediaItem) => {
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

  const handleDragStart = (e: React.DragEvent, item: MediaItem) => {
    // Store media metadata in the drag event for the canvas drop handler
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

  const handleDragEnd = () => {
    setDraggingItem(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        const mediaId = `upload-sid-${Date.now()}`;

        const newItem: MediaItem = {
          id: mediaId,
          name: file.name,
          type: 'image',
          url,
          thumbnailUrl: url,
          createdAt: new Date().toISOString(),
          size: `${(file.size / 1024).toFixed(1)} KB`
        };

        // 1. Save to global organizational media pool
        addMedia(newItem);

        // 2. Automatically place on current page for better UX
        handleAddMedia(newItem);
      };
      reader.readAsDataURL(file);
    }
    // Clear input so same file can be uploaded again if deleted
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`flex flex-col h-full border-r w-[320px] shrink-0 z-10 font-sans ${uiTheme === 'dark' ? 'bg-[#0f172a] border-[#0f172a]' : 'bg-white border-slate-200'}`}>
      <div className={`p-6 border-b flex items-center justify-between ${uiTheme === 'dark' ? 'bg-[#0f172a] border-[#1e293b]' : 'bg-white border-slate-200'}`}>
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1">
            <Images size={14} className="text-indigo-600" />
            Media
          </h3>
          <p className={`text-[10px] font-bold uppercase tracking-tight ${uiTheme === 'dark' ? 'text-slate-400' : 'text-slate-300'}`}>Image Resources</p>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all active:scale-95 group"
          title="Upload Local Asset"
        >
          <Upload size={18} className="group-hover:-translate-y-0.5 transition-transform" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
        />
      </div>

      <div className={`p-4 border-b ${uiTheme === 'dark' ? 'bg-[#0f172a] border-[#1e293b]' : 'bg-slate-50/50'}`}>
        <div className="relative group">
          <Search size={14} className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${uiTheme === 'dark' ? 'text-slate-400 group-focus-within:text-indigo-400' : 'text-slate-300 group-focus-within:text-indigo-600'}`} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Global Media..."
            className={`w-full border rounded-2xl pl-10 pr-4 py-3 text-xs font-bold outline-none transition-all focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 ${uiTheme === 'dark' ? 'bg-[#1e293b] border-[#1e293b] text-slate-200 placeholder-slate-400' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-300'}`}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-4 custom-scrollbar content-start">
        {filteredMedia.length === 0 ? (
          <div className="col-span-2 flex flex-col items-center justify-center py-24 text-center px-6">
            <div className="w-16 h-16 bg-slate-50 rounded-[28px] flex items-center justify-center text-slate-200 mb-6 border border-slate-100 shadow-inner">
              <FileImage size={32} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
              No matching assets <br /> found in cloud pool
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-6 px-6 py-2.5 bg-slate-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all border border-indigo-100"
            >
              Upload New
            </button>
          </div>
        ) : (
          filteredMedia.map((item) => (
            <div
              key={item.id}
              draggable="true"
              onDragStart={(e) => handleDragStart(e, item)}
              onDragEnd={handleDragEnd}
              className={`group aspect-square rounded-[24px] overflow-hidden relative border transition-all cursor-grab active:cursor-grabbing shadow-sm hover:shadow-2xl hover:shadow-indigo-600/10 ${uiTheme === 'dark' ? 'bg-[#1e293b] border-[#1e293b] hover:border-indigo-500' : 'bg-slate-50 border-slate-100 hover:border-indigo-600'}`}
              onClick={() => handleAddMedia(item)}
            >
              <img src={item.thumbnailUrl || item.url} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700 pointer-events-none" alt={item.name} />

              <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                <p className="text-[9px] font-black text-white truncate uppercase tracking-tighter">{item.name}</p>
              </div>

              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-6 h-6 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-indigo-600 shadow-md">
                  <Plus size={12} strokeWidth={4} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={`p-6 border-t ${uiTheme === 'dark' ? 'bg-[#0f172a] border-t border-[#1e293b]' : 'bg-slate-50/50'}`}>
        <div className={`p-4 rounded-2xl border shadow-sm flex items-start gap-3 ${uiTheme === 'dark' ? 'bg-[#1e293b] border-[#1e293b]' : 'bg-white border-slate-200'}`}>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 shadow-inner">
            <Upload size={16} />
          </div>
          <div>
            <p className={`text-[9px] font-black uppercase tracking-tighter mb-1 ${uiTheme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>Asset Pipeline</p>
            <p className={`text-[9px] font-bold leading-relaxed uppercase ${uiTheme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`}>
              Drag images onto workspace or click to place. Syncs to Org Media.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaAssetLibrary;
