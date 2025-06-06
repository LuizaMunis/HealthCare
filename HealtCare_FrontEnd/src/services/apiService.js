// frontend/src/services/apiService.js
import axios from 'axios';
import { API_CONFIG, ENDPOINTS } from '../utils/constants';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptador para adicionar token automaticamente
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptador para tratamento de respostas
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.removeToken();
        }
        return Promise.reject(error);
      }
    );
  }

  // Gerenciamento de token (em produção, usar AsyncStorage)
  setToken(token) {
    this.token = token;
  }

  getToken() {
    return this.token;
  }

  removeToken() {
    this.token = null;
  }

  // Métodos de usuário
  async registerUser(userData) {
    try {
      const response = await this.api.post(ENDPOINTS.USERS.REGISTER, userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao registrar usuário' 
      };
    }
  }

  async loginUser(credentials) {
    try {
      const response = await this.api.post(ENDPOINTS.USERS.LOGIN, credentials);
      const { token } = response.data.data;
      this.setToken(token);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao fazer login' 
      };
    }
  }

  async getUserProfile() {
    try {
      const response = await this.api.get(ENDPOINTS.USERS.PROFILE);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao buscar perfil' 
      };
    }
  }

  async getAllUsers() {
    try {
      const response = await this.api.get(ENDPOINTS.USERS.ALL);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao buscar usuários' 
      };
    }
  }

  async checkHealth() {
    try {
      const response = await this.api.get(ENDPOINTS.HEALTH);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao verificar saúde da API' 
      };
    }
  }
}

export default new ApiService();