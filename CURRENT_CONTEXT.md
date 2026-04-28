# Contexto Atual do Projeto (Última Atualização: 28/04/2026 - 15:05)

## 🏗️ Arquitetura e Infraestrutura
- **BFF**: Container App em Azure (`hub-bff-app`), autenticação via MSAL/Azure AD.
- **Hub-Core**: Core da aplicação (`hub-core-app`), conecta ao Azure SQL. Agora operando com o esquema unificado `hub_frontend` para Dashboards.
- **Hub-Integrator**: Consumidor de filas do Service Bus, responsável por persistir simulações no banco (via MERGE). Agora opera em modo dual (SGO e Protheus).
- **Service Bus**: Estratégia de "Multi-Fila" ativa para contornar limitações do Basic Tier (sem Tópicos). O Hub-Core replica mensagens para `fila_sgo` e `fila_sgo_local`. Criada `fila_protheus` para carga financeira.

### 🗄️ Banco de Dados (Azure SQL)
- **Schema `hub_frontend`**: (ESTÁVEL) Utilizado exclusivamente para leitura dos dashboards. Não deve ser alterado.
- **Schema `hub_core`**: (EM MODELAGEM) Novo schema transacional para operações, governança e integridade histórica.
    - **Hierarquia**: Obra (Parada) -> Tipo Obra (Coletor) -> Entrega (Demanda) -> Serviço/Material.
    - **Integridade**: Uso de Snapshots para Coordenadores, Gerentes e Especificações Técnicas para evitar corrupção de histórico.
    - **Estaleiro**: Gestão via Tabelas de PPU (versão de preços) e VOR (Variation Orders).
    - **Financeiro**: Esteira de 4 colunas de valor (Estimado, Cotado, Empenhado, Realizado) por item.

### 🚀 Próximos Passos
1. **Migrations Hub_Core**: Gerar scripts SQL para criação do novo schema e tabelas (Mapeamento US05 a US08 concluído).
2. **Auditoria de Integração**: Mapear payloads do TM Master (FEL2), Fluig e Protheus para a esteira financeira.
3. **Módulo de Lançamento Físico**: Desenvolver interface no Hub para digitação manual do progresso de serviços.

## 🛠️ Ferramentas e Utilitários Recentes
- **`kill-ports.ps1`**: Utilitário para limpeza de processos zumbis em portas locais (5001, 4000, 3000).
- **`taskkill /f /im node.exe`**: Recomendado para limpar processos de workers (Integrator) que não possuem porta fixa.
- **`authorize-ip.ps1`**: Script para autorização automática de IP no firewall do SQL Azure.
- **`scripts/summary.js`**: Script de inicialização que exibe o resumo dos serviços locais e portas após o `npm run dev`.

## ✅ Entregas Concluídas
- ✅ Segregação de dados: nova tabela `hub_frontend.fato_financeiro_parada` (origem: Protheus) separada de `fato_parada` (origem: SGO).
- ✅ Terminologia de Negócio: Campo `tags` renomeado para `tipo_obra` em todo o fluxo de integração (Core, Integrador e Simulador), preservando a tabela `fato_parada_tags` por questões de compatibilidade.
- ✅ Hub-Integrator com dois receivers: `fila_sgo_local` (técnico) e `fila_protheus` (financeiro).
- ✅ Hub-Core: payload SGO filtrado para apenas dados técnicos; query `queryObrasFinanceiras` usa COALESCE com fallback retrocompatível.
- ✅ CI/CD atualizado com `SERVICE_BUS_QUEUE_NAME_PROTHEUS=fila_protheus`.

## 🛠️ Estado Atual do Sistema

### Autenticação (Auth Middleware)
- **BFF + Core**: Bypass de dev via variável `AUTH_BYPASS_DEV=true` (presente apenas nos `.env` locais).
- **Produção**: Sem bypass — JWT obrigatório via `jose` + Azure AD JWKS.
- **Frontend**: `?bypass=true` na URL pula login MSAL. Funciona end-to-end com `AUTH_BYPASS_DEV=true` nos backends.

### Módulo Obras (ObrasModule)
- **Status**: Reestruturado e Integrado 🏗️
- **Arquitetura de Navegação**: 
  - Transição de "Sobre a Obra" do Financeiro para o módulo Obras.
  - Fluxo de entrada via clique na linha do Grid (drill-down).
  - Interface de detalhes com Tabs internas (Visão Geral, Entregas, Sobre a Obra).
- **Funcionalidades**:
  - Drill-down: Clique em qualquer obra na listagem abre a visão de detalhes.
  - Detalhes da Obra: Cabeçalho dinâmico com ID, Nome e Status.
  - Aba "Sobre a Obra": Visão consolidada de dados técnicos e da embarcação.

### UX & Interatividade (Core improvements)
- **Scroll Universal**: Roda do mouse habilitada em todo o sistema (removidos `overflow-hidden` restritivos).
- **Interação Natural**: Removido `select-none` e `cursor-grab` das tabelas para permitir seleção de texto e uso padrão do mouse.
- **Scroll Smooth**: Adicionado comportamento de rolagem suave em containers de dados.

## 🧠 Aprendizados e Padrões Estabelecidos
1. **Adaptive Grid Patterns**: Uso de cards em mobile para substituir tabelas densas.
2. **Skeleton Strategy**: Criação de componentes de skeleton que espelham a estrutura final.
3. **Responsive State Management**: Centralizar detecção de viewport em hook global (`useResponsive`).
4. **Worker Stealing**: Processos zumbis do Integrador podem consumir mensagens da fila e causar falhas de atualização se não forem limpos com `taskkill`.
5. **Multi-Statement Queries**: Para maior confiabilidade no Integrador, as queries de MERGE, DELETE e INSERT de tags foram segregadas em chamadas distintas.

## 📝 Notas de Operação
- **Cache de Workers**: O Hub-Integrator não usa porta. Sempre execute `taskkill /f /im node.exe` antes de iniciar o desenvolvimento para garantir que versões antigas não "roubem" as mensagens da fila.
- **Segurança**: MSAL configurado e obrigatório. Bypass de autenticação deve ser usado apenas para diagnóstico local e revertido imediatamente.
- **Deploy ACA**: O Azure Container Apps requer tags únicas (ex: `github.sha`) para forçar novas revisões.
- **Data Flow Definido**: SGO (Estrutura inicial) -> TM Master (Serviços FEL2) -> Fluig (Aprovação) -> App Medição -> Protheus (Pedido de Compra).
- **Progresso Físico**: Será via digitação manual no Hub, não automatizado via SGO.
 HTTPS (443). Jamais incluir a porta exposta do container (ex: `:5001`) na variável `CORE_API_URL`, senão ocorrerá timeout infinito (pending).
