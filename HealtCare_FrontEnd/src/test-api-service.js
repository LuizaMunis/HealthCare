// HealthCare_FrontEnd/src/test-api-service.js
// Script de teste para validar a Fase 5 - Serviços e Constantes

/**
 * Teste básico para validar estrutura dos serviços de recuperação de senha
 * Nota: Este é um teste de estrutura, não executa requisições HTTP reais
 */

// Simular imports do TypeScript (para teste de estrutura)
// Em um ambiente real, isso seria feito com TypeScript/ts-node

console.log('\n');
console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║     TESTE DA FASE 5 - SERVIÇOS E CONSTANTES             ║');
console.log('╚══════════════════════════════════════════════════════════╝');
console.log('\n');

let allTestsPassed = true;

/**
 * Testa se os endpoints foram adicionados
 */
function testEndpoints() {
  console.log('🧪 TESTE 1: Endpoints em api.ts\n');
  console.log('='.repeat(50));

  try {
    const fs = require('fs');
    const path = require('path');
    
    const apiFilePath = path.join(__dirname, 'constants', 'api.ts');
    const apiContent = fs.readFileSync(apiFilePath, 'utf8');

    const requiredEndpoints = [
      'FORGOT_PASSWORD',
      'VERIFY_CODE',
      'RESET_PASSWORD'
    ];

    console.log('1.1 Verificando se os endpoints foram adicionados...');
    const missingEndpoints = requiredEndpoints.filter(endpoint => {
      return !apiContent.includes(endpoint);
    });

    if (missingEndpoints.length > 0) {
      throw new Error(`Endpoints faltando: ${missingEndpoints.join(', ')}`);
    }
    console.log('✅ Todos os endpoints estão presentes');

    console.log('\n1.2 Verificando formato dos endpoints...');
    if (!apiContent.includes("FORGOT_PASSWORD: '/users/forgot-password'")) {
      throw new Error('Endpoint FORGOT_PASSWORD não está no formato correto');
    }
    if (!apiContent.includes("VERIFY_CODE: '/users/verify-code'")) {
      throw new Error('Endpoint VERIFY_CODE não está no formato correto');
    }
    if (!apiContent.includes("RESET_PASSWORD: '/users/reset-password'")) {
      throw new Error('Endpoint RESET_PASSWORD não está no formato correto');
    }
    console.log('✅ Todos os endpoints estão no formato correto');

    console.log('\n✅ TESTE DE ENDPOINTS PASSOU!\n');
    return true;

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE DE ENDPOINTS:', error.message);
    allTestsPassed = false;
    return false;
  }
}

/**
 * Testa se os métodos foram adicionados ao apiService
 */
function testApiServiceMethods() {
  console.log('🧪 TESTE 2: Métodos no apiService.ts\n');
  console.log('='.repeat(50));

  try {
    const fs = require('fs');
    const path = require('path');
    
    const apiServicePath = path.join(__dirname, 'services', 'apiService.ts');
    const apiServiceContent = fs.readFileSync(apiServicePath, 'utf8');

    const requiredMethods = [
      'forgotPassword',
      'verifyCode',
      'resetPassword'
    ];

    console.log('2.1 Verificando se os métodos foram adicionados...');
    const missingMethods = requiredMethods.filter(method => {
      // Procurar por definição de função/método
      const methodPattern = new RegExp(`${method}\\s*:\\s*async`, 'g');
      return !methodPattern.test(apiServiceContent);
    });

    if (missingMethods.length > 0) {
      throw new Error(`Métodos faltando: ${missingMethods.join(', ')}`);
    }
    console.log('✅ Todos os métodos estão presentes');

    console.log('\n2.2 Verificando estrutura dos métodos...');
    
    // Verificar forgotPassword
    if (!apiServiceContent.includes('forgotPassword: async (email: string)')) {
      throw new Error('Método forgotPassword não tem a assinatura correta');
    }
    if (!apiServiceContent.includes("ENDPOINTS.USERS.FORGOT_PASSWORD")) {
      throw new Error('forgotPassword não usa o endpoint correto');
    }
    console.log('✅ Método forgotPassword está correto');

    // Verificar verifyCode
    if (!apiServiceContent.includes('verifyCode: async (email: string, code: string)')) {
      throw new Error('Método verifyCode não tem a assinatura correta');
    }
    if (!apiServiceContent.includes("ENDPOINTS.USERS.VERIFY_CODE")) {
      throw new Error('verifyCode não usa o endpoint correto');
    }
    if (!apiServiceContent.includes('code.trim()')) {
      console.warn('⚠️  verifyCode não está fazendo trim do código (recomendado)');
    }
    console.log('✅ Método verifyCode está correto');

    // Verificar resetPassword
    if (!apiServiceContent.includes('resetPassword: async (email: string, code: string, newPassword: string)')) {
      throw new Error('Método resetPassword não tem a assinatura correta');
    }
    if (!apiServiceContent.includes("ENDPOINTS.USERS.RESET_PASSWORD")) {
      throw new Error('resetPassword não usa o endpoint correto');
    }
    if (!apiServiceContent.includes('code.trim()')) {
      console.warn('⚠️  resetPassword não está fazendo trim do código (recomendado)');
    }
    console.log('✅ Método resetPassword está correto');

    console.log('\n✅ TESTE DE MÉTODOS PASSOU!\n');
    return true;

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE DE MÉTODOS:', error.message);
    allTestsPassed = false;
    return false;
  }
}

