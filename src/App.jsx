import { Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Settings from './pages/Settings';
import Login from './pages/Login';

// Placeholders for other pages
const Inventory = () => <div className="p-10 bg-white rounded-3xl border border-slate-100 font-bold text-slate-400">Inventory control coming soon...</div>;
const PagesEditor = () => <div className="p-10 bg-white rounded-3xl border border-slate-100 font-bold text-slate-400">Dynamic pages editor coming soon...</div>;
const Messages = () => <div className="p-10 bg-white rounded-3xl border border-slate-100 font-bold text-slate-400">Contact messages list coming soon...</div>;
const Users = () => <div className="p-10 bg-white rounded-3xl border border-slate-100 font-bold text-slate-400">Admin user management coming soon...</div>;
const Categories = () => <div className="p-10 bg-white rounded-3xl border border-slate-100 font-bold text-slate-400">Category management coming soon...</div>;

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
        <Route path="pages" element={<PagesEditor />} />
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
