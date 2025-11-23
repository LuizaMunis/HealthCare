// HealthCare_Back-End/src/app.js

const express = require('express');
const cors = require('cors');
const path = require('path');
// Garante que as variáveis sejam lidas do arquivo config.env na raiz do backend
require('dotenv').config({ path: path.resolve(__dirname, '../config.env') });

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
const medicamentoRoutes = require('./routes/medicamentoRoutes');
const doencaRoutes = require('./routes/doencaRoutes');
const sintomaRoutes = require('./routes/sintomaRoutes');
const vacinaRoutes = require('./routes/vacinaRoutes');
const temperaturaRoutes = require('./routes/temperaturaRoute');
const frequenciaCardiacaRoutes = require('./routes/frequenciaCardiacaRoute');
const registroConsultaRoutes = require('./routes/registroConsultaRoutes');
const glicemiaRoutes = require('./routes/glicemiaRoutes');
const ErrorMiddleware = require('./middleware/errorMiddleware'); // Ajuste o caminho se necessário

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
app.use('/api/perfil', perfilRoutes);
app.use('/api/registros-pressao', registroPressaoArterialRoutes); 
app.use('/api/medicamentos', medicamentoRoutes);
app.use('/api/doencas', doencaRoutes);
app.use('/api/sintomas', sintomaRoutes);
app.use('/api/vacinas', vacinaRoutes);

// Endpoint temporário para inserir dados de exemplo
app.post('/api/insert-sample-data', async (req, res) => {
  try {
    const { pool } = require('./config/database');
    
    // Buscar o primeiro perfil disponível
    const [profiles] = await pool.execute('SELECT id FROM perfil LIMIT 1');
    
    if (profiles.length === 0) {
      return res.status(400).json({ success: false, message: 'Nenhum perfil encontrado' });
    }

    const profileId = profiles[0].id;
    
    // Inserir doenças de exemplo
    const doencas = [
      { nome_doenca: 'Gripe', tipo_doenca: 'Viral', data_diagnostico: '2024-01-15', observacoes: 'Doença viral comum' },
      { nome_doenca: 'Hipertensão', tipo_doenca: 'Crônica', data_diagnostico: '2024-02-01', observacoes: 'Pressão arterial elevada' },
      { nome_doenca: 'Diabetes Tipo 2', tipo_doenca: 'Crônica', data_diagnostico: '2024-03-10', observacoes: 'Diabetes mellitus tipo 2' },
      { nome_doenca: 'Resfriado', tipo_doenca: 'Viral', data_diagnostico: '2024-04-05', observacoes: 'Resfriado comum' },
      { nome_doenca: 'Dor de Cabeça', tipo_doenca: 'Sintomática', data_diagnostico: '2024-05-01', observacoes: 'Cefaleia tensional' }
    ];

    for (const doenca of doencas) {
      const query = `INSERT INTO doenca (perfil_id, nome_doenca, tipo_doenca, data_diagnostico, observacoes) VALUES (?, ?, ?, ?, ?)`;
      const values = [profileId, doenca.nome_doenca, doenca.tipo_doenca, doenca.data_diagnostico, doenca.observacoes];
      await pool.execute(query, values);
    }

    res.json({ success: true, message: 'Dados de exemplo inseridos com sucesso', profileId });
  } catch (error) {
    console.error('Erro ao inserir dados de exemplo:', error);
    res.status(500).json({ success: false, message: 'Erro ao inserir dados de exemplo' });
  }
});
app.use('/api/temperatura', temperaturaRoutes);
app.use('/api/frequencia-cardiaca', frequenciaCardiacaRoutes);
app.use('/api/glicemia', glicemiaRoutes);
app.use('/api/consultas', registroConsultaRoutes);

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

    console.log('📦 Verificando conexão com banco de dados...');
    console.log('✅ Banco de dados pronto para uso');

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