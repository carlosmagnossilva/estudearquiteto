---
name: hub-obras-devops-azure
description: Skill de DevOps / Cloud Sênior Azure para o Hub de Obras. Ativado quando o contexto envolve Azure, deploy, pipeline, CI/CD, Container Apps, ACR, Service Bus, SQL Azure, Key Vault, Application Insights, infraestrutura, Dockerfile, GitHub Actions ou configuração de ambiente.
---

# Hub de Obras — DevOps / Cloud Sênior Azure

## Objetivo
Garantir infraestrutura segura, reprodutível e observável no Azure para o Hub de Obras.

## Quando Usar
- Deploy ou configuração de recursos Azure
- Alteração de pipeline CI/CD
- Configuração de Container Apps, ACR, Service Bus
- Troubleshooting de infraestrutura
- Gestão de secrets e variáveis de ambiente
- Análise de custos Azure
- Configuração de networking e RBAC

## Inventário Azure (rg-hubdeobras-dev)

| Recurso | Nome | Tipo |
|---------|------|------|
| Container App | `hub-core-app` | API Core (porta 5001) |
| Container App | `hub-bff-app` | BFF Gateway (porta 4000) |
| Container App | `hub-integrator-app` | Worker Service Bus |
| Container App Env | `env-hubdeobras-dev` | Ambiente ACA |
| Static Web App | `swa-hubdeobras-dev` | Frontend React |
| ACR | `crhubdeobrasdev` | Container Registry |
| SQL Server | `sqlhub04171601` | Azure SQL |
| Service Bus | `sb-hubdeobras-dev` | Mensageria |
| Log Analytics | `log-hubdeobras-dev` | Logs |

### Recursos Planejados (não implementados)
- Azure Key Vault
- Azure Cache for Redis
- Application Insights
- Front Door / WAF
- Container Apps Jobs

## Instruções

### 1. Regras de Segurança
- **NUNCA** executar ações destrutivas sem confirmação explícita do Carlos
- Ações destrutivas incluem:
  - `az group delete`, `az containerapp delete`, `az sql db delete`
  - `az keyvault purge`, `az servicebus namespace delete`
  - Alteração de RBAC/IAM
  - Force push, remoção de branch
  - Alteração de pipeline com impacto em deploy
- **NUNCA** expor secrets, connection strings ou credenciais em output
- Sempre estimar custo Azure antes de propor novo recurso

### 2. Pipeline CI/CD
**Arquivo**: `.github/workflows/deploy-azure.yml`
- Trigger: push em `main` + workflow_dispatch
- Jobs: build-and-push → deploy-backends + deploy-frontend
- ACR: `crhubdeobrasdev.azurecr.io`
- Tags: `latest` + `github.sha`

### 3. Dockerfiles
Todos usam multi-stage build (Node 18-slim):
- `bff/Dockerfile` → porta 4000
- `hub-core/Dockerfile` → porta 5001
- `hub-integrator/Dockerfile` → sem porta exposta (worker)

### 4. Comunicação Interna
- BFF → Core: via URL interna ACA (`http://hub-core-app.internal.{env}.eastus.azurecontainerapps.io:5001`)
- Core → Service Bus: via connection string
- Integrator → Service Bus: consome `fila_sgo`
- Integrator → SQL: escrita direta

### 5. Checklist de Deploy
- [ ] Build local passa sem erros
- [ ] Dockerfile testado localmente (opcional)
- [ ] Variáveis de ambiente verificadas
- [ ] Secrets não expostos no workflow
- [ ] Pipeline executada com sucesso
- [ ] Health check respondendo (/health)
- [ ] Logs verificados no Container App

### 6. Estimativa de Custos
Sempre que propor novo recurso, incluir:
- Custo mensal estimado (Azure Calculator)
- Tier/SKU recomendado
- Comparação com alternativas
- Impacto no custo atual

## Checklist de Entrega
- [ ] Recurso criado/atualizado conforme especificação
- [ ] Sem secrets expostos
- [ ] Pipeline funcional
- [ ] Custo estimado documentado
- [ ] CURRENT_CONTEXT.md atualizado

## Riscos
- Alterar env vars em Container App sem backup → downtime
- Criar recurso sem estimar custo → gasto inesperado
- Alterar networking → perda de comunicação entre serviços
- Pipeline sem testes → deploy de código quebrado
