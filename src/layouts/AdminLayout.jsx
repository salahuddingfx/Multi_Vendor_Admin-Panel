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
  Star,
  Ticket,
  TrendingUp
} from 'lucide-react';
import { clsx } from 'clsx';
import { Toaster, toast } from 'sonner';
import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';

const AdminLayout = () => {
  const { selectedStore, setSelectedStore, isSidebarOpen, toggleSidebar, logout, user, updateUser } = useStore();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Orders', href: '/orders', icon: ShoppingBag },
    { name: 'Sales', href: '/sales', icon: TrendingUp },
    { name: 'Inventory', href: '/inventory', icon: Warehouse },
    { name: 'Categories', href: '/categories', icon: Globe },
    { name: 'Banners', href: '/banners', icon: ImageIcon },
    { name: 'Reviews', href: '/reviews', icon: Star },
    { name: 'Coupons', href: '/coupons', icon: Ticket },
    { name: 'Messages', href: '/messages', icon: Mail },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Customers', href: '/customers', icon: Users },
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

  // Notification State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownRef = useRef(null);
  const hasFetchedInitial = useRef(false);

  useEffect(() => {
    if (!hasFetchedInitial.current) {
      fetchNotifications();
      hasFetchedInitial.current = true;
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      const interval = setInterval(() => {
        fetchNotifications(true);
      }, 1000); // 1 second polling as requested
      return () => clearInterval(interval);
    }
  }, [user?.id, notifications?.[0]?.id]); 

  const fetchNotifications = async (isPoll = false) => {
    try {
      const data = await api.getNotifications();
      const newNotifications = data.notifications || [];
      const oldNotifications = notifications;

      // Detect new notification for toast
      if (isPoll && newNotifications.length > 0 && oldNotifications.length > 0) {
        const latestNew = newNotifications[0];
        const latestOld = oldNotifications[0];

        if (latestNew.id !== latestOld.id) {
          toast.info(latestNew.data?.title || 'New Notification', {
            description: latestNew.data?.message,
            action: {
              label: 'View',
              onClick: () => window.location.href = latestNew.data?.link || '#'
            },
            style: {
              background: themeColor,
              color: 'white',
              borderRadius: '20px'
            }
          });
        }
      }

      setNotifications(newNotifications);
      setUnreadCount(data.unread_count || 0);
    } catch (error) {
      if (!isPoll) console.error('Failed to fetch notifications', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date() } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const markAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date() })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read', error);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await api.getProfile();
        // Check if data actually changed to avoid unnecessary re-renders
        if (JSON.stringify(profile) !== JSON.stringify(user)) {
          updateUser(profile);
        }
      } catch (error) {
        console.error('Failed to sync profile', error);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
      className="h-screen flex font-sans transition-colors duration-1000 overflow-hidden"
      style={{ backgroundColor: currentStore.bg }}
    >
      <Toaster position="top-right" expand={false} richColors />
      
      {/* Sidebar - Floating Aesthetic */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-50 p-4 transition-all duration-700 h-full shrink-0",
        isSidebarOpen ? "w-80" : "w-28 -translate-x-full md:translate-x-0"
      )}>
        <div className="h-full flex flex-col bg-white rounded-[40px] shadow-premium border border-black/[0.02] overflow-hidden">
          {/* Logo Section */}
          <div className={clsx(
            "flex items-center shrink-0 transition-all duration-700",
            isSidebarOpen ? "p-10 gap-5" : "p-6 justify-center"
          )}>
            <div 
              className="w-14 h-14 rounded-full flex items-center justify-center bg-white shadow-2xl transition-all duration-700 overflow-hidden border border-slate-100"
              style={{ 
                transform: isSidebarOpen ? 'rotate(0deg)' : 'rotate(360deg)'
              }}
            >
              <img src="/Acharu and TajaShutki.png" alt="Admin Logo" className="w-full h-full object-cover" />
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
          <nav className="flex-grow px-6 space-y-2 overflow-y-auto custom-scrollbar pt-2 pb-10">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  title={!isSidebarOpen ? item.name : ''}
                  className={clsx(
                    "flex items-center font-bold transition-all duration-300 group relative",
                    isSidebarOpen ? "gap-5 px-6 py-4 rounded-[24px]" : "justify-center p-5 rounded-[20px]",
                    isActive 
                      ? "text-white shadow-lg" 
                      : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                  )}
                  style={isActive ? { backgroundColor: themeColor, boxShadow: `0 12px 24px -10px ${themeColor}80` } : {}}
                >
                  <item.icon size={isActive ? 22 : 20} className={clsx(isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900 transition-colors")} />
                  {isSidebarOpen && <span className="tracking-tight text-sm">{item.name}</span>}
                  
                  {/* Subtle active indicator dot */}
                  {!isSidebarOpen && isActive && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="p-3 md:p-4 m-3 mt-auto rounded-[32px] bg-slate-50/80 space-y-3 border border-slate-100 shrink-0">
             {isSidebarOpen ? (
               <div className="flex items-center gap-3 p-3 rounded-2xl bg-white shadow-sm overflow-hidden">
                 <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 border border-slate-100 overflow-hidden shrink-0">
                   {user?.image_path ? (
                     <img src={user.image_path} alt={user.name} className="w-full h-full object-cover" />
                   ) : (
                     user?.name?.split(' ').map(n => n[0]).join('') || 'AD'
                   )}
                 </div>
                 <div className="flex-grow overflow-hidden">
                   <p className="font-bold text-slate-800 text-xs truncate">{user?.name || 'Admin User'}</p>
                   <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest truncate">{user?.role || 'Administrator'}</p>
                 </div>
               </div>
             ) : (
               <div className="w-12 h-12 mx-auto rounded-xl bg-white shadow-sm flex items-center justify-center font-black text-slate-400 border border-slate-100 overflow-hidden shrink-0">
                 {user?.image_path ? (
                   <img src={user.image_path} alt={user.name} className="w-full h-full object-cover" />
                 ) : (
                   user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2) || 'AD'
                 )}
               </div>
             )}
             
             <button 
               onClick={() => {
                 logout();
                 toast.success('Logged out safely');
               }}
               className={clsx(
                 "w-full flex items-center gap-3 px-4 py-4 rounded-[20px] font-bold text-red-500 hover:bg-red-500 hover:text-white transition-all",
                 !isSidebarOpen && "justify-center"
               )}
             >
               <LogOut size={20} />
               {isSidebarOpen && <span className="text-sm">Sign Out</span>}
             </button>

             {isSidebarOpen && (
               <div className="pt-4 text-center">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                   Developed by <span style={{ color: themeColor }}>Salah Uddin Kader</span>
                 </p>
               </div>
             )}
          </div>
        </div>
      </aside>

      {/* Spacer for Fixed Sidebar on Desktop */}
      <div className={clsx(
        "hidden md:block transition-all duration-700 shrink-0",
        isSidebarOpen ? "w-80" : "w-28"
      )} />

      {/* Main Content Area - Independently Scrollable */}
      <div className="flex-grow flex flex-col min-w-0 h-full overflow-hidden">
        {/* Topbar - Glassmorphic */}
        <header className="h-24 px-10 flex items-center justify-between sticky top-0 z-40 shrink-0">
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
            
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-4 bg-white text-slate-400 hover:text-slate-800 rounded-2xl transition-all shadow-sm border border-slate-100 group"
              >
                {unreadCount > 0 && (
                  <div 
                    className="absolute top-3.5 right-3.5 w-2.5 h-2.5 rounded-full border-4 border-white animate-pulse"
                    style={{ backgroundColor: themeColor }}
                  />
                )}
                <Bell size={22} className={clsx("group-hover:rotate-12 transition-transform", isNotificationOpen && "text-slate-800")} />
              </button>

              {/* Notification Dropdown */}
              {isNotificationOpen && (
                <div className="absolute right-0 mt-4 w-[400px] bg-white rounded-[32px] shadow-premium border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-300">
                  <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="font-display font-black text-slate-800 text-lg">Notifications</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllRead}
                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-colors"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                    {notifications?.length > 0 ? (
                      <div className="divide-y divide-slate-50">
                        {notifications.map((n) => (
                          <div 
                            key={n.id} 
                            onClick={() => {
                              if (!n.read_at) markAsRead(n.id);
                              if (n.data?.link) window.location.href = n.data.link;
                            }}
                            className={clsx(
                              "p-6 hover:bg-slate-50 transition-colors cursor-pointer group relative",
                              !n.read_at && "bg-slate-50/50"
                            )}
                          >
                            {!n.read_at && (
                              <div 
                                className="absolute left-0 top-0 bottom-0 w-1"
                                style={{ backgroundColor: themeColor }}
                              />
                            )}
                            <div className="flex gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                <Bell size={18} className="text-slate-400" />
                              </div>
                              <div className="flex-grow">
                                <p className="font-bold text-slate-800 text-sm">{n.data?.title || 'Notification'}</p>
                                <p className="text-slate-500 text-xs mt-1 leading-relaxed">{n.data?.message}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-3">
                                  {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Bell size={24} className="text-slate-300" />
                        </div>
                        <p className="font-bold text-slate-400 text-sm">No notifications yet</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-slate-50/50 border-t border-slate-50 text-center">
                    <button className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-800 transition-colors">
                      View All Activity
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content Container */}
        <main className="flex-grow overflow-y-auto px-6 md:px-10 py-6 custom-scrollbar">
           <div className="max-w-[1800px] mx-auto w-full pb-20">
              <Outlet />
           </div>
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
