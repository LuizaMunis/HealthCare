// backend/src/controllers/registroPressaoArterialController.js
const RegistroPressaoArterialModel = require('../models/registroPressaoArterialModel');
const RegistroPressaoArterialService = require('../services/registroPressaoArterialService');
const ProfileModel = require('../models/profileModel');
class RegistroPressaoArterialController {
  static async createRegistro(req, res) {
    try {
      const usuarioId = req.user?.id;
      const registroData = req.body || {};
      const perfilId = registroData.perfil_id;

      if (!perfilId) {
        return res.status(400).json({ 
          success: false, 
          message: 'perfil_id é obrigatório no corpo da requisição.' 
        });
      }

      const newRegistro = await RegistroPressaoArterialService.createRegistro(usuarioId, perfilId, registroData);

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
      const perfilId = req.query.perfil_id || req.body.perfil_id;

      if (!perfilId) {
        return res.status(400).json({ 
          success: false, 
          message: 'perfil_id é obrigatório (query string ou body).' 
        });
      }

      const registros = await RegistroPressaoArterialService.getRegistrosByProfile(usuarioId, perfilId);

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
      const perfilId = req.body.perfil_id || req.query.perfil_id;
      const updateData = req.body;

      if (!perfilId) {
        return res.status(400).json({ 
          success: false, 
          message: 'perfil_id é obrigatório (query string ou body).' 
        });
      }

      const updatedRegistro = await RegistroPressaoArterialService.updateRegistro(usuarioId, perfilId, registroId, updateData);

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
      const perfilId = req.query.perfil_id || req.body.perfil_id;

      if (!perfilId) {
        return res.status(400).json({ 
          success: false, 
          message: 'perfil_id é obrigatório (query string ou body).' 
        });
      }

      await RegistroPressaoArterialService.deleteRegistro(usuarioId, perfilId, registroId);

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