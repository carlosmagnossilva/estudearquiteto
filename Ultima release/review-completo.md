# MANUAL OPERACIONAL: Do Código Herdado ao Ambiente Azure Funcional

## Resumo Executivo

Este documento captura a jornada completa de 10+ horas de trabalho para levantar um repositório GitHub e ambiente Azure do zero, partindo de código Legacy contaminado com configurações antigas, segredos obsoletos e referências desatualizadas. O processo envolveu: limpeza do repo, criação de service principal, configuração de ACR, Container Apps, Static Web App, e pipeline CI/CD via GitHub Actions.

**Resultado final alcançado:**
- Repo: `github.com/carlosmagnossilva/estudearquiteto`
- Frontend: `https://nice-sea-0e6c6ea0f.7.azurestaticapps.net`
- BFF: `https://hub-bff-app.blackwater-be256f74.eastus.azurecontainerapps.io`
- Backend Core: `http://hub-core-app.internal.blackwater-be256f74.eastus.azurecontainerapps.io` (interno)
- Integrator: `hub-integrator-app` (interno)

---

## 1. Estado Inicial Encontrado

### 1.1 Codebase (antes)

```
/hub-core (Express + SQL Server + Service Bus)
/bff (Express + autenticação MSAL)
/hub-integrator (Express + Service Bus)
/public (React frontend)
/.github/workflows/deploy-azure.yml (VAZIO - sobrescrito inadvertidamente)
/.env (variáveis de desenvolvimento localhost)
```

### 1.2 Azure (existente)

| Recurso | Valor |
|--------|-------|
| Subscription ID | 4d869da8-320c-4c25-ad88-ac9df2c23fa5 |
| Tenant ID | 7a9dfddd-2ce9-4d8a-80ce-7ee6f58c8db9 |
| Resource Group | rg-hubdeobras-dev |
| Container Registry | crhubdeobrasdev.azurecr.io |
| Container Apps | hub-core-app, hub-bff-app, hub-integrator-app |
| Static Web App | swa-hubdeobras-dev |
| Service Bus | sb-hubdeobras-dev (fila: fila_sgo) |
| SQL Server | sqlhub04171601.database.windows.net |

### 1.3 Problemas Identificados

1. Workflow `.github/workflows/deploy-azure.yml` estava **vazio** (sobrescrito)
2. Repo antigo (`Aulas-Dev`) precisava ser deletado para recomeçar
3. Secrets do GitHub estavam com formato JSON inválido
4. Static Web App vinculada a repo inexistente
5. Variáveis de ambiente do frontend não injetadas corretamente no build
6. `hub-consumer` referenciado no workflow, mas o serviço correto era `hub-integrator`
7. ACR registry não configurado no hub-integrator-app - reiniciar revisão manualmente para forçar pull da imagem

---

## 2. Objetivo Final Atingido

### 2.1 Arquitetura Final

```
GitHub (main branch)
    ↓ push
GitHub Actions (workflow: deploy-azure.yml)
    ↓ build + push
Azure Container Registry (crhubdeobrasdev.azurecr.io)
    ├── bff:latest
    ├── hub-core:latest
    └── hub-integrator:latest
    ↓
Azure Container Apps (ACA)
    ├── hub-bff-app (público, porta 4000)
    ├── hub-core-app (interno, porta 5001)
    └── hub-integrator-app (interno)
    ↓
Azure Static Web App (frontend React)
    https://nice-sea-0e6c6ea0f.7.azurestaticapps.net
```

### 2.2 Services Conectados

- **Banco**: SQL Server (`db-hubdeobras-dev`)
- **Mensageria**: Service Bus (`sb-hubdeobras-dev`, fila `fila_sgo`)
- **Autenticação**: Azure AD (MSAL)

### 2.3 Endpoints Finais

| Serviço | URL |
|---------|-----|
| Frontend | https://nice-sea-0e6c6ea0f.7.azurestaticapps.net |
| BFF | https://hub-bff-app.blackwater-be256f74.eastus.azurecontainerapps.io |
| Core | http://hub-core-app.internal.blackwater-be256f74.eastus.azurecontainerapps.io:5001 |
| Integrator | http://hub-integrator-app (interno) |

