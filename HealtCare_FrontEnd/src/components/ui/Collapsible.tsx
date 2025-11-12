/**
 * @file Componente de UI reutilizável que funciona como um "acordeão" ou "sanfona".
 * Exibe um título e permite que o usuário toque nele para mostrar ou ocultar o conteúdo aninhado (children).
 */

import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ui/ThemedText';
import { ThemedView } from '@/components/ui/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Define as props: 'children' (o conteúdo a ser ocultado/mostrado) e 'title'.
export function Collapsible({ children, title }: PropsWithChildren & { title: string }) {
  // Estado para controlar se o conteúdo está visível (aberto) ou não.
  const [isOpen, setIsOpen] = useState(false);
  const theme = useColorScheme() ?? 'light';

  return (
    <ThemedView>
      {/* Área clicável que contém o ícone e o título */}
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)} // Inverte o estado 'isOpen' ao ser tocado.
        activeOpacity={0.8}>
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
          // Aplica uma rotação no ícone para indicar visualmente o estado (aberto/fechado).
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
      </TouchableOpacity>

      {/* Renderiza o conteúdo (children) somente se o estado 'isOpen' for verdadeiro. */}
      {isOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  content: {
    marginTop: 6,
    marginLeft: 24, // Adiciona um recuo para o conteúdo aninhado.
  },
});