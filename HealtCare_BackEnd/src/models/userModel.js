// HealthCare_Backend/src/models/userModel.js

const { pool } = require('../config/database');

class UserModel {
  /**
   * Cria a tabela 'usuario' no banco de dados se ela ainda não existir,
   * combinando as colunas de ambas as branches.
   */
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
      console.log('✅ Tabela "usuario" criada/verificada com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao criar a tabela "usuario":', error);
      throw error;
    }
  }

  /**
   * Cria um novo usuário no banco de dados.
   * A data_cadastro é inserida automaticamente pelo banco de dados.
   * @param {object} userData - Dados do usuário a serem criados.
   * @param {string} userData.nome_completo - Nome completo do usuário.
   * @param {string} userData.email - Email do usuário (deve ser único).
   * @param {string} userData.senha_hash - Senha criptografada (hash).
   * @returns {object} O usuário criado com seu ID, nome e email.
   */
  static async create(userData) {
    const { nome_completo, email, senha_hash } = userData;
    const query = 'INSERT INTO usuario (nome_completo, email, senha_hash) VALUES (?, ?, ?)';
    try {
      const [result] = await pool.execute(query, [nome_completo, email, senha_hash]);
      return { id: result.insertId, nome_completo, email };
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error);
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
      console.error('❌ Erro ao buscar usuário por email:', error);
      throw error;
    }
  }

  /**
   * Encontra um usuário pelo seu ID.
   * @param {number} id - ID do usuário a ser buscado.
   * @param {boolean} [includePassword=false] - Se true, inclui o hash da senha no retorno.
   * @returns {object|undefined} O objeto do usuário se encontrado, ou undefined.
   */
  static async findById(id, includePassword = false) {
    const fields = 'id, nome_completo, email, data_cadastro' + (includePassword ? ', senha_hash' : '');
    const query = `SELECT ${fields} FROM usuario WHERE id = ?`;
    try {
      const [rows] = await pool.execute(query, [id]);
      return rows[0];
    } catch (error) {
      console.error('❌ Erro ao buscar usuário por ID:', error);
      throw error;
    }
  }

  /**
   * Obtém todos os usuários registrados no sistema.
   * @returns {Array<object>} Uma lista de objetos de usuários, ordenados pela data de cadastro.
   */
  static async getAll() {
    const query = 'SELECT id, nome_completo, email, data_cadastro FROM usuario ORDER BY data_cadastro DESC';
    try {
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      console.error('❌ Erro ao obter todos os usuários:', error);
      throw error;
    }
  }

  /**
   * Atualiza os dados de um usuário.
   * @param {number} id - ID do usuário a ser atualizado.
   * @param {object} data - Dados a serem atualizados.
   */
  static async update(id, data) {
    const query = 'UPDATE usuario SET nome_completo = ?, email = ? WHERE id = ?';
    try {
      await pool.execute(query, [data.nome_completo, data.email, id]);
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  /**
   * Atualiza a senha de um usuário.
   * @param {number} id - ID do usuário.
   * @param {string} newPasswordHash - Novo hash da senha.
   */
  static async updatePassword(id, newPasswordHash) {
    const query = 'UPDATE usuario SET senha_hash = ? WHERE id = ?';
    try {
      await pool.execute(query, [newPasswordHash, id]);
    } catch (error) {
      console.error('❌ Erro ao atualizar a senha do usuário:', error);
      throw error;
    }
  }
}

module.exports = UserModel;