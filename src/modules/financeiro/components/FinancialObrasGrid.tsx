import React from "react";
import { useBff } from "../../../hooks/useBff";
import { useDragScroll } from "../../../hooks/useDragScroll";
import { IBffResponse } from "@hub/shared";

// Definição local para garantir que a propriedade 'cor' seja reconhecida imediatamente
interface ITag {
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

const FinancialObrasGrid: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("Todos os Status");
  const [typeFilter, setTypeFilter] = React.useState("Todos os Tipos");
  const { data, loading } = useBff<IBffResponse<IFinanceiroObraLocal>>("/bff/financeiro/obras");
  const dragScroll = useDragScroll();

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

  if (loading) return (
    <div className="flex-1 flex items-center justify-center text-[var(--text-dim)] animate-pulse">
      Carregando obras financeiras...
    </div>
  );

  // Fallback para dados locais se o BFF não retornar itens (baseado na extração do Figma)
  const obras: IFinanceiroObraLocal[] = data?.items && data.items.length > 0 ? data.items : [
    { id: 24, id_parada: 24, embarcacao_nome: "A. Abrolhos", statusFinanceiro: "FEL-3", tags: [{tag: "100", descricao: "Mobilização Contratual", cor: "#FFC000"}, {tag: "101", descricao: "Parada Especial", cor: "#00B0F0"}], realizadoBRL: 38.0, outlookBRL: 38.0, percRE: 100, percEM: 1, percCO: 5, percES: 3, percNC: 90, condicao: "Seco", inicio: "2024-12-02", termino: "2025-02-26", duracaoTotal: 96, dataUltimaAtualizacao: "" },
    { id: 25, id_parada: 25, embarcacao_nome: "R. São Paulo", statusFinanceiro: "FECH", tags: [{tag: "101", descricao: "Parada Especial", cor: "#00B0F0"}], realizadoBRL: 8.3, outlookBRL: 11.8, percRE: 70, percEM: 8, percCO: 2, percES: 0, percNC: 89, condicao: "Molhado", inicio: "2025-03-07", termino: "2025-04-07", duracaoTotal: 31, dataUltimaAtualizacao: "" },
    { id: 36, id_parada: 36, embarcacao_nome: "I. Mosqueiro", statusFinanceiro: "FECH", tags: [{tag: "301", descricao: "Parada Emergencial", cor: "#999999"}], realizadoBRL: 22.1, outlookBRL: 22.1, percRE: 100, percEM: 1, percCO: 0, percES: 81, percNC: 18, condicao: "Seco", inicio: "2025-03-15", termino: "2025-06-15", duracaoTotal: 92, dataUltimaAtualizacao: "" },
    { id: 33, id_parada: 33, embarcacao_nome: "P. Meros", statusFinanceiro: "EXEC", tags: [{tag: "100", descricao: "Mobilização Contratual", cor: "#FFC000"}, {tag: "101", descricao: "Parada Especial", cor: "#00B0F0"}, {tag: "103", descricao: "Parada Programada", cor: "#2D7DCE"}], realizadoBRL: 5.6, outlookBRL: 29.3, percRE: 19, percEM: 18, percCO: 49, percES: 22, percNC: 11, condicao: "Seco", inicio: "2026-01-21", termino: "2026-04-11", duracaoTotal: 80, dataUltimaAtualizacao: "" },
    { id: 37, id_parada: 37, embarcacao_nome: "P. Badejo", statusFinanceiro: "FEL-4", tags: [{tag: "101", descricao: "Parada Especial", cor: "#00B0F0"}], realizadoBRL: 10.6, outlookBRL: 16.2, percRE: 65, percEM: 32, percCO: 5, percES: 50, percNC: 13, condicao: "Molhado", inicio: "2025-10-30", termino: "2025-12-10", duracaoTotal: 41, dataUltimaAtualizacao: "" }
  ];

  const filteredObras = obras.filter(obra => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = obra.id.toString().includes(term) || 
                         obra.embarcacao_nome.toLowerCase().includes(term);
    
    const matchesStatus = statusFilter === "Todos os Status" || 
                         obra.statusFinanceiro === statusFilter;

    const matchesType = typeFilter === "Todos os Tipos" || 
                       obra.tags.some(t => `${t.tag} - ${t.descricao}` === typeFilter);

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-transparent">
      {/* 🛠️ Barra de Ferramentas / Filtros */}
      <div className="px-6 py-4 flex flex-col lg:flex-row gap-4 items-center justify-between bg-[var(--bg-card)] backdrop-blur-xl border-b border-[var(--border-card)] shrink-0 z-20">
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
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
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
              <option className="bg-[var(--sidebar-bg)]">FEL-1</option>
              <option className="bg-[var(--sidebar-bg)]">FEL-2</option>
              <option className="bg-[var(--sidebar-bg)]">FEL-3</option>
              <option className="bg-[var(--sidebar-bg)]">FEL-4</option>
              <option className="bg-[var(--sidebar-bg)]">EXEC</option>
              <option className="bg-[var(--sidebar-bg)]">FECH</option>
            </select>
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-white/5 border border-[var(--border-mini)] rounded-xl px-4 py-2 text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 min-w-[220px] transition-all cursor-pointer"
            >
              <option className="bg-[var(--sidebar-bg)]">Todos os Tipos</option>
              <option className="bg-[var(--sidebar-bg)]">100 - Mobilização Contratual</option>
              <option className="bg-[var(--sidebar-bg)]">101 - Parada Especial</option>
              <option className="bg-[var(--sidebar-bg)]">102 - Parada Intermediária</option>
              <option className="bg-[var(--sidebar-bg)]">103 - Parada Programada</option>
              <option className="bg-[var(--sidebar-bg)]">301 - Parada Emergencial</option>
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
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm whitespace-nowrap ${
                    row.statusFinanceiro === 'EXEC' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 
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
                <td className="px-6 py-5 text-[13px] text-[var(--text-muted)] group-hover:text-[var(--text-dim)] transition-colors font-mono">{formatDateBR(row.inicio)}</td>
                <td className="px-6 py-5 text-[13px] text-[var(--text-muted)] group-hover:text-[var(--text-dim)] transition-colors font-mono">{formatDateBR(row.termino)}</td>
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
