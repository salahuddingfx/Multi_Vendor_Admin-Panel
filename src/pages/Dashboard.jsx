import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import api from '../lib/api';
import { 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { clsx } from 'clsx';

const Dashboard = () => {
  const { selectedStore } = useStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const siteId = selectedStore === 'acharu' ? 1 : 2;

  useEffect(() => {
    fetchStats();
  }, [selectedStore]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/stats?site_id=${siteId}`);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-slate-400 animate-spin" />
        <p className="text-slate-500 font-medium">Crunching numbers...</p>
      </div>
    );
  }

  const statCards = [
    { 
      label: 'Total Revenue', 
      value: `৳${stats.total_sales.toLocaleString()}`, 
      icon: TrendingUp, 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50',
      trend: '+12.5%',
      trendUp: true
    },
    { 
      label: 'Total Orders', 
      value: stats.total_orders, 
      icon: ShoppingBag, 
      color: 'text-blue-600', 
      bg: 'bg-blue-50',
      trend: '+5.2%',
      trendUp: true
    },
    { 
      label: 'Active Products', 
      value: stats.active_products, 
      icon: Package, 
      color: 'text-amber-600', 
      bg: 'bg-amber-50',
      trend: '0%',
      trendUp: true
    },
    { 
      label: 'Low Stock', 
      value: stats.low_stock_products, 
      icon: AlertCircle, 
      color: 'text-rose-600', 
      bg: 'bg-rose-50',
      trend: '-2',
      trendUp: false
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Welcome Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-black text-slate-800 mb-2">
            Store <span className="text-slate-400">Overview</span>
          </h1>
          <p className="text-slate-500 font-medium italic">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="hidden md:flex items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-soft border border-black/[0.02]">
          <Clock size={18} className="text-slate-400" />
          <span className="text-sm font-black uppercase tracking-widest text-slate-500">
            {format(new Date(), 'EEEE, dd MMMM')}
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={stat.label}
            className="bg-white p-8 rounded-[32px] border border-black/[0.02] shadow-premium group hover:-translate-y-2 transition-all duration-500"
          >
            <div className="flex justify-between items-start mb-6">
              <div className={clsx("p-4 rounded-2xl transition-all duration-500 group-hover:scale-110", stat.bg, stat.color)}>
                <stat.icon size={24} />
              </div>
              <div className={clsx(
                "flex items-center gap-1 text-[10px] font-black px-3 py-1 rounded-full",
                stat.trendUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              )}>
                {stat.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.trend}
              </div>
            </div>
            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">{stat.label}</h3>
            <p className="text-3xl font-display font-black text-slate-800 tracking-tight">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white p-8 md:p-10 rounded-[40px] border border-black/[0.02] shadow-premium"
        >
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-display font-black text-slate-800">Revenue Analytics</h3>
            <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-xs font-bold text-slate-500 outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chart_data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={selectedStore === 'acharu' ? '#800000' : '#475569'} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={selectedStore === 'acharu' ? '#800000' : '#475569'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    padding: '16px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke={selectedStore === 'acharu' ? '#800000' : '#475569'} 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-8 md:p-10 rounded-[40px] border border-black/[0.02] shadow-premium flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-display font-black text-slate-800">Recent Orders</h3>
            <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors">View All</button>
          </div>
          
          <div className="space-y-6 flex-grow">
            {stats.recent_orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm leading-none mb-1">#{order.tracking_id}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{order.customer_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-800 text-sm mb-1">৳{order.total_amount}</p>
                  <span className={clsx(
                    "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                    order.status === 'delivered' ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  )}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}

            {stats.recent_orders.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag size={24} className="text-slate-200" />
                </div>
                <p className="text-sm font-bold text-slate-400">No recent orders yet.</p>
              </div>
            )}
          </div>

          <div className="mt-10 p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={18} className="text-emerald-500" />
              <p className="text-xs font-bold text-slate-600">Your store is performing <span className="text-emerald-600 font-black">20% better</span> than last month!</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
