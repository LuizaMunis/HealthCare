// HealthCare_Backend/src/services/registroPressaoArterialService.js

const RegistroPressaoArterialModel = require('../models/registroPressaoArterialModel');
const ProfileModel = require('../models/profileModel');

class RegistroPressaoArterialService {

  static async createRegistro(usuarioId, perfilId, registroData) {
    const perfil = await this._verifyProfileOwnership(usuarioId, perfilId);

    const { sistolica_mmhg, diastolica_mmhg, data_hora_medicao } = registroData;

    if (!data_hora_medicao) {
      throw new Error('A data e hora da medição são obrigatórias');
    }
    if (sistolica_mmhg && (typeof sistolica_mmhg !== 'number' || sistolica_mmhg < 70 || sistolica_mmhg > 300)) {
      throw new Error('Pressão sistólica inválida ou fora do intervalo (70-300 mmHg)');
    }
    if (diastolica_mmhg && (typeof diastolica_mmhg !== 'number' || diastolica_mmhg < 40 || diastolica_mmhg > 200)) {
      throw new Error('Pressão diastólica inválida ou fora do intervalo (40-200 mmHg)');
    }
    if (sistolica_mmhg && diastolica_mmhg && sistolica_mmhg < diastolica_mmhg) {
      throw new Error('Pressão sistólica não pode ser menor que a diastólica');
    }

    const newRegistroData = {
      perfil_id: perfil.id,
      sistolica_mmhg: sistolica_mmhg || null,
      diastolica_mmhg: diastolica_mmhg || null,
      data_hora_medicao
    };

    return await RegistroPressaoArterialModel.create(newRegistroData);
  }

  static async getRegistrosByProfile(usuarioId, perfilId) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    return await RegistroPressaoArterialModel.findByPerfilId(perfilId);
  }

  static async updateRegistro(usuarioId, perfilId, registroId, updateData) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    const registro = await this._verifyRegistroOwnership(perfilId, registroId);
    
    const { sistolica_mmhg, diastolica_mmhg } = updateData;

    if (sistolica_mmhg && (typeof sistolica_mmhg !== 'number' || sistolica_mmhg < 70 || sistolica_mmhg > 300)) {
      throw new Error('Pressão sistólica inválida ou fora do intervalo (70-300 mmHg)');
    }
    if (diastolica_mmhg && (typeof diastolica_mmhg !== 'number' || diastolica_mmhg < 40 || diastolica_mmhg > 200)) {
      throw new Error('Pressão diastólica inválida ou fora do intervalo (40-200 mmHg)');
    }
    if (sistolica_mmhg && diastolica_mmhg && sistolica_mmhg < diastolica_mmhg) {
      throw new Error('Pressão sistólica não pode ser menor que a diastólica');
    }

    await RegistroPressaoArterialModel.update(registroId, updateData);
    return await RegistroPressaoArterialModel.findById(registroId);
  }

  static async deleteRegistro(usuarioId, perfilId, registroId) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    await this._verifyRegistroOwnership(perfilId, registroId);
    
    const deleted = await RegistroPressaoArterialModel.delete(registroId);
    if (!deleted) {
      throw new Error('Erro ao deletar registro');
    }
    return true;
  }

  static async analisarRegistros(usuarioId, perfilId) {
    await this._verifyProfileOwnership(usuarioId, perfilId);
    const registros = await RegistroPressaoArterialModel.findByPerfilId(perfilId);

    if (registros.length === 0) {
      return { totalRegistros: 0, mediaSistolica: null, mediaDiastolica: null, classificacao: 'Sem dados suficientes', alertas: [] };
    }

    const registrosComDados = registros.filter(r => r.sistolica_mmhg && r.diastolica_mmhg);
    if (registrosComDados.length === 0) {
        return { totalRegistros: registros.length, mediaSistolica: null, mediaDiastolica: null, classificacao: 'Sem dados suficientes', alertas: [] };
    }

    const mediaSistolica = registrosComDados.reduce((sum, r) => sum + r.sistolica_mmhg, 0) / registrosComDados.length;
    const mediaDiastolica = registrosComDados.reduce((sum, r) => sum + r.diastolica_mmhg, 0) / registrosComDados.length;

    let classificacao = 'Normal';
    if (mediaSistolica >= 140 || mediaDiastolica >= 90) {
      classificacao = 'Hipertensão';
    } else if (mediaSistolica < 90 || mediaDiastolica < 60) {
      classificacao = 'Hipotensão';
    } else if (mediaSistolica >= 120 || mediaDiastolica >= 80) {
      classificacao = 'Pré-hipertensão';
    }

    return {
      totalRegistros: registros.length,
      mediaSistolica: Math.round(mediaSistolica),
      mediaDiastolica: Math.round(mediaDiastolica),
      classificacao
    };
  }

  static async _verifyProfileOwnership(usuarioId, perfilId) {
    const perfil = await PerfilModel.findById(perfilId);
    if (!perfil) {
      throw new Error('Perfil não encontrado');
    }
    if (perfil.usuario_id !== usuarioId) {
      throw new Error('Acesso não autorizado a este perfil');
    }
    return perfil;
  }

  static async _verifyRegistroOwnership(perfilId, registroId) {
    const registro = await RegistroPressaoArterialModel.findById(registroId);
    if (!registro) {
      throw new Error('Registro não encontrado');
    }
    if (registro.perfil_id !== perfilId) {
      throw new Error('Registro não pertence a este perfil');
    }
    return registro;
  }
}

module.exports = RegistroPressaoArterialService;