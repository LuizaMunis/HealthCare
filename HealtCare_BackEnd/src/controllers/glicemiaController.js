// backend/src/controllers/glicemiaController.js
const GlicemiaService = require('../services/glicemiaService');

class GlicemiaController {
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

      const novo = await GlicemiaService.createRegistro(usuarioId, perfilId, registroData);
      res.status(201).json({ success: true, message: 'Glicemia registrada com sucesso!', data: novo });
    } catch (error) {
      GlicemiaController.handleError(res, error);
    }
  }

  static async getAll(req, res) {
    try {
      const usuarioId = req.user.id;
      const perfilId = req.query.perfil_id || req.body.perfil_id;

      if (!perfilId) {
        return res.status(400).json({ 
          success: false, 
          message: 'perfil_id é obrigatório (query string ou body).' 
        });
      }

      const rows = await GlicemiaService.getRegistrosByProfile(usuarioId, perfilId);
      res.json({ success: true, data: rows });
    } catch (error) {
      GlicemiaController.handleError(res, error);
    }
  }

  static async getById(req, res) {
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

      const row = await GlicemiaService.getRegistroById(usuarioId, perfilId, registroId);
      res.json({ success: true, data: row });
    } catch (error) {
      GlicemiaController.handleError(res, error);
    }
  }

  static async update(req, res) {
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

      const updated = await GlicemiaService.updateRegistro(usuarioId, perfilId, registroId, updateData);
      res.json({ success: true, message: 'Registro atualizado com sucesso!', data: updated });
    } catch (error) {
      GlicemiaController.handleError(res, error);
    }
  }

  static async remove(req, res) {
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

      await GlicemiaService.deleteRegistro(usuarioId, perfilId, registroId);
      res.json({ success: true, message: 'Registro deletado com sucesso!' });
    } catch (error) {
      GlicemiaController.handleError(res, error);
    }
  }

  static handleError(res, error) {
    let status = 500;
    const msg = error.message || 'Erro interno.';
    if (msg.includes('obrigatório') || msg.includes('inválida') || msg.includes('inválido')) status = 400;
    else if (msg.includes('não encontrado')) status = 404;
    else if (msg.includes('não pertence') || msg.includes('não autorizado')) status = 403;
    res.status(status).json({ success: false, message: msg });
  }
}

module.exports = GlicemiaController;


