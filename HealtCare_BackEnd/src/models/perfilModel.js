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
        genero VARCHAR(20) NULL,
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

  static async findByCpf(cpf, excludeUserId = null) {
    let query = 'SELECT * FROM perfil WHERE cpf = ?';
    let params = [cpf];
    
    if (excludeUserId) {
      query += ' AND usuario_id != ?';
      params.push(excludeUserId);
    }
    
    const [rows] = await pool.execute(query, params);
    return rows[0];
  }

  static async createOrUpdate(usuario_id, data) {
    const { data_nascimento, celular, genero, cpf, peso, altura } = data;
    
    // Tratar peso e altura corretamente
    let pesoProcessado = null;
    if (peso !== null && peso !== undefined) {
      pesoProcessado = typeof peso === 'string' ? parseFloat(peso.replace(',', '.')) : parseFloat(peso);
    }
    
    let alturaProcessada = null;
    if (altura !== null && altura !== undefined) {
      alturaProcessada = typeof altura === 'string' ? parseInt(altura.replace(/\D/g, '')) : parseInt(altura);
    }
    
    // Tratar gênero - usar nome completo
    let generoProcessado = null;
    if (genero !== null && genero !== undefined && genero !== '') {
      generoProcessado = genero; // Usar o valor exato enviado pelo frontend
      console.log('Gênero processado no modelo:', generoProcessado);
    } else {
      console.log('Gênero não fornecido ou vazio');
    }

    try {
      // Verificar se CPF já existe para outro usuário
      if (cpf) {
        const existingCpfProfile = await this.findByCpf(cpf, usuario_id);
        if (existingCpfProfile) {
          throw new Error('Este CPF já está em uso por outro usuário.');
        }
      }

      // Primeiro, verificar se já existe um perfil para este usuário
      const existingProfile = await this.findByUserId(usuario_id);
      
      if (existingProfile) {
        // UPDATE - perfil já existe
        const updateQuery = `
          UPDATE perfil 
          SET data_nascimento = ?, celular = ?, genero = ?, cpf = ?, peso = ?, altura = ?
          WHERE usuario_id = ?
        `;
        const updateValues = [data_nascimento || null, celular || null, generoProcessado, cpf || null, pesoProcessado, alturaProcessada, usuario_id];
        
        console.log('Executando UPDATE com valores:', updateValues);
        await pool.execute(updateQuery, updateValues);
      } else {
        // INSERT - perfil não existe
        const insertQuery = `
          INSERT INTO perfil (usuario_id, data_nascimento, celular, genero, cpf, peso, altura)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const insertValues = [usuario_id, data_nascimento || null, celular || null, generoProcessado, cpf || null, pesoProcessado, alturaProcessada];
        
        console.log('Executando INSERT com valores:', insertValues);
        await pool.execute(insertQuery, insertValues);
      }
      
      return this.findByUserId(usuario_id);
    } catch (error) {
      console.error('Erro no createOrUpdate:', error);
      throw error;
    }
  }
}

module.exports = PerfilModel;
