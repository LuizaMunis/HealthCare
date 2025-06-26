// HealthCare_FrontEnd/src/app/monitor/pressure.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importe o AsyncStorage

// Use a variável de ambiente para a URL da API para facilitar a manutenção
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.15.7:3000';

export default function PressureScreen() {
  const router = useRouter();

  // Estados para armazenar os valores que mudarão
  const [systolic, setSystolic] = useState(120);
  const [diastolic, setDiastolic] = useState(89);
  
  // O formato da data no banco de dados provavelmente é AAAA-MM-DD
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  /**
   * Função para salvar o registro de pressão, agora conectada ao backend.
   */
  const handleSave = async () => {
    // 1. Validação dos Dados no Frontend
    if (!systolic || !diastolic || systolic <= 0 || diastolic <= 0) {
      Alert.alert('Atenção', 'Por favor, insira valores de pressão válidos.');
      return;
    }

    try {
      // 2. Obtenção do Token de Autenticação
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Erro de Autenticação', 'Você não está logado. Por favor, faça o login novamente.');
        // Opcional: redirecionar para a tela de login
        // router.push('/login'); 
        return;
      }

      // 3. Chamada fetch para o endpoint correto do backend
      
      const response = await fetch(`${API_URL}/api/pressao-arterial`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Envia o token no cabeçalho Authorization, como o authMiddleware espera
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          // O corpo da requisição deve usar os nomes de campo que seu Controller espera.
          // Estes são palpites baseados em um padrão comum. Ajuste se necessário.
          //correção da data e hora "`${date} ${new Date().toTimeString().slice(0, 5)}`"
          sistolica_mmhg: systolic,
          diastolica_mmhg: diastolic,
          data_registro: date, 
          data_hora_medicao: `${date} ${new Date().toTimeString().slice(0, 5)}`
        }),
      });


      // 4. Tratamento da Resposta da API
      const result = await response.json();

      if (!response.ok) {
        // Usa a mensagem de erro do backend, se houver
        throw new Error(result.message || 'O servidor retornou um erro ao salvar os dados.');
      }

      console.log('Dados salvos com sucesso no servidor:', result);

      // Feedback de sucesso para o usuário
      Alert.alert('Sucesso!', 'Sua pressão arterial foi salva.');
      router.back(); // Volta para a tela anterior

    } catch (error: any) {
      // 5. Tratamento de Erro de Rede ou da API
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
            <Text style={styles.headerTitle}>Pressão arterial</Text>
            <Text style={styles.headerSubtitle}>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        {/* --- Card Sistólica INTERATIVO --- */}
        <View style={styles.pressureCard}>
          <View style={styles.pressureHeader}>
            <Text style={styles.pressureHeaderText}>Sistólica</Text>
            <Text style={styles.pressureHeaderValue}>{systolic}</Text>
          </View>
          <View style={styles.pressureBody}>
            <TouchableOpacity style={styles.controlButton} onPress={() => setSystolic(prev => prev - 1)}>
              <Feather name="minus-circle" size={32} color="#6c757d" />
            </TouchableOpacity>
            <View style={styles.pressureValueContainer}>
              <Text style={styles.pressureValueMain}>{systolic}</Text>
              <Text style={styles.pressureUnit}>mmHg</Text>
            </View>
            <TouchableOpacity style={styles.controlButton} onPress={() => setSystolic(prev => prev + 1)}>
              <Feather name="plus-circle" size={32} color="#6c757d" />
            </TouchableOpacity>
          </View>
        </View>

        {/* --- Card Diastólica INTERATIVO --- */}
        <View style={styles.pressureCard}>
          <View style={styles.pressureHeader}>
            <Text style={styles.pressureHeaderText}>Diastólica</Text>
            <Text style={styles.pressureHeaderValue}>{diastolic}</Text>
          </View>
          <View style={styles.pressureBody}>
            <TouchableOpacity style={styles.controlButton} onPress={() => setDiastolic(prev => prev - 1)}>
              <Feather name="minus-circle" size={32} color="#6c757d" />
            </TouchableOpacity>
            <View style={styles.pressureValueContainer}>
              <Text style={styles.pressureValueMain}>{diastolic}</Text>
              <Text style={styles.pressureUnit}>mmHg</Text>
            </View>
            <TouchableOpacity style={styles.controlButton} onPress={() => setDiastolic(prev => prev + 1)}>
              <Feather name="plus-circle" size={32} color="#6c757d" />
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








// ... (Estilos permanecem os mesmos)
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
    backgroundColor: '#B2EBF2',
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
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  controlButton: {
    padding: 10,
  },
  pressureValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  pressureValueMain: {
    fontSize: 60,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    minWidth: 90,
  },
  pressureUnit: {
    fontSize: 20,
    color: '#333',
    marginLeft: 8,
    fontWeight: '500',
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