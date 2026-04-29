/* 
   STORED PROCEDURE: sp_core_save_obra_detalhes_v2
   DESCRIÇÃO: Centraliza o salvamento de detalhes da obra no Hub_Core, gera logs e sinaliza refresh.
   AUTOR: DBA Sênior & AI Engineer
*/

CREATE PROCEDURE hub_core.sp_save_obra_detalhes_v2
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
        -- 1. Capturar valores antigos para o LOG
        DECLARE @old_inicio DATETIME2, @old_local VARCHAR(255);
        SELECT @old_inicio = data_inicio_obra, @old_local = local_estaleiro 
        FROM hub_core.obra_detalhes WHERE id_obra = @id_obra;

        -- 2. Executar o UPDATE
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
            updated_at = GETDATE()
        WHERE id_obra = @id_obra;

        -- 3. Registrar no Log de Alterações (Exemplo de inserção simplificada)
        -- IF (@old_inicio <> @data_inicio OR @old_local <> @local) -- Exemplo de condicional
        INSERT INTO hub_core.log_alteracoes (obra_id, usuario, acao, data_hora)
        VALUES (@id_obra, @usuario_log, 'UPDATE_OBRA_DETALHES', GETDATE());

        -- 4. Sinalizar para o Job Sincronizador (Refresh Reativo)
        -- Se a tabela de fila não existir, criamos ou usamos um campo de status na própria obra
        UPDATE hub_core.obra_detalhes SET needs_sync = 1 WHERE id_obra = @id_obra;

        COMMIT TRANSACTION;
        SELECT 1 AS Success, 'Dados atualizados com sucesso' AS Message;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SELECT 0 AS Success, ERROR_MESSAGE() AS Message;
    END CATCH
END
GO
