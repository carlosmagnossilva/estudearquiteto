# User Story US05: Detalhamento Administrativo e Gestão "Sobre a Obra"

**Status**: ✅ Concluída (Produção-Ready)
**Data de Entrega**: 2026-04-28
**Principais Avanços Técnicos**:
- **Mecanismo de Upsert**: A Stored Procedure `sp_save_obra_detalhes_v2` agora lida com a criação automática de registros para obras novas (ex: Obra 89).
- **Independência de Dados**: Migração completa da persistência para o schema `hub_core`.
- **Fidelidade Visual**: Interface 100% responsiva com suporte a temas Dark/Light.

---

## 1. Experiência e Jornada do Usuário
- **Acesso**: O usuário acessa o módulo "Obras" e seleciona uma obra específica. A aba padrão carregada é "Sobre a Obra".
- **Visualização Primária**: O usuário encontra quatro seções organizadas em um layout de **Acordeão (Collapsible)**, permitindo focar em uma categoria de dados por vez.
- **Transição de Estado**: Através de um botão de ação "Editar campos" no topo superior direito, a interface transiciona suavemente de um modo de leitura estática para um formulário de edição reativo.
- **Feedback em Tempo Real**: Durante a edição de durações, o sistema calcula automaticamente o impacto no cronograma total, dando visibilidade imediata ao planejamento.

---

## 2. Especificação de Campos e Componentes

### A. Seção: Datas e Durações
*Foco no cronograma macro e prazos contratuais.*
- **Campos**:
    - `Data Início` (Date): Data de mobilização/início real.
    - `Data Término` (Date): Data estimada de conclusão.
    - `Prazo Contrato` (Date): Data limite acordada contratualmente.
    - `Ano` (Number): Ano fiscal/orçamentário (Ex: 2026).
    - `Duração Obra (dias)` (Number): Período efetivo de intervenção.
    - `Duração Testes (dias)` (Number): Período de comissionamento.
    - `Duração Aceitação (dias)` (Number): Período de homologação final.
- **Duração Total** (Calculado): Soma automática de (Obra + Testes + Aceitação). Exibido com destaque visual (`font-bold`).

### B. Seção: Informações da Embarcação
*Identidade técnica e gestão de ativos.*
- **Campos**:
    - `Embarcação` (Text): Nome oficial da unidade.
    - `Bandeira` (Text): País de registro.
    - `Nacionalidade` (Text): Origem técnica/tripulação.
    - `Coordenador de Frota` (Text): Gestor corporativo responsável.
    - `Gerente de Frota` (Text): Responsável operacional direto.

### C. Seção: Localização e Condição
*Contexto físico da execução.*
- **Campos**:
    - `Estaleiro` (Text): Nome do local de execução.
    - `Condição de Docagem` (Text): Ex: "Seco", "Flutuando".
    - `Inspeção de Casco` (Text): Descrição da vistoria obrigatória.

### D. Seção: Equipe Técnica
*Governança e atribuição de responsabilidades.*
- **Componente**: Tabela de alta densidade com duas colunas (**Função** e **Nome**).
- **Linhas**: Coordenador de Obra, Administrativo, Analistas, Responsável Cronograma.

---

## 3. Comportamento e Aparência (Modos de Tela)

### Modo Visualização (Read-Only)
- **Estilo**: Dados exibidos em pares `Label: Valor`.
- **Tipografia**: Labels em `uppercase`, tamanho reduzido (`text-[10px]`), cor suave (`var(--text-muted)`). Valores em tamanho padrão, alta legibilidade.
- **Estados**: Seções podem ser expandidas ou colapsadas via clique no header.

### Modo Edição (Input Mode)
- **Interação**: Ao clicar em "Editar campos", os valores estáticos são substituídos por `Inputs`.
- **Comportamento de Campos**:
    - **Textos**: Ocupam a largura total disponível na coluna (`w-full`).
    - **Números**: Largura restrita (`max-w-[100px]`) para evitar dispersão visual.
    - **Datas**: Largura média (`max-w-[180px]`) com ícone de calendário (`SVG`) posicionado internamente à direita.
- **Calendário**: O clique no ícone ou no campo aciona o seletor nativo do navegador.

### Adaptação de Temas
- **Modo Escuro (Dark Mode)**:
    - Background dos inputs: `bg-white/5` ou `var(--bg-input)`.
    - Bordas: `border-white/20` para garantir que o limite do campo seja visível contra o fundo preto.
    - Calendário: Forçado para tema dark via `[color-scheme:dark]`.
- **Modo Claro (Light Mode)**:
    - Background dos inputs: Branco ou cinza ultra-claro.
    - Bordas: `border-slate-300` com sombra sutil (`shadow-sm`).
    - Foco: Destaque com `ring-emerald-500` para indicar campo ativo.

---

## 4. Ações e Persistência
- **Salvar**: Dispara chamada `PUT /bff/obras/:id/sobre`. Exibe estado de *Loading* no botão. Após o sucesso, executa um `refetch` para atualizar a tela e retorna ao modo visualização.
- **Cancelar**: Reverte todas as alterações locais e retorna ao modo visualização sem disparar chamadas de rede.
