import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { captureError } from '@/services/errorMonitoringService';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Chama callback personalizado se fornecido
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Aqui você pode enviar o erro para um serviço de monitoramento
    // como Sentry, LogRocket, etc.
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      await captureError(error, {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      });
    } catch (monitoringError) {
      console.error('Erro ao enviar para monitoramento:', monitoringError);
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReportError = () => {
    // Implementar funcionalidade de reportar erro
    console.log('Reportar erro:', this.state.error);
  };

  render() {
    if (this.state.hasError) {
      // Renderiza fallback personalizado se fornecido
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Renderiza fallback padrão
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.errorContainer}>
              <View style={styles.iconContainer}>
                <Feather name="alert-triangle" size={64} color="#ff6b6b" />
              </View>
              
              <Text style={styles.title}>Ops! Algo deu errado</Text>
              
              <Text style={styles.message}>
                Encontramos um problema inesperado. Não se preocupe, nossa equipe foi notificada.
              </Text>

              {__DEV__ && this.state.error && (
                <View style={styles.debugContainer}>
                  <Text style={styles.debugTitle}>Detalhes do erro (Dev):</Text>
                  <Text style={styles.debugText}>{this.state.error.message}</Text>
                  {this.state.errorInfo && (
                    <Text style={styles.debugText}>
                      {this.state.errorInfo.componentStack}
                    </Text>
                  )}
                </View>
              )}

              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.retryButton} onPress={this.handleRetry}>
                  <Feather name="refresh-cw" size={20} color="white" />
                  <Text style={styles.retryButtonText}>Tentar novamente</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.reportButton} onPress={this.handleReportError}>
                  <Feather name="send" size={20} color="#004A61" />
                  <Text style={styles.reportButtonText}>Reportar erro</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  debugContainer: {
    backgroundColor: '#f1f3f4',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  retryButton: {
    backgroundColor: '#004A61',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  reportButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#004A61',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  reportButtonText: {
    color: '#004A61',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
