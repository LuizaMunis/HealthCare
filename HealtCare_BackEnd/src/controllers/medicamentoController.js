// src/controllers/medicamentoController.js
const MedicamentoService = require('../services/medicamentoService');

class MedicamentoController {
  // --- MÉTODOS CRUD PARA MEDICAMENTO ---
  static async createMedicamento(req, res) {
    try {
      const usuarioId = req.user.id;
      const { profileId } = req.params;
      const medicamentoData = req.body;

      const novoMedicamento = await MedicamentoService.createMedicamento(usuarioId, profileId, medicamentoData);
      res.status(201).json({ success: true, message: 'Medicamento registrado com sucesso!', data: novoMedicamento });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  static async getAllMedicamentosByProfile(req, res) {
    try {
      const usuarioId = req.user.id;
      const { profileId } = req.params;

      const medicamentos = await MedicamentoService.getAllMedicamentosByProfile(usuarioId, profileId);
      res.status(200).json({ success: true, data: medicamentos });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  static async getMedicamentoById(req, res) {
    try {
      const usuarioId = req.user.id;
      const { profileId, medicamentoId } = req.params;

      const medicamento = await MedicamentoService.getMedicamentoById(usuarioId, profileId, medicamentoId);
      res.status(200).json({ success: true, data: medicamento });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  static async updateMedicamento(req, res) {
    try {
        const usuarioId = req.user.id;
        const { profileId, medicamentoId } = req.params;
        const updateData = req.body;

        const data = await MedicamentoService.updateMedicamento(usuarioId, profileId, medicamentoId, updateData);
        res.status(200).json({ success: true, message: 'Medicamento atualizado com sucesso!', data });
    } catch (error) {
        this.handleError(res, error);
    }
  }

  static async deleteMedicamento(req, res) {
    try {
        const usuarioId = req.user.id;
        const { profileId, medicamentoId } = req.params;

        await MedicamentoService.deleteMedicamento(usuarioId, profileId, medicamentoId);
        res.status(200).json({ success: true, message: 'Medicamento deletado com sucesso!' });
    } catch (error) {
        this.handleError(res, error);
    }
  }

  // --- MÉTODOS PARA REGISTRO DE USO ---
  static async registrarUsoMedicamento(req, res) {
    try {
      const usuarioId = req.user.id;
      const { profileId, medicamentoId } = req.params;
      const usoData = req.body;

      const novoRegistro = await MedicamentoService.registrarUso(usuarioId, profileId, medicamentoId, usoData);
      res.status(201).json({ success: true, message: 'Uso do medicamento registrado com sucesso!', data: novoRegistro });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  static async getHistoricoDeUso(req, res) {
    try {
      const usuarioId = req.user.id;
      const { profileId, medicamentoId } = req.params;

      const historico = await MedicamentoService.getHistoricoDeUso(usuarioId, profileId, medicamentoId);
      res.status(200).json({ success: true, data: historico });
    } catch (error) {
      this.handleError(res, error);
    }
  }
  
  static handleError(res, error) {
    let statusCode = 500;
    const errorMessage = error.message || 'Ocorreu um erro interno no servidor.';

    if (errorMessage.includes('obrigatório') || errorMessage.includes('inválido')) {
        statusCode = 400;
    } else if (errorMessage.includes('não encontrado')) {
        statusCode = 404;
    } else if (errorMessage.includes('não pertence') || errorMessage.includes('não autorizado') || errorMessage.includes('Acesso negado')) {
        statusCode = 403;
    }

    res.status(statusCode).json({ success: false, message: errorMessage });
  }
}

module.exports = MedicamentoController;