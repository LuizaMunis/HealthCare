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
      
      // Validações específicas do controller (validações de formato)
      if (dadosAdicionais.cpf) {
        const cpfLimpo = dadosAdicionais.cpf.replace(/\D/g, '');
        if (cpfLimpo.length !== 11) {
          return res.status(400).json({ success: false, message: 'CPF deve ter 11 dígitos.' });
        }
        dadosAdicionais.cpf = cpfLimpo;
      }
      
      if (dadosAdicionais.celular) {
        const celularLimpo = dadosAdicionais.celular.replace(/\D/g, '');
        if (celularLimpo.length < 10 || celularLimpo.length > 11) {
          return res.status(400).json({ success: false, message: 'Celular deve ter 10 ou 11 dígitos.' });
        }
        dadosAdicionais.celular = celularLimpo;
      }
      
      if (dadosAdicionais.genero) {
        dadosAdicionais.genero = dadosAdicionais.genero.toUpperCase();
      }
      
      const savedProfile = await PerfilService.savePerfil(req.user.id, dadosAdicionais);
      res.status(200).json({ success: true, message: 'Perfil salvo com sucesso!', data: savedProfile });
    } catch (error) {
      console.error('Erro no saveProfile:', error);
      
      let statusCode = 500;
      if (error.message.includes('obrigatório')) {
        statusCode = 400;
      }
      
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }
}

module.exports = PerfilController;
