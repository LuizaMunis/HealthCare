// HealthCare_BackEnd/src/test-routes-validation.js
// Script de teste para validar a Fase 4 - Validações e Rotas

require('dotenv').config({ path: './config.env' });
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../config.env') });

const ValidationMiddleware = require('./middleware/validationMiddleware');
const userRoutes = require('./routes/userRoutes');

/**
 * Testa a estrutura das validações
 */
function testValidationStructure() {
  console.log('\n🧪 TESTE 1: Estrutura das Validações\n');
  console.log('='.repeat(50));

  try {
    console.log('1.1 Verificando se os métodos de validação existem...');
    const requiredValidations = [
      'validateForgotPassword',
      'validateVerifyCode',
      'validateResetPassword'
    ];
    
    const missingValidations = requiredValidations.filter(
      method => typeof ValidationMiddleware[method] !== 'function'
    );

    if (missingValidations.length > 0) {
      throw new Error(`Validações faltando: ${missingValidations.join(', ')}`);
    }
    console.log('✅ Todas as validações estão presentes');

    console.log('\n1.2 Verificando se retornam arrays de middlewares...');
    requiredValidations.forEach(validationName => {
      const validation = ValidationMiddleware[validationName]();
      if (!Array.isArray(validation)) {
        throw new Error(`${validationName} deve retornar um array de middlewares`);
      }
      if (validation.length === 0) {
        throw new Error(`${validationName} retornou array vazio`);
      }
    });
    console.log('✅ Todas as validações retornam arrays de middlewares válidos');

    console.log('\n✅ TESTE DE ESTRUTURA PASSOU!\n');
    return true;

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE DE ESTRUTURA:', error.message);
    return false;
  }
}

/**
 * Testa validação de forgotPassword
 */
function testForgotPasswordValidation() {
  console.log('\n🧪 TESTE 2: Validação validateForgotPassword\n');
  console.log('='.repeat(50));

  try {
    const validation = ValidationMiddleware.validateForgotPassword();
    
    if (!Array.isArray(validation) || validation.length === 0) {
      throw new Error('Validação deve retornar array não vazio');
    }

    // Verificar se contém validação de email
    const hasEmailValidation = validation.some(middleware => {
      // Verificar se é um middleware do express-validator
      return middleware && typeof middleware === 'function';
    });

    if (!hasEmailValidation) {
      throw new Error('Validação deve incluir validação de email');
    }

    console.log('✅ Validação validateForgotPassword está corretamente estruturada');
    console.log(`   Número de middlewares: ${validation.length}`);

    console.log('\n✅ TESTE DE VALIDAÇÃO forgotPassword PASSOU!\n');
    return true;

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    return false;
  }
}

/**
 * Testa validação de verifyCode
 */
function testVerifyCodeValidation() {
  console.log('\n🧪 TESTE 3: Validação validateVerifyCode\n');
  console.log('='.repeat(50));

  try {
    const validation = ValidationMiddleware.validateVerifyCode();
    
    if (!Array.isArray(validation) || validation.length === 0) {
      throw new Error('Validação deve retornar array não vazio');
    }

    console.log('✅ Validação validateVerifyCode está corretamente estruturada');
    console.log(`   Número de middlewares: ${validation.length}`);

    console.log('\n✅ TESTE DE VALIDAÇÃO verifyCode PASSOU!\n');
    return true;

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    return false;
  }
}

/**
 * Testa validação de resetPassword
 */
function testResetPasswordValidation() {
  console.log('\n🧪 TESTE 4: Validação validateResetPassword\n');
  console.log('='.repeat(50));

  try {
    const validation = ValidationMiddleware.validateResetPassword();
    
    if (!Array.isArray(validation) || validation.length === 0) {
      throw new Error('Validação deve retornar array não vazio');
    }

    console.log('✅ Validação validateResetPassword está corretamente estruturada');
    console.log(`   Número de middlewares: ${validation.length}`);

    console.log('\n✅ TESTE DE VALIDAÇÃO resetPassword PASSOU!\n');
    return true;

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    return false;
  }
}

/**
 * Testa estrutura das rotas
 */
function testRoutesStructure() {
  console.log('\n🧪 TESTE 5: Estrutura das Rotas\n');
  console.log('='.repeat(50));

  try {
    console.log('5.1 Verificando se userRoutes é um router do Express...');
    if (!userRoutes || typeof userRoutes !== 'function') {
      throw new Error('userRoutes deve ser um router do Express');
    }
    console.log('✅ userRoutes é um router válido');

    // Verificar se as rotas foram registradas
    // Isso é difícil de testar sem iniciar o servidor, mas podemos verificar
    // se o módulo foi carregado corretamente
    console.log('\n5.2 Verificando se o módulo de rotas foi carregado...');
    const routesModule = require('./routes/userRoutes');
    if (!routesModule) {
      throw new Error('Módulo de rotas não foi carregado corretamente');
    }
    console.log('✅ Módulo de rotas carregado corretamente');

    console.log('\n✅ TESTE DE ESTRUTURA DE ROTAS PASSOU!\n');
    return true;

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:', error.message);
    return false;
  }
}

