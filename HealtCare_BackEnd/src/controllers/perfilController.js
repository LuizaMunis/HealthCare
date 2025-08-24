const PerfilModel = require('../models/perfilModel');

class PerfilController {
  static async getProfile(req, res) {
    try {
      const perfil = await PerfilModel.findByUserId(req.user.id);
      res.json({ success: true, data: perfil });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao obter dados do perfil.' });
    }
  }

  static async saveProfile(req, res) {
    try {
      console.log('Dados recebidos no saveProfile:', req.body);
      console.log('Gênero recebido:', req.body.genero, 'Tipo:', typeof req.body.genero);
      
      // Validar CPF se fornecido
      if (req.body.cpf) {
        const cpfLimpo = req.body.cpf.replace(/\D/g, '');
        if (cpfLimpo.length !== 11) {
          return res.status(400).json({ success: false, message: 'CPF deve ter 11 dígitos.' });
        }
        req.body.cpf = cpfLimpo; // Usar CPF limpo
      }
      
      // Validar celular se fornecido
      if (req.body.celular) {
        const celularLimpo = req.body.celular.replace(/\D/g, '');
        if (celularLimpo.length < 10 || celularLimpo.length > 11) {
          return res.status(400).json({ success: false, message: 'Celular deve ter 10 ou 11 dígitos.' });
        }
        req.body.celular = celularLimpo; // Usar celular limpo
      }
      
      // Validar gênero se fornecido
      if (req.body.genero) {
        console.log('Gênero antes do processamento:', req.body.genero);
        req.body.genero = req.body.genero.toUpperCase();
        console.log('Gênero após processamento:', req.body.genero);
      }
      
      const savedProfile = await PerfilModel.createOrUpdate(req.user.id, req.body);
      console.log('Perfil salvo:', savedProfile);
      res.status(200).json({ success: true, message: 'Perfil salvo com sucesso!', data: savedProfile });
    } catch (error) {
      console.error('Erro no saveProfile:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = PerfilController;
