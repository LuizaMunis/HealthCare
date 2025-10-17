// backend/src/services/temperaturaService.js
const TemperaturaModel = require('../models/temperaturaModel');
const PerfilModel = require('../models/perfilModel');

class TemperaturaService {
  static async createRegistro(usuarioId, perfilId, registroData) {
    await this._verifyProfileOwnership(usuarioId, perfilId);

    const { graus_celsius, data_hora_medicao } = registroData;

    if (!graus_celsius || !data_hora_medicao) {
      throw new Error('Graus Celsius e data/hora da medição são obrigatórios.');
    }
    if (typeof graus_celsius !== 'number' || graus_celsius < 30 || graus_celsius > 45) {
      throw new Error('Temperatura inválida ou fora do intervalo humano (30°C - 45°C).');
    }

    const dataToCreate = {
      perfil_id: perfilId,
      graus_celsius,
      data_hora_medicao,
    };

    return await TemperaturaModel.create(dataToCreate);
  }

  static async getAllRegistrosByProfile(usuarioId, perfilId) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    return await TemperaturaModel.findByPerfilId(perfilId);
  }

  static async getRegistroById(usuarioId, perfilId, registroId) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    return await this._verifyRegistroOwnership(perfilId, registroId);
  }

  static async updateRegistro(usuarioId, perfilId, registroId, updateData) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    await this._verifyRegistroOwnership(perfilId, registroId);

    if (updateData.graus_celsius && (typeof updateData.graus_celsius !== 'number' || updateData.graus_celsius < 30 || updateData.graus_celsius > 45)) {
      throw new Error('Temperatura inválida ou fora do intervalo humano (30°C - 45°C).');
    }

    await TemperaturaModel.update(registroId, updateData);
    return await TemperaturaModel.findById(registroId);
  }

  static async deleteRegistro(usuarioId, perfilId, registroId) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    await this._verifyRegistroOwnership(perfilId, registroId);

    const deleted = await TemperaturaModel.delete(registroId);
    if (!deleted) {
      throw new Error('Erro ao deletar o registro de temperatura.');
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
    const registro = await TemperaturaModel.findById(registroId);
    if (!registro) {
      throw new Error('Registro de temperatura não encontrado.');
    }
    if (registro.perfil_id !== Number(perfilId)) {
      throw new Error('Registro não pertence a este perfil.');
    }
    return registro;
  }
}

module.exports = TemperaturaService;