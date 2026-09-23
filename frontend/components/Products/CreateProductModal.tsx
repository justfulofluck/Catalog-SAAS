import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  FolderTree, 
  Search, 
  Plus, 
  Package, 
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { useStore } from '../../store/useStore';

export const CreateProductModal: React.FC = () => {
  const { 
    isCreateProductModalOpen, 
    closeCreateProductModal, 
    categories, 
    products,
    uiTheme, 
    setActiveCategoryId,
    setView
  } = useStore();

  const isDark = uiTheme === 'dark';
  const modalRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Handle ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeCreateProductModal();
      }
    };
    if (isCreateProductModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCreateProductModalOpen, closeCreateProductModal]);

  if (!isCreateProductModalOpen) return null;

  const handleSelectCategory = (catId: string) => {
    setActiveCategoryId(String(catId));
    closeCreateProductModal();
    setView('create-product');
  };

  const handleCreateNewCategory = () => {
    closeCreateProductModal();
    setView('create-category');
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[99990] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        ref={modalRef}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-xl flex flex-col rounded-[8px] border shadow-2xl overflow-hidden animate-modal-card ${
          isDark ? 'bg-[#141414] border-[#E2DCC8]/20 text-[#F1F1F1]' : 'bg-white border-slate-300 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${
          isDark ? 'bg-[#171616] border-[#E2DCC8]/15' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[4px] bg-[#0F3D3E] text-white border border-[#E2DCC8]/30 flex items-center justify-center shadow-md shrink-0">
              <FolderTree size={18} className="text-[#E2DCC8]" />
            </div>
            <div>
              <h2 className="text-base font-bold font-heading tracking-tight">
                Select Category
              </h2>
              <p className={`text-xs ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
                Choose a category to create and add your product
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeCreateProductModal}
            className={`p-1.5 rounded-[4px] transition-colors ${
              isDark ? 'text-[#E2DCC8]/60 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-200'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div className={`p-4 border-b ${isDark ? 'bg-[#121212] border-[#E2DCC8]/10' : 'bg-slate-50/50 border-slate-100'}`}>
          <div className="relative">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-[#E2DCC8]/50' : 'text-slate-400'}`} size={15} />
            <input
              type="text"
              autoFocus
              placeholder="Search target category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full border rounded-[4px] pl-10 pr-4 py-2 text-xs font-semibold outline-none transition-all ${
                isDark 
                  ? 'bg-[#1a1a1a] border-[#E2DCC8]/20 text-[#F1F1F1] placeholder-[#E2DCC8]/40 focus:border-[#0F3D3E] focus:ring-1 focus:ring-[#0F3D3E]' 
                  : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-[#0F3D3E] focus:ring-1 focus:ring-[#0F3D3E]'
              }`}
            />
          </div>
        </div>

        {/* Categories List / Grid */}
        <div className="max-h-[380px] overflow-y-auto p-4 custom-scrollbar space-y-2">
          {categories.length === 0 ? (
            <div className="py-12 text-center px-4">
              <FolderTree size={32} className={`mx-auto mb-3 ${isDark ? 'text-[#E2DCC8]/30' : 'text-slate-300'}`} />
              <h4 className="text-sm font-bold">No categories created yet</h4>
              <p className={`text-xs mt-1 ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
                Create your first category before adding products.
              </p>
              <button
                type="button"
                onClick={handleCreateNewCategory}
                className="mt-4 px-4 py-2 bg-[#0F3D3E] hover:bg-[#155455] text-white border border-[#E2DCC8]/30 rounded-[4px] font-bold text-xs uppercase tracking-wider"
              >
                + Create Category
              </button>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="py-8 text-center px-4">
              <p className={`text-xs ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
                No category matches "{searchTerm}"
              </p>
            </div>
          ) : (
            filteredCategories.map(cat => {
              const count = products.filter(p => String(p.categoryId) === String(cat.id)).length;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleSelectCategory(String(cat.id))}
                  className={`w-full group p-3 rounded-[6px] border text-left transition-all flex items-center justify-between ${
                    isDark 
                      ? 'bg-[#181818] border-[#E2DCC8]/15 hover:bg-[#0F3D3E]/20 hover:border-[#0F3D3E]' 
                      : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-[#0F3D3E]/40 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div 
                      className="w-8 h-8 rounded-[4px] flex items-center justify-center text-white font-bold text-xs border border-[#E2DCC8]/30 shrink-0 shadow-sm"
                      style={{ backgroundColor: cat.color || '#0F3D3E' }}
                    >
                      {cat.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className={`text-xs font-bold truncate group-hover:text-[#0F3D3E] dark:group-hover:text-[#E2DCC8] transition-colors ${
                        isDark ? 'text-[#F1F1F1]' : 'text-slate-800'
                      }`}>
                        {cat.name}
                      </h4>
                      <p className={`text-[10px] font-medium mt-0.5 ${isDark ? 'text-[#E2DCC8]/60' : 'text-slate-500'}`}>
                        {count} linked {count === 1 ? 'product' : 'products'}
                        {cat.customSchema && cat.customSchema.length > 0 && (
                          <span className="ml-2 opacity-70">
                            • {cat.customSchema.length} custom {cat.customSchema.length === 1 ? 'spec' : 'specs'}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className={`p-1.5 rounded-full transition-transform group-hover:translate-x-1 ${
                    isDark ? 'text-[#E2DCC8]/50 group-hover:text-[#E2DCC8]' : 'text-slate-400 group-hover:text-[#0F3D3E]'
                  }`}>
                    <ArrowRight size={15} />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className={`px-6 py-3.5 border-t flex items-center justify-between shrink-0 ${
          isDark ? 'bg-[#171616] border-[#E2DCC8]/15' : 'bg-slate-50 border-slate-200'
        }`}>
          <button
            type="button"
            onClick={handleCreateNewCategory}
            className={`text-xs font-bold flex items-center gap-1.5 transition-colors ${
              isDark ? 'text-[#E2DCC8]/70 hover:text-white' : 'text-slate-600 hover:text-[#0F3D3E]'
            }`}
          >
            <Plus size={13} /> Create New Category
          </button>

          <button
            type="button"
            onClick={closeCreateProductModal}
            className={`px-4 py-1.5 border rounded-[4px] font-bold text-xs uppercase tracking-wider transition-all ${
              isDark 
                ? 'bg-[#1c1c1c] text-[#E2DCC8]/70 border-[#2b2b2b] hover:bg-[#252525] hover:text-white' 
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
            }`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
