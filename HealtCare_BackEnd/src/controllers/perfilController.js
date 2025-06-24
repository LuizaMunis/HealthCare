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
      if (req.body.cpf && !/^\d{11}$/.test(req.body.cpf.replace(/\D/g, ''))) {
        return res.status(400).json({ success: false, message: 'Formato de CPF inválido.' });
      }
      const savedProfile = await PerfilModel.createOrUpdate(req.user.id, req.body);
      res.status(200).json({ success: true, message: 'Perfil salvo com sucesso!', data: savedProfile });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = PerfilController;
