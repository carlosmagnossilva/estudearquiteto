-- Auditoria de Dados para US06 (Visão Geral)
-- Obra: Austral Abrolhos (ID 24)

-- 1. KPIs Principais
SELECT 
    id_parada, 
    embarcacao_nome, 
    capex_inicial_brl_m as FEL, 
    capex_atual_brl_m as Outlook, 
    realizado_brl_m as Realizado
FROM hub_frontend.fato_parada 
WHERE id_parada = 24;

-- 2. Histórico Mensal (Para Curva S)
SELECT 
    ano_mes, 
    planejado_acumulado, 
    realizado_acumulado, 
    outlook_acumulado
FROM hub_frontend.fato_financeiro_mensal 
WHERE id_parada = 24
ORDER BY ano_mes;

-- 3. Mix de Gastos (Por Categoria)
SELECT 
    categoria_custo, 
    SUM(valor_brl) as total_brl
FROM hub_frontend.fato_custo_direto 
WHERE id_parada = 24
GROUP BY categoria_custo;
