// HealthCare_Backend/src/services/registroPressaoArterialService.js

const RegistroPressaoArterialModel = require('../models/registroPressaoArterialModel');
const ProfileModel = require('../models/profileModel');

class RegistroPressaoArterialService {
  /**
   * Verifica se o perfil pertence ao usuário.
   */
  static async _verifyProfileOwnership(usuarioId, perfilId) {
    const perfil = await ProfileModel.findById(perfilId);
    if (!perfil) {
      throw new Error('Perfil não encontrado.');
    }
    if (perfil.usuario_id !== Number(usuarioId)) {
      throw new Error('Acesso não autorizado a este perfil.');
    }
    return perfil;
  }

  /**
   * Cria um novo registro de pressão arterial
   * @param {number} usuarioId - ID do usuário autenticado
   * @param {number} perfilId - ID do perfil
   * @param {Object} registroData - Dados do registro
   * @param {number} registroData.sistolica_mmhg - Pressão sistólica
   * @param {number} registroData.diastolica_mmhg - Pressão diastólica
   * @param {string} registroData.data_hora_medicao - Data e hora da medição
   * @returns {Object} Registro criado
   */
  static async createRegistro(usuarioId, perfilId, registroData) {
    // Verificar se o perfil pertence ao usuário
    await this._verifyProfileOwnership(usuarioId, perfilId);

    const { sistolica_mmhg, diastolica_mmhg, data_hora_medicao } = registroData;

    if (!data_hora_medicao) {
      throw new Error('A data e hora da medição são obrigatórias');
    }
    if (sistolica_mmhg && (typeof sistolica_mmhg !== 'number' || sistolica_mmhg < 70 || sistolica_mmhg > 300)) {
      throw new Error('Pressão sistólica inválida ou fora do intervalo (70-300 mmHg)');
    }
    if (diastolica_mmhg && (typeof diastolica_mmhg !== 'number' || diastolica_mmhg < 40 || diastolica_mmhg > 200)) {
      throw new Error('Pressão diastólica inválida ou fora do intervalo (40-200 mmHg)');
    }
    if (sistolica_mmhg && diastolica_mmhg && sistolica_mmhg < diastolica_mmhg) {
      throw new Error('Pressão sistólica não pode ser menor que a diastólica');
    }

    if (!perfilId) {
      throw new Error('perfil_id é obrigatório.');
    }

    // Normaliza a data para o formato aceito pelo MySQL (YYYY-MM-DD HH:MM:SS)
    const normalizedDateTime = String(data_hora_medicao).replace('T', ' ');

    const newRegistroData = {
      perfil_id: perfilId,
      sistolica_mmhg: sistolica_mmhg || null,
      diastolica_mmhg: diastolica_mmhg || null,
      data_hora_medicao: normalizedDateTime
    };

    return await RegistroPressaoArterialModel.create(newRegistroData);
  }