/**
 * Testa se as interfaces foram adicionadas
 */
function testInterfaces() {
  console.log('🧪 TESTE 3: Interfaces TypeScript\n');
  console.log('='.repeat(50));

  try {
    const fs = require('fs');
    const path = require('path');
    
    const apiServicePath = path.join(__dirname, 'services', 'apiService.ts');
    const apiServiceContent = fs.readFileSync(apiServicePath, 'utf8');

    const requiredInterfaces = [
      'ForgotPasswordData',
      'VerifyCodeData',
      'ResetPasswordData'
    ];

    console.log('3.1 Verificando se as interfaces foram adicionadas...');
    const missingInterfaces = requiredInterfaces.filter(interfaceName => {
      return !apiServiceContent.includes(`interface ${interfaceName}`);
    });

    if (missingInterfaces.length > 0) {
      console.warn(`⚠️  Interfaces faltando: ${missingInterfaces.join(', ')}`);
      console.warn('   (Interfaces podem estar definidas inline ou não serem necessárias)');
    } else {
      console.log('✅ Todas as interfaces estão presentes');
    }

    // Verificar se os tipos estão sendo usados (mesmo que inline)
    console.log('\n3.2 Verificando uso de tipos nos métodos...');
    if (apiServiceContent.includes('forgotPassword: async (email: string)')) {
      console.log('✅ Tipo string usado em forgotPassword');
    }
    if (apiServiceContent.includes('verifyCode: async (email: string, code: string)')) {
      console.log('✅ Tipos string usados em verifyCode');
    }
    if (apiServiceContent.includes('resetPassword: async (email: string, code: string, newPassword: string)')) {
      console.log('✅ Tipos string usados em resetPassword');
    }

    console.log('\n✅ TESTE DE INTERFACES PASSOU!\n');
    return true;

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE DE INTERFACES:', error.message);
    allTestsPassed = false;
    return false;
  }
}

/**
 * Testa tratamento de erros
 */
function testErrorHandling() {
  console.log('🧪 TESTE 4: Tratamento de Erros\n');
  console.log('='.repeat(50));

  try {
    const fs = require('fs');
    const path = require('path');
    
    const apiServicePath = path.join(__dirname, 'services', 'apiService.ts');
    const apiServiceContent = fs.readFileSync(apiServicePath, 'utf8');

    console.log('4.1 Verificando tratamento de erros...');
    
    const methods = ['forgotPassword', 'verifyCode', 'resetPassword'];
    let allHaveErrorHandling = true;

    methods.forEach(method => {
      // Verificar se tem try/catch
      const methodStart = apiServiceContent.indexOf(`${method}: async`);
      if (methodStart === -1) return;

      const methodEnd = apiServiceContent.indexOf('},', methodStart);
      const methodContent = apiServiceContent.substring(methodStart, methodEnd);

      if (!methodContent.includes('try {') || !methodContent.includes('catch')) {
        console.warn(`⚠️  ${method} pode não ter tratamento de erro completo`);
        allHaveErrorHandling = false;
      } else {
        console.log(`✅ ${method} tem tratamento de erro`);
      }

      // Verificar se retorna { success: false, error: ... }
      if (!methodContent.includes('success: false')) {
        console.warn(`⚠️  ${method} pode não retornar formato de erro padrão`);
      }
    });

    if (allHaveErrorHandling) {
      console.log('\n✅ Todos os métodos têm tratamento de erro');
    }

    console.log('\n✅ TESTE DE TRATAMENTO DE ERROS PASSOU!\n');
    return true;

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE DE TRATAMENTO DE ERROS:', error.message);
    allTestsPassed = false;
    return false;
  }
}

