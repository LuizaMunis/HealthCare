// backend/src/controllers/registroPressaoArterialController.js
const RegistroPressaoArterialModel = require('../models/registroPressaoArterialModel');
const RegistroPressaoArterialService = require('../services/registroPressaoArterialService');
const PerfilModel = require('../models/perfilModel'); // Precisamos do PerfilModel para obter o perfil_id

class RegistroPressaoArterialController {
  /**
   * Helper privado para obter o perfil_id do usuário autenticado.
   * @param {number} usuarioId - ID do usuário autenticado.
   * @returns {number|null} O perfil_id se encontrado, ou null.
   */
  static async _getPerfilIdFromUserId(usuarioId) {
    const perfil = await PerfilModel.findByUserId(usuarioId);
    return perfil ? perfil.id : null;
  }

  static async createRegistro(req, res) {
    try {
      const usuarioId = req.user?.id;
      const registroData = req.body || {};

      // O service espera um único objeto com os dados. Incluímos o usuario_id
      // para que ele possa resolver o perfil_id quando necessário.
      const payload = { usuario_id: usuarioId, ...registroData };

      const newRegistro = await RegistroPressaoArterialService.createRegistro(payload);

      res.status(201).json({
        success: true,
        message: 'Registro de pressão arterial criado com sucesso!',
        data: newRegistro
      });
    } catch (error) {
      console.error('Erro ao criar registro de pressão arterial:', error);
      RegistroPressaoArterialController.handleError(res, error);
    }
  }

  static async getRegistrosByProfile(req, res) {
    try {
      const usuarioId = req.user.id;

      // Endpoint não recebe profileId; buscar pelos registros do usuário autenticado
      const registros = await RegistroPressaoArterialService.getRegistrosByUsuario(usuarioId);

      res.json({
        success: true,
        message: 'Registros de pressão arterial obtidos com sucesso!',
        data: registros
      });
    } catch (error) {
      console.error('Erro ao obter registros de pressão arterial:', error);
      RegistroPressaoArterialController.handleError(res, error);
    }
  }

  static async updateRegistro(req, res) {
    try {
      const usuarioId = req.user.id;
      const { registroId } = req.params;
      const updateData = req.body;

      const updatedRegistro = await RegistroPressaoArterialService.updateRegistro(registroId, usuarioId, updateData);

      res.json({
        success: true,
        message: 'Registro de pressão arterial atualizado com sucesso!',
        data: updatedRegistro
      });
    } catch (error) {
      console.error('Erro ao atualizar registro de pressão arterial:', error);
      RegistroPressaoArterialController.handleError(res, error);
    }
  }

  static async deleteRegistro(req, res) {
    try {
      const usuarioId = req.user.id;
      const { registroId } = req.params;

      await RegistroPressaoArterialService.deleteRegistro(registroId, usuarioId);

      res.json({
        success: true,
        message: 'Registro de pressão arterial deletado com sucesso!'
      });
    } catch (error) {
      console.error('Erro ao deletar registro de pressão arterial:', error);
      RegistroPressaoArterialController.handleError(res, error);
    }
  }

  static handleError(res, error) {
    let statusCode = 500;
    const errorMessage = error.message || 'Ocorreu um erro interno no servidor.';

    if (errorMessage.includes('obrigatório') || errorMessage.includes('inválida')) {
        statusCode = 400;
    } else if (errorMessage.includes('não encontrado')) {
        statusCode = 404;
    } else if (errorMessage.includes('não pertence') || errorMessage.includes('não autorizado')) {
        statusCode = 403;
    }

    res.status(statusCode).json({ success: false, message: errorMessage });
  }
}

module.exports = RegistroPressaoArterialController;