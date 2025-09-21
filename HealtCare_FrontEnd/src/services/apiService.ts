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
    console.log('🔑 Token enviado para:', config.url);
  } else {
    console.log('⚠️ Nenhum token encontrado para:', config.url);
  }
  return config;
}, (error) => Promise.reject(error));


interface UserData {
  nome_completo: string;
  email: string;
  password: string;
}

interface Credentials {
  email: string;
  password: string;
}

interface ProfileData {
  [key: string]: any;
}

interface PerfilData {
  cpf: string;
  celular: string;
  data_nascimento: string;
  peso: number;
  altura: number;
  genero: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ApiService = {
  // --- AUTH ---
  register: async (userData: UserData) => {
    try {
      const response = await api.post(ENDPOINTS.USERS.REGISTER, userData);
      
      // Verificar se a resposta tem a estrutura esperada
      if (response.data.success && response.data.data && response.data.data.token) {
        const token = response.data.data.token;
        await AsyncStorage.setItem(TOKEN_KEY, token);
        console.log('✅ Token salvo com sucesso');
      } else {
        console.log('❌ Estrutura da resposta não contém token');
      }
      
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('❌ Erro no registro:', error);
      return { success: false, error: error.response?.data?.message || 'Erro ao registar.' };
    }
  },

  login: async (credentials: Credentials) => {
    try {
      const response = await api.post(ENDPOINTS.USERS.LOGIN, credentials);
      const { token } = response.data.data;
      if (token) {
        await AsyncStorage.setItem(TOKEN_KEY, token);
      }
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Credenciais inválidas.' };
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
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Sessão expirada.' };
    }
  },
  
  getAdditionalProfile: async () => {
    try {
      const response = await api.get(ENDPOINTS.PROFILE.GET_SAVE);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Erro ao buscar dados adicionais.' };
    }
  },

  saveProfile: async (profileData: ProfileData) => {
    try {
      const response = await api.put(ENDPOINTS.USERS.PROFILE, profileData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Erro ao salvar perfil.' };
    }
  },
  
  savePerfilData: async (perfilData: PerfilData) => {
    try {
      const response = await api.post(ENDPOINTS.PROFILE.GET_SAVE, perfilData);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('Erro no savePerfilData:', error);
      
      // Extrair mensagem de erro mais específica
      let errorMessage = 'Erro ao salvar dados adicionais.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 409) {
        errorMessage = 'Este CPF já está em uso por outro usuário.';
      } else if (error.response?.status === 400) {
        errorMessage = 'Dados inválidos. Verifique as informações fornecidas.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Erro interno do servidor. Tente novamente.';
      }
      
      return { success: false, error: errorMessage };
    }
  },

  changePassword: async (passwordData: PasswordData) => {
    try {
      const response = await api.post(ENDPOINTS.USERS.CHANGE_PASSWORD, passwordData);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Erro ao alterar a senha.' };
    }
  },
};

export default ApiService;
