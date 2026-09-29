import React, { useState, useRef } from 'react';
import { 
  Search, 
  X, 
  UploadCloud, 
  Link as LinkIcon, 
  Play, 
  Film, 
  Trash2,
  ChevronLeft
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { CanvasElement } from '../../types';
import { 
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
  const { uiTheme, setSidebarExpanded, currentPageIndex, addElements, setEditorTab } = useStore();
  const isDark = propIsDark !== undefined ? propIsDark : uiTheme === 'dark';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local state for uploaded videos (persisted in session/localStorage)
  const [uploadedVideos, setUploadedVideos] = useState<UploadedVideoItem[]>(() => {
    try {
      const saved = localStorage.getItem('catalog_saas_uploaded_videos');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

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
      setEditorTab(null);
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

  const filteredUploadedVideos = uploadedVideos.filter(v =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`h-full flex flex-col select-none font-sans transition-colors ${isDark ? 'bg-[#161616] text-white' : 'bg-white text-slate-800'}`}>
      {/* Top Header Bar matching Application Theme */}
      <div className={`h-14 px-3 py-2 border-b flex items-center justify-between shrink-0 transition-colors ${
        isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className={`p-1.5 rounded-[4px] transition-colors ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-[#222]' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
              }`}
              title="Back"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          <div className="w-7 h-7 rounded-[4px] bg-[#0F3D3E] flex items-center justify-center text-[#E2DCC8] shadow-sm shrink-0">
            <Film size={15} />
          </div>
          <div>
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Videos & Embeds
            </h3>
            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${
              isDark ? 'text-[#00a651] bg-[#00a651]/10 border-[#00a651]/20' : 'text-[#0F3D3E] bg-teal-50 border-teal-200'
            }`}>
              Target: Page {currentPageIndex + 1}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
            isDark ? 'text-[#E2DCC8]/70 bg-[#1e1e1e] border-[#333]' : 'text-slate-600 bg-slate-100 border-slate-200'
          }`}>
            {uploadedVideos.length} {uploadedVideos.length === 1 ? 'video' : 'videos'}
          </span>
          <button
            type="button"
            onClick={handleClose}
            className={`p-1.5 rounded-[4px] transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-[#222]' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title="Close Panel"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className={`p-3 pb-2 shrink-0 ${isDark ? 'bg-[#161616]' : 'bg-white'}`}>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search your videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full border rounded-[4px] pl-9 pr-8 py-1.5 text-xs outline-none transition-colors ${
              isDark 
                ? 'bg-[#1a1a1a] border-[#333] focus:border-[#0F3D3E] text-[#F1F1F1] placeholder:text-slate-500' 
                : 'bg-slate-50 border-slate-200 focus:border-[#0F3D3E] text-slate-900 placeholder:text-slate-400'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="px-3 pb-2 shrink-0 space-y-2 border-b border-[#262626]/40 dark:border-[#262626]">
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
          className="w-full py-2.5 px-4 rounded-[4px] bg-[#0F3D3E] hover:bg-[#155455] active:bg-[#0b2f30] text-[#E2DCC8] border border-[#E2DCC8]/30 font-bold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-50"
        >
          <UploadCloud size={16} className="shrink-0 text-[#00a651]" />
          <span>{isUploading ? `Uploading ${uploadProgress}%...` : 'Upload Videos'}</span>
        </button>

        {/* Quick URL Embed Button */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowUrlInput(!showUrlInput)}
            className={`flex-1 py-1.5 px-3 rounded-[4px] border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
              showUrlInput 
                ? 'bg-[#0F3D3E]/20 border-[#00a651] text-[#00a651]' 
                : (isDark ? 'border-[#333] bg-[#1a1a1a] text-slate-300 hover:bg-[#222]' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100')
            }`}
          >
            <LinkIcon size={12} className={showUrlInput ? 'text-[#00a651]' : 'text-slate-400'} />
            <span>{showUrlInput ? 'Hide URL Input' : 'Embed Video Link / URL'}</span>
          </button>
        </div>

        {/* URL Input Box */}
        {showUrlInput && (
          <div className={`p-2.5 rounded-[4px] border space-y-2 animate-fadeIn ${isDark ? 'bg-[#141414] border-[#262626]' : 'bg-slate-50 border-slate-200'}`}>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              YouTube, Vimeo, Loom, or MP4 URL:
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleAddVideoFromUrl(); }}
                className={`flex-1 px-2.5 py-1.5 rounded-[4px] text-xs outline-none border transition-all ${
                  isDark ? 'bg-[#1a1a1a] border-[#333] text-white focus:border-[#00a651]' : 'bg-white border-slate-300 text-slate-900 focus:border-[#0F3D3E]'
                }`}
              />
              <button
                onClick={handleAddVideoFromUrl}
                disabled={!urlInput.trim()}
                className="px-3 py-1.5 rounded-[4px] bg-[#0F3D3E] text-[#E2DCC8] border border-[#E2DCC8]/30 font-bold text-xs uppercase tracking-wider disabled:opacity-40 hover:bg-[#155455] transition-all"
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
        {uploadedVideos.length === 0 ? (
          /* Empty State Box Graphic matching Theme */
          <div className="h-full flex flex-col items-center justify-center text-center py-10 px-4 space-y-3">
            <div className="relative w-28 h-24 flex items-center justify-center">
              <svg width="100" height="85" viewBox="0 0 100 85" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="28" cy="22" r="3" fill="#00a651" />
                <circle cx="78" cy="24" r="4.5" stroke="#00a651" strokeWidth="1.5" fill="none" />
                <circle cx="48" cy="27" r="1.5" fill="#00a651" opacity="0.6" />
                
                {/* Cardboard Box styled in Theme */}
                <path d="M18 42L25 24L37 38L18 42Z" fill="#0F3D3E" />
                <path d="M82 42L75 24L63 38L82 42Z" fill="#E2DCC8" stroke="#0F3D3E" strokeWidth="1.2" />
                <path d="M22 36L26 26H74L78 36L74 72H26L22 36Z" fill={isDark ? "#1e1e1e" : "#F8FAFC"} stroke="#0F3D3E" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M26 26L38 38H62L74 26H26Z" fill={isDark ? "#2a2a2a" : "#E2E8F0"} stroke="#0F3D3E" strokeWidth="1.2" />
                <rect x="42" y="58" width="16" height="3" rx="1.5" fill="#00a651" />
              </svg>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                You haven't uploaded videos yet!
              </p>
              <p className="text-[11px] text-slate-400">
                MP4, WebM &lt; 100MB each or Embed URLs
              </p>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-xs font-bold text-[#00a651] hover:underline"
            >
              Upload your first video →
            </button>
          </div>
        ) : (
          /* Grid of Uploaded / Embedded Videos */
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {filteredUploadedVideos.map((video) => (
              <div
                key={video.id}
                onClick={() => insertVideoOnCanvas(video.url, video.posterUrl, video.title)}
                className={`group relative rounded-[4px] border overflow-hidden cursor-pointer transition-all duration-150 hover:shadow-md hover:scale-[1.02] ${
                  isDark ? 'bg-[#1a1a1a] border-[#262626] hover:border-[#00a651]' : 'bg-white border-slate-200 hover:border-[#0F3D3E]'
                }`}
              >
                <div className="aspect-video w-full bg-black/40 relative overflow-hidden flex items-center justify-center">
                  <img 
                    src={video.posterUrl} 
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      (e.target as any).src = 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&q=80&w=800';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-[#0F3D3E]/90 text-[#E2DCC8] border border-[#E2DCC8]/40 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play size={14} className="fill-current ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-[3px] bg-[#0F3D3E]/90 text-[#E2DCC8] border border-[#E2DCC8]/20 text-[9px] font-mono font-bold">
                    {video.duration}
                  </span>
                </div>

                <div className="p-2 flex items-center justify-between">
                  <span className="text-[11px] font-semibold truncate text-slate-800 dark:text-slate-200">
                    {video.title}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const updated = uploadedVideos.filter(v => v.id !== video.id);
                      saveUploadedVideos(updated);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-all"
                    title="Delete video"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideosPanel;

