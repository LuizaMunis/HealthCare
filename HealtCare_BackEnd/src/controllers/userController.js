// backend/src/controllers/userController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

class UserController {
  /**
   * Registra um novo usuário no sistema.
   */
  static async register(req, res) {
    try {
      const { nome_completo, email, password } = req.body;

      // Validações
      if (!nome_completo || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Todos os campos (nome_completo, email, password) são obrigatórios'
        });
      }

      // Validação de formato de email (opcional, mas recomendado)
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(email)) {
          return res.status(400).json({ 
              success: false, 
              message: 'Formato de email inválido.' 
          });
      }

      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ 
          success: false,
          message: 'Este email já está em uso.'
        });
      }

      const senha_hash = await bcrypt.hash(password, 10);
      
      const newUser = await UserModel.create({
        nome_completo,
        email,
        senha_hash,
      });

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: newUser
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao registrar usuário',
        error: error.message
      });
    }
  }

  /**
   * Realiza o login do usuário.
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

      const user = await UserModel.findByEmail(email);
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

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          user: {
            id: user.id,
            nome_completo: user.nome_completo,
            email: user.email
          },
          token
        }
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao fazer login',
        error: error.message
      });
    }
  }

  /**
   * Obtém o perfil do usuário autenticado.
   */
  static async getProfile(req, res) {
    try {
      const user = await UserModel.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao obter perfil',
        error: error.message
      });
    }
  }

  /**
   * Obtém todos os usuários registrados.
   */
  static async getAllUsers(req, res) {
    try {
      const users = await UserModel.getAll();
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Erro ao obter todos os usuários:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao obter todos os usuários',
        error: error.message
      });
    }
  }
}

module.exports = UserController;