// src/services/alertaService.js
const AlertaModel = require('../models/alertaModel');
const ProfileModel = require('../models/profileModel'); // Importante para verificar a posse do perfil

class AlertaService {

  static async getAlertasPorPerfil(usuarioId, perfilId) {
    // Validação de segurança: O perfil pertence ao usuário logado?
    const perfil = await ProfileModel.findByIdAndUserId(perfilId, usuarioId);
    if (!perfil) {
      const error = new Error('Acesso negado. Perfil não encontrado ou não pertence a este usuário.');
      error.statusCode = 403; // Forbidden
      throw error;
    }

    // Se a validação passar, busca os alertas
    return await AlertaModel.findByPerfilId(perfilId);
  }

  static async marcarComoVisualizado(usuarioId, alertaId) {
    // Primeiro, busca o alerta para descobrir a qual perfil ele pertence
    const alerta = await AlertaModel.findById(alertaId); // Você precisará criar este método no AlertaModel
    if (!alerta) {
        const error = new Error('Alerta não encontrado.');
        error.statusCode = 404;
        throw error;
    }

    // Validação de segurança: O perfil do alerta pertence ao usuário?
    const perfil = await ProfileModel.findByIdAndUserId(alerta.perfil_id, usuarioId);
    if (!perfil) {
      const error = new Error('Acesso negado.');
      error.statusCode = 403;
      throw error;
    }

    return await AlertaModel.marcarComoVisualizado(alertaId);
  }
  
  static async marcarTodosDoPerfilComoVisualizados(usuarioId, perfilId) {
    // A mesma validação de `getAlertasPorPerfil`
    const perfil = await ProfileModel.findByIdAndUserId(perfilId, usuarioId);
    if (!perfil) {
        const error = new Error('Acesso negado.');
        error.statusCode = 403;
        throw error;
    }

    return await AlertaModel.marcarTodosComoVisualizados(perfilId);
  }

  static async deleteAlerta(usuarioId, alertaId) {
    // A mesma validação de `marcarComoVisualizado`
    const alerta = await AlertaModel.findById(alertaId);
    if (!alerta) {
        const error = new Error('Alerta não encontrado.');
        error.statusCode = 404;
        throw error;
    }

    const perfil = await ProfileModel.findByIdAndUserId(alerta.perfil_id, usuarioId);
    if (!perfil) {
        const error = new Error('Acesso negado.');
        error.statusCode = 403;
        throw error;
    }

    return await AlertaModel.delete(alertaId);
  }
}

module.exports = AlertaService;