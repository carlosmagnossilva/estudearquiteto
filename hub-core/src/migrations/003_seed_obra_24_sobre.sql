-- Seed: 003_seed_obra_24_sobre.sql
-- Descrição: Popula dados reais da equipe técnica e detalhes da Obra 24 (Austral Abrolhos) conforme prints.

-- 1. Inserir/Atualizar Equipe Técnica
-- Frota
IF NOT EXISTS (SELECT * FROM hub_core.equipe_tecnica WHERE email = 'pedro.souza@oceanpact.com')
    INSERT INTO hub_core.equipe_tecnica (nome, cargo, email, telefone) VALUES ('Pedro Silva Souza', 'Coordenador de Frota', 'pedro.souza@oceanpact.com', '+55 21 99999-0001');
ELSE
    UPDATE hub_core.equipe_tecnica SET nome = 'Pedro Silva Souza', cargo = 'Coordenador de Frota' WHERE email = 'pedro.souza@oceanpact.com';

IF NOT EXISTS (SELECT * FROM hub_core.equipe_tecnica WHERE email = 'lucas.santana@oceanpact.com')
    INSERT INTO hub_core.equipe_tecnica (nome, cargo, email, telefone) VALUES ('Lucas Santana', 'Gerente de Frota', 'lucas.santana@oceanpact.com', '+55 21 99999-0002');
ELSE
    UPDATE hub_core.equipe_tecnica SET nome = 'Lucas Santana', cargo = 'Gerente de Frota' WHERE email = 'lucas.santana@oceanpact.com';

-- Obra
IF NOT EXISTS (SELECT * FROM hub_core.equipe_tecnica WHERE email = 'mauricio.oliveira@oceanpact.com')
    INSERT INTO hub_core.equipe_tecnica (nome, cargo, email, telefone) VALUES ('Maurício Oliveira', 'Coordenador de Obra', 'mauricio.oliveira@oceanpact.com', '+55 21 99999-0003');

IF NOT EXISTS (SELECT * FROM hub_core.equipe_tecnica WHERE email = 'elena.milch@oceanpact.com')
    INSERT INTO hub_core.equipe_tecnica (nome, cargo, email, telefone) VALUES ('Elena Milch', 'Administrativo', 'elena.milch@oceanpact.com', '+55 21 99999-0004');

IF NOT EXISTS (SELECT * FROM hub_core.equipe_tecnica WHERE email = 'marcos.rodrigues@oceanpact.com')
    INSERT INTO hub_core.equipe_tecnica (nome, cargo, email, telefone) VALUES ('Marcos Rodrigues', 'Analista 1', 'marcos.rodrigues@oceanpact.com', '+55 21 99999-0005');

IF NOT EXISTS (SELECT * FROM hub_core.equipe_tecnica WHERE email = 'sergio.lopes@oceanpact.com')
    INSERT INTO hub_core.equipe_tecnica (nome, cargo, email, telefone) VALUES ('Sérgio Lopes', 'Analista 2', 'sergio.lopes@oceanpact.com', '+55 21 99999-0006');

IF NOT EXISTS (SELECT * FROM hub_core.equipe_tecnica WHERE email = 'fernanda.schwester@oceanpact.com')
    INSERT INTO hub_core.equipe_tecnica (nome, cargo, email, telefone) VALUES ('Fernanda Schwester', 'Responsável pelo Cronograma', 'fernanda.schwester@oceanpact.com', '+55 21 99999-0007');

-- 2. Inserir/Atualizar Detalhes da Obra 24
DECLARE @id_coord_frota INT = (SELECT id FROM hub_core.equipe_tecnica WHERE email = 'pedro.souza@oceanpact.com');
DECLARE @id_ger_frota INT = (SELECT id FROM hub_core.equipe_tecnica WHERE email = 'lucas.santana@oceanpact.com');
DECLARE @id_coord_obra INT = (SELECT id FROM hub_core.equipe_tecnica WHERE email = 'mauricio.oliveira@oceanpact.com');
DECLARE @id_admin INT = (SELECT id FROM hub_core.equipe_tecnica WHERE email = 'elena.milch@oceanpact.com');
DECLARE @id_analista1 INT = (SELECT id FROM hub_core.equipe_tecnica WHERE email = 'marcos.rodrigues@oceanpact.com');
DECLARE @id_analista2 INT = (SELECT id FROM hub_core.equipe_tecnica WHERE email = 'sergio.lopes@oceanpact.com');
DECLARE @id_cronograma INT = (SELECT id FROM hub_core.equipe_tecnica WHERE email = 'fernanda.schwester@oceanpact.com');

IF NOT EXISTS (SELECT * FROM hub_core.obra_detalhes WHERE id_obra = 24)
BEGIN
    INSERT INTO hub_core.obra_detalhes (
        id_obra, data_inicio_obra, data_termino_obra, data_termino_contrato, ano_orcamento,
        duracao_obra_dias, duracao_testes_dias, duracao_aceitacao_dias,
        id_coordenador_frota, id_gerente_frota,
        id_coordenador_obra, id_administrativo, id_analista_1, id_analista_2, id_responsavel_cronograma,
        embarcacao_nome, embarcacao_bandeira, embarcacao_nacionalidade, inspecao_casco_status,
        local_estaleiro, condicao_docagem
    )
    VALUES (
        24, '2024-12-02', '2025-02-26', '2025-03-05', 2025,
        86, 10, 5,
        @id_coord_frota, @id_ger_frota,
        @id_coord_obra, @id_admin, @id_analista1, @id_analista2, @id_cronograma,
        'Austral Abrolhos', 'Brasil', 'Brasileiro', 'Dry Docking Bottom Survey',
        'Estaleiro Mauá', 'Seco'
    );
END
ELSE
BEGIN
    UPDATE hub_core.obra_detalhes
    SET data_inicio_obra = '2024-12-02',
        data_termino_obra = '2025-02-26',
        data_termino_contrato = '2025-03-05',
        ano_orcamento = 2025,
        duracao_obra_dias = 86,
        duracao_testes_dias = 10,
        duracao_aceitacao_dias = 5,
        id_coordenador_frota = @id_coord_frota,
        id_gerente_frota = @id_ger_frota,
        id_coordenador_obra = @id_coord_obra,
        id_administrativo = @id_admin,
        id_analista_1 = @id_analista1,
        id_analista_2 = @id_analista2,
        id_responsavel_cronograma = @id_cronograma,
        embarcacao_nome = 'Austral Abrolhos',
        embarcacao_bandeira = 'Brasil',
        embarcacao_nacionalidade = 'Brasileiro',
        inspecao_casco_status = 'Dry Docking Bottom Survey',
        local_estaleiro = 'Estaleiro Mauá',
        condicao_docagem = 'Seco'
    WHERE id_obra = 24;
END

PRINT 'Seed da Obra 24 (Austral Abrolhos) atualizado conforme prints.';
