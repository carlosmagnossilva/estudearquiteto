import React, { useEffect } from 'react';
import {
  ResponsiveContainer, XAxis, Tooltip, AreaChart, Area, LabelList, CartesianGrid
} from "recharts";
import { useBff } from "./hooks/useBff";
import { ICapexData, IBffResponse } from "@hub/shared";

// Estilo Glassmorphism de alta fidelidade
const glassClass = "bg-[var(--bg-card)] backdrop-blur-[12px] border border-[var(--border-card)] rounded-2xl p-4 transition-all duration-500 hover:border-white/20 flex flex-col relative overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]";

interface CapexDashboardProps {
  onSourceChange?: (source: string) => void;
}

export default function CapexDashboard({ onSourceChange }: CapexDashboardProps) {
  const { data, loading, err } = useBff<IBffResponse<ICapexData>>("/bff/capex?ano=2026", []);

  useEffect(() => {
    if (data?.meta?.source && onSourceChange) {
      onSourceChange(data.meta.source);
    }
  }, [data, onSourceChange]);

  if (loading) return <div className="p-10 text-white/50 animate-pulse text-sm">Carregando métricas financeiras...</div>;
  if (err) return <div className="p-10 text-rose-400 font-bold text-sm">Erro ao carregar Capex: {err}</div>;

  const { outlook, tipos, composicao, subsistemas, historico } = data || {};

  return (
    <div className="flex flex-col flex-1 gap-3 xl:gap-4 text-white animate-fade-in w-full h-full lg:overflow-hidden overflow-y-auto pb-2 custom-scrollbar">

      {/* 1. TOP SECTION: CAPEX DOS 5 ANOS */}
      <div className={`${glassClass} flex-none lg:flex-1 min-h-[300px] lg:min-h-0 rounded-[28px]`}>
        <div className="flex justify-between items-center mb-2 shrink-0">
          <h2 className="text-[13px] font-medium text-[var(--text-dim)]">Capex dos 5 Anos</h2>
          <span className="text-[13px] text-[var(--text-main)]">Total: <b className="font-bold">{historico?.reduce((acc, curr) => acc + curr.value, 0).toLocaleString('pt-BR')} M</b></span>
        </div>

        <div className="flex-1 w-full -ml-4 sm:-ml-6 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historico} margin={{ top: 25, right: 20, left: 20, bottom: 10 }}>
              <defs>
                <linearGradient id="colorCapexRefined" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip
                contentStyle={{ backgroundColor: 'rgba(10,26,42,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
              />
              <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="year" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-main)', opacity: 0.6, fontSize: 11 }}
                dy={10}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--accent)"
                strokeWidth={2}
                fill="url(#colorCapexRefined)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0, fill: '#fff' }}
                isAnimationActive={true}
              >
                <LabelList 
                  dataKey="value" 
                  position="top" 
                  offset={10} 
                  fill="var(--text-main)" 
                  fontSize={11} 
                  formatter={(val: any) => val?.toLocaleString('pt-BR')} 
                />
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. MID SECTION: OUTLOOK & TIPO DE OBRA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 xl:gap-4 flex-none lg:flex-[1.4] min-h-0">
        <div className={`md:col-span-1 lg:col-span-5 ${glassClass} rounded-[28px] !p-4 xl:!p-5`}>
          <h2 className="text-[13px] font-medium text-[var(--text-dim)] mb-1">Outlook de Capex de Obras - 2026</h2>
          <div className="text-[28px] sm:text-[34px] font-semibold text-[var(--text-main)] leading-tight tracking-tight">
            {outlook?.outlook_brl_m?.toLocaleString('pt-BR')} M
          </div>
          <div className={`text-[12px] mt-0.5 ${(outlook?.variacao_orcamento_perc ?? 0) <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {Math.abs(outlook?.variacao_orcamento_perc || 0)}% vs orçamento
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 sm:mt-auto">
            <div className="p-3 sm:p-4 rounded-xl bg-[var(--bg-mini-card)] border border-[var(--border-mini)] flex flex-col justify-between min-h-[80px] sm:min-h-[90px] transition-all hover:bg-white/[0.08]">
              <div className="text-[10px] sm:text-[11px] text-[var(--text-muted)] uppercase font-bold tracking-widest leading-tight">Total de Obras</div>
              <div className="text-[20px] sm:text-[24px] font-bold text-[var(--text-main)] leading-none mt-2">{outlook?.total_obras}</div>
            </div>
            <div className="p-3 sm:p-4 rounded-xl bg-[var(--bg-mini-card)] border border-[var(--border-mini)] flex flex-col justify-between min-h-[80px] sm:min-h-[90px] transition-all hover:bg-white/[0.08]">
              <div className="text-[10px] sm:text-[11px] text-[var(--text-muted)] uppercase font-bold tracking-widest leading-tight">Obras Executadas</div>
              <div className="text-[20px] sm:text-[24px] font-bold text-[var(--text-main)] leading-none mt-2">{outlook?.obras_executadas}</div>
            </div>
          </div>
        </div>

        <div className={`${glassClass} md:col-span-1 lg:col-span-7`}>
          <h2 className="text-[13px] font-medium text-[var(--text-dim)] mb-2">Total por Tipo de obra - 2026</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mt-2 flex-1">
            {tipos?.slice(0, 5).map(type => (
              <div key={type.id} className="rounded-xl px-3 sm:px-4 py-2 sm:py-3 bg-[var(--bg-mini-card)] border border-[var(--border-mini)] flex flex-col items-start transition-all hover:bg-white/[0.08] min-h-[80px] sm:min-h-[100px] justify-center">
                <div className="text-[9px] sm:text-[11px] text-[var(--text-muted)] uppercase font-bold tracking-wider mb-1 sm:mb-2 leading-tight">
                  {type.id}
                </div>
                <div className="text-[14px] sm:text-[16px] font-bold text-[var(--text-main)] leading-tight mb-1">
                  {type.valor_brl_m} M
                </div>
                <div className="text-[9px] sm:text-[10px] text-[var(--text-muted)] font-medium">
                  {type.percentual}%
                </div>
              </div>
            ))}
            <div className="hidden sm:block sm:invisible" />
          </div>
        </div>
      </div>

      {/* 3. BOTTOM SECTION: COMPOSIÇÃO & SUBSISTEMAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 xl:gap-4 flex-none lg:flex-[1.3] min-h-0 lg:overflow-hidden">
        <div className="md:col-span-1 lg:col-span-5 flex flex-col gap-2 overflow-hidden">
          {composicao?.map(item => (
            <div key={item.label} className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-3 flex-1 flex items-center justify-between transition-all hover:bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <span className="text-[11px] sm:text-[12px] font-medium text-[var(--text-dim)]">{item.label}</span>
              <span className="text-xl sm:text-2xl font-semibold text-[var(--text-main)]">{item.percentual}%</span>
              <span className="text-[10px] sm:text-[11px] text-[var(--text-dim)]">
                {item.valor_brl_m} M 
                <span className={`ml-1 sm:ml-1.5 ${(item.variacao_perc || 0) <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {item.variacao_perc > 0 ? '+' : ''}{item.variacao_perc}%
                </span>
              </span>
            </div>
          ))}
        </div>

        <div className={`${glassClass} md:col-span-1 lg:col-span-7`}>
          <h2 className="text-[13px] font-medium text-[var(--text-dim)] mb-4">Custos por Subsistema - 2026</h2>
          <div className="flex-1 overflow-y-auto card-scrollbar space-y-4 pr-2">
            {subsistemas?.map((s, idx) => (
              <div key={idx} className="flex flex-col group">
                <div className="flex justify-between text-[11px] mb-1.5 font-medium text-[var(--text-dim)]">
                  <span className="text-[var(--text-main)] opacity-90">{s.nome}</span>
                  <span className="text-[var(--text-main)]">{s.valor_brl_m} M</span>
                </div>
                <div className="h-1 bg-[var(--bg-mini-card)] rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--accent)] rounded-full shadow-[0_0_8px_var(--accent)]" style={{ width: `${s.percentual}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
