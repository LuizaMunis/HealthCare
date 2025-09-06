// backend/src/controllers/registroPressaoArterialController.js
const RegistroPressaoArterialService = require('../services/registroPressaoArterialService');

class RegistroPressaoArterialController {
  /**
   * Cria um novo registro de pressão arterial para o usuário autenticado.
   * Requer autenticação (req.user.id).
   */
  static async createRegistro(req, res) {
    try {
      const usuario_id = req.user ? req.user.id : undefined;
      
      if (!usuario_id) {
        return res.status(401).json({ 
          success: false, 
          message: 'Não autorizado: ID do usuário não encontrado.' 
        });
      }

      const registroData = {
        usuario_id,
        ...req.body
      };

      const newRegistro = await RegistroPressaoArterialService.createRegistro(registroData);

      res.status(201).json({
        success: true,
        message: 'Registro de pressão arterial criado com sucesso!',
        data: newRegistro
      });

    } catch (error) {
      console.error('Erro ao criar registro de pressão arterial:', error);
      
      let statusCode = 500;
      if (error.message.includes('obrigatório')) {
        statusCode = 400;
      } else if (error.message.includes('inválida')) {
        statusCode = 400;
      }
      
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtém todos os registos de pressão arterial para o utilizador autenticado.
   * Requer autenticação (req.user.id).
   */
  static async getRegistros(req, res) {
    try {
      const usuario_id = req.user.id;
      const registros = await RegistroPressaoArterialService.getRegistrosByUsuario(usuario_id);

      res.json({
        success: true,
        message: 'Registros de pressão arterial obtidos com sucesso!',
        data: registros
      });

    } catch (error) {
      console.error('Erro ao obter registros de pressão arterial:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Atualiza um registo de pressão arterial específico para o utilizador autenticado.
   * Requer autenticação (req.user.id) e o ID do registo nos parâmetros da URL.
   */
  static async updateRegistro(req, res) {
    try {
      const usuario_id = req.user.id;
      const { id } = req.params;
      const updateData = req.body;

      const updatedRegistro = await RegistroPressaoArterialService.updateRegistro(id, usuario_id, updateData);

      res.json({
        success: true,
        message: 'Registro de pressão arterial atualizado com sucesso!',
        data: updatedRegistro
      });

    } catch (error) {
      console.error('Erro ao atualizar registro de pressão arterial:', error);
      
      let statusCode = 500;
      if (error.message.includes('não encontrado')) {
        statusCode = 404;
      } else if (error.message.includes('inválida')) {
        statusCode = 400;
      }
      
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Deleta um registo de pressão arterial específico para o utilizador autenticado.
   * Requer autenticação (req.user.id) e o ID do registo nos parâmetros da URL.
   */
  static async deleteRegistro(req, res) {
    try {
      const usuario_id = req.user.id;
      const { id } = req.params;

      await RegistroPressaoArterialService.deleteRegistro(id, usuario_id);

      res.json({
        success: true,
        message: 'Registro de pressão arterial deletado com sucesso!'
      });

    } catch (error) {
      console.error('Erro ao deletar registro de pressão arterial:', error);
      
      let statusCode = 500;
      if (error.message.includes('não encontrado')) {
        statusCode = 404;
      }
      
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = RegistroPressaoArterialController;