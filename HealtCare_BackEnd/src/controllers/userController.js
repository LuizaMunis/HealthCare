// HealthCare_Backend/src/controllers/userController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const ProfileModel = require('../models/profileModel');
const codeGenerator = require('../utils/codeGenerator');
const emailService = require('../services/emailService');

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

      /**
      // Cria o primeiro perfil para o novo usuário na tabela 'perfil'
      const createdProfile = await ProfileModel.create({
        usuario_id: createdUser.id,
        nome_perfil,
        parentesco: null,
        data_nascimento: null,
        celular: null,
        genero: null,
        cpf: null,
        peso: null,
        altura: null
      });
      **/

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

  //------------------------------------------------------------------------------------------------------------------------------------------------

  /**
   * Atualiza dados básicos do usuário autenticado (nome e email).
   * Espera: { nome_completo?, email? }
   */
  static async updateProfile(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
      }

      const { nome_completo, email } = req.body || {};

      if (!nome_completo && !email) {
        return res.status(400).json({ success: false, message: 'Nada para atualizar.' });
      }

      await UserModel.update(userId, { nome_completo, email });

      const updated = await UserModel.findById(userId);
      return res.json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: {
          id: updated.id,
          nome_completo: updated.nome_completo,
          email: updated.email,
        }
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return res.status(500).json({ success: false, message: 'Erro interno ao atualizar perfil' });
    }
  }

  /**
   * Retorna os dados básicos do usuário autenticado (nome_completo e email)
   */
  static async getProfile(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
      }
      const user = await UserModel.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
      }
      return res.json({ success: true, data: { id: user.id, nome_completo: user.nome_completo, email: user.email } });
    } catch (error) {
      console.error('Erro ao obter perfil do usuário:', error);
      return res.status(500).json({ success: false, message: 'Erro interno ao obter perfil do usuário' });
    }
  }

  //------------------------------------------------------------------------------------------------------------------------------------------------

  /**
   * Altera a senha do usuário autenticado.
   * Espera: { senha_atual, nova_senha }
   */
  static async changePassword(req, res) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Usuário não autenticado.' });
      }

      const { senha_atual, nova_senha } = req.body || {};
      if (!senha_atual || !nova_senha) {
        return res.status(400).json({ success: false, message: 'Senha atual e nova senha são obrigatórias' });
      }

      const user = await UserModel.findById(userId, true);
      if (!user) {
        return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
      }

      const isPasswordValid = await bcrypt.compare(senha_atual, user.senha_hash);
      if (!isPasswordValid) {
        return res.status(400).json({ success: false, message: 'Senha atual incorreta' });
      }

      const nova_senha_hash = await bcrypt.hash(nova_senha, 10);
      await UserModel.updatePassword(userId, nova_senha_hash);

      return res.json({ success: true, message: 'Senha alterada com sucesso' });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return res.status(500).json({ success: false, message: 'Erro interno ao alterar senha' });
    }
  }

  //------------------------------------------------------------------------------------------------------------------------------------------------

  /**
   * Retorna a lista de usuários (requer autenticação/autorização a critério do middleware de auth).
   */
  static async getAllUsers(_req, res) {
    try {
      const users = await UserModel.getAll();
      return res.json({ success: true, data: users });
    } catch (error) {
      console.error('Erro ao obter usuários:', error);
      return res.status(500).json({ success: false, message: 'Erro interno ao obter usuários' });
    }
  }


  // Os métodos 'getProfile', 'getAllUsers', 'updateProfile', 'changePassword' podem ser
  // mantidos como estão, mas agora eles deverão interagir com a tabela 'perfil'
  // quando lidarem com dados específicos de saúde, em vez de apenas com 'usuario'.
  // Como a sua estrutura agora separa usuario e perfil, os métodos para o perfil
  // deverão ser movidos para um novo 'ProfileController.js' para manter a responsabilidade única.

  //------------------------------------------------------------------------------------------------------------------------------------------------

  /**
   * Solicita código de recuperação de senha.
   * Gera um código, salva no banco e envia por email.
   * Espera: { email }
   * Retorna: { success: true, message: string }
   */
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;

      // Validação básica
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email é obrigatório'
        });
      }

      // Validar formato do email
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de email inválido'
        });
      }

      // Buscar usuário por email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        // Por segurança, não revelamos se o email existe ou não
        // Retornamos sempre sucesso para evitar enumeração de emails
        return res.json({
          success: true,
          message: 'Se o email estiver cadastrado, você receberá um código de recuperação'
        });
      }

      // Gerar código de recuperação
      const code = codeGenerator.generateRecoveryCode();
      const encodedToken = codeGenerator.encodeCodeWithTimestamp(code);

      // Salvar código no banco de dados
      await UserModel.setRecoveryToken(user.id, encodedToken);

      // Enviar email com o código
      const emailResult = await emailService.sendRecoveryCode(
        user.email,
        code,
        user.nome_completo
      );

      // Se o email falhou, ainda retornamos sucesso para não revelar problemas técnicos
      // Mas logamos o erro para debug
      if (!emailResult.success) {
        console.error('❌ Erro ao enviar email de recuperação:', emailResult.message);
        // Em produção, você pode querer retornar erro ou usar um serviço de fallback
        // Por enquanto, retornamos sucesso para não expor problemas técnicos
      }

      // Sempre retornar sucesso (por segurança, não revelamos se email existe)
      return res.json({
        success: true,
        message: 'Se o email estiver cadastrado, você receberá um código de recuperação'
      });

    } catch (error) {
      console.error('Erro ao processar solicitação de recuperação de senha:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao processar solicitação de recuperação de senha'
      });
    }
  }

  //------------------------------------------------------------------------------------------------------------------------------------------------

  /**
   * Verifica se o código de recuperação é válido.
   * Espera: { email, code }
   * Retorna: { success: boolean, message: string }
   */
  static async verifyCode(req, res) {
    try {
      const { email, code } = req.body;

      // Validações básicas
      if (!email || !code) {
        return res.status(400).json({
          success: false,
          message: 'Email e código são obrigatórios'
        });
      }

      // Validar formato do email
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de email inválido'
        });
      }

      // Validar formato do código (4 dígitos)
      if (!/^\d{4}$/.test(code.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Código deve conter 4 dígitos numéricos'
        });
      }

      // Buscar usuário por email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Email não encontrado'
        });
      }

      // Verificar se o usuário tem um token de recuperação
      if (!user.token_recuperacao_senha) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum código de recuperação foi solicitado para este email'
        });
      }

      // Validar o código
      const validation = codeGenerator.validateRecoveryCode(
        code.trim(),
        user.token_recuperacao_senha,
        15 // 15 minutos de expiração
      );

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: validation.message || 'Código inválido ou expirado'
        });
      }

      // Código válido
      return res.json({
        success: true,
        message: 'Código válido. Você pode prosseguir para redefinir sua senha.'
      });

    } catch (error) {
      console.error('Erro ao verificar código de recuperação:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao verificar código de recuperação'
      });
    }
  }

  //------------------------------------------------------------------------------------------------------------------------------------------------

  /**
   * Reseta a senha do usuário usando o código de recuperação.
   * Espera: { email, code, newPassword }
   * Retorna: { success: boolean, message: string }
   */
  static async resetPassword(req, res) {
    try {
      const { email, code, newPassword } = req.body;

      // Validações básicas
      if (!email || !code || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Email, código e nova senha são obrigatórios'
        });
      }

      // Validar formato do email
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de email inválido'
        });
      }

      // Validar formato do código
      if (!/^\d{4}$/.test(code.trim())) {
        return res.status(400).json({
          success: false,
          message: 'Código deve conter 4 dígitos numéricos'
        });
      }

      // Validar força da senha
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'A senha deve ter pelo menos 6 caracteres'
        });
      }

      // Buscar usuário por email
      const user = await UserModel.findByEmail(email, true);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Email não encontrado'
        });
      }

      // Verificar se o usuário tem um token de recuperação
      if (!user.token_recuperacao_senha) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum código de recuperação foi solicitado para este email'
        });
      }

      // Validar o código
      const validation = codeGenerator.validateRecoveryCode(
        code.trim(),
        user.token_recuperacao_senha,
        15 // 15 minutos de expiração
      );

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: validation.message || 'Código inválido ou expirado'
        });
      }

      // Gerar hash da nova senha
      const nova_senha_hash = await bcrypt.hash(newPassword, 10);

      // Atualizar senha no banco
      await UserModel.updatePassword(user.id, nova_senha_hash);

      // Limpar token de recuperação após uso bem-sucedido
      await UserModel.clearRecoveryToken(user.id);

      // Retornar sucesso
      return res.json({
        success: true,
        message: 'Senha alterada com sucesso. Você já pode fazer login com a nova senha.'
      });

    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao resetar senha'
      });
    }
  }

  //------------------------------------------------------------------------------------------------------------------------------------------------

}

module.exports = UserController;