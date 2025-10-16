// backend/src/controllers/frequenciaCardiacaController.js
const FrequenciaCardiacaService = require('../services/frequenciaCardiacaService');

class FrequenciaCardiacaController {
  static async createRegistro(req, res) {
    try {
      const usuarioId = req.user.id;
      const { profileId } = req.params;
      const registroData = req.body;

      const novoRegistro = await FrequenciaCardiacaService.createRegistro(usuarioId, profileId, registroData);

      res.status(201).json({
        success: true,
        message: 'Frequência cardíaca registrada com sucesso!',
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

      const registros = await FrequenciaCardiacaService.getAllRegistrosByProfile(usuarioId, profileId);

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

      const registro = await FrequenciaCardiacaService.getRegistroById(usuarioId, profileId, registroId);

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

      const registroAtualizado = await FrequenciaCardiacaService.updateRegistro(usuarioId, profileId, registroId, updateData);

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

      await FrequenciaCardiacaService.deleteRegistro(usuarioId, profileId, registroId);

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

module.exports = FrequenciaCardiacaController;