// backend/src/services/vacinaService.js

const VacinaModel = require('../models/vacinaModel');
const ProfileModel = require('../models/profileModel');
class VacinaService {
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

  static async createVacina(usuarioId, perfilId, dadosVacina) {
    // Verificar se o perfil pertence ao usuário
    await this._verifyProfileOwnership(usuarioId, perfilId);

    const { nome_vacina, nome, dose, data_vacinacao } = dadosVacina;
    const finalNome = nome_vacina || nome;
    if (!finalNome || !dose || !data_vacinacao) {
      throw new Error('Nome da vacina, dose e data de vacinação são obrigatórios.');
    }

    if (!perfilId) {
      throw new Error('perfil_id é obrigatório.');
    }

    const normalizedDate = String(data_vacinacao).includes('T') ? String(data_vacinacao).replace('T',' ') : String(data_vacinacao);
    const dadosParaCriar = { perfil_id: perfilId, nome: finalNome, dose, data_vacinacao: normalizedDate };
    return await VacinaModel.create(dadosParaCriar);
  }

  static async getAllVacinasByProfile(usuarioId, perfilId) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    return await VacinaModel.findByPerfilId(perfilId);
  }

  static async getVacinaById(usuarioId, perfilId, vacinaId) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    return await this._verifyVacinaOwnership(perfilId, vacinaId);
  }

  static async updateVacina(usuarioId, perfilId, vacinaId, dadosUpdate) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    await this._verifyVacinaOwnership(perfilId, vacinaId);
    
    if (Object.keys(dadosUpdate).length === 0) {
      throw new Error("Nenhum dado fornecido para atualização.");
    }
    
    // Permitir nome_vacina vindo do frontend
    if (dadosUpdate.nome_vacina && !dadosUpdate.nome) {
      dadosUpdate.nome = dadosUpdate.nome_vacina;
      delete dadosUpdate.nome_vacina;
    }

    if (dadosUpdate.data_vacinacao) {
      dadosUpdate.data_vacinacao = String(dadosUpdate.data_vacinacao).replace('T',' ');
    }
    await VacinaModel.update(vacinaId, dadosUpdate);
    return await VacinaModel.findById(vacinaId);
  }

  static async deleteVacina(usuarioId, perfilId, vacinaId) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    await this._verifyVacinaOwnership(perfilId, vacinaId);

    const sucesso = await VacinaModel.delete(vacinaId);
    if (!sucesso) {
      throw new Error("Falha ao deletar o registro de vacina.");
    }
    return true;
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