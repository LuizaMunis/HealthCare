/**
 * @file Implementação de fallback do componente de Ícone para Android e Web.
 * Este arquivo é usado quando a plataforma NÃO é iOS.
 * Ele utiliza os ícones do Material Icons (uma biblioteca popular) como alternativa
 * aos SF Symbols, que são exclusivos da Apple.
 */

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

// Tipos para garantir que os nomes de ícones sejam válidos.
type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Mapeamento manual entre os nomes dos SF Symbols (usados no iOS)
 * e os nomes correspondentes no Material Icons (usados aqui).
 * Isso é crucial para que o mesmo nome de ícone (ex: 'house.fill')
 * funcione em todas as plataformas, renderizando o ícone correto em cada uma.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'plus.rectangle.fill': 'add-box',
  'chart.bar.fill': 'bar-chart',
  'person.fill': 'person',
} as IconMapping;


export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight; // A prop 'weight' é recebida mas não usada aqui, pois MaterialIcons não a suporta.
}) {
  // Renderiza o componente MaterialIcons, buscando o nome correspondente no objeto MAPPING.
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}