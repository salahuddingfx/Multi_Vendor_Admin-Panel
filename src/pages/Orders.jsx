import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Search, Filter, Printer, ExternalLink, ChevronRight, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import InvoiceTemplate from '../components/InvoiceTemplate';
import { api } from '../lib/api';
import { clsx } from 'clsx';

const mockOrders = [
  {
    id: 'ord-8291-xa',
    siteId: 'acharu',
    customerName: 'Rahat Islam',
    phone: '01712-345678',
    address: 'House 12, Road 4, Sector 7, Uttara, Dhaka',
    items: [
      { name: 'Naga King Pickle', price: 450, quantity: 2, weight: '500g' },
      { name: 'Garlic Special Pickle', price: 350, quantity: 1, weight: '500g' }
    ],
    subtotal: 1250,
    shipping: 60,
    total: 1310,
    status: 'Processed',
    date: '2026-05-01T08:12:00Z'
  },
  {
    id: 'ord-7162-bt',
    siteId: 'tajashutki',
    customerName: 'Anika Rahman',
    phone: '01822-987654',
    address: 'Flat 4A, Green View Tower, GEC, Chittagong',
    items: [
      { name: 'Sun-Dried Loitta', price: 650, quantity: 1, weight: '500g' },
      { name: 'Premium Rupchanda', price: 1200, quantity: 1, weight: '250g' }
    ],
    subtotal: 1850,
    shipping: 100,
    total: 1950,
    status: 'Order Received',
    date: '2026-05-01T09:45:00Z'
  },
  {
    id: 'ord-9921-cc',
    siteId: 'acharu',
    customerName: 'Farhan Ahmed',
    phone: '01911-223344',
    address: 'Road 12, Banani, Dhaka',
    items: [
      { name: 'Mango Khatta Pickle', price: 280, quantity: 3, weight: '250g' }
    ],
    subtotal: 840,
    shipping: 60,
    total: 900,
    status: 'Delivered',
    date: '2026-04-30T14:20:00Z'
  }
];

const statusStyles = {
  'placed': 'bg-blue-50 text-blue-600 border-blue-100',
  'confirmed': 'bg-indigo-50 text-indigo-600 border-indigo-100',
  'packed': 'bg-purple-50 text-purple-600 border-purple-100',
  'shipped': 'bg-amber-50 text-amber-600 border-amber-100',
  'delivered': 'bg-emerald-50 text-emerald-600 border-emerald-100',
  'cancelled': 'bg-rose-50 text-rose-600 border-rose-100',
};

const Orders = () => {
  const { selectedStore } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOrder, setActiveOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const printRef = useRef();

  const siteId = selectedStore === 'acharu' ? 1 : 2;

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await api.getOrders(siteId);
        setOrders(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [selectedStore]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         order.tracking_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'All' || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
  });

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      alert('Failed to update status');
      console.error(err);
    }
  };

  const handlePaymentStatusChange = async (orderId, newStatus) => {
    try {
      await api.updatePaymentStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: newStatus } : o));
    } catch (err) {
      alert('Failed to update payment status');
      console.error(err);
    }
  };

  const handleExport = () => {
    const data = filteredOrders.map(o => ({
      ID: o.tracking_id,
      Customer: o.customer_name,
      Phone: o.customer_phone,
      Total: o.total_amount,
      Status: o.status,
      Date: new Date(o.created_at).toLocaleDateString()
    }));
    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${selectedStore}-${new Date().toLocaleDateString()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order Management</h1>
          <p className="text-slate-500 font-medium">Fulfill and track your customer orders</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none flex items-center gap-2 px-10 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:border-slate-300 transition-all shadow-sm outline-none cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="placed">Placed</option>
              <option value="confirmed">Confirmed</option>
              <option value="packed">Packed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
          >
            Export Data
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Pending', count: '12', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Processing', count: '08', icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'On Route', count: '05', icon: Truck, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Completed', count: '142', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5">
            <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center", stat.bg)}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900 leading-tight">{stat.count}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-bottom border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by ID or Name..."
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:ring-4 focus:ring-slate-100 focus:border-slate-200 outline-none transition-all text-sm font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Store:</span>
            <span className="px-4 py-1.5 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-600">
              {selectedStore}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Order Details</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Products</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Total</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 text-sm">#{order.tracking_id.toUpperCase()}</span>
                      <span className="text-slate-400 text-[10px] mt-1">{new Date(order.created_at).toLocaleString()}</span>
                      <div className="mt-2 flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded w-fit">
                          {order.payment_method?.toUpperCase()}
                        </span>
                        {order.transaction_id && (
                          <span className="text-[10px] font-medium text-slate-400">Trx: {order.transaction_id}</span>
                        )}
                        {order.sender_number && (
                          <span className="text-[10px] font-medium text-slate-400">From: {order.sender_number}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800 text-sm">{order.customer_name}</span>
                      <span className="text-slate-400 text-xs mt-0.5">{order.customer_phone}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">{item.quantity}x</span>
                          <span className="text-xs font-medium text-slate-600 truncate max-w-[150px]">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900">৳{order.total_amount}</span>
                      <select 
                        value={order.payment_status || 'unpaid'}
                        onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                        className={clsx(
                          "text-[10px] font-black uppercase mt-1 bg-transparent border-none outline-none cursor-pointer",
                          order.payment_status === 'paid' ? 'text-emerald-500' : 'text-rose-500'
                        )}
                      >
                        <option value="unpaid">Unpaid</option>
                        <option value="paid">Paid</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <select 
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className={clsx(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border outline-none cursor-pointer",
                        statusStyles[order.status] || "bg-slate-50 text-slate-600 border-slate-100"
                      )}
                    >
                      <option value="placed">Placed</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="packed">Packed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => { setActiveOrder(order); setTimeout(handlePrint, 100); }}
                        className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl border border-transparent hover:border-slate-100 transition-all shadow-none hover:shadow-sm"
                        title="Print Invoice"
                      >
                        <Printer size={18} />
                      </button>
                      <button className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl border border-transparent hover:border-slate-100 transition-all shadow-none hover:shadow-sm">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hidden Invoice Component for Printing */}
      <InvoiceTemplate ref={printRef} order={activeOrder} />
    </div>
  );
};

export default Orders;
