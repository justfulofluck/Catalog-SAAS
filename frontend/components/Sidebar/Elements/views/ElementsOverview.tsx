import React from 'react';
import { Compass, X } from 'lucide-react';
import { ELEMENT_ITEMS } from '../elementItems';
import { ElementCardPreview } from '../ElementCardPreview';

interface ElementsOverviewProps {
  isDark: boolean;
  onSelectCategory: (categoryId: string) => void;
  onClose: () => void;
}

export const ElementsOverview: React.FC<ElementsOverviewProps> = ({
  isDark,
  onSelectCategory,
  onClose,
}) => {
  const basicItems = ELEMENT_ITEMS.filter((i) => i.category === 'basic');
  const interactiveItems = ELEMENT_ITEMS.filter((i) => i.category === 'interactive' || i.category === 'decorative');

  return (
    <div className={`h-full flex flex-col select-none ${isDark ? 'bg-[#121212] text-white' : 'bg-white text-slate-900'}`}>
      {/* Top Header */}
      <div className={`p-3.5 border-b flex items-center justify-between shrink-0 ${isDark ? 'border-[#222] bg-[#161616]' : 'border-slate-200 bg-slate-50'}`}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#0F3D3E] text-[#E2DCC8] flex items-center justify-center shadow-sm">
            <Compass size={16} />
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider">Elements</h2>
            <p className={`text-[9px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Rich building blocks & components
            </p>
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

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-5 custom-scrollbar">
        {/* Section 1: Basic Elements */}
        {basicItems.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                Basic elements
              </h3>
              <span className={`text-[9px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {basicItems.length} categories
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {basicItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectCategory(item.id)}
                  className={`group rounded-xl border p-2 flex flex-col items-center justify-between cursor-pointer transition-all duration-150 hover:shadow-md hover:scale-[1.01] relative ${
                    isDark 
                      ? 'bg-[#181818] border-[#262626] hover:border-[#0F3D3E] hover:bg-[#1d1d1d]' 
                      : 'bg-white border-slate-200 hover:border-[#0F3D3E] hover:shadow-slate-200'
                  }`}
                >
                  {item.badge && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-bold bg-[#0F3D3E] text-[#E2DCC8]">
                      {item.badge}
                    </span>
                  )}
                  <ElementCardPreview previewType={item.previewType} isDark={isDark} />
                  <span className={`text-[11px] font-bold mt-1 text-center group-hover:text-[#00a651] transition-colors ${
                    isDark ? 'text-slate-200' : 'text-slate-800'
                  }`}>
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Interactive Elements */}
        {interactiveItems.length > 0 && (
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between">
              <h3 className={`text-[11px] font-black uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                Interactive elements
              </h3>
              <span className={`text-[9px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {interactiveItems.length} categories
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {interactiveItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectCategory(item.id)}
                  className={`group rounded-xl border p-2 flex flex-col items-center justify-between cursor-pointer transition-all duration-150 hover:shadow-md hover:scale-[1.01] relative ${
                    isDark 
                      ? 'bg-[#181818] border-[#262626] hover:border-[#0F3D3E] hover:bg-[#1d1d1d]' 
                      : 'bg-white border-slate-200 hover:border-[#0F3D3E] hover:shadow-slate-200'
                  }`}
                >
                  {item.badge && (
                    <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-bold bg-[#00a651] text-white">
                      {item.badge}
                    </span>
                  )}
                  <ElementCardPreview previewType={item.previewType} isDark={isDark} />
                  <span className={`text-[11px] font-bold mt-1 text-center group-hover:text-[#00a651] transition-colors ${
                    isDark ? 'text-slate-200' : 'text-slate-800'
                  }`}>
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info Notice */}
      <div className={`p-2.5 border-t text-center text-[9px] shrink-0 ${
        isDark ? 'border-[#222] bg-[#141414] text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
      }`}>
        <p className="font-semibold">✨ Click any element category to explore & insert blocks</p>
      </div>
    </div>
  );
};
