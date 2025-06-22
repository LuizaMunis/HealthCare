// backend/src/models/perfilModel.js
const { pool } = require('../config/database');

class PerfilModel {
  /**
   * Cria a tabela 'perfil' no banco de dados se ela ainda não existir.
   * Define as colunas e chaves estrangeiras conforme o esquema fornecido.
   */
  static async createTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS perfil (
        id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        data_nascimento DATE NULL,
        celular VARCHAR(20) NULL,
        genero VARCHAR(1) NULL,
        cpf VARCHAR(14) NULL UNIQUE,
        peso FLOAT NULL,
        altura INT NULL,
        CONSTRAINT perfil_usuario_id
          FOREIGN KEY (usuario_id)
          REFERENCES usuario (id)
          ON DELETE CASCADE  /* Alterado para CASCADE para remover perfil se o usuário for deletado */
          ON UPDATE CASCADE  /* Alterado para CASCADE para atualizar usuario_id se mudar */
      )
    `;
    try {
      await pool.execute(createTableQuery);
      console.log('✅ Tabela perfil criada/verificada com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao criar tabela perfil:', error);
      throw error; // Propagar o erro para tratamento superior
    }
  }

  /**
   * Cria um novo perfil para um usuário.
   * @param {object} perfilData - Dados do perfil a serem criados.
   * @param {number} perfilData.usuario_id - ID do usuário ao qual o perfil pertence.
   * @param {string} [perfilData.data_nascimento] - Data de nascimento no formato 'YYYY-MM-DD'.
   * @param {string} [perfilData.celular] - Número de celular.
   * @param {string} [perfilData.genero] - Gênero (ex: 'M', 'F', 'O').
   * @param {string} [perfilData.cpf] - CPF do usuário (deve ser único).
   * @param {number} [perfilData.peso] - Peso em kg.
   * @param {number} [perfilData.altura] - Altura em cm.
   * @returns {object} O perfil criado com seu ID.
   */
  static async create(perfilData) {
    const { usuario_id, data_nascimento, celular, genero, cpf, peso, altura } = perfilData;
    const query = `
      INSERT INTO perfil (usuario_id, data_nascimento, celular, genero, cpf, peso, altura)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [usuario_id, data_nascimento, celular, genero, cpf, peso, altura];

    try {
      const [result] = await pool.execute(query, values);
      return { id: result.insertId, ...perfilData };
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
      throw error;
    }
  }

  /**
   * Encontra um perfil pelo ID do usuário.
   * @param {number} usuarioId - ID do usuário.
   * @returns {object|undefined} O objeto do perfil se encontrado, ou undefined.
   */
  static async findByUsuarioId(usuarioId) {
    const query = `
      SELECT id, usuario_id, data_nascimento, celular, genero, cpf, peso, altura
      FROM perfil
      WHERE usuario_id = ?
    `;
    try {
      const [rows] = await pool.execute(query, [usuarioId]);
      return rows[0]; // Retorna o primeiro perfil encontrado ou undefined
    } catch (error) {
      console.error('Erro ao buscar perfil por ID de usuário:', error);
      throw error;
    }
  }

  /**
   * Encontra um perfil pelo CPF.
   * @param {string} cpf - CPF do perfil.
   * @returns {object|undefined} O objeto do perfil se encontrado, ou undefined.
   */
  static async findByCpf(cpf) {
    const query = `
      SELECT id, usuario_id, data_nascimento, celular, genero, cpf, peso, altura
      FROM perfil
      WHERE cpf = ?
    `;
    try {
      const [rows] = await pool.execute(query, [cpf]);
      return rows[0]; // Retorna o primeiro perfil encontrado ou undefined
    } catch (error) {
      console.error('Erro ao buscar perfil por CPF:', error);
      throw error;
    }
  }

  /**
   * Atualiza os dados de um perfil existente.
   * @param {number} usuarioId - ID do usuário proprietário do perfil a ser atualizado.
   * @param {object} updateData - Objeto contendo os campos e novos valores a serem atualizados.
   * @returns {boolean} True se o perfil foi atualizado, false caso contrário.
   */
  static async update(usuarioId, updateData) {
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    values.push(usuarioId); // Adiciona o usuario_id no final para a cláusula WHERE

    const query = `
      UPDATE perfil
      SET ${fields}
      WHERE usuario_id = ?
    `;

    try {
      const [result] = await pool.execute(query, values);
      return result.affectedRows > 0; // Retorna true se alguma linha foi afetada (atualizada)
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  }

  /**
   * Deleta um perfil pelo ID do usuário.
   * @param {number} usuarioId - ID do usuário cujo perfil será deletado.
   * @returns {boolean} True se o perfil foi deletado, false caso contrário.
   */
  static async delete(usuarioId) {
    const query = 'DELETE FROM perfil WHERE usuario_id = ?';
    try {
      const [result] = await pool.execute(query, [usuarioId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erro ao deletar perfil:', error);
      throw error;
    }
  }
}

module.exports = PerfilModel;
