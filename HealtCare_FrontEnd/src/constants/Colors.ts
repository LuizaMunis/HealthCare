/**
 * Este arquivo contém a paleta de cores para os temas claro e escuro.
 * As cores são baseadas no design fornecido para o aplicativo HealthCare.
 */

// 1. Definição da paleta de cores base para reutilização.
// Isso evita a repetição de códigos hexadecimais e facilita a manutenção.
const palette = {
  primaryDarkBlue: '#16425B',
  primaryBlue: '#3B7CA6',
  accentCyan: '#81C4D7',
  lightBackground: '#F7F7F7',
  darkBackground: '#1C1C1E', // Um tom de carvão escuro para o modo escuro
  darkCard: '#1D2A32',      // Um azul escuro para os cards no modo escuro
  white: '#FFFFFF',
  mediumGray: '#A4A4A4',
  darkGray: '#707070',
  textDark: '#11181C',
  textLight: '#ECEDEE',
  warning: '#EB9481',
};

// 2. Criação do objeto 'Colors' que será usado em todo o aplicativo.
// Ele define nomes semânticos para as cores em cada tema (light e dark).
export const Colors = {
  light: {
    text: palette.textDark,
    textSecondary: palette.darkGray,
    background: palette.lightBackground,
    card: palette.white,
    primary: palette.primaryDarkBlue,
    accent: palette.accentCyan,
    tabBarBackground: palette.white,
    tint: palette.primaryDarkBlue, // Cor do ícone ATIVO na barra de abas
    inactiveTint: palette.mediumGray, // Cor do ícone INATIVO na barra de abas
  },
  dark: {
    text: palette.textLight,
    textSecondary: palette.mediumGray,
    background: palette.darkBackground,
    card: palette.darkCard,
    primary: palette.accentCyan, // No modo escuro, o ciano vira a cor de destaque principal
    accent: palette.accentCyan,
    tabBarBackground: palette.darkCard,
    tint: palette.white, // Cor do ícone ATIVO na barra de abas
    inactiveTint: palette.mediumGray, // Cor do ícone INATIVO na barra de abas
  },
};