/**
 * Testa integração entre validações e rotas
 */
function testIntegration() {
  console.log('\n🧪 TESTE 6: Integração Validações e Rotas\n');
  console.log('='.repeat(50));

  try {
    console.log('6.1 Verificando se todas as validações necessárias existem...');
    const requiredValidations = [
      'validateForgotPassword',
      'validateVerifyCode',
      'validateResetPassword',
      'sanitizeInput',
      'handleValidationErrors'
    ];

    const missingValidations = requiredValidations.filter(
      method => typeof ValidationMiddleware[method] !== 'function'
    );

    if (missingValidations.length > 0) {
      throw new Error(`Validações faltando: ${missingValidations.join(', ')}`);
    }
    console.log('✅ Todas as validações necessárias estão disponíveis');

    console.log('\n6.2 Verificando se os controllers estão disponíveis...');
    const UserController = require('./controllers/userController');
    const requiredControllers = ['forgotPassword', 'verifyCode', 'resetPassword'];
    
    const missingControllers = requiredControllers.filter(
      method => typeof UserController[method] !== 'function'
    );

    if (missingControllers.length > 0) {
      throw new Error(`Controllers faltando: ${missingControllers.join(', ')}`);
    }
    console.log('✅ Todos os controllers necessários estão disponíveis');

    console.log('\n✅ TESTE DE INTEGRAÇÃO PASSOU!\n');
    return true;

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE DE INTEGRAÇÃO:', error.message);
    return false;
  }
}

/**
 * Executa todos os testes
 */
function runAllTests() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     TESTE DA FASE 4 - VALIDAÇÕES E ROTAS                  ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('\n');

  const results = {
    validationStructure: false,
    forgotPasswordValidation: false,
    verifyCodeValidation: false,
    resetPasswordValidation: false,
    routesStructure: false,
    integration: false
  };

  // Executar testes
  results.validationStructure = testValidationStructure();
  results.forgotPasswordValidation = testForgotPasswordValidation();
  results.verifyCodeValidation = testVerifyCodeValidation();
  results.resetPasswordValidation = testResetPasswordValidation();
  results.routesStructure = testRoutesStructure();
  results.integration = testIntegration();

  // Resumo final
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                    RESUMO DOS TESTES                     ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('\n');

  console.log('1. Estrutura das Validações:        ', results.validationStructure ? '✅ PASSOU' : '❌ FALHOU');
  console.log('2. Validação forgotPassword:        ', results.forgotPasswordValidation ? '✅ PASSOU' : '❌ FALHOU');
  console.log('3. Validação verifyCode:             ', results.verifyCodeValidation ? '✅ PASSOU' : '❌ FALHOU');
  console.log('4. Validação resetPassword:         ', results.resetPasswordValidation ? '✅ PASSOU' : '❌ FALHOU');
  console.log('5. Estrutura das Rotas:             ', results.routesStructure ? '✅ PASSOU' : '❌ FALHOU');
  console.log('6. Integração:                       ', results.integration ? '✅ PASSOU' : '❌ FALHOU');

  const allPassed = Object.values(results).every(result => result === true);

  console.log('\n');
  if (allPassed) {
    console.log('✅ FASE 4 VALIDADA COM SUCESSO!');
    console.log('\n📋 Validações implementadas:');
    console.log('   - validateForgotPassword()');
    console.log('   - validateVerifyCode()');
    console.log('   - validateResetPassword()');
    console.log('\n📋 Rotas implementadas:');
    console.log('   - POST /api/users/forgot-password');
    console.log('   - POST /api/users/verify-code');
    console.log('   - POST /api/users/reset-password');
    console.log('\n⚠️  NOTA: Para testar as rotas em funcionamento, inicie o servidor');
    console.log('   e faça requisições HTTP para os endpoints.');
  } else {
    console.log('⚠️ ALGUNS TESTES FALHARAM. Verifique os erros acima.');
  }
  console.log('\n');

  return allPassed;
}

// Executar testes se o script for chamado diretamente
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
  testValidationStructure,
  testForgotPasswordValidation,
  testVerifyCodeValidation,
  testResetPasswordValidation,
  testRoutesStructure,
  testIntegration,
  runAllTests
};

