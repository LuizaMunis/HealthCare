// Script simples para inserir dados de exemplo
const https = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/insert-sample-data',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Resposta:', data);
    process.exit(0);
  });
});

req.on('error', (error) => {
  console.error('Erro:', error);
  process.exit(1);
});

req.end();

