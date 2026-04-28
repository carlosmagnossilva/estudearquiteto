# User Story US03: Painel de Obras (Grid Operacional da Frota)

**Persona**: Gestor de Frota / Coordenador de Obras
**Objetivo**: Monitorar simultaneamente o progresso físico, os prazos e a saúde operacional de todas as obras em andamento, permitindo a identificação rápida de atrasos ou desvios na esteira financeira (RE, EM, CO, ES, NC).

---

## 1. Experiência e Jornada do Usuário
- **Visão Geral**: Ao acessar o módulo "Obras", o usuário é recebido pelo "Painel de Obras". O título é proeminente e reforça o contexto operacional.
- **Navegação de Dados**: O usuário visualiza uma tabela densa de alta performance. O uso de **Drag-Scroll** permite navegar horizontalmente por todas as colunas de progresso sem perder o contexto da "Embarcação".
- **Filtragem Inteligente**: O usuário pode filtrar por "Status" (FEL, FECH, EXEC) ou "Tipo de Obra" para focar em paradas específicas. A busca por texto é instantânea, filtrando por ID ou Nome.
- **Drill-down**: O clique em qualquer linha da tabela transporta o usuário para o detalhamento específico daquela obra (Aba Sobre a Obra).

---

## 2. Especificação do Grid Operacional (Ordem e Campos)

A tabela segue rigorosamente a ordem e nomenclatura abaixo, com alinhamentos otimizados para leitura técnica:

| Ordem | Nome da Coluna | Tipo de Dado | Alinhamento | Descrição / Comportamento |
|:---:|:---|:---|:---:|:---|
| 1 | **ID** | Mono | Esquerda | ID único da parada no sistema. |
| 2 | **Embarcação** | Texto (Bold) | Esquerda | Nome do navio ou plataforma. |
| 3 | **Status** | Tag Colorida | Esquerda | Tags de fase (Ex: FEL-3 em Laranja, EXEC em Azul). |
| 4 | **Tipo de Obra** | Tag Numérica | Esquerda | Códigos de categorização (Ex: 100, 301, TECH). |
| 5 | **Condição** | Texto (Bold) | Esquerda | Ex: "Seco" (Verde Emerald) ou "Molhado" (Azul). |
| 6 | **Início** | Data | Esquerda | Data de início real/planejado (DD/MM/AAAA). |
| 7 | **Término** | Data | Esquerda | Data de término real/planejado (DD/MM/AAAA). |
| 8 | **Duração Total** | Número (Bold) | Centro | Total de dias de intervenção. |
| 9 | **Realizado BRL M** | Financeiro | Direita | Valor já executado em Milhões, sem prefixo "R$". |
| 10 | **Outlook BRL M** | Financeiro | Direita | Valor estimado final em Milhões, sem prefixo "R$". |
| 11 | **RE** | Percentual | Centro | % de Progresso em RE. |
| 12 | **EM** | Percentual | Centro | % de Progresso em EM. |
| 13 | **CO** | Percentual | Centro | % de Progresso em CO. |
| 14 | **ES** | Percentual | Centro | % de Progresso em ES. |
| 15 | **NC** | Percentual | Centro | % de Progresso em NC. |
| 16 | **Ação** | Ícone | Centro | Botão de lupa para abrir detalhes. |

---

## 3. Aparência e Detalhes de Design (Fidelidade UI)

### Estilo da Tabela
- **Headers**: Fundo sólido (`var(--bg-header-solid)`), texto em uppercase, extra-pequeno (`text-[10px]`), peso `black`, com espaçamento `tracking-widest`.
- **Linhas (Rows)**: Efeito de `hover` sutil mudando o fundo. Bordas inferiores finas (`divide-[var(--border-mini)]`).
- **Células Financeiras**: Tipografia monoespaçada (`font-mono`) para garantir que os decimais fiquem alinhados verticalmente.

### Elementos de Feedback Visual
- **Tags de Status**: Devem possuir bordas e fundos com transparência (Ex: `bg-blue-500/20 text-blue-400`).
- **Tags de Tipo**: Devem herdar as cores definidas no banco de dados (`tag.cor`), com texto preto para garantir contraste.
- **Vazio (-)**: Campos nulos devem exibir um traço centralizado para não quebrar a escaneabilidade da tabela.

---

## 4. Interações e Comportamento
- **Scroll Horizontal**: Ativado via clique e arrasto (mouse) ou scroll tradicional.
- **Barra de Busca**: Campo fixo no topo esquerdo com ícone de lupa que muda de cor ao receber foco.
- **Modo Mobile**: Em telas reduzidas, a tabela transiciona para um layout de **Cards**, priorizando Embarcação, Status e Outlook.
- **Breadcrumb de Topo**: Exibe "Módulo Obras" em miniatura seguido do título principal "Painel de Obras" em H1 bold.

---

## 5. Critérios de Aceite Técnicos
- O grid deve carregar os dados em menos de 1s após a resposta do BFF.
- O filtro de Status deve atualizar a contagem de itens visíveis instantaneamente.
- O clique na linha deve redirecionar para `/obras/:id` mantendo o histórico de navegação.
- O tema (Dark/Light) deve ser respeitado em todos os elementos, especialmente nas bordas dos inputs de filtro.

---

### 📖 Glossário da Esteira Financeira
- **RE**: Realizado.
- **EM**: Empenhado.
- **CO**: Comprometido.
- **ES**: Estimado.
- **NC**: Não comprometido.
