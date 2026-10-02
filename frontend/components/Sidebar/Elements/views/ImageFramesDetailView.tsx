import React, { useState } from 'react';
import { X, ChevronLeft, Search, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useStore } from '../../../../store/useStore';
import { ImageFrameTemplate } from '../types';
import { imageFrameTemplates } from '../templates/imageFrameTemplates';

interface ImageFramesDetailViewProps {
  isDark: boolean;
  onBack: () => void;
  onClose: () => void;
}

export const ImageFramesDetailView: React.FC<ImageFramesDetailViewProps> = ({
  isDark,
  onBack,
  onClose,
}) => {
  const { currentPageIndex, catalog, addElement, setSelectedElementIds } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = imageFrameTemplates.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInsertFrame = (template: ImageFrameTemplate) => {
    const activePage = catalog.pages[currentPageIndex];
    const pageWidth = activePage?.width || 794;
    const pageHeight = activePage?.height || 1123;

    const posX = Math.max(20, Math.round((pageWidth - template.width) / 2));
    const posY = Math.max(20, Math.round((pageHeight - template.height) / 2));

    const element = template.getCanvasElement(posX, posY);
    addElement(currentPageIndex, element);
    setSelectedElementIds([element.id]);
  };

  return (
    <div className={`h-full flex flex-col select-none ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-slate-900'}`}>
      {/* Header with Back Button */}
      <div className={`p-3.5 border-b flex items-center justify-between shrink-0 ${isDark ? 'border-[#222] bg-[#161616]' : 'border-slate-200 bg-slate-50'}`}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className={`p-1.5 rounded-lg border transition-all ${
              isDark 
                ? 'border-[#2d2d2d] bg-[#1e1e1e] hover:bg-[#282828] text-slate-300' 
                : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700 shadow-sm'
            }`}
          >
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
              <ImageIcon size={12} />
            </div>
            <h2 className="text-xs font-black tracking-wide">Image frames</h2>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className={`p-1 rounded hover:bg-black/10 transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-black'}`}
        >
          <X size={16} />
        </button>
      </div>

      {/* Search Input */}
      <div className={`p-3 border-b shrink-0 ${isDark ? 'border-[#222]' : 'border-slate-100'}`}>
        <div className="relative">
          <Search size={13} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search geometric frame shapes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-8 pr-7 py-1.5 rounded-md text-[11px] outline-none transition-all ${
              isDark 
                ? 'bg-[#1c1c1c] border border-[#2d2d2d] focus:border-emerald-500 text-white placeholder-slate-500' 
                : 'bg-slate-100 border border-slate-200 focus:border-emerald-500 text-slate-800 placeholder-slate-400'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Instructional Badge */}
      <div className="p-3 pb-0">
        <div className={`p-2 rounded-lg text-[10px] leading-relaxed flex items-start gap-2 border ${
          isDark ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <Sparkles size={13} className="shrink-0 mt-0.5 text-emerald-500" />
          <span>Click to insert a frame shape. Drag & drop any photo or product image over the frame to auto-mask.</span>
        </div>
      </div>

      {/* Geometric Frames Grid */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 custom-scrollbar">
        <div className="grid grid-cols-2 gap-3">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => handleInsertFrame(template)}
              className={`group rounded-xl border p-2.5 flex flex-col items-center justify-between cursor-pointer transition-all duration-150 hover:shadow-lg hover:scale-[1.02] aspect-[5/4] relative overflow-hidden ${
                isDark 
                  ? 'bg-[#181818] border-[#2a2a2a] hover:border-emerald-500 hover:bg-[#1e1e1e]' 
                  : 'bg-white border-slate-200 hover:border-emerald-500 hover:shadow-slate-200'
              }`}
              title={`Insert "${template.title}" onto active page`}
            >
              <div 
                className="w-full flex-1 flex items-center justify-center pointer-events-none p-1"
                dangerouslySetInnerHTML={{ __html: template.getSvg(isDark) }}
              />
              <span className={`text-[10px] font-bold mt-1 text-center truncate w-full group-hover:text-emerald-500 transition-colors ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}>
                {template.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
