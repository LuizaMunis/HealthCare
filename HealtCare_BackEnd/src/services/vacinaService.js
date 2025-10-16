// backend/src/services/vacinaService.js

const VacinaModel = require('../models/vacinaModel');
const PerfilModel = require('../models/perfilModel');

class VacinaService {
<<<<<<< HEAD
  /**
   * Helper para obter o perfil_id a partir do usuario_id.
   */
  static async _getPerfilId(usuarioId) {
    const perfil = await PerfilModel.findByUserId(usuarioId);
    if (!perfil) {
      throw new Error('Perfil de usuário não encontrado. Complete seu perfil para continuar.');
    }
    return perfil.id;
  }
=======
>>>>>>> silvaerikdaniel

  static async createVacina(usuarioId, profileId, dadosVacina) {
    await this._verifyProfileOwnership(usuarioId, profileId);

    const { nome, dose, data_vacinacao } = dadosVacina;
    if (!nome || !dose || !data_vacinacao) {
      throw new Error('Nome da vacina, dose e data de vacinação são obrigatórios.');
    }

    const dadosParaCriar = { 
      ...dadosVacina, 
      perfil_id: profileId,
      nome_vacina: nome // Ajustando nome do campo para o model
    };
    
    return await VacinaModel.create(dadosParaCriar);
  }

  static async getAllVacinasByProfile(usuarioId, profileId) {
    await this._verifyProfileOwnership(usuarioId, profileId);
    return await VacinaModel.findByPerfilId(profileId);
  }

  static async getVacinaById(usuarioId, profileId, vacinaId) {
    await this._verifyProfileOwnership(usuarioId, profileId);
    return await this._verifyVacinaOwnership(profileId, vacinaId);
  }

  static async updateVacina(usuarioId, profileId, vacinaId, dadosUpdate) {
    await this._verifyProfileOwnership(usuarioId, profileId);
    await this._verifyVacinaOwnership(profileId, vacinaId);
    
    if (Object.keys(dadosUpdate).length === 0) {
      throw new Error("Nenhum dado fornecido para atualização.");
    }
    
    await VacinaModel.update(vacinaId, dadosUpdate);
    return await VacinaModel.findById(vacinaId);
  }

  static async deleteVacina(usuarioId, profileId, vacinaId) {
    await this._verifyProfileOwnership(usuarioId, profileId);
    await this._verifyVacinaOwnership(profileId, vacinaId);

    const sucesso = await VacinaModel.delete(vacinaId);
    if (!sucesso) {
      throw new Error("Falha ao deletar o registro de vacina.");
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

  static async _verifyVacinaOwnership(profileId, vacinaId) {
    const vacina = await VacinaModel.findById(vacinaId);
    if (!vacina) {
      throw new Error('Registro de vacina não encontrado.');
    }
    if (vacina.perfil_id !== Number(profileId)) {
      throw new Error('Registro de vacina não pertence a este perfil.');
    }
    return vacina;
  }
}

module.exports = VacinaService;