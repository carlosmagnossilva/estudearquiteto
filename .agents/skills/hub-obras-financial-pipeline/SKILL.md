---
name: hub-obras-financial-pipeline
description: Skill de Especialista em Esteira Financeira para o Hub de Obras. Ativado quando o contexto envolve esteira financeira, orçamento, capex, outlook, realizado, coletores, indicadores financeiros, simulação de cenário, waterfall ou exportação financeira.
---

# Hub de Obras — Especialista Esteira Financeira

## Objetivo
Garantir integridade e rastreabilidade da esteira financeira do Hub de Obras.

## Quando Usar
- Módulo financeiro (grid, cards, indicadores)
- Dashboard Capex
- Simulações de cenário
- Exportação financeira (PDF/Excel)
- Indicadores de orçamento

## Esteira Financeira — Fases

| Fase | Descrição |
|------|-----------|
| Orçamento Estimado | Primeira estimativa de custo |
| Orçamento Cotado | Valores após cotação com fornecedores |
| Orçamento Comprometido | Valores com contratos assinados |
| Orçamento Empenhado | Valores reservados para pagamento |
| Orçamento Realizado | Valores efetivamente pagos |

## Coletores (Tipos de Obra)

| Código | Descrição | Campo |
|--------|-----------|-------|
| NC | Não Classificado | `nc_perc` / `percNC` |
| ES | Estrutural | `es_perc` / `percES` |
| CO | Complementar | `co_perc` / `percCO` |
| EM | Emergencial | `em_perc` / `percEM` |
| RE | Regular | `re_perc` / `percRE` |

## Dados do Schema

| Tabela | Uso Financeiro |
|--------|---------------|
| `fato_parada` | `outlook_brl_m`, `realizado_brl_m`, coletores |
| `dim_capex_ano` | Capex anual |
| `fato_capex_composicao` | Composição por categoria |
| `fato_capex_tipo_obra` | Capex por tipo |
| `fato_capex_historico_anual` | Série histórica |
| `fato_capex_subsistema` | Por subsistema |

## Endpoints
- `GET /core/financeiro/obras` → lista obras com dados financeiros
- `GET /core/financeiro/indicadores?ano=YYYY` → evolução, waterfall, gastos, detalhamento
- `GET /core/capex?ano=YYYY` → outlook, tipos, composição, subsistemas, histórico

## Componentes Frontend
- `FinanceiroModule.tsx` — módulo pai (estado elevado)
- `FinancialObrasGrid.tsx` — visão em grade
- `FinancialObrasCards.tsx` — visão kanban
- `FinancialIndicadores.tsx` — gráficos e indicadores
- `PPUManager.tsx` — gestão de PPUs

## Checklist
- [ ] Valores financeiros com precisão decimal (BRL_M = milhões)
- [ ] Coletores somam 100% por parada
- [ ] Waterfall consistente (Outlook = Executado + Comprometido)
- [ ] Exportação PDF em landscape com tema light
- [ ] Exportação Excel com BOM UTF-8
- [ ] Indicadores calculados a partir de dados reais (não mock)

## Riscos
- Arredondamento incorreto → divergência com Protheus/SGO
- Mock data residual → decisão financeira baseada em dado falso
- Coletor sem cor → UI inconsistente
- Waterfall não balanceado → erro de apresentação
