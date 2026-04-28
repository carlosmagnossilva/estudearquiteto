const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scratch/figma_visão_geral_study.json', 'utf8'));

function listChildren(node, level = 0) {
  if (!node) return;
  console.log(' '.repeat(level * 2) + `[${node.id}] ${node.name} (${node.type})`);
  if (node.children) {
    node.children.forEach(child => listChildren(child, level + 1));
  }
}

// Focar no nó Financeiro
const financeiro = data.nodes['3127:142081'];
if (financeiro && financeiro.document) {
  listChildren(financeiro.document);
} else {
  console.log('Nó Financeiro não encontrado ou estrutura inválida');
}
