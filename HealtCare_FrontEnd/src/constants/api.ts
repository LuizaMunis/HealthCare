// healthcare_frontend/src/constants/api.ts
/**
 * Ficheiro central para constantes relacionadas à API.
 */
import Constants from 'expo-constants';
// ...existing code...
const getApiBaseUrl = () => {
  // A variável global __DEV__ é `true` quando rodando no modo de desenvolvimento.
  if (__DEV__) {
    // Permite sobrescrever via variável de ambiente quando necessário
    const envDev = process.env.EXPO_PUBLIC_API_URL_DEV;
    if (envDev) return envDev;

    // Em desenvolvimento, tentamos obter o host usado pelo Metro/Expo
    // Exemplo de hostUri: "192.168.15.8:8081"
    const hostUri = Constants.expoConfig?.hostUri;

    // Expo Go (manifest v2) pode expor o host aqui
    // @ts-ignore - campos internos do manifest2
    const expoGoHost = (Constants as any)?.manifest2?.extra?.expoGo?.developer?.host as string | undefined;

    // Em ambiente web, usar o hostname atual do browser
    const webHost = typeof window !== 'undefined' ? window.location?.hostname : undefined;

    // Escolhe, em ordem, o host do Expo, do manifest2, do browser, ou fallback para localhost
    const hostname = hostUri?.split(':')[0] || expoGoHost || webHost || 'localhost';

    // Porta do backend
    const backendPort = 3000;

    // Monta a URL de desenvolvimento dinamicamente.
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
  TEMPERATURE_RECORDS: '/temperatura',
  HEART_RATE_RECORDS: '/frequencia-cardiaca',
  GLYCEMIA_RECORDS: '/glicemia',
  VACCINE_RECORDS: '/vacinas',
  MEDICATION_RECORDS: '/medicamentos',
  MEDICATION_USAGE_RECORDS: '/medicamentos',
  SYMPTOMS_RECORDS: '/sintomas',
  CONSULTAS: '/consultas',
};
