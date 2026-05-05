import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../lib/api';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Package,
  Eye,
  Save,
  Sparkles,
  Languages
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import ConfirmModal from '../components/ConfirmModal';

const Products = () => {
  const { selectedStore } = useStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const siteId = selectedStore === 'acharu' ? 1 : 2;

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [selectedStore]);

  const fetchCategories = async () => {
    const data = await api.getCategories(siteId);
    setCategories(data);
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.getProducts(siteId);
      // Extra safe check for various API response formats
      let productData = [];
      if (Array.isArray(res)) productData = res;
      else if (res && Array.isArray(res.data)) productData = res.data;
      else if (res && res.data && Array.isArray(res.data.data)) productData = res.data.data;
      
      setProducts(productData);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      await api.deleteProduct(productToDelete);
      toast.success('Product deleted successfully');
      fetchProducts();
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = (Array.isArray(products) ? products : []).filter(p => {
    const categoryName = (typeof p.category === 'object' ? p.category?.name : p.category) || '';
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        p.id.toString().includes(searchQuery);
    
    const matchesCategory = selectedCategory === 'All' || categoryName === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-800">Products</h1>
          <p className="text-slate-500 font-medium">Manage your {selectedStore} inventory.</p>
        </div>
        <button 
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="bg-maroon text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-maroon/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-maroon transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by name, category..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-maroon/5 focus:border-maroon transition-all font-medium text-slate-700"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="appearance-none p-4 pl-6 pr-12 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold outline-none focus:ring-4 focus:ring-maroon/5 focus:border-maroon transition-all cursor-pointer"
            >
              <option value="All">All Categories</option>
              {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
            </select>
            <Filter size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <div className="text-sm font-bold text-slate-400 px-4">
            Total: <span className="text-slate-800">{filteredProducts.length}</span>
          </div>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-[32px] shadow-soft border border-black/[0.03] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Product</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Price</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Stock</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-8 py-6 h-20 bg-slate-50/50" />
                  </tr>
                ))
              ) : filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        <img 
                          src={product.images?.find(img => img.is_primary)?.image_path || product.images?.[0]?.image_path || 'https://via.placeholder.com/150'} 
                          alt="" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-base">{product.name}</div>
                        <div className="text-xs text-slate-400 font-medium">ID: {product.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {typeof product.category === 'object' ? product.category?.name : product.category}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="font-display font-bold text-slate-800">৳{product.price}</span>
                      {product.original_price > product.price && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 line-through">৳{product.original_price}</span>
                          <span className="text-[9px] font-black text-emerald-500">-{Math.round(product.discount_percentage)}%</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className={clsx(
                        "w-2 h-2 rounded-full",
                        product.stock < 10 ? "bg-red-500 animate-pulse" : "bg-green-500"
                      )} />
                      <span className="font-bold text-slate-700">{product.stock || 45} in stock</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => {
                          setEditingProduct(product);
                          setIsModalOpen(true);
                        }}
                        className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-maroon hover:text-white transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => {
                          setProductToDelete(product.id);
                          setShowDeleteConfirm(true);
                        }}
                        className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filteredProducts.length === 0 && (
            <div className="p-20 text-center text-slate-400 font-medium">
              <Package size={48} className="mx-auto mb-4 opacity-20" />
              No products found for your search.
            </div>
          )}
        </div>
      </div>
      {/* Modal */}
      {isModalOpen && (
        <ProductModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          editingProduct={editingProduct}
          onSuccess={fetchProducts}
          siteId={selectedStore === 'acharu' ? 1 : 2}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteProduct}
        title="Delete Product?"
        message="Are you sure you want to delete this product? This action cannot be undone."
        type="danger"
        confirmText="Yes, Delete Product"
      />
    </div>
  );
};

