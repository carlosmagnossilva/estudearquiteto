import { useState } from "react";
import { useMsal } from "@azure/msal-react";

export default function PublishSgoPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string; data?: any } | null>(null);
  const { instance, accounts } = useMsal();

  async function onPublish(customPayload?: any) {
    if (accounts.length === 0) return;
    setLoading(true);
    setStatus(null);

    try {
      const tokenResponse = await instance.acquireTokenSilent({
        scopes: [process.env.REACT_APP_AZURE_SCOPE as string],
        account: accounts[0]
      });

      const baseUrl = process.env.REACT_APP_BFF_URL || "";
      const resp = await fetch(`${baseUrl}/bff/paradas/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenResponse.accessToken}`,
        },
        body: customPayload ? JSON.stringify({ payload: customPayload }) : undefined
      });
      
      const json = await resp.json();

      if (!resp.ok || !json.ok) {
        throw new Error(json.error || `HTTP ${resp.status}`);
      }

      setStatus({
        ok: true,
        message: customPayload ? "Carga CUSTOMIZADA publicada com sucesso." : "Carga REAL publicada com sucesso.",
        data: json
      });
    } catch (e: any) {
      setStatus({ ok: false, message: e.message || "Erro desconhecido" });
    } finally {
      setLoading(false);
    }
  }

  async function onPublishProtheus() {
    if (accounts.length === 0) return;
    setLoading(true);
    setStatus(null);

    try {
      const tokenResponse = await instance.acquireTokenSilent({
        scopes: [process.env.REACT_APP_AZURE_SCOPE as string],
        account: accounts[0]
      });

      // Payload mockado para simular o Protheus
      const payload = [
        { parada_id: 501, realizado_brl_m: 88.5, outlook_brl_m: 90.0, re_perc: 98, em_perc: 80, co_perc: 70, es_perc: 95, nc_perc: 50 },
        { parada_id: 502, realizado_brl_m: 25.4, outlook_brl_m: 28.1, re_perc: 90, em_perc: 75, co_perc: 65, es_perc: 85, nc_perc: 40 }
      ];

      const baseUrl = process.env.REACT_APP_BFF_URL || "";
      const resp = await fetch(`${baseUrl}/bff/protheus/publish`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenResponse.accessToken}`,
        },
        body: JSON.stringify({ payload })
      });
      
      const json = await resp.json();

      if (!resp.ok || !json.ok) {
        throw new Error(json.error || `HTTP ${resp.status}`);
      }

      setStatus({
        ok: true,
        message: "Carga Financeira (Protheus) publicada com sucesso.",
        data: json
      });
    } catch (e: any) {
      setStatus({ ok: false, message: e.message || "Erro desconhecido" });
    } finally {
      setLoading(false);
    }
  }

  const triggerCustom = () => {
    // Simulação do payload técnico do SGO (incluindo tags para Tipo de Obra)
    // Usando códigos reais encontrados no banco (ex: 100, 101, 102, 301)
    const payload = [
      { parada_id: 501, embarcacao_id: 1, fel_codigo: "FEL-3", condicao: "Seco", inicio_rp: "2026-05-01", termino_rp: "2026-08-15", dur_rp: 106, tipo_obra: ["102", "103", "105"] },
      { parada_id: 502, embarcacao_id: 2, fel_codigo: "FEL-4", condicao: "Molhado", inicio_rp: "2026-06-10", termino_rp: "2026-07-10", dur_rp: 30, tipo_obra: ["100", "101", "102"] },
      { parada_id: 503, embarcacao_id: 3, fel_codigo: "FEL-2", condicao: "Molhado", inicio_rp: "2026-09-01", termino_rp: "2026-09-20", dur_rp: 20, tipo_obra: ["301"] }
    ];
    onPublish(payload);
  };

  return (
    <div className="flex-1 w-full relative lg:overflow-hidden flex flex-col h-full min-h-0 animate-fade-in text-[var(--text-main)]">
      <div className="flex-1 overflow-y-auto p-6 md:p-12 max-w-4xl mx-auto w-full">
        <h2 className="text-[28px] font-bold text-white mb-2">Setup / Integrações</h2>
        <p className="text-[var(--text-dim)] mb-8 text-[15px]">
          Simulação de Carga do Sistema SGO para o Hub-Integrator via Azure Service Bus.
        </p>

        <div className="bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-card)] p-8 rounded-3xl shadow-2xl flex flex-col items-center justify-center min-h-[350px]">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-6 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-blue-400">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
              <path d="M18 12h-4" />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-white mb-3">Sincronização SGO</h3>
          <p className="text-center text-[var(--text-dim)] max-w-md mb-8 text-[14px]">
            Este processo captura o estado simulado das obras e o publica na fila de integração. O Hub-Integrator consumirá essa fila para atualizar o banco de dados.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <button
              type="button"
              onClick={() => onPublish()}
              disabled={loading}
              className="px-8 py-3.5 rounded-xl font-bold text-[13px] bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all uppercase tracking-widest flex items-center gap-3"
            >
              Publicar Real
            </button>
            <button
              type="button"
              onClick={triggerCustom}
              disabled={loading}
              className="px-8 py-3.5 rounded-xl font-bold text-[13px] bg-[var(--accent)] text-black hover:brightness-110 transition-all uppercase tracking-widest flex items-center gap-3 shadow-[0_0_20px_rgba(56,189,248,0.3)]"
            >
              Simular Carga SGO (Apenas Técnico)
            </button>
          </div>
        </div>

        <div className="bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border-card)] p-8 rounded-3xl shadow-2xl flex flex-col items-center justify-center min-h-[350px] mt-8">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20 mb-6 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-green-400">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <circle cx="12" cy="12" r="2" />
              <path d="M6 12h.01M18 12h.01" />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-white mb-3">Sincronização Protheus</h3>
          <p className="text-center text-[var(--text-dim)] max-w-md mb-8 text-[14px]">
            Este processo publica na fila os dados financeiros vinculados às paradas. O Integrator combinará esses dados aos técnicos via COALESCE.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <button
              type="button"
              onClick={onPublishProtheus}
              disabled={loading}
              className="px-8 py-3.5 rounded-xl font-bold text-[13px] bg-green-500 text-black hover:brightness-110 transition-all uppercase tracking-widest flex items-center gap-3 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
            >
              Simular Carga Protheus
            </button>
          </div>
        </div>

        {status && (
          <div className={`mt-6 p-6 rounded-2xl border backdrop-blur-xl animate-fade-in ${status.ok ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}>
            <div className="flex items-center gap-3 mb-3">
              {status.ok ? (
                <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3 text-green-400"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3 text-red-400"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </div>
              )}
              <h4 className={`font-bold ${status.ok ? "text-green-400" : "text-red-400"}`}>{status.message}</h4>
            </div>
            {status.ok && status.data && (
              <pre className="bg-black/30 p-4 rounded-xl text-[12px] text-white/70 overflow-x-auto border border-black/50">
                {JSON.stringify(status.data, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
