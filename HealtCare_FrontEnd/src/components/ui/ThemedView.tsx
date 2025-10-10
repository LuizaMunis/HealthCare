/**
 * @file Componente de View customizado que se adapta ao tema da aplicação.
 * Sua principal função é definir automaticamente a cor de fundo (`backgroundColor`)
 * com base no tema atual (claro ou escuro), evitando a necessidade de configurar
 * a cor manualmente em cada tela.
 */

import { View, type ViewProps } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

// Define as props que o componente aceita, estendendo as props padrão da View.
export type ThemedViewProps = ViewProps & {
  lightColor?: string; // Cor de fundo customizada para o modo claro.
  darkColor?: string; // Cor de fundo customizada para o modo escuro.
};

export function ThemedView({ style, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  // Hook customizado que busca a cor de fundo apropriada do tema.
  // Se 'lightColor'/'darkColor' forem passadas, elas têm prioridade.
  // Caso contrário, ele usa a cor padrão para 'background' definida no arquivo de cores.
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  // Retorna uma View padrão, mas com a cor de fundo já aplicada.
  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}