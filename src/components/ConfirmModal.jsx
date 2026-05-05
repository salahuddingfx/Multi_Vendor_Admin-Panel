import { Trash2, X, AlertTriangle, Info } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, type = 'danger', confirmText = 'Delete' }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger': return <Trash2 size={40} />;
      case 'warning': return <AlertTriangle size={40} />;
      default: return <Info size={40} />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'danger': return 'bg-rose-50 text-rose-500';
      case 'warning': return 'bg-amber-50 text-amber-500';
      default: return 'bg-blue-50 text-blue-500';
    }
  };

  const getConfirmBtn = () => {
    switch (type) {
      case 'danger': return 'bg-rose-600 hover:bg-rose-700 shadow-rose-200';
      case 'warning': return 'bg-amber-600 hover:bg-amber-700 shadow-amber-200';
      default: return 'bg-blue-600 hover:bg-blue-700 shadow-blue-200';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white w-full max-w-sm rounded-[40px] p-10 shadow-2xl relative text-center">
         <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-all">
            <X size={20} />
         </button>
         
         <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${getIconBg()}`}>
            {getIcon()}
         </div>
         
         <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{title}</h2>
         <p className="text-slate-500 text-sm font-medium mb-8">{message}</p>
         
         <div className="flex flex-col gap-3">
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`w-full py-4 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg ${getConfirmBtn()}`}
            >
              {confirmText}
            </button>
            <button 
              onClick={onClose}
              className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
         </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
