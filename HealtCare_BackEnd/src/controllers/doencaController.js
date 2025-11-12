// backend/src/controllers/doencaController.js
const DoencaService = require('../services/doencaService');

class DoencaController {
  static async createDoenca(req, res) {
    try {
      const usuarioId = req.user.id;
      const { profileId } = req.params;
      const doencaData = req.body;

      const newDoenca = await DoencaService.createDoenca(usuarioId, profileId, doencaData);

      res.status(201).json({
        success: true,
        message: 'Doença registrada com sucesso!',
        data: newDoenca
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  static async getAllDoencasByProfile(req, res) {
    try {
      const usuarioId = req.user.id;
      const { profileId } = req.params;

      const doencas = await DoencaService.getAllDoencasByProfile(usuarioId, profileId);

      res.json({
        success: true,
        data: doencas
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  static async getDoencaById(req, res) {
    try {
      const usuarioId = req.user.id;
      const { profileId, doencaId } = req.params;

      const doenca = await DoencaService.getDoencaById(usuarioId, profileId, doencaId);

      res.json({
        success: true,
        data: doenca
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  static async updateDoenca(req, res) {
    try {
      const usuarioId = req.user.id;
      const { profileId, doencaId } = req.params;
      const updateData = req.body;

      const updatedDoenca = await DoencaService.updateDoenca(usuarioId, profileId, doencaId, updateData);

      res.json({
        success: true,
        message: 'Doença atualizada com sucesso!',
        data: updatedDoenca
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  static async deleteDoenca(req, res) {
    try {
      const usuarioId = req.user.id;
      const { profileId, doencaId } = req.params;

      await DoencaService.deleteDoenca(usuarioId, profileId, doencaId);

      res.json({
        success: true,
        message: 'Doença deletada com sucesso!'
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  // --- SINTOMA CONTROLLERS ---
  // Note: Sintomas should likely have their own service and model for better separation.
  // For now, they are handled here as requested.

  static async addSintomaToDoenca(req, res) {
    try {
        const usuarioId = req.user.id;
        const { profileId, doencaId } = req.params;
        const sintomaData = req.body;

        const novoSintoma = await DoencaService.addSintoma(usuarioId, profileId, doencaId, sintomaData);
        res.status(201).json({ success: true, message: 'Sintoma adicionado com sucesso!', data: novoSintoma });
    } catch (error) {
        this.handleError(res, error);
    }
  }

  static async getSintomasByDoenca(req, res) {
    try {
        const usuarioId = req.user.id;
        const { profileId, doencaId } = req.params;

        const sintomas = await DoencaService.getSintomasByDoenca(usuarioId, profileId, doencaId);
        res.json({ success: true, data: sintomas });
    } catch (error) {
        this.handleError(res, error);
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