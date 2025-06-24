import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, ENDPOINTS } from '@/constants/api';

const TOKEN_KEY = 'healthcare_auth_token';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));


const ApiService = {
  // --- AUTH ---
  register: async (userData) => {
    try {
      const response = await api.post(ENDPOINTS.USERS.REGISTER, userData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Erro ao registar.' };
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

  /*logout: async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem('userInfo');
  },*/

  // --- PROFILE & USER ---
  getProfile: async () => {
    try {
      const response = await api.get(ENDPOINTS.USERS.PROFILE);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Sessão expirada.' };
    }
  },
  
  getAdditionalProfile: async () => {
    try {
      const response = await api.get(ENDPOINTS.PROFILE.GET_SAVE);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Erro ao buscar dados adicionais.' };
    }
  },

  saveProfile: async (profileData) => {
    try {
      const response = await api.put(ENDPOINTS.USERS.PROFILE, profileData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Erro ao salvar perfil.' };
    }
  },
  
  saveAdditionalProfile: async (additionalData) => {
    try {
      const response = await api.post(ENDPOINTS.PROFILE.GET_SAVE, additionalData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Erro ao salvar dados adicionais.' };
    }
  },

  changePassword: async (passwordData) => {
    try {
      const response = await api.post(ENDPOINTS.USERS.CHANGE_PASSWORD, passwordData);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Erro ao alterar a senha.' };
    }
  },
};

export default ApiService;
