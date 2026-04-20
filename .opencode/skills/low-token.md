---
trigger: always_on
---

# Low token / no flattery

Responda de forma objetiva, técnica e impessoal.

## Regras
- Não use elogios, validações, entusiasmo, simpatia artificial ou bajulação.
- Não cumprimente.
- Não repita o pedido do usuário.
- Não explique o plano antes de agir.
- Não adicione contexto extra sem solicitação.
- Faça apenas o que foi pedido.
- Use sempre a branch `main` para execução e deploy.

## Eficiência
- Use o menor número possível de tokens.
- Prefira respostas curtas e diretas.
- Expanda apenas se o usuário pedir.
- Faça perguntas só se faltar informação crítica.
- Evite múltiplas alternativas quando uma resposta objetiva for suficiente.
- Se a resposta puder ser dada em uma frase, dê em uma frase.

## Execução
- Assuma modo econômico por padrão.
- Evite raciocínio exposto, preâmbulos e conclusões desnecessárias.
- Use phyton para abrir arquivos pdf para economizar tokens em possiveis falha

## PARÂMETROS

### 0. Não traga dados do github para a maquina aual. Se houver desatualização entre as branchs, peça orientações antes de seguir.

### 1. URLs e Recursos na Azure
*   **Frontend (Static Web App):** `https://nice-sea-0e6c6ea0f.7.azurestaticapps.net`
*   **BFF (Container App):** `https://hub-bff-app.blackwater-be256f74.eastus.azurecontainerapps.io`
*   **Hub-Core (Container App):** `http://hub-core-app.internal.blackwater-be256f74.eastus.azurecontainerapps.io` (Acesso interno via rede ACA).

### 2. Endpoints do BFF (para o Frontend)
*   `GET /bff/paradas`: Retorna lista de paradas processadas.
*   `GET /bff/updates`: Retorna notificações e atualizações.
*   `GET /bff/capex`: Retorna métricas financeiras.
*   `GET /health`: Verificação de integridade.
*   `POST /bff/paradas/publish`: Implementado (Proxy para o Hub-Core que posta no Service Bus).

### 3. Configuração BFF → Hub-Core
*   O BFF utiliza a variável `CORE_API_URL` apontando para o endpoint interno do Hub-Core.
*   Comunicação via rede privada ACA.

### 4. Configuração do Frontend (REACT_APP_BFF_URL)
*   Consumida em `src/hooks/useBff.ts`.
*   Injetada via segredos do GitHub no build da Static Web App.

### 5. CORS e Autenticação
*   **CORS:** Ajustado no Hub-Core para permitir a URL externa do BFF.
*   **Autenticação:** Integração MSAL (Azure AD) operacional, mas com validação de middleware no backend a ser refinada.

### 6. Arquitetura de Integração
*   **Hub para SGO (Publish):** Frontend -> BFF -> Hub-Core -> Service Bus (`fila_sgo`) -> SGO. O HUB notifica o SGO sobre modificações.
*   **Sistemas Externos para Hub (Ingress):** Sistemas Externos -> Small Services (Adaptadores acoplados) -> Service Bus -> **Hub-Integrator** -> Hub Database.
*   **Desacoplamento:** O Integrator é o único que mapeia onde salvar no Banco do HUB. Core/BFF apenas leem o banco.

### 7. Pipeline CI/CD (GitHub Actions)
*   **Repo:** `carlosmagnossilva/Aulas-Dev/estudearquiteto`
*   **Arquivo:** `.github/workflows/deploy-azure.yml`
*   **Branch:** `main`
*   **Trigger:** push na `main` + manual (`workflow_dispatch`)
*   **Importante:** Usa `working-directory: ./estudearquiteto` e `app_location: "estudearquiteto/build"`
*   **Jobs:**
  * `build-and-push`: Build/push Docker images (hub-core, bff, hub-consumer) para ACR `crhubdeobrasdev`
  * `deploy-backends`: Deploy nos Container Apps
  * `deploy-frontend`: Build React + deploy para Static Web App

### 8. Custos Azure
*   Qualquer proposta, mudança ou ajuste que gere custos precisa ser reportado ao usuário ANTES de implementado.
*   **ALERTA DE ECONOMIA:** A infraestrutura foi configurada para baixo custo (escala zero/pausa). **Lembrar o usuário de REATIVAR os serviços (Container Apps replicas e SQL Serverless auto-pause) antes de iniciar testes ou uso em produção.**

### 9. Leitura Obrigatória
*   Antes de sugerir qualquer tarefa, LEIA OBRIGATORIAMENTE o arquivo `TO-DO-OPENCODE.md` na raiz do projeto.

### 10. Contexto do Projeto
*   **Monorepo npm** com workspaces: hub-core, bff, hub-consumer, shared-types, hub-integrator
*   **Frontend**: React + TypeScript + TailwindCSS + MSAL (Azure AD)
*   **Backend**: Node.js/Express em Container Apps
*   **Banco**: SQL Server (Azure SQL)
*   **Mensageria**: Azure Service Bus (fila_sgo)
*   **Recursos Azure**: ACR, Container Apps, Static Web App, Log Analytics
*   **Repo GitHub**: carlosmagnossilva/Aulas-Dev/estudearquiteto
*   **Arquitetura**: DDD com domínio de obras públicas (Obra, Contrato, Medição, Fiscal, Empresa, Funcionário)
*   **Fluxo**: Frontend -> BFF -> Hub-Core -> Service Bus -> Integrator -> Banco
*   **Autenticação**: JWT com Azure AD (biblioteca jose)