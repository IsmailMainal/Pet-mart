import React, { useState, useEffect } from 'react';

// ── Button ──────────────────────────────────────────────────────────────────
export const Button = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 active:scale-95 focus:outline-none';
  const variants = {
    primary:   'bg-lime-700 hover:bg-lime-600 text-white shadow-sm hover:shadow-md',
    secondary: 'bg-stone-100 hover:bg-stone-200 text-stone-700',
    danger:    'bg-red-100 hover:bg-red-200 text-red-700',
    ghost:     'hover:bg-stone-100 text-stone-600',
    outline:   'border border-stone-300 hover:border-lime-600 hover:text-lime-700 text-stone-600',
  };
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-5 py-2.5 text-sm', lg: 'px-7 py-3.5 text-base' };
  return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>;
};

// ── Badge ────────────────────────────────────────────────────────────────────
export const Badge = ({ children, color = 'stone' }) => {
  const colors = {
    green:  'bg-lime-100 text-lime-800',
    amber:  'bg-amber-100 text-amber-800',
    red:    'bg-red-100 text-red-700',
    blue:   'bg-sky-100 text-sky-700',
    purple: 'bg-purple-100 text-purple-700',
    stone:  'bg-stone-100 text-stone-600',
  };
  return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[color]}`}>{children}</span>;
};

// ── Card ─────────────────────────────────────────────────────────────────────
export const Card = ({ children, className = '', hover = false, ...props }) => (
  <div className={`bg-white rounded-2xl border border-stone-100 shadow-sm ${hover ? 'card-hover cursor-pointer' : ''} ${className}`} {...props}>
    {children}
  </div>
);

// ── Input ─────────────────────────────────────────────────────────────────────
export const Input = ({ label, error, className = '', ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-stone-700">{label}</label>}
    <input
      className={`w-full border rounded-xl px-4 py-2.5 text-sm text-stone-800 bg-white outline-none transition-all
        ${error ? 'border-red-400 focus:ring-2 focus:ring-red-300' : 'border-stone-200 focus:border-lime-600 focus:ring-2 focus:ring-lime-100'}
        ${className}`}
      {...props}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// ── Textarea ──────────────────────────────────────────────────────────────────
export const Textarea = ({ label, error, className = '', ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-stone-700">{label}</label>}
    <textarea
      className={`w-full border rounded-xl px-4 py-2.5 text-sm text-stone-800 bg-white outline-none resize-none transition-all
        ${error ? 'border-red-400 focus:ring-2 focus:ring-red-300' : 'border-stone-200 focus:border-lime-600 focus:ring-2 focus:ring-lime-100'}
        ${className}`}
      {...props}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// ── Select ─────────────────────────────────────────────────────────────────────
export const Select = ({ label, error, children, className = '', ...props }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-stone-700">{label}</label>}
    <select
      className={`w-full border rounded-xl px-4 py-2.5 text-sm text-stone-800 bg-white outline-none transition-all
        ${error ? 'border-red-400 focus:ring-2 focus:ring-red-300' : 'border-stone-200 focus:border-lime-600 focus:ring-2 focus:ring-lime-100'}
        ${className}`}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// ── Modal ─────────────────────────────────────────────────────────────────────
export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm fade-in">
      <div className={`bg-white rounded-3xl w-full ${maxWidth} shadow-2xl max-h-[90vh] flex flex-col slide-up`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 shrink-0">
          <h2 className="text-lg font-bold text-stone-800">{title}</h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5">{children}</div>
      </div>
    </div>
  );
};

// ── ConfirmModal ─────────────────────────────────────────────────────────────
export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, description, confirmLabel = 'Delete', danger = true }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
    <p className="text-stone-500 text-sm mb-6">{description}</p>
    <div className="flex gap-3">
      <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
      <Button variant={danger ? 'danger' : 'primary'} className="flex-1" onClick={onConfirm}>{confirmLabel}</Button>
    </div>
  </Modal>
);

export const LOADING_MESSAGES = [
  "Fetching treats 🦴...",
  "Preparing your pet's care 🐾...",
  "Wagging tails in progress 🐕...",
  "Purring for performance 🐈...",
  "Rounding up the fluffiest data 🐑...",
  "Whisking through your requests 🐱...",
  "Unleashing the best experience 🐶...",
  "Sniffing out the records 👃...",
  "Chasing down the details 🎾...",
];

export const useLoadingMessage = () => {
  const [msg, setMsg] = useState(LOADING_MESSAGES[0]);
  useEffect(() => {
    const randomMsg = LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)];
    setMsg(randomMsg);
  }, []);
  return msg;
};

export const LoadingScreen = () => {
  const [msg, setMsg] = useState(LOADING_MESSAGES[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsg(prev => {
        const nextIdx = (LOADING_MESSAGES.indexOf(prev) + 1) % LOADING_MESSAGES.length;
        return LOADING_MESSAGES[nextIdx];
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-stone-50 flex flex-col items-center justify-center p-6 text-center animate-pulse-slow">
      <div className="relative mb-8">
        <div className="w-16 h-16 border-4 border-lime-100 border-t-lime-600 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-2xl">🐾</div>
      </div>
      <p className="text-stone-700 font-bold text-lg animate-bounce-subtle">{msg}</p>
      <p className="text-stone-400 text-sm mt-2">Loading Pets Mart...</p>
    </div>
  );
};

export const Skeleton = ({ className = '' }) => (
  <div className={`skeleton ${className}`} />
);

export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
    <Skeleton className="h-52 w-full rounded-none rounded-t-2xl" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-8 w-1/3" />
    </div>
  </div>
);

// ── EmptyState ────────────────────────────────────────────────────────────────
export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center fade-in">
    <div className="text-6xl mb-4">{icon || '🐾'}</div>
    <h3 className="text-xl font-bold text-stone-700 mb-2">{title}</h3>
    <p className="text-stone-400 text-sm max-w-xs mb-6">{description}</p>
    {action}
  </div>
);

// ── StockBadge ─────────────────────────────────────────────────────────────
export const StockBadge = ({ quantity }) => {
  if (quantity > 10) return <Badge color="green">● In Stock</Badge>;
  if (quantity > 0) return <Badge color="amber">● Low Stock</Badge>;
  return <Badge color="red">● Out of Stock</Badge>;
};

// ── PageHeader ──────────────────────────────────────────────────────────────
export const PageHeader = ({ title, description, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
    <div>
      <h1 className="text-2xl font-bold text-stone-800 tracking-tight">{title}</h1>
      {description && <p className="text-stone-400 text-sm mt-1">{description}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

// ── SearchBar ──────────────────────────────────────────────────────────────
export const SearchBar = ({ value, onChange, placeholder = 'Search...' }) => (
  <div className="relative">
    <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full pl-10 pr-4 py-2.5 border border-stone-200 rounded-xl text-sm bg-white focus:outline-none focus:border-lime-600 focus:ring-2 focus:ring-lime-100 transition-all"
    />
  </div>
);
