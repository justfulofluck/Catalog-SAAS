
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Hash, AlignLeft, Image as ImageIcon, DollarSign, FolderTree, ChevronDown, Package, Info, Upload, Sparkles, RefreshCcw, Layers, CreditCard, Plus, X, Star, Table as TableIcon, Trash2 } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { CURRENCIES } from '../../constants';
import { FormField, ProductVariant } from '../../types';

const CreateProductForm: React.FC = () => {
  const { setView, addProduct, categories, defaultCurrency } = useStore();

  const [formData, setFormData] = useState<Record<string, any>>({
    name: '',
    sku: '',
    price: '',
    currency: defaultCurrency,
    description: '',
    image: '',
    images: [],
    categoryId: ''
  });

  const [variants, setVariants] = useState<ProductVariant[]>([
    {
      id: `var-${Date.now()}-1`,
      sku: '',
      name: '',
      cutOut: '',
      color: '',
      price: '',
      packing: ''
    }
  ]);

  const [combinedSchema, setCombinedSchema] = useState<FormField[]>([]);
  const [isAutoSku, setIsAutoSku] = useState(true);

  // Update schema when category changes
  useEffect(() => {
    if (formData.categoryId) {
      const selectedCategory = categories.find(c => c.id === formData.categoryId);
      if (selectedCategory) {
        setCombinedSchema([...(selectedCategory.customSchema || [])]);
      } else {
        setCombinedSchema([]);
      }
    } else {
      setCombinedSchema([]);
    }
  }, [formData.categoryId, categories]);

  // Automatic SKU Generation Logic
  useEffect(() => {
    if (isAutoSku && formData.name?.trim()) {
      const category = categories.find(c => c.id === formData.categoryId);
      const prefix = category ? category.name.substring(0, 3).toUpperCase() : 'GEN';
      const namePart = formData.name
        .split(' ')
        .map((word: string) => word.substring(0, 3).toUpperCase())
        .filter((p: string) => p.length > 0)
        .join('-');

      const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();
      const generatedSku = `${prefix}-${namePart}-${randomPart}`.substring(0, 20);
      setFormData(prev => ({ ...prev, sku: generatedSku }));
    }
  }, [formData.name, formData.categoryId, isAutoSku, categories]);

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, fieldKey: string = 'image') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        handleInputChange(fieldKey, result);
        if (fieldKey === 'image') {
          setFormData(prev => {
            const currentImages = prev.images || [];
            if (!currentImages.includes(result)) {
              return { ...prev, image: result, images: [result, ...currentImages] };
            }
            return { ...prev, image: result };
          });
        }
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
          const updated = [...currentImages, result];
          return {
            ...prev,
            images: updated,
            image: prev.image || result
          };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (indexToRemove: number) => {
    setFormData(prev => {
      const currentImages = (prev.images || []).filter((_: any, idx: number) => idx !== indexToRemove);
      const newPrimary = prev.image === prev.images[indexToRemove] ? (currentImages[0] || '') : prev.image;
      return {
        ...prev,
        images: currentImages,
        image: newPrimary
      };
    });
  };

  const setAsPrimaryImage = (img: string) => {
    setFormData(prev => ({
      ...prev,
      image: img
    }));
  };

  const handleAddVariantRow = () => {
    setVariants(prev => [
      ...prev,
      {
        id: `var-${Date.now()}-${prev.length + 1}`,
        sku: formData.sku ? `${formData.sku}-V${prev.length + 1}` : '',
        name: formData.name ? `${formData.name} Variant` : '',
        cutOut: '75MM',
        color: 'W, W.W, N.W',
        price: formData.price || '0',
        packing: '20 PCS'
      }
    ]);
  };

  const handleVariantChange = (index: number, key: keyof ProductVariant, val: any) => {
    setVariants(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: val };
      return copy;
    });
  };

  const handleRemoveVariantRow = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalProduct: any = {
      id: `p-${Date.now()}`,
      name: formData.name || 'Untitled Product',
      price: parseFloat(formData.price) || 0,
      description: formData.description || '',
      currency: formData.currency || defaultCurrency,
      sku: formData.sku || `GEN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      categoryId: formData.categoryId || undefined,
      images: formData.images || [],
      variants: variants.filter(v => v.name || v.sku || v.price)
    };

    if (formData.image || (formData.images && formData.images.length > 0)) {
      finalProduct.image = formData.image || formData.images[0];
    }

    const customFields: Record<string, any> = {};

    if (combinedSchema.length > 0) {
      combinedSchema.forEach(field => {
        const value = formData[field.id];
        const lowerLabel = (field.label || '').toLowerCase();

        if (field.id === 'prod_name' || lowerLabel.includes('product name') || lowerLabel === 'name') {
          if (value) finalProduct.name = value;
        }
        else if (field.id === 'price' || lowerLabel.includes('price')) {
          if (value !== undefined && value !== '') finalProduct.price = parseFloat(value) || 0;
        }
        else if (field.id === 'main_image' || lowerLabel.includes('main image') || lowerLabel.includes('main product image')) {
          if (value) finalProduct.image = value;
        }
        else if (field.id === 'description' || lowerLabel.includes('description')) {
          if (value) finalProduct.description = value;
        }
        else {
          if (value !== undefined) {
            customFields[field.id] = value;
          }
        }
      });
    }

    finalProduct.customFields = customFields;

    addProduct(finalProduct);
    setView('products-list');
  };

  // Helper to render dynamic fields
  const renderDynamicField = (field: FormField) => {
    const value = formData[field.id] || '';

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-700 dark:text-slate-300 min-h-[72px] focus:border-indigo-600 dark:focus:border-indigo-400 outline-none transition-all"
            placeholder={`Enter ${field.label}...`}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
          />
        );
      case 'select':
        return (
          <div className="relative">
            <select
              className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:border-indigo-600 dark:focus:border-indigo-400 outline-none appearance-none transition-all"
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              required={field.required}
            >
              <option value="">Select {field.label}...</option>
              {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        );
      case 'boolean':
        return (
          <div className="flex gap-2">
            <button type="button" onClick={() => handleInputChange(field.id, true)} className={`flex-1 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all ${value === true ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>Yes</button>
            <button type="button" onClick={() => handleInputChange(field.id, false)} className={`flex-1 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all ${value === false ? 'bg-slate-800 text-white border-slate-800' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>No</button>
          </div>
        );
      case 'image':
        return (
          <div className="space-y-2">
            {value ? (
              <div className="aspect-video max-h-32 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative group">
                <img src={value} className="w-full h-full object-cover" />
                <button type="button" onClick={() => handleInputChange(field.id, '')} className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <RefreshCcw size={12} />
                </button>
              </div>
            ) : (
              <label className="w-full h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 transition-colors">
                <Upload size={18} className="text-slate-400 mb-1" />
                <span className="text-[11px] font-bold text-slate-500">Upload {field.label}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, field.id)} />
              </label>
            )}
          </div>
        );
      default:
        return (
          <input
            type={field.type === 'number' ? 'number' : 'text'}
            className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:border-indigo-600 dark:focus:border-indigo-400 outline-none transition-all"
            placeholder={`Enter ${field.label}...`}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
          />
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-slate-950 p-6 lg:p-10 animate-in fade-in duration-500 transition-colors duration-300">
      <div className="max-w-[1600px] mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <button onClick={() => setView('products-list')} className="flex items-center gap-2 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:text-indigo-700 transition-all mb-3">
              <ArrowLeft size={14} /> Back to Library
            </button>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-1.5">New Product Entry</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Capture detailed product metadata for publication.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setView('products-list')} className="px-6 py-2.5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-all">Discard</button>
            <button onClick={handleSubmit} className="px-6 py-2.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-2">
              <Save size={16} /> Publish Product
            </button>
          </div>
        </div>

        {combinedSchema.length > 0 ? (
          <div className="space-y-6">
            {/* DYNAMIC FORM BASED ON CATEGORY SCHEMA - 3 COLUMN BALANCED GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
            
            {/* Column 1: Basic Information */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-800 pb-3">
                <Package className="text-indigo-600 dark:text-indigo-400" size={16} />
                <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Basic Information</h3>
              </div>
              <div className="space-y-4">
                {/* Standard Name Field if not in schema */}
                {!combinedSchema.some(f => f.id === 'prod_name' || (f.label || '').toLowerCase().includes('name')) && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Premium Executive Desk"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:border-indigo-600 dark:focus:border-indigo-400 outline-none transition-all"
                    />
                  </div>
                )}

                {combinedSchema.filter(f => f.section === 'basic').map(field => (
                  <div key={field.id} className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{field.label} {field.required && '*'}</label>
                    {renderDynamicField(field)}
                  </div>
                ))}

                {/* Standard Description Field if not in schema */}
                {!combinedSchema.some(f => f.id === 'description' || (f.label || '').toLowerCase().includes('description')) && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Description</label>
                    <textarea
                      placeholder="Provide a rich technical description..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-700 dark:text-slate-300 min-h-[72px] focus:border-indigo-600 dark:focus:border-indigo-400 outline-none transition-all"
                    />
                  </div>
                )}

                {/* Category dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Category Classification</label>
                  <div className="relative">
                    <FolderTree className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={15} />
                    <select
                      value={formData.categoryId}
                      onChange={(e) => handleInputChange('categoryId', e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-8 py-2.5 text-xs font-semibold text-slate-800 dark:text-white focus:border-indigo-600 dark:focus:border-indigo-400 outline-none appearance-none transition-all"
                    >
                      <option value="">Select Category...</option>
                      {categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Technical Specifications */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-800 pb-3">
                <Layers className="text-indigo-600 dark:text-indigo-400" size={16} />
                <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Technical Specifications</h3>
              </div>
              <div className="space-y-4">
                {combinedSchema.filter(f => f.section === 'technical').map(field => (
                  <div key={field.id} className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{field.label} {field.required && '*'}</label>
                    {renderDynamicField(field)}
                  </div>
                ))}
                {combinedSchema.filter(f => f.section === 'technical').length === 0 && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic">No specific technical fields for this category.</p>
                )}
              </div>
            </div>

            {/* Column 3: Commercial & Media */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-800 pb-3">
                <CreditCard className="text-indigo-600 dark:text-indigo-400" size={16} />
                <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Commercial & Media</h3>
              </div>
              <div className="space-y-4">
                {combinedSchema.filter(f => f.section === 'commercial').map(field => (
                  <div key={field.id} className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">{field.label} {field.required && '*'}</label>
                    {renderDynamicField(field)}
                  </div>
                ))}

                {/* Multiple Product Images & Gallery Section */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      Product Images & Gallery {formData.images?.length > 0 ? `(${formData.images.length})` : ''}
                    </label>
                    <label htmlFor="multi-prod-img" className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1 cursor-pointer hover:text-indigo-700">
                      <Plus size={12} /> Add More
                    </label>
                  </div>

                  {/* Primary Image Preview */}
                  <div className="aspect-video max-h-36 bg-slate-50 dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden relative group">
                    {formData.image ? (
                      <>
                        <img src={formData.image} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 bg-indigo-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 shadow">
                          <Star size={10} fill="currentColor" /> Primary
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-slate-300 dark:text-slate-600">
                        <ImageIcon size={28} />
                        <span className="text-[10px] font-bold text-slate-400">No image uploaded</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input type="file" id="prod-img-dynamic" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e)} />
                    <label htmlFor="prod-img-dynamic" className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-3 py-2 text-[11px] font-black uppercase tracking-wider cursor-pointer transition-all shadow-sm shadow-indigo-600/20 active:scale-95">
                      <Upload size={12} /> Upload Primary
                    </label>
                    
                    <input type="file" id="multi-prod-img" accept="image/*" multiple className="hidden" onChange={handleMultipleImagesUpload} />
                    <label htmlFor="multi-prod-img" className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl px-3 py-2 text-[11px] font-black uppercase tracking-wider cursor-pointer transition-all border border-slate-200 dark:border-slate-700">
                      <Plus size={12} /> Add Gallery (+N)
                    </label>
                  </div>

                  {/* Thumbnails list */}
                  {formData.images && formData.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 pt-2">
                      {formData.images.map((img: string, idx: number) => {
                        const isPrimary = formData.image === img;
                        return (
                          <div key={idx} className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all group ${isPrimary ? 'border-indigo-600 ring-2 ring-indigo-500/20' : 'border-slate-200 dark:border-slate-700'}`}>
                            <img src={img} className="w-full h-full object-cover cursor-pointer" onClick={() => setAsPrimaryImage(img)} title="Click to set as primary" />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(idx)}
                              className="absolute top-1 right-1 p-0.5 bg-black/60 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={10} />
                            </button>
                            {isPrimary && (
                              <div className="absolute bottom-0 inset-x-0 bg-indigo-600/90 text-white text-[8px] font-bold text-center py-0.5">
                                Main
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Pricing Fallback if no price field in schema */}
                {!combinedSchema.some(f => f.id === 'price' || (f.label || '').toLowerCase().includes('price')) && (
                  <div className="space-y-3 pt-3 border-t border-slate-50 dark:border-slate-700">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Base Pricing (Required)</label>
                      <div className="flex items-center gap-2">
                        <select
                          value={formData.currency}
                          onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                          className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white focus:border-indigo-600 dark:focus:border-indigo-400 outline-none appearance-none"
                        >
                          {CURRENCIES.map(c => (
                            <option key={c.code} value={c.symbol}>{c.code} ({c.symbol})</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-white focus:border-indigo-600 dark:focus:border-indigo-400 outline-none"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SKU generation */}
                <div className="space-y-1.5 pt-3 border-t border-slate-50 dark:border-slate-700">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">System SKU</label>
                    <button
                      type="button"
                      onClick={() => setIsAutoSku(!isAutoSku)}
                      className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors ${isAutoSku ? 'text-indigo-600' : 'text-slate-300'}`}
                    >
                      <Sparkles size={10} className={isAutoSku ? 'animate-pulse' : ''} /> {isAutoSku ? 'Auto-Gen Active' : 'Manual Entry'}
                    </button>
                  </div>
                  <div className="relative group">
                    <Hash className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${isAutoSku ? 'text-indigo-300' : 'text-slate-300'}`} size={15} />
                    <input
                      type="text"
                      readOnly={isAutoSku}
                      value={formData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      className={`w-full border rounded-xl pl-9 pr-4 py-2 text-xs font-semibold outline-none transition-all ${isAutoSku ? 'bg-indigo-50/30 border-indigo-100 text-indigo-900 cursor-not-allowed' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                      placeholder="Generated SKU"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

            {/* Product Variants & Specification Table Section */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-50 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <TableIcon size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">
                      Product Variants & Specification Grid
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400">
                      Define child models, dimensions, colors, packaging & pricing for this product family
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddVariantRow}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm shadow-indigo-600/20 active:scale-95 transition-all self-start sm:self-auto"
                >
                  <Plus size={13} /> Add Variant Row
                </button>
              </div>

              {/* Variants Table Grid */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                <table className="w-full text-left text-xs border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-900 text-white font-black text-[9px] uppercase tracking-wider">
                      <th className="py-2.5 px-3 border-r border-slate-800 w-32">Model / SKU</th>
                      <th className="py-2.5 px-3 border-r border-slate-800">Product / Specs</th>
                      <th className="py-2.5 px-3 border-r border-slate-800 w-28">Cut-Out / Size</th>
                      <th className="py-2.5 px-3 border-r border-slate-800 w-28">Color / CCT</th>
                      <th className="py-2.5 px-3 border-r border-slate-800 w-24">Price</th>
                      <th className="py-2.5 px-3 border-r border-slate-800 w-24">Packing</th>
                      <th className="py-2.5 px-2 w-10 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {variants.map((variant, idx) => (
                      <tr key={variant.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-2 border-r border-slate-100 dark:border-slate-800">
                          <input
                            type="text"
                            placeholder="VT-2612"
                            value={variant.sku || ''}
                            onChange={(e) => handleVariantChange(idx, 'sku', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-600"
                          />
                        </td>
                        <td className="p-2 border-r border-slate-100 dark:border-slate-800">
                          <input
                            type="text"
                            placeholder="12W V-TAC COB WHITE BODY"
                            value={variant.name || ''}
                            onChange={(e) => handleVariantChange(idx, 'name', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:border-indigo-600"
                          />
                        </td>
                        <td className="p-2 border-r border-slate-100 dark:border-slate-800">
                          <input
                            type="text"
                            placeholder="75MM"
                            value={variant.cutOut || ''}
                            onChange={(e) => handleVariantChange(idx, 'cutOut', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-800 dark:text-white outline-none focus:border-indigo-600"
                          />
                        </td>
                        <td className="p-2 border-r border-slate-100 dark:border-slate-800">
                          <input
                            type="text"
                            placeholder="W, W.W, N.W"
                            value={variant.color || ''}
                            onChange={(e) => handleVariantChange(idx, 'color', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-800 dark:text-white outline-none focus:border-indigo-600"
                          />
                        </td>
                        <td className="p-2 border-r border-slate-100 dark:border-slate-800">
                          <input
                            type="text"
                            placeholder="$580"
                            value={variant.price || ''}
                            onChange={(e) => handleVariantChange(idx, 'price', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-indigo-600"
                          />
                        </td>
                        <td className="p-2 border-r border-slate-100 dark:border-slate-800">
                          <input
                            type="text"
                            placeholder="20 PCS"
                            value={variant.packing || ''}
                            onChange={(e) => handleVariantChange(idx, 'packing', e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-800 dark:text-white outline-none focus:border-indigo-600"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            disabled={variants.length <= 1}
                            onClick={() => handleRemoveVariantRow(idx)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg disabled:opacity-20 transition-all"
                            title="Delete Variant Row"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* LEGACY FORM (Fallback if no business template) */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8 md:p-10 space-y-10">
                <section className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-800 pb-4"><Package className="text-indigo-600 dark:text-indigo-400" size={20} /><h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Core Identification</h3></div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Title</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-lg font-bold text-slate-800 dark:text-white focus:border-indigo-600 dark:focus:border-indigo-400 outline-none" placeholder="e.g. Premium Executive Desk" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center ml-1">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">SKU / ID</label>
                        <button
                          type="button"
                          onClick={() => setIsAutoSku(!isAutoSku)}
                          className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors ${isAutoSku ? 'text-indigo-600' : 'text-slate-300'}`}
                        >
                          <Sparkles size={10} className={isAutoSku ? 'animate-pulse' : ''} /> {isAutoSku ? 'Auto-Gen Active' : 'Manual Entry'}
                        </button>
                      </div>
                      <div className="relative group">
                        <Hash className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isAutoSku ? 'text-indigo-300' : 'text-slate-300'}`} size={18} />
                        <input
                          type="text"
                          required
                          readOnly={isAutoSku}
                          value={formData.sku}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                          className={`w-full border rounded-2xl pl-12 pr-6 py-4 text-base font-bold outline-none transition-all ${isAutoSku ? 'bg-indigo-50/30 border-indigo-100 text-indigo-900 cursor-not-allowed' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                          placeholder="OFC-99-A"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Category Classification</label>
                      <div className="relative"><FolderTree className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} /><select value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-10 py-4 text-base font-bold text-slate-800 dark:text-white focus:border-indigo-600 dark:focus:border-indigo-400 outline-none appearance-none"><option value="">Standard Product</option>{categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}</select><ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" /></div>
                    </div>
                  </div>
                </section>
                <section className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-800 pb-4"><AlignLeft className="text-indigo-600 dark:text-indigo-400" size={20} /><h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Narrative Data</h3></div>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-base font-medium text-slate-700 dark:text-slate-300 min-h-[180px] focus:border-indigo-600 dark:focus:border-indigo-400 outline-none" placeholder="Provide a rich technical description..." />
                </section>
              </div>
            </div>
            <div className="space-y-8">
              <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8 space-y-6">
                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Visual Product</h3>
                <div className="aspect-square bg-slate-50 dark:bg-slate-800 rounded-[28px] border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                  {formData.image ? (
                    <img src={formData.image} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={48} className="text-slate-200 dark:text-slate-800" />
                  )}
                </div>

                <div className="space-y-3">
                  <input
                    type="file"
                    id="product-image-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e)}
                  />
                  <label
                    htmlFor="product-image-upload"
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest cursor-pointer transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                  >
                    <Upload size={14} /> Upload Image
                  </label>
                  <p className="text-[9px] text-center font-bold text-slate-400 dark:text-slate-600 uppercase tracking-tight">JPG, PNG or GIF. Max 5MB.</p>
                </div>
              </div>
              <div className="bg-slate-900 dark:bg-slate-900/80 rounded-[32px] p-8 space-y-6 text-white relative overflow-hidden border dark:border-slate-800">
                <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign size={80} /></div>
                <h3 className="text-[10px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-widest relative z-10">Commercial Value</h3>
                <div className="space-y-4 relative z-10">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Currency Token</label>
                    <div className="relative">
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="w-full bg-white/10 dark:bg-slate-800/50 border border-white/10 dark:border-slate-700 rounded-2xl px-6 py-4 text-sm font-bold text-white focus:bg-white/20 outline-none appearance-none"
                      >
                        {CURRENCIES.map(c => (
                          <option key={c.code} value={c.symbol} className="bg-slate-900">{c.code} ({c.symbol})</option>
                        ))}
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Base Pricing</label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-slate-400">{formData.currency}</span>
                      <input type="number" step="0.01" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full bg-white/10 dark:bg-slate-800/50 border border-white/10 dark:border-slate-700 rounded-2xl pl-14 pr-6 py-5 text-2xl font-black text-white focus:bg-white/20 outline-none" placeholder="0.00" />
                    </div>
                  </div>
                  <div className="p-4 bg-indigo-600/20 border border-indigo-600/30 rounded-2xl flex items-start gap-3"><Info size={16} className="text-indigo-400 dark:text-indigo-500 shrink-0 mt-0.5" /><p className="text-[10px] font-bold text-indigo-100 dark:text-indigo-200 leading-relaxed">Multi-currency metadata allows products to be priced for global distribution regions.</p></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateProductForm;
