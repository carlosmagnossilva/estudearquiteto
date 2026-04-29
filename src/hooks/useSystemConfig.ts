import { useState } from "react";
import { useBff } from "./useBff";
import { useMsal } from "@azure/msal-react";

export function useSystemConfig(chave: string) {
  const { data, loading, err, refetch } = useBff<{ valor: string }>(`/bff/config/${chave}`, []);
  const [saving, setSaving] = useState(false);
  const { instance, accounts } = useMsal();

  const saveConfig = async (valor: string) => {
    setSaving(true);
    try {
      let headers: Record<string, string> = { "Content-Type": "application/json" };
      
      if (accounts.length > 0) {
        const scope = process.env.REACT_APP_AZURE_SCOPE;
        const tokenResponse = await instance.acquireTokenSilent({
          scopes: [scope as string],
          account: accounts[0]
        });
        headers["Authorization"] = `Bearer ${tokenResponse.accessToken}`;
      }

      const baseUrl = process.env.REACT_APP_BFF_URL || "";
      const url = `${baseUrl}/bff/config`;

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify({ chave, valor })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const result = await res.json();
      
      if (result.ok) {
        refetch();
        return { success: true };
      }
      throw new Error(result.error || "Erro ao salvar");
    } catch (e: any) {
      return { success: false, error: e.message };
    } finally {
      setSaving(false);
    }
  };

  return { valor: data?.valor, loading, err, saving, saveConfig };
}
