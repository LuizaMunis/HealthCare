// HealtCare_BackEnd/src/models/registroPressaoArterialModel.js
const { pool } = require('../config/database');

class RegistroPressaoArterialModel {

  static async create(registroData) {
    const { perfil_id, sistolica_mmhg, diastolica_mmhg, data_hora_medicao } = registroData;
    const query = `
      INSERT INTO registrosPressaoArterial (perfil_id, sistolica_mmhg, diastolica_mmhg, data_hora_medicao)
      VALUES (?, ?, ?, ?)
    `;
    const values = [perfil_id, sistolica_mmhg, diastolica_mmhg, data_hora_medicao];

    try {
      const [result] = await pool.execute(query, values);
      return { id: result.insertId, ...registroData };
    } catch (error) {
      console.error('Erro ao criar registro de pressão arterial:', error);
      throw error;
    }
  }

  static async findByPerfilId(perfilId) {
    const query = `
      SELECT id, perfil_id, sistolica_mmhg, diastolica_mmhg, data_hora_medicao
      FROM registrosPressaoArterial
      WHERE perfil_id = ?
      ORDER BY data_hora_medicao DESC
    `;
    try {
      const [rows] = await pool.execute(query, [perfilId]);
      return rows;
    } catch (error) {
      console.error('Erro ao buscar registros de pressão arterial por ID de perfil:', error);
      throw error;
    }
  }

  static async findById(registroId) {
    const query = `
      SELECT id, perfil_id, sistolica_mmhg, diastolica_mmhg, data_hora_medicao
      FROM registrosPressaoArterial
      WHERE id = ?
    `;
    try {
      const [rows] = await pool.execute(query, [registroId]);
      return rows[0];
    } catch (error) {
      console.error('Erro ao buscar registro de pressão arterial por ID:', error);
      throw error;
    }
  }

  static async update(registroId, updateData) {
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), registroId];

    const query = `
      UPDATE registrosPressaoArterial
      SET ${fields}
      WHERE id = ?
    `;

    try {
      const [result] = await pool.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erro ao atualizar registro de pressão arterial:', error);
      throw error;
    }
  }

  static async delete(registroId) {
    const query = 'DELETE FROM registrosPressaoArterial WHERE id = ?';
    try {
      const [result] = await pool.execute(query, [registroId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erro ao deletar registro de pressão arterial:', error);
      throw error;
    }
  }
}

module.exports = RegistroPressaoArterialModel;