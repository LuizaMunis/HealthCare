// HealthCare_FrontEnd/src/app/(tabs)/index.tsx

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useUserData } from '@/hooks/useUserData';
import { useRouter } from 'expo-router';

const EllipseImage = require('../../assets/images/Ellipse 44.png');

export default function HomeScreen() {
  
  const { userName, loading } = useUserData();
  const router = useRouter();
  const insets = useSafeAreaInsets(); 

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#004A61" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* Bolas azuis de fundo */}
      <Image source={EllipseImage} style={styles.ellipseTopLeft} resizeMode="contain" pointerEvents="none" />
      <Image source={EllipseImage} style={styles.ellipseBottomRight} resizeMode="contain" pointerEvents="none" />
      
      <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingTop: insets.top, paddingBottom: insets.bottom + 100 }]}>
        <View style={styles.header}>
          <Text style={styles.logoText}>Seus relatórios <Text style={styles.logoIcon}>+</Text></Text>
        </View>

        <View style={styles.welcomeCard}>
          <View style={styles.welcomeStripe} />
          <View>
            <Text style={styles.welcomeTitle}>Olá, {userName || 'Usuário'}!</Text>
            <Text style={styles.welcomeSubtitle}>Bem-vindo ao HealthCare.</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Seus últimos relatórios</Text>

        <View style={styles.eventCard}>
          <View style={styles.eventStripe} />
          <View style={styles.eventTextContainer}>
            <Text style={styles.eventTitle}>Relatório Semanal</Text>
            <Text style={styles.eventSubtitle}>8 de junho à 14 de junho</Text>
          </View>
        </View>

        <View style={styles.eventCard}>
          <View style={styles.eventStripe} />
          <View style={styles.eventTextContainer}>
            <Text style={styles.eventTitle}>Relatório Mensal</Text>
            <Text style={styles.eventSubtitle}>3 de junho à 3 de julho</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Histórico de Monitoramento</Text>
        <View style={styles.quickAccessContainer}>
          <TouchableOpacity 
              style={styles.quickAccessCard} 
              onPress={() => router.push('history/pressureHistory')}
            >
                <Feather name="activity" size={32} color="#004A61" />
                <Text style={styles.quickAccessTitle}>Pressão Arterial</Text>
          </TouchableOpacity>
            
          <TouchableOpacity 
              style={styles.quickAccessCard} 
              onPress={() => router.push('/history/frequencia')}
            >
                <Feather name="heart" size={32} color="#004A61" />
                <Text style={styles.quickAccessTitle}>Frequência Cardíaca</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.quickAccessContainer}>
          <TouchableOpacity 
              style={styles.quickAccessCard} 
              onPress={() => router.push('/history/temperature')}
            >
              <Feather name="thermometer" size={32} color="#004A61" />
              <Text style={styles.quickAccessTitle}>Temperatura</Text>
          </TouchableOpacity>
          <TouchableOpacity 
              style={styles.quickAccessCard} 
              onPress={() => router.push('/history/sintomas')}
            >
              <Feather name="alert-triangle" size={32} color="#004A61" />
              <Text style={styles.quickAccessTitle}>Sintomas</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.quickAccessContainer}>
          <TouchableOpacity 
              style={styles.quickAccessCard} 
              onPress={() => router.push('/history/glicemia')}
            >
              <Feather name="droplet" size={32} color="#004A61" />
              <Text style={styles.quickAccessTitle}>Glicemia</Text>
          </TouchableOpacity>
          <TouchableOpacity 
              style={styles.quickAccessCard} 
              onPress={() => router.push('/history/medication')}
            >
              <Feather name="package" size={32} color="#004A61" />
              <Text style={styles.quickAccessTitle}>Medicamento</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.quickAccessContainer}>
          <TouchableOpacity 
              style={styles.quickAccessCard} 
              onPress={() => router.push('/history/vaccination')}
            >
              <Feather name="shield" size={32} color="#004A61" />
              <Text style={styles.quickAccessTitle}>Vacinação</Text>
          </TouchableOpacity>
          
          <View style={styles.quickAccessCardPlaceholder} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    scrollContainer: { paddingHorizontal: 20, zIndex: 1 },
    ellipseTopLeft: {
        position: 'absolute',
        top: -80,
        left: -80,
        width: 300,
        height: 300,
        opacity: 0.4,
        zIndex: 0,
    },
    ellipseBottomRight: {
        position: 'absolute',
        bottom: 50,
        right: -60,
        width: 280,
        height: 280,
        opacity: 0.4,
        zIndex: 0,
    },
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
    quickAccessContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    quickAccessCard: { backgroundColor: '#FFFFFF', borderRadius: 15, width: '48%', alignItems: 'center', paddingVertical: 30, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
    quickAccessTitle: { marginTop: 10, fontSize: 14, fontWeight: 'bold', color: '#333' },
    quickAccessCardPlaceholder: {
        width: '48%',
        height: 0,
        opacity: 0
    },
    // Estilo para o container do loading
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF'
    }
});
