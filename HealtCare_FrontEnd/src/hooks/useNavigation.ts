import { useRouter } from 'expo-router';
import { Platform } from 'react-native';

export const useNavigation = () => {
  const router = useRouter();

  const navigateToProfile = () => {
    console.log('🚀 useNavigation: Iniciando navegação para perfil');
    console.log('🌐 Plataforma:', Platform.OS);
    
    // Para web, usar estratégia diferente
    if (Platform.OS === 'web') {
      console.log('🌐 Navegação específica para web');
      
      // Estratégia 1: Tentar router.replace primeiro
      try {
        console.log('🔄 Tentando router.replace para web...');
        router.replace('/Perfil');
        console.log('✅ router.replace executado para web');
        return true;
      } catch (error) {
        console.error('❌ router.replace falhou para web:', error);
      }
      
      // Estratégia 2: Usar window.location.href
      try {
        console.log('🔄 Fallback web: window.location.href');
        window.location.href = '/Perfil';
        console.log('✅ window.location.href executado');
        return true;
      } catch (webError) {
        console.error('❌ window.location.href falhou:', webError);
      }
      
      // Estratégia 3: Usar window.location.replace
      try {
        console.log('🔄 Fallback web: window.location.replace');
        window.location.replace('/Perfil');
        console.log('✅ window.location.replace executado');
        return true;
      } catch (replaceError) {
        console.error('❌ window.location.replace falhou:', replaceError);
      }
      
      // Estratégia 4: Usar router.push como penúltimo recurso
      try {
        console.log('🔄 Penúltimo recurso web: router.push');
        router.push('/Perfil');
        console.log('✅ router.push executado como penúltimo recurso');
        return true;
      } catch (pushError) {
        console.error('❌ router.push falhou:', pushError);
      }
      
      // Estratégia 5: Usar window.location.assign como último recurso
      try {
        console.log('🔄 Último recurso web: window.location.assign');
        window.location.assign('/Perfil');
        console.log('✅ window.location.assign executado');
        return true;
      } catch (assignError) {
        console.error('❌ Todos os métodos de navegação web falharam:', assignError);
        return false;
      }
    } else {
      // Para mobile, usar router.replace
      console.log('📱 Navegação específica para mobile');
      try {
        console.log('🔄 Tentando router.replace para mobile...');
        router.replace('/Perfil');
        console.log('✅ router.replace executado para mobile');
        return true;
      } catch (error) {
        console.error('❌ router.replace falhou para mobile:', error);
        
        // Fallback para mobile
        try {
          console.log('🔄 Fallback mobile: router.push');
          router.push('/Perfil');
          console.log('✅ router.push executado para mobile');
          return true;
        } catch (mobileError) {
          console.error('❌ Fallback mobile falhou:', mobileError);
          return false;
        }
      }
    }
  };

  const navigateToLogin = () => {
    console.log('🚀 useNavigation: Navegando para login');
    try {
      router.replace('/login');
      return true;
    } catch (error) {
      console.error('❌ Navegação para login falhou:', error);
      return false;
    }
  };

  const navigateToHome = () => {
    console.log('🚀 useNavigation: Navegando para home');
    try {
      router.replace('/(tabs)/home');
      return true;
    } catch (error) {
      console.error('❌ Navegação para home falhou:', error);
      return false;
    }
  };

  return {
    navigateToProfile,
    navigateToLogin,
    navigateToHome,
    router
  };
};
