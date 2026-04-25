---
name: hub-obras-tech-lead
description: Skill de Tech Lead / Dev Sênior para o Hub de Obras. Ativado quando o contexto envolve code review, refactoring, arquitetura de código, padrões, separação de responsabilidades, performance, manutenibilidade, testes ou implementação de funcionalidades complexas.
---

# Hub de Obras — Tech Lead / Dev Sênior

## Objetivo
Garantir qualidade, manutenibilidade e aderência arquitetural do código do Hub de Obras.

## Quando Usar
- Code review
- Refactoring
- Implementação de funcionalidade complexa
- Decisão de arquitetura de código
- Criação de testes
- Correção de bugs críticos
- Análise de performance de código

## Stack do Projeto
- **Frontend**: React 18 + TypeScript + TailwindCSS 3 (CRA — react-scripts 5)
- **BFF**: Node.js 18 + Express 4 + TypeScript (ESM)
- **Hub-Core**: Node.js 18 + Express 4 + mssql 12 + TypeScript (ESM)
- **Hub-Integrator**: Node.js 18 + Service Bus + mssql
- **Shared Types**: `@hub/shared` — TypeScript puro
- **Auth**: MSAL (frontend) + jose (backend JWT)
- **Monorepo**: npm workspaces + pnpm-workspace.yaml

## Instruções

### 1. Antes de Qualquer Alteração
1. Ler CURRENT_CONTEXT.md
2. Identificar módulo/serviço afetado
3. Mapear dependências (shared-types, BFF, Core, Integrator)
4. Verificar se há teste existente
5. Propor plano antes de executar (quando alteração > 50 linhas)

### 2. Padrões de Código

#### Frontend (React)
- Componentes funcionais com hooks
- Props tipadas via interface (não `any`)
- Estado elevado quando compartilhado entre componentes
- CSS via TailwindCSS + CSS Variables (design tokens em `index.css`)
- Hooks customizados em `src/hooks/`
- Módulos em `src/modules/<nome>/`

#### Backend (BFF/Core)
- Express Router para agrupamento de rotas
- Middleware de auth em todas as rotas protegidas
- Token forwarding: BFF repassa JWT para Core
- Queries SQL parametrizadas (`.input()` do mssql)
- Tratamento de erro com try/catch e log estruturado
- Health check em `/health`

#### Shared Types
- Toda interface compartilhada em `shared-types/src/index.ts`
- Prefixo `I` para interfaces (IParada, ICapexData)
- Build obrigatório antes do frontend (`npm run build -w @hub/shared`)

### 3. Decisão de Arquitetura

```
Pergunta: "Onde colocar essa lógica?"

Frontend (src/)
  └── Apresentação, interação, estado de UI
  └── Chamadas via useBff hook

BFF (bff/)
  └── Proxy, transformação de response, fallback
  └── Validação de JWT (jose)
  └── NÃO acessa banco diretamente

Hub-Core (hub-core/)
  └── Queries SQL, lógica de dados
  └── Publicação no Service Bus
  └── Validação de JWT

Hub-Integrator (hub-integrator/)
  └── ÚNICO que faz escrita no banco
  └── Consome Service Bus
  └── Upsert de dados

Shared-Types (shared-types/)
  └── Contratos de dados (interfaces)
  └── Sem lógica, sem dependências runtime
```

### 4. Code Review Checklist
- [ ] Sem `any` desnecessário
- [ ] Sem console.log em produção (usar log estruturado)
- [ ] Queries parametrizadas (sem concatenação SQL)
- [ ] Erro tratado com try/catch
- [ ] Sem secrets hardcoded
- [ ] Tipagem consistente com shared-types
- [ ] Comentários preservados (não remover docstrings existentes)
- [ ] CURRENT_CONTEXT.md atualizado se mudança relevante

### 5. Testes
- **Frontend**: Jest + Testing Library (`*.test.tsx`)
- **Backend**: Jest + Supertest (`*.test.ts`)
- Cobertura mínima desejada: middleware de auth, queries críticas

## Checklist de Entrega
- [ ] Código segue padrões documentados
- [ ] Sem regressão (build passa)
- [ ] Testes adicionados/atualizados
- [ ] shared-types atualizado se contrato mudou
- [ ] CURRENT_CONTEXT.md e TO-DO.md atualizados

## Riscos
- Alterar shared-types sem rebuild → erro de tipagem silencioso
- Alterar query sem testar → erro em produção
- Refactoring sem mapa de dependências → quebra em cadeia
