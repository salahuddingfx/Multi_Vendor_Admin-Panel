import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../lib/api';
import { Plus, Search, Edit2, Trash2, Tag } from 'lucide-react';
import { toast } from 'sonner';

const Categories = () => {
  const { selectedStore } = useStore();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');

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
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, { name });
        toast.success('Category updated');
      } else {
        await api.storeCategory({ site_id: siteId, name });
        toast.success('Category created');
      }
      setIsModalOpen(false);
      setName('');
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
          <h1 className="text-4xl font-display font-black text-slate-800 tracking-tight">Categories</h1>
          <p className="text-slate-400 font-medium mt-1">Organize your products for {selectedStore === 'acharu' ? 'Acharu' : 'Taja Shutki'}.</p>
        </div>
        <button 
          onClick={() => { setEditingCategory(null); setName(''); setIsModalOpen(true); }}
          className="bg-maroon text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-maroon/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20} />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-32 bg-white animate-pulse rounded-[32px]" />)
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="bg-white p-6 rounded-[32px] shadow-premium border border-black/[0.01] group flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-maroon group-hover:text-white transition-all">
                  <Tag size={20} />
                </div>
                <div>
                  <div className="font-bold text-slate-800">{cat.name}</div>
                  <div className="text-xs text-slate-400 font-medium">Slug: {cat.slug}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setEditingCategory(cat); setName(cat.name); setIsModalOpen(true); }}
                  className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-maroon hover:text-white transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(cat.id)}
                  className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-display font-black mb-6">{editingCategory ? 'Edit Category' : 'New Category'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Category Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-maroon/5 focus:border-maroon transition-all font-medium"
                  placeholder="e.g. Spicy Pickles"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-slate-50 text-slate-400 font-bold rounded-2xl hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-maroon text-white font-bold rounded-2xl shadow-lg shadow-maroon/20 hover:scale-[1.02] active:scale-95 transition-all"
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
