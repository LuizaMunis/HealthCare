// frontend/src/utils/constants.js
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api',
  TIMEOUT: 10000,
};

export const ENDPOINTS = {
  USERS: {
    REGISTER: '/users/register',
    LOGIN: '/users/login',
    PROFILE: '/users/profile',
    ALL: '/users/all',
  },
  HEALTH: '/health',
};

export const COLORS = {
  PRIMARY: '#007bff',
  SECONDARY: '#6c757d',
  SUCCESS: '#28a745',
  DANGER: '#dc3545',
  WARNING: '#ffc107',
  INFO: '#17a2b8',
  LIGHT: '#f8f9fa',
  DARK: '#343a40',
  WHITE: '#ffffff',
  BLACK: '#000000',
};

export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
};