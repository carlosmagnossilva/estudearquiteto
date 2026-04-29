# Contexto Atual do Projeto (Última Atualização: 28/04/2026 - 17:55)

## 🏗️ Arquitetura e Infraestrutura
- **BFF**: Container App em Azure (`hub-bff-app`), rota `PUT /bff/obras/:id/sobre` operacional com suporte a tokens MSAL.
- **Hub-Core**: Core transacional (`hub-core-app`)## 🚀 Estado Atual
- **Pipeline de Sync**: O `hub-integrator` agora roda como serviço de background contínuo com intervalo configurável via banco de dados.
- **Configurações do Sistema**: Implementado módulo de persistência de parâmetros globais (`hub_core.configuracoes_sistema`) com gestão via Dashboard Administrativo.
- **Sobre a Obra**: Módulo 100% funcional com mecanismo de Upsert para obras novas.
- **Auth**: Integração MSAL estabilizada entre Frontend -> BFF -> Core.

## 🛠️ Descobertas Técnicas Recentes
- **Debug de Portas**: Identificada necessidade de limpeza agressiva de processos Node/Axios em ambientes de dev para evitar o erro "Processo Fantasma" que causava 404 em rotas novas.
- **Database**: O schema `hub_core` é agora o motor de snapshots para o frontend, reduzindo a carga no transacional.
 (Obra 24).

## ✅ Entregas Concluídas (Módulo Obras)
- ✅ **CRUD "Sobre a Obra" (US05)**: Ciclo completo de leitura e escrita para dados administrativos e técnicos.
- ✅ **Painel de Obras Operacional (US03)**: Grid de alta fidelidade com 16 colunas, focado na "Esteira Financeira" (RE, EM, CO, ES, NC).
- ✅ **Fidelidade ao Protótipo (Vídeo)**: Interface modularizada com seções em acordeão e tabela de equipe técnica.
- ✅ **Terminologia de Negócio**: Implementação dos status oficiais (FEL, FECH, EXEC).
- ✅ **Otimização Multi-Tema**: Estilização 100% via variáveis de CSS, compatível com Dark/Light Mode.
- ✅ **Padronização de Documentação**: Implementação de User Stories de alta granularidade para US03 e US05.

## 🛠️ Estado Atual do Sistema

### Módulo Obras (ObrasModule)
- **Painel de Obras**: 
  - Grid operacional completo com suporte a Drag-Scroll.
  - Colunas de progresso físico (CP%) e financeiro macro (Outlook/Realizado) integradas.
- **Aba "Sobre a Obra"**: 
  - Layout balanceado com restrições de largura (`max-w-3xl`) para legibilidade.
  - Sincronização em tempo real com o banco de dados via BFF.

## 🧠 Aprendizados e Padrões Estabelecidos
1. **Fidelidade Visual é Prioridade**: Qualquer desvio de coluna ou nomenclatura gera inconsistência de negócio. O vídeo/protótipo é a verdade única.
2. **User Stories PO Sênior**: Novo padrão de documentação que descreve experiência, aparência, comportamentos de clique e estados de tema.
3. **Glossário da Esteira Financeira**: RE (Realizado), EM (Empenhado), CO (Comprometido), ES (Estimado), NC (Não comprometido).
4. **Multi-Theme Inputs**: Uso de `[color-scheme:dark]` condicional para garantir visibilidade do calendário nativo.

## 📝 Notas de Operação
- **Migrations**: Usar `scratch/run_migrations.mjs` para atualizações de schema no Azure SQL.
- **Bypass Auth**: Utilizar `?bypass=true` para testes locais rápidos.
- **Limpeza de Porta**: Executar `kill-ports.ps1` se houver conflitos.
