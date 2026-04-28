# Post-Mortem & Lições Aprendidas: Módulo Obras (CRUD Sobre a Obra)
**Data**: 28/04/2026

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
