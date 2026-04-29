/* 
   MIGRATION v2: HUB_CORE INFRASTRUCTURE
   CONSOLIDAÇÃO: Tabelas de Suporte + Stored Procedures + Logs
   AMBIENTE: Produção / Desenvolvimento (Azure SQL)
*/

-- 1. Tabela de Log de Alterações
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'log_alteracoes' AND schema_id = SCHEMA_ID('hub_core'))
BEGIN
    CREATE TABLE hub_core.log_alteracoes (
        id INT IDENTITY PRIMARY KEY,
        obra_id INT NOT NULL,
        usuario VARCHAR(255) NOT NULL,
        acao VARCHAR(100) NOT NULL,
        data_hora DATETIME2 DEFAULT GETDATE()
    )
END;

-- 2. Tabela de Estimativas de Obra
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'obra_estimativas' AND schema_id = SCHEMA_ID('hub_core'))
BEGIN
    CREATE TABLE hub_core.obra_estimativas (
        id INT IDENTITY PRIMARY KEY,
        id_obra INT UNIQUE NOT NULL,
        vlr_estimado_servicos DECIMAL(18,2) DEFAULT 0,
        vlr_estimado_materiais DECIMAL(18,2) DEFAULT 0,
        vlr_target_energia DECIMAL(18,2) DEFAULT 0,
        vlr_target_agua DECIMAL(18,2) DEFAULT 0,
        updated_at DATETIME2 DEFAULT GETDATE()
    )
END;

-- 3. Tabela de Pendências de Negócio (Hub)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'obra_pendencias' AND schema_id = SCHEMA_ID('hub_core'))
BEGIN
    CREATE TABLE hub_core.obra_pendencias (
        id INT IDENTITY PRIMARY KEY,
        id_obra INT NOT NULL,
        descricao VARCHAR(500) NOT NULL,
        criticidade VARCHAR(20) DEFAULT 'Normal', -- 'Normal' ou 'Crítica'
        data_identificacao DATETIME2 DEFAULT GETDATE(),
        status VARCHAR(20) DEFAULT 'Pendente'
    )
END;

-- 4. Campo de Sincronização
IF NOT EXISTS (SELECT * FROM sys.columns WHERE name = 'needs_sync' AND object_id = OBJECT_ID('hub_core.obra_detalhes'))
BEGIN
    ALTER TABLE hub_core.obra_detalhes ADD needs_sync BIT DEFAULT 0;
END;

-- 5. Stored Procedure de Salvamento (v2)
GO
CREATE OR ALTER PROCEDURE hub_core.sp_save_obra_detalhes_v2
    @id_obra INT,
    @data_inicio DATETIME2,
    @data_termino DATETIME2,
    @data_contrato DATETIME2,
    @ano_orcamento INT,
    @dur_obra INT,
    @dur_testes INT,
    @dur_aceitacao INT,
    @local VARCHAR(255),
    @condicao VARCHAR(255),
    @inspecao VARCHAR(255),
    @bandeira VARCHAR(100),
    @nacionalidade VARCHAR(100),
    @usuario_log VARCHAR(255) = 'System'
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        -- Update Transacional
        UPDATE hub_core.obra_detalhes
        SET data_inicio_obra = @data_inicio,
            data_termino_obra = @data_termino,
            data_termino_contrato = @data_contrato,
            ano_orcamento = @ano_orcamento,
            duracao_obra_dias = @dur_obra,
            duracao_testes_dias = @dur_testes,
            duracao_aceitacao_dias = @dur_aceitacao,
            local_estaleiro = @local,
            condicao_docagem = @condicao,
            inspecao_casco_status = @inspecao,
            embarcacao_bandeira = @bandeira,
            embarcacao_nacionalidade = @nacionalidade,
            updated_at = GETDATE(),
            needs_sync = 1 -- Ativa o Job Sincronizador
        WHERE id_obra = @id_obra;

        -- Registro de Log Automático
        INSERT INTO hub_core.log_alteracoes (obra_id, usuario, acao, data_hora)
        VALUES (@id_obra, @usuario_log, 'UPDATE_OBRA_DETALHES_SP', GETDATE());

        COMMIT TRANSACTION;
        SELECT 1 AS Success, 'Dados salvos e auditados com sucesso' AS Message;
    END TRY
    BEGIN CATCH
        IF (@@TRANCOUNT > 0) ROLLBACK TRANSACTION;
        SELECT 0 AS Success, ERROR_MESSAGE() AS Message;
    END CATCH
END;
GO
