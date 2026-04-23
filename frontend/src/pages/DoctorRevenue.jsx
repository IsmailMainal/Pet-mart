import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import { Card, PageHeader, Skeleton, Badge, EmptyState } from '../components/UI';
import { useToast } from '../components/Toast';
import { 
  DollarSign, Wallet, History, Send, 
  Stethoscope, Calendar, Search, ArrowRight,
  Filter, CheckCircle2, AlertCircle, X
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/format';

const DoctorRevenue = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [settleModal, setSettleModal] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('CASH');
  const [remarks, setRemarks] = useState('');

  const { data: report = [], isLoading } = useQuery({
    queryKey: ['doctor-revenue'],
    queryFn: () => api.get('/revenue/doctors').then(r => r.data)
  });

  const { data: history = [], isLoading: loadingHistory } = useQuery({
    queryKey: ['settlement-history', selectedDoctor?.id],
    queryFn: () => api.get(`/revenue/doctors/${selectedDoctor.id}/settlements`).then(r => r.data),
    enabled: !!selectedDoctor && historyModal
  });

  const settleMutation = useMutation({
    mutationFn: (data) => api.post('/revenue/settle', data),
    onSuccess: () => {
      toast('success', 'Settlement recorded successfully');
      setSettleModal(false);
      setAmount('');
      setRemarks('');
      queryClient.invalidateQueries(['doctor-revenue']);
      queryClient.invalidateQueries(['settlement-history', selectedDoctor?.id]);
    },
    onError: () => toast('error', 'Failed to record settlement')
  });

  const filtered = report.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.specialization.toLowerCase().includes(search.toLowerCase())
  );

  const totalOwed = report.reduce((sum, d) => sum + d.balance, 0);

  if (isLoading) return <div className="space-y-6"><PageHeader title="Doctor Revenue" /><Skeleton className="h-64 rounded-3xl" /></div>;

  return (
    <div className="space-y-8 pb-20">
      <PageHeader 
        title="Revenue & Settlements" 
        description="Manage doctor earnings, consultation fees, and payouts" 
      />

      {/* Global Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-6 bg-gradient-to-br from-lime-800 to-lime-900 text-white border-none shadow-xl shadow-lime-100">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
              <Wallet size={24} className="text-lime-300" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-lime-200">Net Outstanding</p>
          </div>
          <h3 className="text-3xl font-black">{formatCurrency(totalOwed)}</h3>
          <p className="text-xs text-lime-100/60 mt-2 italic">Total consultation fees pending settlement</p>
        </Card>

        <Card className="p-6 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-inner">
            <Stethoscope size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Total Earned</p>
            <h3 className="text-2xl font-black text-stone-800">
              {formatCurrency(report.reduce((sum, d) => sum + d.totalEarned, 0))}
            </h3>
          </div>
        </Card>

        <Card className="p-6 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-inner">
            <History size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Total Paid</p>
            <h3 className="text-2xl font-black text-stone-800">
              {formatCurrency(report.reduce((sum, d) => sum + d.totalSettled, 0))}
            </h3>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden shadow-sm border-stone-100">
        <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by doctor name or specialization..."
              className="w-full bg-white border border-stone-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-100 focus:border-lime-600 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50/30 text-stone-400 text-[10px] uppercase font-black tracking-widest">
              <tr>
                <th className="px-6 py-4 text-left">Doctor</th>
                <th className="px-6 py-4 text-right">Earned</th>
                <th className="px-6 py-4 text-right">Already Paid</th>
                <th className="px-6 py-4 text-right">Balance Owed</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filtered.map(doc => (
                <tr key={doc.id} className="hover:bg-stone-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-500 flex items-center justify-center font-black text-sm group-hover:bg-lime-700 group-hover:text-white transition-all">
                        {doc.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-stone-800">{doc.name}</p>
                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">{doc.specialization}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right font-bold text-stone-600">
                    {formatCurrency(doc.totalEarned)}
                  </td>
                  <td className="px-6 py-5 text-right font-bold text-blue-600">
                    {formatCurrency(doc.totalSettled)}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className={`px-3 py-1.5 rounded-xl font-black text-xs ${doc.balance > 0 ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700'}`}>
                      {formatCurrency(doc.balance)}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => { setSelectedDoctor(doc); setHistoryModal(true); }}
                        className="p-2 text-stone-400 hover:text-lime-700 hover:bg-lime-50 rounded-lg transition-all"
                        title="View History"
                      >
                        <History size={16} />
                      </button>
                      <button 
                        onClick={() => { setSelectedDoctor(doc); setSettleModal(true); setAmount(doc.balance > 0 ? doc.balance : ''); }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-xl text-xs font-black hover:bg-black transition-all active:scale-95"
                      >
                        <Send size={12} /> Settle
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="py-20"><EmptyState icon="🩺" title="No doctors found" /></div>}
        </div>
      </Card>

      {/* Settle Modal */}
      {settleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-md p-8 animate-in zoom-in-95">
            <h3 className="text-xl font-black text-stone-800 mb-2">Record Settlement</h3>
            <p className="text-stone-400 text-sm mb-6 font-medium">Paying out earnings to <span className="text-lime-700 font-bold">{selectedDoctor?.name}</span></p>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2">Amount to Pay</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                  <input 
                    type="number"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-4 py-3 font-bold focus:ring-2 focus:ring-lime-100 transition-all outline-none"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {['CASH', 'ONLINE', 'TRANSFER'].map(m => (
                  <button 
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`px-4 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all border-2
                      ${method === m ? 'bg-stone-800 border-stone-800 text-white shadow-lg' : 'bg-white border-stone-100 text-stone-400 hover:border-stone-200'}`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest block mb-2">Internal Remarks</label>
                <textarea 
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-lime-100 transition-all outline-none min-h-[100px]"
                  placeholder="e.g. Paid via UPI / Monthly settlement..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setSettleModal(false)}
                className="flex-1 px-4 py-3 bg-stone-100 text-stone-600 rounded-xl text-sm font-bold hover:bg-stone-200 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={() => settleMutation.mutate({ doctorId: selectedDoctor.id, amount, method, remarks })}
                disabled={!amount || settleMutation.isPending}
                className="flex-1 px-4 py-3 bg-lime-700 text-white rounded-xl text-sm font-black hover:bg-lime-800 transition-all disabled:opacity-50"
              >
                {settleMutation.isPending ? 'Processing...' : 'Confirm Payout'}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* History Modal */}
      {historyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <Card className="w-full max-w-2xl p-0 overflow-hidden animate-in zoom-in-95">
            <div className="px-8 py-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div>
                <h3 className="text-xl font-black text-stone-800">Settlement History</h3>
                <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">Payments made to <span className="text-lime-700">{selectedDoctor?.name}</span></p>
              </div>
              <button onClick={() => setHistoryModal(false)} className="p-2 hover:bg-stone-100 rounded-xl transition-all">
                <X size={20} className="text-stone-400" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {loadingHistory ? (
                <div className="p-20 space-y-4">
                  <Skeleton className="h-12 rounded-xl" />
                  <Skeleton className="h-12 rounded-xl" />
                  <Skeleton className="h-12 rounded-xl" />
                </div>
              ) : history.length === 0 ? (
                <div className="py-20">
                  <EmptyState icon="💸" title="No settlements yet" description="You haven't recorded any payouts for this doctor." />
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-stone-50 text-[10px] uppercase font-black tracking-widest text-stone-400">
                    <tr>
                      <th className="px-8 py-4 text-left">Date</th>
                      <th className="px-8 py-4 text-left">Method</th>
                      <th className="px-8 py-4 text-right">Amount</th>
                      <th className="px-8 py-4 text-left">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {history.map(item => (
                      <tr key={item.id} className="hover:bg-stone-50/30 transition-colors">
                        <td className="px-8 py-4 text-stone-500 font-medium">{formatDate(item.date)}</td>
                        <td className="px-8 py-4">
                          <span className="px-2 py-1 bg-stone-100 text-stone-600 rounded-md text-[10px] font-black uppercase tracking-wider">
                            {item.method}
                          </span>
                        </td>
                        <td className="px-8 py-4 text-right font-black text-stone-800">{formatCurrency(item.amount)}</td>
                        <td className="px-8 py-4 text-stone-400 text-xs italic">{item.remarks || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="p-6 bg-stone-50/50 border-t border-stone-100 flex justify-end">
              <Button onClick={() => setHistoryModal(false)} variant="secondary">Close History</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DoctorRevenue;