---

## 3. Inventário de Componentes

### 3.1 GitHub

| Recurso | Valor |
|--------|-------|
| Repo | `carlosmagnossilva/estudearquiteto` |
| Branch | `main` |
| Secrets | `AZURE_CREDENTIALS`, `AZURE_STATIC_WEB_APPS_API_TOKEN` |
| Workflow | `.github/workflows/deploy-azure.yml` |

** secrets devem estar em formato JSON válido, exatamente:**
```json
{"clientId":"...","clientSecret":"...","subscriptionId":"4d869da8-320c-4c25-ad88-ac9df2c23fa5","tenantId":"7a9dfddd-2ce9-4d8a-80ce-7ee6f58c8db9"}
```

### 3.2 Azure

| Recurso | Tipo | Identificador |
|--------|------|-------------|
| crhubdeobrasdev | ACR | crhubdeobrasdev.azurecr.io |
| hub-bff-app | Container App | porta 4000, público |
| hub-core-app | Container App | porta 5001, interno |
| hub-integrator-app | Container App | interno |
| swa-hubdeobras-dev | Static Web App | nice-sea-0e6c6ea0f.7.azurestaticapps.net |
| sb-hubdeobras-dev | Service Bus | fila: fila_sgo |
| rg-hubdeobras-dev | Resource Group | - |

### 3.3 Variáveis de Ambiente (Frontend .env.production)

```
REACT_APP_AZURE_CLIENT_ID=f09f4ab4-94d1-4e3f-b94b-f6ff812f5e4d
REACT_APP_AZURE_TENANT_ID=7a9dfddd-2ce9-4d8a-80ce-7ee6f58c8db9
REACT_APP_AZURE_REDIRECT_URI=https://nice-sea-0e6c6ea0f.7.azurestaticapps.net
REACT_APP_AZURE_SCOPE=api://f09f4ab4-94d1-4e3f-b94b-f6ff812f5e4d/access_as_user
REACT_APP_BFF_URL=https://hub-bff-app.blackwater-be256f74.eastus.azurecontainerapps.io
```

---

## 4. Pré-requisitos

### 4.1 Acessos Necessários

- [ ] Conta GitHub com permissões de delete repo e admin
- [ ] Azure CLI logado (`az login`)
- [ ] Permissão de contributor no resource group `rg-hubdeobras-dev`
- [ ] Acesso ao portal do Azure AD para criar SP se necessário

### 4.2 Ferramentas

| Ferramenta | Como Instalar | Verificação |
|-----------|--------------|-------------|
| GitHub CLI | `winget install GitHub.cli` (reiniciar shell depois) | `gh auth status` |
| Azure CLI | já instalada | `az account show` |
| Node.js 22 | `winget install OpenJS.NodeJS` | `node -v` |
| Docker | opcional para build local | `docker -v` |

### 4.3 Credenciais Azure

O service principal criado precisa de:
- `contributor` no resource group `rg-hubdeobras-dev`

---

## 5. Passo a Passo: GitHub do Zero

### 5.1 Checklist Antes de Começar

```bash
# 1. Verificar estado atual
git remote -v
gh auth status
gh repo list
az account show

# 2. Verificar se existe repo antigo
gh repo view carlosmagnossilva/Aulas-Dev 2>$null
```

### 5.2 Preparação Inicial

**Se o repo antigo existir e estiver apontando para ele:**
```bash
# Atualizar scopes do gh para permitir delete
gh auth refresh -h github.com -s delete_repo

# Deletar repo antigo
gh repo delete carlosmagnossilva/Aulas-Dev --yes

# Atualizar scope workflow
gh auth refresh -h github.com -s workflow
```

### 5.3 Criar Novo Repo

**Iniciar git local (se não existir):**
```bash
git init
git add .
git commit -m "Initial commit"
```

**Renomear branch para main:**
```bash
git branch -m master main
```

**Criar repo remoto:**
```bash
gh repo create estudearquiteto --public --source=. --push
```

**Se der erro "refusing to allow OAuth App":**
```bash
gh auth refresh -h github.com -s workflow
git push -u origin main
```

