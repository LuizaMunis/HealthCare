// backend/src/models/userModel.js
const { pool } = require('../config/database');

class UserModel {
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS usuario (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        nome_completo VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        senha_hash VARCHAR(255) NOT NULL,
        data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        token_recuperacao_senha VARCHAR(255) NULL
      ) ENGINE = InnoDB;
    `;

    try {
      await pool.execute(createTableQuery);
      console.log('✅ Tabela "usuario" verificada/criada com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao criar a tabela "usuario":', error);
      throw error;
    }
  }

  /**
   * Cria um novo usuário no banco de dados.
   * @param {object} userData - Dados do usuário { nome_completo, email, senha_hash }.
   * @returns {object} O usuário criado com id, nome e email.
   */
  static async create(userData) {
    const { nome_completo, email, senha_hash } = userData;
    const query = 'INSERT INTO usuario (nome_completo, email, senha_hash) VALUES (?, ?, ?)';

    try {
      const [result] = await pool.execute(query, [nome_completo, email, senha_hash]);
      return { id: result.insertId, nome_completo, email };
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  /**
   * Encontra um usuário pelo seu endereço de email.
   * @param {string} email - Email do usuário.
   * @returns {object|undefined} O usuário encontrado ou undefined.
   */
  static async findByEmail(email) {
    const query = 'SELECT * FROM usuario WHERE email = ?';

    try {
      const [rows] = await pool.execute(query, [email]);
      return rows[0];
    } catch (error) {
      console.error('Erro ao buscar usuário por email:', error);
      throw error;
    }
  }

  /**
   * Encontra um usuário pelo seu ID.
   * @param {number} id - ID do usuário.
   * @returns {object|undefined} O usuário encontrado (sem a senha).
   */
  static async findById(id) {
    const query = 'SELECT id, nome_completo, email, data_cadastro FROM usuario WHERE id = ?';

    try {
      const [rows] = await pool.execute(query, [id]);
      return rows[0];
    } catch (error) {
      console.error('Erro ao buscar usuário por ID:', error);
      throw error;
    }
  }

  /**
   * Obtém todos os usuários registrados.
   * @returns {Array<object>} Uma lista de todos os usuários.
   */
  static async getAll() {
    const query = 'SELECT id, nome_completo, email, data_cadastro FROM usuario ORDER BY data_cadastro DESC';

    try {
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      console.error('Erro ao obter todos os usuários:', error);
      throw error;
    }
  }
}

module.exports = UserModel;