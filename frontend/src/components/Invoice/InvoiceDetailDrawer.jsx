import React from 'react';
import { X, Printer, Package, ShoppingCart, Banknote, Smartphone, Tag, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../UI';

const STATUS_COLORS = { Paid: 'green', Draft: 'amber', Cancelled: 'red' };

const InvoiceDetailDrawer = ({ invoice, onClose, onStatusChange, isUpdating }) => {
  if (!invoice) return null;

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const discount = parseFloat(invoice.discountAmount) || 0;
  const subtotal = parseFloat(invoice.subtotal) || 0;
  const tax = parseFloat(invoice.tax) || 0;
  const total = parseFloat(invoice.total) || 0;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100 bg-stone-50">
          <div>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-0.5">Invoice Details</p>
            <h2 className="text-lg font-black text-stone-800 font-mono">{invoice.invoiceNumber}</h2>
          </div>
          <div className="flex items-center gap-3">
            <Link to={`/print-invoice/${invoice.id}`} target="_blank"
              className="flex items-center gap-1.5 bg-lime-700 hover:bg-lime-600 text-white px-3 py-2 rounded-xl text-xs font-bold transition-colors">
              <Printer size={13} /> Print
            </Link>
            <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-xl transition-colors">
              <X size={18} className="text-stone-500" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* Customer + Status */}
          <div className="bg-stone-50 rounded-2xl p-4 flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Billed To</p>
              <p className="text-base font-bold text-stone-800">{invoice.customerName}</p>
              {invoice.phone && <p className="text-sm text-stone-500 mt-0.5">{invoice.phone}</p>}
              {invoice.Doctor && (
                <p className="text-xs text-lime-700 font-bold mt-2 flex items-center gap-1">
                  🩺 Dr. {invoice.Doctor.name}
                </p>
              )}
              <p className="text-xs text-stone-400 mt-1">{formatDate(invoice.createdAt)}</p>
            </div>
            <Badge color={STATUS_COLORS[invoice.status] || 'stone'} className="shrink-0">{invoice.status}</Badge>
          </div>

          {/* Payment Info */}
          <div className="bg-white border border-stone-100 rounded-2xl p-4">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Payment Details</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-stone-500">Method</span>
                <span className={`inline-flex items-center gap-1.5 font-semibold
                  ${invoice.paymentMode === 'ONLINE' ? 'text-blue-600' : 'text-stone-700'}`}>
                  {invoice.paymentMode === 'ONLINE' ? <Smartphone size={13} /> : <Banknote size={13} />}
                  {invoice.paymentMode === 'ONLINE' ? 'Online / UPI' : 'Cash'}
                </span>
              </div>
              {invoice.utrNumber && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-500">UTR / Reference</span>
                  <span className="font-mono text-xs font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded-lg">{invoice.utrNumber}</span>
                </div>
              )}
              {invoice.couponCode && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-stone-500 flex items-center gap-1"><Tag size={11} /> Coupon</span>
                  <span className="text-green-700 font-bold flex items-center gap-1">
                    <CheckCircle size={11} /> {invoice.couponCode}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Line Items</p>
            <div className="space-y-2">
              {invoice.InvoiceItems?.map((item) => (
                <div key={item.id} className="flex items-center justify-between bg-stone-50 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg ${item.productId ? 'bg-lime-100 text-lime-700' : 'bg-sky-100 text-sky-700'}`}>
                      {item.productId ? <Package size={12} /> : <ShoppingCart size={12} />}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-stone-800">{item.itemName}</p>
                      <p className="text-xs text-stone-400">{item.quantity} × ₹{parseFloat(item.price).toFixed(2)}</p>
                    </div>
                  </div>
                  <span className="font-bold text-stone-800 text-sm">₹{parseFloat(item.total).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-stone-50 border border-stone-100 rounded-2xl p-4 space-y-2">
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Summary</p>
            <div className="flex justify-between text-sm text-stone-500"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
            {parseFloat(invoice.doctorCharges) > 0 && (
              <div className="flex justify-between text-sm text-stone-500 italic">
                <span>Doctor Charges</span>
                <span>₹{parseFloat(invoice.doctorCharges).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-stone-500"><span>Tax (5%)</span><span>₹{tax.toFixed(2)}</span></div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600 font-semibold">
                <span>Discount {invoice.discountType === 'PERCENTAGE' ? `(${invoice.discountType})` : ''}</span>
                <span>−₹{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t border-stone-200 pt-2 flex justify-between items-center">
              <span className="font-bold text-stone-700">Grand Total</span>
              <span className="text-xl font-black text-lime-700">₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Status Change */}
          {invoice.status !== 'Paid' && (
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Update Status</p>
              <div className="flex gap-2 flex-wrap">
                {['Draft', 'Paid', 'Cancelled'].filter(s => s !== invoice.status).map(s => (
                  <button key={s} disabled={isUpdating}
                    onClick={() => onStatusChange(invoice.id, s)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all disabled:opacity-50
                      ${s === 'Paid' ? 'border-lime-600 bg-lime-50 text-lime-700 hover:bg-lime-100'
                        : s === 'Cancelled' ? 'border-red-300 bg-red-50 text-red-600 hover:bg-red-100'
                        : 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'}`}>
                    {isUpdating ? '...' : `Mark as ${s}`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default InvoiceDetailDrawer;
