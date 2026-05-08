import React from 'react';

const AdminSkeleton = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Skeleton */}
      <div className="w-64 bg-slate-900 h-screen hidden lg:flex flex-col p-6 space-y-6">
        <div className="w-32 h-8 bg-slate-800 rounded animate-pulse mb-8" />
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="w-full h-4 bg-slate-800 rounded animate-pulse" />
        ))}
      </div>

      <div className="flex-1 flex flex-col">
        {/* Topbar Skeleton */}
        <div className="h-16 bg-white border-b border-slate-200 flex items-center px-8 justify-between">
          <div className="w-48 h-5 bg-slate-100 rounded animate-pulse" />
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-slate-100 rounded-full animate-pulse" />
            <div className="w-24 h-8 bg-slate-100 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="p-8 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
                <div className="w-1/2 h-3 bg-slate-50 rounded animate-pulse" />
                <div className="w-3/4 h-8 bg-slate-100 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Table Skeleton */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50">
              <div className="w-32 h-5 bg-slate-100 rounded animate-pulse" />
            </div>
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="w-full h-4 bg-slate-100 rounded animate-pulse" />
                    <div className="w-2/3 h-3 bg-slate-50 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSkeleton;
