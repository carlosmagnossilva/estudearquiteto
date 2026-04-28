import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Area, Line, PieChart, Pie, Cell, Legend
} from "recharts";
import { useDragScroll } from "../../../hooks/useDragScroll";
import { useBff } from "../../../hooks/useBff";

// Definições locais para garantir robustez contra cache de tipos
export interface IFinancialEvolucao {
  name: string;
  value: number;
}

export interface IFinancialWaterfall {
  name: string;
  value: number;
}

export interface IFinancialGasto {
  name: string;
  value: number;
  fill: string;
}

export interface IFinancialDetalhamento {
  Id: number;
  inicio: string;
  termino: string;
  dias: number;
  PercRE: number;
  PercEM: number;
  PercCO: number;
  PercES: number;
  PercNC: number;
  OutlookBRL: number;
  RealizadoBRL: number;
  embarcacao: string;
}

const FinancialIndicadores: React.FC = () => {
  const dragScroll = useDragScroll();
  const { data: bffData, loading } = useBff<any>("/bff/financeiro/indicadores?ano=2025");

  if (loading) return <div className="flex-1 flex items-center justify-center text-[#64748B] animate-pulse">Carregando indicadores...</div>;

  const EVOLUCAO_DATA: IFinancialEvolucao[] = bffData?.evolucao || [];
  const WATERFALL_DATA: IFinancialWaterfall[] = bffData?.waterfall || [];
  const DONUT_DATA: IFinancialGasto[] = bffData?.gastos || [];
  const DETALHAMENTO: IFinancialDetalhamento[] = bffData?.detalhamento || [];

  // Totais para os cards
  const totalOutlook = DETALHAMENTO.reduce((acc: number, curr: IFinancialDetalhamento) => acc + (curr.OutlookBRL || 0), 0);
  const totalRealizado = DETALHAMENTO.reduce((acc: number, curr: IFinancialDetalhamento) => acc + (curr.RealizadoBRL || 0), 0);
  const percExecucao = totalOutlook > 0 ? (totalRealizado / totalOutlook) * 100 : 0;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">

      {/* 1. Cards de Resumo Superior */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: "Outlook Total", value: `R$ ${totalOutlook.toFixed(1)}M`, sub: "+12% vs orçado", color: "border-blue-500/30" },
          { label: "Realizado Acumulado", value: `R$ ${totalRealizado.toFixed(1)}M`, sub: `${percExecucao.toFixed(1)}% de execução`, color: "border-emerald-500/30" },
          { label: "Obras em FEL", value: "08", sub: "3 críticas", color: "border-orange-500/30" },
          { label: "Eficiência Financeira", value: "94.2%", sub: "Acima da meta", color: "border-purple-500/30" }
        ].map((c, i) => (
          <div key={i} className={`bg-white/10 backdrop-blur-md border ${c.color} rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col justify-between`}>
            <div>
              <div className="text-[9px] sm:text-[10px] uppercase font-bold text-white/50 tracking-wider mb-1 leading-tight">{c.label}</div>
              <div className="text-lg sm:text-2xl font-bold text-white mb-1 leading-none">{c.value}</div>
            </div>
            <div className="text-[9px] sm:text-[10px] text-white/40 font-medium leading-tight">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* 2. Grid de Gráficos Analíticos */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Evolução de Capex */}
        <div className="xl:col-span-2 bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl min-w-0">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Evolução do Capex Financeiro (2025)
            </h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-white/5 rounded-full text-[10px] text-white/50 border border-white/5">Mensal</span>
            </div>
          </div>
          <div className="h-[300px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={EVOLUCAO_DATA}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-card)" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  tickFormatter={(v) => `R$ ${v}M`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--sidebar-bg)', border: '1px solid var(--border-card)', borderRadius: '12px' }}
                  itemStyle={{ color: 'var(--text-main)', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="value" stroke="none" fillOpacity={1} fill="url(#colorValue)" />
                <Bar dataKey="value" fill="#0EA5E9" radius={[4, 4, 0, 0]} barSize={30} />
                <Line type="monotone" dataKey="value" stroke="#38BDF8" strokeWidth={3} dot={{ r: 4, fill: '#38BDF8', strokeWidth: 2, stroke: '#fff' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribuição de Gastos */}
        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col min-w-0">
          <h3 className="text-white font-bold text-lg mb-6">Distribuição de Gastos</h3>
          <div className="flex-1 min-h-[250px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={DONUT_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {DONUT_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="rgba(255,255,255,0.1)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend
                  verticalAlign="bottom"
                  formatter={(value) => <span className="text-[11px] text-white/60">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
            <div className="flex justify-between text-[11px]">
              <span className="text-white/40">Gasto mais crítico:</span>
              <span className="text-white font-bold">Mão de Obra (35%)</span>
            </div>
          </div>
        </div>

        {/* Waterfall Financeiro */}
        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl min-w-0">
          <h3 className="text-white font-bold text-lg mb-6">Waterfall (Capex vs Outlook)</h3>
          <div className="h-[250px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WATERFALL_DATA} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={25}>
                  {WATERFALL_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#1E293B' : index === 1 ? '#0EA5E9' : '#F59E0B'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabela de Detalhamento em Card */}
        <div className="xl:col-span-2 bg-black/20 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-bold text-lg">Top 5 Obras por Capex (Outlook)</h3>
            <button className="text-xs text-blue-400 font-bold hover:underline">Ver todas</button>
          </div>
          <div className="overflow-x-auto custom-scrollbar" {...dragScroll}>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="pb-3 text-[10px] font-bold text-white/30 uppercase">Embarcação</th>
                  <th className="pb-3 text-[10px] font-bold text-white/30 uppercase text-right">Outlook (M)</th>
                  <th className="pb-3 text-[10px] font-bold text-white/30 uppercase text-right">Realizado (M)</th>
                  <th className="pb-3 text-[10px] font-bold text-white/30 uppercase text-center">Progresso</th>
                  <th className="pb-3 text-[10px] font-bold text-white/30 uppercase text-center">S-Curve</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {DETALHAMENTO.map((row) => {
                  const perc = (row.RealizadoBRL / row.OutlookBRL) * 100;
                  return (
                    <tr key={row.Id} className="group hover:bg-white/5 transition-all">
                      <td className="py-4">
                        <div className="font-bold text-white text-sm">{row.embarcacao}</div>
                        <div className="text-[10px] text-white/30 italic">ID: {row.Id}</div>
                      </td>
                      <td className="py-4 text-right font-mono text-sm text-white">R$ {row.OutlookBRL.toFixed(1)}M</td>
                      <td className="py-4 text-right font-mono text-sm text-blue-400">R$ {row.RealizadoBRL.toFixed(1)}M</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2 justify-center">
                          <div className="flex-1 max-w-[60px] h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${perc}%` }}></div>
                          </div>
                          <span className="text-[10px] font-bold text-white/60">{perc.toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="py-4 text-center">
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full font-bold border border-emerald-500/20">Healthy</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FinancialIndicadores;
