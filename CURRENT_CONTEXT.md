# Contexto Atual do Projeto (Última Atualização: 28/04/2026 - 16:38)

## 🏗️ Arquitetura e Infraestrutura
- **BFF**: Container App em Azure (`hub-bff-app`), autenticação via MSAL/Azure AD. Rota `PUT /bff/obras/:id/sobre` implementada.
- **Hub-Core**: Core da aplicação (`hub-core-app`), conecta ao Azure SQL. Rota `PUT /core/obras/:id/sobre` implementada para persistência transacional.
- **Hub-Integrator**: Consumidor de filas do Service Bus. Operando em modo dual (SGO e Protheus).

### 🗄️ Banco de Dados (Azure SQL)
- **Schema `hub_frontend`**: Utilizado para leitura dos dashboards.
- **Schema `hub_core`**: (ATIVO) Implementadas tabelas transacionais para o módulo Obras.
    - **`hub_core.equipe_tecnica`**: Cadastro centralizado de membros da equipe (Coordenação, Gerência, Administrativo, Analistas).
    - **`hub_core.obra_detalhes`**: Dados detalhados da aba "Sobre a Obra" (Datas, Durações, Localização, Embarcação).
    - **Migrations**: `002` (criação), `004` (expansão de schema) e `003` (seed da Austral Abrolhos) aplicadas.

## ✅ Entregas Concluídas (Módulo Obras)
- ✅ **CRUD "Sobre a Obra"**: Implementado ciclo completo de leitura e escrita para dados administrativos.
- ✅ **Fidelidade ao Protótipo**: Interface revitalizada com 4 seções acordeão, tabela de equipe e mapeamento exato conforme vídeo de validação.
- ✅ **Eliminação de Hardcode**: Removido `OBRAS_MOCK`. O sistema agora depende 100% da persistência no `hub_core`.
- ✅ **Duração Dinâmica**: Cálculo automático de "Duração Total" reativo às mudanças em Obra/Testes/Aceitação.

## 🛠️ Estado Atual do Sistema

### Módulo Obras (ObrasModule)
- **Status**: Funcional e Persistente 🚀
- **Aba "Sobre a Obra"**:
  - Modo de visualização limpo com acordeões.
  - Modo de edição com persistência via BFF -> Core -> SQL Azure.
  - Dados da Austral Abrolhos (Obra 24) totalmente integrados com equipe técnica real.

## 🧠 Aprendizados e Padrões Estabelecidos
1. **Azure SQL & USE**: O driver `mssql` no Azure SQL não suporta a instrução `USE`. Migrations devem ser executadas no contexto da conexão pré-estabelecida.
2. **Hook `useBff`**: Atualizado para suportar `refetch`, permitindo recarregar dados após operações de escrita sem refresh de página.
3. **Optional Chaining**: Obrigatório em componentes que dependem de dados normalizados em chaves estrangeiras (evita crashes durante carregamento parcial).

## 📝 Notas de Operação
- **Migrations Manuais**: Caso novos dados de seed sejam necessários, utilizar o script `scratch/run_migrations.mjs` para garantir a aplicação correta no Azure SQL.
- **Cache de Workers**: Continuar usando `taskkill /f /im node.exe` para evitar conflitos de workers do Integrator.
- **Configuração de Porta**: Core API URL no BFF deve ser `http://localhost:5001` em dev local.
