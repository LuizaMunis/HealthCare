// HealthCare_Backend/src/services/userService.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

class UserService {
  /**
   * Registra um novo usuário
   * @param {Object} userData - Dados do usuário
   * @param {string} userData.nome_completo - Nome completo do usuário
   * @param {string} userData.email - Email do usuário
   * @param {string} userData.password - Senha do usuário
   * @returns {Object} Resultado da operação
   */
  static async registerUser(userData) {
    const { nome_completo, email, password } = userData;

    // Validações de negócio
    if (!nome_completo || !email || !password) {
      throw new Error('Todos os campos (nome_completo, email, password) são obrigatórios');
    }

    // Validação de formato de email
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      throw new Error('Formato de email inválido');
    }

    // Verificar se usuário já existe
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new Error('Este email já está em uso');
    }

    // Hash da senha
    const senha_hash = await bcrypt.hash(password, 10);
    
    // Criar usuário
    const newUser = await UserModel.create({
      nome_completo,
      email,
      senha_hash,
    });

    // Gerar token JWT
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET não está configurado');
    }

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      user: {
        id: newUser.id,
        nome_completo: newUser.nome_completo,
        email: newUser.email
      },
      token
    };
  }

  /**
   * Autentica um usuário
   * @param {Object} credentials - Credenciais do usuário
   * @param {string} credentials.email - Email do usuário
   * @param {string} credentials.password - Senha do usuário
   * @returns {Object} Resultado da autenticação
   */
  static async authenticateUser(credentials) {
    const { email, password } = credentials;

    if (!email || !password) {
      throw new Error('Email e senha são obrigatórios');
    }

    // Buscar usuário
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.senha_hash);
    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    // Gerar token JWT
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET não está configurado');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      user: {
        id: user.id,
        nome_completo: user.nome_completo,
        email: user.email
      },
      token
    };
  }

  /**
   * Busca perfil do usuário
   * @param {number} userId - ID do usuário
   * @returns {Object} Dados do usuário
   */
  static async getUserProfile(userId) {
    const user = await UserModel.findById(userId);
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    return user;
  }

  /**
   * Busca todos os usuários
   * @returns {Array} Lista de usuários
   */
  static async getAllUsers() {
    return await UserModel.getAll();
  }

  /**
   * Atualiza perfil do usuário
   * @param {number} userId - ID do usuário
   * @param {Object} updateData - Dados para atualização
   * @param {string} updateData.nome_completo - Nome completo
   * @param {string} updateData.email - Email
   * @returns {Object} Resultado da atualização
   */
  static async updateUserProfile(userId, updateData) {
    const { nome_completo, email } = updateData;

    if (!nome_completo || !email) {
      throw new Error('Nome e email são obrigatórios');
    }

    // Verificar se email já está em uso por outro usuário
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser && existingUser.id !== userId) {
      throw new Error('Este email já está em uso');
    }

    await UserModel.update(userId, { nome_completo, email });
    return { message: 'Perfil atualizado com sucesso' };
  }

  /**
   * Altera senha do usuário
   * @param {number} userId - ID do usuário
   * @param {Object} passwordData - Dados da senha
   * @param {string} passwordData.senha_atual - Senha atual
   * @param {string} passwordData.nova_senha - Nova senha
   * @returns {Object} Resultado da alteração
   */
  static async changeUserPassword(userId, passwordData) {
    const { senha_atual, nova_senha } = passwordData;

    if (!senha_atual || !nova_senha) {
      throw new Error('Todos os campos são obrigatórios');
    }

    // Buscar usuário com senha
    const user = await UserModel.findById(userId, true);
    
    // Verificar senha atual
    const isPasswordValid = await bcrypt.compare(senha_atual, user.senha_hash);
    if (!isPasswordValid) {
      throw new Error('A senha atual está incorreta');
    }

    // Hash da nova senha
    const nova_senha_hash = await bcrypt.hash(nova_senha, 10);
    
    // Atualizar senha
    await UserModel.updatePassword(userId, nova_senha_hash);
    
    return { message: 'Senha alterada com sucesso' };
  }

  /**
   * Verifica se um token JWT é válido
   * @param {string} token - Token JWT
   * @returns {Object} Dados do usuário do token
   */
  static verifyToken(token) {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET não está configurado');
    }

    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Token inválido ou expirado');
    }
  }
}

module.exports = UserService;

