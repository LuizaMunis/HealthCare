// backend/src/controllers/sintomaController.js
const SintomaService = require('../services/sintomaService');

class SintomaController {
  static async createSintoma(req, res) {
    try {
      const usuarioId = req.user.id;
      const { profileId, doencaId } = req.params;
      const sintomaData = req.body;

      const novoSintoma = await SintomaService.createSintoma(usuarioId, profileId, doencaId, sintomaData);
      res.status(201).json({ 
        success: true, 
        message: 'Sintoma criado com sucesso!', 
        data: novoSintoma 
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  static async getAllSintomasByProfile(req, res) {
    try {
      const usuarioId = req.user.id;
      const { profileId } = req.params;

      const sintomas = await SintomaService.getAllSintomasByProfile(usuarioId, profileId);
      res.json({ 
        success: true, 
        data: sintomas 
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  static async getSintomaById(req, res) {
    try {
      const usuarioId = req.user.id;
      const { profileId, sintomaId } = req.params;

      const sintoma = await SintomaService.getSintomaById(usuarioId, profileId, sintomaId);
      if (!sintoma) {
        return res.status(404).json({ 
          success: false, 
          message: 'Sintoma não encontrado' 
        });
      }

      res.json({ 
        success: true, 
        data: sintoma 
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  static async updateSintoma(req, res) {
    try {
      const usuarioId = req.user.id;
      const { profileId, sintomaId } = req.params;
      const updateData = req.body;

      const sintomaAtualizado = await SintomaService.updateSintoma(usuarioId, profileId, sintomaId, updateData);
      if (!sintomaAtualizado) {
        return res.status(404).json({ 
          success: false, 
          message: 'Sintoma não encontrado' 
        });
      }

      res.json({ 
        success: true, 
        message: 'Sintoma atualizado com sucesso!', 
        data: sintomaAtualizado 
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  static async deleteSintoma(req, res) {
    try {
      const usuarioId = req.user.id;
      const { profileId, sintomaId } = req.params;

      const deletado = await SintomaService.deleteSintoma(usuarioId, profileId, sintomaId);
      if (!deletado) {
        return res.status(404).json({ 
          success: false, 
          message: 'Sintoma não encontrado' 
        });
      }

      res.json({ 
        success: true, 
        message: 'Sintoma excluído com sucesso!' 
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  static async getAllSintomasByDoenca(req, res) {
    try {
      const usuarioId = req.user.id;
      const { profileId, doencaId } = req.params;

      const sintomas = await SintomaService.getAllSintomasByDoenca(usuarioId, profileId, doencaId);
      res.json({ 
        success: true, 
        data: sintomas 
      });
    } catch (error) {
      this.handleError(res, error);
    }
  }

  static handleError(res, error) {
    console.error('Erro no SintomaController:', error);
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        success: false,
        message: 'Doença não encontrada'
      });
    }

    if (error.code === 'ER_DATA_TOO_LONG') {
      return res.status(400).json({
        success: false,
        message: 'Dados muito longos para os campos do banco'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = SintomaController;
