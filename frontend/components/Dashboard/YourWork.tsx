
import React from 'react';
import { ArrowLeft, BookOpen, Clock, Trash2, Edit2, Plus, LayoutGrid } from 'lucide-react';
import { useStore } from '../../store/useStore';

const YourWork: React.FC = () => {
  const { savedCatalogs, loadCatalog, deleteCatalog, setView } = useStore();

  const handleLoad = (id: string) => {
    loadCatalog(id);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      deleteCatalog(id);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-slate-950 p-8 lg:p-12 animate-in fade-in duration-500 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <button 
              onClick={() => setView('dashboard')}
              className="flex items-center gap-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-400 transition-colors mb-4"
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </button>
            <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Your Work</h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium mt-2">Manage your collection of digital publications.</p>
          </div>
          <button 
            onClick={() => setView('catalog-setup')}
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center gap-3"
          >
            <Plus size={18} /> New Project
          </button>
        </div>

        {/* Projects Grid */}
        {savedCatalogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 text-slate-300 dark:text-slate-600">
              <BookOpen size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">No saved projects yet</h3>
            <p className="text-slate-400 dark:text-slate-500 mt-2 font-medium">Start a new design to populate your portfolio.</p>
            <button 
              onClick={() => setView('catalog-setup')}
              className="mt-8 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
            >
              Start Creating
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {savedCatalogs.map(catalog => (
              <div 
                key={catalog.id} 
                onClick={() => handleLoad(catalog.id)}
                className="group bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl dark:shadow-none hover:shadow-2xl hover:border-indigo-200 dark:hover:border-indigo-900 transition-all cursor-pointer overflow-hidden flex flex-col h-full"
              >
                {/* Preview Area (Simulated) */}
                <div className="aspect-[4/3] bg-slate-50 dark:bg-slate-800 border-b border-slate-50 dark:border-slate-800 relative p-8 flex items-center justify-center group-hover:bg-indigo-50/30 dark:group-hover:bg-indigo-900/10 transition-colors">
                   <div className="w-3/4 h-full bg-white dark:bg-slate-950 shadow-lg rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col p-4 gap-2 opacity-80 group-hover:scale-105 transition-transform duration-500">
                      <div className="h-4 w-2/3 bg-slate-100 dark:bg-slate-800 rounded-full" />
                      <div className="h-32 bg-slate-50 dark:bg-slate-800 rounded-lg w-full mt-2" />
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full mt-auto" />
                   </div>
                   
                   <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                      <button 
                        onClick={(e) => handleDelete(e, catalog.id)}
                        className="p-3 bg-white/90 dark:bg-slate-800/90 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-2xl shadow-sm backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
                        title="Delete Project"
                      >
                        <Trash2 size={18} />
                      </button>
                   </div>
                </div>

                {/* Info Area */}
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1">{catalog.name}</h3>
                      <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">ID: {catalog.id.split('-')[1] || '---'}</p>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-600 group-hover:bg-indigo-600 dark:group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      <Edit2 size={18} />
                    </div>
                  </div>
                  
                  <div className="mt-auto flex items-center gap-6 pt-6 border-t border-slate-50 dark:border-slate-800 text-slate-400 dark:text-slate-500">
                    <div className="flex items-center gap-2">
                      <LayoutGrid size={16} />
                      <span className="text-xs font-bold">{catalog.pages.length} Pages</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={16} />
                      <span className="text-xs font-bold">{new Date(catalog.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default YourWork;
