// backend/src/services/vacinaService.js

const VacinaModel = require('../models/vacinaModel');
const PerfilModel = require('../models/perfilModel');

class VacinaService {
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

  static async createVacina(usuarioId, dadosVacina) {
    const perfilId = await this._getPerfilId(usuarioId);

    const { nome_vacina, nome, dose, data_vacinacao } = dadosVacina;
    const finalNome = nome_vacina || nome;
    if (!finalNome || !dose || !data_vacinacao) {
      throw new Error('Nome da vacina, dose e data de vacinação são obrigatórios.');
    }

    const normalizedDate = String(data_vacinacao).includes('T') ? String(data_vacinacao).replace('T',' ') : String(data_vacinacao);
    const dadosParaCriar = { perfil_id: perfilId, nome: finalNome, dose, data_vacinacao: normalizedDate };
    return await VacinaModel.create(dadosParaCriar);
  }

  static async getAllVacinasByUsuario(usuarioId) {
    const perfilId = await this._getPerfilId(usuarioId);
    return await VacinaModel.findByPerfilId(perfilId);
  }

  static async getVacinaById(usuarioId, vacinaId) {
    const perfilId = await this._getPerfilId(usuarioId);
    return await this._verifyVacinaOwnership(perfilId, vacinaId);
  }

  static async updateVacina(usuarioId, vacinaId, dadosUpdate) {
    const perfilId = await this._getPerfilId(usuarioId);
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

  static async deleteVacina(usuarioId, vacinaId) {
    const perfilId = await this._getPerfilId(usuarioId);
    await this._verifyVacinaOwnership(perfilId, vacinaId);

    const sucesso = await VacinaModel.delete(vacinaId);
    if (!sucesso) {
      throw new Error("Falha ao deletar o registro de vacina.");
    }
    return true;
  }

  // Mantido _getPerfilId acima; verificação por perfil específico não é mais necessária nos métodos públicos

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