import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Settings from './pages/Settings';
import Login from './pages/Login';

// Placeholders for other pages
import Categories from './pages/Categories';
import Inventory from './pages/Inventory';
import Messages from './pages/Messages';
import Users from './pages/Users';
import Pages from './pages/Pages';
import Reviews from './pages/Reviews';
import Banners from './pages/Banners';

const App = () => {
  const { isAuthenticated } = useStore();

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      
      <Route path="/" element={isAuthenticated ? <AdminLayout /> : <Navigate to="/login" />}>
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="orders" element={<Orders />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="banners" element={<Banners />} />
        <Route path="pages" element={<Pages />} />
        <Route path="reviews" element={<Reviews />} />
        <Route path="messages" element={<Messages />} />
        <Route path="users" element={<Users />} />
        <Route path="categories" element={<Categories />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
