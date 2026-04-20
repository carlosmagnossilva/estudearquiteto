# TO-DO-OPENCODE - Análise de Aderência Arquitetura vs Implementação

## 1. Visão Geral

| Artefato | Status |
|----------|--------|
| Arquitetura de Serviços | ✅ Alinhado |
| Pipeline CI/CD | ✅ Alinhado |
| Azure Resources | ✅ Alinhado |
| Autenticação/Segurança | ✅ Implementado |
| Hub-Integrator | ⚠️ Parcial |
| Integrações Externas | ❌ Pendente |

---

## 2. Itens Concluídos (Conformes à Arquitetura)

### 2.1 Frontend (React + MSAL)
- Autenticação Azure AD com MSAL
- Componentes: LoginPage, CapexDashboard, PublishSgoPage
- Integração com BFF via `useBff` hook
- Static Web App: `swa-hubdeobras-dev`

### 2.2 BFF (Backend for Frontend)
- Proxy para Hub-Core
- Middleware JWT (`jose`) com validação Azure AD
- Token forwarding para Core
- Fallback mock em caso de falha
- Rotas: `/bff/paradas`, `/bff/updates`, `/bff/capex`, `/bff/paradas/publish`

### 2.3 Hub-Core
- API REST com Express
- Autenticação JWT
- Integração com Service Bus (fila_sgo)
- Queries: `queryParadas`, `queryUpdates`, `queryCapex`
- Endpoints: `/core/paradas`, `/core/updates`, `/core/capex`, `/core/paradas/publish`

### 2.4 Azure Resources
- Service Bus: `sb-hubdeobras-dev`
- SQL Server: `sqlhub04171601`
- ACR: `crhubdeobrasdev`
- Container Apps: `hub-core-app`, `hub-bff-app`, `hub-consumer-app`
- Static Web App: `swa-hubdeobras-dev`
- Log Analytics: `log-hubdeobras-dev`

### 2.5 Pipeline CI/CD
- `.github/workflows/deploy-azure.yml`
- Build/push Docker para ACR
- Deploy Container Apps
- Build/deploy Frontend para Static Web App

---

## 3. Itens Pendentes / Divergências

### 3.1 Hub-Integrator (Pendente)
- **Arquitetura**: O Integrator deve ser o único a escrever no banco
- **Implementado**: `hub-consumer` existe mas lógica de write está com TODO
- **Ação**: Implementar `upsertParadas()` e demais operações de escrita

### 3.2 hub-integrator Workspace (Pendente)
- **Arquitetura**: Define `hub-integrator` como workspace separado
- **Implementado**: Não existe pasta `hub-integrator` no monorepo
- **Ação**: Decidir se usa `hub-consumer` atual ou cria workspace dedicado

### 3.3 small Services / Adaptadores (Pendente)
- **Arquitetura**: Sistemas externos -> Small Services -> Service Bus -> Integrator
- **Implementado**: Não existem adaptadores
- **Ação**: Definir escopo e desenvolver conforme necessidade

### 3.4 Mensageria - Fila de Entrada (Pendente)
- **Arquitetura**: Filas para receber dados externos (Sistemas -> Hub)
- **Implementado**: Apenas `fila_sgo` para saída (SGO)
- **Ação**: Criar filas de ingress conforme integração externa necessária

---

## 4. Sugestões de Melhoria

### 4.1 Documentação de Domínio
- **Recomendação**: Extrair e documentar schemas do banco de dados
- **Recomendação**: Definir explicitamente entidades (Obra, Contrato, Medição, Fiscal, Empresa, Funcionário)

### 4.2 Middleware de Autenticação
- **Recomendação**: Refinar validação no backend conforme notas do TO-DO.md
- **Recomendação**: Adicionar testes unitários para `authMiddleware`

### 4.3 Observabilidade
- **Recomendação**: Configurar logs centralizados no Log Analytics
- **Recomendação**: Adicionar Application Insights para tracing

### 4.4 Estrutura de Código
- **Recomendação**: Criar pasta `src/controllers` ou `src/routes` para desacoplar rotas
- **Recomendação**: Adicionar `src/services` para lógica de negócio
- **Recomendação**: Criar testes com Jest/Supertest

### 4.5 Pipeline
- **Recomendação**: Adicionar step de lint/test antes do build
- **Recomendação**: Adicionar análise de segurança (dependabot, code scanning)

---

## 5. Riscos Identificados

| Risco | Severidade | Observação |
|-------|------------|-------------|
| Integrator sem lógica de write | Alta | Impede fluxo completo de dados |
| Falta de testes | Média | Impacta manutenibilidade |
| Logs não centralizados | Média | Dificulta troubleshooting |
| Integrações externas não definidas | Alta | Arquitetura incompleta |

---

## 6. Próximos Passos Recomendados

1. **Imediato**: Implementar lógica de escrita no Hub-Integrator
2. **Curto prazo**: Adicionar testes unitários aos middlewares
3. **Curto prazo**: Configurar logs centralizados
4. **Médio prazo**: Definir escopo das integrações externas
5. **Médio prazo**: Criar adaptadores conforme necessidade

---

*Documento gerado via análise automática de código e artefatos de arquitetura.*
*Responsável: opencode*
*Data: 2026-04-19*