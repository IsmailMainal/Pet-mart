import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  return context.toast;
};

export const useNotifications = () => {
  const context = useContext(ToastContext);
  return { history: context.history, clearHistory: context.clearHistory };
};

const icons = {
  success: <CheckCircle size={18} className="text-lime-600" />,
  error: <XCircle size={18} className="text-red-500" />,
  warning: <AlertCircle size={18} className="text-amber-500" />,
};

const ToastItem = ({ toast, onRemove }) => (
  <div className="flex items-start gap-3 bg-white border border-stone-200 rounded-2xl px-4 py-3 shadow-lg min-w-[280px] max-w-sm slide-up">
    <span className="mt-0.5">{icons[toast.type] || icons.success}</span>
    <div className="flex-1">
      <p className="text-sm font-semibold text-stone-800">{toast.title}</p>
      {toast.message && <p className="text-xs text-stone-500 mt-0.5">{toast.message}</p>}
    </div>
    <button onClick={() => onRemove(toast.id)} className="text-stone-400 hover:text-stone-600 mt-0.5">
      <X size={14} />
    </button>
  </div>
);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [history, setHistory] = useState([]);

  const toast = useCallback((type, title, message) => {
    const id = Date.now();
    const newToast = { id, type, title, message, time: new Date() };
    setToasts(prev => [...prev, newToast]);
    setHistory(prev => [newToast, ...prev].slice(0, 20)); // Keep last 20
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const remove = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);
  const clearHistory = useCallback(() => setHistory([]), []);

  return (
    <ToastContext.Provider value={{ toast, history, clearHistory }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        {toasts.map(t => <ToastItem key={t.id} toast={t} onRemove={remove} />)}
      </div>
    </ToastContext.Provider>
  );
};
