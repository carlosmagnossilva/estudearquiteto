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
- [ ] Implementar lógica de consumo da fila do Service Bus.
- [ ] Centralizar operações de escrita (INSERT/UPDATE) no banco de dados.

## 🔌 Integrações Externas (Prioridade 3)
- [ ] Desenvolver "Small Services" (Adaptadores).
- [ ] Padronizar mensagens de entrada para o Integrator via Service Bus.

## 🚀 Melhorias de DevOps
- [ ] Configurar logs centralizados.
- [ ] Implementar testes unitários nos middlewares de segurança.
