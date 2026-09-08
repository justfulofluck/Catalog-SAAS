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
  const { savedCatalogs, loadCatalog, setView, updateSavedCatalog, publishCatalog, deleteCatalog, openPublicViewer, products } = useStore();
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

  const handleDownloadPDF = async (targetCatalog: any) => {
    setDownloadingId(targetCatalog.id);
    try {
      await exportCatalogToPDF(targetCatalog, products);
    } catch (error: any) {
      console.error("PDF export failed:", error);
      alert(error?.message || "Failed to generate PDF. Please try again.");
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
          alert('Link copied to clipboard!');
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
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-[#161616] w-full max-w-md rounded-3xl shadow-2xl p-8 relative animate-in zoom-in-95 duration-200 border border-[#262626]">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-[#1c1c1c] rounded-full transition-colors text-[#888888] hover:text-white">
            <X size={20} />
          </button>

          <div className="text-center space-y-4 mb-8">
            <div className="w-16 h-16 bg-emerald-950/50 text-emerald-400 border border-emerald-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Globe size={32} />
            </div>
            <h2 className="font-space text-2xl font-bold text-white">Published Successfully!</h2>
            <p className="text-sm text-[#888888]">Your catalog is now live and accessible via the secure link below.</p>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-[#1c1c1c] p-4 rounded-[4px] flex items-center gap-4 border border-[#262626]">
              <div className="p-2 bg-white rounded-[4px] shadow-sm shrink-0">
                <img src={qrUrl} alt="QR Code" className="w-20 h-20" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#888888] mb-1.5">Public URL</p>
                <div className="flex items-center gap-2 bg-[#121212] border border-[#262626] rounded-[4px] p-2 mb-2">
                  <Globe size={14} className="text-[#E2DCC8] shrink-0" />
                  <span className="text-xs font-bold text-slate-200 truncate">{publicUrl}</span>
                </div>
                <button onClick={copyToClipboard} className="text-[10px] font-bold text-[#E2DCC8] hover:text-[#E2DCC8] flex items-center gap-1">
                  <Copy size={12} /> Copy Link
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => openPublicViewer(catalogId)} className="w-full py-3 bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 text-white rounded-[4px] text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-[#0F3D3E]/20 flex items-center justify-center gap-2">
                <ExternalLink size={16} /> View Live
              </button>
              <button onClick={onClose} className="w-full py-3 bg-[#1c1c1c] hover:bg-[#262626] text-[#888888] hover:text-white rounded-[4px] text-xs font-bold uppercase tracking-widest border border-[#262626] transition-all">
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#100F0F] text-white animate-in fade-in duration-500 relative">
      {showShareModal && <ShareModal catalogId={showShareModal} onClose={() => setShowShareModal(null)} />}

      {/* Single Line Header & Toolbar */}
      <div className="px-6 py-4 bg-[#161616] border-b border-[#262626] flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex flex-col min-w-[200px]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView('dashboard')}
              className="text-[#888888] hover:text-[#E2DCC8] transition-colors p-1 -ml-1 rounded-[3px] hover:bg-[#222222]"
              title="Back to Dashboard"
            >
              <ArrowLeft size={16} />
            </button>
            <h1 className="text-xl font-semibold text-white tracking-tight leading-none font-heading">Publish & Manage</h1>
          </div>
          <p className="text-xs text-[#888888] font-normal mt-1 ml-7">Deploy your digital publications to the global network.</p>
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
          <div className="flex flex-col items-center justify-center py-32 text-center bg-[#161616] rounded-[4px] border border-dashed border-[#262626]">
            <div className="w-20 h-20 bg-[#1c1c1c] rounded-[4px] flex items-center justify-center mb-6 text-[#666666] border border-[#262626]">
              <Rocket size={40} />
            </div>
            <h3 className="font-space text-2xl font-bold text-white">No catalogs ready</h3>
            <p className="text-[#888888] mt-2 font-medium">Create and save a catalog to see it here.</p>
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
                <div key={catalog.id} className="bg-[#161616] rounded-[4px] p-6 border border-[#262626] shadow-xl flex flex-col md:flex-row items-center gap-8 group hover:border-[#3a3a3a] transition-all">

                  {/* Thumbnail / Status Icon */}
                  <div className={`w-full md:w-48 h-32 rounded-[4px] flex items-center justify-center shrink-0 relative overflow-hidden border ${isPublished ? 'bg-emerald-950/20 border-emerald-800/30' : 'bg-[#1c1c1c] border-[#262626]'}`}>
                    {isPublished ? (
                      <div className="flex flex-col items-center gap-2 text-emerald-400 animate-in zoom-in">
                        <Globe size={32} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Live</span>
                      </div>
                    ) : (
                      <FileText size={32} className="text-[#666666]" />
                    )}
                    {/* Status Badge */}
                    <div className={`absolute top-3 left-3 px-2 py-0.5 rounded-[4px] text-[9px] font-bold uppercase tracking-widest border ${isPublished ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800/40' : 'bg-amber-950/70 text-amber-300 border-amber-800/40'}`}>
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
                            className="flex-1 bg-[#1c1c1c] border border-[#0F3D3E] rounded-[4px] px-3 py-1.5 text-lg font-bold text-white focus:outline-none"
                            autoFocus
                          />
                          <button onClick={() => handleRenameSave(catalog.id)} className="p-2 bg-[#0F3D3E] text-white rounded-[4px] hover:bg-[#155455]"><CheckCircle2 size={16} /></button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center md:justify-start gap-3 group/title">
                          <h3 className="font-space text-2xl font-bold text-white truncate cursor-pointer hover:text-[#E2DCC8] transition-colors" onClick={() => openPublicViewer(catalog.id)}>{catalog.name}</h3>
                          <button
                            onClick={() => handleRenameStart(catalog.id, catalog.name)}
                            className="opacity-0 group-hover/title:opacity-100 p-1.5 hover:bg-[#262626] rounded-[4px] text-[#888888] hover:text-white transition-all"
                            title="Rename"
                          >
                            <Edit2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-[#888888] text-xs font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        Last updated: {new Date(catalog.updatedAt).toLocaleDateString()}
                      </div>
                      <div className="w-1 h-1 rounded-full bg-[#333333]" />
                      <div>{catalog.pages.length} Pages</div>
                      <div className="w-1 h-1 rounded-full bg-[#333333]" />
                      <div className="font-mono">ID: {catalog.id}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 w-full md:w-auto justify-center">
                    <button
                      onClick={() => handleEdit(catalog.id)}
                      className="px-5 py-2.5 text-xs font-bold text-[#888888] uppercase tracking-widest hover:text-white hover:bg-[#1c1c1c] rounded-[4px] transition-all border border-[#262626]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(catalog)}
                      disabled={downloadingId === catalog.id}
                      className="px-4 py-2.5 text-xs font-bold text-white bg-[#1c1c1c] hover:bg-[#252525] border border-[#262626] hover:border-[#0F3D3E] uppercase tracking-widest rounded-[4px] transition-all flex items-center gap-2 shadow-sm"
                      title="Download multi-page PDF"
                    >
                      {downloadingId === catalog.id ? (
                        <Loader2 size={15} className="animate-spin text-[#E2DCC8]" />
                      ) : (
                        <FileDown size={15} className="text-[#E2DCC8]" />
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
                      onClick={() => handleDelete(catalog.id)}
                      className="p-3 text-[#666666] hover:text-red-400 hover:bg-red-950/30 rounded-[4px] transition-all border border-transparent hover:border-red-800/30"
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
