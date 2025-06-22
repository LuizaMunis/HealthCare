// backend/src/controllers/userController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

class UserController {
  /**
   * Registra um novo usuário no sistema.
   * Espera 'nome_completo', 'email' e 'password' no corpo da requisição.
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

      // Verificar se usuário já existe
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email já cadastrado'
        });
      }

      // Criptografar senha (o hash gerado pelo bcrypt é longo e agora suportado pelo VARCHAR(255))
      const senha_hash = await bcrypt.hash(password, 10);

      // Obter a data atual para data_cadastro
      const data_cadastro = new Date().toISOString().slice(0, 10); // Formato YYYY-MM-DD

      // Criar usuário
      const newUser = await UserModel.create({
        nome_completo,
        email,
        senha_hash,
        data_cadastro
      });

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: newUser
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao registrar usuário',
        error: error.message
      });
    }
  }

  /**
   * Realiza o login do usuário.
   * Espera 'email' e 'password' no corpo da requisição.
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validações
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios'
        });
      }

      // Verificar se usuário existe
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }

      // Verificar senha (compara a senha fornecida com a senha_hash armazenada)
      const isPasswordValid = await bcrypt.compare(password, user.senha_hash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Credenciais inválidas'
        });
      }

      // Gerar token JWT
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
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao fazer login',
        error: error.message
      });
    }
  }

  /**
   * Obtém o perfil do usuário autenticado.
   * Requer autenticação (req.user.id deve ser populado por um middleware de autenticação).
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
        data: {
          id: user.id,
          nome_completo: user.nome_completo,
          email: user.email,
          data_cadastro: user.data_cadastro
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao obter perfil',
        error: error.message
      });
    }
  }

  /**
   * Obtém todos os usuários registrados no sistema.
   * Requer autenticação.
   */
  static async getAllUsers(req, res) {
    try {
      const users = await UserModel.getAll();
      
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao obter todos os usuários',
        error: error.message
      });
    }
  }
}

module.exports = UserController;
