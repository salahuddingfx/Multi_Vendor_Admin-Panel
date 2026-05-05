import React, { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  RefreshCcw, 
  Search, 
  Filter, 
  Plus, 
  History,
  MoreVertical,
  ChevronRight,
  TrendingUp,
  X,
  Edit,
  Eye
} from 'lucide-react';
import { api } from '../lib/api';
import { useStore } from '../store/useStore';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const Inventory = () => {
  const { selectedStore } = useStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [returnQty, setReturnQty] = useState(1);
  const [returnReason, setReturnReason] = useState('');
  const [newStock, setNewStock] = useState(0);
  const [activeMenu, setActiveMenu] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);

  const siteId = selectedStore === 'acharu' ? 1 : 2;

  useEffect(() => {
    fetchProducts();
    fetchAuditLogs();
  }, [selectedStore]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.getProducts(siteId);
      let productData = [];
      if (Array.isArray(res)) productData = res;
      else if (res && Array.isArray(res.data)) productData = res.data;
      else if (res && res.data && Array.isArray(res.data.data)) productData = res.data.data;
      
      setProducts(productData);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      toast.error('Failed to fetch inventory');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      // For now, we fetch returns as audit logs
      const res = await api.getReturns();
      setAuditLogs(res?.data || []);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    }
  };

  const handleReturn = async () => {
    if (!selectedProduct) return;
    try {
      await api.recordReturn({
        product_id: selectedProduct.id,
        quantity: returnQty,
        reason: returnReason
      });
      toast.success('Return recorded and stock updated');
      setShowReturnModal(false);
      fetchProducts();
      fetchAuditLogs();
    } catch (error) {
      toast.error('Failed to record return');
    }
  };

  const handleUpdateStock = async () => {
    if (!selectedProduct) return;
    try {
      const formData = new FormData();
      formData.append('stock', newStock);
      formData.append('_method', 'PUT'); // Ensure Laravel treats it as PUT
      await api.updateProduct(selectedProduct.id, formData);
      toast.success('Stock level adjusted successfully');
      setShowEditModal(false);
      setShowShipmentModal(false);
      fetchProducts();
    } catch (error) {
      toast.error('Failed to update stock');
    }
  };

  const filteredProducts = (Array.isArray(products) ? products : []).filter(p => {
    const categoryName = (typeof p.category === 'object' ? p.category?.name : p.category) || '';
    return p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           categoryName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const lowStockCount = products.filter(p => p.stock < 10).length;

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
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Inventory Management</span>
          </div>
          <h1 className="text-4xl font-display font-black text-slate-900 tracking-tight">Stock Control</h1>
          <p className="text-slate-500 font-medium mt-1">Manage items, handle returns, and audit stock for {selectedStore === 'acharu' ? 'Acharu' : 'Taja Shutki'}.</p>
        </motion.div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setShowAuditModal(true)}
            className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:shadow-lg hover:shadow-slate-200/50 transition-all"
          >
            <History size={16} /> Audit Logs
          </button>
          <button 
            onClick={() => {
              setSelectedProduct(null);
              setShowShipmentModal(true);
            }}
            className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200"
          >
            <Plus size={18} /> New Shipment
          </button>
        </div>
      </div>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Total Inventory', value: products.length, icon: Package, color: 'maroon', desc: 'Active unique SKUs' },
          { label: 'Low Stock Alerts', value: lowStockCount, icon: AlertTriangle, color: 'amber', desc: 'Critical restock needed', warning: lowStockCount > 0 },
          { label: 'Monthly Returns', value: auditLogs.length, icon: RefreshCcw, color: 'blue', desc: 'Recovered stock items' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[40px] border border-black/[0.02] shadow-premium group relative overflow-hidden"
          >
             <div className={clsx(
               "absolute top-0 right-0 w-32 h-32 blur-3xl opacity-5 transition-opacity group-hover:opacity-10",
               stat.color === 'maroon' ? 'bg-maroon' : stat.color === 'amber' ? 'bg-amber-500' : 'bg-blue-500'
             )} />
             
             <div className="flex justify-between items-start mb-6">
                <div className={clsx(
                  "w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500",
                  stat.color === 'maroon' ? 'bg-maroon/5 text-maroon' : stat.color === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                )}>
                  <stat.icon size={28} />
                </div>
                {stat.warning && (
                  <div className="animate-pulse bg-red-500 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">Action Required</div>
                )}
             </div>
             <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
               <h3 className="text-4xl font-black text-slate-900 mb-2">{stat.value}</h3>
               <p className="text-xs text-slate-400 font-medium">{stat.desc}</p>
             </div>
          </motion.div>
        ))}
      </div>

      {/* Inventory Table Container */}
      <div className="bg-white rounded-[48px] border border-black/[0.02] shadow-premium">
        <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between gap-8 bg-slate-50/30">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-maroon transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Filter by name or category..."
              className="w-full pl-14 pr-6 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-4 focus:ring-maroon/5 focus:border-maroon outline-none transition-all text-sm font-bold text-slate-800 placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-all">
                <Filter size={18} /> Filters
             </button>
          </div>
        </div>

        <div className="overflow-x-visible">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Product Identity</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Stock Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Valuation</th>
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode='popLayout'>
                {filteredProducts.map((p, idx) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    key={p.id} 
                    className="hover:bg-slate-50/50 transition-all group"
                  >
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-3xl bg-slate-100 overflow-hidden shrink-0 shadow-sm border border-slate-200">
                          <img 
                            src={p.images?.find(i => i.is_primary)?.image_path || p.images?.[0]?.image_path || p.image_url || 'https://via.placeholder.com/150'} 
                            alt={p.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          />
                        </div>
                        <div>
                          <span className="block font-black text-slate-900 text-base leading-tight mb-1">{p.name}</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU: {p.sku || `#${p.id.toString().padStart(5, '0')}`}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <span className="bg-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                        {p.category?.name || p.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                           <div className={clsx(
                             "w-2 h-2 rounded-full",
                             p.stock < 10 ? "bg-rose-500 animate-pulse" : "bg-emerald-500"
                           )} />
                           <span className={clsx(
                             "text-sm font-black",
                             p.stock < 10 ? "text-rose-600" : "text-slate-900"
                           )}>
                            {p.stock} units
                           </span>
                        </div>
                        <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                           <div 
                             className={clsx(
                               "h-full rounded-full transition-all duration-1000",
                               p.stock < 10 ? "bg-rose-500" : "bg-emerald-500"
                             )}
                             style={{ width: `${Math.min(100, (p.stock / 50) * 100)}%` }}
                           />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <div className="flex flex-col">
                         <span className="text-sm font-black text-slate-900">৳{p.price}</span>
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Per Unit</span>
                      </div>
                    </td>
                    <td className={clsx("px-10 py-8 text-right relative", activeMenu === p.id ? "z-[50]" : "z-[1]")}>
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => {
                            setSelectedProduct(p);
                            setNewStock(p.stock);
                            setShowEditModal(true);
                          }}
                          className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-maroon hover:shadow-lg transition-all"
                          title="Quick Edit"
                        >
                          <Edit size={18} />
                        </button>
                        
                        <div className="relative">
                          <button 
                            onClick={() => setActiveMenu(activeMenu === p.id ? null : p.id)}
                            className={clsx(
                              "p-3 rounded-xl transition-all",
                              activeMenu === p.id ? "bg-slate-900 text-white shadow-xl" : "bg-white border border-slate-100 text-slate-400 hover:text-slate-900"
                            )}
                          >
                            <MoreVertical size={18} />
                          </button>
                          
                          {activeMenu === p.id && (
                            <>
                              <div className="fixed inset-0 z-[100]" onClick={() => setActiveMenu(null)} />
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="absolute right-0 top-full mt-2 w-56 bg-white rounded-[24px] shadow-2xl border border-slate-100 z-[110] overflow-hidden py-2"
                              >
                                <button 
                                  onClick={() => {
                                    setSelectedProduct(p);
                                    setShowReturnModal(true);
                                    setActiveMenu(null);
                                  }}
                                  className="w-full px-6 py-4 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                >
                                  <RefreshCcw size={16} className="text-blue-500" /> Record Return
                                </button>
                                <button className="w-full px-6 py-4 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                                  <History size={16} className="text-amber-500" /> View History
                                </button>
                                <div className="h-px bg-slate-50 mx-4 my-1" />
                                <button className="w-full px-6 py-4 text-left text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors">
                                  <AlertTriangle size={16} /> Mark Damaged
                                </button>
                              </motion.div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {!loading && filteredProducts.length === 0 && (
            <div className="p-32 text-center">
               <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                  <Package size={48} />
               </div>
               <h3 className="text-xl font-black text-slate-800">No items found</h3>
               <p className="text-slate-400 font-medium">Try adjusting your filters or search query.</p>
            </div>
          )}
        </div>
      </div>

      {/* New Shipment Modal */}
      <AnimatePresence>
        {showShipmentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-[48px] p-12 shadow-2xl relative"
            >
              <button onClick={() => setShowShipmentModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors">
                <X size={28} />
              </button>
              
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-1 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Restock Operation</span>
                </div>
                <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight">New Shipment</h2>
                <p className="text-slate-500 font-medium mt-1">Receive new stock into the warehouse.</p>
              </div>

              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Select Product</label>
                  <select 
                    onChange={(e) => {
                      const p = products.find(prod => prod.id === parseInt(e.target.value));
                      setSelectedProduct(p);
                      setNewStock(p?.stock || 0);
                    }}
                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all font-bold text-slate-800 appearance-none"
                  >
                    <option value="">Choose a product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Current: {p.stock})</option>
                    ))}
                  </select>
                </div>

                {selectedProduct && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex items-center justify-between gap-6 px-2">
                       <button 
                         onClick={() => setNewStock(prev => Math.max(0, prev - 1))}
                         className="w-14 h-14 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center font-bold text-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm border border-slate-100"
                       ><span>−</span></button>
                       <div className="flex-1 bg-slate-50/50 rounded-[28px] border border-slate-100 p-2 text-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">New Total Stock</p>
                          <input 
                            type="number" 
                            value={newStock}
                            onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                            className="w-full bg-transparent outline-none font-black text-slate-800 text-center text-3xl py-1"
                          />
                       </div>
                       <button 
                         onClick={() => setNewStock(prev => prev + 1)}
                         className="w-14 h-14 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center font-bold text-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm border border-slate-100"
                       ><span>+</span></button>
                    </div>

                    <button 
                      onClick={handleUpdateStock}
                      className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-emerald-700 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
                    >
                      Add to Inventory
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Audit Logs Modal */}
      <AnimatePresence>
        {showAuditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-end p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-xl h-full rounded-[48px] p-12 shadow-2xl relative overflow-hidden flex flex-col"
            >
              <button onClick={() => setShowAuditModal(false)} className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors">
                <X size={28} />
              </button>
              
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-1 rounded-full bg-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Stock Timeline</span>
                </div>
                <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight">Audit Logs</h2>
                <p className="text-slate-500 font-medium mt-1">Recent stock movements and returns.</p>
              </div>

              <div className="flex-grow overflow-y-auto custom-scrollbar pr-4 space-y-6">
                {auditLogs.length > 0 ? auditLogs.map((log, i) => (
                  <div key={i} className="flex gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100 relative group">
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center shrink-0">
                       <RefreshCcw size={20} className="text-blue-500" />
                    </div>
                    <div>
                       <div className="flex items-center gap-3 mb-1">
                          <span className="text-sm font-black text-slate-900">Return Recorded</span>
                          <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 bg-white rounded-full border border-slate-100">
                             {new Date(log.created_at).toLocaleDateString()}
                          </span>
                       </div>
                       <p className="text-xs text-slate-500 font-medium mb-3">
                          Product ID #{log.product_id} — Added {log.quantity} units back to stock.
                       </p>
                       {log.reason && (
                         <div className="text-[10px] bg-white p-3 rounded-xl border border-slate-100 text-slate-400 italic">
                            "{log.reason}"
                         </div>
                       )}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-20">
                     <History size={48} className="mx-auto text-slate-100 mb-4" />
                     <p className="text-slate-400 font-bold">No recent logs found</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Return Modal - Polished */}
      <AnimatePresence>
        {showReturnModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-lg rounded-[48px] p-12 shadow-2xl relative"
            >
              <button onClick={() => setShowReturnModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-colors">
                <X size={28} />
              </button>
              
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-1 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Reverse Logistics</span>
                </div>
                <h2 className="text-3xl font-display font-black text-slate-900 tracking-tight">Record Return</h2>
                <p className="text-slate-500 font-medium mt-1">Processing return for {selectedProduct?.name}</p>
              </div>
              
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Quantity to Add Back</label>
                  <input 
                    type="number" 
                    value={returnQty}
                    onChange={(e) => setReturnQty(e.target.value)}
                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-black text-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Return Reason</label>
                  <textarea 
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder="e.g. Customer changed mind, Packaging damaged..."
                    className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all font-medium text-slate-700 h-32 resize-none"
                  />
                </div>
                <button 
                  onClick={handleReturn}
                  className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blue-500/20"
                >
                  Confirm & Update Stock
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Edit Modal - Refined & Minimalist */}
      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowEditModal(false)} 
                className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all"
              >
                <X size={20} />
              </button>
              
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-1 rounded-full bg-maroon" />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Inventory Adjust</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Update Stock</h2>
                <p className="text-slate-400 text-sm font-medium mt-1">Adjusting: {selectedProduct?.name}</p>
              </div>
              
              <div className="space-y-6">
                {/* Stock Comparison Grid */}
                <div className="grid grid-cols-2 gap-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Current</p>
                      <p className="text-xl font-black text-slate-700">{selectedProduct?.stock} <span className="text-xs text-slate-400">units</span></p>
                   </div>
                   <div className="space-y-1 text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target</p>
                      <p className="text-xl font-black text-maroon">{newStock} <span className="text-xs text-maroon/50">units</span></p>
                   </div>
                </div>

                {/* Spacious & Premium Input Controls */}
                <div className="space-y-4">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-2 block">Set New Level</label>
                  <div className="flex items-center justify-between gap-6 px-2">
                     <button 
                       onClick={() => setNewStock(prev => Math.max(0, prev - 1))}
                       className="w-14 h-14 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center font-bold text-xl hover:bg-maroon hover:text-white transition-all shadow-sm border border-slate-100 active:scale-90"
                     >
                        <span>−</span>
                     </button>
                     
                     <div className="flex-1 bg-slate-50/50 rounded-[28px] border border-slate-100 p-2 shadow-inner group-focus-within:border-maroon/20 transition-all">
                        <input 
                          type="number" 
                          value={newStock}
                          onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
                          className="w-full bg-transparent outline-none font-black text-slate-800 text-center text-3xl py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                     </div>
                     
                     <button 
                       onClick={() => setNewStock(prev => prev + 1)}
                       className="w-14 h-14 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center font-bold text-xl hover:bg-maroon hover:text-white transition-all shadow-sm border border-slate-100 active:scale-90"
                     >
                        <span>+</span>
                     </button>
                  </div>
                </div>

                <button 
                  onClick={handleUpdateStock}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-maroon hover:shadow-xl hover:shadow-maroon/20 hover:scale-[1.01] active:scale-95 transition-all shadow-lg shadow-slate-200"
                >
                  Confirm Adjustment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;

