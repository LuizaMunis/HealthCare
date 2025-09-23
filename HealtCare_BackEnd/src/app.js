// HealthCare_Back-End/src/app.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Verificar se as variáveis de ambiente estão carregadas
console.log('🔧 Verificando variáveis de ambiente:');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Definido' : 'NÃO DEFINIDO');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('PORT:', process.env.PORT);

// Importa funções e modelos necessários
const { testConnection } = require('./config/database');
const UserModel = require('./models/userModel');
const PerfilModel = require('./models/perfilModel');
const RegistroPressaoArterialModel = require('./models/registroPressaoArterialModel'); 

// Importa as rotas da aplicação
const userRoutes = require('./routes/userRoutes');
const perfilRoutes = require('./routes/perfilRoutes');
const registroPressaoArterialRoutes = require('./routes/registrosPressaoArterialRoutes'); // NOVO: Importa as rotas de registros
const ErrorMiddleware = require('./middleware/errorMiddleware'); // Ajuste o caminho se necessário

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais da aplicação
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Middlewares de segurança e validação
app.use(ErrorMiddleware.sanitizeHeaders);
app.use(ErrorMiddleware.validateContentType);
app.use(ErrorMiddleware.limitBodySize);
app.use(ErrorMiddleware.logRequest);
app.use(ErrorMiddleware.handleTimeout);

// Definição das rotas da API
app.use('/api/users', userRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/registros-pressao', registroPressaoArterialRoutes); 

// Rota de teste de saúde da API
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando e saudável!',
    timestamp: new Date().toISOString()
  });
});

// Função para iniciar o servidor e configurar o banco de dados
const startServer = async () => {
  try {
    console.log('🔗 Tentando conectar ao banco de dados...');
    await testConnection();
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');

    // Criar ou verificar a existência das tabelas na ordem correta
    // O UserModel.createTable() usará a definição mais recente com VARCHAR(255)
    console.log('📦 Verificando/criando tabela de usuários (schema VARCHAR(255))...');
    await UserModel.createTable();
    console.log('📦 Verificando/criando tabela de perfis...');
    await PerfilModel.createTable();
    console.log('📦 Verificando/criando tabela de registros de pressão arterial...');
    await RegistroPressaoArterialModel.createTable();


    // Middlewares de tratamento de erro (devem ser os últimos)
    app.use(ErrorMiddleware.handleSyntaxError);
    app.use(ErrorMiddleware.handleValidationError);
    app.use(ErrorMiddleware.handleDatabaseError);
    app.use(ErrorMiddleware.handleJWTError);
    app.use(ErrorMiddleware.handleNotFound);
    app.use(ErrorMiddleware.handleGenericError);

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📡 API disponível em: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Erro fatal ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
