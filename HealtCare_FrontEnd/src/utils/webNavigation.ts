import { Platform } from 'react-native';

export const navigateToProfileWeb = () => {
  console.log('🌐 Navegação específica para web');
  
  if (Platform.OS !== 'web') {
    console.log('❌ Esta função é apenas para web');
    return false;
  }

  // Método 1: window.location.href (mais confiável)
  try {
    console.log('🔄 Método 1: window.location.href');
    window.location.href = '/Perfil';
    console.log('✅ window.location.href executado');
    return true;
  } catch (error) {
    console.error('❌ window.location.href falhou:', error);
  }

  // Método 2: window.location.replace
  try {
    console.log('🔄 Método 2: window.location.replace');
    window.location.replace('/Perfil');
    console.log('✅ window.location.replace executado');
    return true;
  } catch (error) {
    console.error('❌ window.location.replace falhou:', error);
  }

  // Método 3: window.location.assign
  try {
    console.log('🔄 Método 3: window.location.assign');
    window.location.assign('/Perfil');
    console.log('✅ window.location.assign executado');
    return true;
  } catch (error) {
    console.error('❌ window.location.assign falhou:', error);
  }

  // Método 4: history.pushState + reload
  try {
    console.log('🔄 Método 4: history.pushState + reload');
    window.history.pushState({}, '', '/Perfil');
    window.location.reload();
    console.log('✅ history.pushState + reload executado');
    return true;
  } catch (error) {
    console.error('❌ history.pushState + reload falhou:', error);
  }

  console.error('❌ Todos os métodos de navegação web falharam');
  return false;
};

export const testWebNavigationMethods = () => {
  console.log('🧪 Testando todos os métodos de navegação web...');
  
  const methods = [
    {
      name: 'window.location.href',
      fn: () => window.location.href = '/Perfil'
    },
    {
      name: 'window.location.replace',
      fn: () => window.location.replace('/Perfil')
    },
    {
      name: 'window.location.assign',
      fn: () => window.location.assign('/Perfil')
    },
    {
      name: 'history.pushState + reload',
      fn: () => {
        window.history.pushState({}, '', '/Perfil');
        window.location.reload();
      }
    }
  ];

  methods.forEach((method, index) => {
    try {
      console.log(`🔄 Testando método ${index + 1}: ${method.name}`);
      method.fn();
      console.log(`✅ Método ${index + 1} executado com sucesso`);
    } catch (error) {
      console.error(`❌ Método ${index + 1} falhou:`, error);
    }
  });
};
