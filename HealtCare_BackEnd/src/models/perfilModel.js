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
        peso FLOAT NULL,
        altura INT NULL,
        CONSTRAINT fk_perfil_usuario
          FOREIGN KEY (usuario_id)
          REFERENCES users (id) -- << Corrigido para corresponder à sua tabela de utilizadores
          ON DELETE CASCADE
      ) ENGINE = InnoDB;
    `;
    try {
      await pool.execute(query);
      console.log('✅ Tabela perfil criada/verificada com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao criar tabela perfil:', error);
      throw error;
    }
  }

  static async findByUserId(usuario_id) {
    const query = 'SELECT * FROM perfil WHERE usuario_id = ?';
    try {
      const [rows] = await pool.execute(query, [usuario_id]);
      return rows[0];
    } catch (error) {
      console.error('[MODEL ERROR] Erro ao buscar perfil:', error.message);
      throw new Error('Erro no servidor ao buscar perfil.');
    }
  }

  static async createOrUpdate(usuario_id, data) {
    const { data_nascimento, celular, genero, cpf, peso, altura } = data;
    const query = `
      INSERT INTO perfil (usuario_id, data_nascimento, celular, genero, cpf, peso, altura)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        data_nascimento = VALUES(data_nascimento),
        celular = VALUES(celular),
        genero = VALUES(genero),
        cpf = VALUES(cpf),
        peso = VALUES(peso),
        altura = VALUES(altura)
    `;
    
    try {
      // Garante que valores vazios sejam salvos como NULL no banco de dados.
      const values = [
        usuario_id,
        data_nascimento || null,
        celular || null,
        genero ? genero.toUpperCase() : null,
        cpf || null,
        peso ? parseFloat(peso) : null,
        altura ? parseInt(altura) : null
      ];
      await pool.execute(query, values);
      // Retorna os dados que acabaram de ser salvos para consistência
      return await this.findByUserId(usuario_id);
    } catch (error) {
      console.error('[MODEL ERROR] Erro ao criar ou atualizar perfil:', error.message);
      // Personaliza a mensagem de erro para o caso de CPF duplicado
      if (error.code === 'ER_DUP_ENTRY' && error.message.includes('cpf')) {
        throw new Error('Este CPF já está em uso por outro utilizador.');
      }
      throw new Error('Erro no servidor ao salvar perfil.');
    }
  }
}

module.exports = PerfilModel;
