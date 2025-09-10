// backend/src/controllers/temperaturaController.js
const TemperaturaService = require('../services/temperaturaService');

class TemperaturaController {
  static async createRegistro(req, res) {
    try {
      const novoRegistro = await TemperaturaService.createRegistro(req.user.id, req.body);
      res.status(201).json({ success: true, message: 'Temperatura registrada com sucesso!', data: novoRegistro });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getAllRegistros(req, res) {
    try {
      const registros = await TemperaturaService.getAllRegistrosByUsuario(req.user.id);
      res.status(200).json({ success: true, data: registros });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getRegistroById(req, res) {
    try {
      const { id } = req.params;
      const registro = await TemperaturaService.getRegistroById(req.user.id, id);
      res.status(200).json({ success: true, data: registro });
    } catch (error) {
      const statusCode = error.message.includes('não encontrado') ? 404 : 403;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  static async updateRegistro(req, res) {
    try {
      const { id } = req.params;
      const registroAtualizado = await TemperaturaService.updateRegistro(req.user.id, id, req.body);
      res.status(200).json({ success: true, message: 'Registro atualizado com sucesso!', data: registroAtualizado });
    } catch (error) {
      const statusCode = error.message.includes('não encontrado') ? 404 : 400;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  static async deleteRegistro(req, res) {
    try {
      const { id } = req.params;
      await TemperaturaService.deleteRegistro(req.user.id, id);
      res.status(200).json({ success: true, message: 'Registro deletado com sucesso!' });
    } catch (error) {
      const statusCode = error.message.includes('não encontrado') ? 404 : 500;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }
}

module.exports = TemperaturaController;