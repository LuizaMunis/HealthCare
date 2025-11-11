// src/controllers/medicamentoController.js
const MedicamentoService = require('../services/medicamentoService');

class MedicamentoController {
  // --- MÉTODOS CRUD PARA MEDICAMENTO ---
  static async createMedicamento(req, res) {
    try {
      const usuarioId = req.user?.id;
      const medicamentoData = req.body;
      const perfilId = medicamentoData.perfil_id;

      console.log('🔍 [DEBUG Controller] Recebendo requisição de criação de medicamento:', {
        usuarioId,
        tipoUsuarioId: typeof usuarioId,
        perfilId,
        tipoPerfilId: typeof perfilId,
        medicamentoData: JSON.stringify(medicamentoData, null, 2),
        headers: req.headers,
        body: JSON.stringify(req.body, null, 2)
      });

      if (!usuarioId) {
        console.error('❌ [DEBUG Controller] usuarioId não encontrado em req.user');
        return res.status(401).json({ 
          success: false, 
          message: 'Usuário não autenticado.' 
        });
      }

      if (!perfilId) {
        console.error('❌ [DEBUG Controller] perfil_id não encontrado no body');
        return res.status(400).json({ 
          success: false, 
          message: 'perfil_id é obrigatório no corpo da requisição.' 
        });
      }

      // Validar campos obrigatórios
      const { nome_medicamento, frequencia_horas, data_inicio_tratamento } = medicamentoData;
      console.log('🔍 [DEBUG Controller] Validando campos obrigatórios:', {
        nome_medicamento: nome_medicamento || 'VAZIO',
        frequencia_horas: frequencia_horas || 'VAZIO',
        data_inicio_tratamento: data_inicio_tratamento || 'VAZIO'
      });
      
      if (!nome_medicamento || !frequencia_horas || !data_inicio_tratamento) {
        console.error('❌ [DEBUG Controller] Campos obrigatórios faltando');
        return res.status(400).json({ 
          success: false, 
          message: 'Nome do medicamento, frequência (em horas) e data de início são obrigatórios.' 
        });
      }

      console.log('📤 [DEBUG Controller] Chamando MedicamentoService.createMedicamento...');
      const novoMedicamento = await MedicamentoService.createMedicamento(usuarioId, perfilId, medicamentoData);
      console.log('✅ [DEBUG Controller] Medicamento criado com sucesso:', JSON.stringify(novoMedicamento, null, 2));
      res.status(201).json({ success: true, message: 'Medicamento registrado com sucesso!', data: novoMedicamento });
    } catch (error) {
      console.error('❌ [DEBUG Controller] Erro completo ao criar medicamento:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        error: error
      });
      MedicamentoController.handleError(res, error);
    }
  }

  static async getAllMedicamentosByProfile(req, res) {
    try {
      const usuarioId = req.user.id;
      // Pegar perfil_id do query string ou do body
      const perfilId = req.query.perfil_id || req.body.perfil_id;

      if (!perfilId) {
        return res.status(400).json({ 
          success: false, 
          message: 'perfil_id é obrigatório (query string ou body).' 
        });
      }

      const medicamentos = await MedicamentoService.getAllMedicamentosByProfile(usuarioId, perfilId);
      res.status(200).json({ success: true, data: medicamentos });
    } catch (error) {
      MedicamentoController.handleError(res, error);
    }
  }

  static async getMedicamentoById(req, res) {
    try {
      const usuarioId = req.user.id;
      const { medicamentoId } = req.params;
      const perfilId = req.query.perfil_id || req.body.perfil_id;

      if (!perfilId) {
        return res.status(400).json({ 
          success: false, 
          message: 'perfil_id é obrigatório (query string ou body).' 
        });
      }

      const medicamento = await MedicamentoService.getMedicamentoById(usuarioId, perfilId, medicamentoId);
      res.status(200).json({ success: true, data: medicamento });
    } catch (error) {
      MedicamentoController.handleError(res, error);
    }
  }

  static async updateMedicamento(req, res) {
    try {
        const usuarioId = req.user.id;
        const { medicamentoId } = req.params;
        const perfilId = req.body.perfil_id || req.query.perfil_id;
        const updateData = req.body;

        if (!perfilId) {
          return res.status(400).json({ 
            success: false, 
            message: 'perfil_id é obrigatório (query string ou body).' 
          });
        }

        const data = await MedicamentoService.updateMedicamento(usuarioId, perfilId, medicamentoId, updateData);
        res.status(200).json({ success: true, message: 'Medicamento atualizado com sucesso!', data });
    } catch (error) {
        MedicamentoController.handleError(res, error);
    }
  }

  static async deleteMedicamento(req, res) {
    try {
        const usuarioId = req.user.id;
        const { medicamentoId } = req.params;
        const perfilId = req.query.perfil_id || req.body.perfil_id;

        if (!perfilId) {
          return res.status(400).json({ 
            success: false, 
            message: 'perfil_id é obrigatório (query string ou body).' 
          });
        }

        await MedicamentoService.deleteMedicamento(usuarioId, perfilId, medicamentoId);
        res.status(200).json({ success: true, message: 'Medicamento deletado com sucesso!' });
    } catch (error) {
        MedicamentoController.handleError(res, error);
    }
  }

  // --- MÉTODOS PARA REGISTRO DE USO ---
  static async registrarUsoMedicamento(req, res) {
    try {
      const usuarioId = req.user.id;
      const { medicamentoId } = req.params;
      const perfilId = req.body.perfil_id || req.query.perfil_id;
      const usoData = req.body;

      if (!perfilId) {
        return res.status(400).json({ 
          success: false, 
          message: 'perfil_id é obrigatório (query string ou body).' 
        });
      }

      const novoRegistro = await MedicamentoService.registrarUso(usuarioId, perfilId, medicamentoId, usoData);
      res.status(201).json({ success: true, message: 'Uso do medicamento registrado com sucesso!', data: novoRegistro });
    } catch (error) {
      MedicamentoController.handleError(res, error);
    }
  }

  static async getHistoricoDeUso(req, res) {
    try {
      const usuarioId = req.user.id;
      const { medicamentoId } = req.params;
      const perfilId = req.query.perfil_id || req.body.perfil_id;

      if (!perfilId) {
        return res.status(400).json({ 
          success: false, 
          message: 'perfil_id é obrigatório (query string ou body).' 
        });
      }

      const historico = await MedicamentoService.getHistoricoDeUso(usuarioId, perfilId, medicamentoId);
      res.status(200).json({ success: true, data: historico });
    } catch (error) {
      MedicamentoController.handleError(res, error);
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