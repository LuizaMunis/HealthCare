// backend/src/services/glicemiaService.js
const GlicemiaModel = require('../models/glicemiaModel');
const ProfileModel = require('../models/profileModel');
class GlicemiaService {
  static async getPerfilIdOrThrow(usuario_id) {
    if (!usuario_id) throw new Error('ID do usuário é obrigatório');
    const perfil = await PerfilModel.findByUserId(usuario_id);
    if (!perfil) throw new Error('Perfil não encontrado para o usuário autenticado');
    return perfil.id;
  }

  static async createRegistro(registroData) {
    const { usuario_id, perfil_id: perfilIdFromBody, glicose_mg_dl, valor_mg_dl, data_hora_medicao } = registroData;
    const perfil_id = perfilIdFromBody || await this.getPerfilIdOrThrow(usuario_id);

    const value = valor_mg_dl ?? glicose_mg_dl; // aceitar ambos nomes
    if (value === undefined || data_hora_medicao === undefined) {
      throw new Error('Valor de glicemia e data/hora são obrigatórios');
    }
    if (typeof value !== 'number' || value < 40 || value > 600) {
      throw new Error('Glicemia inválida (40–600 mg/dL)');
    }

    const normalizedDateTime = String(data_hora_medicao).replace('T', ' ');
    return await GlicemiaModel.create({ perfil_id, valor_mg_dl: value, data_hora_medicao: normalizedDateTime });
  }

  static async getRegistrosByUsuario(usuario_id) {
    const perfil_id = await this.getPerfilIdOrThrow(usuario_id);
    return await GlicemiaModel.findByPerfilId(perfil_id);
  }

  static async getRegistroById(registroId, usuario_id) {
    const perfil_id = await this.getPerfilIdOrThrow(usuario_id);
    const registro = await GlicemiaModel.findById(registroId);
    if (!registro) throw new Error('Registro de glicemia não encontrado');
    if (registro.perfil_id !== perfil_id) throw new Error('Registro não pertence a este usuário');
    return registro;
  }

  static async updateRegistro(registroId, usuario_id, updateData) {
    const perfil_id = await this.getPerfilIdOrThrow(usuario_id);
    const existing = await GlicemiaModel.findById(registroId);
    if (!existing || existing.perfil_id !== perfil_id) throw new Error('Registro não encontrado ou não pertence a este usuário');

    if (updateData.valor_mg_dl !== undefined) {
      const v = updateData.valor_mg_dl;
      if (typeof v !== 'number' || v < 40 || v > 600) {
        throw new Error('Glicemia inválida (40–600 mg/dL)');
      }
    }

    if (updateData.data_hora_medicao) {
      updateData.data_hora_medicao = String(updateData.data_hora_medicao).replace('T', ' ');
    }

    await GlicemiaModel.update(registroId, updateData);
    return await GlicemiaModel.findById(registroId);
  }

  static async deleteRegistro(registroId, usuario_id) {
    const perfil_id = await this.getPerfilIdOrThrow(usuario_id);
    const existing = await GlicemiaModel.findById(registroId);
    if (!existing || existing.perfil_id !== perfil_id) throw new Error('Registro não encontrado ou não pertence a este usuário');
    const deleted = await GlicemiaModel.delete(registroId);
    if (!deleted) throw new Error('Erro ao deletar o registro de glicemia');
    return true;
  }
}

module.exports = GlicemiaService;


