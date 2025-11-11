// backend/src/controllers/frequenciaCardiacaController.js
const FrequenciaCardiacaService = require('../services/frequenciaCardiacaService');

class FrequenciaCardiacaController {
  static async createRegistro(req, res) {
    try {
      const usuarioId = req.user.id;
      const registroData = req.body || {};
      const perfilId = registroData.perfil_id;

      if (!perfilId) {
        return res.status(400).json({ 
          success: false, 
          message: 'perfil_id é obrigatório no corpo da requisição.' 
        });
      }

      const novoRegistro = await FrequenciaCardiacaService.createRegistro(usuarioId, perfilId, registroData);

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
      const perfilId = req.query.perfil_id || req.body.perfil_id;

      if (!perfilId) {
        return res.status(400).json({ 
          success: false, 
          message: 'perfil_id é obrigatório (query string ou body).' 
        });
      }

      const registros = await FrequenciaCardiacaService.getRegistrosByProfile(usuarioId, perfilId);

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
      const perfilId = req.query.perfil_id || req.body.perfil_id;

      if (!perfilId) {
        return res.status(400).json({ 
          success: false, 
          message: 'perfil_id é obrigatório (query string ou body).' 
        });
      }

      const registro = await FrequenciaCardiacaService.getRegistroById(usuarioId, perfilId, registroId);

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
      const perfilId = req.body.perfil_id || req.query.perfil_id;
      const updateData = req.body;

      if (!perfilId) {
        return res.status(400).json({ 
          success: false, 
          message: 'perfil_id é obrigatório (query string ou body).' 
        });
      }

      const registroAtualizado = await FrequenciaCardiacaService.updateRegistro(usuarioId, perfilId, registroId, updateData);

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
      const perfilId = req.query.perfil_id || req.body.perfil_id;

      if (!perfilId) {
        return res.status(400).json({ 
          success: false, 
          message: 'perfil_id é obrigatório (query string ou body).' 
        });
      }

      await FrequenciaCardiacaService.deleteRegistro(usuarioId, perfilId, registroId);

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