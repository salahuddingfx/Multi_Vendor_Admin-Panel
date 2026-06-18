import { useState, useEffect, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { api } from '../lib/api';
import {
  Star, CheckCircle2, XCircle, Trash2, MessageSquare, Search,
  Loader2, PlayCircle, ChevronDown, CheckSquare, Square,
  Clock, Image, AlertCircle, Filter, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const [replyText, setReplyText] = useState({});
  const [submittingReply, setSubmittingReply] = useState({});

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectAllOnPage, setSelectAllOnPage] = useState(false);
  const [bulkAction, setBulkAction] = useState(null);

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

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortBy === 'highest') {
      result.sort((a, b) => Number(b.rating) - Number(a.rating));
    } else if (sortBy === 'lowest') {
      result.sort((a, b) => Number(a.rating) - Number(b.rating));
    }

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
      const data = await api.updateReview(id, { admin_reply: replyText[id], site_id: siteId });
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
    setBulkAction('approve');
    const ids = [...selectedIds];
    let success = 0;
    for (const id of ids) {
      try {
        await api.updateReview(id, { is_approved: true, site_id: siteId });
        setReviews(prev => prev.map(r => r.id === id ? { ...r, is_approved: true } : r));
        success++;
      } catch (e) { /* skip */ }
    }
    toast.success(`${success} of ${ids.length} reviews approved`);
    setBulkAction(null);
    clearSelection();
  };

  const bulkDelete = async () => {
    setBulkAction('delete');
    const ids = [...selectedIds];
    let success = 0;
    for (const id of ids) {
      try {
        await api.deleteReview(id, siteId);
        setReviews(prev => prev.filter(r => r.id !== id));
        success++;
      } catch (e) { /* skip */ }
    }
    toast.success(`${success} of ${ids.length} reviews deleted`);
    setBulkAction(null);
    clearSelection();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-slate-400 animate-spin" />
        <p className="text-slate-500 font-medium">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-black text-slate-800 mb-2">Review Management</h1>
          <p className="text-slate-500 font-medium">Moderate customer feedback and build trust.</p>
        </div>
        <button
          onClick={fetchReviews}
          className="self-start flex items-center gap-2 px-5 py-3 bg-white rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all shadow-soft"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Reviews', value: stats.total, icon: MessageSquare, color: 'text-slate-600', bg: 'bg-slate-100' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Avg Rating', value: stats.avgRating, icon: Star, color: 'text-amber-500', bg: 'bg-amber-50' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl p-5 border border-black/[0.02] shadow-premium"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{stat.label}</span>
              <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center', stat.bg)}>
                <stat.icon size={16} className={stat.color} />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-800">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 border border-slate-200 shadow-soft">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'approved', label: 'Approved' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={clsx(
                'px-5 py-2.5 rounded-xl text-sm font-bold transition-all',
                activeFilter === tab.key
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              )}
            >
              {tab.label}
              {tab.key !== 'all' && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({tab.key === 'pending' ? stats.pending : stats.approved})
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          {/* Sort */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-2 px-4 py-3 bg-white rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all shadow-soft whitespace-nowrap"
            >
              <Filter size={14} />
              {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : sortBy === 'highest' ? 'Highest Rated' : 'Lowest Rated'}
              <ChevronDown size={14} className={clsx('transition-transform', showSortDropdown && 'rotate-180')} />
            </button>
            <AnimatePresence>
              {showSortDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-premium border border-slate-100 overflow-hidden z-20"
                >
                  {[
                    { key: 'newest', label: 'Newest First' },
                    { key: 'oldest', label: 'Oldest First' },
                    { key: 'highest', label: 'Highest Rated' },
                    { key: 'lowest', label: 'Lowest Rated' },
                  ].map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => { setSortBy(opt.key); setShowSortDropdown(false); }}
                      className={clsx(
                        'w-full text-left px-4 py-3 text-sm font-bold transition-all',
                        sortBy === opt.key ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:bg-slate-50'
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search */}
          <div className="relative flex-grow lg:flex-grow-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search reviews..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full lg:w-72 pl-11 pr-4 py-3 bg-white rounded-2xl border border-slate-200 text-sm outline-none focus:border-slate-400 transition-all font-medium shadow-soft"
            />
          </div>
        </div>
      </div>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.96 }}
            className="flex items-center justify-between bg-slate-900 text-white rounded-2xl px-6 py-4 shadow-premium"
          >
            <div className="flex items-center gap-3">
              <CheckSquare size={18} className="text-emerald-400" />
              <span className="font-bold text-sm">
                {selectedIds.size} review{selectedIds.size !== 1 && 's'} selected
              </span>
              <button
                onClick={clearSelection}
                className="text-xs text-slate-400 hover:text-white font-bold uppercase tracking-widest ml-2 transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={bulkApprove}
                disabled={bulkAction === 'approve' || bulkAction === 'delete'}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
              >
                {bulkAction === 'approve' ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Approve All
              </button>
              <button
                onClick={bulkDelete}
                disabled={bulkAction === 'approve' || bulkAction === 'delete'}
                className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-400 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
              >
                {bulkAction === 'delete' ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Delete All
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="grid grid-cols-1 gap-5">
        {paginatedReviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 bg-white rounded-[32px] border border-black/[0.02] shadow-soft"
          >
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="text-slate-200" size={32} />
            </div>
            <h3 className="text-xl font-display font-black text-slate-800 mb-2">
              {search || activeFilter !== 'all' ? 'No reviews found' : 'No reviews yet'}
            </h3>
            <p className="text-slate-400 font-medium">
              {search || activeFilter !== 'all'
                ? 'Try adjusting your search or filter.'
                : 'Customer reviews will appear here once submitted.'}
            </p>
          </motion.div>
        ) : (
          <>
            {/* Select All Checkbox */}
            <div className="flex items-center gap-3 px-2">
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
              >
                {selectAllOnPage ? <CheckSquare size={18} className="text-slate-800" /> : <Square size={18} />}
                Select All on Page
              </button>
              <span className="text-xs text-slate-400">
                Showing {paginatedReviews.length} of {filteredReviews.length} reviews
              </span>
            </div>

            {paginatedReviews.map((review, idx) => {
              const isSelected = selectedIds.has(review.id);
              return (
                <motion.div
                  layout
                  key={review.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={clsx(
                    'bg-white rounded-[28px] border transition-all shadow-premium overflow-hidden',
                    isSelected ? 'border-slate-400 ring-2 ring-slate-200' : 'border-black/[0.02]',
                    !review.is_approved && !isSelected && 'border-l-4 border-l-amber-400'
                  )}
                >
                  <div className="p-6 md:p-8">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Main Content */}
                      <div className="flex-grow space-y-5">
                        {/* Top Row: Avatar, Name, Product, Select */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => toggleSelect(review.id)}
                              className="shrink-0 mt-1"
                            >
                              {isSelected
                                ? <CheckSquare size={20} className="text-slate-800" />
                                : <Square size={20} className="text-slate-300 hover:text-slate-500 transition-colors" />
                              }
                            </button>
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-black text-xl shrink-0">
                              {review.customer_name[0]}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-black text-slate-800 text-lg leading-none">{review.customer_name}</h3>
                                {review.is_approved ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200">
                                    <CheckCircle2 size={10} />
                                    Approved
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-200">
                                    <Clock size={10} />
                                    Pending
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                                {review.product?.name || 'General Review'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="flex items-center gap-0.5 bg-amber-50 px-3 py-1.5 rounded-xl">
                              {[1, 2, 3, 4, 5].map((star) => {
                                const isFull = review.rating >= star;
                                const isHalf = review.rating >= star - 0.5 && !isFull;
                                return (
                                  <div key={star} className="relative">
                                    <Star size={14} className={isFull ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
                                    {isHalf && (
                                      <div className="absolute top-0 left-0 overflow-hidden w-[50%]">
                                        <Star size={14} className="fill-amber-400 text-amber-400" />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap">
                              {new Date(review.created_at).toLocaleDateString('en-US', {
                                year: 'numeric', month: 'short', day: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Comment */}
                        <div className="bg-slate-50/50 p-5 md:p-6 rounded-2xl border border-slate-100">
                          <p className="text-slate-600 italic leading-relaxed">"{review.comment}"</p>
                        </div>

                        {/* Media Gallery */}
                        {review.media && review.media.length > 0 && (
                          <div className="flex flex-wrap gap-3">
                            {review.media.map((m, idx) => (
                              <div key={idx} className="relative group w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border border-slate-100 shadow-sm cursor-pointer hover:border-slate-300 transition-all">
                                {m.type === 'image' ? (
                                  <img
                                    src={m.file_path}
                                    alt="Review media"
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
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center gap-2 text-slate-400">
                            <MessageSquare size={15} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Admin Response</span>
                          </div>
                          <div className="flex gap-3">
                            <textarea
                              value={replyText[review.id] ?? review.admin_reply ?? ''}
                              onChange={(e) => setReplyText(prev => ({ ...prev, [review.id]: e.target.value }))}
                              placeholder="Type your reply to this customer..."
                              className="flex-grow p-4 bg-white border border-slate-100 rounded-2xl text-sm outline-none focus:border-slate-300 transition-all resize-none h-20"
                            />
                            <button
                              onClick={() => submitReply(review.id)}
                              disabled={submittingReply[review.id]}
                              className="px-6 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all disabled:opacity-50 shrink-0"
                            >
                              {submittingReply[review.id] ? <Loader2 className="animate-spin" size={16} /> : 'Save'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex lg:flex-col gap-2 lg:w-36 shrink-0">
                        <button
                          onClick={() => toggleApproval(review.id, review.is_approved)}
                          className={clsx(
                            'flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex-1 lg:flex-none',
                            review.is_approved
                              ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
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
                          className="flex items-center justify-center gap-2 py-3 px-4 bg-rose-50 text-rose-500 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-100 transition-all flex-1 lg:flex-none"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-2xl px-6 py-4 border border-slate-100 shadow-soft">
          <span className="text-sm font-bold text-slate-500">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-all disabled:opacity-40"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (currentPage <= 4) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = currentPage - 3 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={clsx(
                    'w-10 h-10 rounded-xl font-bold text-sm transition-all',
                    currentPage === pageNum
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'text-slate-500 hover:bg-slate-100'
                  )}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-all disabled:opacity-40"
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
