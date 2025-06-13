import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

/**
 * Componente para os botões da seção "Acesso rápido" na tela Home.
 * Ele agora aceita uma propriedade 'href' para navegar para a tela correta.
 */
export default function QuickAccessButton({ icon, label, href, themeColors }) {
  return (
    // O Link do expo-router envolve o botão para torná-lo navegável.
    // 'asChild' faz com que o Link use o TouchableOpacity como seu elemento filho clicável.
    <Link href={href} asChild>
      <TouchableOpacity style={styles.quickAccessItem}>
        <View style={[styles.quickAccessButton, { backgroundColor: themeColors.card }]}>
          <Feather name={icon} size={24} color={themeColors.primary} />
        </View>
        <Text style={[styles.quickAccessLabel, { color: themeColors.textSecondary }]}>{label}</Text>
      </TouchableOpacity>
    </Link>
  );
}

const styles = StyleSheet.create({
  quickAccessItem: {
    alignItems: 'center',
    marginRight: 20,
    width: 80,
  },
  quickAccessButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  quickAccessLabel: {
    textAlign: 'center',
    fontSize: 12,
  },
});
