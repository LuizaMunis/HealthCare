import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, ENDPOINTS } from '@/constants/api';

const TOKEN_KEY = 'healthcare_auth_token';

// Cria uma única instância do Axios para todo o app
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptador para adicionar o token JWT ANTES de cada requisição
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Objeto que agrupa todos os serviços
const ApiService = {
  // --- Auth Services ---
  register: async (userData) => {
    try {
      const response = await api.post(ENDPOINTS.USERS.REGISTER, userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Erro ao registrar.' };
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post(ENDPOINTS.USERS.LOGIN, credentials);
      const { token } = response.data.data;
      if (token) {
        await AsyncStorage.setItem(TOKEN_KEY, token);
      }
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Credenciais inválidas.' };
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
  },

  // --- Profile Services ---
  getProfile: async () => {
    try {
      const response = await api.get(ENDPOINTS.USERS.PROFILE);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Sessão expirada.' };
    }
  },

  // ... adicione aqui outros serviços (ex: para registros de pressão)
};

export default ApiService;
