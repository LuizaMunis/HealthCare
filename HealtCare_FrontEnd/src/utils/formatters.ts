// HealtCare_FrontEnd/src/utils/formatters.ts

/**
 * Formata um número para exibição com separadores de milhares
 * @param value - O valor numérico a ser formatado
 * @returns String formatada com separadores de milhares
 */
export function formatNumberForDisplay(value: number | string): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) {
    return '';
  }
  
  return numValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
}

/**
 * Converte um número formatado de volta para um valor numérico
 * @param formattedValue - O valor formatado como string
 * @returns Número sem formatação
 */
export function parseFormattedNumber(formattedValue: string): number {
  if (!formattedValue || typeof formattedValue !== 'string') {
    return 0;
  }
  
  // Remove todos os caracteres não numéricos exceto ponto e vírgula
  const cleanValue = formattedValue.replace(/[^\d.,]/g, '');
  
  // Substitui vírgula por ponto para conversão correta
  const normalizedValue = cleanValue.replace(',', '.');
  
  const parsedValue = parseFloat(normalizedValue);
  
  return isNaN(parsedValue) ? 0 : parsedValue;
}

/**
 * Formata um número de telefone brasileiro
 * @param phone - O número de telefone
 * @returns Telefone formatado
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remove todos os caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Aplica máscara baseada no tamanho
  if (cleanPhone.length === 11) {
    return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 3)} ${cleanPhone.slice(3, 7)}-${cleanPhone.slice(7)}`;
  } else if (cleanPhone.length === 10) {
    return `(${cleanPhone.slice(0, 2)}) ${cleanPhone.slice(2, 6)}-${cleanPhone.slice(6)}`;
  }
  
  return cleanPhone;
}

/**
 * Formata CPF com máscara
 * @param cpf - O CPF sem formatação
 * @returns CPF formatado
 */
export function formatCPF(cpf: string): string {
  if (!cpf) return '';
  
  // Remove todos os caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Aplica máscara do CPF
  if (cleanCPF.length <= 11) {
    return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  return cleanCPF;
}

/**
 * Formata data para exibição no formato brasileiro
 * @param date - Data em formato ISO ou Date
 * @returns Data formatada como DD/MM/YYYY
 */
export function formatDate(date: string | Date): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    return dateObj.toLocaleDateString('pt-BR');
  } catch (error) {
    return '';
  }
}
