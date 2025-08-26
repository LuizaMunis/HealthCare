// HealthCare_Backend/src/middleware/validationMiddleware.js

const { body, validationResult } = require('express-validator');

class ValidationMiddleware {
  /**
   * Middleware para validar dados de registro de usuário
   */
  static validateUserRegistration() {
    return [
      body('nome_completo')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Nome completo deve ter entre 2 e 100 caracteres')
        .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
        .withMessage('Nome deve conter apenas letras e espaços'),
      
      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email deve ter um formato válido'),
      
      body('password')
        .isLength({ min: 6 })
        .withMessage('Senha deve ter pelo menos 6 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'),
      
      ValidationMiddleware.handleValidationErrors
    ];
  }

  /**
   * Middleware para validar dados de login
   */
  static validateUserLogin() {
    return [
      body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Email deve ter um formato válido'),
      
      body('password')
        .notEmpty()
        .withMessage('Senha é obrigatória'),
      
      ValidationMiddleware.handleValidationErrors
    ];
  }

  /**
   * Middleware para validar dados de perfil
   */
  static validateProfileData() {
    return [
      body('cpf')
        .optional()
        .isLength({ min: 11, max: 14 })
        .withMessage('CPF deve ter 11 dígitos')
        .custom((value) => {
          if (value) {
            const cpfLimpo = value.replace(/\D/g, '');
            if (cpfLimpo.length !== 11) {
              throw new Error('CPF deve ter exatamente 11 dígitos');
            }
            // Validação básica de CPF (pode ser expandida)
            if (cpfLimpo === '00000000000' || cpfLimpo === '11111111111' || 
                cpfLimpo === '22222222222' || cpfLimpo === '33333333333' || 
                cpfLimpo === '44444444444' || cpfLimpo === '55555555555' || 
                cpfLimpo === '66666666666' || cpfLimpo === '77777777777' || 
                cpfLimpo === '88888888888' || cpfLimpo === '99999999999') {
              throw new Error('CPF inválido');
            }
          }
          return true;
        }),
      
      body('celular')
        .optional()
        .isLength({ min: 10, max: 15 })
        .withMessage('Celular deve ter entre 10 e 15 dígitos')
        .custom((value) => {
          if (value) {
            const celularLimpo = value.replace(/\D/g, '');
            if (celularLimpo.length < 10 || celularLimpo.length > 11) {
              throw new Error('Celular deve ter 10 ou 11 dígitos');
            }
          }
          return true;
        }),
      
      body('data_nascimento')
        .optional()
        .isISO8601()
        .withMessage('Data de nascimento deve estar no formato YYYY-MM-DD')
        .custom((value) => {
          if (value) {
            const data = new Date(value);
            const hoje = new Date();
            const idade = hoje.getFullYear() - data.getFullYear();
            
            if (idade < 0 || idade > 120) {
              throw new Error('Data de nascimento inválida');
            }
            
            if (idade < 13) {
              throw new Error('Usuário deve ter pelo menos 13 anos');
            }
          }
          return true;
        }),
      
      body('genero')
        .optional()
        .isIn(['MASCULINO', 'FEMININO', 'OUTRO', 'masculino', 'feminino', 'nao_informado'])
        .withMessage('Gênero deve ser: MASCULINO, FEMININO, OUTRO ou não informado'),
      
      body('peso')
        .optional()
        .isFloat({ min: 20, max: 500 })
        .withMessage('Peso deve estar entre 20 e 500 kg'),
      
      body('altura')
        .optional()
        .isInt({ min: 50, max: 250 })
        .withMessage('Altura deve estar entre 50 e 250 cm'),
      
      ValidationMiddleware.handleValidationErrors
    ];
  }

  /**
   * Middleware para validar dados de pressão arterial
   */
  static validateBloodPressure() {
    return [
      body('pressao_sistolica')
        .isInt({ min: 70, max: 300 })
        .withMessage('Pressão sistólica deve estar entre 70 e 300 mmHg'),
      
      body('pressao_diastolica')
        .isInt({ min: 40, max: 200 })
        .withMessage('Pressão diastólica deve estar entre 40 e 200 mmHg'),
      
      body('frequencia_cardiaca')
        .optional()
        .isInt({ min: 40, max: 200 })
        .withMessage('Frequência cardíaca deve estar entre 40 e 200 bpm'),
      
      body('data_hora')
        .optional()
        .isISO8601()
        .withMessage('Data e hora devem estar no formato ISO 8601'),
      
      body('observacoes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Observações devem ter no máximo 500 caracteres'),
      
      ValidationMiddleware.handleValidationErrors
    ];
  }

  /**
   * Middleware para validar alteração de senha
   */
  static validatePasswordChange() {
    return [
      body('senha_atual')
        .notEmpty()
        .withMessage('Senha atual é obrigatória'),
      
      body('nova_senha')
        .isLength({ min: 6 })
        .withMessage('Nova senha deve ter pelo menos 6 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Nova senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'),
      
      ValidationMiddleware.handleValidationErrors
    ];
  }

  /**
   * Middleware para validar dados de atualização de perfil
   */
  static validateProfileUpdate() {
    return [
      body('nome_completo')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Nome completo deve ter entre 2 e 100 caracteres')
        .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
        .withMessage('Nome deve conter apenas letras e espaços'),
      
      body('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Email deve ter um formato válido'),
      
      ValidationMiddleware.handleValidationErrors
    ];
  }

  /**
   * Middleware para validar IDs numéricos
   */
  static validateId() {
    return [
      body('id')
        .isInt({ min: 1 })
        .withMessage('ID deve ser um número inteiro positivo'),
      
      ValidationMiddleware.handleValidationErrors
    ];
  }

  /**
   * Middleware para validar paginação
   */
  static validatePagination() {
    return [
      body('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Página deve ser um número inteiro positivo'),
      
      body('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limite deve ser um número entre 1 e 100'),
      
      ValidationMiddleware.handleValidationErrors
    ];
  }

  /**
   * Middleware para validar datas
   */
  static validateDateRange() {
    return [
      body('data_inicio')
        .optional()
        .isISO8601()
        .withMessage('Data de início deve estar no formato ISO 8601'),
      
      body('data_fim')
        .optional()
        .isISO8601()
        .withMessage('Data de fim deve estar no formato ISO 8601')
        .custom((value, { req }) => {
          if (value && req.body.data_inicio) {
            const dataInicio = new Date(req.body.data_inicio);
            const dataFim = new Date(value);
            
            if (dataFim <= dataInicio) {
              throw new Error('Data de fim deve ser posterior à data de início');
            }
          }
          return true;
        }),
      
      ValidationMiddleware.handleValidationErrors
    ];
  }

  /**
   * Middleware para processar erros de validação
   */
  static handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }));

      return res.status(400).json({
        success: false,
        message: 'Dados de entrada inválidos',
        errors: errorMessages
      });
    }
    
    next();
  }

  /**
   * Middleware para sanitizar dados de entrada
   */
  static sanitizeInput(req, res, next) {
    // Sanitizar strings removendo espaços extras
    if (req.body) {
      Object.keys(req.body).forEach(key => {
        if (typeof req.body[key] === 'string') {
          req.body[key] = req.body[key].trim();
        }
      });
    }
    
    next();
  }

  /**
   * Middleware para validar token JWT
   */
  static validateToken(req, res, next) {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso requerido'
      });
    }
    
    next();
  }
}

module.exports = ValidationMiddleware;
