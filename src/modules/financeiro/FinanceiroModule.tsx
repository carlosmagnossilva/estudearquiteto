import React, { useState } from "react";
import FinancialIndicadores from "./components/FinancialIndicadores";
import FinancialObrasGrid from "./components/FinancialObrasGrid";
import PPUManager from "./components/PPUManager";

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

  return (
    <div className="flex-1 flex flex-col min-h-0 animate-fade-in h-full">
      {/* Tab Selector Interno do Módulo */}
      <div className="px-6 py-0 flex flex-col sm:flex-row gap-4 items-center justify-between bg-transparent border-b border-[var(--border-card)] shrink-0 z-20">
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
           <button className="flex-1 sm:flex-none px-6 py-2 bg-white/5 hover:bg-white/10 border border-[var(--border-mini)] rounded-xl text-xs font-black text-[var(--text-main)] transition-all whitespace-nowrap shadow-sm">
             PDF
           </button>
           <button className="flex-1 sm:flex-none px-6 py-2 bg-[var(--accent)] hover:brightness-110 rounded-xl text-xs font-black text-black transition-all shadow-[0_4px_15px_rgba(56,189,248,0.2)] whitespace-nowrap">
             Excel
           </button>
        </div>
      </div>

      {/* Área de Conteúdo da Tab */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {activeTab === "obras" && <FinancialObrasGrid />}
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
