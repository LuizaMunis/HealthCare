// Esté serviço engloba tanto as funções de medicamento e registroUsoMedicamento

const MedicamentoModel = require('../models/medicamentoModel');
const RegistroUsoMedicamentoModel = require('../models/registroUsoMedicamentoModel');
const PerfilModel = require('../models/perfilModel');

class MedicamentoService {
  static async _getPerfilId(usuarioId) {
    const perfil = await PerfilModel.findByUsuarioId(usuarioId);
    if (!perfil) {
      throw new Error('Perfil de usuário não encontrado.');
    }
    return perfil.id;
  }

  // --- MÉTODOS PARA O MEDICAMENTO EM SI (CRUD) ---

  static async createMedicamento(usuarioId, dadosMedicamento) {
    const { nome_medicamento, frequencia_horas, data_inicio_tratamento } = dadosMedicamento;
    if (!nome_medicamento || !frequencia_horas || !data_inicio_tratamento) {
      throw new Error('Nome do medicamento, frequência e data de início são obrigatórios.');
    }
    const perfilId = await this._getPerfilId(usuarioId);
    const dadosParaCriar = { ...dadosMedicamento, perfil_id: perfilId };
    return await MedicamentoModel.create(dadosParaCriar);
  }

  static async getAllMedicamentosByUsuario(usuarioId) {
    const perfilId = await this._getPerfilId(usuarioId);
    return await MedicamentoModel.findByPerfilId(perfilId);
  }

  static async getMedicamentoById(usuarioId, medicamentoId) {
    const perfilId = await this._getPerfilId(usuarioId);
    const medicamento = await MedicamentoModel.findById(medicamentoId);
    if (!medicamento) {
      throw new Error('Medicamento não encontrado.');
    }
    if (medicamento.perfil_id !== perfilId) {
      throw new Error('Acesso negado.');
    }
    return medicamento;
  }
  
  static async updateMedicamento(usuarioId, medicamentoId, dadosUpdate) {
    await this.getMedicamentoById(usuarioId, medicamentoId); // Garante a posse
    await MedicamentoModel.update(medicamentoId, dadosUpdate);
    return await MedicamentoModel.findById(medicamentoId);
  }

  static async deleteMedicamento(usuarioId, medicamentoId) {
    await this.getMedicamentoById(usuarioId, medicamentoId); // Garante a posse
    return await MedicamentoModel.delete(medicamentoId);
  }

  // --- NOVOS MÉTODOS PARA REGISTRO DE USO ---

  /**
   * Registra o uso de um medicamento (tomado, pulado, etc.).
   */
  static async registrarUso(usuarioId, medicamentoId, dadosRegistro) {
    // 1. Garante que o usuário é dono do medicamento antes de registrar o uso.
    await this.getMedicamentoById(usuarioId, medicamentoId);
    
    // 2. Valida os dados do registro
    const { data_hora_registro, status_uso } = dadosRegistro;
    if (!data_hora_registro || !status_uso) {
      throw new Error('Data, hora e status do uso são obrigatórios.');
    }
    if (!['TOMADO', 'PULADO', 'ATRASADO'].includes(status_uso.toUpperCase())) {
        throw new Error('Status de uso inválido.');
    }

    // 3. Cria o registro
    const dadosParaCriar = {
      medicamento_id: medicamentoId,
      data_hora_registro,
      status_uso: status_uso.toUpperCase()
    };
    return await RegistroUsoMedicamentoModel.create(dadosParaCriar);
  }

  /**
   * Retorna o histórico de uso de um medicamento.
   */
  static async getHistoricoDeUso(usuarioId, medicamentoId) {
    // 1. Garante que o usuário é dono do medicamento para ver seu histórico.
    await this.getMedicamentoById(usuarioId, medicamentoId);

    // 2. Busca o histórico
    return await RegistroUsoMedicamentoModel.findByMedicamentoId(medicamentoId);
  }
}

module.exports = MedicamentoService;