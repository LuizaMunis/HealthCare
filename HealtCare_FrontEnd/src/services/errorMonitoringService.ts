// HealtCare_FrontEnd/src/services/errorMonitoringService.ts

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  deviceInfo: DeviceInfo;
  appVersion: string;
  context?: Record<string, any>;
}

export interface DeviceInfo {
  platform: string;
  version: string;
  model?: string;
  brand?: string;
}

export interface ErrorMonitoringConfig {
  enabled: boolean;
  endpoint?: string;
  apiKey?: string;
  maxReportsPerSession?: number;
  includeDeviceInfo?: boolean;
  includeUserInfo?: boolean;
}

class ErrorMonitoringService {
  private config: ErrorMonitoringConfig;
  private reports: ErrorReport[] = [];
  private sessionId: string;
  private userId?: string;

  constructor(config: ErrorMonitoringConfig = { enabled: false }) {
    this.config = {
      enabled: false,
      maxReportsPerSession: 10,
      includeDeviceInfo: true,
      includeUserInfo: true,
      ...config,
    };
    
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  setConfig(config: Partial<ErrorMonitoringConfig>) {
    this.config = { ...this.config, ...config };
  }

  private getDeviceInfo(): DeviceInfo {
    // Em React Native, você pode usar react-native-device-info
    // Por enquanto, retornamos informações básicas
    return {
      platform: 'react-native',
      version: '1.0.0',
      model: 'Unknown',
      brand: 'Unknown',
    };
  }

  private async getAppVersion(): Promise<string> {
    // Em React Native, você pode usar expo-constants ou react-native-device-info
    return '1.0.0';
  }

  async captureError(
    error: Error,
    context?: Record<string, any>,
    componentStack?: string
  ): Promise<void> {
    if (!this.config.enabled) {
      console.error('Error monitoring disabled. Error:', error);
      return;
    }

    // Verificar limite de relatórios por sessão
    if (this.reports.length >= (this.config.maxReportsPerSession || 10)) {
      console.warn('Maximum error reports per session reached');
      return;
    }

    const appVersion = await this.getAppVersion();
    
    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      message: error.message,
      stack: error.stack,
      componentStack,
      timestamp: new Date().toISOString(),
      userId: this.config.includeUserInfo ? this.userId : undefined,
      sessionId: this.sessionId,
      deviceInfo: this.config.includeDeviceInfo ? this.getDeviceInfo() : {} as DeviceInfo,
      appVersion,
      context,
    };

    this.reports.push(errorReport);

    // Enviar para serviço externo se configurado
    if (this.config.endpoint) {
      await this.sendToExternalService(errorReport);
    }

    // Log local para desenvolvimento
    if (__DEV__) {
      console.group('🚨 Error Report');
      console.log('Message:', errorReport.message);
      console.log('Stack:', errorReport.stack);
      console.log('Context:', errorReport.context);
      console.log('Timestamp:', errorReport.timestamp);
      console.groupEnd();
    }
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async sendToExternalService(errorReport: ErrorReport): Promise<void> {
    if (!this.config.endpoint || !this.config.apiKey) {
      return;
    }

    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(errorReport),
      });

      if (!response.ok) {
        console.error('Failed to send error report:', response.status);
      }
    } catch (error) {
      console.error('Error sending error report:', error);
    }
  }

  async captureException(
    exception: Error | string,
    context?: Record<string, any>
  ): Promise<void> {
    const error = typeof exception === 'string' ? new Error(exception) : exception;
    await this.captureError(error, context);
  }

  async captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error' = 'info',
    context?: Record<string, any>
  ): Promise<void> {
    if (level === 'error') {
      await this.captureException(message, context);
    } else {
      // Para mensagens de info/warning, apenas log local
      console.log(`[${level.toUpperCase()}] ${message}`, context);
    }
  }

  getReports(): ErrorReport[] {
    return [...this.reports];
  }

  clearReports(): void {
    this.reports = [];
  }

  // Método para testar o serviço
  async testErrorCapture(): Promise<void> {
    const testError = new Error('Test error for monitoring service');
    await this.captureError(testError, { test: true });
  }
}

// Instância singleton
export const errorMonitoring = new ErrorMonitoringService({
  enabled: __DEV__, // Habilitado apenas em desenvolvimento por padrão
  maxReportsPerSession: 10,
  includeDeviceInfo: true,
  includeUserInfo: true,
});

// Funções de conveniência
export const captureError = (error: Error, context?: Record<string, any>) => 
  errorMonitoring.captureError(error, context);

export const captureException = (exception: Error | string, context?: Record<string, any>) => 
  errorMonitoring.captureException(exception, context);

export const captureMessage = (message: string, level?: 'info' | 'warning' | 'error', context?: Record<string, any>) => 
  errorMonitoring.captureMessage(message, level, context);

export default errorMonitoring;
