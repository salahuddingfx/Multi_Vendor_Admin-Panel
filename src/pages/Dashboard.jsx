import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../lib/api';
import { 
  TrendingUp, 
  ShoppingBag, 
  Package,
  ArrowUpRight,
  Clock
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area 
} from 'recharts';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const Dashboard = () => {
  const { selectedStore } = useStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const data = await api.getDashboardStats(selectedStore);
      setStats(data);
      setLoading(false);
    };
    fetchStats();
  }, [selectedStore]);

  if (loading) return (
    <div className="animate-pulse space-y-12">
      <div className="h-20 bg-white/50 rounded-3xl w-1/3" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[1,2,3,4].map(i => <div key={i} className="h-48 bg-white rounded-[40px]" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-[500px] bg-white rounded-[48px]" />
        <div className="h-[500px] bg-white rounded-[48px]" />
      </div>
    </div>
  );

  const themeColor = selectedStore === 'acharu' ? '#800000' : '#475569';
  const data = stats.chartData;
  const statItems = [
    { name: 'Total Sales', value: `৳${stats.totalSales.toLocaleString()}`, icon: TrendingUp, change: '12.5', isUp: true },
    { name: 'Orders', value: stats.totalOrders, icon: ShoppingBag, change: '5.2', isUp: true },
    { name: 'Products', value: stats.activeProducts, icon: Package, change: '0.0', isUp: true },
    { name: 'Low Stock', value: stats.lowStock, icon: Clock, change: '2.0', isUp: false },
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="w-12 h-1 rounded-full" style={{ backgroundColor: themeColor }} />
            <span className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Overview Analytics</span>
          </div>
          <h1 className="text-5xl font-display font-black text-slate-800 tracking-tight">
            Welcome back, <span style={{ color: themeColor }}>Admin</span>
          </h1>
          <p className="text-slate-400 font-medium text-lg">Here's the latest performance for {selectedStore === 'acharu' ? 'Acharu' : 'Taja Shutki'}.</p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="bg-white/50 backdrop-blur-md p-2 rounded-2xl border border-white/60 shadow-sm flex items-center gap-2">
              <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: themeColor }} />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest px-2">Live Status</span>
           </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statItems.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-white rounded-[40px] p-8 shadow-premium border border-black/[0.01] hover:scale-[1.03] transition-all duration-500 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700 opacity-50" />
            
            <div className="relative flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-sm">
                  <item.icon size={26} />
                </div>
                <div className={clsx(
                  "px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5",
                  item.isUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                )}>
                  {item.isUp ? '↑' : '↓'} {item.change}%
                </div>
              </div>
              
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{item.name}</p>
                <h3 className="text-4xl font-display font-black text-slate-800 tracking-tight">
                  {item.value}
                </h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[48px] p-10 shadow-premium border border-black/[0.01] relative overflow-hidden">
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h3 className="text-2xl font-display font-black text-slate-800 tracking-tight">Sales Performance</h3>
              <p className="text-slate-400 text-sm font-medium mt-1">Daily revenue trends</p>
            </div>
            <select className="bg-slate-50 border-none rounded-2xl px-6 py-3 text-sm font-bold text-slate-600 outline-none focus:ring-4 focus:ring-slate-100 transition-all cursor-pointer">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          
          <div className="h-[400px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={themeColor} stopOpacity={0.15}/>
                    <stop offset="95%" stopColor={themeColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
                    padding: '20px'
                  }}
                  itemStyle={{ fontWeight: 800, color: themeColor }}
                  labelStyle={{ fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={themeColor} 
                  strokeWidth={5}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-[48px] p-10 shadow-premium border border-black/[0.01]">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-display font-black text-slate-800 tracking-tight">Recent Orders</h3>
            <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
              <ArrowUpRight size={20} />
            </button>
          </div>
          
          <div className="space-y-6">
            {stats.recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center gap-5 p-5 rounded-[32px] hover:bg-slate-50 transition-all group cursor-pointer border border-transparent hover:border-slate-100">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:shadow-md transition-all">
                  <ShoppingBag size={22} />
                </div>
                <div className="flex-grow">
                  <p className="font-black text-slate-800 text-sm tracking-tight">Order #{sale.id}</p>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">{sale.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-display font-black text-slate-800 text-lg">৳{sale.amount}</p>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 ml-auto mt-2" />
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-10 py-5 rounded-[28px] bg-slate-50 text-slate-800 font-black text-sm uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-sm">
            View All Transactions
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
