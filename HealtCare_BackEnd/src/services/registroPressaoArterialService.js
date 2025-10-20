// HealthCare_Backend/src/services/registroPressaoArterialService.js

const RegistroPressaoArterialModel = require('../models/registroPressaoArterialModel');
const PerfilModel = require('../models/perfilModel');

class RegistroPressaoArterialService {
  /**
   * Obtém perfil_id a partir do usuario_id.
   */
  static async getPerfilIdOrThrow(usuario_id) {
    if (!usuario_id) throw new Error('ID do usuário é obrigatório');
    const perfil = await PerfilModel.findByUserId(usuario_id);
    if (!perfil) throw new Error('Perfil não encontrado para o usuário autenticado');
    return perfil.id;
  }

  /**
   * Cria um novo registro de pressão arterial
   * @param {Object} registroData - Dados do registro
   * @param {number} [registroData.perfil_id] - ID do perfil (preferencial)
   * @param {number} [registroData.usuario_id] - ID do usuário (fallback para compatibilidade)
   * @param {number} registroData.sistolica_mmhg - Pressão sistólica
   * @param {number} registroData.diastolica_mmhg - Pressão diastólica
   * @param {string} registroData.data_hora_medicao - Data e hora da medição
   * @returns {Object} Registro criado
   */
  static async createRegistro(registroData) {
    const { perfil_id: perfilIdFromBody, usuario_id, sistolica_mmhg, diastolica_mmhg, data_hora_medicao } = registroData;

    // Preferir perfil_id já calculado pelo controller; se não vier, derivar do usuario_id
    let perfil_id = perfilIdFromBody;
    if (!perfil_id) {
      perfil_id = await this.getPerfilIdOrThrow(usuario_id);
    }

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

    const newRegistroData = {
      perfil_id,
      sistolica_mmhg: sistolica_mmhg || null,
      diastolica_mmhg: diastolica_mmhg || null,
      data_hora_medicao
    };

    return await RegistroPressaoArterialModel.create(newRegistroData);
  }

  /**
   * Busca todos os registros do perfil do usuário
   * @param {number} usuario_id - ID do usuário (convertido para perfil_id)
   * @returns {Array} Lista de registros
   */
  static async getRegistrosByUsuario(usuario_id) {
    const perfil_id = await this.getPerfilIdOrThrow(usuario_id);
    const registros = await RegistroPressaoArterialModel.findByPerfilId(perfil_id);
    return registros;
  }

  /**
   * Busca um registro específico
   * @param {number} registroId - ID do registro
   * @param {number} usuario_id - ID do usuário (para verificação de propriedade → perfil_id)
   * @returns {Object} Registro encontrado
   */
  static async getRegistroById(registroId, usuario_id) {
    if (!registroId) {
      throw new Error('ID do registro é obrigatório');
    }

    const perfil_id = await this.getPerfilIdOrThrow(usuario_id);
    const registro = await RegistroPressaoArterialModel.findById(registroId);

    // Verificar se o registro pertence ao usuário
    if (registro.perfil_id !== perfil_id) {
      throw new Error('Registro não pertence a este usuário');
    }

    return registro;
  }

  /**
   * Atualiza um registro de pressão arterial
   * @param {number} registroId - ID do registro
   * @param {number} usuario_id - ID do usuário (para verificação → perfil_id)
   * @param {Object} updateData - Dados para atualização
   * @returns {Object} Registro atualizado
   */
  static async updateRegistro(registroId, usuario_id, updateData) {
    if (!registroId) {
      throw new Error('ID do registro é obrigatório');
    }

    const perfil_id = await this.getPerfilIdOrThrow(usuario_id);
    // Verificar se o registro existe e pertence ao perfil do usuário
    const existingRegistro = await RegistroPressaoArterialModel.findById(registroId);
    if (!existingRegistro || existingRegistro.perfil_id !== perfil_id) {
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

    await RegistroPressaoArterialModel.update(registroId, updateData);
    return await RegistroPressaoArterialModel.findById(registroId);
  }

  /**
   * Deleta um registro de pressão arterial
   * @param {number} registroId - ID do registro
   * @param {number} usuario_id - ID do usuário (para verificação → perfil_id)
   * @returns {boolean} True se deletado com sucesso
   */
  static async deleteRegistro(registroId, usuario_id) {
    if (!registroId) {
      throw new Error('ID do registro é obrigatório');
    }

    const perfil_id = await this.getPerfilIdOrThrow(usuario_id);
    const existingRegistro = await RegistroPressaoArterialModel.findById(registroId);
    if (!existingRegistro || existingRegistro.perfil_id !== perfil_id) {
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
   * @param {number} usuario_id - ID do usuário (convertido para perfil_id)
   * @returns {Object} Análise dos registros
   */
  static async analisarRegistros(usuario_id) {
    const perfil_id = await this.getPerfilIdOrThrow(usuario_id);
    const registros = await RegistroPressaoArterialModel.findByPerfilId(perfil_id);
    
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