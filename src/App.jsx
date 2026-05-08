import { useEffect, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import AdminSkeleton from './components/AdminSkeleton';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Settings from './pages/Settings';
import Login from './pages/Login';
import SalesDashboard from "./pages/SalesDashboard";

// Placeholders for other pages
import Categories from './pages/Categories';
import Inventory from './pages/Inventory';
import Messages from './pages/Messages';
import Users from './pages/Users';
import Customers from './pages/Customers';
import Reviews from './pages/Reviews';
import Banners from './pages/Banners';
import Coupons from './pages/Coupons';
import NotFound from './pages/NotFound';

const App = () => {
  const { isAuthenticated } = useStore();

  useEffect(() => {
    // Dynamic circular favicon logic
    const updateFavicon = (src) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        // Ensure perfect circular clipping
        ctx.beginPath();
        ctx.arc(64, 64, 64, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        
        ctx.drawImage(img, 0, 0, 128, 128);
        
        const link = document.getElementById('favicon');
        if (link) {
          link.href = canvas.toDataURL("image/png");
        }
      };
      img.src = src + '?v=' + Date.now();
    };
    
    const timer = setTimeout(() => updateFavicon('/Acharu and TajaShutki.png'), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="relative">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.05, 0.15] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 bg-slate-900 rounded-full blur-2xl"
          />
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-24 h-24 bg-white rounded-full p-3 shadow-2xl border-4 border-slate-200 flex items-center justify-center overflow-hidden"
          >
            <img src="/Acharu and TajaShutki.png" alt="Admin Loading..." className="w-full h-full object-contain rounded-full" />
          </motion.div>
        </div>
      </div>
    }>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        
        <Route path="/" element={isAuthenticated ? <AdminLayout /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="sales" element={<SalesDashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="banners" element={<Banners />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="messages" element={<Messages />} />
          <Route path="users" element={<Users />} />
          <Route path="customers" element={<Customers />} />
          <Route path="categories" element={<Categories />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
