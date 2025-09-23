// backend/src/models/vacinaModel.js
const { pool } = require('../config/database');

class VacinaModel {
  /**
   * Cria a tabela 'vacina' no banco de dados se ela ainda não existir.
   */
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS vacina (
        id INT NOT NULL AUTO_INCREMENT,
        perfil_id INT NOT NULL,
        nome_vacina VARCHAR(100) NOT NULL,
        dose VARCHAR(45) NOT NULL,
        data_vacinacao DATE NOT NULL,
        PRIMARY KEY (id),
        INDEX fk_vacina_perfil_idx (perfil_id ASC),
        CONSTRAINT fk_vacina_perfil
          FOREIGN KEY (perfil_id)
          REFERENCES perfil (id)
          ON DELETE CASCADE
      ) ENGINE = InnoDB;
    `;
    try {
      await pool.execute(query);
      console.log('✅ Tabela vacina criada/verificada com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao criar tabela vacina:', error);
      throw error;
    }
  }

  /**
   * Cria um novo registro de vacina.
   * @param {object} dadosVacina - Dados da vacina.
   * @returns {object} O registro da vacina criado com seu ID.
   */
  static async create(dadosVacina) {
    const { perfil_id, nome_vacina, dose, data_vacinacao } = dadosVacina;
    const query = `
      INSERT INTO vacina (perfil_id, nome_vacina, dose, data_vacinacao)
      VALUES (?, ?, ?, ?)
    `;
    const values = [perfil_id, nome_vacina, dose, data_vacinacao];

    try {
      const [result] = await pool.execute(query, values);
      return { id: result.insertId, ...dadosVacina };
    } catch (error) {
      console.error('Erro ao criar registro de vacina:', error);
      throw error;
    }
  }

  /**
   * Encontra todas as vacinas de um perfil.
   * @param {number} perfilId - ID do perfil.
   * @returns {Array<object>} Uma lista de vacinas, ordenadas pela data mais recente.
   */
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

  /**
   * Encontra um registro de vacina pelo seu ID.
   * @param {number} vacinaId - ID do registro de vacina.
   * @returns {object|undefined} O registro, se encontrado.
   */
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

  /**
   * Atualiza um registro de vacina.
   * @param {number} vacinaId - ID do registro a ser atualizado.
   * @param {object} updateData - Dados a serem atualizados.
   * @returns {boolean} True se a atualização foi bem-sucedida.
   */
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

  /**
   * Deleta um registro de vacina pelo seu ID.
   * @param {number} vacinaId - ID do registro a ser deletado.
   * @returns {boolean} True se a deleção foi bem-sucedida.
   */
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