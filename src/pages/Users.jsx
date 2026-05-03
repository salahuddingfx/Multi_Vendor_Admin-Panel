import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useStore } from '../store/useStore';
import { Plus, User, Shield, Mail, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

const Users = () => {
  const { user: currentUser, updateUser } = useStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'admin' });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('role', formData.role);
    if (formData.password) data.append('password', formData.password);
    if (image) data.append('image', image);

    try {
      if (editingUser) {
        const response = await api.updateUser(editingUser.id, data);
        toast.success('User updated');
        
        // If updating currently logged in user, update store
        if (editingUser.id === currentUser?.id) {
          updateUser(response.data);
        }
      } else {
        await api.storeUser(data);
        toast.success('Admin user created');
      }
      setIsModalOpen(false);
      setEditingUser(null);
      setImage(null);
      setImagePreview(null);
      setFormData({ name: '', email: '', password: '', role: 'admin' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this admin?')) return;
    try {
      await api.deleteUser(id);
      toast.success('User deleted');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting user');
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-display font-black text-slate-800 tracking-tight">Admin Users</h1>
          <p className="text-slate-400 font-medium mt-1">Manage global access to your store dashboards.</p>
        </div>
        <button 
          onClick={() => { setEditingUser(null); setFormData({ name: '', email: '', password: '', role: 'admin' }); setIsModalOpen(true); }}
          className="bg-maroon text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-maroon/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={20} />
          Invite Admin
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-48 bg-white animate-pulse rounded-[40px]" />)
        ) : (
          users.map((user) => (
            <div key={user.id} className="bg-white p-8 rounded-[40px] shadow-premium border border-black/[0.01] relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150 duration-700" />
              
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-maroon/10 text-maroon flex items-center justify-center overflow-hidden border border-slate-100">
                    {user.image_path ? (
                      <img src={user.image_path} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <User size={32} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800">{user.name}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                       <Shield size={12} className="text-amber-500" />
                       {user.role}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-slate-500 font-medium">
                    <Mail size={18} className="text-slate-300" />
                    {user.email}
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button 
                    onClick={() => { 
                      setEditingUser(user); 
                      setFormData({ 
                        name: user.name || '', 
                        email: user.email || '', 
                        role: user.role || 'admin',
                        password: '' // Always initialize as string
                      }); 
                      setIsModalOpen(true); 
                    }}
                    className="flex-1 py-3 bg-slate-50 text-slate-600 rounded-xl font-bold hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Edit2 size={16} /> Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(user.id)}
                    className="w-12 h-12 bg-slate-50 text-red-400 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-display font-black mb-6">{editingUser ? 'Edit Admin' : 'New Admin Account'}</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative group cursor-pointer">
                  <div className="w-24 h-24 rounded-[32px] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden group-hover:border-maroon transition-all">
                    {imagePreview || editingUser?.image_path ? (
                      <img src={imagePreview || editingUser?.image_path} className="w-full h-full object-cover" />
                    ) : (
                      <Plus size={24} className="text-slate-300 group-hover:text-maroon" />
                    )}
                  </div>
                  <input 
                    type="file" 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setImage(file);
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*"
                  />
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-3">Upload Profile Image</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-maroon/5 focus:border-maroon transition-all font-medium"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email Address</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-maroon/5 focus:border-maroon transition-all font-medium"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">{editingUser ? 'New Password (Optional)' : 'Password'}</label>
                <input 
                  type="password" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-maroon/5 focus:border-maroon transition-all font-medium"
                  required={!editingUser}
                  minLength={6}
                />
              </div>
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-slate-50 text-slate-400 font-bold rounded-2xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-maroon text-white font-bold rounded-2xl shadow-lg shadow-maroon/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {editingUser ? 'Update' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
