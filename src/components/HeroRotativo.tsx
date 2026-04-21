import React, { useEffect, useMemo, useState } from "react";
import { IParada, IBffResponse } from "@hub/shared";
import { useBff } from "../hooks/useBff";
import { IconCalendar, IconClock, IconDocPlus, IconDocMinus, IconDocEdit, IconDocQuebra } from "./icons";

import parcelDosReisImg from "../assets/parcel-dos-reis.jpg";
import parcelDoBandolimImg from "../assets/parcel-do-bandolim.jpg";
import parcelDosMerosImg from "../assets/parcel-dos-meros.jpg";
import parcelDasParedesImg from "../assets/parcel-das-paredes.webp";
import parcelDasTimbebasImg from "../assets/parcel-das-timbebas.jpg";
import rochedoSaoPauloImg from "../assets/rochedo-de-sao-paulo.jpg";
import rochedoSaoPedroImg from "../assets/rochedo-de-sao-pedro.jpg";
import parcelDasFeiticeirasImg from "../assets/parcel-das-feiticeiras.jpeg";
import fallbackHeroImg from "../assets/hero-fallback.jpg";

const HERO_IMAGES: Record<string, string> = {
  "parcel-dos-reis": parcelDosReisImg,
  "parcel-do-bandolim": parcelDoBandolimImg,
  "parcel-dos-meros": parcelDosMerosImg,
  "parcel-das-paredes": parcelDasParedesImg,
  "parcel-das-timbebas": parcelDasTimbebasImg,
  "rochedo-de-sao-paulo": rochedoSaoPauloImg,
  "rochedo-sao-pedro": rochedoSaoPedroImg,
  "parcel-das-feiticeiras": parcelDasFeiticeirasImg,
};

export interface HeroRotativoProps {
  pinned: boolean;
  setPinned: (pinned: boolean) => void;
  activeTab: string;
  onSourceChange: (source: string) => void;
}

