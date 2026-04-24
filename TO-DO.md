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
- [/] Implementar lógica de consumo da fila do Service Bus (Base iniciada).
- [/] Centralizar operações de escrita (INSERT/UPDATE) no banco de dados (Lógica de Upsert inicial implementada).

## ⚡ Backend & Frontend Sync
- [x] Unificar consultas no esquema `hub_frontend` (Core e Scripts).
- [x] Corrigir bugs de tipagem no shared-types (Propriedade `cor`).
- [x] Adaptar Módulo Financeiro para Temas Light/Dark.
- [x] Implementar tags numéricas minimalistas no Grid.
- [ ] Implementar a lógica de Upsert completa no Integrator.

## 🚀 Melhorias de DevOps
- [x] Configurar `pnpm-workspace.yaml` para suporte nativo a monorepo.
- [ ] Configurar logs centralizados.
- [ ] Implementar testes unitários nos middlewares de segurança.
