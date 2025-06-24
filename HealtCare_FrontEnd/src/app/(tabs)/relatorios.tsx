// HealthCare_FrontEnd/src/app/(tabs)/index.tsx

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

export default function HomeScreen() {
  // Estado para armazenar o nome do usuário
  const [userName, setUserName] = useState('');
  // Estado para controlar o carregamento
  const [loading, setLoading] = useState(true);

  // useFocusEffect é um hook que roda toda vez que a tela entra em foco.
  // É ideal para carregar dados que podem mudar.
  useFocusEffect(
    useCallback(() => {
      const loadUserData = async () => {
        try {
          const userInfoString = await AsyncStorage.getItem('userInfo');
          if (userInfoString) {
            const userInfo = JSON.parse(userInfoString);
            // Pega o primeiro nome para uma saudação mais pessoal
            const firstName = userInfo.nome_completo.split(' ')[0];
            setUserName(firstName);
          }
        } catch (error) {
          console.error("Falha ao carregar dados do usuário.", error);
          // Você pode adicionar um tratamento de erro aqui, como redirecionar para o login
        } finally {
          setLoading(false);
        }
      };

      loadUserData();
    }, [])
  );

  // Mostra um indicador de carregamento enquanto os dados não chegam
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#004A61" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.logoText}>HEALTHCARE <Text style={styles.logoIcon}>+</Text></Text>
        </View>

        <View style={styles.welcomeCard}>
          <View style={styles.welcomeStripe} />
          <View>
            {/* --- LÓGICA ALTERADA --- */}
            {/* Exibe o nome do estado. Se estiver vazio, mostra 'Usuário'. */}
            <Text style={styles.welcomeTitle}>Olá, {userName || 'Usuário'}!</Text>
            <Text style={styles.welcomeSubtitle}>Bem-vindo ao Olhealth.</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Seus últimos relatórios</Text>

        <View style={styles.eventCard}>
          <View style={styles.eventStripe} />
          <View style={styles.eventTextContainer}>
            <Text style={styles.eventTitle}>Relatório de maio</Text>
            <Text style={styles.eventSubtitle}>3 de junho</Text>
          </View>
          <Feather name="info" size={24} color="#FFFFFF" />
        </View>

        <View style={styles.eventCard}>
          <View style={styles.eventStripe} />
          <View style={styles.eventTextContainer}>
            <Text style={styles.eventTitle}>Registros do Medicamento</Text>
            <Text style={styles.eventSubtitle}>3 de junho</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Acesso rápido</Text>
        <View style={styles.quickAccessContainer}>
            <View style={styles.quickAccessCard}>
                <Feather name="calendar" size={32} color="#004A61" />
                <Text style={styles.quickAccessTitle}>Buscar por data</Text>
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
    container: { flex: 1, backgroundColor: '#E3F2F5' },
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
    // Estilo para o container do loading
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E3F2F5'
    }
});
