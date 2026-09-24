import React, { useState } from 'react';
import { Search, X, ChevronLeft, Info } from 'lucide-react';
import { useStore } from '../../../../store/useStore';
import { ChecklistTemplate } from '../types';
import { checklistTemplates } from '../templates/checklistTemplates';

interface ChecklistDetailViewProps {
  isDark: boolean;
  onBack: () => void;
  onClose: () => void;
}

export const ChecklistDetailView: React.FC<ChecklistDetailViewProps> = ({
  isDark,
  onBack,
  onClose,
}) => {
  const { currentPageIndex, addElements } = useStore();
  const [checklistSearch, setChecklistSearch] = useState('');

  const filteredChecklistTemplates = checklistTemplates.filter((t) =>
    t.title.toLowerCase().includes(checklistSearch.toLowerCase())
  );

  const handleInsertChecklist = (template: ChecklistTemplate) => {
    const groupId = `group-chk-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
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
          <h2 className="text-xs font-black tracking-wide">Checklist</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className={`p-1 rounded hover:bg-black/10 transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-black'}`}
        >
          <X size={16} />
        </button>
      </div>

      {/* Search Bar for Checklist Templates */}
      <div className={`p-3 border-b shrink-0 ${isDark ? 'border-[#222]' : 'border-slate-100'}`}>
        <div className="relative">
          <Search size={13} className={`absolute left-2.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search checklist styles..."
            value={checklistSearch}
            onChange={(e) => setChecklistSearch(e.target.value)}
            className={`w-full pl-8 pr-7 py-1.5 rounded-md text-[11px] outline-none transition-all ${
              isDark 
                ? 'bg-[#1c1c1c] border border-[#2d2d2d] focus:border-[#0F3D3E] text-white placeholder-slate-500' 
                : 'bg-slate-100 border border-slate-200 focus:border-[#0F3D3E] text-slate-800 placeholder-slate-400'
            }`}
          />
          {checklistSearch && (
            <button
              onClick={() => setChecklistSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Checklist Templates 1-Column Feed (Matching Screenshot 2 & 3) */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 custom-scrollbar">
        {filteredChecklistTemplates.map((template) => (
          <div
            key={template.id}
            onClick={() => handleInsertChecklist(template)}
            className={`group rounded-xl border p-3.5 flex flex-col items-center justify-center cursor-pointer transition-all duration-150 hover:shadow-lg hover:scale-[1.01] relative overflow-hidden ${
              isDark 
                ? 'bg-[#181818] border-[#262626] hover:border-[#00a651] hover:bg-[#1d1d1d]' 
                : 'bg-white border-slate-200 hover:border-[#00a651] hover:shadow-slate-200'
            }`}
            title={`Insert "${template.title}" onto canvas`}
          >
            <div 
              className="w-full flex items-center justify-center pointer-events-none"
              dangerouslySetInnerHTML={{ __html: template.getSvg() }}
            />
          </div>
        ))}

        {filteredChecklistTemplates.length === 0 && (
          <div className="py-12 text-center space-y-2 text-slate-500">
            <Info size={24} className="mx-auto text-slate-400" />
            <p className="text-xs font-bold">No checklist templates match your search</p>
          </div>
        )}
      </div>

      {/* Footer Info Notice */}
      <div className={`p-2.5 border-t text-center text-[9px] shrink-0 ${
        isDark ? 'border-[#222] bg-[#141414] text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
      }`}>
        <p className="font-semibold">💡 Click any checklist to insert 100% editable vector items onto Page {currentPageIndex + 1}</p>
      </div>
    </div>
  );
};
