import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { api as apiLogin } from '../lib/api';
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiLogin.login({ email, password });
      localStorage.setItem('admin_token', response.data.token);
      login(response.data.user);
      toast.success('Welcome back, ' + response.user.name + '!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[40px] shadow-soft-lg p-10 border border-black/[0.03] relative overflow-hidden">
          {/* Decorative Gradient */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-maroon/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          
          <div className="relative text-center mb-10">
            <div className="w-16 h-16 bg-maroon rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-maroon/20">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-3xl font-display font-black text-slate-800 tracking-tight">Global Admin</h1>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-2">Authentication Required</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-maroon transition-colors" size={20} />
                <input 
                  type="email" 
                  required
                  placeholder="admin@acharu.com"
                  className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-maroon/5 focus:border-maroon focus:bg-white transition-all font-medium text-slate-700"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-maroon transition-colors" size={20} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="••••••••"
                  className="w-full pl-14 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-maroon/5 focus:border-maroon focus:bg-white transition-all font-medium text-slate-700"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-maroon transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-maroon text-white font-black rounded-2xl shadow-xl shadow-maroon/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:hover:scale-100"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Access Dashboard
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-10 text-slate-400 text-xs font-medium">
            Authorized access only. Technical issues? <a href="#" className="text-maroon font-bold hover:underline">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
