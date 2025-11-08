// HealtCare_FrontEnd/src/utils/validators.ts

import { unmaskCPF, unmaskCelular } from './formatters';

/**
 * Valida o nome.
 * @returns Uma string de erro se for inválido, ou null se for válido.
 */
export function validateName(name: string): string | null {
  if (!name || name.trim().length < 2) {
    return 'O nome deve ter pelo menos 2 caracteres.';
  }
  return null;
}

/**
 * Valida um CPF.
 * @returns Uma string de erro se for inválido, ou null se for válido.
 */
export function validateCPF(cpf: string): string | null {
  const cleanedCpf = unmaskCPF(cpf);
  
  // Permite campo vazio (se for opcional)
  if (cleanedCpf.length === 0) {
    return null; 
  }
  
  if (cleanedCpf.length !== 11) {
    return 'CPF deve conter 11 dígitos.';
  }

  // TODO: Adicionar a lógica completa de validação do dígito verificador aqui
  
  return null; // Válido
}

/**
 * Valida um número de celular.
 * @returns Uma string de erro se for inválido, ou null se for válido.
 */
export function validateCelular(celular: string): string | null {
  const cleanedCelular = unmaskCelular(celular);

  if (cleanedCelular.length === 0) {
    return null; // Permite campo opcional
  }

  if (cleanedCelular.length < 10 || cleanedCelular.length > 11) {
    return 'Celular deve ter 10 ou 11 dígitos (com DDD).';
  }
  
  return null;
}

/**
 * Valida uma data de nascimento.
 * @returns Uma string de erro se for inválida, ou null se for válida.
 */
export function validateDateOfBirth(dateStr: string): string | null {
  // Permite campo vazio (se for opcional)
  if (dateStr.length === 0) {
    return null;
  }
  
  if (dateStr.length !== 10) {
    return 'Data deve estar no formato DD/MM/AAAA.';
  }

  const parts = dateStr.split('/');
  if (parts.length !== 3) return 'Formato inválido.';
  
  const [day, month, year] = parts.map(Number);
  
  // Verifica se os números são razoáveis (básico)
  if (isNaN(day) || isNaN(month) || isNaN(year) || year < 1900) {
    return 'Data inválida.';
  }

  const dateObj = new Date(year, month - 1, day); // Mês é base 0
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Zera a hora para comparação

  // Verifica se a data é válida (ex: 31/02 é inválido)
  if (dateObj.getFullYear() !== year || dateObj.getMonth() + 1 !== month || dateObj.getDate() !== day) {
    return 'Data inválida (ex: 31/02/2000).';
  }

  if (dateObj > today) {
    return 'Data de nascimento não pode ser no futuro.';
  }

  return null; // Válido
}

/**
 * Valida peso (deve ser entre 40kg e 200kg, como no backend).
 * @returns Uma string de erro se for inválido, ou null se for válido.
 */
export function validatePeso(peso: string): string | null {
  if (peso.length === 0) {
    return null; // Permite campo opcional
  }
  
  // Converte '80,5' para 80.5
  const valor = parseFloat(peso.replace(',', '.'));
  
  if (isNaN(valor)) {
    return 'Peso deve ser um número válido.';
  }

  // Regra exata do backend (processWeight)
  if (valor < 2 || valor > 200) {
    return 'Peso deve estar entre 2 kg e 200 kg.';
  }
  
  return null;
}

/**
 * Valida altura (deve ser entre 50cm e 250cm, como no backend).
 * @returns Uma string de erro se for inválido, ou null se for válido.
 */
export function validateAltura(altura: string): string | null {
  if (altura.length === 0) {
    return null; // Permite campo opcional
  }
  
  const valor = parseInt(altura, 10);
  
  if (isNaN(valor)) {
    return 'Altura deve ser um número válido.';
  }

  // Regra exata do backend (processHeight)
  if (valor < 50 || valor > 250) {
    return 'Altura deve estar entre 50 cm e 250 cm.';
  }
  
  return null;
}