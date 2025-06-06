// backend/src/app.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/database');
const UserModel = require('./models/userModel');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/users', userRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Inicialização do servidor
const startServer = async () => {
  try {
    // Testar conexão com banco
    await testConnection();
    
    // Criar tabelas
    await UserModel.createTable();
    
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📡 API disponível em: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;