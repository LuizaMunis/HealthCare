// backend/src/models/doencaModel.js
const { pool } = require('../config/database');

class DoencaModel {
  static async create(dadosDoenca) {
    const { perfil_id, nome_doenca, tipo_doenca, data_diagnostico, data_inicio_sintomas, data_cura, observacoes } = dadosDoenca;
    const query = `
      INSERT INTO doenca (perfil_id, nome_doenca, tipo_doenca, data_diagnostico, data_inicio_sintomas, data_cura, observacoes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [perfil_id, nome_doenca, tipo_doenca, data_diagnostico || null, data_inicio_sintomas || null, data_cura || null, observacoes || null];

    try {
      const [result] = await pool.execute(query, values);
      return { id: result.insertId, ...dadosDoenca };
    } catch (error) {
      console.error('Erro ao criar registro de doença:', error);
      throw error;
    }
  }

  static async findByPerfilId(perfilId) {
    const query = 'SELECT * FROM doenca WHERE perfil_id = ? ORDER BY data_diagnostico DESC, data_inicio_sintomas DESC';
    try {
      const [rows] = await pool.execute(query, [perfilId]);
      return rows;
    } catch (error) {
      console.error('Erro ao buscar doenças por ID de perfil:', error);
      throw error;
    }
  }

  static async findById(doencaId) {
    const query = 'SELECT * FROM doenca WHERE id = ?';
    try {
      const [rows] = await pool.execute(query, [doencaId]);
      return rows[0];
    } catch (error) {
      console.error('Erro ao buscar doença por ID:', error);
      throw error;
    }
  }

  static async update(doencaId, updateData) {
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), doencaId];
    const query = `UPDATE doenca SET ${fields} WHERE id = ?`;
    try {
      const [result] = await pool.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erro ao atualizar doença:', error);
      throw error;
    }
  }

  static async delete(doencaId) {
    const query = 'DELETE FROM doenca WHERE id = ?';
    try {
      const [result] = await pool.execute(query, [doencaId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erro ao deletar doença:', error);
      throw error;
    }
  }
}

module.exports = DoencaModel;