import React from 'react';
import { X, TrendingDown, TrendingUp, Package, Pencil, Trash2, Plus, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../../api';
import { Skeleton } from '../UI';

const ACTION_CONFIG = {
  create:  { icon: <Plus size={13} />,        color: 'bg-lime-100 text-lime-700',   label: 'Added'    },
  update:  { icon: <TrendingDown size={13} />, color: 'bg-blue-100 text-blue-700',   label: 'Updated'  },
  delete:  { icon: <Trash2 size={13} />,       color: 'bg-red-100 text-red-700',     label: 'Deleted'  },
};

const inferAction = (details = '') => {
  if (details.toLowerCase().includes('deducted')) return {
    icon: <TrendingDown size={13} />, color: 'bg-red-100 text-red-600', label: 'Stock Out'
  };
  if (details.toLowerCase().includes('restored') || details.toLowerCase().includes('reactivate')) return {
    icon: <TrendingUp size={13} />, color: 'bg-green-100 text-green-700', label: 'Restored'
  };
  if (details.toLowerCase().includes('created')) return ACTION_CONFIG.create;
  if (details.toLowerCase().includes('deleted')) return ACTION_CONFIG.delete;
  return ACTION_CONFIG.update;
};

const StockHistoryDrawer = ({ productId, productName, onClose }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['product-history', productId],
    queryFn: () => api.get(`/products/${productId}/history`).then(r => r.data),
    enabled: !!productId,
  });

  const formatDate = (d) => new Date(d).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-stone-100 bg-stone-50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} className="text-stone-400" />
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Stock History</p>
            </div>
            <h2 className="text-base font-black text-stone-800 leading-tight">{productName}</h2>
            {data?.product && (
              <p className="text-xs text-stone-500 mt-1">
                Current stock: <span className="font-bold text-lime-700">{data.product.quantity} units</span>
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-xl transition-colors mt-0.5">
            <X size={18} className="text-stone-500" />
          </button>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-8 w-8 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : !data?.logs?.length ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-stone-300">
              <Package size={40} />
              <p className="text-sm font-semibold text-stone-400">No stock history found</p>
              <p className="text-xs text-stone-300 text-center">Activity will appear here once this product is used in invoices or updated.</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-px bg-stone-100" />

              <div className="space-y-4">
                {data.logs.map((log, idx) => {
                  const config = inferAction(log.details || '');
                  return (
                    <div key={log.id} className="flex gap-4 relative">
                      {/* Icon bubble */}
                      <div className={`relative z-10 shrink-0 w-8 h-8 rounded-xl flex items-center justify-center ${config.color}`}>
                        {config.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 bg-stone-50 rounded-2xl px-4 py-3 border border-stone-100">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-stone-800 leading-snug">
                              {log.details || `${config.label} — ${log.action}`}
                            </p>
                            {log.User && (
                              <p className="text-xs text-stone-400 mt-0.5">by {log.User.name}</p>
                            )}
                          </div>
                          <span className={`shrink-0 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md ${config.color}`}>
                            {config.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-300 mt-2 font-mono">{formatDate(log.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default StockHistoryDrawer;
