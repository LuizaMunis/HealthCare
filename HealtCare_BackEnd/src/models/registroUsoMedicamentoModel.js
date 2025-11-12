// backend/src/models/registroUsoMedicamentoModel.js
const { pool } = require('../config/database');

class RegistroUsoMedicamentoModel {
  static async create(dadosRegistro) {
    const { medicamento_id, data_hora_registro, status_uso } = dadosRegistro;
    const query = `
      INSERT INTO registroUsoMedicamento (medicamento_id, data_hora_registro, status_uso)
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

  static async findByMedicamentoId(medicamentoId) {
    const query = `
      SELECT id, medicamento_id, data_hora_registro, status_uso
      FROM registroUsoMedicamento
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