### 5.4 Secrets do GitHub

**Criar service principal no Azure:**
```bash
az ad sp create-for-rbac \
  --name "github-actions-deploy" \
  --role contributor \
  --scopes /subscriptions/4d869da8-320c-4c25-ad88-ac9df2c23fa5/resourceGroups/rg-hubdeobras-dev \
  --output json
```

**Pegar o output (appId, password, tenant). Criar JSON corretamente:**
```json
{"clientId":"<appId>","clientSecret":"<password>","subscriptionId":"4d869da8-320c-4c25-ad88-ac9df2c23fa5","tenantId":"7a9dfddd-2ce9-4d8a-80ce-7ee6f58c8db9"}
```

**Gravar em arquivo e setar secret:**
```bash
# Arquivo: C:\temp\azure-creds.json
gh secret set AZURE_CREDENTIALS --body-file C:\temp\azure-creds.json -R carlosmagnossilva/estudearquiteto
```

**Secret da Static Web App:**
```bash
# Pegar token da SWA no portal ou via:
az staticwebapp get-api-token -n swa-hubdeobras-dev -g rg-hubdeobras-dev -o tsv

# Setar no GitHub
gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN -b "<token>" -R carlosmagnossilva/estudearquiteto
```

### 5.5 Restaurar Workflow

** Se o workflow foi perdido, recuperar do repo antigo (estude.arquiteto):**
```bash
# Baixar do repo antigo
curl -L https://raw.githubusercontent.com/carlosmagnossilva/estude.arquiteto/main/.github/workflows/deploy-azure.yml -o .github/workflows/deploy-azure.yml

# Substituir hub-consumer por hub-integrator (sed replaceAll)
sed -i 's/hub-consumer/hub-integrator/g' .github/workflows/deploy-azure.yml

# Commit e push
git add .github/workflows/deploy-azure.yml
git commit -m "Restore original Azure deployment workflow"
git push origin main
```

---

## 6. Passo a Passo: Azure do Zero

### 6.1 Checklist Antes de Começar

```bash
# Verificar login
az account show

# Verificar recursos existentes
az resource list -g rg-hubdeobras-dev --output table
az acr list -g rg-hubdeobras-dev --output table
az containerapp list -g rg-hubdeobras-dev --output table
```

### 6.2 Container Registry (ACR)

**Se não existir, criar:**
```bash
az acr create \
  --name crhubdeobrasdev \
  --resource-group rg-hubdeobras-dev \
  --sku Basic --location eastus
```

**Pegar credenciais:**
```bash
az acr credential show -n crhubdeobrasdev --query passwords[0].value -o tsv
```

### 6.3 Container Apps

**Se não existirem, criar:**

**hub-core-app:**
```bash
az containerapp create \
  --name hub-core-app \
  --resource-group rg-hubdeobras-dev \
  --environment env-hubdeobras-dev \
  --image mcr.microsoft.com/azuredocs/quickstart-containerapp灵魂 \
  --target-port 5001 \
  --ingress external false \
  --cpu 0.5 --memory 1Gi
```

**hub-bff-app:**
```bash
az containerapp create \
  --name hub-bff-app \
  --resource-group rg-hubdeobras-dev \
  --environment env-hubdeobras-dev \
  --image mcr.microsoft.com/azuredocs/quickstart-containerapp灵魂 \
  --target-port 4000 \
  --ingress external true \
  --cpu 0.5 --memory 1Gi
```

**hub-integrator-app:**
```bash
az containerapp create \
  --name hub-integrator-app \
  --resource-group rg-hubdeobras-dev \
  --environment env-hubdeobras-dev \
  --image mcr.microsoft.com/azuredocs/quickstart-containerapp灵魂 \
  --cpu 0.5 --memory 1Gi
```

### 6.4 Configurar Registry nos Container Apps

**Para cada app que precisa fazer pull do ACR:**
```bash
# O registry deve ser configurado na criação ou via secrets
# Verificar configuração atual:
az containerapp show -g rg-hubdeobras-dev -n hub-bff-app --query properties.configuration.registries
```

