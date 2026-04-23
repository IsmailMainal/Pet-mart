import React, { useContext } from 'react';
import { AuthContext } from '../AuthContext';
import api from '../api';
import { Link } from 'react-router-dom';
import { Card, Skeleton, Badge, EmptyState } from '../components/UI';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingBag, Calendar, FileText, ArrowRight, 
  CheckCircle, Clock, XCircle, PawPrint, Heart, CreditCard,
  User, Activity
} from 'lucide-react';
import { formatDate, formatCurrency } from '../utils/format';

// ── Helpers ──────────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  Pending: 'amber', Confirmed: 'blue', Completed: 'green', Cancelled: 'red',
  Paid: 'green', Draft: 'amber'
};

const SectionHeader = ({ title, to, linkLabel = 'View all' }) => (
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-base font-bold text-stone-800">{title}</h2>
    {to && (
      <Link to={to} className="text-xs text-lime-600 hover:text-lime-700 font-bold flex items-center gap-1">
        {linkLabel} <ArrowRight size={11} />
      </Link>
    )}
  </div>
);

// ── Customer Dashboard ────────────────────────────────────────────────────────
const CustomerDashboard = ({ user }) => {
  const { data: appointments = [], isLoading: loadingApts } = useQuery({
    queryKey: ['my-appointments'],
    queryFn: () => api.get('/appointments').then(r => Array.isArray(r.data) ? r.data.slice(0, 3) : (r.data.appointments || []).slice(0, 3))
  });

  const { data: invoices = [], isLoading: loadingBills } = useQuery({
    queryKey: ['my-invoices'],
    queryFn: () => api.get('/invoices').then(r => {
      const data = r.data.invoices || r.data;
      return Array.isArray(data) ? data.slice(0, 3) : [];
    })
  });

  const totalSpent = (Array.isArray(invoices) ? invoices : []).reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
  const totalVisits = (Array.isArray(appointments) ? appointments : []).filter(a => a.status === 'Completed').length;

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-br from-lime-700 via-lime-800 to-lime-900 rounded-[3rem] overflow-hidden text-white px-8 py-12 shadow-2xl shadow-lime-200">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
              <PawPrint size={24} className="text-lime-300" />
            </div>
            <div>
              <p className="text-lime-200 text-xs font-bold uppercase tracking-widest">Pet Parent Dashboard</p>
              <h1 className="text-3xl font-black">{user.name}</h1>
            </div>
          </div>
          <p className="text-lime-100 text-sm max-w-md mb-8 leading-relaxed opacity-80">
            Welcome back! Here's a quick look at your pet's recent health activities and billing.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link to="/dashboard/appointments"
              className="bg-white text-lime-900 px-6 py-3 rounded-2xl font-black text-sm hover:bg-lime-50 transition-all active:scale-95 shadow-lg flex items-center gap-2">
              <Calendar size={16} /> Book Appointment
            </Link>
            <Link to="/dashboard/products"
              className="bg-lime-600/30 border border-lime-400/30 text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-lime-600/50 transition-all backdrop-blur-sm flex items-center gap-2">
              <ShoppingBag size={16} /> Shop Supplies
            </Link>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 text-[20rem] opacity-5 select-none rotate-12">🐾</div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="p-6 bg-gradient-to-br from-white to-stone-50 border-none shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-lime-100 text-lime-700 flex items-center justify-center shrink-0">
            <Heart size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Successful Visits</p>
            <h3 className="text-3xl font-black text-stone-800">{totalVisits}</h3>
          </div>
        </Card>
        <Card className="p-6 bg-gradient-to-br from-white to-stone-50 border-none shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            <CreditCard size={28} />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Total Investment</p>
            <h3 className="text-3xl font-black text-stone-800">{formatCurrency(totalSpent)}</h3>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Appointments */}
        <div>
          <SectionHeader title="Recent Appointments" to="/dashboard/appointments" />
          <Card className="overflow-hidden min-h-[200px]">
            {loadingApts ? (
              <div className="p-4 space-y-3">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded-2xl" />)}</div>
            ) : appointments.length === 0 ? (
              <div className="py-12"><EmptyState icon="📅" title="No appointments" description="You haven't booked any medical visits yet." /></div>
            ) : (
              <div className="divide-y divide-stone-50">
                {appointments.map(apt => (
                  <div key={apt.id} className="p-5 flex items-center justify-between hover:bg-stone-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-stone-800">{formatDate(apt.date)}</p>
                        <p className="text-xs text-stone-400">{apt.time} · {apt.Doctor?.name || 'General Clinic'}</p>
                      </div>
                    </div>
                    <Badge color={STATUS_COLORS[apt.status] || 'stone'}>{apt.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Recent Bills */}
        <div>
          <SectionHeader title="Recent Invoices" to="/dashboard/my-bills" />
          <Card className="overflow-hidden min-h-[200px]">
            {loadingBills ? (
              <div className="p-4 space-y-3">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-14 rounded-2xl" />)}</div>
            ) : invoices.length === 0 ? (
              <div className="py-12"><EmptyState icon="🧾" title="No bills found" description="Your invoice history will appear here." /></div>
            ) : (
              <div className="divide-y divide-stone-50">
                {invoices.map(inv => (
                  <div key={inv.id} className="p-5 flex items-center justify-between hover:bg-stone-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-lime-50 text-lime-600 flex items-center justify-center">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-stone-800">{inv.invoiceNumber}</p>
                        <p className="text-xs text-stone-400">{formatDate(inv.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-stone-800">{formatCurrency(inv.total)}</p>
                      <Badge color={STATUS_COLORS[inv.status] || 'stone'}>{inv.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Explore Section */}
      <div className="bg-stone-100/50 rounded-[2.5rem] p-8">
        <h2 className="text-xl font-black text-stone-800 mb-6 text-center">Explore Pets Mart</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Veterinary Services', icon: '🩺', to: '/dashboard/services', color: 'bg-sky-50 hover:bg-sky-100' },
            { label: 'Shop Supplies', icon: '🛍️', to: '/dashboard/products', color: 'bg-amber-50 hover:bg-amber-100' },
            { label: 'Expert Doctors', icon: '👨‍⚕️', to: '/dashboard/doctors', color: 'bg-purple-50 hover:bg-purple-100' },
            { label: 'Special Offers', icon: '🎁', to: '/dashboard/coupons', color: 'bg-rose-50 hover:bg-rose-100' },
          ].map(item => (
            <Link key={item.to} to={item.to} className={`${item.color} p-6 rounded-3xl text-center transition-all hover:scale-105 active:scale-95`}>
              <span className="text-4xl block mb-3">{item.icon}</span>
              <span className="text-xs font-bold text-stone-700">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── Staff / Admin Dashboard ───────────────────────────────────────────────────
const StaffDashboard = ({ user }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats').then(r => r.data),
    staleTime: 60000,
  });

  const { data: logs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['recent-logs'],
    queryFn: () => api.get('/logs').then(r => (r.data?.logs || []).slice(0, 8)),
    enabled: user.role === 'admin',
    staleTime: 30000,
  });

  const CATEGORY_ICONS = {
    Product:     { color: 'amber',  icon: <ShoppingBag size={14} /> },
    Appointment: { color: 'blue',   icon: <Calendar size={14} /> },
    Invoice:     { color: 'green',  icon: <CreditCard size={14} /> },
    User:        { color: 'purple', icon: <User size={14} /> },
    System:      { color: 'stone',  icon: <Activity size={14} /> },
  };

  const totalInvoiceCount = stats?.invoiceStatuses?.reduce((s, r) => s + parseInt(r.count), 0) || 1;
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-stone-400 text-sm font-medium mb-1">{greeting} 👋</p>
          <h1 className="text-2xl font-black text-stone-800 tracking-tight">{user.name}</h1>
          <p className="text-stone-400 text-sm mt-1">{formatDate(new Date())}</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-lime-50 border border-lime-200 px-4 py-2.5 rounded-2xl">
          <PawPrint size={16} className="text-lime-700" />
          <span className="text-sm font-bold text-lime-700">Pets Mart ERP</span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Revenue" value={formatCurrency(stats?.revenue)} sub={`₹${formatCurrency(stats?.revenueThisMonth)} this month`} icon={CreditCard} iconBg="bg-lime-100" iconColor="text-lime-700" to="/dashboard/invoices" loading={isLoading} />
        <KpiCard title="Products" value={stats?.totalProducts ?? '—'} sub={stats?.outOfStockCount ? `⚠️ ${stats.outOfStockCount} out of stock` : 'Inventory healthy'} icon={ShoppingBag} iconBg="bg-amber-100" iconColor="text-amber-700" to="/dashboard/products" loading={isLoading} />
        <KpiCard title="Appointments" value={stats?.totalAppointments ?? '—'} sub={`${stats?.appointmentsThisWeek ?? 0} this week`} icon={Calendar} iconBg="bg-sky-100" iconColor="text-sky-700" to="/dashboard/appointments" loading={isLoading} />
        <KpiCard title="Invoices" value={stats?.totalInvoices ?? '—'} sub={`${stats?.activeCoupons ?? 0} active coupons`} icon={FileText} iconBg="bg-purple-100" iconColor="text-purple-700" to="/dashboard/invoices" loading={isLoading} />
      </div>

      {/* Charts / Lists */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="p-5">
          <SectionHeader title="Invoice Status" to="/dashboard/invoices" />
          {isLoading ? <div className="space-y-3">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-8 rounded-lg" />)}</div> : (
            <div className="space-y-3">
              {['Paid', 'Draft', 'Cancelled'].map(s => {
                const count = parseInt(stats?.invoiceStatuses?.find(r => r.status === s)?.count || 0);
                const colors = { Paid: 'bg-green-500 text-green-600', Draft: 'bg-amber-400 text-amber-600', Cancelled: 'bg-red-400 text-red-500' };
                return (
                  <div key={s}>
                    <div className="flex justify-between text-xs font-bold mb-1.5"><span className="text-stone-500">{s}</span><span>{count}</span></div>
                    <div className="h-1.5 bg-stone-100 rounded-full"><div className={`h-full ${colors[s].split(' ')[0]} rounded-full`} style={{ width: `${(count / totalInvoiceCount) * 100}%` }} /></div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
        
        {/* Recent Activity (Admin Only) */}
        {user.role === 'admin' && (
          <Card className="md:col-span-2 overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
              <h2 className="text-base font-bold text-stone-800">Recent Activity</h2>
              <Link to="/dashboard/logs" className="text-xs text-lime-600 font-bold hover:underline">View All</Link>
            </div>
            {logsLoading ? <div className="p-5 space-y-4">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10 rounded-xl" />)}</div> : (
              <div className="divide-y divide-stone-50">
                {logs.map(log => {
                  const cfg = CATEGORY_ICONS[log.entity] || CATEGORY_ICONS.System;
                  return (
                    <div key={log.id} className="px-5 py-3.5 flex items-start gap-4 hover:bg-stone-50 transition-colors group">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-${cfg.color}-50 text-${cfg.color}-600 transition-transform group-hover:scale-110`}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-stone-800 font-bold leading-tight line-clamp-1">{log.details}</p>
                        <p className="text-[10px] text-stone-400 font-medium mt-1 uppercase tracking-wider">
                          {log.User?.name || 'System'} • {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, sub, icon: Icon, iconBg, iconColor, to, loading }) => (
  <Link to={to} className="block h-full">
    <Card hover className="p-5 h-full flex flex-col gap-3">
      <div className={`${iconBg} p-2.5 rounded-xl self-start`}><Icon size={20} className={iconColor} /></div>
      {loading ? <div className="space-y-2"><Skeleton className="h-7 w-24" /><Skeleton className="h-3 w-32" /></div> : (
        <div><h3 className="text-2xl font-black text-stone-800 leading-none">{value}</h3><p className="text-xs text-stone-400 font-medium mt-1.5">{sub || title}</p></div>
      )}
      <ArrowRight size={13} className="text-stone-300 mt-auto ml-auto" />
    </Card>
  </Link>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  if (user.role === 'customer') return <CustomerDashboard user={user} />;
  return <StaffDashboard user={user} />;
};

export default Dashboard;
