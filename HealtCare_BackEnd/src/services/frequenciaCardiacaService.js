// backend/src/services/frequenciaCardiacaService.js

const FrequenciaCardiacaModel = require('../models/frequenciaCardiacaModel');
const PerfilModel = require('../models/perfilModel');

class FrequenciaCardiacaService {
  static async _getPerfilId(usuarioId) {
    const perfil = await PerfilModel.findByUsuarioId(usuarioId);
    if (!perfil) {
      throw new Error('Perfil de usuário não encontrado.');
    }
    return perfil.id;
  }

  /**
   * Cria um novo registro de frequência cardíaca.
   */
  static async createRegistro(usuarioId, dadosRegistro) {
    const { bpm, data_hora_medicao } = dadosRegistro;
    if (!bpm || !data_hora_medicao) {
      throw new Error('BPM (batimentos por minuto) e data/hora da medição são obrigatórios.');
    }
    if (typeof bpm !== 'number' || bpm <= 0) {
        throw new Error('O valor de BPM deve ser um número positivo.');
    }

    const perfilId = await this._getPerfilId(usuarioId);
    const dadosParaCriar = { ...dadosRegistro, perfil_id: perfilId };

    return await FrequenciaCardiacaModel.create(dadosParaCriar);
  }

  /**
   * Retorna todos os registros de um usuário.
   */
  static async getAllRegistrosByUsuario(usuarioId) {
    const perfilId = await this._getPerfilId(usuarioId);
    return await FrequenciaCardiacaModel.findByPerfilId(perfilId);
  }

  /**
   * Busca um registro por ID, garantindo que pertence ao usuário.
   */
  static async getRegistroById(usuarioId, registroId) {
    const perfilId = await this._getPerfilId(usuarioId);
    const registro = await FrequenciaCardiacaModel.findById(registroId);

    if (!registro) {
      throw new Error('Registro de frequência cardíaca não encontrado.');
    }
    if (registro.perfil_id !== perfilId) {
      throw new Error('Acesso negado. Este registro não pertence ao seu perfil.');
    }
    return registro;
  }

  /**
   * Atualiza um registro.
   */
  static async updateRegistro(usuarioId, registroId, dadosUpdate) {
    await this.getRegistroById(usuarioId, registroId); // Garante a posse

    delete dadosUpdate.id;
    delete dadosUpdate.perfil_id;

    if (Object.keys(dadosUpdate).length === 0) {
      throw new Error("Nenhum dado fornecido para atualização.");
    }

    const sucesso = await FrequenciaCardiacaModel.update(registroId, dadosUpdate);
    if (!sucesso) throw new Error("Falha ao atualizar o registro.");
    
    return await FrequenciaCardiacaModel.findById(registroId);
  }

  /**
   * Deleta um registro.
   */
  static async deleteRegistro(usuarioId, registroId) {
    await this.getRegistroById(usuarioId, registroId); // Garante a posse

    const sucesso = await FrequenciaCardiacaModel.delete(registroId);
    if (!sucesso) throw new Error("Falha ao deletar o registro.");
    
    return true;
  }
}

module.exports = FrequenciaCardiacaService;