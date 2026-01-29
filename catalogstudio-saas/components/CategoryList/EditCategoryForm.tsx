
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Palette, Hash, AlignLeft, Image as ImageIcon, Upload, Info, FolderEdit } from 'lucide-react';
import { useStore } from '../../store/useStore';

const EditCategoryForm: React.FC = () => {
  const { setView, categories, updateCategory, editingCategoryId, setEditingCategoryId } = useStore();
  
  const categoryToEdit = categories.find(c => c.id === editingCategoryId);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rank: 0,
    color: '#4f46e5',
    thumbnail: ''
  });

  useEffect(() => {
    if (categoryToEdit) {
      setFormData({
        name: categoryToEdit.name,
        description: categoryToEdit.description || '',
        rank: categoryToEdit.rank || 0,
        color: categoryToEdit.color || '#4f46e5',
        thumbnail: categoryToEdit.thumbnail || ''
      });
    } else {
      setView('category-list');
    }
  }, [categoryToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategoryId) {
      updateCategory(editingCategoryId, {
        name: formData.name,
        description: formData.description,
        rank: formData.rank,
        color: formData.color,
        thumbnail: formData.thumbnail
      });
      setEditingCategoryId(null);
      setView('category-list');
    }
  };

  const handleCancel = () => {
    setEditingCategoryId(null);
    setView('category-list');
  };

  if (!categoryToEdit) return null;

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-slate-950 p-8 lg:p-12 animate-in fade-in duration-500 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <button 
              onClick={handleCancel}
              className="flex items-center gap-2 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:text-indigo-700 transition-colors mb-4"
            >
              <ArrowLeft size={14} /> Back to Taxonomy
            </button>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-2">Refine Category</h1>
            <p className="text-base text-slate-500 dark:text-slate-400 font-medium">Updating taxonomy parameters for <span className="text-indigo-600 dark:text-indigo-400 font-bold">{categoryToEdit.name}</span>.</p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={handleCancel} className="px-8 py-3.5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-900 rounded-2xl transition-all">Discard</button>
             <button onClick={handleSubmit} className="px-8 py-3.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-2">
                <Save size={18} /> Update Taxonomy
             </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8 md:p-10 space-y-10">
              <section className="space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-50 dark:border-slate-800 pb-4">
                  <FolderEdit className="text-indigo-600 dark:text-indigo-400" size={20} />
                  <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Metadata Profile</h3>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Label Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-lg font-bold text-slate-800 dark:text-white focus:border-indigo-600 dark:focus:border-indigo-400 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Contextual Description</label>
                  <textarea 
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-base font-medium text-slate-700 dark:text-slate-300 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none min-h-[140px]"
                  />
                </div>
              </section>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 p-8 space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Branding Parameters</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Priority Rank</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
                    <input 
                      type="number" 
                      value={formData.rank}
                      onChange={(e) => setFormData({ ...formData, rank: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-slate-700 dark:text-white outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Accent UI Color</label>
                  <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <input 
                      type="color" 
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                    />
                    <span className="text-[10px] font-mono font-black text-slate-500 dark:text-slate-400">{formData.color.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 dark:bg-slate-900/80 rounded-[32px] p-8 text-white space-y-4 shadow-xl border dark:border-slate-800">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                <Info size={20} className="text-indigo-400" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-widest">Asset Sync</h4>
              <p className="text-[10px] font-medium text-slate-400 leading-relaxed">
                Changes to category properties will synchronize across all active publications. Assets belonging to this category will maintain their relative hierarchy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditCategoryForm;
