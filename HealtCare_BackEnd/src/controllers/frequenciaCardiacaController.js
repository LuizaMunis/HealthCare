// backend/src/controllers/frequenciaCardiacaController.js
const FrequenciaCardiacaService = require('../services/frequenciaCardiacaService');

class FrequenciaCardiacaController {
  static async createRegistro(req, res) {
    try {
      const usuarioId = req.user.id;
      const registroData = req.body || {};
      const payload = { usuario_id: usuarioId, ...registroData };

      const novoRegistro = await FrequenciaCardiacaService.createRegistro(payload);

      res.status(201).json({
        success: true,
        message: 'Frequência cardíaca registrada com sucesso!',
        data: novoRegistro
      });
    } catch (error) {
      FrequenciaCardiacaController.handleError(res, error);
    }
  }

  static async getAllRegistrosByProfile(req, res) {
    try {
      const usuarioId = req.user.id;
      const registros = await FrequenciaCardiacaService.getRegistrosByUsuario(usuarioId);

      res.json({
        success: true,
        data: registros
      });
    } catch (error) {
      FrequenciaCardiacaController.handleError(res, error);
    }
  }

  static async getRegistroById(req, res) {
    try {
      const usuarioId = req.user.id;
      const { registroId } = req.params;

      const registro = await FrequenciaCardiacaService.getRegistroById(registroId, usuarioId);

      res.json({
        success: true,
        data: registro
      });
    } catch (error) {
      FrequenciaCardiacaController.handleError(res, error);
    }
  }

  static async updateRegistro(req, res) {
    try {
      const usuarioId = req.user.id;
      const { registroId } = req.params;
      const updateData = req.body;

      const registroAtualizado = await FrequenciaCardiacaService.updateRegistro(registroId, usuarioId, updateData);

      res.json({
        success: true,
        message: 'Registro atualizado com sucesso!',
        data: registroAtualizado
      });
    } catch (error) {
      FrequenciaCardiacaController.handleError(res, error);
    }
  }

  static async deleteRegistro(req, res) {
    try {
      const usuarioId = req.user.id;
      const { registroId } = req.params;

      await FrequenciaCardiacaService.deleteRegistro(registroId, usuarioId);

      res.json({
        success: true,
        message: 'Registro deletado com sucesso!'
      });
    } catch (error) {
      FrequenciaCardiacaController.handleError(res, error);
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