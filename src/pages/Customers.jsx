import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  Search, 
  Filter, 
  ChevronRight, 
  ShoppingBag, 
  Target, 
  Crown,
  Phone,
  MapPin,
  TrendingUp,
  Download,
  Mail,
  MoreVertical,
  Gift
} from 'lucide-react';
import { api } from '../lib/api';
import { useStore } from '../store/useStore';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const Customers = () => {
  const { selectedStore } = useStore();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const siteId = selectedStore === 'acharu' ? 1 : 2;

  useEffect(() => {
    fetchCustomers();
  }, [selectedStore]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.getCustomers(siteId);
      setCustomers(res?.data || []);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      toast.error('Failed to fetch customer data');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.customer_phone.includes(searchQuery)
  );

  const topCustomers = [...customers].sort((a, b) => b.total_spent - a.total_spent).slice(0, 3);
  const totalRevenue = customers.reduce((acc, c) => acc + parseFloat(c.total_spent), 0);

  const Skeleton = () => (
    <div className="space-y-10 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-10 w-64 bg-slate-100 rounded-2xl" />
          <div className="h-4 w-48 bg-slate-100 rounded-xl" />
        </div>
        <div className="h-12 w-40 bg-slate-100 rounded-2xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-40 bg-slate-100 rounded-[40px]" />
        ))}
      </div>
      <div className="bg-white rounded-[48px] h-[500px] bg-slate-50/50" />
    </div>
  );

  if (loading) {
    return <div className="p-4 md:p-8"><Skeleton /></div>;
  }

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-1 rounded-full bg-maroon" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Customer Intelligence</span>
          </div>
          <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight">Customer CRM</h1>
          <p className="text-slate-500 font-medium mt-1">Identify top buyers and manage relationships for {selectedStore === 'acharu' ? 'Acharu' : 'Taja Shutki'}.</p>
        </motion.div>
        
        <button 
          className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200"
          onClick={() => toast.info('Exporting customer data...')}
        >
          <Download size={18} /> Export Data
        </button>
      </div>

      {/* Hero Stats (Top Buyers) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {topCustomers.length > 0 ? topCustomers.map((customer, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[40px] border border-black/[0.02] shadow-premium group relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-maroon/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
             
             <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 rounded-2xl bg-maroon/10 text-maroon flex items-center justify-center">
                  {i === 0 ? <Crown size={32} /> : <Target size={28} />}
                </div>
                <div className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100">
                  {i === 0 ? 'Top Buyer' : `Rank #${i+1}`}
                </div>
             </div>
             
             <div>
               <h3 className="text-xl font-black text-slate-900 mb-1 group-hover:text-maroon transition-colors">{customer.customer_name}</h3>
               <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 mb-6">
                 <Phone size={12} /> {customer.customer_phone}
               </p>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-50/50 p-4 rounded-2xl">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Spent</p>
                   <p className="text-lg font-black text-slate-900">৳{parseFloat(customer.total_spent).toLocaleString()}</p>
                 </div>
                 <div className="bg-slate-50/50 p-4 rounded-2xl">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Orders</p>
                   <p className="text-lg font-black text-slate-900">{customer.total_orders}</p>
                 </div>
               </div>
             </div>
          </motion.div>
        )) : (
          [1,2,3].map(i => <div key={i} className="h-48 bg-white rounded-[40px] shadow-sm border border-slate-100 animate-pulse" />)
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-[48px] border border-black/[0.02] shadow-premium overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between gap-8 bg-slate-50/30">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-maroon transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or phone..."
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-maroon/5 focus:border-maroon outline-none transition-all text-sm font-bold text-slate-800 placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 p-1.5 bg-slate-100/50 rounded-2xl">
            {['all', 'high-spenders', 'new'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeTab === tab ? "bg-white text-maroon shadow-md" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer Info</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Engagement</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Total Spent</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Last Order</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredCustomers.map((customer, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-maroon group-hover:text-white transition-all">
                        <UsersIcon size={20} />
                      </div>
                      <div>
                        <span className="block font-black text-slate-900 text-base leading-tight mb-1">{customer.customer_name}</span>
                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                          <Phone size={10} /> {customer.customer_phone}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <ShoppingBag size={14} className="text-slate-400" />
                        <span className="text-sm font-black text-slate-700">{customer.total_orders} Orders</span>
                      </div>
                      <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-maroon rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min(100, (customer.total_orders / 10) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex flex-col">
                       <span className="text-base font-black text-slate-900">৳{parseFloat(customer.total_spent).toLocaleString()}</span>
                       <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold uppercase tracking-tight">
                         <TrendingUp size={10} /> High Value
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <span className="text-sm font-bold text-slate-500 italic">
                      {new Date(customer.last_order_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-maroon hover:shadow-lg transition-all"
                        onClick={() => toast.info('Customer profile view coming soon!')}
                      >
                        <Gift size={18} />
                      </button>
                      <button 
                        className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 hover:shadow-lg transition-all"
                      >
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredCustomers.length === 0 && (
            <div className="py-20 text-center">
              <UsersIcon size={48} className="mx-auto text-slate-100 mb-4" />
              <p className="text-slate-400 font-bold">No customers found matching your search</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Customers;
