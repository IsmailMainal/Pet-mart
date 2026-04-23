import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { useToast } from '../components/Toast';
import { Card, PageHeader, SearchBar, Badge, Skeleton, EmptyState } from '../components/UI';
import { 
  Activity, User, Clock, Tag, Search, Package, 
  Calendar, CreditCard, Scissors, Stethoscope, Hash 
} from 'lucide-react';

const CATEGORY_CONFIG = {
  Product:     { color: 'amber',  icon: <Package size={18} /> },
  Appointment: { color: 'blue',   icon: <Calendar size={18} /> },
  Invoice:     { color: 'green',  icon: <CreditCard size={18} /> },
  User:        { color: 'purple', icon: <User size={18} /> },
  Service:     { color: 'blue',   icon: <Scissors size={18} /> },
  Coupon:      { color: 'purple', icon: <Tag size={18} /> },
  Doctor:      { color: 'blue',   icon: <Stethoscope size={18} /> },
  System:      { color: 'stone',  icon: <Activity size={18} /> },
};

const Logs = () => {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['logs', activeCategory],
    queryFn: async () => {
      const res = await api.get('/logs', { params: { entity: activeCategory } });
      return res.data?.logs || [];
    }
  });

  const logs = data || [];

  const filtered = logs.filter(log => {
    // Frontend-side safety filter (fallback)
    if (activeCategory !== 'all' && log.entity !== activeCategory) return false;

    return (
      (log.action || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.details || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.User?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.entity || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  const getActionColor = (action) => {
    if (action.includes('create')) return 'green';
    if (action.includes('update')) return 'amber';
    if (action.includes('delete')) return 'red';
    return 'stone';
  };

  const categories = ['all', 'Product', 'Appointment', 'Invoice', 'User', 'Service', 'Coupon', 'Doctor'];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Activity Audit Logs" 
        description="Track all administrative actions across the platform"
        icon={<Activity className="text-lime-700" />}
      />

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2
              ${activeCategory === cat 
                ? 'bg-lime-700 text-white border-lime-700 shadow-lg shadow-lime-100' 
                : 'bg-white text-stone-500 border-stone-100 hover:border-lime-200 hover:text-lime-700'}`}
          >
            {cat === 'all' ? 'All Activities' : cat + 's'}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text" 
            placeholder="Search within this category..."
            className="w-full bg-white border border-stone-200 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-lime-100 focus:border-lime-600 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button onClick={() => refetch()} className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-2xl text-sm font-bold transition-all flex items-center gap-2">
          Refresh
        </button>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-stone-100">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="p-6 flex items-start gap-4">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="w-20 h-6 rounded-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState 
            icon="🔍" 
            title="No matching logs" 
            description={search ? "Try a different search term" : "No activity recorded in this category yet."} 
          />
        ) : (
          <div className="divide-y divide-stone-50">
            {filtered.map(log => {
              const cfg = CATEGORY_CONFIG[log.entity] || CATEGORY_CONFIG.System;
              return (
                <div key={log.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-stone-50/50 transition-colors group">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-${cfg.color}-50 text-${cfg.color}-600 transition-transform group-hover:scale-110`}>
                    {cfg.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-stone-800 capitalize leading-none">{log.action} {log.entity}</span>
                      <Badge color={getActionColor(log.action)} className="text-[9px] uppercase">{log.action.split(' ')[0]}</Badge>
                    </div>
                    <p className="text-sm text-stone-500 line-clamp-2 leading-relaxed">{log.details}</p>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-[11px] font-bold text-stone-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><User size={12} className="text-stone-300" /> {log.User?.name || 'System'}</span>
                      <span className="flex items-center gap-1.5"><Clock size={12} className="text-stone-300" /> {new Date(log.createdAt).toLocaleString()}</span>
                      {log.entityId && <span className="flex items-center gap-1.5"><Hash size={12} className="text-stone-300" /> ID: {log.entityId}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Logs;
