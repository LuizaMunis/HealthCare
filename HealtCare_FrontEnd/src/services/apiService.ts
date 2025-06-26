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
  register: async (userData: Record<string, any>) => {
    try {
      const response = await api.post(ENDPOINTS.USERS.REGISTER, userData);
      return { success: true, data: response.data };
    } catch (error: unknown) {
      const errorMessage = (error as any)?.response?.data?.message || 'Erro ao registar.';
      return { success: false, error: errorMessage };
    }
  },

  login: async (credentials: Record<string, any>) => {
    try {
      const response = await api.post(ENDPOINTS.USERS.LOGIN, credentials);
      const { token } = response.data.data;
      if (token) {
        await AsyncStorage.setItem(TOKEN_KEY, token);
      }
      return { success: true, data: response.data };
    } catch (error: unknown) {
      const errorMessage = (error as any)?.response?.data?.message || 'Credenciais inválidas.';
      return { success: false, error: errorMessage };
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem('userInfo');
  },

  // --- PROFILE & USER ---
  getProfile: async () => {
    try {
      const response = await api.get(ENDPOINTS.USERS.PROFILE);
      return { success: true, data: response.data };
    } catch (error: unknown) {
      const errorMessage = (error as any)?.response?.data?.message || 'Sessão expirada.';
      return { success: false, error: errorMessage };
    }
  },
  
  getAdditionalProfile: async () => {
    try {
      const response = await api.get(ENDPOINTS.PROFILE.GET_SAVE);
      return { success: true, data: response.data };
    } catch (error: unknown) {
      const errorMessage = (error as any)?.response?.data?.message || 'Erro ao buscar dados adicionais.';
      return { success: false, error: errorMessage };
    }
  },

  saveProfile: async (profileData: Record<string, any>) => {
    try {
      const response = await api.put(ENDPOINTS.USERS.PROFILE, profileData);
      return { success: true, data: response.data };
    } catch (error: unknown) {
      const errorMessage = (error as any)?.response?.data?.message || 'Erro ao salvar perfil.';
      return { success: false, error: errorMessage };
    }
  },
  
  saveAdditionalProfile: async (additionalData: Record<string, any>) => {
    try {
      const response = await api.post(ENDPOINTS.PROFILE.GET_SAVE, additionalData);
      return { success: true, data: response.data };
    } catch (error: unknown) {
      const errorMessage = (error as any)?.response?.data?.message || 'Erro ao salvar dados adicionais.';
      return { success: false, error: errorMessage };
    }
  },

  changePassword: async (passwordData: Record<string, any>) => {
    try {
      const response = await api.post(ENDPOINTS.USERS.CHANGE_PASSWORD, passwordData);
      return { success: true, data: response.data };
    } catch (error: unknown) {
      const errorMessage = (error as any)?.response?.data?.message || 'Erro ao alterar a senha.';
      return { success: false, error: errorMessage };
    }
  },
};

export default ApiService;
