
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
    <div className="flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-slate-950 p-8 lg:p-12 animate-in fade-in duration-500 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <button
              onClick={() => { setCreatingSubcategoryParentId(null); setView('category-list'); }}
              className="flex items-center gap-2 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:text-indigo-700 transition-colors mb-4"
            >
              <ArrowLeft size={14} /> Back to {isSubcategory ? 'Subcategory' : 'Category'}
            </button>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">
              {isSubcategory ? 'Create Subcategory' : 'Create Category'}
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400 font-medium">Define a new classification layer for your digital inventory.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { setCreatingSubcategoryParentId(null); setView('category-list'); }} className="px-8 py-3.5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-900 rounded-2xl transition-all">Cancel</button>
            <button onClick={handleSubmit} className="px-8 py-3.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-2">
              <Save size={18} /> {isSubcategory ? 'Save Subcategory' : 'Save Category'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8 md:p-10 space-y-10">
              <section className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-800 pb-4">
                  <FolderPlus className="text-indigo-600 dark:text-indigo-400" size={20} />
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">
                    {isSubcategory ? 'Subcategory Profile' : 'Category Profile'}
                  </h3>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Label Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Architectural Lighting"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-lg font-bold text-slate-800 dark:text-white focus:border-indigo-600 dark:focus:border-indigo-400 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Contextual Description</label>
                  <textarea
                    placeholder="Explain the classification criteria..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-base font-medium text-slate-700 dark:text-slate-300 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none min-h-[140px]"
                  />
                </div>
              </section>
            </div>
          </div>

          <div className="space-y-8">
            {isSubcategory && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8 space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-800 pb-4">
                  <AlignLeft className="text-indigo-600 dark:text-indigo-400" size={18} />
                  <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Hierarchy Placement</h3>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-50 uppercase tracking-widest ml-1">Parent Category</label>
                  <select
                    value={formData.parent}
                    onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:border-indigo-600 dark:focus:border-indigo-400 outline-none appearance-none"
                  >
                    <option value="">-- No Parent (Root) --</option>
                    {categories
                      .filter(cat => !cat.parent)
                      .map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                  </select>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8 space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Branding Parameters</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Priority Rank</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
                    <input
                      type="number"
                      value={formData.rank}
                      onChange={(e) => setFormData({ ...formData, rank: parseInt(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-slate-700 dark:text-white outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Accent UI Color</label>
                  <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-10 h-10 rounded-2xl cursor-pointer bg-transparent border-0 p-0"
                    />
                    <span className="text-[10px] font-mono font-black text-slate-500 dark:text-slate-400">{formData.color.toUpperCase()}</span>
                  </div>
                </div>

                {/* Category Thumbnail & Gallery */}
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      Category Images {formData.images?.length > 0 ? `(${formData.images.length})` : ''}
                    </label>
                    <label htmlFor="cat-multi-img" className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1 cursor-pointer hover:text-indigo-700">
                      <Plus size={12} /> Add More
                    </label>
                  </div>

                  <div className="aspect-video max-h-32 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden relative group">
                    {formData.thumbnail ? (
                      <>
                        <img src={formData.thumbnail} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 bg-indigo-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
                          <Star size={10} fill="currentColor" /> Cover
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-300 dark:text-slate-600">
                        <ImageIcon size={24} />
                        <span className="text-[10px] font-bold text-slate-400">No cover image</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input type="file" id="cat-thumb-upload" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    <label htmlFor="cat-thumb-upload" className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-3 py-2 text-[11px] font-black uppercase tracking-wider cursor-pointer transition-all shadow-sm shadow-indigo-600/20 active:scale-95">
                      <Upload size={12} /> Upload Cover
                    </label>

                    <input type="file" id="cat-multi-img" accept="image/*" multiple className="hidden" onChange={handleMultipleImagesUpload} />
                    <label htmlFor="cat-multi-img" className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 text-[11px] font-black uppercase tracking-wider cursor-pointer transition-all border border-slate-200 dark:border-slate-700">
                      <Plus size={12} /> Gallery (+N)
                    </label>
                  </div>

                  {formData.images && formData.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {formData.images.map((img, idx) => {
                        const isPrimary = formData.thumbnail === img;
                        return (
                          <div key={idx} className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all group ${isPrimary ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-slate-200 dark:border-slate-700'}`}>
                            <img src={img} className="w-full h-full object-cover cursor-pointer" onClick={() => setAsThumbnail(img)} title="Click to set as cover" />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(idx)}
                              className="absolute top-1 right-1 p-0.5 bg-black/60 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={10} />
                            </button>
                            {isPrimary && (
                              <div className="absolute bottom-0 inset-x-0 bg-indigo-600/90 text-white text-[8px] font-bold text-center py-0.5">
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
        </div>

        {/* New Schema Configuration Section */}
        <div className="mt-8 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8 space-y-8">
          <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-800 pb-4">
            <Package className="text-indigo-600 dark:text-indigo-400" size={20} />
            <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">
              Schema & Custom Fields
            </h3>
          </div>
          

            <CustomFieldsEditor 
              fields={formData.customSchema} 
              onChange={(fields) => setFormData({ ...formData, customSchema: fields })} 
              maxFields={10} 
            />
        </div>
      </div>
    </div>
  );
};

export default CreateCategoryForm;
