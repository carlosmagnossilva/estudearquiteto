-- Migration: 005_create_dashboard_data_tables.sql
-- Descrição: Criação das tabelas transacionais para o Dashboard Executivo (US06, US07, US08)

-- 1. Tabela de Serviços (Detalhamento por Área e Status)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'obra_servicos' AND schema_id = SCHEMA_ID('hub_core'))
BEGIN
    CREATE TABLE hub_core.obra_servicos (
        id INT PRIMARY KEY IDENTITY(1,1),
        id_obra INT NOT NULL,
        area VARCHAR(100) NOT NULL, -- Ex: Obra, Elétrica, Mecânica
        servico_nome VARCHAR(255),
        status_execucao VARCHAR(50), -- Ex: naoExecutado, concluido, aprovada, pcAprovado, pago
        valor_estimado DECIMAL(18,2),
        valor_realizado DECIMAL(18,2),
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'Tabela hub_core.obra_servicos criada.';
END

-- 2. Tabela de Materiais (Detalhamento por Área e Status)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'obra_materiais' AND schema_id = SCHEMA_ID('hub_core'))
BEGIN
    CREATE TABLE hub_core.obra_materiais (
        id INT PRIMARY KEY IDENTITY(1,1),
        id_obra INT NOT NULL,
        area VARCHAR(100) NOT NULL,
        material_nome VARCHAR(255),
        status_pedido VARCHAR(50), -- Ex: naoSolicitado, aguardandoAprovacao, aguardandoEntrega, entregue
        valor_estimado DECIMAL(18,2),
        valor_realizado DECIMAL(18,2),
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'Tabela hub_core.obra_materiais criada.';
END

-- 3. Tabela de Consumo de Facilidades
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'obra_facilidades_consumo' AND schema_id = SCHEMA_ID('hub_core'))
BEGIN
    CREATE TABLE hub_core.obra_facilidades_consumo (
        id INT PRIMARY KEY IDENTITY(1,1),
        id_obra INT NOT NULL,
        nome_facilidade VARCHAR(100), -- Ex: Energia Elétrica, Água Doce
        valor_contratado DECIMAL(18,2),
        valor_consumido DECIMAL(18,2),
        unidade_medida VARCHAR(20),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
    PRINT 'Tabela hub_core.obra_facilidades_consumo criada.';
END

-- 4. Tabela de Histórico para Curva S
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'obra_curva_s_mensal' AND schema_id = SCHEMA_ID('hub_core'))
BEGIN
    CREATE TABLE hub_core.obra_curva_s_mensal (
        id_obra INT NOT NULL,
        ano_mes CHAR(7) NOT NULL, -- Format: YYYY-MM
        valor_materiais DECIMAL(18,2) DEFAULT 0,
        valor_servicos DECIMAL(18,2) DEFAULT 0,
        valor_facilidades DECIMAL(18,2) DEFAULT 0,
        PRIMARY KEY (id_obra, ano_mes)
    );
    PRINT 'Tabela hub_core.obra_curva_s_mensal criada.';
END

-- 5. Adicionar coluna 'area' na tabela de pendências se não existir
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'obra_pendencias' AND schema_id = SCHEMA_ID('hub_core'))
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = 'area' AND object_id = OBJECT_ID('hub_core.obra_pendencias'))
    BEGIN
        ALTER TABLE hub_core.obra_pendencias ADD area VARCHAR(100);
    END
END

GO

-- 6. Seed de dados para Obra 24 (Austral Abrolhos) para validação
DELETE FROM hub_core.obra_servicos WHERE id_obra = 24;
INSERT INTO hub_core.obra_servicos (id_obra, area, servico_nome, status_execucao, valor_estimado, valor_realizado)
VALUES 
(24, 'Obra', 'Pintura Casco', 'concluido', 500000, 480000),
(24, 'Obra', 'Limpeza Tanques', 'pago', 200000, 200000),
(24, 'Elétrica', 'Revisão Quadros', 'aprovada', 150000, 0),
(24, 'Mecânica', 'Overhaul Motor', 'pcAprovado', 800000, 0),
(24, 'NavTI', 'Instalação Starlink', 'concluido', 50000, 45000);

DELETE FROM hub_core.obra_materiais WHERE id_obra = 24;
INSERT INTO hub_core.obra_materiais (id_obra, area, material_nome, status_pedido, valor_estimado, valor_realizado)
VALUES 
(24, 'Obra', 'Tinta Epóxi', 'entregue', 120000, 115000),
(24, 'Elétrica', 'Cabos 10mm', 'aguardandoEntrega', 30000, 0),
(24, 'Mecânica', 'Kit Juntas', 'aguardandoAprovacao', 80000, 0),
(24, 'NavTI', 'Roteadores', 'naoSolicitado', 15000, 0);

DELETE FROM hub_core.obra_facilidades_consumo WHERE id_obra = 24;
INSERT INTO hub_core.obra_facilidades_consumo (id_obra, nome_facilidade, valor_contratado, valor_consumido, unidade_medida)
VALUES 
(24, 'Energia Elétrica', 12.5, 17.2, 'MWh'),
(24, 'Água Doce', 7.2, 11.5, 'm3'),
(24, 'Água Salgada', 8.0, 5.8, 'm3');

DELETE FROM hub_core.obra_curva_s_mensal WHERE id_obra = 24;
INSERT INTO hub_core.obra_curva_s_mensal (id_obra, ano_mes, valor_materiais, valor_servicos, valor_facilidades)
VALUES 
(24, '2024-11', 50000, 10000, 5000),
(24, '2024-12', 150000, 45000, 12000),
(24, '2025-01', 300000, 120000, 25000),
(24, '2025-02', 450000, 200000, 45000);

UPDATE hub_core.obra_pendencias SET area = 'Obras' WHERE id_obra = 24 AND area IS NULL;
UPDATE hub_core.obra_pendencias SET area = 'Mecânica' WHERE id_obra = 24 AND id % 2 = 0;
