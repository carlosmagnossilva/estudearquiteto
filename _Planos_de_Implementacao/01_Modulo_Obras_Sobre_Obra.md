# Plano de Implementação: Módulo Obras - Aba "Sobre a Obra" (Obra 24)

Este plano detalha a implementação da funcionalidade "Sobre a Obra" dentro do Módulo Obras, focada em fornecer uma visão consolidada de dados técnicos, temporais e de embarcação.

## User Review Required

> [!IMPORTANT]
> **Definição de Origem de Dados**: Confirmado que a "Equipe Técnica" terá cadastro próprio no Hub/Banco de Dados. A "Duração Total" será um campo calculado em tempo de execução no frontend/backend.

## Perfil: Product Owner (PO) - Histórias de Usuário e Negócio

### Contexto de Negócio
A aba "Sobre a Obra" serve como o "Cartão de Identidade" da parada. É o ponto de referência para que o time financeiro e operacional entenda o contexto da embarcação, o período de contrato e os marcos temporais.

### User Story: Visão Geral da Obra
**Como** Gestor de Obra ou Analista Financeiro,
**Quero** visualizar os detalhes técnicos e temporais de uma obra específica (ex: Obra 24 - Austral Abrolhos),
**Para** ter contexto imediato sobre a duração, equipe e características da embarcação antes de analisar os custos.

**Critérios de Aceite:**
1. Exibir o cabeçalho com ID da obra (24), Nome (Austral Abrolhos) e Tipo (FEL-3).
2. Agrupar informações em 3 blocos principais: Datas e Durações, Equipe Técnica e Informações da Embarcação.
3. Mostrar campos de datas: Início, Término, Término de Contrato e Ano do Orçamento.
4. Calcular e exibir durações: Obra, Testes, Aceitação e Total.
5. Listar dados da embarcação: Nome, Bandeira, Nacionalidade, Coordenador de Frota e Gerente de Frota.

---

## Perfil: DBA - Modelagem e Estrutura de Dados

### Proposta de Alteração no Schema `hub_core`
As tabelas devem suportar o versionamento (Snapshots) para garantir que, se um Gerente de Frota mudar hoje, o histórico da Obra 24 (de 2026) permaneça com o nome correto da época.

#### [NEW] `new_table_obra_detalhes.sql`
Tabela transacional para armazenar os detalhes da aba "Sobre a Obra".

```sql
CREATE TABLE hub_core.equipe_tecnica (
    id INT PRIMARY KEY IDENTITY(1,1),
    nome VARCHAR(255),
    cargo VARCHAR(100),
    email VARCHAR(255),
    telefone VARCHAR(20),
    updated_at DATETIME2 DEFAULT GETDATE()
);

CREATE TABLE hub_core.obra_detalhes (
    id_obra INT PRIMARY KEY, -- FK para hub_frontend.fato_parada
    data_inicio_obra DATETIME2,
    data_termino_obra DATETIME2,
    data_termino_contrato DATETIME2,
    ano_orcamento INT,
    duracao_obra_dias INT,
    duracao_testes_dias INT,
    duracao_aceitacao_dias INT,
    -- Duração Total é calculada: (Duração Obra + Testes + Aceitação)
    id_coordenador_frota INT, -- FK para equipe_tecnica
    id_gerente_frota INT, -- FK para equipe_tecnica
    embarcacao_nome VARCHAR(255),
    embarcacao_bandeira VARCHAR(50),
    embarcacao_nacionalidade VARCHAR(50),
    inspecao_casco_status VARCHAR(100),
    updated_at DATETIME2 DEFAULT GETDATE()
);
```

---

## Perfil: UX/UI Specialist - Interface e Experiência

### Design System e Componentização
A interface seguirá o padrão de "Drawers/Dialogs" identificado no Figma (nó `9040:197852`).

#### Layout da Tela
1. **Header**: Breadcrumb (`OceanPact / Hub de Obras / Detalhes da Obra`), Título Dinâmico e Tabs de navegação.
2. **Grid de Informações**: Uso de `Grid` (3 colunas em desktop, 1 em mobile).
3. **Cards de Seção**:
    - **Datas e Durações**: Lista de labels com valores destacados e "Helper Texts" para explicar a origem da data (ex: Planejado vs Realizado).
    - **Equipe Técnica**: Avatares e nomes com links para perfil/contato.
    - **Embarcação**: Lista técnica com ícones de bandeira e dados de registro.

#### Micro-interações
- **Skeleton Loading**: Enquanto os dados do `hub-core` são carregados, exibir o `FinancialSkeleton` já existente.
- **Tooltips**: Nos "Helper Texts" do Figma para explicar cálculos de duração.

---

## Plano de Verificação

### Testes Automatizados
- Unitários no backend para validar cálculo de `Duração Total`.
- E2E no frontend para garantir que ao trocar de Obra (ex: da 24 para a 25), os dados do "Sobre a Obra" são limpos e recarregados.

### Validação Manual
- Verificação visual no navegador comparando o componente `SobreObra.tsx` com o protótipo Figma.
