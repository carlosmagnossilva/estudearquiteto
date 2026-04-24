# Contexto Atual do Projeto (Última Atualização: 24/04/2026 - 14:24)

## 🏗️ Arquitetura e Infraestrutura
- **BFF**: Container App em Azure (`hub-bff-app`), autenticação via MSAL/Azure AD.
- **Hub-Core**: Core da aplicação (`hub-core-app`), conecta ao Azure SQL. Agora operando com o esquema unificado `hub_frontend` para Dashboards.
- **Banco de Dados**: Azure SQL Server `sqlhub04171601`. Esquemas ativos: `hub_frontend` (Novo/Dashboard) e `Financeiro` (Legado/Gestão).

## 🛠️ Ferramentas e Utilitários Recentes
- **`kill-ports.ps1`**: Utilitário para limpeza de processos zumbis em portas locais (5001, 4000, 3000).
- **`authorize-ip.ps1`**: Script para autorização automática de IP no firewall do SQL Azure.

## 🎯 Foco Atual
- ✅ Refinamento de fidelidade visual e tokens de design (Commit: `78d53ab`).
- ✅ Migração total para o esquema `hub_frontend` (Queries, Scripts e Banco).
- ✅ Filtros Gerenciais (Busca Dual, Pipeline FEL e Tipo de Obra com Código).
- ✅ Estabilização do Módulo Financeiro (Grid numérico, datas BR e temas Light/Dark).
- ✅ Unificação de interfaces em `shared-types` e suporte a pnpm workspaces.
- 🚧 Implementação da lógica de escrita (Upsert) no `hub-integrator` para processamento de snapshots.
- 🚧 Homologação do fluxo Service Bus -> Integrator -> SQL Azure.

## 📝 Notas de Operação
- **Cache**: Em caso de erros de "Invalid object name" após migrações, executar `npm run kill` para limpar processos antigos.
- **Segurança**: MSAL configurado e obrigatório. Bypass de autenticação deve ser usado apenas para diagnóstico local e revertido imediatamente.
