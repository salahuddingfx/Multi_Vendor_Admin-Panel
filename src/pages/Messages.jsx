import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../lib/api';
import { Mail, CheckCircle, Clock, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { clsx } from 'clsx';

const Messages = () => {
  const { selectedStore } = useStore();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const siteId = selectedStore === 'acharu' ? 1 : 2;

  useEffect(() => {
    fetchMessages();
  }, [selectedStore]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const data = await api.getMessages(siteId);
      setMessages(data.data);
    } catch (error) {
      toast.error('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.markMessageRead(id);
      setMessages(messages.map(m => m.id === id ? { ...m, is_read: true } : m));
      toast.success('Message marked as read');
    } catch (error) {
      toast.error('Error updating message');
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-4xl font-display font-black text-slate-800 tracking-tight">Messages</h1>
        <p className="text-slate-400 font-medium mt-1">Inquiries from {selectedStore === 'acharu' ? 'Acharu' : 'Taja Shutki'} storefront.</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-40 bg-white animate-pulse rounded-[40px]" />)
        ) : messages.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] border border-black/[0.03]">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
               <Mail size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No messages yet</h3>
            <p className="text-slate-400 mt-2">When customers contact you, they will appear here.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={clsx(
              "bg-white p-8 rounded-[40px] shadow-premium border transition-all duration-500",
              msg.is_read ? "border-transparent opacity-70" : "border-maroon/20"
            )}>
              <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className={clsx(
                    "w-14 h-14 rounded-2xl flex items-center justify-center",
                    msg.is_read ? "bg-slate-50 text-slate-300" : "bg-maroon/10 text-maroon"
                  )}>
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-800">{msg.name}</h3>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{msg.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 px-4 py-2 rounded-full">
                      <Clock size={14} />
                      {new Date(msg.created_at).toLocaleDateString()}
                   </div>
                   {!msg.is_read && (
                     <button 
                       onClick={() => handleMarkRead(msg.id)}
                       className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white bg-green-500 px-4 py-2 rounded-full hover:scale-105 transition-all"
                     >
                       <CheckCircle size={14} />
                       Mark Read
                     </button>
                   )}
                </div>
              </div>
              <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                {msg.subject && (
                  <div className="mb-4 pb-4 border-b border-slate-200">
                    <span className="text-[10px] font-black uppercase tracking-widest text-maroon block mb-1">Subject</span>
                    <h4 className="text-sm font-bold text-slate-800">{msg.subject}</h4>
                  </div>
                )}
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Message</span>
                <p className="text-slate-600 font-medium leading-relaxed italic">"{msg.message}"</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Messages;
