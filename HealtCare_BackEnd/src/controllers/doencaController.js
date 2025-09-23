// backend/src/controllers/doencaController.js
const DoencaService = require('../services/doencaService');

class DoencaController {
  // --- DOENÇA CONTROLLERS ---
  static async createDoenca(req, res) {
    try {
      const novaDoenca = await DoencaService.createDoenca(req.user.id, req.body);
      res.status(201).json({ success: true, message: 'Doença registrada com sucesso!', data: novaDoenca });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getAllDoencas(req, res) {
    try {
      const doencas = await DoencaService.getAllDoencasByUsuario(req.user.id);
      res.status(200).json({ success: true, data: doencas });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getDoencaById(req, res) {
    try {
      const doenca = await DoencaService.getDoencaById(req.user.id, req.params.id);
      res.status(200).json({ success: true, data: doenca });
    } catch (error) {
      const statusCode = error.message.includes('não encontrada') ? 404 : 403;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  static async updateDoenca(req, res) {
    try {
      const data = await DoencaService.updateDoenca(req.user.id, req.params.id, req.body);
      res.status(200).json({ success: true, message: 'Doença atualizada com sucesso!', data });
    } catch (error) {
      const statusCode = error.message.includes('não encontrada') ? 404 : 400;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  static async deleteDoenca(req, res) {
    try {
      await DoencaService.deleteDoenca(req.user.id, req.params.id);
      res.status(200).json({ success: true, message: 'Doença deletada com sucesso!' });
    } catch (error) {
      const statusCode = error.message.includes('não encontrada') ? 404 : 500;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  // --- SINTOMA CONTROLLERS ---
  static async addSintoma(req, res) {
    try {
      const { doencaId } = req.params;
      const novoSintoma = await DoencaService.addSintoma(req.user.id, doencaId, req.body);
      res.status(201).json({ success: true, message: 'Sintoma adicionado com sucesso!', data: novoSintoma });
    } catch (error) {
      const statusCode = error.message.includes('Acesso negado') ? 403 : 400;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  static async getSintomasByDoenca(req, res) {
    try {
      const { doencaId } = req.params;
      const sintomas = await DoencaService.getSintomasByDoenca(req.user.id, doencaId);
      res.status(200).json({ success: true, data: sintomas });
    } catch (error) {
      const statusCode = error.message.includes('Acesso negado') ? 403 : 404;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }
}

module.exports = DoencaController;