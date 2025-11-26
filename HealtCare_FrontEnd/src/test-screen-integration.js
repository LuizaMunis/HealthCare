// HealthCare_FrontEnd/src/test-screen-integration.js
// Script de teste para validar a Fase 6 - Integração nas Telas

const fs = require('fs');
const path = require('path');

console.log('\n');
console.log('╔══════════════════════════════════════════════════════════╗');
console.log('║     TESTE DA FASE 6 - INTEGRAÇÃO NAS TELAS               ║');
console.log('╚══════════════════════════════════════════════════════════╝');
console.log('\n');

let allTestsPassed = true;

/**
 * Testa a integração na tela forgot-password.tsx
 */
function testForgotPasswordScreen() {
  console.log('🧪 TESTE 1: Tela forgot-password.tsx\n');
  console.log('='.repeat(50));

  try {
    const filePath = path.join(__dirname, 'app', 'forgot-password', 'forgot-password.tsx');
    const content = fs.readFileSync(filePath, 'utf8');

    console.log('1.1 Verificando import do ApiService...');
    if (!content.includes("import ApiService from '@/services/apiService'") && 
        !content.includes("from '../services/apiService'") &&
        !content.includes("from '../../services/apiService'")) {
      throw new Error('ApiService não está sendo importado');
    }
    console.log('✅ ApiService está sendo importado');

    console.log('\n1.2 Verificando se a simulação foi removida...');
    if (content.includes('LÓGICA DA API (Simulação)') || 
        content.includes('Simulação')) {
      throw new Error('Simulação ainda está presente no código');
    }
    console.log('✅ Simulação foi removida');

    console.log('\n1.3 Verificando chamada real à API...');
    if (!content.includes('ApiService.forgotPassword')) {
      throw new Error('Chamada à API não encontrada');
    }
    console.log('✅ Chamada real à API está presente');

    console.log('\n1.4 Verificando estado de loading...');
    if (!content.includes('isLoading') || !content.includes('setIsLoading')) {
      throw new Error('Estado de loading não foi adicionado');
    }
    console.log('✅ Estado de loading está presente');

    console.log('\n1.5 Verificando ActivityIndicator...');
    if (!content.includes('ActivityIndicator')) {
      throw new Error('ActivityIndicator não foi adicionado');
    }
    console.log('✅ ActivityIndicator está presente');

    console.log('\n1.6 Verificando tratamento de erros...');
    if (!content.includes('try {') || !content.includes('catch')) {
      throw new Error('Tratamento de erros não encontrado');
    }
    console.log('✅ Tratamento de erros está presente');

    console.log('\n1.7 Verificando validação de email...');
    if (!content.includes('emailRegex') && !content.includes('email.trim()')) {
      console.warn('⚠️  Validação de email pode não estar completa');
    } else {
      console.log('✅ Validação de email está presente');
    }

    console.log('\n✅ TESTE DA TELA forgot-password.tsx PASSOU!\n');
    return true;

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    allTestsPassed = false;
    return false;
  }
}

/**
 * Testa a integração na tela verify-code.tsx
 */
