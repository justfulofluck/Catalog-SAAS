import React, { useState } from 'react';
import { ArrowLeft, Save, Palette, Hash, AlignLeft, Image as ImageIcon, Upload, Info, FolderPlus, Package, Plus, X, Star } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { CustomFieldsEditor } from '../Settings/CustomFieldsEditor';
import { FormField } from '../../types';
import { DEFAULT_CATEGORY_SCHEMA } from '../../constants';

const CreateCategoryForm: React.FC = () => {
  const { setView, addCategory, categories, creatingSubcategoryParentId, setCreatingSubcategoryParentId, uiTheme, addMedia } = useStore();
  const isDark = uiTheme === 'dark';

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rank: 0,
    color: '#4f46e5',
    thumbnail: '',
    images: [] as string[],
    parent: creatingSubcategoryParentId || '',
    customSchema: [...DEFAULT_CATEGORY_SCHEMA] as FormField[]
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const media = await addMedia(file);
        const url = media.url;
        setFormData(prev => {
          const currentImages = prev.images || [];
          return {
            ...prev,
            thumbnail: url,
            images: currentImages.includes(url) ? currentImages : [url, ...currentImages]
          };
        });
      } catch (err) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setFormData(prev => {
            const currentImages = prev.images || [];
            return {
              ...prev,
              thumbnail: result,
              images: currentImages.includes(result) ? currentImages : [result, ...currentImages]
            };
          });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleMultipleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      try {
        const media = await addMedia(file);
        const url = media.url;
        setFormData(prev => {
          const currentImages = prev.images || [];
          return {
            ...prev,
            thumbnail: prev.thumbnail || url,
            images: [...currentImages, url]
          };
        });
      } catch (err) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setFormData(prev => {
            const currentImages = prev.images || [];
            return {
              ...prev,
              thumbnail: prev.thumbnail || result,
              images: [...currentImages, result]
            };
          });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeGalleryImage = (indexToRemove: number) => {
    setFormData(prev => {
      const currentImages = (prev.images || []).filter((_, idx) => idx !== indexToRemove);
      const newThumbnail = prev.thumbnail === prev.images[indexToRemove] ? (currentImages[0] || '') : prev.thumbnail;
      return {
        ...prev,
        thumbnail: newThumbnail,
        images: currentImages
      };
    });
  };

  const setAsThumbnail = (img: string) => {
    setFormData(prev => ({ ...prev, thumbnail: img }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCategory({
      id: `cat-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      rank: formData.rank,
      color: formData.color,
      thumbnail: formData.thumbnail,
      images: formData.images,
      parent: formData.parent ? formData.parent : undefined,
      productCount: 0,
      customSchema: formData.customSchema
    });
    setCreatingSubcategoryParentId(null);
    setView('category-list');
  };

  const isSubcategory = !!creatingSubcategoryParentId;

  return (
    <div className={`flex-1 flex flex-col overflow-hidden animate-in fade-in duration-500 ${
      isDark ? 'bg-[#100F0F] text-white' : 'bg-slate-50 text-slate-800'
    }`}>
      {/* Single Line Header & Toolbar */}
      <div className={`px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4 shrink-0 ${
        isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col min-w-[200px]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setCreatingSubcategoryParentId(null); setView('category-list'); }}
              className={`transition-colors p-1 -ml-1 rounded-[3px] ${
                isDark ? 'text-[#888888] hover:text-[#E2DCC8] hover:bg-[#222222]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={`Back to ${isSubcategory ? 'Subcategory' : 'Category'}`}
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className={`text-xl font-semibold tracking-tight leading-none font-heading ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {isSubcategory ? 'Create Subcategory' : 'Create Category'}
            </h1>
          </div>
          <p className={`text-xs font-normal mt-1 ml-7 ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>
            Define a new classification layer for your digital inventory.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 ml-auto">
          <button 
            type="button"
            onClick={() => { setCreatingSubcategoryParentId(null); setView('category-list'); }} 
            className={`px-3.5 py-2 text-xs font-semibold uppercase tracking-wider rounded-[4px] border transition-all ${
              isDark 
                ? 'text-[#888888] hover:text-white hover:bg-[#222222] border-transparent hover:border-[#262626]' 
                : 'text-slate-600 hover:text-slate-900 bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={handleSubmit} 
            className="px-4 py-2 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] font-bold text-xs uppercase tracking-wider shadow-md shadow-[#0F3D3E]/20 transition-all flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
          >
            <Save size={14} /> {isSubcategory ? 'Save Subcategory' : 'Save Category'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="max-w-[1600px] mx-auto space-y-8">

          {/* Top Row: Category Profile (Left) & Branding Parameters (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Category Profile & Description */}
            <div className={`lg:col-span-7 xl:col-span-8 rounded-[4px] border p-7 md:p-8 space-y-6 ${
              isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className={`flex items-center gap-2 border-b pb-4 ${isDark ? 'border-[#262626]' : 'border-slate-100'}`}>
                <FolderPlus className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} size={20} />
                <h3 className={`font-space text-sm font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {isSubcategory ? 'Subcategory Profile' : 'Category Profile'}
                </h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>Label Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Architectural Lighting"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full border rounded-[4px] px-5 py-3.5 text-base font-bold outline-none transition-colors ${
                      isDark 
                        ? 'bg-[#1c1c1c] border-[#262626] text-white focus:border-[#0F3D3E]' 
                        : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-[#0F3D3E]'
                    }`}
                  />
                </div>
                <div className="space-y-2">
                  <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>Contextual Description</label>
                  <textarea
                    placeholder="Explain the classification criteria..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`w-full border rounded-[4px] p-5 text-sm font-medium outline-none min-h-[160px] transition-colors ${
                      isDark 
                        ? 'bg-[#1c1c1c] border-[#262626] text-white placeholder-[#666666] focus:border-[#0F3D3E]' 
                        : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-[#0F3D3E]'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Hierarchy Placement & Branding Images */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6">
              {isSubcategory && (
                <div className={`rounded-[4px] border p-6 space-y-4 ${
                  isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200 shadow-sm'
                }`}>
                  <div className={`flex items-center gap-2 border-b pb-3 ${isDark ? 'border-[#262626]' : 'border-slate-100'}`}>
                    <AlignLeft className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} size={18} />
                    <h3 className={`font-space text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-[#888888]' : 'text-slate-600'}`}>Hierarchy Placement</h3>
                  </div>
                  <div className="space-y-2">
                    <label className={`text-[10px] font-bold uppercase tracking-widest ml-1 ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>Parent Category</label>
                    <select
                      value={formData.parent}
                      onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                      className={`w-full border rounded-[4px] px-4 py-3 text-sm font-bold outline-none appearance-none cursor-pointer ${
                        isDark 
                          ? 'bg-[#1c1c1c] border-[#262626] text-white focus:border-[#0F3D3E]' 
                          : 'bg-white border-slate-200 text-slate-800 focus:border-[#0F3D3E]'
                      }`}
                    >
                      <option value="" className={isDark ? "bg-[#161616]" : "bg-white"}>-- No Parent (Root) --</option>
                      {categories
                        .filter(cat => !cat.parent)
                        .map(cat => (
                          <option key={cat.id} value={cat.id} className={isDark ? "bg-[#161616]" : "bg-white"}>{cat.name}</option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

              <div className={`rounded-[4px] border p-6 space-y-5 ${
                isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className={`flex justify-between items-center border-b pb-3 ${isDark ? 'border-[#262626]' : 'border-slate-100'}`}>
                  <h3 className={`font-space text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-[#888888]' : 'text-slate-600'}`}>
                    Category Images {formData.images?.length > 0 ? `(${formData.images.length})` : ''}
                  </h3>
                  <label htmlFor="cat-multi-img" className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 cursor-pointer transition-colors ${
                    isDark ? 'text-[#E2DCC8] hover:text-white' : 'text-[#0F3D3E] hover:underline'
                  }`}>
                    <Plus size={12} /> Add More
                  </label>
                </div>

                <div className="space-y-3">
                  <div className={`aspect-video max-h-36 rounded-[4px] border-2 border-dashed flex items-center justify-center overflow-hidden relative group ${
                    isDark ? 'bg-[#1c1c1c] border-[#262626]' : 'bg-slate-50 border-slate-300'
                  }`}>
                    {formData.thumbnail ? (
                      <>
                        <img src={formData.thumbnail} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 bg-[#0F3D3E] text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-[4px] flex items-center gap-1 shadow">
                          <Star size={10} fill="currentColor" /> Cover
                        </div>
                      </>
                    ) : (
                      <div className={`flex flex-col items-center gap-1 ${isDark ? 'text-[#666666]' : 'text-slate-400'}`}>
                        <ImageIcon size={24} />
                        <span className={`text-[10px] font-bold ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>No cover image</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2.5">
                    <input type="file" id="cat-thumb-upload" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <label htmlFor="cat-thumb-upload" className="flex-1 flex items-center justify-center gap-1.5 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-all shadow-sm shadow-[#0F3D3E]/20 active:scale-95">
                      <Upload size={13} /> Upload Cover
                    </label>

                    <input type="file" id="cat-multi-img" accept="image/*" multiple className="hidden" onChange={handleMultipleImagesUpload} />
                    <label htmlFor="cat-multi-img" className={`flex-1 flex items-center justify-center gap-1.5 rounded-[4px] px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-all border ${
                      isDark 
                        ? 'bg-[#1c1c1c] hover:bg-[#262626] text-[#999999] hover:text-white border-[#262626]' 
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                    }`}>
                      <Plus size={13} /> Gallery (+N)
                    </label>
                  </div>

                  {formData.images && formData.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {formData.images.map((img, idx) => {
                        const isPrimary = formData.thumbnail === img;
                        return (
                          <div key={idx} className={`relative aspect-square rounded-[4px] overflow-hidden border-2 transition-all group ${isPrimary ? 'border-[#0F3D3E] ring-2 ring-[#0F3D3E]/40' : (isDark ? 'border-[#262626]' : 'border-slate-200')}`}>
                            <img src={img} className="w-full h-full object-cover cursor-pointer" onClick={() => setAsThumbnail(img)} title="Click to set as cover" />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(idx)}
                              className="absolute top-1 right-1 p-0.5 bg-black/70 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={10} />
                            </button>
                            {isPrimary && (
                              <div className="absolute bottom-0 inset-x-0 bg-[#0F3D3E]/90 text-white text-[8px] font-bold text-center py-0.5">
                                Cover
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Schema Configuration (Clean single-card layout) */}
          <div className={`rounded-[4px] border p-7 md:p-8 space-y-6 ${
            isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 ${isDark ? 'border-[#262626]' : 'border-slate-100'}`}>
              <div className="flex items-center gap-2">
                <Package className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} size={20} />
                <div>
                  <h3 className={`font-space text-sm font-bold uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Schema & Custom Fields
                  </h3>
                  <p className={`text-xs font-normal mt-0.5 ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>
                    Define product attributes ({formData.customSchema.length}/10 configured) for items in this category.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, customSchema: [...DEFAULT_CATEGORY_SCHEMA] }))}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-[4px] border transition-all ${
                    isDark 
                      ? 'border-[#333333] hover:border-[#0F3D3E] text-[#cccccc] hover:text-white bg-[#1c1c1c]' 
                      : 'border-slate-200 hover:border-[#0F3D3E] text-slate-600 hover:text-slate-900 bg-slate-50'
                  }`}
                  title="Reset to default preset schema"
                >
                  Load Preset
                </button>
                {formData.customSchema.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, customSchema: [] }))}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-[4px] border transition-all ${
                      isDark 
                        ? 'border-[#333333] hover:border-red-900/50 text-[#888888] hover:text-red-400 bg-[#1c1c1c]' 
                        : 'border-slate-200 hover:border-red-200 text-slate-500 hover:text-red-600 bg-slate-50'
                    }`}
                    title="Clear all fields"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            <CustomFieldsEditor 
              fields={formData.customSchema} 
              onChange={(fields) => setFormData({ ...formData, customSchema: fields })} 
              maxFields={10} 
              hideOuterWrapper={true}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreateCategoryForm;
