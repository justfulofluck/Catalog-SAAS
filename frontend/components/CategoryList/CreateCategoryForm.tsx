
import React, { useState } from 'react';
import { ArrowLeft, Save, Palette, Hash, AlignLeft, Image as ImageIcon, Upload, Info, FolderPlus, Package, Plus, X, Star } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { CustomFieldsEditor } from '../Settings/CustomFieldsEditor';
import { FormField } from '../../types';

const CreateCategoryForm: React.FC = () => {
  const { setView, addCategory, categories, creatingSubcategoryParentId, setCreatingSubcategoryParentId } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rank: 0,
    color: '#4f46e5',
    thumbnail: '',
    images: [] as string[],
    parent: creatingSubcategoryParentId || '',
    customSchema: [] as FormField[]
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
  };

  const handleMultipleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
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
    });
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
    <div className="flex-1 flex flex-col overflow-hidden bg-[#100F0F] text-white animate-in fade-in duration-500">
      {/* Single Line Header & Toolbar */}
      <div className="px-6 py-4 bg-[#161616] border-b border-[#262626] flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex flex-col min-w-[200px]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setCreatingSubcategoryParentId(null); setView('category-list'); }}
              className="text-[#888888] hover:text-[#E2DCC8] transition-colors p-1 -ml-1 rounded-[3px] hover:bg-[#222222]"
              title={`Back to ${isSubcategory ? 'Subcategory' : 'Category'}`}
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className="text-xl font-semibold text-white tracking-tight leading-none font-heading">
              {isSubcategory ? 'Create Subcategory' : 'Create Category'}
            </h1>
          </div>
          <p className="text-xs text-[#888888] font-normal mt-1 ml-7">
            Define a new classification layer for your digital inventory.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 ml-auto">
          <button 
            type="button"
            onClick={() => { setCreatingSubcategoryParentId(null); setView('category-list'); }} 
            className="px-3.5 py-2 text-xs font-semibold text-[#888888] uppercase tracking-wider hover:text-white hover:bg-[#222222] rounded-[4px] border border-transparent hover:border-[#262626] transition-all"
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
            <div className="lg:col-span-7 xl:col-span-8 bg-[#161616] rounded-[4px] border border-[#262626] p-7 md:p-8 space-y-6">
              <div className="flex items-center gap-2 border-b border-[#262626] pb-4">
                <FolderPlus className="text-[#E2DCC8]" size={20} />
                <h3 className="font-space text-sm font-bold text-white uppercase tracking-widest">
                  {isSubcategory ? 'Subcategory Profile' : 'Category Profile'}
                </h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest ml-1">Label Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Architectural Lighting"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-[#262626] rounded-[4px] px-5 py-3.5 text-base font-bold text-white focus:border-[#0F3D3E] outline-none transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest ml-1">Contextual Description</label>
                  <textarea
                    placeholder="Explain the classification criteria..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#1c1c1c] border border-[#262626] rounded-[4px] p-5 text-sm font-medium text-white placeholder-[#666666] focus:border-[#0F3D3E] outline-none min-h-[160px] transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Hierarchy Placement & Branding Images */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6">
              {isSubcategory && (
                <div className="bg-[#161616] rounded-[4px] border border-[#262626] p-6 space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#262626] pb-3">
                    <AlignLeft className="text-[#E2DCC8]" size={18} />
                    <h3 className="font-space text-[10px] font-bold text-[#888888] uppercase tracking-widest">Hierarchy Placement</h3>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest ml-1">Parent Category</label>
                    <select
                      value={formData.parent}
                      onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                      className="w-full bg-[#1c1c1c] border border-[#262626] rounded-[4px] px-4 py-3 text-sm font-bold text-white focus:border-[#0F3D3E] outline-none appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-[#161616]">-- No Parent (Root) --</option>
                      {categories
                        .filter(cat => !cat.parent)
                        .map(cat => (
                          <option key={cat.id} value={cat.id} className="bg-[#161616]">{cat.name}</option>
                        ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="bg-[#161616] rounded-[4px] border border-[#262626] p-6 space-y-5">
                <div className="flex justify-between items-center border-b border-[#262626] pb-3">
                  <h3 className="font-space text-[10px] font-bold text-[#888888] uppercase tracking-widest">
                    Category Images {formData.images?.length > 0 ? `(${formData.images.length})` : ''}
                  </h3>
                  <label htmlFor="cat-multi-img" className="text-[9px] font-bold text-[#E2DCC8] uppercase tracking-widest flex items-center gap-1 cursor-pointer hover:text-[#E2DCC8] transition-colors">
                    <Plus size={12} /> Add More
                  </label>
                </div>

                <div className="space-y-3">
                  <div className="aspect-video max-h-36 bg-[#1c1c1c] rounded-[4px] border-2 border-dashed border-[#262626] flex items-center justify-center overflow-hidden relative group">
                    {formData.thumbnail ? (
                      <>
                        <img src={formData.thumbnail} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 bg-[#0F3D3E] text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-[4px] flex items-center gap-1 shadow">
                          <Star size={10} fill="currentColor" /> Cover
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-[#666666]">
                        <ImageIcon size={24} />
                        <span className="text-[10px] font-bold text-[#888888]">No cover image</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2.5">
                    <input type="file" id="cat-thumb-upload" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <label htmlFor="cat-thumb-upload" className="flex-1 flex items-center justify-center gap-1.5 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-all shadow-sm shadow-[#0F3D3E]/20 active:scale-95">
                      <Upload size={13} /> Upload Cover
                    </label>

                    <input type="file" id="cat-multi-img" accept="image/*" multiple className="hidden" onChange={handleMultipleImagesUpload} />
                    <label htmlFor="cat-multi-img" className="flex-1 flex items-center justify-center gap-1.5 bg-[#1c1c1c] hover:bg-[#262626] text-[#999999] hover:text-white rounded-[4px] px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-all border border-[#262626]">
                      <Plus size={13} /> Gallery (+N)
                    </label>
                  </div>

                  {formData.images && formData.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {formData.images.map((img, idx) => {
                        const isPrimary = formData.thumbnail === img;
                        return (
                          <div key={idx} className={`relative aspect-square rounded-[4px] overflow-hidden border-2 transition-all group ${isPrimary ? 'border-[#0F3D3E] ring-2 ring-[#0F3D3E]/40' : 'border-[#262626]'}`}>
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
          <div className="bg-[#161616] rounded-[4px] border border-[#262626] p-7 md:p-8 space-y-6">
            <div className="flex items-center gap-2 border-b border-[#262626] pb-4">
              <Package className="text-[#E2DCC8]" size={20} />
              <div>
                <h3 className="font-space text-sm font-bold text-white uppercase tracking-widest">
                  Schema & Custom Fields
                </h3>
                <p className="text-xs text-[#888888] font-normal mt-0.5">
                  Define product attributes ({formData.customSchema.length}/10 configured) for items in this category.
                </p>
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
