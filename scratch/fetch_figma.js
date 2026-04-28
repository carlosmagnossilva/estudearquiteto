const https = require('https');
const fs = require('fs');

// Configurações (Use variáveis de ambiente em produção)
const token = process.env.FIGMA_TOKEN; 
const fileKey = 'XVFocfhDF40PupWq3CS0jI';
const nodes = '1215:4312,3127:142081';

const options = {
  hostname: 'api.figma.com',
  path: `/v1/files/${fileKey}/nodes?ids=${nodes}&depth=2`,
  headers: {
    'X-Figma-Token': token
  }
};

console.log('Iniciando download do Figma...');
const file = fs.createWriteStream('scratch/figma_visão_geral_study.json');

https.get(options, (res) => {
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('Download concluído com sucesso!');
  });
}).on('error', (err) => {
  console.error('Erro no download:', err.message);
});
