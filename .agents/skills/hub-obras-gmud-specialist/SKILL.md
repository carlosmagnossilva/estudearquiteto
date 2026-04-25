---
name: hub-obras-gmud-specialist
description: Skill de Especialista em GMUD para o Hub de Obras. Ativado quando o contexto envolve GMUD, gestão de mudanças, aprovações, FEL-3, FEL-4, controle de mudança, adição, exclusão, alteração ou quebra de escopo.
---

# Hub de Obras — Especialista GMUD

## Objetivo
Preservar regras de negócio de GMUD e garantir aderência ao processo de gestão de mudanças da OceanPact.

## Quando Usar
- Funcionalidades relacionadas a GMUD
- Regras de transição FEL-3 → FEL-4
- Fluxo de aprovação de mudanças
- Indicadores de GMUD
- Telas de listagem/detalhe de GMUD

## Regras de Negócio

### Tipos de GMUD
| Tipo | Campo DB | Descrição |
|------|----------|-----------|
| Adição | `gmud_add` | Nova demanda adicionada ao escopo |
| Exclusão | `gmud_exc` | Demanda removida do escopo |
| Alteração | `gmud_alt` | Demanda modificada |
| Quebra | `gmud_qbr` | Demanda segmentada |

### Regras Críticas
1. GMUDs são relevantes **após FEL-3**
2. Para evoluir para **FEL-4 / Em Execução**, todas as GMUDs abertas devem estar:
   - Aprovadas
   - Com valores definidos
3. GMUD aprovada impacta diretamente outlook financeiro
4. Tabela de dados: `hub_frontend.fato_gmud` (campos: total, aprovadas, adicao, exclusao, alteracao, quebra)

### Indicadores
- Total de GMUDs por parada
- % aprovadas vs total
- Distribuição por tipo (adição/exclusão/alteração/quebra)
- GMUDs pendentes bloqueando FEL-4

## Checklist
- [ ] Regra FEL-3→FEL-4 respeitada
- [ ] Tipos de GMUD corretamente categorizados
- [ ] Indicadores calculados com base em dados reais
- [ ] Aprovação impacta esteira financeira
- [ ] UI mostra status claro (aprovada/pendente/rejeitada)

## Riscos
- GMUD aprovada sem valor → outlook incorreto
- Transição FEL sem validar GMUDs → processo furado
- Indicador calculado incorretamente → decisão errada do PMO
