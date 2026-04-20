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
      if (activeTab === "Obras encerradas") return s === "FECH";
      if (activeTab === "Em andamento") return s === "FEL-3" || s === "FEL-4";
      if (activeTab === "Obras futuras") return s !== "FECH" && s !== "FEL-3" && s !== "FEL-4";
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
      className="absolute inset-0 w-full h-full rounded-[32px] overflow-hidden shadow-2xl group pointer-events-auto border border-white/5"
    >
      {/* Imagem de Fundo com leve Zoom para movimento */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 scale-105" 
        style={{ backgroundImage: `url(${heroImg})` }} 
      />

      {/* Camada de efeito Glass/Frosted - Reduzida para maior clareza da imagem */}
      <div className="absolute inset-0 bg-[#0A1F30]/30 backdrop-blur-[0.5px]" />
      
      {/* Gradiente de Vinheta para contraste do texto - Ajustado para não escurecer demais o topo */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#05111b] via-[#05111b]/10 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#05111b]/30 via-transparent to-transparent" />

      <div className="absolute inset-0 z-10 p-10 lg:p-12 pl-14 pb-8 flex flex-col justify-between">
        <div className="flex flex-col">
          <div className="flex gap-2 items-center mb-6">
            <div className="bg-[#051a26]/90 text-[14px] text-white/90 font-medium px-4 py-1.5 rounded-md border border-white/[0.04] shadow-sm tracking-wide">
              ID {parada.paradaId}
            </div>
            <div className="flex bg-[#051a26]/90 text-[14px] text-white/90 font-medium rounded-md border border-white/[0.04] shadow-sm items-center h-9">
              <div className="flex items-center gap-2 px-4 h-full border-r border-slate-700/50">
                <IconCalendar className="w-5 h-5 opacity-70" /> {parada.inicioRP}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-[14px] h-[14px] opacity-70"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                {parada.terminoRP}
              </div>
              <div className="flex items-center gap-2 px-4 h-full">
                <IconClock className="w-5 h-5 opacity-70" /> {parada.durRP} d
              </div>
            </div>
            <div className="bg-[#051a26]/90 text-white/90 px-3 py-1.5 rounded-md border border-white/[0.04] shadow-sm h-9 flex items-center justify-center gap-2">
              <span className="text-[12px] font-bold text-white/60">Condição:</span>
              <span className="text-[13px] font-bold">{parada.condicao}</span>
            </div>
          </div>

          <h1 className="text-[32px] sm:text-[38px] font-bold text-white leading-[1.2] max-w-[800px] mb-1 tracking-tight [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
            {activeTab === "Obras encerradas" ? `Obra concluída em ${parada.embarcacao}` :
             activeTab === "Em andamento" ? `Em andamento: Mobilização ${parada.embarcacao}` :
             `Mobilização futura para ${parada.embarcacao}`}
            <br />
            {activeTab === "Obras encerradas" ? `Encerrada em ${parada.terminoRP}.` : `Previsão: ${parada.terminoRP}.`}
          </h1>
          <p className="text-white/90 text-[16px] [text-shadow:0_1px_3px_rgba(0,0,0,0.5)]">
            Acesse a obra {parada.paradaId} para ver todos os detalhes e documentos.
          </p>
        </div>

        {/* Imagem da Embarcação (Floating Card) */}
        <div className="hidden xl:flex absolute right-12 top-[15%] w-[420px] h-[260px] rounded-[24px] overflow-hidden border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-20 group/vessel transition-all duration-700 hover:scale-[1.03] hover:border-white/40">
          <img 
            src={heroImg} 
            alt={parada.embarcacao} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover/vessel:scale-110" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover/vessel:opacity-40 transition-opacity" />
          <div className="absolute bottom-5 left-6 text-white drop-shadow-lg">
            <div className="text-[12px] font-bold uppercase tracking-[2px] opacity-70 mb-1">Embarcação</div>
            <div className="text-[24px] font-bold tracking-tight">{parada.embarcacao}</div>
          </div>
          {/* Badge de status ou detalhe no card da embarcação */}
          <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[11px] font-bold text-white tracking-widest uppercase">
            {parada.embarcacao_sigla || "PMO"}
          </div>
        </div>

        {/* Cards de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-auto mb-[2rem]">
          {/* Card Financeiro */}
          <div className="bg-[#101b22]/85 backdrop-blur-md p-6 rounded-[12px] shadow-lg flex flex-col border border-white/5 relative z-10 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-20 before:rounded-[12px] before:pointer-events-none">
            <div className="text-[14px] text-white/90 mb-4 tracking-wide font-normal">Financeiro</div>
            <div className="flex items-center mb-6">
              <div className="text-[40px] font-bold text-white leading-none pr-5">{parada.outlook_brl_m || "0"}M</div>
              <div className="flex gap-4 items-center border-l border-white/20 pl-4 h-[42px]">
                <div className="flex flex-col font-bold text-white/90">
                  <span className="text-[15px] leading-none mb-1">{parada.fel}</span>
                  <span className="text-white/60 text-[11px] font-medium tracking-wide">Outlook – BRL</span>
                </div>
              </div>
            </div>
            <div className="relative w-full h-[60px] mt-2 border-b border-white/30">
              <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-full opacity-60">
                <polygon points="0,40 0,30 20,20 30,30 45,10 60,35 80,15 100,5 100,40" fill="#9ba9b5" />
                <line x1="65" y1="0" x2="65" y2="40" stroke="white" strokeWidth="0.5" />
                <circle cx="65" cy="22" r="2" fill="white" />
              </svg>
              <span className="absolute top-0 right-[35%] translate-x-1/2 text-[10px] font-medium text-white leading-none mb-1">Hoje</span>
            </div>
            <div className="flex justify-between w-full mt-3">
              {[
                { l: "NC", p: parada.nc },
                { l: "ES", p: parada.es },
                { l: "CO", p: parada.co },
                { l: "EM", p: parada.em },
                { l: "RE", p: parada.re },
              ].map((col, i) => (
                <div key={col.l} className="flex flex-col items-center">
                  <span className="text-[11px] text-white/90 mb-0.5">{col.l}</span>
                  <span className="text-[11px] text-white/60 mb-2">{col.p}</span>
                  <span className="border border-white/20 text-[10px] font-bold px-1.5 py-[2px] rounded-[4px] min-w-[28px] text-center">
                    {parada.coletores[i] ?? "-"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card Obra */}
          <div className="bg-[#101b22]/85 backdrop-blur-md p-6 rounded-[12px] shadow-lg flex flex-col border border-white/5 relative z-10 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-20 before:rounded-[12px] before:pointer-events-none">
            <div className="text-[14px] text-white/90 mb-5 tracking-wide font-normal">Obra</div>
            <div className="flex flex-col gap-6 w-full flex-1 justify-center">
              {[
                { perc: parada.obra?.matPerc ?? 0, tot: parada.obra?.matTot ?? "-", label: "Materiais\nEntregues" },
                { perc: parada.obra?.serPerc ?? 0, tot: parada.obra?.serTot ?? "-", label: "Serviços\nConcluídos" },
                { perc: parada.obra?.facPerc ?? 0, tot: parada.obra?.facTot ?? "-", label: "Consumo\nde Facilidades" },
              ].map(({ perc, tot, label }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="flex flex-col items-start w-[80px] shrink-0">
                    <span className="text-[40px] font-bold text-white leading-none">{perc}%</span>
                    <span className="text-[11px] text-white/70 mt-1">{tot}</span>
                  </div>
                  <div className="w-[1px] h-10 bg-white/20 mx-1" />
                  <span className="text-[14px] font-medium text-white/90 leading-snug whitespace-pre-line">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card GMUD */}
          <div className="bg-[#101b22]/85 backdrop-blur-md p-6 rounded-[12px] shadow-lg flex flex-col border border-white/5 relative z-10 before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-20 before:rounded-[12px] before:pointer-events-none">
            <div className="text-[14px] text-white/90 mb-4 tracking-wide font-normal">GMUD</div>
            <div className="flex items-center gap-2 mb-8 mt-1 border-b border-white/20 pb-4">
              <span className="text-[40px] font-bold text-white leading-none">{parada.gmud?.aprov ?? 0}</span>
              <span className="text-[18px] text-white/60 leading-none pb-1 font-normal">/{parada.gmud?.tot ?? 0}</span>
              <span className="text-[16px] text-white/90 font-normal ml-2">Aprovadas</span>
            </div>
            <div className="grid grid-cols-2 gap-y-7 gap-x-2 w-full mt-auto mb-2">
              {[
                { Icon: IconDocPlus, value: parada.gmud?.add ?? 0, label: "Adição" },
                { Icon: IconDocMinus, value: parada.gmud?.exc ?? 0, label: "Exclusão" },
                { Icon: IconDocEdit, value: parada.gmud?.alt ?? 0, label: "Alteração" },
                { Icon: IconDocQuebra, value: parada.gmud?.qbr ?? 0, label: "Quebra" },
              ].map(({ Icon, value, label }) => (
                <div key={label} className="flex flex-col">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-[18px] h-[18px] text-white" />
                    <span className="text-[26px] font-bold text-white leading-none">{value}</span>
                  </div>
                  <span className="text-[14px] text-white/90 font-normal ml-[26px]">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navegação */}
        <div className="flex items-center justify-between w-full">
          <div className="flex flex-col gap-4">
            <button className="bg-[#e2edf3] text-[#1c3a50] px-5 py-[8px] rounded-[6px] font-medium text-[15px] hover:bg-white transition-all flex items-center justify-center gap-2 shadow-xl min-w-[170px]">
              Acessar Obra
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[16px] h-[16px]">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
            <div className="flex gap-2.5 mt-2 justify-start pl-1">
              {elegiveis.map((_: IParada, i: number) => (
                <div key={i} className={`h-[5px] rounded-full transition-all ${idx === i ? "w-[40px] bg-white" : "w-[30px] bg-[#9baebc]/60"}`} />
              ))}
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <button onClick={onPrevParada} disabled={disableNav} className="w-[45px] h-[45px] rounded-full bg-[#dce6ed] text-[#1c3a50] hover:bg-white flex items-center justify-center shadow-lg transition-all disabled:opacity-30">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[20px] h-[20px] pr-[1px]"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
            <button onClick={onNextParada} disabled={disableNav} className="w-[45px] h-[45px] rounded-full bg-[#dce6ed] text-[#1c3a50] hover:bg-white flex items-center justify-center shadow-lg transition-all disabled:opacity-30">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[20px] h-[20px] pl-[1px]"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

