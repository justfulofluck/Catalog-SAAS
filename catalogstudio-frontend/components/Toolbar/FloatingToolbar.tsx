
import React from 'react';
import { 
  Sparkles,
  Link as LinkIcon,
  MessageSquare,
  Lock,
  Unlock,
  MoreHorizontal,
  GripVertical,
  Trash2
} from 'lucide-react';
import { useStore } from '../../store/useStore';

interface Props {
  onOpenMenu: (x: number, y: number) => void;
}

const FloatingToolbar: React.FC<Props> = ({ onOpenMenu }) => {
  const { 
    catalog, 
    currentPageIndex, 
    selectedElementIds, 
    zoom, 
    toggleLock,
    removeProductFromPage
  } = useStore();

  const currentPage = catalog.pages[currentPageIndex];
  const selectedElements = currentPage?.elements.filter(el => selectedElementIds.includes(el.id)) || [];
  
  if (selectedElements.length === 0) return null;

  // Position based on the first selected element
  const element = selectedElements[0];
  const isAnyLocked = selectedElements.some(el => el.locked);
  
  const productElements = selectedElements.filter(el => el.productId);
  const productIds = Array.from(new Set(productElements.map(el => el.productId!)));

  const toolbarStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${element.x * zoom}px`,
    top: `${(element.y * zoom) - 58}px`,
    transform: 'translateX(-10%)',
    zIndex: 900,
  };

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenMenu(e.clientX, e.clientY);
  };

  const handleLockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectedElementIds.forEach(id => toggleLock(currentPageIndex, id));
  };

  const handleClearProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    productIds.forEach(pid => removeProductFromPage(currentPageIndex, pid));
  };

  return (
    <div 
      className="flex items-center bg-white/95 backdrop-blur-xl border border-slate-200 shadow-[0_12px_40px_rgba(0,0,0,0.12)] rounded-full px-1 py-1 animate-in fade-in zoom-in-95 duration-200 ring-1 ring-black/5 select-none pointer-events-auto"
      style={toolbarStyle}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Magic/AI Trigger */}
      <button className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded-full transition-all group">
        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:scale-110 transition-transform">
          <Sparkles size={14} fill="currentColor" />
        </div>
        <span className="text-[13px] font-black text-slate-800 tracking-tight">Ask Studio AI</span>
      </button>

      <div className="w-[1px] h-4 bg-slate-100 mx-1" />

      {/* Standard Action Buttons */}
      <div className="flex items-center gap-0.5 px-1">
        <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-all" title="Add Link">
          <LinkIcon size={18} strokeWidth={2.5} />
        </button>
        <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-all" title="Comment">
          <MessageSquare size={18} strokeWidth={2.5} />
        </button>
        <button 
          onClick={handleLockClick}
          className={`p-2 rounded-full transition-all ${isAnyLocked ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:bg-slate-100'}`} 
          title={isAnyLocked ? "Unlock" : "Lock"}
        >
          {isAnyLocked ? <Lock size={18} strokeWidth={2.5} /> : <Unlock size={18} strokeWidth={2.5} />}
        </button>

        {productIds.length > 0 && (
          <button 
            onClick={handleClearProduct}
            className="p-2 text-rose-500 hover:bg-rose-50 rounded-full transition-all" 
            title="Clear Product Block"
          >
            <Trash2 size={18} strokeWidth={2.5} />
          </button>
        )}
        
        <button 
          onClick={handleMoreClick}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-all" 
          title="More Actions"
        >
          <MoreHorizontal size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};

export default FloatingToolbar;
