// backend/src/controllers/glicemiaController.js
const GlicemiaService = require('../services/glicemiaService');

class GlicemiaController {
  static async createRegistro(req, res) {
    try {
      const usuarioId = req.user.id;
      const payload = { usuario_id: usuarioId, ...req.body };
      const novo = await GlicemiaService.createRegistro(payload);
      res.status(201).json({ success: true, message: 'Glicemia registrada com sucesso!', data: novo });
    } catch (error) {
      GlicemiaController.handleError(res, error);
    }
  }

  static async getAll(req, res) {
    try {
      const usuarioId = req.user.id;
      const rows = await GlicemiaService.getRegistrosByUsuario(usuarioId);
      res.json({ success: true, data: rows });
    } catch (error) {
      GlicemiaController.handleError(res, error);
    }
  }

  static async getById(req, res) {
    try {
      const usuarioId = req.user.id;
      const { registroId } = req.params;
      const row = await GlicemiaService.getRegistroById(registroId, usuarioId);
      res.json({ success: true, data: row });
    } catch (error) {
      GlicemiaController.handleError(res, error);
    }
  }

  static async update(req, res) {
    try {
      const usuarioId = req.user.id;
      const { registroId } = req.params;
      const updated = await GlicemiaService.updateRegistro(registroId, usuarioId, req.body);
      res.json({ success: true, message: 'Registro atualizado com sucesso!', data: updated });
    } catch (error) {
      GlicemiaController.handleError(res, error);
    }
  }

  static async remove(req, res) {
    try {
      const usuarioId = req.user.id;
      const { registroId } = req.params;
      await GlicemiaService.deleteRegistro(registroId, usuarioId);
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


