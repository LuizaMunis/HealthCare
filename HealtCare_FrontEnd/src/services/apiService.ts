// HealtCare_FrontEnd/src/services/apiService.ts

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
  nome_perfil: string;
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

        // Salva também o userInfo mais recente para evitar dados antigos
        if (response.data.data.user) {
          await AsyncStorage.setItem('userInfo', JSON.stringify(response.data.data.user));
        }
      } else {
        console.log('❌ Estrutura da resposta não contém token');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro no registro:', error);
      return { success: false, error: error.response?.data?.message || 'Erro ao registar.' };
    }
  },

  login: async (credentials: Credentials) => {
    try {
      const response = await api.post(ENDPOINTS.USERS.LOGIN, credentials);
      const { token, user } = response.data.data;
      if (token) {
        await AsyncStorage.setItem(TOKEN_KEY, token);
        if (user) {
          await AsyncStorage.setItem('userInfo', JSON.stringify(user));
        }
      }
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Credenciais inválidas.' };
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem('userInfo');
    // Limpa também possíveis restos de perfis armazenados por telas
    await AsyncStorage.removeItem('selectedProfileId');
    await AsyncStorage.removeItem('active_profile_id');
  },

  // --- PROFILE & USER ---
  getProfile: async () => {
    try {
      const response = await api.get(ENDPOINTS.USERS.PROFILE);
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Sessão expirada.' };
    }
  },
  
  getAdditionalProfile: async () => {
    try {
      const response = await api.get(ENDPOINTS.PROFILE.GET_SAVE);
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Erro ao buscar dados adicionais.' };
    }
  },

  /**
   * Busca a lista de todos os perfis associados à conta do usuário.
   * Presume a existência de um endpoint GET /api/perfil/all no backend.
   */
  getAllProfiles: async () => {
    try {
      const response = await api.get(ENDPOINTS.PROFILE.GET_SAVE);
      return response.data; // backend retorna { success, data: [ ... ] }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Erro ao buscar perfis.' };
    }
  },
  
  /**
   * Busca os dados detalhados de um perfil específico pelo seu ID.
   * Presume a existência de um endpoint GET /api/perfil/:id no backend.
   */
  getProfileById: async (profileId: string) => {
    try {
      const response = await api.get(`${ENDPOINTS.PROFILE.GET_SAVE}/${profileId}`);
      return response.data; // backend retorna { success, data: { ... } }
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Erro ao buscar dados do perfil.' };
    }
  },

  createProfile: async (profileData: ProfileData) => {
    try {
      const response = await api.post(ENDPOINTS.PROFILE.GET_SAVE, profileData);
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Erro ao criar perfil.' };
    }
  },

  updateProfile: async (profileId: string, profileData: ProfileData) => {
    try {
      const response = await api.put(`${ENDPOINTS.PROFILE.GET_SAVE}/${profileId}`, profileData);
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Erro ao atualizar perfil.' };
    }
  },

  deleteProfile: async (profileId: string) => {
    try {
      const response = await api.delete(`${ENDPOINTS.PROFILE.GET_SAVE}/${profileId}`);
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Erro ao excluir perfil.' };
    }
  },

  saveProfile: async (profileData: ProfileData) => {
    try {
      const response = await api.put(ENDPOINTS.USERS.PROFILE, profileData);
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Erro ao salvar perfil.' };
    }
  },
  
  // Cria/atualiza dados do perfil do usuário autenticado (POST /perfil)
  savePerfilData: async (perfilData: PerfilData) => {
    try {
      const response = await api.post(ENDPOINTS.PROFILE.GET_SAVE, perfilData);
      return response.data;
    } catch (error: any) {
      console.error('Erro no savePerfilData:', error);
      let errorMessage = 'Erro ao salvar dados adicionais.';
      if (error.response?.data?.message) errorMessage = error.response.data.message;
      else if (error.response?.status === 409) errorMessage = 'Este CPF já está em uso por outro usuário.';
      else if (error.response?.status === 400) errorMessage = 'Dados inválidos. Verifique as informações fornecidas.';
      else if (error.response?.status === 500) errorMessage = 'Erro interno do servidor. Tente novamente.';
      return { success: false, error: errorMessage };
    }
  },

  // Atualiza dados de um perfil específico por ID (PUT /perfil/:id)
  updatePerfilDataById: async (profileId: string, perfilData: PerfilData) => {
    try {
      const response = await api.put(`${ENDPOINTS.PROFILE.GET_SAVE}/${profileId}`, perfilData);
      return response.data;
    } catch (error: any) {
      console.error('Erro no updatePerfilDataById:', error);
      let errorMessage = 'Erro ao salvar dados adicionais.';
      if (error.response?.data?.message) errorMessage = error.response.data.message;
      else if (error.response?.status === 409) errorMessage = 'Este CPF já está em uso por outro usuário.';
      else if (error.response?.status === 400) errorMessage = 'Dados inválidos. Verifique as informações fornecidas.';
      else if (error.response?.status === 500) errorMessage = 'Erro interno do servidor. Tente novamente.';
      return { success: false, error: errorMessage };
    }
  },

  changePassword: async (passwordData: PasswordData) => {
    try {
      const response = await api.post(ENDPOINTS.USERS.CHANGE_PASSWORD, passwordData);
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.message || 'Erro ao alterar a senha.' };
    }
  },
};

export default ApiService;
