// backend/src/services/doencaService.js
const DoencaModel = require('../models/doencaModel');
const SintomaModel = require('../models/sintomaModel');
const ProfileModel = require('../models/profileModel');
class DoencaService {
  static async createDoenca(usuarioId, profileId, doencaData) {
    await this._verifyProfileOwnership(usuarioId, profileId);

    const { nome_doenca, tipo_doenca } = doencaData;
    if (!nome_doenca || !tipo_doenca) {
      throw new Error('Nome e tipo da doença são obrigatórios.');
    }

    const dataToCreate = { ...doencaData, perfil_id: profileId };
    return await DoencaModel.create(dataToCreate);
  }

  static async getAllDoencasByProfile(usuarioId, profileId) {
    await this._verifyProfileOwnership(usuarioId, profileId);
    return await DoencaModel.findByPerfilId(profileId);
  }

  static async getDoencaById(usuarioId, profileId, doencaId) {
    await this._verifyProfileOwnership(usuarioId, profileId);
    return await this._verifyDoencaOwnership(profileId, doencaId);
  }

  static async updateDoenca(usuarioId, profileId, doencaId, updateData) {
    await this._verifyProfileOwnership(usuarioId, profileId);
    await this._verifyDoencaOwnership(profileId, doencaId);

    await DoencaModel.update(doencaId, updateData);
    return await DoencaModel.findById(doencaId);
  }

  static async deleteDoenca(usuarioId, profileId, doencaId) {
    await this._verifyProfileOwnership(usuarioId, profileId);
    await this._verifyDoencaOwnership(profileId, doencaId);

    return await DoencaModel.delete(doencaId);
  }

  // --- MÉTODOS PARA SINTOMA ---
  static async addSintoma(usuarioId, profileId, doencaId, sintomaData) {
    await this._verifyProfileOwnership(usuarioId, profileId);
    await this._verifyDoencaOwnership(profileId, doencaId);
    
    const { descricao_sintoma, intensidade, data_hora_inicio } = sintomaData;
    if (!descricao_sintoma || !intensidade || !data_hora_inicio) {
      throw new Error('Descrição, intensidade e data/hora de início do sintoma são obrigatórios.');
    }
    
    const dataToCreate = { ...sintomaData, doenca_id: doencaId };
    return await SintomaModel.create(dataToCreate);
  }

  static async getSintomasByDoenca(usuarioId, profileId, doencaId) {
    await this._verifyProfileOwnership(usuarioId, profileId);
    await this._verifyDoencaOwnership(profileId, doencaId);

    return await SintomaModel.findByDoencaId(doencaId);
  }

  // --- Métodos Privados de Verificação ---
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

  static async _verifyDoencaOwnership(profileId, doencaId) {
    const doenca = await DoencaModel.findById(doencaId);
    if (!doenca) {
      throw new Error('Doença não encontrada.');
    }
    if (doenca.perfil_id !== Number(profileId)) {
      throw new Error('Doença não pertence a este perfil.');
    }
    return doenca;
  }
}

module.exports = DoencaService;