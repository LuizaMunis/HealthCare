// backend/src/models/registroUsoMedicamentoModel.js
const { pool } = require('../config/database');

class RegistroUsoMedicamentoModel {
  /**
   * Cria a tabela 'registro_uso_medicamento' se ela não existir.
   */
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS registro_uso_medicamento (
        id INT NOT NULL AUTO_INCREMENT,
        medicamento_id INT NOT NULL,
        data_hora_registro DATETIME NOT NULL,
        status_uso ENUM('TOMADO', 'PULADO', 'ATRASADO') NOT NULL,
        PRIMARY KEY (id),
        INDEX fk_registro_uso_medicamento_medicamento_idx (medicamento_id ASC),
        CONSTRAINT fk_registro_uso_medicamento_medicamento
          FOREIGN KEY (medicamento_id)
          REFERENCES medicamento (id)
          ON DELETE CASCADE
      ) ENGINE = InnoDB;
    `;
    try {
      await pool.execute(query);
      console.log('✅ Tabela registro_uso_medicamento criada/verificada com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao criar tabela registro_uso_medicamento:', error);
      throw error;
    }
  }

  /**
   * Cria um novo registro de uso para um medicamento.
   * @param {object} dadosRegistro - Contém medicamento_id, data_hora_registro, status_uso.
   * @returns {object} O registro criado com seu ID.
   */
  static async create(dadosRegistro) {
    const { medicamento_id, data_hora_registro, status_uso } = dadosRegistro;
    const query = `
      INSERT INTO registro_uso_medicamento (medicamento_id, data_hora_registro, status_uso)
      VALUES (?, ?, ?)
    `;
    const values = [medicamento_id, data_hora_registro, status_uso];

    try {
      const [result] = await pool.execute(query, values);
      return { id: result.insertId, ...dadosRegistro };
    } catch (error) {
      console.error('Erro ao criar registro de uso de medicamento:', error);
      throw error;
    }
  }

  /**
   * Encontra todos os registros de uso para um medicamento específico.
   * @param {number} medicamentoId - ID do medicamento.
   * @returns {Array<object>} Uma lista de registros de uso, ordenados do mais recente para o mais antigo.
   */
  static async findByMedicamentoId(medicamentoId) {
    const query = `
      SELECT id, medicamento_id, data_hora_registro, status_uso
      FROM registro_uso_medicamento
      WHERE medicamento_id = ?
      ORDER BY data_hora_registro DESC
    `;
    try {
      const [rows] = await pool.execute(query, [medicamentoId]);
      return rows;
    } catch (error) {
      console.error('Erro ao buscar registros de uso por ID de medicamento:', error);
      throw error;
    }
  }
}

module.exports = RegistroUsoMedicamentoModel;