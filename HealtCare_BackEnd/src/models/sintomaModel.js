// backend/src/models/sintomaModel.js
const pool = require('../config/db');

class SintomaModel {
  static async create(dadosSintoma) {
    const { doenca_id, descricao_sintoma, intensidade, data_hora_inicio } = dadosSintoma;
    const query = `
      INSERT INTO sintomas (doenca_id, descricao_sintoma, intensidade, data_hora_inicio)
      VALUES (?, ?, ?, ?)
    `;
    const values = [doenca_id, descricao_sintoma, intensidade, data_hora_inicio];
    try {
      const [result] = await pool.execute(query, values);
      return { id: result.insertId, ...dadosSintoma };
    } catch (error) {
      console.error('Erro ao criar sintoma:', error);
      throw error;
    }
  }

  static async findByDoencaId(doencaId) {
    const query = 'SELECT * FROM sintomas WHERE doenca_id = ? ORDER BY data_hora_inicio DESC';
    try {
      const [rows] = await pool.execute(query, [doencaId]);
      return rows;
    } catch (error) {
      console.error('Erro ao buscar sintomas por ID de doença:', error);
      throw error;
    }
  }

  static async findById(sintomaId) {
    const query = 'SELECT * FROM sintomas WHERE id = ?';
    try {
        const [rows] = await pool.execute(query, [sintomaId]);
        return rows[0];
    } catch (error) {
        console.error('Erro ao buscar sintoma por ID:', error);
        throw error;
    }
  }

  static async update(sintomaId, updateData) {
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), sintomaId];
    const query = `UPDATE sintomas SET ${fields} WHERE id = ?`;
    try {
        const [result] = await pool.execute(query, values);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Erro ao atualizar sintoma:', error);
        throw error;
    }
  }

  static async delete(sintomaId) {
    const query = 'DELETE FROM sintomas WHERE id = ?';
    try {
        const [result] = await pool.execute(query, [sintomaId]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Erro ao deletar sintoma:', error);
        throw error;
    }
  }
}

module.exports = SintomaModel;