# Contexto Atual do Projeto (Última Atualização: 29/04/2026 - 11:05)

## 🏗️ Arquitetura e Infraestrutura
- **BFF**: Container App em Azure (`hub-bff-app`), operacional com suporte a tokens MSAL.
- **Hub-Core**: Core transacional (`hub-core-app`) com mecanismo de snapshots para Dashboard.
- **Pipeline de Sync**: Integrador de background estabilizado, agora com suporte a marcos físicos (Início, Término, Testes, Aceite).

## 🚀 Estado Atual do Dashboard (Obra 24)
- **Timeline Realista**: Gráfico de evolução limitado a Dez/2025 (fim do ano de término), refletindo a massa de dados real do banco.
- **Marcos Operacionais**: ReferenceLines dinâmicas renderizadas corretamente após correção de formatação de data.
- **Mix de Custos**: Proporção 60% Materiais, 25% Serviços, 15% Facilidades persistida e automatizada.
- **Estabilidade**: Corrigido erro crítico de compilação `toLocaleDateString` no frontend via formatação manual robusta.

## ✅ Entregas Concluídas (Recentes)
- ✅ **Sincronização de Marcos (US06)**: Datas físicas agora guiam as labels no gráfico de evolução.
- ✅ **Ajuste de Timeline (Filtro Transacional)**: Dashboard agora expande o eixo X baseado nos registros reais, evitando anos vazios.
- ✅ **Fix de Compilação**: Remoção de dependências de localização (Intl) em ambientes inconsistentes.

## 🧠 Protocolos de Colaboração
1. **Pausa para Aprovação**: SEMPRE descrever o plano e aguardar o "OK" antes de mudanças significativas.
2. **Zero Suposições**: Proibição absoluta de supor lógicas. Perguntar sempre em caso de dúvida.
3. **Fidelidade Visual**: O protótipo é a verdade única para layouts e status (RE, EM, CO, ES, NC).

## 📝 Notas de Operação
- **Bypass Auth**: Utilizar `?bypass=true` para testes locais rápidos no frontend.
- **Forçar Sincronização**: Se o dashboard parecer travado, rodar `npx tsx scratch/force_dashboard_sync_v24.ts`.
- **Limpeza de Porta**: Executar `kill-ports.ps1` se houver conflitos no Windows.
