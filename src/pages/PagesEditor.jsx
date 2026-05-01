import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../lib/api';
import { Plus, FileText, Edit3, Trash2, Globe, Eye } from 'lucide-react';
import { toast } from 'sonner';

const PagesEditor = () => {
  const { selectedStore } = useStore();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', is_active: true });

  const siteId = selectedStore === 'acharu' ? 1 : 2;

  useEffect(() => {
    fetchPages();
  }, [selectedStore]);

  const fetchPages = async () => {
    setLoading(true);
    try {
      const data = await api.getPages(siteId);
      setPages(data);
    } catch (error) {
      toast.error('Failed to fetch pages');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPage) {
        await api.updatePage(editingPage.id, formData);
        toast.success('Page updated');
      } else {
        await api.storePage({ site_id: siteId, ...formData });
        toast.success('Page created');
      }
      setIsModalOpen(false);
      setEditingPage(null);
      setFormData({ title: '', content: '', is_active: true });
      fetchPages();
    } catch (error) {
      toast.error('Error saving page');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this page permanently?')) return;
    try {
      await api.deletePage(id);
      toast.success('Page deleted');
      fetchPages();
    } catch (error) {
      toast.error('Error deleting page');
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-black text-slate-800 tracking-tight">Dynamic Pages</h1>
          <p className="text-slate-400 font-medium mt-1">Manage static content (About, Privacy, etc.) for {selectedStore === 'acharu' ? 'Acharu' : 'Taja Shutki'}.</p>
        </div>
        <button 
          onClick={() => { setEditingPage(null); setFormData({ title: '', content: '', is_active: true }); setIsModalOpen(true); }}
          className="bg-maroon text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-maroon/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20} />
          Create Page
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {loading ? (
          [1,2].map(i => <div key={i} className="h-64 bg-white animate-pulse rounded-[40px]" />)
        ) : (
          pages.map((page) => (
            <div key={page.id} className="bg-white p-8 rounded-[40px] shadow-premium border border-black/[0.01] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <FileText size={24} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Content Page</span>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${page.is_active ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                    {page.is_active ? 'Published' : 'Draft'}
                  </div>
                </div>
                <h3 className="text-2xl font-display font-black text-slate-800 mb-2">{page.title}</h3>
                <p className="text-slate-400 text-sm font-medium mb-6">/{page.slug}</p>
                <p className="text-slate-500 line-clamp-3 font-medium leading-relaxed mb-8">{page.content.substring(0, 150)}...</p>
              </div>

              <div className="flex items-center gap-4 pt-8 border-t border-slate-50">
                <button 
                  onClick={() => { setEditingPage(page); setFormData({ title: page.title, content: page.content, is_active: page.is_active }); setIsModalOpen(true); }}
                  className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
                >
                  <Edit3 size={18} /> Edit Page
                </button>
                <button 
                  onClick={() => handleDelete(page.id)}
                  className="w-12 h-12 bg-slate-50 text-red-400 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-slate-900/40">
            <h2 className="text-3xl font-display font-black mb-8">{editingPage ? 'Edit Content Page' : 'New Content Page'}</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Page Title</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-maroon/5 focus:border-maroon transition-all font-bold"
                    placeholder="e.g. About Our Heritage"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Status</label>
                  <select 
                    value={formData.is_active}
                    onChange={(e) => setFormData({...formData, is_active: e.target.value === 'true'})}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-maroon/5 focus:border-maroon transition-all font-bold appearance-none"
                  >
                    <option value="true">Published</option>
                    <option value="false">Draft / Hidden</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Page Content (HTML supported)</label>
                <textarea 
                  rows={12}
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  className="w-full px-8 py-6 bg-slate-50 border border-slate-100 rounded-[32px] outline-none focus:ring-4 focus:ring-maroon/5 focus:border-maroon transition-all font-medium leading-relaxed"
                  placeholder="Enter page content here..."
                  required
                />
              </div>

              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-10 py-4 bg-slate-50 text-slate-400 font-bold rounded-2xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-maroon text-white font-bold rounded-2xl shadow-xl shadow-maroon/20 hover:scale-[1.01] active:scale-95 transition-all"
                >
                  {editingPage ? 'Save Changes' : 'Publish Page'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PagesEditor;
