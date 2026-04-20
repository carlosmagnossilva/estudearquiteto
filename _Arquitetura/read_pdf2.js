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
      const txt = data.text.replace(/\s+/g, ' ').trim();
      fs.writeFileSync(p + '.txt', txt);
    } catch(e) {}
  }
}

readPdfs();
