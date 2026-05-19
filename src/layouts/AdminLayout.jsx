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
  TrendingUp,
  Search as SearchIcon,
  Command
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { Toaster, toast } from 'sonner';
import { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';

const AdminLayout = () => {
  const { selectedStore, setSelectedStore, isSidebarOpen, toggleSidebar, logout, user, updateUser, settings, setSettings, isAuthenticated } = useStore();
  const location = useLocation();

  const timeoutRef = useRef(null);

  // Fetch settings in AdminLayout
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const siteId = selectedStore === 'acharu' ? 1 : 2;
        const data = await api.getSettings(siteId);
        setSettings(data);
      } catch (error) {
        console.error('Failed to fetch settings in AdminLayout', error);
      }
    };
    if (isAuthenticated) {
      fetchSettings();
    }
  }, [selectedStore, isAuthenticated, setSettings]);

  // Inactivity timeout logic
  useEffect(() => {
    const events = ['mousemove', 'keypress', 'mousedown', 'scroll', 'touchstart'];
    
    const resetInactivityTimer = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      const security = settings?.security;
      const inactivityEnabled = security?.inactivity_timeout_enabled ?? true;
      
      if (!inactivityEnabled) return;
      
      const timeoutMinutes = parseInt(security?.inactivity_timeout) || 15;
      const timeoutMs = timeoutMinutes * 60 * 1000;
      
      timeoutRef.current = setTimeout(() => {
        logout();
        toast.error("Logged out due to inactivity.", {
          duration: 5000,
          style: {
            background: '#EF4444',
            color: 'white',
            borderRadius: '16px'
          }
        });
      }, timeoutMs);
    };

    if (isAuthenticated) {
      resetInactivityTimer();
      const handleActivity = () => resetInactivityTimer();
      
      events.forEach(event => window.addEventListener(event, handleActivity));
      
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        events.forEach(event => window.removeEventListener(event, handleActivity));
      };
    }
  }, [isAuthenticated, settings?.security, logout]);

  // Working hours check logic
  useEffect(() => {
    const checkWorkingHours = () => {
      const security = settings?.security;
      if (!security?.working_hours_enabled) return;
      
      const now = new Date();
      // Convert current local time to Bangladesh Standard Time (UTC+6)
      const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
      const bdTime = new Date(utcTime + (3600000 * 6));
      
      const bdDay = bdTime.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      const bdHours = bdTime.getHours();
      const bdMinutes = bdTime.getMinutes();
      
      // Check working days
      const workingDays = security.working_days || [0, 1, 2, 3, 4, 5, 6];
      const parsedWorkingDays = workingDays.map(Number);
      
      if (!parsedWorkingDays.includes(bdDay)) {
        logout();
        toast.error("Logged out: Today is not a working day.", {
          duration: 5000,
          style: {
            background: '#EF4444',
            color: 'white',
            borderRadius: '16px'
          }
        });
        return;
      }
      
      // Check working hours
      const startStr = security.working_hours_start || "09:00";
      const endStr = security.working_hours_end || "18:00";
      
      const [startH, startM] = startStr.split(':').map(Number);
      const [endH, endM] = endStr.split(':').map(Number);
      
      const currentMinutes = bdHours * 60 + bdMinutes;
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      
      if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
        logout();
        toast.error("Logged out: Outside of working hours.", {
          duration: 5000,
          style: {
            background: '#EF4444',
            color: 'white',
            borderRadius: '16px'
          }
        });
      }
    };

    if (isAuthenticated && settings) {
      checkWorkingHours(); // Initial check
      const interval = setInterval(checkWorkingHours, 15000); // Check every 15 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, settings, logout]);

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
  const [lowStockCount, setLowStockCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const dropdownRef = useRef(null);
  const hasFetchedInitial = useRef(false);

  // Command Palette State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [commandSearch, setCommandSearch] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredNavigation = navigation.filter(item => 
    item.name.toLowerCase().includes(commandSearch.toLowerCase())
  );

  useEffect(() => {
    if (!hasFetchedInitial.current) {
      fetchNotifications();
      fetchDashboardStats();
      hasFetchedInitial.current = true;
    }
  }, [selectedStore]); // Re-fetch on store change

  useEffect(() => {
    if (user?.id) {
      const interval = setInterval(() => {
        fetchNotifications(true);
      }, 30000); // 30 second polling to prevent overwhelming single-threaded PHP server
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

  const fetchDashboardStats = async () => {
    try {
      const stats = await api.getDashboardStats(selectedStore);
      setLowStockCount(stats.lowStock || 0);
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
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
        isSidebarOpen ? "w-80" : "w-[100px] -translate-x-full md:translate-x-0"
      )}>
        <div className="h-full flex flex-col bg-white rounded-[40px] shadow-premium border border-black/[0.02] overflow-hidden">
          {/* Logo Section */}
          <div className={clsx(
            "flex items-center shrink-0 transition-all duration-700",
            isSidebarOpen ? "p-10 gap-5" : "p-6 justify-center"
          )}>
            <div 
              className={clsx(
                "rounded-full flex items-center justify-center bg-white shadow-2xl transition-all duration-700 overflow-hidden border border-slate-100 shrink-0",
                isSidebarOpen ? "w-14 h-14" : "w-12 h-12"
              )}
              style={{ 
                transform: isSidebarOpen ? 'rotate(0deg)' : 'rotate(360deg)'
              }}
            >
              <img src="/Acharu and TajaShutki.png" alt="Admin Logo" className="w-full h-full object-cover" />
            </div>
            {isSidebarOpen && (
              <div className="flex flex-col animate-in fade-in slide-in-from-left-4 duration-700">
                <span className="font-display font-black text-2xl text-slate-800 tracking-tight leading-none">
                  Nexus <span style={{ color: themeColor }}>Admin</span>
                </span>
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2.5">Unified Ecosystem</span>
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
                    isSidebarOpen ? "gap-5 px-6 py-4 rounded-[24px]" : "justify-center w-14 h-14 mx-auto rounded-2xl",
                    isActive 
                      ? "text-white shadow-lg" 
                      : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                  )}
                  style={isActive ? { backgroundColor: themeColor, boxShadow: `0 12px 24px -10px ${themeColor}80` } : {}}
                >
                  <item.icon size={isActive ? 22 : 20} className={clsx(isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900 transition-colors")} />
                  {isSidebarOpen && <span className="tracking-tight text-sm font-display font-bold">{item.name}</span>}
                  
                  {/* Badge for Inventory */}
                  {item.name === 'Inventory' && lowStockCount > 0 && (
                    <div className={clsx(
                      "absolute flex items-center justify-center rounded-full border-2 border-white font-black",
                      isSidebarOpen ? "right-6 px-2 py-0.5 text-[8px] min-w-[20px]" : "top-2 right-2 w-4 h-4 text-[7px]",
                      isActive ? "bg-white text-slate-900" : "bg-red-500 text-white"
                    )}>
                      {lowStockCount}
                    </div>
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
                    <p className="font-black text-slate-800 text-xs truncate font-display tracking-tight">{user?.name || 'Admin User'}</p>
                    <p className="text-maroon text-[10px] font-bold truncate mt-0.5">@{user?.username || 'admin'}</p>
                    <p className="text-slate-400 text-[8px] font-black uppercase tracking-widest truncate mt-0.5">{user?.role || 'Administrator'}</p>
                  </div>
               </div>
             ) : (
               <div className="w-12 h-12 mx-auto rounded-2xl bg-white shadow-sm flex items-center justify-center font-black text-slate-400 border border-slate-100 overflow-hidden shrink-0">
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
                 isSidebarOpen ? "w-full flex items-center gap-3 px-4 py-4 rounded-[20px]" : "w-14 h-14 mx-auto flex items-center justify-center rounded-2xl",
                 "font-bold text-red-500 hover:bg-red-500 hover:text-white transition-all"
               )}
             >
               <LogOut size={20} />
               {isSidebarOpen && <span className="text-sm">Sign Out</span>}
             </button>

          </div>
        </div>
      </aside>

      {/* Spacer for Fixed Sidebar on Desktop */}
      <div className={clsx(
        "hidden md:block transition-all duration-700 shrink-0",
        isSidebarOpen ? "w-80" : "w-[100px]"
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
            <div className="hidden sm:flex items-center gap-4">
              <div 
                onClick={() => setIsCommandPaletteOpen(true)}
                className="flex items-center gap-3 px-6 py-3 bg-white/50 border border-slate-100 rounded-2xl cursor-pointer hover:bg-white hover:shadow-lg transition-all group"
              >
                <SearchIcon size={16} className="text-slate-400 group-hover:text-slate-900" />
                <span className="text-xs font-bold text-slate-400 group-hover:text-slate-600">Quick Search...</span>
                <div className="flex items-center gap-1 ml-4 px-2 py-1 bg-slate-100 rounded-lg">
                  <Command size={10} className="text-slate-400" />
                  <span className="text-[9px] font-black text-slate-400">K</span>
                </div>
              </div>
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

      {/* Command Palette Modal */}
      <AnimatePresence>
        {isCommandPaletteOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-32 px-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 relative">
                <SearchIcon className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Where do you want to go?..."
                  className="w-full pl-16 pr-8 py-4 bg-slate-50 border-none rounded-3xl outline-none text-lg font-bold text-slate-800 placeholder:text-slate-300"
                  value={commandSearch}
                  onChange={(e) => setCommandSearch(e.target.value)}
                />
              </div>
              
              <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                <div className="px-4 py-2">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Navigation</p>
                  <div className="grid grid-cols-1 gap-2">
                    {filteredNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => {
                          setIsCommandPaletteOpen(false);
                          setCommandSearch('');
                        }}
                        className="flex items-center justify-between p-4 rounded-[24px] hover:bg-slate-50 transition-all group"
                      >
                        <div className="flex items-center gap-5">
                          <div className="p-3 bg-white border border-slate-100 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                            <item.icon size={20} />
                          </div>
                          <span className="font-display font-bold text-slate-800 text-lg tracking-tight">{item.name}</span>
                        </div>
                        <ChevronDown size={18} className="text-slate-200 -rotate-90 group-hover:text-slate-400 transition-colors" />
                      </Link>
                    ))}
                    {filteredNavigation.length === 0 && (
                      <div className="p-12 text-center">
                         <SearchIcon size={40} className="mx-auto text-slate-100 mb-4" />
                         <p className="text-slate-400 font-bold">No pages found matching "{commandSearch}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between px-10">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-slate-400 shadow-sm">ESC</div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">to close</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-slate-400 shadow-sm">
                    <ChevronDown size={10} className="rotate-180" />
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-slate-400 shadow-sm">
                    <ChevronDown size={10} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">to navigate</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLayout;
