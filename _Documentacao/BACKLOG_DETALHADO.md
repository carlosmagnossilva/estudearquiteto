# Backlog Detalhado - Hub de Obras
Última Atualização: 28/04/2026

Este documento contém o mapeamento detalhado de requisitos, user stories e especificações técnicas derivadas da análise do protótipo Figma (Obra 24).

## Fluxo de Dados e Integrações (Data Flow)

O sistema opera sob a seguinte esteira de dados:
1. SGO (Estrutura): Define a quebra inicial (Obra -> Tipo Obra -> Entrega).
2. TM Master (Serviços): Importação de serviços em fase FEL2.
3. Hub (Progresso Físico): Digitação manual de andamento via módulo interno.
4. Esteira Financeira: TM Master (OS) -> Fluig (Aprovação) -> App Medição -> Protheus (Pedido de Compra).

---

## US05: Detalhamento Administrativo (Aba Sobre a Obra) [CONCLUÍDO ✅]

### Descrição
Como Gestor de Obra, desejo visualizar os dados administrativos, prazos e equipe técnica para contextualizar a operação.
**Nota de Implementação**: Implementado no módulo `Obras` com navegação drill-down via Grid principal.

### Critérios de Aceite
- Exibir blocos de Datas (Início, Término, Contrato, Durações).
- Exibir Equipe Técnica (Coordenador, Administrativo, Analistas, Cronograma).
- Exibir Dados da Embarcação (Bandeira, Nacionalidade, Gerente de Frota).
- Exibir Localização (Estaleiro, Condição de Docagem, Inspeção).

### Mapeamento de Banco (hub_core)
- **Tabela hub_core.obras_detalhe**:
    - `data_inicio` (DATE)
    - `data_termino` (DATE)
    - `data_termino_contrato` (DATE)
    - `ano_orcamento` (INT)
    - `duracao_obra` (INT): Dias totais.
    - `duracao_testes` (INT): Dias.
    - `duracao_aceitacao` (INT): Dias.
    - `local_estaleiro` (VARCHAR)
    - `condicao_docagem` (VARCHAR): Ex: Seco.
    - `inspecao_casco` (VARCHAR): Ex: Dry Docking Bottom Survey.
- **Tabela hub_core.equipe_obra**:
    - `coordenador_obra` (VARCHAR)
    - `administrativo` (VARCHAR)
    - `analista_1` (VARCHAR)
    - `analista_2` (VARCHAR)
    - `responsavel_cronograma` (VARCHAR)

---

## US06: Dashboard Executivo (Aba Visão Geral)

### Descrição
Como Diretor, desejo ver o cruzamento financeiro (Protheus) e operacional (Hub) para monitorar desvios. Para garantir performance, esta tela consome uma **Tabela de Cache (US09)** atualizada assincronamente.

### Critérios de Aceite
- Indicador de Outlook: Valor total vs Orçamento FEL.
- Gráfico Curva S: Evolução de gastos (Previsto vs Realizado).
- Mix de Gastos: Percentual por Materiais, Serviços e Facilidades.
- Resumo de Facilidades: Gauge de consumo (Contratado vs Consumido).

### Mapeamento de Banco (hub_core)
- **View hub_core.vw_consolidacao_financeira**:
    - `valor_pedido` (DECIMAL)
    - `valor_nota_fiscal` (DECIMAL)
    - `status_pagamento` (VARCHAR)
- **Tabela hub_core.obra_facilidades**:
    - `valor_contratado` (DECIMAL)
    - `valor_consumido` (DECIMAL)
    - `percentual_limite` (DECIMAL)

---

## US07: Gestão de Entregas (Aba Entrega)

### Descrição
Como Planejamento, desejo ver o progresso físico-financeiro detalhado e solicitar novas entregas.

### Critérios de Aceite
- Grid de Entregas: Colunas de CP (Current Progress) para Materiais e Serviços.
- Resumo de Facilidades: Linha dedicada com ROLLUP de custos de facilidades.
- Botão Solicitar Nova Entrega: Modal com Nome, Tipo de Obra e Justificativa.

### Mapeamento de Banco (hub_core)
- **Tabela hub_core.entregas**:
    - `nome_entrega` (VARCHAR)
    - `valor_total` (DECIMAL)
    - `cp_nominal` (DECIMAL)
    - `cp_percentual` (DECIMAL)
- **Tabela hub_core.entrega_detalhe_fisico**:
    - `material_planejado` (INT/DECIMAL)
    - `material_concluido` (INT/DECIMAL)
    - `servico_cp_nominal` (DECIMAL)
- **Tabela hub_core.solicitacoes_entrega**:
    - `nome_entrega_solicitada` (VARCHAR)
    - `tipo_obra_id` (FK)
    - `justificativa` (TEXT)

---

## US08: Centro de Controle de Serviços (Aba Serviços)

### Descrição
Como Gestor de Contratos, desejo gerenciar serviços do TM Master e lançar progresso físico manualmente.

