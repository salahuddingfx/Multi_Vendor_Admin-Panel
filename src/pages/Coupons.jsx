import React, { useState, useEffect } from 'react';
import { 
  Ticket, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { api } from '../lib/api';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import ConfirmModal from '../components/ConfirmModal';

const Coupons = () => {
  const { selectedStore } = useStore();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'fixed',
    value: '',
    expires_at: '',
    is_active: true,
    product_ids: []
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [products, setProducts] = useState([]);
  const [searchProduct, setSearchProduct] = useState('');

  const siteId = selectedStore === 'acharu' ? 1 : 2;

  useEffect(() => {
    fetchCoupons();
    fetchProducts();
  }, [selectedStore]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await api.getCoupons(siteId);
      setCoupons(data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, site_id: siteId };
      if (currentCoupon) {
        await api.updateCoupon(currentCoupon.id, payload);
      } else {
        await api.storeCoupon(payload);
      }
      fetchCoupons();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving coupon');
    }
  };

  const handleDelete = async () => {
    if (!couponToDelete) return;
    try {
      await api.deleteCoupon(couponToDelete);
      fetchCoupons();
      toast.success('Coupon deleted');
      setShowDeleteConfirm(false);
      setCouponToDelete(null);
    } catch (error) {
      toast.error('Error deleting coupon');
    }
  };

  const openModal = (coupon = null) => {
    if (coupon) {
      setCurrentCoupon(coupon);
      setFormData({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        expires_at: coupon.expires_at ? coupon.expires_at.split('T')[0] : '',
        is_active: coupon.is_active,
        product_ids: coupon.products ? coupon.products.map(p => p.id) : []
      });
    } else {
      setCurrentCoupon(null);
      setFormData({
        code: '',
        type: 'fixed',
        value: '',
        expires_at: '',
        is_active: true,
        product_ids: []
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentCoupon(null);
  };

  if (loading) return <div className="p-8">Loading coupons...</div>;

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Coupons Management</h1>
          <p className="text-slate-500">Create and manage discount codes for your stores</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
          Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coupons.map((coupon) => (
          <motion.div 
            key={coupon.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden"
          >
            <div className={`absolute top-0 right-0 px-4 py-1 text-[10px] font-black uppercase tracking-widest ${coupon.is_active ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
              {coupon.is_active ? 'Active' : 'Inactive'}
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Ticket size={24} />
              </div>
              <div>
                <h3 className="font-black text-xl text-slate-800">{coupon.code}</h3>
                <p className="text-sm font-bold text-slate-400">
                  {coupon.type === 'percentage' ? `${coupon.value}% OFF` : `৳${coupon.value} OFF`}
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                <Calendar size={14} />
                <span>Expires: {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'Never'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
              <button 
                onClick={() => openModal(coupon)}
                className="flex-grow flex items-center justify-center gap-2 bg-slate-50 text-slate-600 px-4 py-2.5 rounded-xl font-bold hover:bg-slate-100 transition-all"
              >
                <Edit2 size={16} />
                Edit
              </button>
              <button 
                onClick={() => {
                  setCouponToDelete(coupon.id);
                  setShowDeleteConfirm(true);
                }}
                className="w-11 h-11 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">
                  {currentCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Coupon Code</label>
                  <input 
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 font-bold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 transition-all"
                    placeholder="e.g. SAVE20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Type</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 transition-all"
                    >
                      <option value="fixed">Fixed Amount (৳)</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Value</label>
                    <input 
                      type="number"
                      required
                      value={formData.value}
                      onChange={(e) => setFormData({...formData, value: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 font-bold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-600 transition-all"
                      placeholder="e.g. 100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Expiry Date (Optional)</label>
                  <input 
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({...formData, expires_at: e.target.value})}
                    className="w-full bg-slate-50 border-none rounded-xl px-5 py-4 font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 transition-all"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input 
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    className="w-5 h-5 text-indigo-600 border-none rounded bg-slate-100 focus:ring-indigo-600"
                  />
                  <label htmlFor="is_active" className="text-sm font-bold text-slate-700 cursor-pointer selection:bg-none">
                    Coupon is active and ready to use
                  </label>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-bold text-slate-700">Restricted Products (Optional)</label>
                    {formData.product_ids.length > 0 && (
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, product_ids: []})}
                        className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mb-4 font-medium">If selected, the coupon will only apply to these products. Leave empty for all products.</p>
                  
                  <div className="relative mb-3">
                    <input 
                      type="text"
                      placeholder="Search products..."
                      value={searchProduct}
                      onChange={(e) => setSearchProduct(e.target.value)}
                      className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                    {products
                      .filter(p => (p.name || '').toLowerCase().includes(searchProduct.toLowerCase()))
                      .map(product => (
                        <label key={product.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-all border border-transparent hover:border-slate-100">
                          <input 
                            type="checkbox"
                            checked={formData.product_ids.includes(product.id)}
                            onChange={(e) => {
                              const newIds = e.target.checked 
                                ? [...formData.product_ids, product.id]
                                : formData.product_ids.filter(id => id !== product.id);
                              setFormData({...formData, product_ids: newIds});
                            }}
                            className="w-4 h-4 text-indigo-600 border-none rounded bg-slate-200 focus:ring-indigo-600"
                          />
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                              {product.images?.[0]?.image_path ? (
                                <img src={product.images[0].image_path} className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon size={14} className="text-slate-300" />
                              )}
                            </div>
                            <span className="text-xs font-bold text-slate-700 truncate max-w-[200px]">{product.name}</span>
                          </div>
                        </label>
                      ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={closeModal}
                    className="flex-grow py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-grow bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
                  >
                    {currentCoupon ? 'Update Coupon' : 'Create Coupon'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Coupon?"
        message="Are you sure you want to delete this discount coupon? Customers will no longer be able to use it."
        type="danger"
        confirmText="Yes, Delete Coupon"
      />
    </div>
  );
};

export default Coupons;
