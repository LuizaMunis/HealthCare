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
    if (peso !== null && peso !== undefined && peso !== '') {
      const pesoString = String(peso).trim();
      if (pesoString) {
        // Remove caracteres não numéricos exceto vírgula e ponto
        const cleanPeso = pesoString.replace(/[^\d,.]/g, '');
        // Converte vírgula para ponto para parseFloat
        const pesoComPonto = cleanPeso.replace(',', '.');
        pesoProcessado = parseFloat(pesoComPonto);
        
        // Validação: peso deve estar entre 2 e 500 kg
        if (isNaN(pesoProcessado) || pesoProcessado < 2 || pesoProcessado > 500) {
          throw new Error('Peso deve estar entre 2 e 500 kg');
        }
      }
    }
    
    let alturaProcessada = null;
    if (altura !== null && altura !== undefined && altura !== '') {
      const alturaString = String(altura).trim();
      if (alturaString) {
        // Remove caracteres não numéricos
        const cleanAltura = alturaString.replace(/[^\d]/g, '');
        alturaProcessada = parseInt(cleanAltura);
        
        // Validação: altura deve estar entre 50 e 250 cm
        if (isNaN(alturaProcessada) || alturaProcessada < 50 || alturaProcessada > 250) {
          throw new Error('Altura deve estar entre 50 e 250 cm');
        }
      }
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

  static async delete(id) {
    const query = 'DELETE FROM perfil WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = PerfilModel;
