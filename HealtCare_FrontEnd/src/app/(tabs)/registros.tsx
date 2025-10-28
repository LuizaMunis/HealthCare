import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useUserData } from '@/hooks/useUserData';
import { useRouter } from 'expo-router';

export default function RegistrosScreen() {
  const { userName, loading } = useUserData();
  const router = useRouter();

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
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeStripe} />
          <View>
            <Text style={styles.welcomeTitle}>Olá, {userName || 'Usuário'}!</Text>
            <Text style={styles.welcomeSubtitle}>Seus registros de saúde.</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Registros de Monitoramento</Text>
        <View style={styles.quickAccessContainer}>
          <TouchableOpacity 
            style={styles.quickAccessCard} 
            onPress={() => router.push('/monitor/pressure')}
          >
            <Feather name="activity" size={32} color="#004A61" />
            <Text style={styles.quickAccessTitle}>Pressão Arterial</Text>
          </TouchableOpacity>
            
          <TouchableOpacity 
            style={styles.quickAccessCard} 
            onPress={() => router.push('/monitor/frequencia')}
          >
            <Feather name="heart" size={32} color="#004A61" />
            <Text style={styles.quickAccessTitle}>Frequência Cardíaca</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickAccessContainer}>
          <TouchableOpacity 
            style={styles.quickAccessCard} 
            onPress={() => router.push('/monitor/temperatura')}
          >
            <Feather name="thermometer" size={32} color="#004A61" />
            <Text style={styles.quickAccessTitle}>Temperatura</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAccessCard} 
            onPress={() => router.push('/monitor/sintoma')}
          >
            <Feather name="loader" size={32} color="#004A61" />
            <Text style={styles.quickAccessTitle}>Sintomas</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickAccessContainer}>
          <TouchableOpacity 
            style={styles.quickAccessCard} 
            onPress={() => router.push('/monitor/glicemia')}
          >
            <Feather name="droplet" size={32} color="#004A61" />
            <Text style={styles.quickAccessTitle}>Glicemia</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAccessCard} 
            onPress={() => router.push('/monitor/medicamento')}
          >
            <Feather name="pill" size={32} color="#004A61" />
            <Text style={styles.quickAccessTitle}>Medicamento</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickAccessContainer}>
          <TouchableOpacity 
            style={styles.quickAccessCard} 
            onPress={() => router.push('/monitor/vacina')}
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
  container: { 
    flex: 1, 
    backgroundColor: '#E3F2F5' 
  },
  scrollContainer: { 
    padding: 20 
  },
  welcomeCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 15, 
    padding: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 5, 
    marginBottom: 30
  },
  welcomeStripe: { 
    width: 5, 
    height: 40, 
    backgroundColor: '#00B8D4', 
    borderRadius: 3, 
    marginRight: 15 
  },
  welcomeTitle: { 
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  welcomeSubtitle: { 
    fontSize: 14, 
    color: 'gray' 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#333', 
    marginBottom: 15 
  },
  quickAccessContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 16 
  },
  quickAccessCard: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 15, 
    width: '48%', 
    alignItems: 'center', 
    paddingVertical: 30, 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 5 
  },
  quickAccessTitle: { 
    marginTop: 10, 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  quickAccessCardPlaceholder: {
    width: '48%',
    height: 0,
    opacity: 0
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E3F2F5'
  }
});