import React from "react";

interface DataStatusBadgeProps {
  source: string | null;
}

export function DataStatusBadge({ source }: DataStatusBadgeProps) {
  if (!source) return null;
  const isOnline = source === "database";

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all duration-500 ${
      isOnline
        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
        : "bg-amber-500/10 border-amber-500/20 text-amber-600"
    }`}>
      <div className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-amber-500"}`} />
      <span className="text-[11px] font-bold uppercase tracking-wider">
        {isOnline ? "DB Online" : "Modo Fallback"}
      </span>
    </div>
  );
}