function testVerifyCodeScreen() {
  console.log('🧪 TESTE 2: Tela verify-code.tsx\n');
  console.log('='.repeat(50));

  try {
    const filePath = path.join(__dirname, 'app', 'forgot-password', 'verify-code.tsx');
    const content = fs.readFileSync(filePath, 'utf8');

    console.log('2.1 Verificando import do ApiService...');
    if (!content.includes("import ApiService from '@/services/apiService'") && 
        !content.includes("from '../services/apiService'") &&
        !content.includes("from '../../services/apiService'")) {
      throw new Error('ApiService não está sendo importado');
    }
    console.log('✅ ApiService está sendo importado');

    console.log('\n2.2 Verificando se a simulação foi removida...');
    if (content.includes('LÓGICA DA API (Simulação)') || 
        content.includes('Simulação')) {
      throw new Error('Simulação ainda está presente no código');
    }
    console.log('✅ Simulação foi removida');

    console.log('\n2.3 Verificando chamada real à API...');
    if (!content.includes('ApiService.verifyCode')) {
      throw new Error('Chamada à API não encontrada');
    }
    console.log('✅ Chamada real à API está presente');

    console.log('\n2.4 Verificando estado de loading...');
    if (!content.includes('isLoading') || !content.includes('setIsLoading')) {
      throw new Error('Estado de loading não foi adicionado');
    }
    console.log('✅ Estado de loading está presente');

    console.log('\n2.5 Verificando ActivityIndicator...');
    if (!content.includes('ActivityIndicator')) {
      throw new Error('ActivityIndicator não foi adicionado');
    }
    console.log('✅ ActivityIndicator está presente');

    console.log('\n2.6 Verificando tratamento de erros...');
    if (!content.includes('try {') || !content.includes('catch')) {
      throw new Error('Tratamento de erros não encontrado');
    }
    console.log('✅ Tratamento de erros está presente');

    console.log('\n2.7 Verificando validação de email...');
    if (!content.includes('email') || !content.includes('!email')) {
      console.warn('⚠️  Validação de email pode não estar completa');
    } else {
      console.log('✅ Validação de email está presente');
    }

    console.log('\n✅ TESTE DA TELA verify-code.tsx PASSOU!\n');
    return true;

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    allTestsPassed = false;
    return false;
  }
}

/**
 * Testa a integração na tela reset-password.tsx
 */
function testResetPasswordScreen() {
  console.log('🧪 TESTE 3: Tela reset-password.tsx\n');
  console.log('='.repeat(50));

  try {
    const filePath = path.join(__dirname, 'app', 'forgot-password', 'reset-password.tsx');
    const content = fs.readFileSync(filePath, 'utf8');

    console.log('3.1 Verificando import do ApiService...');
    if (!content.includes("import ApiService from '@/services/apiService'") && 
        !content.includes("from '../services/apiService'") &&
        !content.includes("from '../../services/apiService'")) {
      throw new Error('ApiService não está sendo importado');
    }
    console.log('✅ ApiService está sendo importado');

    console.log('\n3.2 Verificando se a simulação foi removida...');
    if (content.includes('LÓGICA DA API (Simulação)') || 
        content.includes('Simulação')) {
      throw new Error('Simulação ainda está presente no código');
    }
    console.log('✅ Simulação foi removida');

    console.log('\n3.3 Verificando chamada real à API...');
    if (!content.includes('ApiService.resetPassword')) {
      throw new Error('Chamada à API não encontrada');
    }
    console.log('✅ Chamada real à API está presente');

    console.log('\n3.4 Verificando estado de loading...');
    if (!content.includes('isLoading') || !content.includes('setIsLoading')) {
      throw new Error('Estado de loading não foi adicionado');
    }
    console.log('✅ Estado de loading está presente');

    console.log('\n3.5 Verificando ActivityIndicator...');
    if (!content.includes('ActivityIndicator')) {
      throw new Error('ActivityIndicator não foi adicionado');
    }
    console.log('✅ ActivityIndicator está presente');

    console.log('\n3.6 Verificando tratamento de erros...');
    if (!content.includes('try {') || !content.includes('catch')) {
      throw new Error('Tratamento de erros não encontrado');
    }
    console.log('✅ Tratamento de erros está presente');

    console.log('\n3.7 Verificando validações de senha...');
    if (!content.includes('newPassword.length < 6') && !content.includes('length < 6')) {
      console.warn('⚠️  Validação de tamanho mínimo de senha pode não estar presente');
    } else {
      console.log('✅ Validação de senha está presente');
    }

    console.log('\n3.8 Verificando redirecionamento para login...');
    if (!content.includes("router.replace('/login')") && !content.includes("router.replace(\"/login\")")) {
      console.warn('⚠️  Redirecionamento para login pode não estar presente');
    } else {
      console.log('✅ Redirecionamento para login está presente');
    }

    console.log('\n✅ TESTE DA TELA reset-password.tsx PASSOU!\n');
    return true;

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    allTestsPassed = false;
    return false;
  }
}