export function HeroRotativo({ pinned, setPinned, activeTab, onSourceChange }: HeroRotativoProps) {
  const { data, loading, err } = useBff<IBffResponse<IParada>>("/bff/paradas", []);

  useEffect(() => {
    if (data?.meta?.source && onSourceChange) {
      onSourceChange(data.meta.source);
    }
  }, [data, onSourceChange]);

  const [idx, setIdx] = useState(0);
  const items = useMemo(() => data?.items ?? [], [data?.items]);

  const elegiveis = useMemo(() => {
    return items.filter((p: IParada) => {
      const s = p.fel;
      if (activeTab === "Obras Finalizadas") return s === "FECH";
      if (activeTab === "Obras em Andamento") return s === "FEL-3" || s === "FEL-4";
      if (activeTab === "Obras Futuras") return s !== "FECH" && s !== "FEL-3" && s !== "FEL-4";
      return false;
    });
  }, [items, activeTab]);

  useEffect(() => { setIdx(0); }, [elegiveis.length, activeTab]);

  const total = elegiveis.length;

  useEffect(() => {
    if (pinned || total <= 1) return;
    const id = setInterval(() => setIdx(v => (v + 1) % total), 5000);
    return () => clearInterval(id);
  }, [pinned, total]);

  if (loading || err || total === 0) {
    if (loading) return <div className="p-10 text-white/50">Carregando...</div>;
    return (
      <div className="flex-1 flex items-center justify-center text-white/50 text-xl font-medium">
        {err ? `Erro: ${err}` : `Nenhuma obra encontrada para ${activeTab}`}
      </div>
    );
  }

  const parada = elegiveis[idx];
  if (!parada) return null;

  const heroImg = parada.heroImageKey ? HERO_IMAGES[parada.heroImageKey] ?? fallbackHeroImg : fallbackHeroImg;
  const disableNav = total <= 1;

  const onPrevParada = () => { if (!disableNav) { setPinned(true); setIdx(v => (v - 1 + total) % total); } };
  const onNextParada = () => { if (!disableNav) { setPinned(true); setIdx(v => (v + 1) % total); } };

  return (
    <section
      className="absolute inset-0 w-full h-full rounded-[32px] overflow-hidden shadow-2xl group pointer-events-auto glass-stroke"
    >
      {/* Imagem de Fundo com leve Zoom para movimento */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-[1.02]" 
        style={{ backgroundImage: `url(${heroImg})` }} 
      />

      {/* Camada de efeito Glass/Frosted */}
      <div className="absolute inset-0 bg-[#0A1F30]/40 backdrop-blur-[1px]" />
      
      {/* Gradiente de Vinheta para contraste do texto */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#05111b] via-[#05111b]/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#05111b]/40 via-transparent to-transparent" />

      <div className="absolute inset-0 z-10 p-8 lg:p-12 pl-10 sm:pl-14 pb-8 flex flex-col justify-between animate-fade-in">
        <div className="flex flex-col">
          <div className="flex flex-wrap gap-3 items-center mb-6">
            <div className="bg-[#051a26]/80 backdrop-blur-xl text-[12px] text-white/90 font-bold px-4 py-2 rounded-lg border border-white/[0.08] shadow-lg tracking-widest uppercase">
              ID {parada.paradaId}
            </div>
            <div className="flex bg-[#051a26]/80 backdrop-blur-xl text-[12px] text-white/90 font-bold rounded-lg border border-white/[0.08] shadow-lg items-center h-10">
              <div className="flex items-center gap-3 px-5 h-full border-r border-white/10 uppercase tracking-widest">
                <IconCalendar className="w-4 h-4 opacity-50" /> {parada.inicioRP}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-[12px] h-[12px] text-ocean-accent"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                {parada.terminoRP}
              </div>
              <div className="flex items-center gap-2 px-5 h-full tracking-widest uppercase">
                <IconClock className="w-4 h-4 opacity-50" /> {parada.durRP} DIAS
              </div>
            </div>
            <div className="bg-[#051a26]/80 backdrop-blur-xl text-white/90 px-4 py-2 rounded-lg border border-white/[0.08] shadow-lg h-10 flex items-center justify-center gap-2">
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Condição:</span>
              <span className="text-[12px] font-bold text-ocean-accent uppercase tracking-widest">{parada.condicao}</span>
            </div>
          </div>

          <h1 className="text-[28px] sm:text-[38px] xl:text-[44px] font-bold text-white leading-tight max-w-[850px] mb-2 tracking-tighter [text-shadow:0_4px_12px_rgba(0,0,0,0.5)]">
            {activeTab === "Obras Finalizadas" ? `Obra concluída: ${parada.embarcacao}` :
             activeTab === "Obras em Andamento" ? `Mobilização: ${parada.embarcacao}` :
             `Mobilização futura: ${parada.embarcacao}`}
            <br />
            <span className="text-white/60 text-[0.7em] font-medium tracking-normal">
              {activeTab === "Obras Finalizadas" ? `Finalizada em ${parada.terminoRP}.` : `Janela de execução: ${parada.terminoRP}.`}
            </span>
          </h1>
          <p className="text-white/80 text-[15px] sm:text-[17px] font-medium max-w-[600px] [text-shadow:0_2px_4px_rgba(0,0,0,0.3)]">
            Acompanhe em tempo real o status operacional, financeiro e documental desta mobilização.
          </p>
        </div>

        {/* Imagem da Embarcação (Floating Card) */}
        <div className="hidden xl:flex absolute right-12 top-[12%] w-[440px] h-[280px] rounded-[32px] overflow-hidden border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.6)] z-20 group/vessel transition-all duration-700 hover:scale-[1.02] hover:border-white/20">
          <img 
            src={heroImg} 
            alt={parada.embarcacao} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover/vessel:scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-8 text-white">
            <div className="text-[10px] font-bold uppercase tracking-[3px] opacity-50 mb-1">Assets / Embarcação</div>
            <div className="text-[26px] font-bold tracking-tighter">{parada.embarcacao}</div>
          </div>
          <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-1.5 rounded-full text-[10px] font-bold text-white tracking-[2px] uppercase">
            {parada.embarcacao_sigla || "PMO"}
          </div>
        </div>

        {/* Cards de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full mt-auto mb-[1rem]">
          {/* Card Financeiro */}
          <div className="glass-panel !bg-black/40 p-6 rounded-[24px] flex flex-col group transition-all duration-300 hover:!bg-black/50">
            <div className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-5">Indicadores Financeiros</div>
            <div className="flex items-center mb-6">
              <div className="text-[36px] xl:text-[42px] font-bold text-white leading-none pr-6 group-hover:text-ocean-accent transition-colors">{parada.outlook_brl_m || "0"}M</div>
              <div className="flex gap-4 items-center border-l border-white/10 pl-6 h-[44px]">
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-white leading-none mb-1 uppercase tracking-wider">{parada.fel}</span>
                  <span className="text-white/40 text-[10px] font-bold tracking-widest uppercase">Outlook BRL</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between w-full mt-auto pt-4 border-t border-white/5">
              {[
                { l: "NC", p: parada.nc },
                { l: "ES", p: parada.es },
                { l: "CO", p: parada.co },
                { l: "EM", p: parada.em },
                { l: "RE", p: parada.re },
              ].map((col, i) => (
                <div key={col.l} className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-white/40 mb-1 uppercase">{col.l}</span>
                  <span className="text-[14px] font-bold text-white group-hover:text-ocean-accent transition-colors">
                    {parada.coletores[i] ?? "-"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card Obra */}
          <div className="glass-panel !bg-black/40 p-6 rounded-[24px] flex flex-col group transition-all duration-300 hover:!bg-black/50">
            <div className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-6">Status da Mobilização</div>
            <div className="flex flex-col gap-6 w-full flex-1 justify-center">
              {[
                { perc: parada.obra?.matPerc ?? 0, tot: parada.obra?.matTot ?? "-", label: "Materiais\nEntregues" },
                { perc: parada.obra?.serPerc ?? 0, tot: parada.obra?.serTot ?? "-", label: "Serviços\nConcluídos" },
                { perc: parada.obra?.facPerc ?? 0, tot: parada.obra?.facTot ?? "-", label: "Consumo\nde Facilidades" },
              ].map(({ perc, tot, label }) => (
                <div key={label} className="flex items-center gap-5">
                  <div className="flex flex-col items-start w-[85px] shrink-0">
                    <span className="text-[32px] font-bold text-white leading-none group-hover:text-ocean-accent transition-colors">{perc}%</span>
                    <span className="text-[10px] font-bold text-white/30 uppercase mt-1 tracking-tighter">{tot}</span>
                  </div>
                  <div className="w-[1px] h-10 bg-white/10" />
                  <span className="text-[12px] font-bold text-white/70 uppercase tracking-wider leading-snug whitespace-pre-line">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card GMUD */}
          <div className="glass-panel !bg-black/40 p-6 rounded-[24px] flex flex-col group transition-all duration-300 hover:!bg-black/50">
            <div className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-5">Gestão de Mudanças (GMUD)</div>
            <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-5">
              <span className="text-[40px] font-bold text-white leading-none group-hover:text-ocean-accent transition-colors">{parada.gmud?.aprov ?? 0}</span>
              <span className="text-[18px] text-white/30 font-bold leading-none self-end pb-1 tracking-widest">/{parada.gmud?.tot ?? 0}</span>
              <span className="text-[12px] font-bold text-white/60 uppercase tracking-widest ml-1">Aprovadas</span>
            </div>
            <div className="grid grid-cols-2 gap-y-7 gap-x-4 w-full mt-auto">
              {[
                { Icon: IconDocPlus, value: parada.gmud?.add ?? 0, label: "Adição" },
                { Icon: IconDocMinus, value: parada.gmud?.exc ?? 0, label: "Exclusão" },
                { Icon: IconDocEdit, value: parada.gmud?.alt ?? 0, label: "Alteração" },
                { Icon: IconDocQuebra, value: parada.gmud?.qbr ?? 0, label: "Quebra" },
              ].map(({ Icon, value, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                    <Icon className="w-5 h-5 text-ocean-accent" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[20px] font-bold text-white leading-none mb-0.5">{value}</span>
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navegação */}
        <div className="flex items-center justify-between w-full relative z-20">
          <div className="flex flex-col gap-4">
            <button className="bg-white text-ocean-dark px-10 py-3 rounded-full font-bold text-[14px] hover:scale-[1.05] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_12px_24px_rgba(255,255,255,0.15)] uppercase tracking-widest">
              Acessar Obra
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] text-ocean-accent">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
            <div className="flex gap-2.5 mt-2 justify-start items-center ml-1">
              {elegiveis.map((_: IParada, i: number) => (
                <div key={i} className={`h-[3px] rounded-full transition-all duration-500 ${idx === i ? "w-[40px] bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "w-[20px] bg-white/20"}`} />
              ))}
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <button onClick={onPrevParada} disabled={disableNav} className="w-[54px] h-[54px] rounded-full bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:bg-white hover:text-ocean-dark flex items-center justify-center shadow-xl transition-all disabled:opacity-20 active:scale-90">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px] pr-[1px]"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button onClick={onNextParada} disabled={disableNav} className="w-[54px] h-[54px] rounded-full bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:bg-white hover:text-ocean-dark flex items-center justify-center shadow-xl transition-all disabled:opacity-20 active:scale-90">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-[22px] h-[22px] pl-[1px]"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

