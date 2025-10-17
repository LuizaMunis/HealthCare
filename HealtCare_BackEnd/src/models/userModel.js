const { pool } = require('../config/database');

class UserModel {
  /**
   * Cria/verifica a tabela 'usuario' com schema atualizado.
   * - Campos longos (VARCHAR(255))
   * - data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   * - token_recuperacao_senha opcional
   */
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS usuario (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        nome_completo VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        senha_hash VARCHAR(255) NOT NULL,
        data_cadastro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        token_recuperacao_senha VARCHAR(255) NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    try {
      await pool.execute(createTableQuery);
      console.log('✅ Tabela "usuario" criada/verificada com sucesso.');
    } catch (error) {
      console.error('❌ Erro ao criar/verificar a tabela "usuario":', error);
      throw error;
    }
  }

  /**
   * Cria um novo usuário.
   * Aceita { nome_completo, email, senha_hash }.
   * data_cadastro é automático pelo banco.
   */
  static async create({ nome_completo, email, senha_hash }) {
    const query = `
      INSERT INTO usuario (nome_completo, email, senha_hash)
      VALUES (?, ?, ?)
    `;
    try {
      const [result] = await pool.execute(query, [nome_completo, email, senha_hash]);
      return { id: result.insertId, nome_completo, email };
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error);
      throw error;
    }
  }

  /**
   * Busca por e-mail.
   * includePassword opcional para retornar senha_hash quando necessário (ex.: login).
   */
  static async findByEmail(email, includePassword = false) {
    const fields = includePassword
      ? 'id, nome_completo, email, senha_hash, data_cadastro, token_recuperacao_senha'
      : 'id, nome_completo, email, data_cadastro, token_recuperacao_senha';
    const query = `SELECT ${fields} FROM usuario WHERE email = ? LIMIT 1`;
    try {
      const [rows] = await pool.execute(query, [email]);
      return rows[0];
    } catch (error) {
      console.error('❌ Erro ao buscar usuário por email:', error);
      throw error;
    }
  }

  /**
   * Busca por ID.
   * includePassword opcional.
   */
  static async findById(id, includePassword = false) {
    const fields = includePassword
      ? 'id, nome_completo, email, senha_hash, data_cadastro, token_recuperacao_senha'
      : 'id, nome_completo, email, data_cadastro, token_recuperacao_senha';
    const query = `SELECT ${fields} FROM usuario WHERE id = ? LIMIT 1`;
    try {
      const [rows] = await pool.execute(query, [id]);
      return rows[0];
    } catch (error) {
      console.error('❌ Erro ao buscar usuário por ID:', error);
      throw error;
    }
  }

  /**
   * Lista todos os usuários (ordenado por data de cadastro desc).
   */
  static async getAll() {
    const query = `
      SELECT id, nome_completo, email, data_cadastro
      FROM usuario
      ORDER BY data_cadastro DESC
    `;
    try {
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      console.error('❌ Erro ao obter todos os usuários:', error);
      throw error;
    }
  }

  /**
   * Atualiza nome e email.
   */
  static async update(id, { nome_completo, email }) {
    const query = `
      UPDATE usuario
      SET nome_completo = ?, email = ?
      WHERE id = ?
    `;
    try {
      await pool.execute(query, [nome_completo, email, id]);
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  /**
   * Atualiza a senha (hash).
   */
  static async updatePassword(id, newPasswordHash) {
    const query = `
      UPDATE usuario
      SET senha_hash = ?
      WHERE id = ?
    `;
    try {
      await pool.execute(query, [newPasswordHash, id]);
    } catch (error) {
      console.error('❌ Erro ao atualizar senha do usuário:', error);
      throw error;
    }
  }

  /**
   * Define/limpa token de recuperação de senha.
   */
  static async setRecoveryToken(id, tokenOrNull) {
    const query = `
      UPDATE usuario
      SET token_recuperacao_senha = ?
      WHERE id = ?
    `;
    try {
      await pool.execute(query, [tokenOrNull, id]);
    } catch (error) {
      console.error('❌ Erro ao atualizar token de recuperação:', error);
      throw error;
    }
  }
}

module.exports = UserModel;