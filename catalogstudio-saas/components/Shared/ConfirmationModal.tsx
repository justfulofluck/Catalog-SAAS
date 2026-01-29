import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    isDestructive = false,
    onConfirm,
    onCancel
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/20 dark:bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onCancel}
            />
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden animate-in zoom-in-95 duration-300 scale-100 border border-slate-100 dark:border-slate-800">
                <div className="p-8 flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 ${isDestructive
                            ? 'bg-red-50 text-red-500 dark:bg-red-900/10 dark:text-red-400'
                            : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/10 dark:text-indigo-400'
                        }`}>
                        <AlertCircle size={32} />
                    </div>

                    <h3 className="text-xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">{title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-[260px]">{message}</p>

                    <div className="flex items-center gap-3 w-full mt-8">
                        <button
                            onClick={onCancel}
                            className="flex-1 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-95 ${isDestructive
                                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20'
                                }`}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>

                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default ConfirmationModal;
