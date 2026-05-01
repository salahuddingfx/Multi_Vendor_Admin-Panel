import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../lib/api';
import { Search, Save, Package, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const Inventory = () => {
  const { selectedStore } = useStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [savingId, setSavingId] = useState(null);

  const siteId = selectedStore === 'acharu' ? 1 : 2;

  useEffect(() => {
    fetchProducts();
  }, [selectedStore]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts(siteId);
      setProducts(data);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = (id, value) => {
    setProducts(products.map(p => p.id === id ? { ...p, stock: parseInt(value) || 0 } : p));
  };

  const saveStock = async (product) => {
    setSavingId(product.id);
    try {
      await api.updateProduct(product.id, { stock: product.stock });
      toast.success(`${product.name} stock updated`);
    } catch (error) {
      toast.error('Error updating stock');
    } finally {
      setSavingId(null);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-4xl font-display font-black text-slate-800 tracking-tight">Inventory Management</h1>
        <p className="text-slate-400 font-medium mt-1">Quickly update stock levels for {selectedStore === 'acharu' ? 'Acharu' : 'Taja Shutki'}.</p>
      </div>

      <div className="relative w-full md:w-96 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-maroon transition-colors" size={20} />
        <input 
          type="text" 
          placeholder="Search product inventory..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-maroon/5 focus:border-maroon transition-all font-medium text-slate-700 shadow-sm"
        />
      </div>

      <div className="bg-white rounded-[40px] shadow-premium border border-black/[0.03] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Product</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Current Stock</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Quick Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1,2,3,4,5].map(i => <tr key={i} className="h-24 animate-pulse"><td colSpan={4} className="px-8"><div className="h-8 bg-slate-50 rounded-xl" /></td></tr>)
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden">
                          <img src={product.image} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">{product.name}</div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{product.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="font-display font-black text-xl text-slate-800">{product.stock}</span>
                    </td>
                    <td className="px-8 py-6">
                      {product.stock < 10 ? (
                        <div className="flex items-center gap-2 text-red-500 font-black text-[10px] uppercase tracking-widest">
                          <AlertTriangle size={14} />
                          Low Stock
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-green-500 font-black text-[10px] uppercase tracking-widest">
                          <Package size={14} />
                          Healthy
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-4">
                        <input 
                          type="number" 
                          value={product.stock}
                          onChange={(e) => handleStockUpdate(product.id, e.target.value)}
                          className="w-24 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center font-bold focus:ring-4 focus:ring-maroon/5 focus:border-maroon outline-none transition-all"
                        />
                        <button 
                          onClick={() => saveStock(product)}
                          disabled={savingId === product.id}
                          className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg disabled:opacity-50"
                        >
                          {savingId === product.id ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
