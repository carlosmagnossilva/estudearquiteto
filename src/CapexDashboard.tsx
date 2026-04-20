import React, { useEffect } from 'react';
import { 
  ResponsiveContainer, XAxis, Tooltip, AreaChart, Area, LabelList 
} from "recharts";
import { useBff } from "./hooks/useBff";
import { ICapexData, IBffResponse } from "@hub/shared";

const glassClass = "bg-[#102130]/90 backdrop-blur-md border border-white/10 rounded-[24px] p-5 lg:p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative overflow-hidden";

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

  if (loading) return <div className="p-10 text-white/50 animate-pulse">Carregando métricas financeiras...</div>;
  if (err) return <div className="p-10 text-rose-400 font-bold">Erro ao carregar Capex: {err}</div>;

  const { outlook, tipos, composicao, subsistemas, historico } = data || {};

  return (
    <div className="flex flex-col flex-1 gap-4 text-white animate-[fadeIn_0.5s_ease-out_forwards] w-full h-full overflow-y-auto lg:overflow-hidden pr-1">
      
      {/* UPPER ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-4 shrink-0">
        
        {/* OUTLOOK CARD */}
        <div className={glassClass + " flex flex-col justify-between min-h-[180px]"}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-[14px] sm:text-[16px] font-bold text-white tracking-wide">Outlook de Capex de Obras - {outlook?.ano || 2026}</h3>
          </div>
          
          <div className="flex items-end flex-wrap gap-3 mb-4 mt-2">
            <div className="text-[28px] sm:text-[36px] xl:text-[40px] font-medium text-white [text-shadow:_0_0_1px_rgba(255,255,255,0.4)] leading-none tracking-tight">
              {outlook?.outlook_brl_m?.toLocaleString('pt-BR')} M
            </div>
            <span className={`text-[10px] sm:text-[11px] mb-1 px-2 py-1 flex items-center gap-1 rounded font-bold border ${(outlook?.variacao_orcamento_perc ?? 0) <= 0 ? 'bg-[#022c16] text-[#4ade80] border-[#4ade80]/20' : 'bg-rose-900/50 text-rose-400 border-rose-400/20'}`}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d={(outlook?.variacao_orcamento_perc ?? 0) <= 0 ? "M12 5v14M19 12l-7 7-7-7" : "M12 19V5M5 12l7-7 7 7"}/>
              </svg>
              {outlook?.variacao_orcamento_perc}% vs orçamento
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="border border-white/10 p-2.5 sm:p-3.5 rounded-[16px] flex flex-col justify-center">
              <span className="text-[10px] sm:text-[12px] font-semibold text-white/70 mb-1">Total de Obras</span>
              <span className="text-[16px] sm:text-[20px] font-medium text-white">{outlook?.total_obras}</span>
            </div>
            <div className="border border-white/10 p-2.5 sm:p-3.5 rounded-[16px] flex flex-col justify-center">
              <span className="text-[10px] sm:text-[12px] font-semibold text-white/70 mb-1">Obras Executadas</span>
              <span className="text-[16px] sm:text-[20px] font-medium text-white">{outlook?.obras_executadas}</span>
            </div>
          </div>
        </div>

        {/* TIPO DE OBRA CARD */}
        <div className={glassClass}>
          <h3 className="text-[14px] sm:text-[16px] font-bold text-white tracking-wide mb-4 mt-[-4px]">Total por Tipo de obra</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
             {tipos?.map(type => (
               <div key={type.id} className="border border-white/10 p-2 sm:p-3 rounded-[16px] flex flex-col transition-all hover:bg-white/5">
                  <div className="text-[10px] sm:text-[12px] text-white/70 mb-1 font-bold truncate">{type.id}</div>
                  <div className="text-[15px] sm:text-[18px] font-medium text-white mb-0.5">{type.valor_brl_m?.toLocaleString('pt-BR')}M</div>
                  <div className="text-[10px] text-white/60">{type.percentual}%</div>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* HORIZONTAL METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 shrink-0">
        {composicao?.map(item => (
          <div key={item.label} className={glassClass + " flex items-center justify-between !py-2.5 !px-4 sm:!py-3 sm:!px-5 transition-all hover:border-white/20"}>
            <span className="text-[14px] sm:text-[16px] font-normal text-white truncate mr-2">{item.label}</span>
            <div className="flex items-baseline gap-2 shrink-0">
                <div className="text-[24px] sm:text-[32px] font-medium text-white">{item.percentual}%</div>
                <div className="text-[10px] sm:text-[12px] font-bold text-white/70 whitespace-nowrap">{item.valor_brl_m}M</div>
            </div>
          </div>
        ))}
      </div>

      {/* LOWER ROW */}
      <div className="flex-1 min-h-[400px] lg:min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4 pb-2">
        
        {/* SUBSISTEMAS */}
        <div className={`lg:col-span-4 ${glassClass} flex flex-col max-h-[400px] lg:max-h-none`}>
           <h3 className="text-[14px] sm:text-[16px] font-bold text-white mb-4 sm:mb-5 mt-[-2px] shrink-0">Custos por Subsistema</h3>
           <div className="flex-1 overflow-y-auto card-scrollbar space-y-3.5 pr-4 -mr-2">
              {subsistemas?.map((s, idx) => (
                <div key={idx} className="flex flex-col">
                   <div className="flex justify-between items-baseline mb-1">
                      <span className="text-[12px] sm:text-[13px] font-semibold text-white truncate mr-2">{s.nome}</span>
                      <span className="text-[12px] sm:text-[13px] font-medium text-white">{s.valor_brl_m}M</span>
                   </div>
                   <div className="text-[10px] text-white/60 mb-2">{s.codigo}</div>
                   <div className="h-[3px] bg-white/10 w-full rounded-full overflow-hidden">
                      <div className="h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]" style={{ width: `${s.percentual}%` }}></div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* GRÁFICO AREA */}
        <div className={`lg:col-span-8 ${glassClass} flex flex-col min-h-[300px] lg:min-h-0`}>
           <div className="flex justify-between items-start mb-0">
              <div>
                <h3 className="text-[14px] sm:text-[16px] font-bold text-white mb-1 mt-[-2px]">Capex Por Ano</h3>
                <p className="text-[10px] sm:text-[12px] text-white/70">Total Ciclo dos 5 anos</p>
                <div className="text-[20px] sm:text-[26px] font-medium text-white mt-1">
                   {historico?.reduce((acc, curr) => acc + curr.value, 0).toLocaleString('pt-BR')} M
                </div>
              </div>
           </div>
           
           <div className="flex-1 w-full mt-2 -ml-4 sm:-ml-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historico} margin={{ top: 25, right: 15, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCapex" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity={0.25}/>
                      <stop offset="100%" stopColor="#ffffff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.85)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                  />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: 'bold'}} dy={5} />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#ffffff" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorCapex)" 
                    isAnimationActive={false}
                  >
                    <LabelList 
                      dataKey="value" 
                      position="top" 
                      fill="white" 
                      fontSize={10} 
                      fontWeight="normal"
                      offset={12} 
                    />
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

      </div>
    </div>
  );
}

