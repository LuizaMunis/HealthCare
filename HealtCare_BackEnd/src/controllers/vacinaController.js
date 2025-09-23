// backend/src/controllers/vacinaController.js
const VacinaService = require('../services/vacinaService');

class VacinaController {
  /**
   * Cria um novo registro de vacina.
   */
  static async createVacina(req, res) {
    try {
      const novaVacina = await VacinaService.createVacina(req.user.id, req.body);
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
      const vacinas = await VacinaService.getAllVacinasByUsuario(req.user.id);
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
      const { id } = req.params;
      const vacina = await VacinaService.getVacinaById(req.user.id, id);
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
      const { id } = req.params;
      const vacinaAtualizada = await VacinaService.updateVacina(req.user.id, id, req.body);
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
      const { id } = req.params;
      await VacinaService.deleteVacina(req.user.id, id);
      res.status(200).json({ success: true, message: 'Registro de vacina deletado com sucesso!' });
    } catch (error) {
      console.error('Erro ao deletar vacina:', error);
      const statusCode = error.message.includes('não encontrado') ? 404 : 500;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }
}

module.exports = VacinaController;