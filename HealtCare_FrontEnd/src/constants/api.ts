// healthcare_frontend/src/constants/api.ts
/**
 * Ficheiro central para constantes relacionadas à API.
 */
import Constants from 'expo-constants';
// ...existing code...
const getApiBaseUrl = () => {
  // A variável global __DEV__ é `true` quando rodando no modo de desenvolvimento.
  if (__DEV__) {
    // Em desenvolvimento, pegamos o endereço do host do servidor Metro Bundler.
    // Exemplo de hostUri: "192.168.15.8:8081"
    const hostUri = Constants.expoConfig?.hostUri;
    
    // Extraímos apenas o IP/hostname, removendo a porta.
    const hostname = hostUri?.split(':')[0];
    
    // A porta do seu backend (ex: 3000). Altere se for diferente.
    const backendPort = 3000; 

    // Montamos a URL de desenvolvimento dinamicamente.
    return `http://${hostname}:${backendPort}`;
  } else {
    // Em produção, usamos a URL definida nas variáveis de ambiente.
    return process.env.EXPO_PUBLIC_API_URL_PROD;
  }
};

// A URL base completa do seu servidor.
const API_URL_BASE = getApiBaseUrl();

// Configuração da API, incluindo a URL base e timeout.

export const API_CONFIG = {
  BASE_URL: `${API_URL_BASE}/api`,
  TIMEOUT: 30000, // 30 segundos
};

// Endpoints da API para evitar erros de digitação e facilitar a manutenção.
export const ENDPOINTS = {
  USERS: {
    REGISTER: '/users/register',
    LOGIN: '/users/login',
    PROFILE: '/users/profile', 
    CHANGE_PASSWORD: '/users/change-password',
  },
  PROFILE: {
    GET_SAVE: '/perfil',
  },
  PRESSURE_RECORDS: '/registros-pressao',
};
