import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../lib/api';
import { 
  Star, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  MessageSquare, 
  Search,
  Loader2,
  AlertTriangle,
  Image as ImageIcon,
  Video,
  PlayCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import ConfirmModal from '../components/ConfirmModal';

const Reviews = () => {
  const { selectedStore, stores } = useStore();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [replyText, setReplyText] = useState({});
  const [submittingReply, setSubmittingReply] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  const currentStore = (stores || []).find(s => s.id === selectedStore);
  const siteId = selectedStore === 'acharu' ? 1 : 2;

  useEffect(() => {
    fetchReviews();
  }, [selectedStore]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await api.getReviews(siteId);
      setReviews(data);
    } catch (error) {
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (id, currentStatus) => {
    try {
      const data = await api.updateReview(id, { is_approved: !currentStatus });
      if (data) {
        setReviews(reviews.map(r => r.id === id ? { ...r, is_approved: !currentStatus } : r));
        toast.success(currentStatus ? 'Review unapproved' : 'Review approved');
      }
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const deleteReview = async () => {
    if (!reviewToDelete) return;
    try {
      await api.deleteReview(reviewToDelete);
      setReviews(reviews.filter(r => r.id !== reviewToDelete));
      toast.success('Review deleted');
      setShowDeleteConfirm(false);
      setReviewToDelete(null);
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const submitReply = async (id) => {
    if (!replyText[id]?.trim()) return;
    setSubmittingReply(prev => ({ ...prev, [id]: true }));
    try {
      const data = await api.updateReview(id, { admin_reply: replyText[id] });
      if (data) {
        setReviews(reviews.map(r => r.id === id ? { ...r, admin_reply: replyText[id] } : r));
        toast.success('Reply saved');
      }
    } catch (error) {
      toast.error('Failed to save reply');
    } finally {
      setSubmittingReply(prev => ({ ...prev, [id]: false }));
    }
  };

  const filteredReviews = reviews.filter(r => 
    r.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    r.product?.name.toLowerCase().includes(search.toLowerCase()) ||
    r.comment?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-slate-400 animate-spin" />
        <p className="text-slate-500 font-medium">Curating reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-black text-slate-800 mb-2">Review Management</h1>
          <p className="text-slate-500 font-medium">Moderate customer feedback and build trust.</p>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-slate-800" size={20} />
          <input 
            type="text" 
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-80 pl-12 pr-6 py-4 bg-white rounded-2xl shadow-soft border border-black/[0.02] outline-none focus:ring-4 focus:ring-slate-100 transition-all font-medium"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredReviews.map((review) => (
          <motion.div 
            layout
            key={review.id}
            className={clsx(
              "bg-white rounded-[32px] p-8 border border-black/[0.02] shadow-premium transition-all",
              !review.is_approved && "border-amber-100 bg-amber-50/10"
            )}
          >
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-grow space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-black text-xl">
                      {review.customer_name[0]}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800 text-lg leading-none mb-1">{review.customer_name}</h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {review.product?.name || 'General Review'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 bg-amber-50 px-3 py-1.5 rounded-xl">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFull = review.rating >= star;
                      const isHalf = review.rating >= star - 0.5 && !isFull;
                      return (
                        <div key={star} className="relative">
                          <Star size={14} className={isFull ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                          {isHalf && (
                            <div className="absolute top-0 left-0 overflow-hidden w-[50%]">
                              <Star size={14} className="fill-amber-400 text-amber-400" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 italic text-slate-600">
                  "{review.comment}"
                </div>

                {/* Review Media Gallery */}
                {review.media && review.media.length > 0 && (
                  <div className="flex flex-wrap gap-3 py-2">
                    {review.media.map((m, idx) => (
                      <div key={idx} className="relative group w-24 h-24 rounded-2xl overflow-hidden border border-slate-100 shadow-sm cursor-pointer hover:border-slate-300 transition-all">
                        {m.type === 'image' ? (
                          <img 
                            src={m.file_path} 
                            alt="Review Proof" 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform" 
                            onClick={() => window.open(m.file_path, '_blank')}
                          />
                        ) : (
                          <div 
                            className="w-full h-full bg-slate-900 flex items-center justify-center text-white"
                            onClick={() => window.open(m.file_path, '_blank')}
                          >
                            <PlayCircle size={28} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <MessageSquare size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Admin Response</span>
                  </div>
                  <div className="flex gap-3">
                    <textarea 
                      value={replyText[review.id] ?? review.admin_reply ?? ''}
                      onChange={(e) => setReplyText(prev => ({ ...prev, [review.id]: e.target.value }))}
                      placeholder="Type your reply here..."
                      className="flex-grow p-4 bg-white border border-slate-100 rounded-2xl text-sm outline-none focus:border-slate-300 transition-all resize-none h-20"
                    />
                    <button 
                      onClick={() => submitReply(review.id)}
                      disabled={submittingReply[review.id]}
                      className="px-6 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                      {submittingReply[review.id] ? <Loader2 className="animate-spin" size={16} /> : 'Save'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:w-40 flex lg:flex-col gap-3 justify-center">
                <button 
                  onClick={() => toggleApproval(review.id, review.is_approved)}
                  className={clsx(
                    "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all",
                    review.is_approved ? "bg-amber-100 text-amber-700 hover:bg-amber-200" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                  )}
                >
                  {review.is_approved ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                  {review.is_approved ? 'Unapprove' : 'Approve'}
                </button>
                <button 
                  onClick={() => {
                    setReviewToDelete(review.id);
                    setShowDeleteConfirm(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-rose-50 text-rose-500 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-rose-100 transition-all"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredReviews.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[40px] border border-black/[0.02] shadow-soft">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="text-slate-200" size={32} />
            </div>
            <h3 className="text-xl font-display font-black text-slate-800 mb-2">No reviews found</h3>
            <p className="text-slate-400 font-medium">Try searching with a different keyword.</p>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={deleteReview}
        title="Delete Review?"
        message="Are you sure you want to delete this customer review permanently? This cannot be undone."
        type="danger"
        confirmText="Yes, Delete Review"
      />
    </div>
  );
};

export default Reviews;