const ProductModal = ({ isOpen, onClose, editingProduct, onSuccess, siteId }) => {
  const [formData, setFormData] = useState({
    name: editingProduct?.name ?? '',
    sku: editingProduct?.sku ?? '',
    category_id: editingProduct?.category_id ?? '',
    price: editingProduct?.price ?? '',
    original_price: editingProduct?.original_price ?? '',
    discount_percentage: editingProduct?.discount_percentage ?? '',
    weight: editingProduct?.weight ?? '',
    stock: editingProduct?.stock ?? '',
    description: editingProduct?.description ?? '',
    name_bn: editingProduct?.name_bn ?? '',
    description_bn: editingProduct?.description_bn ?? ''
  });
  const [translating, setTranslating] = useState(false);

  const translateText = async (text, field) => {
    if (!text) return;
    setTranslating(true);
    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|bn`);
      const data = await res.json();
      if (data.responseData?.translatedText) {
        setFormData(prev => ({ ...prev, [field]: data.responseData.translatedText }));
        toast.success('Translated successfully!');
      }
    } catch (err) {
      toast.error('Translation failed');
    } finally {
      setTranslating(false);
    }
  };
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [primaryIndex, setPrimaryIndex] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    
    // Generate previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
    setPrimaryIndex(0); // Reset to first image by default
  };

  useEffect(() => {
    const fetchCats = async () => {
      const data = await api.getCategories(siteId);
      setCategories(data);
    };
    fetchCats();
  }, [siteId]);

  const generateSKU = (name, catId) => {
    if (!name) return '';
    const category = categories.find(c => c.id == catId);
    const catPrefix = category ? category.name.substring(0, 3).toUpperCase() : 'GEN';
    const namePrefix = name.substring(0, 3).toUpperCase();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${catPrefix}-${namePrefix}-${random}`;
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    const updates = { name: newName };
    // Auto-generate SKU only if it's currently empty or was already auto-generated
    if (!formData.sku || formData.sku.split('-').length === 3) {
      updates.sku = generateSKU(newName, formData.category_id);
    }
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleCategoryChange = (e) => {
    const newCatId = e.target.value;
    const updates = { category_id: newCatId };
    if (formData.name) {
      updates.sku = generateSKU(formData.name, newCatId);
    }
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handlePriceChange = (selling, original) => {
    let discount = 0;
    if (original > selling && original > 0) {
      discount = ((original - selling) / original) * 100;
    }
    setFormData(prev => ({ 
      ...prev, 
      price: selling, 
      original_price: original, 
      discount_percentage: discount.toFixed(2) 
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const data = new FormData();
    
    // Only append fields that have values to avoid 422 validation errors
    Object.keys(formData).forEach(key => {
      const value = formData[key];
      if (value !== '' && value !== null && value !== undefined) {
        data.append(key, value);
      }
    });
    
    if (imageFiles.length > 0) {
      imageFiles.forEach((file, index) => {
        data.append('images[]', file);
        if (index === primaryIndex) {
          data.append('primary_image_index', index);
        }
      });
    }
    if (!editingProduct) data.append('site_id', siteId);

    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, data);
        toast.success('Product updated');
      } else {
        await api.storeProduct(data);
        toast.success('Product created');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Error saving product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[48px] p-8 md:p-12 w-full max-w-3xl my-auto shadow-2xl relative"
      >
        <button onClick={onClose} className="absolute top-8 right-8 w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white transition-all">
          <Plus size={24} className="rotate-45" />
        </button>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-1 rounded-full bg-maroon" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Inventory Management</span>
          </div>
          <h2 className="text-4xl font-display font-black text-slate-800 tracking-tight">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Product Name</label>
              <input 
                type="text" 
                required
                placeholder="Enter product title..."
                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-maroon/5 focus:border-maroon transition-all font-bold text-slate-700"
                value={formData.name}
                onChange={handleNameChange}
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center ml-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Product Name (Bengali)</label>
                <button 
                  type="button"
                  onClick={() => translateText(formData.name, 'name_bn')}
                  disabled={translating || !formData.name}
                  className="flex items-center gap-1.5 text-[9px] font-black uppercase text-maroon hover:opacity-70 disabled:opacity-30 transition-opacity"
                >
                  <Sparkles size={12} className={translating ? "animate-spin" : ""} />
                  Magic Translate
                </button>
              </div>
              <input 
                type="text" 
                placeholder="বাংলায় নাম..."
                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-maroon/5 focus:border-maroon transition-all font-bold text-slate-700"
                value={formData.name_bn}
                onChange={(e) => setFormData({...formData, name_bn: e.target.value})}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">SKU / Model</label>
              <input 
                type="text" 
                placeholder="e.g. PIC-NAG-1234"
                className="w-full px-8 py-5 bg-white border-2 border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-maroon/5 focus:border-maroon transition-all font-bold text-slate-700"
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value.toUpperCase()})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Category</label>
              <div className="relative">
                <select 
                  required
                  className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-maroon/5 focus:border-maroon transition-all font-bold text-slate-700 appearance-none"
                  value={formData.category_id}
                  onChange={handleCategoryChange}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
                <ChevronRight size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Weight (kg)</label>
              <input 
                type="number" 
                step="0.01"
                required
                placeholder="0.5"
                className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-maroon/5 focus:border-maroon transition-all font-bold text-slate-700"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Regular Price</label>
              <input 
                type="number" 
                placeholder="0.00"
                className="w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-maroon/5 focus:border-maroon transition-all font-bold text-slate-700"
                value={formData.original_price}
                onChange={(e) => handlePriceChange(formData.price, e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Selling Price</label>
              <input 
                type="number" 
                required
                placeholder="0.00"
                className="w-full px-8 py-4 bg-white border-2 border-maroon/20 rounded-3xl outline-none focus:ring-4 focus:ring-maroon/5 focus:border-maroon transition-all font-black text-maroon"
                value={formData.price}
                onChange={(e) => handlePriceChange(e.target.value, formData.original_price)}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Discount %</label>
              <input 
                type="text" 
                readOnly
                className="w-full px-8 py-4 bg-emerald-50 border border-emerald-100 rounded-3xl font-black text-emerald-600 outline-none"
                value={formData.discount_percentage + '%'}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Stock</label>
              <input 
                type="number" 
                required
                placeholder="100"
                className="w-full px-8 py-4 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:ring-4 focus:ring-maroon/5 focus:border-maroon transition-all font-bold text-slate-700"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Product Images</label>
            <div className="relative group">
              <input 
                type="file" 
                multiple
                accept="image/*"
                className="hidden"
                id="product-image"
                onChange={handleImageChange}
              />
              <label 
                htmlFor="product-image"
                className="flex flex-col items-center justify-center w-full px-8 py-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer hover:border-maroon hover:bg-maroon/5 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-maroon group-hover:text-white group-hover:border-maroon transition-all mb-4">
                  <Plus size={24} />
                </div>
                <span className="text-slate-800 font-bold mb-1">
                  {imageFiles.length > 0 ? `${imageFiles.length} images selected` : 'Click to select multiple images'}
                </span>
                <span className="text-slate-400 text-sm font-medium text-center">
                  {editingProduct ? 'Note: Uploading new images will replace existing ones.' : 'Hold Ctrl or Cmd to select multiple files'}
                </span>
                
                {previews.length > 0 && (
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-4 mt-6 w-full px-4">
                    {previews.map((url, i) => (
                      <div 
                        key={i} 
                        onClick={(e) => {
                          e.preventDefault();
                          setPrimaryIndex(i);
                        }}
                        className={clsx(
                          "relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer",
                          primaryIndex === i ? "border-maroon scale-105 shadow-lg shadow-maroon/20" : "border-transparent opacity-60 hover:opacity-100"
                        )}
                      >
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        {primaryIndex === i && (
                          <div className="absolute inset-0 bg-maroon/10 flex items-center justify-center">
                            <span className="bg-maroon text-[8px] text-white font-black px-2 py-0.5 rounded-full uppercase">Front</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Detailed Description</label>
            <textarea 
              rows={4}
              placeholder="Tell your customers more about this product..."
              className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[32px] outline-none focus:ring-4 focus:ring-maroon/5 focus:border-maroon transition-all font-medium text-slate-700 leading-relaxed"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center ml-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bengali Description</label>
              <button 
                type="button"
                onClick={() => translateText(formData.description, 'description_bn')}
                disabled={translating || !formData.description}
                className="flex items-center gap-1.5 text-[9px] font-black uppercase text-maroon hover:opacity-70 disabled:opacity-30 transition-opacity"
              >
                <Sparkles size={12} className={translating ? "animate-spin" : ""} />
                Magic Translate
              </button>
            </div>
            <textarea 
              rows={3}
              placeholder="বাংলায় বর্ণনা..."
              className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[32px] outline-none focus:ring-4 focus:ring-maroon/5 focus:border-maroon transition-all font-medium text-slate-700 leading-relaxed"
              value={formData.description_bn}
              onChange={(e) => setFormData({...formData, description_bn: e.target.value})}
            />
          </div>

          <div className="flex gap-4 pt-6">
            <button 
              type="button"
              onClick={onClose}
              className="px-10 py-5 bg-slate-50 text-slate-400 font-bold rounded-3xl hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 py-5 bg-maroon text-white font-black uppercase tracking-widest text-sm rounded-3xl shadow-2xl shadow-maroon/30 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={18} />
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Products;
