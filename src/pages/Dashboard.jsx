import { useState, useEffect } from 'react';
import { Package, Users, ShoppingCart, DollarSign, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getStats, getRecentOrders } from '../services/api';

const statusStyles = {
  delivered: 'bg-emerald-500/10 text-emerald-400',
  pending: 'bg-amber-500/10 text-amber-400',
  processing: 'bg-blue-500/10 text-blue-400',
  shipped: 'bg-indigo-500/10 text-indigo-400',
  cancelled: 'bg-red-500/10 text-red-400',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getRecentOrders()])
      .then(([statsData, ordersData]) => {
        setStats(statsData);
        setRecentOrders(ordersData);
      })
      .catch(err => console.error("Error loading dashboard", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div>
          <div className="h-6 bg-[#2a2a2d] rounded w-32 mb-2"></div>
          <div className="h-4 bg-[#2a2a2d] rounded w-48"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5 h-28 flex flex-col justify-between border-[#2a2a2d]">
              <div className="flex justify-between items-center">
                <div className="h-4 bg-[#2a2a2d] rounded w-20"></div>
                <div className="h-8 w-8 rounded bg-[#2a2a2d]"></div>
              </div>
              <div className="h-8 bg-[#2a2a2d] rounded w-24 mt-4"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card lg:col-span-2 p-5 min-h-[350px] border-[#2a2a2d]">
            <div className="h-5 bg-[#2a2a2d] rounded w-40 mb-6"></div>
            <div className="h-[250px] bg-[#2a2a2d] rounded w-full"></div>
          </div>
          <div className="card p-5 min-h-[350px] border-[#2a2a2d]">
            <div className="h-5 bg-[#2a2a2d] rounded w-32 mb-6"></div>
            <div className="space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="h-4 bg-[#2a2a2d] rounded w-24"></div>
                  <div className="h-4 bg-[#2a2a2d] rounded w-16"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    { name: 'Revenue', value: `$${(stats?.total_revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`, icon: DollarSign, change: '+12.5%' },
    { name: 'Orders', value: stats?.total_orders || 0, icon: ShoppingCart, change: '+3.2%' },
    { name: 'Products', value: stats?.total_products || 0, icon: Package, change: null },
    { name: 'Customers', value: stats?.total_customers || 0, icon: Users, change: null },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-lg font-semibold text-[#ededef]">Dashboard</h1>
        <p className="text-sm text-[#6e6e73] mt-0.5">Overview of your business metrics</p>
      </div>

      {stats?.low_stock_count > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
          <AlertTriangle size={16} className="text-amber-500 shrink-0" />
          <p className="text-sm text-amber-400/90">
            <span className="font-medium">{stats.low_stock_count} product{stats.low_stock_count > 1 ? 's' : ''}</span> running low on stock
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[#6e6e73] uppercase tracking-wider">{stat.name}</span>
              <stat.icon size={15} className="text-[#4e4e51]" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-2xl font-semibold text-[#ededef] tracking-tight">{stat.value}</span>
              {stat.change && (
                <span className="text-xs font-medium text-emerald-400 flex items-center gap-0.5 mb-1">
                  <ArrowUpRight size={12} />
                  {stat.change}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2 overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-[#2a2a2d]">
            <h2 className="text-sm font-medium text-[#ededef]">Revenue (Last 7 Days)</h2>
          </div>
          <div className="p-5 flex-1 min-h-[300px]">
            {stats?.chart_data ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chart_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2d" vertical={false} />
                  <XAxis dataKey="name" stroke="#6e6e73" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#6e6e73" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    cursor={{ fill: '#1e1e20' }} 
                    contentStyle={{ backgroundColor: '#19191b', borderColor: '#2a2a2d', borderRadius: '8px', color: '#ededef' }}
                    itemStyle={{ color: '#0070f3' }}
                  />
                  <Bar dataKey="revenue" fill="#0070f3" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-[#6e6e73]">Loading chart...</div>
            )}
          </div>
        </div>

        <div className="card overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-[#2a2a2d] flex items-center justify-between">
            <h2 className="text-sm font-medium text-[#ededef]">Recent Orders</h2>
            <span className="text-xs text-[#6e6e73]">Last 5 orders</span>
          </div>
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">Order</th>
                <th className="table-th">Customer</th>
                <th className="table-th">Amount</th>
                <th className="table-th">Status</th>
                <th className="table-th text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-[#19191b] transition-colors duration-100">
                  <td className="table-td font-medium text-[#ededef]">#{String(order.id).padStart(4, '0')}</td>
                  <td className="table-td">{order.customer_name}</td>
                  <td className="table-td font-medium text-[#ededef]">${order.total_amount.toFixed(2)}</td>
                  <td className="table-td">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-medium capitalize ${statusStyles[order.status] || ''}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="table-td text-right text-[#6e6e73]">
                    {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan="5" className="table-td text-center text-[#4e4e51] py-12">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
