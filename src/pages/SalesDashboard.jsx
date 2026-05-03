import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, 
  Users, RefreshCcw, Calendar, Download, Trophy, Star, X,
  AlertTriangle, LayoutDashboard, Store, ArrowRight
} from 'lucide-react';
import { api } from '../lib/api';
import { useStore } from '../store/useStore';
import { toast } from 'react-hot-toast';
import { clsx } from 'clsx';

const COLORS = ['#800000', '#D4AF37', '#22C55E', '#3B82F6', '#F59E0B', '#EF4444'];

const StatCard = ({ label, value, icon: Icon, color, isCurrency, formatCurrency, subtext }) => {
  const colors = {
    emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-600 border-emerald-100',
    blue: 'from-blue-500/20 to-blue-500/5 text-blue-600 border-blue-100',
    indigo: 'from-indigo-500/20 to-indigo-500/5 text-indigo-600 border-indigo-100',
    amber: 'from-amber-500/20 to-amber-500/5 text-amber-600 border-amber-100',
    violet: 'from-violet-500/20 to-violet-500/5 text-violet-600 border-violet-100',
    rose: 'from-rose-500/20 to-rose-500/5 text-rose-600 border-rose-100',
    slate: 'from-slate-500/20 to-slate-500/5 text-slate-600 border-slate-100',
    maroon: 'from-maroon/20 to-maroon/5 text-maroon border-maroon/10',
  };

  return (
    <div className="bg-white p-5 md:p-8 aspect-square flex flex-col justify-between rounded-[20px] md:rounded-[32px] border border-black/[0.05] shadow-premium hover:shadow-2xl transition-all duration-700 group relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors[color].split(' ')[0]} rounded-full -mr-16 -mt-16 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-[15px] md:rounded-[20px] bg-gradient-to-br ${colors[color]} border flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 shadow-sm`}>
          <Icon className="w-6 h-6 md:w-7 md:h-7" strokeWidth={2.5} />
        </div>
        
        <div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">{label}</p>
          <h3 className="text-2xl xl:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            {isCurrency ? formatCurrency(value) : value}
          </h3>
          {subtext && <p className="text-[10px] font-bold text-slate-400 mt-2">{subtext}</p>}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Real-time Insight</span>
        </div>
      </div>
    </div>
  );
};

