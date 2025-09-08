import { useRouter } from 'expo-router';
import { Platform } from 'react-native';

export const useNavigation = () => {
  const router = useRouter();

  const navigateToProfile = () => {
    console.log('🚀 useNavigation: Iniciando navegação para perfil');
    console.log('🌐 Plataforma:', Platform.OS);
    
    if (Platform.OS === 'web') {
      // Estratégia 1: router.replace (método padrão do Expo Router)
      try {
        console.log('🔄 Estratégia 1: router.replace');
        router.replace('/Perfil');
        return true;
      } catch (error) {
        console.error('❌ Estratégia 1 falhou:', error);
      }

      // Estratégia 2: window.location.href (navegação completa)
      try {
        console.log('🔄 Estratégia 2: window.location.href');
        window.location.href = '/Perfil';
        return true;
      } catch (error) {
        console.error('❌ Estratégia 2 falhou:', error);
      }

      // Estratégia 3: window.location.replace (sem histórico)
      try {
        console.log('🔄 Estratégia 3: window.location.replace');
        window.location.replace('/Perfil');
        return true;
      } catch (error) {
        console.error('❌ Estratégia 3 falhou:', error);
      }

      // Estratégia 4: router.push (alternativa)
      try {
        console.log('🔄 Estratégia 4: router.push');
        router.push('/Perfil');
        return true;
      } catch (error) {
        console.error('❌ Estratégia 4 falhou:', error);
      }

      // Estratégia 5: window.location.assign (último recurso)
      try {
        console.log('🔄 Estratégia 5: window.location.assign');
        window.location.assign('/Perfil');
        return true;
      } catch (error) {
        console.error('❌ Estratégia 5 falhou:', error);
      }

      console.error('❌ Todas as estratégias de navegação web falharam');
      return false;
    } else {
      // Para mobile, usar métodos do Expo Router
      try {
        console.log('🔄 Mobile: router.replace');
        router.replace('/Perfil');
        return true;
      } catch (error) {
        console.error('❌ Mobile router.replace falhou:', error);
      }

      try {
        console.log('🔄 Mobile: router.push');
        router.push('/Perfil');
        return true;
      } catch (error) {
        console.error('❌ Mobile router.push falhou:', error);
      }

      console.error('❌ Navegação mobile falhou');
      return false;
    }
  };

  const navigateToLogin = () => {
    console.log('🚀 useNavigation: Navegando para login');
    
    if (Platform.OS === 'web') {
      try {
        window.location.href = '/login';
        return true;
      } catch (error) {
        console.error('❌ Navegação para login falhou:', error);
        return false;
      }
    } else {
      try {
        router.replace('/login');
        return true;
      } catch (error) {
        console.error('❌ Navegação para login falhou:', error);
        return false;
      }
    }
  };

  const navigateToHome = () => {
    console.log('🚀 useNavigation: Navegando para home');
    
    if (Platform.OS === 'web') {
      try {
        window.location.href = '/(tabs)/home';
        return true;
      } catch (error) {
        console.error('❌ Navegação para home falhou:', error);
        return false;
      }
    } else {
      try {
        router.replace('/(tabs)/home');
        return true;
      } catch (error) {
        console.error('❌ Navegação para home falhou:', error);
        return false;
      }
    }
  };

  return {
    navigateToProfile,
    navigateToLogin,
    navigateToHome,
    router
  };
};
