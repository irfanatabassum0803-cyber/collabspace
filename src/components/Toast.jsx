import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';

export function Toast({ toast, onClose }) {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-[#343D2D]" />,
    error: <AlertCircle className="w-4 h-4 text-[#B85338]" />,
    info: <Info className="w-4 h-4 text-[#494C40]" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 duration-200">
      <div
        className={cn(
          'flex items-center gap-2.5 px-4 py-2.5 bg-white border border-[#E7E5DC] rounded-xl shadow-paper text-xs text-[#252720] font-sans'
        )}
      >
        {icons[toast.type || 'info']}
        <span className="font-medium tracking-tight">{toast.message}</span>
        <button
          onClick={onClose}
          className="p-1 text-[#848879] hover:text-[#252720] rounded transition-colors ml-1"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
