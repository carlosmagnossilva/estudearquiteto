import React, { useState, useMemo } from "react";
import FinancialIndicadores from "./components/FinancialIndicadores";
import FinancialObrasGrid, { IFinanceiroObraLocal, ITag } from "../obras/components/FinancialObrasGrid";
import PPUManager from "./components/PPUManager";
import { useBff } from "../../hooks/useBff";
import { IBffResponse } from "@hub/shared";
import { FINANCIAL_STATUSES } from "./constants/financialConstants";
import { OBRAS_MOCK as FINANCIAL_OBRAS_MOCK } from "../obras/mocks/obrasMocks";

const TABS = [
  { id: "obras", label: "Obras" },
  { id: "estaleiros_ppus", label: "Estaleiros e PPUs" },
  { id: "empresas", label: "Empresas" },
  { id: "templates", label: "Templates" },
  { id: "projecoes", label: "Projeções" },
  { id: "indicadores", label: "Indicadores" },
] as const;

type TabId = typeof TABS[number]["id"];

const FinanceiroModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("obras");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos os Status");
  const [typeFilter, setTypeFilter] = useState("Todos os Tipos");
  
  const { data, loading } = useBff<IBffResponse<IFinanceiroObraLocal>>("/bff/financeiro/obras");

  const obras = useMemo(() => {
    if (!data?.items || data.items.length === 0) {
      return FINANCIAL_OBRAS_MOCK;
    }
    return data.items;
  }, [data]);

  const filteredObras = useMemo(() => {
    return obras.filter(obra => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = obra.id.toString().includes(term) ||
        obra.embarcacao_nome.toLowerCase().includes(term);

      const matchesStatus = statusFilter === "Todos os Status" ||
        obra.statusFinanceiro === statusFilter;

      const matchesType = typeFilter === "Todos os Tipos" ||
        obra.tags.some((t: ITag) => `${t.tag} - ${t.descricao}` === typeFilter);

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [obras, searchTerm, statusFilter, typeFilter]);

  const exportToExcel = () => {
    // Escape helper to prevent CSV injection or breaking on commas
    const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;

    const headers = ["ID", "Embarcação", "Status", "Condição", "Realizado BRL", "Outlook BRL", "RE%", "EM%", "CO%", "ES%", "NC%", "Início", "Término", "Duração"];
    const rows = filteredObras.map(o => [
      o.id, o.embarcacao_nome, o.statusFinanceiro, o.condicao, 
      o.realizadoBRL, o.outlookBRL, o.percRE, o.percEM, o.percCO, o.percES, o.percNC, 
      o.inicio, o.termino, o.duracaoTotal
    ]);

    const csvContent = [headers, ...rows].map(row => row.map(esc).join(",")).join("\n");
    
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", `relatorio_financeiro_${new Date().toISOString().split("T")[0]}.csv`);
    a.click();
  };

  const exportToPDF = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 animate-fade-in h-full">
      {/* 📄 Cabeçalho exclusivo para Impressão (PDF) */}
      <div className="hidden print:block mb-8 border-b-2 border-black pb-4">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black text-black uppercase tracking-tighter">Relatório de Obras - Financeiro</h1>
            <p className="text-sm text-gray-600 font-bold">Hub de Obras | Gestão de Capex</p>
          </div>
          <div className="text-right text-xs text-gray-500 font-mono">
            Gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
          </div>
        </div>
      </div>

      {/* Tab Selector Interno do Módulo */}
      <div className="px-6 py-0 flex flex-col sm:flex-row gap-4 items-center justify-between bg-transparent border-b border-[var(--border-card)] shrink-0 z-20 no-print">
        <div className="flex gap-8 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 text-sm font-bold transition-all relative shrink-0 ${
                activeTab === tab.id ? "text-[var(--text-main)]" : "text-[var(--text-dim)] hover:text-[var(--text-main)]"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--accent)] rounded-t-full shadow-[0_0_15px_rgba(56,189,248,0.5)]"></div>
              )}
            </button>
          ))}
        </div>
        <div className="flex gap-3 w-full sm:w-auto justify-end py-2">
           <button 
             onClick={exportToPDF}
             className="flex-1 sm:flex-none px-6 py-2 bg-white/5 hover:bg-white/10 border border-[var(--border-mini)] rounded-xl text-xs font-black text-[var(--text-main)] transition-all whitespace-nowrap shadow-sm"
           >
             PDF
           </button>
           <button 
             onClick={exportToExcel}
             className="flex-1 sm:flex-none px-6 py-2 bg-[var(--accent)] hover:brightness-110 rounded-xl text-xs font-black text-black transition-all shadow-[0_4px_15px_rgba(56,189,248,0.2)] whitespace-nowrap"
           >
             Excel
           </button>
        </div>
      </div>

      {/* Área de Conteúdo da Tab */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {activeTab === "obras" && (
          <FinancialObrasGrid 
            filteredObras={filteredObras}
            loading={loading}
            filters={{
              searchTerm, setSearchTerm,
              statusFilter, setStatusFilter,
              typeFilter, setTypeFilter
            }}
          />
        )}
        {activeTab === "indicadores" && <FinancialIndicadores />}
        {activeTab === "estaleiros_ppus" && <PPUManager />}
        {(activeTab === "empresas" || activeTab === "templates" || activeTab === "projecoes") && (
          <div className="flex-1 flex items-center justify-center text-[var(--text-muted)] italic">
            Módulo {TABS.find(t => t.id === activeTab)?.label} em desenvolvimento...
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceiroModule;

