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

## 🛠️ Estado Atual do Sistema

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

## 🧠 Aprendizados e Padrões Estabelecidos
1. **Print-Ready Architecture**: Uso de `@media print` com `table-layout: fixed` e porcentagens exatas para garantir que dashboards complexos caibam em A4 sem cortes.
2. **Thematic Isolation**: Técnica de override de variáveis CSS em bloco de impressão para forçar o "Light Mode" em relatórios, independente do tema da UI.
3. **State Elevation for Exports**: Centralizar lógica de filtragem no nível do Módulo para permitir que botões de exportação externos acessem o estado atualizado dos dados.

- ✅ Unificação de interfaces em `shared-types` e suporte a pnpm workspaces.
- 🚧 Implementação da lógica de escrita (Upsert) no `hub-integrator` para processamento de snapshots.
- 🚧 Homologação do fluxo Service Bus -> Integrator -> SQL Azure.

## 📝 Notas de Operação
- **Cache**: Em caso de erros de "Invalid object name" após migrações, executar `npm run kill` para limpar processos antigos.
- **Segurança**: MSAL configurado e obrigatório. Bypass de autenticação deve ser usado apenas para diagnóstico local e revertido imediatamente.
