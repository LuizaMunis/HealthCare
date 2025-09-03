const PerfilService = require('../services/perfilService');

class PerfilController {
  static async getProfile(req, res) {
    try {
      const perfil = await PerfilService.getPerfil(req.user.id);
      res.json({ success: true, data: perfil });
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async saveProfile(req, res) {
    try {
      const dadosAdicionais = req.body;
      
      // Processar dados antes de enviar para o serviço
      if (dadosAdicionais.cpf) {
        dadosAdicionais.cpf = dadosAdicionais.cpf.replace(/\D/g, '');
      }
      
      if (dadosAdicionais.celular) {
        dadosAdicionais.celular = dadosAdicionais.celular.replace(/\D/g, '');
      }
      
      if (dadosAdicionais.genero) {
        dadosAdicionais.genero = dadosAdicionais.genero.toUpperCase();
      }
      
      const savedProfile = await PerfilService.savePerfil(req.user.id, dadosAdicionais);
      res.status(200).json({ success: true, message: 'Perfil salvo com sucesso!', data: savedProfile });
    } catch (error) {
      console.error('Erro no saveProfile:', error);
      
      let statusCode = 500;
      let errorMessage = error.message;
      
      // Tratar erros específicos
      if (error.message.includes('obrigatório')) {
        statusCode = 400;
      } else if (error.message.includes('CPF já está em uso')) {
        statusCode = 409; // Conflict
        errorMessage = 'Este CPF já está em uso por outro usuário.';
      } else if (error.message.includes('Peso deve estar entre') || error.message.includes('Altura deve estar entre')) {
        statusCode = 400;
      }
      
      res.status(statusCode).json({ success: false, message: errorMessage });
    }
  }
}

module.exports = PerfilController;
