// backend/src/services/consultaService.js

const ConsultaModel = require('../models/registroConsultaModel');
const PerfilModel = require('../models/perfilModel'); // Precisamos para ligar o usuário ao perfil

class ConsultaService {

  /**
   * Helper interno para obter o perfil_id de um usuario_id.
   * Centraliza a lógica e as verificações.
   * @param {number} usuarioId - ID do usuário.
   * @returns {Promise<number>} O ID do perfil.
   * @throws {Error} Se o perfil não for encontrado.
   */
  static async _getPerfilId(usuarioId) {
    // Supondo que exista um método findByUsuarioId no PerfilModel
    const perfil = await PerfilModel.findByUsuarioId(usuarioId); 
    if (!perfil) {
      throw new Error('Perfil de usuário não encontrado. Complete seu perfil para continuar.');
    }
    return perfil.id;
  }

  /**
   * Cria uma nova consulta após validar os dados e encontrar o perfil do usuário.
   * @param {number} usuarioId - ID do usuário que está criando a consulta.
   * @param {object} dadosConsulta - Dados da consulta vindos do controller.
   * @returns {Promise<object>} A consulta recém-criada.
   */
  static async createConsulta(usuarioId, dadosConsulta) {
    const { especialidade, data_hora_consulta } = dadosConsulta;

    // 1. Lógica de Validação
    if (!especialidade || !data_hora_consulta) {
      throw new Error('Os campos "especialidade" e "data e hora da consulta" são obrigatórios.');
    }

    // 2. Orquestração: Buscar o perfil_id
    const perfilId = await this._getPerfilId(usuarioId);

    const dadosParaCriar = {
      ...dadosConsulta,
      perfil_id: perfilId,
    };

    // 3. Chamar o Model
    const novaConsulta = await ConsultaModel.create(dadosParaCriar);
    return novaConsulta;
  }

  /**
   * Retorna todas as consultas de um usuário.
   * @param {number} usuarioId - ID do usuário.
   * @returns {Promise<Array<object>>} Lista de consultas.
   */
  static async getAllConsultasByUsuario(usuarioId) {
    const perfilId = await this._getPerfilId(usuarioId);
    const consultas = await ConsultaModel.findByPerfilId(perfilId);
    return consultas;
  }

  /**
   * Busca uma consulta por ID e verifica se ela pertence ao usuário.
   * @param {number} usuarioId - ID do usuário solicitante.
   * @param {number} consultaId - ID da consulta a ser buscada.
   * @returns {Promise<object>} O objeto da consulta.
   * @throws {Error} Se a consulta não for encontrada ou não pertencer ao usuário.
   */
  static async getConsultaById(usuarioId, consultaId) {
    const perfilId = await this._getPerfilId(usuarioId);
    const consulta = await ConsultaModel.findById(consultaId);

    // 1. Lógica de Negócio/Permissão
    if (!consulta) {
      throw new Error('Consulta não encontrada.');
    }
    if (consulta.perfil_id !== perfilId) {
      throw new Error('Acesso negado. Esta consulta não pertence ao seu perfil.');
    }

    return consulta;
  }

  /**
   * Atualiza uma consulta após verificar a permissão do usuário.
   * @param {number} usuarioId - ID do usuário.
   * @param {number} consultaId - ID da consulta a ser atualizada.
   * @param {object} dadosUpdate - Dados para atualização.
   * @returns {Promise<object>} A consulta atualizada.
   */
  static async updateConsulta(usuarioId, consultaId, dadosUpdate) {
    // 1. Reutiliza a lógica de getConsultaById para verificar a existência e a posse.
    // Se não encontrar ou o usuário não for o dono, um erro será lançado.
    await this.getConsultaById(usuarioId, consultaId);

    // 2. Remove campos que não devem ser atualizados diretamente
    delete dadosUpdate.id;
    delete dadosUpdate.perfil_id;
    
    if (Object.keys(dadosUpdate).length === 0) {
        throw new Error("Nenhum dado fornecido para atualização.");
    }

    // 3. Chama o Model para efetuar a atualização
    const sucesso = await ConsultaModel.update(consultaId, dadosUpdate);
    if (!sucesso) {
        throw new Error("Falha ao atualizar a consulta no banco de dados.");
    }

    // Retorna os dados atualizados para o controller
    return await ConsultaModel.findById(consultaId);
  }

  /**
   * Deleta uma consulta após verificar a permissão.
   * @param {number} usuarioId - ID do usuário.
   * @param {number} consultaId - ID da consulta a ser deletada.
   * @returns {Promise<boolean>} True se a deleção foi bem-sucedida.
   */
  static async deleteConsulta(usuarioId, consultaId) {
    // 1. Garante que o usuário é dono do registro antes de deletar
    await this.getConsultaById(usuarioId, consultaId);

    // 2. Chama o Model para deletar
    const sucesso = await ConsultaModel.delete(consultaId);
    if (!sucesso) {
        throw new Error("Falha ao deletar a consulta.");
    }
    return true;
  }
}

module.exports = ConsultaService;