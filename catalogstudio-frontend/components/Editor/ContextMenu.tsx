
import React, { useState } from 'react';
import { 
  Copy, 
  Scissors, 
  Clipboard, 
  Trash2, 
  Lock, 
  Unlock, 
  Link as LinkIcon, 
  MessageSquare, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignVerticalJustifyStart, 
  AlignVerticalJustifyCenter, 
  AlignVerticalJustifyEnd,
  ChevronRight,
  Layers,
  Sparkles,
  Type,
  Layout
} from 'lucide-react';
import { useStore } from '../../store/useStore';

interface Props {
  x: number;
  y: number;
  onClose: () => void;
  triggerSource?: 'right-click' | 'toolbar';
}

const ContextMenu: React.FC<Props> = ({ x, y, onClose, triggerSource = 'right-click' }) => {
  const { 
    currentPageIndex, 
    selectedElementIds, 
    catalog, 
    duplicateElement, 
    removeElement, 
    toggleLock,
    alignElements,
    removeProductFromPage
  } = useStore();

  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  const currentPage = catalog.pages[currentPageIndex];
  const selectedElements = currentPage.elements.filter(el => selectedElementIds.includes(el.id));
  const isAllLocked = selectedElements.every(el => el.locked);
  const isAnyLocked = selectedElements.some(el => el.locked);

  const productElements = selectedElements.filter(el => el.productId);
  const productIds = Array.from(new Set(productElements.map(el => el.productId!)));

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  const MenuItem = ({ 
    icon: Icon, 
    label, 
    shortcut, 
    onClick, 
    hasSubmenu, 
    id,
    disabled = false,
    danger = false,
    isPremium = false
  }: any) => (
    <div 
      className={`
        flex items-center justify-between px-3 py-2 text-[13px] transition-colors cursor-pointer relative
        ${disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-slate-100/80 active:bg-slate-200/50'}
        ${danger ? 'hover:text-red-600' : 'text-slate-700'}
      `}
      onMouseEnter={() => hasSubmenu && setActiveSubmenu(id)}
      onMouseLeave={() => hasSubmenu && setActiveSubmenu(null)}
      onClick={!disabled ? onClick : undefined}
    >
      <div className="flex items-center gap-3">
        <Icon size={16} className={`${danger ? 'text-red-400' : 'text-slate-400'}`} />
        <span className="font-medium">{label}</span>
        {isPremium && <Sparkles size={12} className="text-amber-500 ml-1" />}
      </div>
      <div className="flex items-center gap-2">
        {shortcut && <span className="text-[10px] text-slate-300 font-mono uppercase tracking-tighter">{shortcut}</span>}
        {hasSubmenu && <ChevronRight size={14} className="text-slate-300" />}
      </div>

      {hasSubmenu && activeSubmenu === id && (
        <div className="absolute left-full top-0 ml-1 w-48 bg-white border border-slate-200 shadow-2xl rounded-2xl py-1 z-[100] animate-in fade-in slide-in-from-left-2 duration-150">
           <SubmenuItem icon={AlignLeft} label="Left" onClick={() => handleAction(() => alignElements(currentPageIndex, selectedElementIds, 'left'))} />
           <SubmenuItem icon={AlignCenter} label="Centre" onClick={() => handleAction(() => alignElements(currentPageIndex, selectedElementIds, 'center'))} />
           <SubmenuItem icon={AlignRight} label="Right" onClick={() => handleAction(() => alignElements(currentPageIndex, selectedElementIds, 'right'))} />
           <div className="h-px bg-slate-50 my-1 mx-2" />
           <SubmenuItem icon={AlignVerticalJustifyStart} label="Top" onClick={() => handleAction(() => alignElements(currentPageIndex, selectedElementIds, 'top'))} />
           <SubmenuItem icon={AlignVerticalJustifyCenter} label="Middle" onClick={() => handleAction(() => alignElements(currentPageIndex, selectedElementIds, 'middle'))} />
           <SubmenuItem icon={AlignVerticalJustifyEnd} label="Bottom" onClick={() => handleAction(() => alignElements(currentPageIndex, selectedElementIds, 'bottom'))} />
        </div>
      )}
    </div>
  );

  const SubmenuItem = ({ icon: Icon, label, onClick }: any) => (
    <div 
      className="flex items-center gap-3 px-3 py-2 text-[13px] font-medium text-slate-600 hover:bg-slate-100/80 hover:text-indigo-600 cursor-pointer"
      onClick={onClick}
    >
      <Icon size={14} />
      <span>{label}</span>
    </div>
  );

  if (selectedElementIds.length === 0 && triggerSource === 'right-click') return null;

  return (
    <div 
      className="fixed z-[1000] w-64 bg-white/95 backdrop-blur-xl border border-slate-200 shadow-[0_30px_60px_rgba(0,0,0,0.15)] rounded-2xl py-1 overflow-visible animate-in zoom-in-95 duration-150"
      style={{ left: x, top: y }}
      onContextMenu={(e) => e.preventDefault()}
      onClick={(e) => e.stopPropagation()}
    >
      <MenuItem icon={Sparkles} label="Ask AI Studio" isPremium={true} onClick={() => {}} />
      <div className="h-px bg-slate-100 my-1 mx-2" />
      
      <MenuItem icon={Copy} label="Copy" shortcut="Ctrl+C" onClick={() => {}} />
      <MenuItem icon={Sparkles} label="Copy style" shortcut="Ctrl+Alt+C" onClick={() => {}} />
      <MenuItem icon={Clipboard} label="Paste" shortcut="Ctrl+V" onClick={() => {}} />
      <MenuItem icon={Layers} label="Duplicate" shortcut="Ctrl+D" onClick={() => handleAction(() => selectedElementIds.forEach(id => duplicateElement(currentPageIndex, id)))} />
      
      <div className="h-px bg-slate-100 my-1 mx-2" />
      
      {productIds.length > 0 && (
        <>
          <MenuItem 
            icon={Layout} 
            label={`Clear Product Layout`} 
            onClick={() => handleAction(() => productIds.forEach(pid => removeProductFromPage(currentPageIndex, pid)))} 
          />
          <div className="h-px bg-slate-100 my-1 mx-2" />
        </>
      )}

      <MenuItem 
        icon={isAnyLocked ? Unlock : Lock} 
        label={isAnyLocked ? "Unlock" : "Lock"} 
        shortcut="Alt+Shift+L" 
        onClick={() => handleAction(() => selectedElementIds.forEach(id => toggleLock(currentPageIndex, id)))} 
      />
      
      <MenuItem icon={Layers} label="Align to page" hasSubmenu={true} id="align" />
      
      <div className="h-px bg-slate-100 my-1 mx-2" />
      
      <MenuItem icon={LinkIcon} label="Link" shortcut="Ctrl+K" onClick={() => {}} />
      <MenuItem icon={Sparkles} label="Show element timing" onClick={() => {}} />
      <MenuItem icon={MessageSquare} label="Comment" shortcut="Ctrl+Alt+N" onClick={() => {}} />
      <MenuItem icon={Type} label="Alternative text" onClick={() => {}} />
      
      <div className="h-px bg-slate-100 my-1 mx-2" />
      
      <MenuItem icon={Sparkles} label="Translate text" isPremium={true} onClick={() => {}} />
      
      <div className="h-px bg-slate-100 my-1 mx-2" />
      
      <MenuItem 
        icon={Trash2} 
        label="Delete" 
        danger={true} 
        shortcut="Del" 
        onClick={() => handleAction(() => selectedElementIds.forEach(id => removeElement(currentPageIndex, id)))} 
      />
    </div>
  );
};

export default ContextMenu;
