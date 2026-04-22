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

      {/* Camada de unificação de tonalidade (Filtro Técnico Azulado) */}
      <div className="absolute inset-0 bg-[#061B2B]/60 backdrop-blur-[1px] mix-blend-multiply" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#061B2B]/20 via-transparent to-[#061B2B]/80" />

      {/* Gradiente de Vinheta para contraste do texto */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#05111b] via-[#05111b]/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#05111b]/60 via-transparent to-transparent" />

      <div className="absolute inset-0 z-10 p-8 lg:p-12 pl-10 sm:pl-14 pb-8 flex flex-col justify-between animate-fade-in pt-14 lg:pt-16">
        <div className="flex flex-col">
          <div className="flex flex-wrap gap-4 items-center mb-8">
            <div className="bg-black/40 backdrop-blur-xl text-[12px] text-white/80 font-bold px-4 py-2 rounded-lg border border-white/10 shadow-lg tracking-widest uppercase">
              ID {parada.paradaId}
            </div>
            <div className="flex bg-black/40 backdrop-blur-xl text-[12px] text-white/80 font-bold rounded-lg border border-white/10 shadow-lg items-center h-10">
              <div className="flex items-center gap-3 px-5 h-full border-r border-white/5 uppercase tracking-widest">
                <IconCalendar className="w-4 h-4 opacity-40" /> {parada.inicioRP}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-[12px] h-[12px] text-cyan-400 opacity-60"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                {parada.terminoRP}
              </div>
              <div className="flex items-center gap-2 px-5 h-full tracking-widest uppercase border-r border-white/5">
                <IconClock className="w-4 h-4 opacity-40" /> {parada.durRP} DIAS
              </div>
              <div className="flex items-center gap-2 px-5 h-full tracking-widest uppercase">
                <span className="text-[10px] opacity-40">Condição:</span>
                <span className="text-cyan-400 opacity-90">{parada.condicao}</span>
              </div>
            </div>
          </div>

          <h1 className="text-[28px] sm:text-[36px] xl:text-[40px] font-bold text-white leading-tight max-w-[850px] mb-3 tracking-tighter [text-shadow:0_4px_12px_rgba(0,0,0,0.5)]">
            {activeTab === "Obras Finalizadas" ? `A Mobilização do ${parada.embarcacao} foi finalizada em ${parada.terminoRP}.` :
              `A Mobilização do ${parada.embarcacao} termina no dia ${parada.terminoRP.split('/')[0]} de ${parada.terminoRP.split('/')[1] === '02' ? 'fevereiro' : 'março'}.`}
          </h1>
          <p className="text-white/60 text-[16px] sm:text-[18px] font-medium max-w-[600px] [text-shadow:0_2px_4px_rgba(0,0,0,0.3)]">
            Acesse a obra {parada.paradaId} para mais informações.
          </p>
        </div>


        {/* Cards de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full mt-auto mb-[1rem]">
          {/* Card Financeiro (High Fidelity) */}
          <div className="bg-[#0B1F2E]/90 backdrop-blur-md p-5 rounded-[24px] flex flex-col group transition-all duration-300 border border-white/5 shadow-2xl relative overflow-hidden h-[300px]">
            <div className="text-[14px] text-white/70 mb-2">Financeiro</div>

            <div className="flex items-center gap-4 mb-2">
              <div className="text-[32px] font-bold text-white leading-none">
                {parada.outlook_brl_m || "30,1"}M
              </div>
              <div className="w-[1px] h-10 bg-white/20" />
              <div className="flex flex-col">
                <span className="text-[14px] font-bold text-white leading-none mb-1">{parada.fel}</span>
                <span className="text-white/40 text-[10px] font-bold tracking-widest uppercase">Total – BRL</span>
              </div>
            </div>

            {/* Area Chart with "Hoje" marker - REDUCED HEIGHT */}
            <div className="h-[80px] w-full relative mb-3 mt-1">
              <svg viewBox="0 0 200 80" className="w-full h-full" preserveAspectRatio="none">
                <path d="M0 60 L20 50 L40 55 L60 30 L80 50 L100 45 L130 35 L150 45 L170 30 L200 10 L200 80 L0 80 Z" fill="rgba(255,255,255,0.15)" />
                <path d="M0 60 L20 50 L40 55 L60 30 L80 50 L100 45 L130 35 L150 45 L170 30 L200 10" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
                <line x1="160" y1="20" x2="160" y2="80" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="2,2" />
                <circle cx="160" cy="35" r="3" fill="white" />
                <text x="145" y="15" fill="white" fontSize="8" fontWeight="bold">Hoje</text>
              </svg>
            </div>

            <div className="flex flex-col gap-2 mt-auto">
              <div className="flex justify-between w-full px-1">
                {[
                  { l: "NC", p: "5%" },
                  { l: "ES", p: "5%" },
                  { l: "CO", p: "10%" },
                  { l: "EM", p: "10%" },
                  { l: "RE", p: "70%" },
                ].map((item) => (
                  <div key={item.l} className="flex flex-col items-center">
                    <span className="text-[10px] font-bold text-white/40 mb-1 uppercase">{item.l}</span>
                    <span className="text-[12px] font-bold text-white">{item.p}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between gap-1 mt-1">
                {["100", "101", "103", "105", "301"].map((id) => (
                  <div key={id} className="flex-1 py-1.5 flex items-center justify-center rounded-lg bg-black/20 border border-white/20 text-[11px] font-bold text-white">
                    {id}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card Obra (High Fidelity) */}
          <div className="bg-[#0B1F2E]/90 backdrop-blur-md p-5 rounded-[24px] flex flex-col group transition-all duration-300 border border-white/5 shadow-2xl h-[300px]">
            <div className="text-[14px] text-white/70 mb-5">Obra</div>
            <div className="flex flex-col gap-6 w-full flex-1 justify-center">
              {[
                { val: parada.obra?.matPerc ?? 600, tot: parada.obra?.matTot ?? 1000, label: "Materiais\nEntregues" },
                { val: parada.obra?.serPerc ?? 30, tot: parada.obra?.serTot ?? 100, label: "Serviços\nConcluídos" },
                { val: parada.obra?.facPerc ?? 11, tot: parada.obra?.facTot ?? 20, label: "Consumo\nde Facilidades" },
              ].map(({ val, tot, label }) => {
                const nVal = Number(val);
                const nTot = Number(tot);
                const calculatedPerc = nTot > 0 ? Math.round((nVal / nTot) * 100) : 0;

                return (
                  <div key={label} className="flex items-center gap-6">
                    <div className="flex flex-col items-start w-[75px] shrink-0">
                      <span className="text-[32px] font-bold text-white leading-none">{calculatedPerc}%</span>
                      <span className="text-[11px] font-bold text-white/30 uppercase mt-1.5 tracking-tighter">
                        {nVal}/{nTot.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="w-[1px] h-10 bg-white/10" />
                    <span className="text-[12px] font-extrabold text-white/90 uppercase tracking-wider leading-tight whitespace-pre-line">
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card GMUD (High Fidelity) */}
          <div className="bg-[#0B1F2E]/90 backdrop-blur-md p-5 rounded-[24px] flex flex-col group transition-all duration-300 border border-white/5 shadow-2xl h-[300px]">
            <div className="text-[14px] text-white/70 mb-5">Gestão de Mudanças (GMUD)</div>
            <div className="flex items-center gap-2 mb-8">
              <span className="text-[44px] font-bold text-white leading-none">
                {parada.gmud?.aprov ?? 32}
              </span>
              <span className="text-[20px] text-white/30 font-bold leading-none self-end pb-1 tracking-tight">
                /{parada.gmud?.tot ?? 41}
              </span>
              <span className="text-[14px] font-extrabold text-white/30 uppercase tracking-widest ml-3 self-end pb-1">
                Aprovadas
              </span>
            </div>
            <div className="grid grid-cols-2 gap-y-5 gap-x-4 w-full mt-auto">
              {[
                { Icon: IconDocPlus, value: parada.gmud?.add ?? 19, label: "Adição" },
                { Icon: IconDocMinus, value: parada.gmud?.exc ?? 6, label: "Exclusão" },
                { Icon: IconDocEdit, value: parada.gmud?.alt ?? 7, label: "Alteração" },
                { Icon: IconDocQuebra, value: parada.gmud?.qbr ?? 3, label: "Quebra" },
              ].map(({ Icon, value, label }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20 shadow-[0_0_15px_rgba(34,211,238,0.1)] group-hover:bg-cyan-400/20 transition-all">
                    <Icon className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col justify-center h-12">
                    <span className="text-[24px] font-bold text-white leading-none mb-1">
                      {value.toString().padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-extrabold text-white/40 uppercase tracking-[0.1em]">
                      {label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navegação */}
        <div className="flex items-center justify-between w-full relative z-20">
          <div className="flex flex-col gap-6">
            <button className="bg-white/90 backdrop-blur-md text-[#003D5B] px-8 py-3.5 rounded-lg font-bold text-[14px] hover:bg-white active:scale-[0.98] transition-all flex items-center justify-center gap-4 shadow-xl border border-white/20 uppercase tracking-widest group">
              Acessar Obra
              <div className="bg-[#003D5B] rounded-md p-1.5 transition-transform group-hover:translate-x-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-[14px] h-[14px] text-white">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </button>
            <div className="flex gap-2.5 mt-2 justify-start items-center ml-1">
              {elegiveis.map((_: IParada, i: number) => (
                <div key={i} className={`h-[4px] rounded-full transition-all duration-500 ${idx === i ? "w-[40px] bg-white shadow-[0_0_12px_rgba(255,255,255,1)]" : "w-[20px] bg-white/20"}`} />
              ))}
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <button onClick={onPrevParada} disabled={disableNav} className="w-[50px] h-[50px] rounded-full bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:bg-white hover:text-[#003D5B] flex items-center justify-center shadow-xl transition-all disabled:opacity-20 active:scale-90">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-[20px] h-[20px]"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button onClick={onNextParada} disabled={disableNav} className="w-[50px] h-[50px] rounded-full bg-white/10 backdrop-blur-xl border border-white/10 text-white hover:bg-white hover:text-[#003D5B] flex items-center justify-center shadow-xl transition-all disabled:opacity-20 active:scale-90">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-[20px] h-[20px]"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

