// backend/src/services/consultaService.js

const ConsultaModel = require('../models/registroConsultaModel');
const ProfileModel = require('../models/profileModel');
class ConsultaService {

  static async createConsulta(usuarioId, profileId, dadosConsulta) {
    await this._verifyProfileOwnership(usuarioId, profileId);

    const { especialidade, data_hora_consulta } = dadosConsulta;
    if (!especialidade || !data_hora_consulta) {
      throw new Error('Os campos "especialidade" and "data e hora da consulta" são obrigatórios.');
    }

    const dadosParaCriar = {
      ...dadosConsulta,
      perfil_id: profileId,
    };

    return await ConsultaModel.create(dadosParaCriar);
  }

  static async getAllConsultasByProfile(usuarioId, profileId) {
    await this._verifyProfileOwnership(usuarioId, profileId);
    return await ConsultaModel.findByPerfilId(profileId);
  }

  static async getConsultaById(usuarioId, profileId, consultaId) {
    await this._verifyProfileOwnership(usuarioId, profileId);
    return await this._verifyConsultaOwnership(profileId, consultaId);
  }

  static async updateConsulta(usuarioId, profileId, consultaId, dadosUpdate) {
    await this._verifyProfileOwnership(usuarioId, profileId);
    await this._verifyConsultaOwnership(profileId, consultaId);

    if (Object.keys(dadosUpdate).length === 0) {
      throw new Error("Nenhum dado fornecido para atualização.");
    }
    
    await ConsultaModel.update(consultaId, dadosUpdate);
    return await ConsultaModel.findById(consultaId);
  }

  static async deleteConsulta(usuarioId, profileId, consultaId) {
    await this._verifyProfileOwnership(usuarioId, profileId);
    await this._verifyConsultaOwnership(profileId, consultaId);

    const sucesso = await ConsultaModel.delete(consultaId);
    if (!sucesso) {
      throw new Error("Falha ao deletar a consulta.");
    }
    return true;
  }

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

  static async _verifyConsultaOwnership(profileId, consultaId) {
    const consulta = await ConsultaModel.findById(consultaId);
    if (!consulta) {
      throw new Error('Consulta não encontrada.');
    }
    if (consulta.perfil_id !== Number(profileId)) {
      throw new Error('Consulta não pertence a este perfil.');
    }
    return consulta;
  }
}

module.exports = ConsultaService;