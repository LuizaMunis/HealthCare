// src/controllers/alertaController.js
const AlertaService = require('../services/alertaService');

class AlertaController {

  static async getAlertasPorPerfil(req, res) {
    try {
      const usuarioId = req.user.id; // ID do usuário logado (do token JWT)
      const { perfilId } = req.params;

      const alertas = await AlertaService.getAlertasPorPerfil(usuarioId, parseInt(perfilId));
      
      res.status(200).json({ success: true, data: alertas });
    } catch (error) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  static async marcarAlertaComoVisualizado(req, res) {
    try {
      const usuarioId = req.user.id;
      const { alertaId } = req.params;

      await AlertaService.marcarComoVisualizado(usuarioId, parseInt(alertaId));
      
      res.status(200).json({ success: true, message: 'Alerta marcado como visualizado.' });
    } catch (error) {
      res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  static async marcarTodosComoVisualizados(req, res) {
    try {
        const usuarioId = req.user.id;
        const { perfilId } = req.params;

        await AlertaService.marcarTodosDoPerfilComoVisualizados(usuarioId, parseInt(perfilId));

        res.status(200).json({ success: true, message: 'Todos os alertas foram marcados como visualizados.' });
    } catch (error) {
        res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }

  static async deletarAlerta(req, res) {
    try {
        const usuarioId = req.user.id;
        const { alertaId } = req.params;

        await AlertaService.deleteAlerta(usuarioId, parseInt(alertaId));

        res.status(200).json({ success: true, message: 'Alerta deletado com sucesso.' });
    } catch (error) {
        res.status(error.statusCode || 500).json({ success: false, message: error.message });
    }
  }
}

module.exports = AlertaController;