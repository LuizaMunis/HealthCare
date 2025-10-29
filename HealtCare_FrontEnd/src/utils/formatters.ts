// HealtCare_FrontEnd/src/utils/formatters.ts

// --- Funções genéricas para manipulação de números ---

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
  
  if (isNaN(numValue)) return '';
  
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
  if (!formattedValue || typeof formattedValue !== 'string') return 0;
  
  // Remove todos os caracteres não numéricos exceto ponto e vírgula
  const cleanValue = formattedValue.replace(/[^\d.,]/g, '');
  
  // Substitui vírgula por ponto para conversão correta
  const normalizedValue = cleanValue.replace(',', '.');
  
  const parsedValue = parseFloat(normalizedValue);
  
  return isNaN(parsedValue) ? 0 : parsedValue;
}

// --- Funções específicas para formatação de dados comuns no Brasil ---

// --- CPF ---
/**
 * Formata CPF com máscara (para exibição no front)
 * @param cpf - CPF com ou sem formatação
 * @returns CPF formatado (ex: 123.456.789-01)
 */
export function formatCPF(cpf: string): string {
  if (!cpf) return '';

  return cpf
    .replace(/\D/g, '')                                // só números
    .replace(/(\d{3})(\d)/, '$1.$2')                   // coloca o primeiro ponto
    .replace(/(\d{3})(\d)/, '$1.$2')                   // coloca o segundo ponto
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')             // coloca o traço
    .slice(0, 14);                                     // limita em 14 caracteres
}

/**
 * Remove a máscara do CPF (para salvar no backend)
 * @param cpf - CPF com ou sem formatação
 * @returns Somente números (ex: 12345678901)
 */
export function unmaskCPF(cpf: string): string {
  if (!cpf) return '';
  return cpf.replace(/\D/g, '');
}

// --- Celular ---
/**
 * Formata o número de celular dinamicamente com máscara (DD) XXXXX-XXXX.
 * Esta máscara é ideal para números de 11 dígitos.
 * @param celular - O número de telefone.
 * @returns Telefone formatado.
 */
export function formatCelular(celular: string): string {
  if (!celular) return '';
  return celular
    .replace(/\D/g, '')                  // Remove tudo o que não é dígito
    .replace(/(\d{2})(\d)/, '($1) $2')    // Coloca parênteses em volta dos dois primeiros dígitos
    .replace(/(\d{5})(\d)/, '$1-$2')      // Coloca hífen entre o quinto e o sexto dígitos
    .slice(0, 15);                       // Limita o tamanho
}

/**
 * Remove a máscara do celular para envio ao backend.
 * @param celular - Celular com ou sem formatação.
 * @returns Apenas os números do celular.
 */
export function unmaskCelular(celular: string): string {
  if (!celular) return '';
  return celular.replace(/\D/g, '');
}

// --- Data ---
/**
 * =========================================================================================
 * FUNÇÃO PARA USAR EM INPUTS (onChange)
 * =========================================================================================
 * Formata a data DINAMICAMENTE para o padrão brasileiro (DD/MM/YYYY) enquanto o usuário digita.
 * Use esta função no evento `onChange` do seu campo de texto.
 * * @param value - A string que o usuário está digitando no campo.
 * @returns A string com a máscara aplicada. Ex: "27/09/2025"
 */
export function formatDateForInput(value: string): string {
  if (!value) return '';

  // 1. Remove qualquer caractere que não seja número.
  // 2. Adiciona as barras nos lugares certos.
  // 3. Limita o tamanho total da string.
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .slice(0, 10);
}

/**
 * =========================================================================================
 * FUNÇÃO PARA EXIBIR DATAS DO BACKEND
 * =========================================================================================
 * Formata uma data que vem do backend (padrão ISO ou objeto Date) para o formato brasileiro (DD/MM/YYYY).
 * Use esta função para definir o valor inicial de um campo ou para mostrar uma data na tela.
 * * @param date - A data vinda do backend (ex: "2025-09-27T10:00:00Z" ou um objeto Date).
 * @returns A data formatada para leitura. Ex: "27/09/2025"
 */
