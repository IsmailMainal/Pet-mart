import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { Card, PageHeader, Skeleton, Badge, StockBadge } from '../components/UI';
import { 
  TrendingUp, Users, Stethoscope, Package, 
  DollarSign, BarChart3, ArrowUpRight, ArrowDownRight,
  ShoppingCart, Activity, Award, Briefcase
} from 'lucide-react';
import { formatCurrency } from '../utils/format';

const Reports = () => {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/dashboard/stats').then(r => r.data),
  });

  if (isLoading) return (
    <div className="space-y-6">
      <PageHeader title="Business Intelligence" description="Loading performance metrics..." />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-3xl" />)}
      </div>
      <Skeleton className="h-96 rounded-3xl" />
    </div>
  );

  if (isError || !stats) return (
    <div className="space-y-6">
      <PageHeader title="Business Intelligence" description="Error loading performance metrics" />
      <div className="p-6 bg-red-50 text-red-600 rounded-xl font-medium border border-red-100">
        Failed to load report data. Please ensure the backend server is reachable.
      </div>
    </div>
  );

  const revenueChange = stats.revenueThisMonth > stats.revenueLastMonth;
  const changePercent = stats.revenueLastMonth > 0 
    ? ((Math.abs(stats.revenueThisMonth - stats.revenueLastMonth) / stats.revenueLastMonth) * 100).toFixed(1)
    : 100;

  return (
    <div className="space-y-8 pb-12">
      <PageHeader 
        title="Business Intelligence" 
        description="Real-time performance analytics and financial reports" 
      />

      {/* High Level Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard 
          title="Monthly Revenue" 
          value={formatCurrency(stats.revenueThisMonth)} 
          sub={`${revenueChange ? '+' : '-'}${changePercent}% vs last month`}
          trend={revenueChange ? 'up' : 'down'}
          icon={<TrendingUp size={22} />}
          color="lime"
          gradient="from-lime-500/10 to-transparent"
        />
        <MetricCard 
          title="Consultation Fees" 
          value={formatCurrency(stats.doctorPerformance?.reduce((s, d) => s + parseFloat(d.totalDoctorCharges || 0), 0))} 
          sub="Total earned by medical staff"
          icon={<Stethoscope size={22} />}
          color="blue"
          gradient="from-blue-500/10 to-transparent"
        />
        <MetricCard 
          title="Inventory Assets" 
          value={formatCurrency(stats.totalProducts * 450)} 
          sub={`${stats.outOfStockCount} items out of stock`}
          icon={<Package size={22} />}
          color="amber"
          gradient="from-amber-500/10 to-transparent"
        />
        <MetricCard 
          title="Total Invoices" 
          value={stats.totalInvoices} 
          sub={`${stats.activeCoupons} active campaigns`}
          icon={<Activity size={22} />}
          color="purple"
          gradient="from-purple-500/10 to-transparent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Doctor Performance */}
        <Card className="lg:col-span-2 overflow-hidden shadow-sm border-stone-100">
          <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-xl shadow-sm border border-stone-100"><Award className="text-lime-600" size={18} /></div>
              <div>
                <h3 className="font-bold text-stone-800">Doctor Performance</h3>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">Performance Ranking & Revenue</p>
              </div>
            </div>
            <BarChart3 size={18} className="text-stone-300" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50/30 text-stone-400 text-[10px] uppercase font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-4 text-left font-black">Doctor</th>
                  <th className="px-6 py-4 text-left font-black">Consultations</th>
                  <th className="px-6 py-4 text-right font-black">Fees Earned</th>
                  <th className="px-6 py-4 text-right font-black">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {stats.doctorPerformance?.map(doc => (
                  <tr key={doc.doctorId} className="hover:bg-stone-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-lime-700 text-white flex items-center justify-center font-bold text-xs shadow-md transition-transform group-hover:scale-110">
                          {doc['doctor.name']?.charAt(0)}
                        </div>
                        <span className="font-bold text-stone-800 tracking-tight">{doc['doctor.name']}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-stone-700 font-bold">{doc.invoiceCount}</span>
                        <span className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">visits</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-stone-600 font-bold">{formatCurrency(doc.totalDoctorCharges)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-black text-lime-700 bg-lime-50 px-3 py-1.5 rounded-xl text-xs">{formatCurrency(doc.totalRevenue)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Top Services */}
        <Card className="overflow-hidden shadow-sm border-stone-100 flex flex-col">
          <div className="px-6 py-5 border-b border-stone-100 bg-stone-50/50 flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm border border-stone-100"><Briefcase className="text-blue-600" size={18} /></div>
            <div>
              <h3 className="font-bold text-stone-800">Top Services</h3>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">By Appointment Count</p>
            </div>
          </div>
          <div className="p-6 space-y-6 flex-1">
            {stats.topServices?.map((svc, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-stone-200 group-hover:text-blue-500 transition-colors">0{i+1}</span>
                  <span className="text-sm font-bold text-stone-700 group-hover:text-stone-900 transition-colors">{svc.itemName}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-blue-700">{svc.count} <span className="text-[9px] text-blue-400 uppercase tracking-tighter">Sales</span></p>
                </div>
              </div>
            ))}
            {stats.topServices?.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 opacity-40">
                <Activity size={32} />
                <p className="text-xs font-bold mt-2 uppercase tracking-widest">No Sales Recorded</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Products */}
        <Card className="overflow-hidden shadow-sm border-stone-100">
          <div className="px-6 py-5 border-b border-stone-100 bg-stone-50/50 flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm border border-stone-100"><ShoppingCart className="text-amber-600" size={18} /></div>
            <div>
              <h3 className="font-bold text-stone-800">Hot Inventory</h3>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">Top Selling Supplies</p>
            </div>
          </div>
          <div className="p-6 space-y-6">
            {stats.topProducts?.map((prod, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-[10px]">
                    #{i+1}
                  </div>
                  <span className="text-sm font-bold text-stone-700 group-hover:text-amber-700 transition-colors">{prod.itemName}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-stone-800">{parseInt(prod.sold)} <span className="text-[9px] text-stone-400 uppercase tracking-tighter font-bold">Units</span></p>
                </div>
              </div>
            ))}
            {stats.topProducts?.length === 0 && <p className="text-center text-xs text-stone-400 font-bold uppercase tracking-widest py-8">No Product Data</p>}
          </div>
        </Card>

        {/* Revenue Trend Chart */}
        <Card className="lg:col-span-2 p-6 shadow-sm border-stone-100">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-lime-50 rounded-xl"><BarChart3 className="text-lime-700" size={18} /></div>
              <div>
                <h3 className="font-bold text-stone-800">Financial Growth</h3>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">6-Month Revenue Projection</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge color="green">Paid Invoices Only</Badge>
            </div>
          </div>
          <div className="flex items-end gap-4 h-52 px-2">
            {stats.revenueTrend?.map((m, i) => {
              const max = Math.max(...stats.revenueTrend.map(r => r.revenue), 1000);
              const height = (m.revenue / max) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                  <div className="relative w-full flex items-end justify-center">
                    <div 
                      className="w-full max-w-[40px] bg-gradient-to-t from-lime-600 to-lime-400 rounded-t-xl group-hover:from-lime-500 group-hover:to-lime-300 transition-all cursor-pointer shadow-lg shadow-lime-100" 
                      style={{ height: `${Math.max(height, 5)}%` }}
                    >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[10px] font-black px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all transform group-hover:-translate-y-1 shadow-xl z-10 whitespace-nowrap">
                        {formatCurrency(m.revenue)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black text-stone-300 uppercase tracking-tighter group-hover:text-lime-700 transition-colors">
                      {m.month.split('-')[1]}/{m.month.split('-')[0].slice(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Inventory Alerts Footer */}
      <Card className="bg-stone-900 border-none shadow-2xl p-6 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-[2rem] bg-white/10 backdrop-blur-md flex items-center justify-center">
              <Package size={32} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Inventory Health Report</h3>
              <p className="text-stone-400 text-sm">{stats.lowStockProducts?.length || 0} items require immediate restock attention.</p>
            </div>
          </div>
          <div className="flex -space-x-3">
            {stats.lowStockProducts?.slice(0, 3).map((prod, i) => (
              <div key={i} className="w-12 h-12 rounded-2xl bg-stone-800 border-2 border-stone-900 flex items-center justify-center text-white text-xs font-black" title={prod.name}>
                {prod.name.charAt(0)}
              </div>
            ))}
            {stats.lowStockProducts?.length > 3 && (
              <div className="w-12 h-12 rounded-2xl bg-amber-500 border-2 border-stone-900 flex items-center justify-center text-white text-xs font-black">
                +{stats.lowStockProducts.length - 3}
              </div>
            )}
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-lime-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
      </Card>
    </div>
  );
};

const MetricCard = ({ title, value, sub, trend, icon, color, gradient }) => (
  <Card className={`p-6 relative overflow-hidden group hover:scale-[1.02] transition-all border-stone-100 shadow-sm bg-gradient-to-br ${gradient}`}>
    <div className="relative z-10">
      <div className={`w-12 h-12 rounded-2xl bg-${color}-50 text-${color}-600 flex items-center justify-center mb-6 shadow-sm border border-${color}-100 transition-transform group-hover:rotate-12`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-1">{title}</p>
      <h3 className="text-3xl font-black text-stone-800 tracking-tight">{value}</h3>
      <div className="flex items-center gap-1.5 mt-3">
        <div className={`p-0.5 rounded-md ${trend === 'up' ? 'bg-green-100' : trend === 'down' ? 'bg-red-100' : 'bg-stone-100'}`}>
          {trend === 'up' ? <ArrowUpRight size={14} className="text-green-600" /> : trend === 'down' ? <ArrowDownRight size={14} className="text-red-600" /> : <Activity size={14} className="text-stone-400" />}
        </div>
        <p className={`text-[10px] font-bold uppercase tracking-wider ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-stone-400'}`}>
          {sub}
        </p>
      </div>
    </div>
    <div className="absolute -right-4 -bottom-4 text-8xl opacity-5 grayscale pointer-events-none group-hover:scale-110 transition-transform">
      {icon}
    </div>
  </Card>
);

export default Reports;
