# Épico: Sincronização e Fidelidade do Dashboard Executivo (US07)

**Status:** Em Evolução (Visual Sincronizado / Integração em Andamento)
**Prioridade:** Crítica
**Responsável:** PO Sênior & AI Engineer

## 🎯 Objetivo
Garantir que a "Visão Geral de Obra" reflita com precisão cirúrgica os dados operacionais e financeiros, tratando cada componente visual como uma unidade de valor independente para garantir máxima qualidade técnica e funcional.

---

## 🛠️ Sub-Histórias (Grânulos de Implementação)

### 📊 US07.1: Evolução Financeira e Marcos (Timeline)
**Descrição:** Visualização da curva S e marcos do projeto ao longo de 5 anos.
- **Visual:** Linhas de planejado vs real com badges de marcos flutuantes.
- **Regras:** Marcos não podem sobrepor; datas devem ser abreviadas em mobile; suporte a tooltips.
- **Critérios de Aceitação:** 
  - Escalonamento vertical de marcos adjacentes.
  - Sincronização com o campo `evolucaoGastos` do mock/DB.

### 📊 US07.2: Status dos Serviços (Operational Progress)
**Descrição:** Gráfico de barras horizontais empilhadas detalhando o ciclo de vida dos serviços.
- **Séries:** Não executado, Concluído, Aprovada, PC Aprovado, Pago.
- **Cores:** Neutros para pendências, cores vibrantes para sucessos financeiros.
- **Critérios de Aceitação:** 
  - Exibição de escala numérica no Eixo X.
  - Legenda interativa no topo do card.

### 📊 US07.3: Ciclo de Materiais e Suprimentos
**Descrição:** Gráfico de barras horizontais focado na cadeia de suprimentos.
- **Séries:** Não solicitado, Aguardando aprov., Aguardando entrega, Entregue.
- **Critérios de Aceitação:** 
  - Cores contrastantes calibradas para Light/Dark mode.
  - Tooltip detalhando o valor absoluto de cada estágio.

### 📊 US07.4: Consumo de Facilidades e Recursos
**Descrição:** Comparativo direto entre o que foi contratado e o que já foi consumido na obra.
- **Visual:** Barras duplas (Contratado vs Consumido).
- **Critérios de Aceitação:** 
  - Alerta visual caso o consumido ultrapasse 90% do contratado.
  - Escala dinâmica baseada no maior valor do dataset.

### 📊 US07.5: Pendências por Área (Agregado)
**Descrição:** Gráfico de largura total para visualização das dores de cada departamento.
- **Visual:** Barras empilhadas (Críticas vs Normais) ocupando `span 3`.
- **Diferencial:** Exibição do valor numérico DENTRO das barras.
- **Critérios de Aceitação:** 
  - Legibilidade total das labels de área (Obras, NAVTI, etc.).
  - Cores de alto contraste (#0ea5e9 vs #64748b).

### 📋 US07.6: Ranking Qualitativo de Pendências
**Descrição:** Tabela detalhada das 7 maiores pendências com controle de aging.
- **Visual:** Tabela responsiva com badges coloridos.
- **Campos:** Tipo (⚠️ Crítica / ⚪ Normal), Descrição, Área, Aging.
- **Critérios de Aceitação:** 
  - Badges com fundo transparente e blur.
  - Aging em fonte mono para precisão visual.
  - Scroll horizontal funcional em dispositivos mobile.

---

## 📈 Critérios de Aceitação Transversais (Fidelidade Premium)
1. **Responsividade**: Todos os componentes devem se adaptar de 3 colunas (Desktop) para 1 (Mobile) sem quebras.
2. **Temas**: Troca instantânea entre Dark e Light mode sem perda de legibilidade em legendas ou tooltips.
3. **Performance**: Renderização fluida do Recharts mesmo com redimensionamento de janela.
