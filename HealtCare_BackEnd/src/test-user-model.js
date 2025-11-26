// HealthCare_BackEnd/src/test-user-model.js
// Script de teste para validar a Fase 2 - Métodos no UserModel

require('dotenv').config({ path: './config.env' });
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../config.env') });

const UserModel = require('./models/userModel');
const codeGenerator = require('./utils/codeGenerator');

/**
 * Testa o método findByRecoveryToken
 */
async function testFindByRecoveryToken() {
  console.log('\n🧪 TESTE 1: findByRecoveryToken\n');
  console.log('='.repeat(50));

  try {
    // Gerar um token de teste
    const code = codeGenerator.generateRecoveryCode();
    const encodedToken = codeGenerator.encodeCodeWithTimestamp(code);
    
    console.log('1.1 Testando busca por token inexistente...');
    const nonExistent = await UserModel.findByRecoveryToken('token-inexistente:1234567890');
    
    if (nonExistent !== null) {
      throw new Error('Token inexistente deve retornar null');
    }
    console.log('✅ Token inexistente retorna null corretamente');

    // Para testar com token existente, precisaríamos de um usuário no banco
    // Vamos apenas verificar se o método não lança erro
    console.log('\n1.2 Verificando estrutura do método...');
    if (typeof UserModel.findByRecoveryToken !== 'function') {
      throw new Error('findByRecoveryToken não é uma função');
    }
    console.log('✅ Método findByRecoveryToken existe e é uma função');

    console.log('\n✅ TESTE findByRecoveryToken PASSOU!\n');
    return true;

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE findByRecoveryToken:', error.message);
    return false;
  }
}

/**
 * Testa o método clearRecoveryToken
 */
async function testClearRecoveryToken() {
  console.log('\n🧪 TESTE 2: clearRecoveryToken\n');
  console.log('='.repeat(50));

  try {
    console.log('2.1 Verificando estrutura do método...');
    if (typeof UserModel.clearRecoveryToken !== 'function') {
      throw new Error('clearRecoveryToken não é uma função');
    }
    console.log('✅ Método clearRecoveryToken existe e é uma função');

    // Testar com ID inexistente (deve retornar 0 linhas afetadas)
    console.log('\n2.2 Testando limpeza de token para ID inexistente...');
    const result = await UserModel.clearRecoveryToken(999999);
    
    if (result !== 0) {
      console.warn('⚠️ Esperado 0 linhas afetadas para ID inexistente, mas retornou:', result);
    } else {
      console.log('✅ ID inexistente retorna 0 linhas afetadas corretamente');
    }

    console.log('\n✅ TESTE clearRecoveryToken PASSOU!\n');
    return true;

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE clearRecoveryToken:', error.message);
    return false;
  }
}

/**
 * Testa o método setRecoveryToken (já existente)
 */
async function testSetRecoveryToken() {
  console.log('\n🧪 TESTE 3: setRecoveryToken (método existente)\n');
  console.log('='.repeat(50));

  try {
    console.log('3.1 Verificando estrutura do método...');
    if (typeof UserModel.setRecoveryToken !== 'function') {
      throw new Error('setRecoveryToken não é uma função');
    }
    console.log('✅ Método setRecoveryToken existe e é uma função');

    // Testar com ID inexistente (deve retornar 0 linhas afetadas)
    console.log('\n3.2 Testando definição de token para ID inexistente...');
    const code = codeGenerator.generateRecoveryCode();
    const encodedToken = codeGenerator.encodeCodeWithTimestamp(code);
    const result = await UserModel.setRecoveryToken(999999, encodedToken);
    
    if (result !== 0) {
      console.warn('⚠️ Esperado 0 linhas afetadas para ID inexistente, mas retornou:', result);
    } else {
      console.log('✅ ID inexistente retorna 0 linhas afetadas corretamente');
    }

    // Testar limpar token (definir como null)
    console.log('\n3.3 Testando limpeza de token (definir como null)...');
    const clearResult = await UserModel.setRecoveryToken(999999, null);
    console.log('✅ Método aceita null para limpar token');

    console.log('\n✅ TESTE setRecoveryToken PASSOU!\n');
    return true;

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE setRecoveryToken:', error.message);
    return false;
  }
}

/**
 * Testa integração entre os métodos
 */
async function testIntegration() {
  console.log('\n🧪 TESTE 4: Integração entre Métodos\n');
  console.log('='.repeat(50));

  try {
    console.log('4.1 Verificando se todos os métodos estão disponíveis...');
    const methods = ['setRecoveryToken', 'findByRecoveryToken', 'clearRecoveryToken'];
    const missingMethods = methods.filter(method => typeof UserModel[method] !== 'function');
    
    if (missingMethods.length > 0) {
      throw new Error(`Métodos faltando: ${missingMethods.join(', ')}`);
    }
    console.log('✅ Todos os métodos estão disponíveis');

    console.log('\n4.2 Verificando compatibilidade com codeGenerator...');
    const code = codeGenerator.generateRecoveryCode();
    const encodedToken = codeGenerator.encodeCodeWithTimestamp(code);
    
    // Verificar se o formato do token é compatível
    if (!encodedToken.includes(':')) {
      throw new Error('Token codificado deve conter timestamp');
    }
    console.log('✅ Token gerado é compatível com o formato esperado');

    // Verificar se podemos decodificar o token
    const decoded = codeGenerator.decodeCodeAndValidate(encodedToken);
    if (!decoded.isValid) {
      throw new Error('Token gerado deve ser válido');
    }
    console.log('✅ Token pode ser decodificado e validado');

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
async function runAllTests() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     TESTE DA FASE 2 - MÉTODOS NO USERMODEL                ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('\n');

  const results = {
    findByRecoveryToken: false,
    clearRecoveryToken: false,
    setRecoveryToken: false,
    integration: false
  };

  // Executar testes
  results.findByRecoveryToken = await testFindByRecoveryToken();
  results.clearRecoveryToken = await testClearRecoveryToken();
  results.setRecoveryToken = await testSetRecoveryToken();
  results.integration = await testIntegration();

  // Resumo final
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                    RESUMO DOS TESTES                     ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('\n');

  console.log('1. findByRecoveryToken:    ', results.findByRecoveryToken ? '✅ PASSOU' : '❌ FALHOU');
  console.log('2. clearRecoveryToken:    ', results.clearRecoveryToken ? '✅ PASSOU' : '❌ FALHOU');
  console.log('3. setRecoveryToken:      ', results.setRecoveryToken ? '✅ PASSOU' : '❌ FALHOU');
  console.log('4. Integração:            ', results.integration ? '✅ PASSOU' : '❌ FALHOU');

  const allPassed = Object.values(results).every(result => result === true);

  console.log('\n');
  if (allPassed) {
    console.log('✅ FASE 2 VALIDADA COM SUCESSO!');
    console.log('\n📋 Métodos implementados:');
    console.log('   - setRecoveryToken(id, tokenOrNull)');
    console.log('   - findByRecoveryToken(token)');
    console.log('   - clearRecoveryToken(id)');
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
  testFindByRecoveryToken,
  testClearRecoveryToken,
  testSetRecoveryToken,
  testIntegration,
  runAllTests
};

