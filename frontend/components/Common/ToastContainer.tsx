import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { ToastNotification } from '../../types';

const ToastItem: React.FC<{ toast: ToastNotification; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss
}) => {
  const duration = toast.duration || 5000;
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 50);

    return () => clearInterval(interval);
  }, [duration]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={18} className="text-[#E2DCC8] shrink-0" />;
      case 'error':
        return <AlertCircle size={18} className="text-red-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle size={18} className="text-amber-400 shrink-0" />;
      case 'info':
      default:
        return <Info size={18} className="text-[#E2DCC8] shrink-0" />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case 'error':
        return 'bg-[#181212]/95 border-red-500/40 shadow-red-950/40 text-red-100';
      case 'warning':
        return 'bg-[#181611]/95 border-amber-500/40 shadow-amber-950/40 text-amber-100';
      case 'info':
        return 'bg-[#141414]/95 border-[#0F3D3E]/60 shadow-black/60 text-slate-100';
      case 'success':
      default:
        return 'bg-[#141414]/95 border-[#0F3D3E] shadow-[#0F3D3E]/20 text-[#F1F1F1]';
    }
  };

  const getProgressColor = () => {
    switch (toast.type) {
      case 'error':
        return 'bg-red-500/80';
      case 'warning':
        return 'bg-amber-400/80';
      case 'info':
      case 'success':
      default:
        return 'bg-[#E2DCC8]/80';
    }
  };

  return (
    <div
      className={`pointer-events-auto w-full rounded-[6px] border p-3.5 shadow-2xl backdrop-blur-md flex items-start gap-3 relative overflow-hidden transition-all duration-300 animate-in slide-in-from-bottom-4 fade-in ${getStyles()}`}
    >
      <div className="mt-0.5">{getIcon()}</div>
      
      <div className="flex-1 min-w-0 pr-4">
        {toast.title && (
          <h4 className="text-xs font-bold font-heading uppercase tracking-wider text-[#E2DCC8] mb-0.5">
            {toast.title}
          </h4>
        )}
        <p className="text-xs font-medium leading-snug break-words">
          {toast.message}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0 -mr-1 -mt-1"
        title="Dismiss notification"
      >
        <X size={14} />
      </button>

      {/* 5-second progress indicator bar */}
      <div
        className={`absolute bottom-0 left-0 h-[2px] transition-all duration-75 ease-linear ${getProgressColor()}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useStore();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
