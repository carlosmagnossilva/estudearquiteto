import React from "react";
import { IconBell, IconCheck, IconMoney, IconDocPlus } from "./icons";

interface PendenciasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PendenciasModal({ isOpen, onClose }: PendenciasModalProps) {
  if (!isOpen) return null;

  const filters = ["Todas", "GMUD", "Serviços", "Materiais"];
  const pendencias = [
    { id: "025", obra: "P. dos Reis", tag: "GMUD", title: "Alterações no custo da entrega", resp: "Leonardo do Bem", data: "26 de Novembro de 2025", time: "09:09", status: "Aprovada" },
    { id: "025", obra: "P. dos Reis", tag: "GMUD", title: "GMUD Pendente", resp: "Leonardo do Bem", data: "26 de Novembro de 2025", time: "12:42", status: "Pendente" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#081824]/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl glass-panel rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 shadow-2xl animate-fade-in border border-white/10 overflow-hidden mx-auto">
        <div className="absolute top-0 right-0 p-6">
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <header className="mb-8">
          <h2 className="text-[24px] font-bold text-white tracking-tight mb-6">Pendências</h2>
          
          <div className="flex gap-2 bg-white/5 p-1 rounded-full w-fit">
            {filters.map((f, idx) => (
              <button 
                key={f}
                className={`px-6 py-2 rounded-full text-[13px] font-bold transition-all ${idx === 0 ? "bg-white text-ocean-dark shadow-lg" : "text-white/60 hover:text-white hover:bg-white/5"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </header>

        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 card-scrollbar">
          <div className="text-[14px] font-bold text-white/40 uppercase tracking-widest mb-4">26 de Novembro de 2025</div>
          
          {pendencias.map((p, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-[20px] p-5 flex items-start gap-5 group hover:bg-white/10 transition-all cursor-default">
              <div className="w-12 h-12 rounded-2xl bg-ocean-dark/50 flex items-center justify-center border border-white/5 shrink-0">
                <IconBell className="w-6 h-6 text-ocean-accent" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-[16px] font-bold text-white group-hover:text-ocean-accent transition-colors">{p.title}</h4>
                  <span className="text-[12px] font-bold text-white/40">{p.time}</span>
                </div>
                
                <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-[12px] font-bold">
                  <span className="text-ocean-accent">ID {p.id} – {p.obra}</span>
                  <span className="text-white/30">|</span>
                  <span className="text-white/60 uppercase tracking-widest">{p.tag}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src="https://i.pravatar.cc/100?u=leo" className="w-6 h-6 rounded-full border border-white/10" alt={p.resp} />
                    <span className="text-[13px] text-white/60 font-medium">Responsável: <span className="text-white">{p.resp}</span></span>
                  </div>
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter ${p.status === 'Aprovada' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-400/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                    {p.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
