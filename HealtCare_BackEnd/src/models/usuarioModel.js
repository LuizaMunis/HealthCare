// backend/src/models/usuarioModel.js
const { pool } = require('../config/database');

class UsuarioModel {
  /**
   * Cria um novo usuário no banco de dados.
   * @param {object} dadosUsuario - Contém nome_completo, email, e senha_hash.
   * @returns {object} - Objeto com id, nome_completo e email do usuário criado.
   */
  static async create(dadosUsuario) {
    const { nome_completo, email, senha_hash } = dadosUsuario;
    // A data de cadastro será gerenciada pelo banco de dados ou pode ser definida aqui
    const query = `
      INSERT INTO usuario (nome_completo, email, senha_hash, data_cadastro) 
      VALUES (?, ?, ?, NOW())
    `;
    
    try {
      const [result] = await pool.execute(query, [nome_completo, email, senha_hash]);
      // Retorna os dados do usuário sem a senha
      return { id: result.insertId, nome_completo, email };
    } catch (error) {
      // Lança o erro para ser tratado pelo controller
      throw error;
    }
  }

  /**
   * Busca um usuário pelo email.
   * @param {string} email - O email do usuário a ser encontrado.
   * @returns {object|null} - O usuário encontrado ou null.
   */
  static async findByEmail(email) {
    const query = 'SELECT * FROM usuario WHERE email = ?';
    
    try {
      const [rows] = await pool.execute(query, [email]);
      // Retorna o primeiro usuário encontrado (ou undefined se não houver)
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  /**
   * Busca um usuário pelo ID.
   * @param {number} id - O ID do usuário.
   * @returns {object|null} - O usuário encontrado sem a senha.
   */
  static async findById(id) {
    const query = 'SELECT id, nome_completo, email, data_cadastro FROM usuario WHERE id = ?';
    
    try {
      const [rows] = await pool.execute(query, [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UsuarioModel;
