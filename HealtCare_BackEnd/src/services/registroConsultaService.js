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

  static async createConsultaByUsuario(usuarioId, dadosConsulta) {
    const profileId = dadosConsulta.perfil_id;

    if (!profileId) {
      throw new Error('O campo perfil_id é obrigatório.');
    }

    return await this.createConsulta(usuarioId, profileId, dadosConsulta);
  }

  static async getAllConsultasByProfile(usuarioId, profileId) {
    await this._verifyProfileOwnership(usuarioId, profileId);
    return await ConsultaModel.findByPerfilId(profileId);
  }

  static async getAllConsultasByUsuario(usuarioId) {
    if (!usuarioId) {
      throw new Error('ID do usuário é obrigatório');
    }
    return await ConsultaModel.findByUsuarioId(usuarioId);
  }

  static async getConsultaById(usuarioId, profileId, consultaId) {
    await this._verifyProfileOwnership(usuarioId, profileId);
    return await this._verifyConsultaOwnership(profileId, consultaId);
  }

  static async getConsultaByIdByUsuario(usuarioId, consultaId) {
    if (!consultaId) {
      throw new Error('ID da consulta é obrigatório');
    }

    // Buscar a consulta para obter o perfil_id
    const consulta = await ConsultaModel.findById(consultaId);
    if (!consulta) {
      throw new Error('Consulta não encontrada.');
    }

    // Verificar se o perfil pertence ao usuário
    await this._verifyProfileOwnership(usuarioId, consulta.perfil_id);

    return consulta;
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

  static async updateConsultaByUsuario(usuarioId, consultaId, dadosUpdate) {
    if (!consultaId) {
      throw new Error('ID da consulta é obrigatório');
    }

    // Buscar a consulta para obter o perfil_id
    const consulta = await ConsultaModel.findById(consultaId);
    if (!consulta) {
      throw new Error('Consulta não encontrada.');
    }

    // Verificar se o perfil pertence ao usuário
    await this._verifyProfileOwnership(usuarioId, consulta.perfil_id);

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

  static async deleteConsultaByUsuario(usuarioId, consultaId) {
    if (!consultaId) {
      throw new Error('ID da consulta é obrigatório');
    }

    // Buscar a consulta para obter o perfil_id
    const consulta = await ConsultaModel.findById(consultaId);
    if (!consulta) {
      throw new Error('Consulta não encontrada.');
    }

    // Verificar se o perfil pertence ao usuário
    await this._verifyProfileOwnership(usuarioId, consulta.perfil_id);

    const sucesso = await ConsultaModel.delete(consultaId);
    if (!sucesso) {
      throw new Error("Falha ao deletar a consulta.");
    }
    return true;
  }

  static async _verifyProfileOwnership(usuarioId, profileId) {
    const perfil = await ProfileModel.findById(profileId);
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