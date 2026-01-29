import React, { useState } from 'react';
import {
    Book,
    BookOpen,
    Search,
    Trash2,
    LayoutGrid,
    List,
    Check,
    CheckSquare,
    Square,
    Plus,
    ArrowRight,
    Clock,
    ExternalLink
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useToast } from '../Shared/ToastProvider';
import ConfirmationModal from '../Shared/ConfirmationModal';

const CatalogsView: React.FC = () => {
    const { savedCatalogs, loadCatalog, deleteCatalog, setView, catalog } = useStore();
    const { success } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isVisible, setIsVisible] = useState(false);

    // Delete Confirmation State
    const [deleteState, setDeleteState] = useState<{ isOpen: boolean; type: 'single' | 'batch'; id?: string }>({
        isOpen: false,
        type: 'single'
    });

    React.useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const [isExiting, setIsExiting] = useState(false);

    const handleViewChange = (mode: 'grid' | 'list') => {
        if (mode === viewMode) return;
        setIsExiting(true);
        setTimeout(() => {
            setViewMode(mode);
            setIsExiting(false);
        }, 300);
    };

    const filteredItems = savedCatalogs.filter(item => {
        return item.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const toggleSelection = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedIds.length === filteredItems.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredItems.map(item => item.id));
        }
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeleteState({ isOpen: true, type: 'single', id });
    };

    const handleBulkDelete = () => {
        setDeleteState({ isOpen: true, type: 'batch' });
    };

    const executeDelete = () => {
        if (deleteState.type === 'single' && deleteState.id) {
            // Prevent deleting currently active catalog
            if (deleteState.id === catalog.id) {
                // Optionally show warning or handle gracefully
            }
            deleteCatalog(deleteState.id);
            setSelectedIds(prev => prev.filter(i => i !== deleteState.id));
            success("Catalog deleted successfully");
        } else if (deleteState.type === 'batch') {
            const idsToDelete = selectedIds.filter(id => id !== catalog.id); // Protect active
            if (idsToDelete.length < selectedIds.length) {
                // Warn about active catalog protection if needed
            }
            idsToDelete.forEach(id => deleteCatalog(id));
            setSelectedIds([]);
            success(`${idsToDelete.length} catalogs deleted`);
        }
        setDeleteState(prev => ({ ...prev, isOpen: false }));
    };

    const handleOpenCatalog = (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        loadCatalog(id);
        // loadCatalog handles redirection to editor
    };

    const handleCreateNew = () => {
        setView('catalog-setup');
    };

    return (
        <div className={`flex-1 flex flex-col overflow-hidden bg-[#f8fafc] dark:bg-slate-950 relative transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0 scale-100 blur-0' : 'opacity-0 translate-y-4 scale-95 blur-sm'}`}>
            {/* Header */}
            <div className="px-8 py-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Your Catalogs</h1>
                    <p className="text-sm text-slate-400 dark:text-slate-500 font-medium mt-1">Manage and organize your digital publications.</p>
                </div>
                <button
                    onClick={handleCreateNew}
                    className="px-6 py-2.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-2"
                >
                    <Plus size={16} /> New Catalog
                </button>
            </div>

            {/* Filter Bar */}
            <div className="px-8 py-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800 flex items-center gap-6 shrink-0">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600" size={18} />
                    <input
                        type="text"
                        placeholder="Search catalogs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-600/5 dark:focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 shadow-sm"
                    />
                </div>

                <button
                    onClick={handleSelectAll}
                    className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2"
                >
                    {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? 'Deselect All' : 'Select All'}
                </button>

                <div className="ml-auto relative flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
                    {/* Sliding Pill */}
                    <div
                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-slate-700 rounded-xl shadow-sm transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)] ${viewMode === 'grid' ? 'left-1' : 'left-[50%]'}`}
                    />

                    <button
                        onClick={() => handleViewChange('grid')}
                        className={`relative z-10 p-2 w-10 flex items-center justify-center transition-colors duration-300 ${viewMode === 'grid' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}
                    >
                        <LayoutGrid size={16} />
                    </button>
                    <button
                        onClick={() => handleViewChange('list')}
                        className={`relative z-10 p-2 w-10 flex items-center justify-center transition-colors duration-300 ${viewMode === 'list' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}
                    >
                        <List size={16} />
                    </button>
                </div>
            </div>

            {/* Catalog Grid/List */}
            <div className={`flex-1 overflow-y-auto p-8 custom-scrollbar pb-32 transition-all duration-300 ${isExiting ? 'opacity-0 -translate-x-8' : 'opacity-100 translate-x-0'}`}>
                {filteredItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-6 border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-200 dark:text-slate-800">
                            <Book size={40} />
                        </div>
                        <h3 className="text-lg font-black text-slate-800 dark:text-white">No catalogs found</h3>
                        <p className="text-sm text-slate-400 dark:text-slate-500 font-medium mt-1">Start your first publication now.</p>
                        <button
                            onClick={handleCreateNew}
                            className="mt-6 text-indigo-600 dark:text-indigo-400 font-black text-xs uppercase tracking-widest hover:underline"
                        >
                            Create New Catalog
                        </button>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {filteredItems.map(item => (
                            <div
                                key={item.id}
                                onClick={() => toggleSelection(item.id)}
                                className={`group bg-white dark:bg-slate-900 rounded-2xl border transition-all overflow-hidden relative cursor-pointer ${selectedIds.includes(item.id) ? 'border-indigo-600 dark:border-indigo-500 ring-4 ring-indigo-50 dark:ring-indigo-900/20 shadow-xl' : 'border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1'}`}
                            >
                                <div className="aspect-[3/4] bg-slate-100 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center">
                                    <BookOpen size={48} className="text-slate-300 dark:text-slate-700" />

                                    {/* Overlay */}
                                    <div className={`absolute top-3 left-3 w-6 h-6 rounded-2xl flex items-center justify-center transition-all z-10 ${selectedIds.includes(item.id) ? 'bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg' : 'bg-white/40 dark:bg-black/40 text-transparent border border-white/60 dark:border-white/20 group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>
                                        <Check size={14} />
                                    </div>

                                    <div className="absolute inset-0 bg-indigo-600/90 dark:bg-indigo-900/90 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-4 text-white">
                                        <button
                                            onClick={(e) => handleOpenCatalog(item.id, e)}
                                            className="px-5 py-2.5 bg-white text-indigo-600 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                                        >
                                            Open <ExternalLink size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(item.id, e)}
                                            className="p-3 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-md transition-all text-white hover:text-red-200"
                                            title="Delete Catalog"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>

                                    {/* Status Badge */}
                                    {item.id === catalog.id && (
                                        <div className="absolute bottom-3 right-3 px-2 py-1 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-widest rounded-md shadow-lg">
                                            Active
                                        </div>
                                    )}
                                </div>

                                <div className="p-4 border-t border-slate-50 dark:border-slate-800">
                                    <h4 className="text-sm font-black text-slate-800 dark:text-white truncate mb-1">{item.name}</h4>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                                            {item.pages?.length || 0} Pages
                                        </div>
                                        <div className="flex items-center gap-1 text-[9px] font-mono text-slate-300 dark:text-slate-700">
                                            <Clock size={10} />
                                            {new Date(item.updatedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-4 w-12 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                        <button onClick={handleSelectAll} className="p-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                            {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? <CheckSquare size={16} className="text-indigo-600 dark:text-indigo-400" /> : <Square size={16} className="dark:text-slate-700" />}
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Name</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Pages</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Last Updated</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredItems.map(item => (
                                    <tr
                                        key={item.id}
                                        onClick={() => toggleSelection(item.id)}
                                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer ${selectedIds.includes(item.id) ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className={`p-1 ${selectedIds.includes(item.id) ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-300 dark:text-slate-700'}`}>
                                                {selectedIds.includes(item.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                    <Book size={16} />
                                                </div>
                                                <div>
                                                    <span className="text-xs font-black text-slate-800 dark:text-white block">{item.name}</span>
                                                    {item.id === catalog.id && <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wide">Active</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">{item.pages?.length || 0} Pages</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-600">{new Date(item.updatedAt).toLocaleDateString()}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                            <button
                                                onClick={(e) => handleOpenCatalog(item.id, e)}
                                                className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                                                title="Open Catalog"
                                            >
                                                <ExternalLink size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(item.id, e)}
                                                className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                                title="Delete Catalog"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Bulk Action Floating Bar */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[100] flex items-center gap-10 border border-white/10 dark:border-slate-800 animate-in slide-in-from-bottom-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-600 dark:bg-indigo-500 rounded-2xl flex items-center justify-center font-black text-sm">
                            {selectedIds.length}
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">Catalogs Selected</span>
                    </div>
                    <div className="w-px h-8 bg-white/10 dark:bg-slate-800" />
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSelectedIds([])}
                            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleBulkDelete}
                            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                        >
                            <Trash2 size={14} /> Delete Selected
                        </button>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={deleteState.isOpen}
                title={deleteState.type === 'single' ? "Delete Catalog" : "Delete Multiple Catalogs"}
                message={deleteState.type === 'single'
                    ? "Are you sure you want to permanently delete this catalog? ALL pages and designs will be lost. This action cannot be undone."
                    : `Are you sure you want to delete ${selectedIds.length} selected catalogs? This action cannot be undone.`
                }
                confirmLabel="Delete Permanently"
                isDestructive
                onConfirm={executeDelete}
                onCancel={() => setDeleteState(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
};

export default CatalogsView;
