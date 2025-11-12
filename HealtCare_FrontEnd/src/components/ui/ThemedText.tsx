/**
 * @file Componente de Texto (`Text`) customizado que se adapta ao tema da aplicação.
 * Ele define estilos predefinidos (como 'title', 'subtitle', 'link') e ajusta
 * automaticamente a cor do texto com base no tema atual (claro ou escuro).
 */

import { StyleSheet, Text, type TextProps } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

// Define as props que o componente aceita, estendendo as props padrão do Text.
export type ThemedTextProps = TextProps & {
  lightColor?: string; // Cor customizada para o modo claro.
  darkColor?: string; // Cor customizada para o modo escuro.
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link'; // Estilos predefinidos.
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default', // O tipo padrão é 'default'.
  ...rest
}: ThemedTextProps) {
  // Hook customizado que busca a cor apropriada do tema atual.
  // Se 'lightColor'/'darkColor' forem passadas, elas têm prioridade.
  // Caso contrário, ele usa a cor padrão para 'text' definida no arquivo de cores.
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color }, // Aplica a cor do tema.
        // Aplica o estilo predefinido com base na prop 'type'.
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style, // Permite sobrescrever com estilos passados via props.
      ]}
      {...rest} // Passa adiante todas as outras props do componente Text.
    />
  );
}

// Folha de estilos com as variações predefinidas.
const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4', // Cor fixa para links.
  },
});