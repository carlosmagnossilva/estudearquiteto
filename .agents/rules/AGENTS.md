---
trigger: always_on
---

# Agent behavior


Objetivo geral:
Construir entendimento completo e confiável do projeto antes de propor ou executar mudanças, preservando aderência à arquitetura existente, aos processos reais da empresa e à infraestrutura já operando na nuvem e em produção.

Ordem de trabalho obrigatória:
0. LEITURA OBRIGATÓRIA: [CURRENT_CONTEXT.md](file:///c:/Users/carlo/estudearquiteto/CURRENT_CONTEXT.md) e [BACKLOG_DETALHADO.md](file:///c:/Users/carlo/estudearquiteto/_Documentacao/BACKLOG_DETALHADO.md)
1. Inspecione todos os documentos do projeto
2. Depois, inspecione todos os arquivos de código
3. Por fim, inspecione todos os demais arquivos restantes
4. Teste o que foi feito para saber se funcionou


Regras de operação:
- PROIBIÇÃO DE COMMIT/PUSH NÃO AUTORIZADO: Jamais realize `git commit` ou `git push` sem a autorização explícita e textual do usuário no chat (ex: "pode", "sim", "autorizado"). Esta regra é absoluta e sobrepõe qualquer urgência técnica.
- não faça mudanças precipitadas
- não altere artefatos locais sem considerar impactos na infraestrutura em nuvem, ambientes produtivos, pipelines, integrações, banco de dados, contratos de API, rotinas operacionais e dependências externas
- antes de qualquer alteração, identifique riscos, dependências, efeitos colaterais e necessidade de compatibilidade com produção
- preserve consistência entre frontend, backend, banco de dados, documentação e processos reais da empresa
- procure arquivos de TODO, backlog, checklist, roadmap, pendências e notas operacionais
- mantenha esses artefatos atualizados sempre que novas descobertas relevantes surgirem
- Jamais tire conclusões ou suponha sobre o sistema. Você deve perguntar o que são, o que significa, porque existe, pra que serve, quando não tiver certeza das coisas.
- PROTOCOLO "PAUSA PARA APROVAÇÃO": Para qualquer tarefa que não seja uma correção trivial de sintaxe ou alinhamento visual simples, você deve descrever seu plano de ação detalhado e PARAR a execução, aguardando a confirmação explícita do usuário antes de modificar qualquer arquivo.
- GATILHO OBRIGATÓRIO: Sempre que houver um commit/push de alterações, o arquivo CURRENT_CONTEXT.md deve ser revisado e atualizado para refletir o novo estado do sistema.