**Se não tiver registry, configurar o ACR como source de imagem:**
```bash
# O containerapp precisa ter o registry configurado para fazer pull
# Verificar se o app já consegue fazer pull:
# (se der erro UNAUTHORIZED, o registry precisa ser configurado)
```

### 6.5 Static Web App

**Se não existir, criar:**
```bash
az staticwebapp create \
  --name swa-hubdeobras-dev \
  --resource-group rg-hubdeobras-dev \
  --location eastus2 \
  --source https://github.com/carlosmagnossilva/estudearquiteto \
  --branch main \
  --app-location "/" \
  --output-location "build"
```

**Remapear repo (se já existir vinculada ao repo antigo):**
```bash
# Não é possível via CLI. Fazer no portal Azure:
# Static Web App > Configurações de compilação > Alterar repositório
```

**Pegar API token:**
```bash
# No portal: Static Web App > Gerenciamento de token > Generate token
# Ou via CLI (se disponível):
az staticwebapp get-api-token -n swa-hubdeobras-dev -g rg-hubdeobras-dev -o tsv
```

---

## 7. Configurações de CI/CD

### 7.1 Workflow GitHub Actions

**Arquivo: `.github/workflows/deploy-azure.yml`**

```yaml
name: Azure CI/CD - Hub de Obras

on:
  push:
    branches:
      - main
  workflow_dispatch:

env:
  ACR_NAME: crhubdeobrasdev
  RESOURCE_GROUP: rg-hubdeobras-dev
  ACA_ENV: env-hubdeobras-dev

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout path
        uses: actions/checkout@v4

      - name: Azure Login
        uses: azure/login@v2
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: ACR Login
        run: az acr login --name ${{ env.ACR_NAME }}

      - name: Build and Push Hub Core
        run: |
          docker build -t ${{ env.ACR_NAME }}.azurecr.io/hub-core:${{ github.sha }} -t ${{ env.ACR_NAME }}.azurecr.io/hub-core:latest -f hub-core/Dockerfile .
          docker push ${{ env.ACR_NAME }}.azurecr.io/hub-core:${{ github.sha }}
          docker push ${{ env.ACR_NAME }}.azurecr.io/hub-core:latest

      - name: Build and Push BFF
        run: |
          docker build -t ${{ env.ACR_NAME }}.azurecr.io/bff:${{ github.sha }} -t ${{ env.ACR_NAME }}.azurecr.io/bff:latest -f bff/Dockerfile .
          docker push ${{ env.ACR_NAME }}.azurecr.io/bff:${{ github.sha }}
          docker push ${{ env.ACR_NAME }}.azurecr.io/bff:latest

      - name: Build and Push Hub Integrator
        run: |
          docker build -t ${{ env.ACR_NAME }}.azurecr.io/hub-integrator:${{ github.sha }} -t ${{ env.ACR_NAME }}.azurecr.io/hub-integrator:latest -f hub-integrator/Dockerfile .
          docker push ${{ env.ACR_NAME }}.azurecr.io/hub-integrator:${{ github.sha }}
          docker push ${{ env.ACR_NAME }}.azurecr.io/hub-integrator:latest

  deploy-backends:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
      - name: Azure Login
        uses: azure/login@v2
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Deploy Hub Core
        run: |
          az containerapp update \
            --name hub-core-app \
            --resource-group ${{ env.RESOURCE_GROUP }} \
            --image ${{ env.ACR_NAME }}.azurecr.io/hub-core:latest

      - name: Deploy BFF
        run: |
          az containerapp update \
            --name hub-bff-app \
            --resource-group ${{ env.RESOURCE_GROUP }} \
            --image ${{ env.ACR_NAME }}.azurecr.io/bff:latest

      - name: Deploy Hub Integrator
        run: |
          # Reiniciar revisão para forçar pull da nova imagem
          az containerapp revision restart \
            --name hub-integrator-app \
            --resource-group ${{ env.RESOURCE_GROUP }} \
            --revision hub-integrator-app--0000001

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout path
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Build Frontend
        run: |
          npm install
          CI=false npm run build

      - name: Build And Deploy Frontend
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "build"
          api_location: ""
          output_location: "."
          skip_app_build: true
```

