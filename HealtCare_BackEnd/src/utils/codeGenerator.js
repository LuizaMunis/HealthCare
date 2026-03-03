// HealthCare_BackEnd/src/utils/codeGenerator.js

/**
 * Utilitário para geração e validação de códigos de recuperação de senha
 */

/**
 * Gera um código numérico aleatório de 4 dígitos
 * @returns {string} Código de 4 dígitos (ex: "1234")
 */
function generateRecoveryCode() {
  const min = 1000;
  const max = 9999;
  const code = Math.floor(Math.random() * (max - min + 1)) + min;
  return code.toString();
}

/**
 * Codifica o código com timestamp para armazenamento no banco
 * Formato: "codigo:timestamp"
 * @param {string} code - Código de recuperação (ex: "1234")
 * @returns {string} Código codificado com timestamp (ex: "1234:1703123456789")
 */
function encodeCodeWithTimestamp(code) {
  const timestamp = Date.now();
  return `${code}:${timestamp}`;
}

/**
 * Decodifica o código e valida se não expirou
 * @param {string} codeString - Código codificado (ex: "1234:1703123456789")
 * @param {number} expirationMinutes - Tempo de expiração em minutos (padrão: 15)
 * @returns {Object} { code: string, isValid: boolean, isExpired: boolean, message?: string }
 */
function decodeCodeAndValidate(codeString, expirationMinutes = 15) {
  if (!codeString || typeof codeString !== 'string') {
    return {
      code: null,
      isValid: false,
      isExpired: false,
      message: 'Código inválido ou não fornecido'
    };
  }

  const parts = codeString.split(':');
  
  if (parts.length !== 2) {
    return {
      code: null,
      isValid: false,
      isExpired: false,
      message: 'Formato de código inválido'
    };
  }

  const [code, timestampStr] = parts;
  const timestamp = parseInt(timestampStr, 10);
  const now = Date.now();
  const expirationTime = expirationMinutes * 60 * 1000; // Converter minutos para milissegundos
  const elapsed = now - timestamp;

  // Validar formato do código (deve ser numérico de 4 dígitos)
  if (!/^\d{4}$/.test(code)) {
    return {
      code: null,
      isValid: false,
      isExpired: false,
      message: 'Formato de código inválido'
    };
  }

  // Verificar se expirou
  if (elapsed > expirationTime) {
    return {
      code: code,
      isValid: false,
      isExpired: true,
      message: 'Código expirado. Solicite um novo código.'
    };
  }

  // Verificar se timestamp é válido
  if (isNaN(timestamp) || timestamp > now) {
    return {
      code: code,
      isValid: false,
      isExpired: false,
      message: 'Timestamp inválido'
    };
  }

  return {
    code: code,
    isValid: true,
    isExpired: false,
    message: 'Código válido'
  };
}

/**
 * Compara um código fornecido pelo usuário com o código armazenado
 * @param {string} userCode - Código fornecido pelo usuário
 * @param {string} storedCodeString - Código armazenado no banco (com timestamp)
 * @param {number} expirationMinutes - Tempo de expiração em minutos (padrão: 15)
 * @returns {Object} { isValid: boolean, message: string }
 */
function validateRecoveryCode(userCode, storedCodeString, expirationMinutes = 15) {
  if (!userCode || !storedCodeString) {
    return {
      isValid: false,
      message: 'Código não fornecido'
    };
  }

  // Normalizar código do usuário (remover espaços)
  const normalizedUserCode = userCode.trim();

  // Validar formato do código do usuário
  if (!/^\d{4}$/.test(normalizedUserCode)) {
    return {
      isValid: false,
      message: 'Código deve conter 4 dígitos numéricos'
    };
  }

  // Decodificar e validar código armazenado
  const decoded = decodeCodeAndValidate(storedCodeString, expirationMinutes);

  if (!decoded.isValid) {
    return {
      isValid: false,
      message: decoded.message || 'Código inválido ou expirado'
    };
  }

  // Comparar códigos
  if (normalizedUserCode !== decoded.code) {
    return {
      isValid: false,
      message: 'Código incorreto'
    };
  }

  return {
    isValid: true,
    message: 'Código válido'
  };
}

module.exports = {
  generateRecoveryCode,
  encodeCodeWithTimestamp,
  decodeCodeAndValidate,
  validateRecoveryCode
};

