import React from "react";
import { useDragScroll } from "../../../hooks/useDragScroll";
import FinancialObrasCards from "./FinancialObrasCards";
import { FINANCIAL_STATUSES, FINANCIAL_TYPES } from "../constants/financialConstants";
import { FinancialGridSkeleton, FinancialCardSkeleton } from "./FinancialSkeleton";
import { useResponsive } from "../../../hooks/useResponsive";

// Definição local para garantir que a propriedade 'cor' seja reconhecida imediatamente
export interface ITag {
  tag: string;
  descricao: string;
  cor: string;
}

export interface IFinanceiroObraLocal {
  id: number;
  id_parada: number;
  embarcacao_nome: string;
  statusFinanceiro: string;
  outlookBRL: number;
  realizadoBRL: number;
  percRE: number;
  percEM: number;
  percCO: number;
  percES: number;
  percNC: number;
  dataUltimaAtualizacao: string;
  condicao: string;
  inicio: string;
  termino: string;
  duracaoTotal: number;
  tags: ITag[];
}

interface FinancialObrasGridProps {
  filteredObras: IFinanceiroObraLocal[];
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

const FinancialObrasGrid: React.FC<FinancialObrasGridProps> = ({ 
  filteredObras, 
  loading,
  filters: { searchTerm, setSearchTerm, statusFilter, setStatusFilter, typeFilter, setTypeFilter }
}) => {
  const [viewMode, setViewMode] = React.useState<"list" | "cards">("list");
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
    return viewMode === "list" ? <FinancialGridSkeleton /> : <FinancialCardSkeleton />;
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-transparent">
      {/* 🛠️ Barra de Ferramentas / Filtros */}
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
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              >
                ✕
              </button>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white/5 border border-[var(--border-mini)] rounded-xl px-4 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 min-w-[150px] transition-all cursor-pointer"
          >
            <option className="bg-[var(--sidebar-bg)]">Todos os Status</option>
            {FINANCIAL_STATUSES.map(s => (
              <option key={s} value={s} className="bg-[var(--sidebar-bg)]">{s}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-white/5 border border-[var(--border-mini)] rounded-xl px-4 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 min-w-[220px] transition-all cursor-pointer"
          >
            <option className="bg-[var(--sidebar-bg)]">Todos os Tipos</option>
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
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === "list" ? "bg-[var(--text-main)] text-[var(--bg-app)] shadow-lg" : "text-[var(--text-dim)] hover:text-[var(--text-main)]"}`}
            >
              Lista
            </button>
            <button
              onClick={() => setViewMode("cards")}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === "cards" ? "bg-[var(--text-main)] text-[var(--bg-app)] shadow-lg" : "text-[var(--text-dim)] hover:text-[var(--text-main)]"}`}
            >
              Cards
            </button>
          </div>
          <button className="bg-[var(--accent)] text-black px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-[0_8px_20px_rgba(56,189,248,0.3)] hover:brightness-110 transition-all ml-2">
            Nova Obra +
          </button>
        </div>
      </div>

      {/* 📊 Grid de Dados ou Kanban de Cards */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {viewMode === "list" ? (
          <div
            {...dragScroll}
            className="flex-1 overflow-auto custom-scrollbar bg-transparent select-none cursor-grab active:cursor-grabbing transition-colors"
          >
            {isMobile ? (
              <div className="flex flex-col gap-4 p-4">
                {filteredObras.map((row) => (
                  <div key={row.id} className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl p-4 space-y-3 shadow-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-mono text-[var(--text-muted)]">#{row.id}</span>
                        <h4 className="text-[15px] font-bold text-[var(--text-main)]">{row.embarcacao_nome}</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${row.statusFinanceiro === 'EXEC' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        {row.statusFinanceiro}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-dim)]">Outlook:</span>
                      <span className="font-bold text-[var(--accent)]">{row.outlookBRL != null ? `R$ ${row.outlookBRL.toFixed(1)}M` : '-'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--text-dim)]">Realizado:</span>
                      <span className="font-bold text-[var(--text-main)]">{row.realizadoBRL != null ? `R$ ${row.realizadoBRL.toFixed(1)}M` : '-'}</span>
                    </div>
                    <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                      <div className="flex gap-1">
                        {row.tags.slice(0, 2).map(t => (
                          <span key={t.tag} className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ backgroundColor: t.cor, color: '#000' }}>{t.tag}</span>
                        ))}
                      </div>
                      <span className="text-[11px] text-[var(--text-muted)] font-mono">{formatDateBR(row.inicio)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[1400px]">
                <thead>
                  <tr className="sticky top-0 z-30 shadow-xl">
                    <th className="bg-[var(--bg-header-solid)] px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest first:rounded-tl-2xl transition-colors duration-1000">ID</th>
                    <th className="bg-[var(--bg-header-solid)] px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest transition-colors duration-1000">Embarcação</th>
                    <th className="bg-[var(--bg-header-solid)] px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest transition-colors duration-1000">Status</th>
                    <th className="bg-[var(--bg-header-solid)] px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest transition-colors duration-1000">Tipo de Obra</th>
                    <th className="bg-[var(--bg-header-solid)] px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-right transition-colors duration-1000">Realizado BRL</th>
                    <th className="bg-[var(--bg-header-solid)] px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-right transition-colors duration-1000">Outlook BRL</th>
                    <th className="bg-[var(--bg-header-solid)] px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center transition-colors duration-1000">RE</th>
                    <th className="bg-[var(--bg-header-solid)] px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center transition-colors duration-1000">EM</th>
                    <th className="bg-[var(--bg-header-solid)] px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center transition-colors duration-1000">CO</th>
                    <th className="bg-[var(--bg-header-solid)] px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center transition-colors duration-1000">ES</th>
                    <th className="bg-[var(--bg-header-solid)] px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center transition-colors duration-1000">NC</th>
                    <th className="bg-[var(--bg-header-solid)] px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest transition-colors duration-1000">Condição</th>
                    <th className="bg-[var(--bg-header-solid)] px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest transition-colors duration-1000">Início</th>
                    <th className="bg-[var(--bg-header-solid)] px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest transition-colors duration-1000">Término</th>
                    <th className="bg-[var(--bg-header-solid)] px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center last:rounded-tr-2xl transition-colors duration-1000">Duração</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-mini)]">
                  {filteredObras.map((row) => (
                    <tr key={row.id} className="group hover:bg-[var(--hover-bg)] transition-all cursor-default">
                      <td className="px-6 py-5 text-sm text-[var(--text-dim)] group-hover:text-[var(--text-main)] font-mono">{row.id}</td>
                      <td className="px-6 py-5 text-[15px] text-[var(--text-main)] font-bold tracking-tight">{row.embarcacao_nome}</td>
                      <td className="px-6 py-5 min-w-[120px]">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm whitespace-nowrap ${row.statusFinanceiro === 'EXEC' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' :
                            row.statusFinanceiro?.startsWith('FEL') ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' :
                              'bg-white/10 text-[var(--text-dim)] border border-white/10'
                          }`}>
                          {row.statusFinanceiro}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-1.5">
                          {row.tags?.map(t => (
                            <span
                              key={t.tag}
                              title={t.descricao}
                              className="px-2 py-1 text-[11px] font-bold rounded-lg transition-all shadow-sm cursor-help"
                              style={{
                                backgroundColor: t.cor,
                                color: '#000000',
                                border: `1px solid ${t.cor}`
                              }}
                            >
                              {t.tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-[14px] text-[var(--text-main)] font-bold text-right font-mono">
                        {row.realizadoBRL != null ? `R$ ${row.realizadoBRL.toFixed(1)}M` : '-'}
                      </td>
                      <td className="px-6 py-5 text-[14px] text-[var(--accent)] font-bold text-right font-mono">
                        {row.outlookBRL != null ? `R$ ${row.outlookBRL.toFixed(1)}M` : '-'}
                      </td>
                      <td className="px-6 py-5 text-sm text-[var(--text-dim)] text-center font-medium">{row.percRE ?? '-'}%</td>
                      <td className="px-6 py-5 text-sm text-[var(--text-dim)] text-center font-medium">{row.percEM ?? '-'}%</td>
                      <td className="px-6 py-5 text-sm text-[var(--text-dim)] text-center font-medium">{row.percCO ?? '-'}%</td>
                      <td className="px-6 py-5 text-sm text-[var(--text-dim)] text-center font-medium">{row.percES ?? '-'}%</td>
                      <td className="px-6 py-5 text-sm text-[var(--text-dim)] text-center font-medium">{row.percNC ?? '-'}%</td>
                      <td className="px-6 py-5">
                        <span className={`text-[12px] font-bold ${row.condicao === 'Seco' ? 'text-emerald-400' : 'text-blue-400'}`}>
                          {row.condicao}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-[13px] text-[var(--text-muted)] group-hover:text-[var(--text-dim)] transition-colors font-mono">{formatDateBR(row.inicio)}</td>
                      <td className="px-6 py-5 text-[13px] text-[var(--text-muted)] group-hover:text-[var(--text-dim)] transition-colors font-mono">{formatDateBR(row.termino)}</td>
                      <td className="px-6 py-5 text-sm text-[var(--text-main)] text-center font-bold">{row.duracaoTotal}d</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <FinancialObrasCards data={filteredObras} />
        )}
      </div>
    </div>
  );
};

export default FinancialObrasGrid;