### 7.2 Arquivo .env.production (para build do frontend)

Criar arquivo `.env.production` na raiz do projeto:

```
REACT_APP_AZURE_CLIENT_ID=f09f4ab4-94d1-4e3f-b94b-f6ff812f5e4d
REACT_APP_AZURE_TENANT_ID=7a9dfddd-2ce9-4d8a-80ce-7ee6f58c8db9
REACT_APP_AZURE_REDIRECT_URI=https://nice-sea-0e6c6ea0f.7.azurestaticapps.net
REACT_APP_AZURE_SCOPE=api://f09f4ab4-94d1-4e3f-b94b-f6ff812f5e4d/access_as_user
REACT_APP_BFF_URL=https://hub-bff-app.blackwater-be256f74.eastus.azurecontainerapps.io
```

**Importante:** O create-react-app usa `.env.production` automáticamente no build de produção. Não usar `--env` na linha de comando - não funciona corretamente.

### 7.3 App Settings na Static Web App

```bash
az staticwebapp appsettings set \
  -n swa-hubdeobras-dev \
  -g rg-hubdeobras-dev \
  --setting-names \
    "REACT_APP_AZURE_CLIENT_ID=f09f4ab4-94d1-4e3f-b94b-f6ff812f5e4d" \
    "REACT_APP_AZURE_TENANT_ID=7a9dfddd-2ce9-4d8a-80ce-7ee6f58c8db9" \
    "REACT_APP_BFF_URL=https://hub-bff-app.blackwater-be256f74.eastus.azurecontainerapps.io"
```

---

## 8. Ordem Correta de Execução

### Fase 1: Limpeza (só se necessário)
1. Deletar repo antigo no GitHub
2. Verificar se há ресурos órfãos no Azure

### Fase 2: GitHub
1. Criar/limpar repo local
2. Criar repo remoto
3. Configurar secrets
4. Restaurar workflow

### Fase 3: Azure
1. Verificar ACR existente
2. Verificar Container Apps existentes
3. Verificar Static Web App

### Fase 4: Pipeline
1. Primeiro push para main
2. Verificar se o workflow dispara
3. Corrigir erros conforme aparecem

### Fase 5: Validação
1. Testar BFF /health
2. Testar Frontend
3. Verificar logs se algo falhar

---

## 9. Checklist de Validação por Etapa

### 9.1 Após GitHub Setup
```bash
# Verificar
gh secret list -R carlosmagnossilva/estudearquiteto
# Esperado: AZURE_CREDENTIALS, AZURE_STATIC_WEB_APPS_API_TOKEN
```

### 9.2 Após Primeiro Deploy
```bash
# Verificar imagens no ACR
az acr repository show -n crhubdeobrasdev --image bff:latest
az acr repository show -n crhubdeobrasdev --image hub-core:latest
az acr repository show -n crhubdeobrasdev --image hub-integrator:latest

# Verificar Container Apps
az containerapp show -g rg-hubdeobras-dev -n hub-bff-app --query properties.runningStatus
az containerapp show -g rg-hubdeobras-dev -n hub-core-app --query properties.runningStatus

# Testar BFF
curl https://hub-bff-app.blackwater-be256f74.eastus.azurecontainerapps.io/health
# Esperado: 200
```

### 9.3 Após Frontend Deploy
```bash
# Verificar SWA
curl https://nice-sea-0e6c6ea0f.7.azurestaticapps.net/
# Esperado: HTML com script tags

# Verificar JS bundle
curl https://nice-sea-0e6c6ea0f.7.azurestaticapps.net/static/js/main.*.js
# Esperado: 200 e conteúdo JS
```

---

## 10. Problemas Encontrados e Como Foram Resolvidos

### 10.1 secrets JSON inválido

**Sintoma:**
```
Login failed with SyntaxError: Expected property name or '}' in JSON at position 1
```

**Causa:** O secret foi setado com aspas simples ou formato errado.

**Solução:**
```bash
# Criar arquivo JSON corretamente
echo '{"clientId":"...","clientSecret":"...","subscriptionId":"...","tenantId":"..."}' > temp.json

# Usar --body-file
gh secret set AZURE_CREDENTIALS --body-file temp.json -R repo

# Ou usar stdin
cat temp.json | gh secret set AZURE_CREDENTIALS -b - -R repo
```

