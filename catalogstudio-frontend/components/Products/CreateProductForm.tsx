
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Hash, AlignLeft, Image as ImageIcon, DollarSign, FolderTree, ChevronDown, Package, Info, Upload, Sparkles, RefreshCcw, Minus, Plus } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { CURRENCIES } from '../../constants';

import { useToast } from '../../components/Shared/ToastProvider';

const CreateProductForm: React.FC = () => {
  const { setView, addProduct, categories, defaultCurrency } = useStore();
  const { success } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    currency: defaultCurrency,
    description: '',
    image: '',
    categoryId: ''
  });

  const [isAutoSku, setIsAutoSku] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Automatic SKU Generation Logic
  useEffect(() => {
    if (isAutoSku && formData.name.trim()) {
      const category = categories.find(c => c.id === formData.categoryId);
      const prefix = category ? category.name.substring(0, 3).toUpperCase() : 'GEN';
      const namePart = formData.name
        .split(' ')
        .map(word => word.substring(0, 3).toUpperCase())
        .filter(p => p.length > 0)
        .join('-');

      const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();
      const generatedSku = `${prefix}-${namePart}-${randomPart}`.substring(0, 20);
      setFormData(prev => ({ ...prev, sku: generatedSku }));
    }
  }, [formData.name, formData.categoryId, isAutoSku]);

  const handlePriceChange = (amount: number) => {
    const current = parseFloat(formData.price) || 0;
    const newPrice = Math.max(0, current + amount);
    setFormData(prev => ({ ...prev, price: newPrice.toFixed(2) }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Compress to JPEG at 60% to ensure it fits in localStorage
          const resizedBase64 = canvas.toDataURL('image/jpeg', 0.6);
          setFormData(prev => ({ ...prev, image: resizedBase64 }));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProduct({
      id: `p-${Date.now()}`,
      name: formData.name,
      sku: formData.sku,
      price: parseFloat(formData.price) || 0,
      currency: formData.currency,
      description: formData.description,
      image: formData.image || 'https://picsum.photos/seed/default/400/400',
      categoryId: formData.categoryId || undefined
    });
    success("Product added to catalog");
    setView('products-list');
  };

  return (
    <div className={`flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-slate-950 p-8 lg:p-12 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}>
      <div className="max-w-6xl mx-auto">
        <div className={`mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div>
            <button onClick={() => setView('products-list')} className="flex items-center gap-2 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:text-indigo-700 transition-all mb-4">
              <ArrowLeft size={14} /> Back to Library
            </button>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">New Asset Entry</h1>
            <p className="text-base text-slate-500 dark:text-slate-400 font-medium">Capture detailed product metadata for publication.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setView('products-list')} className="px-8 py-3.5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-900 rounded-2xl transition-all">Discard</button>
            <button onClick={handleSubmit} className="px-8 py-3.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-2">
              <Save size={18} /> Publish Asset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className={`lg:col-span-2 space-y-8 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8 md:p-10 space-y-10">
              <section className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-800 pb-4"><Package className="text-indigo-600 dark:text-indigo-400" size={20} /><h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Core Identification</h3></div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Title</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-lg font-bold text-slate-800 dark:text-white focus:border-indigo-600 dark:focus:border-indigo-400 outline-none" placeholder="e.g. Premium Executive Desk" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-end ml-1 h-6 pb-1">
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
                    <div className="flex justify-between items-end ml-1 h-6 pb-1">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Category Classification</label>
                    </div>
                    <div className="relative"><FolderTree className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} /><select value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-10 py-4 text-base font-bold text-slate-800 dark:text-white focus:border-indigo-600 dark:focus:border-indigo-400 outline-none appearance-none"><option value="">Standard Asset</option>{categories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}</select><ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" /></div>
                  </div>
                </div>
              </section>
              <section className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-800 pb-4"><AlignLeft className="text-indigo-600 dark:text-indigo-400" size={20} /><h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Narrative Data</h3></div>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-base font-medium text-slate-700 dark:text-slate-300 min-h-[180px] focus:border-indigo-600 dark:focus:border-indigo-400 outline-none" placeholder="Provide a rich technical description..." />
              </section>
            </div>
          </div>
          <div className={`space-y-8 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8 space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Visual Asset</h3>
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
                  onChange={handleImageUpload}
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
                  <div className="relative group">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-slate-500 dark:text-slate-500 group-focus-within:text-white transition-colors">{formData.currency}</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-white/10 dark:bg-slate-800/50 border border-white/10 dark:border-slate-700 rounded-2xl pl-12 pr-24 py-5 text-2xl font-black text-white focus:bg-white/5 dark:focus:bg-slate-800 focus:border-indigo-500 transition-all outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      placeholder="0.00"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-slate-200 dark:bg-slate-800 rounded-xl p-1 border border-slate-300 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => handlePriceChange(-1)}
                        className="p-2 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <div className="w-px h-4 bg-slate-300 dark:bg-slate-700"></div>
                      <button
                        type="button"
                        onClick={() => handlePriceChange(1)}
                        className="p-2 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-white transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-indigo-600/20 border border-indigo-600/30 rounded-2xl flex items-start gap-3"><Info size={16} className="text-indigo-400 dark:text-indigo-500 shrink-0 mt-0.5" /><p className="text-[10px] font-bold text-indigo-100 dark:text-indigo-200 leading-relaxed">Multi-currency metadata allows assets to be priced for global distribution regions.</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProductForm;
