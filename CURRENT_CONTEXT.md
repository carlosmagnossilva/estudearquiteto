# Contexto Atual do Projeto (Última Atualização: 25/04/2026 - 20:25)

## 🏗️ Arquitetura e Infraestrutura
- **BFF**: Container App em Azure (`hub-bff-app`), autenticação via MSAL/Azure AD.
- **Hub-Core**: Core da aplicação (`hub-core-app`), conecta ao Azure SQL. Agora operando com o esquema unificado `hub_frontend` para Dashboards.
- **Hub-Integrator**: Consumidor de filas do Service Bus, responsável por persistir simulações no banco (via MERGE).
- **Service Bus**: Estratégia de "Multi-Fila" ativa para contornar limitações do Basic Tier (sem Tópicos). O Hub-Core replica mensagens para `fila_sgo` e `fila_sgo_local`.
- **Banco de Dados**: Azure SQL Server `sqlhub04171601`. Esquemas ativos: `hub_frontend` (Novo/Dashboard) e `Financeiro` (Legado/Gestão).

## 🛠️ Ferramentas e Utilitários Recentes
- **`kill-ports.ps1`**: Utilitário para limpeza de processos zumbis em portas locais (5001, 4000, 3000).
- **`authorize-ip.ps1`**: Script para autorização automática de IP no firewall do SQL Azure.

## 🎯 Foco Atual
- ✅ Replicação de filas no Service Bus (Local vs Produção) sem custo adicional de infraestrutura.
- ✅ Implementação de Socket.io para notificações em tempo real de sincronização SGO -> Frontend.
- ✅ Isolamento estrito de variáveis de ambiente no CI/CD (`deploy-azure.yml`) para `SERVICE_BUS_QUEUES`.
- ✅ Correção de fallback de URLs de Socket e Fetch para eliminar erros de parser de JSON (`Unexpected token <`) no frontend.
- ✅ Unificação do script `dev:all` no `package.json` incluindo o `hub-integrator`.

## 🛠️ Estado Atual do Sistema

### Autenticação (Auth Middleware)
- **BFF + Core**: Bypass de dev via variável `AUTH_BYPASS_DEV=true` (presente apenas nos `.env` locais).
- **Produção**: Sem bypass — JWT obrigatório via `jose` + Azure AD JWKS.
- **Frontend**: `?bypass=true` na URL pula login MSAL. Funciona end-to-end com `AUTH_BYPASS_DEV=true` nos backends.

### Módulo Financeiro (FinanceiroModule)
- **Status**: Alta Fidelidade Concluída 🚀
- **Funcionalidades**:
  - Visão Dupla: Alternância entre Grade (Lista) e Cards (Kanban).
  - Sistema de Filtros: Busca textual, Status e Tipos de Obra (Coletores).
  - Gestão Kanban: Ordenação dinâmica (Data/Valor), Expansão/Colapso individual e por coluna.
  - Exportação Executiva:
    - **Excel (CSV High-Fidelity)**: Gerado com BOM (UTF-8) e escape de caracteres.
    - **PDF (Relatório Corporativo)**: Forçado em modo Paisagem (Landscape), Tema Claro garantido via CSS Override e ocultação inteligente de UI (Sidebar/Notificações).
- **Arquitetura**: Estado de dados elevado para o módulo pai, permitindo ações globais sobre dados filtrados.

### Agent Skills (`.agents/skills/`)
- `hub-obras-product-owner` — Backlog, stories, DoR/DoD
- `hub-obras-tech-lead` — Code review, arquitetura, padrões
- `hub-obras-devops-azure` — Azure, deploy, pipelines, infra
- `hub-obras-dba-sqlserver` — Queries, schema, performance
- `hub-obras-ux-ui` — Telas, design, responsividade
- `hub-obras-gmud-specialist` — GMUD, aprovações, FEL
- `hub-obras-financial-pipeline` — Esteira financeira, indicadores
- `hub-obras-integration-architect` — Service Bus, integrações

## 🧠 Aprendizados e Padrões Estabelecidos
1. **Print-Ready Architecture**: Uso de `@media print` com `table-layout: fixed` e porcentagens exatas para garantir que dashboards complexos caibam em A4 sem cortes.
2. **Thematic Isolation**: Técnica de override de variáveis CSS em bloco de impressão para forçar o "Light Mode" em relatórios, independente do tema da UI.
3. **State Elevation for Exports**: Centralizar lógica de filtragem no nível do Módulo para permitir que botões de exportação externos acessem o estado atualizado dos dados.
4. **Auth Bypass Seguro**: Usar variável explícita `AUTH_BYPASS_DEV` em vez de `NODE_ENV` para garantir que bypass nunca ative em produção.

- ✅ Unificação de interfaces em `shared-types` e suporte a pnpm workspaces.
- 🚧 Implementação da lógica de escrita (Upsert) no `hub-integrator` para processamento de snapshots.
- 🚧 Homologação do fluxo Service Bus -> Integrator -> SQL Azure.

## 📝 Notas de Operação
- **Cache**: Em caso de erros de "Invalid object name" após migrações, executar `npm run kill` para limpar processos antigos.
- **Segurança**: MSAL configurado e obrigatório. Bypass de autenticação deve ser usado apenas para diagnóstico local e revertido imediatamente.
- **Deploy ACA**: O Azure Container Apps não reinicia containers se a tag da imagem (`:latest`) for mantida. A pipeline GitHub Actions DEVE usar `github.sha` como tag no comando `az containerapp update` para forçar uma nova revisão.
- **Roteamento Interno ACA**: A comunicação BFF -> Core ocorre via FQDN do ingress interno na porta padrão HTTPS (443). Jamais incluir a porta exposta do container (ex: `:5001`) na variável `CORE_API_URL`, senão ocorrerá timeout infinito (pending).
