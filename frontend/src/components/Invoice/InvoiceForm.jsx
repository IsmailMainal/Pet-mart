import React, { useState } from 'react';
import api from '../../api';
import { useToast } from '../Toast';
import { Button, Input, Skeleton, useLoadingMessage } from '../UI';
import { PlusCircle, MinusCircle, Tag, CheckCircle, CreditCard, Smartphone } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const InvoiceForm = ({ onClose }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ customerName: '', phone: '', status: 'Paid', doctorId: '', doctorCharges: 0 });
  const [items, setItems] = useState([{ itemName: '', quantity: 1, price: 0, productId: null }]);
  const loadingMsg = useLoadingMessage();

  // Discount & Payment state
  const [discountType, setDiscountType] = useState('');      // '' | 'FLAT' | 'PERCENTAGE'
  const [discountValue, setDiscountValue] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(null);  // { code, discountAmount, type }
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [utrNumber, setUtrNumber] = useState('');

  const { data: catalog = { products: [], services: [] }, isLoading: loading } = useQuery({
    queryKey: ['catalog'],
    queryFn: async () => {
      const [prodRes, servRes] = await Promise.all([api.get('/products'), api.get('/services')]);
      return { products: prodRes.data, services: servRes.data };
    }
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.get('/customers').then(r => r.data)
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => api.get('/doctors').then(r => r.data)
  });

  const { products, services } = catalog;

  const mutation = useMutation({
    mutationFn: (data) => api.post('/invoices', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast('success', 'Invoice generated');
      onClose();
    },
    onError: (err) => toast('error', err.response?.data?.error || 'Failed to generate invoice')
  });

  const handleAddItem = () => setItems([...items, { itemName: '', quantity: 1, price: 0, productId: null }]);
  const handleRemoveItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const handleItemSelect = (idx, type, id) => {
    const next = [...items];
    if (type === 'product') {
      const p = products.find(x => x.id === parseInt(id));
      if (p) next[idx] = { itemName: p.name, quantity: 1, price: parseFloat(p.price), productId: p.id };
    } else if (type === 'service') {
      const s = services.find(x => x.id === parseInt(id));
      if (s) next[idx] = { itemName: s.name, quantity: 1, price: parseFloat(s.price), productId: null, serviceId: s.id };
    }
    setItems(next);
  };

  const handleItemChange = (idx, field, val) => {
    const next = [...items];
    next[idx][field] = val;
    setItems(next);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0) + (parseFloat(form.doctorCharges) || 0);
  const tax = subtotal * 0.05;

  // Compute discount
  let manualDiscount = 0;
  if (discountType === 'FLAT') manualDiscount = parseFloat(discountValue) || 0;
  if (discountType === 'PERCENTAGE') manualDiscount = (subtotal * (parseFloat(discountValue) || 0)) / 100;
  const couponDiscount = couponApplied ? couponApplied.discountAmount : 0;
  const totalDiscount = Math.min(manualDiscount + couponDiscount, subtotal + tax);
  const total = Math.max(0, subtotal + tax - totalDiscount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await api.post('/coupons/validate', { code: couponCode, amount: subtotal });
      setCouponApplied(res.data);
      toast('success', `Coupon "${res.data.code}" applied! −₹${res.data.discountAmount.toFixed(2)}`);
    } catch (err) {
      toast('error', err.response?.data?.error || 'Invalid coupon');
      setCouponApplied(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(null);
    setCouponCode('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (items.some(i => !i.itemName || i.price < 0)) {
      return toast('error', 'Invalid items', 'Please check all item names and prices.');
    }
    if (paymentMode === 'ONLINE' && !utrNumber.trim()) {
      return toast('error', 'UTR Required', 'Please enter the UTR number for online payment.');
    }

    mutation.mutate({
      ...form,
      subtotal,
      tax,
      total,
      doctorId: form.doctorId || null,
      doctorCharges: parseFloat(form.doctorCharges) || 0,
      discountAmount: totalDiscount || 0,
      discountType: discountType || null,
      couponCode: couponApplied?.code || null,
      paymentMode,
      utrNumber: paymentMode === 'ONLINE' ? utrNumber : null,
      items: items.map(i => ({ ...i, total: i.quantity * i.price })),
      userId: form.userId || null
    });
  };

  if (loading) return <div className="space-y-4"><Skeleton className="h-10 w-full"/><Skeleton className="h-32 w-full"/><Skeleton className="h-10 w-full"/></div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Customer Info */}
      <div className="grid grid-cols-2 gap-4">
        <Input label="Customer Name" required value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} placeholder="e.g. Jane Smith" />
        <Input label="Phone Number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="e.g. +91 98765 43210" />
      </div>

      <div>
        <label className="text-sm font-medium text-stone-700">Link to Customer Account (Optional)</label>
        <select
          value={form.userId || ''}
          onChange={e => {
            const uId = e.target.value;
            const u = customers.find(x => x.id === parseInt(uId));
            setForm({ ...form, userId: uId || null, customerName: u ? u.name : form.customerName, phone: u ? u.phone || form.phone : form.phone });
          }}
          className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:border-lime-600 outline-none mt-1"
        >
          <option value="">-- Guest Customer --</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
        </select>
      </div>

      {/* Doctor Selection & Charges */}
      <div className="bg-lime-50/50 border border-lime-100 rounded-2xl p-4 space-y-3">
        <label className="text-sm font-medium text-stone-700 flex items-center gap-2">
          🩺 Doctor Consultation (Optional)
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-stone-400 ml-1">Select Doctor</label>
            <select
              value={form.doctorId || ''}
              onChange={e => setForm({ ...form, doctorId: e.target.value || null })}
              className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:border-lime-600 outline-none mt-1"
            >
              <option value="">-- No Doctor --</option>
              {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-stone-400 ml-1">Doctor Charges (₹)</label>
            <Input 
              type="number" 
              min="0" 
              placeholder="0.00" 
              value={form.doctorCharges} 
              onChange={e => setForm({ ...form, doctorCharges: parseFloat(e.target.value) || 0 })} 
              noLabel
            />
          </div>
        </div>
      </div>

      {/* Items */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-stone-700">Invoice Items</label>
          <button type="button" onClick={handleAddItem} className="text-lime-700 hover:text-lime-600 text-xs font-bold flex items-center gap-1">
            <PlusCircle size={14} /> Add Item
          </button>
        </div>
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div key={idx} className="bg-stone-50/50 border border-stone-100 rounded-2xl p-4">
              <div className="grid grid-cols-12 gap-3 mb-3">
                <div className="col-span-12 sm:col-span-6">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-stone-400 ml-1">Quick Select</label>
                  <select
                    onChange={(e) => { const [type, id] = e.target.value.split(':'); if (type && id) handleItemSelect(idx, type, id); }}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-lime-600 bg-white"
                  >
                    <option value="">-- Choose from Catalog --</option>
                    <optgroup label="Products (Deducts Stock)">
                      {products.map(p => (
                        <option key={`p-${p.id}`} value={`product:${p.id}`} disabled={p.quantity <= 0}>
                          {p.name} (₹{p.price}) — Stock: {p.quantity}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Services">
                      {services.map(s => (
                        <option key={`s-${s.id}`} value={`service:${s.id}`}>{s.name} (₹{s.price})</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div className="col-span-12 sm:col-span-6 flex items-end">
                  <input required type="text" placeholder="Item/Service name"
                    value={item.itemName}
                    onChange={e => handleItemChange(idx, 'itemName', e.target.value)}
                    disabled={!!item.productId}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-lime-600 bg-white disabled:bg-stone-50 disabled:text-stone-500" />
                </div>
              </div>
              <div className="flex gap-3 items-center">
                <div className="flex-1">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-stone-400 ml-1">Price (₹)</label>
                  <input required type="number" step="0.01" min="0" placeholder="Price" value={item.price} onChange={e => handleItemChange(idx, 'price', parseFloat(e.target.value) || 0)}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-lime-600 bg-white" />
                </div>
                <div className="w-24">
                  <label className="text-[10px] uppercase tracking-wider font-bold text-stone-400 ml-1">Quantity</label>
                  <input required type="number" min="1" placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                    className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-lime-600 bg-white" />
                  {item.productId && (() => {
                    const p = products.find(x => x.id === item.productId);
                    const remaining = p ? p.quantity - item.quantity : null;
                    if (p && remaining !== null && remaining >= 0 && remaining < Math.ceil(p.quantity * 0.3)) {
                      return (
                        <p className="text-[10px] text-amber-600 font-semibold mt-1 ml-1">
                          ⚠️ {remaining} left after
                        </p>
                      );
                    }
                    return null;
                  })()}
                </div>
                <div className="pt-4">
                  <button type="button" onClick={() => handleRemoveItem(idx)} disabled={items.length === 1}
                    className="p-2 text-stone-300 hover:text-red-500 disabled:opacity-0 transition-colors">
                    <MinusCircle size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discount Section */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm">
          <Tag size={15} /> Discount & Coupon
        </div>

        {/* Manual Discount */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-stone-400 ml-1">Discount Type</label>
            <select value={discountType} onChange={e => { setDiscountType(e.target.value); setDiscountValue(''); }}
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 bg-white">
              <option value="">None</option>
              <option value="FLAT">Flat (₹)</option>
              <option value="PERCENTAGE">Percentage (%)</option>
            </select>
          </div>
          {discountType && (
            <div>
              <label className="text-[10px] uppercase tracking-wider font-bold text-stone-400 ml-1">
                {discountType === 'FLAT' ? 'Amount (₹)' : 'Percentage (%)'}
              </label>
              <input type="number" min="0" max={discountType === 'PERCENTAGE' ? 100 : undefined}
                value={discountValue} onChange={e => setDiscountValue(e.target.value)}
                placeholder={discountType === 'FLAT' ? '0.00' : '0'}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 bg-white" />
            </div>
          )}
        </div>

        {/* Coupon Code */}
        {!couponApplied ? (
          <div className="flex gap-2">
            <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              className="flex-1 border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500 bg-white uppercase tracking-wider" />
            <button type="button" onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50">
              {couponLoading ? '...' : 'Apply'}
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
            <div className="flex items-center gap-2 text-green-700 text-sm font-semibold">
              <CheckCircle size={15} />
              {couponApplied.code} — −₹{couponApplied.discountAmount.toFixed(2)}
            </div>
            <button type="button" onClick={handleRemoveCoupon} className="text-xs text-red-500 hover:text-red-700">Remove</button>
          </div>
        )}
      </div>

      {/* Payment Mode */}
      <div className="bg-stone-50 border border-stone-100 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2 text-stone-700 font-semibold text-sm">
          <CreditCard size={15} /> Payment Method
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={() => setPaymentMode('CASH')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all
              ${paymentMode === 'CASH' ? 'border-lime-600 bg-lime-50 text-lime-700' : 'border-stone-200 bg-white text-stone-500 hover:border-lime-300'}`}>
            💵 Cash
          </button>
          <button type="button" onClick={() => setPaymentMode('ONLINE')}
            className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-all
              ${paymentMode === 'ONLINE' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-stone-200 bg-white text-stone-500 hover:border-blue-300'}`}>
            <Smartphone size={15} /> Online / UPI
          </button>
        </div>
        {paymentMode === 'ONLINE' && (
          <div>
            <label className="text-[10px] uppercase tracking-wider font-bold text-stone-400 ml-1">UTR / Reference Number *</label>
            <input type="text" required value={utrNumber} onChange={e => setUtrNumber(e.target.value)}
              placeholder="e.g. 123456789012"
              className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white" />
          </div>
        )}
      </div>

      {/* Totals */}
      <div className="bg-stone-50 border border-stone-100 rounded-2xl p-4">
        <div className="flex justify-between text-xs text-stone-400 mb-1"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between text-xs text-stone-400 mb-1"><span>Tax (5%)</span><span>₹{tax.toFixed(2)}</span></div>
        {totalDiscount > 0 && (
          <div className="flex justify-between text-xs text-green-600 mb-1 font-semibold">
            <span>Discount</span><span>−₹{totalDiscount.toFixed(2)}</span>
          </div>
        )}
        <div className="border-t border-stone-200 mt-2 pt-2 flex justify-between items-end">
          <span className="text-sm font-bold text-stone-700">Grand Total</span>
          <span className="text-xl font-bold text-lime-700">₹{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button type="submit" className="flex-1" disabled={mutation.isPending}>
          {mutation.isPending ? loadingMsg : 'Save & Deduct Stock'}
        </Button>
      </div>
    </form>
  );
};

export default InvoiceForm;
