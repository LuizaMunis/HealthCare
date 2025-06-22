import UserModel from '../models/UserModel';
import apiService from '../services/apiService';
import { API_ENDPOINTS } from '../utils/constants';

class UserViewModel {
  constructor() {
    this.userModel = new UserModel();
  }

  async login(email, password) {
    try {
      const response = await apiService.post(API_ENDPOINTS.LOGIN, { email, password });
      // Assumindo que a API retorna um token e/ou dados do usuário
      if (response && response.token) {
        this.userModel.setUserData(response.user); // Se a API retornar dados do usuário
        this.userModel.setToken(response.token);
        return { success: true, message: 'Login bem-sucedido!' };
      } else {
        return { success: false, message: response.message || 'Credenciais inválidas.' };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, message: 'Ocorreu um erro ao tentar fazer login. Por favor, tente novamente.' };
    }
  }

  // Você pode adicionar outros métodos aqui, como register, logout, etc.
  async register(userData) {
    try {
      const response = await apiService.post(API_ENDPOINTS.REGISTER, userData);
      if (response && response.success) {
        return { success: true, message: 'Cadastro realizado com sucesso!' };
      } else {
        return { success: false, message: response.message || 'Erro ao cadastrar.' };
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { success: false, message: 'Ocorreu um erro ao tentar se cadastrar. Por favor, tente novamente.' };
    }
  }

  isLoggedIn() {
    return !!this.userModel.getToken();
  }

  getUserData() {
    return this.userModel.getUserData();
  }

  logout() {
    this.userModel.clearUserData();
    this.userModel.clearToken();
  }
}

export default new UserViewModel(); // Exporta uma instância única