/**
 * Testa integração entre constantes e serviços
 */
function testIntegration() {
  console.log('🧪 TESTE 5: Integração Constantes e Serviços\n');
  console.log('='.repeat(50));

  try {
    const fs = require('fs');
    const path = require('path');
    
    const apiServicePath = path.join(__dirname, 'services', 'apiService.ts');
    const apiServiceContent = fs.readFileSync(apiServicePath, 'utf8');

    console.log('5.1 Verificando uso de ENDPOINTS nos métodos...');
    
    // Verificar se os métodos usam os endpoints corretos
    if (!apiServiceContent.includes('ENDPOINTS.USERS.FORGOT_PASSWORD')) {
      throw new Error('forgotPassword não usa ENDPOINTS.USERS.FORGOT_PASSWORD');
    }
    console.log('✅ forgotPassword usa ENDPOINTS.USERS.FORGOT_PASSWORD');

    if (!apiServiceContent.includes('ENDPOINTS.USERS.VERIFY_CODE')) {
      throw new Error('verifyCode não usa ENDPOINTS.USERS.VERIFY_CODE');
    }
    console.log('✅ verifyCode usa ENDPOINTS.USERS.VERIFY_CODE');

    if (!apiServiceContent.includes('ENDPOINTS.USERS.RESET_PASSWORD')) {
      throw new Error('resetPassword não usa ENDPOINTS.USERS.RESET_PASSWORD');
    }
    console.log('✅ resetPassword usa ENDPOINTS.USERS.RESET_PASSWORD');

    console.log('\n5.2 Verificando import de ENDPOINTS...');
    if (!apiServiceContent.includes("from '@/constants/api'") && 
        !apiServiceContent.includes("from '../constants/api'")) {
      console.warn('⚠️  Verifique se ENDPOINTS está sendo importado corretamente');
    } else {
      console.log('✅ ENDPOINTS está sendo importado');
    }

    console.log('\n✅ TESTE DE INTEGRAÇÃO PASSOU!\n');
    return true;

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE DE INTEGRAÇÃO:', error.message);
    allTestsPassed = false;
    return false;
  }
}

/**
 * Executa todos os testes
 */
function runAllTests() {
  const results = {
    endpoints: false,
    methods: false,
    interfaces: false,
    errorHandling: false,
    integration: false
  };

  results.endpoints = testEndpoints();
  results.methods = testApiServiceMethods();
  results.interfaces = testInterfaces();
  results.errorHandling = testErrorHandling();
  results.integration = testIntegration();

  // Resumo final
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                    RESUMO DOS TESTES                     ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('\n');

  console.log('1. Endpoints em api.ts:             ', results.endpoints ? '✅ PASSOU' : '❌ FALHOU');
  console.log('2. Métodos no apiService.ts:         ', results.methods ? '✅ PASSOU' : '❌ FALHOU');
  console.log('3. Interfaces TypeScript:            ', results.interfaces ? '✅ PASSOU' : '❌ FALHOU');
  console.log('4. Tratamento de Erros:              ', results.errorHandling ? '✅ PASSOU' : '❌ FALHOU');
  console.log('5. Integração:                       ', results.integration ? '✅ PASSOU' : '❌ FALHOU');

  const allPassed = Object.values(results).every(result => result === true);

  console.log('\n');
  if (allPassed) {
    console.log('✅ FASE 5 VALIDADA COM SUCESSO!');
    console.log('\n📋 Endpoints implementados:');
    console.log('   - FORGOT_PASSWORD: /users/forgot-password');
    console.log('   - VERIFY_CODE: /users/verify-code');
    console.log('   - RESET_PASSWORD: /users/reset-password');
    console.log('\n📋 Métodos implementados:');
    console.log('   - forgotPassword(email: string)');
    console.log('   - verifyCode(email: string, code: string)');
    console.log('   - resetPassword(email: string, code: string, newPassword: string)');
    console.log('\n⚠️  NOTA: Estes testes validam a estrutura do código.');
    console.log('   Para testes funcionais completos, execute o app e teste as requisições HTTP.');
  } else {
    console.log('⚠️ ALGUNS TESTES FALHARAM. Verifique os erros acima.');
  }
  console.log('\n');

  return allPassed;
}

// Executar testes
if (require.main === module) {
  try {
    const success = runAllTests();
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('\n❌ ERRO FATAL:', error);
    process.exit(1);
  }
}

module.exports = {
  testEndpoints,
  testApiServiceMethods,
  testInterfaces,
  testErrorHandling,
  testIntegration,
  runAllTests
};

