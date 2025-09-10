// src/controllers/medicamentoController.js
const MedicamentoService = require('../services/medicamentoService');

class MedicamentoController {
  // --- MÉTODOS CRUD PARA MEDICAMENTO ---
  static async createMedicamento(req, res) {
    try {
      const novoMedicamento = await MedicamentoService.createMedicamento(req.user.id, req.body);
      res.status(201).json({ success: true, message: 'Medicamento registrado!', data: novoMedicamento });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getAllMedicamentos(req, res) {
    try {
      const medicamentos = await MedicamentoService.getAllMedicamentosByUsuario(req.user.id);
      res.status(200).json({ success: true, data: medicamentos });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getMedicamentoById(req, res) {
    try {
      const { id } = req.params;
      const medicamento = await MedicamentoService.getMedicamentoById(req.user.id, id);
      res.status(200).json({ success: true, data: medicamento });
    } catch (error) {
      const statusCode = error.message.includes('não encontrado') ? 404 : 403;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  static async updateMedicamento(req, res) {
    try {
        const { id } = req.params;
        const data = await MedicamentoService.updateMedicamento(req.user.id, id, req.body);
        res.status(200).json({ success: true, message: 'Medicamento atualizado!', data });
    } catch (error) {
        const statusCode = error.message.includes('não encontrado') ? 404 : 400;
        res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  static async deleteMedicamento(req, res) {
    try {
        const { id } = req.params;
        await MedicamentoService.deleteMedicamento(req.user.id, id);
        res.status(200).json({ success: true, message: 'Medicamento deletado!' });
    } catch (error) {
        const statusCode = error.message.includes('não encontrado') ? 404 : 500;
        res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  // --- NOVOS MÉTODOS PARA REGISTRO DE USO ---
  
  static async registrarUsoMedicamento(req, res) {
    try {
      const { medicamentoId } = req.params;
      const novoRegistro = await MedicamentoService.registrarUso(req.user.id, medicamentoId, req.body);
      res.status(201).json({ success: true, message: 'Uso do medicamento registrado!', data: novoRegistro });
    } catch (error) {
      const statusCode = error.message.includes('Acesso negado') ? 403 : 400;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  static async getHistoricoDeUso(req, res) {
    try {
      const { medicamentoId } = req.params;
      const historico = await MedicamentoService.getHistoricoDeUso(req.user.id, medicamentoId);
      res.status(200).json({ success: true, data: historico });
    } catch (error) {
      const statusCode = error.message.includes('Acesso negado') ? 403 : 404;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }
}

module.exports = MedicamentoController;