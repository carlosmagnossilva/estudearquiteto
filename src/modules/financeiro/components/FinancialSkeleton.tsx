import React from "react";

export const FinancialGridSkeleton: React.FC = () => {
  return (
    <div className="w-full animate-pulse px-6 py-4 space-y-4">
      {/* Header Skeleton */}
      <div className="flex gap-4 mb-8">
        <div className="h-10 w-64 bg-white/5 rounded-xl border border-white/5"></div>
        <div className="h-10 w-40 bg-white/5 rounded-xl border border-white/5"></div>
        <div className="h-10 w-40 bg-white/5 rounded-xl border border-white/5"></div>
      </div>
      
      {/* Table Skeleton */}
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 h-16 bg-white/5 rounded-xl border border-white/5 px-6">
            <div className="h-4 w-8 bg-white/10 rounded"></div>
            <div className="h-4 w-48 bg-white/10 rounded"></div>
            <div className="h-4 w-24 bg-white/10 rounded"></div>
            <div className="h-4 w-32 bg-white/10 rounded ml-auto"></div>
            <div className="h-4 w-16 bg-white/10 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const FinancialCardSkeleton: React.FC = () => {
  return (
    <div className="flex gap-6 p-6 overflow-hidden animate-pulse">
      {[...Array(4)].map((_, col) => (
        <div key={col} className="w-[320px] shrink-0 space-y-4">
          <div className="h-6 w-32 bg-white/5 rounded-lg mb-6"></div>
          {[...Array(3)].map((_, card) => (
            <div key={card} className="h-48 bg-white/5 rounded-2xl border border-white/5 p-5 space-y-4">
              <div className="flex justify-between">
                <div className="h-6 w-16 bg-white/10 rounded"></div>
                <div className="h-8 w-8 bg-white/10 rounded-lg"></div>
              </div>
              <div className="h-4 w-40 bg-white/10 rounded"></div>
              <div className="flex gap-2">
                <div className="h-4 w-20 bg-white/10 rounded"></div>
                <div className="h-4 w-12 bg-white/10 rounded"></div>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full mt-4"></div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
