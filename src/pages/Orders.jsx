import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Search, Filter, Printer, ExternalLink, ChevronRight, ChevronDown, Package, Truck, CheckCircle, Clock, Edit2, Trash2, X } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import InvoiceTemplate from '../components/InvoiceTemplate';
import BulkInvoiceTemplate from '../components/BulkInvoiceTemplate';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { usePolling } from '../hooks/usePolling';
import ConfirmModal from '../components/ConfirmModal';
import { motion, AnimatePresence } from 'framer-motion';



const statuses = [
  { value: 'all', label: 'All Orders' },
  { value: 'placed', label: 'Placed' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'returned', label: 'Returned' },
  { value: 'cancelled', label: 'Cancelled' },
];

const getStatusStyle = (status) => {
  switch (status) {
    case 'placed': return 'bg-blue-50 text-blue-600 border-blue-100';
    case 'confirmed': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
    case 'packed': return 'bg-purple-50 text-purple-600 border-purple-100';
    case 'shipped': return 'bg-amber-50 text-amber-600 border-amber-100';
    case 'delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    case 'returned': return 'bg-orange-50 text-orange-600 border-orange-100';
    case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
    default: return 'bg-slate-50 text-slate-600 border-slate-100';
  }
};

const Orders = () => {
  const { selectedStore, isSidebarOpen } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOrder, setActiveOrder] = useState(null);
  const [printType, setPrintType] = useState('standard');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editForm, setEditForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    location: ''
  });
  const Skeleton = () => (
    <div className="space-y-8 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-slate-100 rounded-xl" />
          <div className="h-4 w-48 bg-slate-100 rounded-lg" />
        </div>
        <div className="flex gap-3">
          <div className="h-12 w-40 bg-slate-100 rounded-2xl" />
          <div className="h-12 w-40 bg-slate-100 rounded-2xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-28 bg-slate-100 rounded-[32px]" />
        ))}
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 h-[600px] bg-slate-50/50" />
    </div>
  );

  const printRef = useRef();
  const bulkPrintRef = useRef();

  const siteId = selectedStore === 'acharu' ? 1 : 2;

  const fetchOrders = async (isSilent = false) => {
    if (!orders.length && !isSilent) setLoading(true);
    try {
      const res = await api.getOrders(siteId);
      if (res && res.data && Array.isArray(res.data.data)) {
        setOrders(res.data.data);
      } else if (res && Array.isArray(res.data)) {
        setOrders(res.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      if (!isSilent) setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStore]);

  // Auto-refresh orders every 10 seconds
  usePolling(() => fetchOrders(true), 10000, [selectedStore]);

  const filteredOrders = (Array.isArray(orders) ? orders : []).filter(order => {
    const customerName = order.customer_name || '';
    const trackingId = order.tracking_id || '';
    
    const matchesSearch = customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         trackingId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || filterStatus === 'All' || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handlePrint = useReactToPrint({
    contentRef: printRef,
  });

  const handleBulkPrint = useReactToPrint({
    contentRef: bulkPrintRef,
  });

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order marked as ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handlePaymentStatusChange = async (orderId, newStatus) => {
    try {
      await api.updatePaymentStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: newStatus } : o));
      toast.success(`Payment status: ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update payment status');
    }
  };

  const handleUpdateOrder = async () => {
    try {
      const res = await api.updateOrder(editingOrder.id, editForm);
      const updatedOrder = res.data;
      setOrders(prev => prev.map(o => o.id === editingOrder.id ? { ...o, ...updatedOrder } : o));
      setShowEditModal(false);
      toast.success('Order details updated');
    } catch (err) {
      toast.error('Failed to update order details');
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    try {
      await api.deleteOrder(orderToDelete.id);
      setOrders(prev => prev.filter(o => o.id !== orderToDelete.id));
      setShowDeleteConfirm(false);
      setOrderToDelete(null);
      toast.success('Order deleted permanently');
    } catch (err) {
      toast.error('Failed to delete order');
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

  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const toggleSelectAll = () => {
    if (selectedOrderIds.length === filteredOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map(o => o.id));
    }
  };

  const toggleSelectOrder = (id) => {
    setSelectedOrderIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkStatusUpdate = async (newStatus) => {
    if (!selectedOrderIds.length) return;
    setIsBulkUpdating(true);
    try {
      // We could ideally have a bulk endpoint, but for now we can iterate or just assume we'll add one.
      // Let's assume we use a loop for now or I'll add a bulk endpoint if I have backend access.
      // To be safe and efficient, I'll update them one by one but wrapped in a toast.
      const promises = selectedOrderIds.map(id => api.updateOrderStatus(id, newStatus));
      await Promise.all(promises);
      
      setOrders(prev => prev.map(o => 
        selectedOrderIds.includes(o.id) ? { ...o, status: newStatus } : o
      ));
      
      toast.success(`Bulk updated ${selectedOrderIds.length} orders to ${newStatus}`);
      setSelectedOrderIds([]);
      // Reset dropdown
      const select = document.querySelector('select[disabled]');
      if (select) select.value = "";
    } catch (err) {
      toast.error('Failed to bulk update some orders');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedOrderIds.length) return;
    setShowBulkDeleteConfirm(true);
  };

  const executeBulkDelete = async () => {
    setIsBulkUpdating(true);
    try {
      const promises = selectedOrderIds.map(id => api.deleteOrder(id));
      await Promise.all(promises);
      
      setOrders(prev => prev.filter(o => !selectedOrderIds.includes(o.id)));
      toast.success(`Deleted ${selectedOrderIds.length} orders`);
      setSelectedOrderIds([]);
    } catch (err) {
      toast.error('Failed to delete some orders');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  if (loading) {
    return <div className="p-4 md:p-8"><Skeleton /></div>;
  }

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
              <option value="returned">Returned</option>
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
          { label: 'Pending', count: (Array.isArray(orders) ? orders : []).filter(o => o.status === 'placed').length, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Processing', count: (Array.isArray(orders) ? orders : []).filter(o => ['confirmed', 'packed'].includes(o.status)).length, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'On Route', count: (Array.isArray(orders) ? orders : []).filter(o => o.status === 'shipped').length, icon: Truck, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Completed', count: (Array.isArray(orders) ? orders : []).filter(o => o.status === 'delivered').length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-5 group hover:shadow-xl transition-all duration-500">
            <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg)}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900 leading-tight">
                {stat.count < 10 ? `0${stat.count}` : stat.count}
              </h3>
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
                <th className="px-4 py-4 w-10 text-center">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 rounded-lg border-slate-200 text-maroon focus:ring-maroon cursor-pointer transition-all"
                    checked={selectedOrderIds.length > 0 && selectedOrderIds.length === filteredOrders.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Order Details</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Products</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Total</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.map((order) => (
                <tr key={order.id} className={clsx(
                  "hover:bg-slate-50/30 transition-colors group",
                  selectedOrderIds.includes(order.id) && "bg-slate-50"
                )}>
                  <td className="px-4 py-6 text-center">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded-lg border-slate-200 text-maroon focus:ring-maroon cursor-pointer transition-all"
                      checked={selectedOrderIds.includes(order.id)}
                      onChange={() => toggleSelectOrder(order.id)}
                    />
                  </td>
                  <td className="px-4 py-6">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-slate-900 text-base tracking-tight">#{order.tracking_id.toUpperCase()}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        <span className="text-slate-400 text-[10px] font-bold uppercase">{new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
                      </div>
                      <span className="text-slate-400 text-[9px] font-medium mb-3">{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      
                      <div className="flex flex-wrap gap-1.5">
                        <span className={clsx(
                          "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg",
                          order.payment_method?.toLowerCase() === 'bkash' ? "bg-pink-50 text-pink-600" : "bg-slate-100 text-slate-500"
                        )}>
                          {order.payment_method?.toUpperCase()}
                        </span>
                        {(order.transaction_id || order.sender_number) && (
                          <div className="flex flex-col gap-0.5 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                             {order.transaction_id && <span className="text-[8px] font-black text-slate-400 tracking-tighter">TRX: {order.transaction_id}</span>}
                             {order.sender_number && <span className="text-[8px] font-black text-slate-400 tracking-tighter">FROM: {order.sender_number}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-6">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 text-sm leading-none mb-1.5">{order.customer_name}</span>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-slate-500 text-[11px] font-bold">{order.customer_phone}</span>
                        <span className={clsx(
                          "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                          order.location?.toLowerCase() === 'cox' ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
                        )}>
                          {order.location}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium max-w-[220px] leading-relaxed italic mb-1" title={order.customer_address}>
                        {order.customer_address}
                      </p>
                      {order.customer_notes && (
                        <div className="mt-1 p-2 bg-blue-50/50 rounded-lg border border-blue-100/50 max-w-[220px]">
                          <p className="text-[9px] text-blue-600 font-bold leading-tight">
                            <span className="uppercase tracking-widest text-[8px] opacity-60 block mb-0.5">Note:</span>
                            {order.customer_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-6">
                    <div className="flex flex-col gap-2.5">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 group/item">
                          <div className="w-6 h-6 shrink-0 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover/item:bg-slate-900 group-hover/item:text-white transition-colors">
                            {item.quantity}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black text-slate-700 tracking-tight leading-none group-hover/item:text-slate-900 transition-colors">
                              {item.name}
                            </span>
                            {item.variation_info && (
                              <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mt-1">
                                {item.variation_info}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-6">
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 text-lg tracking-tight">৳{order.total_amount}</span>
                      
                      <div className="flex flex-col gap-0.5 mt-2 mb-2 p-1.5 bg-slate-50/50 rounded-lg border border-slate-100/50">
                         <div className="flex justify-between items-center gap-2">
                           <span className="text-[7px] text-slate-400 font-black uppercase tracking-widest">Sub:</span>
                           <span className="text-[9px] text-slate-600 font-bold">৳{order.subtotal}</span>
                         </div>
                         <div className="flex justify-between items-center gap-2">
                           <span className="text-[7px] text-slate-400 font-black uppercase tracking-widest">Del:</span>
                           <span className="text-[9px] text-slate-600 font-bold">৳{order.delivery_charge}</span>
                         </div>
                         {parseFloat(order.discount_amount) > 0 && (
                           <div className="flex justify-between items-center gap-2">
                             <span className="text-[7px] text-emerald-500 font-black uppercase tracking-widest">Disc:</span>
                             <span className="text-[9px] text-emerald-600 font-bold">-৳{order.discount_amount}</span>
                           </div>
                         )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", order.payment_status === 'paid' ? 'bg-emerald-500' : 'bg-rose-500')} />
                        <select 
                          value={order.payment_status || 'unpaid'}
                          onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                          className={clsx(
                            "text-[10px] font-black uppercase tracking-[0.1em] bg-transparent border-none outline-none cursor-pointer p-0",
                            order.payment_status === 'paid' ? 'text-emerald-500' : 'text-rose-500'
                          )}
                        >
                          <option value="unpaid">Unpaid</option>
                          <option value="paid">Paid</option>
                        </select>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-6">
                    <div className="relative group/status w-40 mx-auto">
                      <select 
                        value={order.status.toLowerCase()}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={clsx(
                          "appearance-none px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border shadow-sm transition-all duration-500 cursor-pointer outline-none w-full text-center pr-10 hover:shadow-md",
                          getStatusStyle(order.status.toLowerCase())
                        )}
                      >
                        {statuses.filter(s => s.value !== 'all').map(s => (
                          <option key={s.value} value={s.value} className="bg-white text-slate-900">{s.label}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 group-hover/status:translate-y-[-40%] transition-transform">
                        <ChevronDown size={14} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {/* Print Actions Group */}
                      <div className="flex items-center bg-slate-50 p-1.5 rounded-2xl border border-slate-100 group/print hover:bg-white hover:shadow-lg transition-all duration-500">
                        <button 
                          onClick={() => { 
                            setActiveOrder(order); 
                            setPrintType('standard');
                            setTimeout(() => handlePrint(), 150);
                          }}
                          className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
                          title="A4 Invoice"
                        >
                          <Printer size={18} />
                        </button>
                        <div className="flex gap-1 ml-1 pl-1 border-l border-slate-200">
                          {['1.75', '2.0', '1.5'].map((type) => (
                            <button 
                              key={type}
                              onClick={() => { 
                                setActiveOrder(order); 
                                setPrintType(type);
                                setTimeout(() => handlePrint(), 150);
                              }}
                              className="px-2.5 py-1.5 text-[9px] font-black text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            >
                              {type}"
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <a 
                          href={`http://127.0.0.1:8000/orders/${order.id}/invoice`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-3.5 text-slate-400 hover:text-maroon hover:bg-maroon/5 rounded-2xl transition-all"
                          title="Open PDF"
                        >
                          <ExternalLink size={18} />
                        </a>

                        <button 
                          onClick={() => {
                            setEditingOrder(order);
                            setEditForm({
                              customer_name: order.customer_name,
                              customer_phone: order.customer_phone,
                              customer_address: order.customer_address,
                              location: order.location
                            });
                            setShowEditModal(true);
                          }}
                          className="p-3.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>

                        <button 
                          onClick={() => {
                            setOrderToDelete(order);
                            setShowDeleteConfirm(true);
                          }}
                          className="p-3.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hidden Invoice Component for Printing */}
      <InvoiceTemplate ref={printRef} order={activeOrder} type={printType} />

      {/* Edit Address Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl relative">
            <button onClick={() => setShowEditModal(false)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all">
              <X size={24} />
            </button>
            
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Edit Customer Details</h2>
              <p className="text-slate-400 text-sm font-medium mt-1">Order: #{editingOrder?.tracking_id.toUpperCase()}</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Customer Name</label>
                <input 
                  type="text" 
                  value={editForm.customer_name}
                  onChange={(e) => setEditForm({...editForm, customer_name: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-slate-800"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Phone Number</label>
                <input 
                  type="text" 
                  value={editForm.customer_phone}
                  onChange={(e) => setEditForm({...editForm, customer_phone: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-slate-800"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Shipping Address</label>
                <textarea 
                  value={editForm.customer_address}
                  onChange={(e) => setEditForm({...editForm, customer_address: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium text-slate-700 h-24 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Location</label>
                <select 
                  value={editForm.location}
                  onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-bold text-slate-800 appearance-none"
                >
                  <option value="Cox">Cox's Bazar</option>
                  <option value="Outside">Outside District</option>
                </select>
              </div>

              <button 
                onClick={handleUpdateOrder}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-600 hover:shadow-xl transition-all"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteOrder}
        title="Delete Order?"
        message={`Are you sure you want to delete order #${orderToDelete?.tracking_id?.toUpperCase()}? This action cannot be undone and will remove all associated data.`}
        type="danger"
        confirmText="Yes, Delete Order"
      />

      <ConfirmModal 
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={executeBulkDelete}
        title="Delete Multiple Orders?"
        message={`Are you sure you want to delete ${selectedOrderIds.length} selected orders? This action will permanently remove these orders from the system.`}
        type="danger"
        confirmText={`Delete ${selectedOrderIds.length} Orders`}
      />

      {/* Floating Bulk Action Bar */}
      <AnimatePresence>
        {selectedOrderIds.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0, x: '-50%' }}
            animate={{ 
              y: 0, 
              opacity: 1,
              x: isSidebarOpen ? 'calc(-50% + 160px)' : 'calc(-50% + 56px)' 
            }}
            exit={{ y: 100, opacity: 0, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-[100] w-[90%] max-w-4xl"
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="bg-slate-900 text-white rounded-[40px] px-6 py-4 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.6)] flex flex-col lg:flex-row items-center justify-between gap-4 border border-white/10 backdrop-blur-2xl ring-1 ring-white/5">
              {/* Left Side: Count & Clear */}
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 leading-tight">Selected</span>
                    <span className="text-xl font-black tabular-nums leading-none">{selectedOrderIds.length < 10 ? `0${selectedOrderIds.length}` : selectedOrderIds.length}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedOrderIds([])}
                    className="p-2 hover:bg-white/10 rounded-full transition-all text-slate-400 hover:text-white"
                    title="Clear Selection"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="h-8 w-px bg-white/10 hidden lg:block" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 hidden xl:block">Orders Ready for Action</span>
              </div>

              {/* Right Side: Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Bulk Status:</span>
                  <select 
                    onChange={(e) => handleBulkStatusUpdate(e.target.value)}
                    disabled={isBulkUpdating}
                    className="bg-transparent border-none text-xs font-black uppercase tracking-widest outline-none focus:ring-0 cursor-pointer appearance-none pr-6 relative"
                    style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%2364748b\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '1.5em' }}
                  >
                    <option value="" className="bg-slate-900">Change...</option>
                    <option value="confirmed" className="bg-slate-900">Confirmed</option>
                    <option value="packed" className="bg-slate-900">Packed</option>
                    <option value="shipped" className="bg-slate-900">Shipped</option>
                    <option value="delivered" className="bg-slate-900">Delivered</option>
                    <option value="returned" className="bg-slate-900">Returned</option>
                    <option value="cancelled" className="bg-slate-900">Cancelled</option>
                  </select>
                </div>

                <button 
                  onClick={handleBulkDelete}
                  disabled={isBulkUpdating}
                  className="p-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all border border-rose-500/20"
                  title="Bulk Delete"
                >
                  <Trash2 size={20} />
                </button>
                
                <button 
                  className="px-6 py-3 bg-white text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-maroon hover:text-white transition-all shadow-xl hover:shadow-maroon/20 flex items-center gap-2 group"
                  onClick={handleBulkPrint}
                >
                  <Printer size={14} className="group-hover:scale-110 transition-transform" />
                  Bulk Print
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BulkInvoiceTemplate 
        ref={bulkPrintRef} 
        orders={orders.filter(o => selectedOrderIds.includes(o.id))} 
        type={printType} 
      />
    </div>
  );
};

export default Orders;