**Verificação:**
```bash
gh api repos/carlosmagnossilva/estudearquiteto/actions/secrets/AZURE_CREDENTIALS
# Se retornar {"name":"AZURE_CREDENTIALS",...} está certo
```

### 10.2 hub-consumer vs hub-integrator

**Sintoma:**
```
ERROR: failed to build: resolve: lstat hub-consumer: no such file or directory
```

**Causa:** O workfloworiginal referenciava `hub-consumer` mas o serviço correto é `hub-integrator`.

**Solução:**
```bash
# Substituir no workflow
sed -i 's/hub-consumer/hub-integrator/g' .github/workflows/deploy-azure.yml

# Atualizar Container App no Azure
# O nome do app é hub-integrator-app
az containerapp update -n hub-integrator-app -g rg-hubdeobras-dev \
  --image crhubdeobrasdev.azurecr.io/hub-integrator:latest
```

### 10.3 Frontend em branco

**Sintoma:**
```
Failed to find a default file in the app artifacts folder
```

**Causa:** O workflow estava usando `app_location: "public"` em vez de `build`.

**Solução:**
```yaml
app_location: "build"   # onde está o index.html compilado
output_location: "."    # raiz dentro de build
```

### 10.4 Variáveis de ambiente não injetadas

**Sintoma:**
```
Cannot read properties of undefined (reading 'toLowerCase')
at CacheManager.ts
```

**Causa:** `process.env.REACT_APP_*` eram undefined porque o build não injetava as variáveis.

**Solução:**
- Criar arquivo `.env.production` com as variáveis
- O create-react-app automaticamente usa esse arquivo no build
- Não usar `--env` na linha de comando - não funciona

### 10.5 ACR Unauthorized no hub-integrator

**Sintoma:**
```
Invalid value: "crhubdeobrasdev.azurecr.io/hub-integrator:latest":
GET https:...UNAUTHORIZED: authentication required
```

**Causa:** O Container App não tinha credenciais do ACR configuradas.

**Solução:**
```bash
# Reiniciar revisão para forçar pull
az containerapp revision restart \
  -n hub-integrator-app \
  -g rg-hubdeobras-dev \
  --revision hub-integrator-app--0000001
```

**Nota:** Para evitar isso no futuro, configurar o registry via portal OU usar userassigned identity.

### 10.6 Indentação inválida no workflow

**Sintoma:**
```
This run likely failed because of a workflow file issue
```

**Causa:** Um passo do workflow ficou sem indentação correta (3 espaços a menos).

**Solução:**
```bash
# Verificar com
cat -A .github/workflows/deploy-azure.yml | grep "^- name"

# Corrigir manualmente - todos os steps dentro de jobs devem ter 6 espaços de indentação
```

---

## 11. Armadilhas e Falsos Positivos

### 11.1 Armadilhas

| Armadilha | Sinal | Como Evitar |
|----------|-------|-----------|
| Secrets com aspas simples | JSON parse error | Usar arquivo JSON puro |
| Branch master vs main | Pipeline não dispara | Usar sempre `main` |
| .env.production vs --env | Vars undefined no build | Usar arquivo de ambiente |
| app_location errado | Frontend em branco | Apontar para pasta build |
| hub-consumer herdado | Build fail | Verificar/nomear corretamente |
| Registry não configurado | Unauthorized | Configurar ACR no app |
| SWA vinculada a repo velho | Deploy não funciona | Remapear no portal |

### 11.2 Sinais de Estar no Caminho Certo

| Sinal | Significa |
|-------|----------|
| Login succeeded no Azure | Credenciais OK |
| image digest: sha256:... | Build/push OK |
| Status: Succeeded no deploy | App atualizado |
| HTML com script tag | Frontend carregando |
| /health retorna 200 | Service rodando |

### 11.3 Sinais de Estar no Caminho Errado

