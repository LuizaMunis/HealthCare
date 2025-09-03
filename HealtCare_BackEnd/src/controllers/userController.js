// HealthCare_Backend/src/controllers/userController.js

const UserService = require('../services/userService');

class UserController {

  static async register(req, res) {
    try {
      const result = await UserService.registerUser(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      
      // Mapear erros específicos para códigos de status apropriados
      let statusCode = 500;
      if (error.message.includes('obrigatórios')) {
        statusCode = 400;
      } else if (error.message.includes('email já está em uso')) {
        statusCode = 409;
      } else if (error.message.includes('JWT_SECRET')) {
        statusCode = 500;
      }
      
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  static async login(req, res) {
    try {
      const result = await UserService.authenticateUser(req.body);
      
      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: result
      });
    } catch (error) {
      console.error('Erro no login:', error);
      
      // Mapear erros específicos para códigos de status apropriados
      let statusCode = 500;
      if (error.message.includes('obrigatórios')) {
        statusCode = 400;
      } else if (error.message.includes('Credenciais inválidas')) {
        statusCode = 401;
      } else if (error.message.includes('JWT_SECRET')) {
        statusCode = 500;
      }
      
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getProfile(req, res) {
    try {
      const user = await UserService.getUserProfile(req.user.id);
      
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      
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

  static async getAllUsers(req, res) {
    try {
      const users = await UserService.getAllUsers();
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Erro ao obter todos os usuários:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
  
  static async updateProfile(req, res) {
    try {
      const result = await UserService.updateUserProfile(req.user.id, req.body);
      res.json({ success: true, message: result.message });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      
      let statusCode = 500;
      if (error.message.includes('obrigatórios')) {
        statusCode = 400;
      } else if (error.message.includes('já está em uso')) {
        statusCode = 409;
      }
      
      res.status(statusCode).json({ 
        success: false, 
        message: error.message 
      });
    }
  }

  static async changePassword(req, res) {
    try {
      const result = await UserService.changeUserPassword(req.user.id, req.body);
      res.json({ success: true, message: result.message });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      
      let statusCode = 500;
      if (error.message.includes('obrigatórios')) {
        statusCode = 400;
      } else if (error.message.includes('incorreta')) {
        statusCode = 401;
      }
      
      res.status(statusCode).json({ 
        success: false, 
        message: error.message 
      });
    }
  }
}

module.exports = UserController;