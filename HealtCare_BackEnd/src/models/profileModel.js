// HealthCare_Backend/src/models/perfilModel.js

const { pool } = require('../config/database'); 

// Executa queries com uma tentativa de retry em caso de ECONNRESET
async function executeWithRetry(query, params = []) {
  try {
    return await pool.execute(query, params);
  } catch (error) {
    if (error && (error.code === 'ECONNRESET' || error.errno === -4077)) {
      console.warn('⚠️ Conexão MySQL foi resetada. Tentando novamente uma vez...');
      await new Promise((r) => setTimeout(r, 200));
      return await pool.execute(query, params);
    }
    throw error;
  }
}

class PerfilModel {
  static async create(profileData) {
    const { usuario_id, nome_perfil, parentesco, data_nascimento, celular, genero, cpf, peso, altura } = profileData;

    const pesoProcessado = this.processWeight(peso);
    const alturaProcessada = this.processHeight(altura);

    const query = `
      INSERT INTO perfil (usuario_id, nome_perfil, parentesco, data_nascimento, celular, genero, cpf, peso, altura)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      usuario_id, 
      nome_perfil, 
      parentesco || null,
      data_nascimento || null, 
      celular || null, 
      genero || null, 
      cpf || null, 
      pesoProcessado, 
      alturaProcessada
    ];
    
    try {
      if (cpf) {
        const existingCpfProfile = await this.findByCpf(cpf);
        if (existingCpfProfile) {
          console.warn(`Aviso: CPF ${cpf} já existe no sistema.`);
        }
      }

      const [result] = await pool.execute(query, values);
      return { id: result.insertId, ...profileData };
    } catch (error) {
      console.error('❌ Erro ao criar perfil:', error);
      throw error;
    }
  }

  static async update(perfilId, profileData) {
    const { nome_perfil, parentesco, data_nascimento, celular, genero, cpf, peso, altura } = profileData;

    const pesoProcessado = this.processWeight(peso);
    const alturaProcessada = this.processHeight(altura);

    const query = `
      UPDATE perfil 
      SET nome_perfil = ?, parentesco = ?, data_nascimento = ?, celular = ?, genero = ?, cpf = ?, peso = ?, altura = ?
      WHERE id = ?
    `;
    const values = [
      nome_perfil,
      parentesco || null,
      data_nascimento || null,
      celular || null,
      genero || null,
      cpf || null,
      pesoProcessado,
      alturaProcessada,
      perfilId
    ];

    try {
      const [result] = await pool.execute(query, values);
      return result.affectedRows;
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      throw error;
    }
  }

  static async findById(id) {
    const query = 'SELECT * FROM perfil WHERE id = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows[0];
  }

  static async findByUserId(usuario_id) {
    const query = 'SELECT * FROM perfil WHERE usuario_id = ?';
    const [rows] = await executeWithRetry(query, [usuario_id]);
    return rows[0];
  }

  static async findByCpf(cpf) {
    const query = 'SELECT * FROM perfil WHERE cpf = ? LIMIT 1';
    const [rows] = await pool.execute(query, [cpf]);
    return rows[0];
  }

  static async createOrUpdate(usuario_id, data) {
    const { nome_perfil, data_nascimento, celular, genero, cpf, peso, altura } = data;
    
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
          SET nome_perfil = ?, data_nascimento = ?, celular = ?, genero = ?, cpf = ?, peso = ?, altura = ?
          WHERE usuario_id = ?
        `;
        const updateValues = [nome_perfil, data_nascimento || null, celular || null, generoProcessado, cpf || null, pesoProcessado, alturaProcessada, usuario_id];
        
        console.log('Executando UPDATE com valores:', updateValues);
        await executeWithRetry(updateQuery, updateValues);
      } else {
        // INSERT - perfil não existe
        const insertQuery = `
          INSERT INTO perfil (usuario_id, nome, data_nascimento, celular, genero, cpf, peso, altura)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const insertValues = [usuario_id, nome_perfil, data_nascimento || null, celular || null, generoProcessado, cpf || null, pesoProcessado, alturaProcessada];
        
        console.log('Executando INSERT com valores:', insertValues);
        await executeWithRetry(insertQuery, insertValues);
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

  // --- Métodos de Utilitários ---

  static processWeight(peso) {
    if (peso === null || peso === undefined || String(peso).trim() === '') return null;
    const pesoString = String(peso).replace(/[^\d,.]/g, '').replace(',', '.');
    const pesoProcessado = parseFloat(pesoString);
    if (isNaN(pesoProcessado) || pesoProcessado < 40 || pesoProcessado > 200) {
      throw new Error('Peso inválido. Deve estar entre 40 e 200 kg.');
    }
    return pesoProcessado;
  }

  static processHeight(altura) {
    if (altura === null || altura === undefined || String(altura).trim() === '') return null;
    const alturaString = String(altura).replace(/[^\d]/g, '');
    const alturaProcessada = parseInt(alturaString, 10);
    if (isNaN(alturaProcessada) || alturaProcessada < 50 || alturaProcessada > 250) {
      throw new Error('Altura inválida. Deve estar entre 50 e 250 cm.');
    }
    return alturaProcessada;
  }
}

module.exports = PerfilModel;