const db = require('../config/database');

class User {
  static async create(userData) {
    const { name, email, password } = userData;
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())',
      [name, email, password]
    );
    return result;
  }

  static async findByEmail(email) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async getAll() {
    const [rows] = await db.execute(
      'SELECT id, name, email, created_at FROM users ORDER BY created_at DESC'
    );
    return rows;
  }
}

module.exports = User;