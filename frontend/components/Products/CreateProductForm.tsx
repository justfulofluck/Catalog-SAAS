
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
            className="w-full bg-[#1c1c1c] border border-[#262626] rounded-[4px] p-3 text-xs font-medium text-white placeholder-[#666666] min-h-[72px] focus:border-[#0F3D3E] focus:ring-1 focus:ring-[#0F3D3E]/30 outline-none transition-all"
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
              className="w-full bg-[#1c1c1c] border border-[#262626] rounded-[4px] px-3.5 py-2.5 text-xs font-semibold text-white focus:border-[#0F3D3E] focus:ring-1 focus:ring-[#0F3D3E]/30 outline-none appearance-none transition-all"
              value={value}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              required={field.required}
            >
              <option value="" className="bg-[#161616]">Select {field.label}...</option>
              {field.options?.map(opt => <option key={opt} value={opt} className="bg-[#161616]">{opt}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] pointer-events-none" />
          </div>
        );
      case 'boolean':
        return (
          <div className="flex gap-2">
            <button type="button" onClick={() => handleInputChange(field.id, true)} className={`flex-1 py-2 rounded-[4px] text-[11px] font-bold uppercase tracking-wider border transition-all ${value === true ? 'bg-[#0F3D3E] text-white border-[#0F3D3E] shadow-sm shadow-[#0F3D3E]/20' : 'bg-[#1c1c1c] border-[#262626] text-[#888888] hover:text-white'}`}>Yes</button>
            <button type="button" onClick={() => handleInputChange(field.id, false)} className={`flex-1 py-2 rounded-[4px] text-[11px] font-bold uppercase tracking-wider border transition-all ${value === false ? 'bg-[#262626] text-white border-[#333333]' : 'bg-[#1c1c1c] border-[#262626] text-[#888888] hover:text-white'}`}>No</button>
          </div>
        );
      case 'image':
        return (
          <div className="space-y-2">
            {value ? (
              <div className="aspect-video max-h-32 rounded-[4px] overflow-hidden bg-[#1c1c1c] border border-[#262626] relative group">
                <img src={value} className="w-full h-full object-cover" />
                <button type="button" onClick={() => handleInputChange(field.id, '')} className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-full shadow-md text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  <RefreshCcw size={12} />
                </button>
              </div>
            ) : (
              <label className="w-full h-24 flex flex-col items-center justify-center border-2 border-dashed border-[#262626] hover:border-[#0F3D3E] rounded-[4px] cursor-pointer hover:bg-[#0F3D3E]/5 transition-colors">
                <Upload size={18} className="text-[#666666] mb-1" />
                <span className="text-[11px] font-bold text-[#888888]">Upload {field.label}</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, field.id)} />
              </label>
            )}
          </div>
        );
      default:
        return (
          <input
            type={field.type === 'number' ? 'number' : 'text'}
            className="w-full bg-[#1c1c1c] border border-[#262626] rounded-[4px] px-3.5 py-2.5 text-xs font-semibold text-white placeholder-[#666666] focus:border-[#0F3D3E] focus:ring-1 focus:ring-[#0F3D3E]/30 outline-none transition-all"
            placeholder={`Enter ${field.label}...`}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            required={field.required}
          />
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#100F0F] text-white animate-in fade-in duration-500">
      {/* Single Line Header & Toolbar */}
      <div className="px-6 py-4 bg-[#161616] border-b border-[#262626] flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex flex-col min-w-[200px]">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setView('products-list')} 
              className="text-[#888888] hover:text-[#E2DCC8] transition-colors p-1 -ml-1 rounded-[3px] hover:bg-[#222222]"
              title="Back to Library"
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className="text-xl font-semibold text-white tracking-tight leading-none font-heading">New Product Entry</h1>
          </div>
          <p className="text-xs text-[#888888] font-normal mt-1 ml-7">
            Capture detailed product metadata for publication.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 ml-auto">
          <button 
            type="button"
            onClick={() => setView('products-list')} 
            className="px-3.5 py-2 text-xs font-semibold text-[#888888] uppercase tracking-wider hover:text-white hover:bg-[#222222] rounded-[4px] border border-transparent hover:border-[#262626] transition-all"
          >
            Discard
          </button>
          <button 
            type="button"
            onClick={handleSubmit} 
            className="px-4 py-2 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] font-heading font-semibold text-xs uppercase tracking-wider shadow-md shadow-[#0F3D3E]/20 transition-all flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
          >
            <Save size={14} /> Publish Product
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="max-w-[1600px] mx-auto">

        {combinedSchema.length > 0 ? (
          <div className="space-y-6">
            {/* DYNAMIC FORM BASED ON CATEGORY SCHEMA - 3 COLUMN BALANCED GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
            
            {/* Column 1: Basic Information */}
            <div className="bg-[#161616] rounded-[4px] border border-[#262626] p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-[#262626] pb-3">
                <Package className="text-[#E2DCC8]" size={16} />
                <h3 className="font-space text-xs font-bold text-white uppercase tracking-widest">Basic Information</h3>
              </div>
              <div className="space-y-4">
                {/* Standard Name Field if not in schema */}
                {!combinedSchema.some(f => f.id === 'prod_name' || (f.label || '').toLowerCase().includes('name')) && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest ml-1">Product Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Premium Executive Desk"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-[#262626] rounded-[4px] px-3.5 py-2.5 text-xs font-semibold text-white placeholder-[#666666] focus:border-[#0F3D3E] focus:ring-1 focus:ring-[#0F3D3E]/30 outline-none transition-all"
                    />
                  </div>
                )}

                {combinedSchema.filter(f => f.section === 'basic').map(field => (
                  <div key={field.id} className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest ml-1">{field.label} {field.required && '*'}</label>
                    {renderDynamicField(field)}
                  </div>
                ))}

                {/* Standard Description Field if not in schema */}
                {!combinedSchema.some(f => f.id === 'description' || (f.label || '').toLowerCase().includes('description')) && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest ml-1">Description</label>
                    <textarea
                      placeholder="Provide a rich technical description..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-[#262626] rounded-[4px] p-3 text-xs font-medium text-white placeholder-[#666666] min-h-[72px] focus:border-[#0F3D3E] focus:ring-1 focus:ring-[#0F3D3E]/30 outline-none transition-all"
                    />
                  </div>
                )}

                {/* Category dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest ml-1">Category Classification</label>
                  <div className="relative">
                    <FolderTree className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#666666]" size={15} />
                    <select
                      value={formData.categoryId}
                      onChange={(e) => handleInputChange('categoryId', e.target.value)}
                      className="w-full bg-[#1c1c1c] border border-[#262626] rounded-[4px] pl-10 pr-8 py-2.5 text-xs font-semibold text-white focus:border-[#0F3D3E] focus:ring-1 focus:ring-[#0F3D3E]/30 outline-none appearance-none transition-all"
                    >
                      <option value="" className="bg-[#161616]">Select Category...</option>
                      {categories.map(cat => (<option key={cat.id} value={cat.id} className="bg-[#161616]">{cat.name}</option>))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Technical Specifications */}
            <div className="bg-[#161616] rounded-[4px] border border-[#262626] p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-[#262626] pb-3">
                <Layers className="text-[#E2DCC8]" size={16} />
                <h3 className="font-space text-xs font-bold text-white uppercase tracking-widest">Technical Specifications</h3>
              </div>
              <div className="space-y-4">
                {combinedSchema.filter(f => f.section === 'technical').map(field => (
                  <div key={field.id} className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest ml-1">{field.label} {field.required && '*'}</label>
                    {renderDynamicField(field)}
                  </div>
                ))}
                {combinedSchema.filter(f => f.section === 'technical').length === 0 && (
                  <p className="text-xs text-[#666666] italic">No specific technical fields for this category.</p>
                )}
              </div>
            </div>

            {/* Column 3: Commercial & Media */}
            <div className="bg-[#161616] rounded-[4px] border border-[#262626] p-6 space-y-6">
              <div className="flex items-center gap-2 border-b border-[#262626] pb-3">
                <CreditCard className="text-[#E2DCC8]" size={16} />
                <h3 className="font-space text-xs font-bold text-white uppercase tracking-widest">Commercial & Media</h3>
              </div>
              <div className="space-y-4">
                {combinedSchema.filter(f => f.section === 'commercial').map(field => (
                  <div key={field.id} className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest ml-1">{field.label} {field.required && '*'}</label>
                    {renderDynamicField(field)}
                  </div>
                ))}

                {/* Multiple Product Images & Gallery Section */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest">
                      Product Images & Gallery {formData.images?.length > 0 ? `(${formData.images.length})` : ''}
                    </label>
                    <label htmlFor="multi-prod-img" className="text-[9px] font-bold text-[#E2DCC8] uppercase tracking-widest flex items-center gap-1 cursor-pointer hover:text-[#E2DCC8]">
                      <Plus size={12} /> Add More
                    </label>
                  </div>

                  {/* Primary Image Preview */}
                  <div className="aspect-video max-h-36 bg-[#1c1c1c] rounded-[4px] border-2 border-dashed border-[#262626] flex items-center justify-center overflow-hidden relative group">
                    {formData.image ? (
                      <>
                        <img src={formData.image} className="w-full h-full object-cover" />
                        <div className="absolute top-2 left-2 bg-[#0F3D3E] text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-[4px] flex items-center gap-1 shadow">
                          <Star size={10} fill="currentColor" /> Primary
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-[#666666]">
                        <ImageIcon size={28} />
                        <span className="text-[10px] font-bold text-[#888888]">No image uploaded</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input type="file" id="prod-img-dynamic" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e)} />
                    <label htmlFor="prod-img-dynamic" className="flex-1 flex items-center justify-center gap-1.5 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] px-3 py-2 text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-all shadow-sm shadow-[#0F3D3E]/20 active:scale-95">
                      <Upload size={12} /> Upload Primary
                    </label>
                    
                    <input type="file" id="multi-prod-img" accept="image/*" multiple className="hidden" onChange={handleMultipleImagesUpload} />
                    <label htmlFor="multi-prod-img" className="flex-1 flex items-center justify-center gap-1.5 bg-[#1c1c1c] hover:bg-[#262626] text-[#999999] hover:text-white rounded-[4px] px-3 py-2 text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-all border border-[#262626]">
                      <Plus size={12} /> Add Gallery (+N)
                    </label>
                  </div>

                  {/* Thumbnails list */}
                  {formData.images && formData.images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 pt-2">
                      {formData.images.map((img: string, idx: number) => {
                        const isPrimary = formData.image === img;
                        return (
                          <div key={idx} className={`relative aspect-square rounded-[4px] overflow-hidden border-2 transition-all group ${isPrimary ? 'border-[#0F3D3E] ring-2 ring-[#0F3D3E]/20' : 'border-[#262626]'}`}>
                            <img src={img} className="w-full h-full object-cover cursor-pointer" onClick={() => setAsPrimaryImage(img)} title="Click to set as primary" />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(idx)}
                              className="absolute top-1 right-1 p-0.5 bg-black/70 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={10} />
                            </button>
                            {isPrimary && (
                              <div className="absolute bottom-0 inset-x-0 bg-[#0F3D3E]/90 text-white text-[8px] font-bold text-center py-0.5">
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
                  <div className="space-y-3 pt-3 border-t border-[#262626]">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest ml-1">Base Pricing (Required)</label>
                      <div className="flex items-center gap-2">
                        <select
                          value={formData.currency}
                          onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                          className="bg-[#1c1c1c] border border-[#262626] rounded-[4px] px-3 py-2 text-xs font-bold text-white focus:border-[#0F3D3E] outline-none appearance-none"
                        >
                          {CURRENCIES.map(c => (
                            <option key={c.code} value={c.symbol} className="bg-[#161616]">{c.code} ({c.symbol})</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full bg-[#1c1c1c] border border-[#262626] rounded-[4px] px-3.5 py-2 text-xs font-semibold text-white focus:border-[#0F3D3E] outline-none"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SKU generation */}
                <div className="space-y-1.5 pt-3 border-t border-[#262626]">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest">System SKU</label>
                    <button
                      type="button"
                      onClick={() => setIsAutoSku(!isAutoSku)}
                      className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 transition-colors ${isAutoSku ? 'text-[#E2DCC8]' : 'text-[#666666]'}`}
                    >
                      <Sparkles size={10} className={isAutoSku ? 'animate-pulse' : ''} /> {isAutoSku ? 'Auto-Gen Active' : 'Manual Entry'}
                    </button>
                  </div>
                  <div className="relative group">
                    <Hash className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${isAutoSku ? 'text-[#E2DCC8]' : 'text-[#666666]'}`} size={15} />
                    <input
                      type="text"
                      readOnly={isAutoSku}
                      value={formData.sku}
                      onChange={(e) => handleInputChange('sku', e.target.value)}
                      className={`w-full border rounded-[4px] pl-9 pr-4 py-2 text-xs font-semibold outline-none transition-all ${isAutoSku ? 'bg-[#0F3D3E]/10 border-[#0F3D3E]/30 text-white cursor-not-allowed' : 'bg-[#1c1c1c] border-[#262626] text-white'}`}
                      placeholder="Generated SKU"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          </div>
        ) : (
          /* LEGACY FORM (Fallback if no business template) */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-[#161616] rounded-[4px] border border-[#262626] p-8 md:p-10 space-y-10">
                <section className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-[#262626] pb-4"><Package className="text-[#E2DCC8]" size={20} /><h3 className="font-space text-sm font-bold text-white uppercase tracking-widest">Core Identification</h3></div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest ml-1">Title</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#1c1c1c] border border-[#262626] rounded-[4px] px-6 py-4 text-base font-bold text-white focus:border-[#0F3D3E] outline-none" placeholder="e.g. Premium Executive Desk" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center ml-1">
                        <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest">SKU / ID</label>
                        <button
                          type="button"
                          onClick={() => setIsAutoSku(!isAutoSku)}
                          className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 transition-colors ${isAutoSku ? 'text-[#E2DCC8]' : 'text-[#666666]'}`}
                        >
                          <Sparkles size={10} className={isAutoSku ? 'animate-pulse' : ''} /> {isAutoSku ? 'Auto-Gen Active' : 'Manual Entry'}
                        </button>
                      </div>
                      <div className="relative group">
                        <Hash className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isAutoSku ? 'text-[#E2DCC8]' : 'text-[#666666]'}`} size={18} />
                        <input
                          type="text"
                          required
                          readOnly={isAutoSku}
                          value={formData.sku}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                          className={`w-full border rounded-[4px] pl-12 pr-6 py-4 text-base font-bold outline-none transition-all ${isAutoSku ? 'bg-[#0F3D3E]/10 border-[#0F3D3E]/30 text-white cursor-not-allowed' : 'bg-[#1c1c1c] border-[#262626] text-white'}`}
                          placeholder="OFC-99-A"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest ml-1">Category Classification</label>
                      <div className="relative"><FolderTree className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666666]" size={18} /><select value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} className="w-full bg-[#1c1c1c] border border-[#262626] rounded-[4px] pl-12 pr-10 py-4 text-base font-bold text-white focus:border-[#0F3D3E] outline-none appearance-none"><option value="" className="bg-[#161616]">Standard Product</option>{categories.map(cat => (<option key={cat.id} value={cat.id} className="bg-[#161616]">{cat.name}</option>))}</select><ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666666] pointer-events-none" /></div>
                    </div>
                  </div>
                </section>
                <section className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-[#262626] pb-4"><AlignLeft className="text-[#E2DCC8]" size={20} /><h3 className="font-space text-sm font-bold text-white uppercase tracking-widest">Narrative Data</h3></div>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-[#1c1c1c] border border-[#262626] rounded-[4px] p-6 text-base font-medium text-white placeholder-[#666666] min-h-[180px] focus:border-[#0F3D3E] outline-none" placeholder="Provide a rich technical description..." />
                </section>
              </div>
            </div>
            <div className="space-y-8">
              <div className="bg-[#161616] rounded-[4px] border border-[#262626] p-8 space-y-6">
                <h3 className="text-[10px] font-bold text-[#888888] uppercase tracking-widest">Visual Product</h3>
                <div className="aspect-square bg-[#1c1c1c] rounded-[4px] border-2 border-dashed border-[#262626] flex items-center justify-center overflow-hidden">
                  {formData.image ? (
                    <img src={formData.image} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={48} className="text-[#333333]" />
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
                    className="w-full flex items-center justify-center gap-2 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] px-4 py-3 text-xs font-bold uppercase tracking-widest cursor-pointer transition-all shadow-lg shadow-[#0F3D3E]/20 active:scale-95"
                  >
                    <Upload size={14} /> Upload Image
                  </label>
                  <p className="text-[9px] text-center font-semibold text-[#666666] uppercase tracking-tight">JPG, PNG or GIF. Max 5MB.</p>
                </div>
              </div>
              <div className="bg-[#161616] rounded-[4px] p-8 space-y-6 text-white relative overflow-hidden border border-[#262626]">
                <div className="absolute top-0 right-0 p-4 opacity-5"><DollarSign size={80} /></div>
                <h3 className="font-space text-[10px] font-bold text-[#888888] uppercase tracking-widest relative z-10">Commercial Value</h3>
                <div className="space-y-4 relative z-10">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest">Currency Token</label>
                    <div className="relative">
                      <select
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        className="w-full bg-[#1c1c1c] border border-[#262626] rounded-[4px] px-6 py-4 text-sm font-bold text-white focus:border-[#0F3D3E] outline-none appearance-none"
                      >
                        {CURRENCIES.map(c => (
                          <option key={c.code} value={c.symbol} className="bg-[#161616]">{c.code} ({c.symbol})</option>
                        ))}
                      </select>
                      <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666666] pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#888888] uppercase tracking-widest">Base Pricing</label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-bold text-[#666666]">{formData.currency}</span>
                      <input type="number" step="0.01" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full bg-[#1c1c1c] border border-[#262626] rounded-[4px] pl-14 pr-6 py-4 text-2xl font-bold text-white focus:border-[#0F3D3E] outline-none" placeholder="0.00" />
                    </div>
                  </div>
                  <div className="p-4 bg-[#0F3D3E]/10 border border-[#0F3D3E]/20 rounded-[4px] flex items-start gap-3"><Info size={16} className="text-[#E2DCC8] shrink-0 mt-0.5" /><p className="text-[10px] font-medium text-[#dddddd] leading-relaxed">Multi-currency metadata allows products to be priced for global distribution regions.</p></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default CreateProductForm;
