import { Feather } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React from 'react';
import { FlatList, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

// Componente para os botões de Acesso Rápido com navegação
type QuickAccessButtonProps = {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  href: string;
  themeColors: any;
};

const QuickAccessButton: React.FC<QuickAccessButtonProps> = ({ icon, label, href, themeColors }) => (
  <Link href={href} asChild>
    <TouchableOpacity style={styles.quickAccessItem}>
      <View style={[styles.quickAccessButton, { backgroundColor: themeColors.card }]}>
        <Feather name={icon} size={24} color={themeColors.primary} />
      </View>
      <Text style={[styles.quickAccessLabel, { color: themeColors.textSecondary }]}>{label}</Text>
    </TouchableOpacity>
  </Link>
);

export default function RegistrosScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  // Tipagem explícita dos itens
  type MonitoringItem = {
    icon: React.ComponentProps<typeof Feather>['name'];
    label: string;
    href: string;
  };

  type HealthRecordItem = {
    icon: React.ComponentProps<typeof Feather>['name'];
    label: string;
  };

  // Array de itens para Monitoramento
  const monitoringItems: MonitoringItem[] = [
    { icon: 'heart', label: 'Coração', href: '/monitor/heart' },
    { icon: 'droplet', label: 'Glicemia', href: '/monitor/glucose' },
    { icon: 'thermometer', label: 'Temperatura', href: '/monitor/temperature' },
    { icon: 'activity', label: 'Pressão', href: '/monitor/pressure' },
  ];

  // Array de itens para Registro de Saúde (exemplo)
  const healthRecordItems: HealthRecordItem[] = [
      { icon: 'shield', label: 'Vacinas' },
      { icon: 'clipboard', label: 'Consultas' },
      { icon: 'package', label: 'Medicamentos' },
      { icon: 'award', label: 'Doenças' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView>
        <Text style={[styles.mainTitle, { color: themeColors.text }]}>Meus Registros</Text>

        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Monitoramento</Text>
        <View style={styles.gridContainer}>
          {monitoringItems.map(item => (
            <QuickAccessButton
              key={item.label}
              icon={item.icon}
              label={item.label}
              href={item.href}
              themeColors={themeColors}
            />
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Registros de Saúde</Text>
        <View style={styles.gridContainer}>
          {healthRecordItems.map(item => (
            <QuickAccessButton
              key={item.label}
              icon={item.icon}
              href="/em-breve" // Rota de placeholder
              label={item.label}
              themeColors={themeColors}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mainTitle: { fontSize: 28, fontWeight: 'bold', padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '600', paddingHorizontal: 20, marginTop: 20, marginBottom: 10 },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
  },
  quickAccessItem: {
    width: '25%', // 4 itens por linha
    alignItems: 'center',
    padding: 10,
  },
  quickAccessButton: {
    width: 60,
    height: 60,
    borderRadius: 15,
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