  /**
   * Busca todos os registros do perfil
   * @param {number} usuarioId - ID do usuário autenticado
   * @param {number} perfilId - ID do perfil
   * @returns {Array} Lista de registros
   */
  static async getRegistrosByProfile(usuarioId, perfilId) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    const registros = await RegistroPressaoArterialModel.findByPerfilId(perfilId);
    return registros;
  }

  /**
   * Busca um registro específico
   * @param {number} usuarioId - ID do usuário autenticado
   * @param {number} perfilId - ID do perfil
   * @param {number} registroId - ID do registro
   * @returns {Object} Registro encontrado
   */
  static async getRegistroById(usuarioId, perfilId, registroId) {
    if (!registroId) {
      throw new Error('ID do registro é obrigatório');
    }

    await this._verifyProfileOwnership(usuarioId, perfilId);
    const registro = await RegistroPressaoArterialModel.findById(registroId);

    if (!registro) {
      throw new Error('Registro não encontrado');
    }

    // Verificar se o registro pertence ao perfil
    if (registro.perfil_id !== Number(perfilId)) {
      throw new Error('Registro não pertence a este perfil');
    }

    return registro;
  }

  /**
   * Atualiza um registro de pressão arterial
   * @param {number} usuarioId - ID do usuário autenticado
   * @param {number} perfilId - ID do perfil
   * @param {number} registroId - ID do registro
   * @param {Object} updateData - Dados para atualização
   * @returns {Object} Registro atualizado
   */
  static async updateRegistro(usuarioId, perfilId, registroId, updateData) {
    if (!registroId) {
      throw new Error('ID do registro é obrigatório');
    }

    await this._verifyProfileOwnership(usuarioId, perfilId);
    // Verificar se o registro existe e pertence ao perfil do usuário
    const existingRegistro = await RegistroPressaoArterialModel.findById(registroId);
    if (!existingRegistro || existingRegistro.perfil_id !== Number(perfilId)) {
      throw new Error('Registro não encontrado ou não pertence a este perfil');
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

    await RegistroPressaoArterialModel.update(registroId, updateData);
    return await RegistroPressaoArterialModel.findById(registroId);
  }

  /**
   * Deleta um registro de pressão arterial
   * @param {number} usuarioId - ID do usuário autenticado
   * @param {number} perfilId - ID do perfil
   * @param {number} registroId - ID do registro
   * @returns {boolean} True se deletado com sucesso
   */
  static async deleteRegistro(usuarioId, perfilId, registroId) {
    if (!registroId) {
      throw new Error('ID do registro é obrigatório');
    }

    await this._verifyProfileOwnership(usuarioId, perfilId);
    const existingRegistro = await RegistroPressaoArterialModel.findById(registroId);
    if (!existingRegistro || existingRegistro.perfil_id !== Number(perfilId)) {
      throw new Error('Registro não encontrado ou não pertence a este perfil');
    }

    const deleted = await RegistroPressaoArterialModel.delete(registroId);
    
    if (!deleted) {
      throw new Error('Erro ao deletar registro');
    }
    return true;
  }

  /**
   * Analisa os registros de pressão arterial de um perfil
   * @param {number} usuarioId - ID do usuário autenticado
   * @param {number} perfilId - ID do perfil
   * @returns {Object} Análise dos registros
   */
  static async analisarRegistros(usuarioId, perfilId) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    const registros = await RegistroPressaoArterialModel.findByPerfilId(perfilId);
    
    if (registros.length === 0) {
      return { totalRegistros: 0, mediaSistolica: null, mediaDiastolica: null, classificacao: 'Sem dados suficientes', alertas: [] };
    }

    const registrosComDados = registros.filter(r => r.sistolica_mmhg && r.diastolica_mmhg);
    if (registrosComDados.length === 0) {
        return { totalRegistros: registros.length, mediaSistolica: null, mediaDiastolica: null, classificacao: 'Sem dados suficientes', alertas: [] };
    }

    const mediaSistolica = registrosComDados.reduce((sum, r) => sum + r.sistolica_mmhg, 0) / registrosComDados.length;
    const mediaDiastolica = registrosComDados.reduce((sum, r) => sum + r.diastolica_mmhg, 0) / registrosComDados.length;

    let classificacao = 'Normal';
    if (mediaSistolica >= 140 || mediaDiastolica >= 90) {
      classificacao = 'Hipertensão';
    } else if (mediaSistolica < 90 || mediaDiastolica < 60) {
      classificacao = 'Hipotensão';
    } else if (mediaSistolica >= 120 || mediaDiastolica >= 80) {
      classificacao = 'Pré-hipertensão';
    }

    return {
      totalRegistros: registros.length,
      mediaSistolica: Math.round(mediaSistolica),
      mediaDiastolica: Math.round(mediaDiastolica),
      classificacao
    };
  }
}

module.exports = RegistroPressaoArterialService;