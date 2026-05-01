import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../lib/api';
import { Plus, Edit2, Trash2, Tag, Star } from 'lucide-react';
import { toast } from 'sonner';

const Categories = () => {
  const { selectedStore } = useStore();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const siteId = selectedStore === 'acharu' ? 1 : 2;

  useEffect(() => {
    fetchCategories();
  }, [selectedStore]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await api.getCategories(siteId);
      setCategories(data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('is_featured', isFeatured ? 1 : 0);
    if (image) formData.append('image', image);
    if (!editingCategory) formData.append('site_id', siteId);

    try {
      if (editingCategory) {
        // Use POST with _method=PUT for multipart updates if needed, 
        // but let's try direct put first or post if the API supports it.
        // Actually, our API updateHeroSlide uses POST for this reason.
        // Let's check if we should do the same for categories.
        await api.updateCategory(editingCategory.id, formData);
        toast.success('Category updated');
      } else {
        await api.storeCategory(formData);
        toast.success('Category created');
      }
      setIsModalOpen(false);
      setName('');
      setIsFeatured(false);
      setImage(null);
      setImagePreview(null);
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      toast.error('Error saving category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure? This will affect products in this category.')) return;
    try {
      await api.deleteCategory(id);
      toast.success('Category deleted');
      fetchCategories();
    } catch (error) {
      toast.error('Error deleting category');
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-black text-slate-800 tracking-tight uppercase">Categories</h1>
          <p className="text-slate-400 font-medium mt-1 uppercase text-xs tracking-widest">Organize your products for {selectedStore}</p>
        </div>
        <button 
          onClick={() => { 
            setEditingCategory(null); 
            setName(''); 
            setIsFeatured(false);
            setIsModalOpen(true); 
          }}
          className="bg-maroon text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-maroon/20 hover:scale-105 active:scale-95 transition-all uppercase text-sm tracking-wider"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-32 bg-white animate-pulse rounded-[40px]" />)
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="bg-white p-6 rounded-[32px] shadow-premium border border-black/[0.01] group relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${cat.is_featured ? 'bg-maroon text-white shadow-lg shadow-maroon/20' : 'bg-slate-50 text-slate-400'}`}>
                    <Tag size={24} />
                  </div>
                  <div>
                    <div className="font-black text-slate-800 text-lg uppercase tracking-tight">{cat.name}</div>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Slug: {cat.slug}</span>
                       {cat.is_featured && (
                         <span className="flex items-center gap-1 text-[8px] font-black bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">
                           <Star size={8} fill="currentColor" /> Featured
                         </span>
                       )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => { 
                      setEditingCategory(cat); 
                      setName(cat.name); 
                      setIsFeatured(cat.is_featured);
                      setIsModalOpen(true); 
                    }}
                    className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-slate-800 transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(cat.id)}
                    className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-white transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-3xl font-display font-black mb-8 text-slate-900 uppercase tracking-tight">
              {editingCategory ? 'Edit Category' : 'New Category'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Category Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-maroon/5 focus:border-maroon transition-all font-bold text-slate-900"
                  placeholder="e.g. Spicy Pickles"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Category Image</label>
                <div 
                  onClick={() => document.getElementById('cat-image').click()}
                  className="w-full aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-maroon/20 hover:bg-slate-100 transition-all overflow-hidden group"
                >
                  {imagePreview || (editingCategory && editingCategory.image_path) ? (
                    <img src={imagePreview || editingCategory.image_path} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform mb-3 shadow-sm">
                        <Plus size={24} />
                      </div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Cover Image</p>
                    </>
                  )}
                </div>
                <input 
                  id="cat-image"
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setImage(file);
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>

              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[28px] border border-slate-100">
                <div>
                  <h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">Featured Category</h4>
                  <p className="text-[10px] text-slate-400 font-medium">Show this on the homepage</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFeatured(!isFeatured)}
                  className={`w-12 h-6 rounded-full transition-all relative ${isFeatured ? 'bg-maroon' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isFeatured ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-5 bg-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-200 transition-all uppercase text-xs tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-5 bg-maroon text-white font-black rounded-2xl shadow-xl shadow-maroon/20 hover:scale-[1.02] active:scale-95 transition-all uppercase text-xs tracking-widest"
                >
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
