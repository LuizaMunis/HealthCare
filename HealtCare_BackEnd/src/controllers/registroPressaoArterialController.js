// backend/src/controllers/registroPressaoArterialController.js
const RegistroPressaoArterialModel = require('../models/registroPressaoArterialModel');
const PerfilModel = require('../models/perfilModel'); // Precisamos do PerfilModel para obter o perfil_id

class RegistroPressaoArterialController {
  /**
   * Helper privado para obter o perfil_id do usuário autenticado.
   * @param {number} usuarioId - ID do usuário autenticado.
   * @returns {number|null} O perfil_id se encontrado, ou null.
   */
  static async _getPerfilIdFromUserId(usuarioId) {
    const perfil = await PerfilModel.findByUsuarioId(usuarioId);
    return perfil ? perfil.id : null;
  }

  /**
   * Cria um novo registro de pressão arterial para o perfil do usuário autenticado.
   * Requer autenticação (req.user.id).
   */
  static async createRegistro(req, res) {
    try {
      const usuario_id = req.user.id; // ID do usuário autenticado pelo JWT
      const { sistolica_mmhg, diastolica_mmhg, data_hora_medicao } = req.body;

      // 1. Obter o perfil_id do usuário autenticado
      const perfil_id = await RegistroPressaoArterialController._getPerfilIdFromUserId(usuario_id);
      if (!perfil_id) {
        return res.status(404).json({
          success: false,
          message: 'Perfil não encontrado para o usuário autenticado. Crie um perfil primeiro.'
        });
      }

      // Validação básica dos dados
      if (!data_hora_medicao) {
        return res.status(400).json({
          success: false,
          message: 'A data e hora da medição (data_hora_medicao) são obrigatórias.'
        });
      }
      if (sistolica_mmhg && (typeof sistolica_mmhg !== 'number' || sistolica_mmhg <= 0)) {
        return res.status(400).json({ success: false, message: 'Pressão sistólica inválida.' });
      }
      if (diastolica_mmhg && (typeof diastolica_mmhg !== 'number' || diastolica_mmhg <= 0)) {
        return res.status(400).json({ success: false, message: 'Pressão diastólica inválida.' });
      }
      if (sistolica_mmhg && diastolica_mmhg && sistolica_mmhg < diastolica_mmhg) {
        return res.status(400).json({ success: false, message: 'Pressão sistólica não pode ser menor que a diastólica.' });
      }

      const newRegistroData = {
        perfil_id,
        sistolica_mmhg: sistolica_mmhg || null,
        diastolica_mmhg: diastolica_mmhg || null,
        data_hora_medicao: data_hora_medicao // Deveria ser um string em formato de DATETIME válido
      };

      const newRegistro = await RegistroPressaoArterialService.createRegistro(registroData);

      res.status(201).json({
        success: true,
        message: 'Registo de pressão arterial criado com sucesso!',
        data: newRegistro
      });

    } catch (error) {
      console.error('Erro ao criar registro de pressão arterial:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao criar registro de pressão arterial.',
        error: error.message
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

      // 1. Obter o perfil_id do usuário autenticado
      const perfil_id = await RegistroPressaoArterialController._getPerfilIdFromUserId(usuario_id);
      if (!perfil_id) {
        return res.status(404).json({
          success: false,
          message: 'Perfil não encontrado para o usuário autenticado.'
        });
      }

      const registros = await RegistroPressaoArterialModel.findByPerfilId(perfil_id);

      res.json({
        success: true,
        message: 'Registos de pressão arterial obtidos com sucesso!',
        data: registros
      });

    } catch (error) {
      console.error('Erro ao obter registos de pressão arterial:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao obter registros de pressão arterial.',
        error: error.message
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
      const { id } = req.params; // ID do registro a ser atualizado
      const updateData = req.body;

      // 1. Obter o perfil_id do usuário autenticado
      const perfil_id = await RegistroPressaoArterialController._getPerfilIdFromUserId(usuario_id);
      if (!perfil_id) {
        return res.status(404).json({
          success: false,
          message: 'Perfil não encontrado para o usuário autenticado.'
        });
      }

      // 2. Verificar se o registro existe e pertence ao perfil do usuário autenticado
      const existingRegistro = await RegistroPressaoArterialModel.findById(id);
      if (!existingRegistro || existingRegistro.perfil_id !== perfil_id) {
        return res.status(404).json({
          success: false,
          message: 'Registro de pressão arterial não encontrado ou não pertence a este perfil.'
        });
      }

      // Validações adicionais para updateData
      if (updateData.sistolica_mmhg && (typeof updateData.sistolica_mmhg !== 'number' || updateData.sistolica_mmhg <= 0)) {
        return res.status(400).json({ success: false, message: 'Pressão sistólica inválida.' });
      }
      if (updateData.diastolica_mmhg && (typeof updateData.diastolica_mmhg !== 'number' || updateData.diastolica_mmhg <= 0)) {
        return res.status(400).json({ success: false, message: 'Pressão diastólica inválida.' });
      }
      if (updateData.sistolica_mmhg && updateData.diastolica_mmhg && updateData.sistolica_mmhg < updateData.diastolica_mmhg) {
        return res.status(400).json({ success: false, message: 'Pressão sistólica não pode ser menor que a diastólica.' });
      }


      const updated = await RegistroPressaoArterialModel.update(id, updateData);

      if (!updated) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum dado para atualizar ou registro não encontrado.'
        });
      }

      const updatedRegistro = await RegistroPressaoArterialModel.findById(id);

      res.json({
        success: true,
        message: 'Registo de pressão arterial atualizado com sucesso!',
        data: updatedRegistro
      });

    } catch (error) {
      console.error('Erro ao atualizar registro de pressão arterial:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao atualizar registro de pressão arterial.',
        error: error.message
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
      const { id } = req.params; // ID do registro a ser deletado

      // 1. Obter o perfil_id do usuário autenticado
      const perfil_id = await RegistroPressaoArterialController._getPerfilIdFromUserId(usuario_id);
      if (!perfil_id) {
        return res.status(404).json({
          success: false,
          message: 'Perfil não encontrado para o usuário autenticado.'
        });
      }

      // 2. Verificar se o registro existe e pertence ao perfil do usuário autenticado
      const existingRegistro = await RegistroPressaoArterialModel.findById(id);
      if (!existingRegistro || existingRegistro.perfil_id !== perfil_id) {
        return res.status(404).json({
          success: false,
          message: 'Registro de pressão arterial não encontrado ou não pertence a este perfil.'
        });
      }

      const deleted = await RegistroPressaoArterialModel.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Registro de pressão arterial não encontrado para exclusão.'
        });
      }

      res.json({
        success: true,
        message: 'Registo de pressão arterial deletado com sucesso!'
      });

    } catch (error) {
      console.error('Erro ao deletar registro de pressão arterial:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao deletar registro de pressão arterial.',
        error: error.message
      });
    }
  }
}

module.exports = RegistroPressaoArterialController;