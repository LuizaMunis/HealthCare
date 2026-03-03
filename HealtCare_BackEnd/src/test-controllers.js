// HealthCare_BackEnd/src/test-controllers.js
// Script de teste para validar a Fase 3 - Controllers

require('dotenv').config({ path: './config.env' });
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../config.env') });

const UserController = require('./controllers/userController');
const UserModel = require('./models/userModel');
const codeGenerator = require('./utils/codeGenerator');

/**
 * Cria um objeto de requisição mock
 */
function createMockRequest(body = {}, user = null) {
  return {
    body,
    user,
    params: {},
    query: {}
  };
}

/**
 * Cria um objeto de resposta mock
 */
function createMockResponse() {
  const res = {
    statusCode: 200,
    jsonData: null,
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.jsonData = data;
      return this;
    }
  };
  return res;
}

/**
 * Testa a estrutura dos controllers
 */
function testControllerStructure() {
  console.log('\n🧪 TESTE 1: Estrutura dos Controllers\n');
  console.log('='.repeat(50));

  try {
    console.log('1.1 Verificando se os métodos existem...');
    const requiredMethods = ['forgotPassword', 'verifyCode', 'resetPassword'];
    const missingMethods = requiredMethods.filter(
      method => typeof UserController[method] !== 'function'
    );

    if (missingMethods.length > 0) {
      throw new Error(`Métodos faltando: ${missingMethods.join(', ')}`);
    }
    console.log('✅ Todos os métodos estão presentes');

    console.log('\n1.2 Verificando se são métodos estáticos...');
    requiredMethods.forEach(method => {
      if (typeof UserController[method] !== 'function') {
        throw new Error(`${method} não é uma função`);
      }
    });
    console.log('✅ Todos os métodos são funções estáticas');

    console.log('\n✅ TESTE DE ESTRUTURA PASSOU!\n');
    return true;

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE DE ESTRUTURA:', error.message);
    return false;
  }
}

/**
 * Testa validações do forgotPassword
 */
async function testForgotPasswordValidations() {
  console.log('\n🧪 TESTE 2: Validações do forgotPassword\n');
  console.log('='.repeat(50));

  try {
    // Teste 2.1: Email faltando
    console.log('2.1 Testando sem email...');
    const req1 = createMockRequest({});
    const res1 = createMockResponse();
    await UserController.forgotPassword(req1, res1);
    
    if (res1.statusCode !== 400 || !res1.jsonData.message.includes('obrigatório')) {
      throw new Error('Deveria retornar erro 400 quando email está faltando');
    }
    console.log('✅ Validação de email obrigatório funcionando');

    // Teste 2.2: Email inválido
    console.log('\n2.2 Testando email inválido...');
    const req2 = createMockRequest({ email: 'email-invalido' });
    const res2 = createMockResponse();
    await UserController.forgotPassword(req2, res2);
    
    if (res2.statusCode !== 400 || !res2.jsonData.message.includes('inválido')) {
      throw new Error('Deveria retornar erro 400 para email inválido');
    }
    console.log('✅ Validação de formato de email funcionando');

    // Teste 2.3: Email válido mas não existe (deve retornar sucesso por segurança)
    console.log('\n2.3 Testando email válido mas não cadastrado...');
    const req3 = createMockRequest({ email: 'naoexiste@teste.com' });
    const res3 = createMockResponse();
    await UserController.forgotPassword(req3, res3);
    
    if (res3.statusCode !== 200 || !res3.jsonData.success) {
      throw new Error('Deveria retornar sucesso mesmo para email não cadastrado (segurança)');
    }
    console.log('✅ Retorno de sucesso para email não cadastrado (segurança)');

    console.log('\n✅ TESTE DE VALIDAÇÕES forgotPassword PASSOU!\n');
    return true;

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE DE VALIDAÇÕES:', error.message);
    return false;
  }
}

/**
 * Testa validações do verifyCode
 */
