import React, { useState, useEffect } from 'react';
import api from '../api';
import { useToast } from '../components/Toast';
import { Card, PageHeader, SearchBar, Badge, Skeleton, EmptyState } from '../components/UI';
import { Activity, User, Clock, Tag, Search } from 'lucide-react';

const Logs = () => {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/logs');
      setLogs(res.data?.logs || []);
    } catch (err) {
      toast('error', 'Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const filtered = (Array.isArray(logs) ? logs : []).filter(log => 
    (log.action || '').toLowerCase().includes(search.toLowerCase()) ||
    (log.details || '').toLowerCase().includes(search.toLowerCase()) ||
    (log.User?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (log.entity || '').toLowerCase().includes(search.toLowerCase())
  );

  const getActionColor = (action) => {
    if (action.includes('create')) return 'green';
    if (action.includes('update')) return 'amber';
    if (action.includes('delete')) return 'red';
    return 'stone';
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Activity Audit Logs" 
        description="Track all administrative actions across the platform"
        icon={<Activity className="text-lime-700" />}
      />

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text" 
            placeholder="Search logs by action, user, or entity..."
            className="w-full bg-white border border-stone-200 rounded-2xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-lime-100 focus:border-lime-600 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button onClick={fetchLogs} className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-2xl text-sm font-bold transition-all flex items-center gap-2">
          Refresh Logs
        </button>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
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
            description={search ? "Try a different search term" : "No activity recorded yet."} 
          />
        ) : (
          <div className="divide-y divide-stone-50">
            {filtered.map(log => (
              <div key={log.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-stone-50/50 transition-colors group">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  log.action.includes('create') ? 'bg-green-100 text-green-600' :
                  log.action.includes('update') ? 'bg-amber-100 text-amber-600' :
                  log.action.includes('delete') ? 'bg-red-100 text-red-600' :
                  'bg-stone-100 text-stone-600'
                }`}>
                  <Activity size={20} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-stone-800 capitalize">{log.action} {log.entity}</span>
                    <Badge color={getActionColor(log.action)}>{log.entity}</Badge>
                  </div>
                  <p className="text-sm text-stone-500 line-clamp-2">{log.details}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-[11px] font-medium text-stone-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1"><User size={12} /> {log.User?.name || 'System'}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {new Date(log.createdAt).toLocaleString()}</span>
                    {log.entityId && <span className="flex items-center gap-1"><Tag size={12} /> ID: #{log.entityId}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Logs;
