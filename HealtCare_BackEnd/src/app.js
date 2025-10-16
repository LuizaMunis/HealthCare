// HealthCare_Back-End/src/app.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// --- Logs iniciais de ambiente ---
console.log('🔧 Verificando variáveis de ambiente:');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Definido' : 'NÃO DEFINIDO');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('PORT:', process.env.PORT);

// --- Imports de infraestrutura ---
const { testConnection } = require('./config/db');

// --- Rotas ---
const userRoutes = require('./routes/userRoutes');
const perfilRoutes = require('./routes/perfilRoutes'); // Este router agora gerencia todas as rotas aninhadas
const ErrorMiddleware = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// --- Middlewares globais ---
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// --- Middlewares de segurança/validação ---
app.use(ErrorMiddleware.sanitizeHeaders);
app.use(ErrorMiddleware.validateContentType);
app.use(ErrorMiddleware.limitBodySize);
app.use(ErrorMiddleware.logRequest);
app.use(ErrorMiddleware.handleTimeout);

// --- Rotas da API ---
app.use('/api/users', userRoutes);
app.use('/api/profiles', perfilRoutes); // Rota principal para perfis e todos os seus dados aninhados

// --- Health checks ---
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'API funcionando e saudável!', timestamp: new Date().toISOString() });
});
app.get('/health', (_req, res) => {
  res.json({ ok: true, message: 'alive', ts: Date.now() });
});

// --- Boot do servidor ---
const startServer = async () => {
  try {
    console.log('🔗 Tentando conectar ao banco de dados...');
    await testConnection();
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');

    // --- Middlewares finais de erro (devem vir depois das rotas) ---
    app.use(ErrorMiddleware.handleSyntaxError);
    app.use(ErrorMiddleware.handleValidationError);
    app.use(ErrorMiddleware.handleDatabaseError);
    app.use(ErrorMiddleware.handleJWTError);
    app.use(ErrorMiddleware.handleNotFound);
    app.use(ErrorMiddleware.handleGenericError);

    app.listen(PORT, HOST, () => {
      console.log(`🚀 Servidor rodando em http://${HOST}:${PORT}`);
      console.log(`📡 API disponível em: http://${HOST}:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Erro fatal ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;