// backend/src/services/vacinaService.js

const VacinaModel = require('../models/vacinaModel');
const PerfilModel = require('../models/perfilModel');

class VacinaService {
  /**
   * Helper para obter o perfil_id a partir do usuario_id.
   */
  static async _getPerfilId(usuarioId) {
    const perfil = await PerfilModel.findByUsuarioId(usuarioId);
    if (!perfil) {
      throw new Error('Perfil de usuário não encontrado. Complete seu perfil para continuar.');
    }
    return perfil.id;
  }

  /**
   * Cria um novo registro de vacina.
   */
  static async createVacina(usuarioId, dadosVacina) {
    const { nome_vacina, dose, data_vacinacao } = dadosVacina;

    if (!nome_vacina || !dose || !data_vacinacao) {
      throw new Error('Nome da vacina, dose e data de vacinação são obrigatórios.');
    }

    const perfilId = await this._getPerfilId(usuarioId);
    const dadosParaCriar = { ...dadosVacina, perfil_id: perfilId };

    return await VacinaModel.create(dadosParaCriar);
  }

  /**
   * Retorna todas as vacinas de um usuário.
   */
  static async getAllVacinasByUsuario(usuarioId) {
    const perfilId = await this._getPerfilId(usuarioId);
    return await VacinaModel.findByPerfilId(perfilId);
  }

  /**
   * Busca um registro de vacina por ID, garantindo que pertence ao usuário.
   */
  static async getVacinaById(usuarioId, vacinaId) {
    const perfilId = await this._getPerfilId(usuarioId);
    const vacina = await VacinaModel.findById(vacinaId);

    if (!vacina) {
      throw new Error('Registro de vacina não encontrado.');
    }
    if (vacina.perfil_id !== perfilId) {
      throw new Error('Acesso negado. Este registro de vacina não pertence ao seu perfil.');
    }

    return vacina;
  }

  /**
   * Atualiza um registro de vacina.
   */
  static async updateVacina(usuarioId, vacinaId, dadosUpdate) {
    await this.getVacinaById(usuarioId, vacinaId); // Garante a posse do registro

    delete dadosUpdate.id;
    delete dadosUpdate.perfil_id;

    if (Object.keys(dadosUpdate).length === 0) {
      throw new Error("Nenhum dado fornecido para atualização.");
    }

    const sucesso = await VacinaModel.update(vacinaId, dadosUpdate);
    if (!sucesso) {
      throw new Error("Falha ao atualizar o registro de vacina.");
    }

    return await VacinaModel.findById(vacinaId);
  }

  /**
   * Deleta um registro de vacina.
   */
  static async deleteVacina(usuarioId, vacinaId) {
    await this.getVacinaById(usuarioId, vacinaId); // Garante a posse

    const sucesso = await VacinaModel.delete(vacinaId);
    if (!sucesso) {
      throw new Error("Falha ao deletar o registro de vacina.");
    }
    return true;
  }
}

module.exports = VacinaService;