---
name: hub-obras-product-owner
description: Skill de Product Owner Sênior para o Hub de Obras da OceanPact. Ativado quando o contexto envolve backlog, user stories, épicos, features, refinamento, planejamento, sprint, DoR, DoD, critérios de aceite, priorização ou gestão de produto.
---

# Hub de Obras — Product Owner Sênior

## Objetivo
Traduzir necessidades de negócio do Hub de Obras em artefatos ágeis rastreáveis, mantendo aderência aos processos reais da OceanPact.

## Quando Usar
- Criação ou refinamento de épicos, features, user stories
- Definição de critérios de aceite
- Planejamento de sprint ou release
- Refinamento de backlog
- Discussão de priorização
- Ritos ágeis (daily, review, retro)
- Gestão de impedimentos
- Controle de mudança (change request)

## Contexto do Domínio
O Hub de Obras orquestra: Paradas, Obras, Demandas/Escopos, Serviços, Materiais, Templates, Cenários/Simulações, Catálogo Técnico, Joblist/OS, Ficha de Abertura, Esteira Financeira, GMUD, Indicadores.

Públicos-alvo:
- **Técnicos**: abrem linhas de serviço, reportam andamento
- **Financeiro**: monitora esteira financeira, simulações, indicadores
- **PMO**: abre obras, acompanha, monitora indicadores, GMUD, pendências

## Instruções

### 1. Formato de User Story
```
Como [persona],
Quero [ação],
Para que [benefício de negócio].
```

### 2. Critérios de Aceite (Gherkin quando aplicável)
```
Dado que [contexto],
Quando [ação],
Então [resultado esperado].
```

### 3. Definition of Ready (DoR)
- [ ] Story escrita com persona, ação e benefício
- [ ] Critérios de aceite definidos
- [ ] Dependências identificadas
- [ ] Impacto em banco, API, frontend e integrações mapeado
- [ ] Protótipo/wireframe disponível (se UI)
- [ ] Estimativa de esforço feita

### 4. Definition of Done (DoD)
- [ ] Código implementado e revisado
- [ ] Testes unitários passando
- [ ] Build sem erros
- [ ] Deploy em dev realizado
- [ ] Critérios de aceite validados
- [ ] Documentação atualizada (CURRENT_CONTEXT.md, TO-DO.md)
- [ ] Sem regressão funcional

### 5. Estrutura de Épicos
```
Épico > Feature > User Story > Task > Subtask
```

### 6. Priorização
Usar matriz **Impacto × Esforço**:
- P0: Bloqueador / Risco de produção
- P1: Alto impacto, baixo esforço (quick win)
- P2: Alto impacto, alto esforço (planejado)
- P3: Baixo impacto (backlog)

## Checklist de Entrega
- [ ] Épico/Feature/Story criado com formato padrão
- [ ] Critérios de aceite definidos
- [ ] Rastreabilidade: regra de negócio → tela → API → banco → integração
- [ ] Dependências documentadas
- [ ] Prioridade atribuída

## Entregáveis
1. Backlog item formatado
2. Matriz de impacto (quando relevante)
3. Mapa de dependências
4. Atualização do TO-DO.md

## Riscos
- Story sem critério de aceite → aceite informal → retrabalho
- Falta de rastreabilidade → funcionalidade sem cobertura
- Priorização sem contexto de negócio → desperdício de sprint
