import React from "react";
import { IFinanceiroObraLocal } from "./FinancialObrasGrid";
import { useDragScroll } from "../../../hooks/useDragScroll";
import { FINANCIAL_STATUSES } from "../constants/financialConstants";
import { useResponsive } from "../../../hooks/useResponsive";

interface FinancialObrasCardsProps {
  data: IFinanceiroObraLocal[];
}

const FinancialObrasCards: React.FC<FinancialObrasCardsProps> = ({ data }) => {
  const dragScroll = useDragScroll();
  const [isGlobalCollapsed, setIsGlobalCollapsed] = React.useState(false);
  const [expandedIds, setExpandedIds] = React.useState<Set<number>>(new Set());
  const [openMenuStatus, setOpenMenuStatus] = React.useState<string | null>(null);
  const [columnSorts, setColumnSorts] = React.useState<Record<string, "date" | "value">>({});
  
  const { isMobile } = useResponsive();
  const [activeMobileStatus, setActiveMobileStatus] = React.useState<typeof FINANCIAL_STATUSES[number]>(FINANCIAL_STATUSES[0]);

  const toggleCard = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setIsGlobalCollapsed(!isGlobalCollapsed);
    setExpandedIds(new Set());
  };

  const toggleColumnItems = (status: string, expand: boolean) => {
    const columnObras = data.filter(o => o.statusFinanceiro === status);
    setExpandedIds(prev => {
      const next = new Set(prev);
      columnObras.forEach(o => {
        if (isGlobalCollapsed) {
          if (expand) next.add(o.id); else next.delete(o.id);
        } else {
          if (expand) next.delete(o.id); else next.add(o.id);
        }
      });
      return next;
    });
    setOpenMenuStatus(null);
  };

  const exportColumn = (status: string) => {
    const columnObras = data.filter(o => o.statusFinanceiro === status);
    const csv = [
      ["ID", "Embarcacao", "Status", "Realizado BRL", "Outlook BRL", "Inicio", "Duracao"],
      ...columnObras.map(o => [o.id, o.embarcacao_nome, o.statusFinanceiro, o.realizadoBRL, o.outlookBRL, o.inicio, o.duracaoTotal])
    ].map(e => e.join(",")).join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `obras_${status.toLowerCase()}.csv`);
    a.click();
    setOpenMenuStatus(null);
  };

  // Agrupar obras por status para o Kanban
  const statuses = FINANCIAL_STATUSES;
  
  const groupedObras = statuses.reduce((acc, status) => {
    const filtered = data.filter(obra => obra.statusFinanceiro === status);
    const sortType = columnSorts[status] || "date";
    
    acc[status] = filtered.sort((a, b) => {
      if (sortType === "value") {
        return (b.realizadoBRL || 0) - (a.realizadoBRL || 0);
      }
      return new Date(b.inicio).getTime() - new Date(a.inicio).getTime();
    });
    return acc;
  }, {} as Record<string, IFinanceiroObraLocal[]>);

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

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-transparent">
      {/* 🟢 Header de Controle do Board */}
      <div className="px-6 py-3 border-b border-white/5 flex justify-end shrink-0">
        <button 
          onClick={toggleAll}
          className="flex items-center gap-2 text-xs font-bold text-[var(--text-dim)] hover:text-[var(--text-main)] transition-all bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"
        >
          <svg 
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            className={`transition-transform duration-300 ${isGlobalCollapsed ? "" : "rotate-180"}`}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
          {isGlobalCollapsed ? "Expandir Todos" : "Colapsar Todos"}
        </button>
      </div>

      {/* 📱 Seletor de Colunas para Mobile */}
      {isMobile && (
        <div className="px-6 py-2 flex gap-2 overflow-x-auto no-scrollbar border-b border-white/5 bg-black/20">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setActiveMobileStatus(s)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeMobileStatus === s ? "bg-[var(--accent)] text-black shadow-lg shadow-[var(--accent)]/20" : "text-[var(--text-dim)] hover:text-[var(--text-main)] bg-white/5"}`}
            >
              {s} ({groupedObras[s]?.length || 0})
            </button>
          ))}
        </div>
      )}

      <div 
        {...dragScroll}
        className="flex-1 overflow-x-auto custom-scrollbar p-6 select-none cursor-grab active:cursor-grabbing"
      >
        <div className={`flex gap-6 h-full ${isMobile ? "w-full" : "min-w-max"}`}>
          {statuses.filter(s => !isMobile || s === activeMobileStatus).map(status => (
            <div key={status} className={`${isMobile ? "w-full" : "w-[320px]"} flex flex-col gap-4`}>
              {/* Header da Coluna */}
              <div className="flex items-center justify-between px-2 shrink-0 relative">
                <div className="flex items-center gap-2">
                  <h3 className="text-[14px] font-black text-[var(--text-main)] uppercase tracking-wider">{status}</h3>
                  <span className="bg-white/10 text-[var(--text-dim)] text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/5">
                    {groupedObras[status]?.length || 0}
                  </span>
                </div>
                
                <button 
                  onClick={() => setOpenMenuStatus(openMenuStatus === status ? null : status)}
                  className={`p-1 rounded-md transition-colors ${openMenuStatus === status ? "bg-[var(--accent)] text-black" : "text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5"}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                </button>

                {/* Dropdown Menu da Coluna */}
                {openMenuStatus === status && (
                  <div className="absolute right-0 top-10 w-52 bg-[var(--sidebar-bg)] border border-[var(--border-card)] rounded-xl shadow-2xl z-[100] p-1.5 animate-fade-in">
                    <div className="px-3 py-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-white/5 mb-1">Ordenação</div>
                    <button 
                      onClick={() => { setColumnSorts({ ...columnSorts, [status]: "date" }); setOpenMenuStatus(null); }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${columnSorts[status] !== "value" ? "bg-[var(--accent)]/10 text-[var(--accent)]" : "text-[var(--text-dim)] hover:bg-white/5"}`}
                    >
                      Por Data (Novas) {columnSorts[status] !== "value" && "✓"}
                    </button>
                    <button 
                      onClick={() => { setColumnSorts({ ...columnSorts, [status]: "value" }); setOpenMenuStatus(null); }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${columnSorts[status] === "value" ? "bg-[var(--accent)]/10 text-[var(--accent)]" : "text-[var(--text-dim)] hover:bg-white/5"}`}
                    >
                      Por Valor (R$) {columnSorts[status] === "value" && "✓"}
                    </button>

                    <div className="px-3 py-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest border-b border-white/5 my-1">Ações</div>
                    <button onClick={() => toggleColumnItems(status, true)} className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-[var(--text-dim)] hover:bg-white/5 transition-all">Expandir Todos</button>
                    <button onClick={() => toggleColumnItems(status, false)} className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-[var(--text-dim)] hover:bg-white/5 transition-all">Colapsar Todos</button>
                    <button onClick={() => exportColumn(status)} className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all border-t border-white/5 mt-1">Baixar CSV (.xlsx)</button>
                  </div>
                )}
              </div>

              {/* Lista de Cards na Coluna */}
              <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-4 pb-10">
                {groupedObras[status]?.length === 0 ? (
                  <div className="border-2 border-dashed border-white/5 rounded-2xl h-32 flex items-center justify-center text-[var(--text-muted)] text-xs italic">
                    Nenhuma obra
                  </div>
                ) : (
                  groupedObras[status].map(obra => {
                    const percTotal = (obra.realizadoBRL / obra.outlookBRL) * 100;
                    const isExpanded = isGlobalCollapsed ? expandedIds.has(obra.id) : !expandedIds.has(obra.id);
                    
                    return (
                      <div 
                        key={obra.id} 
                        className={`bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-card)] rounded-2xl p-5 shadow-lg hover:shadow-2xl hover:border-[var(--accent)]/30 transition-all group cursor-pointer animate-fade-in ${!isExpanded ? "opacity-90" : ""}`}
                        onClick={(e) => toggleCard(obra.id, e)}
                      >
                        {/* Topo do Card */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xl font-black text-[var(--text-main)] leading-none">#{obra.id}</span>
                              <button 
                                onClick={(e) => toggleCard(obra.id, e)}
                                className={`p-1 hover:bg-white/10 rounded transition-all ${isExpanded ? "rotate-180" : ""}`}
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="6 9 12 15 18 9"/></svg>
                              </button>
                            </div>
                            <div className="text-[13px] font-bold text-[var(--text-dim)] group-hover:text-[var(--accent)] transition-colors line-clamp-1">
                              {obra.embarcacao_nome}
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-[#00A3AD]/10 flex items-center justify-center text-[#00A3AD] shrink-0">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 10V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4M2 10v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V10M2 10l10 4 10-4"/></svg>
                          </div>
                        </div>

                        {/* Datas e Duração (Sempre Visível) */}
                        <div className="flex items-center gap-4 mb-4 text-[var(--text-muted)]">
                          <div className="flex items-center gap-1.5 text-[11px] font-medium">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            {formatDateBR(obra.inicio)}
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] font-black text-[var(--text-dim)] bg-white/5 px-2 py-0.5 rounded-md">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            {obra.duracaoTotal} d
                          </div>
                        </div>

                        {/* Tags/Tipos de Obra (Sempre Visível) */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {obra.tags.map(t => (
                            <span 
                              key={t.tag} 
                              title={t.descricao}
                              className="px-1.5 py-0.5 text-[9px] font-black rounded-md shadow-sm"
                              style={{ backgroundColor: t.cor, color: "#000" }}
                            >
                              {t.tag}
                            </span>
                          ))}
                        </div>

                        {/* Conteúdo Expansível (Financeiro e Operacional) */}
                        {isExpanded && (
                          <div className="animate-[slideDown_0.3s_ease-out] overflow-hidden pt-1 border-t border-white/5">
                            {/* Financeiro: Barra de Progresso */}
                            <div className="space-y-2 mb-5 mt-4">
                              <div className="flex justify-between items-end">
                                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">Realizado / Outlook</span>
                                <span className="text-[11px] font-black text-[var(--accent)]">{percTotal.toFixed(0)}%</span>
                              </div>
                              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                                <div 
                                  className="h-full bg-gradient-to-r from-[#00A3AD] to-[var(--accent)] rounded-full shadow-[0_0_10px_rgba(56,189,248,0.3)] transition-all duration-1000"
                                  style={{ width: `${percTotal}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-[11px] font-mono font-bold">
                                <span className="text-[var(--text-main)]">R$ {obra.realizadoBRL.toFixed(1)}M</span>
                                <span className="text-[var(--text-muted)]">R$ {obra.outlookBRL.toFixed(1)}M</span>
                              </div>
                            </div>

                            {/* Operação: Grid EM/CO/ES/NC */}
                            <div className="bg-black/10 rounded-xl p-3 grid grid-cols-4 gap-2 border border-white/5">
                              {[
                                { label: "EM", val: obra.percEM },
                                { label: "CO", val: obra.percCO },
                                { label: "ES", val: obra.percES },
                                { label: "NC", val: obra.percNC }
                              ].map(stat => (
                                <div key={stat.label} className="text-center">
                                  <div className="text-[9px] font-black text-[var(--text-muted)] mb-1">{stat.label}</div>
                                  <div className="text-[11px] font-bold text-[var(--text-main)]">{stat.val}%</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinancialObrasCards;
