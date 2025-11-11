// backend/src/services/medicamentoService.js

const MedicamentoModel = require('../models/medicamentoModel');
const RegistroUsoMedicamentoModel = require('../models/registroUsoMedicamentoModel');
const ProfileModel = require('../models/profileModel');

// Verificar se ProfileModel foi importado corretamente
console.log('🔍 [DEBUG Service] ProfileModel importado:', ProfileModel ? 'Sim' : 'Não');
console.log('🔍 [DEBUG Service] ProfileModel.findById existe?', typeof ProfileModel?.findById === 'function' ? 'Sim' : 'Não');

class MedicamentoService {
  // --- MÉTODOS PARA O MEDICAMENTO (CRUD) ---

  static async createMedicamento(usuarioId, perfilId, dadosMedicamento) {
    console.log('🔍 [DEBUG Service] Criando medicamento:', { 
      usuarioId, 
      perfilId, 
      tipoUsuarioId: typeof usuarioId,
      tipoPerfilId: typeof perfilId,
      dadosMedicamento 
    });
    
    // Verificar se o perfil pertence ao usuário
    console.log('🔍 [DEBUG Service] Verificando propriedade do perfil...');
    await this._verifyProfileOwnership(usuarioId, perfilId);
    console.log('✅ [DEBUG Service] Perfil verificado com sucesso');

    const { nome_medicamento, frequencia_horas, data_inicio_tratamento } = dadosMedicamento;
    if (!nome_medicamento || !frequencia_horas || !data_inicio_tratamento) {
      throw new Error('Nome do medicamento, frequência (em horas) e data de início são obrigatórios.');
    }

    // Garantir que perfil_id está correto
    const dadosParaCriar = { 
      ...dadosMedicamento, 
      perfil_id: perfilId 
    };
    
    console.log('🔍 [DEBUG Service] Dados para criar no Model:', JSON.stringify(dadosParaCriar, null, 2));
    console.log('📤 [DEBUG Service] Chamando MedicamentoModel.create...');
    
    const resultado = await MedicamentoModel.create(dadosParaCriar);
    
    console.log('✅ [DEBUG Service] Medicamento criado com sucesso:', JSON.stringify(resultado, null, 2));
    return resultado;
  }

  static async getAllMedicamentosByProfile(usuarioId, perfilId) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    return await MedicamentoModel.findByPerfilId(perfilId);
  }

  static async getMedicamentoById(usuarioId, perfilId, medicamentoId) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    return await this._verifyMedicamentoOwnership(perfilId, medicamentoId);
  }
  
  static async updateMedicamento(usuarioId, perfilId, medicamentoId, updateData) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    await this._verifyMedicamentoOwnership(perfilId, medicamentoId);

    await MedicamentoModel.update(medicamentoId, updateData);
    return await MedicamentoModel.findById(medicamentoId);
  }

  static async deleteMedicamento(usuarioId, perfilId, medicamentoId) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    await this._verifyMedicamentoOwnership(perfilId, medicamentoId);

    return await MedicamentoModel.delete(medicamentoId);
  }

  // --- MÉTODOS PARA REGISTRO DE USO ---

  static async registrarUso(usuarioId, perfilId, medicamentoId, dadosRegistro) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    await this._verifyMedicamentoOwnership(perfilId, medicamentoId);
    
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

  static async getHistoricoDeUso(usuarioId, perfilId, medicamentoId) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    await this._verifyMedicamentoOwnership(perfilId, medicamentoId);

    return await RegistroUsoMedicamentoModel.findByMedicamentoId(medicamentoId);
  }

  // --- MÉTODOS PRIVADOS DE VERIFICAÇÃO ---

  static async _verifyProfileOwnership(usuarioId, perfilId) {
    console.log('🔍 [DEBUG Service] _verifyProfileOwnership chamado:', { 
      usuarioId, 
      perfilId,
      tipoUsuarioId: typeof usuarioId,
      tipoPerfilId: typeof perfilId
    });
    
    console.log('🔍 [DEBUG Service] Buscando perfil no banco...');
    const perfil = await ProfileModel.findById(perfilId);
    console.log('🔍 [DEBUG Service] Perfil encontrado:', perfil ? 'Sim' : 'Não', perfil);
    
    if (!perfil) {
      console.error('❌ [DEBUG Service] Perfil não encontrado no banco para perfilId:', perfilId);
      throw new Error('Perfil não encontrado.');
    }
    
    console.log('🔍 [DEBUG Service] Comparando usuario_id:', {
      perfilUsuarioId: perfil.usuario_id,
      tipoPerfilUsuarioId: typeof perfil.usuario_id,
      usuarioIdRecebido: usuarioId,
      tipoUsuarioIdRecebido: typeof usuarioId,
      comparacao: perfil.usuario_id !== Number(usuarioId)
    });
    
    if (perfil.usuario_id !== Number(usuarioId)) {
      console.error('❌ [DEBUG Service] Perfil não pertence ao usuário:', {
        perfilUsuarioId: perfil.usuario_id,
        usuarioIdRecebido: usuarioId
      });
      throw new Error('Acesso não autorizado a este perfil.');
    }
    
    console.log('✅ [DEBUG Service] Perfil pertence ao usuário - verificação OK');
    return perfil;
  }

  static async _verifyMedicamentoOwnership(perfilId, medicamentoId) {
    const medicamento = await MedicamentoModel.findById(medicamentoId);
    if (!medicamento) {
      throw new Error('Medicamento não encontrado.');
    }
    if (medicamento.perfil_id !== Number(perfilId)) {
      throw new Error('Medicamento não pertence a este perfil.');
    }
    return medicamento;
  }
}

module.exports = MedicamentoService;