//  src/controllers/registroConsultaController.js

// S
const ConsultaService = require('../services/registroConsultaService'); 

class ConsultaController {
  /**
   * Cria uma nova consulta associada ao perfil do usuário logado.
   */
  static async createConsulta(req, res) {
    try {
      // O ID do usuário vem do middleware de autenticação (req.user.id)
      const usuarioId = req.user.id;
      const dadosConsulta = req.body;

      const novaConsulta = await ConsultaService.createConsulta(usuarioId, dadosConsulta);
      
      res.status(201).json({ 
        success: true, 
        message: 'Consulta registrada com sucesso!', 
        data: novaConsulta 
      });
    } catch (error) {
      console.error('Erro ao criar consulta:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * Busca todas as consultas associadas ao perfil do usuário logado.
   */
  static async getAllConsultas(req, res) {
    try {
      const usuarioId = req.user.id;
      const consultas = await ConsultaService.getAllConsultasByUsuario(usuarioId);
      
      res.status(200).json({ success: true, data: consultas });
    } catch (error) {
      console.error('Erro ao buscar consultas:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Busca uma consulta específica pelo ID, verificando se pertence ao usuário.
   */
  static async getConsultaById(req, res) {
    try {
      const usuarioId = req.user.id;
      const { id: consultaId } = req.params;

      const consulta = await ConsultaService.getConsultaById(usuarioId, consultaId);

      // O Service deve lançar um erro se a consulta não for encontrada ou não pertencer ao usuário
      res.status(200).json({ success: true, data: consulta });
    } catch (error) {
      console.error('Erro ao buscar consulta por ID:', error);
      // Se o serviço lançar um erro de "não encontrado", pode ser tratado aqui
      const statusCode = error.message.includes('não encontrada') ? 404 : 500;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  /**
   * Atualiza uma consulta existente.
   */
  static async updateConsulta(req, res) {
    try {
      const usuarioId = req.user.id;
      const { id: consultaId } = req.params;
      const dadosUpdate = req.body;

      const consultaAtualizada = await ConsultaService.updateConsulta(usuarioId, consultaId, dadosUpdate);

      res.status(200).json({ 
        success: true, 
        message: 'Consulta atualizada com sucesso!', 
        data: consultaAtualizada 
      });
    } catch (error) {
      console.error('Erro ao atualizar consulta:', error);
      const statusCode = error.message.includes('não encontrada') ? 404 : 400;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  /**
   * Deleta uma consulta.
   */
  static async deleteConsulta(req, res) {
    try {
      const usuarioId = req.user.id;
      const { id: consultaId } = req.params;

      await ConsultaService.deleteConsulta(usuarioId, consultaId);

      res.status(200).json({ success: true, message: 'Consulta deletada com sucesso!' });
    } catch (error) {
      console.error('Erro ao deletar consulta:', error);
      const statusCode = error.message.includes('não encontrada') ? 404 : 500;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }
}

module.exports = ConsultaController;