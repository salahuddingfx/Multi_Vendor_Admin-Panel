import { Outlet, Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Warehouse, 
  FileText, 
  Settings, 
  Menu, 
  X,
  ChevronDown,
  Globe,
  Bell,
  LogOut,
  Mail,
  Users,
  Image as ImageIcon,
  Star
} from 'lucide-react';
import { clsx } from 'clsx';
import { Toaster, toast } from 'sonner';

const AdminLayout = () => {
  const { selectedStore, setSelectedStore, isSidebarOpen, toggleSidebar, logout, user } = useStore();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Orders', href: '/orders', icon: ShoppingBag },
    { name: 'Inventory', href: '/inventory', icon: Warehouse },
    { name: 'Categories', href: '/categories', icon: Globe },
    { name: 'Banners', href: '/banners', icon: ImageIcon },
    { name: 'Pages', href: '/pages', icon: FileText },
    { name: 'Reviews', href: '/reviews', icon: Star },
    { name: 'Messages', href: '/messages', icon: Mail },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const stores = [
    { id: 'acharu', name: 'Acharu', color: '#800000', bg: '#FDF2F2' },
    { id: 'tajashutki', name: 'Tajashutki', color: '#475569', bg: '#F8FAFC' },
  ];

  const handleStoreChange = (id) => {
    setSelectedStore(id);
    const storeName = stores.find(s => s.id === id)?.name;
    toast.success(`Switched to ${storeName} context`, {
      style: {
        background: id === 'acharu' ? '#800000' : '#475569',
        color: 'white',
        border: 'none',
        borderRadius: '16px'
      }
    });
  };

  const currentStore = stores.find(s => s.id === selectedStore) || stores[0];
  const themeColor = currentStore.color;

  return (
    <div 
      className="min-h-screen flex font-sans transition-colors duration-1000"
      style={{ backgroundColor: currentStore.bg }}
    >
      <Toaster position="top-right" expand={false} richColors />
      
      {/* Sidebar - Floating Aesthetic */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-50 p-4 transition-all duration-700 md:relative",
        isSidebarOpen ? "w-80" : "w-28 -translate-x-full md:translate-x-0"
      )}>
        <div className="h-full flex flex-col bg-white rounded-[40px] shadow-premium border border-black/[0.02] overflow-hidden">
          {/* Logo Section */}
          <div className="p-10 flex items-center gap-5">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black italic shadow-2xl transition-all duration-700"
              style={{ 
                backgroundColor: themeColor, 
                boxShadow: `0 12px 24px -6px ${themeColor}60`,
                transform: isSidebarOpen ? 'rotate(0deg)' : 'rotate(45deg)'
              }}
            >
              {selectedStore === 'acharu' ? 'A' : 'T'}
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-700">
                <span className="font-display font-black text-2xl text-slate-800 tracking-tight leading-none">
                  Global <span style={{ color: themeColor }}>Admin</span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-2">NextGen Control</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-grow px-6 space-y-3 overflow-y-auto custom-scrollbar pt-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    "flex items-center gap-5 px-6 py-5 rounded-[28px] font-bold transition-all duration-500 group relative",
                    isActive 
                      ? "text-white shadow-2xl scale-[1.02]" 
                      : "text-slate-400 hover:bg-slate-50 hover:text-slate-800"
                  )}
                  style={isActive ? { backgroundColor: themeColor, boxShadow: `0 15px 30px -10px ${themeColor}80` } : {}}
                >
                  <item.icon size={22} className={clsx(isActive ? "text-white" : "text-slate-400 group-hover:scale-110 group-hover:rotate-6 transition-all")} />
                  {isSidebarOpen && <span className="tracking-tight text-base">{item.name}</span>}
                  
                  {/* Subtle Glow Effect for Active */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-[28px] bg-white/10 blur-xl animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="p-6 m-4 mt-auto rounded-[32px] bg-slate-50/80 space-y-4 border border-slate-100">
             {isSidebarOpen ? (
               <div className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-sm">
                 <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 border border-slate-100">
                   {user?.name?.split(' ').map(n => n[0]).join('') || 'AD'}
                 </div>
                 <div className="flex-grow overflow-hidden">
                   <p className="font-bold text-slate-800 text-sm truncate">{user?.name || 'Admin User'}</p>
                   <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest truncate">{user?.role || 'Administrator'}</p>
                 </div>
               </div>
             ) : (
               <div className="w-14 h-14 mx-auto rounded-2xl bg-white shadow-sm flex items-center justify-center font-black text-slate-400 border border-slate-100">
                 {user?.name?.split(' ').map(n => n[0]).join('') || 'AD'}
               </div>
             )}
             
             <button 
               onClick={() => {
                 logout();
                 toast.success('Logged out safely');
               }}
               className={clsx(
                 "w-full flex items-center gap-4 px-6 py-5 rounded-[24px] font-bold text-red-500 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/20 transition-all",
                 !isSidebarOpen && "justify-center"
               )}
             >
               <LogOut size={22} />
               {isSidebarOpen && <span>Sign Out</span>}
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Topbar - Glassmorphic */}
        <header className="h-24 px-10 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-8">
            <button 
              onClick={toggleSidebar}
              className="p-4 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-800 rounded-2xl transition-all shadow-sm border border-slate-100"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="hidden sm:block">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1">Navigation / {selectedStore}</p>
              <h2 className="font-display font-black text-slate-800 text-2xl tracking-tight leading-none">
                {navigation.find(n => n.href === location.pathname)?.name || 'Dashboard'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Store Selector - Improved */}
            <div className="flex items-center gap-2 bg-white/50 backdrop-blur-md p-1.5 rounded-[24px] border border-white/60 shadow-sm">
              {stores.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleStoreChange(s.id)}
                  className={clsx(
                    "px-6 py-3 rounded-[20px] text-xs font-black transition-all duration-500 uppercase tracking-widest",
                    selectedStore === s.id 
                      ? "bg-white text-slate-800 shadow-premium border border-slate-100 scale-105" 
                      : "text-slate-400 hover:text-slate-600 hover:bg-white/30"
                  )}
                >
                  {s.name}
                </button>
              ))}
            </div>
            
            <button className="relative p-4 bg-white text-slate-400 hover:text-slate-800 rounded-2xl transition-all shadow-sm border border-slate-100 group">
              <div 
                className="absolute top-3.5 right-3.5 w-2.5 h-2.5 rounded-full border-4 border-white animate-pulse"
                style={{ backgroundColor: themeColor }}
              />
              <Bell size={22} className="group-hover:rotate-12 transition-transform" />
            </button>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="p-10 pt-4 max-w-[1800px] mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-40 md:hidden transition-all duration-700"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default AdminLayout;
