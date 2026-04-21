import React, { useEffect } from "react";
import { IUpdateGroup } from "@hub/shared";
import { useBff } from "../hooks/useBff";
import { IBffResponse } from "@hub/shared";
import { IconTag, IconXCircle, IconDocPlus } from "./icons";

// ─── UpdateCard ──────────────────────────────────────────────────────────────

interface UpdateCardProps {
  title: string;
  meta: string;
  text: string;
  user: string;
  time: string;
}

export function UpdateCard({ title, meta, text, user, time }: UpdateCardProps) {
  let Icon = IconTag;
  if (title.toLowerCase().includes("cancelada")) Icon = IconXCircle;
  if (title.toLowerCase().includes("gmud")) Icon = IconDocPlus;

  const metaParts = (typeof meta === "string") ? meta.split("|").map(s => s.trim()) : [meta];
  const userAvatarHash = typeof user === "string" ? user.replace(/\s+/g, "") : "default";

  return (
    <div className="bg-[var(--bg-mini-card)] border border-[var(--border-nav)] rounded-xl p-3 mb-3 flex gap-3 w-full transition-all hover:bg-black/5 group cursor-pointer">
      <div className="w-8 h-8 rounded-full bg-[var(--bg-mini-card)] border border-[var(--border-nav)] flex items-center justify-center text-[var(--text-nav-dim)] shrink-0 mt-0.5">
        <Icon className="w-[18px] h-[18px]" />
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex justify-between items-start mb-0.5">
          <h4 className="text-[13px] font-bold text-[var(--text-nav)] leading-snug">{title}</h4>
          <span className="text-[10px] text-[var(--text-nav-dim)] pt-[2px] shrink-0">{time}</span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--text-nav-dim)] mb-2">
          {metaParts.map((part, index) => (
            <div className="contents" key={index}>
              <span>{part}</span>
              {index < metaParts.length - 1 && <span className="opacity-30">|</span>}
            </div>
          ))}
        </div>

        <div className="text-[12px] text-[var(--text-nav-dim)] leading-normal mb-3">{text}</div>

        <div className="flex items-center gap-2 mt-auto">
          <img src={`https://i.pravatar.cc/100?u=${userAvatarHash}`} alt={user} className="w-[18px] h-[18px] rounded-full object-cover" />
          <span className="text-[11px] text-[var(--text-nav-dim)]">{user}</span>
        </div>
      </div>
    </div>
  );
}

// ─── UpdateList ───────────────────────────────────────────────────────────────

interface UpdateListProps {
  tab: string;
  onSourceChange: (source: string) => void;
}

export function UpdateList({ tab, onSourceChange }: UpdateListProps) {
  const { data, loading, err } = useBff<IBffResponse>("/bff/updates", []);

  useEffect(() => {
    if (data?.meta?.source && onSourceChange) {
      onSourceChange(data.meta.source);
    }
  }, [data, onSourceChange]);

  if (loading) return <div className="text-[var(--text-nav-dim)] font-medium text-[12px]">Carregando...</div>;
  if (err) return <div className="text-rose-400 font-medium text-[12px]">Erro: {err}</div>;

  const groups: IUpdateGroup[] = data?.groups || [];

  const filtered =
    tab.toLowerCase() === "todas" || tab === "geral"
      ? groups
      : tab.toLowerCase() === "minhas"
        ? groups.filter(g => (g.dateLabel || "").toLowerCase() === "para mim")
        : groups.filter(g => (g.dateLabel || "").toLowerCase() !== "para mim");

  if (filtered.length === 0) {
    return <div className="text-[var(--text-nav-dim)] font-medium text-[12px]">Sem atualizações.</div>;
  }

  return (
    <div className="flex flex-col w-full pr-1">
      {filtered.map((g, idx) => (
        <div key={`${g.dateLabel}-${idx}`} className="mb-3">
          <div className="text-[12px] text-[var(--text-nav-dim)] font-medium mb-3">{g.dateLabel}</div>
          {(g.items || []).map((it, j) => (
            <UpdateCard
              key={`${it.title}-${it.time}-${j}`}
              title={it.title}
              meta={it.meta}
              text={it.text}
              user={it.user}
              time={it.time}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