| Sinal | Significa |
|-------|----------|
| Login failed (JSON parse) | Secret mal formatado |
| no such file or directory | Nome de serviço errado |
| UNAUTHORIZED | Registry não configurado |
| Failed to find index.html | app_location errado |
| undefined (reading toLowerCase) | Vars de ambiente faltando |

---

## 12. Troubleshooting

### 12.1 Primeiros Lugares para Investigar Quando Falhar

**Pipeline non dispara:**
1. Verificar se branch está correta (`main`)
2. Verificar workflow está na branch certa
3. Checar se há erros de sintaxe no YAML

**Build fail:**
1. Verificar nome dos Dockerfiles
2. Verificar se pasta do serviço existe
3. Verificar se há node_modules na pasta

**Deploy fail:**
1. Verificar logs do workflow: `gh run view <id> --log-failed`
2. Verificar status do Container App: `az containerapp show -n <app> -g <rg> --query properties.provisioningState`
3. Verificar se ACR tem a imagem

**Frontend em branco:**
1. Verificar se build artifacts existem: `ls build/`
2. Verificar se index.html está em build/
3. Verificar app_location no workflow
4. Testar JS bundle diretamente

**Erro de autenticação:**
1. Verificar secrets: `gh secret list`
2. Testar SP: `az login --service-principal`
3. Verificar escopo da SP

### 12.2 Árvore de Decisão

```
Pipeline falhou
├── No run?
│   ├── Verificar branch (main)
│   └── Verificar workflow YAML
├── Run existe mas não iniciou job?
│   └── Verificar secrets
├── Job falhou no login?
│   └── Secret formato JSON errado
│       └── Corrigir secret
├── Job falhou no build?
│   ├── Dockerfile não encontrado
│   └── Verificar nome/pasta
├── Job falhou no deploy?
│   ├── App não existe
│   ├── Imagem não existe no ACR
│   └── Registry não configurado
```

---

## 13. Runbook de Execução Rápida

### Dia 1: Preparação

1. **Verificar estado atual**
```bash
git remote -v
gh repo list
az account show
az resource list -g rg-hubdeobras-dev --output table
```

2. **Se preciso resetar repo**
```bash
gh auth refresh -s delete_repo
gh repo delete <repo-antigo> --yes
gh auth refresh -s workflow
```

3. **Setup inicial**
```bash
git init  # se necessário
git add .
git commit -m "Initial commit"
git branch -m master main
gh repo create <novo-repo> --public --source=. --push
```

4. **Configurar secrets**
```bash
# Criar SP
az ad sp create-for-rbac --name github-actions-deploy --role contributor --scopes /subscriptions/<sub-id>/resourceGroups/rg-hubdeobras-dev

# Criar JSON e setar
gh secret set AZURE_CREDENTIALS --body-file creds.json -R <repo>
gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN -b "<token>" -R <repo>
```

5. **Restaurar/configurar workflow**
```bash
# Se tem backup, restaurar
# Substituir hub-consumer -> hub-integrator
# Commit e push
```

### Dia 2: Deploy Inicial

1. **Primeiro push**
```bash
git push origin main
```

2. **Monitorar workflow**
```bash
gh run list -R <repo> --limit 1
gh run view <run-id> --log-failed
```

3. **Corrigir erros conforme aparecem**

### Dia 3: Validação

1. **Testar serviços**
```bash
# BFF
curl https://hub-bff-app.blackwater-be256f74.eastus.azurecontainerapps.io/health

# Frontend
curl https://nice-sea-0e6c6ea0f.7.azurestaticapps.net/
```

2. **Verificar logs se algo falhar**

---

## 14. Não Esqueça Disso

### Pontos Mais Fáceis de Perder

1. **Scopes do gh** - atualizar para `delete_repo` e `workflow` antes de operar
2. **Branch main vs master** - sempre verificar
3. **Formato JSON dos secrets** - aspas duplas, sem aspas externas
4. **.env.production** - criar, não usar --env
5. **hub-consumer vs hub-integrator** - verificar nomes
6. **app_location** - deve apontar para pasta build, não pasta public
7. **output_location** - deve ser "." para build, não "build"
8. **reiniciar revisão** - às vezes necessário para forçar pull

### Detalhes que Destravaram Tudo

