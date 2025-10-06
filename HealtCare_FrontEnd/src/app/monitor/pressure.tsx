// HealthCare_FrontEnd/src/app/monitor/pressure.tsx

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, ENDPOINTS } from '../../constants/api';

export default function PressureScreen() {
  const router = useRouter(); 
  const [systolic, setSystolic] = useState(120);
  const [diastolic, setDiastolic] = useState(80);
  const [dateISO, setDateISO] = useState(new Date().toISOString().split('T')[0]);
  const dateDisplay = useMemo(() => {
    try {
      const [y, m, d] = (dateISO || '').split('-');
      const dt = new Date(Number(y), Number(m) - 1, Number(d));
      return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long' }).format(dt);
    } catch {
      return dateISO;
    }
  }, [dateISO]);
  const [showPicker, setShowPicker] = useState(false);
  const today = useMemo(() => { const t = new Date(); t.setHours(0,0,0,0); return t; }, []);
  const toLocalISODate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${da}`;
  };

  const handleSave = async () => {
    if (!systolic || !diastolic || systolic <= 0 || diastolic <= 0) {
      Alert.alert('Atenção', 'Por favor, insira valores de pressão válidos.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Erro de Autenticação', 'Você não está logado.');
        return;
      }

      const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.PRESSURE_RECORDS}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sistolica_mmhg: systolic,
          diastolica_mmhg: diastolic,
          data_hora_medicao: `${dateISO} ${new Date().toTimeString().slice(0, 8)}`,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'O servidor retornou um erro ao salvar os dados.');
      }

      Alert.alert('Sucesso!', 'Sua pressão foi salva.');
      router.back();
    } catch (error: any) {
      console.error('Erro ao salvar pressão:', error);
      Alert.alert('Erro', error.message || 'Não foi possível conectar ao servidor.');
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
            <Text style={styles.pressureValueSecondary}>119</Text>
            <View style={styles.pressureValueContainer}>
              <Text style={styles.pressureValueMain}>{systolic}</Text>
              <Text style={styles.pressureUnit}>mmHg</Text>
            </View>
            <Text style={styles.pressureValueSecondary}>121</Text>
          </View>
        </View>

        {/* --- Card Diastólica INTERATIVO --- */}
        <View style={styles.pressureCard}>
          <View style={styles.pressureHeader}>
            <Text style={styles.pressureHeaderText}>Diastólica</Text>
            <Text style={styles.pressureHeaderValue}>{diastolic}</Text>
          </View>
          <View style={styles.pressureBody}>
            <Text style={styles.pressureValueSecondary}>88</Text>
            <View style={styles.pressureValueContainer}>
              <Text style={styles.pressureValueMain}>{diastolic}</Text>
              <Text style={styles.pressureUnit}>mmHg</Text>
            </View>
            <Text style={styles.pressureValueSecondary}>90</Text>
          </View>
        </View>

        {/* --- Data do Registro --- */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>Data do registro</Text>
          <TouchableOpacity
            accessibilityLabel="Selecionar data do registro"
            style={styles.dateInput}
            onPress={() => setShowPicker(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.dateInputText}>{dateDisplay}</Text>
          </TouchableOpacity>
          {showPicker && (
            <DateTimePicker
              value={new Date(dateISO + 'T00:00:00')}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={today}
              onChange={(event, selectedDate) => {
                if (Platform.OS === 'android') setShowPicker(false);
                if (!selectedDate) return;
                const chosen = new Date(selectedDate);
                chosen.setHours(0,0,0,0);
                if (chosen.getTime() > today.getTime()) {
                  Alert.alert('Data inválida', 'Data não pode ser no futuro');
                  return;
                }
                setDateISO(toLocalISODate(chosen));
              }}
            />
          )}
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
  },
  pressureUnit: {
    fontSize: 20,
    color: '#004A61',
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
   dateInputText: {
     fontSize: 16,
     color: '#333',
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

