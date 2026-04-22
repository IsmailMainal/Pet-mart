import React, { useContext } from 'react';
import { AuthContext } from '../AuthContext';
import api from '../api';
import { Link } from 'react-router-dom';
import { Card, Skeleton } from '../components/UI';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingBag, Calendar, FileText, TrendingUp, TrendingDown,
  ArrowRight, Tag, Package, Banknote, Smartphone, AlertTriangle,
  CheckCircle, Clock, XCircle, IndianRupee, PawPrint
} from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtShort = (n) => {
  const v = parseFloat(n || 0);
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(1)}K`;
  return `₹${v.toFixed(0)}`;
};

const pct = (current, prev) => {
  if (!prev) return null;
  const change = ((current - prev) / prev) * 100;
  return { value: Math.abs(change).toFixed(1), up: change >= 0 };
};

const STATUS_CFG = {
  Paid: { icon: <CheckCircle size={13} />, color: 'text-green-600 bg-green-50', bar: 'bg-green-500' },
  Draft: { icon: <Clock size={13} />, color: 'text-amber-600 bg-amber-50', bar: 'bg-amber-400' },
  Cancelled: { icon: <XCircle size={13} />, color: 'text-red-500 bg-red-50', bar: 'bg-red-400' },
};

// ── Sub-components ───────────────────────────────────────────────────────────
const KpiCard = ({ title, value, sub, icon: Icon, iconBg, iconColor, trend, to, loading }) => {
  const content = (
    <Card hover={!!to} className="p-5 h-full flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className={`${iconBg} p-2.5 rounded-xl`}>
          <Icon size={20} className={iconColor} />
        </div>
        {trend && (
          <span className={`text-xs font-bold flex items-center gap-0.5 px-2 py-1 rounded-full
            ${trend.up ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
            {trend.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {trend.value}%
          </span>
        )}
      </div>
      {loading ? (
        <div className="space-y-2"><Skeleton className="h-7 w-24" /><Skeleton className="h-3 w-32" /></div>
      ) : (
        <div>
          <h3 className="text-2xl font-black text-stone-800 leading-none">{value}</h3>
          <p className="text-xs text-stone-400 font-medium mt-1.5">{sub || title}</p>
        </div>
      )}
      {to && <ArrowRight size={13} className="text-stone-300 mt-auto ml-auto" />}
    </Card>
  );
  return to ? <Link to={to} className="block h-full">{content}</Link> : content;
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
const CustomerDashboard = ({ user }) => (
  <div className="space-y-8">
    {/* Hero Banner */}
    <div className="relative bg-gradient-to-br from-lime-700 via-lime-800 to-lime-900 rounded-3xl overflow-hidden text-white px-8 py-10">
      <div className="relative z-10">
        <p className="text-lime-300 text-sm font-medium mb-2 flex items-center gap-2">
          <PawPrint size={14} /> Welcome back
        </p>
        <h1 className="text-3xl font-black mb-3">{user.name}</h1>
        <p className="text-lime-200 text-sm max-w-md mb-6 leading-relaxed">
          Book your next appointment or browse our premium pet supplies. Your pets deserve the very best.
        </p>
        <div className="flex gap-3 flex-wrap">
          <Link to="/dashboard/appointments"
            className="bg-white text-lime-800 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-lime-50 transition-colors shadow-lg">
            📅 Book Appointment
          </Link>
          <Link to="/dashboard/products"
            className="bg-lime-600/50 border border-lime-400/40 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-lime-600/70 transition-colors backdrop-blur-sm">
            🛍️ Browse Products
          </Link>
        </div>
      </div>
      <div className="absolute right-8 top-1/2 -translate-y-1/2 text-9xl opacity-10 select-none">🐾</div>
    </div>

    {/* Quick actions */}
    <div>
      <h2 className="text-base font-bold text-stone-800 mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { icon: '📅', label: 'My Appointments', to: '/dashboard/appointments', bg: 'bg-amber-50 hover:bg-amber-100' },
            { icon: '🛍️', label: 'Pet Supplies', to: '/dashboard/products', bg: 'bg-lime-50 hover:bg-lime-100' },
            { icon: '🧾', label: 'My Bills', to: '/dashboard/my-bills', bg: 'bg-blue-50 hover:bg-blue-100' },
            { icon: '🩺', label: 'Book a Doctor', to: '/dashboard/appointments', bg: 'bg-sky-50 hover:bg-sky-100' },
            { icon: '🐶', label: 'Our Services', to: '/dashboard/services', bg: 'bg-rose-50 hover:bg-rose-100' },
          ].map(({ icon, label, to, bg }) => (
          <Link key={to + label} to={to}
            className={`${bg} rounded-2xl p-5 flex flex-col items-start gap-3 transition-colors cursor-pointer`}>
            <span className="text-3xl">{icon}</span>
            <span className="font-bold text-stone-800 text-sm">{label}</span>
            <span className="text-xs text-stone-400 flex items-center gap-1">Go now <ArrowRight size={11} /></span>
          </Link>
        ))}
      </div>
    </div>
  </div>
);

