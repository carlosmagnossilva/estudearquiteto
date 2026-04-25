---
name: hub-obras-integration-architect
description: Skill de Arquiteto de Integração para o Hub de Obras. Ativado quando o contexto envolve integrações externas, Service Bus, mensageria, filas, adaptadores, SGO, TM Master, Protheus, Fluig, WMS, Narwal, BM, BI, hub-integrator ou fluxo de dados entre sistemas.
---

# Hub de Obras — Arquiteto de Integração

## Objetivo
Projetar e manter integrações seguras e rastreáveis entre o Hub de Obras e sistemas corporativos da OceanPact.

## Quando Usar
- Novo fluxo de integração com sistema externo
- Alteração no hub-integrator
- Configuração de filas Service Bus
- Criação de adaptadores
- Troubleshooting de mensageria

## Sistemas Externos

| Sistema | Função | Status Integração |
|---------|--------|-------------------|
| SGO | Sistema de Gestão de Obras | Parcial (fila_sgo, publish) |
| TM Master | Gestão de embarcações | Pendente |
| Protheus | ERP financeiro (TOTVS) | Pendente |
| Fluig | BPM / Workflow | Pendente |
| WMS | Gestão de materiais | Pendente |
| Narwal | Gestão de contratos | Pendente |
| BM | Business Management | Pendente |
| BI | Business Intelligence | Pendente |

## Arquitetura de Integração

```
Sistemas Externos
    │
    ▼
Small Services (Adaptadores)  ← NÃO IMPLEMENTADOS
    │
    ▼
Azure Service Bus (Filas)
    │
    ▼
Hub-Integrator (Worker)
    │
    ▼
Azure SQL (hub_frontend)
```

## Estado Atual
- **Service Bus**: `sb-hubdeobras-dev`, fila `fila_sgo`
- **Hub-Integrator**: consome `fila_sgo`, faz upsert em `fato_parada`
- **Fluxo implementado**: Core publica snapshot → SB → Integrator → SQL
- **Fluxo de ingress**: NÃO implementado (sistemas externos → Hub)

## Padrão de Mensagem Service Bus
```json
{
  "timestamp": "ISO8601",
  "servico": "nome-do-produtor",
  "acao": "tipo_da_acao",
  "payload": [...]
}
```

## Instruções

### 1. Para novo adaptador
1. Definir sistema de origem e dados a integrar
2. Criar fila dedicada no Service Bus
3. Implementar small service (adaptador) que:
   - Conecta ao sistema externo
   - Transforma dados para formato padrão
   - Publica na fila
4. Atualizar hub-integrator para consumir nova fila
5. Implementar upsert específico

### 2. Checklist
- [ ] Fila criada no Service Bus
- [ ] Adaptador implementado
- [ ] Formato de mensagem documentado
- [ ] Integrator atualizado
- [ ] Upsert testado
- [ ] Erro tratado (dead-letter)
- [ ] Logs de rastreabilidade

## Riscos
- Mensagem sem schema validation → dados corrompidos
- Sem dead-letter → mensagem perdida
- Sem idempotência → dados duplicados
- Integrator único para todas as filas → gargalo
