// backend/src/services/glicemiaService.js
const GlicemiaModel = require('../models/glicemiaModel');
const ProfileModel = require('../models/profileModel');
class GlicemiaService {
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

    const { glicose_mg_dl, valor_mg_dl, data_hora_medicao } = registroData;

    const value = valor_mg_dl ?? glicose_mg_dl; // aceitar ambos nomes
    if (value === undefined || data_hora_medicao === undefined) {
      throw new Error('Valor de glicemia e data/hora são obrigatórios');
    }
    if (typeof value !== 'number' || value < 40 || value > 600) {
      throw new Error('Glicemia inválida (40–600 mg/dL)');
    }

    if (!perfilId) {
      throw new Error('perfil_id é obrigatório.');
    }

    const normalizedDateTime = String(data_hora_medicao).replace('T', ' ');
    return await GlicemiaModel.create({ perfil_id: perfilId, valor_mg_dl: value, data_hora_medicao: normalizedDateTime });
  }

  static async getRegistrosByProfile(usuarioId, perfilId) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    return await GlicemiaModel.findByPerfilId(perfilId);
  }

  static async getRegistroById(usuarioId, perfilId, registroId) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    const registro = await GlicemiaModel.findById(registroId);
    if (!registro) throw new Error('Registro de glicemia não encontrado');
    if (registro.perfil_id !== Number(perfilId)) throw new Error('Registro não pertence a este perfil');
    return registro;
  }

  static async updateRegistro(usuarioId, perfilId, registroId, updateData) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    const existing = await GlicemiaModel.findById(registroId);
    if (!existing || existing.perfil_id !== Number(perfilId)) throw new Error('Registro não encontrado ou não pertence a este perfil');

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

  static async deleteRegistro(usuarioId, perfilId, registroId) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    const existing = await GlicemiaModel.findById(registroId);
    if (!existing || existing.perfil_id !== Number(perfilId)) throw new Error('Registro não encontrado ou não pertence a este perfil');
    const deleted = await GlicemiaModel.delete(registroId);
    if (!deleted) throw new Error('Erro ao deletar o registro de glicemia');
    return true;
  }
}

module.exports = GlicemiaService;


