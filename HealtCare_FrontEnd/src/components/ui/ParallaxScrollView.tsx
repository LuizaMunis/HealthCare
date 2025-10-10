/**
 * @file Componente de ScrollView que aplica um efeito "parallax" a uma imagem de cabeçalho.
 * Conforme o usuário rola a tela, a imagem se move e escala de forma animada,
 * criando uma experiência visualmente rica e dinâmica.
 * Utiliza a biblioteca `react-native-reanimated` para animações performáticas.
 */

import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';

import { ThemedView } from '@/components/ui/ThemedView';
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';

// Altura fixa para a área do cabeçalho que será animada.
const HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{
  headerImage: ReactElement; // O componente da imagem a ser exibido no cabeçalho.
  headerBackgroundColor: { dark: string; light: string }; // Cores de fundo para os temas.
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  // Referência animada para o ScrollView.
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  // Hook que rastreia a posição de rolagem (offset) do ScrollView.
  const scrollOffset = useScrollViewOffset(scrollRef);
  const bottom = useBottomTabOverflow();

  // Hook que define o estilo animado do cabeçalho.
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          // 'interpolate' mapeia a posição do scroll para um valor de translação (movimento Y).
          // Isso faz a imagem se mover para cima mais lentamente que o scroll.
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75]
          ),
        },
        {
          // Também mapeia a posição do scroll para um valor de escala.
          // Isso faz a imagem dar um "zoom out" suave ao começar a rolar.
          scale: interpolate(scrollOffset.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1]),
        },
      ],
    };
  });

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16} // Define a frequência de eventos de scroll (importante para performance).
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{ paddingBottom: bottom }}>
        {/* View animada que contém a imagem do cabeçalho */}
        <Animated.View
          style={[
            styles.header,
            { backgroundColor: headerBackgroundColor[colorScheme] },
            headerAnimatedStyle, // Aplica os estilos de animação calculados.
          ]}>
          {headerImage}
        </Animated.View>
        {/* View que contém o conteúdo principal da tela */}
        <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: 'hidden', // Garante que a imagem não "vaze" da área do cabeçalho.
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: 'hidden',
  },
});