export function formatDateForDisplay(date: string | Date): string {
  if (!date) return '';
  
  try {
    // Garante que a data seja interpretada corretamente, sem problemas de fuso horário
    const dateStr = typeof date === 'string' ? `${date.split('T')[0]}T00:00:00` : date;
    const dateObj = new Date(dateStr);
    
    if (isNaN(dateObj.getTime())) {
      return '';
    }
    
    // Retorna a data no formato local do Brasil
    return dateObj.toLocaleDateString('pt-BR');
  } catch {
    return '';
  }
}

/**
 * =========================================================================================
 * FUNÇÃO PARA ENVIAR DATAS PARA O BACKEND
 * =========================================================================================
 * Converte uma data do formato brasileiro (DD/MM/YYYY) de volta para o formato ISO (YYYY-MM-DD).
 * Use esta função antes de enviar os dados do formulário para a sua API.
 * * @param date - A data no formato 'DD/MM/YYYY' vinda do input.
 * @returns A data no formato 'YYYY-MM-DD', que é o padrão para bancos de dados.
 */
export function unmaskDate(date: string): string {
  if (!date) return '';

  const parts = date.split('/');
  
  if (parts.length === 3) {
    // [DD, MM, YYYY] -> YYYY-MM-DD
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  
  return date;
}

// --- Peso ---
/**
 * Formata o peso, limitando o valor a 500,00 kg durante a digitação.
 * @param peso - O valor do peso sendo digitado.
 * @returns Peso formatado, com vírgula e valor máximo de 500,00.
 */
export function formatPeso(peso: string): string {
  if (!peso) return '';

  // 1. Limpa a string para conter apenas números.
  const numbers = peso.replace(/\D/g, '');
  if (!numbers) return '';

  // 2. Regra UX:
  // - Para 1 ou 2 dígitos: mostrar como inteiro (sem vírgula) para evitar confusão
  // - A partir do 3º dígito: aplicar vírgula nos dois últimos
  if (numbers.length <= 2) {
    const inteiro = parseInt(numbers, 10);
    if (inteiro > 500) return '500';
    return String(inteiro);
  }

  // 3. Para 3+ dígitos, tratar como centavos de Kg
  const valorNumerico = parseInt(numbers, 10) / 100;
  if (valorNumerico > 500) return '500,00';

  const kg = numbers.slice(0, -2);
  const g = numbers.slice(-2);
  return `${kg},${g}`;

  return '';
}

/**
 * Converte o peso formatado para o padrão numérico com ponto (ex: 85.50).
 * @param peso - Peso formatado (ex: "85,50" ou ",55" ou "5").
 * @returns String de peso com ponto decimal.
 */
export function unmaskPeso(peso: string): string {
  if (!peso) return '';
  
  // Se começar com vírgula (ex: ",55"), adiciona "0" antes
  if (peso.startsWith(',')) {
    return `0${peso.replace(',', '.')}`;
  }
  
  // Se for apenas números (ex: "5"), adiciona ".00"
  if (!peso.includes(',') && !peso.includes('.')) {
    return `${peso}.00`;
  }
  
  return peso.replace(',', '.'); // converte vírgula em ponto
}

// --- Altura ---
/**
 * Formata a altura, permitindo apenas números e limitando o valor a 250 cm.
 * @param altura - O valor da altura sendo digitado.
 * @returns Altura formatada, com valor máximo de 250.
 */
export function formatAltura(altura: string): string {
  if (!altura) return '';

  // 1. Limpa a string para conter apenas números.
  const numbers = altura.replace(/\D/g, '');
  if (!numbers) return '';

  // 2. Converte para um valor numérico para validar o intervalo.
  const valorNumerico = parseInt(numbers, 10);

  // 3. Validação do limite MÁXIMO (250 cm).
  // Se o valor digitado ultrapassar 250, a máscara é travada em "250".
  if (valorNumerico > 250) {
    return '250';
  }

  // 4. Retorna os números digitados se estiverem dentro do limite.
  // O limite de 3 caracteres é naturalmente respeitado por esta lógica.
  return numbers;
}

/**
 * Remove qualquer formatação da altura (embora já deva ser apenas números).
 * @param altura - O valor da altura.
 * @returns Apenas os números da altura.
 */
export function unmaskAltura(altura: string): string {
  if (!altura) return '';
  return altura.replace(/\D/g, '');
}
// --- CEP ---
/**
 * Formata o CEP com máscara (para exibição no front)
 * @param cep - CEP com ou sem formatação
 * @returns CEP formatado (ex: 12345-678)
 */
export function formatCEP(cep: string): string {
  if (!cep) return '';
  
  return cep
    .replace(/\D/g, '')                  // só números
    .replace(/(\d{5})(\d)/, '$1-$2')     // coloca o traço
    .slice(0, 9);                        // limita em 9 caracteres
}

/**
 * Remove a máscara do CEP (para salvar no backend)
 * @param cep - CEP com ou sem formatação
 * @returns Somente números (ex: 12345678)
 */
export function unmaskCEP(cep: string): string {
  if (!cep) return '';
  return cep.replace(/\D/g, '');
}

// -- IMC ---
/**
 * Calcula o IMC (Índice de Massa Corporal) com base no peso e altura fornecidos.
 * @param peso - Peso em kg (ex: 70.5)
 * @param altura - Altura em cm (ex: 175)
 * @returns IMC formatado com duas casas decimais (ex: "23,04")
 */
export function calculateIMC(peso: number, altura: number): string {
  if (!peso || !altura) return '';

  const alturaEmMetros = altura / 100; // converte cm para metros
  const imc = peso / (alturaEmMetros * alturaEmMetros);

  return imc.toFixed(2).replace('.', ','); // formata com vírgula
}

/**
 * Classifica o IMC em categorias padrão.
 * @param imcValue - Valor do IMC como string (ex: "23,04")
 * @returns Categoria do IMC (ex: "Peso Normal")
 */
export function classifyIMC(imcValue: string): string {
  if (!imcValue) return '';
  
  const imc = parseFloat(imcValue.replace(',', '.')); // converte vírgula para ponto
  if (isNaN(imc)) return '';
  if (imc < 18.5) return 'Abaixo do Peso';
  if (imc < 24.9) return 'Peso Normal';
  if (imc < 29.9) return 'Sobrepeso';
  if (imc < 34.9) return 'Obesidade Grau I';
  if (imc < 39.9) return 'Obesidade Grau II';
  return 'Obesidade Grau III';
}
// --- CRM ---
/**
 * Formata o CRM com máscara (para exibição no front)
 * @param crm - CRM com ou sem formatação
 * @returns CRM formatado (ex: 123456-SP)
 */
export function formatCRM(crm: string): string {
  if (!crm) return '';
  
  return crm
    .replace(/\D/g, '')                              // só números e letras
    .replace(/(\d{1,6})([a-zA-Z]{0,2})/, '$1-$2')    // coloca o traço antes da UF
    .toUpperCase()                                   // converte para maiúsculas
    .slice(0, 9);                                    // limita em 9 caracteres
}

/**
 * Remove a máscara do CRM (para salvar no backend)
 * @param crm - CRM com ou sem formatação
 * @returns Somente números e letras (ex: 123456SP)
 */
export function unmaskCRM(crm: string): string {
  if (!crm) return '';
  return crm.replace(/\D/g, '').toUpperCase();
}

// --- Especialidade Médica ---
/**
 * Formata a especialidade médica com a primeira letra maiúscula e o restante minúsculo.
 * @param especialidade - Especialidade médica (ex: "cardiologia")
 * @returns Especialidade formatada (ex: "Cardiologia")
 */
export function formatEspecialidade(especialidade: string): string {
  if (!especialidade) return '';
  return especialidade.charAt(0).toUpperCase() + especialidade.slice(1).toLowerCase();
}

/**
 * Remove espaços extras da especialidade médica.
 * @param especialidade - Especialidade médica (ex: "  Cardiologia  ")
 * @returns Especialidade sem espaços extras (ex: "Cardiologia")
 */
export function unmaskEspecialidade(especialidade: string): string {
  if (!especialidade) return '';
  return especialidade.trim();
}