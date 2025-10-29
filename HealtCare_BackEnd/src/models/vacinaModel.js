// backend/src/models/vacinaModel.js
const { pool } = require('../config/database');

class VacinaModel {
  static async create(dadosVacina) {
    const { perfil_id, nome, dose, data_vacinacao } = dadosVacina;
    const query = `
      INSERT INTO vacina (perfil_id, nome, dose, data_vacinacao)
      VALUES (?, ?, ?, ?)
    `;
    const values = [perfil_id, nome, dose, data_vacinacao];

    try {
      const [result] = await pool.execute(query, values);
      return { id: result.insertId, ...dadosVacina };
    } catch (error) {
      console.error('Erro ao criar registro de vacina:', error);
      throw error;
    }
  }

  static async findByPerfilId(perfilId) {
    const query = 'SELECT * FROM vacina WHERE perfil_id = ? ORDER BY data_vacinacao DESC';
    try {
      const [rows] = await pool.execute(query, [perfilId]);
      return rows;
    } catch (error) {
      console.error('Erro ao buscar vacinas por ID de perfil:', error);
      throw error;
    }
  }

  static async findById(vacinaId) {
    const query = 'SELECT * FROM vacina WHERE id = ?';
    try {
      const [rows] = await pool.execute(query, [vacinaId]);
      return rows[0];
    } catch (error) {
      console.error('Erro ao buscar vacina por ID:', error);
      throw error;
    }
  }

  static async update(vacinaId, updateData) {
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), vacinaId];
    const query = `UPDATE vacina SET ${fields} WHERE id = ?`;

    try {
      const [result] = await pool.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erro ao atualizar vacina:', error);
      throw error;
    }
  }

  static async delete(vacinaId) {
    const query = 'DELETE FROM vacina WHERE id = ?';
    try {
      const [result] = await pool.execute(query, [vacinaId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erro ao deletar vacina:', error);
      throw error;
    }
  }
}

module.exports = VacinaModel;