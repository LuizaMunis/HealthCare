// HealtCare_FrontEnd/src/utils/formatters.ts

/**
 * Formata um número para exibição no formato brasileiro (vírgula como separador decimal)
 */
export const formatNumberForDisplay = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) {
    return '';
  }
  
  // Converte para string com ponto como separador decimal
  const stringValue = numValue.toString();
  
  // Se tem parte decimal, formata com vírgula
  if (stringValue.includes('.')) {
    const [integerPart, decimalPart] = stringValue.split('.');
    return `${integerPart},${decimalPart}`;
  }
  
  return stringValue;
};

/**
 * Converte um valor formatado (com vírgula) para número
 */
export const parseFormattedNumber = (value: string): number | null => {
  if (!value || value.trim() === '') {
    return null;
  }
  
  // Remove caracteres não numéricos exceto vírgula e ponto
  const cleanValue = value.replace(/[^\d,.]/g, '');
  
  // Converte vírgula para ponto
  const normalizedValue = cleanValue.replace(',', '.');
  
  const result = parseFloat(normalizedValue);
  return isNaN(result) ? null : result;
};

/**
 * Valida se um peso está dentro do intervalo aceitável
 */
export const validateWeight = (weight: number): boolean => {
  return weight >= 20 && weight <= 500;
};

/**
 * Valida se uma altura está dentro do intervalo aceitável
 */
export const validateHeight = (height: number): boolean => {
  return height >= 50 && height <= 250;
};

/**
 * Formata peso para exibição
 */
export const formatWeight = (weight: number | string | null | undefined): string => {
  const formatted = formatNumberForDisplay(weight);
  return formatted ? `${formatted} kg` : '';
};

/**
 * Formata altura para exibição
 */
export const formatHeight = (height: number | string | null | undefined): string => {
  const formatted = formatNumberForDisplay(height);
  return formatted ? `${formatted} cm` : '';
};
