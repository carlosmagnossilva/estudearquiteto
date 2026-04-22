import React, { useState } from "react";
import FinancialIndicadores from "./components/FinancialIndicadores";
import FinancialObrasGrid from "./components/FinancialObrasGrid";
import PPUManager from "./components/PPUManager";

const TABS = [
  { id: "indicadores", label: "Indicadores", icon: "📊" },
  { id: "obras", label: "Grid de Obras", icon: "🏗️" },
  { id: "ppus", label: "Gestão de PPUs", icon: "📝" },
] as const;

type TabId = typeof TABS[number]["id"];

const FinanceiroModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("indicadores");

  return (
    <div className="flex-1 flex flex-col min-h-0 animate-fade-in h-full">
      {/* Tab Selector Interno do Módulo */}
      <div className="px-6 py-4 flex items-center justify-between bg-[#0B1F2E]/40 backdrop-blur-md border-b border-white/10 shrink-0">
        <div className="flex gap-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 text-sm font-bold transition-all relative ${
                activeTab === tab.id ? "text-white" : "text-white/40 hover:text-white/70"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute -bottom-4 left-0 right-0 h-1 bg-blue-500 rounded-t-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
              )}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
           <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold text-white transition-all">
             Relatório PDF
           </button>
           <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-bold text-white transition-all shadow-lg shadow-blue-600/20">
             Exportar Excel
           </button>
        </div>
      </div>

      {/* Área de Conteúdo da Tab */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {activeTab === "indicadores" && <FinancialIndicadores />}
        {activeTab === "obras" && <FinancialObrasGrid />}
        {activeTab === "ppus" && <PPUManager />}
      </div>
    </div>
  );
};

export default FinanceiroModule;
