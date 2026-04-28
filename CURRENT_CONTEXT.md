# Contexto Atual do Projeto (Última Atualização: 28/04/2026 - 16:51)

## 🏗️ Arquitetura e Infraestrutura
- **BFF**: Container App em Azure (`hub-bff-app`), rota `PUT /bff/obras/:id/sobre` operacional com suporte a tokens MSAL.
- **Hub-Core**: Core transacional (`hub-core-app`) conectado ao Azure SQL. Rota `PUT` persistindo no schema `hub_core`.
- **Hub-Integrator**: Consumidor de filas Service Bus para sincronização de dados técnicos e financeiros.

### 🗄️ Banco de Dados (Azure SQL)
- **Schema `hub_core`**: (PRODUÇÃO) Tabelas `obra_detalhes` e `equipe_tecnica` integradas e populadas. 
- **Integridade**: Migrations e seeds concluídos para a Austral Abrolhos (Obra 24).

## ✅ Entregas Concluídas (Módulo Obras)
- ✅ **CRUD "Sobre a Obra"**: Ciclo completo de leitura e escrita para dados administrativos e técnicos.
- ✅ **Fidelidade ao Protótipo (Vídeo)**: Interface modularizada com seções em acordeão e tabela de equipe técnica.
- ✅ **Otimização Multi-Tema**: Estilização 100% via variáveis de CSS, compatível com Dark/Light Mode.
- ✅ **UX de Edição**: Suporte nativo a calendário (DatePicker) e campos com dimensões inteligentes.
- ✅ **Eliminação de Hardcode**: Remoção total de mocks locais. Dependência única do backend.

## 🛠️ Estado Atual do Sistema

### Módulo Obras (ObrasModule)
- **Aba "Sobre a Obra"**: 
  - Layout balanceado com restrições de largura (`max-w-3xl`) para legibilidade.
  - Sincronização em tempo real com o banco de dados via BFF.
  - Duração total calculada dinamicamente no frontend.

## 🧠 Aprendizados e Padrões Estabelecidos
1. **Multi-Theme Inputs**: Uso de `[color-scheme:dark]` condicional para garantir visibilidade do calendário nativo do navegador em temas escuros.
2. **Layout Balance**: Limitação de largura em tabelas e grids para manter a consistência com protótipos de alta fidelidade em telas ultra-wide.
3. **Refetch Workflow**: Padrão de atualização de estado via `refetch()` do hook `useBff` após operações bem-sucedidas de `PUT`.

## 📝 Notas de Operação
- **Migrations**: Usar `scratch/run_migrations.mjs` para atualizações de schema no Azure SQL.
- **Bypass Auth**: Utilizar `?bypass=true` para testes locais rápidos, mantendo `AUTH_BYPASS_DEV=true` no backend.
- **Limpeza de Porta**: Executar `kill-ports.ps1` se houver conflitos nas portas 3000, 4000 ou 5001.
