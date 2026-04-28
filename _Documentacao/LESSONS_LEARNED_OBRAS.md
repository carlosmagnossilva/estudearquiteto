# Post-Mortem & Lições Aprendidas: Módulo Obras (CRUD Sobre a Obra)
**Data**: 28/04/2026

## 🎨 UI/UX High-Fidelity (Dashboard Cockpit)

### 1. Hierarquia de "Boneca Russa"
- **Padrão**: Um Dashboard Executivo de alta fidelidade exige 3 níveis de containers.
  - **Nível 1 (Pai)**: Card principal com borda grossa e background principal do módulo.
  - **Nível 2 (Filho)**: Seções internas (ex: Outlook Sections) com bordas de 1px e background levemente translúcido.
  - **Nível 3 (Neto)**: Metric boxes individuais com background sólido e bordas finas.
- **Erro a evitar**: Remover bordas intermediárias achando que fica "clean". A borda é o que dá a sensação de Cockpit/Instrumentação.

### 2. Simetria Vertical Absoluta
- **Regra**: Todos os cards em uma mesma linha horizontal **devem** ter a mesma altura, independentemente do volume de conteúdo.
- **Técnica**: Usar `align-items: stretch` no container Flex e definir um `min-height` base (ex: `140px`) para as seções irmãs.

### 3. DNA do Card (Design Tokens)
- **Fundo**: `#1e293b` (Deep Navy) para cards de métrica.
- **Borda**: `1.5px solid rgba(255, 255, 255, 0.15)`.
- **Cantos**: `16px` a `20px` (Rounded).
- **Tipografia**: Contrastante (Branco puro para valores, Slate-400 para labels).

### 4. Vanilla CSS vs Tailwind
- **Decisão**: Para telas de alta fidelidade "pixel-perfect", o **Vanilla CSS com variáveis** é superior. O Tailwind deve ser evitado em componentes complexos de Dashboard para garantir controle total sobre paddings e simetrias finas.

## 📌 Visão Geral
Esta sessão focou na implementação de um CRUD completo e revitalização da interface "Sobre a Obra" no módulo Obras. Apesar do sucesso técnico final, a sessão foi marcada por regressões de layout e problemas de comunicação que devem ser evitados.

## ❌ Falhas Identificadas (O que deu errado)
1. **Regressão de Código Funcional**: Ao implementar uma melhoria visual (ícone de calendário), a IA removeu inadvertidamente a lógica de largura de campos (`getInputWidth`) que já havia sido validada pelo usuário.
2. **Ciclo de Correção Ineficiente**: Foram necessárias 4 interações para ajustar contrastes e visibilidade de bordas no modo dark, algo que deveria ter sido previsto na primeira implementação multi-tema.
3. **Erros de Sintaxe Básicos**: Ocorreu um erro de JSX (tag `div` não fechada) durante um ajuste de layout, quebrando a compilação e interrompendo o fluxo de trabalho do usuário.
4. **Falta de Persistência de Contexto entre Edições**: A IA não "travou" as propriedades de estilo já validadas ao aplicar novos patches, tratando cada edição como um bloco isolado em vez de uma evolução incremental.

## 💡 Lições Aprendidas (Padrão de Qualidade)

1. **A Regra de Ouro**: O protótipo (Figma/Vídeo) é o nosso guia aprovado pelo usuário. Ele precede qualquer decisão técnica ou preferência pessoal de implementação.
2. **Fidelidade Visual é Prioridade Máxima**: O usuário forneceu vídeo e protótipos claros. Qualquer desvio (como campos esticados ou cores sem contraste) gera retrabalho imediato.
3. **Preservação de Propriedades (Golden Rule)**: Funções de utilidade de estilo (como `getInputWidth` ou `getEditValue`) uma vez validadas, **jamais** devem ser removidas ou alteradas em patches subsequentes, a menos que solicitado.
4. **Verificação Dupla de Temas**: O "Modo Claro" e "Modo Escuro" possuem comportamentos distintos para componentes nativos (como o DatePicker). O uso de `color-scheme` e sombras é mandatório para visibilidade.
5. **User Stories de Alta Granularidade**: Para evitar ambiguidades, as histórias de usuário devem descrever não apenas a meta, mas a experiência completa: nomes exatos de campos, comportamentos de clique, aparências específicas por tema (claro/escuro) e estados de componente (edição/visualização). Este nível de detalhe é o novo padrão para o projeto.
6. **Fidelidade Frame-a-Frame**: Vídeos de tela fornecidos pelo usuário são a "verdade única". Ordem de colunas, nomenclaturas e alinhamentos devem ser validados frame a frame antes da entrega.
7. **Glossário da Esteira Financeira**: Internalizar os termos RE (Realizado), EM (Empenhado), CO (Comprometido), ES (Estimado) e NC (Não comprometido) como o padrão de comunicação do sistema.
8. **Gestão de Credenciais de Design**: O link e o token do Figma (MCP) devem estar sempre registrados no `.env` do projeto para garantir acesso autônomo e imediato à fonte da verdade visual (Figma File Key e Access Token).

## 🛡️ Novas Diretrizes de Trabalho (Para futuras tarefas)
Para evitar que esses erros se repitam, os agentes devem seguir este checklist antes de propor qualquer mudança em código validado:

1. **Check de Terminologia**: Verificar se os status (ex: FEL, FECH, EXEC) e colunas financeiras seguem o padrão estabelecido na documentação da US correspondente.
2. **Check de Documentação PO Sênior**: Antes de codar, a User Story deve estar escrita com o nível de detalhe que permita a implementação pixel-perfect.
3. **Check de Regressão Visual**: Validar `max-w` e comportamentos de `theme-aware` em telas grandes.
- [ ] **Análise de Regressão**: A nova alteração remove alguma função, variável ou classe CSS que foi adicionada em turnos anteriores desta mesma sessão?
- [ ] **Validação de Sintaxe**: O bloco de código JSX/TSX está com todas as tags devidamente fechadas?
- [ ] **Dual-Theme Check**: Como essa mudança se comporta em fundos `#000000` (Dark) vs `#FFFFFF` (Light)?
- [ ] **Integridade de Layout**: A responsividade e as restrições de largura (`max-w`) foram mantidas?

---
*Este documento serve como memória persistente para que as falhas de coordenação desta sessão não se repitam em módulos futuros.*
