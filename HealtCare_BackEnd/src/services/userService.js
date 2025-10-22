// HealthCare_Backend/src/services/userService.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const ProfileModel = require('../models/perfilModel'); // Importa o novo modelo de perfil

class UserService {
  /**
   * Registra um novo usuário e seu primeiro perfil.
   * @param {Object} userData - Dados do usuário e do perfil.
   * @param {string} userData.nome_completo - Nome completo do usuário.
   * @param {string} userData.email - Email do usuário.
   * @param {string} userData.password - Senha do usuário.
   * @param {string} userData.nome_perfil - Nome do primeiro perfil do usuário.
   * @returns {Object} Resultado da operação com usuário, perfil e token.
   */
  static async registerUser(userData) {
    const { nome_completo, email, password, nome_perfil } = userData;

    // Validações de negócio
    if (!nome_completo || !email || !password || !nome_perfil) {
      throw new Error('Todos os campos (nome_completo, email, password, nome_perfil) são obrigatórios');
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      throw new Error('Formato de email inválido');
    }

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new Error('Este email já está em uso');
    }

    // Hash da senha
    const senha_hash = await bcrypt.hash(password, 10);
    
    // 1. Criar o usuário
    const newUser = await UserModel.create({
      nome_completo,
      email,
      senha_hash,
    });

    // 2. Criar o primeiro perfil associado
    const newProfile = await ProfileModel.create({
      usuario_id: newUser.id,
      nome_perfil,
    });

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
      profiles: [newProfile], // Retorna o perfil recém-criado em uma lista
      token
    };
  }

  /**
   * Autentica um usuário e retorna seus perfis.
   * @param {Object} credentials - Credenciais do usuário.
   * @returns {Object} Resultado com usuário, lista de perfis e token.
   */
  static async authenticateUser(credentials) {
    const { email, password } = credentials;

    if (!email || !password) {
      throw new Error('Email e senha são obrigatórios');
    }

    // Buscar usuário com sua senha_hash para comparação
    const user = await UserModel.findByEmail(email, true); // includePassword = true
    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.senha_hash);
    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    // 1. Após autenticar, buscar todos os perfis associados
    const profiles = await ProfileModel.findByUserId(user.id);

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
      profiles, // Retorna a lista de perfis do usuário
      token
    };
  }

  /**
   * Busca os dados de um usuário pelo ID (sem informações de perfil).
   * @param {number} userId - ID do usuário.
   * @returns {Object} Dados do usuário.
   */
  static async getUserById(userId) {
    const user = await UserModel.findById(userId);
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    // Remove a senha_hash por segurança, caso ela tenha sido retornada
    delete user.senha_hash;
    return user;
  }

  /**
   * Busca todos os perfis associados a um usuário.
   * @param {number} userId - ID do usuário.
   * @returns {Array} Lista de perfis.
   */
  static async getUserProfiles(userId) {
    return await ProfileModel.findByUserId(userId);
  }

  /**
   * Busca todos os usuários (geralmente para fins administrativos).
   * @returns {Array} Lista de usuários.
   */
  static async getAllUsers() {
    return await UserModel.getAll();
  }

  /**
   * Atualiza os dados de um usuário (nome e email).
   * @param {number} userId - ID do usuário.
   * @param {Object} updateData - Dados para atualização.
   * @returns {Object} Mensagem de sucesso.
   */
  static async updateUser(userId, updateData) {
    const { nome_completo, email } = updateData;

    if (!nome_completo || !email) {
      throw new Error('Nome e email são obrigatórios');
    }

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser && existingUser.id !== userId) {
      throw new Error('Este email já está em uso por outro usuário');
    }

    await UserModel.update(userId, { nome_completo, email });
    return { message: 'Dados do usuário atualizados com sucesso' };
  }

  /**
   * Altera a senha de um usuário.
   * @param {number} userId - ID do usuário.
   * @param {Object} passwordData - Dados da senha.
   * @returns {Object} Mensagem de sucesso.
   */
  static async changeUserPassword(userId, passwordData) {
    const { senha_atual, nova_senha } = passwordData;

    if (!senha_atual || !nova_senha) {
      throw new Error('Senha atual e nova senha são obrigatórias');
    }

    const user = await UserModel.findById(userId, true);
    
    const isPasswordValid = await bcrypt.compare(senha_atual, user.senha_hash);
    if (!isPasswordValid) {
      throw new Error('A senha atual está incorreta');
    }

    const nova_senha_hash = await bcrypt.hash(nova_senha, 10);
    
    await UserModel.updatePassword(userId, nova_senha_hash);
    
    return { message: 'Senha alterada com sucesso' };
  }

  /**
   * Verifica um token JWT.
   * @param {string} token - Token JWT.
   * @returns {Object} Payload decodificado do token.
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