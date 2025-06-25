// backend/src/models/registroPressaoArterialModel.js
const { pool } = require('../config/database');

class RegistroPressaoArterialModel {
  /**
   * Cria a tabela 'registrosPressaoArterial' no banco de dados se ela ainda não existir.
   * Define as colunas e a chave estrangeira para 'perfil'.
   */
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS registrosPressaoArterial (
        id INT AUTO_INCREMENT PRIMARY KEY, /* AUTO_INCREMENT é o mais comum para IDs */
        perfil_id INT NOT NULL,
        sistolica_mmhg INT NULL,
        diastolica_mmhg INT NULL,
        data_hora_medicao DATETIME NOT NULL,
        CONSTRAINT fk_registrosPressaoArterial_perfil
          FOREIGN KEY (perfil_id)
          REFERENCES perfil (id)
          ON DELETE CASCADE  /* Alterado para CASCADE: se o perfil for deletado, os registros também */
          ON UPDATE CASCADE  /* Alterado para CASCADE: se o ID do perfil mudar, o registro é atualizado */
      ) ENGINE = InnoDB;
    `;
    try {
      await pool.execute(createTableQuery);
      console.log('✅ Tabela registrosPressaoArterial criada/verificada com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao criar tabela registrosPressaoArterial:', error);
      throw error;
    }
  }

  /**
   * Cria um novo registro de pressão arterial.
   * @param {object} registroData - Dados do registro de pressão.
   * @param {number} registroData.perfil_id - ID do perfil ao qual o registro pertence.
   * @param {number} [registroData.sistolica_mmhg] - Valor da pressão sistólica.
   * @param {number} [registroData.diastolica_mmhg] - Valor da pressão diastólica.
   * @param {string} registroData.data_hora_medicao - Data e hora da medição (formato DATETIME).
   * @returns {object} O registro criado com seu ID.
   */
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

  /**
   * Encontra todos os registros de pressão arterial para um perfil específico.
   * @param {number} perfilId - ID do perfil.
   * @returns {Array<object>} Uma lista de registros de pressão arterial.
   */
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

  /**
   * Encontra um registro de pressão arterial específico por seu ID.
   * @param {number} registroId - ID do registro.
   * @returns {object|undefined} O objeto do registro se encontrado, ou undefined.
   */
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

  /**
   * Atualiza os dados de um registro de pressão arterial existente.
   * @param {number} registroId - ID do registro a ser atualizado.
   * @param {object} updateData - Objeto contendo os campos e novos valores a serem atualizados.
   * @returns {boolean} True se o registro foi atualizado, false caso contrário.
   */
  static async update(registroId, updateData) {
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    values.push(registroId); // Adiciona o registroId no final para a cláusula WHERE

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

  /**
   * Deleta um registro de pressão arterial pelo seu ID.
   * @param {number} registroId - ID do registro a ser deletado.
   * @returns {boolean} True se o registro foi deletado, false caso contrário.
   */
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
