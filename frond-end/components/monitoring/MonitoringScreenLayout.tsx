import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

// Este componente é o "template" para todas as telas de registro de monitoramento.
export default function MonitoringScreenLayout({ title, time, onSave, children }) {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}>
        
        {/* 1. Cabeçalho Padronizado */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color={theme.primary} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerTitle, { color: theme.primary }]}>{title}</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>{time}</Text>
          </View>
          <View style={styles.headerPlaceholder} />
        </View>

        {/* 2. Conteúdo Principal (onde os inputs específicos irão aparecer) */}
        <ScrollView contentContainerStyle={styles.content}>
          {children}
        </ScrollView>

        {/* 3. Botão de Salvar Fixo na Parte Inferior */}
        <View style={styles.footer}>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.primary }]} onPress={onSave}>
                <Text style={styles.actionButtonText}>Salvar</Text>
            </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Estilos para o layout
const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  keyboardAvoidingContainer: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
  headerSubtitle: { fontSize: 12, textAlign: 'center' },
  headerPlaceholder: { width: 24 },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionButton: {
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
