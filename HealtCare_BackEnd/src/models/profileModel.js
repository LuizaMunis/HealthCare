// HealthCare_Backend/src/models/perfilModel.js

const pool = require('../config/database'); 

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
    } catch (error)      {
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
    const [rows] = await pool.execute(query, [usuario_id]);
    return rows; 
  }

  static async findByCpf(cpf) {
    const query = 'SELECT * FROM perfil WHERE cpf = ? LIMIT 1';
    const [rows] = await pool.execute(query, [cpf]);
    return rows[0];
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