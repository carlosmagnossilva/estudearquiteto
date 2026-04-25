const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');

const folderUrl = './';

async function readPdfs() {
  const files = fs.readdirSync(folderUrl).filter(f => f.endsWith('.pdf'));
  for (const file of files) {
    const p = path.join(folderUrl, file);
    const dataBuffer = fs.readFileSync(p);
    try {
      const data = await pdf(dataBuffer);
      console.log('--- FILE:', file, '---');
      // Extrair informações mais relevantes: remover espaços em branco e quebras extras
      // alterações de pdf
      const txt = data.text.replace(/\s+/g, ' ').trim();
      console.log(txt.substring(0, 1500));
    } catch (e) {
      console.log('Error reading', file, e.message);
    }
  }
}

readPdfs();
