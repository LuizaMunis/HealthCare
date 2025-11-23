// HealtCare_BackEnd/src/services/aiAnalysisService.js

// Importa a biblioteca para fazer chamadas HTTP para o serviço de IA
const axios = require('axios');

// Importa todos os modelos do banco de dados necessários para coletar os dados
const Perfil = require('../models/profileModel');
const RegistrosPressaoArterial = require('../models/registroPressaoArterialModel');
const RegistrosGlicemia = require('../models/registrosGlicemiaModel'); // Assumindo que o nome do arquivo seja este
const RegistroTemperatura = require('../models/RegistroTemperaturaModel'); // Assumindo que o nome do arquivo seja este
const Sintoma = require('../models/sintomasModel'); // Assumindo que o nome do arquivo seja este
const Doenca = require('../models/doencaModel'); // Necessário para ligar o sintoma ao perfil
const Alerta = require('../models/alertaModel'); // O modelo da tabela 'alertas' que sugerimos

/**
 * Função principal que orquestra a análise de IA para um determinado perfil.
 * @param {number} perfilId - O ID do perfil a ser analisado.
 * @returns {Promise<object>} A análise retornada pela IA.
 */
async function triggerAIAnalysis(perfilId) {
  try {
    console.log(`[AI Service] Iniciando análise para o perfil ID: ${perfilId}`);

    // --- PASSO 1: Coletar os dados de saúde do banco de dados ---
    const perfil = await Perfil.findByPk(perfilId, { attributes: ['data_nascimento', 'genero'] });
    if (!perfil) {
      throw new Error('Perfil não encontrado.');
    }

    // Define o período para buscar o histórico (ex: últimos 14 dias)
    const historyPeriod = new Date();
    historyPeriod.setDate(historyPeriod.getDate() - 14);

    // Busca todos os dados recentes em paralelo para otimizar o tempo
    const [pressaoHistory, glicemiaHistory, temperaturaHistory, sintomaHistory] = await Promise.all([
      RegistrosPressaoArterial.findAll({ where: { perfil_id: perfilId, data_hora_medicao: { [Op.gte]: historyPeriod } }, order: [['data_hora_medicao', 'DESC']] }),
      RegistrosGlicemia.findAll({ where: { perfil_id: perfilId, data_hora_medicao: { [Op.gte]: historyPeriod } }, order: [['data_hora_medicao', 'DESC']] }),
      RegistroTemperatura.findAll({ where: { perfil_id: perfilId, data_hora_medicao: { [Op.gte]: historyPeriod } }, order: [['data_hora_medicao', 'DESC']] }),
      Sintoma.findAll({
        include: [{ model: Doenca, where: { perfil_id: perfilId }, attributes: [] }],
        where: { data_hora_inicio: { [Op.gte]: historyPeriod } },
        order: [['data_hora_inicio', 'DESC']]
      })
    ]);

    // --- PASSO 2: Montar o payload anônimo para a IA ---
    const anonymousPayload = formatDataForAI(perfil, pressaoHistory, glicemiaHistory, temperaturaHistory, sintomaHistory);
    console.log(`[AI Service] Payload anônimo montado. Enviando para o serviço de IA...`);

    // --- PASSO 3: Enviar os dados para o serviço de IA ---
    // A URL do serviço de IA deve vir de uma variável de ambiente por segurança e flexibilidade
    const aiServiceUrl = process.env.AI_SERVICE_URL;
    if (!aiServiceUrl) {
      throw new Error("URL do serviço de IA não está configurada em .env");
    }

    const response = await axios.post(aiServiceUrl, anonymousPayload);
    const aiAnalysis = response.data; // Ex: { riskLevel: 'Atencao', reason: '...' }
    console.log(`[AI Service] Resposta da IA recebida:`, aiAnalysis);

    // --- PASSO 4: Processar a resposta da IA e agir ---
    // Se o nível de risco for relevante, crie um registro na tabela de alertas
    if (aiAnalysis.riskLevel && aiAnalysis.riskLevel !== 'Normal') {
      await Alerta.create({
        perfil_id: perfilId,
        nivel_risco: aiAnalysis.riskLevel,
        mensagem: aiAnalysis.reason || 'A IA detectou um padrão que requer atenção.',
        origem: 'IA',
      });
      console.log(`[AI Service] Alerta de risco '${aiAnalysis.riskLevel}' salvo no banco de dados.`);
      // TODO: Integrar com serviço de notificação push (ex: Firebase Cloud Messaging) para enviar o alerta ao usuário.
    }

    return aiAnalysis;

  } catch (error) {
    // É crucial registrar o erro para poder depurar problemas de comunicação ou de dados
    console.error(`[AI Service] ERRO durante a análise do perfil ID ${perfilId}:`, error.message);
    return null; // Retorna nulo para indicar que a análise falhou
  }
}

/**
 * Função auxiliar para formatar os dados do banco no formato JSON que a IA espera.
 * @private
 */
function formatDataForAI(perfil, pressao, glicemia, temperatura, sintomas) {
  // Função para calcular a idade a partir da data de nascimento (ANONIMIZAÇÃO)
  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return {
    demographics: {
      age: calculateAge(perfil.data_nascimento),
      gender: perfil.genero,
    },
    time_series: {
      blood_pressure: pressao.map(p => ({ systolic: p.sistolica_mmhg, diastolic: p.diastolica_mmhg })),
      glucose: glicemia.map(g => g.valor_mg_dl),
      temperature: temperatura.map(t => parseFloat(t.graus_celsius)),
    },
    reported_symptoms: sintomas.map(s => s.descricao_sintoma),
  };
}


// Exporta a função principal para que possa ser usada pelos controllers
module.exports = {
  triggerAIAnalysis,
};