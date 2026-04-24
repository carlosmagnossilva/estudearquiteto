import React from "react";
import { useBff } from "../../../hooks/useBff";
import { useDragScroll } from "../../../hooks/useDragScroll";
import { IFinanceiroObra, IBffResponse } from "@hub/shared";

const FinancialObrasGrid: React.FC = () => {
  const { data, loading } = useBff<IBffResponse<IFinanceiroObra>>("/bff/financeiro/obras");
  const dragScroll = useDragScroll();

  if (loading) return (
    <div className="flex-1 flex items-center justify-center text-[var(--text-dim)] animate-pulse">
      Carregando obras financeiras...
    </div>
  );

  // Fallback para dados locais se o BFF não retornar itens (baseado na extração do Figma)
  const obras: IFinanceiroObra[] = data?.items && data.items.length > 0 ? data.items : [
    { id: 24, id_parada: 24, embarcacao_nome: "A. Abrolhos", statusFinanceiro: "FEL-3", tags: [{tag: "100", descricao: "100"}, {tag: "101", descricao: "101"}], realizadoBRL: 38.0, outlookBRL: 38.0, percRE: 100, percEM: 1, percCO: 5, percES: 3, percNC: 90, condicao: "Seco", inicio: "02/12/24", termino: "26/02/25", duracaoTotal: 96, dataUltimaAtualizacao: "" },
    { id: 25, id_parada: 25, embarcacao_nome: "R. São Paulo", statusFinanceiro: "FECH", tags: [{tag: "101", descricao: "101"}], realizadoBRL: 8.3, outlookBRL: 11.8, percRE: 70, percEM: 8, percCO: 2, percES: 0, percNC: 89, condicao: "Molhado", inicio: "07/03/25", termino: "07/04/25", duracaoTotal: 31, dataUltimaAtualizacao: "" },
    { id: 36, id_parada: 36, embarcacao_nome: "I. Mosqueiro", statusFinanceiro: "FECH", tags: [{tag: "301", descricao: "301"}], realizadoBRL: 22.1, outlookBRL: 22.1, percRE: 100, percEM: 1, percCO: 0, percES: 81, percNC: 18, condicao: "Seco", inicio: "15/03/25", termino: "15/06/25", duracaoTotal: 92, dataUltimaAtualizacao: "" },
    { id: 33, id_parada: 33, embarcacao_nome: "P. Meros", statusFinanceiro: "EXEC", tags: [{tag: "100", descricao: "100"}, {tag: "101", descricao: "101"}, {tag: "103", descricao: "103"}], realizadoBRL: 5.6, outlookBRL: 29.3, percRE: 19, percEM: 18, percCO: 49, percES: 22, percNC: 11, condicao: "Seco", inicio: "21/01/26", termino: "11/04/26", duracaoTotal: 80, dataUltimaAtualizacao: "" },
    { id: 37, id_parada: 37, embarcacao_nome: "P. Badejo", statusFinanceiro: "FEL-4", tags: [{tag: "101", descricao: "101"}], realizadoBRL: 10.6, outlookBRL: 16.2, percRE: 65, percEM: 32, percCO: 5, percES: 50, percNC: 13, condicao: "Molhado", inicio: "30/10/25", termino: "10/12/25", duracaoTotal: 41, dataUltimaAtualizacao: "" }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-transparent">
      {/* 🛠️ Barra de Ferramentas / Filtros */}
      <div className="px-6 py-4 flex flex-col lg:flex-row gap-4 items-center justify-between bg-[var(--bg-card)] backdrop-blur-xl border-b border-[var(--border-card)] shrink-0 z-20">
         <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            <div className="relative group flex-1 sm:flex-none">
              <input 
                type="text" 
                placeholder="Buscar Obra..." 
                className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-white/5 border border-[var(--border-mini)] rounded-xl text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 placeholder:text-[var(--text-muted)] transition-all"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </div>
            </div>
            <select className="bg-white/5 border border-[var(--border-mini)] rounded-xl px-4 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 min-w-[120px] transition-all">
              <option className="bg-[var(--sidebar-bg)]">Status</option>
              <option className="bg-[var(--sidebar-bg)]">FEL-1</option>
              <option className="bg-[var(--sidebar-bg)]">EXEC</option>
            </select>
            <select className="bg-white/5 border border-[var(--border-mini)] rounded-xl px-4 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 min-w-[120px] transition-all">
              <option className="bg-[var(--sidebar-bg)]">Tipo</option>
            </select>
            <button className="flex items-center gap-2 bg-white/5 border border-[var(--border-mini)] rounded-xl px-4 py-2 text-sm text-[var(--text-main)] hover:bg-white/10 transition-all font-bold">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="2" y1="14" x2="6" y2="14"/><line x1="10" y1="8" x2="14" y2="8"/><line x1="18" y1="16" x2="22" y2="16"/></svg>
               Mais filtros
            </button>
         </div>

         <div className="flex gap-3 items-center w-full lg:w-auto justify-end">
            <div className="flex p-1 bg-white/5 border border-[var(--border-mini)] rounded-xl overflow-hidden">
               <button className="px-4 py-1.5 bg-[var(--text-main)] text-[var(--bg-app)] text-xs font-bold rounded-lg shadow-lg">Lista</button>
               <button className="px-4 py-1.5 text-[var(--text-dim)] text-xs font-bold hover:text-[var(--text-main)] transition-all">Cards</button>
            </div>
            <button className="bg-[var(--accent)] text-black px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-[0_8px_20px_rgba(56,189,248,0.3)] hover:brightness-110 transition-all ml-2">
              Nova Obra +
            </button>
         </div>
      </div>

      {/* 📊 Grid de Dados com Scroll Drag and Drop */}
      <div 
        {...dragScroll}
        className="flex-1 overflow-auto custom-scrollbar bg-transparent select-none"
      >
        <table className="w-full text-left border-collapse min-w-[1400px]">
          <thead>
            <tr className="bg-[var(--bg-card)] border-b border-[var(--border-card)] sticky top-0 z-30 backdrop-blur-2xl">
              <th className="px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">ID</th>
              <th className="px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Embarcação</th>
              <th className="px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Status</th>
              <th className="px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Tags (Obra)</th>
              <th className="px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-right">Realizado BRL</th>
              <th className="px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-right">Outlook BRL</th>
              <th className="px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center">RE</th>
              <th className="px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center">EM</th>
              <th className="px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center">CO</th>
              <th className="px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center">ES</th>
              <th className="px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center">NC</th>
              <th className="px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Condição</th>
              <th className="px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Início</th>
              <th className="px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Término</th>
              <th className="px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center">Duração</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-mini)]">
            {obras.map((row) => (
              <tr key={row.id} className="group hover:bg-white/[0.03] transition-all cursor-default">
                <td className="px-6 py-5 text-sm text-[var(--text-dim)] group-hover:text-[var(--text-main)] font-mono">{row.id}</td>
                <td className="px-6 py-5 text-[15px] text-[var(--text-main)] font-bold tracking-tight">{row.embarcacao_nome}</td>
                <td className="px-6 py-5">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ${
                    row.statusFinanceiro === 'EXEC' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 
                    row.statusFinanceiro.startsWith('FEL') ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' :
                    'bg-white/10 text-[var(--text-dim)] border border-white/10'
                  }`}>
                    {row.statusFinanceiro}
                  </span>
                </td>
                <td className="px-6 py-5">
                   <div className="flex gap-1.5">
                      {row.tags?.map(t => (
                        <span key={t.tag} className="px-2 py-0.5 bg-white/5 text-[var(--text-muted)] text-[10px] font-bold rounded-md border border-white/5 group-hover:border-[var(--accent)]/30 transition-all">
                          {t.descricao}
                        </span>
                      ))}
                   </div>
                </td>
                <td className="px-6 py-5 text-[14px] text-[var(--text-main)] font-bold text-right font-mono">
                  {row.realizadoBRL ? `R$ ${row.realizadoBRL.toFixed(1)}M` : '-'}
                </td>
                <td className="px-6 py-5 text-[14px] text-[var(--accent)] font-bold text-right font-mono">
                  R$ {row.outlookBRL.toFixed(1)}M
                </td>
                <td className="px-6 py-5 text-sm text-[var(--text-dim)] text-center font-medium">{row.percRE}%</td>
                <td className="px-6 py-5 text-sm text-[var(--text-dim)] text-center font-medium">{row.percEM}%</td>
                <td className="px-6 py-5 text-sm text-[var(--text-dim)] text-center font-medium">{row.percCO}%</td>
                <td className="px-6 py-5 text-sm text-[var(--text-dim)] text-center font-medium">{row.percES}%</td>
                <td className="px-6 py-5 text-sm text-[var(--text-dim)] text-center font-medium">{row.percNC}%</td>
                <td className="px-6 py-5">
                   <span className={`text-[12px] font-bold ${row.condicao === 'Seco' ? 'text-emerald-400' : 'text-blue-400'}`}>
                    {row.condicao}
                   </span>
                </td>
                <td className="px-6 py-5 text-[13px] text-[var(--text-muted)] group-hover:text-[var(--text-dim)] transition-colors">{row.inicio}</td>
                <td className="px-6 py-5 text-[13px] text-[var(--text-muted)] group-hover:text-[var(--text-dim)] transition-colors">{row.termino}</td>
                <td className="px-6 py-5 text-sm text-[var(--text-main)] text-center font-bold">{row.duracaoTotal}d</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinancialObrasGrid;
