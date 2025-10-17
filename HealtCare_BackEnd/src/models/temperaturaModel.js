// backend/src/models/temperaturaModel.js
const pool = require('../config/db');

class TemperaturaModel {
  static async create(dadosRegistro) {
    const { perfil_id, graus_celsius, data_hora_medicao } = dadosRegistro;
    const query = `
      INSERT INTO RegistroTemperatura (perfil_id, graus_celsius, data_hora_medicao)
      VALUES (?, ?, ?)
    `;
    const values = [perfil_id, graus_celsius, data_hora_medicao];

    try {
      const [result] = await pool.execute(query, values);
      return { id: result.insertId, ...dadosRegistro };
    } catch (error) {
      console.error('Erro ao criar registro de temperatura:', error);
      throw error;
    }
  }

  static async findByPerfilId(perfilId) {
    const query = 'SELECT * FROM RegistroTemperatura WHERE perfil_id = ? ORDER BY data_hora_medicao DESC';
    try {
      const [rows] = await pool.execute(query, [perfilId]);
      return rows;
    } catch (error) {
      console.error('Erro ao buscar registros de temperatura por ID de perfil:', error);
      throw error;
    }
  }

  static async findById(registroId) {
    const query = 'SELECT * FROM RegistroTemperatura WHERE id = ?';
    try {
      const [rows] = await pool.execute(query, [registroId]);
      return rows[0];
    } catch (error) {
      console.error('Erro ao buscar registro de temperatura por ID:', error);
      throw error;
    }
  }

  static async update(registroId, updateData) {
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), registroId];
    const query = `UPDATE RegistroTemperatura SET ${fields} WHERE id = ?`;
    try {
      const [result] = await pool.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erro ao atualizar registro de temperatura:', error);
      throw error;
    }
  }

  static async delete(registroId) {
    const query = 'DELETE FROM RegistroTemperatura WHERE id = ?';
    try {
      const [result] = await pool.execute(query, [registroId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erro ao deletar registro de temperatura:', error);
      throw error;
    }
  }
}

module.exports = TemperaturaModel;