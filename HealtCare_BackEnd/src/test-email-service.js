// HealthCare_BackEnd/src/test-email-service.js
// Script de teste para validar a Fase 1 - Infraestrutura de Email

require('dotenv').config({ path: './config.env' });

const codeGenerator = require('./utils/codeGenerator');
const emailService = require('./services/emailService');

/**
 * Testa a geração e validação de códigos
 */
function testCodeGenerator() {
  console.log('\n🧪 TESTE 1: Geração e Validação de Códigos\n');
  console.log('='.repeat(50));

  try {
    // Teste 1.1: Gerar código
    console.log('\n1.1 Gerando código de recuperação...');
    const code = codeGenerator.generateRecoveryCode();
    console.log('✅ Código gerado:', code);
    
    if (!/^\d{4}$/.test(code)) {
      throw new Error('Código deve ter 4 dígitos');
    }
    console.log('✅ Formato do código válido');

    // Teste 1.2: Codificar com timestamp
    console.log('\n1.2 Codificando código com timestamp...');
    const encodedCode = codeGenerator.encodeCodeWithTimestamp(code);
    console.log('✅ Código codificado:', encodedCode);
    
    if (!encodedCode.includes(':')) {
      throw new Error('Código codificado deve conter timestamp');
    }
    console.log('✅ Formato de codificação válido');

    // Teste 1.3: Decodificar e validar (código válido)
    console.log('\n1.3 Decodificando e validando código (deve ser válido)...');
    const decoded = codeGenerator.decodeCodeAndValidate(encodedCode, 15);
    console.log('Resultado:', decoded);
    
    if (!decoded.isValid) {
      throw new Error('Código recém-criado deve ser válido');
    }
    if (decoded.code !== code) {
      throw new Error('Código decodificado deve ser igual ao original');
    }
    console.log('✅ Código válido e decodificado corretamente');

    // Teste 1.4: Validar código expirado (simulado)
    console.log('\n1.4 Testando código expirado...');
    const oldTimestamp = Date.now() - (20 * 60 * 1000); // 20 minutos atrás
    const expiredCode = `${code}:${oldTimestamp}`;
    const expiredResult = codeGenerator.decodeCodeAndValidate(expiredCode, 15);
    console.log('Resultado:', expiredResult);
    
    if (expiredResult.isValid || !expiredResult.isExpired) {
      throw new Error('Código expirado deve ser detectado como inválido');
    }
    console.log('✅ Código expirado detectado corretamente');

    // Teste 1.5: Validar código do usuário
    console.log('\n1.5 Validando código do usuário...');
    const validation = codeGenerator.validateRecoveryCode(code, encodedCode, 15);
    console.log('Resultado:', validation);
    
    if (!validation.isValid) {
      throw new Error('Código correto deve ser validado como válido');
    }
    console.log('✅ Validação de código do usuário funcionando');

    // Teste 1.6: Validar código incorreto
    console.log('\n1.6 Testando código incorreto...');
    const wrongCode = '9999';
    const wrongValidation = codeGenerator.validateRecoveryCode(wrongCode, encodedCode, 15);
    console.log('Resultado:', wrongValidation);
    
    if (wrongValidation.isValid) {
      throw new Error('Código incorreto deve ser rejeitado');
    }
    console.log('✅ Código incorreto rejeitado corretamente');

    console.log('\n✅ TODOS OS TESTES DE GERAÇÃO DE CÓDIGO PASSARAM!\n');
    return true;

  } catch (error) {
    console.error('\n❌ ERRO NO TESTE DE GERAÇÃO DE CÓDIGO:', error.message);
    return false;
  }
}

/**
 * Testa a configuração do serviço de email
 */
function testEmailServiceConfig() {
  console.log('\n🧪 TESTE 2: Configuração do Serviço de Email\n');
  console.log('='.repeat(50));

  try {
    // Verificar variáveis de ambiente
    console.log('\n2.1 Verificando variáveis de ambiente...');
    const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.warn('⚠️ Variáveis de ambiente não configuradas:', missingVars.join(', '));
      console.warn('⚠️ Configure essas variáveis no config.env para testar o envio de email');
      console.log('\n📝 Variáveis encontradas:');
      requiredVars.forEach(varName => {
        const value = process.env[varName];
        if (value) {
          // Mascarar senha
          const displayValue = varName === 'EMAIL_PASS' ? '***' : value;
          console.log(`   ${varName}: ${displayValue}`);
        }
      });
      return false;
    }

    console.log('✅ Todas as variáveis de ambiente estão configuradas');
    console.log(`   EMAIL_HOST: ${process.env.EMAIL_HOST}`);
    console.log(`   EMAIL_PORT: ${process.env.EMAIL_PORT}`);
    console.log(`   EMAIL_USER: ${process.env.EMAIL_USER}`);
    console.log(`   EMAIL_PASS: ***`);
    console.log(`   EMAIL_FROM: ${process.env.EMAIL_FROM || process.env.EMAIL_USER}`);

    // Verificar inicialização do serviço
    console.log('\n2.2 Verificando inicialização do serviço...');
    if (!emailService.isInitialized) {
      console.log('⚠️ Serviço não inicializado. Tentando inicializar...');
      emailService.init();
    }

    if (!emailService.isInitialized) {
      throw new Error('Serviço de email não pôde ser inicializado');
    }
    console.log('✅ Serviço de email inicializado');

    console.log('\n✅ CONFIGURAÇÃO DO SERVIÇO DE EMAIL OK!\n');
    return true;

  } catch (error) {
    console.error('\n❌ ERRO NA CONFIGURAÇÃO DO SERVIÇO DE EMAIL:', error.message);
    return false;
  }
}

