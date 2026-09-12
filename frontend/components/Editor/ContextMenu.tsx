import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import {
  Copy,
  Clipboard,
  FilePlus,
  Trash2,
  Lock,
  Unlock,
  Group,
  Ungroup,
  ChevronRight,
  LayoutGrid,
  Zap
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { CanvasElement } from '../../types';

// Pixel-perfect Canva SVG Icons for Layer Submenu
const BringToFrontIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8 5V1m0 0L5.5 3.5M8 1l2.5 2.5" />
    <path d="M8 6.5L13.5 9.25L8 12L2.5 9.25L8 6.5Z" />
    <path d="M2.5 12L8 14.75L13.5 12" />
  </svg>
);

const BringForwardIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8 6V2m0 0L5.5 4.5M8 2l2.5 2.5" />
    <path d="M8 8.5L13.5 11.25L8 14L2.5 11.25L8 8.5Z" />
  </svg>
);

const SendBackwardIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8 2L13.5 4.75L8 7.5L2.5 4.75L8 2Z" />
    <path d="M8 10v4m0 0l2.5-2.5M8 14L5.5 11.5" />
  </svg>
);

const SendToBackIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8 1.25L13.5 4L8 6.75L2.5 4L8 1.25Z" />
    <path d="M2.5 6.75L8 9.5L13.5 6.75" />
    <path d="M8 11v4m0 0l2.5-2.5M8 15L5.5 12.5" />
  </svg>
);

const ShowLayersIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M8 2L13.5 4.75L8 7.5L2.5 4.75L8 2Z" />
    <path d="M2.5 8L8 10.75L13.5 8" />
    <path d="M2.5 11.25L8 14L13.5 11.25" />
  </svg>
);

// Pixel-perfect Canva SVG Icons for Align to Page Submenu
const AlignLeftIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="2" y1="2" x2="2" y2="14" />
    <rect x="2" y="3.5" width="8.5" height="3" rx="1.5" />
    <rect x="2" y="9.5" width="5.5" height="3" rx="1.5" />
  </svg>
);

const AlignCenterHorizontalIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="8" y1="1" x2="8" y2="15" />
    <rect x="3.5" y="3.5" width="9" height="3" rx="1.5" />
    <rect x="5.5" y="9.5" width="5" height="3" rx="1.5" />
  </svg>
);

const AlignRightIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="14" y1="2" x2="14" y2="14" />
    <rect x="5.5" y="3.5" width="8.5" height="3" rx="1.5" />
    <rect x="8.5" y="9.5" width="5.5" height="3" rx="1.5" />
  </svg>
);

const AlignTopIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="2" y1="2" x2="14" y2="2" />
    <rect x="3.5" y="2" width="3" height="8.5" rx="1.5" />
    <rect x="9.5" y="2" width="3" height="5.5" rx="1.5" />
  </svg>
);

const AlignMiddleVerticalIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="1" y1="8" x2="15" y2="8" />
    <rect x="3.5" y="3.5" width="3" height="9" rx="1.5" />
    <rect x="9.5" y="5.5" width="3" height="5" rx="1.5" />
  </svg>
);

