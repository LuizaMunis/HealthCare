const { pool } = require('../config/database');

class UserModel {
 
  static async create({ nome_completo, email, senha_hash }) {
    const query = `
      INSERT INTO usuario (nome_completo, email, senha_hash, data_cadastro)
      VALUES (?, ?, ?, NOW())
    `;
    try {
      const [result] = await pool.execute(query, [nome_completo, email, senha_hash]);
      return { id: result.insertId, nome_completo, email };
    } catch (error) {
      console.error('❌ Erro ao criar usuário:', error);
      throw error;
    }
  }

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

  static async update(id, { nome_completo, email }) {
    const query = `
      UPDATE usuario
      SET nome_completo = ?, email = ?
      WHERE id = ?
    `;
    try {
      const [result] = await pool.execute(query, [nome_completo, email, id]);
      return result.affectedRows;
    } catch (error) {
      console.error('❌ Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  
  static async updatePassword(id, newPasswordHash) {
    const query = `
      UPDATE usuario
      SET senha_hash = ?
      WHERE id = ?
    `;
    try {
      const [result] = await pool.execute(query, [newPasswordHash, id]);
      return result.affectedRows;
    } catch (error) {
      console.error('❌ Erro ao atualizar senha do usuário:', error);
      throw error;
    }
  }


  static async setRecoveryToken(id, tokenOrNull) {
    const query = `
      UPDATE usuario
      SET token_recuperacao_senha = ?
      WHERE id = ?
    `;
    try {
      const [result] = await pool.execute(query, [tokenOrNull, id]);
      return result.affectedRows;
    } catch (error) {
      console.error('❌ Erro ao atualizar token de recuperação:', error);
      throw error;
    }
  }
}

module.exports = UserModel;