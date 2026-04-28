# User Story US06: Visão Geral (Dashboard Operacional/Financeiro) - V2

**Persona**: Diretor de Operações / Gerente de Projeto
**Objetivo**: Monitorar a obra através de um cockpit centralizado que consolida dados de Outlook, Esteira Financeira, Gestão de Materiais e Serviços, e Ranking de Pendências.

---

## 1. Experiência do Usuário (UX)
- **Cockpit em Camadas**: O usuário visualiza os dados do mais macro (Financeiro) ao mais micro (Pendências por área) conforme faz scroll.
- **Leitura Técnica**: Uso intensivo de barras de progresso horizontais e gráficos empilhados para visualização de "Gaps" e "Status".

---

## 2. Estrutura Visual (UI) - Fidelidade ao Protótipo

### Camada 1: Outlook da Obra (Header Horizontal)
- **Outlook do Valor Projetado**: Card com valor BRL M e variação vs FEL.
- **Totais da Obra (Esteira)**: Sequência de KPIs: NC, CP%, EM, CT.
- **Informações da Obra**: Tipo de Obra, Início, Término, Dias Totais.

### Camada 2: Gráficos Macro
- **Lado Esquerdo (Donut)**: Custos por Tipo de Gasto (Materiais, Serviços, Facilidades). Número central grande indicando o total.
- **Lado Direito (Stacked Area)**: Evolução Gastos da Obra. Gráfico de área preenchida mostrando o crescimento acumulado das categorias ao longo do cronograma.

### Camada 3: Gestão Operacional (Grid 3 Colunas)
- **Serviços**: Totais aprovados, Concluídos, Cancelados/Transferidos.
- **Materiais**: Solicitações totais, A solicitar, Entregas (com barra de progresso).
- **Estaleiro**: Facilidades contratadas vs Consumidas.

### Camada 4: Status e Consumo (Gráficos de Barras Horizontais)
- **Status dos Serviços/Materiais**: Barras horizontais segmentadas por: Não executado, Concluído, Aprovada, Pedido aprovado, Pago.
- **Consumo de Facilidades**: Barras comparativas de Contratado vs Consumido por tipo (Energia, Água, etc).

### Camada 5: Pendências e Ranking
- **Pendências por Área**: Gráfico de barras horizontais categorizado por especialidade (Elétrica, Mecânica, NavT, etc).
- **Ranking de Pendências**: Tabela com tags de prioridade (Crítica/Normal) e tempo de abertura (Aging).

---

## 3. Critérios de Aceite Técnicos
1.  [ ] O layout deve respeitar a densidade de informação do vídeo (grid modular).
2.  [ ] Gráficos de barras horizontais devem usar cores segmentadas para representar status múltiplos.
3.  [ ] A tabela de pendências deve destacar visualmente itens críticos (vermelho).
4.  [ ] A Curva S deve ser substituída pelo gráfico de Área Empilhada conforme o vídeo.

---

## 📖 Glossário Atualizado
- **CP**: Custo Previsto / Progresso.
- **MC**: Mão de Obra / Custo Direto.
- **PP**: Planejamento e Controle.
- **Aging**: Tempo decorrido desde a abertura de uma pendência.
