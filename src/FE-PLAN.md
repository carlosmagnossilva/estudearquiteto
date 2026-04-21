# Planejamento do Frontend - Hub de Obras

Este documento detalha as tarefas de implementação para o frontend do Hub de Obras, com foco em atingir a fidelidade visual e funcional observada no vídeo e no protótipo Figma.

## 🎨 Design & Global Styles
- [x] Refinar `index.css` com variáveis de cor e efeitos Glassmorphism.
- [x] Implementar sistema de tipografia baseado na fonte **Inter**.
- [x] Criar classes utilitárias para bordas de 1px (glass-stroke) e backdrops de blur (16px).

## 🧭 Navegação & Layout Base
- [x] Criar componente `Sidebar` (Menu Lateral) com navegação completa.
- [x] Implementar `NotificationPanel` (Drawer à direita) com abas "Geral" e "Minhas".
- [x] Estruturar o layout principal para garantir o viewport fixo (sem scroll lateral).

## 📊 Dashboard Principal (Home)
- [x] Implementar aba "Visão Geral" com:
    - [x] Gráfico de CAPEX (Capex dos 5 anos).
    - [x] Gráfico de Outlook (Capex de Obras).
    - [x] Listagem de "Custos por Sub-sistema".
- [x] Integrar dados reais do `BFF` nos gráficos (Chart.js ou D3.js).

## 👷 Gestão de Obras (Aba Ativa)
- [/] Refatorar o carrossel/hero de "Obras em Andamento":
    - [x] Adicionar indicadores FEL (1, 2, 3).
    - [x] Adicionar seção Financeira (FEL-4).
    - [x] Adicionar seção de Materiais (Materiais Entregues).
    - [x] Adicionar status de GMUD (Solicitadas/Aprovadas).
- [x] Implementar busca e filtros por ID de Obra.

## 🔔 Notificações & Pendências
- [x] Implementar lógica de pooling ou WebSockets para notificações em tempo real.
- [x] Criar modal/view de "Pendências" com filtros (GMUD, Serviços, Materiais).
- [x] Adicionar badges de contagem nos ícones de alerta.

## 🔐 Autenticação & Segurança
- [x] Melhorar o feedback visual de falha no login (LoginPage).
- [x] Garantir que o token seja renovado silenciosamente via MSAL.
- [x] Integrar `DataStatusBadge` em todas as visualizações críticas.

## 🛠️ Refatoração & Qualidade
- [ ] Otimizar layout para **Mobile e Tablet** (breakpoints, áreas de toque e escalas).
- [ ] Desacoplar lógica de componentes em `hooks` específicos.
- [ ] Implementar testes de componente para fluxos críticos.
- [ ] Revisar responsividade geral (viewport dinâmico vs fixo).

---
*Documento de acompanhamento contínuo.*
*Status atual: Planejamento Inicial*
