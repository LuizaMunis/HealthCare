/**
 * @file Implementação do componente de Ícone ESPECÍFICA para iOS.
 * O nome do arquivo com ".ios.tsx" faz com que o Metro Bundler (empacotador do React Native)
 * escolha este arquivo automaticamente quando o app for compilado para iOS.
 * Utiliza a biblioteca `expo-symbols` para renderizar os SF Symbols nativos da Apple,
 * garantindo performance e um visual perfeitamente integrado ao sistema.
 */

import { SymbolView, SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { StyleProp, ViewStyle } from 'react-native';

export function IconSymbol({
  name, // Nome do SF Symbol (ex: 'house.fill').
  size = 24,
  color,
  style,
  weight = 'regular', // Peso/espessura do ícone (ex: 'light', 'bold').
}: {
  name: SymbolViewProps['name'];
  size?: number;
  color: string;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  return (
    <SymbolView
      weight={weight}
      tintColor={color}
      resizeMode="scaleAspectFit"
      name={name}
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
    />
  );
}