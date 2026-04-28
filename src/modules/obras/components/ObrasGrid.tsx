import React from "react";
import { useDragScroll } from "../../../hooks/useDragScroll";
import { FINANCIAL_STATUSES, FINANCIAL_TYPES } from "../constants/obrasConstants";
import { FinancialGridSkeleton } from "./FinancialSkeleton";
import { useResponsive } from "../../../hooks/useResponsive";

export interface ITag {
  tag: string;
  descricao: string;
  cor: string;
}

export interface IObraOperacional {
  id: number;
  embarcacao_nome: string;
  statusFinanceiro: string;
  outlookBRL: number;
  realizadoBRL: number;
  condicao: string;
  inicio: string;
  termino: string;
  duracaoTotal: number;
  tags: ITag[];
  percRE?: number;
  percEM?: number;
  percCO?: number;
  percES?: number;
  percNC?: number;
}

interface ObrasGridProps {
  filteredObras: IObraOperacional[];
  loading: boolean;
  filters: {
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    statusFilter: string;
    setStatusFilter: (val: string) => void;
    typeFilter: string;
    setTypeFilter: (val: string) => void;
  };
}

const ObrasGrid: React.FC<ObrasGridProps> = ({
  filteredObras,
  loading,
  filters: { searchTerm, setSearchTerm, statusFilter, setStatusFilter, typeFilter, setTypeFilter }
}) => {
  const dragScroll = useDragScroll();
  const { isMobile } = useResponsive();

  const formatDateBR = (dateStr: string) => {
    if (!dateStr || dateStr === "-") return "-";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("pt-BR", { timeZone: "UTC" });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return <FinancialGridSkeleton />;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-transparent">
      {/* Barra de Ferramentas / Filtros */}
      <div className="px-4 sm:px-6 py-4 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between bg-[var(--bg-card)] backdrop-blur-xl border-b border-[var(--border-card)] shrink-0 z-20 no-print">
        <div className="flex flex-wrap gap-3 w-full lg:w-auto">
          <div className="relative group flex-1 sm:flex-none">
            <input
              type="text"
              placeholder="Buscar Obra..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-10 py-2.5 bg-white/5 border border-[var(--border-mini)] rounded-xl text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 placeholder:text-[var(--text-muted)] transition-all"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-[var(--border-mini)] rounded-xl px-4 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 min-w-[150px] transition-all cursor-pointer"
          >
            <option className="bg-[var(--sidebar-bg)]">Status</option>
            {FINANCIAL_STATUSES.map(s => (
              <option key={s} value={s} className="bg-[var(--sidebar-bg)]">{s}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white/5 border border-[var(--border-mini)] rounded-xl px-4 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 min-w-[200px] transition-all cursor-pointer"
          >
            <option className="bg-[var(--sidebar-bg)]">Tipo de Obra</option>
            {FINANCIAL_TYPES.map(t => (
              <option key={t} value={t} className="bg-[var(--sidebar-bg)]">{t}</option>
            ))}
          </select>
          <button className="flex items-center gap-2 bg-white/5 border border-[var(--border-mini)] rounded-xl px-4 py-2 text-sm text-[var(--text-main)] hover:bg-white/10 transition-all font-bold">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="2" y1="14" x2="6" y2="14" /><line x1="10" y1="8" x2="14" y2="8" /><line x1="18" y1="16" x2="22" y2="16" /></svg>
            Mais filtros
          </button>
        </div>

        <div className="flex gap-3 items-center w-full lg:w-auto justify-end">
           <div className="flex p-1 bg-white/5 border border-[var(--border-mini)] rounded-xl overflow-hidden">
             <button className="px-4 py-1.5 text-xs font-bold rounded-lg bg-[var(--text-main)] text-[var(--bg-app)]">Lista</button>
             <button className="px-4 py-1.5 text-xs font-bold rounded-lg text-[var(--text-dim)]">Cards</button>
           </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          <div {...dragScroll} className="flex-1 overflow-auto custom-scrollbar bg-transparent scroll-smooth">
            <table className="w-full text-left border-collapse min-w-[1500px]">
              <thead>
                <tr className="sticky top-0 z-30 shadow-xl">
                  <th className="bg-[var(--bg-header-solid)] px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest first:rounded-tl-2xl">ID</th>
                  <th className="bg-[var(--bg-header-solid)] px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Embarcação</th>
                  <th className="bg-[var(--bg-header-solid)] px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Status</th>
                  <th className="bg-[var(--bg-header-solid)] px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Tipo de Obra</th>
                  <th className="bg-[var(--bg-header-solid)] px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Condição</th>
                  <th className="bg-[var(--bg-header-solid)] px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Início</th>
                  <th className="bg-[var(--bg-header-solid)] px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Término</th>
                  <th className="bg-[var(--bg-header-solid)] px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center">Duração Total</th>
                  <th className="bg-[var(--bg-header-solid)] px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-right">Realizado BRL M</th>
                  <th className="bg-[var(--bg-header-solid)] px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-right">Outlook BRL M</th>
                  <th className="bg-[var(--bg-header-solid)] px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center">RE</th>
                  <th className="bg-[var(--bg-header-solid)] px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center">EM</th>
                  <th className="bg-[var(--bg-header-solid)] px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center">CO</th>
                  <th className="bg-[var(--bg-header-solid)] px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center">ES</th>
                  <th className="bg-[var(--bg-header-solid)] px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center">NC</th>
                  <th className="bg-[var(--bg-header-solid)] px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center last:rounded-tr-2xl">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-mini)]">
                {filteredObras.map((row) => (
                  <tr key={row.id} className="group hover:bg-[var(--hover-bg)] transition-all cursor-default">
                    <td className="px-6 py-5 text-sm text-[var(--text-dim)] font-mono">{row.id}</td>
                    <td className="px-6 py-5 text-[15px] text-[var(--text-main)] font-bold tracking-tight">{row.embarcacao_nome}</td>
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        row.statusFinanceiro === 'EXEC' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' :
                        row.statusFinanceiro === 'FECH' ? 'bg-white/10 text-[var(--text-dim)] border border-white/10' :
                        row.statusFinanceiro?.startsWith('FEL') ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' :
                        'bg-white/5 text-[var(--text-muted)] border border-white/5'
                      }`}>
                        {row.statusFinanceiro}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex gap-1.5">
                        {row.tags?.map(t => (
                          <span key={t.tag} className="px-2 py-1 text-[11px] font-bold rounded-lg" style={{ backgroundColor: t.cor, color: '#000' }}>{t.tag}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-[12px] font-bold ${row.condicao === 'Seco' ? 'text-emerald-400' : 'text-blue-400'}`}>
                        {row.condicao}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-[13px] text-[var(--text-muted)] font-mono">{formatDateBR(row.inicio)}</td>
                    <td className="px-6 py-5 text-[13px] text-[var(--text-muted)] font-mono">{formatDateBR(row.termino)}</td>
                    <td className="px-6 py-5 text-sm text-[var(--text-main)] text-center font-bold">{row.duracaoTotal}</td>
                    <td className="px-6 py-5 text-[14px] text-[var(--text-main)] font-bold text-right font-mono">
                      {row.realizadoBRL != null ? row.realizadoBRL.toFixed(1) : '-'}
                    </td>
                    <td className="px-6 py-5 text-[14px] text-[var(--text-main)] font-bold text-right font-mono">
                      {row.outlookBRL != null ? row.outlookBRL.toFixed(1) : '-'}
                    </td>
                    <td className="px-6 py-5 text-sm text-[var(--text-dim)] text-center font-medium">{row.percRE ?? '-'}%</td>
                    <td className="px-6 py-5 text-sm text-[var(--text-dim)] text-center font-medium">{row.percEM ?? '-'}%</td>
                    <td className="px-6 py-5 text-sm text-[var(--text-dim)] text-center font-medium">{row.percCO ?? '-'}%</td>
                    <td className="px-6 py-5 text-sm text-[var(--text-dim)] text-center font-medium">{row.percES ?? '-'}%</td>
                    <td className="px-6 py-5 text-sm text-[var(--text-dim)] text-center font-medium">{row.percNC ?? '-'}%</td>
                    <td className="px-6 py-5 text-center">
                       <button className="p-2 hover:bg-white/5 rounded-lg text-[var(--text-muted)] transition-colors">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </div>
    </div>
  );
};

export default ObrasGrid;
