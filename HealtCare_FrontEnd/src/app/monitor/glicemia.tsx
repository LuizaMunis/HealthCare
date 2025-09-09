// HealthCare_FrontEnd/src/app/monitor/glicemia.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../../constants/api';

export default function GlicemiaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEditMode = !!params.id;

  // Estados para armazenar os valores que mudarão
  const [glicose, setGlicose] = useState(
    isEditMode ? Number(params.glicose_mg_dl) : 100
  );
  const [date, setDate] = useState(
    isEditMode ? new Date(params.data_hora_medicao as string).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );

  /**
   * Função para salvar o registro de glicemia, conectada ao backend.
   */
  const handleSave = async () => {
    if (!glicose || glicose <= 0) {
      Alert.alert('Atenção', 'Por favor, insira um valor de glicemia válido.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Erro de Autenticação', 'Você não está logado. Por favor, faça o login novamente.');
        return;
      }

      const url = isEditMode
        ? `${API_CONFIG.BASE_URL}/glicemia/${params.id}` // URL para ATUALIZAR
        : `${API_CONFIG.BASE_URL}/glicemia`;  
      const method = isEditMode ? 'PUT' : 'POST'; // Método PUT para atualizar, POST para criar

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          glicose_mg_dl: glicose,
          data_hora_medicao: `${date} ${new Date().toTimeString().slice(0, 8)}` // Envia a hora atual
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'O servidor retornou um erro ao salvar os dados.');
      }

      console.log('Dados salvos com sucesso no servidor:', result);

      // Feedback de sucesso para o usuário
      Alert.alert('Sucesso!', 'Sua glicemia foi salva.');
      router.back(); // Volta para a tela anterior

    } catch (error: any) {
      // Tratamento de Erro de Rede ou da API
      console.error("Erro ao salvar medição:", error);
      Alert.alert('Erro', error.message || 'Não foi possível conectar ao servidor. Tente novamente.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#004A61" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Glicemia</Text>
            <Text style={styles.headerSubtitle}>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        {/* --- Card Glicemia INTERATIVO --- */}
        <View style={styles.glicemiaCard}>
          <View style={styles.glicemiaHeader}>
            <Text style={styles.glicemiaHeaderText}>Glicose no sangue</Text>
            <Text style={styles.glicemiaHeaderValue}>{glicose}</Text>
          </View>
          <View style={styles.glicemiaBody}>
            <TouchableOpacity style={styles.controlButton} onPress={() => setGlicose(prev => Math.max(prev - 1, 0))}>
              <Feather name="minus-circle" size={32} color="#004A61" />
            </TouchableOpacity>
            <View style={styles.glicemiaValueContainer}>
              <Text style={styles.glicemiaValueMain}>{glicose}</Text>
              <Text style={styles.glicemiaUnit}>mg/dL</Text>
            </View>
            <TouchableOpacity style={styles.controlButton} onPress={() => setGlicose(prev => prev + 1)}>
              <Feather name="plus-circle" size={32} color="#004A61" />
            </TouchableOpacity>
          </View>
        </View>

        {/* --- Data do Registro --- */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>Data do registro</Text>
          <TextInput
            style={styles.dateInput}
            value={date}
            onChangeText={setDate}
            placeholder="AAAA-MM-DD"
            placeholderTextColor="#C7C7CD"
          />
        </View>

        {/* --- Botão Salvar --- */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Salvar</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
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
  glicemiaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  glicemiaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#B2EBF2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  glicemiaHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#004A61',
  },
  glicemiaHeaderValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#004A61',
  },
  glicemiaBody: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlButton: {
    padding: 10,
  },
  glicemiaValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flex: 1,
    justifyContent: 'center',
  },
  glicemiaValueMain: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#004A61',
    textAlign: 'center',
  },
  glicemiaUnit: {
    fontSize: 20,
    color: '#004A61',
    fontWeight: '500',
    marginLeft: 8,
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
    backgroundColor: '#004A61',
    borderRadius: 15,
    alignItems: 'center',
    paddingVertical: 15,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
