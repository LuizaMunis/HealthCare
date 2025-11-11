// backend/src/services/temperaturaService.js
const TemperaturaModel = require('../models/temperaturaModel');
const ProfileModel = require('../models/profileModel');
class TemperaturaService {
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

  static async createRegistro(usuarioId, perfilId, registroData) {
    // Verificar se o perfil pertence ao usuário
    await this._verifyProfileOwnership(usuarioId, perfilId);

    const { graus_celsius, data_hora_medicao } = registroData;

    if (graus_celsius === undefined || data_hora_medicao === undefined) {
      throw new Error('Graus Celsius e data/hora da medição são obrigatórios.');
    }
    if (typeof graus_celsius !== 'number' || graus_celsius < 30 || graus_celsius > 45) {
      throw new Error('Temperatura inválida ou fora do intervalo humano (30°C - 45°C).');
    }

    if (!perfilId) {
      throw new Error('perfil_id é obrigatório.');
    }

    const normalizedDateTime = String(data_hora_medicao).replace('T', ' ');

    return await TemperaturaModel.create({ perfil_id: perfilId, graus_celsius, data_hora_medicao: normalizedDateTime });
  }

  static async getRegistrosByProfile(usuarioId, perfilId) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    return await TemperaturaModel.findByPerfilId(perfilId);
  }

  static async getRegistroById(usuarioId, perfilId, registroId) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    const registro = await TemperaturaModel.findById(registroId);
    if (!registro) throw new Error('Registro de temperatura não encontrado.');
    if (registro.perfil_id !== Number(perfilId)) throw new Error('Registro não pertence a este perfil');
    return registro;
  }

  static async updateRegistro(usuarioId, perfilId, registroId, updateData) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    const existing = await TemperaturaModel.findById(registroId);
    if (!existing || existing.perfil_id !== Number(perfilId)) throw new Error('Registro não encontrado ou não pertence a este perfil');

    if (updateData.graus_celsius !== undefined) {
      const t = updateData.graus_celsius;
      if (typeof t !== 'number' || t < 30 || t > 45) {
        throw new Error('Temperatura inválida ou fora do intervalo humano (30°C - 45°C).');
      }
    }

    await TemperaturaModel.update(registroId, updateData);
    return await TemperaturaModel.findById(registroId);
  }

  static async deleteRegistro(usuarioId, perfilId, registroId) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    const existing = await TemperaturaModel.findById(registroId);
    if (!existing || existing.perfil_id !== Number(perfilId)) throw new Error('Registro não encontrado ou não pertence a este perfil');
    const deleted = await TemperaturaModel.delete(registroId);
    if (!deleted) throw new Error('Erro ao deletar o registro de temperatura.');
    return true;
  }
}

module.exports = TemperaturaService;