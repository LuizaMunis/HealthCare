// backend/src/controllers/sintomaController.js
const SintomaService = require('../services/sintomaService');

class SintomaController {
  static async createSintoma(req, res) {
    try {
      const usuarioId = req.user.id;
      const { doencaId } = req.params;
      const perfilId = req.body.perfil_id || req.query.perfil_id;
      const sintomaData = req.body;

      console.log('📥 [DEBUG] Requisição recebida - createSintoma');
      console.log('📥 [DEBUG] usuarioId:', usuarioId);
      console.log('📥 [DEBUG] doencaId:', doencaId);
      console.log('📥 [DEBUG] perfilId:', perfilId);
      console.log('📥 [DEBUG] sintomaData:', JSON.stringify(sintomaData, null, 2));

      if (!perfilId) {
        return res.status(400).json({ 
          success: false, 
          message: 'perfil_id é obrigatório (query string ou body).' 
        });
      }

      if (!doencaId) {
        return res.status(400).json({ 
          success: false, 
          message: 'doencaId é obrigatório nos parâmetros da URL.' 
        });
      }

      const novoSintoma = await SintomaService.createSintoma(usuarioId, perfilId, doencaId, sintomaData);
      console.log('✅ [DEBUG] Sintoma criado com sucesso:', JSON.stringify(novoSintoma, null, 2));
      res.status(201).json({ 
        success: true, 
        message: 'Sintoma criado com sucesso!', 
        data: novoSintoma 
      });
    } catch (error) {
      console.error('❌ [DEBUG] Erro no controller createSintoma:', error);
      SintomaController.handleError(res, error);
    }
  }

  static async getAllSintomasByProfile(req, res) {
    try {
      const usuarioId = req.user.id;
      const perfilId = req.query.perfil_id || req.body.perfil_id;

      if (!perfilId) {
        return res.status(400).json({ 
          success: false, 
          message: 'perfil_id é obrigatório (query string ou body).' 
        });
      }

      const sintomas = await SintomaService.getAllSintomasByProfile(usuarioId, perfilId);
      res.json({ 
        success: true, 
        data: sintomas 
      });
    } catch (error) {
      SintomaController.handleError(res, error);
    }
  }

  static async getSintomaById(req, res) {
    try {
      const usuarioId = req.user.id;
      const { sintomaId } = req.params;
      const perfilId = req.query.perfil_id || req.body.perfil_id;

      if (!perfilId) {
        return res.status(400).json({ 
          success: false, 
          message: 'perfil_id é obrigatório (query string ou body).' 
        });
      }

      const sintoma = await SintomaService.getSintomaById(usuarioId, perfilId, sintomaId);
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
      SintomaController.handleError(res, error);
    }
  }

  static async updateSintoma(req, res) {
    try {
      const usuarioId = req.user.id;
      const { sintomaId } = req.params;
      const perfilId = req.body.perfil_id || req.query.perfil_id;
      const updateData = req.body;

      if (!perfilId) {
        return res.status(400).json({ 
          success: false, 
          message: 'perfil_id é obrigatório (query string ou body).' 
        });
      }

      const sintomaAtualizado = await SintomaService.updateSintoma(usuarioId, perfilId, sintomaId, updateData);
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
      SintomaController.handleError(res, error);
    }
  }

  static async deleteSintoma(req, res) {
    try {
      const usuarioId = req.user.id;
      const { sintomaId } = req.params;
      const perfilId = req.query.perfil_id || req.body.perfil_id;

      if (!perfilId) {
        return res.status(400).json({ 
          success: false, 
          message: 'perfil_id é obrigatório (query string ou body).' 
        });
      }

      const deletado = await SintomaService.deleteSintoma(usuarioId, perfilId, sintomaId);
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
      SintomaController.handleError(res, error);
    }
  }

  static async getAllSintomasByDoenca(req, res) {
    try {
      const usuarioId = req.user.id;
      const { doencaId } = req.params;
      const perfilId = req.query.perfil_id || req.body.perfil_id;

      if (!perfilId) {
        return res.status(400).json({ 
          success: false, 
          message: 'perfil_id é obrigatório (query string ou body).' 
        });
      }

      const sintomas = await SintomaService.getAllSintomasByDoenca(usuarioId, perfilId, doencaId);
      res.json({ 
        success: true, 
        data: sintomas 
      });
    } catch (error) {
      SintomaController.handleError(res, error);
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
