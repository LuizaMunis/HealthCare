// backend/src/controllers/vacinaController.js
const VacinaService = require('../services/vacinaService');

class VacinaController {
  /**
   * Cria um novo registro de vacina.
   */
  static async createVacina(req, res) {
    try {
      const usuarioId = req.user.id;
      const dadosVacina = req.body;
      const perfilId = dadosVacina.perfil_id;

      if (!perfilId) {
        return res.status(400).json({ 
          success: false, 
          message: 'perfil_id é obrigatório no corpo da requisição.' 
        });
      }

      const novaVacina = await VacinaService.createVacina(usuarioId, perfilId, dadosVacina);
      res.status(201).json({
        success: true,
        message: 'Vacina registrada com sucesso!',
        data: novaVacina
      });
    } catch (error) {
      console.error('Erro ao criar registro de vacina:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Busca todas as vacinas do usuário logado.
   */
  static async getAllVacinas(req, res) {
    try {
      const usuarioId = req.user.id;
      const perfilId = req.query.perfil_id || req.body.perfil_id;

      if (!perfilId) {
        return res.status(400).json({ 
          success: false, 
          message: 'perfil_id é obrigatório (query string ou body).' 
        });
      }

      const vacinas = await VacinaService.getAllVacinasByProfile(usuarioId, perfilId);
      res.status(200).json({ success: true, data: vacinas });
    } catch (error) {
      console.error('Erro ao buscar vacinas:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Busca um registro de vacina por ID.
   */
  static async getVacinaById(req, res) {
    try {
      const usuarioId = req.user.id;
      const { id } = req.params;
      const perfilId = req.query.perfil_id || req.body.perfil_id;

      if (!perfilId) {
        return res.status(400).json({ 
          success: false, 
          message: 'perfil_id é obrigatório (query string ou body).' 
        });
      }

      const vacina = await VacinaService.getVacinaById(usuarioId, perfilId, id);
      res.status(200).json({ success: true, data: vacina });
    } catch (error) {
      console.error('Erro ao buscar vacina por ID:', error);
      const statusCode = error.message.includes('não encontrado') ? 404 : 403;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  /**
   * Atualiza um registro de vacina.
   */
  static async updateVacina(req, res) {
    try {
      const usuarioId = req.user.id;
      const { id } = req.params;
      const perfilId = req.body.perfil_id || req.query.perfil_id;
      const dadosUpdate = req.body;

      if (!perfilId) {
        return res.status(400).json({ 
          success: false, 
          message: 'perfil_id é obrigatório (query string ou body).' 
        });
      }

      const vacinaAtualizada = await VacinaService.updateVacina(usuarioId, perfilId, id, dadosUpdate);
      res.status(200).json({
        success: true,
        message: 'Registro de vacina atualizado com sucesso!',
        data: vacinaAtualizada
      });
    } catch (error) {
      console.error('Erro ao atualizar vacina:', error);
      const statusCode = error.message.includes('não encontrado') ? 404 : 400;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  /**
   * Deleta um registro de vacina.
   */
  static async deleteVacina(req, res) {
    try {
      const usuarioId = req.user.id;
      const { id } = req.params;
      const perfilId = req.query.perfil_id || req.body.perfil_id;

      if (!perfilId) {
        return res.status(400).json({ 
          success: false, 
          message: 'perfil_id é obrigatório (query string ou body).' 
        });
      }

      await VacinaService.deleteVacina(usuarioId, perfilId, id);
      res.status(200).json({ success: true, message: 'Registro de vacina deletado com sucesso!' });
    } catch (error) {
      console.error('Erro ao deletar vacina:', error);
      const statusCode = error.message.includes('não encontrado') ? 404 : 500;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }
}

module.exports = VacinaController;