import React, { useState, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../AuthContext';
import { useToast } from '../components/Toast';
import {
  Button, Card, Modal, ConfirmModal,
  PageHeader, SearchBar, Badge, EmptyState, Skeleton
} from '../components/UI';
import { Plus, Printer, Package, ShoppingCart, Banknote, Smartphone, TrendingUp, FileText, AlertTriangle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import InvoiceForm from '../components/Invoice/InvoiceForm';
import InvoiceDetailDrawer from '../components/Invoice/InvoiceDetailDrawer';

const STATUS_COLORS = { Paid: 'green', Draft: 'amber', Cancelled: 'red' };

const PaymentBadge = ({ mode }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wide
    ${mode === 'ONLINE' ? 'bg-blue-50 text-blue-600' : 'bg-stone-100 text-stone-500'}`}>
    {mode === 'ONLINE' ? <Smartphone size={9} /> : <Banknote size={9} />}
    {mode === 'ONLINE' ? 'Online' : 'Cash'}
  </span>
);

const Invoices = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices', search, statusFilter],
    queryFn: async () => {
      const res = await api.get('/invoices', { params: { search, status: statusFilter } });
      return res.data?.invoices || [];
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => api.put(`/invoices/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast('success', 'Invoice updated. Inventory adjusted if needed.');
      setSelectedInvoice(null);
    },
    onError: (err) => toast('error', err.response?.data?.error || 'Update failed')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/invoices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast('success', 'Draft invoice deleted.');
      setDeleteTarget(null);
    },
    onError: (err) => toast('error', err.response?.data?.error || 'Delete failed')
  });

  const updateStatus = (id, status) => statusMutation.mutate({ id, status });

  const filtered = (Array.isArray(invoices) ? invoices : []).filter(inv => {
    const matchSearch = (inv.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (inv.invoiceNumber || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchSearch && matchStatus;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // KPI summary computed client-side from fetched data
  const invoicesArr = Array.isArray(invoices) ? invoices : [];
  const totalRevenue = invoicesArr.filter(i => i.status === 'Paid').reduce((s, i) => s + parseFloat(i.total || 0), 0);
  const totalItems = invoicesArr.reduce((s, i) => s + (i.InvoiceItems?.length || 0), 0);
  const draftCount = invoicesArr.filter(i => i.status === 'Draft').length;

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div>
      <PageHeader
        title="Invoices & Inventory"
        description="Billing workflow with automatic stock management"
        action={<Button onClick={() => setIsModalOpen(true)}><Plus size={16} /> Create Invoice</Button>}
      />

      {/* KPI Summary Bar */}
      {!isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { icon: <FileText size={15} />, label: 'Total Invoices', value: invoices.length, color: 'stone' },
            { icon: <TrendingUp size={15} />, label: 'Revenue (Paid)', value: `₹${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, color: 'lime' },
            { icon: <Package size={15} />, label: 'Line Items Billed', value: totalItems, color: 'sky' },
            { icon: <AlertTriangle size={15} />, label: 'Pending Drafts', value: draftCount, color: draftCount > 0 ? 'amber' : 'stone' },
          ].map(({ icon, label, value, color }) => (
            <div key={label} className="bg-white border border-stone-100 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
              <div className={`p-2 rounded-xl bg-${color}-50 text-${color}-600`}>{icon}</div>
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">{label}</p>
                <p className="text-sm font-bold text-stone-800">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by customer or invoice #" />
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {['all', 'Paid', 'Draft', 'Cancelled'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border whitespace-nowrap transition-all
                ${statusFilter === s ? 'bg-lime-700 text-white border-lime-700' : 'bg-white border-stone-200 text-stone-500 hover:border-lime-400'}`}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <Card className="overflow-hidden">
          <div className="divide-y divide-stone-100">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20 ml-auto" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-14 rounded-lg" />
              </div>
            ))}
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState icon="📄" title="No invoices found"
          description="Try a different search or create your first invoice."
          action={<Button onClick={() => setIsModalOpen(true)}><Plus size={16} /> Create Invoice</Button>} />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-stone-100 bg-stone-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Invoice #</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Items</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Total</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Payment</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-stone-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filtered.map(inv => (
                  <tr key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className="hover:bg-stone-50/60 cursor-pointer transition-colors group">
                    <td className="px-6 py-4 font-mono font-bold text-stone-700 text-xs">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4 text-xs text-stone-500 whitespace-nowrap">{formatDate(inv.createdAt)}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-stone-800">{inv.customerName}</p>
                      {inv.phone && <p className="text-xs text-stone-400">{inv.phone}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-1 overflow-hidden">
                        {inv.InvoiceItems?.map((item, idx) => (
                          <span key={idx} title={item.itemName}
                            className={`inline-flex items-center justify-center h-6 px-2 text-[10px] font-bold rounded-md border border-white ring-2 ring-stone-50
                              ${item.productId ? 'bg-lime-100 text-lime-700' : 'bg-sky-100 text-sky-700'}`}>
                            {item.productId ? <Package size={10} className="mr-1" /> : <ShoppingCart size={10} className="mr-1" />}
                            {item.quantity}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="text-base font-bold text-lime-700">₹{parseFloat(inv.total).toFixed(2)}</span>
                        {parseFloat(inv.discountAmount) > 0 && (
                          <p className="text-[10px] text-green-600 font-semibold">−₹{parseFloat(inv.discountAmount).toFixed(2)} off</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <PaymentBadge mode={inv.paymentMode || 'CASH'} />
                      {inv.utrNumber && <p className="text-[10px] text-stone-400 mt-0.5 font-mono">{inv.utrNumber}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <Badge color={STATUS_COLORS[inv.status] || 'stone'}>{inv.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <select
                          value={inv.status}
                          onChange={(e) => updateStatus(inv.id, e.target.value)}
                          className="bg-white border border-stone-200 text-xs rounded-lg px-2 py-1 focus:ring-2 focus:ring-lime-100 outline-none text-stone-700">
                          <option value="Draft">Draft</option>
                          <option value="Paid">Paid</option>
                          <option value="Cancelled">Cancel</option>
                        </select>
                        <Link to={`/print-invoice/${inv.id}`} target="_blank"
                          className="bg-stone-100 hover:bg-lime-700 hover:text-white text-stone-600 p-2 rounded-lg transition-all">
                          <Printer size={14} />
                        </Link>
                        {inv.status === 'Draft' && (
                          <button onClick={() => setDeleteTarget(inv)}
                            className="bg-stone-100 hover:bg-red-500 hover:text-white text-stone-400 p-2 rounded-lg transition-all">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create Invoice Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Generate Invoice & Update Inventory" maxWidth="max-w-2xl">
        <InvoiceForm onClose={() => setIsModalOpen(false)} />
      </Modal>

      {/* Invoice Detail Drawer */}
      <InvoiceDetailDrawer
        invoice={selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        onStatusChange={updateStatus}
        isUpdating={statusMutation.isPending}
      />

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget?.id)}
        title="Delete Draft Invoice"
        message={`Are you sure you want to delete invoice ${deleteTarget?.invoiceNumber}? This will restore any deducted stock.`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  );
};

export default Invoices;
