import React, { useState, useEffect, useRef } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, ShoppingBag, 
  Users, RefreshCcw, Calendar as CalendarIcon, Download, Trophy, Star, X,
  AlertTriangle, LayoutDashboard, Store, ArrowRight, ChevronLeft, ChevronRight
} from 'lucide-react';
import { api } from '../lib/api';
import { useStore } from '../store/useStore';
import { toast } from 'react-hot-toast';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#800000', '#D4AF37', '#22C55E', '#3B82F6', '#F59E0B', '#EF4444'];

const CustomCalendar = ({ value, onChange, label, color = "maroon" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const calendarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1));
  };

  const handleDateClick = (day) => {
    const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    // Format to YYYY-MM-DD for consistency
    const formattedDate = selectedDate.toISOString().split('T')[0];
    onChange(formattedDate);
    setIsOpen(false);
  };

  const renderDays = () => {
    const days = [];
    const totalDays = daysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const firstDay = firstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
    const selectedDay = value ? new Date(value).getDate() : null;
    const isSelectedMonth = value ? new Date(value).getMonth() === viewDate.getMonth() && new Date(value).getFullYear() === viewDate.getFullYear() : false;

    // Empty spaces for first week
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }

    for (let d = 1; d <= totalDays; d++) {
      const isSelected = isSelectedMonth && selectedDay === d;
      days.push(
        <button
          key={d}
          onClick={() => handleDateClick(d)}
          className={clsx(
            "h-10 w-full rounded-xl text-xs font-black transition-all flex items-center justify-center",
            isSelected 
              ? (color === "maroon" ? "bg-maroon text-white shadow-lg shadow-maroon/20 scale-110" : "bg-slate-900 text-white shadow-lg scale-110")
              : "text-slate-600 hover:bg-slate-100"
          )}
        >
          {d}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="relative" ref={calendarRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center bg-white border border-slate-100 rounded-[28px] p-2 pr-6 shadow-sm hover:shadow-xl transition-all duration-500 min-w-[240px] cursor-pointer"
      >
        <div className={clsx(
          "w-14 h-14 rounded-[22px] flex flex-col items-center justify-center shadow-lg transition-transform group-hover:scale-105",
          color === "maroon" ? "bg-maroon text-white shadow-maroon/20" : "bg-slate-900 text-white shadow-slate-900/20"
        )}>
          <span className="text-[8px] font-black uppercase tracking-tighter opacity-70">{label}</span>
          <CalendarIcon size={20} strokeWidth={2.5} />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Select Date</p>
          <p className="text-sm font-black text-slate-900">{value || "Pick a date"}</p>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full mb-4 left-0 w-[320px] bg-white rounded-[32px] shadow-2xl border border-slate-100 p-6 z-[100]"
          >
            <div className="flex items-center justify-between mb-6">
              <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ChevronLeft size={20} className="text-slate-400" />
              </button>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                {viewDate.toLocaleString('default', { month: 'long' })} {viewDate.getFullYear()}
              </h4>
              <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <ChevronRight size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="h-8 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {renderDays()}
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between">
               <button onClick={() => { onChange(''); setIsOpen(false); }} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500">Clear</button>
               <button onClick={() => { handleDateClick(new Date().getDate()); setIsOpen(false); }} className="text-[10px] font-black uppercase tracking-widest text-maroon">Today</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 0 means All Stores, 1 Acharu, 2 TajaShutki
  const siteId = selectedStore === 'all' ? 0 : (selectedStore === 'acharu' ? 1 : 2);

  const ranges = [
    { id: 'daily', name: '24H' },
    { id: 'weekly', name: 'Weekly' },
    { id: 'monthly', name: 'Monthly' },
    { id: '90days', name: '90D' },
    { id: 'yearly', name: 'Yearly' },
  ];

  useEffect(() => {
    // If dates are picked, we ignore the predefined range
    if (!startDate && !endDate) {
      fetchStats();
    }
  }, [range, selectedStore]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.getSalesStats(siteId || '', range, startDate, endDate); 
      setData(res);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch sales intelligence');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomFilter = (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }
    fetchStats();
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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
    { label: 'Total Returns', value: data?.total_returns || 0, icon: RefreshCcw, color: 'rose', isCurrency: true, subtext: 'Product value returned' },
    { label: 'Logistics Loss', value: data?.logistics_loss || 0, icon: AlertTriangle, color: 'rose', isCurrency: true, subtext: 'Lost on returns/cancelled' },
    { label: 'Real Margin', value: data?.total_revenue || 0, icon: DollarSign, color: 'maroon', isCurrency: true, subtext: 'Final profit estimation' },
    { label: 'Avg Order Value', value: data?.avg_order_value || 0, icon: Star, color: 'amber', isCurrency: true, subtext: 'Net average per order' },
    { label: 'Cancelled Value', value: data?.total_cancelled_value || 0, icon: X, color: 'slate', isCurrency: true, subtext: `${data?.total_cancelled_orders || 0} orders cancelled` },
    { label: 'Order Velocity', value: data?.total_orders || 0, icon: TrendingUp, color: 'violet', isCurrency: false, subtext: 'Successful order count' },
    { label: 'Growth Index', value: data?.total_customers || 0, icon: Users, color: 'indigo', isCurrency: false, subtext: 'Unique customers reached' },
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* Dynamic Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-maroon/5 rounded-full border border-maroon/10">
            <LayoutDashboard size={14} className="text-maroon" />
            <span className="text-[10px] font-black uppercase tracking-widest text-maroon">Master Intelligence</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-black text-slate-900 tracking-tight leading-none">
            Sales <span className="text-maroon italic">Master.</span>
          </h1>
          
          <div className="flex items-center gap-3">
            {['all', 'acharu', 'tajashutki'].map((s) => (
              <button 
                key={s}
                onClick={() => setSelectedStore(s)}
                className={clsx(
                  "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                  selectedStore === s ? "bg-maroon text-white" : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50"
                )}
              >{s === 'all' ? 'Group View' : (s === 'acharu' ? 'Acharu' : 'TajaShutki')}</button>
            ))}
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
          {/* Quick Range Selector stays at top for convenience */}
          <div className="flex items-center gap-1.5 bg-white/50 backdrop-blur-md p-1.5 rounded-[24px] border border-black/[0.03] shadow-sm w-full md:w-auto overflow-x-auto scrollbar-hide">
            {ranges.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setRange(r.id);
                  setStartDate('');
                  setEndDate('');
                }}
                className={`px-6 py-3 rounded-[18px] text-[9px] font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap ${
                  range === r.id && !startDate
                    ? 'bg-slate-900 text-white shadow-xl scale-105' 
                    : 'text-slate-400 hover:text-slate-600 hover:bg-white'
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} formatCurrency={formatCurrency} />
        ))}
      </div>

      {/* Main Financial Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 md:p-12 rounded-[32px] md:rounded-[50px] border border-black/[0.02] shadow-premium relative overflow-hidden group">
          <div className="mb-12 flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Financial Trajectory</h3>
              <p className="text-slate-400 font-medium text-sm mt-1">Growth trends for the selected period.</p>
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

        {/* Order Lifecycle Breakdown */}
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

          <div className="mt-8 space-y-4">
            {data?.status_distribution?.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="font-black uppercase tracking-widest text-slate-500 text-[9px]">{item.status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900 text-sm">{item.count}</span>
                  <span className="text-[10px] font-bold text-slate-400">Orders</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Market Leaders (Deep Product Stats) */}
        <div className="bg-white p-6 md:p-12 rounded-[32px] md:rounded-[50px] border border-black/[0.02] shadow-premium">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-[24px] flex items-center justify-center shadow-sm">
                <Trophy className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Market Leaders</h3>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Top Performing SKUs</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {data?.top_products?.map((product, i) => (
              <div key={i} className="flex items-center justify-between p-6 rounded-[28px] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-500 group">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-sm font-black shadow-lg group-hover:rotate-6 transition-transform">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 line-clamp-1">{product.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        <ShoppingBag size={12} /> {product.units} Units Sold
                      </span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full" />
                      <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                        <TrendingUp size={12} /> Trending
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-black text-slate-900">{formatCurrency(product.revenue)}</p>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Gross Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Integrity (Loss & Returns Analysis) */}
        <div className="bg-white p-6 md:p-12 rounded-[32px] md:rounded-[50px] border border-black/[0.02] shadow-premium">
          <div className="flex items-center gap-5 mb-12">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-[24px] flex items-center justify-center shadow-sm">
              <RefreshCcw className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Financial Leakage</h3>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Loss & Return Analysis</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-8 rounded-[32px] bg-rose-50/50 border border-rose-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform duration-700">
                <AlertTriangle size={80} />
              </div>
              <h4 className="text-xs font-black text-rose-400 uppercase tracking-[0.2em] mb-4">Total Value at Risk</h4>
              <div className="flex items-end gap-3 mb-6">
                <p className="text-5xl font-black text-rose-600 tracking-tighter">
                  {formatCurrency((data?.total_returns || 0) + (data?.logistics_loss || 0))}
                </p>
                <p className="text-rose-400 font-bold text-sm mb-2 italic">Total Leakage</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-rose-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Product Returns</p>
                  <p className="text-lg font-black text-slate-800">{formatCurrency(data?.total_returns || 0)}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-rose-50">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Logistics Loss</p>
                  <p className="text-lg font-black text-slate-800">{formatCurrency(data?.logistics_loss || 0)}</p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100">
               <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Integrity Summary</h4>
               <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-600">Successful Collections</span>
                    <span className="text-sm font-black text-emerald-600">{formatCurrency(data?.total_revenue || 0)}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full" 
                      style={{ width: `${(data?.total_revenue / (data?.total_revenue + data?.total_returns + data?.logistics_loss)) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mt-2">
                    {Math.round((data?.total_revenue / (data?.total_revenue + data?.total_returns + data?.logistics_loss)) * 100)}% Revenue Integrity Score
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Master Audit & Transaction Timeline */}
      <div className="mt-10 bg-white rounded-[32px] md:rounded-[50px] border border-black/[0.02] shadow-premium overflow-hidden">
        <div className="p-8 md:p-12 border-b border-slate-50 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-slate-900 text-white rounded-[24px] flex items-center justify-center shadow-xl">
              <Download className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Master Transaction Report</h3>
              <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">Audit log & event history</p>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row items-stretch gap-6 w-full lg:w-auto mt-8 lg:mt-0">
            <div className="flex flex-col gap-3">
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 px-2">Audit Range Selection</span>
               <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Start Date Custom Calendar */}
                  <CustomCalendar 
                    label="From"
                    value={startDate}
                    onChange={setStartDate}
                    color="maroon"
                  />

                  <div className="w-8 h-px bg-slate-200 hidden sm:block" />

                  {/* End Date Custom Calendar */}
                  <CustomCalendar 
                    label="To"
                    value={endDate}
                    onChange={setEndDate}
                    color="slate"
                  />

                  <button 
                    onClick={handleCustomFilter}
                    className="h-14 px-10 bg-maroon text-white rounded-[22px] text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-maroon/30 hover:shadow-maroon/50 hover:scale-[1.02] active:scale-95 transition-all duration-500 flex items-center gap-3 group"
                  >
                    Run Audit <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
               </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Activity</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">ID</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Subject</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Details</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data?.timeline?.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        item.type === 'order' ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                      )}>
                        {item.type === 'order' ? <ShoppingBag size={14} /> : <RefreshCcw size={14} />}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{item.type}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-xs font-black text-slate-900">#{item.id}</td>
                  <td className="px-8 py-6 text-xs font-bold text-slate-600">{item.title}</td>
                  <td className="px-8 py-6 text-sm font-black text-slate-900">{formatCurrency(item.value)}</td>
                  <td className="px-8 py-6">
                    <span className={clsx(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                      item.type === 'order' 
                        ? (item.detail === 'delivered' ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600")
                        : "bg-rose-50 text-rose-600"
                    )}>
                      {item.detail || 'Processed'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-black text-slate-900">{new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {(!data?.timeline || data.timeline.length === 0) && (
                <tr>
                  <td colSpan="6" className="px-8 py-20 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
                    No transactions found for the selected period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;
