// HealthCare_FrontEnd/src/app/monitor/pressure.tsx

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PressureScreen() {
  const router = useRouter(); 

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#004A61" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Pressão arterial</Text>
            <Text style={styles.headerSubtitle}>8:45</Text>
          </View>
          {/* Espaço reservado para manter o título centralizado */}
          <View style={{ width: 24 }} />
        </View>

        {/* Card Sistólica */}
        <View style={styles.pressureCard}>
          <View style={styles.pressureHeader}>
            <Text style={styles.pressureHeaderText}>Sistólica</Text>
            <Text style={styles.pressureHeaderValue}>120</Text>
          </View>
          <View style={styles.pressureBody}>
            <Text style={styles.pressureValueSecondary}>119</Text>
            <View style={styles.pressureValueContainer}>
                <Text style={styles.pressureValueMain}>120</Text>
                <Text style={styles.pressureUnit}>mmHg</Text>
            </View>
            <Text style={styles.pressureValueSecondary}>121</Text>
          </View>
        </View>

        {/* Card Diastólica */}
        <View style={styles.pressureCard}>
          <View style={styles.pressureHeader}>
            <Text style={styles.pressureHeaderText}>Diastólica</Text>
            <Text style={styles.pressureHeaderValue}>120</Text>
          </View>
          <View style={styles.pressureBody}>
            <Text style={styles.pressureValueSecondary}>88</Text>
            <View style={styles.pressureValueContainer}>
                <Text style={styles.pressureValueMain}>89</Text>
                <Text style={styles.pressureUnit}>mmHg</Text>
            </View>
            <Text style={styles.pressureValueSecondary}>90</Text>
          </View>
        </View>

        {/* Data do Registro */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>Data do registro</Text>
          <TextInput
            style={styles.dateInput}
            value="30 de outubro"
            placeholderTextColor="#C7C7CD"
          />
        </View>

        {/* Botão Salvar */}
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Salvar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8', // Um cinza azulado claro, similar ao fundo da imagem
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 5,
  },
  backButton: {},
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'gray',
  },
  pressureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  pressureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#B2EBF2', // Cor azul clara do header do card
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  pressureHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#004A61',
  },
  pressureHeaderValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#004A61',
  },
  pressureBody: {
    padding: 25,
    alignItems: 'center',
  },
  pressureValueContainer:{
    flexDirection: 'row',
    alignItems: 'baseline', // Alinha a base do número e da unidade
    marginVertical: 10,
  },
  pressureValueMain: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#333',
  },
  pressureUnit: {
    fontSize: 20,
    color: '#333',
    marginLeft: 8,
    fontWeight: '500',
  },
  pressureValueSecondary: {
    fontSize: 18,
    color: 'gray',
  },
  dateContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  dateInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  saveButton: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  saveButtonText: {
    fontSize: 18,
    color: '#004A61',
    fontWeight: 'bold',
  },
});

