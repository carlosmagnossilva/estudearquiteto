import React, { useState, useEffect } from 'react';

const AdminModule: React.FC = () => {
  const [intervalo, setIntervalo] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const baseUrl = process.env.REACT_APP_BFF_URL || 'http://localhost:4000';

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch(`${baseUrl}/bff/config/INTEGRATOR_INTERVAL_MIN`);
        if (response.ok) {
          const data = await response.json();
          setIntervalo(data.valor || '5');
        }
      } catch (err) {
        console.error("Erro ao carregar config:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, [baseUrl]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);
      const response = await fetch(`${baseUrl}/bff/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chave: 'INTEGRATOR_INTERVAL_MIN', valor: intervalo })
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Configuração salva com sucesso! O Integrador aplicará no próximo ciclo.' });
      } else {
        throw new Error("Falha ao salvar");
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao salvar configuração.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-[var(--text-muted)] italic text-white">Carregando configurações...</div>;

  return (
    <div className="flex-1 p-8 overflow-y-auto animate-fade-in bg-slate-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <div className="text-[10px] font-black text-[var(--accent)] uppercase tracking-[0.2em] mb-2">Administração</div>
          <h1 className="text-3xl font-black text-white tracking-tight">Painel de Controle</h1>
          <p className="text-[var(--text-muted)] mt-2">Gerencie parâmetros globais e comportamentos do sistema.</p>
        </header>

        <div className="grid gap-6">
          {/* Seção Integrador */}
          <section className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-[var(--border-card)] flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                </div>
                <div>
                  <h3 className="font-bold text-white">Job Integrador de Snapshots</h3>
                  <p className="text-xs text-[var(--text-muted)]">Controla a frequência de atualização dos dashboards.</p>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-wider animate-pulse">
                Serviço Ativo
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="max-w-xs">
                <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3">
                  Intervalo de Execução (Minutos)
                </label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={intervalo}
                    onChange={(e) => setIntervalo(e.target.value)}
                    className="flex-1 bg-black/20 border border-[var(--border-card)] rounded-xl px-4 py-3 text-lg font-bold text-white focus:outline-none focus:border-[var(--accent)] transition-all"
                    placeholder="Ex: 5"
                  />
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${saving ? 'bg-gray-500 opacity-50' : 'bg-sky-500 text-white hover:shadow-[0_0_20px_rgba(56,189,248,0.3)]'}`}
                  >
                    {saving ? 'Salvando...' : 'Aplicar'}
                  </button>
                </div>
              </div>

              {message && (
                <div className={`p-4 rounded-xl text-xs font-bold ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {message.text}
                </div>
              )}

              <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                <div className="flex gap-3">
                  <svg className="text-blue-400 shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
                    <strong>Atenção:</strong> O Integrador consome recursos do SQL Azure e do Service Bus. 
                    Valores abaixo de 1 minuto podem gerar custos elevados e lentidão no banco de dados para os usuários finais. 
                    Recomendado: 5 a 15 minutos.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Outras Seções (Placeholders) */}
          <div className="grid grid-cols-2 gap-6 opacity-50 grayscale pointer-events-none">
             <div className="bg-[var(--bg-card)] border border-[var(--border-card)] p-6 rounded-2xl h-32 flex items-center justify-center border-dashed italic text-[var(--text-muted)]">
               Configurações de E-mail (Em breve)
             </div>
             <div className="bg-[var(--bg-card)] border border-[var(--border-card)] p-6 rounded-2xl h-32 flex items-center justify-center border-dashed italic text-[var(--text-muted)]">
               Gestão de Usuários (IAM)
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminModule;
