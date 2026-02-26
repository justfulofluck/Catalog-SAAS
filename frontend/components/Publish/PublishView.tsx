
import React, { useState } from 'react';
import {
  ArrowLeft,
  Rocket,
  Edit2,
  CheckCircle2,
  Clock,
  FileText,
  Globe,
  Loader2,
  Trash2,
  Share2,
  ExternalLink,
  Copy,
  X
} from 'lucide-react';
import { useStore } from '../../store/useStore';

const PublishView: React.FC = () => {
  const { savedCatalogs, loadCatalog, setView, updateSavedCatalog, publishCatalog, deleteCatalog, openPublicViewer } = useStore();
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    loadCatalog(id);
  };

  const handleRenameStart = (id: string, currentName: string) => {
    setEditingNameId(id);
    setTempName(currentName);
  };

  const handleRenameSave = (id: string) => {
    if (tempName.trim()) {
      updateSavedCatalog(id, { name: tempName });
    }
    setEditingNameId(null);
  };

  const handlePublish = async (catalog: any) => {
    setPublishingId(catalog.id);
    try {
      const result = await publishCatalog(catalog.id);
      if (result) {
        setShowShareModal(result.id);
      }
    } catch (error) {
      console.error("Publishing failed", error);
    } finally {
      setPublishingId(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this catalog?')) {
      deleteCatalog(id);
    }
  };

  const ShareModal = ({ catalogId, onClose }: { catalogId: string, onClose: () => void }) => {
    const catalog = savedCatalogs.find(c => c.id === catalogId);
    const publicUrl = `${window.location.origin}/viewer/${catalog?.uuid || catalogId}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(publicUrl)}`;

    const copyToClipboard = () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(publicUrl).then(() => {
          alert('Link copied to clipboard!');
        }).catch(() => {
          // Fallback if promise fails
          fallbackCopyText(publicUrl);
        });
      } else {
        fallbackCopyText(publicUrl);
      }
    };

    const fallbackCopyText = (text: string) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;

      // Ensure the textarea is not visible
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);

      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand('copy');
        if (successful) {
          alert('Link copied to clipboard!');
        } else {
          alert('Unable to copy link. Please select and copy manually.');
        }
      } catch (err) {
        alert('Unable to copy link. Please select and copy manually.');
      }

      document.body.removeChild(textArea);
    };

    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl p-8 relative animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
            <X size={20} />
          </button>

          <div className="text-center space-y-4 mb-8">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Published Successfully!</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Your catalog is now live and accessible via the secure link below.</p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl flex items-center gap-4">
              <div className="p-2 bg-white dark:bg-white rounded-xl shadow-sm">
                <img src={qrUrl} alt="QR Code" className="w-24 h-24" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Public URL</p>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 mb-2">
                  <Globe size={14} className="text-indigo-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{publicUrl}</span>
                </div>
                <button onClick={copyToClipboard} className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center gap-1">
                  <Copy size={12} /> Copy Link
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => openPublicViewer(catalogId)} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2">
                <ExternalLink size={16} /> View Live
              </button>
              <button onClick={onClose} className="w-full py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-slate-950 p-8 lg:p-12 animate-in fade-in duration-500 transition-colors duration-300 relative">
      {showShareModal && <ShareModal catalogId={showShareModal} onClose={() => setShowShareModal(null)} />}

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
            <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Publish & Manage</h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium mt-2">Deploy your digital publications to the global network.</p>
          </div>
        </div>

        {/* Catalog List */}
        {savedCatalogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 text-slate-300 dark:text-slate-600">
              <Rocket size={40} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">No catalogs ready</h3>
            <p className="text-slate-400 dark:text-slate-500 mt-2 font-medium">Create and save a catalog to see it here.</p>
            <button
              onClick={() => setView('catalog-setup')}
              className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
            >
              Start New Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {savedCatalogs.map(catalog => {
              const isPublished = catalog.status === 'published';
              const isProcessing = publishingId === catalog.id;

              return (
                <div key={catalog.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none flex flex-col md:flex-row items-center gap-8 group hover:border-indigo-100 dark:hover:border-indigo-900 transition-all">

                  {/* Thumbnail / Status Icon */}
                  <div className={`w-full md:w-48 h-32 rounded-xl flex items-center justify-center shrink-0 relative overflow-hidden ${isPublished ? 'bg-emerald-50 dark:bg-emerald-900/10' : 'bg-slate-50 dark:bg-slate-800'}`}>
                    {isPublished ? (
                      <div className="flex flex-col items-center gap-2 text-emerald-600 dark:text-emerald-400 animate-in zoom-in">
                        <Globe size={32} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Live</span>
                      </div>
                    ) : (
                      <FileText size={32} className="text-slate-300 dark:text-slate-600" />
                    )}
                    {/* Status Badge */}
                    <div className={`absolute top-3 left-3 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${isPublished ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'}`}>
                      {isPublished ? 'Published' : 'Draft'}
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="flex-1 min-w-0 w-full text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                      {editingNameId === catalog.id ? (
                        <div className="flex items-center gap-2 w-full max-w-md">
                          <input
                            type="text"
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-indigo-300 dark:border-indigo-700 rounded-lg px-3 py-1.5 text-lg font-bold text-slate-900 dark:text-white focus:outline-none"
                            autoFocus
                          />
                          <button onClick={() => handleRenameSave(catalog.id)} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"><CheckCircle2 size={16} /></button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center md:justify-start gap-3 group/title">
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white truncate cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => openPublicViewer(catalog.id)}>{catalog.name}</h3>
                          <button
                            onClick={() => handleRenameStart(catalog.id, catalog.name)}
                            className="opacity-0 group-hover/title:opacity-100 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-all"
                          >
                            <Edit2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-slate-400 dark:text-slate-500 text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        Last updated: {new Date(catalog.updatedAt).toLocaleDateString()}
                      </div>
                      <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <div>{catalog.pages.length} Pages</div>
                      <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <div>ID: {catalog.id}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 w-full md:w-auto justify-center">

                    <button
                      onClick={() => handleEdit(catalog.id)}
                      className="px-5 py-2.5 text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handlePublish(catalog)}
                      disabled={isProcessing}
                      className={`
                            px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg flex items-center gap-2
                            ${isPublished
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20'
                        }
                        `}
                    >
                      {isProcessing ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : isPublished ? (
                        <Share2 size={16} />
                      ) : (
                        <Rocket size={16} />
                      )}
                      {isProcessing ? 'Processing...' : isPublished ? 'Share' : 'Publish'}
                    </button>

                    <button
                      onClick={() => handleDelete(catalog.id)}
                      className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                      title="Delete Catalog"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublishView;
