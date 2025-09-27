// healthcare_frontend/src/constants/api.ts
/**
 * Ficheiro central para constantes relacionadas à API.
 */

// A URL base completa do seu servidor.
//const API_URL_BASE = 'http://0.0.0.0:3000'; // Substitua pelo IP do seu servidor

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
