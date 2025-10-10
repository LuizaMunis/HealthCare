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

// --- Imports de infraestrutura/modelos ---
const { testConnection } = require('./config/database');
const UserModel = require('./models/userModel');
const PerfilModel = require('./models/perfilModel');
const RegistroPressaoArterialModel = require('./models/registroPressaoArterialModel'); 

// --- Rotas ---
const userRoutes = require('./routes/userRoutes');
const perfilRoutes = require('./routes/perfilRoutes');
const registroPressaoArterialRoutes = require('./routes/registrosPressaoArterialRoutes'); // Importa as rotas de registros
const ErrorMiddleware = require('./middleware/errorMiddleware'); // Ajuste o caminho se necessário

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // ✅ acessível pela rede

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
app.use('/api/perfil', perfilRoutes);
app.use('/api/registros-pressao', registroPressaoArterialRoutes); 

// --- Health checks (ambas por conveniência) ---
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'API funcionando e saudável!', timestamp: new Date().toISOString() });
});
app.get('/health', (_req, res) => {
  res.json({ ok: true, message: 'alive', ts: Date.now() });
});

// --- Boot do servidor + migrações simples ---
const startServer = async () => {
  try {
    console.log('🔗 Tentando conectar ao banco de dados...');
    await testConnection();
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');

    console.log('📦 Verificando/criando tabela de usuários (schema VARCHAR(255))...');
    await UserModel.createTable();

    console.log('📦 Verificando/criando tabela de perfis...');
    await PerfilModel.createTable();

    console.log('📦 Verificando/criando tabela de registros de pressão arterial...');
    await RegistroPressaoArterialModel.createTable();

    // --- Middlewares finais de erro (depois das rotas) ---
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
