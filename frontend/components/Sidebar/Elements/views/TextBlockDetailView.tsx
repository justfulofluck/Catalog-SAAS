import React, { useState } from 'react';
import { Search, X, ChevronLeft, Info } from 'lucide-react';
import { useStore } from '../../../../store/useStore';
import { TextBlockTemplate } from '../types';
import { textBlockTemplates } from '../templates/textBlockTemplates';

interface TextBlockDetailViewProps {
  isDark: boolean;
  onBack: () => void;
  onClose: () => void;
}

export const TextBlockDetailView: React.FC<TextBlockDetailViewProps> = ({
  isDark,
  onBack,
  onClose,
}) => {
  const { currentPageIndex, addElements } = useStore();
  const [textBlockSearch, setTextBlockSearch] = useState('');

  const filteredTextBlockTemplates = textBlockTemplates.filter((t) =>
    t.title.toLowerCase().includes(textBlockSearch.toLowerCase())
  );

  const handleInsertTextBlock = (template: TextBlockTemplate) => {
    const groupId = `group-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const elements = template.getCanvasElements(groupId);
    addElements(currentPageIndex, elements);
  };

  return (
    <div className={`h-full flex flex-col select-none ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-slate-900'}`}>
      {/* Header with Back Button */}
      <div className={`p-3 border-b flex items-center justify-between shrink-0 ${isDark ? 'border-[#222] bg-[#161616]' : 'border-slate-200 bg-slate-50'}`}>
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
          <h2 className="text-xs font-black tracking-wide">Text blocks</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className={`p-1 rounded hover:bg-black/10 transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-black'}`}
        >
          <X size={16} />
        </button>
      </div>

      {/* Search Bar for Text Blocks */}
      <div className={`p-3 border-b shrink-0 ${isDark ? 'border-[#222]' : 'border-slate-100'}`}>
        <div className="relative">
          <Search size={13} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search text block presets..."
            value={textBlockSearch}
            onChange={(e) => setTextBlockSearch(e.target.value)}
            className={`w-full pl-8 pr-7 py-1.5 rounded-md text-[11px] outline-none transition-all ${
              isDark 
                ? 'bg-[#1c1c1c] border border-[#2d2d2d] focus:border-[#0F3D3E] text-white placeholder-slate-500' 
                : 'bg-slate-100 border border-slate-200 focus:border-[#0F3D3E] text-slate-800 placeholder-slate-400'
            }`}
          />
          {textBlockSearch && (
            <button
              onClick={() => setTextBlockSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Text Block Cards 2-Column Grid */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3 custom-scrollbar">
        <div className="grid grid-cols-2 gap-3">
          {filteredTextBlockTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => handleInsertTextBlock(template)}
              className={`group rounded-xl border p-2 h-28 flex flex-col items-center justify-center cursor-pointer transition-all duration-150 hover:shadow-lg hover:scale-[1.02] relative overflow-hidden ${
                isDark 
                  ? 'bg-[#181818] border-[#262626] hover:border-[#00a651] hover:bg-[#1d1d1d]' 
                  : 'bg-white border-slate-200 hover:border-[#00a651] hover:shadow-slate-200'
              }`}
              title="Click to add to canvas"
            >
              <div 
                className="w-full h-full flex items-center justify-center pointer-events-none"
                dangerouslySetInnerHTML={{ __html: template.getSvg() }}
              />
            </div>
          ))}
        </div>

        {filteredTextBlockTemplates.length === 0 && (
          <div className="py-12 text-center space-y-2 text-slate-500">
            <Info size={24} className="mx-auto text-slate-400" />
            <p className="text-xs font-bold">No text blocks match your search</p>
          </div>
        )}
      </div>

      {/* Footer Prompt */}
      <div className={`p-2.5 border-t text-center text-[9px] shrink-0 ${
        isDark ? 'border-[#222] bg-[#141414] text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
      }`}>
        <p className="font-semibold">💡 Click any text block to insert 100% pixel-perfect onto Page {currentPageIndex + 1}</p>
      </div>
    </div>
  );
};
