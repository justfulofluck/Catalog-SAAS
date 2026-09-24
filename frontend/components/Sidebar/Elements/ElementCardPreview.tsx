import React from 'react';
import { 
  Sparkles, 
  Layers, 
  QrCode, 
  Video, 
  Image as ImageIcon, 
  MessageSquare, 
  Award 
} from 'lucide-react';

interface ElementCardPreviewProps {
  previewType: string;
  isDark?: boolean;
}

export const ElementCardPreview: React.FC<ElementCardPreviewProps> = ({ previewType, isDark = false }) => {
  switch (previewType) {
    case 'text-block':
      return (
        <div className="w-full h-24 flex flex-col items-center justify-center p-2 text-center select-none">
          <span className="text-[14px] font-black tracking-widest uppercase font-serif leading-none" style={{ color: isDark ? '#ffffff' : '#111827' }}>
            DEAL
          </span>
          <div className="flex items-center gap-1 my-0.5">
            <span className="h-[1px] w-3 bg-current opacity-40"></span>
            <span className="text-[8px] italic font-serif opacity-70">of the</span>
            <span className="h-[1px] w-3 bg-current opacity-40"></span>
          </div>
          <span className="text-[16px] font-black tracking-wider uppercase font-serif leading-none" style={{ color: isDark ? '#ffffff' : '#111827' }}>
            DAY
          </span>
        </div>
      );

    case 'lists':
      return (
        <div className="w-full h-24 flex flex-col justify-center px-3 gap-1.5 select-none">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-[7px] font-bold text-white shrink-0">
              1
            </div>
            <div className="flex-1 space-y-0.5">
              <div className="h-1.5 w-12 bg-amber-500/80 rounded-full"></div>
              <div className="h-1 w-8 bg-slate-400/40 rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center text-[7px] font-bold text-white shrink-0">
              2
            </div>
            <div className="flex-1 space-y-0.5">
              <div className="h-1.5 w-14 bg-orange-500/80 rounded-full"></div>
              <div className="h-1 w-10 bg-slate-400/40 rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[7px] font-bold text-white shrink-0">
              3
            </div>
            <div className="flex-1 space-y-0.5">
              <div className="h-1.5 w-10 bg-blue-500/80 rounded-full"></div>
              <div className="h-1 w-6 bg-slate-400/40 rounded-full"></div>
            </div>
          </div>
        </div>
      );

    case 'image-frames':
      return (
        <div className="w-full h-24 flex items-center justify-center relative select-none">
          <div className="w-12 h-12 rounded-full border-2 border-dashed border-emerald-500/80 bg-emerald-500/10 flex items-center justify-center overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-emerald-500/30 flex items-center justify-center">
              <ImageIcon size={14} className="text-emerald-500" />
            </div>
          </div>
          <div className="w-8 h-8 rounded-full border-2 border-emerald-400 bg-emerald-400/20 absolute bottom-2 right-4 flex items-center justify-center shadow-md">
            <Sparkles size={10} className="text-emerald-500" />
          </div>
        </div>
      );

    case 'smart-visuals':
      return (
        <div className="w-full h-24 flex items-center justify-center px-2 select-none">
          <div className="flex items-center -space-x-1 w-full justify-center">
            {['1', '2', '3', '4'].map((step, idx) => {
              const colors = ['bg-blue-600', 'bg-indigo-600', 'bg-teal-600', 'bg-emerald-600'];
              return (
                <div
                  key={step}
                  className={`h-7 flex-1 ${colors[idx]} text-white text-[8px] font-bold flex items-center justify-center relative shadow-sm`}
                  style={{
                    clipPath: idx === 0 
                      ? 'polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%)'
                      : idx === 3
                      ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 15% 50%)'
                      : 'polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%, 15% 50%)'
                  }}
                >
                  <span className="z-10">{step}</span>
                </div>
              );
            })}
          </div>
        </div>
      );

    case 'image-grids':
      return (
        <div className="w-full h-24 flex items-center justify-center select-none">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <div className="w-8 h-8 rotate-45 border-2 border-cyan-500 bg-cyan-500/20 absolute -top-1 left-3 flex items-center justify-center shadow-sm">
              <ImageIcon size={10} className="text-cyan-500 -rotate-45" />
            </div>
            <div className="w-8 h-8 rotate-45 border-2 border-blue-500 bg-blue-500/20 absolute -bottom-1 left-3 flex items-center justify-center shadow-sm">
              <ImageIcon size={10} className="text-blue-500 -rotate-45" />
            </div>
          </div>
        </div>
      );

    case 'qr-code':
      return (
        <div className="w-full h-24 flex items-center justify-center select-none">
          <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/30">
            <QrCode size={40} className="text-orange-500" />
          </div>
        </div>
      );

    case 'checklist':
      return (
        <div className="w-full h-24 flex flex-col justify-center px-3 gap-1.5 select-none">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
              <span className="text-[8px] font-black leading-none">✓</span>
            </div>
            <div className="h-1.5 flex-1 bg-slate-400/40 rounded-full"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
              <span className="text-[8px] font-black leading-none">✓</span>
            </div>
            <div className="h-1.5 flex-1 bg-slate-400/40 rounded-full"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full border border-slate-400"></div>
            <div className="h-1.5 w-12 bg-slate-400/30 rounded-full"></div>
          </div>
        </div>
      );

    case 'video-embed':
      return (
        <div className="w-full h-24 flex items-center justify-center select-none">
          <div className="w-16 h-12 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center shadow-md text-white">
            <div className="w-6 h-6 rounded-full bg-white/90 text-orange-600 flex items-center justify-center shadow">
              <Video size={12} className="ml-0.5" />
            </div>
          </div>
        </div>
      );

    case 'gif':
      return (
        <div className="w-full h-24 flex items-center justify-center select-none">
          <div className="w-16 h-12 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex flex-col items-center justify-between p-1.5 text-white shadow-md">
            <ImageIcon size={14} className="text-white/80" />
            <span className="px-1.5 py-0.2 bg-white text-orange-600 rounded text-[7px] font-black uppercase tracking-wider">
              GIF
            </span>
          </div>
        </div>
      );

    case 'callouts':
      return (
        <div className="w-full h-24 flex items-center justify-center select-none">
          <div className="w-20 p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 relative text-indigo-400">
            <div className="h-1.5 w-12 bg-indigo-400/80 rounded-full mb-1"></div>
            <div className="h-1 w-8 bg-indigo-400/40 rounded-full"></div>
            <MessageSquare size={12} className="absolute -top-1.5 -right-1.5 text-indigo-500" />
          </div>
        </div>
      );

    case 'badges':
      return (
        <div className="w-full h-24 flex items-center justify-center select-none">
          <div className="p-2.5 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg flex items-center justify-center">
            <Award size={22} />
          </div>
        </div>
      );

    default:
      return (
        <div className="w-full h-24 flex items-center justify-center text-slate-400">
          <Layers size={24} />
        </div>
      );
  }
};
