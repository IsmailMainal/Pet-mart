import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api';
import { Card, PageHeader, Skeleton, Badge, StockBadge } from '../components/UI';
import { 
  TrendingUp, Users, Stethoscope, Package, 
  DollarSign, BarChart3, ArrowUpRight, ArrowDownRight,
  ShoppingCart, Activity
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
        Failed to load report data. This is likely because the backend API is still deploying or encountered an error.
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Monthly Revenue" 
          value={formatCurrency(stats.revenueThisMonth)} 
          sub={`${revenueChange ? '+' : '-'}${changePercent}% vs last month`}
          trend={revenueChange ? 'up' : 'down'}
          icon={<TrendingUp size={20} />}
          color="lime"
        />
        <MetricCard 
          title="Consultation Fees" 
          value={formatCurrency(stats.doctorPerformance?.reduce((s, d) => s + parseFloat(d.totalDoctorCharges || 0), 0))} 
          sub="Total earned by medical staff"
          icon={<Stethoscope size={20} />}
          color="blue"
        />
        <MetricCard 
          title="Inventory Value" 
          value={formatCurrency(stats.totalProducts * 450)} // Estimated avg value
          sub={`${stats.outOfStockCount} items out of stock`}
          icon={<Package size={20} />}
          color="amber"
        />
        <MetricCard 
          title="Active Coupons" 
          value={stats.activeCoupons} 
          sub="Promotional campaigns running"
          icon={<Activity size={20} />}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Doctor Performance */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
            <div>
              <h3 className="font-bold text-stone-800">Doctor Performance</h3>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">Ranking by Consultation & Billing</p>
            </div>
            <BarChart3 size={18} className="text-stone-300" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-stone-50/30 text-stone-500 text-[10px] uppercase font-bold tracking-widest">
                <tr>
                  <th className="px-6 py-3 text-left">Doctor</th>
                  <th className="px-6 py-3 text-left">Consultations</th>
                  <th className="px-6 py-3 text-right">Charges</th>
                  <th className="px-6 py-3 text-right">Total Billing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {stats.doctorPerformance?.map(doc => (
                  <tr key={doc.doctorId} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-lime-100 text-lime-700 flex items-center justify-center font-bold text-xs">
                          {doc['doctor.name']?.charAt(0)}
                        </div>
                        <span className="font-semibold text-stone-800">{doc['doctor.name']}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-stone-500">{doc.invoiceCount} visits</td>
                    <td className="px-6 py-4 text-right font-mono text-stone-600">{formatCurrency(doc.totalDoctorCharges)}</td>
                    <td className="px-6 py-4 text-right font-bold text-lime-700">{formatCurrency(doc.totalRevenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Top Services */}
        <Card className="overflow-hidden">
          <div className="px-6 py-5 border-b border-stone-100 bg-stone-50/50">
            <h3 className="font-bold text-stone-800">Top Services</h3>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-0.5">Most Booked Treatments</p>
          </div>
          <div className="p-6 space-y-5">
            {stats.topServices?.map((svc, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-sm font-medium text-stone-700">{svc.itemName}</span>
                </div>
                <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg">{svc.count} sales</span>
              </div>
            ))}
            {stats.topServices?.length === 0 && <p className="text-center text-sm text-stone-400 py-4">No service data available</p>}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Inventory Health */}
        <Card>
          <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between">
            <h3 className="font-bold text-stone-800">Inventory Alerts</h3>
            <Badge color="amber">Low Stock</Badge>
          </div>
          <div className="divide-y divide-stone-50">
            {stats.lowStockProducts?.map(prod => (
              <div key={prod.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-stone-800 text-sm">{prod.name}</p>
                  <p className="text-xs text-stone-400">Restock recommended immediately</p>
                </div>
                <StockBadge quantity={prod.quantity} />
              </div>
            ))}
            {stats.lowStockProducts?.length === 0 && (
              <div className="px-6 py-8 text-center text-stone-400 text-sm italic">
                All inventory levels are healthy.
              </div>
            )}
          </div>
        </Card>

        {/* Revenue Trend Chart (Simple Bar Mockup) */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-stone-800">Revenue Trend</h3>
            <div className="flex gap-2">
              <Badge color="lime">Last 6 Months</Badge>
            </div>
          </div>
          <div className="flex items-end gap-3 h-48 px-2">
            {stats.revenueTrend?.map((m, i) => {
              const max = Math.max(...stats.revenueTrend.map(r => r.revenue));
              const height = (m.revenue / max) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative w-full bg-lime-100 rounded-t-lg group-hover:bg-lime-200 transition-all cursor-pointer" style={{ height: `${height}%` }}>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-stone-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {formatCurrency(m.revenue)}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-tighter truncate w-full text-center">{m.month.split('-')[1]}/{m.month.split('-')[0].slice(2)}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, sub, trend, icon, color }) => (
  <Card className="p-6">
    <div className={`w-10 h-10 rounded-2xl bg-${color}-50 text-${color}-600 flex items-center justify-center mb-4`}>
      {icon}
    </div>
    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">{title}</p>
    <h3 className="text-2xl font-black text-stone-800">{value}</h3>
    <div className="flex items-center gap-1 mt-2">
      {trend === 'up' ? <ArrowUpRight size={14} className="text-green-500" /> : trend === 'down' ? <ArrowDownRight size={14} className="text-red-500" /> : null}
      <p className={`text-xs font-bold ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-stone-400'}`}>
        {sub}
      </p>
    </div>
  </Card>
);

export default Reports;
