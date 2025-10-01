// backend/src/models/medicamentoModel.js
const { pool } = require('../config/database');

class MedicamentoModel {
  /**
   * Cria a tabela 'medicamento' no banco de dados se ela ainda não existir.
   */
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS medicamento (
        id INT NOT NULL AUTO_INCREMENT,
        perfil_id INT NOT NULL,
        nome_medicamento VARCHAR(100) NOT NULL,
        dosagem VARCHAR(45) NULL,
        frequencia_horas INT NOT NULL,
        duracao_dias_tratamento INT NULL,
        data_inicio_tratamento DATE NOT NULL,
        lembretes_ativos TINYINT(1) NOT NULL DEFAULT 1,
        uso_continuo TINYINT(1) NOT NULL DEFAULT 0,
        formato VARCHAR(45) NULL COMMENT 'Ex: Comprimido, Cápsula, Gotas',
        unidade_dosagem VARCHAR(45) NULL COMMENT 'Ex: mg, ml, g',
        PRIMARY KEY (id),
        INDEX fk_medicamento_perfil_idx (perfil_id ASC),
        CONSTRAINT fk_medicamento_perfil
          FOREIGN KEY (perfil_id)
          REFERENCES perfil (id)
          ON DELETE CASCADE
      ) ENGINE = InnoDB;
    `;
    try {
      await pool.execute(query);
      console.log('✅ Tabela medicamento criada/verificada com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao criar tabela medicamento:', error);
      throw error;
    }
  }

  /**
   * Cria um novo registro de medicamento.
   * @param {object} dadosMedicamento - Dados do medicamento.
   * @returns {object} O medicamento criado com seu ID.
   */
  static async create(dadosMedicamento) {
    const {
      perfil_id, nome_medicamento, dosagem, frequencia_horas,
      duracao_dias_tratamento, data_inicio_tratamento, lembretes_ativos,
      uso_continuo, formato, unidade_dosagem
    } = dadosMedicamento;

    const query = `
      INSERT INTO medicamento (
        perfil_id, nome_medicamento, dosagem, frequencia_horas,
        duracao_dias_tratamento, data_inicio_tratamento, lembretes_ativos,
        uso_continuo, formato, unidade_dosagem
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      perfil_id, nome_medicamento, dosagem, frequencia_horas,
      duracao_dias_tratamento, data_inicio_tratamento, lembretes_ativos,
      uso_continuo, formato, unidade_dosagem
    ];

    try {
      const [result] = await pool.execute(query, values);
      return { id: result.insertId, ...dadosMedicamento };
    } catch (error) {
      console.error('Erro ao criar medicamento:', error);
      throw error;
    }
  }

  /**
   * Encontra todos os medicamentos de um perfil.
   * @param {number} perfilId - ID do perfil.
   * @returns {Array<object>} Uma lista de medicamentos.
   */
  static async findByPerfilId(perfilId) {
    const query = 'SELECT * FROM medicamento WHERE perfil_id = ? ORDER BY nome_medicamento ASC';
    try {
      const [rows] = await pool.execute(query, [perfilId]);
      return rows;
    } catch (error) {
      console.error('Erro ao buscar medicamentos por ID de perfil:', error);
      throw error;
    }
  }

  /**
   * Encontra um medicamento pelo seu ID.
   * @param {number} medicamentoId - ID do medicamento.
   * @returns {object|undefined} O medicamento, se encontrado.
   */
  static async findById(medicamentoId) {
    const query = 'SELECT * FROM medicamento WHERE id = ?';
    try {
      const [rows] = await pool.execute(query, [medicamentoId]);
      return rows[0];
    } catch (error) {
      console.error('Erro ao buscar medicamento por ID:', error);
      throw error;
    }
  }

  /**
   * Atualiza um medicamento.
   * @param {number} medicamentoId - ID do medicamento a ser atualizado.
   * @param {object} updateData - Dados a serem atualizados.
   * @returns {boolean} True se a atualização foi bem-sucedida.
   */
  static async update(medicamentoId, updateData) {
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), medicamentoId];
    const query = `UPDATE medicamento SET ${fields} WHERE id = ?`;

    try {
      const [result] = await pool.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erro ao atualizar medicamento:', error);
      throw error;
    }
  }

  /**
   * Deleta um medicamento pelo seu ID.
   * @param {number} medicamentoId - ID do medicamento a ser deletado.
   * @returns {boolean} True se a deleção foi bem-sucedida.
   */
  static async delete(medicamentoId) {
    const query = 'DELETE FROM medicamento WHERE id = ?';
    try {
      const [result] = await pool.execute(query, [medicamentoId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erro ao deletar medicamento:', error);
      throw error;
    }
  }
}

module.exports = MedicamentoModel;