import React, { useState } from 'react';
import { AlertTriangle, Trash2, Info, X } from 'lucide-react';
import { useStore } from '../../store/useStore';

export const ConfirmModal: React.FC = () => {
  const { confirmModal, closeConfirm } = useStore();
  const [loading, setLoading] = useState(false);

  if (!confirmModal || !confirmModal.isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await confirmModal.onConfirm();
    } finally {
      setLoading(false);
      closeConfirm();
    }
  };

  const handleCancel = () => {
    if (confirmModal.onCancel) confirmModal.onCancel();
    closeConfirm();
  };

  const isDanger = confirmModal.type === 'danger' || !confirmModal.type;

  return (
    <div className="fixed inset-0 z-[99998] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="bg-[#141414] border border-[#E2DCC8]/20 rounded-[8px] max-w-md w-full p-6 shadow-2xl space-y-5 text-left animate-modal-card relative text-[#F1F1F1]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className={`w-11 h-11 rounded-[6px] flex items-center justify-center shrink-0 ${
            isDanger ? 'bg-red-500/15 border border-red-500/30 text-red-400' : 'bg-[#0F3D3E]/30 border border-[#0F3D3E] text-[#E2DCC8]'
          }`}>
            {isDanger ? <Trash2 size={20} /> : <AlertTriangle size={20} />}
          </div>

          <div className="flex-1 min-w-0 pr-2">
            <h3 className="text-base font-bold font-heading tracking-tight text-[#F1F1F1]">
              {confirmModal.title}
            </h3>
            <p className="text-xs font-medium text-[#E2DCC8]/70 mt-1.5 leading-relaxed">
              {confirmModal.message}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 -mr-2 -mt-2"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E2DCC8]/10">
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 rounded-[4px] border border-[#E2DCC8]/20 text-xs font-bold uppercase tracking-wider text-[#E2DCC8] hover:bg-[#1a1a1a] hover:text-white transition-all disabled:opacity-50"
          >
            {confirmModal.cancelText || 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`px-5 py-2 rounded-[4px] text-xs font-bold uppercase tracking-wider text-white shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 ${
              isDanger 
                ? 'bg-red-600 hover:bg-red-700 border border-red-500 shadow-red-950/40' 
                : 'bg-[#0F3D3E] hover:bg-[#155455] border border-[#E2DCC8]/30 shadow-[#0F3D3E]/30'
            }`}
          >
            {loading ? (
              <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : null}
            <span>{confirmModal.confirmText || (isDanger ? 'Delete' : 'Confirm')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
