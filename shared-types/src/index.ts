export interface IBffResponse<T = any> {
  meta: {
    source: "database" | "mock" | "cache" | "servicebus";
  };
  items?: T[];
  groups?: IUpdateGroup[];
  outlook?: any;
  tipos?: any[];
  composicao?: any[];
  subsistemas?: any[];
  historico?: any[];
  data?: T;
}

export interface IParada {
  id: number;
  parada_id: number;
  embarcacao_id: number;
  embarcacao: string;
  embarcacao_sigla: string;
  fel_codigo: string;
  fel_nome: string;
  [key: string]: any; // Permite qualquer campo adicional (gmud, obra, etc)
}

export interface IBffUpdate {
  [key: string]: any;
}

export interface IUpdateGroup {
  dateLabel: string;
  items: IBffUpdate[];
}

export interface ICapexData {
  [key: string]: any;
}
