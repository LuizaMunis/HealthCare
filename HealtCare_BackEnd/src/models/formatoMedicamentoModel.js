// backend/src/models/formatoMedicamentoModel.js
const { pool } = require('../config/database');

class FormatoMedicamentoModel {
  static async create(dadosFormato) {
    const { medicamento_id, nome_formato, unidade_padrao_dosagem } = dadosFormato;
    const query = `
      INSERT INTO formatoMedicamento (medicamento_id, nome_formato, unidade_padrao_dosagem)
      VALUES (?, ?, ?)
    `;
    const values = [medicamento_id, nome_formato, unidade_padrao_dosagem];

    try {
      const [result] = await pool.execute(query, values);
      return { id: result.insertId, ...dadosFormato };
    } catch (error) {
      console.error('Erro ao criar formato de medicamento:', error);
      throw error;
    }
  }

  static async findByMedicamentoId(medicamentoId) {
    const query = `
      SELECT id, medicamento_id, nome_formato, unidade_padrao_dosagem
      FROM formatoMedicamento
      WHERE medicamento_id = ?
    `;
    try {
      const [rows] = await pool.execute(query, [medicamentoId]);
      return rows[0] || null;
    } catch (error) {
      console.error('Erro ao buscar formato por ID de medicamento:', error);
      throw error;
    }
  }

  static async update(medicamentoId, updateData) {
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), medicamentoId];
    const query = `UPDATE formatoMedicamento SET ${fields} WHERE medicamento_id = ?`;
    try {
      const [result] = await pool.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erro ao atualizar formato de medicamento:', error);
      throw error;
    }
  }

  static async delete(medicamentoId) {
    const query = 'DELETE FROM formatoMedicamento WHERE medicamento_id = ?';
    try {
      const [result] = await pool.execute(query, [medicamentoId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erro ao deletar formato de medicamento:', error);
      throw error;
    }
  }
}

module.exports = FormatoMedicamentoModel;



