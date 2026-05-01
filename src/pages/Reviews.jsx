import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Trash2, CheckCircle, XCircle, Star, MessageSquare, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { selectedStore } = useStore();
  const siteId = selectedStore === 'acharu' ? 1 : 2;

  useEffect(() => {
    fetchReviews();
  }, [selectedStore]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.getReviews(siteId);
      // Handle both paginated (res.data) and plain array responses
      setReviews(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApproval = async (id, currentStatus) => {
    try {
      await api.updateReview(id, { is_approved: !currentStatus });
      fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await api.deleteReview(id);
        fetchReviews();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="flex text-yellow-400">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={14} fill={i < Math.floor(rating) ? "currentColor" : "none"} className={i < Math.floor(rating) ? "" : "text-slate-300"} />
        ))}
        <span className="ml-1 text-xs font-bold text-slate-500">{rating}</span>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Customer Reviews</h1>
          <p className="text-slate-500">Approve or moderate reviews submitted by customers.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-maroon" size={32} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-slate-50 rounded-2xl border border-slate-100">
              <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-lg font-bold text-slate-600">No reviews found.</p>
            </div>
          ) : reviews.map(review => (
            <div key={review.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800">{review.customer_name}</h3>
                    <p className="text-xs text-slate-400">{new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                  {renderStars(review.rating)}
                </div>
                {review.product && (
                  <div className="mb-3 text-xs font-bold text-maroon bg-maroon/5 inline-block px-2 py-1 rounded-md">
                    Product: {review.product.name}
                  </div>
                )}
                <p className="text-slate-600 text-sm leading-relaxed mb-6 italic">
                  "{review.comment || 'No comment provided.'}"
                </p>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button 
                  onClick={() => handleToggleApproval(review.id, review.is_approved)}
                  className={`flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-lg transition-colors ${review.is_approved ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-amber-600 bg-amber-50 hover:bg-amber-100'}`}
                >
                  {review.is_approved ? <><CheckCircle size={16} /> Approved</> : <><XCircle size={16} /> Pending</>}
                </button>
                <button 
                  onClick={() => handleDelete(review.id)}
                  className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reviews;
