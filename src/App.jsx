import { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import AdminSkeleton from './components/AdminSkeleton';
import ErrorBoundary from './components/ErrorBoundary';
import AdminLayout from './layouts/AdminLayout';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));
const Orders = lazy(() => import('./pages/Orders'));
const SalesDashboard = lazy(() => import('./pages/SalesDashboard'));
const Categories = lazy(() => import('./pages/Categories'));
const Inventory = lazy(() => import('./pages/Inventory'));
const Messages = lazy(() => import('./pages/Messages'));
const Users = lazy(() => import('./pages/Users'));
const Customers = lazy(() => import('./pages/Customers'));
const Reviews = lazy(() => import('./pages/Reviews'));
const Banners = lazy(() => import('./pages/Banners'));
const Coupons = lazy(() => import('./pages/Coupons'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

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
    <ErrorBoundary>
    <Suspense fallback={<AdminSkeleton />}>
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
    </ErrorBoundary>
  );
};

export default App;