1. **.env.production** - O create-react-app injeta automaticamente
2. **CI=false** no build - Evita erros de ESLint tratados como falha
3. **revision restart** - Resolve unauthorized do ACR
4. **app_location: build** - O index.html compilado está em build/, não em public/

---

## 15. Diferença Entre O Que Parecia Problema e O Que Era Problema de Verdade

| Parecia problema | Era problema? | Problema real |
|---------------|-------------|-------------|
| Static Web App não funciona | Não | Estava vinculada a repo antigo |
| BFF não funciona | Não | Precisava só atualizar imagem |
| Frontend em branco | Sim | app_location errado |
| API call fail | Sim | Vars de ambiente não injetadas |
| ACR Unauthorized | Sim | Registry não configurado no app |
| Login fail | Sim | JSON secret mal formatado |
| Build fail | Sim | Nomehub-consumer herdado |

---

## 16. Lições Aprendidas

1. **Sempre verificar o remote antes de operar** - `git remote -v` e `gh repo list`

2. **Scopes do gh requerem refresh** - `delete_repo` e `workflow` precisam ser solicitados explicitamente

3. **Secrets precisam de JSON válido** - Arquivo puro, não echo com aspas

4. **frontend precisa de .env.production** - O --env no comando não funciona

5. **app_location deve ser "build"** - Não "public", não "."

6. **Container Apps com ACR precisam de registry configurado** - Ou reiniciar revisão

7. **hub-consumer era herdado** - Nome correto é hub-integrator

8. **Prefira inferência a invenção** - Quando不确定, verificar no Azure o que existe

---

## 17. Critérios de "Ambiente Pronto"

- [ ] Repo criado no GitHub com workflow correto
- [ ] Secrets configurados (AZURE_CREDENTIALS, AZURE_STATIC_WEB_APPS_API_TOKEN)
- [ ] Imagens no ACR (bff, hub-core, hub-integrator)
- [ ] Container Apps rodando
- [ ] BFF respondendo em /health (200)
- [ ] Frontend carregando (HTML com script)
- [ ] Frontend executando JS (_MSAL carrega sem erro de undefined)

---

## 18. Validação Final

```bash
# 1. Verificar repo
gh repo view carlosmagnossilva/estudearquiteto

# 2. Verificar secrets
gh secret list -R carlosmagnossilva/estudearquiteto

# 3. Verificar ACR
az acr repository list -n crhubdeobrasdev

# 4. Verificar Container Apps
az containerapp list -g rg-hubdeobras-dev --output table

# 5. Testar BFF
curl -s -o /dev/null -w "%{http_code}" https://hub-bff-app.blackwater-be256f74.eastus.azurecontainerapps.io/health

# 6. Testar Frontend
curl -s -o /dev/null -w "%{http_code}" https://nice-sea-0e6c6ea0f.7.azurestaticapps.net/
curl -s https://nice-sea-0e6c6ea0f.7.azurestaticapps.net/ | Select-String "script"
```

---

## 19. Plano de Continuidade

Para manter o ambiente:

1. **Push para main** dispara deploy automático
2. **workflow_dispatch** permite deploy manual
3. Monitorar em: https://github.com/carlosmagnossilva/estudearquiteto/actions

Para atualizar secrets:
```bash
gh secret set AZURE_CREDENTIALS --body-file novo.json -R carlosmagnossilva/estudearquiteto
```

Para atualizar variáveis do frontend:
1. Editar `.env.production`
2. Commit e push
3. Workflow rebuilda automaticamente

---

## 20. Referências

- Azure Login Action: https://github.com/Azure/login
- Static Web Apps Deploy: https://github.com/Azure/static-web-apps-deploy
- Azure CLI Container Apps: https://learn.microsoft.com/cli/azure/containerapp
- GitHub CLI: https://cli.github.com

---

## Histórico de Versão

| Versão | Data | Descrição |
|-------|------|-----------|
| 1.0 | 2026-04-20 | Versão inicial baseada na conversa de 10+ horas |

---

**Documento produzido em:** 2026-04-20
**Baseado em:** Conversa completa entre agente e usuário
**Objetivo:** Transferência total de contexto para continuidade operacional