// HealthCare_BackEnd/src/services/emailService.js

const nodemailer = require('nodemailer');

/**
 * Serviço de envio de emails para recuperação de senha
 */
class EmailService {
  constructor() {
    // Configuração do transporter (será inicializado no método init)
    this.transporter = null;
    this.isInitialized = false;
  }

  /**
   * Inicializa o serviço de email com as configurações do ambiente
   */
  init() {
    try {
      // Verificar se as variáveis de ambiente estão configuradas
      const emailHost = process.env.EMAIL_HOST;
      const emailPort = process.env.EMAIL_PORT;
      const emailUser = process.env.EMAIL_USER;
      const emailPass = process.env.EMAIL_PASS;
      const emailFrom = process.env.EMAIL_FROM || emailUser;

      if (!emailHost || !emailPort || !emailUser || !emailPass) {
        console.warn('⚠️ Configurações de email não encontradas. O serviço de email não funcionará.');
        console.warn('Configure EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS no config.env');
        this.isInitialized = false;
        return false;
      }

      // Criar transporter do Nodemailer
      this.transporter = nodemailer.createTransport({
        host: emailHost,
        port: parseInt(emailPort, 10),
        secure: emailPort === '465', // true para porta 465, false para outras portas
        auth: {
          user: emailUser,
          pass: emailPass
        },
        // Configurações adicionais para melhor compatibilidade
        tls: {
          rejectUnauthorized: false // Em produção, considere usar certificados válidos
        }
      });

      this.isInitialized = true;
      console.log('✅ Serviço de email inicializado com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao inicializar serviço de email:', error);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Verifica se o serviço está inicializado
   */
  checkInitialization() {
    if (!this.isInitialized) {
      this.init();
    }
    return this.isInitialized;
  }

  /**
   * Gera o template HTML do email de recuperação de senha
   * @param {string} code - Código de recuperação
   * @param {string} userName - Nome do usuário (opcional)
   * @returns {string} HTML do email
   */
  generateRecoveryEmailTemplate(code, userName = 'Usuário') {
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Código de Recuperação de Senha</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #004A61;
            margin-bottom: 10px;
        }
        .code-container {
            background-color: #f8f9fa;
            border: 2px dashed #004A61;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
        }
        .code {
            font-size: 32px;
            font-weight: bold;
            color: #004A61;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
        }
        .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            font-size: 12px;
            color: #666;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">HEALTHCARE+</div>
            <h1 style="color: #004A61; margin: 10px 0;">Recuperação de Senha</h1>
        </div>
        
        <p>Olá, <strong>${userName}</strong>!</p>
        
        <p>Você solicitou a recuperação de senha para sua conta. Use o código abaixo para continuar:</p>
        
        <div class="code-container">
            <div class="code">${code}</div>
        </div>
        
        <div class="warning">
            <strong>⚠️ Importante:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Este código expira em <strong>15 minutos</strong></li>
                <li>Não compartilhe este código com ninguém</li>
                <li>Se você não solicitou esta recuperação, ignore este email</li>
            </ul>
        </div>
        
        <p>Se você não solicitou esta recuperação de senha, pode ignorar este email com segurança.</p>
        
        <div class="footer">
            <p>Este é um email automático, por favor não responda.</p>
            <p>&copy; ${new Date().getFullYear()} Healthcare+. Todos os direitos reservados.</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  /**
   * Envia código de recuperação de senha por email
   * @param {string} email - Email do destinatário
   * @param {string} code - Código de recuperação (4 dígitos)
   * @param {string} userName - Nome do usuário (opcional)
   * @returns {Promise<Object>} { success: boolean, message: string }
   */
  async sendRecoveryCode(email, code, userName = null) {
    try {
      // Verificar inicialização
      if (!this.checkInitialization()) {
        return {
          success: false,
          message: 'Serviço de email não configurado. Verifique as variáveis de ambiente.'
        };
      }

      // Validar parâmetros
      if (!email || !code) {
        return {
          success: false,
          message: 'Email e código são obrigatórios'
        };
      }

      // Validar formato do email
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          message: 'Formato de email inválido'
        };
      }

      // Validar formato do código (4 dígitos)
      if (!/^\d{4}$/.test(code)) {
        return {
          success: false,
          message: 'Código deve conter 4 dígitos numéricos'
        };
      }

      const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER;
      const emailSubject = 'Código de Recuperação de Senha - Healthcare+';
      const emailHtml = this.generateRecoveryEmailTemplate(code, userName || 'Usuário');

      // Enviar email
      const info = await this.transporter.sendMail({
        from: `"Healthcare+" <${emailFrom}>`,
        to: email,
        subject: emailSubject,
        html: emailHtml,
        // Versão texto simples (fallback)
        text: `Olá! Seu código de recuperação de senha é: ${code}. Este código expira em 15 minutos.`
      });

      console.log('✅ Email de recuperação enviado:', info.messageId);
      console.log('📧 Destinatário:', email);

      return {
        success: true,
        message: 'Código de recuperação enviado com sucesso',
        messageId: info.messageId
      };
    } catch (error) {
      console.error('❌ Erro ao enviar email de recuperação:', error);
      
      // Mensagens de erro mais amigáveis
      let errorMessage = 'Erro ao enviar email de recuperação';
      
      if (error.code === 'EAUTH') {
        errorMessage = 'Erro de autenticação no servidor de email. Verifique as credenciais.';
      } else if (error.code === 'ECONNECTION') {
        errorMessage = 'Erro de conexão com o servidor de email. Verifique a configuração.';
      } else if (error.response) {
        errorMessage = `Erro do servidor de email: ${error.response}`;
      }

      return {
        success: false,
        message: errorMessage,
        error: error.message
      };
    }
  }

  /**
   * Testa a conexão com o servidor de email
   * @returns {Promise<Object>} { success: boolean, message: string }
   */
  async testConnection() {
    try {
      if (!this.checkInitialization()) {
        return {
          success: false,
          message: 'Serviço de email não configurado'
        };
      }

      await this.transporter.verify();
      return {
        success: true,
        message: 'Conexão com servidor de email estabelecida com sucesso'
      };
    } catch (error) {
      console.error('❌ Erro ao testar conexão de email:', error);
      return {
        success: false,
        message: 'Falha ao conectar com servidor de email',
        error: error.message
      };
    }
  }
}

// Criar instância singleton
const emailService = new EmailService();

// Inicializar automaticamente quando o módulo for carregado
// (mas só se as variáveis de ambiente estiverem configuradas)
if (process.env.EMAIL_HOST) {
  emailService.init();
}

module.exports = emailService;

