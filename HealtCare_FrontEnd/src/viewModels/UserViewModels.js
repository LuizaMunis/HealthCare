// frontend/src/viewmodels/UserViewModel.js
import { useState, useCallback } from 'react';
import ApiService from '../services/apiService';
import { UserModel } from '../models/UserModel';

export const useUserViewModel = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Registrar usuário
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);

      // Validações
      const nameError = UserModel.validateName(userData.name);
      const emailError = UserModel.validateEmail(userData.email);
      const passwordError = UserModel.validatePassword(userData.password);

      if (nameError || emailError || passwordError) {
        throw new Error(nameError || emailError || passwordError);
      }

      const result = await ApiService.registerUser(userData);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      return { success: true, message: 'Usuário registrado com sucesso!' };
    } catch (err) {
      const errorMessage = err.message || 'Erro ao registrar usuário';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fazer login
  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      // Validações
      const emailError = UserModel.validateEmail(credentials.email);
      const passwordError = UserModel.validatePassword(credentials.password);

      if (emailError || passwordError) {
        throw new Error(emailError || passwordError);
      }

      const result = await ApiService.loginUser(credentials);
      
      if (!result.success) {
        throw new Error(result.error);
      }

      const userData = new UserModel(result.data.data.user);
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, message: 'Login realizado com sucesso!' };
    } catch (err) {
      const errorMessage = err.message || 'Erro ao fazer login';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar perfil do usuário
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await ApiService.getUserProfile();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      const userData = new UserModel(result.data.data);
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, data: userData };
    } catch (err) {
      const errorMessage = err.message || 'Erro ao buscar perfil';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar todos os usuários
  const fetchAllUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await ApiService.getAllUsers();
      
      if (!result.success) {
        throw new Error(result.error);
      }

      const usersData = result.data.data.map(userData => new UserModel(userData));
      setUsers(usersData);

      return { success: true, data: usersData };
    } catch (err) {
      const errorMessage = err.message || 'Erro ao buscar usuários';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    ApiService.removeToken();
    setUser(null);
    setUsers([]);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  // Verificar saúde da API
  const checkApiHealth = useCallback(async () => {
    try {
      setLoading(true);
      const result = await ApiService.checkHealth();
      return result;
    } catch (err) {
      return { success: false, error: 'Erro ao verificar API' };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // Estado
    loading,
    error,
    user,
    users,
    isAuthenticated,
    
    // Ações
    register,
    login,
    logout,
    fetchProfile,
    fetchAllUsers,
    checkApiHealth,
    clearError,
  };
};

export default useUserViewModel;