// ── Staff / Admin Dashboard ───────────────────────────────────────────────────
const StaffDashboard = ({ user }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats').then(r => r.data),
    staleTime: 60000,
  });

  const { data: logs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['recent-logs'],
    queryFn: () => api.get('/logs').then(r => r.data.slice(0, 8)),
    enabled: user.role === 'admin',
    staleTime: 30000,
  });

  const revTrend = stats ? pct(stats.revenueThisMonth, stats.revenueLastMonth) : null;
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
          <p className="text-stone-400 text-sm mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-lime-50 border border-lime-200 px-4 py-2.5 rounded-2xl">
          <PawPrint size={16} className="text-lime-700" />
          <span className="text-sm font-bold text-lime-700">Pets Mart ERP</span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Revenue"
          value={fmtShort(stats?.revenue)}
          sub={`₹${fmt(stats?.revenueThisMonth)} this month`}
          icon={IndianRupee}
          iconBg="bg-lime-100" iconColor="text-lime-700"
          trend={revTrend}
          to="/dashboard/invoices"
          loading={isLoading}
        />
        <KpiCard
          title="Products"
          value={stats?.totalProducts ?? '—'}
          sub={stats?.outOfStockCount ? `⚠️ ${stats.outOfStockCount} out of stock` : 'Inventory healthy'}
          icon={ShoppingBag}
          iconBg="bg-amber-100" iconColor="text-amber-700"
          to="/dashboard/products"
          loading={isLoading}
        />
        <KpiCard
          title="Appointments"
          value={stats?.totalAppointments ?? '—'}
          sub={`${stats?.appointmentsThisWeek ?? 0} this week`}
          icon={Calendar}
          iconBg="bg-sky-100" iconColor="text-sky-700"
          to="/dashboard/appointments"
          loading={isLoading}
        />
        <KpiCard
          title="Invoices"
          value={stats?.totalInvoices ?? '—'}
          sub={`${stats?.activeCoupons ?? 0} active coupons`}
          icon={FileText}
          iconBg="bg-purple-100" iconColor="text-purple-700"
          to="/dashboard/invoices"
          loading={isLoading}
        />
      </div>

      {/* Middle row — Invoice status + Payment split + Low stock */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Invoice Status Breakdown */}
        <Card className="p-5">
          <SectionHeader title="Invoice Status" to="/dashboard/invoices" />
          {isLoading ? (
            <div className="space-y-3">{Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-8 rounded-lg" />)}</div>
          ) : (
            <div className="space-y-3">
              {['Paid', 'Draft', 'Cancelled'].map(s => {
                const row = stats?.invoiceStatuses?.find(r => r.status === s);
                const count = parseInt(row?.count || 0);
                const cfg = STATUS_CFG[s];
                return (
                  <div key={s}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-lg ${cfg.color}`}>
                        {cfg.icon} {s}
                      </span>
                      <span className="text-xs font-bold text-stone-600">{count}</span>
                    </div>
                    <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div className={`h-full ${cfg.bar} rounded-full transition-all duration-700`}
                        style={{ width: `${(count / totalInvoiceCount) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Payment Mode Split */}
        <Card className="p-5">
          <SectionHeader title="Payment Methods" />
          {isLoading ? (
            <div className="space-y-3">{Array(2).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
          ) : (
            <div className="space-y-3">
              {(stats?.paymentModes || []).map(pm => {
                const isOnline = pm.paymentMode === 'ONLINE';
                return (
                  <div key={pm.paymentMode}
                    className={`flex items-center gap-3 rounded-xl p-3 ${isOnline ? 'bg-blue-50' : 'bg-stone-50'}`}>
                    <div className={`p-2 rounded-lg ${isOnline ? 'bg-blue-100 text-blue-600' : 'bg-stone-200 text-stone-600'}`}>
                      {isOnline ? <Smartphone size={15} /> : <Banknote size={15} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-stone-700">{isOnline ? 'Online / UPI' : 'Cash'}</p>
                      <p className="text-lg font-black text-stone-800 leading-none mt-0.5">{pm.count}</p>
                    </div>
                    <span className="text-xs text-stone-400 font-semibold">invoices</span>
                  </div>
                );
              })}
              {!stats?.paymentModes?.length && (
                <p className="text-sm text-stone-400 text-center py-6">No invoices yet</p>
              )}
            </div>
          )}
        </Card>

        {/* Low Stock Alert */}
        <Card className="p-5">
          <SectionHeader title="Low Stock Alert" to="/dashboard/products" linkLabel="Manage" />
          {isLoading ? (
            <div className="space-y-2">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-8 rounded-lg" />)}</div>
          ) : !stats?.lowStockProducts?.length ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <CheckCircle size={28} className="text-lime-500" />
              <p className="text-sm font-semibold text-stone-600">All stock healthy</p>
              <p className="text-xs text-stone-400">No products running low</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.lowStockProducts.map(p => (
                <div key={p.id} className="flex items-center gap-2.5 bg-amber-50 rounded-xl px-3 py-2.5">
                  <AlertTriangle size={13} className="text-amber-500 shrink-0" />
                  <span className="text-xs font-semibold text-stone-700 flex-1 truncate">{p.name}</span>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-lg
                    ${p.quantity <= 2 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                    {p.quantity} left
                  </span>
                </div>
              ))}
              {stats.outOfStockCount > 0 && (
                <div className="flex items-center gap-2 bg-red-50 rounded-xl px-3 py-2.5 mt-1">
                  <Package size={13} className="text-red-500 shrink-0" />
                  <span className="text-xs font-bold text-red-600">{stats.outOfStockCount} product(s) out of stock</span>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Invoices */}
        <Card className="overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100 bg-stone-50/50">
            <SectionHeader title="Recent Invoices" to="/dashboard/invoices" />
          </div>
          {isLoading ? (
            <div className="p-5 space-y-3">{Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-10 rounded-xl" />)}</div>
          ) : !stats?.recentInvoices?.length ? (
            <div className="p-10 text-center text-stone-400 text-sm">No invoices yet</div>
          ) : (
            <div className="divide-y divide-stone-50">
              {stats.recentInvoices.map(inv => (
                <Link key={inv.id} to="/dashboard/invoices"
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-stone-50 transition-colors group">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono font-bold text-stone-500">{inv.invoiceNumber}</p>
                    <p className="text-sm font-semibold text-stone-800 truncate">{inv.customerName}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-lime-700">₹{fmt(inv.total)}</p>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md
                      ${inv.status === 'Paid' ? 'bg-green-100 text-green-600'
                        : inv.status === 'Draft' ? 'bg-amber-100 text-amber-600'
                        : 'bg-red-100 text-red-500'}`}>
                      {inv.status}
                    </span>
                  </div>
                  <ArrowRight size={12} className="text-stone-200 group-hover:text-stone-400 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Right column — Top Services + Activity log */}
        <div className="space-y-5">

          {/* Top Services */}
          <Card className="p-5">
            <SectionHeader title="Popular Services" to="/dashboard/services" />
            {isLoading ? (
              <div className="space-y-3">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-8 rounded-lg" />)}</div>
            ) : !stats?.topServices?.length ? (
              <p className="text-sm text-stone-400 text-center py-6 italic">No service data yet</p>
            ) : (
              <div className="space-y-3">
                {stats.topServices.map((s, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-black text-stone-300 w-4 text-right shrink-0">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-stone-700 truncate">{s.itemName}</span>
                        <span className="text-xs font-black text-lime-700 ml-2 shrink-0">{s.count}×</span>
                      </div>
                      <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-lime-500 rounded-full transition-all duration-700"
                          style={{ width: `${(s.count / stats.topServices[0].count) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Admin: Recent Activity */}
          {user.role === 'admin' && (
            <Card className="overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-100 bg-stone-50/50">
                <SectionHeader title="Recent Activity" to="/dashboard/logs" />
              </div>
              {logsLoading ? (
                <div className="p-4 space-y-3">{Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-8 rounded-lg" />)}</div>
              ) : logs.length === 0 ? (
                <p className="text-sm text-stone-400 text-center py-8">No activity yet</p>
              ) : (
                <div className="divide-y divide-stone-50 max-h-52 overflow-y-auto">
                  {logs.map(log => (
                    <div key={log.id} className="flex items-start gap-3 px-5 py-3 hover:bg-stone-50 transition-colors">
                      <div className="w-6 h-6 rounded-full bg-lime-100 text-lime-700 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                        {log.User?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-stone-700 font-medium leading-snug line-clamp-1">{log.details}</p>
                        <p className="text-[10px] text-stone-400 mt-0.5">
                          {log.User?.name} · {new Date(log.createdAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Root ─────────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  if (user.role === 'customer') return <CustomerDashboard user={user} />;
  return <StaffDashboard user={user} />;
};

export default Dashboard;
