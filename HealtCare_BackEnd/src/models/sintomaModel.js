// backend/src/models/sintomaModel.js
const { pool } = require('../config/database');

class SintomaModel {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS sintoma (
        id INT NOT NULL AUTO_INCREMENT,
        doenca_id INT NOT NULL,
        descricao_sintoma VARCHAR(255) NOT NULL,
        intensidade ENUM('LEVE', 'MODERADA', 'INTENSA') NOT NULL,
        data_hora_inicio DATETIME NOT NULL,
        PRIMARY KEY (id),
        INDEX fk_sintoma_doenca_idx (doenca_id ASC),
        CONSTRAINT fk_sintoma_doenca
          FOREIGN KEY (doenca_id)
          REFERENCES doenca (id)
          ON DELETE CASCADE
      ) ENGINE = InnoDB;
    `;
    try {
      await pool.execute(query);
      console.log('✅ Tabela sintoma criada/verificada com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao criar tabela sintoma:', error);
      throw error;
    }
  }

  static async create(dadosSintoma) {
    const { doenca_id, descricao_sintoma, intensidade, data_hora_inicio } = dadosSintoma;
    const query = `
      INSERT INTO sintoma (doenca_id, descricao_sintoma, intensidade, data_hora_inicio)
      VALUES (?, ?, ?, ?)
    `;
    const values = [doenca_id, descricao_sintoma, intensidade.toUpperCase(), data_hora_inicio];
    try {
      const [result] = await pool.execute(query, values);
      return { id: result.insertId, ...dadosSintoma };
    } catch (error) {
      console.error('Erro ao criar sintoma:', error);
      throw error;
    }
  }

  static async findByDoencaId(doencaId) {
    const query = 'SELECT * FROM sintoma WHERE doenca_id = ? ORDER BY data_hora_inicio DESC';
    try {
      const [rows] = await pool.execute(query, [doencaId]);
      return rows;
    } catch (error) {
      console.error('Erro ao buscar sintomas por ID de doença:', error);
      throw error;
    }
  }
}

module.exports = SintomaModel;