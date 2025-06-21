// backend/src/models/userModel.js
const { pool } = require('../config/database');

class UserModel {
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    
    try {
      await pool.execute(createTableQuery);
      console.log('✅ Tabela users criada/verificada com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao criar tabela users:', error);
    }
  }

  static async create(userData) {
    const { name, email, password } = userData;
    const query = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    
    try {
      const [result] = await pool.execute(query, [name, email, password]);
      return { id: result.insertId, name, email };
    } catch (error) {
      throw error;
    }
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    
    try {
      const [rows] = await pool.execute(query, [email]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    const query = 'SELECT id, name, email, created_at FROM users WHERE id = ?';
    
    try {
      const [rows] = await pool.execute(query, [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getAll() {
    const query = 'SELECT id, name, email, created_at FROM users ORDER BY created_at DESC';
    
    try {
      const [rows] = await pool.execute(query);
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UserModel;