import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, ENDPOINTS } from '@/constants/api';

export default function NovaVacinaScreen() {
  const router = useRouter();
  const [nomeVacina, setNomeVacina] = useState('');
  const [dose, setDose] = useState('');
  const [dataAplicacao, setDataAplicacao] = useState('');
  const [localAplicacao, setLocalAplicacao] = useState('');

  const handleSave = async () => {
    try {
      if (!nomeVacina.trim()) {
        Alert.alert('Erro', 'Por favor, insira o nome da vacina');
        return;
      }

      if (!dose.trim()) {
        Alert.alert('Erro', 'Por favor, insira a dose da vacina');
        return;
      }

      if (!dataAplicacao.trim()) {
        Alert.alert('Erro', 'Por favor, insira a data de aplicação');
        return;
      }

      if (!localAplicacao.trim()) {
        Alert.alert('Erro', 'Por favor, insira o local de aplicação');
        return;
      }

    // Validação de data para web
    if (dataAplicacao.includes('/')) {
      const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
      if (!dateRegex.test(dataAplicacao)) {
        Alert.alert('Atenção', 'Por favor, insira a data no formato DD/MM/AAAA (ex: 15/01/2024).');
        return;
      }
      
      // Converter DD/MM/AAAA para Date
      const [day, month, year] = dataAplicacao.split('/');
      const fullYear = parseInt(year, 10);
      const selectedDate = new Date(fullYear, parseInt(month, 10) - 1, parseInt(day, 10));
      
      if (isNaN(selectedDate.getTime())) {
        Alert.alert('Atenção', 'Data inválida. Verifique o formato DD/MM/AA.');
        return;
      }
      
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      
      if (selectedDate > today) {
        Alert.alert('Atenção', 'A data não pode ser no futuro.');
        return;
      }
    }

    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      if (!token) {
        Alert.alert('Erro de Autenticação', 'Você não está logado.');
        return;
      }

      // Converter data para formato ISO se necessário
      let dataISO = dataAplicacao;
      if (dataAplicacao.includes('/')) {
        const [day, month, year] = dataAplicacao.split('/');
        const fullYear = parseInt(year, 10);
        dataISO = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.VACCINE_RECORDS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome_vacina: nomeVacina,
          dose: dose,
          data_vacinacao: dataISO,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao salvar vacina.');
      }

      Alert.alert('Sucesso!', 'Vacina registrada com sucesso!');
      router.back();
    } catch (error: any) {
      console.error('Erro ao salvar vacina:', error);
      Alert.alert('Erro', error.message || 'Não foi possível salvar a vacina.');
    }
    } catch (error: any) {
      console.error('Erro geral na função handleSave:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado. Tente novamente.');
    }
  };

  const handleDateInputChange = (text: string) => {
    // Remove todos os caracteres não numéricos
    let cleanedText = text.replace(/\D/g, '');

    // Aplica o formato DD/MM/AAAA automaticamente
    if (cleanedText.length > 2) {
      cleanedText = cleanedText.slice(0, 2) + '/' + cleanedText.slice(2);
    }
    if (cleanedText.length > 5) {
      cleanedText = cleanedText.slice(0, 5) + '/' + cleanedText.slice(5, 9);
    }

    // Limita a 10 caracteres (DD/MM/AAAA)
    if (cleanedText.length > 10) {
      cleanedText = cleanedText.slice(0, 10);
    }

    setDataAplicacao(cleanedText);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#004A61" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.titleButton}>
            <Text style={styles.title}>Nova vacina</Text>
          </View>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* Formulário */}
        <View style={styles.form}>
          {/* Nome da vacina */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome da vacina</Text>
            <TextInput
              style={styles.input}
              value={nomeVacina}
              onChangeText={setNomeVacina}
              placeholder="Digite o nome da vacina"
              placeholderTextColor="#999"
            />
          </View>

          {/* Dose */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dose</Text>
            <TextInput
              style={styles.input}
              value={dose}
              onChangeText={setDose}
              placeholder="Ex: 1ª dose, 2ª dose, reforço"
              placeholderTextColor="#999"
            />
          </View>

          {/* Data de aplicação */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data de aplicação</Text>
            <TextInput
              style={styles.input}
              value={dataAplicacao}
              onChangeText={handleDateInputChange}
            placeholder="DD/MM/AAAA"
              placeholderTextColor="#999"
              keyboardType="numeric"
            maxLength={10}
            />
          </View>

          {/* Local de aplicação */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Local de aplicação</Text>
            <TextInput
              style={styles.input}
              value={localAplicacao}
              onChangeText={setLocalAplicacao}
              placeholder="Ex: Braço esquerdo (obrigatório)"
              placeholderTextColor="#999"
            />
          </View>

        </View>
      </ScrollView>

      {/* Botão Salvar */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Salvar</Text>
      </TouchableOpacity>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerSpacer: {
    width: 24,
  },
  titleButton: {
    backgroundColor: '#004A61',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#81C5D8',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#004A61',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#004A61',
    borderRadius: 15,
    alignItems: 'center',
    paddingVertical: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
