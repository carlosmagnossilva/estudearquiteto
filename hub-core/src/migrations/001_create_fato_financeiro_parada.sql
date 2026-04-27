-- Migration: 001_create_fato_financeiro_parada.sql
-- Propósito: Segregar dados financeiros recebidos do Protheus
--            da tabela técnica fato_parada (originada do SGO).
-- ATENÇÃO: NÃO remove colunas de fato_parada. O frontend depende delas.
--          Este arquivo cria uma tabela ADICIONAL. Estratégia COALESCE no Hub-Core.

IF NOT EXISTS (
  SELECT 1 FROM INFORMATION_SCHEMA.TABLES
  WHERE TABLE_SCHEMA = 'hub_frontend'
  AND TABLE_NAME = 'fato_financeiro_parada'
)
BEGIN
  CREATE TABLE hub_frontend.fato_financeiro_parada (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    parada_id       INT NOT NULL,
    realizado_brl_m DECIMAL(18,2) NULL,
    outlook_brl_m   DECIMAL(18,2) NULL,
    re_perc         INT NULL,
    em_perc         INT NULL,
    co_perc         INT NULL,
    es_perc         INT NULL,
    nc_perc         INT NULL,
    origem          VARCHAR(50) NOT NULL DEFAULT 'protheus',
    atualizado_em   DATETIME NOT NULL DEFAULT GETDATE()
  );

  CREATE INDEX IX_fato_financeiro_parada_parada_id
    ON hub_frontend.fato_financeiro_parada(parada_id);

  PRINT 'Tabela fato_financeiro_parada criada com sucesso.';
END
ELSE
BEGIN
  PRINT 'Tabela já existe. Nenhuma ação realizada.';
END
