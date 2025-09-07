/**
 * @file Implementação de fallback (shim) do fundo da barra de abas para Web e Android.
 * Este arquivo é usado quando a plataforma NÃO é iOS.
 * Em Android e Web, a barra de abas geralmente é opaca, sem o efeito de desfoque.
 * Portanto, este componente não precisa renderizar nada.
 */

// Exportar 'undefined' faz com que nenhum componente de fundo seja renderizado nessas plataformas.
export default undefined;

/**
 * Hook customizado que retorna o "vazamento" de conteúdo sob a barra de abas.
 * Como a barra é opaca em Android/Web, não há sobreposição de conteúdo.
 * Por isso, o valor de retorno é 0, indicando que não é necessário nenhum
 * preenchimento (padding) extra.
 */
export function useBottomTabOverflow() {
  return 0;
}