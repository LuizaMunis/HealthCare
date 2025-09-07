import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

export interface ErrorState {
  hasError: boolean;
  error: Error | null;
  message: string;
  code?: string;
}

export interface ErrorHandlerOptions {
  showAlert?: boolean;
  logToConsole?: boolean;
  fallbackMessage?: string;
  onError?: (error: Error) => void;
}

export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const {
    showAlert = true,
    logToConsole = true,
    fallbackMessage = 'Ocorreu um erro inesperado. Tente novamente.',
    onError,
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    message: '',
  });

  const handleError = useCallback((error: Error | string, context?: string) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    
    const errorMessage = errorObj.message || fallbackMessage;
    const errorCode = (errorObj as any).code || 'UNKNOWN_ERROR';

    const newErrorState: ErrorState = {
      hasError: true,
      error: errorObj,
      message: errorMessage,
      code: errorCode,
    };

    setErrorState(newErrorState);

    // Log para console se habilitado
    if (logToConsole) {
      console.error(`[${context || 'useErrorHandler'}] Erro capturado:`, {
        message: errorMessage,
        code: errorCode,
        stack: errorObj.stack,
        timestamp: new Date().toISOString(),
      });
    }

    // Mostrar alerta se habilitado
    if (showAlert) {
      Alert.alert(
        'Erro',
        errorMessage,
        [
          {
            text: 'OK',
            onPress: () => setErrorState({ hasError: false, error: null, message: '' }),
          },
        ]
      );
    }

    // Callback personalizado
    if (onError) {
      onError(errorObj);
    }

    return newErrorState;
  }, [showAlert, logToConsole, fallbackMessage, onError]);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      message: '',
    });
  }, []);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error as Error, context);
      return null;
    }
  }, [handleError]);

  return {
    errorState,
    handleError,
    clearError,
    handleAsyncError,
  };
};

// Hook específico para erros de API
export const useApiErrorHandler = () => {
  return useErrorHandler({
    showAlert: true,
    logToConsole: true,
    fallbackMessage: 'Erro de conexão. Verifique sua internet e tente novamente.',
    onError: (error) => {
      // Aqui você pode implementar lógica específica para erros de API
      // como refresh de token, logout automático, etc.
      console.log('Erro de API capturado:', error.message);
    },
  });
};

// Hook específico para erros de validação
export const useValidationErrorHandler = () => {
  return useErrorHandler({
    showAlert: false, // Não mostrar alerta para erros de validação
    logToConsole: true,
    fallbackMessage: 'Dados inválidos. Verifique as informações fornecidas.',
  });
};

// Hook específico para erros de rede
export const useNetworkErrorHandler = () => {
  return useErrorHandler({
    showAlert: true,
    logToConsole: true,
    fallbackMessage: 'Sem conexão com a internet. Verifique sua rede.',
    onError: (error) => {
      // Lógica específica para erros de rede
      console.log('Erro de rede capturado:', error.message);
    },
  });
};
