import React, { useState, useEffect } from "react";
import { useBff } from "../../../hooks/useBff";
import { useMsal } from "@azure/msal-react";
import "./SobreObra.css";

interface SobreObraProps {
  obraId: number;
}

const SobreObra: React.FC<SobreObraProps> = ({ obraId }) => {
  const { data, loading, err, refetch } = useBff(`/bff/obras/${obraId}/sobre`, [obraId]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { instance, accounts } = useMsal();

  useEffect(() => {
    if (data) {
      setFormData({ ...data });
    }
  }, [data]);

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-48 bg-white/5 rounded-2xl" />
        <div className="h-64 bg-white/5 rounded-2xl" />
      </div>
    );
  }

  if (err || !data) {
    return (
      <div className="p-12 text-center text-[var(--text-muted)] italic">
        Não foi possível carregar os detalhes desta obra.
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let headers: Record<string, string> = { "Content-Type": "application/json" };
      if (accounts.length > 0) {
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
      const res = await fetch(`${baseUrl}/bff/obras/${obraId}/sobre`, {
        method: "PUT",
        headers,
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error("Erro ao salvar dados");

      setIsEditing(false);
      refetch();
    } catch (e: any) {
      alert("Erro ao salvar: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  // Cálculo da Duração Total Reativo
  const currentDurObra = parseInt(formData?.duracao_obra_dias || 0);
  const currentDurTestes = parseInt(formData?.duracao_testes_dias || 0);
  const currentDurAceitacao = parseInt(formData?.duracao_aceitacao_dias || 0);
  const currentTotal = currentDurObra + currentDurTestes + currentDurAceitacao;

  return (
    <div className="p-8 space-y-12 animate-fade-in text-[var(--text-main)]">
      
      {/* Botão de Edição Superior Direita */}
      <div className="flex justify-end mb-4">
          <button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={isSaving}
            className="flex items-center gap-2 text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors text-xs font-black uppercase tracking-widest"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
            {isEditing ? (isSaving ? "Salvando..." : "Salvar Alterações") : "Editar campos"}
          </button>
      </div>

      {/* 📅 Seção 1: Datas e Durações */}
      <Accordion title="Datas e Durações">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6 p-4">
          <DetailItem label="Início da Obra" value={formatDate(data.data_inicio_obra)} isEditing={isEditing} field="data_inicio_obra" type="date" formData={formData} setFormData={setFormData} />
          <DetailItem label="Data de término" value={formatDate(data.data_termino_obra)} isEditing={isEditing} field="data_termino_obra" type="date" formData={formData} setFormData={setFormData} />
          <DetailItem label="Término de contrato" value={formatDate(data.data_termino_contrato)} isEditing={isEditing} field="data_termino_contrato" type="date" formData={formData} setFormData={setFormData} />
          <DetailItem label="Ano do orçamento" value={data.ano_orcamento} isEditing={isEditing} field="ano_orcamento" type="number" formData={formData} setFormData={setFormData} />
          <DetailItem label="Duração da obra" value={`${data.duracao_obra_dias || 0} dias`} isEditing={isEditing} field="duracao_obra_dias" type="number" formData={formData} setFormData={setFormData} suffix="dias" />
          <DetailItem label="Duração dos testes" value={`${data.duracao_testes_dias || 0} dias`} isEditing={isEditing} field="duracao_testes_dias" type="number" formData={formData} setFormData={setFormData} suffix="dias" />
          <DetailItem label="Duração da aceitação" value={`${data.duracao_aceitacao_dias || 0} dias`} isEditing={isEditing} field="duracao_aceitacao_dias" type="number" formData={formData} setFormData={setFormData} suffix="dias" />
          <DetailItem label="Duração total" value={`${currentTotal} dias`} highlight />
        </div>
      </Accordion>

      {/* 👥 Seção 2: Equipe Técnica */}
      <Accordion title="Equipe Técnica">
        <div className="p-4 max-w-3xl">
          <div className="overflow-hidden rounded-xl border border-[var(--border-card)]">
            <table className="w-full text-left border-collapse bg-[var(--bg-input)]/30">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-3 px-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Função</th>
                <th className="py-3 px-4 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Nome</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold">
              <TeamRow role="Coordenador (a) de obra" name={data?.equipe?.obra?.coordenador?.nome} />
              <TeamRow role="Administrativo" name={data?.equipe?.obra?.administrativo?.nome} />
              <TeamRow role="Analista 1" name={data?.equipe?.obra?.analista_1?.nome} />
              <TeamRow role="Analista 2" name={data?.equipe?.obra?.analista_2?.nome} />
              <TeamRow role="Responsável pelo Cronograma" name={data?.equipe?.obra?.responsavel_cronograma?.nome} />
            </tbody>
          </table>
          </div>
        </div>
      </Accordion>

      {/* 🚢 Seção 3: Informações da Embarcação */}
      <Accordion title="Informações da Embarcação">
        <div className="p-4 max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
            <DetailItem label="Embarcação" value={data.embarcacao_nome} />
            <div /> {/* Spacer */}
            <DetailItem label="Bandeira" value={data.embarcacao_bandeira} isEditing={isEditing} field="embarcacao_bandeira" formData={formData} setFormData={setFormData} />
            <DetailItem label="Nacionalidade" value={data.embarcacao_nacionalidade} isEditing={isEditing} field="embarcacao_nacionalidade" formData={formData} setFormData={setFormData} />
            <DetailItem label="Coordenador (a) de frota" name={data?.equipe?.frota?.coordenador?.nome} />
            <DetailItem label="Gerente de frota" name={data?.equipe?.frota?.gerente?.nome} />
          </div>
        </div>
      </Accordion>

      {/* 📍 Seção 4: Localização e Condição */}
      <Accordion title="Localização e Condição">
        <div className="p-4 max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
            <DetailItem label="Local" value={data.local_estaleiro} isEditing={isEditing} field="local_estaleiro" formData={formData} setFormData={setFormData} />
            <DetailItem label="Condição" value={data.condicao_docagem} isEditing={isEditing} field="condicao_docagem" formData={formData} setFormData={setFormData} />
            <DetailItem label="Inspeção de casco" value={data.inspecao_casco_status} isEditing={isEditing} field="inspecao_casco_status" formData={formData} setFormData={setFormData} />
          </div>
        </div>
      </Accordion>

    </div>
  );
};

const Accordion = ({ title, children }: any) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="border-b border-white/5 pb-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 group"
      >
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 bg-[var(--accent)] rounded-full" />
          <h3 className="text-lg font-black uppercase tracking-tighter text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors">
            {title}
          </h3>
        </div>
        <svg 
          width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" 
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {isOpen && <div className="animate-slide-down">{children}</div>}
    </div>
  );
};

const DetailItem = ({ label, value, name, isEditing, field, type = "text", formData, setFormData, suffix, highlight }: any) => {
  const displayValue = name || value;
  
  // Para campos de data, precisamos converter o valor ISO do formData para YYYY-MM-DD para o input type="date"
  const getEditValue = () => {
    const val = formData?.[field] || "";
    if (type === "date" && val) {
      try {
        return new Date(val).toISOString().split('T')[0];
      } catch (e) {
        return val;
      }
    }
    return val;
  };

  const getInputClass = () => {
    if (type === "number") return "detail-item-input-number input-no-icon";
    if (type === "date") return "detail-item-input-date";
    return "w-full";
  };

  return (
    <div className="flex flex-col space-y-1.5">
      <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
        {label}
      </span>
      {isEditing && field ? (
        <div className={`flex items-center gap-2 relative group/input ${getInputClass()}`}>
            <input 
                type={type}
                value={getEditValue()}
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                className={`bg-[var(--bg-input)] border border-[var(--border-card)] dark:border-white/20 rounded-lg px-3 py-1.5 text-sm font-bold text-[var(--text-main)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]/30 outline-none w-full transition-all [color-scheme:light] dark:[color-scheme:dark] shadow-sm ${type === 'date' ? 'pr-10' : ''}`}
            />
            {type === "date" && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)] group-focus-within/input:text-[var(--accent)] transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
            )}
            {suffix && <span className="text-xs font-bold text-[var(--text-muted)] whitespace-nowrap">{suffix}</span>}
        </div>
      ) : (
        <span className={`text-sm font-bold ${highlight ? 'text-[var(--accent)] font-black' : 'text-[var(--text-main)]'}`}>
          {displayValue || "-"}
        </span>
      )}
    </div>
  );
};

const TeamRow = ({ role, name }: { role: string, name: string }) => (
  <tr className="border-b border-[var(--border-card)] hover:bg-[var(--bg-input)] transition-colors group">
    <td className="py-3 px-4 text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors">{role}</td>
    <td className="py-3 px-4 text-[var(--text-main)] font-bold">{name || "-"}</td>
  </tr>
);

export default SobreObra;
