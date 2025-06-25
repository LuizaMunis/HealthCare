// backend/src/controllers/registroPressaoArterialController.js
const RegistroPressaoArterialModel = require('../models/registroPressaoArterialModel');
// PerfilModel não é mais necessário aqui, pois a relação é direta com usuario_id
// const PerfilModel = require('../models/perfilModel'); // Pode ser removido se a tabela 'perfil' não for mais usada

class RegistroPressaoArterialController {
  // O helper _getPerfilIdFromUserId foi removido, pois agora usamos usuario_id diretamente
  // static async _getPerfilIdFromUserId(usuarioId) { /* ... */ }

  /**
   * Cria um novo registro de pressão arterial para o usuário autenticado.
   * Requer autenticação (req.user.id).
   */
  static async createRegistro(req, res) {
    try {
      const usuario_id = req.user.id; // Obtém o ID do usuário autenticado pelo JWT
      const { sistolica_mmhg, diastolica_mmhg, data_hora_medicao } = req.body;

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
        usuario_id, // Usa o usuario_id diretamente do token JWT
        sistolica_mmhg: sistolica_mmhg || null,
        diastolica_mmhg: diastolica_mmhg || null,
        data_hora_medicao: data_hora_medicao // Espera uma string em formato DATETIME válido
      };

      const newRegistro = await RegistroPressaoArterialModel.create(newRegistroData);

      res.status(201).json({
        success: true,
        message: 'Registo de pressão arterial criado com sucesso!',
        data: newRegistro
      });

    } catch (error) {
      console.error('Erro ao criar registo de pressão arterial:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao criar registo de pressão arterial.',
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
      const usuario_id = req.user.id; // Obtém o ID do utilizador autenticado

      // Agora, a chamada ao Modelo é direta, sem necessidade de PerfilModel
      const registros = await RegistroPressaoArterialModel.findByUsuarioId(usuario_id);

      res.json({
        success: true,
        message: 'Registos de pressão arterial obtidos com sucesso!',
        data: registros
      });

    } catch (error) {
      console.error('Erro ao obter registos de pressão arterial:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao obter registos de pressão arterial.',
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
      const usuario_id = req.user.id; // Obtém o ID do utilizador autenticado
      const { id } = req.params; // ID do registo a ser atualizado
      const updateData = req.body;

      // 1. Verificar se o registo existe e pertence ao utilizador autenticado
      const existingRegistro = await RegistroPressaoArterialModel.findById(id);
      // Verifica se o registo existe E se o usuario_id do registo corresponde ao utilizador autenticado
      if (!existingRegistro || existingRegistro.usuario_id !== usuario_id) {
        return res.status(404).json({
          success: false,
          message: 'Registo de pressão arterial não encontrado ou não pertence a este utilizador.'
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
          message: 'Nenhum dado para atualizar ou registo não encontrado.'
        });
      }

      // Opcional: buscar o registo atualizado para retornar na resposta
      const updatedRegistro = await RegistroPressaoArterialModel.findById(id);

      res.json({
        success: true,
        message: 'Registo de pressão arterial atualizado com sucesso!',
        data: updatedRegistro
      });

    } catch (error) {
      console.error('Erro ao atualizar registo de pressão arterial:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao atualizar registo de pressão arterial.',
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
      const usuario_id = req.user.id; // Obtém o ID do utilizador autenticado
      const { id } = req.params; // ID do registo a ser deletado

      // 1. Verificar se o registo existe e pertence ao utilizador autenticado
      const existingRegistro = await RegistroPressaoArterialModel.findById(id);
      // Verifica se o registo existe E se o usuario_id do registo corresponde ao utilizador autenticado
      if (!existingRegistro || existingRegistro.usuario_id !== usuario_id) {
        return res.status(404).json({
          success: false,
          message: 'Registo de pressão arterial não encontrado ou não pertence a este utilizador.'
        });
      }

      const deleted = await RegistroPressaoArterialModel.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Registo de pressão arterial não encontrado para exclusão.'
        });
      }

      res.json({
        success: true,
        message: 'Registo de pressão arterial deletado com sucesso!'
      });

    } catch (error) {
      console.error('Erro ao deletar registo de pressão arterial:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao deletar registo de pressão arterial.',
        error: error.message
      });
    }
  }
}

module.exports = RegistroPressaoArterialController;