/**
 * Testa consistência entre as telas
 */
function testConsistency() {
  console.log('🧪 TESTE 4: Consistência entre Telas\n');
  console.log('='.repeat(50));

  try {
    const files = [
      path.join(__dirname, 'app', 'forgot-password', 'forgot-password.tsx'),
      path.join(__dirname, 'app', 'forgot-password', 'verify-code.tsx'),
      path.join(__dirname, 'app', 'forgot-password', 'reset-password.tsx')
    ];

    console.log('4.1 Verificando se todas as telas têm tratamento de erros...');
    let allHaveErrorHandling = true;
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      if (!content.includes('try {') || !content.includes('catch')) {
        allHaveErrorHandling = false;
      }
    });
    if (!allHaveErrorHandling) {
      throw new Error('Nem todas as telas têm tratamento de erros');
    }
    console.log('✅ Todas as telas têm tratamento de erros');

    console.log('\n4.2 Verificando se todas as telas têm loading...');
    let allHaveLoading = true;
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      if (!content.includes('isLoading')) {
        allHaveLoading = false;
      }
    });
    if (!allHaveLoading) {
      throw new Error('Nem todas as telas têm estado de loading');
    }
    console.log('✅ Todas as telas têm estado de loading');

    console.log('\n4.3 Verificando se todas as telas têm ActivityIndicator...');
    let allHaveIndicator = true;
    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      if (!content.includes('ActivityIndicator')) {
        allHaveIndicator = false;
      }
    });
    if (!allHaveIndicator) {
      throw new Error('Nem todas as telas têm ActivityIndicator');
    }
    console.log('✅ Todas as telas têm ActivityIndicator');

    console.log('\n✅ TESTE DE CONSISTÊNCIA PASSOU!\n');
    return true;

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    allTestsPassed = false;
    return false;
  }
}

/**
 * Executa todos os testes
 */
function runAllTests() {
  const results = {
    forgotPassword: false,
    verifyCode: false,
    resetPassword: false,
    consistency: false
  };

  results.forgotPassword = testForgotPasswordScreen();
  results.verifyCode = testVerifyCodeScreen();
  results.resetPassword = testResetPasswordScreen();
  results.consistency = testConsistency();

  // Resumo final
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                    RESUMO DOS TESTES                     ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('\n');

  console.log('1. Tela forgot-password.tsx:        ', results.forgotPassword ? '✅ PASSOU' : '❌ FALHOU');
  console.log('2. Tela verify-code.tsx:            ', results.verifyCode ? '✅ PASSOU' : '❌ FALHOU');
  console.log('3. Tela reset-password.tsx:        ', results.resetPassword ? '✅ PASSOU' : '❌ FALHOU');
  console.log('4. Consistência entre telas:        ', results.consistency ? '✅ PASSOU' : '❌ FALHOU');

  const allPassed = Object.values(results).every(result => result === true);

  console.log('\n');
  if (allPassed) {
    console.log('✅ FASE 6 VALIDADA COM SUCESSO!');
    console.log('\n📋 Integrações implementadas:');
    console.log('   - forgot-password.tsx: ApiService.forgotPassword()');
    console.log('   - verify-code.tsx: ApiService.verifyCode()');
    console.log('   - reset-password.tsx: ApiService.resetPassword()');
    console.log('\n📋 Melhorias implementadas:');
    console.log('   - Estados de loading em todas as telas');
    console.log('   - ActivityIndicator para feedback visual');
    console.log('   - Tratamento de erros completo');
    console.log('   - Validações de entrada');
    console.log('\n⚠️  NOTA: Estes testes validam a estrutura do código.');
    console.log('   Para testes funcionais completos, execute o app e teste o fluxo completo.');
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
  testForgotPasswordScreen,
  testVerifyCodeScreen,
  testResetPasswordScreen,
  testConsistency,
  runAllTests
};

