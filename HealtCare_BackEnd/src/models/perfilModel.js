// HealthCare_Backend/src/models/perfilModel.js

const { pool } = require('../config/database');

class PerfilModel {
  static async createTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS perfil (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL UNIQUE,
        data_nascimento DATE NULL,
        celular VARCHAR(20) NULL,
        genero ENUM('M', 'F', 'O') NULL,
        cpf VARCHAR(14) NULL UNIQUE,
        peso DECIMAL(5, 2) NULL,
        altura INT NULL,
        CONSTRAINT fk_perfil_usuario
          FOREIGN KEY (usuario_id)
          REFERENCES usuario (id) -- --- MESCLADO: Garante consistência com a tabela 'usuario'
          ON DELETE CASCADE
      ) ENGINE = InnoDB;
    `;
    await pool.execute(query);
  }

  static async findByUserId(usuario_id) {
    const query = 'SELECT * FROM perfil WHERE usuario_id = ?';
    const [rows] = await pool.execute(query, [usuario_id]);
    return rows[0];
  }

  static async createOrUpdate(usuario_id, data) {
    const { data_nascimento, celular, genero, cpf, peso, altura } = data;
    const query = `
      INSERT INTO perfil (usuario_id, data_nascimento, celular, genero, cpf, peso, altura)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        data_nascimento = VALUES(data_nascimento), celular = VALUES(celular), genero = VALUES(genero),
        cpf = VALUES(cpf), peso = VALUES(peso), altura = VALUES(altura)`;
    
    const values = [
      usuario_id, data_nascimento || null, celular || null,
      genero ? genero.toUpperCase() : null, cpf || null,
      peso ? parseFloat(peso) : null, altura ? parseInt(altura) : null
    ];

    try {
      await pool.execute(query, values);
      return this.findByUserId(usuario_id);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY' && error.message.includes('cpf')) {
        throw new Error('Este CPF já está em uso por outro usuário.');
      }
      throw error;
    }
  }
}

module.exports = PerfilModel;
