//HealthCare_FrontEnd/src/app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import ErrorBoundary from '@/components/ErrorBoundary/ErrorBoundary';
import ErrorFallback from '@/components/ErrorBoundary/ErrorFallback';

// Impede que a tela de splash suma antes de carregarmos o que for necessário.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  
  // CORREÇÃO: Removemos a tentativa de carregar a fonte 'SpaceMono'.
  // Agora, o useFonts está vazio, mas você pode adicionar suas próprias fontes aqui no futuro.
  const [loaded, error] = useFonts({
    // Se você tiver suas próprias fontes, adicione-as aqui. Exemplo:
    // 'Roboto-Regular': require('../assets/fonts/Roboto-Regular.ttf'),
  });

  useEffect(() => {
    // Se houver um erro no carregamento das fontes, logue o erro.
    if (error) {
      console.error('Erro ao carregar fontes:', error);
    }
    // Oculta a tela de splash assim que as fontes forem carregadas ou se ocorrer um erro.
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  // Se as fontes ainda não foram carregadas e não houve erro, não renderiza nada para manter o splash visível.
  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary
        fallback={
          <ErrorFallback
            variant="default"
            title="Erro no aplicativo"
            message="Ocorreu um erro inesperado. O aplicativo será reiniciado."
          />
        }
        onError={(error, errorInfo) => {
          console.error('Erro capturado no layout principal:', error, errorInfo);
        }}
      >
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="Perfil" options={{ headerShown: false }} />
            <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </ThemeProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
