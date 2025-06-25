// HealthCare_Backend/src/models/userModel.js

const { pool } = require('../config/database');

class UserModel {
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS usuario (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        nome_completo VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha_hash VARCHAR(255) NOT NULL,
        data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE = InnoDB;
    `;
    try {
      await pool.execute(createTableQuery);
    } catch (error) {
      console.error('❌ Erro ao criar a tabela "usuario":', error);
      throw error;
    }
  }

  static async create(userData) {
    const { nome_completo, email, senha_hash } = userData;
    const query = 'INSERT INTO usuario (nome_completo, email, senha_hash) VALUES (?, ?, ?)';
    const [result] = await pool.execute(query, [nome_completo, email, senha_hash]);
    return { id: result.insertId, nome_completo, email };
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM usuario WHERE email = ?';
    const [rows] = await pool.execute(query, [email]);
    return rows[0];
  }

  static async findById(id, includePassword = false) {
    const fields = 'id, nome_completo, email, data_cadastro' + (includePassword ? ', senha_hash' : '');
    const query = `SELECT ${fields} FROM usuario WHERE id = ?`;
    const [rows] = await pool.execute(query, [id]);
    return rows[0];
  }

  static async getAll() {
    const query = 'SELECT id, nome_completo, email FROM usuario ORDER BY nome_completo ASC';
    const [rows] = await pool.execute(query);
    return rows;
  }

  static async update(id, data) {
    const query = 'UPDATE usuario SET nome_completo = ?, email = ? WHERE id = ?';
    await pool.execute(query, [data.nome_completo, data.email, id]);
  }

  static async updatePassword(id, newPasswordHash) {
    const query = 'UPDATE usuario SET senha_hash = ? WHERE id = ?';
    await pool.execute(query, [newPasswordHash, id]);
  }
}

module.exports = UserModel;
