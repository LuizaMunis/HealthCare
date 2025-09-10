// backend/src/services/doencaService.js
const DoencaModel = require('../models/doencaModel');
const SintomaModel = require('../models/sintomaModel');
const PerfilModel = require('../models/perfilModel');

class DoencaService {
  static async _getPerfilId(usuarioId) {
    const perfil = await PerfilModel.findByUsuarioId(usuarioId);
    if (!perfil) {
      throw new Error('Perfil de usuário não encontrado.');
    }
    return perfil.id;
  }

  // --- MÉTODOS PARA DOENÇA ---
  static async createDoenca(usuarioId, dadosDoenca) {
    const { nome_doenca, tipo_doenca } = dadosDoenca;
    if (!nome_doenca || !tipo_doenca) {
      throw new Error('Nome e tipo da doença são obrigatórios.');
    }
    const perfilId = await this._getPerfilId(usuarioId);
    const dadosParaCriar = { ...dadosDoenca, perfil_id: perfilId };
    return await DoencaModel.create(dadosParaCriar);
  }

  static async getAllDoencasByUsuario(usuarioId) {
    const perfilId = await this._getPerfilId(usuarioId);
    return await DoencaModel.findByPerfilId(perfilId);
  }

  static async getDoencaById(usuarioId, doencaId) {
    const perfilId = await this._getPerfilId(usuarioId);
    const doenca = await DoencaModel.findById(doencaId);
    if (!doenca) {
      throw new Error('Doença não encontrada.');
    }
    if (doenca.perfil_id !== perfilId) {
      throw new Error('Acesso negado.');
    }
    return doenca;
  }

  static async updateDoenca(usuarioId, doencaId, dadosUpdate) {
    await this.getDoencaById(usuarioId, doencaId); // Garante a posse
    await DoencaModel.update(doencaId, dadosUpdate);
    return await DoencaModel.findById(doencaId);
  }

  static async deleteDoenca(usuarioId, doencaId) {
    await this.getDoencaById(usuarioId, doencaId); // Garante a posse
    return await DoencaModel.delete(doencaId);
  }

  // --- MÉTODOS PARA SINTOMA ---
  static async addSintoma(usuarioId, doencaId, dadosSintoma) {
    await this.getDoencaById(usuarioId, doencaId); // Garante que o usuário é dono da doença
    const { descricao_sintoma, intensidade, data_hora_inicio } = dadosSintoma;
    if (!descricao_sintoma || !intensidade || !data_hora_inicio) {
      throw new Error('Descrição, intensidade e data/hora de início do sintoma são obrigatórios.');
    }
    const dadosParaCriar = { ...dadosSintoma, doenca_id: doencaId };
    return await SintomaModel.create(dadosParaCriar);
  }

  static async getSintomasByDoenca(usuarioId, doencaId) {
    await this.getDoencaById(usuarioId, doencaId); // Garante que o usuário pode ver os sintomas
    return await SintomaModel.findByDoencaId(doencaId);
  }
}

module.exports = DoencaService;