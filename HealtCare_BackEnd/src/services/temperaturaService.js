// backend/src/services/temperaturaService.js
const TemperaturaModel = require('../models/temperaturaModel');
const PerfilModel = require('../models/perfilModel');

class TemperaturaService {
  static async getPerfilIdOrThrow(usuario_id) {
    if (!usuario_id) throw new Error('ID do usuário é obrigatório');
    const perfil = await PerfilModel.findByUserId(usuario_id);
    if (!perfil) throw new Error('Perfil não encontrado para o usuário autenticado');
    return perfil.id;
  }

  static async createRegistro(registroData) {
    const { usuario_id, perfil_id: perfilIdFromBody, graus_celsius, data_hora_medicao } = registroData;
    const perfil_id = perfilIdFromBody || await this.getPerfilIdOrThrow(usuario_id);

    if (graus_celsius === undefined || data_hora_medicao === undefined) {
      throw new Error('Graus Celsius e data/hora da medição são obrigatórios.');
    }
    if (typeof graus_celsius !== 'number' || graus_celsius < 30 || graus_celsius > 45) {
      throw new Error('Temperatura inválida ou fora do intervalo humano (30°C - 45°C).');
    }

    const normalizedDateTime = String(data_hora_medicao).replace('T', ' ');

    return await TemperaturaModel.create({ perfil_id, graus_celsius, data_hora_medicao: normalizedDateTime });
  }

  static async getRegistrosByUsuario(usuario_id) {
    const perfil_id = await this.getPerfilIdOrThrow(usuario_id);
    return await TemperaturaModel.findByPerfilId(perfil_id);
  }

  static async getRegistroById(registroId, usuario_id) {
    const perfil_id = await this.getPerfilIdOrThrow(usuario_id);
    const registro = await TemperaturaModel.findById(registroId);
    if (!registro) throw new Error('Registro de temperatura não encontrado.');
    if (registro.perfil_id !== perfil_id) throw new Error('Registro não pertence a este usuário');
    return registro;
  }

  static async updateRegistro(registroId, usuario_id, updateData) {
    const perfil_id = await this.getPerfilIdOrThrow(usuario_id);
    const existing = await TemperaturaModel.findById(registroId);
    if (!existing || existing.perfil_id !== perfil_id) throw new Error('Registro não encontrado ou não pertence a este usuário');

    if (updateData.graus_celsius !== undefined) {
      const t = updateData.graus_celsius;
      if (typeof t !== 'number' || t < 30 || t > 45) {
        throw new Error('Temperatura inválida ou fora do intervalo humano (30°C - 45°C).');
      }
    }

    await TemperaturaModel.update(registroId, updateData);
    return await TemperaturaModel.findById(registroId);
  }

  static async deleteRegistro(registroId, usuario_id) {
    const perfil_id = await this.getPerfilIdOrThrow(usuario_id);
    const existing = await TemperaturaModel.findById(registroId);
    if (!existing || existing.perfil_id !== perfil_id) throw new Error('Registro não encontrado ou não pertence a este usuário');
    const deleted = await TemperaturaModel.delete(registroId);
    if (!deleted) throw new Error('Erro ao deletar o registro de temperatura.');
    return true;
  }
}

module.exports = TemperaturaService;