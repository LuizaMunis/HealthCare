// backend/src/models/glicemiaModel.js
const { pool } = require('../config/database');

class GlicemiaModel {
  static async create(dados) {
    const { perfil_id, valor_mg_dl, data_hora_medicao } = dados;
    const query = `
      INSERT INTO registrosGlicemia (perfil_id, valor_mg_dl, data_hora_medicao)
      VALUES (?, ?, ?)
    `;
    const values = [perfil_id, valor_mg_dl, data_hora_medicao];
    const [result] = await pool.execute(query, values);
    return { id: result.insertId, ...dados };
  }

  static async findByPerfilId(perfilId) {
    const [rows] = await pool.execute(
      'SELECT * FROM registrosGlicemia WHERE perfil_id = ? ORDER BY data_hora_medicao DESC',
      [perfilId]
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute('SELECT * FROM registrosGlicemia WHERE id = ?', [id]);
    return rows[0];
  }

  static async update(id, updateData) {
    const fields = Object.keys(updateData).map((k) => `${k} = ?`).join(', ');
    const values = [...Object.values(updateData), id];
    const [result] = await pool.execute(`UPDATE registrosGlicemia SET ${fields} WHERE id = ?`, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM registrosGlicemia WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = GlicemiaModel;


