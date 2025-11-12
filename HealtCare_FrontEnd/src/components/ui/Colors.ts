/**
 * @file Centraliza as paletas de cores para os temas da aplicação.
 * Exporta um objeto `Colors` que contém as cores para os modos claro (light) e escuro (dark).
 * Isso garante consistência visual e facilita a manutenção dos temas.
 */

// Cor de destaque para elementos interativos no modo claro.
const tintColorLight = '#0a7ea4';
// Cor de destaque para elementos interativos no modo escuro.
const tintColorDark = '#fff';

export const Colors = {
  // Paleta de cores para o tema claro.
  light: {
    text: '#11181C', // Cor principal do texto.
    background: '#f5f5f5', // Cor de fundo principal das telas.
    tint: tintColorLight, // Cor de destaque (ícones de abas, links, etc).
    header: '#2196F3', // Cor do cabeçalho no modo claro.
    // ... outras cores específicas do modo claro podem ser adicionadas aqui.
  },
  // Paleta de cores para o tema escuro.
  dark: {
    text: '#ECEDEE', // Cor principal do texto.
    background: '#151718', // Cor de fundo principal das telas.
    tint: tintColorDark, // Cor de destaque.
    header: '#123456', // Cor do cabeçalho no modo escuro.
    // ... outras cores específicas do modo escuro podem ser adicionadas aqui.
  },
};