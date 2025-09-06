# Sistema de Tratamento de Erros - HealthCare

## 📋 Visão Geral

Este documento descreve o sistema robusto de tratamento de erros implementado no projeto HealthCare, que inclui Error Boundaries, hooks personalizados, monitoramento de erros e fallbacks elegantes.

## 🏗️ Arquitetura do Sistema

### 1. **Error Boundary** (`/src/components/ErrorBoundary/ErrorBoundary.tsx`)
- Captura erros de JavaScript em componentes React
- Renderiza fallbacks elegantes
- Integra com serviço de monitoramento
- Suporte a retry e report de erros

### 2. **Hooks de Tratamento de Erros** (`/src/hooks/useErrorHandler.ts`)
- `useErrorHandler`: Hook base para tratamento de erros
- `useApiErrorHandler`: Específico para erros de API
- `useValidationErrorHandler`: Para erros de validação
- `useNetworkErrorHandler`: Para erros de rede

### 3. **Serviço de Monitoramento** (`/src/services/errorMonitoringService.ts`)
- Captura e reporta erros automaticamente
- Suporte a serviços externos (Sentry, LogRocket, etc.)
- Limite de relatórios por sessão
- Informações de contexto e dispositivo

### 4. **Componente de Fallback** (`/src/components/ErrorBoundary/ErrorFallback.tsx`)
- Fallbacks reutilizáveis para diferentes tipos de erro
- Variantes: default, network, validation, server, empty
- Interface consistente e amigável

## 🚀 Como Usar

### 1. **Error Boundary Básico**

```tsx
import ErrorBoundary from '@/components/ErrorBoundary/ErrorBoundary';
import ErrorFallback from '@/components/ErrorBoundary/ErrorFallback';

<ErrorBoundary
  fallback={<ErrorFallback variant="default" />}
  onError={(error, errorInfo) => {
    console.error('Erro capturado:', error);
  }}
>
  <SeuComponente />
</ErrorBoundary>
```

### 2. **Hook de Tratamento de Erros**

```tsx
import { useApiErrorHandler } from '@/hooks/useErrorHandler';

function MeuComponente() {
  const { handleError, handleAsyncError, clearError } = useApiErrorHandler();

  const handleAsyncOperation = async () => {
    const result = await handleAsyncError(
      async () => {
        // Sua operação assíncrona aqui
        return await apiCall();
      },
      'handleAsyncOperation'
    );

    if (!result) {
      // Erro foi tratado automaticamente
      return;
    }
  };

  const handleSyncError = () => {
    try {
      // Operação que pode falhar
      throw new Error('Erro de exemplo');
    } catch (error) {
      handleError(error, 'handleSyncError');
    }
  };
}
```

### 3. **Fallbacks Específicos**

```tsx
// Erro de rede
<ErrorFallback variant="network" />

// Erro de validação
<ErrorFallback variant="validation" />

// Erro do servidor
<ErrorFallback variant="server" />

// Estado vazio
<ErrorFallback variant="empty" />

// Fallback personalizado
<ErrorFallback
  variant="default"
  title="Título personalizado"
  message="Mensagem personalizada"
  showRetry={true}
  showReport={false}
  onRetry={() => console.log('Retry clicked')}
/>
```

### 4. **Monitoramento de Erros**

```tsx
import { captureError, captureException, captureMessage } from '@/services/errorMonitoringService';

// Capturar erro
captureError(new Error('Erro de exemplo'), { context: 'minhaFuncao' });

// Capturar exceção
captureException('Mensagem de erro', { userId: '123' });

// Capturar mensagem
captureMessage('Aviso importante', 'warning', { component: 'MeuComponente' });
```

## 📊 Tipos de Erro Suportados

### 1. **Erros de API**
- Timeout de conexão
- Erro de autenticação
- Erro de autorização
- Erro do servidor (500+)

### 2. **Erros de Validação**
- Dados inválidos
- Campos obrigatórios
- Formato incorreto

### 3. **Erros de Rede**
- Sem conexão
- Conexão instável
- Timeout

### 4. **Erros de JavaScript**
- Erros de runtime
- Erros de sintaxe
- Erros de componente

## 🔧 Configuração

### 1. **Configurar Monitoramento**

```tsx
import errorMonitoring from '@/services/errorMonitoringService';

// Configurar serviço externo
errorMonitoring.setConfig({
  enabled: true,
  endpoint: 'https://seu-servico.com/api/errors',
  apiKey: 'sua-api-key',
  maxReportsPerSession: 10,
  includeDeviceInfo: true,
  includeUserInfo: true,
});

// Definir usuário
errorMonitoring.setUserId('user-123');
```

### 2. **Configurar Error Boundary Global**

```tsx
// No _layout.tsx
<ErrorBoundary
  fallback={<ErrorFallback variant="default" />}
  onError={(error, errorInfo) => {
    // Log personalizado
    console.error('Erro global:', error);
    
    // Enviar para serviço externo
    captureError(error, { global: true });
  }}
>
  {/* Seu app aqui */}
</ErrorBoundary>
```

## 📈 Monitoramento e Analytics

### 1. **Métricas Coletadas**
- Frequência de erros
- Tipos de erro mais comuns
- Usuários afetados
- Contexto do erro
- Informações do dispositivo

### 2. **Relatórios Disponíveis**
- Erros por sessão
- Erros por usuário
- Erros por componente
- Timeline de erros

### 3. **Alertas**
- Picos de erro
- Erros críticos
- Falhas de API

## 🛠️ Manutenção

### 1. **Limpeza de Relatórios**
```tsx
// Limpar relatórios da sessão
errorMonitoring.clearReports();

// Obter relatórios atuais
const reports = errorMonitoring.getReports();
```

### 2. **Teste do Sistema**
```tsx
// Testar captura de erro
await errorMonitoring.testErrorCapture();
```

### 3. **Debug em Desenvolvimento**
- Logs detalhados em `__DEV__`
- Stack traces completos
- Informações de contexto

## 🔒 Segurança

### 1. **Dados Sensíveis**
- Não capturar senhas
- Não capturar tokens
- Anonimizar dados pessoais

### 2. **Limites de Rate**
- Máximo de relatórios por sessão
- Throttling de erros repetidos
- Filtros de spam

## 📝 Boas Práticas

### 1. **Uso Correto**
- Sempre usar Error Boundaries em componentes críticos
- Usar hooks específicos para cada tipo de erro
- Fornecer fallbacks informativos

### 2. **Evitar**
- Capturar erros desnecessários
- Expor informações sensíveis
- Sobrecarregar o sistema de monitoramento

### 3. **Manutenção**
- Revisar relatórios regularmente
- Atualizar configurações conforme necessário
- Monitorar performance do sistema

## 🚨 Troubleshooting

### 1. **Erro Boundary não captura**
- Verificar se o componente está dentro do Error Boundary
- Verificar se o erro é de JavaScript (não de rede)

### 2. **Monitoramento não funciona**
- Verificar se está habilitado
- Verificar configuração de endpoint
- Verificar logs de console

### 3. **Fallback não aparece**
- Verificar se o erro foi capturado
- Verificar props do ErrorFallback
- Verificar estilos CSS

## 📚 Referências

- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Error Handling Best Practices](https://react.dev/learn/keeping-components-pure#side-effects-unintended-consequences)
- [Monitoring Services](https://sentry.io/, https://logrocket.com/)

---

**Última atualização:** Dezembro 2024
**Versão:** 1.0.0
**Autor:** Equipe HealthCare
