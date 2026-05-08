import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-maroon/5 rounded-full flex items-center justify-center mx-auto mb-8">
          <ShieldAlert size={48} className="text-maroon" />
        </div>
        <h1 className="text-7xl font-display font-black text-maroon mb-4">404</h1>
        <h2 className="text-2xl font-display font-bold text-slate-800 mb-3">Page Not Found</h2>
        <p className="text-slate-500 font-medium mb-10">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-3 px-8 py-4 bg-maroon text-white rounded-2xl font-bold hover:bg-maroon-dark transition-all shadow-xl shadow-maroon/20"
        >
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
