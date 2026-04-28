import React from 'react';
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
  ReferenceLine,
  Label,
  BarChart,
  Bar,
  Tooltip,
  Legend,
  LabelList
} from 'recharts';
import './ObraDashboard.css';
import p24Data from '../mock/p24_dashboard.json';

interface ObraDashboardProps {
  data?: any;
}

const COLORS = {
  materiais: '#1a252c',
  servicos: '#0088a9',
  facilidades: '#5ab2d3'
};

// --- Sub-components (Defined BEFORE main component to avoid ReferenceError) ---

const LegendItem: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <div className="legend-item">
    <div className="legend-dot" style={{ backgroundColor: color }}></div>
    <span className="legend-text">{label}</span>
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

// --- Main Component ---

const ObraDashboard: React.FC<ObraDashboardProps> = () => {
  // Forçando o uso do mock P24 para garantir fidelidade visual imediata
  const dashboardData = p24Data;

  const outlook = dashboardData.outlook;
  const mixGastos = dashboardData.mixGastos;
  const curvaS = dashboardData.curvaS;
  const operacional = dashboardData.operacional;

  return (
    <div className="dashboard-container">

      {/* Layer 1: Outlook */}
      <div className="dashboard-card">
        <h2 className="card-title" style={{ marginBottom: '16px' }}>Outlook da Obra</h2>
        <div className="outlook-grid">
          <div className="outlook-section" style={{ flex: '0 0 260px' }}>
            <span className="section-label">Valor Projetado Atual</span>
            <div className="metric-highlight">
              <div className="highlight-value">{outlook.valorProjetado.toLocaleString('pt-BR')}</div>
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
              <MetricBox label="MC" value={`${outlook.mc.toLocaleString('pt-BR')} M`} />
              <MetricBox label="PP" value={outlook.pp.toString()} />
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
              <span style={{ fontSize: '38px', fontWeight: 900, color: 'var(--dash-text)' }}>127</span>
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

                {/* Marcos Operacionais com Hierarquia, Datas e Suporte a Tema */}
                {[
                  { x: "Ago/23", label: "Início Obra", date: "15/08/23", major: true, yOffset: 0 },
                  { x: "Fev/25", label: "Testes", date: "10/02/25", major: false, yOffset: 35 },
                  { x: "Maio/25", label: "Aceite", date: "25/05/25", major: false, yOffset: 70 },
                  { x: "Jun/25", label: "Término", date: "30/06/25", major: true, yOffset: 0 }
                ].map((m, i) => (
                  <ReferenceLine 
                    key={i} 
                    x={m.x} 
                    stroke={m.major ? "rgba(56, 189, 248, 0.6)" : "rgba(148, 163, 184, 0.3)"} 
                    strokeDasharray={m.major ? "0" : "3 3"}
                    strokeWidth={m.major ? 2 : 1}
                  >
                    <Label 
                      position="insideTopLeft" 
                      content={({ viewBox }: any) => {
                        const { x, y, height } = viewBox;
                        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
                        
                        const bgColor = m.major 
                          ? (isDark ? "rgba(56, 189, 248, 0.2)" : "rgba(56, 189, 248, 0.1)")
                          : (isDark ? "rgba(30, 41, 59, 0.8)" : "rgba(255, 255, 255, 0.9)");
                        
                        const textColor = m.major 
                          ? "#0284c7" 
                          : (isDark ? "rgba(255, 255, 255, 0.7)" : "#475569");
                        
                        const borderColor = m.major ? "#0ea5e9" : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)");
                        
                        const finalY = y + m.yOffset;
                        const isRightEdge = x > 300;
                        
                        return (
                          <g>
                            <title>{`${m.label}: ${m.date}`}</title>
                            {/* Badge Superior */}
                            <rect 
                              x={isRightEdge ? x - (m.label.length * 7 + 15) : x + 5} 
                              y={finalY - 15} 
                              width={m.label.length * 7 + 12} 
                              height={22} 
                              fill={bgColor} 
                              stroke={borderColor}
                              strokeWidth={1}
                              rx={4} 
                            />
                            <text 
                              x={isRightEdge ? x - (m.label.length * 7 + 9) : x + 11} 
                              y={finalY - 4} 
                              fill={textColor} 
                              fontSize={m.major ? 11 : 10} 
                              fontWeight={m.major ? "bold" : "normal"} 
                              dominantBaseline="middle"
                            >
                              {m.label}
                            </text>

                            {/* Data Inferior */}
                            <g className="milestone-date">
                              <text 
                                x={x} 
                                y={height - 17 - (m.yOffset * 0.6)} 
                                fill={isDark ? "#94a3b8" : "#64748b"} 
                                fontSize={9} 
                                textAnchor="middle"
                                dominantBaseline="middle"
                                filter={isDark ? "drop-shadow(0px 1px 2px rgba(0,0,0,0.8))" : "none"}
                              >
                                {m.date.substring(0, 5)}
                              </text>
                            </g>
                          </g>
                        );
                      }}
                    />
                  </ReferenceLine>
                ))}
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
            { full: { label: 'Total Serv. Aprovado', value: operacional.servicos.totalAprovado.toString(), sub: operacional.servicos.valorAprovado } },
            {
              split: [
                { label: 'Concluídos', value: `${operacional.servicos.concluidos} (${operacional.servicos.concluidosPercent}%)`, sub: 'R$ 11.8 M' },
                { label: 'Cancelados ou transferidos', value: operacional.servicos.cancelados.toString() }
              ]
            }
          ]}
        />
        <OperationalCard title="Materiais"
          rows={[
            { full: { label: 'Total a Solicitar', value: operacional.materiais.totalSolicitar.toString() } },
            {
              split: [
                { label: 'Total Solicitações', value: operacional.materiais.totalSolicitacoes.toString(), sub: operacional.materiais.valorSolicitacoes },
                { label: 'Total Entregue', value: `${operacional.materiais.entregue} (${operacional.materiais.entreguePercent}%)`, sub: operacional.materiais.valorEntregue }
              ]
            }
          ]}
        />
        <OperationalCard title="Estaleiros"
          rows={[
            { full: { label: 'Facilidades Contratadas', value: operacional.estaleiros.contratadas.toString(), sub: operacional.estaleiros.valorContratado } },
            { full: { label: 'Facilidades Consumidas', value: `${operacional.estaleiros.consumidas} (${operacional.estaleiros.consumidasPercent}%)`, sub: operacional.estaleiros.valorConsumido } }
          ]}
        />
      </div>

      {/* Layer 4: Detailed Operational Charts */}
      <div className="operational-grid" style={{ marginTop: '24px' }}>
        {/* Status dos Serviços */}
        <div className="dashboard-card">
          <h3 className="card-title">Status dos Serviços</h3>
          <div style={{ height: '350px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={p24Data.statusServicos} margin={{ left: 40, right: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="var(--dash-dim)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="var(--dash-dim)" fontSize={11} width={80} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'var(--dash-card)', borderColor: 'var(--dash-border)', borderRadius: '8px' }} />
                <Legend verticalAlign="top" align="left" iconSize={10} wrapperStyle={{ paddingBottom: '20px', fontSize: '11px' }} />
                <Bar dataKey="naoExecutado" name="Não executado" stackId="a" fill="#475569" radius={[0, 0, 0, 0]} />
                <Bar dataKey="concluido" name="Concluído" stackId="a" fill="#166534" />
                <Bar dataKey="aprovada" name="Aprovada" stackId="a" fill="#f59e0b" />
                <Bar dataKey="pcAprovado" name="Pedidos compra aprov." stackId="a" fill="#0891b2" />
                <Bar dataKey="pago" name="Pago" stackId="a" fill="#a855f7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status dos Materiais */}
        <div className="dashboard-card">
          <h3 className="card-title">Status dos Materiais</h3>
          <div style={{ height: '350px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={p24Data.statusMateriais} margin={{ left: 40, right: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="var(--dash-dim)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="var(--dash-dim)" fontSize={11} width={80} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'var(--dash-card)', borderColor: 'var(--dash-border)', borderRadius: '8px' }} />
                <Legend verticalAlign="top" align="left" iconSize={10} wrapperStyle={{ paddingBottom: '20px', fontSize: '11px' }} />
                <Bar dataKey="naoSolicitado" name="Não solicitado" stackId="a" fill="#475569" />
                <Bar dataKey="aguardandoAprovacao" name="Aguardando aprov." stackId="a" fill="#166534" />
                <Bar dataKey="aguardandoEntrega" name="Aguardando entrega" stackId="a" fill="#0891b2" />
                <Bar dataKey="entregue" name="Entregue" stackId="a" fill="#a855f7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Consumo de Facilidades */}
        <div className="dashboard-card">
          <h3 className="card-title">Consumo de Facilidades</h3>
          <div style={{ height: '350px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={p24Data.consumoFacilidades} margin={{ left: 40, right: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="var(--dash-dim)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="var(--dash-dim)" fontSize={11} width={80} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'var(--dash-card)', borderColor: 'var(--dash-border)', borderRadius: '8px' }} />
                <Legend verticalAlign="top" align="left" iconSize={10} wrapperStyle={{ paddingBottom: '20px', fontSize: '11px' }} />
                <Bar dataKey="contratado" name="Contratado" fill="#334155" barSize={12} radius={[0, 4, 4, 0]} />
                <Bar dataKey="consumido" name="Consumido" fill="#0ea5e9" barSize={12} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="dashboard-card" style={{ gridColumn: 'span 3' }}>
          <h3 className="card-title">Pendências por Área</h3>
          <div style={{ height: '350px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={p24Data.pendenciasPorArea} margin={{ left: 60, right: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="var(--dash-dim)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="var(--dash-text)" fontSize={11} width={120} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: 'var(--dash-card)', borderColor: 'var(--dash-border)', borderRadius: '8px' }} />
                <Legend verticalAlign="top" align="left" iconSize={10} wrapperStyle={{ paddingBottom: '20px', fontSize: '11px' }} />
                <Bar dataKey="criticas" name="Críticas" stackId="a" fill="#0ea5e9" radius={[0, 0, 0, 0]}>
                  <LabelList dataKey="criticas" position="center" fill="#fff" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                </Bar>
                <Bar dataKey="normais" name="Normais" stackId="a" fill="#64748b" radius={[0, 4, 4, 0]}>
                  <LabelList dataKey="normais" position="center" fill="#fff" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="dashboard-card" style={{ gridColumn: 'span 3' }}>
          <h3 className="card-title">Ranking de Pendências</h3>
          <div className="table-responsive">
            <table className="ranking-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Pendência</th>
                  <th>Área Responsável</th>
                  <th>Aging</th>
                </tr>
              </thead>
              <tbody>
                {p24Data.rankingPendencias.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <span className={`badge badge-${item.tipo.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`}>
                        {item.tipo === 'Crítica' ? '⚠️ ' : '⚪ '}{item.tipo}
                      </span>
                    </td>
                    <td className="text-highlight">{item.pendencia}</td>
                    <td>{item.area}</td>
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
