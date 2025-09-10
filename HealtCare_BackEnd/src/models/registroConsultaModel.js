// backend/src/models/consultaModel.js
const { pool } = require('../config/database');

class ConsultaModel {
  /**
   * Cria a tabela 'consulta' no banco de dados se ela ainda não existir.
   * Esta tabela armazena informações sobre as consultas médicas do usuário.
   */
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS consulta (
        id INT NOT NULL AUTO_INCREMENT,
        perfil_id INT NOT NULL,
        nome_medico VARCHAR(255) NULL,
        especialidade VARCHAR(100) NOT NULL,
        data_hora_consulta DATETIME NOT NULL,
        observacoes TEXT NULL,
        local VARCHAR(255) NULL,
        PRIMARY KEY (id),
        INDEX fk_consulta_perfil_idx (perfil_id ASC),
        CONSTRAINT fk_consulta_perfil
          FOREIGN KEY (perfil_id)
          REFERENCES perfil (id)
          ON DELETE CASCADE
          ON UPDATE NO ACTION
      ) ENGINE = InnoDB;
    `;
    try {
      await pool.execute(createTableQuery);
      console.log('✅ Tabela consulta criada/verificada com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao criar tabela consulta:', error);
      throw error;
    }
  }

  /**
   * Cria um novo registro de consulta para um perfil.
   * @param {object} consultaData - Dados da consulta.
   * @param {number} consultaData.perfil_id - ID do perfil ao qual a consulta pertence.
   * @param {string} [consultaData.nome_medico] - Nome do médico.
   * @param {string} consultaData.especialidade - Especialidade médica.
   * @param {string} consultaData.data_hora_consulta - Data e hora da consulta.
   * @param {string} [consultaData.observacoes] - Observações sobre a consulta.
   * @param {string} [consultaData.local] - Local da consulta.
   * @returns {object} O registro da consulta criada com seu ID.
   */
  static async create(consultaData) {
    const { perfil_id, nome_medico, especialidade, data_hora_consulta, observacoes, local } = consultaData;
    const query = `
      INSERT INTO consulta (perfil_id, nome_medico, especialidade, data_hora_consulta, observacoes, local)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [perfil_id, nome_medico, especialidade, data_hora_consulta, observacoes, local];

    try {
      const [result] = await pool.execute(query, values);
      return { id: result.insertId, ...consultaData };
    } catch (error) {
      console.error('Erro ao criar registro de consulta:', error);
      throw error;
    }
  }

  /**
   * Encontra todas as consultas de um perfil específico.
   * @param {number} perfilId - ID do perfil.
   * @returns {Array<object>} Uma lista de consultas, ordenadas pela mais recente.
   */
  static async findByPerfilId(perfilId) {
    const query = `
      SELECT id, perfil_id, nome_medico, especialidade, data_hora_consulta, observacoes, local
      FROM consulta
      WHERE perfil_id = ?
      ORDER BY data_hora_consulta DESC
    `;
    try {
      const [rows] = await pool.execute(query, [perfilId]);
      return rows;
    } catch (error) {
      console.error('Erro ao buscar consultas por ID de perfil:', error);
      throw error;
    }
  }

  /**
   * Encontra uma consulta específica por seu ID.
   * @param {number} consultaId - ID da consulta.
   * @returns {object|undefined} O objeto da consulta se encontrado, ou undefined.
   */
  static async findById(consultaId) {
    const query = `
      SELECT id, perfil_id, nome_medico, especialidade, data_hora_consulta, observacoes, local
      FROM consulta
      WHERE id = ?
    `;
    try {
      const [rows] = await pool.execute(query, [consultaId]);
      return rows[0];
    } catch (error) {
      console.error('Erro ao buscar consulta por ID:', error);
      throw error;
    }
  }

  /**
   * Atualiza os dados de uma consulta existente.
   * @param {number} consultaId - ID da consulta a ser atualizada.
   * @param {object} updateData - Objeto contendo os campos e novos valores.
   * @returns {boolean} True se a consulta foi atualizada, false caso contrário.
   */
  static async update(consultaId, updateData) {
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), consultaId];

    const query = `
      UPDATE consulta
      SET ${fields}
      WHERE id = ?
    `;

    try {
      const [result] = await pool.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erro ao atualizar consulta:', error);
      throw error;
    }
  }

  /**
   * Deleta uma consulta pelo seu ID.
   * @param {number} consultaId - ID da consulta a ser deletada.
   * @returns {boolean} True se a consulta foi deletada, false caso contrário.
   */
  static async delete(consultaId) {
    const query = 'DELETE FROM consulta WHERE id = ?';
    try {
      const [result] = await pool.execute(query, [consultaId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erro ao deletar consulta:', error);
      throw error;
    }
  }
}

module.exports = ConsultaModel;