// backend/src/services/frequenciaCardiacaService.js

const FrequenciaCardiacaModel = require('../models/frequenciaCardiacaModel');
const ProfileModel = require('../models/profileModel');
class FrequenciaCardiacaService {
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

    const { bpm, data_hora_medicao } = registroData;

    if (bpm === undefined || data_hora_medicao === undefined) {
      throw new Error('BPM (batimentos por minuto) e data/hora da medição são obrigatórios.');
    }
    if (typeof bpm !== 'number' || bpm < 30 || bpm > 250) {
      throw new Error('BPM inválido ou fora do intervalo humano (30-250 bpm).');
    }

    if (!perfilId) {
      throw new Error('perfil_id é obrigatório.');
    }

    const normalizedDateTime = String(data_hora_medicao).replace('T', ' ');
    return await FrequenciaCardiacaModel.create({ perfil_id: perfilId, bpm, data_hora_medicao: normalizedDateTime });
  }

  static async getRegistrosByProfile(usuarioId, perfilId) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    return await FrequenciaCardiacaModel.findByPerfilId(perfilId);
  }

  static async getRegistroById(usuarioId, perfilId, registroId) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    const registro = await FrequenciaCardiacaModel.findById(registroId);
    if (!registro) throw new Error('Registro de frequência cardíaca não encontrado.');
    if (registro.perfil_id !== Number(perfilId)) throw new Error('Registro não pertence a este perfil');
    return registro;
  }

  static async updateRegistro(usuarioId, perfilId, registroId, updateData) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    const existing = await FrequenciaCardiacaModel.findById(registroId);
    if (!existing || existing.perfil_id !== Number(perfilId)) throw new Error('Registro não encontrado ou não pertence a este perfil');

    if (updateData.bpm !== undefined) {
      const v = updateData.bpm;
      if (typeof v !== 'number' || v < 30 || v > 250) {
        throw new Error('BPM inválido ou fora do intervalo humano (30-250 bpm).');
      }
    }

    await FrequenciaCardiacaModel.update(registroId, updateData);
    return await FrequenciaCardiacaModel.findById(registroId);
  }

  static async deleteRegistro(usuarioId, perfilId, registroId) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    const existing = await FrequenciaCardiacaModel.findById(registroId);
    if (!existing || existing.perfil_id !== Number(perfilId)) throw new Error('Registro não encontrado ou não pertence a este perfil');
    const deleted = await FrequenciaCardiacaModel.delete(registroId);
    if (!deleted) throw new Error('Erro ao deletar o registro de frequência cardíaca.');
    return true;
  }
}

module.exports = FrequenciaCardiacaService;