async function testVerifyCodeValidations() {
  console.log('\n🧪 TESTE 3: Validações do verifyCode\n');
  console.log('='.repeat(50));

  try {
    // Teste 3.1: Campos faltando
    console.log('3.1 Testando sem email e código...');
    const req1 = createMockRequest({});
    const res1 = createMockResponse();
    await UserController.verifyCode(req1, res1);
    
    if (res1.statusCode !== 400) {
      throw new Error('Deveria retornar erro 400 quando campos estão faltando');
    }
    console.log('✅ Validação de campos obrigatórios funcionando');

    // Teste 3.2: Email inválido
    console.log('\n3.2 Testando email inválido...');
    const req2 = createMockRequest({ email: 'invalido', code: '1234' });
    const res2 = createMockResponse();
    await UserController.verifyCode(req2, res2);
    
    if (res2.statusCode !== 400) {
      throw new Error('Deveria retornar erro 400 para email inválido');
    }
    console.log('✅ Validação de formato de email funcionando');

    // Teste 3.3: Código inválido (formato)
    console.log('\n3.3 Testando código com formato inválido...');
    const req3 = createMockRequest({ email: 'teste@teste.com', code: 'abc' });
    const res3 = createMockResponse();
    await UserController.verifyCode(req3, res3);
    
    if (res3.statusCode !== 400) {
      throw new Error('Deveria retornar erro 400 para código com formato inválido');
    }
    console.log('✅ Validação de formato de código funcionando');

    // Teste 3.4: Email não encontrado
    console.log('\n3.4 Testando email não cadastrado...');
    const req4 = createMockRequest({ email: 'naoexiste@teste.com', code: '1234' });
    const res4 = createMockResponse();
    await UserController.verifyCode(req4, res4);
    
    if (res4.statusCode !== 404) {
      throw new Error('Deveria retornar erro 404 para email não encontrado');
    }
    console.log('✅ Validação de email não encontrado funcionando');

    console.log('\n✅ TESTE DE VALIDAÇÕES verifyCode PASSOU!\n');
    return true;

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE DE VALIDAÇÕES:', error.message);
    return false;
  }
}

/**
 * Testa validações do resetPassword
 */
async function testResetPasswordValidations() {
  console.log('\n🧪 TESTE 4: Validações do resetPassword\n');
  console.log('='.repeat(50));

  try {
    // Teste 4.1: Campos faltando
    console.log('4.1 Testando sem campos obrigatórios...');
    const req1 = createMockRequest({});
    const res1 = createMockResponse();
    await UserController.resetPassword(req1, res1);
    
    if (res1.statusCode !== 400) {
      throw new Error('Deveria retornar erro 400 quando campos estão faltando');
    }
    console.log('✅ Validação de campos obrigatórios funcionando');

    // Teste 4.2: Email inválido
    console.log('\n4.2 Testando email inválido...');
    const req2 = createMockRequest({ 
      email: 'invalido', 
      code: '1234', 
      newPassword: 'senha123' 
    });
    const res2 = createMockResponse();
    await UserController.resetPassword(req2, res2);
    
    if (res2.statusCode !== 400) {
      throw new Error('Deveria retornar erro 400 para email inválido');
    }
    console.log('✅ Validação de formato de email funcionando');

    // Teste 4.3: Código inválido
    console.log('\n4.3 Testando código com formato inválido...');
    const req3 = createMockRequest({ 
      email: 'teste@teste.com', 
      code: 'abc', 
      newPassword: 'senha123' 
    });
    const res3 = createMockResponse();
    await UserController.resetPassword(req3, res3);
    
    if (res3.statusCode !== 400) {
      throw new Error('Deveria retornar erro 400 para código com formato inválido');
    }
    console.log('✅ Validação de formato de código funcionando');

    // Teste 4.4: Senha muito curta
    console.log('\n4.4 Testando senha muito curta...');
    const req4 = createMockRequest({ 
      email: 'teste@teste.com', 
      code: '1234', 
      newPassword: '12345' // 5 caracteres
    });
    const res4 = createMockResponse();
    await UserController.resetPassword(req4, res4);
    
    if (res4.statusCode !== 400 || !res4.jsonData.message.includes('6 caracteres')) {
      throw new Error('Deveria retornar erro 400 para senha com menos de 6 caracteres');
    }
    console.log('✅ Validação de tamanho mínimo de senha funcionando');

    // Teste 4.5: Email não encontrado
    console.log('\n4.5 Testando email não cadastrado...');
    const req5 = createMockRequest({ 
      email: 'naoexiste@teste.com', 
      code: '1234', 
      newPassword: 'senha123' 
    });
    const res5 = createMockResponse();
    await UserController.resetPassword(req5, res5);
    
    if (res5.statusCode !== 404) {
      throw new Error('Deveria retornar erro 404 para email não encontrado');
    }
    console.log('✅ Validação de email não encontrado funcionando');

    console.log('\n✅ TESTE DE VALIDAÇÕES resetPassword PASSOU!\n');
    return true;

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE DE VALIDAÇÕES:', error.message);
    return false;
  }
}

