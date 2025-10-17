// backend/src/controllers/temperaturaController.js
const TemperaturaService = require('../services/temperaturaService');

class TemperaturaController {
  static async createRegistro(req, res) {
    try {
      const usuarioId = req.user.id;
      const { profileId } = req.params;
      const registroData = req.body;

      const novoRegistro = await TemperaturaService.createRegistro(usuarioId, profileId, registroData);

      res.status(201).json({
        success: true,
        message: 'Temperatura registrada com sucesso!',
        data: novoRegistro
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  static async getAllRegistrosByProfile(req, res) {
    try {
      const usuarioId = req.user.id;
      const { profileId } = req.params;

      const registros = await TemperaturaService.getAllRegistrosByProfile(usuarioId, profileId);

      res.json({
        success: true,
        data: registros
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  static async getRegistroById(req, res) {
    try {
      const usuarioId = req.user.id;
      const { profileId, registroId } = req.params;

      const registro = await TemperaturaService.getRegistroById(usuarioId, profileId, registroId);

      res.json({
        success: true,
        data: registro
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  static async updateRegistro(req, res) {
    try {
      const usuarioId = req.user.id;
      const { profileId, registroId } = req.params;
      const updateData = req.body;

      const registroAtualizado = await TemperaturaService.updateRegistro(usuarioId, profileId, registroId, updateData);

      res.json({
        success: true,
        message: 'Registro atualizado com sucesso!',
        data: registroAtualizado
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  static async deleteRegistro(req, res) {
    try {
      const usuarioId = req.user.id;
      const { profileId, registroId } = req.params;

      await TemperaturaService.deleteRegistro(usuarioId, profileId, registroId);

      res.json({
        success: true,
        message: 'Registro deletado com sucesso!'
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  static handleError(res, error) {
    let statusCode = 500;
    const errorMessage = error.message || 'Ocorreu um erro interno no servidor.';

    if (errorMessage.includes('obrigatório') || errorMessage.includes('inválido')) {
        statusCode = 400;
    } else if (errorMessage.includes('não encontrado')) {
        statusCode = 404;
    } else if (errorMessage.includes('não pertence') || errorMessage.includes('não autorizado')) {
        statusCode = 403;
    }

    res.status(statusCode).json({ success: false, message: errorMessage });
  }
}

module.exports = TemperaturaController;