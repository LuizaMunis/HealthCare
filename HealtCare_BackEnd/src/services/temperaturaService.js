// backend/src/services/temperaturaService.js

const TemperaturaModel = require('../models/temperaturaModel');
const PerfilModel = require('../models/perfilModel');

class TemperaturaService {
  static async _getPerfilId(usuarioId) {
    const perfil = await PerfilModel.findByUsuarioId(usuarioId);
    if (!perfil) {
      throw new Error('Perfil de usuário não encontrado.');
    }
    return perfil.id;
  }

  /**
   * Cria um novo registro de temperatura.
   */
  static async createRegistro(usuarioId, dadosRegistro) {
    const { graus_celsius, data_hora_medicao } = dadosRegistro;
    if (graus_celsius === undefined || !data_hora_medicao) {
      throw new Error('O valor da temperatura (graus_celsius) e a data/hora da medição são obrigatórios.');
    }
    if (typeof graus_celsius !== 'number') {
        throw new Error('O valor da temperatura deve ser um número.');
    }

    const perfilId = await this._getPerfilId(usuarioId);
    const dadosParaCriar = { ...dadosRegistro, perfil_id: perfilId };

    return await TemperaturaModel.create(dadosParaCriar);
  }

  /**
   * Retorna todos os registros de um usuário.
   */
  static async getAllRegistrosByUsuario(usuarioId) {
    const perfilId = await this._getPerfilId(usuarioId);
    return await TemperaturaModel.findByPerfilId(perfilId);
  }

  /**
   * Busca um registro por ID, garantindo que pertence ao usuário.
   */
  static async getRegistroById(usuarioId, registroId) {
    const perfilId = await this._getPerfilId(usuarioId);
    const registro = await TemperaturaModel.findById(registroId);

    if (!registro) {
      throw new Error('Registro de temperatura não encontrado.');
    }
    if (registro.perfil_id !== perfilId) {
      throw new Error('Acesso negado. Este registro não pertence ao seu perfil.');
    }
    return registro;
  }

  /**
   * Atualiza um registro.
   */
  static async updateRegistro(usuarioId, registroId, dadosUpdate) {
    await this.getRegistroById(usuarioId, registroId); // Garante a posse

    delete dadosUpdate.id;
    delete dadosUpdate.perfil_id;

    if (Object.keys(dadosUpdate).length === 0) {
      throw new Error("Nenhum dado fornecido para atualização.");
    }

    const sucesso = await TemperaturaModel.update(registroId, dadosUpdate);
    if (!sucesso) throw new Error("Falha ao atualizar o registro.");
    
    return await TemperaturaModel.findById(registroId);
  }

  /**
   * Deleta um registro.
   */
  static async deleteRegistro(usuarioId, registroId) {
    await this.getRegistroById(usuarioId, registroId); // Garante a posse

    const sucesso = await TemperaturaModel.delete(registroId);
    if (!sucesso) throw new Error("Falha ao deletar o registro.");
    
    return true;
  }
}

module.exports = TemperaturaService;