/**
 * @file Componente customizado para ser usado como botão em uma BottomTabBar (barra de abas).
 * A sua principal função é adicionar um feedback tátil (uma leve vibração) no iOS
 * quando o usuário pressiona o dedo sobre uma aba, melhorando a experiência de uso.
 */

import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';

export function HapticTab(props: BottomTabBarButtonProps) {
  return (
    <PlatformPressable
      {...props}
      // 'onPressIn' é acionado no momento em que o dedo toca o botão, antes de soltar.
      onPressIn={(ev) => {
        // A API de Haptics é mais robusta e comum no iOS.
        if (process.env.EXPO_OS === 'ios') {
          // Dispara uma vibração leve para dar um feedback físico ao usuário.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        // Chama a função 'onPressIn' original, se existir.
        props.onPressIn?.(ev);
      }}
    />
  );
}