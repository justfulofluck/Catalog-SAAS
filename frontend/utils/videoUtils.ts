/**
 * Video Utilities for Canva-style Video Embedding and Uploading
 */

export interface ParsedVideoInfo {
  type: 'youtube' | 'vimeo' | 'loom' | 'direct' | 'custom';
  videoId?: string;
  embedUrl: string;
  posterUrl: string;
  originalUrl: string;
}

export interface StockVideoItem {
  id: string;
  title: string;
  duration: string;
  category: string;
  thumbnail: string;
  url: string;
  aspectRatio: number; // e.g. 16/9
}

export const STOCK_VIDEOS: StockVideoItem[] = [
  {
    id: 'stock-vid-hourglass',
    title: 'Golden Hourglass Time Flow',
    duration: '0:15',
    category: 'abstract',
    thumbnail: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&q=80&w=800',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-sand-flowing-in-an-hourglass-42861-large.mp4',
    aspectRatio: 16 / 9,
  },
  {
    id: 'stock-vid-ocean-sunset',
    title: 'Sunset Waves & Coastline',
    duration: '0:20',
    category: 'nature',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-waves-coming-to-the-beach-5016-large.mp4',
    aspectRatio: 16 / 9,
  },
  {
    id: 'stock-vid-tech-code',
    title: 'Modern Tech Cyber Stream',
    duration: '0:18',
    category: 'tech',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-software-developer-working-on-code-screen-close-up-41551-large.mp4',
    aspectRatio: 16 / 9,
  },
  {
    id: 'stock-vid-business',
    title: 'Corporate Strategy Meeting',
    duration: '0:25',
    category: 'business',
    thumbnail: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=800',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-team-working-on-a-table-42831-large.mp4',
    aspectRatio: 16 / 9,
  },
  {
    id: 'stock-vid-gold-luxury',
    title: 'Luxury Gold Shimmering Bokeh',
    duration: '0:12',
    category: 'luxury',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-golden-bokeh-lights-background-40096-large.mp4',
    aspectRatio: 16 / 9,
  },
  {
    id: 'stock-vid-mountain',
    title: 'Cinematic Mountain Drone View',
    duration: '0:22',
    category: 'nature',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-green-mountain-range-42770-large.mp4',
    aspectRatio: 16 / 9,
  },
];

/**
 * Parses any video link (YouTube, Vimeo, Loom, MP4/WebM URL) into standardized metadata.
 */
export function parseVideoUrl(inputUrl: string): ParsedVideoInfo {
  const url = (inputUrl || '').trim();
  if (!url) {
    return {
      type: 'direct',
      embedUrl: '',
      posterUrl: '',
      originalUrl: '',
    };
  }

  // 1. YouTube
  const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      type: 'youtube',
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=1&rel=0`,
      posterUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      originalUrl: url,
    };
  }

  // 2. Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    const videoId = vimeoMatch[1];
    return {
      type: 'vimeo',
      videoId,
      embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=1&muted=1&loop=1&autopause=0`,
      posterUrl: `https://vumbnail.com/${videoId}.jpg`,
      originalUrl: url,
    };
  }

  // 3. Loom
  const loomMatch = url.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9]+)/i);
  if (loomMatch && loomMatch[1]) {
    const videoId = loomMatch[1];
    return {
      type: 'loom',
      videoId,
      embedUrl: `https://www.loom.com/embed/${videoId}`,
      posterUrl: `https://cdn.loom.com/sessions/thumbnails/${videoId}-with-play.gif`,
      originalUrl: url,
    };
  }

  // 4. Direct video URL / fallback
  return {
    type: 'direct',
    embedUrl: url,
    posterUrl: url,
    originalUrl: url,
  };
}

/**
 * Extracts a thumbnail poster frame from a local video File or Blob.
 */
export async function generateVideoThumbnailFromBlob(videoBlobOrUrl: Blob | string): Promise<{ posterUrl: string; duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';

    const url = typeof videoBlobOrUrl === 'string' ? videoBlobOrUrl : URL.createObjectURL(videoBlobOrUrl);
    video.src = url;

    const timeoutId = setTimeout(() => {
      if (typeof videoBlobOrUrl !== 'string') {
        // Fallback default poster if video decoding takes too long
        resolve({
          posterUrl: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&q=80&w=800',
          duration: 0,
          width: 640,
          height: 360,
        });
      }
    }, 6000);

    video.onloadedmetadata = () => {
      // Seek to 0.5s or 25% of the video to capture a good frame
      const seekTime = Math.min(0.5, video.duration > 1 ? 0.5 : 0.1);
      video.currentTime = seekTime;
    };

    video.onseeked = () => {
      clearTimeout(timeoutId);
      try {
        const vw = video.videoWidth || 640;
        const vh = video.videoHeight || 360;
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(vw, 800);
        canvas.height = Math.round(canvas.width * (vh / vw));

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const posterUrl = canvas.toDataURL('image/jpeg', 0.88);
          resolve({
            posterUrl,
            duration: video.duration || 0,
            width: vw,
            height: vh,
          });
        } else {
          resolve({
            posterUrl: url,
            duration: video.duration || 0,
            width: vw,
            height: vh,
          });
        }
      } catch (err) {
        console.warn('Could not extract canvas frame from video:', err);
        resolve({
          posterUrl: url,
          duration: video.duration || 0,
          width: 640,
          height: 360,
        });
      }
    };

    video.onerror = (e) => {
      clearTimeout(timeoutId);
      console.warn('Video failed to load for thumbnail extraction:', e);
      resolve({
        posterUrl: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&q=80&w=800',
        duration: 0,
        width: 640,
        height: 360,
      });
    };
  });
}
