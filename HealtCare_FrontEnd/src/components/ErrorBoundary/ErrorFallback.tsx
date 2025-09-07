import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  message?: string;
  showRetry?: boolean;
  showReport?: boolean;
  onRetry?: () => void;
  onReport?: () => void;
  variant?: 'default' | 'network' | 'validation' | 'server' | 'empty';
}

export default function ErrorFallback({
  error,
  resetError,
  title,
  message,
  showRetry = true,
  showReport = true,
  onRetry,
  onReport,
  variant = 'default',
}: ErrorFallbackProps) {
  const getVariantConfig = () => {
    switch (variant) {
      case 'network':
        return {
          icon: 'wifi-off',
          iconColor: '#ff9500',
          title: title || 'Sem conexão',
          message: message || 'Verifique sua conexão com a internet e tente novamente.',
        };
      case 'validation':
        return {
          icon: 'alert-circle',
          iconColor: '#ff6b6b',
          title: title || 'Dados inválidos',
          message: message || 'Verifique as informações fornecidas e tente novamente.',
        };
      case 'server':
        return {
          icon: 'server',
          iconColor: '#ff6b6b',
          title: title || 'Erro do servidor',
          message: message || 'Estamos enfrentando problemas técnicos. Tente novamente em alguns minutos.',
        };
      case 'empty':
        return {
          icon: 'inbox',
          iconColor: '#8e8e93',
          title: title || 'Nenhum resultado',
          message: message || 'Não encontramos o que você está procurando.',
        };
      default:
        return {
          icon: 'alert-triangle',
          iconColor: '#ff6b6b',
          title: title || 'Ops! Algo deu errado',
          message: message || 'Encontramos um problema inesperado. Tente novamente.',
        };
    }
  };

  const config = getVariantConfig();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else if (resetError) {
      resetError();
    }
  };

  const handleReport = () => {
    if (onReport) {
      onReport();
    } else {
      console.log('Reportar erro:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Feather name={config.icon as any} size={64} color={config.iconColor} />
        </View>
        
        <Text style={styles.title}>{config.title}</Text>
        
        <Text style={styles.message}>{config.message}</Text>

        {__DEV__ && error && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Detalhes do erro (Dev):</Text>
            <Text style={styles.debugText}>{error.message}</Text>
            {error.stack && (
              <Text style={styles.debugText}>{error.stack}</Text>
            )}
          </View>
        )}

        <View style={styles.buttonContainer}>
          {showRetry && (
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Feather name="refresh-cw" size={20} color="white" />
              <Text style={styles.retryButtonText}>Tentar novamente</Text>
            </TouchableOpacity>
          )}

          {showReport && variant !== 'empty' && (
            <TouchableOpacity style={styles.reportButton} onPress={handleReport}>
              <Feather name="send" size={20} color="#004A61" />
              <Text style={styles.reportButtonText}>Reportar erro</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
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
    maxWidth: 300,
  },
  debugContainer: {
    backgroundColor: '#f1f3f4',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
    maxWidth: 400,
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
    flexWrap: 'wrap',
    justifyContent: 'center',
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
