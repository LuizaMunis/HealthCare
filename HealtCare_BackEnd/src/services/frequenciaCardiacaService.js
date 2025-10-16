// backend/src/services/frequenciaCardiacaService.js

const FrequenciaCardiacaModel = require('../models/frequenciaCardiacaModel');
const PerfilModel = require('../models/perfilModel');

class FrequenciaCardiacaService {
  static async createRegistro(usuarioId, perfilId, registroData) {
    await this._verifyProfileOwnership(usuarioId, perfilId);

    const { bpm, data_hora_medicao } = registroData;

    if (!bpm || !data_hora_medicao) {
      throw new Error('BPM (batimentos por minuto) e data/hora da medição são obrigatórios.');
    }
    if (typeof bpm !== 'number' || bpm < 30 || bpm > 250) {
      throw new Error('BPM inválido ou fora do intervalo humano (30-250 bpm).');
    }

    const dataToCreate = {
      perfil_id: perfilId,
      bpm,
      data_hora_medicao,
    };

    return await FrequenciaCardiacaModel.create(dataToCreate);
  }

  static async getAllRegistrosByProfile(usuarioId, perfilId) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    return await FrequenciaCardiacaModel.findByPerfilId(perfilId);
  }

  static async getRegistroById(usuarioId, perfilId, registroId) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    return await this._verifyRegistroOwnership(perfilId, registroId);
  }

  static async updateRegistro(usuarioId, perfilId, registroId, updateData) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    await this._verifyRegistroOwnership(perfilId, registroId);

    if (updateData.bpm && (typeof updateData.bpm !== 'number' || updateData.bpm < 30 || updateData.bpm > 250)) {
        throw new Error('BPM inválido ou fora do intervalo humano (30-250 bpm).');
    }

    await FrequenciaCardiacaModel.update(registroId, updateData);
    return await FrequenciaCardiacaModel.findById(registroId);
  }

  static async deleteRegistro(usuarioId, perfilId, registroId) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    await this._verifyRegistroOwnership(perfilId, registroId);

    const deleted = await FrequenciaCardiacaModel.delete(registroId);
    if (!deleted) {
      throw new Error('Erro ao deletar o registro de frequência cardíaca.');
    }
    return true;
  }

  static async _verifyProfileOwnership(usuarioId, profileId) {
    const perfil = await PerfilModel.findById(profileId);
    if (!perfil) {
      throw new Error('Perfil não encontrado.');
    }
    if (perfil.usuario_id !== usuarioId) {
      throw new Error('Acesso não autorizado a este perfil.');
    }
    return perfil;
  }

  static async _verifyRegistroOwnership(perfilId, registroId) {
    const registro = await FrequenciaCardiacaModel.findById(registroId);
    if (!registro) {
      throw new Error('Registro de frequência cardíaca não encontrado.');
    }
    if (registro.perfil_id !== Number(perfilId)) {
      throw new Error('Registro não pertence a este perfil.');
    }
    return registro;
  }
}

module.exports = FrequenciaCardiacaService;