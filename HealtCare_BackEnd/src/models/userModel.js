// backend/src/models/userModel.js
const { pool } = require('../config/database');

class UserModel {
  /**
   * Cria a tabela de usuários no banco de dados, se não existir.
   * Atualizado para suportar novos requisitos do schema.
   */
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS usuario (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        nome_completo VARCHAR(255) NOT NULL, /* Atualizado para 255 */
        email VARCHAR(255) UNIQUE NOT NULL,
        senha_hash VARCHAR(255) NOT NULL,   /* Atualizado para 255 */
        data_cadastro DATE NOT NULL,
        token_recuperacao_senha VARCHAR(255) NULL
      ) ENGINE = InnoDB;
    `;

    try {
      await pool.execute(createTableQuery);
      console.log('✅ Tabela usuario criada/verificada com sucesso (schema atualizado)!');
    } catch (error) {
      console.error('❌ Erro ao criar tabela usuario (schema atualizado):', error);
      throw error;
    }
  }

  /**
   * Cria um novo usuário no banco de dados.
   * @param {object} userData - Dados do usuário a serem criados.
   * @param {string} userData.nome_completo - Nome completo do usuário.
   * @param {string} userData.email - Email do usuário (deve ser único).
   * @param {string} userData.senha_hash - Senha criptografada (hash).
   * @param {string} userData.data_cadastro - Data de cadastro no formato 'YYYY-MM-DD'.
   * @returns {object} O usuário criado com seu ID, nome e email.
   */
  static async create(userData) {
    const { nome_completo, email, senha_hash, data_cadastro } = userData;
    const query = 'INSERT INTO usuario (nome_completo, email, senha_hash, data_cadastro) VALUES (?, ?, ?, ?)';

    try {
      const [result] = await pool.execute(query, [nome_completo, email, senha_hash, data_cadastro]);
      return { id: result.insertId, nome_completo, email };
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  /**
   * Encontra um usuário pelo seu endereço de email.
   * @param {string} email - Email do usuário a ser buscado.
   * @returns {object|undefined} O objeto do usuário se encontrado, ou undefined.
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
   * @param {number} id - ID do usuário a ser buscado.
   * @returns {object|undefined} O objeto do usuário (com campos selecionados) se encontrado, ou undefined.
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
   * Obtém todos os usuários registrados no sistema.
   * @returns {Array<object>} Uma lista de objetos de usuários (com campos selecionados), ordenados pela data de cadastro.
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