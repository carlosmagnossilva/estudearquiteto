import React from "react";
import { useBff } from "../../../hooks/useBff";
import { useDragScroll } from "../../../hooks/useDragScroll";
import { IFinanceiroObra, IBffResponse } from "@hub/shared";

const FinancialObrasGrid: React.FC = () => {
  const { data, loading } = useBff<IBffResponse<IFinanceiroObra>>("/bff/financeiro/obras");
  const dragScroll = useDragScroll();

  if (loading) return (
    <div className="flex-1 flex items-center justify-center text-[#64748B] animate-pulse">
      Carregando obras financeiras...
    </div>
  );

  const obras = data?.items || [];

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Header com Filtros Específicos do Grid de Obras */}
      <div className="px-4 py-3 border-b border-white/20 flex items-center justify-between bg-white/20">
         <div className="flex gap-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Buscar Obra" 
                className="pl-10 pr-4 py-2 bg-white/60 border border-[#CBD5E1] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#003D5B]/20 w-64 placeholder:text-[#94A3B8]"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
            </div>
            <select className="bg-white/60 border border-[#CBD5E1] rounded-lg px-4 py-2 text-sm text-[#334155] focus:outline-none min-w-[120px]">
              <option>Status</option>
            </select>
            <select className="bg-white/60 border border-[#CBD5E1] rounded-lg px-4 py-2 text-sm text-[#334155] focus:outline-none min-w-[120px]">
              <option>Tipo</option>
            </select>
            <button className="flex items-center gap-2 bg-white/60 border border-[#CBD5E1] rounded-lg px-4 py-2 text-sm text-[#334155] hover:bg-white transition-all">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="2" y1="14" x2="6" y2="14"/><line x1="10" y1="8" x2="14" y2="8"/><line x1="18" y1="16" x2="22" y2="16"/></svg>
               Mais filtros
            </button>
         </div>

         <div className="flex gap-3 items-center">
            <select className="bg-white/60 border border-[#CBD5E1] rounded-lg px-4 py-2 text-sm text-[#334155] focus:outline-none min-w-[160px]">
              <option>Mostrar colunas</option>
            </select>
            <div className="flex border border-[#CBD5E1] rounded-lg overflow-hidden bg-white/60">
               <button className="px-3 py-2 bg-[#E2E8F0] text-[#003D5B] text-xs font-bold border-r border-[#CBD5E1]">Lista</button>
               <button className="px-3 py-2 text-[#64748B] text-xs font-bold hover:bg-white/40">Cards</button>
            </div>
            <button className="bg-[#003D5B] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm hover:bg-[#002A3F] transition-all ml-2">
              Nova Obra +
            </button>
         </div>
      </div>

      <div 
        {...dragScroll}
        className="flex-1 overflow-x-auto custom-scrollbar"
      >
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-white/40 border-b border-white/10 sticky top-0 z-10 backdrop-blur-sm">
              <th className="px-4 py-4 text-[11px] font-bold text-[#64748B] uppercase">ID</th>
              <th className="px-4 py-4 text-[11px] font-bold text-[#64748B] uppercase">Embarcação</th>
              <th className="px-4 py-4 text-[11px] font-bold text-[#64748B] uppercase">Status</th>
              <th className="px-4 py-4 text-[11px] font-bold text-[#64748B] uppercase">Tipo de Obra</th>
              <th className="px-4 py-4 text-[11px] font-bold text-[#64748B] uppercase text-right">Realizado BRL M</th>
              <th className="px-4 py-4 text-[11px] font-bold text-[#64748B] uppercase text-right">Outlook BRL M</th>
              <th className="px-4 py-4 text-[11px] font-bold text-[#64748B] uppercase text-center">RE</th>
              <th className="px-4 py-4 text-[11px] font-bold text-[#64748B] uppercase text-center">EM</th>
              <th className="px-4 py-4 text-[11px] font-bold text-[#64748B] uppercase text-center">CO</th>
              <th className="px-4 py-4 text-[11px] font-bold text-[#64748B] uppercase text-center">ES</th>
              <th className="px-4 py-4 text-[11px] font-bold text-[#64748B] uppercase text-center">NC</th>
              <th className="px-4 py-4 text-[11px] font-bold text-[#64748B] uppercase">Condição</th>
              <th className="px-4 py-4 text-[11px] font-bold text-[#64748B] uppercase">Início</th>
              <th className="px-4 py-4 text-[11px] font-bold text-[#64748B] uppercase">Término</th>
              <th className="px-4 py-4 text-[11px] font-bold text-[#64748B] uppercase text-center">Duração Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {obras.map((row) => (
              <tr key={row.id} className="hover:bg-white/20 transition-colors">
                <td className="px-4 py-4 text-sm text-[#475569]">{row.id}</td>
                <td className="px-4 py-4 text-sm text-[#0F172A] font-semibold">{row.embarcacao_nome}</td>
                <td className="px-4 py-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    row.statusFinanceiro === 'EXEC' ? 'bg-blue-100 text-blue-700' : 
                    row.statusFinanceiro.startsWith('FEL') ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {row.statusFinanceiro}
                  </span>
                </td>
                <td className="px-4 py-4">
                   <div className="flex gap-1">
                      {row.tags?.map(t => (
                        <span key={t.tag} className="px-1.5 py-0.5 bg-[#0EA5E9] text-white text-[10px] font-bold rounded">
                          {t.descricao}
                        </span>
                      ))}
                   </div>
                </td>
                <td className="px-4 py-4 text-sm text-[#0F172A] font-bold text-right">{row.realizadoBRL.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}</td>
                <td className="px-4 py-4 text-sm text-[#0F172A] font-bold text-right">{row.outlookBRL.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}</td>
                <td className="px-4 py-4 text-sm text-[#64748B] text-center">{row.percRE}%</td>
                <td className="px-4 py-4 text-sm text-[#64748B] text-center">{row.percEM}%</td>
                <td className="px-4 py-4 text-sm text-[#64748B] text-center">{row.percCO}%</td>
                <td className="px-4 py-4 text-sm text-[#64748B] text-center">{row.percES}%</td>
                <td className="px-4 py-4 text-sm text-[#64748B] text-center">{row.percNC}%</td>
                <td className="px-4 py-4 text-sm text-[#475569]">{row.condicao}</td>
                <td className="px-4 py-4 text-sm text-[#475569]">{row.inicio}</td>
                <td className="px-4 py-4 text-sm text-[#475569]">{row.termino}</td>
                <td className="px-4 py-4 text-sm text-[#475569] text-center font-bold">{row.duracaoTotal} d</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinancialObrasGrid;
