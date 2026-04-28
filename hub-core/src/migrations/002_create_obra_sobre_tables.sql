-- Migration: 002_create_obra_sobre_tables.sql
-- Descrição: Criação das tabelas de Equipe Técnica e Detalhes da Obra (Aba Sobre a Obra)

-- 0. Garantir Schema
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'hub_core')
BEGIN
    EXEC('CREATE SCHEMA hub_core');
    PRINT 'Schema hub_core criado.';
END

-- 1. Tabela de Equipe Técnica (Cadastro Centralizado)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'equipe_tecnica' AND schema_id = SCHEMA_ID('hub_core'))
BEGIN
    CREATE TABLE hub_core.equipe_tecnica (
        id INT PRIMARY KEY IDENTITY(1,1),
        nome VARCHAR(255) NOT NULL,
        cargo VARCHAR(100),
        email VARCHAR(255),
        telefone VARCHAR(20),
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'Tabela hub_core.equipe_tecnica criada.';
END

-- 2. Tabela de Detalhes da Obra
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'obra_detalhes' AND schema_id = SCHEMA_ID('hub_core'))
BEGIN
    CREATE TABLE hub_core.obra_detalhes (
        id_obra INT PRIMARY KEY, -- FK para fato_parada no hub_frontend
        data_inicio_obra DATETIME2,
        data_termino_obra DATETIME2,
        data_termino_contrato DATETIME2,
        ano_orcamento INT,
        duracao_obra_dias INT,
        duracao_testes_dias INT,
        duracao_aceitacao_dias INT,
        -- Duração Total é calculada em tempo de execução
        id_coordenador_frota INT, -- FK para hub_core.equipe_tecnica
        id_gerente_frota INT,     -- FK para hub_core.equipe_tecnica
        embarcacao_nome VARCHAR(255),
        embarcacao_bandeira VARCHAR(50),
        embarcacao_nacionalidade VARCHAR(50),
        inspecao_casco_status VARCHAR(100),
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE(),
        CONSTRAINT FK_ObraDetalhes_Coordenador FOREIGN KEY (id_coordenador_frota) REFERENCES hub_core.equipe_tecnica(id),
        CONSTRAINT FK_ObraDetalhes_Gerente FOREIGN KEY (id_gerente_frota) REFERENCES hub_core.equipe_tecnica(id)
    );
    PRINT 'Tabela hub_core.obra_detalhes criada.';
END
