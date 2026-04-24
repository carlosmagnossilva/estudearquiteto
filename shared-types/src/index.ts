/**
 * Interfaces compartilhadas entre Frontend, BFF e Core Service.
 * Representam o "Contrato" de dados do Hub de Obras.
 */

export interface IParada {
  paradaId: number;
  embarcacao: string;
  heroImageKey?: string;
  fel: string;
  coletores: number[];   // Códigos numéricos dos coletores (ex: 100, 101, 103)
  condicao: string;
  inicioRP: string;
  terminoRP: string;
  durRP: number;
  realizado_brl_m: number | null;
  outlook_brl_m: number;
  re: string;
  em: string;
  co: string;
  es: string;
  nc: string;
  obra: {
    matPerc: number;
    matTot: string;
    serPerc: number;
    serTot: string;
    facPerc: number;
    facTot: string;
  };
  gmud: {
    tot: number;
    aprov: number;
    add: number;
    exc: number;
    alt: number;
    qbr: number;
  };
}

export interface IUpdateItem {
  title: string;
  meta: string;
  text: string;
  user: string;
  time: string;
}

export interface IUpdateGroup {
  dateLabel: string;
  items: IUpdateItem[];
}

// Subtipos do Capex com campos concretos
export interface ICapexOutlook {
  ano: number;
  outlook_brl_m: number;
  variacao_orcamento_perc: number;
  total_obras: number;
  obras_executadas: number;
}

export interface ICapexTipo {
  id: string;
  valor_brl_m: number;
  percentual: number;
}

export interface ICapexComposicao {
  label: string;
  percentual: number;
  valor_brl_m: number;
  variacao_perc: number;
}

export interface ICapexSubsistema {
  nome: string;
  codigo: string;
  valor_brl_m: number;
  percentual: number;
}

export interface ICapexHistorico {
  year: number;
  value: number;
}

export interface ICapexData {
  outlook: ICapexOutlook | null;
  tipos: ICapexTipo[];
  composicao: ICapexComposicao[];
  subsistemas: ICapexSubsistema[];
  historico: ICapexHistorico[];
}

// Metadata de mensagens consumidas do Service Bus
export interface IServiceBusMeta {
  messageId: string;
  correlationId: string;
  deliveryCount: number;
  enqueuedTimeUtc: Date;
  occurredAt: string;
  producer: string;
  schemaName: string;
  schemaVersion: string;
}

export interface IFinancialEvolucao {
  name: string;
  value: number;
}

export interface IFinancialWaterfall {
  name: string;
  value: number;
}

export interface IFinancialGasto {
  name: string;
  value: number;
  fill: string;
}

export interface IFinancialDetalhamento {
  Id: number;
  inicio: string;
  termino: string;
  dias: number;
  PercRE: number;
  PercEM: number;
  PercCO: number;
  PercES: number;
  PercNC: number;
  OutlookBRL: number;
  RealizadoBRL: number;
  embarcacao: string;
}

export interface IBffResponse<T = any> {
  meta: {
    source: "database" | "mock" | "cache" | "servicebus";
    lastConsumed?: IServiceBusMeta;
  };
  items?: T[];
  groups?: IUpdateGroup[];
  // Campos de Capex (presentes quando source é capex)
  outlook?: ICapexOutlook | null;
  tipos?: ICapexTipo[];
  composicao?: ICapexComposicao[];
  subsistemas?: ICapexSubsistema[];
  historico?: ICapexHistorico[];
  // Campos de Financeiro Indicadores
  evolucao?: IFinancialEvolucao[];
  waterfall?: IFinancialWaterfall[];
  gastos?: IFinancialGasto[];
  detalhamento?: IFinancialDetalhamento[];
  data?: T;
}

// --- MÓDULO FINANCEIRO ---

export interface IEstaleiro {
  id: number;
  nome: string;
  cnpj?: string;
  codigoFornecedor?: string;
  cidade?: string;
  uf?: string;
}

export interface IPPU {
  id: number;
  estaleiroId: number;
  codigoPPU: string;
  dataInclusao: string;
  inicioVigencia: string;
  fimVigencia: string;
  status: "Vigente" | "Vencida";
}

export interface IFinanceiroObra {
  id: number;
  id_parada: number;
  embarcacao_nome: string;
  statusFinanceiro: string;
  outlookBRL: number;
  realizadoBRL: number;
  percRE: number;
  percEM: number;
  percCO: number;
  percES: number;
  percNC: number;
  dataUltimaAtualizacao: string;
  // Novos campos do protótipo
  condicao: string;
  inicio: string;
  termino: string;
  duracaoTotal: number;
  tags: { tag: string; descricao: string; cor: string }[];
}
