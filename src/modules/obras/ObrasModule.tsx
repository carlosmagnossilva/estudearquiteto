import React, { useState, useMemo } from "react";
import ObrasGrid from "./components/ObrasGrid";
import SobreObra from "./components/SobreObra";
import ObraDashboard from "./components/ObraDashboard";
import { useBff } from "../../hooks/useBff";
import { IBffResponse } from "@hub/shared";

const TABS = [
  { id: "indicadores", label: "Indicadores" },
  { id: "detalhamento", label: "Detalhamento" },
] as const;

type TabId = typeof TABS[number]["id"];

const ObrasModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("detalhamento");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos os Status");
  const [typeFilter, setTypeFilter] = useState("Todos os Tipos");
  const [selectedObraId, setSelectedObraId] = useState<number | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState("Visão geral");

  const { data, loading } = useBff<IBffResponse<any>>("/bff/financeiro/obras");

  const obras = useMemo(() => {
    return data?.items || [];
  }, [data]);

  const filteredObras = useMemo(() => {
    return obras.filter(obra => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = obra.id.toString().includes(term) ||
        obra.embarcacao_nome.toLowerCase().includes(term);

      const matchesStatus = statusFilter === "Todos os Status" ||
        obra.statusFinanceiro === statusFilter;

      const matchesType = typeFilter === "Todos os Tipos" ||
        obra.tags.some((t: any) => `${t.tag} - ${t.descricao}` === typeFilter);

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [obras, searchTerm, statusFilter, typeFilter]);

  if (selectedObraId) {
    return (
      <div className="flex-1 flex flex-col min-h-0 h-full relative">
        {/* Header de Detalhes da Obra (Estilo Modal no Prototipo, mas aqui como sub-página) */}
        <div className="px-6 py-4 border-b border-[var(--border-card)] flex justify-between items-center bg-[var(--bg-card)]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedObraId(null)}
              className="p-2 hover:bg-white/5 rounded-lg transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            </button>
            <div>
              <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Detalhes da Obra</div>
              <h2 className="text-xl font-black text-[var(--text-main)] flex items-center gap-3">
                {selectedObraId} <span className="text-[var(--accent)]">{obras.find(o => o.id === selectedObraId)?.embarcacao_nome}</span>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase">
                  {obras.find(o => o.id === selectedObraId)?.statusFinanceiro}
                </span>
              </h2>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-white/5 rounded-lg text-[var(--text-muted)]"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg></button>
            <button onClick={() => setSelectedObraId(null)} className="p-2 hover:bg-white/5 rounded-lg text-[var(--text-muted)]"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg></button>
          </div>
        </div>

        <div className="px-6 flex gap-8 border-b border-[var(--border-card)] bg-[var(--bg-card)]">
          {["Visão geral", "Entregas", "Serviços", "Materiais", "Facilidades", "GMUDs", "Log de Alterações", "Fatos Relevantes", "Sobre a Obra"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveDetailTab(tab)}
              className={`py-4 text-xs font-bold transition-all relative ${activeDetailTab === tab ? "text-[var(--text-main)]" : "text-[var(--text-dim)] hover:text-[var(--text-main)]"}`}
            >
              {tab}
              {activeDetailTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--accent)] rounded-t-full"></div>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-6">
          {activeDetailTab === "Visão geral" && (
            <ObraDashboard idObra={selectedObraId} />
          )}
          {activeDetailTab === "Sobre a Obra" && <SobreObra obraId={selectedObraId} />}
          {activeDetailTab !== "Visão geral" && activeDetailTab !== "Sobre a Obra" && (
            <div className="flex-1 flex items-center justify-center text-[var(--text-muted)] italic p-20">
              Módulo {activeDetailTab} em desenvolvimento...
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 animate-fade-in h-full">
      <div className="px-6 py-4 border-b border-[var(--border-card)] bg-[var(--bg-card)] shrink-0">
        <div className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Módulo Obras</div>
        <h1 className="text-xl font-black text-[var(--text-main)]">Painel de Obras</h1>
      </div>

      <div className="px-6 py-0 flex gap-8 border-b border-[var(--border-card)] shrink-0 z-20">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 py-4 text-sm font-bold transition-all relative shrink-0 ${activeTab === tab.id ? "text-[var(--text-main)]" : "text-[var(--text-dim)] hover:text-[var(--text-main)]"
              }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--accent)] rounded-t-full shadow-[0_0_15px_rgba(56,189,248,0.5)]"></div>
            )}
          </button>
        ))}
      </div>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {activeTab === "detalhamento" && (
            <div className="flex-1 flex flex-col overflow-hidden" onClick={(e) => {
              const row = (e.target as HTMLElement).closest("tr");
              if (row) {
                const idCell = row.querySelector("td");
                if (idCell) {
                  const id = parseInt(idCell.textContent || "0");
                  if (id) setSelectedObraId(id);
                }
              }
            }}>
              <ObrasGrid
                filteredObras={filteredObras.map(o => ({
                  ...o,
                  cp_fisico: o.obra?.serPerc || 0, 
                  local_estaleiro: o.local_estaleiro || o.condicao
                }))}
                loading={loading}
                filters={{
                  searchTerm, setSearchTerm,
                  statusFilter, setStatusFilter,
                  typeFilter, setTypeFilter
                }}
              />
            </div>
          )}
        {activeTab === "indicadores" && (
          <div className="flex-1 flex items-center justify-center text-[var(--text-muted)] italic">
            Indicadores de Obras em desenvolvimento...
          </div>
        )}
      </div>
    </div>
  );
};

export default ObrasModule;
