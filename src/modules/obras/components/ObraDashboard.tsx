import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import './ObraDashboard.css';

interface ObraDashboardProps {
  idObra?: string | number;
  data?: any;
}

const COLORS = {
  servicos: '#3b82f6',
  materiais: '#f97316',
  facilidades: '#a855f7'
};

// --- Sub-components ---

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: color }} />
    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{label}</span>
  </div>
);

const MetricBox: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="metric-box" style={{
    padding: '12px 8px',
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.05)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  }}>
    <span className="op-label" style={{ marginBottom: '4px', textAlign: 'center', opacity: 0.7 }}>{label}</span>
    <span className="op-value" style={{ fontSize: '16px', textAlign: 'center', fontWeight: 800 }}>{value}</span>
  </div>
);

const OperationalCard: React.FC<{ title: string; rows: any[] }> = ({ title, rows }) => (
  <div className="dashboard-card">
    <h3 className="card-title" style={{ fontSize: '20px', marginBottom: '20px' }}>{title}</h3>
    <div className="op-items-grid">
      {rows.map((row, i) => (
        <div key={i} className="op-row">
          {row.full ? (
            <div className="op-item full-width">
              <span className="op-label">{row.full.label}</span>
              <div className="op-value">{row.full.value}</div>
              {row.full.sub && <span className="op-sub">{row.full.sub}</span>}
            </div>
          ) : (
            row.split.map((item: any, j: number) => (
              <div key={j} className="op-item">
                <span className="op-label">{item.label}</span>
                <div className="op-value" style={{ fontSize: '18px' }}>{item.value}</div>
                {item.sub && <span className="op-sub">{item.sub}</span>}
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  </div>
);

const ObraDashboard: React.FC<ObraDashboardProps> = ({ idObra }) => {
  const id = idObra; 
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      if (!id) return;
      try {
        setLoading(true);
        // Fallback para localhost se env não estiver definido
        const baseUrl = process.env.REACT_APP_BFF_URL || 'http://localhost:4000';
        const response = await fetch(`${baseUrl}/bff/obras/${id}/dashboard`);
        if (response.ok) {
          const json = await response.json();
          setDashboardData(json);
        }
      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [id]);

  if (!id) return <div className="error-container">ID da obra não fornecido.</div>;
  if (loading) return <div className="loading-container">Carregando Dashboard Executivo...</div>;
  if (!dashboardData) return <div className="error-container">Snapshot do Dashboard não encontrado (Obra {id}). Rode o Integrador.</div>;

  // Garantindo compatibilidade com o formato do snapshot do integrator
  const outlook = dashboardData.outlook || { valorProjetado: 0, variacaoFel: 0, nc: 0, cp: 0, mc: 0, pp: 0 };
  const mixGastos = dashboardData.mixGastos || dashboardData.gastosEvolucao || [];
  const curvaS = dashboardData.curvaS || [];
  const operacional = dashboardData.operacional || { servicos: { totalAprovado: 0, valorAprovado: 0, concluidos: 0, concluidosPercent: 0, cancelados: 0 }, materiais: { totalSolicitar: 0, totalSolicitacoes: 0, valorSolicitacoes: 0, entregue: 0, entreguePercent: 0, valorEntregue: 0 }, estaleiros: { contratadas: 0, valorContratado: 0, consumidas: 0, consumidasPercent: 0, valorConsumido: 0 } };
  const rankingPendencias = dashboardData.rankingPendencias || [];

  return (
    <div className="dashboard-container">

      {/* Layer 1: Outlook */}
      <div className="dashboard-card">
        <h2 className="card-title" style={{ marginBottom: '16px' }}>Outlook da Obra</h2>
        <div className="outlook-grid">
          <div className="outlook-section" style={{ flex: '0 0 260px' }}>
            <span className="section-label">Valor Projetado Atual</span>
            <div className="metric-highlight">
              <div className="highlight-value">{outlook.valorProjetado?.toLocaleString('pt-BR') || 0}</div>
              <div className="gap-indicator">
                <span className="gap-text">{outlook.variacaoFel}% Var Último FEL</span>
                <div className="gap-icon-circle">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="4"><path d="M7 13l5 5 5-5M12 18V6" /></svg>
                </div>
              </div>
            </div>
          </div>
          <div className="outlook-section" style={{ flex: '1' }}>
            <span className="section-label">Totais da Obra</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <MetricBox label="NC" value={`${outlook.nc}%`} />
              <MetricBox label="CP" value={`${outlook.cp}%`} />
              <MetricBox label="EM" value="-" />
              <MetricBox label="CT" value="-" />
            </div>
          </div>
          <div className="outlook-section" style={{ flex: '0 0 280px' }}>
            <span className="section-label">Tipo de Obra</span>
            <div style={{ display: 'flex', gap: '12px' }}>
              <MetricBox label="MC" value={`${outlook.mc?.toLocaleString('pt-BR') || 0} M`} />
              <MetricBox label="PP" value={outlook.pp?.toString() || "0"} />
            </div>
          </div>
        </div>
      </div>

      {/* Layer 2: Macro Charts */}
      <div className="operational-grid">
        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '400px' }}>
          <h3 className="card-title" style={{ width: '100%', marginBottom: '32px' }}>Custos por Tipo de Gasto</h3>
          <div style={{ height: '280px', width: '100%', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 10 }}>
              <span style={{ fontSize: '38px', fontWeight: 900, color: 'var(--dash-text)' }}>{mixGastos.length > 0 ? mixGastos.reduce((a: any, b: any) => a + b.value, 0) : 0}</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mixGastos}
                  innerRadius={75}
                  outerRadius={115}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                  labelLine={false}
                  label={({ cx, cy, midAngle = 0, innerRadius, outerRadius, index }) => {
                    const RADIUS = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + RADIUS * Math.cos(-midAngle * (Math.PI / 180));
                    const y = cy + RADIUS * Math.sin(-midAngle * (Math.PI / 180));
                    return (
                      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: '14px', fontWeight: 700 }}>
                        {`${mixGastos[index]?.percent || 0}%`}
                      </text>
                    );
                  }}
                >
                  {mixGastos.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#334155'} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="legend-container" style={{ marginTop: '32px' }}>
            <LegendItem color={COLORS.materiais} label="Materiais" />
            <LegendItem color={COLORS.servicos} label="Serviços" />
            <LegendItem color={COLORS.facilidades} label="Facilidades" />
          </div>
        </div>
        <div className="dashboard-card" style={{ gridColumn: 'span 2' }}>
          <h3 className="card-title">Evolução Gastos da Obra</h3>
          <div style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={curvaS} margin={{ top: 30, right: 50, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={true} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11 }} 
                  interval={5}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(value) => value.toLocaleString('pt-BR')} />
                <Area type="monotone" dataKey="materiais" stackId="1" stroke="#1a252c" fill="#1a252c" fillOpacity={1} />
                <Area type="monotone" dataKey="servicos" stackId="1" stroke="#284b63" fill="#284b63" fillOpacity={1} />
                <Area type="monotone" dataKey="facilidades" stackId="1" stroke="#5ab2d3" fill="#5ab2d3" fillOpacity={1} />

                {/* Marcos Operacionais Dinâmicos virão do Snapshot no futuro */}
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="legend-container" style={{ marginTop: '16px', display: 'flex', gap: '24px', justifyContent: 'center' }}>
             <LegendItem color="#1a252c" label="Materiais" />
             <LegendItem color="#284b63" label="Serviços" />
             <LegendItem color="#5ab2d3" label="Facilidades" />
          </div>
        </div>
      </div>

      {/* Layer 3: Operational Cards (Quick Stats) */}
      <div className="operational-grid">
        <OperationalCard title="Serviços"
          rows={[
            { full: { label: 'Total Serv. Aprovado', value: operacional.servicos.totalAprovado?.toString() || "0", sub: operacional.servicos.valorAprovado } },
            {
              split: [
                { label: 'Concluídos', value: `${operacional.servicos.concluidos || 0} (${operacional.servicos.concluidosPercent || 0}%)`, sub: 'R$ 11.8 M' },
                { label: 'Cancelados ou transferidos', value: operacional.servicos.cancelados?.toString() || "0" }
              ]
            }
          ]}
        />
        <OperationalCard title="Materiais"
          rows={[
            { full: { label: 'Total a Solicitar', value: operacional.materiais.totalSolicitar?.toString() || "0" } },
            {
              split: [
                { label: 'Total Solicitações', value: operacional.materiais.totalSolicitacoes?.toString() || "0", sub: operacional.materiais.valorSolicitacoes },
                { label: 'Total Entregue', value: `${operacional.materiais.entregue || 0} (${operacional.materiais.entreguePercent || 0}%)`, sub: operacional.materiais.valorEntregue }
              ]
            }
          ]}
        />
        <OperationalCard title="Estaleiros"
          rows={[
            { full: { label: 'Facilidades Contratadas', value: operacional.estaleiros.contratadas?.toString() || "0", sub: operacional.estaleiros.valorContratado } },
            { full: { label: 'Facilidades Consumidas', value: `${operacional.estaleiros.consumidas || 0} (${operacional.estaleiros.consumidasPercent || 0}%)`, sub: operacional.estaleiros.valorConsumido } }
          ]}
        />
      </div>

      {/* Ranking de Pendências Dinâmico */}
      <div className="operational-grid" style={{ marginTop: '24px' }}>
        <div className="dashboard-card" style={{ gridColumn: 'span 3' }}>
          <h3 className="card-title">Ranking de Pendências</h3>
          <div className="table-responsive">
            <table className="ranking-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Pendência</th>
                  <th>Aging (Dias)</th>
                </tr>
              </thead>
              <tbody>
                {rankingPendencias.map((item: any, index: number) => (
                  <tr key={index}>
                    <td>
                      <span className={`badge badge-${item.criticidade.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`}>
                        {item.criticidade === 'Crítica' ? '⚠️ ' : '⚪ '}{item.criticidade}
                      </span>
                    </td>
                    <td className="text-highlight">{item.descricao}</td>
                    <td className="aging-value">{item.aging}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObraDashboard;
