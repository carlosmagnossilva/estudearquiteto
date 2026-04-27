# Hub de Obras - Roadmap de Implementação

```text
      [ USUÁRIO ]
           │
           ▼
 ┌─────────────────────────┐
 │ FRONTEND (SWA / MSAL)   │
 └────────────┬────────────┘
              │ (HTTPS + JWT)
              ▼
 ┌─────────────────────────┐
 │    BFF (Container App)  │ ───▶ [ Azure AD / JWKS ]
 │    Autenticação 'jose'  │
 └────────────┬────────────┘
              │ (Comunic. Interna via Redes ACA)
              ▼
 ┌─────────────────────────┐      ┌─────────────────┐
 │  HUB-CORE (Container)   ├─────▶│ AZURE SERVICE   │
 │  Endpoint de Dados      │      │ BUS (Fila_SGO)  │
 └────────────┬────────────┘      └────────┬────────┘
              │                            │
              ▼                            ▼
 ┌─────────────────────────┐      ┌─────────────────┐
 │   AZURE SQL DATABASE    │◀─────┤ HUB-INTEGRATOR  │
 │   (Estado Persistente)  │      │ (Worker / Node) │
 └─────────────────────────┘      └─────────────────┘
```

## 🔐 Segurança & Autenticação (Prioridade 1)
- [x] Implementar middleware de validação de token JWT no **BFF**.
- [x] Implementar middleware de validação de token JWT no **Hub-Core**.
- [x] Integrar validação com Azure AD (MSAL).
> **Nota técnica:** Implementação de middleware baseada na biblioteca `jose`. O fluxo valida tokens JWT (Bearer) verificando assinatura, expiração, emissor (`iss`) e audiência (`aud`). Ajustado para aceitar tanto o Client ID quanto a URI do App ID (`api://...`), corrigindo erros 401 em ambiente local. Aplicado no BFF e Hub-Core.

## 🔨 Hub-Integrator (Prioridade 2)
- [x] Criar estrutura do serviço `hub-integrator` na pasta `hub-consumer`.
- [x] Implementar lógica de consumo da fila do Service Bus (Base iniciada).
- [x] Centralizar operações de escrita (INSERT/UPDATE) no banco de dados (Lógica de Upsert com MERGE implementada).

## ⚡ Backend & Frontend Sync
- [x] Unificar consultas no esquema `hub_frontend` (Core e Scripts).
- [x] Corrigir bugs de tipagem no shared-types (Propriedade `cor`).
- [x] Adaptar Módulo Financeiro para Temas Light/Dark.
- [x] Implementar tags numéricas minimalistas no Grid.
- [x] Implementar Filtro de Busca (ID / Embarcação).
- [x] Implementar Visão de Cards (Kanban) no Módulo Financeiro
- [x] Implementar drag-to-scroll (Kanban e Grid)
- [x] Adicionar opções de colapso de cards (Individual e Global)
- [x] Implementar Exportação PDF (Relatório Paisagem) e Excel (CSV Seguro)
- [x] Refatorar arquitetura do módulo (Elevação de estado e constantes)
- [x] Implementar Filtro de Status (Pipeline FEL completo).
- [x] Implementar Filtro de Tipo de Obra (Código - Descrição).
- [x] Implementar a lógica de Upsert completa no Integrator.
- [x] Implementar hook `useResponsive` para detecção centralizada de viewport.
- [x] Implementar Skeleton Screens no Módulo Financeiro.
- [x] Otimizar Sidebar (Drawer) e Kanban para Mobile.
- [x] Implementar exibição condicional e responsiva da "Taxinha" (Pin).
- [x] Corrigir scroll vertical na home em resoluções menores.
- [x] Criar script de sumário de portas para desenvolvedores.

## 📦 Modelagem Transacional (hub_core)
- [x] Mapear hierarquia real: Obra -> Tipo Obra -> Entrega -> Serviço -> Material.
- [x] Mapear requisitos de Estaleiro (PPUs e VORs).
- [x] Definir estratégia de Snapshots para integridade histórica.
- [ ] Implementar migrations para criação do schema `hub_core`.
- [ ] Implementar trigger/job de sincronização entre `hub_core` e `hub_frontend`.
- [ ] Adaptar o `hub-integrator` para gravar simultaneamente no transacional.
- [ ] **US05**: Detalhamento Administrativo (Aba Sobre a Obra).
- [ ] **US06**: Dashboard Executivo de Obra (Aba Visão Geral).
- [ ] **US07**: Gestão de Entregas e Resumo de Facilidades (Aba Entrega).
- [ ] **US08**: Centro de Controle de Serviços (Aba Serviços - TM Master & Hub).