const SalesDashboard = () => {
  const { selectedStore, setSelectedStore } = useStore();
  const [range, setRange] = useState('monthly');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 0 means All Stores, 1 Acharu, 2 TajaShutki
  const siteId = selectedStore === 'all' ? 0 : (selectedStore === 'acharu' ? 1 : 2);

  const ranges = [
    { id: 'daily', name: '24H' },
    { id: 'weekly', name: 'Weekly' },
    { id: 'monthly', name: 'Monthly' },
    { id: 'yearly', name: 'Yearly' },
  ];

  useEffect(() => {
    fetchStats();
  }, [range, selectedStore]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.getSalesStats(siteId || '', range); 
      setData(res);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch sales intelligence');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(val);
  };

  if (loading && !data) return (
    <div className="space-y-12 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {[1,2,3,4].map(i => <div key={i} className="aspect-square bg-white rounded-[32px] border border-slate-50" />)}
      </div>
      <div className="h-[600px] bg-white rounded-[50px] border border-slate-50" />
    </div>
  );

  const stats = [
    { label: 'Net Product Revenue', value: data?.total_product_price || 0, icon: ShoppingBag, color: 'emerald', isCurrency: true, subtext: 'Excluding delivery & returns' },
    { label: 'Delivery Revenue', value: (data?.total_delivery_charge - data?.logistics_loss) || 0, icon: Store, color: 'blue', isCurrency: true, subtext: 'From successful orders' },
    { label: 'Logistics Loss', value: data?.logistics_loss || 0, icon: AlertTriangle, color: 'rose', isCurrency: true, subtext: 'Lost on returns/cancelled' },
    { label: 'Real Margin', value: data?.total_revenue || 0, icon: DollarSign, color: 'maroon', isCurrency: true, subtext: 'After returns & logistics loss' },
    { label: 'Avg Order Value', value: data?.avg_order_value || 0, icon: Star, color: 'amber', isCurrency: true, subtext: 'Per transaction average' },
    { label: 'Avg Delivery Fee', value: data?.avg_delivery_fee || 0, icon: Calendar, color: 'blue', isCurrency: true, subtext: 'Per order average' },
    { label: 'Order Velocity', value: data?.total_orders || 0, icon: TrendingUp, color: 'violet', isCurrency: false, subtext: 'Successful order count' },
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* Dynamic Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-maroon/5 rounded-full border border-maroon/10">
            <LayoutDashboard size={14} className="text-maroon" />
            <span className="text-[10px] font-black uppercase tracking-widest text-maroon">Business Intelligence</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-black text-slate-900 tracking-tight leading-none">
            {selectedStore === 'all' ? 'Group' : (selectedStore === 'acharu' ? 'Acharu' : 'TajaShutki')} <span className="text-maroon italic">Insights.</span>
          </h1>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSelectedStore('all')}
              className={clsx(
                "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                selectedStore === 'all' ? "bg-maroon text-white" : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50"
              )}
            >Group View</button>
            <button 
              onClick={() => setSelectedStore('acharu')}
              className={clsx(
                "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                selectedStore === 'acharu' ? "bg-maroon text-white" : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50"
              )}
            >Acharu</button>
            <button 
              onClick={() => setSelectedStore('tajashutki')}
              className={clsx(
                "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                selectedStore === 'tajashutki' ? "bg-maroon text-white" : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50"
              )}
            >TajaShutki</button>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-1.5 bg-white/50 backdrop-blur-md p-1.5 rounded-[24px] md:rounded-[32px] border border-black/[0.03] shadow-sm">
          {ranges.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`px-4 md:px-8 py-2 md:py-4 rounded-[18px] md:rounded-[24px] text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
                range === r.id 
                  ? 'bg-slate-900 text-white shadow-2xl scale-105' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white'
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} formatCurrency={formatCurrency} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 md:p-12 rounded-[32px] md:rounded-[50px] border border-black/[0.02] shadow-premium relative overflow-hidden group">
          <div className="mb-12 flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Financial Trajectory</h3>
              <p className="text-slate-400 font-medium text-sm mt-1">Growth trends based on {range} data.</p>
            </div>
            {selectedStore === 'all' && (
              <div className="flex gap-4">
                {data?.site_breakdown?.map((site, i) => (
                  <div key={i} className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{site.name}</p>
                    <p className="text-sm font-black text-slate-900">{formatCurrency(site.revenue)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.chart_data || []}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#800000" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#800000" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} dy={20} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 900}} tickFormatter={(val) => `৳${val}`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '32px', border: 'none', boxShadow: '0 40px 60px -15px rgb(0 0 0 / 0.1)', padding: '24px' }}
                  cursor={{ stroke: '#800000', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area type="monotone" dataKey="sales" stroke="#800000" strokeWidth={5} fillOpacity={1} fill="url(#colorSales)" animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white p-6 md:p-12 rounded-[32px] md:rounded-[50px] border border-black/[0.02] shadow-premium flex flex-col">
          <div className="mb-12">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Order Lifecycle</h3>
            <p className="text-slate-400 font-medium text-sm mt-1">Status distribution analysis.</p>
          </div>
          
          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.status_distribution || []}
                  cx="50%" cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="status"
                >
                  {(data?.status_distribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 space-y-3">
            {data?.status_distribution?.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="font-black uppercase tracking-widest text-slate-500">{item.status}</span>
                </div>
                <span className="font-black text-slate-900">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Inventory Health */}
        <div className="bg-white p-6 md:p-12 rounded-[32px] md:rounded-[50px] border border-black/[0.02] shadow-premium">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-[24px] flex items-center justify-center shadow-sm">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Inventory Health</h3>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Low Stock Warning</p>
              </div>
            </div>
            <button className="text-[10px] font-black uppercase tracking-widest text-maroon hover:underline">View All</button>
          </div>

          <div className="space-y-6">
            {data?.low_stock_products?.map((product, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-[24px] border border-slate-50 hover:border-maroon/20 hover:bg-maroon/[0.02] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden">
                    <img src={product.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800">{product.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Store ID: {product.site_id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {product.stock} left
                  </span>
                </div>
              </div>
            ))}
            {(!data?.low_stock_products || data.low_stock_products.length === 0) && (
              <div className="text-center py-10 text-slate-400 text-[10px] font-black uppercase tracking-widest italic">
                Inventory is healthy. All items well stocked.
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 md:p-12 rounded-[32px] md:rounded-[50px] border border-black/[0.02] shadow-premium">
          <div className="flex items-center gap-5 mb-12">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-[24px] flex items-center justify-center shadow-sm">
              <Trophy className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Market Leaders</h3>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Top Performing SKUs</p>
            </div>
          </div>

          <div className="space-y-6">
            {data?.top_products?.map((product, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-[24px] border border-slate-50 hover:bg-slate-50 transition-all">
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black shadow-lg">
                    #{i + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 line-clamp-1">{product.name}</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{product.units} Units Sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-slate-900">{formatCurrency(product.revenue)}</p>
                  <div className="flex items-center justify-end gap-1.5 text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-1">
                    <TrendingUp size={12} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
