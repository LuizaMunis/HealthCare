// HealthCare_Backend/src/services/registroPressaoArterialService.js

const RegistroPressaoArterialModel = require('../models/registroPressaoArterialModel');

class RegistroPressaoArterialService {
  /**
   * Cria um novo registro de pressão arterial
   * @param {Object} registroData - Dados do registro
   * @param {number} registroData.usuario_id - ID do usuário
   * @param {number} registroData.sistolica_mmhg - Pressão sistólica
   * @param {number} registroData.diastolica_mmhg - Pressão diastólica
   * @param {string} registroData.data_hora_medicao - Data e hora da medição
   * @returns {Object} Registro criado
   */
  static async createRegistro(registroData) {
    const { usuario_id, sistolica_mmhg, diastolica_mmhg, data_hora_medicao } = registroData;

    // Validações de negócio
    if (!usuario_id) {
      throw new Error('ID do usuário é obrigatório');
    }

    if (!data_hora_medicao) {
      throw new Error('A data e hora da medição são obrigatórias');
    }

    // Validações de pressão arterial
    if (sistolica_mmhg && (typeof sistolica_mmhg !== 'number' || sistolica_mmhg <= 0)) {
      throw new Error('Pressão sistólica inválida');
    }

    if (diastolica_mmhg && (typeof diastolica_mmhg !== 'number' || diastolica_mmhg <= 0)) {
      throw new Error('Pressão diastólica inválida');
    }

    if (sistolica_mmhg && diastolica_mmhg && sistolica_mmhg < diastolica_mmhg) {
      throw new Error('Pressão sistólica não pode ser menor que a diastólica');
    }

    // Validações médicas adicionais
    if (sistolica_mmhg && (sistolica_mmhg < 70 || sistolica_mmhg > 300)) {
      throw new Error('Pressão sistólica fora do intervalo válido (70-300 mmHg)');
    }

    if (diastolica_mmhg && (diastolica_mmhg < 40 || diastolica_mmhg > 200)) {
      throw new Error('Pressão diastólica fora do intervalo válido (40-200 mmHg)');
    }

    const newRegistroData = {
      usuario_id,
      sistolica_mmhg: sistolica_mmhg || null,
      diastolica_mmhg: diastolica_mmhg || null,
      data_hora_medicao
    };

    const newRegistro = await RegistroPressaoArterialModel.create(newRegistroData);
    return newRegistro;
  }

  /**
   * Busca todos os registros de um usuário
   * @param {number} usuario_id - ID do usuário
   * @returns {Array} Lista de registros
   */
  static async getRegistrosByUsuario(usuario_id) {
    if (!usuario_id) {
      throw new Error('ID do usuário é obrigatório');
    }

    const registros = await RegistroPressaoArterialModel.findByUsuarioId(usuario_id);
    return registros;
  }

  /**
   * Busca um registro específico
   * @param {number} registroId - ID do registro
   * @param {number} usuario_id - ID do usuário (para verificação de propriedade)
   * @returns {Object} Registro encontrado
   */
  static async getRegistroById(registroId, usuario_id) {
    if (!registroId) {
      throw new Error('ID do registro é obrigatório');
    }

    if (!usuario_id) {
      throw new Error('ID do usuário é obrigatório');
    }

    const registro = await RegistroPressaoArterialModel.findById(registroId);
    
    if (!registro) {
      throw new Error('Registro não encontrado');
    }

    // Verificar se o registro pertence ao usuário
    if (registro.usuario_id !== usuario_id) {
      throw new Error('Registro não pertence a este usuário');
    }

    return registro;
  }

  /**
   * Atualiza um registro de pressão arterial
   * @param {number} registroId - ID do registro
   * @param {number} usuario_id - ID do usuário
   * @param {Object} updateData - Dados para atualização
   * @returns {Object} Registro atualizado
   */
  static async updateRegistro(registroId, usuario_id, updateData) {
    if (!registroId) {
      throw new Error('ID do registro é obrigatório');
    }

    if (!usuario_id) {
      throw new Error('ID do usuário é obrigatório');
    }

    // Verificar se o registro existe e pertence ao usuário
    const existingRegistro = await RegistroPressaoArterialModel.findById(registroId);
    if (!existingRegistro || existingRegistro.usuario_id !== usuario_id) {
      throw new Error('Registro não encontrado ou não pertence a este usuário');
    }

    // Validações para dados de atualização
    if (updateData.sistolica_mmhg && (typeof updateData.sistolica_mmhg !== 'number' || updateData.sistolica_mmhg <= 0)) {
      throw new Error('Pressão sistólica inválida');
    }

    if (updateData.diastolica_mmhg && (typeof updateData.diastolica_mmhg !== 'number' || updateData.diastolica_mmhg <= 0)) {
      throw new Error('Pressão diastólica inválida');
    }

    if (updateData.sistolica_mmhg && updateData.diastolica_mmhg && updateData.sistolica_mmhg < updateData.diastolica_mmhg) {
      throw new Error('Pressão sistólica não pode ser menor que a diastólica');
    }

    // Validações médicas para atualização
    if (updateData.sistolica_mmhg && (updateData.sistolica_mmhg < 70 || updateData.sistolica_mmhg > 300)) {
      throw new Error('Pressão sistólica fora do intervalo válido (70-300 mmHg)');
    }

    if (updateData.diastolica_mmhg && (updateData.diastolica_mmhg < 40 || updateData.diastolica_mmhg > 200)) {
      throw new Error('Pressão diastólica fora do intervalo válido (40-200 mmHg)');
    }

    const updated = await RegistroPressaoArterialModel.update(registroId, updateData);
    
    if (!updated) {
      throw new Error('Nenhum dado para atualizar');
    }

    const updatedRegistro = await RegistroPressaoArterialModel.findById(registroId);
    return updatedRegistro;
  }

