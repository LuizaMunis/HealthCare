/**
 * Arquivo central para constantes relacionadas à API.
 */

// MUITO IMPORTANTE: Substitua pelo endereço IP da sua máquina onde o back-end está rodando.
const API_IP = '192.168.0.100:3000'; // Exemplo: '192.168.0.100:3000'

export const API_CONFIG = {
  BASE_URL: `http://${API_IP}/api`,
  TIMEOUT: 10000, // 10 segundos
};

// Endpoints da API para evitar erros de digitação
export const ENDPOINTS = {
  USERS: {
    REGISTER: '/users/register',
    LOGIN: '/users/login',
    PROFILE: '/users/profile',
    ALL: '/users/all',
  },
  RECORDS: {
    PRESSURE: '/pressao-arterial',
    // ...outros endpoints de registros
  },
};
