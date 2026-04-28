import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
//import { IBffResponse } from "@hub/shared";

// Controle de erro para todos os componentes se comunicarem com BFF
export function useBff<T = any>(url: string, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const { instance, accounts } = useMsal();

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      // No bypass mode, accounts might be empty. 
      // We check if we have accounts to get a token, otherwise we try without it (for development/bypass)
      const hasAccount = accounts.length > 0;

      try {
        setLoading(true);
        setErr(null);

        let headers: Record<string, string> = {
          "Content-Type": "application/json"
        };

        if (hasAccount) {
          const scope = process.env.REACT_APP_AZURE_SCOPE;
          if (scope) {
            const tokenResponse = await instance.acquireTokenSilent({
              scopes: [scope],
              account: accounts[0]
            });
            headers["Authorization"] = `Bearer ${tokenResponse.accessToken}`;
          }
        }

        const baseUrl = process.env.REACT_APP_BFF_URL || "";
        const finalUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;

        const res = await fetch(finalUrl, {
          signal: controller.signal,
          headers
        });

        if (res.status === 401) throw new Error("Não autorizado. Faça login novamente.");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        setData(json);
      } catch (e: any) {
        if (e.name !== "AbortError") {
          setErr(e.message || "Erro ao carregar");
        }
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, accounts, fetchTrigger]);

  const refetch = () => {
    // Para simplificar o refetch, podemos apenas mudar um estado interno ou chamar o load se ele for acessível.
    // Como o load está dentro do useEffect, vamos usar um trigger de estado.
    setFetchTrigger(prev => prev + 1);
  };

  return { data, loading, err, refetch };
}

