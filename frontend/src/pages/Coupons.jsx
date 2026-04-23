import React, { useState } from 'react';
import api from '../api';
import { useToast } from '../components/Toast';
import {
  Button, Card, Input, Modal, ConfirmModal,
  PageHeader, EmptyState, Skeleton, Badge
} from '../components/UI';
import { Plus, Tag, Trash2, ToggleLeft, ToggleRight, Calendar, Percent, IndianRupee } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const TYPE_COLORS = { FLAT: 'lime', PERCENTAGE: 'sky' };

const CouponForm = ({ coupon, onClose }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    code: coupon?.code || '',
    type: coupon?.type || 'PERCENTAGE',
    value: coupon?.value || '',
    minPurchase: coupon?.minPurchase || 0,
    expiryDate: coupon?.expiryDate ? coupon.expiryDate.split('T')[0] : '',
    isActive: coupon?.isActive !== undefined ? coupon.isActive : true,
    maxUsage: coupon?.maxUsage || '',
  });

  const mutation = useMutation({
    mutationFn: (data) => coupon
      ? api.put(`/coupons/${coupon.id}`, data)
      : api.post('/coupons', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast('success', coupon ? 'Coupon updated!' : 'Coupon created!');
      onClose();
    },
    onError: (err) => toast('error', err.response?.data?.error || 'Failed to save coupon'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.code.trim()) return toast('error', 'Coupon code is required');
    if (!form.value || parseFloat(form.value) <= 0) return toast('error', 'Value must be greater than 0');
    if (form.type === 'PERCENTAGE' && parseFloat(form.value) > 100) return toast('error', 'Percentage cannot exceed 100');
    
    const payload = { 
      ...form, 
      value: parseFloat(form.value), 
      minPurchase: parseFloat(form.minPurchase) || 0,
      maxUsage: form.maxUsage ? parseInt(form.maxUsage) : null
    };
    mutation.mutate(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Code */}
      <div>
        <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1 mb-1 block">Coupon Code</label>
        <input
          type="text"
          required
          value={form.code}
          onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
          placeholder="e.g. SAVE10"
          disabled={!!coupon}
          className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm font-mono font-bold tracking-wider uppercase focus:outline-none focus:border-lime-500 bg-white disabled:bg-stone-50 disabled:text-stone-400"
        />
        {!coupon && <p className="text-[10px] text-stone-400 mt-1 ml-1">Code is permanent and cannot be changed after creation.</p>}
      </div>

      {/* Type + Value */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1 mb-1 block">Discount Type</label>
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
            className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-lime-500 bg-white">
            <option value="PERCENTAGE">Percentage (%)</option>
            <option value="FLAT">Flat Amount (₹)</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1 mb-1 block">
            {form.type === 'PERCENTAGE' ? 'Discount %' : 'Discount ₹'}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
              {form.type === 'PERCENTAGE' ? <Percent size={14} /> : <IndianRupee size={14} />}
            </span>
            <input
              type="number"
              required
              min="0.01"
              max={form.type === 'PERCENTAGE' ? 100 : undefined}
              step="0.01"
              value={form.value}
              onChange={e => setForm({ ...form, value: e.target.value })}
              placeholder={form.type === 'PERCENTAGE' ? '10' : '100'}
              className="w-full border border-stone-200 rounded-xl pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:border-lime-500 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Min Purchase + Expiry */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1 mb-1 block">Min. Purchase (₹)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"><IndianRupee size={14} /></span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.minPurchase}
              onChange={e => setForm({ ...form, minPurchase: e.target.value })}
              placeholder="0"
              className="w-full border border-stone-200 rounded-xl pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:border-lime-500 bg-white"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1 mb-1 block">Expiry Date</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"><Calendar size={14} /></span>
            <input
              type="date"
              value={form.expiryDate}
              onChange={e => setForm({ ...form, expiryDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full border border-stone-200 rounded-xl pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:border-lime-500 bg-white"
            />
          </div>
          <p className="text-[10px] text-stone-400 mt-1 ml-1">Leave blank for no expiry.</p>
        </div>
      </div>

      {/* Max Usage */}
      <div>
        <label className="text-xs font-bold text-stone-500 uppercase tracking-widest ml-1 mb-1 block">Max Usage Limit</label>
        <div className="relative">
          <input
            type="number"
            min="1"
            value={form.maxUsage}
            onChange={e => setForm({ ...form, maxUsage: e.target.value })}
            placeholder="No limit"
            className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-lime-500 bg-white"
          />
        </div>
        <p className="text-[10px] text-stone-400 mt-1 ml-1">Total number of times this coupon can be redeemed across all customers.</p>
      </div>

      {/* Active Toggle */}
      <div className="flex items-center gap-3 bg-stone-50 rounded-xl px-4 py-3">
        <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })}>
          {form.isActive
            ? <ToggleRight size={28} className="text-lime-600" />
            : <ToggleLeft size={28} className="text-stone-300" />}
        </button>
        <div>
          <p className="text-sm font-semibold text-stone-700">
            {form.isActive ? 'Active' : 'Inactive'}
          </p>
          <p className="text-[10px] text-stone-400">
            {form.isActive ? 'Coupon can be used at checkout' : 'Coupon is paused and cannot be applied'}
          </p>
        </div>
      </div>

      {/* Preview */}
      {form.code && form.value && (
        <div className={`rounded-xl p-3 text-center border-2 border-dashed font-mono text-sm font-bold
          ${form.type === 'FLAT' ? 'border-lime-300 bg-lime-50 text-lime-700' : 'border-sky-300 bg-sky-50 text-sky-700'}`}>
          {form.code} → {form.type === 'FLAT' ? `₹${form.value} off` : `${form.value}% off`}
          {parseFloat(form.minPurchase) > 0 && ` on min. ₹${form.minPurchase}`}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button type="submit" className="flex-1" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : coupon ? 'Update Coupon' : 'Create Coupon'}
        </Button>
      </div>
    </form>
  );
};

// ── Main Coupons Page ────────────────────────────────────────────────────────
const Coupons = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['coupons'],
    queryFn: () => api.get('/coupons').then(r => r.data),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => api.put(`/coupons/${id}`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['coupons'] }),
    onError: () => toast('error', 'Failed to toggle coupon'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/coupons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      toast('success', 'Coupon deleted');
      setDeleteTarget(null);
    },
    onError: () => toast('error', 'Delete failed'),
  });

  const openCreate = () => { setEditCoupon(null); setModalOpen(true); };
  const openEdit = (c) => { setEditCoupon(c); setModalOpen(true); };

  const isExpired = (date) => date && new Date(date) < new Date();

  return (
    <div>
      <PageHeader
        title="Coupons & Discounts"
        description="Create and manage promotional discount codes"
        action={<Button onClick={openCreate}><Plus size={16} /> New Coupon</Button>}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
      ) : coupons.length === 0 ? (
        <EmptyState
          icon="🎟️"
          title="No coupons yet"
          description="Create your first discount code to offer deals to customers."
          action={<Button onClick={openCreate}><Plus size={16} /> New Coupon</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map(c => {
            const expired = isExpired(c.expiryDate);
            const active = c.isActive && !expired;
            return (
              <Card key={c.id} className="overflow-hidden">
                {/* Color band */}
                <div className={`h-1.5 w-full ${active ? (c.type === 'FLAT' ? 'bg-lime-500' : 'bg-sky-500') : 'bg-stone-200'}`} />

                <div className="p-5">
                  {/* Code + Status */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${c.type === 'FLAT' ? 'bg-lime-100 text-lime-700' : 'bg-sky-100 text-sky-700'}`}>
                        <Tag size={14} />
                      </div>
                      <span className="font-mono font-black text-stone-800 text-base tracking-wider">{c.code}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {expired && <Badge color="red">Expired</Badge>}
                      {!expired && <Badge color={active ? 'green' : 'stone'}>{active ? 'Active' : 'Paused'}</Badge>}
                      <Badge color={TYPE_COLORS[c.type]}>{c.type === 'FLAT' ? 'Flat' : '%'}</Badge>
                    </div>
                  </div>

                  {/* Value */}
                  <div className="mb-3">
                    <p className={`text-2xl font-black ${active ? (c.type === 'FLAT' ? 'text-lime-700' : 'text-sky-600') : 'text-stone-300'}`}>
                      {c.type === 'FLAT' ? `₹${parseFloat(c.value).toFixed(0)} off` : `${parseFloat(c.value).toFixed(0)}% off`}
                    </p>
                    {parseFloat(c.minPurchase) > 0 && (
                      <p className="text-xs text-stone-400 mt-0.5">Min. purchase: ₹{parseFloat(c.minPurchase).toFixed(0)}</p>
                    )}
                  </div>

                  {/* Expiry */}
                  <div className="flex items-center gap-1.5 text-xs mb-3">
                    <Calendar size={11} className={expired ? 'text-red-400' : 'text-stone-300'} />
                    <span className={expired ? 'text-red-500 font-semibold' : 'text-stone-400'}>
                      {c.expiryDate
                        ? `${expired ? 'Expired' : 'Expires'} ${new Date(c.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                        : 'No expiry'}
                    </span>
                  </div>

                  {/* Usage Tracking */}
                  <div className="mb-4 flex items-center justify-between bg-stone-50 rounded-xl p-3 border border-stone-100">
                    <div>
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Redemptions</p>
                      <p className="text-sm font-black text-stone-700">{c.usageCount || 0} used</p>
                    </div>
                    {c.maxUsage && (
                      <div className="text-right">
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Limit</p>
                        <p className="text-sm font-black text-stone-700">{c.maxUsage}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
                    <button
                      onClick={() => toggleMutation.mutate({ id: c.id, isActive: !c.isActive })}
                      disabled={expired}
                      className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title={c.isActive ? 'Pause coupon' : 'Activate coupon'}>
                      {c.isActive ? <ToggleRight size={18} className="text-lime-600" /> : <ToggleLeft size={18} />}
                      {c.isActive ? 'Active' : 'Paused'}
                    </button>
                    <div className="flex items-center gap-2 ml-auto">
                      <button onClick={() => openEdit(c)}
                        className="text-xs px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-600 font-semibold transition-colors">
                        Edit
                      </button>
                      <button onClick={() => setDeleteTarget(c)}
                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-red-50 hover:text-red-600 text-stone-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editCoupon ? `Edit Coupon — ${editCoupon.code}` : 'Create New Coupon'}
        maxWidth="max-w-lg"
      >
        <CouponForm coupon={editCoupon} onClose={() => setModalOpen(false)} />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget?.id)}
        title="Delete Coupon"
        message={`Are you sure you want to delete "${deleteTarget?.code}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
      />
    </div>
  );
};

export default Coupons;
