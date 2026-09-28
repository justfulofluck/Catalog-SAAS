import React, { useState, useRef } from 'react';
import { 
  Search, 
  X, 
  UploadCloud, 
  Link as LinkIcon, 
  Info, 
  Play, 
  ChevronRight, 
  Plus, 
  Film, 
  Check, 
  Trash2,
  ChevronLeft
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { CanvasElement } from '../../types';
import { 
  STOCK_VIDEOS, 
  StockVideoItem, 
  parseVideoUrl, 
  generateVideoThumbnailFromBlob 
} from '../../utils/videoUtils';

interface VideosPanelProps {
  onBack?: () => void;
  onClose?: () => void;
  isDark?: boolean;
}

interface UploadedVideoItem {
  id: string;
  title: string;
  url: string;
  posterUrl: string;
  duration: string;
  sizeMb: number;
}

export const VideosPanel: React.FC<VideosPanelProps> = ({ onBack, onClose, isDark: propIsDark }) => {
  const { uiTheme, setSidebarExpanded, currentPageIndex, addElements } = useStore();
  const isDark = propIsDark !== undefined ? propIsDark : uiTheme === 'dark';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [activeTab, setActiveTab] = useState<'uploads' | 'stock'>('uploads');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state for uploaded videos (persisted in session/localStorage if desired)
  const [uploadedVideos, setUploadedVideos] = useState<UploadedVideoItem[]>(() => {
    try {
      const saved = localStorage.getItem('catalog_saas_uploaded_videos');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const totalUploadedSizeMb = uploadedVideos.reduce((acc, curr) => acc + (curr.sizeMb || 0), 0);

  const saveUploadedVideos = (videos: UploadedVideoItem[]) => {
    setUploadedVideos(videos);
    try {
      localStorage.setItem('catalog_saas_uploaded_videos', JSON.stringify(videos));
    } catch {}
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setSidebarExpanded(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 100 * 1024 * 1024) {
      alert('Video file size exceeds 100MB limit.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    try {
      const videoBlobUrl = URL.createObjectURL(file);
      setUploadProgress(50);
      
      const thumb = await generateVideoThumbnailFromBlob(file);
      setUploadProgress(85);

      const newVideo: UploadedVideoItem = {
        id: `upload-vid-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        url: videoBlobUrl,
        posterUrl: thumb.posterUrl,
        duration: thumb.duration ? `${Math.floor(thumb.duration / 60)}:${String(Math.floor(thumb.duration % 60)).padStart(2, '0')}` : '0:15',
        sizeMb: Math.round((file.size / (1024 * 1024)) * 10) / 10,
      };

      const updated = [newVideo, ...uploadedVideos];
      saveUploadedVideos(updated);
      setUploadProgress(100);

      // Automatically insert uploaded video directly onto canvas
      insertVideoOnCanvas(newVideo.url, newVideo.posterUrl, newVideo.title);
    } catch (err) {
      console.error('Failed to process video file:', err);
      alert('Could not process video file. Please try a different MP4 or WebM file.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddVideoFromUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    const parsed = parseVideoUrl(trimmed);
    const title = parsed.type === 'youtube' ? 'YouTube Video' : (parsed.type === 'vimeo' ? 'Vimeo Video' : 'Online Video');
    const poster = parsed.posterUrl || 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&q=80&w=800';

    const newVideo: UploadedVideoItem = {
      id: `url-vid-${Date.now()}`,
      title,
      url: parsed.embedUrl || trimmed,
      posterUrl: poster,
      duration: 'Embed',
      sizeMb: 0,
    };

    saveUploadedVideos([newVideo, ...uploadedVideos]);
    insertVideoOnCanvas(newVideo.url, newVideo.posterUrl, newVideo.title, parsed.type);
    setUrlInput('');
    setShowUrlInput(false);
  };

  const insertVideoOnCanvas = (videoUrl: string, posterUrl?: string, title?: string, videoType?: any) => {
    const parsed = parseVideoUrl(videoUrl);
    const finalType = videoType || parsed.type;
    const finalPoster = posterUrl || parsed.posterUrl || 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&q=80&w=800';

    const videoElement: CanvasElement = {
      id: `vid-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: 'video',
      x: 120,
      y: 180,
      width: 480,
      height: 270, // 16:9 standard ratio
      rotation: 0,
      opacity: 1,
      videoUrl: videoUrl,
      videoPoster: finalPoster,
      videoType: finalType,
      videoTitle: title || 'Video',
      isAutoplay: true,
      isLoop: true,
      isMuted: true,
      showControls: true,
      borderRadius: 0,
      zIndex: 10,
    };

    addElements(currentPageIndex, [videoElement]);
  };

  const filteredStockVideos = STOCK_VIDEOS.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUploadedVideos = uploadedVideos.filter(v =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`h-full flex flex-col select-none font-sans ${isDark ? 'bg-[#18181b] text-zinc-100' : 'bg-white text-zinc-800'}`}>
      {/* Top Header Bar matching Screenshot 2 */}
      <div className={`h-12 px-4 border-b flex items-center justify-between shrink-0 ${isDark ? 'border-zinc-800 bg-[#18181b]' : 'border-zinc-200 bg-white'}`}>
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className={`p-1 rounded-md hover:bg-zinc-500/10 text-zinc-400 hover:text-zinc-200 transition-colors`}
              title="Back"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">Videos</h1>
            <div className="group relative cursor-pointer text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
              <Info size={15} />
              <div className="absolute left-0 top-6 hidden group-hover:block z-50 w-52 p-2 rounded-lg bg-zinc-900 text-white text-[11px] shadow-xl border border-zinc-700 leading-tight pointer-events-none">
                Upload local MP4 videos or embed interactive videos from YouTube, Vimeo, Loom & direct video URLs.
              </div>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClose}
          className={`p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-500/10 transition-colors`}
          title="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* Search Input matching Screenshot 2 */}
      <div className="p-3 pb-2 shrink-0">
        <div className={`relative flex items-center rounded-lg border transition-all ${
          isDark 
            ? 'bg-zinc-900 border-zinc-700/80 focus-within:border-[#0084ff]' 
            : 'bg-zinc-50 border-zinc-300 focus-within:border-[#0084ff]'
        }`}>
          <input
            type="text"
            placeholder="Press [Enter] to Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3 pr-9 py-2 text-xs bg-transparent outline-none placeholder-zinc-400 dark:placeholder-zinc-500 text-zinc-900 dark:text-zinc-100"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 text-zinc-400 hover:text-zinc-200"
            >
              <X size={14} />
            </button>
          ) : (
            <Search size={15} className="absolute right-2.5 text-zinc-400 pointer-events-none" />
          )}
        </div>
      </div>

      {/* Prominent Canva Blue "Upload Videos" Action Button */}
      <div className="px-3 pb-2 shrink-0 space-y-2">
        <input 
          ref={fileInputRef}
          type="file" 
          accept="video/mp4,video/webm,video/quicktime,video/*"
          className="hidden" 
          onChange={handleFileUpload}
        />
        
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full py-2.5 px-4 rounded-lg bg-[#0084ff] hover:bg-[#0070d8] active:bg-[#005fb8] text-white font-bold text-xs tracking-wide shadow-sm flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-50"
        >
          <UploadCloud size={16} className="shrink-0" />
          <span>{isUploading ? `Uploading ${uploadProgress}%...` : 'Upload Videos'}</span>
        </button>

        {/* Quick URL Embed Button */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowUrlInput(!showUrlInput)}
            className={`flex-1 py-1.5 px-3 rounded-lg border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
              showUrlInput 
                ? 'bg-[#0084ff]/10 border-[#0084ff] text-[#0084ff]' 
                : (isDark ? 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800' : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100')
            }`}
          >
            <LinkIcon size={12} />
            <span>{showUrlInput ? 'Hide URL Input' : 'Embed Video Link / URL'}</span>
          </button>
        </div>

        {/* URL Input Box */}
        {showUrlInput && (
          <div className={`p-2.5 rounded-lg border space-y-2 animate-fadeIn ${isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-50 border-zinc-200'}`}>
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              YouTube, Vimeo, Loom, or MP4 URL:
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddVideoFromUrl(); }}
                className={`flex-1 px-2.5 py-1.5 rounded text-xs outline-none border transition-all ${
                  isDark ? 'bg-zinc-800 border-zinc-700 text-white focus:border-[#0084ff]' : 'bg-white border-zinc-300 text-zinc-900 focus:border-[#0084ff]'
                }`}
              />
              <button
                onClick={handleAddVideoFromUrl}
                disabled={!urlInput.trim()}
                className="px-3 py-1.5 rounded bg-[#0084ff] text-white font-bold text-xs disabled:opacity-40 hover:bg-[#0070d8] transition-all"
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Tab Switcher: Uploaded vs Stock Videos */}
        <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800 pt-1">
          <button
            onClick={() => setActiveTab('uploads')}
            className={`flex-1 pb-1.5 text-xs font-bold transition-colors relative ${
              activeTab === 'uploads'
                ? 'text-[#0084ff]'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Uploaded ({uploadedVideos.length})
            {activeTab === 'uploads' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0084ff] rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={`flex-1 pb-1.5 text-xs font-bold transition-colors relative ${
              activeTab === 'stock'
                ? 'text-[#0084ff]'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            Stock Clips ({STOCK_VIDEOS.length})
            {activeTab === 'stock' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0084ff] rounded-t-full" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 custom-scrollbar">
        {activeTab === 'uploads' ? (
          <>
            {uploadedVideos.length === 0 ? (
              /* Canva Empty State Box Graphic matching Screenshot 2 */
              <div className="h-full flex flex-col items-center justify-center text-center py-10 px-4 space-y-3">
                {/* Minimalist Cute Box SVG matching Screenshot 2 */}
                <div className="relative w-28 h-24 flex items-center justify-center">
                  <svg width="100" height="85" viewBox="0 0 100 85" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Blue floating background circles */}
                    <circle cx="28" cy="22" r="3" fill="#0084ff" />
                    <circle cx="78" cy="24" r="4.5" stroke="#0084ff" strokeWidth="1.5" fill="none" />
                    <circle cx="48" cy="27" r="1.5" fill="#0084ff" opacity="0.6" />
                    
                    {/* Cardboard Box */}
                    {/* Left Flap */}
                    <path d="M18 42L25 24L37 38L18 42Z" fill="#0084ff" />
                    {/* Right Flap */}
                    <path d="M82 42L75 24L63 38L82 42Z" fill="#FFFFFF" stroke="#334155" strokeWidth="1.2" />
                    
                    {/* Main Box Face */}
                    <path d="M22 36L26 26H74L78 36L74 72H26L22 36Z" fill="#F8FAFC" stroke="#334155" strokeWidth="1.5" strokeLinejoin="round" />
                    
                    {/* Inner opening shading */}
                    <path d="M26 26L38 38H62L74 26H26Z" fill="#E2E8F0" stroke="#334155" strokeWidth="1.2" />
                    
                    {/* Front handle slot */}
                    <rect x="42" y="58" width="16" height="3" rx="1.5" fill="#94A3B8" />
                  </svg>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    You haven't uploaded materials yet!
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    MP4: &lt; 100MB each
                  </p>
                </div>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 text-xs font-bold text-[#0084ff] hover:underline"
                >
                  Upload your first video →
                </button>
              </div>
            ) : (
              /* Grid of Uploaded Videos */
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {filteredUploadedVideos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => insertVideoOnCanvas(video.url, video.posterUrl, video.title)}
                    className={`group relative rounded-lg border overflow-hidden cursor-pointer transition-all duration-150 hover:shadow-md hover:scale-[1.02] ${
                      isDark ? 'bg-zinc-900 border-zinc-800 hover:border-[#0084ff]' : 'bg-white border-zinc-200 hover:border-[#0084ff]'
                    }`}
                  >
                    <div className="aspect-video w-full bg-zinc-900 relative overflow-hidden flex items-center justify-center">
                      <img 
                        src={video.posterUrl} 
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          (e.target as any).src = 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&q=80&w=800';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-white/90 text-zinc-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play size={14} className="fill-current ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-bold text-white">
                        {video.duration}
                      </span>
                    </div>

                    <div className="p-2 flex items-center justify-between">
                      <span className="text-[11px] font-semibold truncate text-zinc-800 dark:text-zinc-200">
                        {video.title}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const updated = uploadedVideos.filter(v => v.id !== video.id);
                          saveUploadedVideos(updated);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 text-zinc-400 hover:text-red-500 transition-all"
                        title="Delete video"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Curated Stock Clips matching Screenshot 1 Hourglass & More */
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {filteredStockVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => insertVideoOnCanvas(video.url, video.thumbnail, video.title)}
                className={`group relative rounded-lg border overflow-hidden cursor-pointer transition-all duration-150 hover:shadow-md hover:scale-[1.02] ${
                  isDark ? 'bg-zinc-900 border-zinc-800 hover:border-[#0084ff]' : 'bg-white border-zinc-200 hover:border-[#0084ff]'
                }`}
                title={`Insert "${video.title}" onto canvas`}
              >
                <div className="aspect-video w-full bg-zinc-900 relative overflow-hidden flex items-center justify-center">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white/90 text-zinc-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play size={14} className="fill-current ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/75 text-[9px] font-bold text-white">
                    {video.duration}
                  </span>
                </div>

                <div className="p-2">
                  <span className="text-[11px] font-semibold truncate block text-zinc-800 dark:text-zinc-200">
                    {video.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Storage Footer Bar matching Screenshot 2 */}
      <div className={`p-3 border-t shrink-0 space-y-1.5 ${isDark ? 'border-zinc-800 bg-[#161618]' : 'border-zinc-200 bg-zinc-50'}`}>
        {/* Progress Bar */}
        <div className="w-full h-1 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
          <div 
            className="h-full bg-[#0084ff] rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, (totalUploadedSizeMb / 100) * 100))}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
            <span>{totalUploadedSizeMb}MB / 100MB</span>
            <Info size={11} className="cursor-pointer hover:text-zinc-300" />
          </div>

          <a 
            href="#pricing"
            onClick={(e) => {
              e.preventDefault();
              useStore.getState().setCurrentView('pricing');
            }}
            className="font-bold text-[#0084ff] hover:underline flex items-center gap-0.5"
          >
            <span>Upgrade</span>
            <ChevronRight size={11} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default VideosPanel;
