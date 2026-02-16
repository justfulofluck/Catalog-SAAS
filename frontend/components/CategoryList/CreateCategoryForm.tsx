
import React, { useState } from 'react';
import { ArrowLeft, Save, Palette, Hash, AlignLeft, Image as ImageIcon, Upload, Info, FolderPlus } from 'lucide-react';
import { useStore } from '../../store/useStore';

const CreateCategoryForm: React.FC = () => {
  const { setView, addCategory } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rank: 0,
    color: '#4f46e5',
    thumbnail: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCategory({
      id: `cat-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      rank: formData.rank,
      color: formData.color,
      thumbnail: formData.thumbnail,
      productCount: 0
    });
    setView('category-list');
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-slate-950 p-8 lg:p-12 animate-in fade-in duration-500 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <button 
              onClick={() => setView('category-list')}
              className="flex items-center gap-2 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:text-indigo-700 transition-colors mb-4"
            >
              <ArrowLeft size={14} /> Back to Taxonomy
            </button>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">Create Taxonomy</h1>
            <p className="text-base text-slate-500 dark:text-slate-400 font-medium">Define a new classification layer for your digital inventory.</p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={() => setView('category-list')} className="px-8 py-3.5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-900 rounded-2xl transition-all">Cancel</button>
             <button onClick={handleSubmit} className="px-8 py-3.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-2">
                <Save size={18} /> Save Taxonomy
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8 md:p-10 space-y-10">
              <section className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-800 pb-4">
                  <FolderPlus className="text-indigo-600 dark:text-indigo-400" size={20} />
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Category Profile</h3>
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
              </div>
            </div>

            <div className="bg-indigo-600 dark:bg-indigo-500 rounded-2xl p-8 text-white space-y-4 shadow-xl shadow-indigo-600/20 border dark:border-indigo-400/30">
              <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center">
                <Info size={20} className="text-white" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-widest">Automation Note</h4>
              <p className="text-[10px] font-medium text-indigo-100 leading-relaxed">
                Categories are used by the Auto-Gen engine to intelligently group products in large publications. Ensure clear nomenclature for optimal results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCategoryForm;
