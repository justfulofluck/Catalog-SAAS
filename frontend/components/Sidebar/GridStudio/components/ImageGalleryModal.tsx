import React, { useRef } from 'react';
import { X, Image as ImageIcon, Upload, Layers, Package, Sparkles, CheckCircle2 } from 'lucide-react';
import { Product, Category, ProductGridSection } from '../../../types';
import { normalizeImageUrl, resolveProductImage } from '../../../utils/imageUtils';
import { ImageGalleryTab } from '../types';

interface ImageGalleryModalProps {
  sectionIdx: number | null;
  onClose: () => void;
  sections: ProductGridSection[];
  onSelectImage: (secIdx: number, imgUrl: string) => void;
  onUploadFile: (secIdx: number, file: File) => Promise<void>;
  isUploading: boolean;
  galleryTab: ImageGalleryTab;
  onTabChange: (tab: ImageGalleryTab) => void;
  search: string;
  onSearchChange: (val: string) => void;
  mediaItems?: any[];
  categories?: Category[];
  products: Product[];
  adminAssets?: any[];
  isDark: boolean;
}

export const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({
  sectionIdx,
  onClose,
  sections,
  onSelectImage,
  onUploadFile,
  isUploading,
  galleryTab,
  onTabChange,
  search,
  onSearchChange,
  mediaItems,
  categories,
  products,
  adminAssets,
  isDark
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (sectionIdx === null) return null;

  return (
    <div
      className="fixed inset-0 z-[1150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-2xl border rounded-xl shadow-2xl flex flex-col max-h-[82vh] overflow-hidden ${
          isDark ? 'bg-[#161616] border-[#262626] text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`px-5 py-3.5 border-b flex items-center justify-between ${
          isDark ? 'border-[#262626] bg-[#141414]' : 'border-slate-200 bg-slate-50'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#0F3D3E] flex items-center justify-center text-[#E2DCC8] shadow-sm">
              <ImageIcon size={15} />
            </div>
            <div>
              <h4 className={`text-xs font-black uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Select Picture for Section #{sectionIdx + 1}
              </h4>
              <p className={`text-[9px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Pick from your uploads, category thumbnails, product catalog, or upload a new photo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <X size={16} />
          </button>
        </div>

        {/* Search & Upload Action Bar */}
        <div className={`p-3 border-b flex flex-col sm:flex-row items-center gap-2.5 justify-between ${
          isDark ? 'border-[#242424] bg-[#181818]' : 'border-slate-200 bg-white'
        }`}>
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search media, categories, products..."
              className={`w-full pl-3 pr-8 py-1.5 border rounded-lg text-xs placeholder-slate-400 outline-none focus:border-[#0F3D3E] ${
                isDark ? 'bg-[#101010] border-[#2d2d2d] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
            {search && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-xs ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-400 hover:text-slate-800'}`}
              >
                ×
              </button>
            )}
          </div>

          {/* Prominent Upload Button */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file && sectionIdx !== null) {
                  await onUploadFile(sectionIdx, file);
                  onTabChange('uploads');
                }
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            />
            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-3.5 py-1.5 bg-[#0F3D3E] hover:bg-[#155456] text-[#E2DCC8] border border-[#E2DCC8]/40 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-[#0F3D3E]/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Upload size={12} className="text-[#E2DCC8]" />
              <span>{isUploading ? 'Uploading...' : '+ Upload New Photo'}</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className={`px-4 py-2 border-b flex items-center gap-1.5 overflow-x-auto custom-scrollbar ${
          isDark ? 'border-[#242424] bg-[#141414]' : 'border-slate-200 bg-slate-50'
        }`}>
          {[
            { id: 'uploads' as const, label: '📸 My Uploads', count: mediaItems?.length || 0 },
            { id: 'categories' as const, label: '📂 Categories', count: categories?.length || 0 },
            { id: 'products' as const, label: '📦 Products', count: products?.length || 0 },
            { id: 'presets' as const, label: '💡 Studio Presets', count: 6 },
            { id: 'admin' as const, label: '☁️ System Assets', count: adminAssets?.length || 0 },
            { id: 'all' as const, label: 'All Media', count: (mediaItems?.length || 0) + (categories?.length || 0) + (products?.length || 0) + 6 }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`px-3 py-1 rounded-md text-[9.5px] font-black uppercase tracking-wider shrink-0 transition-all ${
                galleryTab === tab.id
                  ? isDark ? 'bg-[#0F3D3E] text-[#E2DCC8] shadow-sm' : 'bg-[#0F3D3E] text-white shadow-sm'
                  : isDark ? 'bg-[#1c1c1c] text-slate-400 hover:text-white hover:bg-[#252525]' : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label} <span className="opacity-70 font-mono text-[8.5px]">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Modal Body / Media Grid */}
        <div className={`flex-1 overflow-y-auto p-4 custom-scrollbar space-y-5 ${
          isDark ? 'bg-[#111111]' : 'bg-slate-50/50'
        }`}>
          {/* 1. USER UPLOADS */}
          {(galleryTab === 'all' || galleryTab === 'uploads') && (
            <div>
              <div className={`flex items-center justify-between mb-2.5 pb-1 border-b ${isDark ? 'border-[#222]' : 'border-slate-200'}`}>
                <h5 className={`text-[10.5px] font-black uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-[#E2DCC8]' : 'text-slate-800'}`}>
                  <Upload size={12} className="text-[#00a651]" /> My Uploaded Pictures ({mediaItems?.length || 0})
                </h5>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[8.5px] text-[#00a651] hover:underline font-bold uppercase"
                >
                  + Upload More
                </button>
              </div>

              {!mediaItems || mediaItems.length === 0 ? (
                <div className={`p-6 rounded-xl border border-dashed text-center space-y-2 ${
                  isDark ? 'border-[#333] bg-[#161616]' : 'border-slate-300 bg-white shadow-sm'
                }`}>
                  <Upload size={22} className="mx-auto text-slate-500" />
                  <p className={`text-xs font-bold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>No uploaded pictures yet</p>
                  <p className="text-[9px] text-slate-500">Upload your product photos, logos, or catalog assets here.</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-[#0F3D3E] text-[#E2DCC8] rounded-md text-[9px] font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow"
                  >
                    <Upload size={11} /> Upload Picture Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {mediaItems
                    .filter(item => !search || (item.name && item.name.toLowerCase().includes(search.toLowerCase())))
                    .map((item) => {
                      const imgUrl = normalizeImageUrl(item.url);
                      const isSelected = sections[sectionIdx]?.imageSrc === imgUrl;
                      return (
                        <div
                          key={`media-${item.id}`}
                          onClick={() => {
                            onSelectImage(sectionIdx, imgUrl);
                            onClose();
                          }}
                          className={`relative rounded-lg border p-1.5 cursor-pointer flex flex-col items-center gap-1.5 transition-all group ${
                            isSelected
                              ? isDark ? 'border-[#00a651] bg-[#0F3D3E]/30 ring-2 ring-[#00a651]' : 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400'
                              : isDark ? 'border-[#262626] bg-[#161616] hover:border-[#0F3D3E] hover:bg-[#1d1d1d]' : 'border-slate-200 bg-white hover:border-[#0F3D3E] hover:bg-slate-50 shadow-sm'
                          }`}
                        >
                          <div className={`w-full h-24 rounded-md flex items-center justify-center overflow-hidden p-1 ${
                            isDark ? 'bg-[#0d0d0d]' : 'bg-slate-100'
                          }`}>
                            <img
                              src={imgUrl}
                              alt={item.name}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="w-full text-center px-0.5">
                            <p className={`text-[9px] font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{item.name || 'Uploaded Image'}</p>
                            <p className="text-[8px] text-slate-400 font-mono">{item.size || 'Upload'}</p>
                          </div>
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#00a651] text-black flex items-center justify-center shadow-md">
                              <CheckCircle2 size={12} className="stroke-[3]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* 2. CATEGORY THUMBNAILS */}
          {(galleryTab === 'all' || galleryTab === 'categories') && categories && (
            <div>
              <div className={`flex items-center justify-between mb-2.5 pb-1 border-b ${isDark ? 'border-[#222]' : 'border-slate-200'}`}>
                <h5 className={`text-[10.5px] font-black uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-[#E2DCC8]' : 'text-slate-800'}`}>
                  <Layers size={12} className="text-[#0F3D3E]" /> Category Thumbnails ({categories.length})
                </h5>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {categories
                  .filter(cat => cat.thumbnail || (cat.images && cat.images.length > 0))
                  .filter(cat => !search || cat.name.toLowerCase().includes(search.toLowerCase()))
                  .map((cat) => {
                    const imgUrl = normalizeImageUrl(cat.thumbnail || cat.images?.[0]);
                    const isSelected = sections[sectionIdx]?.imageSrc === imgUrl;
                    return (
                      <div
                        key={`cat-${cat.id}`}
                        onClick={() => {
                          onSelectImage(sectionIdx, imgUrl);
                          onClose();
                        }}
                        className={`relative rounded-lg border p-1.5 cursor-pointer flex flex-col items-center gap-1.5 transition-all group ${
                          isSelected
                            ? isDark ? 'border-[#00a651] bg-[#0F3D3E]/30 ring-2 ring-[#00a651]' : 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400'
                            : isDark ? 'border-[#262626] bg-[#161616] hover:border-[#0F3D3E] hover:bg-[#1d1d1d]' : 'border-slate-200 bg-white hover:border-[#0F3D3E] hover:bg-slate-50 shadow-sm'
                        }`}
                      >
                        <div className={`w-full h-24 rounded-md flex items-center justify-center overflow-hidden p-1 ${
                          isDark ? 'bg-[#0d0d0d]' : 'bg-slate-100'
                        }`}>
                          <img
                            src={imgUrl}
                            alt={cat.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="w-full text-center px-0.5">
                          <p className={`text-[9px] font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{cat.name}</p>
                          <p className="text-[8px] text-[#00a651] font-bold">Category</p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#00a651] text-black flex items-center justify-center shadow-md">
                            <CheckCircle2 size={12} className="stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* 3. PRODUCT CATALOG PHOTOS */}
          {(galleryTab === 'all' || galleryTab === 'products') && (
            <div>
              <div className={`flex items-center justify-between mb-2.5 pb-1 border-b ${isDark ? 'border-[#222]' : 'border-slate-200'}`}>
                <h5 className={`text-[10.5px] font-black uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-[#E2DCC8]' : 'text-slate-800'}`}>
                  <Package size={12} className="text-[#38bdf8]" /> Product Catalog Photos ({products?.length || 0})
                </h5>
              </div>
              {products.length === 0 ? (
                <div className="py-4 text-center text-slate-500 text-xs">No product photos found.</div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {products
                    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())))
                    .map((p) => {
                      const targetCat = categories?.find(c => String(c.id) === String(p.categoryId));
                      const imgUrl = resolveProductImage(p, targetCat, products);
                      const isSelected = sections[sectionIdx]?.imageSrc === imgUrl;
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            onSelectImage(sectionIdx, imgUrl);
                            onClose();
                          }}
                          className={`relative rounded-lg border p-1.5 cursor-pointer flex flex-col items-center gap-1.5 transition-all group ${
                            isSelected
                              ? isDark ? 'border-[#00a651] bg-[#0F3D3E]/30 ring-2 ring-[#00a651]' : 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400'
                              : isDark ? 'border-[#262626] bg-[#161616] hover:border-[#38bdf8]/60 hover:bg-[#1d1d1d]' : 'border-slate-200 bg-white hover:border-[#38bdf8]/60 hover:bg-slate-50 shadow-sm'
                          }`}
                        >
                          <div className={`w-full h-24 rounded-md flex items-center justify-center overflow-hidden p-1 ${
                            isDark ? 'bg-[#0d0d0d]' : 'bg-slate-100'
                          }`}>
                            <img
                              src={imgUrl}
                              alt={p.name}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="w-full text-center px-0.5">
                            <p className={`text-[9px] font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{p.name || 'Product'}</p>
                            <p className="text-[8px] text-slate-400 font-mono">{p.sku || ''}</p>
                          </div>
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#00a651] text-black flex items-center justify-center shadow-md">
                              <CheckCircle2 size={12} className="stroke-[3]" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* 4. STUDIO PRESETS */}
          {(galleryTab === 'all' || galleryTab === 'presets') && (
            <div>
              <div className={`flex items-center justify-between mb-2.5 pb-1 border-b ${isDark ? 'border-[#222]' : 'border-slate-200'}`}>
                <h5 className={`text-[10.5px] font-black uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-[#E2DCC8]' : 'text-slate-800'}`}>
                  <Sparkles size={12} className="text-amber-400" /> Studio Light Presets (6)
                </h5>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: 'preset-1', name: 'COB Downlight', url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=600' },
                  { id: 'preset-2', name: 'Pendant Luminaire', url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600' },
                  { id: 'preset-3', name: 'Recessed Track', url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=600' },
                  { id: 'preset-4', name: 'Modern Fixture', url: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&q=80&w=600' },
                  { id: 'preset-5', name: 'Architectural Spot', url: 'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?auto=format&fit=crop&q=80&w=600' },
                  { id: 'preset-6', name: 'Linear Diffuser', url: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?auto=format&fit=crop&q=80&w=600' }
                ]
                  .filter(preset => !search || preset.name.toLowerCase().includes(search.toLowerCase()))
                  .map((preset) => {
                    const isSelected = sections[sectionIdx]?.imageSrc === preset.url;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => {
                          onSelectImage(sectionIdx, preset.url);
                          onClose();
                        }}
                        className={`relative rounded-lg border p-1.5 cursor-pointer flex flex-col items-center gap-1.5 transition-all group ${
                          isSelected
                            ? isDark ? 'border-[#00a651] bg-[#0F3D3E]/30 ring-2 ring-[#00a651]' : 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400'
                            : isDark ? 'border-[#262626] bg-[#161616] hover:border-amber-400/60 hover:bg-[#1d1d1d]' : 'border-slate-200 bg-white hover:border-amber-400/60 hover:bg-slate-50 shadow-sm'
                        }`}
                      >
                        <div className={`w-full h-24 rounded-md flex items-center justify-center overflow-hidden ${
                          isDark ? 'bg-[#0d0d0d]' : 'bg-slate-100'
                        }`}>
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="w-full text-center px-0.5">
                          <p className={`text-[9px] font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{preset.name}</p>
                          <p className="text-[8px] text-slate-400">Studio</p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#00a651] text-black flex items-center justify-center shadow-md">
                            <CheckCircle2 size={12} className="stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* 5. SYSTEM / ADMIN ASSETS */}
          {(galleryTab === 'all' || galleryTab === 'admin') && adminAssets && adminAssets.length > 0 && (
            <div>
              <div className={`flex items-center justify-between mb-2.5 pb-1 border-b ${isDark ? 'border-[#222]' : 'border-slate-200'}`}>
                <h5 className={`text-[10.5px] font-black uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-[#E2DCC8]' : 'text-slate-800'}`}>
                  <Sparkles size={12} className="text-[#0F3D3E]" /> System Assets ({adminAssets.length})
                </h5>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {adminAssets
                  .filter(a => !search || a.name.toLowerCase().includes(search.toLowerCase()))
                  .map((a) => {
                    const imgUrl = normalizeImageUrl(a.url);
                    const isSelected = sections[sectionIdx]?.imageSrc === imgUrl;
                    return (
                      <div
                        key={`admin-${a.id}`}
                        onClick={() => {
                          onSelectImage(sectionIdx, imgUrl);
                          onClose();
                        }}
                        className={`relative rounded-lg border p-1.5 cursor-pointer flex flex-col items-center gap-1.5 transition-all group ${
                          isSelected
                            ? isDark ? 'border-[#00a651] bg-[#0F3D3E]/30 ring-2 ring-[#00a651]' : 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400'
                            : isDark ? 'border-[#262626] bg-[#161616] hover:border-[#0F3D3E] hover:bg-[#1d1d1d]' : 'border-slate-200 bg-white hover:border-[#0F3D3E] hover:bg-slate-50 shadow-sm'
                        }`}
                      >
                        <div className={`w-full h-24 rounded-md flex items-center justify-center overflow-hidden p-1 ${
                          isDark ? 'bg-[#0d0d0d]' : 'bg-slate-100'
                        }`}>
                          <img
                            src={imgUrl}
                            alt={a.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="w-full text-center px-0.5">
                          <p className={`text-[9px] font-bold truncate ${isDark ? 'text-white' : 'text-slate-800'}`}>{a.name}</p>
                          <p className="text-[8px] text-slate-400 font-mono">System</p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#00a651] text-black flex items-center justify-center shadow-md">
                            <CheckCircle2 size={12} className="stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
