/**
 * @file Implementação do fundo da barra de abas (TabBar) específica para iOS.
 * O sufixo ".ios.tsx" faz com que este arquivo seja usado automaticamente apenas no iOS.
 * Ele utiliza o componente `BlurView` da biblioteca Expo para criar um efeito de desfoque (blur)
 * translúcido, replicando a aparência nativa das barras de navegação do iOS.
 */

import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { StyleSheet } from 'react-native';

export default function BlurTabBarBackground() {
  return (
    <BlurView
      // A propriedade 'tint' com 'systemChromeMaterial' adapta-se automaticamente
      // ao tema do sistema (claro ou escuro), espelhando a aparência nativa do iOS.
      tint="systemChromeMaterial"
      intensity={100} // Intensidade do efeito de desfoque.
      style={StyleSheet.absoluteFill} // Faz o BlurView preencher todo o espaço do componente pai (a TabBar).
    />
  );
}

/**
 * Hook customizado que retorna a altura da barra de abas inferior.
 * Em um layout com fundo translúcido como este, o conteúdo da tela pode precisar
 * de um preenchimento (padding) na parte inferior para não ser sobreposto pela barra.
 * Este hook fornece o valor exato dessa altura.
 */
export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}