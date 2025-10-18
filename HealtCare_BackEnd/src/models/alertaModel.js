// HealtCare_BackEnd/src/models/alertaModel.js

const pool = require('../config/database');

/**
 * @class AlertaModel
 * @description Gerencia as operações de banco de dados para a tabela 'alertas'.
 */
class AlertaModel {

  /**
   * Cria um novo alerta no banco de dados.
   * @param {object} alertaData - Os dados do alerta.
   * @param {number} alertaData.perfil_id - ID do perfil associado.
   * @param {string} alertaData.nivel_risco - Nível de risco do alerta ('Baixo', 'Atenção', 'Crítico').
   * @param {string} alertaData.mensagem - A mensagem do alerta.
   * @param {string} alertaData.origem - A origem do alerta ('IA' ou 'Regra Manual').
   * @returns {Promise<object>} O objeto do alerta criado com o ID.
   */
  static async create({ perfil_id, nivel_risco, mensagem, origem }) {
    const query = `
      INSERT INTO alertas (perfil_id, nivel_risco, mensagem, origem)
      VALUES (?, ?, ?, ?)
    `;
    try {
      const [result] = await pool.execute(query, [perfil_id, nivel_risco, mensagem, origem]);
      return { id: result.insertId, perfil_id, nivel_risco, mensagem, origem };
    } catch (error) {
      console.error('❌ Erro ao criar alerta:', error);
      throw error;
    }
  }

  /**
   * Busca todos os alertas de um perfil específico.
   * @param {number} perfil_id - O ID do perfil.
   * @returns {Promise<Array>} Um array de objetos de alerta.
   */
  static async findByPerfilId(perfil_id) {
    const query = `
      SELECT * FROM alertas 
      WHERE perfil_id = ? 
      ORDER BY data_hora_gerado DESC
    `;
    try {
      const [rows] = await pool.execute(query, [perfil_id]);
      return rows;
    } catch (error) {
      console.error('❌ Erro ao buscar alertas por perfil ID:', error);
      throw error;
    }
  }

  /**
   * Busca todos os alertas NÃO VISUALIZADOS de um perfil específico.
   * @param {number} perfil_id - O ID do perfil.
   * @returns {Promise<Array>} Um array de objetos de alerta não visualizados.
   */
  static async findNaoVisualizadosByPerfilId(perfil_id) {
    const query = `
      SELECT * FROM alertas 
      WHERE perfil_id = ? AND visualizado = 0
      ORDER BY data_hora_gerado DESC
    `;
    try {
      const [rows] = await pool.execute(query, [perfil_id]);
      return rows;
    } catch (error) {
      console.error('❌ Erro ao buscar alertas não visualizados por perfil ID:', error);
      throw error;
    }
  }

  /**
   * Marca um alerta específico como visualizado.
   * @param {number} id - O ID do alerta.
   * @returns {Promise<number>} O número de linhas afetadas (deve ser 1 em caso de sucesso).
   */
  static async marcarComoVisualizado(id) {
    const query = `
      UPDATE alertas
      SET visualizado = 1
      WHERE id = ?
    `;
    try {
      const [result] = await pool.execute(query, [id]);
      return result.affectedRows;
    } catch (error) {
      console.error('❌ Erro ao marcar alerta como visualizado:', error);
      throw error;
    }
  }
  
  /**
   * Marca TODOS os alertas de um perfil como visualizados.
   * @param {number} perfil_id - O ID do perfil.
   * @returns {Promise<number>} O número de linhas afetadas.
   */
  static async marcarTodosComoVisualizados(perfil_id) {
    const query = `
      UPDATE alertas
      SET visualizado = 1
      WHERE perfil_id = ? AND visualizado = 0
    `;
    try {
      const [result] = await pool.execute(query, [perfil_id]);
      return result.affectedRows;
    } catch (error) {
      console.error('❌ Erro ao marcar todos os alertas do perfil como visualizados:', error);
      throw error;
    }
  }

  /**
   * Deleta um alerta específico pelo seu ID.
   * @param {number} id - O ID do alerta a ser deletado.
   * @returns {Promise<number>} O número de linhas afetadas (deve ser 1 em caso de sucesso).
   */
  static async delete(id) {
    const query = `
      DELETE FROM alertas
      WHERE id = ?
    `;
    try {
      const [result] = await pool.execute(query, [id]);
      return result.affectedRows;
    } catch (error)
    {
      console.error('❌ Erro ao deletar alerta:', error);
      throw error;
    }
  }
}

module.exports = AlertaModel;