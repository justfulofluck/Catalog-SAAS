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
  X,
  FileDown
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { exportCatalogToPDF } from '../Editor/pdfExporter';

const PublishView: React.FC = () => {
  const { savedCatalogs, loadCatalog, setView, updateSavedCatalog, publishCatalog, deleteCatalog, openPublicViewer, products, uiTheme, showConfirm, showToast } = useStore();
  const isDark = uiTheme === 'dark';
  const [editingNameId, setEditingNameId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
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
        showToast('Catalog published successfully! Sharable link is ready.', 'success', 'Published', 5000);
      }
    } catch (error) {
      console.error("Publishing failed", error);
      showToast('Failed to publish catalog. Please try again.', 'error', 'Publish Error', 5000);
    } finally {
      setPublishingId(null);
    }
  };

  const handleDelete = (id: string, name?: string) => {
    const title = name ? `"${name}"` : 'this catalog';
    showConfirm({
      title: 'Delete Catalog',
      message: `Are you sure you want to delete ${title}? This action cannot be undone.`,
      confirmText: 'Delete Catalog',
      type: 'danger',
      onConfirm: async () => {
        try {
          await deleteCatalog(id);
          showToast(`Catalog ${title} deleted successfully.`, 'success', 'Catalog Deleted', 5000);
        } catch (err) {
          showToast('Failed to delete catalog.', 'error', 'Error', 5000);
        }
      }
    });
  };

  const handleDownloadPDF = async (targetCatalog: any) => {
    setDownloadingId(targetCatalog.id);
    try {
      await exportCatalogToPDF(targetCatalog, products);
      showToast('Catalog PDF exported successfully.', 'success', 'Export Complete', 5000);
    } catch (error: any) {
      console.error("PDF export failed:", error);
      showToast(error?.message || "Failed to generate PDF. Please try again.", 'error', 'Export Failed', 5000);
    } finally {
      setDownloadingId(null);
    }
  };

  const ShareModal = ({ catalogId, onClose }: { catalogId: string, onClose: () => void }) => {
    const catalog = savedCatalogs.find(c => c.id === catalogId);
    const publicUrl = `${window.location.origin}/viewer/${catalog?.uuid || catalogId}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(publicUrl)}`;

    const copyToClipboard = () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(publicUrl).then(() => {
          showToast('Public viewer link copied to clipboard!', 'success', 'Link Copied', 5000);
        }).catch(() => {
          fallbackCopyText(publicUrl);
        });
      } else {
        fallbackCopyText(publicUrl);
      }
    };

    const fallbackCopyText = (text: string) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand('copy');
        if (successful) {
          showToast('Public viewer link copied to clipboard!', 'success', 'Link Copied', 5000);
        } else {
          showToast('Unable to copy link. Please select and copy manually.', 'warning', 'Copy Notice', 5000);
        }
      } catch (err) {
        showToast('Unable to copy link. Please select and copy manually.', 'warning', 'Copy Notice', 5000);
      }

      document.body.removeChild(textArea);
    };

    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className={`w-full max-w-md rounded-3xl shadow-2xl p-8 relative animate-in zoom-in-95 duration-200 border ${
          isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200'
        }`}>
          <button onClick={onClose} className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
            isDark ? 'hover:bg-[#1c1c1c] text-[#888888] hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
          }`}>
            <X size={20} />
          </button>

          <div className="text-center space-y-4 mb-8">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border ${
              isDark ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/50' : 'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}>
              <Globe size={32} />
            </div>
            <h2 className={`font-space text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Published Successfully!</h2>
            <p className={`text-sm ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>Your catalog is now live and accessible via the secure link below.</p>
          </div>

          <div className="flex flex-col gap-6">
            <div className={`p-4 rounded-[4px] flex items-center gap-4 border ${
              isDark ? 'bg-[#1c1c1c] border-[#262626]' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="p-2 bg-white rounded-[4px] shadow-sm shrink-0 border border-slate-200">
                <img src={qrUrl} alt="QR Code" className="w-20 h-20" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>Public URL</p>
                <div className={`flex items-center gap-2 border rounded-[4px] p-2 mb-2 ${
                  isDark ? 'bg-[#121212] border-[#262626]' : 'bg-white border-slate-200'
                }`}>
                  <Globe size={14} className={isDark ? "text-[#E2DCC8] shrink-0" : "text-[#0F3D3E] shrink-0"} />
                  <span className={`text-xs font-bold truncate ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{publicUrl}</span>
                </div>
                <button onClick={copyToClipboard} className={`text-[10px] font-bold flex items-center gap-1 ${
                  isDark ? 'text-[#E2DCC8] hover:text-[#E2DCC8]' : 'text-[#0F3D3E] hover:underline'
                }`}>
                  <Copy size={12} /> Copy Link
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => openPublicViewer(catalogId)} className="w-full py-3 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-[#0F3D3E]/20 flex items-center justify-center gap-2">
                <ExternalLink size={16} /> View Live
              </button>
              <button onClick={onClose} className={`w-full py-3 rounded-[4px] text-xs font-bold uppercase tracking-widest border transition-all ${
                isDark ? 'bg-[#1c1c1c] hover:bg-[#262626] text-[#888888] hover:text-white border-[#262626]' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}>
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex-1 flex flex-col overflow-hidden animate-in fade-in duration-500 relative ${
      isDark ? 'bg-[#100F0F] text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      {showShareModal && <ShareModal catalogId={showShareModal} onClose={() => setShowShareModal(null)} />}

      {/* Single Line Header & Toolbar */}
      <div className={`px-6 py-4 border-b flex flex-wrap items-center justify-between gap-4 shrink-0 ${
        isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col min-w-[200px]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('dashboard')}
              className={`transition-colors p-1 -ml-1 rounded-[3px] ${
                isDark ? 'text-[#888888] hover:text-[#E2DCC8] hover:bg-[#222222]' : 'text-slate-400 hover:text-[#0F3D3E] hover:bg-slate-100'
              }`}
              title="Back to Dashboard"
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className={`text-xl font-semibold tracking-tight leading-none font-heading ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>Publish & Manage</h1>
          </div>
          <p className={`text-xs font-normal mt-1 ml-7 ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>Deploy your digital publications to the global network.</p>
        </div>

        <div className="flex items-center gap-3 shrink-0 ml-auto">
          <button
            onClick={() => setView('catalog-setup')}
            className="px-4 py-2 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] font-heading font-semibold text-xs uppercase tracking-wider shadow-md shadow-[#0F3D3E]/20 flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap"
          >
            <Rocket size={14} /> New Publication
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">

        {/* Catalog List */}
        {savedCatalogs.length === 0 ? (
          <div className={`flex flex-col items-center justify-center py-32 text-center rounded-[4px] border border-dashed ${
            isDark ? 'bg-[#161616] border-[#262626]' : 'bg-white border-slate-300'
          }`}>
            <div className={`w-20 h-20 rounded-[4px] flex items-center justify-center mb-6 border ${
              isDark ? 'bg-[#1c1c1c] text-[#666666] border-[#262626]' : 'bg-slate-50 text-slate-400 border-slate-200'
            }`}>
              <Rocket size={40} />
            </div>
            <h3 className={`font-space text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>No catalogs ready</h3>
            <p className={`mt-2 font-medium ${isDark ? 'text-[#888888]' : 'text-slate-500'}`}>Create and save a catalog to see it here.</p>
            <button
              onClick={() => setView('catalog-setup')}
              className="mt-8 px-6 py-3 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] text-xs font-bold uppercase tracking-widest shadow-lg shadow-[#0F3D3E]/20 transition-all"
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
                <div key={catalog.id} className={`rounded-[4px] p-6 border shadow-xl flex flex-col md:flex-row items-center gap-8 group transition-all ${
                  isDark 
                    ? 'bg-[#161616] border-[#262626] hover:border-[#3a3a3a]' 
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                }`}>

                  {/* Thumbnail / Status Icon */}
                  <div className={`w-full md:w-48 h-32 rounded-[4px] flex items-center justify-center shrink-0 relative overflow-hidden border ${
                    isPublished 
                      ? (isDark ? 'bg-emerald-950/20 border-emerald-800/30' : 'bg-emerald-50 border-emerald-200')
                      : (isDark ? 'bg-[#1c1c1c] border-[#262626]' : 'bg-slate-100 border-slate-200')
                  }`}>
                    {isPublished ? (
                      <div className="flex flex-col items-center gap-2 text-emerald-500 animate-in zoom-in">
                        <Globe size={32} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Live</span>
                      </div>
                    ) : (
                      <FileText size={32} className={isDark ? "text-[#666666]" : "text-slate-400"} />
                    )}
                    {/* Status Badge */}
                    <div className={`absolute top-3 left-3 px-2 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-widest border ${
                      isPublished 
                        ? (isDark ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/40' : 'bg-emerald-100 text-emerald-700 border-emerald-300')
                        : (isDark ? 'bg-amber-950/70 text-amber-300 border-amber-800/40' : 'bg-amber-100 text-amber-800 border-amber-300')
                    }`}>
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
                            className={`flex-1 border rounded-[4px] px-3 py-1.5 text-lg font-bold focus:outline-none ${
                              isDark ? 'bg-[#1c1c1c] border-[#0F3D3E] text-white' : 'bg-white border-[#0F3D3E] text-slate-900'
                            }`}
                            autoFocus
                          />
                          <button onClick={() => handleRenameSave(catalog.id)} className="p-2 bg-[#0F3D3E] text-white rounded-[4px] hover:bg-[#155455]"><CheckCircle2 size={16} /></button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center md:justify-start gap-3 group/title">
                          <h3 className={`font-space text-2xl font-bold truncate cursor-pointer transition-colors ${
                            isDark ? 'text-white hover:text-[#E2DCC8]' : 'text-slate-900 hover:text-[#0F3D3E]'
                          }`} onClick={() => openPublicViewer(catalog.id)}>{catalog.name}</h3>
                          <button
                            onClick={() => handleRenameStart(catalog.id, catalog.name)}
                            className={`opacity-0 group-hover/title:opacity-100 p-1.5 rounded-[4px] transition-all ${
                              isDark ? 'hover:bg-[#262626] text-[#888888] hover:text-white' : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
                            }`}
                            title="Rename"
                          >
                            <Edit2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className={`flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-medium ${
                      isDark ? 'text-[#888888]' : 'text-slate-500'
                    }`}>
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        Last updated: {new Date(catalog.updatedAt).toLocaleDateString()}
                      </div>
                      <div className={`w-1 h-1 rounded-full ${isDark ? 'bg-[#333333]' : 'bg-slate-300'}`} />
                      <div>{catalog.pages.length} Pages</div>
                      <div className={`w-1 h-1 rounded-full ${isDark ? 'bg-[#333333]' : 'bg-slate-300'}`} />
                      <div className="font-mono">ID: {catalog.id}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 w-full md:w-auto justify-center">
                    <button
                      onClick={() => handleEdit(catalog.id)}
                      className={`px-5 py-2.5 text-xs font-bold uppercase tracking-widest rounded-[4px] transition-all border ${
                        isDark 
                          ? 'text-[#888888] hover:text-white hover:bg-[#1c1c1c] border-[#262626]' 
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(catalog)}
                      disabled={downloadingId === catalog.id}
                      className={`px-4 py-2.5 text-xs font-bold uppercase tracking-widest rounded-[4px] transition-all flex items-center gap-2 border shadow-sm ${
                        isDark 
                          ? 'text-white bg-[#1c1c1c] hover:bg-[#252525] border-[#262626] hover:border-[#0F3D3E]' 
                          : 'text-slate-700 bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-[#0F3D3E]'
                      }`}
                      title="Download multi-page PDF"
                    >
                      {downloadingId === catalog.id ? (
                        <Loader2 size={15} className={`animate-spin ${isDark ? 'text-[#E2DCC8]' : 'text-[#0F3D3E]'}`} />
                      ) : (
                        <FileDown size={15} className={isDark ? "text-[#E2DCC8]" : "text-[#0F3D3E]"} />
                      )}
                      <span>PDF</span>
                    </button>
                    <button
                      onClick={() => handlePublish(catalog)}
                      disabled={isProcessing}
                      className={`
                        px-6 py-2.5 rounded-[4px] text-xs font-bold uppercase tracking-widest transition-all shadow-lg flex items-center gap-2
                        ${isPublished
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                          : 'bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white shadow-[#0F3D3E]/20'
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
                      onClick={() => handleDelete(catalog.id, catalog.name)}
                      className={`p-3 rounded-[4px] transition-all border border-transparent ${
                        isDark 
                          ? 'text-[#666666] hover:text-red-400 hover:bg-red-950/30 hover:border-red-800/30' 
                          : 'text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200'
                      }`}
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
