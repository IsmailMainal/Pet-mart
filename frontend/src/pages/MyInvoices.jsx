import React, { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { AuthContext } from '../AuthContext';
import { Card, PageHeader, Badge, EmptyState, Skeleton } from '../components/UI';
import { Printer, Package, ShoppingCart, Banknote, Smartphone, FileText, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATUS_COLORS = { Paid: 'green', Draft: 'amber', Cancelled: 'red' };

const PaymentBadge = ({ mode }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wide
    ${mode === 'ONLINE' ? 'bg-blue-50 text-blue-600' : 'bg-stone-100 text-stone-500'}`}>
    {mode === 'ONLINE' ? <Smartphone size={9} /> : <Banknote size={9} />}
    {mode === 'ONLINE' ? 'Online' : 'Cash'}
  </span>
);

const MyInvoices = () => {
  const { user } = useContext(AuthContext);

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['my-invoices'],
    queryFn: async () => {
      const res = await api.get('/invoices');
      return res.data?.invoices || [];
    }
  });

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="My Bills & Invoices"
        description="View and download your past service records and bills"
      />

      {isLoading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <Card key={i} className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-48" />
                </div>
                <Skeleton className="h-8 w-24 rounded-xl" />
              </div>
            </Card>
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <EmptyState 
          icon="🧾" 
          title="No bills yet" 
          description="Your invoices will appear here after your first visit or purchase."
          action={<Link to="/dashboard/appointments" className="bg-lime-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm">Book an Appointment</Link>}
        />
      ) : (
        <div className="space-y-4">
          {(Array.isArray(invoices) ? invoices : []).map(inv => {
            const doctorCharges = (inv.InvoiceItems || []).filter(i => i.serviceId).reduce((s, i) => s + (parseFloat(i.total) || 0), 0) || 0;
            const medicalCharges = (inv.InvoiceItems || []).filter(i => i.productId).reduce((s, i) => s + (parseFloat(i.total) || 0), 0) || 0;

            return (
              <Card key={inv.id} className="overflow-hidden">
                <div className="p-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-stone-400">{inv.invoiceNumber}</span>
                        <Badge color={STATUS_COLORS[inv.status] || 'stone'}>{inv.status}</Badge>
                      </div>
                      <h3 className="text-lg font-bold text-stone-800">{formatDate(inv.createdAt)}</h3>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs text-stone-400 font-bold uppercase tracking-wider mb-1">Total Amount</p>
                      <p className="text-2xl font-black text-lime-700 leading-none">₹{parseFloat(inv.total).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="bg-stone-50 rounded-2xl p-4 flex items-center gap-4 border border-stone-100">
                      <div className="bg-sky-100 p-2.5 rounded-xl text-sky-700">
                        <ShoppingCart size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">Doctor / Service Charges</p>
                        <p className="text-lg font-bold text-stone-800">₹{doctorCharges.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="bg-stone-50 rounded-2xl p-4 flex items-center gap-4 border border-stone-100">
                      <div className="bg-lime-100 p-2.5 rounded-xl text-lime-700">
                        <Package size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wide">Medicine & Supplies</p>
                        <p className="text-lg font-bold text-stone-800">₹{medicalCharges.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-stone-100">
                    <div className="flex items-center gap-4">
                      <PaymentBadge mode={inv.paymentMode} />
                      {parseFloat(inv.discountAmount) > 0 && (
                        <span className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded-lg">
                          🎁 ₹{parseFloat(inv.discountAmount).toFixed(2)} Savings
                        </span>
                      )}
                    </div>
                    <Link 
                      to={`/print-invoice/${inv.id}`} 
                      target="_blank"
                      className="flex items-center gap-2 text-lime-700 hover:text-lime-800 font-bold text-sm bg-lime-50 px-4 py-2 rounded-xl transition-colors"
                    >
                      <Printer size={16} /> Print / Download
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyInvoices;
