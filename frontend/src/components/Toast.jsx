import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast ${toast.type || 'info'}`}>
          {toast.type === 'success' && <CheckCircle2 size={18} className="text-emerald-400" />}
          {toast.type === 'error' && <AlertCircle size={18} className="text-red-400" />}
          {(!toast.type || toast.type === 'info') && <Info size={18} className="text-indigo-400" />}
          
          <span style={{ flex: 1 }}>{toast.message}</span>
          
          <button 
            onClick={() => onDismiss(toast.id)}
            style={{ color: '#cbd5e1', padding: 2, display: 'flex' }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
