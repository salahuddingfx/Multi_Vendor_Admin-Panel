import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Plus, Edit2, Trash2, Check, X, FileText, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';

const Pages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: ''
  });

  const { selectedStore } = useStore();
  const siteId = selectedStore === 'acharu' ? 1 : 2;

  useEffect(() => {
    fetchPages();
  }, [selectedStore]);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const res = await api.getPages(siteId);
      // Handle both paginated (res.data) and plain array responses
      setPages(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (page = null) => {
    if (page) {
      setEditingId(page.id);
      setFormData({
        title: page.title,
        slug: page.slug,
        content: page.content || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        slug: '',
        content: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, site_id: siteId };
      if (editingId) {
        await api.updatePage(editingId, payload);
      } else {
        await api.storePage(payload);
      }
      setShowModal(false);
      fetchPages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this page?")) {
      try {
        await api.deletePage(id);
        fetchPages();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dynamic Pages</h1>
          <p className="text-slate-500">Manage About Us, Terms & Conditions, and other pages.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
          <Plus size={18} /> Add New Page
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-maroon" size={32} /></div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-4">Page Title</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Last Updated</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pages.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-slate-500">No pages found. Create one!</td></tr>
              ) : pages.map(page => (
                <tr key={page.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                      <FileText size={18} />
                    </div>
                    {page.title}
                  </td>
                  <td className="p-4 text-slate-600 font-mono text-sm">{page.slug}</td>
                  <td className="p-4 text-slate-500">{new Date(page.updated_at).toLocaleDateString()}</td>
                  <td className="p-4 flex items-center justify-end gap-2">
                    <button onClick={() => handleOpenModal(page)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(page.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">{editingId ? 'Edit Page' : 'Add New Page'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Page Title</label>
                  <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 focus:border-maroon focus:ring-1 focus:ring-maroon outline-none" placeholder="e.g. About Us" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">URL Slug</label>
                  <input required type="text" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 focus:border-maroon focus:ring-1 focus:ring-maroon outline-none font-mono text-sm" placeholder="e.g. about-us" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Page Content (HTML/Text)</label>
                <textarea required rows="10" value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} className="w-full p-3 rounded-xl border border-slate-200 focus:border-maroon focus:ring-1 focus:ring-maroon outline-none font-mono text-sm" placeholder="<p>Write your content here...</p>"></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100">Cancel</button>
                <button type="submit" className="btn-primary flex items-center gap-2"><Check size={18} /> {editingId ? 'Save Changes' : 'Create Page'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pages;
