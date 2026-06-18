import { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../lib/api';
import { Star, CheckCircle2, XCircle, Trash2, MessageSquare, Search, Loader2, ChevronDown, CheckSquare, Square, Clock, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { clsx } from 'clsx';
import ConfirmModal from '../components/ConfirmModal';

const Reviews = () => {
  const { selectedStore } = useStore();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const [replyText, setReplyText] = useState({});
  const [submittingReply, setSubmittingReply] = useState({});

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectAllOnPage, setSelectAllOnPage] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const siteId = selectedStore === 'acharu' ? 1 : 2;

  useEffect(() => {
    fetchReviews();
  }, [selectedStore]);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds(new Set());
    setSelectAllOnPage(false);
  }, [activeFilter, search, sortBy]);

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

  const stats = useMemo(() => {
    const total = reviews.length;
    const approved = reviews.filter(r => r.is_approved).length;
    const pending = total - approved;
    const avgRating = total > 0
      ? (reviews.reduce((sum, r) => sum + Number(r.rating), 0) / total).toFixed(1)
      : '0.0';
    return { total, approved, pending, avgRating };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    if (activeFilter === 'pending') {
      result = result.filter(r => !r.is_approved);
    } else if (activeFilter === 'approved') {
      result = result.filter(r => r.is_approved);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.customer_name.toLowerCase().includes(q) ||
        r.product?.name?.toLowerCase().includes(q) ||
        r.comment?.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'newest') result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    else if (sortBy === 'oldest') result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    else if (sortBy === 'highest') result.sort((a, b) => Number(b.rating) - Number(a.rating));
    else if (sortBy === 'lowest') result.sort((a, b) => Number(a.rating) - Number(b.rating));

    return result;
  }, [reviews, activeFilter, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / itemsPerPage));
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleApproval = async (id, currentStatus) => {
    try {
      const data = await api.updateReview(id, { is_approved: !currentStatus, site_id: siteId });
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
      await api.deleteReview(reviewToDelete, siteId);
      setReviews(reviews.filter(r => r.id !== reviewToDelete));
      setSelectedIds(prev => { const next = new Set(prev); next.delete(reviewToDelete); return next; });
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
      await api.updateReview(id, { admin_reply: replyText[id], site_id: siteId });
      setReviews(reviews.map(r => r.id === id ? { ...r, admin_reply: replyText[id] } : r));
      toast.success('Reply saved');
    } catch (error) {
      toast.error('Failed to save reply');
    } finally {
      setSubmittingReply(prev => ({ ...prev, [id]: false }));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectAllOnPage) {
      setSelectedIds(new Set());
      setSelectAllOnPage(false);
    } else {
      setSelectedIds(new Set(paginatedReviews.map(r => r.id)));
      setSelectAllOnPage(true);
    }
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectAllOnPage(false);
  };

  const bulkApprove = async () => {
    const ids = [...selectedIds];
    try {
      const res = await api.bulkUpdateReviews(siteId, ids, true);
      const count = res?.data?.updated_count || ids.length;
      setReviews(prev => prev.map(r => ids.includes(r.id) ? { ...r, is_approved: true } : r));
      toast.success(`${count} of ${ids.length} reviews approved`);
    } catch (e) {
      toast.error('Failed to approve reviews');
    }
    clearSelection();
  };

  const bulkDelete = async () => {
    const ids = [...selectedIds];
    try {
      const res = await api.bulkDeleteReviews(siteId, ids);
      const count = res?.data?.deleted_count || ids.length;
      setReviews(prev => prev.filter(r => !ids.includes(r.id)));
      toast.success(`${count} of ${ids.length} reviews deleted`);
    } catch (e) {
      toast.error('Failed to delete reviews');
    }
    clearSelection();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
        <p className="text-slate-500 font-medium">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Review Management</h1>
          <p className="text-slate-500 text-sm mt-1">Moderate customer feedback and build trust.</p>
        </div>
        <button onClick={fetchReviews} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Reviews</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Approved</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.approved}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Pending</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Avg Rating</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{stats.avgRating}</p>
        </div>
      </div>

      {/* Filter + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-4">
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
          {['all', 'pending', 'approved'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={clsx(
                'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                activeFilter === tab ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-800'
              )}
            >
              {tab === 'all' ? 'All' : tab === 'pending' ? `Pending (${stats.pending})` : `Approved (${stats.approved})`}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 outline-none"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-60 pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Bulk bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center justify-between bg-slate-800 text-white rounded-lg px-4 py-3 mb-4">
          <span className="text-sm font-medium">{selectedIds.size} selected</span>
          <div className="flex items-center gap-2">
            <button onClick={clearSelection} className="px-3 py-1 text-xs text-slate-300 hover:text-white">Clear</button>
            <button onClick={bulkApprove} className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-white rounded-md text-xs font-medium">Approve All</button>
            <button onClick={bulkDelete} className="px-3 py-1 bg-rose-500 hover:bg-rose-400 text-white rounded-md text-xs font-medium">Delete All</button>
          </div>
        </div>
      )}

      {/* Reviews */}
      {paginatedReviews.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
          <Star className="mx-auto text-slate-300 mb-4" size={40} />
          <h3 className="text-lg font-bold text-slate-800 mb-1">
            {search || activeFilter !== 'all' ? 'No reviews found' : 'No reviews yet'}
          </h3>
          <p className="text-sm text-slate-400">
            {search || activeFilter !== 'all' ? 'Try adjusting your search or filter.' : 'Customer reviews will appear here once submitted.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Select all row */}
          <div className="flex items-center gap-2">
            <button onClick={toggleSelectAll} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
              {selectAllOnPage ? <CheckSquare size={16} /> : <Square size={16} />}
              Select All
            </button>
            <span className="text-xs text-slate-400">{paginatedReviews.length} of {filteredReviews.length}</span>
          </div>

          {/* Review rows */}
          {paginatedReviews.map((review) => {
            const isSelected = selectedIds.has(review.id);
            return (
              <div
                key={review.id}
                className={clsx(
                  'bg-white rounded-xl border p-4',
                  isSelected ? 'border-slate-400' : 'border-slate-200',
                  !review.is_approved && !isSelected && 'border-l-4 border-l-amber-400'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button onClick={() => toggleSelect(review.id)} className="mt-1 shrink-0">
                    {isSelected ? <CheckSquare size={18} className="text-slate-700" /> : <Square size={18} className="text-slate-300" />}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Top row: name, status, rating, date */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-semibold text-slate-800">{review.customer_name}</span>
                      <span className={clsx(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold',
                        review.is_approved ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      )}>
                        {review.is_approved ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                        {review.is_approved ? 'Approved' : 'Pending'}
                      </span>
                      <span className="text-xs text-slate-400 ml-auto">
                        {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    {/* Product + Rating */}
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="text-xs text-slate-400">{review.product?.name || 'General Review'}</span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => {
                          const isFull = review.rating >= star;
                          const isHalf = review.rating >= star - 0.5 && !isFull;
                          return (
                            <div key={star} className="relative">
                              <Star size={12} className={isFull ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
                              {isHalf && <div className="absolute top-0 left-0 overflow-hidden w-1/2"><Star size={12} className="fill-amber-400 text-amber-400" /></div>}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Comment */}
                    <p className="text-sm text-slate-600 italic bg-slate-50 rounded-lg p-3 mb-2">"{review.comment}"</p>

                    {/* Media */}
                    {review.media && review.media.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {review.media.map((m, idx) => (
                          <div key={idx} className="w-16 h-16 rounded-lg overflow-hidden border border-slate-100 cursor-pointer bg-slate-100" onClick={() => window.open(m.file_path, '_blank')}>
                            {m.type === 'image' ? (
                              <img src={m.file_path} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Video</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply */}
                    <div className="flex gap-2 mt-2">
                      <textarea
                        value={replyText[review.id] ?? review.admin_reply ?? ''}
                        onChange={(e) => setReplyText(prev => ({ ...prev, [review.id]: e.target.value }))}
                        placeholder="Admin reply..."
                        className="flex-1 p-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-slate-400 resize-none h-10"
                      />
                      <button
                        onClick={() => submitReply(review.id)}
                        disabled={submittingReply[review.id]}
                        className="px-4 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 disabled:opacity-50 shrink-0"
                      >
                        {submittingReply[review.id] ? <Loader2 className="animate-spin" size={14} /> : 'Reply'}
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={() => toggleApproval(review.id, review.is_approved)}
                      className={clsx(
                        'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                        review.is_approved ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                      )}
                    >
                      {review.is_approved ? 'Unapprove' : 'Approve'}
                    </button>
                    <button
                      onClick={() => { setReviewToDelete(review.id); setShowDeleteConfirm(true); }}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-50 text-rose-500 hover:bg-rose-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 bg-white rounded-xl border border-slate-200 px-4 py-3">
          <span className="text-sm text-slate-500">Page {currentPage} of {totalPages}</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={clsx(
                  'w-8 h-8 rounded-lg text-sm font-medium',
                  currentPage === page ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-100'
                )}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

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
