import React, { useState } from "react";
import { useMsal } from "@azure/msal-react";

interface SimulationResult {
  id: string;
  type: string;
  timestamp: string;
  status: "success" | "error" | "pending";
  message: string;
  payload?: any;
}

export default function IntegrationSimulationsPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<SimulationResult[]>([]);
  const { instance, accounts } = useMsal();

  const SIMULATION_TYPES = [
    { id: "snapshot_paradas", label: "Snapshot de Paradas (SGO)", desc: "Envia o estado atual das paradas para o Service Bus.", endpoint: "/bff/paradas/publish" },
    { id: "sync_sap", label: "Sincronização SAP (Mock)", desc: "Simula o recebimento de ordens de manutenção via integração SAP.", endpoint: "#" },
    { id: "webhook_teams", label: "Notificação Teams", desc: "Simula o disparo de alertas críticos para canais do Microsoft Teams.", endpoint: "#" },
    { id: "bi_export", label: "Exportação Power BI", desc: "Força a atualização do dataset analítico no Power BI Service.", endpoint: "#" }
  ];

  async function runSimulation(typeId: string, endpoint: string) {
    if (endpoint === "#") {
       const newResult: SimulationResult = {
         id: Math.random().toString(36).substr(2, 9),
         type: typeId,
         timestamp: new Date().toLocaleTimeString(),
         status: "success",
         message: "Simulação de mock executada com sucesso (Ambiente Sandbox)."
       };
       setResults([newResult, ...results]);
       return;
    }

    setLoading(typeId);
    try {
      let headers: Record<string, string> = { "Content-Type": "application/json" };
      
      if (accounts.length > 0) {
        const tokenResponse = await instance.acquireTokenSilent({
          scopes: [process.env.REACT_APP_AZURE_SCOPE as string],
          account: accounts[0]
        });
        headers["Authorization"] = `Bearer ${tokenResponse.accessToken}`;
      }

      const resp = await fetch(endpoint, { method: "POST", headers });
      const json = await resp.json();

      const newResult: SimulationResult = {
        id: Math.random().toString(36).substr(2, 9),
        type: typeId,
        timestamp: new Date().toLocaleTimeString(),
        status: resp.ok ? "success" : "error",
        message: resp.ok ? "Integração disparada com sucesso." : (json.error || "Erro na integração"),
        payload: json
      };
      setResults([newResult, ...results]);
    } catch (e: any) {
      setResults([{
        id: Math.random().toString(36).substr(2, 9),
        type: typeId,
        timestamp: new Date().toLocaleTimeString(),
        status: "error",
        message: e.message || "Falha na conexão com o BFF"
      }, ...results]);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Painel de Simulações</h2>
            <p className="text-white/50">Teste e monitore fluxos de integração entre o Hub de Obras e sistemas externos.</p>
          </div>
          <div className="flex gap-2">
             <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/20">Service Bus: Ativo</span>
             <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold rounded-full border border-blue-500/20">API: Online</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Cards de Ação */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest">Ações Disponíveis</h3>
            {SIMULATION_TYPES.map((sim) => (
              <div key={sim.id} className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all group shadow-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white mb-1">{sim.label}</h4>
                    <p className="text-sm text-white/50 mb-4">{sim.desc}</p>
                    <button
                      onClick={() => runSimulation(sim.id, sim.endpoint)}
                      disabled={loading !== null}
                      className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                        loading === sim.id 
                        ? "bg-white/10 text-white/40 cursor-not-allowed" 
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 active:scale-95"
                      }`}
                    >
                      {loading === sim.id ? (
                        <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> Processando...</>
                      ) : "Executar Fluxo"}
                    </button>
                  </div>
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    {sim.id === 'snapshot_paradas' ? '🚢' : sim.id === 'sync_sap' ? '⚙️' : sim.id === 'webhook_teams' ? '💬' : '📊'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Log de Resultados */}
          <div className="flex flex-col h-full">
             <h3 className="text-sm font-bold text-white/30 uppercase tracking-widest mb-4">Log de Atividades (Realtime)</h3>
             <div className="flex-1 bg-black/20 rounded-3xl border border-white/5 overflow-hidden flex flex-col shadow-2xl">
                <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                   <span className="text-xs text-white/40">{results.length} entradas registradas</span>
                   <button onClick={() => setResults([])} className="text-[10px] text-white/30 hover:text-white uppercase font-bold tracking-tighter">Limpar Log</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                   {results.length === 0 ? (
                     <div className="h-full flex flex-col items-center justify-center text-white/10 italic">
                        <div className="text-4xl mb-2">📜</div>
                        Aguardando execução de fluxos...
                     </div>
                   ) : (
                     results.map((res) => (
                       <div key={res.id} className={`p-4 rounded-xl border animate-fade-in ${
                         res.status === 'success' ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-red-500/5 border-red-500/20'
                       }`}>
                         <div className="flex justify-between items-start mb-2">
                           <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${res.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                              <span className="text-xs font-bold text-white uppercase">{res.type.replace('_', ' ')}</span>
                           </div>
                           <span className="text-[10px] text-white/30 font-mono">{res.timestamp}</span>
                         </div>
                         <p className="text-sm text-white/70 mb-3">{res.message}</p>
                         {res.payload && (
                           <details className="mt-2">
                             <summary className="text-[10px] text-blue-400 font-bold cursor-pointer hover:underline uppercase">Visualizar Payload JSON</summary>
                             <pre className="mt-2 p-3 bg-black/40 rounded-lg text-[10px] text-blue-300 font-mono overflow-x-auto">
                               {JSON.stringify(res.payload, null, 2)}
                             </pre>
                           </details>
                         )}
                       </div>
                     ))
                   )}
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
