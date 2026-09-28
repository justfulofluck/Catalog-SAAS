import React from 'react';
import { X, ChevronLeft, Table as TableIcon } from 'lucide-react';
import { useStore } from '../../../../store/useStore';
import { TableTemplate, tableTemplates } from '../templates/tableTemplates';

interface TablesDetailViewProps {
  isDark: boolean;
  onBack: () => void;
  onClose: () => void;
}

export const TablesDetailView: React.FC<TablesDetailViewProps> = ({
  isDark,
  onBack,
  onClose,
}) => {
  const { currentPageIndex, addElements } = useStore();

  const handleInsertTable = (template: TableTemplate) => {
    const groupId = `group-tbl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
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
          <div className="flex items-center gap-1.5">
            <TableIcon size={14} className="text-[#8B5CF6]" />
            <h2 className="text-xs font-black tracking-wide">Tables</h2>
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

      {/* Core Table Style Presets Grid */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        <div className="grid grid-cols-2 gap-3">
          {tableTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => handleInsertTable(template)}
              className={`group rounded-xl border p-2.5 flex flex-col items-center justify-between cursor-pointer transition-all duration-150 hover:shadow-md hover:scale-[1.02] aspect-[5/4] relative overflow-hidden ${
                isDark 
                  ? 'bg-[#181818] border-[#2a2a2a] hover:border-[#8B5CF6] hover:bg-[#202020]' 
                  : 'bg-white border-slate-200 hover:border-[#8B5CF6] hover:shadow-slate-200'
              }`}
              title={`Insert "${template.title}" onto canvas`}
            >
              <div 
                className="w-full flex-1 flex items-center justify-center pointer-events-none p-1"
                dangerouslySetInnerHTML={{ __html: template.getSvg() }}
              />
              <span className={`text-[10px] font-bold tracking-tight text-center mt-1 truncate w-full ${
                isDark ? 'text-slate-300 group-hover:text-white' : 'text-slate-700 group-hover:text-[#8B5CF6]'
              }`}>
                {template.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info Notice */}
      <div className={`p-2.5 border-t text-center text-[9px] shrink-0 ${
        isDark ? 'border-[#222] bg-[#141414] text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-500'
      }`}>
        <p className="font-semibold">✨ Click any table to insert onto Page {currentPageIndex + 1}</p>
      </div>
    </div>
  );
};
