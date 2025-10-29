// backend/src/services/frequenciaCardiacaService.js

const FrequenciaCardiacaModel = require('../models/frequenciaCardiacaModel');
const PerfilModel = require('../models/perfilModel');

class FrequenciaCardiacaService {
  static async getPerfilIdOrThrow(usuario_id) {
    if (!usuario_id) throw new Error('ID do usuário é obrigatório');
    const perfil = await PerfilModel.findByUserId(usuario_id);
    if (!perfil) throw new Error('Perfil não encontrado para o usuário autenticado');
    return perfil.id;
  }

  static async createRegistro(registroData) {
    const { usuario_id, perfil_id: perfilIdFromBody, bpm, data_hora_medicao } = registroData;
    const perfil_id = perfilIdFromBody || await this.getPerfilIdOrThrow(usuario_id);

    if (bpm === undefined || data_hora_medicao === undefined) {
      throw new Error('BPM (batimentos por minuto) e data/hora da medição são obrigatórios.');
    }
    if (typeof bpm !== 'number' || bpm < 30 || bpm > 250) {
      throw new Error('BPM inválido ou fora do intervalo humano (30-250 bpm).');
    }

    const normalizedDateTime = String(data_hora_medicao).replace('T', ' ');
    return await FrequenciaCardiacaModel.create({ perfil_id, bpm, data_hora_medicao: normalizedDateTime });
  }

  static async getRegistrosByUsuario(usuario_id) {
    const perfil_id = await this.getPerfilIdOrThrow(usuario_id);
    return await FrequenciaCardiacaModel.findByPerfilId(perfil_id);
  }

  static async getRegistroById(registroId, usuario_id) {
    const perfil_id = await this.getPerfilIdOrThrow(usuario_id);
    const registro = await FrequenciaCardiacaModel.findById(registroId);
    if (!registro) throw new Error('Registro de frequência cardíaca não encontrado.');
    if (registro.perfil_id !== perfil_id) throw new Error('Registro não pertence a este usuário');
    return registro;
  }

  static async updateRegistro(registroId, usuario_id, updateData) {
    const perfil_id = await this.getPerfilIdOrThrow(usuario_id);
    const existing = await FrequenciaCardiacaModel.findById(registroId);
    if (!existing || existing.perfil_id !== perfil_id) throw new Error('Registro não encontrado ou não pertence a este usuário');

    if (updateData.bpm !== undefined) {
      const v = updateData.bpm;
      if (typeof v !== 'number' || v < 30 || v > 250) {
        throw new Error('BPM inválido ou fora do intervalo humano (30-250 bpm).');
      }
    }

    await FrequenciaCardiacaModel.update(registroId, updateData);
    return await FrequenciaCardiacaModel.findById(registroId);
  }

  static async deleteRegistro(registroId, usuario_id) {
    const perfil_id = await this.getPerfilIdOrThrow(usuario_id);
    const existing = await FrequenciaCardiacaModel.findById(registroId);
    if (!existing || existing.perfil_id !== perfil_id) throw new Error('Registro não encontrado ou não pertence a este usuário');
    const deleted = await FrequenciaCardiacaModel.delete(registroId);
    if (!deleted) throw new Error('Erro ao deletar o registro de frequência cardíaca.');
    return true;
  }
}

module.exports = FrequenciaCardiacaService;