  /**
   * Deleta um registro de pressão arterial
   * @param {number} registroId - ID do registro
   * @param {number} usuario_id - ID do usuário
   * @returns {boolean} True se deletado com sucesso
   */
  static async deleteRegistro(registroId, usuario_id) {
    if (!registroId) {
      throw new Error('ID do registro é obrigatório');
    }

    if (!usuario_id) {
      throw new Error('ID do usuário é obrigatório');
    }

    // Verificar se o registro existe e pertence ao usuário
    const existingRegistro = await RegistroPressaoArterialModel.findById(registroId);
    if (!existingRegistro || existingRegistro.usuario_id !== usuario_id) {
      throw new Error('Registro não encontrado ou não pertence a este usuário');
    }

    const deleted = await RegistroPressaoArterialModel.delete(registroId);
    
    if (!deleted) {
      throw new Error('Erro ao deletar registro');
    }

    return true;
  }

  /**
   * Analisa os registros de pressão arterial de um usuário
   * @param {number} usuario_id - ID do usuário
   * @returns {Object} Análise dos registros
   */
  static async analisarRegistros(usuario_id) {
    if (!usuario_id) {
      throw new Error('ID do usuário é obrigatório');
    }

    const registros = await RegistroPressaoArterialModel.findByUsuarioId(usuario_id);
    
    if (registros.length === 0) {
      return {
        totalRegistros: 0,
        mediaSistolica: null,
        mediaDiastolica: null,
        classificacao: 'Sem dados suficientes',
        alertas: []
      };
    }

    // Calcular médias
    const registrosComDados = registros.filter(r => r.sistolica_mmhg && r.diastolica_mmhg);
    
    let mediaSistolica = null;
    let mediaDiastolica = null;
    
    if (registrosComDados.length > 0) {
      mediaSistolica = registrosComDados.reduce((sum, r) => sum + r.sistolica_mmhg, 0) / registrosComDados.length;
      mediaDiastolica = registrosComDados.reduce((sum, r) => sum + r.diastolica_mmhg, 0) / registrosComDados.length;
    }

    // Classificação da pressão arterial
    let classificacao = 'Normal';
    const alertas = [];

    if (mediaSistolica && mediaDiastolica) {
      if (mediaSistolica >= 140 || mediaDiastolica >= 90) {
        classificacao = 'Hipertensão';
        alertas.push('Pressão arterial elevada detectada');
      } else if (mediaSistolica < 90 || mediaDiastolica < 60) {
        classificacao = 'Hipotensão';
        alertas.push('Pressão arterial baixa detectada');
      } else if (mediaSistolica >= 120 || mediaDiastolica >= 80) {
        classificacao = 'Pré-hipertensão';
        alertas.push('Pressão arterial no limite superior');
      }
    }

    return {
      totalRegistros: registros.length,
      mediaSistolica: Math.round(mediaSistolica * 10) / 10,
      mediaDiastolica: Math.round(mediaDiastolica * 10) / 10,
      classificacao,
      alertas
    };
  }

  /**
   * Busca registros por período
   * @param {number} usuario_id - ID do usuário
   * @param {string} dataInicio - Data de início (YYYY-MM-DD)
   * @param {string} dataFim - Data de fim (YYYY-MM-DD)
   * @returns {Array} Registros do período
   */
  static async getRegistrosPorPeriodo(usuario_id, dataInicio, dataFim) {
    if (!usuario_id) {
      throw new Error('ID do usuário é obrigatório');
    }

    if (!dataInicio || !dataFim) {
      throw new Error('Data de início e fim são obrigatórias');
    }

    // Validar formato das datas
    const dataInicioObj = new Date(dataInicio);
    const dataFimObj = new Date(dataFim);

    if (isNaN(dataInicioObj.getTime()) || isNaN(dataFimObj.getTime())) {
      throw new Error('Formato de data inválido');
    }

    if (dataInicioObj > dataFimObj) {
      throw new Error('Data de início deve ser anterior à data de fim');
    }

    // Buscar registros do período
    const registros = await RegistroPressaoArterialModel.findByUsuarioId(usuario_id);
    
    return registros.filter(registro => {
      const dataRegistro = new Date(registro.data_hora_medicao);
      return dataRegistro >= dataInicioObj && dataRegistro <= dataFimObj;
    });
  }
}

module.exports = RegistroPressaoArterialService;
