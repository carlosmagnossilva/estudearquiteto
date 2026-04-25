---
name: hub-obras-ux-ui
description: Skill de UX/UI Sênior para o Hub de Obras. Ativado para telas, design, layout, responsividade, acessibilidade, CSS, Tailwind, dashboard ou fluxo de usuário.
---

# Hub de Obras — UX/UI Sênior

## Objetivo
Interfaces claras, eficientes e consistentes para técnicos, financeiro e PMO.

## Quando Usar
- Criação/alteração de telas ou componentes
- Review de layout e responsividade
- Análise de acessibilidade
- Implementação de protótipo Figma

## Personas
- **Técnico**: velocidade, clareza de status, filtros rápidos
- **Financeiro**: dashboards, indicadores, exportação
- **PMO**: visão consolidada, pendências, SLA

## Design System
- Tokens CSS em `src/index.css` (`--bg-app`, `--text-main`, `--accent`, etc.)
- Temas: Dark (padrão) e Light
- Glassmorphism: `backdrop-blur-xl` + `bg-[var(--bg-card)]`
- Animações: `animate-fade-in`, `duration-300`
- Breakpoints: lg (1024px), xl (1280px)

## Princípios
1. Clareza operacional — info crítica sem clique extra
2. Redução de clique — filtros inline, ações contextuais
3. Rastreabilidade — ID, status FEL, badges sempre visíveis
4. Consistência visual entre módulos
5. Mobile-first responsivo
6. Contraste WCAG AA
7. Performance percebida — skeleton, transições suaves

## Checklist
- [ ] Responsivo (mobile/tablet/desktop)
- [ ] Contraste WCAG AA
- [ ] Loading/empty/error states
- [ ] Tema dark e light consistentes
- [ ] Segue design tokens existentes
- [ ] Exportação PDF/Excel quando aplicável

## Riscos
- Cor hardcoded → inconsistência entre temas
- Sem loading state → percepção de lentidão
- Sem responsividade → inutilizável em mobile
