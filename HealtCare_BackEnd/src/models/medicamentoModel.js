// backend/src/models/medicamentoModel.js
const { pool } = require('../config/database');

class MedicamentoModel {
  static async create(dadosMedicamento) {
    const {
      perfil_id, nome_medicamento, dosagem, frequencia_horas,
      duracao_dias_tratamento, data_inicio_tratamento, lembretes_ativos,
      uso_continuo
    } = dadosMedicamento;

    const query = `
      INSERT INTO medicamento (
        perfil_id, nome_medicamento, dosagem, frequencia_horas,
        duracao_dias_tratamento, data_inicio_tratamento, lembretes_ativos,
        uso_continuo
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    // Converter booleanos para TINYINT (0 ou 1)
    const lembretesAtivosValue = lembretes_ativos !== undefined ? (lembretes_ativos ? 1 : 0) : 1;
    const usoContinuoValue = uso_continuo !== undefined ? (uso_continuo ? 1 : 0) : 0;

    const values = [
      perfil_id, nome_medicamento, dosagem || null, frequencia_horas,
      duracao_dias_tratamento || null, data_inicio_tratamento,
      lembretesAtivosValue,
      usoContinuoValue
    ];

    console.log('🔍 [DEBUG Model] Dados do medicamento a serem inseridos:', {
      perfil_id,
      tipoPerfilId: typeof perfil_id,
      nome_medicamento,
      dosagem: dosagem || null,
      frequencia_horas,
      duracao_dias_tratamento: duracao_dias_tratamento || null,
      data_inicio_tratamento,
      lembretes_ativos: lembretesAtivosValue,
      uso_continuo: usoContinuoValue
    });

    console.log('🔍 [DEBUG Model] Query SQL:', query);
    console.log('🔍 [DEBUG Model] Valores para inserção:', values);

    try {
      console.log('📤 [DEBUG Model] Executando INSERT no banco de dados...');
      const [result] = await pool.execute(query, values);
      console.log('✅ [DEBUG Model] INSERT executado com sucesso:', {
        insertId: result.insertId,
        affectedRows: result.affectedRows
      });
      const resultado = { id: result.insertId, ...dadosMedicamento };
      console.log('✅ [DEBUG Model] Retornando resultado:', JSON.stringify(resultado, null, 2));
      return resultado;
    } catch (error) {
      console.error('❌ [DEBUG Model] Erro completo ao criar medicamento no banco:', {
        message: error.message,
        code: error.code,
        errno: error.errno,
        sqlState: error.sqlState,
        sql: error.sql,
        sqlMessage: error.sqlMessage,
        stack: error.stack
      });
      throw error;
    }
  }

  static async findByPerfilId(perfilId) {
    const query = 'SELECT * FROM medicamento WHERE perfil_id = ? ORDER BY nome_medicamento ASC';
    try {
      const [rows] = await pool.execute(query, [perfilId]);
      return rows;
    } catch (error) {
      console.error('Erro ao buscar medicamentos por ID de perfil:', error);
      throw error;
    }
  }

  static async findById(medicamentoId) {
    const query = 'SELECT * FROM medicamento WHERE id = ?';
    try {
      const [rows] = await pool.execute(query, [medicamentoId]);
      return rows[0];
    } catch (error) {
      console.error('Erro ao buscar medicamento por ID:', error);
      throw error;
    }
  }

  static async update(medicamentoId, updateData) {
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), medicamentoId];
    const query = `UPDATE medicamento SET ${fields} WHERE id = ?`;

    try {
      const [result] = await pool.execute(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erro ao atualizar medicamento:', error);
      throw error;
    }
  }

  static async delete(medicamentoId) {
    const query = 'DELETE FROM medicamento WHERE id = ?';
    try {
      const [result] = await pool.execute(query, [medicamentoId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Erro ao deletar medicamento:', error);
      throw error;
    }
  }
}

module.exports = MedicamentoModel;