### Critérios de Aceite
- Importação TM Master: Fluxo de conciliação (1 ou 2 etapas) para vincular IDs JOB/ONE.
- Adição Manual: Cadastro de serviço com vínculo N:N para Materiais.
- Vistas: Alternância entre Visão Serviços (Flat) e Visão Obra (Hierárquica).
- Interações: Lupa (Detalhes), Chat (Histórico/Comentários) e 3 Pontinhos (Ações).

### Mapeamento de Banco (hub_core)
- **Tabela hub_core.servicos**:
    - `id_servico` (VARCHAR): Ex: 24-0001.
    - `escopo` (TEXT)
    - `tipo_obra_id` (FK)
    - `responsavel_id` (FK)
    - `fornecedor_id` (FK)
    - `valor_estimado` (DECIMAL)
    - `data_inicio_prevista` (DATE)
    - `data_fim_prevista` (DATE)
    - `status_id` (FK)
    - `id_job_one` (VARCHAR): Vínculo externo TM Master.
- **Tabela hub_core.servicos_materiais_vinculo**:
    - `servico_id` (FK)
    - `material_id` (FK)
- **Tabela hub_core.lancamentos_progresso**:
    - `percentual_informado` (DECIMAL)
    - `usuario_id` (FK)
    - `timestamp` (DATETIME)

---

---

## US09: Infraestrutura de Sincronização e Cache de Dashboard

### Descrição
Como Arquiteto de Sistemas, desejo implementar um mecanismo de cache assíncrono (Job de 1 min) para consolidar dados do `hub_core` no `hub_frontend`, garantindo performance executiva (sub-segundo).

### Critérios de Aceite
- Tabela de cache `obra_dashboard_cache` criada.
- Job de consolidação executando a cada 1 minuto (após término da rodada).
- BFF consumindo exclusivamente da tabela de cache.
- Exibição de timestamp de última atualização no frontend.

---

## Evidências e Narrativa de Navegação (Figma)

Esta seção descreve as observações visuais e comportamentais realizadas durante a inspeção do protótipo em 27/04/2026.

### 1. Aba: Sobre a Obra (Contexto Real)
Durante a navegação na Obra 24 (Austral Abrolhos), identifiquei os seguintes dados reais:
- **Prazos**: A obra está planejada para 86 dias (02/12/2024 a 26/02/2025).
- **Equipe Identificada**: 
    - Coordenador: Maurício Oliveira
    - Administrativo: Elena Milch
    - Analista 1: Marcos Rodrigues
- **Localização**: Estaleiro Mauá, operando em Condição Seco com Inspeção Dry Docking Bottom Survey.

### 2. Aba: Visão Geral (Dashboards Financeiros)
- **Outlook**: Exibição de R$ 38,1M com um indicador de variação de -12% FEL.
- **Gráficos**: 
    - Um gráfico de área mostra a Curva S de desembolso.
    - Um gráfico de rosca detalha o mix de gastos.
    - O gauge de facilidades mostra um estouro real (125%), com R$ 4,7M consumidos contra R$ 3,4M contratados.
- **Interação**: Ao passar o mouse nos gráficos, tooltips exibem os valores mensais exatos.

### 3. Aba: Entrega (Grids e Fluxos)
- **Comportamento do Grid**: O grid principal de entregas é denso. Ao realizar o "drag" horizontal, colunas de Materiais (Planejado vs Concluído) e Serviços (CP Nominal vs %) são reveladas.
- **Componente de Facilidades**: No rodapé da aba Entrega, existe uma linha fixa que resume as Facilidades (Total 0.4, CP 0.2, CP% 50%).
- **Fluxo de Solicitação**: O botão "Solicitar nova entrega" abre uma modal limpa com campos de texto e um dropdown de seletores de "Tipo de Obra".

### 4. Aba: Serviços (Deep Dive)
- **Importação TM Master**:
    - **Interface**: Painel duplo. À esquerda, serviços vindos do TM Master (ex: ONE456 - Tratar e reformar Porta Estanque). À direita, o espaço para o serviço correspondente no Hub.
    - **Processo**: O usuário seleciona o item à esquerda para "conciliar" com o Hub.
- **Adicionar Serviço (Wizard)**:
    - **Etapa 1**: Campos de ID (ex: 24-0001), Escopo (textarea longo), Select de Fornecedor (ex: Estaleiro Mauá) e Valor Estimado.
    - **Etapa 2**: Uma lista de materiais com checkboxes para vínculo direto.
- **Vistas**: 
    - **Visão Obra**: O grid se transforma em uma estrutura "Tree View", agrupando serviços por fases ou tipos de obra.
- **Interações de Linha**:
    - **Lupa**: Abre uma visão de "Somente Leitura" com os dados do serviço e materiais vinculados.
    - **Chat**: Abre uma lateral direita para troca de mensagens e log de sistema.
    - **3 Pontinhos**: Dropdown com Editar, Excluir, Vincular Material e Ver Log.
