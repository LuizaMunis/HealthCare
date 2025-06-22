//HealthCare_FrontEnd/src/app/(tabs)/index.tsx

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.logoText}>HEALTHCARE <Text style={styles.logoIcon}>+</Text></Text>
        </View>

        <View style={styles.welcomeCard}>
          <View style={styles.welcomeStripe} />
          <View>
            <Text style={styles.welcomeTitle}>Olá, José!</Text>
            <Text style={styles.welcomeSubtitle}>Bem-vindo ao Olhealth.</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Seus próximos eventos</Text>

        <View style={styles.eventCard}>
          <View style={styles.eventStripe} />
          <View style={styles.eventTextContainer}>
            <Text style={styles.eventTitle}>Reumatologista</Text>
            <Text style={styles.eventSubtitle}>3 de novembro</Text>
          </View>
          <Feather name="info" size={24} color="#FFFFFF" />
        </View>

        <View style={styles.eventCard}>
          <View style={styles.eventStripe} />
          <View style={styles.eventTextContainer}>
            <Text style={styles.eventTitle}>Medicamento 1</Text>
            <Text style={styles.eventSubtitle}>18:30</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Acesso rápido</Text>
        <View style={styles.quickAccessContainer}>
            <View style={styles.quickAccessCard}>
                <Feather name="bell" size={32} color="#004A61" />
                <Text style={styles.quickAccessTitle}>Consultas</Text>
            </View>
            <View style={styles.quickAccessCard}>
                <Feather name="bell" size={32} color="#004A61" />
                <Text style={styles.quickAccessTitle}>Notificações</Text>
            </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#E3F2F5' }, // Um azul bem clarinho de fundo
    scrollContainer: { padding: 20 },
    header: { alignItems: 'center', marginBottom: 20 },
    logoText: { fontSize: 24, fontWeight: 'bold', color: '#004A61' },
    logoIcon: { color: '#00B8D4' },
    welcomeCard: { backgroundColor: '#FFFFFF', borderRadius: 15, padding: 20, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, marginBottom: 30},
    welcomeStripe: { width: 5, height: 40, backgroundColor: '#00B8D4', borderRadius: 3, marginRight: 15 },
    welcomeTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    welcomeSubtitle: { fontSize: 14, color: 'gray' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    eventCard: { backgroundColor: '#004A61', borderRadius: 15, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 15, elevation: 3},
    eventStripe: { width: 5, height: 40, backgroundColor: '#00B8D4', borderRadius: 3, marginRight: 15 },
    eventTextContainer: { flex: 1 },
    eventTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
    eventSubtitle: { fontSize: 14, color: '#E0E0E0' },
    quickAccessContainer: { flexDirection: 'row', justifyContent: 'space-between' },
    quickAccessCard: { backgroundColor: '#FFFFFF', borderRadius: 15, width: '48%', alignItems: 'center', paddingVertical: 30, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
    quickAccessTitle: { marginTop: 10, fontSize: 14, fontWeight: 'bold', color: '#333' },
});