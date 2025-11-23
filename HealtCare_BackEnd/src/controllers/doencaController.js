// backend/src/controllers/doencaController.js
const DoencaService = require('../services/doencaService');

class DoencaController {
  static async createDoenca(req, res) {
    try {
      const usuarioId = req.user.id;
      const perfilId = req.body.perfil_id || req.query.perfil_id;
      const doencaData = req.body;

      if (!perfilId) {
        return res.status(400).json({ 
          success: false, 
          message: 'perfil_id é obrigatório (query string ou body).' 
        });
      }

      const newDoenca = await DoencaService.createDoenca(usuarioId, perfilId, doencaData);

      res.status(201).json({
        success: true,
        message: 'Doença registrada com sucesso!',
        data: newDoenca
      });
    } catch (error) {
      DoencaController.handleError(res, error);
    }
  }

  static async getAllDoencasByProfile(req, res) {
    try {
      const usuarioId = req.user.id;
      const perfilId = req.query.perfil_id || req.body.perfil_id;

      if (!perfilId) {
        return res.status(400).json({ 
          success: false, 
          message: 'perfil_id é obrigatório (query string ou body).' 
        });
      }

      const doencas = await DoencaService.getAllDoencasByProfile(usuarioId, perfilId);

      res.json({
        success: true,
        data: doencas
      });
    } catch (error) {
      DoencaController.handleError(res, error);
    }
  }

  static async getDoencaById(req, res) {
    try {
      const usuarioId = req.user.id;
      const { doencaId } = req.params;
      const perfilId = req.query.perfil_id || req.body.perfil_id;

      if (!perfilId) {
        return res.status(400).json({ 
          success: false, 
          message: 'perfil_id é obrigatório (query string ou body).' 
        });
      }

      const doenca = await DoencaService.getDoencaById(usuarioId, perfilId, doencaId);

      res.json({
        success: true,
        data: doenca
      });
    } catch (error) {
      DoencaController.handleError(res, error);
    }
  }

  static async updateDoenca(req, res) {
    try {
      const usuarioId = req.user.id;
      const { doencaId } = req.params;
      const perfilId = req.body.perfil_id || req.query.perfil_id;
      const updateData = req.body;

      if (!perfilId) {
        return res.status(400).json({ 
          success: false, 
          message: 'perfil_id é obrigatório (query string ou body).' 
        });
      }

      const updatedDoenca = await DoencaService.updateDoenca(usuarioId, perfilId, doencaId, updateData);

      res.json({
        success: true,
        message: 'Doença atualizada com sucesso!',
        data: updatedDoenca
      });
    } catch (error) {
      DoencaController.handleError(res, error);
    }
  }

  static async deleteDoenca(req, res) {
    try {
      const usuarioId = req.user.id;
      const { doencaId } = req.params;
      const perfilId = req.query.perfil_id || req.body.perfil_id;

      if (!perfilId) {
        return res.status(400).json({ 
          success: false, 
          message: 'perfil_id é obrigatório (query string ou body).' 
        });
      }

      await DoencaService.deleteDoenca(usuarioId, perfilId, doencaId);

      res.json({
        success: true,
        message: 'Doença deletada com sucesso!'
      });
    } catch (error) {
      DoencaController.handleError(res, error);
    }
  }

  // --- SINTOMA CONTROLLERS ---
  // Note: Sintomas should likely have their own service and model for better separation.
  // For now, they are handled here as requested.

  static async addSintomaToDoenca(req, res) {
    try {
        const usuarioId = req.user.id;
        const { doencaId } = req.params;
        const perfilId = req.body.perfil_id || req.query.perfil_id;
        const sintomaData = req.body;

        if (!perfilId) {
          return res.status(400).json({ 
            success: false, 
            message: 'perfil_id é obrigatório (query string ou body).' 
          });
        }

        const novoSintoma = await DoencaService.addSintoma(usuarioId, perfilId, doencaId, sintomaData);
        res.status(201).json({ success: true, message: 'Sintoma adicionado com sucesso!', data: novoSintoma });
    } catch (error) {
        DoencaController.handleError(res, error);
    }
  }

  static async getSintomasByDoenca(req, res) {
    try {
        const usuarioId = req.user.id;
        const { doencaId } = req.params;
        const perfilId = req.query.perfil_id || req.body.perfil_id;

        if (!perfilId) {
          return res.status(400).json({ 
            success: false, 
            message: 'perfil_id é obrigatório (query string ou body).' 
          });
        }

        const sintomas = await DoencaService.getSintomasByDoenca(usuarioId, perfilId, doencaId);
        res.json({ success: true, data: sintomas });
    } catch (error) {
        DoencaController.handleError(res, error);
    }
  }


  static handleError(res, error) {
    let statusCode = 500;
    const errorMessage = error.message || 'Ocorreu um erro interno no servidor.';

    if (errorMessage.includes('obrigatório') || errorMessage.includes('inválido')) {
        statusCode = 400;
    } else if (errorMessage.includes('não encontrada')) {
        statusCode = 404;
    } else if (errorMessage.includes('não pertence') || errorMessage.includes('não autorizado') || errorMessage.includes('Acesso negado')) {
        statusCode = 403;
    }

    res.status(statusCode).json({ success: false, message: errorMessage });
  }
}

module.exports = DoencaController;