import React from 'react';
import { Sparkles, Plus, X } from 'lucide-react';
import { ProductGridSection } from '../../../types';

interface GridTopBarProps {
  targetPageIndex: number;
  sections: ProductGridSection[];
  handleAddSection: () => void;
  onClose: () => void;
}

export const GridTopBar: React.FC<GridTopBarProps> = ({
  targetPageIndex,
  sections,
  handleAddSection,
  onClose,
}) => {
  return (
    <div className="px-6 py-4 border-b border-[#262626] flex items-center justify-between bg-[#161616] shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-[4px] bg-[#0F3D3E] flex items-center justify-center text-[#E2DCC8] shadow-md shadow-[#0F3D3E]/30">
          <Sparkles size={18} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-white">
              3-Product Grid Studio
            </h3>
            <span className="px-2 py-0.5 rounded-[4px] bg-[#0F3D3E]/40 border border-[#0F3D3E] text-[#E2DCC8] text-[9px] font-mono font-bold uppercase">
              Page {targetPageIndex + 1}
            </span>
          </div>
          <p className="text-[10px] text-[#888888] font-medium">
            Design, reorder & auto-align 3 product blocks (Image + Title + Specs Table + Highlight Stripes)
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {sections.length < 4 && (
          <button
            type="button"
            onClick={handleAddSection}
            className="px-3 py-1.5 bg-[#1f1f1f] hover:bg-[#282828] border border-[#333] text-slate-200 rounded-[4px] text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Plus size={13} />
            <span>Add Section ({sections.length}/4)</span>
          </button>
        )}

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-[4px] text-[#888] hover:text-white hover:bg-[#222] transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};