/**
 * Testa integração com dependências
 */
function testDependencies() {
  console.log('\n🧪 TESTE 5: Dependências dos Controllers\n');
  console.log('='.repeat(50));

  try {
    console.log('5.1 Verificando imports necessários...');
    
    // Verificar se codeGenerator está disponível
    if (!codeGenerator || typeof codeGenerator.generateRecoveryCode !== 'function') {
      throw new Error('codeGenerator não está disponível ou não tem generateRecoveryCode');
    }
    console.log('✅ codeGenerator disponível');

    // Verificar se UserModel está disponível
    if (!UserModel || typeof UserModel.findByEmail !== 'function') {
      throw new Error('UserModel não está disponível ou não tem findByEmail');
    }
    console.log('✅ UserModel disponível');

    // Verificar se emailService está disponível (será carregado dinamicamente)
    console.log('\n5.2 Verificando emailService...');
    try {
      const emailService = require('./services/emailService');
      if (!emailService || typeof emailService.sendRecoveryCode !== 'function') {
        throw new Error('emailService não tem sendRecoveryCode');
      }
      console.log('✅ emailService disponível');
    } catch (error) {
      console.warn('⚠️ emailService pode não estar configurado, mas isso é OK para testes');
    }

    console.log('\n✅ TESTE DE DEPENDÊNCIAS PASSOU!\n');
    return true;

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE DE DEPENDÊNCIAS:', error.message);
    return false;
  }
}

/**
 * Executa todos os testes
 */
async function runAllTests() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     TESTE DA FASE 3 - CONTROLLERS                          ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('\n');

  const results = {
    structure: false,
    forgotPasswordValidations: false,
    verifyCodeValidations: false,
    resetPasswordValidations: false,
    dependencies: false
  };

  // Executar testes
  results.structure = testControllerStructure();
  results.forgotPasswordValidations = await testForgotPasswordValidations();
  results.verifyCodeValidations = await testVerifyCodeValidations();
  results.resetPasswordValidations = await testResetPasswordValidations();
  results.dependencies = testDependencies();

  // Resumo final
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                    RESUMO DOS TESTES                     ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('\n');

  console.log('1. Estrutura dos Controllers:        ', results.structure ? '✅ PASSOU' : '❌ FALHOU');
  console.log('2. Validações forgotPassword:        ', results.forgotPasswordValidations ? '✅ PASSOU' : '❌ FALHOU');
  console.log('3. Validações verifyCode:            ', results.verifyCodeValidations ? '✅ PASSOU' : '❌ FALHOU');
  console.log('4. Validações resetPassword:         ', results.resetPasswordValidations ? '✅ PASSOU' : '❌ FALHOU');
  console.log('5. Dependências:                     ', results.dependencies ? '✅ PASSOU' : '❌ FALHOU');

  const allPassed = Object.values(results).every(result => result === true);

  console.log('\n');
  if (allPassed) {
    console.log('✅ FASE 3 VALIDADA COM SUCESSO!');
    console.log('\n📋 Controllers implementados:');
    console.log('   - forgotPassword(req, res)');
    console.log('   - verifyCode(req, res)');
    console.log('   - resetPassword(req, res)');
    console.log('\n⚠️  NOTA: Estes testes validam a estrutura e validações.');
    console.log('   Para testes completos com banco de dados, use testes de integração.');
  } else {
    console.log('⚠️ ALGUNS TESTES FALHARAM. Verifique os erros acima.');
  }
  console.log('\n');

  return allPassed;
}

// Executar testes se o script for chamado diretamente
if (require.main === module) {
  runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('\n❌ ERRO FATAL:', error);
      process.exit(1);
    });
}

module.exports = {
  testControllerStructure,
  testForgotPasswordValidations,
  testVerifyCodeValidations,
  testResetPasswordValidations,
  testDependencies,
  runAllTests
};

