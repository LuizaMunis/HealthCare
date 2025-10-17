// HealthCare_Backend/src/controllers/perfilController.js

const PerfilService = require('../services/perfilService');

class PerfilController {
  
  static async createProfile(req, res) {
    try {
      const usuario_id = req.user.id;
      const profileData = req.body;

      const newProfile = await PerfilService.createPerfil(usuario_id, profileData);
      
      res.status(201).json({ 
        success: true, 
        message: 'Perfil criado com sucesso!', 
        data: newProfile 
      });
    } catch (error) {
      console.error('❌ Erro ao criar perfil:', error);
      this.handleError(res, error);
    }
  }

 
  static async updateProfile(req, res) {
    try {
      const { profileId } = req.params; 
      const updateData = req.body;
      const userId = req.user.id; 

      const updatedProfile = await PerfilService.updatePerfil(userId, profileId, updateData);

      res.status(200).json({ 
        success: true, 
        message: 'Perfil atualizado com sucesso!', 
        data: updatedProfile 
      });
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      this.handleError(res, error);
    }
  }

  static async getProfileById(req, res) {
    try {
      const { profileId } = req.params;
      const userId = req.user.id;

      const perfil = await PerfilService.getPerfilById(userId, profileId);
      res.json({ success: true, data: perfil });
    } catch (error) {
      console.error('❌ Erro ao obter perfil por ID:', error);
      this.handleError(res, error);
    }
  }

 
  static async getAllUserProfiles(req, res) {
    try {
      const perfis = await PerfilService.getAllPerfisByUserId(req.user.id);
      res.json({ success: true, data: perfis });
    } catch (error) {
      console.error('❌ Erro ao obter todos os perfis do usuário:', error);
      this.handleError(res, error);
    }
  }

  static async deleteProfile(req, res) {
    try {
      const { profileId } = req.params;
      const userId = req.user.id;
      
      await PerfilService.deletePerfil(userId, profileId);

      res.status(200).json({ success: true, message: 'Perfil deletado com sucesso.' });
    } catch (error) {
      console.error('❌ Erro ao deletar perfil:', error);
      this.handleError(res, error);
    }
  }

  static handleError(res, error) {
    let statusCode = 500;
    const errorMessage = error.message || 'Ocorreu um erro interno no servidor.';

    if (errorMessage.includes('obrigatório') || errorMessage.includes('inválido')) {
      statusCode = 400; 
    } else if (errorMessage.includes('não encontrado')) {
      statusCode = 404; 
    } else if (errorMessage.includes('já está em uso')) {
      statusCode = 409; 
    } else if (errorMessage.includes('não autorizado')) {
        statusCode = 403; 
    }
    
    res.status(statusCode).json({ success: false, message: errorMessage });
  }
}

module.exports = PerfilController;