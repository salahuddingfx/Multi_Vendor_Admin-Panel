import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../lib/api';
import { Plus, Edit2, Trash2, Tag, Star } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmModal from '../components/ConfirmModal';

const Categories = () => {
  const { selectedStore } = useStore();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [catToDelete, setCatToDelete] = useState(null);

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
    if (parentId) formData.append('parent_id', parentId);
    if (!editingCategory) formData.append('site_id', siteId);

    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, formData);
        toast.success('Category updated');
      } else {
        await api.storeCategory(formData);
        toast.success('Category created');
      }
      setIsModalOpen(false);
      setName('');
      setParentId('');
      setIsFeatured(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      toast.error('Error saving category');
    }
  };

  const handleDelete = async () => {
    if (!catToDelete) return;
    try {
      await api.deleteCategory(catToDelete);
      toast.success('Category deleted');
      fetchCategories();
      setShowDeleteConfirm(false);
      setCatToDelete(null);
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
            setParentId('');
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
            <div key={cat.id} className="space-y-4">
              <div className="bg-white p-6 rounded-[32px] shadow-premium border border-black/[0.01] group relative">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all overflow-hidden ${cat.is_featured ? 'bg-maroon text-white shadow-lg shadow-maroon/20' : 'bg-slate-50 text-slate-400'}`}>
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
                        setParentId(cat.parent_id || '');
                        setIsFeatured(cat.is_featured);
                        setIsModalOpen(true); 
                      }}
                      className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-slate-800 transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => {
                        setCatToDelete(cat.id);
                        setShowDeleteConfirm(true);
                      }}
                      className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-white transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Children / Subcategories */}
              {cat.children && cat.children.length > 0 && (
                <div className="ml-10 space-y-3 pl-6 border-l-2 border-slate-100">
                  {cat.children.map(sub => (
                    <div key={sub.id} className="bg-white/60 p-4 rounded-2xl flex items-center justify-between border border-black/[0.01]">
                      <div className="flex items-center gap-3">
                        <Tag size={14} className="text-slate-300" />
                        <span className="font-bold text-slate-700 text-sm">{sub.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => { 
                            setEditingCategory(sub); 
                            setName(sub.name); 
                            setParentId(sub.parent_id || '');
                            setIsFeatured(sub.is_featured);
                            setIsModalOpen(true); 
                          }}
                          className="w-8 h-8 rounded-lg bg-white text-slate-400 flex items-center justify-center hover:bg-slate-100 hover:text-slate-800 transition-all"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => {
                            setCatToDelete(sub.id);
                            setShowDeleteConfirm(true);
                          }}
                          className="w-8 h-8 rounded-lg bg-white text-slate-400 flex items-center justify-center hover:bg-red-50 hover:text-white transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Parent Category (Optional)</label>
                <select 
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-maroon/5 focus:border-maroon transition-all font-bold text-slate-900 appearance-none"
                >
                  <option value="">Top Level Category</option>
                  {categories.filter(c => c.id !== editingCategory?.id).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Category?"
        message="Are you sure? This will affect products in this category. This action cannot be undone."
        type="danger"
        confirmText="Yes, Delete Category"
      />
    </div>
  );
};

export default Categories;
