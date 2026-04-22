import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { PawPrint, Phone, Mail, MapPin, Globe, Printer, Banknote, Smartphone } from 'lucide-react';

const PrintInvoice = () => {
  const { id } = useParams();

  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => api.get(`/invoices/${id}`).then(r => r.data),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (invoice) {
      const timer = setTimeout(() => window.print(), 600);
      return () => clearTimeout(timer);
    }
  }, [invoice]);

  if (isLoading || !invoice) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-lime-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-stone-500 font-medium animate-pulse">Preparing your document...</p>
      </div>
    </div>
  );

  const formattedDate = new Date(invoice.createdAt).toLocaleDateString('en-IN', {
    month: 'long', day: 'numeric', year: 'numeric'
  });

  const discount = parseFloat(invoice.discountAmount) || 0;
  const subtotal = parseFloat(invoice.subtotal) || 0;
  const tax = parseFloat(invoice.tax) || 0;
  const total = parseFloat(invoice.total) || 0;

  return (
    <div className="bg-white text-stone-900 min-h-screen p-0 sm:p-10 font-sans print:p-0">
      <div className="max-w-[800px] mx-auto bg-white p-8 sm:p-16 shadow-2xl print:shadow-none print:max-w-none print:p-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between gap-8 mb-16 pb-8 border-b-2 border-stone-100">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-lime-700 p-2 rounded-2xl">
                <PawPrint size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-stone-800 tracking-tight leading-none">Pets Mart</h1>
                <p className="text-lime-700 text-xs font-bold uppercase tracking-[0.2em] mt-1">Premium Care & Supplies</p>
              </div>
            </div>
            <div className="space-y-1 text-sm text-stone-400">
              <div className="flex items-center gap-2"><MapPin size={12}/> 123 Pet Lane, Animal City, NY 10001</div>
              <div className="flex items-center gap-2"><Phone size={12}/> (555) 123-4567</div>
              <div className="flex items-center gap-2"><Mail size={12}/> hello@petsmart.com</div>
              <div className="flex items-center gap-2"><Globe size={12}/> www.petsmart.com</div>
            </div>
          </div>

          <div className="text-left md:text-right">
            <h2 className="text-5xl font-black text-stone-100 uppercase leading-none mb-2 select-none">Invoice</h2>
            <div className="space-y-1">
              <p className="text-sm text-stone-400 font-medium">Invoice Number</p>
              <p className="text-xl font-bold text-stone-800">{invoice.invoiceNumber}</p>
              <div className="pt-2">
                <p className="text-sm text-stone-400 font-medium">Date Issued</p>
                <p className="text-stone-800 font-semibold">{formattedDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Client + Payment Info */}
        <div className="grid grid-cols-2 gap-12 mb-16">
          <div>
            <h3 className="text-xs font-black text-stone-300 uppercase tracking-widest mb-4">Billed To</h3>
            <p className="text-2xl font-bold text-stone-800 mb-1">{invoice.customerName}</p>
            {invoice.phone && <p className="text-stone-500 font-medium mb-1">{invoice.phone}</p>}
            {invoice.Doctor && (
              <p className="text-sm text-lime-700 font-bold mt-2">
                Consulting Doctor: Dr. {invoice.Doctor.name}
              </p>
            )}
          </div>
          <div className="bg-stone-50 rounded-3xl p-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-stone-400 font-medium">Payment Status</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                ${invoice.status === 'Paid' ? 'bg-lime-100 text-lime-700'
                  : invoice.status === 'Draft' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                {invoice.status}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-stone-400 font-medium">Payment Method</span>
              <span className={`text-sm font-bold flex items-center gap-1.5
                ${invoice.paymentMode === 'ONLINE' ? 'text-blue-600' : 'text-stone-700'}`}>
                {invoice.paymentMode === 'ONLINE' ? <Smartphone size={13}/> : <Banknote size={13}/>}
                {invoice.paymentMode === 'ONLINE' ? 'Online / UPI' : 'Cash'}
              </span>
            </div>
            {invoice.utrNumber && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-400 font-medium">UTR / Ref No.</span>
                <span className="text-xs font-mono font-bold text-stone-800 bg-white px-2 py-1 rounded-lg border border-stone-200">{invoice.utrNumber}</span>
              </div>
            )}
            {invoice.couponCode && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-stone-400 font-medium">Coupon Applied</span>
                <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-lg">{invoice.couponCode}</span>
              </div>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-12">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-800 text-white">
                <th className="py-4 px-6 rounded-l-2xl font-bold uppercase text-[10px] tracking-widest">Description</th>
                <th className="py-4 px-4 font-bold uppercase text-[10px] tracking-widest">Type</th>
                <th className="py-4 px-4 text-center font-bold uppercase text-[10px] tracking-widest">Qty</th>
                <th className="py-4 px-4 text-right font-bold uppercase text-[10px] tracking-widest">Unit Price</th>
                <th className="py-4 px-6 rounded-r-2xl text-right font-bold uppercase text-[10px] tracking-widest">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {invoice.InvoiceItems && invoice.InvoiceItems.map((item) => (
                <tr key={item.id}>
                  <td className="py-6 px-6">
                    <p className="font-bold text-stone-800">{item.itemName}</p>
                  </td>
                  <td className="py-6 px-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide
                      ${item.productId ? 'bg-lime-100 text-lime-700' : 'bg-sky-100 text-sky-700'}`}>
                      {item.productId ? 'Product' : 'Service'}
                    </span>
                  </td>
                  <td className="py-6 px-4 text-center text-stone-600 font-medium">{item.quantity}</td>
                  <td className="py-6 px-4 text-right text-stone-600 font-medium">₹{parseFloat(item.price).toFixed(2)}</td>
                  <td className="py-6 px-6 text-right font-bold text-stone-800">₹{parseFloat(item.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-24">
          <div className="w-full md:w-1/2 lg:w-2/5 space-y-3">
            <div className="flex justify-between text-stone-400 font-medium px-2">
              <span>Subtotal</span>
              <span className="text-stone-800">₹{subtotal.toFixed(2)}</span>
            </div>
            {parseFloat(invoice.doctorCharges) > 0 && (
              <div className="flex justify-between text-stone-400 font-medium px-2 italic">
                <span>Doctor Consultation Fees</span>
                <span className="text-stone-800">₹{parseFloat(invoice.doctorCharges).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-400 font-medium px-2">
              <span>Tax (5%)</span>
              <span className="text-stone-800">₹{tax.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between font-semibold px-2">
                <span className="text-green-600">
                  Discount {invoice.discountType === 'PERCENTAGE' ? `(%)` : invoice.discountType === 'FLAT' ? '(Flat)' : ''}
                  {invoice.couponCode ? ` — ${invoice.couponCode}` : ''}
                </span>
                <span className="text-green-600">−₹{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="h-px bg-stone-100"></div>
            <div className="flex justify-between items-center bg-lime-50 p-4 rounded-2xl">
              <span className="text-lg font-bold text-stone-700">Total Amount</span>
              <span className="text-2xl font-black text-lime-700">₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-16 border-t border-stone-100">
          <div className="grid grid-cols-2 gap-8 items-end">
            <div className="space-y-4">
              <h4 className="text-xs font-black text-stone-300 uppercase tracking-widest">Notes & Terms</h4>
              <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
                Thank you for trusting Pets Mart with your furry family members!
                This is a computer-generated invoice.
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-stone-300 uppercase tracking-widest mb-8">Authorized Signature</p>
              <div className="w-48 h-px bg-stone-200 ml-auto mb-2"></div>
              <p className="text-[10px] font-bold text-stone-400">Pets Mart Management</p>
            </div>
          </div>
          <div className="mt-16 text-center">
            <p className="text-[10px] text-stone-200 font-black uppercase tracking-[0.5em]">Always here for your pets</p>
          </div>
        </div>
      </div>

      {/* Print Controls */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-3 no-print">
        <button onClick={() => window.close()}
          className="bg-white border border-stone-200 text-stone-600 px-6 py-3 rounded-2xl shadow-xl font-bold transition-all hover:bg-stone-50 active:scale-95">
          Close Window
        </button>
        <button onClick={() => window.print()}
          className="bg-lime-700 hover:bg-lime-600 text-white px-8 py-3 rounded-2xl shadow-xl font-bold transition-all active:scale-95 flex items-center gap-2">
          <Printer size={18} /> Print Invoice
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          @page { size: A4; margin: 15mm; }
        }
      `}} />
    </div>
  );
};

export default PrintInvoice;
