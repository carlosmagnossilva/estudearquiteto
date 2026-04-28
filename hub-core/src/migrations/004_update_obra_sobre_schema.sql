-- Migration: 004_update_obra_sobre_schema.sql
-- Descrição: Expande a tabela obra_detalhes para suportar todos os campos da UI e equipe técnica completa.

-- 1. Adicionar novas colunas de equipe e localização em hub_core.obra_detalhes
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'obra_detalhes' AND schema_id = SCHEMA_ID('hub_core'))
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = 'id_coordenador_obra' AND object_id = OBJECT_ID('hub_core.obra_detalhes'))
    BEGIN
        ALTER TABLE hub_core.obra_detalhes ADD id_coordenador_obra INT;
        ALTER TABLE hub_core.obra_detalhes ADD CONSTRAINT FK_ObraDetalhes_CoordenadorObra FOREIGN KEY (id_coordenador_obra) REFERENCES hub_core.equipe_tecnica(id);
    END

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = 'id_administrativo' AND object_id = OBJECT_ID('hub_core.obra_detalhes'))
    BEGIN
        ALTER TABLE hub_core.obra_detalhes ADD id_administrativo INT;
        ALTER TABLE hub_core.obra_detalhes ADD CONSTRAINT FK_ObraDetalhes_Administrativo FOREIGN KEY (id_administrativo) REFERENCES hub_core.equipe_tecnica(id);
    END

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = 'id_analista_1' AND object_id = OBJECT_ID('hub_core.obra_detalhes'))
    BEGIN
        ALTER TABLE hub_core.obra_detalhes ADD id_analista_1 INT;
        ALTER TABLE hub_core.obra_detalhes ADD CONSTRAINT FK_ObraDetalhes_Analista1 FOREIGN KEY (id_analista_1) REFERENCES hub_core.equipe_tecnica(id);
    END

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = 'id_analista_2' AND object_id = OBJECT_ID('hub_core.obra_detalhes'))
    BEGIN
        ALTER TABLE hub_core.obra_detalhes ADD id_analista_2 INT;
        ALTER TABLE hub_core.obra_detalhes ADD CONSTRAINT FK_ObraDetalhes_Analista2 FOREIGN KEY (id_analista_2) REFERENCES hub_core.equipe_tecnica(id);
    END

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = 'id_responsavel_cronograma' AND object_id = OBJECT_ID('hub_core.obra_detalhes'))
    BEGIN
        ALTER TABLE hub_core.obra_detalhes ADD id_responsavel_cronograma INT;
        ALTER TABLE hub_core.obra_detalhes ADD CONSTRAINT FK_ObraDetalhes_Cronograma FOREIGN KEY (id_responsavel_cronograma) REFERENCES hub_core.equipe_tecnica(id);
    END

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = 'local_estaleiro' AND object_id = OBJECT_ID('hub_core.obra_detalhes'))
    BEGIN
        ALTER TABLE hub_core.obra_detalhes ADD local_estaleiro VARCHAR(255);
    END

    IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = 'condicao_docagem' AND object_id = OBJECT_ID('hub_core.obra_detalhes'))
    BEGIN
        ALTER TABLE hub_core.obra_detalhes ADD condicao_docagem VARCHAR(100);
    END

    PRINT 'Tabela hub_core.obra_detalhes atualizada com sucesso.';
END
ELSE
BEGIN
    PRINT 'ERRO: Tabela hub_core.obra_detalhes não encontrada.';
END
