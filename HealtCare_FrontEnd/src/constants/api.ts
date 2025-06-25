// healthcare_frontend/src/constants/api.ts
/**
 * Ficheiro central para constantes relacionadas à API.
 */

// A URL base completa do seu servidor.
const API_URL_BASE = 'http://192.168.56.1:3000'; 

export const API_CONFIG = {
  BASE_URL: `${API_URL_BASE}/api`,
  TIMEOUT: 10000, // 10 segundos
};

// Endpoints da API para evitar erros de digitação e facilitar a manutenção.
export const ENDPOINTS = {
  USERS: {
    REGISTER: '/users/register',
    LOGIN: '/users/login',
    PROFILE: '/users/profile', // Usado para GET (buscar) e PUT (atualizar nome/email)
    CHANGE_PASSWORD: '/users/change-password',
  },
  PROFILE: {
    // Usado para GET (buscar dados adicionais) e POST (salvar dados adicionais)
    GET_SAVE: '/perfil',
  },
};
