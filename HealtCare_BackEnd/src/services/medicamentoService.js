// backend/src/services/medicamentoService.js

const MedicamentoModel = require('../models/medicamentoModel');
const RegistroUsoMedicamentoModel = require('../models/registroUsoMedicamentoModel');
const ProfileModel = require('../models/profileModel');
class MedicamentoService {
  // --- MÉTODOS PARA O MEDICAMENTO (CRUD) ---

  static async createMedicamento(usuarioId, profileId, dadosMedicamento) {
    await this._verifyProfileOwnership(usuarioId, profileId);

    const { nome_medicamento, frequencia_horas, data_inicio_tratamento } = dadosMedicamento;
    if (!nome_medicamento || !frequencia_horas || !data_inicio_tratamento) {
      throw new Error('Nome do medicamento, frequência (em horas) e data de início são obrigatórios.');
    }

    const dadosParaCriar = { ...dadosMedicamento, perfil_id: profileId };
    return await MedicamentoModel.create(dadosParaCriar);
  }

  static async getAllMedicamentosByProfile(usuarioId, profileId) {
    await this._verifyProfileOwnership(usuarioId, profileId);
    return await MedicamentoModel.findByPerfilId(profileId);
  }

  static async getMedicamentoById(usuarioId, profileId, medicamentoId) {
    await this._verifyProfileOwnership(usuarioId, profileId);
    return await this._verifyMedicamentoOwnership(profileId, medicamentoId);
  }
  
  static async updateMedicamento(usuarioId, profileId, medicamentoId, updateData) {
    await this._verifyProfileOwnership(usuarioId, profileId);
    await this._verifyMedicamentoOwnership(profileId, medicamentoId);

    await MedicamentoModel.update(medicamentoId, updateData);
    return await MedicamentoModel.findById(medicamentoId);
  }

  static async deleteMedicamento(usuarioId, profileId, medicamentoId) {
    await this._verifyProfileOwnership(usuarioId, profileId);
    await this._verifyMedicamentoOwnership(profileId, medicamentoId);

    return await MedicamentoModel.delete(medicamentoId);
  }

  // --- MÉTODOS PARA REGISTRO DE USO ---

  static async registrarUso(usuarioId, profileId, medicamentoId, dadosRegistro) {
    await this._verifyProfileOwnership(usuarioId, profileId);
    await this._verifyMedicamentoOwnership(profileId, medicamentoId);
    
    const { data_hora_registro, status_uso } = dadosRegistro;
    if (!data_hora_registro || !status_uso) {
      throw new Error('Data, hora e status do uso são obrigatórios.');
    }

    const validStatus = ['TOMADO', 'PULADO', 'ADIADO'];
    if (!validStatus.includes(status_uso.toUpperCase())) {
      throw new Error(`Status de uso inválido. Use um dos seguintes: ${validStatus.join(', ')}`);
    }

    const dadosParaCriar = {
      medicamento_id: medicamentoId,
      data_hora_registro,
      status_uso: status_uso.charAt(0).toUpperCase() + status_uso.slice(1).toLowerCase() // Capitaliza (Ex: Tomado)
    };
    return await RegistroUsoMedicamentoModel.create(dadosParaCriar);
  }

  static async getHistoricoDeUso(usuarioId, profileId, medicamentoId) {
    await this._verifyProfileOwnership(usuarioId, profileId);
    await this._verifyMedicamentoOwnership(profileId, medicamentoId);

    return await RegistroUsoMedicamentoModel.findByMedicamentoId(medicamentoId);
  }

  // --- MÉTODOS PRIVADOS DE VERIFICAÇÃO ---

  static async _verifyProfileOwnership(usuarioId, profileId) {
    const perfil = await PerfilModel.findById(profileId);
    if (!perfil) {
      throw new Error('Perfil não encontrado.');
    }
    if (perfil.usuario_id !== usuarioId) {
      throw new Error('Acesso não autorizado a este perfil.');
    }
    return perfil;
  }

  static async _verifyMedicamentoOwnership(profileId, medicamentoId) {
    const medicamento = await MedicamentoModel.findById(medicamentoId);
    if (!medicamento) {
      throw new Error('Medicamento não encontrado.');
    }
    if (medicamento.perfil_id !== Number(profileId)) {
      throw new Error('Medicamento não pertence a este perfil.');
    }
    return medicamento;
  }
}

module.exports = MedicamentoService;