/**
 * Testa a conexão com o servidor de email
 */
async function testEmailConnection() {
  console.log('\n🧪 TESTE 3: Conexão com Servidor de Email\n');
  console.log('='.repeat(50));

  try {
    console.log('\n3.1 Testando conexão com servidor de email...');
    const result = await emailService.testConnection();
    
    if (result.success) {
      console.log('✅', result.message);
      return true;
    } else {
      console.error('❌', result.message);
      if (result.error) {
        console.error('   Detalhes:', result.error);
      }
      return false;
    }

  } catch (error) {
    console.error('\n❌ ERRO AO TESTAR CONEXÃO:', error.message);
    return false;
  }
}

/**
 * Testa o envio de email (requer email de teste)
 */
async function testEmailSending() {
  console.log('\n🧪 TESTE 4: Envio de Email (OPCIONAL)\n');
  console.log('='.repeat(50));

  // Verificar se email de teste foi fornecido
  const testEmail = process.env.TEST_EMAIL;
  
  if (!testEmail) {
    console.log('\n⚠️ TESTE DE ENVIO PULADO');
    console.log('   Para testar o envio, configure TEST_EMAIL no config.env');
    console.log('   Exemplo: TEST_EMAIL=seu-email@exemplo.com');
    return null; // Não é erro, apenas não foi testado
  }

  try {
    console.log(`\n4.1 Enviando email de teste para: ${testEmail}`);
    const code = codeGenerator.generateRecoveryCode();
    console.log(`   Código gerado: ${code}`);
    
    const result = await emailService.sendRecoveryCode(testEmail, code, 'Usuário de Teste');
    
    if (result.success) {
      console.log('✅ Email enviado com sucesso!');
      console.log(`   Message ID: ${result.messageId || 'N/A'}`);
      console.log(`   Verifique a caixa de entrada de ${testEmail}`);
      return true;
    } else {
      console.error('❌ Falha ao enviar email:', result.message);
      if (result.error) {
        console.error('   Detalhes:', result.error);
      }
      return false;
    }

  } catch (error) {
    console.error('\n❌ ERRO AO ENVIAR EMAIL:', error.message);
    return false;
  }
}

/**
 * Executa todos os testes
 */
async function runAllTests() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     TESTE DA FASE 1 - INFRAESTRUTURA DE EMAIL            ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('\n');

  const results = {
    codeGenerator: false,
    emailConfig: false,
    emailConnection: false,
    emailSending: null
  };

  // Teste 1: Geração de código
  results.codeGenerator = testCodeGenerator();

  // Teste 2: Configuração do serviço
  results.emailConfig = testEmailServiceConfig();

  // Teste 3: Conexão (só se configurado)
  if (results.emailConfig) {
    results.emailConnection = await testEmailConnection();
  }

  // Teste 4: Envio (opcional)
  if (results.emailConnection) {
    results.emailSending = await testEmailSending();
  }

  // Resumo final
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                    RESUMO DOS TESTES                     ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('\n');

  console.log('1. Geração de Código:        ', results.codeGenerator ? '✅ PASSOU' : '❌ FALHOU');
  console.log('2. Configuração de Email:    ', results.emailConfig ? '✅ PASSOU' : '❌ FALHOU');
  console.log('3. Conexão com Servidor:      ', results.emailConnection ? '✅ PASSOU' : results.emailConfig ? '❌ FALHOU' : '⏭️  PULADO');
  console.log('4. Envio de Email:           ', results.emailSending === true ? '✅ PASSOU' : results.emailSending === false ? '❌ FALHOU' : '⏭️  PULADO');

  const allPassed = results.codeGenerator && results.emailConfig && 
                    (results.emailConnection !== false) && 
                    (results.emailSending !== false);

  console.log('\n');
  if (allPassed) {
    console.log('✅ FASE 1 VALIDADA COM SUCESSO!');
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
  testCodeGenerator,
  testEmailServiceConfig,
  testEmailConnection,
  testEmailSending,
  runAllTests
};

