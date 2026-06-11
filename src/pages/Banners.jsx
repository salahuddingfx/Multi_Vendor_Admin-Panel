import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Image as ImageIcon, Plus, Trash2, Edit2, Save, X, ExternalLink } from 'lucide-react';
import { api } from '../lib/api';
import { toast } from 'sonner';
import ConfirmModal from '../components/ConfirmModal';

const labelCls = "block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1";
const inputCls = "w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-maroon/5 focus:border-maroon outline-none transition-all font-bold text-slate-900";

const Banners = () => {
  const { selectedStore } = useStore();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    badge: '',
    button_text: 'Shop Now',
    product_id: '',
    image: null,
    order: 0
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bannerToDelete, setBannerToDelete] = useState(null);

  const siteId = selectedStore === 'acharu' ? 1 : 2;

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const [bannerData, productData] = await Promise.all([
        api.getHeroSlides(siteId),
        api.getProducts(siteId)
      ]);
      setBanners(bannerData || []);
      setProducts(productData?.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [selectedStore]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('site_id', siteId);
    data.append('title', formData.title);
    data.append('subtitle', formData.subtitle || '');
    data.append('badge', formData.badge || '');
    data.append('button_text', formData.button_text || 'Shop Now');
    if (formData.product_id) {
      data.append('product_id', formData.product_id);
    }
    data.append('order', formData.order);
    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      if (editingBanner) {
        await api.updateHeroSlide(editingBanner.id, data);
        toast.success('Banner updated successfully');
      } else {
        await api.storeHeroSlide(data);
        toast.success('Banner created successfully');
      }
      setIsModalOpen(false);
      setEditingBanner(null);
      setFormData({ title: '', subtitle: '', badge: '', button_text: 'Shop Now', product_id: '', image: null, order: 0 });
      fetchBanners();
    } catch (err) {
      console.error(err);
      const data = err.response?.data;
      const message = data?.errors 
        ? Object.values(data.errors).flat().join(', ')
        : data?.data
        ? Object.values(data.data).flat().join(', ')
        : 'Failed to save banner';
      toast.error(message);
    }
  };

  const handleDelete = async () => {
    if (!bannerToDelete) return;
    try {
      await api.deleteHeroSlide(bannerToDelete);
      toast.success('Banner deleted');
      fetchBanners();
      setShowDeleteConfirm(false);
      setBannerToDelete(null);
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">HOMEPAGE BANNERS</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage the hero slides for {selectedStore.toUpperCase()}</p>
        </div>
        <button 
          onClick={() => { 
            setEditingBanner(null); 
            setFormData({
              title: '',
              subtitle: '',
              badge: '',
              button_text: 'Shop Now',
              product_id: '',
              image: null,
              order: banners.length > 0 ? Math.max(...banners.map(b => b.order || 0)) + 1 : 1
            });
            setIsModalOpen(true); 
          }}
          className="flex items-center gap-2 bg-maroon text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-maroon/20 hover:scale-105 transition-all"
        >
          <Plus size={20} />
          ADD NEW BANNER
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
           {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-100 rounded-3xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...banners].sort((a, b) => (a.order || 0) - (b.order || 0)).map((banner) => (
            <div key={banner.id} className="group relative bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
              <div className="aspect-[16/9] relative overflow-hidden bg-slate-100">
                <img 
                  src={banner.image_path} 
                  alt={banner.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute bottom-4 left-4 right-4">
                   <div className="text-[10px] font-black bg-maroon text-white px-2 py-0.5 rounded-full inline-block mb-1 uppercase tracking-wider">
                      {banner.badge || 'Banner'}
                   </div>
                   <h3 className="text-white font-black text-lg leading-tight uppercase">{banner.title}</h3>
                   <p className="text-white/80 text-xs font-medium truncate">{banner.subtitle}</p>
                </div>
              </div>
              
              <div className="p-4 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md">
                    Order: {banner.order}
                  </span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => {
                      setEditingBanner(banner);
                      setFormData({
                        title: banner.title,
                        subtitle: banner.subtitle,
                        badge: banner.badge,
                        button_text: banner.button_text || 'Shop Now',
                        product_id: banner.product_id || '',
                        order: banner.order,
                        image: null
                      });
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                  >
                    <Edit2 size={18} />
                  </button>
                   <button 
                     onClick={() => {
                       setBannerToDelete(banner.id);
                       setShowDeleteConfirm(true);
                     }}
                     className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                   >
                     <Trash2 size={18} />
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                {editingBanner ? 'Edit Banner' : 'New Banner'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white rounded-full transition-all">
                <X size={24} className="text-slate-400" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-maroon/5 focus:border-maroon outline-none transition-all font-bold text-slate-900"
                    placeholder="E.g. Special Deal"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Badge</label>
                  <input 
                    type="text" 
                    value={formData.badge}
                    onChange={(e) => setFormData({...formData, badge: e.target.value})}
                    className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-maroon/5 focus:border-maroon outline-none transition-all font-bold text-slate-900"
                    placeholder="E.g. NEW"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Link to Product</label>
                  <select 
                    value={formData.product_id}
                    onChange={(e) => setFormData({...formData, product_id: e.target.value})}
                    className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-maroon/5 focus:border-maroon outline-none transition-all font-bold text-slate-900"
                  >
                    <option value="">No Link</option>
                    {Array.isArray(products) && products.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className={labelCls}>Button Text</label>
                  <input 
                    type="text" 
                    value={formData.button_text}
                    onChange={(e) => setFormData({...formData, button_text: e.target.value})}
                    className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-maroon/5 focus:border-maroon outline-none transition-all font-bold text-slate-900"
                    placeholder="E.g. Shop Now"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subtitle</label>
                <input 
                  type="text" 
                  value={formData.subtitle}
                  onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                  className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-maroon/5 focus:border-maroon outline-none transition-all font-bold text-slate-900"
                  placeholder="Short descriptive text..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Display Order</label>
                    <input 
                      type="number" 
                      value={formData.order}
                      onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                      className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-maroon/5 focus:border-maroon outline-none transition-all font-bold text-slate-900"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Image File</label>
                    <div className="relative group/file">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        required={!editingBanner}
                      />
                      <div className="w-full px-5 py-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 flex items-center gap-3 text-slate-400 font-bold group-hover/file:border-maroon group-hover/file:bg-white transition-all">
                        <ImageIcon size={20} />
                        <span className="text-xs truncate">{formData.image ? formData.image.name : 'Select Image'}</span>
                      </div>
                    </div>
                 </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="submit"
                  className="flex-1 bg-maroon text-white py-5 rounded-[20px] font-black shadow-xl shadow-maroon/20 hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-wider"
                >
                  {editingBanner ? 'Save Changes' : 'Create Banner'}
                </button>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 bg-slate-100 text-slate-600 py-5 rounded-[20px] font-black hover:bg-slate-200 transition-all uppercase tracking-wider text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Banner?"
        message="Are you sure you want to remove this hero slide from your homepage?"
        type="danger"
        confirmText="Yes, Delete Banner"
      />
    </div>
  );
};

export default Banners;
