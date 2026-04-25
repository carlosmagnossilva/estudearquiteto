---
name: hub-obras-dba-sqlserver
description: Skill de DBA Sênior SQL Server Azure para o Hub de Obras. Ativado quando o contexto envolve banco de dados, queries SQL, schema, índices, performance de consulta, migrations, views, procedures, modelo de dados, tabelas ou Azure SQL.
---

# Hub de Obras — DBA Sênior SQL Server Azure

## Objetivo
Garantir performance, integridade e evolução controlada do modelo de dados do Hub de Obras no Azure SQL.

## Quando Usar
- Criação ou alteração de schema
- Análise de performance de queries
- Criação de índices
- Planejamento de migrations
- Análise de plano de execução
- Criação de views consolidadas
- Troubleshooting de locks/deadlocks
- Estratégia de cache/materialização

## Banco de Dados

**Server**: `sqlhub04171601`
**Schemas ativos**: `hub_frontend` (novo, dashboards), `Financeiro` (legado)

### Schema `hub_frontend` — Tabelas Conhecidas

| Tabela | Tipo | Descrição |
|--------|------|-----------|
| `fato_parada` | Fato | Paradas com FEL, coletores, outlook, realizado |
| `dim_embarcacao` | Dimensão | Embarcações (nome, sigla, hero_image_key) |
| `dim_fase_fel` | Dimensão | Fases FEL (código, descrição) |
| `fato_gmud` | Fato | GMUDs por parada (total, aprovadas, adição, exclusão, alteração, quebra) |
| `fato_obra_progresso` | Fato | Progresso por tipo (material, serviço, faturamento) |
| `fato_notificacao` | Fato | Notificações do sistema |
| `dim_capex_ano` | Dimensão | Capex por ano |
| `fato_capex_tipo_obra` | Fato | Capex por tipo de obra |
| `fato_capex_composicao` | Fato | Composição do Capex |
| `fato_capex_subsistema` | Fato | Subsistemas Capex |
| `fato_capex_historico_anual` | Fato | Histórico anual Capex |
| `fato_parada_tags` | Fato | Tags/coletores por parada |
| `dim_coletor` | Dimensão | Catálogo de coletores (código, descrição, cor) |

## Instruções

### 1. Regras de Segurança
- **NUNCA** executar DDL (CREATE, ALTER, DROP) sem plano e autorização do Carlos
- **NUNCA** executar DELETE/TRUNCATE em produção
- **NUNCA** expor connection strings
- Sempre fazer backup lógico antes de migration destrutiva
- Propor rollback para toda alteração de schema

### 2. Análise de Query
Para cada query analisada, reportar:
1. Tabelas envolvidas e tipo de join
2. Filtros e uso de índices
3. Estimativa de custo (se possível)
4. Sugestões de otimização
5. Índices recomendados

### 3. Estratégia de Performance para Frontend
- Priorizar queries rápidas para telas principais
- Propor views materializadas para dashboards
- Considerar tabelas agregadas para indicadores
- Avaliar cache (Redis) para dados com baixa taxa de mudança
- Separar consultas analíticas de transacionais

### 4. Padrão de Migrations
```
migrations/
  YYYYMMDD_HHMM_descricao.sql     # UP
  YYYYMMDD_HHMM_descricao_down.sql # DOWN (rollback)
```

Cada migration deve:
- Ser idempotente quando possível
- Incluir script de rollback
- Documentar impacto em queries existentes
- Não quebrar queries em execução

### 5. Naming Conventions
- Tabelas fato: `fato_<nome>`
- Tabelas dimensão: `dim_<nome>`
- Índices: `IX_<tabela>_<colunas>`
- Views: `vw_<nome>`
- Procedures: `sp_<nome>`

## Checklist de Entrega
- [ ] Script SQL revisado e testado
- [ ] Rollback documentado
- [ ] Impacto em queries existentes avaliado
- [ ] Índices necessários criados
- [ ] Performance validada
- [ ] CURRENT_CONTEXT.md atualizado

## Riscos
- Alteração de schema sem migration → drift entre ambientes
- Query sem índice em tabela grande → timeout no frontend
- Lock em tabela durante DDL → downtime
- Sem rollback → alteração irreversível
