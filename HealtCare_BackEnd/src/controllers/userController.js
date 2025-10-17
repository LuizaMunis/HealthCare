// HealthCare_Backend/src/controllers/userController.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // se preferir evitar dependência nativa, troque por 'bcryptjs'
const UserModel = require('../models/userModel');
const ProfileModel = require('../models/profileModel'); // Importa o novo modelo de perfil

class UserController {
  /**
   * Registra um novo usuário e seu primeiro perfil.
   * Espera: { nome_completo, email, password, nome_perfil }
   */
  static async register(req, res) {
    try {
      const { nome_completo, email, password, nome_perfil } = req.body;

      // Validações básicas, incluindo o novo campo 'nome_perfil'
      if (!nome_completo || !email || !password || !nome_perfil) {
        return res.status(400).json({
          success: false,
          message: 'Todos os campos (nome_completo, email, password, nome_perfil) são obrigatórios'
        });
      }

      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de email inválido.'
        });
      }

      // Verifica duplicidade de email na tabela 'usuario'
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Este email já está em uso.'
        });
      }

      // Cria hash da senha
      const senha_hash = await bcrypt.hash(password, 10);

      // Cria o usuário na tabela 'usuario'
      const createdUser = await UserModel.create({
        nome_completo,
        email,
        senha_hash,
      });

      // Cria o primeiro perfil para o novo usuário na tabela 'perfil'
      const createdProfile = await ProfileModel.create({
        usuario_id: createdUser.id,
        nome_perfil
      });

      // Gera o token JWT com o ID do usuário
      const token = jwt.sign(
        { id: createdUser.id, email: createdUser.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.status(201).json({
        success: true,
        message: 'Usuário e perfil criados com sucesso',
        data: {
          token,
          user: {
            id: createdUser.id,
            nome_completo: createdUser.nome_completo,
            email: createdUser.email,
          },
          profiles: [createdProfile] // Retorna o perfil recém-criado em uma lista
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

  //------------------------------------------------------------------------------------------------------------------------------------------------

  /**
   * Login do usuário e retorno de seus perfis.
   * Espera: { email, password }
   * Retorna: { token, user, profiles }
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

      const user = await UserModel.findByEmail(email, true); // Retorna o usuário com o hash da senha
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

      // Busca todos os perfis associados ao usuário
      const profiles = await ProfileModel.findByUserId(user.id);

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
          },
          profiles // Envia a lista de perfis para o frontend
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

  //------------------------------------------------------------------------------------------------------------------------------------------------

  /**
   * Obtém os perfis de um usuário autenticado.
   * A ser usada por uma nova rota.
   */
  static async getUserProfiles(req, res) {
    try {
      const userId = req.user.id; // ID do usuário vindo do JWT
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
      }

      const profiles = await ProfileModel.findByUserId(userId);
      
      return res.json({
        success: true,
        data: { profiles }
      });
    } catch (error) {
      console.error('Erro ao obter perfis:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao obter perfis'
      });
    }
  }


  // Os métodos 'getProfile', 'getAllUsers', 'updateProfile', 'changePassword' podem ser
  // mantidos como estão, mas agora eles deverão interagir com a tabela 'perfil'
  // quando lidarem com dados específicos de saúde, em vez de apenas com 'usuario'.
  // Como a sua estrutura agora separa usuario e perfil, os métodos para o perfil
  // deverão ser movidos para um novo 'ProfileController.js' para manter a responsabilidade única.

}

module.exports = UserController;