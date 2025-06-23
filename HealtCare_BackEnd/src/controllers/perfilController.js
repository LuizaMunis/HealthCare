const PerfilModel = require('../models/perfilModel');

class PerfilController {
  static async getProfile(req, res) {
    try {
      const usuario_id = req.user.id;
      const perfil = await PerfilModel.findByUserId(usuario_id);

      // Se não houver perfil, retorna sucesso mas com dados nulos.
      if (!perfil) {
        return res.json({
          success: true,
          message: 'Perfil ainda não preenchido.',
          data: null
        });
      }
      res.json({ success: true, data: perfil });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message || 'Erro ao obter perfil.' });
    }
  }

  static async saveProfile(req, res) {
    try {
      const usuario_id = req.user.id;
      const profileData = req.body;

      // Validações antes de enviar para o modelo
      if (profileData.cpf && !/^\d{11}$/.test(profileData.cpf.replace(/\D/g,''))) {
        return res.status(400).json({ success: false, message: 'Formato de CPF inválido.' });
      }

      const savedProfile = await PerfilModel.createOrUpdate(usuario_id, profileData);
      
      res.status(200).json({
        success: true,
        message: 'Perfil salvo com sucesso!',
        data: savedProfile
      });
    } catch (error) {
      // Retorna o erro específico do modelo (ex: CPF duplicado)
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao salvar o perfil.',
      });
    }
  }
}

module.exports = PerfilController;
