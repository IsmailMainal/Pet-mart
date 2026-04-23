import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useToast } from '../Toast';
import { Button, Input, Skeleton, useLoadingMessage, Badge } from '../UI';
import { PlusCircle, MinusCircle, Tag, CheckCircle, CreditCard, Smartphone, Stethoscope, Scissors, IndianRupee } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatCurrency } from '../../utils/format';

const InvoiceForm = ({ invoice, onClose }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const loadingMsg = useLoadingMessage();

  const [form, setForm] = useState({ 
    customerName: invoice?.customerName || '', 
    phone: invoice?.phone || '', 
    status: invoice?.status || 'Paid', 
    doctorId: invoice?.doctorId || '', 
    doctorCharges: invoice?.doctorCharges || 0,
    userId: invoice?.userId || null
  });

  const [items, setItems] = useState(
    invoice?.InvoiceItems?.map(item => ({
      itemName: item.itemName,
      quantity: item.quantity,
      price: item.price,
      productId: item.productId,
      serviceId: item.serviceId || null
    })) || [{ itemName: '', quantity: 1, price: 0, productId: null }]
  );

  const [discountAmount, setDiscountAmount] = useState(invoice?.discountAmount || 0);
  const [paymentMode, setPaymentMode] = useState(invoice?.paymentMode || 'CASH');
  const [utrNumber, setUtrNumber] = useState(invoice?.utrNumber || '');

  const { data: catalog = { products: [], services: [] }, isLoading: loading } = useQuery({
    queryKey: ['catalog'],
    queryFn: async () => {
      const [prodRes, servRes] = await Promise.all([api.get('/products'), api.get('/services')]);
      return { 
        products: prodRes.data?.products || (Array.isArray(prodRes.data) ? prodRes.data : []), 
        services: servRes.data?.services || (Array.isArray(servRes.data) ? servRes.data : [])
      };
    }
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.get('/customers').then(r => r.data)
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => api.get('/doctors').then(r => r.data.doctors || r.data)
  });

  const { products, services } = catalog;

  const mutation = useMutation({
    mutationFn: (data) => {
      if (invoice) return api.put(`/invoices/${invoice.id}`, data);
      return api.post('/invoices', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast('success', invoice ? 'Invoice updated' : 'Invoice generated');
      onClose();
    },
    onError: (err) => toast('error', err.response?.data?.error || 'Failed to save invoice')
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

  const itemsSubtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const consultationSubtotal = parseFloat(form.doctorCharges) || 0;
  const subtotal = itemsSubtotal + consultationSubtotal;
  const tax = subtotal * 0.05;
  const total = Math.max(0, subtotal + tax - parseFloat(discountAmount || 0));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (items.some(i => !i.itemName || i.price < 0)) return toast('error', 'Invalid items');

    mutation.mutate({
      ...form,
      items,
      discountAmount: parseFloat(discountAmount) || 0,
      paymentMode,
      utrNumber: paymentMode === 'ONLINE' ? utrNumber : null,
      subtotal,
      tax,
      total
    });
  };

  if (loading) return <div className="space-y-4"><Skeleton className="h-10 w-full"/><Skeleton className="h-32 w-full"/><Skeleton className="h-10 w-full"/></div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Customer Name" required value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} placeholder="e.g. Jane Smith" />
        <Input label="Phone Number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="e.g. 9876543210" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Link Account</label>
          <select value={form.userId || ''} onChange={e => setForm({...form, userId: e.target.value || null})}
            className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm bg-stone-50 mt-1.5 focus:border-lime-600 outline-none transition-all">
            <option value="">-- Guest --</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-stone-400 uppercase tracking-widest ml-1">Attending Doctor</label>
          <select value={form.doctorId || ''} onChange={e => setForm({...form, doctorId: e.target.value || null})}
            className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm bg-stone-50 mt-1.5 focus:border-lime-600 outline-none transition-all">
            <option value="">-- None --</option>
            {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-stone-50/50 rounded-[2rem] p-6 border border-stone-100">
        <div className="flex items-center justify-between mb-4 px-2">
          <label className="text-sm font-black text-stone-800">Billing Items</label>
          <button type="button" onClick={handleAddItem} className="text-lime-700 text-xs font-bold flex items-center gap-1.5 hover:text-lime-600 transition-colors">
            <PlusCircle size={16} /> Add Item
          </button>
        </div>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 space-y-3">
              <select onChange={(e) => { const [t, id] = e.target.value.split(':'); if (t && id) handleItemSelect(idx, t, id); }}
                className="w-full border border-stone-100 rounded-xl px-3 py-2 text-xs bg-stone-50 outline-none focus:border-lime-500">
                <option value="">-- Select from Catalog --</option>
                <optgroup label="Products">
                  {products.map(p => <option key={`p-${p.id}`} value={`product:${p.id}`}>{p.name} (Stock: {p.quantity})</option>)}
                </optgroup>
                <optgroup label="Services">
                  {services.map(s => <option key={`s-${s.id}`} value={`service:${s.id}`}>{s.name}</option>)}
                </optgroup>
              </select>
              <div className="flex gap-2">
                <input required placeholder="Item name" value={item.itemName} onChange={e => handleItemChange(idx, 'itemName', e.target.value)}
                  className="flex-1 border border-stone-100 rounded-xl px-3 py-2 text-xs outline-none focus:border-lime-500" />
                <input required type="number" placeholder="Price" value={item.price} onChange={e => handleItemChange(idx, 'price', parseFloat(e.target.value) || 0)}
                  className="w-24 border border-stone-100 rounded-xl px-3 py-2 text-xs outline-none focus:border-lime-500" />
                <input required type="number" placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 0)}
                  className="w-16 border border-stone-100 rounded-xl px-3 py-2 text-xs outline-none focus:border-lime-500 text-center" />
                <button type="button" onClick={() => handleRemoveItem(idx)} className="text-red-300 hover:text-red-500 transition-colors p-1"><MinusCircle size={18}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-stone-50 p-5 rounded-[2rem] border border-stone-100">
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4 ml-1">Payment & Discounts</h4>
            <div className="space-y-3">
              <Input label="Doctor Consultation Fee" type="number" value={form.doctorCharges} onChange={e => setForm({...form, doctorCharges: parseFloat(e.target.value) || 0})} icon={<Stethoscope size={16}/>} />
              <Input label="Special Discount" type="number" value={discountAmount} onChange={e => setDiscountAmount(e.target.value)} icon={<Tag size={16}/>} />
            </div>
            
            <div className="flex gap-3 mt-6">
              <button type="button" onClick={() => setPaymentMode('CASH')} className={`flex-1 py-3 rounded-2xl border-2 text-xs font-black transition-all ${paymentMode === 'CASH' ? 'border-lime-600 bg-lime-50 text-lime-700 shadow-lg shadow-lime-100' : 'border-stone-100 text-stone-400 hover:border-stone-200'}`}>
                <div className="flex flex-col items-center gap-1"><CreditCard size={16}/> CASH</div>
              </button>
              <button type="button" onClick={() => setPaymentMode('ONLINE')} className={`flex-1 py-3 rounded-2xl border-2 text-xs font-black transition-all ${paymentMode === 'ONLINE' ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-lg shadow-blue-100' : 'border-stone-100 text-stone-400 hover:border-stone-200'}`}>
                <div className="flex flex-col items-center gap-1"><Smartphone size={16}/> ONLINE</div>
              </button>
            </div>
            {paymentMode === 'ONLINE' && <div className="mt-4 slide-up"><Input placeholder="UPI / UTR Number" value={utrNumber} onChange={e => setUtrNumber(e.target.value)} /></div>}
          </div>
        </div>

        <div className="bg-lime-900 text-white p-8 rounded-[2.5rem] shadow-xl shadow-lime-100 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><IndianRupee size={120} /></div>
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-center text-lime-300/60 border-b border-lime-800 pb-4">
              <span className="text-xs font-bold uppercase tracking-widest">Billing Summary</span>
              <Badge color="green" variant="outline" className="border-lime-700 text-lime-300">GST 5%</Badge>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="opacity-60 font-medium">Items Total</span>
                <span className="font-bold">{formatCurrency(itemsSubtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-60 font-medium">Consultation Fee</span>
                <span className="font-bold">{formatCurrency(consultationSubtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-60 font-medium">Estimated Tax</span>
                <span className="font-bold">{formatCurrency(tax)}</span>
              </div>
              {parseFloat(discountAmount) > 0 && (
                <div className="flex justify-between text-sm text-red-300">
                  <span className="opacity-80 font-medium italic">Applied Discount</span>
                  <span className="font-bold">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-lime-800 flex justify-between items-end">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest opacity-40 mb-1">Total Payable</p>
                <p className="text-4xl font-black">{formatCurrency(total)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="button" variant="secondary" className="flex-1 py-4" onClick={onClose}>Cancel</Button>
        <Button type="submit" className="flex-1 py-4 text-base" disabled={mutation.isPending}>
          {mutation.isPending ? 'Processing...' : (invoice ? 'Update Invoice' : 'Confirm & Generate')}
        </Button>
      </div>
    </form>
  );
};

export default InvoiceForm;
