// HealthCare_Backend/src/controllers/userController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

class UserController {

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
  
  static async updateProfile(req, res) {
    try {
      const { nome_completo, email } = req.body;
      if (!nome_completo || !email) {
        return res.status(400).json({ success: false, message: 'Nome e email são obrigatórios.' });
      }
      await UserModel.update(req.user.id, { nome_completo, email });
      res.json({ success: true, message: 'Perfil atualizado com sucesso!' });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, message: 'Este email já está em uso.' });
      }
      res.status(500).json({ success: false, message: 'Erro ao atualizar perfil.' });
    }
  }

  static async changePassword(req, res) {
    try {
      const { senha_atual, nova_senha } = req.body;
      if (!senha_atual || !nova_senha) {
        return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
      }

      const user = await UserModel.findById(req.user.id, true); // Busca usuário com a senha
      const isPasswordValid = await bcrypt.compare(senha_atual, user.senha_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: 'A senha atual está incorreta.' });
      }

      const nova_senha_hash = await bcrypt.hash(nova_senha, 10);
      await UserModel.updatePassword(req.user.id, nova_senha_hash);
      res.json({ success: true, message: 'Senha alterada com sucesso!' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Erro ao alterar senha.' });
    }
  }
}

module.exports = UserController;