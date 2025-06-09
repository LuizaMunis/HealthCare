/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};
/**
 * Este arquivo contém a paleta de cores para os temas claro e escuro.
 * As cores são baseadas no design fornecido.
 */

// Primeiro, definimos a paleta base para evitar repetir os códigos hexadecimais.
const palette = {
  primaryDarkBlue: '#16425B',
  primaryBlue: '#3B7CA6',
  accentCyan: '#81C4D7',
  lightBackground: '#F7F7F7',
  darkBackground: '#1C1C1E', // Um tom de carvão escuro para o modo escuro
  darkCard: '#1D2A32',      // Um azul escuro para os cards no modo escuro
  white: '#FFFFFF',
  lightGray: '#F7F7F7',
  mediumGray: '#A4A4A4',
  darkGray: '#707070',
  textDark: '#11181C',
  textLight: '#ECEDEE',
  warning: '#EB9481',
};

// Agora, criamos os objetos de tema que serão usados em todo o aplicativo.
export const Colors = {
  light: {
    text: palette.textDark,
    textSecondary: palette.darkGray,
    background: palette.lightBackground,
    card: palette.white,
    primary: palette.primaryDarkBlue,
    accent: palette.accentCyan,
    tabBarBackground: palette.white,
    tint: palette.primaryDarkBlue, // Cor do ícone ativo na aba
    inactiveTint: palette.mediumGray, // Cor do ícone inativo na aba
  },
  dark: {
    text: palette.textLight,
    textSecondary: palette.mediumGray,
    background: palette.darkBackground,
    card: palette.darkCard,
    primary: palette.accentCyan, // No modo escuro, o ciano se torna a cor de ação principal
    accent: palette.accentCyan,
    tabBarBackground: palette.darkCard,
    tint: palette.white, // Cor do ícone ativo na aba
    inactiveTint: palette.mediumGray, // Cor do ícone inativo na aba
  },
};