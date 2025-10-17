// HealthCare_Backend/src/controllers/userController.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // se preferir evitar dependência nativa, troque por 'bcryptjs'
const UserService = require('../services/userService');
const UserModel = require('../models/userModel');

class UserController {
  /**
   * Registra um novo usuário.
   * Espera: { nome_completo, email, password }
   */
  static async register(req, res) {
    try {
      const { nome_completo, email, password } = req.body;

      // Validações básicas
      if (!nome_completo || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Todos os campos (nome_completo, email, password) são obrigatórios'
        });
      }

      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de email inválido.'
        });
      }

      // Verifica duplicidade
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Este email já está em uso.'
        });
      }

      // Cria hash da senha
      const senha_hash = await bcrypt.hash(password, 10);

      // Cria o usuário
      const created = await UserModel.create({
        nome_completo,
        email,
        senha_hash,
      });

      const token = jwt.sign(
        { id: created.id, email: created.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: {
          user: {
            id: created.id,
            nome_completo: created.nome_completo,
            email: created.email,
          },
          token,
        }
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao registrar usuário'
      });
    }
  }

  /**
   * Login do usuário.
   * Espera: { email, password }
   * Retorna: { token, user }
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios'
        });
      }

      const user = await UserModel.findByEmail(email, true); // includePassword = true
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.senha_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }

      if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET não definido nas variáveis de ambiente.');
        return res.status(500).json({
          success: false,
          message: 'Configuração do servidor ausente (JWT_SECRET)'
        });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          token,
          user: {
            id: user.id,
            nome_completo: user.nome_completo,
            email: user.email,
            data_cadastro: user.data_cadastro
          }
        }
      });
    } catch (error) {
      console.error('Erro no login:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao realizar login'
      });
    }
  }

  /**
   * Perfil do usuário autenticado.
   * req.user.id deve ser populado por middleware de autenticação.
   */
  static async getProfile(req, res) {
    try {
      const user = await UserService.getUserProfile(req.user.id);
      return res.json({
        success: true,
        data: {
          id: user.id,
          nome_completo: user.nome_completo,
          email: user.email,
          data_cadastro: user.data_cadastro
        }
      });
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      const statusCode = String(error.message || '').includes('não encontrado') ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message || 'Erro ao obter perfil'
      });
    }
  }

  /**
   * Lista todos os usuários.
   */
  static async getAllUsers(_req, res) {
    try {
      const users = await UserService.getAllUsers();
      return res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Erro ao obter todos os usuários:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao obter todos os usuários'
      });
    }
  }

  /**
   * Atualiza dados do perfil (nome/email).
   */
  static async updateProfile(req, res) {
    try {
      const result = await UserService.updateUserProfile(req.user.id, req.body);
      return res.json({ success: true, message: result.message });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      let statusCode = 500;
      const msg = String(error.message || '');
      if (msg.includes('obrigatórios')) statusCode = 400;
      else if (msg.includes('já está em uso')) statusCode = 409;

      return res.status(statusCode).json({
        success: false,
        message: error.message || 'Erro ao atualizar perfil'
      });
    }
  }

  /**
   * Troca de senha do usuário.
   */
  static async changePassword(req, res) {
    try {
      const result = await UserService.changeUserPassword(req.user.id, req.body);
      return res.json({ success: true, message: result.message });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      let statusCode = 500;
      const msg = String(error.message || '');
      if (msg.includes('obrigatórios')) statusCode = 400;
      else if (msg.includes('incorreta')) statusCode = 401;

      return res.status(statusCode).json({
        success: false,
        message: error.message || 'Erro ao alterar senha'
      });
    }
  }
}

module.exports = UserController;
