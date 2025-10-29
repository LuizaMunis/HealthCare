// backend/src/models/consultaModel.js
const { pool } = require('../config/database');

class ConsultaModel {
  static async create(consultaData) {
    const { perfil_id, nome_medico, especialidade, data_hora_consulta, observacoes, local } = consultaData;
    const query = `
      INSERT INTO consulta (perfil_id, nome_medico, especialidade, data_hora_consulta, observacoes, local)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [perfil_id, nome_medico || null, especialidade, data_hora_consulta, observacoes || null, local || null];

    try {
      const [result] = await pool.execute(query, values);
      return { id: result.insertId, ...consultaData };
    } catch (error) {
      console.error('Erro ao criar registro de consulta:', error);
      throw error;
    }
  }

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