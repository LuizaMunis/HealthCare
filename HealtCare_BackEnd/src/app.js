// HealthCare_Back-End/src/app.js

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importa funções e modelos necessários
const { testConnection } = require('./config/database');
const UserModel = require('./models/userModel');
const PerfilModel = require('./models/perfilModel');
<<<<<<< HEAD
const RegistroPressaoArterialModel = require('./models/registroPressaoArterialModel'); 
=======
const RegistroPressaoArterialModel = require('./models/registroPressaoArterialModel');
>>>>>>> 955ab6818754a84eaa773769df8ba1f618616e52

// Importa as rotas da aplicação
const userRoutes = require('./routes/userRoutes');
const perfilRoutes = require('./routes/perfilRoutes');
const registroPressaoArterialRoutes = require('./routes/registrosPressaoArterialRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais da aplicação
app.use(cors());
app.use(express.json());

// Definição das rotas da API
app.use('/api/users', userRoutes);
app.use('/api/perfil', perfilRoutes);
<<<<<<< HEAD
app.use('/api/pressao-arterial', registroPressaoArterialRoutes); 
=======
app.use('/api/pressao-arterial', registroPressaoArterialRoutes);
>>>>>>> 955ab6818754a84eaa773769df8ba1f618616e52

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
