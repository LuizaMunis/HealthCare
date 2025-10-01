// backend/src/controllers/frequenciaCardiacaController.js
const FrequenciaCardiacaService = require('../services/frequenciaCardiacaService');

class FrequenciaCardiacaController {
  static async createRegistro(req, res) {
    try {
      const novoRegistro = await FrequenciaCardiacaService.createRegistro(req.user.id, req.body);
      res.status(201).json({ success: true, message: 'Frequência cardíaca registrada!', data: novoRegistro });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getAllRegistros(req, res) {
    try {
      const registros = await FrequenciaCardiacaService.getAllRegistrosByUsuario(req.user.id);
      res.status(200).json({ success: true, data: registros });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getRegistroById(req, res) {
    try {
      const { id } = req.params;
      const registro = await FrequenciaCardiacaService.getRegistroById(req.user.id, id);
      res.status(200).json({ success: true, data: registro });
    } catch (error) {
      const statusCode = error.message.includes('não encontrado') ? 404 : 403;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  static async updateRegistro(req, res) {
    try {
      const { id } = req.params;
      const registroAtualizado = await FrequenciaCardiacaService.updateRegistro(req.user.id, id, req.body);
      res.status(200).json({ success: true, message: 'Registro atualizado!', data: registroAtualizado });
    } catch (error) {
      const statusCode = error.message.includes('não encontrado') ? 404 : 400;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  static async deleteRegistro(req, res) {
    try {
      const { id } = req.params;
      await FrequenciaCardiacaService.deleteRegistro(req.user.id, id);
      res.status(200).json({ success: true, message: 'Registro deletado!' });
    } catch (error) {
      const statusCode = error.message.includes('não encontrado') ? 404 : 500;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }
}

module.exports = FrequenciaCardiacaController;