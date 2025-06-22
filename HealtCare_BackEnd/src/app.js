// backend/src/app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importa funções e modelos necessários
const { testConnection } = require('./config/database');
const UserModel = require('./models/userModel');
const PerfilModel = require('./models/perfilModel');
const RegistroPressaoArterialModel = require('./models/registroPressaoArterialModel'); // NOVO: Importa o modelo de registros

// Importa as rotas da aplicação
const userRoutes = require('./routes/userRoutes');
const perfilRoutes = require('./routes/perfilRoutes');
const registroPressaoArterialRoutes = require('./routes/registrosPressaoArterialRoutes'); // NOVO: Importa as rotas de registros

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais da aplicação
app.use(cors());
app.use(express.json());

// Definição das rotas da API
app.use('/api/users', userRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/pressao-arterial', registroPressaoArterialRoutes); // NOVO: Adiciona as rotas de pressão arterial

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
    console.log('📦 Verificando/criando tabela de usuários...');
    await UserModel.createTable();
    console.log('📦 Verificando/criando tabela de perfis...');
    await PerfilModel.createTable();
    console.log('📦 Verificando/criando tabela de registros de pressão arterial...');
    await RegistroPressaoArterialModel.createTable(); // NOVO: Chama a criação da tabela de registros

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
