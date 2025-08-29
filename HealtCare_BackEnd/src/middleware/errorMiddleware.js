// HealthCare_Backend/src/middleware/errorMiddleware.js

class ErrorMiddleware {
  /**
   * Middleware para tratar erros de validação
   */
  static handleValidationError(error, req, res, next) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dados de entrada inválidos',
        errors: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }
    next(error);
  }

  /**
   * Middleware para tratar erros de banco de dados
   */
  static handleDatabaseError(error, req, res, next) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Dados duplicados. Este registro já existe.'
      });
    }

    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        success: false,
        message: 'Referência inválida. Registro relacionado não encontrado.'
      });
    }

    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível excluir este registro pois está sendo usado por outros dados.'
      });
    }

    if (error.code === 'ER_BAD_FIELD_ERROR') {
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor: campo inválido'
      });
    }

    next(error);
  }

  /**
   * Middleware para tratar erros de JWT
   */
  static handleJWTError(error, req, res, next) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    next(error);
  }

  /**
   * Middleware para tratar erros de sintaxe JSON
   */
  static handleSyntaxError(error, req, res, next) {
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
      return res.status(400).json({
        success: false,
        message: 'JSON inválido no corpo da requisição'
      });
    }
    next(error);
  }

  /**
   * Middleware para tratar erros de rota não encontrada
   */
  static handleNotFound(req, res, next) {
    res.status(404).json({
      success: false,
      message: 'Rota não encontrada',
      path: req.originalUrl,
      method: req.method
    });
  }

  /**
   * Middleware para tratar erros gerais
   */
  static handleGenericError(error, req, res, next) {
    console.error('Erro não tratado:', error);

    // Em produção, não expor detalhes do erro
    const isProduction = process.env.NODE_ENV === 'production';
    
    const errorResponse = {
      success: false,
      message: isProduction ? 'Erro interno do servidor' : error.message,
      ...(isProduction ? {} : { stack: error.stack })
    };

    res.status(500).json(errorResponse);
  }

  /**
   * Middleware para tratar erros de timeout
   */
  static handleTimeout(req, res, next) {
    const timeout = setTimeout(() => {
      res.status(408).json({
        success: false,
        message: 'Timeout da requisição'
      });
    }, 30000); // 30 segundos

    res.on('finish', () => {
      clearTimeout(timeout);
    });

    next();
  }

  /**
   * Middleware para log de requisições
   */
  static logRequest(req, res, next) {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const logMessage = {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent'),
        ip: req.ip
      };

      if (res.statusCode >= 400) {
        console.error('❌ Requisição com erro:', logMessage);
      } else {
        console.log('✅ Requisição bem-sucedida:', logMessage);
      }
    });

    next();
  }

  /**
   * Middleware para validar Content-Type
   */
  static validateContentType(req, res, next) {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      const contentType = req.get('Content-Type');
      
      if (!contentType || !contentType.includes('application/json')) {
        return res.status(415).json({
          success: false,
          message: 'Content-Type deve ser application/json'
        });
      }
    }
    
    next();
  }

  /**
   * Middleware para limitar tamanho do corpo da requisição
   */
  static limitBodySize(req, res, next) {
    const contentLength = parseInt(req.get('Content-Length') || '0');
    const maxSize = 1024 * 1024; // 1MB

    if (contentLength > maxSize) {
      return res.status(413).json({
        success: false,
        message: 'Corpo da requisição muito grande. Máximo permitido: 1MB'
      });
    }

    next();
  }

  /**
   * Middleware para sanitizar headers
   */
  static sanitizeHeaders(req, res, next) {
    // Remover headers potencialmente perigosos
    delete req.headers['x-forwarded-for'];
    delete req.headers['x-real-ip'];
    
    next();
  }
}

module.exports = ErrorMiddleware;