const AlignBottomIcon: React.FC<{ size?: number; className?: string }> = ({ size = 16, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="2" y1="14" x2="14" y2="14" />
    <rect x="3.5" y="5.5" width="3" height="8.5" rx="1.5" />
    <rect x="9.5" y="8.5" width="3" height="5.5" rx="1.5" />
  </svg>
);

// Reorder helper for layer positioning
function calculateNewLayerOrder(
  elements: CanvasElement[],
  selectedIds: string[],
  action: 'bringToFront' | 'bringForward' | 'sendBackward' | 'sendToBack'
): string[] {
  const currentIds = elements.map(e => e.id);
  if (selectedIds.length === 0) return currentIds;

  if (action === 'bringToFront') {
    const unselected = currentIds.filter(id => !selectedIds.includes(id));
    const selected = currentIds.filter(id => selectedIds.includes(id));
    return [...unselected, ...selected];
  }

  if (action === 'sendToBack') {
    const unselected = currentIds.filter(id => !selectedIds.includes(id));
    const selected = currentIds.filter(id => selectedIds.includes(id));
    return [...selected, ...unselected];
  }

  if (action === 'bringForward') {
    const list = [...currentIds];
    for (let i = list.length - 2; i >= 0; i--) {
      if (selectedIds.includes(list[i]) && !selectedIds.includes(list[i + 1])) {
        const temp = list[i];
        list[i] = list[i + 1];
        list[i + 1] = temp;
      }
    }
    return list;
  }

  if (action === 'sendBackward') {
    const list = [...currentIds];
    for (let i = 1; i < list.length; i++) {
      if (selectedIds.includes(list[i]) && !selectedIds.includes(list[i - 1])) {
        const temp = list[i];
        list[i] = list[i - 1];
        list[i - 1] = temp;
      }
    }
    return list;
  }

  return currentIds;
}

export interface ContextMenuProps {
  x: number;
  y: number;
  type: 'page' | 'element';
  pageIndex: number;
  targetId?: string;
  onClose: () => void;
}

const getSafeCoords = (
  rawX: number,
  rawY: number,
  menuType: 'page' | 'element',
  actualRect?: DOMRect | null
) => {
  const menuWidth = actualRect?.width || 260;
  const menuHeight = actualRect?.height || (menuType === 'page' ? 260 : 320);
  const margin = 12;

  // Validate raw coordinates
  let targetX = (typeof rawX === 'number' && !isNaN(rawX) && rawX > 0)
    ? rawX
    : (typeof window !== 'undefined' && (window as any).__lastContextMenuPos?.x > 0)
      ? (window as any).__lastContextMenuPos.x
      : Math.round((typeof window !== 'undefined' ? window.innerWidth : 1000) / 2 - menuWidth / 2);

  let targetY = (typeof rawY === 'number' && !isNaN(rawY) && rawY > 0)
    ? rawY
    : (typeof window !== 'undefined' && (window as any).__lastContextMenuPos?.y > 0)
      ? (window as any).__lastContextMenuPos.y
      : Math.round((typeof window !== 'undefined' ? window.innerHeight : 800) / 2 - menuHeight / 2);

  // Horizontal placement
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;

  let posX = targetX;
  if (posX + menuWidth > screenWidth - margin) {
    posX = targetX - menuWidth;
    if (posX < margin) {
      posX = Math.max(margin, screenWidth - menuWidth - margin);
    }
  } else {
    posX = Math.max(margin, posX);
  }

  // Vertical placement
  let posY = targetY;
  if (posY + menuHeight > screenHeight - margin) {
    posY = Math.max(margin, screenHeight - menuHeight - margin);
  } else {
    posY = Math.max(margin, posY);
  }

  return { x: Math.round(posX), y: Math.round(posY) };
};

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  type,
  pageIndex,
  targetId,
  onClose
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [coords, setCoords] = useState(() => getSafeCoords(x, y, type));

  const {
    catalog,
    selectedElementIds,
    setSelectedElementIds,
    duplicateElement,
    removeElement,
    toggleLock,
    alignElements,
    reorderElements,
    copySelectedElements,
    pasteElements,
    groupSelected,
    ungroupSelected,
    addPage,
    duplicatePage,
    setPageBackground,
    pushHistory,
    setCurrentPageIndex,
    setEditorTab,
    setSidebarExpanded,
    setIsGridStudioOpen,
    reflowCatalogPages
  } = useStore();

  const currentPage = catalog.pages[pageIndex];
  const selectedElements = (currentPage?.elements || []).filter(el =>
    selectedElementIds.includes(el.id)
  );

  const isAllLocked = selectedElements.length > 0 && selectedElements.every(el => el.locked);
  const canGroup = selectedElements.length >= 2;
  const hasGrouped = selectedElements.some(el => !!el.groupId);

  // Position adjustment on mount or whenever x/y/type changes
  useEffect(() => {
    const rect = menuRef.current?.getBoundingClientRect();
    setCoords(getSafeCoords(x, y, type, rect));
  }, [x, y, type]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const execute = (fn: () => void) => {
    fn();
    onClose();
  };

  // --- ACTIONS: ELEMENT ---
  const handleCopyElement = () => {
    execute(() => {
      copySelectedElements();
    });
  };

  const handlePaste = () => {
    execute(() => {
      let targetPos: { x: number; y: number } | undefined = undefined;
      const pageEl = document.querySelector(`[data-page-index="${pageIndex}"] .bg-white`) as HTMLElement | null;
      if (pageEl) {
        const rect = pageEl.getBoundingClientRect();
        const curZoom = useStore.getState().zoom || 1;
        const pageX = (x - rect.left) / curZoom;
        const pageY = (y - rect.top) / curZoom;
        targetPos = {
          x: Math.max(0, Math.min(792, Math.round(pageX))),
          y: Math.max(0, Math.min(1120, Math.round(pageY)))
        };
      }
      pasteElements(targetPos, pageIndex);
    });
  };

  const handleDuplicateElement = () => {
    execute(() => {
      selectedElementIds.forEach(id => duplicateElement(pageIndex, id));
    });
  };

  const handleDeleteElement = () => {
    execute(() => {
      pushHistory();
      selectedElementIds.forEach(id => removeElement(pageIndex, id));
      setSelectedElementIds([]);
    });
  };

  const handleLayerAction = (action: 'bringToFront' | 'bringForward' | 'sendBackward' | 'sendToBack') => {
    execute(() => {
      if (!currentPage) return;
      pushHistory();
      const newOrder = calculateNewLayerOrder(currentPage.elements, selectedElementIds, action);
      reorderElements(pageIndex, newOrder);
    });
  };

  const handleAlign = (alignment: 'top' | 'middle' | 'bottom' | 'left' | 'center' | 'right') => {
    execute(() => {
      alignElements(pageIndex, selectedElementIds, alignment);
    });
  };

  const handleToggleLockElement = () => {
    execute(() => {
      selectedElementIds.forEach(id => toggleLock(pageIndex, id));
    });
  };

  const handleGroup = () => {
    execute(() => {
      groupSelected(pageIndex);
    });
  };

  const handleUngroup = () => {
    execute(() => {
      ungroupSelected(pageIndex);
    });
  };

  // --- ACTIONS: PAGE ---
  const handleCopyPage = () => {
    execute(() => {
      if (currentPage && currentPage.elements.length > 0) {
        const allIds = currentPage.elements.map(el => el.id);
        setSelectedElementIds(allIds);
        copySelectedElements();
      }
    });
  };

  const handleAddPage = () => {
    execute(() => {
      addPage('interior');
    });
  };

  const handleDuplicatePage = () => {
    execute(() => {
      duplicatePage(pageIndex);
    });
  };

  const handleDeleteBackground = () => {
    execute(() => {
      setPageBackground(pageIndex, '#ffffff');
    });
  };

  const handleLockBackground = () => {
    execute(() => {
      if (!currentPage) return;
      pushHistory();
      const allLocked = currentPage.elements.length > 0 && currentPage.elements.every(el => el.locked);
      currentPage.elements.forEach(el => {
        if (allLocked ? el.locked : !el.locked) {
          toggleLock(pageIndex, el.id);
        }
      });
    });
  };

  // Submenu placement (left or right based on screen edge)
  const isSubmenuLeft = coords.x + 260 + 190 > window.innerWidth;

  // Reusable Menu Item Component
  const MenuItem: React.FC<{
    icon: any;
    label: string;
    shortcut?: string;
    hasSubmenu?: boolean;
    submenuId?: string;
    onClick?: () => void;
    submenuContent?: React.ReactNode;
  }> = ({
    icon: Icon,
    label,
    shortcut,
    hasSubmenu,
    submenuId,
    onClick,
    submenuContent
  }) => {
    const isHovered = activeSubmenu === submenuId;

    return (
      <div
        className="relative"
        onMouseEnter={() => {
          if (hasSubmenu && submenuId) setActiveSubmenu(submenuId);
        }}
        onMouseLeave={() => {
          if (hasSubmenu && submenuId) setActiveSubmenu(null);
        }}
      >
        <div
          onClick={onClick}
          className="flex items-center justify-between px-3 py-1.5 rounded-[6px] hover:bg-[#32363e] active:bg-[#3d424c] cursor-pointer text-[13px] text-white select-none transition-colors group"
        >
          <div className="flex items-center gap-3">
            <Icon size={16} strokeWidth={1.8} className="text-[#cbd5e1] group-hover:text-white shrink-0" />
            <span className="font-normal text-[#f1f5f9] group-hover:text-white leading-tight tracking-wide">{label}</span>
          </div>

          <div className="flex items-center gap-1.5 ml-3">
            {shortcut && (
              <span className="text-[10px] font-medium text-[#a0a6b5] bg-[#31353d] px-1.5 py-0.5 rounded-[4px] tracking-tight font-sans">
                {shortcut}
              </span>
            )}
            {hasSubmenu && (
              <ChevronRight size={14} className="text-[#a0a6b5] group-hover:text-white shrink-0" />
            )}
          </div>
        </div>

        {/* Submenu Floating Panel */}
        {hasSubmenu && isHovered && submenuContent && (
          <div
            className={`absolute top-0 bg-[#22252a] border border-[#343842] shadow-[0_20px_50px_rgba(0,0,0,0.75),0_6px_20px_rgba(0,0,0,0.5)] rounded-[10px] py-1.5 px-1 z-[1001] animate-in fade-in zoom-in-95 duration-100 ${
              isSubmenuLeft ? 'right-[calc(100%+6px)]' : 'left-[calc(100%+6px)]'
            }`}
            style={{ backgroundColor: '#22252a' }}
          >
            {submenuContent}
          </div>
        )}
      </div>
    );
  };

  const SubmenuItem: React.FC<{
    icon?: any;
    label: string;
    shortcut?: string;
    disabled?: boolean;
    onClick: () => void;
  }> = ({ icon: Icon, label, shortcut, disabled = false, onClick }) => (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`flex items-center justify-between px-3 py-1.5 rounded-[6px] text-[13px] select-none transition-colors group ${
        disabled
          ? 'text-[#626875] cursor-default'
          : 'text-white hover:bg-[#32363e] active:bg-[#3d424c] cursor-pointer'
      }`}
    >
      <div className="flex items-center gap-2.5">
        {Icon && (
          <Icon
            size={16}
            className={`${disabled ? 'text-[#626875]' : 'text-[#cbd5e1] group-hover:text-white'} shrink-0`}
          />
        )}
        <span className={`font-normal leading-tight ${disabled ? 'text-[#626875]' : 'text-[#f1f5f9] group-hover:text-white'}`}>
          {label}
        </span>
      </div>
      {shortcut && (
        <span
          className={`text-[10px] font-medium px-1.5 py-0.5 rounded-[4px] tracking-tight font-sans ${
            disabled ? 'text-[#555a66] bg-[#292c33]' : 'text-[#a0a6b5] bg-[#31353d]'
          }`}
        >
          {shortcut}
        </span>
      )}
    </div>
  );

  const Divider = () => <div className="h-px bg-[#343842] my-1 mx-2" />;

  // Layer bounds check
  const pageElements = currentPage?.elements || [];
  const selectedIndices = pageElements
    .map((el, idx) => (selectedElementIds.includes(el.id) ? idx : -1))
    .filter(idx => idx !== -1);

  const isAtFront = selectedIndices.length > 0 && Math.max(...selectedIndices) === pageElements.length - 1;
  const isAtBack = selectedIndices.length > 0 && Math.min(...selectedIndices) === 0;

  // Alignment check relative to page canvas
  const isLandscape = currentPage?.orientation === 'landscape';
  const pageWidth = isLandscape ? 1123 : 794;
  const pageHeight = isLandscape ? 794 : 1123;
  const firstSelected = selectedElements[0];

  const isAlignedLeft = firstSelected ? Math.abs(firstSelected.x) < 3 : false;
  const isAlignedCenter = firstSelected ? Math.abs((firstSelected.x + firstSelected.width / 2) - pageWidth / 2) < 4 : false;
  const isAlignedRight = firstSelected ? Math.abs((firstSelected.x + firstSelected.width) - pageWidth) < 3 : false;

  const isAlignedTop = firstSelected ? Math.abs(firstSelected.y) < 3 : false;
  const isAlignedMiddle = firstSelected ? Math.abs((firstSelected.y + firstSelected.height / 2) - pageHeight / 2) < 4 : false;
  const isAlignedBottom = firstSelected ? Math.abs((firstSelected.y + firstSelected.height) - pageHeight) < 3 : false;

  return ReactDOM.createPortal(
    <>
      {/* Invisible backdrop to capture outside clicks cleanly without event race conditions */}
      <div
        className="fixed inset-0 z-[9998] cursor-default"
        onMouseDown={(e) => {
          e.stopPropagation();
          onClose();
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
      />

      <div
        ref={menuRef}
        className="fixed z-[9999] w-[260px] bg-[#22252a] border border-[#343842] shadow-[0_20px_50px_rgba(0,0,0,0.75),0_6px_20px_rgba(0,0,0,0.5)] rounded-[10px] py-1.5 px-1 select-none animate-in fade-in zoom-in-95 duration-100"
        style={{ left: `${coords.x}px`, top: `${coords.y}px`, backgroundColor: '#22252a' }}
        onContextMenu={(e) => e.preventDefault()}
        onClick={(e) => e.stopPropagation()}
      >
      {type === 'page' ? (
        /* PAGE CONTEXT MENU */
        <>
          {(currentPage?.type === 'interior' || (currentPage?.type !== 'cover' && currentPage?.type !== 'index' && currentPage?.type !== 'closing')) && (
            <>
              <MenuItem
                icon={LayoutGrid}
                label="Design 3-Product Grid"
                onClick={() => execute(() => {
                  setCurrentPageIndex(pageIndex);
                  setEditorTab('grid-studio');
                  setSidebarExpanded(true);
                })}
              />
              <MenuItem
                icon={Zap}
                label="Reflow & Pack Pages"
                onClick={() => execute(() => reflowCatalogPages(pageIndex))}
              />
              <Divider />
            </>
          )}
          <MenuItem icon={Copy} label="Copy" shortcut="Ctrl+C" onClick={handleCopyPage} />
          <MenuItem icon={Clipboard} label="Paste" shortcut="Ctrl+V" onClick={handlePaste} />
          <MenuItem icon={FilePlus} label="Add page" shortcut="Ctrl+Enter" onClick={handleAddPage} />
          <MenuItem icon={Copy} label="Duplicate page" shortcut="Ctrl+D" onClick={handleDuplicatePage} />
          <MenuItem icon={Trash2} label="Delete background" shortcut="DELETE" onClick={handleDeleteBackground} />

          <Divider />
          <MenuItem icon={Lock} label="Lock background" onClick={handleLockBackground} />
        </>
      ) : (
        /* SCREENSHOT 2: COMPONENT CONTEXT MENU */
        <>
          <MenuItem icon={Copy} label="Copy" shortcut="Ctrl+C" onClick={handleCopyElement} />
          <MenuItem icon={Clipboard} label="Paste" shortcut="Ctrl+V" onClick={handlePaste} />
          <MenuItem icon={Copy} label="Duplicate" shortcut="Ctrl+D" onClick={handleDuplicateElement} />
          <MenuItem icon={Trash2} label="Delete" shortcut="DELETE" onClick={handleDeleteElement} />

          {(canGroup || hasGrouped) && <Divider />}

          {canGroup && (
            <MenuItem icon={Group} label="Group" shortcut="Ctrl+G" onClick={handleGroup} />
          )}

          {hasGrouped && (
            <MenuItem icon={Ungroup} label="Ungroup" shortcut="Ctrl+Shift+G" onClick={handleUngroup} />
          )}

          <Divider />

          {/* Layer Submenu (Screenshot 1 of prompt) */}
          <MenuItem
            icon={ShowLayersIcon}
            label="Layer"
            hasSubmenu={true}
            submenuId="layer"
            submenuContent={
              <div className="w-56">
                <SubmenuItem
                  icon={BringToFrontIcon}
                  label="Bring to front"
                  shortcut="Ctrl+Alt+]"
                  disabled={isAtFront}
                  onClick={() => handleLayerAction('bringToFront')}
                />
                <SubmenuItem
                  icon={BringForwardIcon}
                  label="Bring forward"
                  shortcut="Ctrl+]"
                  disabled={isAtFront}
                  onClick={() => handleLayerAction('bringForward')}
                />
                <SubmenuItem
                  icon={SendBackwardIcon}
                  label="Send backward"
                  shortcut="Ctrl+["
                  disabled={isAtBack}
                  onClick={() => handleLayerAction('sendBackward')}
                />
                <SubmenuItem
                  icon={SendToBackIcon}
                  label="Send to back"
                  shortcut="Ctrl+Alt+["
                  disabled={isAtBack}
                  onClick={() => handleLayerAction('sendToBack')}
                />
                <Divider />
                <SubmenuItem
                  icon={ShowLayersIcon}
                  label="Show layers"
                  shortcut="Alt+1"
                  onClick={() => execute(() => {
                    useStore.getState().setEditorTab('pages');
                  })}
                />
              </div>
            }
          />

          {/* Align to page Submenu (Screenshot 2 of prompt) */}
          <MenuItem
            icon={AlignLeftIcon}
            label="Align to page"
            hasSubmenu={true}
            submenuId="align"
            submenuContent={
              <div className="w-48">
                <SubmenuItem
                  icon={AlignLeftIcon}
                  label="Left"
                  disabled={isAlignedLeft}
                  onClick={() => handleAlign('left')}
                />
                <SubmenuItem
                  icon={AlignCenterHorizontalIcon}
                  label="Center"
                  disabled={isAlignedCenter}
                  onClick={() => handleAlign('center')}
                />
                <SubmenuItem
                  icon={AlignRightIcon}
                  label="Right"
                  disabled={isAlignedRight}
                  onClick={() => handleAlign('right')}
                />
                <Divider />
                <SubmenuItem
                  icon={AlignTopIcon}
                  label="Top"
                  disabled={isAlignedTop}
                  onClick={() => handleAlign('top')}
                />
                <SubmenuItem
                  icon={AlignMiddleVerticalIcon}
                  label="Middle"
                  disabled={isAlignedMiddle}
                  onClick={() => handleAlign('middle')}
                />
                <SubmenuItem
                  icon={AlignBottomIcon}
                  label="Bottom"
                  disabled={isAlignedBottom}
                  onClick={() => handleAlign('bottom')}
                />
              </div>
            }
          />

          <Divider />

          {/* Lock item */}
          <MenuItem
            icon={isAllLocked ? Unlock : Lock}
            label={isAllLocked ? "Unlock" : "Lock"}
            hasSubmenu={true}
            submenuId="lock"
            onClick={handleToggleLockElement}
            submenuContent={
              <div className="w-48">
                <SubmenuItem
                  icon={isAllLocked ? Unlock : Lock}
                  label={isAllLocked ? "Unlock" : "Lock"}
                  shortcut="Alt+Shift+L"
                  onClick={handleToggleLockElement}
                />
              </div>
            }
          />
        </>
      )}
      </div>
    </>,
    document.body
  );
};

export default ContextMenu;
