// HealthCare_Backend/src/controllers/userController.js

const UserService = require('../services/userService');

class UserController {
<<<<<<< HEAD

=======
  /**
   * Registra um novo usuário no sistema.
   * Espera 'nome_completo', 'email' e 'password' no corpo da requisição.
   */
>>>>>>> 955ab6818754a84eaa773769df8ba1f618616e52
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

  /**
   * Realiza o login do usuário.
   * Espera 'email' e 'password' no corpo da requisição.
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

  /**
   * Obtém o perfil do usuário autenticado.
   * Requer autenticação (req.user.id deve ser populado por um middleware de autenticação).
   */
  static async getProfile(req, res) {
    try {
      const user = await UserService.getUserProfile(req.user.id);
      
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

  /**
   * Obtém todos os usuários registrados no sistema.
   * Requer autenticação.
   */
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
