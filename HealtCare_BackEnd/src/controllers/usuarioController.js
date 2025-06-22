// backend/src/controllers/usuarioController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UsuarioModel = require('../models/usuarioModel');

class UsuarioController {
  /**
   * Registra um novo usuário.
   */
  static async register(req, res) {
    try {
      const { nome_completo, email, senha } = req.body;

      // 1. Validação dos campos
      if (!nome_completo || !email || !senha) {
        return res.status(400).json({
          success: false,
          message: 'Todos os campos são obrigatórios.',
        });
      }

      // 2. Verificar se o usuário já existe
      const existingUser = await UsuarioModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ // 409 Conflict é mais apropriado aqui
          success: false,
          message: 'Este email já está em uso.',
        });
      }

      // 3. Criptografar a senha
      const salt = await bcrypt.genSalt(10);
      const senha_hash = await bcrypt.hash(senha, salt);

      // 4. Criar o usuário no banco de dados
      const novoUsuario = await UsuarioModel.create({
        nome_completo,
        email,
        senha_hash,
      });

      // 5. Responder com sucesso
      res.status(201).json({ // 201 Created
        success: true,
        message: 'Usuário cadastrado com sucesso!',
        data: novoUsuario,
      });

    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({
        success: false,
        message: 'Ocorreu um erro no servidor. Tente novamente mais tarde.',
        error: error.message,
      });
    }
  }

  // Você pode adicionar as outras funções (login, getProfile, etc.) aqui,
  // adaptadas para o novo modelo, se necessário.
}

module.exports = UsuarioController;
