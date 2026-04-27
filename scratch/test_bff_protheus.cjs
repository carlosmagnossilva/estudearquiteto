const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 4000,
  path: '/bff/protheus/publish',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer 123' // Fake token
  }
}, (res) => {
  let raw = '';
  res.on('data', c => raw += c);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('HEADERS:', res.headers);
    console.log('BODY:', raw);
  });
});
req.on('error', console.error);
req.write(JSON.stringify({ payload: [] }));
req.end();
