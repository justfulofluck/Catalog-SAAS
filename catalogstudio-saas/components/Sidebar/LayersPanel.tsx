
import React, { useEffect, useRef } from 'react';
import { Layers, Eye, EyeOff, Lock, Unlock, MousePointer2, Type, Image as ImageIcon, Square, MessageSquare, GripVertical, Package } from 'lucide-react';
import Sortable from 'sortablejs';
import { useStore } from '../../store/useStore';

const LayersPanel: React.FC = () => {
  const { catalog, currentPageIndex, selectedElementIds, setSelectedElementIds, setHoveredElementId, updateElement, setElementOrder, products, uiTheme } = useStore();
  const listRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  const currentPage = catalog.pages[currentPageIndex];

  // Visual stack order for the UI: Top of list = Front of canvas (highest Z-index)
  // Konva renders array[0] at the back. So we reverse for the UI.
  const elements = [...(currentPage?.elements || [])].reverse();

  useEffect(() => {
    if (listRef.current && elements.length > 0) {
      const sortable = Sortable.create(listRef.current, {
        animation: 150,
        handle: '.layer-drag-handle',
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        onEnd: (evt) => {
          const newOrder = Array.from(listRef.current!.children).map(
            (el) => (el as HTMLElement).dataset.id!
          );
          // newOrder comes from the UI (Top to Bottom)
          setElementOrder(currentPageIndex, newOrder);
        },
      });
      return () => sortable.destroy();
    }
  }, [elements.length, currentPageIndex, setElementOrder]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type size={14} />;
      case 'image': return <ImageIcon size={14} />;
      case 'shape': return <Square size={14} />;
      case 'product-block': return <Package size={14} />;
      case 'comment': return <MessageSquare size={14} />;
      default: return <Layers size={14} />;
    }
  };

  const getLabel = (el: any) => {
    if (el.type === 'product-block') {
      const product = products.find(p => p.id === el.productId);
      return product ? `Card: ${product.name}` : 'Product Card';
    }
    return el.text || el.id.substring(0, 12);
  };

  return (
    <div className={`flex flex-col h-full border-r w-[320px] shrink-0 z-10 font-sans ${uiTheme === 'dark' ? 'bg-[#0f172a] border-[#0f172a]' : 'bg-white'}`}>
      <div className={`p-6 border-b ${uiTheme === 'dark' ? 'bg-[#0f172a] border-[#1e293b]' : 'bg-white'}`}>
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1">
          <Layers size={14} className="text-indigo-600" />
          Scene Tree
        </h3>
        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-tight">Element Hierarchy & Visibility</p>
      </div>

      <div
        ref={listRef}
        className={`flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar ${uiTheme === 'dark' ? 'bg-[#0f172a]' : 'bg-slate-50/30'}`}
      >
        {elements.length === 0 ? (
          <div className="py-24 text-center">
            <Layers size={32} className="mx-auto text-slate-200 mb-4" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">No elements on <br /> this page</p>
          </div>
        ) : (
          elements.map((el) => (
            <div
              key={el.id}
              data-id={el.id}
              onClick={() => setSelectedElementIds([el.id])}
              onMouseEnter={() => setHoveredElementId(el.id)}
              onMouseLeave={() => setHoveredElementId(null)}
              className={`group flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${selectedElementIds.includes(el.id) ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-600/20' : `${uiTheme === 'dark' ? 'bg-[#1e293b] border-[#1e293b] hover:border-indigo-500' : 'bg-white border-slate-100 hover:border-indigo-200 shadow-sm'}`}`}
            >
              <div className="layer-drag-handle p-1 -ml-1 text-slate-200 hover:text-slate-400 cursor-grab active:cursor-grabbing shrink-0 transition-colors">
                <GripVertical size={14} />
              </div>

              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${selectedElementIds.includes(el.id) ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                {getIcon(el.type)}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-xs font-black truncate transition-colors ${selectedElementIds.includes(el.id) ? 'text-white' : `${uiTheme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}`}>
                  {getLabel(el)}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[8px] font-black uppercase tracking-widest opacity-60 ${selectedElementIds.includes(el.id) ? 'text-white' : `${uiTheme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`}`}>{el.type === 'product-block' ? 'Unified Card' : el.type}</span>
                  {el.groupId && <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${selectedElementIds.includes(el.id) ? 'bg-white/10 text-white' : 'bg-indigo-50 text-indigo-600'}`}>Group</span>}
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); updateElement(currentPageIndex, el.id, { visible: el.visible === false }); }}
                  className={`p-2 rounded-lg transition-colors ${selectedElementIds.includes(el.id) ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-100 text-slate-300 hover:text-indigo-600'}`}
                >
                  {el.visible === false ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); updateElement(currentPageIndex, el.id, { locked: !el.locked }); }}
                  className={`p-2 rounded-lg transition-colors ${selectedElementIds.includes(el.id) ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-100 text-slate-300 hover:text-indigo-600'}`}
                >
                  {el.locked ? <Lock size={14} /> : <Unlock size={14} />}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className={`p-4 border-t ${uiTheme === 'dark' ? 'bg-[#0f172a] border-[#1e293b]' : 'bg-slate-50/50'}`}>
        <div className={`p-4 rounded-2xl border shadow-sm flex items-start gap-3 ${uiTheme === 'dark' ? 'bg-[#1e293b] border-[#1e293b]' : 'bg-white border-slate-200'}`}>
          <MousePointer2 size={16} className="text-indigo-600 mt-0.5" />
          <p className="text-[9px] font-bold text-slate-500 leading-relaxed uppercase">
            <b>ProTip:</b> Drag layers up or down to change their stacking order. Top of the list is the front-most element.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LayersPanel;
