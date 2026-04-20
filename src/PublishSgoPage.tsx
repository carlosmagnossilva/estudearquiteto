import { useState } from "react";
import { useMsal } from "@azure/msal-react";

export default function PublishSgoPage() {
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string; data?: any } | null>(null);
  const { instance, accounts } = useMsal();

  async function onPublish() {
    if (accounts.length === 0) return;
    setLoading(true);
    setStatus(null);

    try {
      const tokenResponse = await instance.acquireTokenSilent({
        scopes: [process.env.REACT_APP_AZURE_SCOPE as string],
        account: accounts[0]
      });

      const resp = await fetch("/bff/paradas/publish", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenResponse.accessToken}`,
        },
      });
      const json = await resp.json();

      if (!resp.ok || !json.ok) {
        throw new Error(json.error || `HTTP ${resp.status}`);
      }

      setStatus({
        ok: true,
        message: "Publicado com sucesso na fila SGO.",
        data: json
      });
    } catch (e: any) {
      setStatus({ ok: false, message: e.message || "Erro desconhecido" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ marginTop: 0 }}>Publicar paradas na fila SGO</h2>

      <p style={{ maxWidth: 700 }}>
        Este botão chama o BFF para publicar o snapshot atual de <code>/bff/paradas</code> na fila
        configurada como SGO no Azure Service Bus.
      </p>

      <button
        type="button"
        onClick={onPublish}
        disabled={loading}
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          border: 0,
          cursor: loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Publicando..." : "Publicar agora"}
      </button>

      {status && (
        <div
          style={{
            marginTop: 14,
            padding: 12,
            borderRadius: 10,
            border: "1px solid #CFE1E9",
            background: status.ok ? "#F0FDF4" : "#FEF2F2"
          }}
        >
          <div style={{ fontWeight: 800 }}>{status.message}</div>
          {status.ok && (
            <pre style={{ margin: "8px 0 0", whiteSpace: "pre-wrap" }}>
              {JSON.stringify(status.data, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
