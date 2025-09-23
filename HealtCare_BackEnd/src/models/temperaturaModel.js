// backend/src/models/temperaturaModel.js
const { pool } = require('../config/database');

class TemperaturaModel {
  /**
   * Cria a tabela 'registro_temperatura' se ela não existir.
   */
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS registro_temperatura (
        id INT NOT NULL AUTO_INCREMENT,
        perfil_id INT NOT NULL,
        graus_celsius FLOAT NOT NULL,
        data_hora_medicao DATETIME NOT NULL,
        PRIMARY KEY (id),
        INDEX fk_registro_temperatura_perfil_idx (perfil_id ASC),
        CONSTRAINT fk_registro_temperatura_perfil
          FOREIGN KEY (perfil_id)
          REFERENCES perfil (id)
          ON DELETE CASCADE
      ) ENGINE = InnoDB;
    `;
    try {
      await pool.execute(query);
      console.log('✅ Tabela registro_temperatura criada/verificada com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao criar tabela registro_temperatura:', error);
      throw error;
    }
  }

  /**
   * Cria um novo registro de temperatura.
   * @param {object} dadosRegistro - Contém perfil_id, graus_celsius, data_hora_medicao.
   * @returns {object} O registro criado com seu ID.
   */
  static async create(dadosRegistro) {
    const { perfil_id, graus_celsius, data_hora_medicao } = dadosRegistro;
    const query = `
      INSERT INTO registro_temperatura (perfil_id, graus_celsius, data_hora_medicao)
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

  /**
   * Encontra todos os registros de um perfil.
   * @param {number} perfilId - ID do perfil.
   * @returns {Array<object>} Uma lista de registros, ordenados do mais recente para o mais antigo.
   */
  static async findByPerfilId(perfilId) {
    const query = 'SELECT * FROM registro_temperatura WHERE perfil_id = ? ORDER BY data_hora_medicao DESC';
    try {
      const [rows] = await pool.execute(query, [perfilId]);
      return rows;
    } catch (error) {
      console.error('Erro ao buscar registros de temperatura por ID de perfil:', error);
      throw error;
    }
  }

  /**
   * Encontra um registro pelo seu ID.
   * @param {number} registroId - ID do registro.
   * @returns {object|undefined} O registro, se encontrado.
   */
  static async findById(registroId) {
    const query = 'SELECT * FROM registro_temperatura WHERE id = ?';
    try {
      const [rows] = await pool.execute(query, [registroId]);
      return rows[0];
    } catch (error) {
      console.error('Erro ao buscar registro de temperatura por ID:', error);
      throw error;
    }
  }

  /**
   * Atualiza um registro.
   * @param {number} registroId - ID do registro a ser atualizado.
   * @param {object} updateData - Dados a serem atualizados.
   * @returns {boolean} True se a atualização foi bem-sucedida.
   */
  static async update(registroId, updateData) {
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), registroId];
    const query = `UPDATE registro_temperatura SET ${fields} WHERE id = ?`;
    try {
      const [result] = await pool.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erro ao atualizar registro de temperatura:', error);
      throw error;
    }
  }

  /**
   * Deleta um registro pelo seu ID.
   * @param {number} registroId - ID do registro a ser deletado.
   * @returns {boolean} True se a deleção foi bem-sucedida.
   */
  static async delete(registroId) {
    const query = 'DELETE FROM registro_temperatura WHERE id = ?';
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