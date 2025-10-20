// HealthCare_FrontEnd/src/app/monitor/pressure.tsx

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, Platform, Animated } from 'react-native';
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

  // Configurações dos seletores (efeito igual ao da glicose)
  const ITEM_HEIGHT = 44;
  const VISIBLE_ITEMS = 3; // 1 acima, 1 central, 1 abaixo
  const SYS_MIN = 80;
  const SYS_MAX = 250;
  const DIA_MIN = 50;
  const DIA_MAX = 150;

  const sysValues = useMemo(() => Array.from({ length: SYS_MAX - SYS_MIN + 1 }, (_, i) => SYS_MIN + i), []);
  const diaValues = useMemo(() => Array.from({ length: DIA_MAX - DIA_MIN + 1 }, (_, i) => DIA_MIN + i), []);

  const sysScrollRef = useRef<ScrollView | null>(null);
  const diaScrollRef = useRef<ScrollView | null>(null);
  const sysScrollY = useRef(new Animated.Value(0)).current;
  const diaScrollY = useRef(new Animated.Value(0)).current;

  // Centraliza valores iniciais ao abrir
  useEffect(() => {
    const initialSysIndex = Math.min(Math.max(systolic - SYS_MIN, 0), sysValues.length - 1);
    const initialDiaIndex = Math.min(Math.max(diastolic - DIA_MIN, 0), diaValues.length - 1);
    const t = setTimeout(() => {
      sysScrollRef.current?.scrollTo({ y: initialSysIndex * ITEM_HEIGHT, animated: false });
      diaScrollRef.current?.scrollTo({ y: initialDiaIndex * ITEM_HEIGHT, animated: false });
    }, 0);
    return () => clearTimeout(t);
  }, []);
  const handleSave = async () => {
    if (!systolic || !diastolic || systolic <= 0 || diastolic <= 0) {
      Alert.alert('Atenção', 'Por favor, insira valores de pressão válidos.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      if (!token) {
        Alert.alert('Erro de Autenticação', 'Você não está logado. Por favor, faça o login novamente.');
        router.push('/login'); 
        return;
      }

      const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.PRESSURE_RECORDS}`;
      const now = new Date();
      // Criar data/hora local sem conversão UTC
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      // Usar a data selecionada pelo usuário + hora atual no formato YYYY-MM-DD HH:MM:SS
      const [yearSelected, monthSelected, daySelected] = dateISO.split('-');
      const measurementDateTime = `${yearSelected}-${monthSelected}-${daySelected} ${hours}:${minutes}:${seconds}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          sistolica_mmhg: systolic,
          diastolica_mmhg: diastolic,
          data_hora_medicao: measurementDateTime
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'O servidor retornou um erro ao salvar os dados.');
      }

      console.log('Dados salvos com sucesso no servidor:', result);
      Alert.alert('Sucesso!', 'Sua pressão arterial foi salva.');
      router.back(); // Volta para a tela anterior

    } catch (error: any) {
      console.error('Erro ao salvar medição:', error);
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
            <View style={styles.pickerRow}>
              <View style={[styles.wheelContainer, { height: ITEM_HEIGHT * VISIBLE_ITEMS }]}>
                <Animated.ScrollView
                  ref={sysScrollRef}
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                  alwaysBounceVertical={false}
                  overScrollMode="never"
                  decelerationRate="fast"
                  snapToInterval={ITEM_HEIGHT}
                  disableIntervalMomentum
                  snapToAlignment="start"
                  scrollEventThrottle={16}
                  onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: sysScrollY } } }],
                    { useNativeDriver: true }
                  )}
                  onMomentumScrollEnd={(ev) => {
                    const offsetY = ev.nativeEvent.contentOffset.y;
                    const rawIndex = Math.round(offsetY / ITEM_HEIGHT);
                    const clampedIndex = Math.min(Math.max(rawIndex, 0), sysValues.length - 1);
                    setSystolic(SYS_MIN + clampedIndex);
                  }}
                  contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * ((VISIBLE_ITEMS - 1) / 2) }}
                >
                  {sysValues.map((item, index) => {
                    const inputRange = [
                      (index - 1) * ITEM_HEIGHT,
                      index * ITEM_HEIGHT,
                      (index + 1) * ITEM_HEIGHT,
                    ];
                    const opacity = sysScrollY.interpolate({
                      inputRange,
                      outputRange: [0.25, 1, 0.25],
                      extrapolate: 'clamp',
                    });
                    const scale = sysScrollY.interpolate({
                      inputRange,
                      outputRange: [0.9, 1.6, 0.9],
                      extrapolate: 'clamp',
                    });
                    return (
                      <View key={item} style={{ height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
                        <Animated.Text style={[styles.wheelItemText, { opacity, transform: [{ scale }] }]}>
                          {item}
                        </Animated.Text>
                      </View>
                    );
                  })}
                </Animated.ScrollView>
              </View>
              <Text style={styles.pressureUnit}>mmHg</Text>
            </View>
          </View>
        </View>

        {/* --- Card Diastólica INTERATIVO --- */}
        <View style={styles.pressureCard}>
          <View style={styles.pressureHeader}>
            <Text style={styles.pressureHeaderText}>Diastólica</Text>
            <Text style={styles.pressureHeaderValue}>{diastolic}</Text>
          </View>
          <View style={styles.pressureBody}>
            <View style={styles.pickerRow}>
              <View style={[styles.wheelContainer, { height: ITEM_HEIGHT * VISIBLE_ITEMS }]}>
                <Animated.ScrollView
                  ref={diaScrollRef}
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                  alwaysBounceVertical={false}
                  overScrollMode="never"
                  decelerationRate="fast"
                  snapToInterval={ITEM_HEIGHT}
                  disableIntervalMomentum
                  snapToAlignment="start"
                  scrollEventThrottle={16}
                  onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: diaScrollY } } }],
                    { useNativeDriver: true }
                  )}
                  onMomentumScrollEnd={(ev) => {
                    const offsetY = ev.nativeEvent.contentOffset.y;
                    const rawIndex = Math.round(offsetY / ITEM_HEIGHT);
                    const clampedIndex = Math.min(Math.max(rawIndex, 0), diaValues.length - 1);
                    setDiastolic(DIA_MIN + clampedIndex);
                  }}
                  contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * ((VISIBLE_ITEMS - 1) / 2) }}
                >
                  {diaValues.map((item, index) => {
                    const inputRange = [
                      (index - 1) * ITEM_HEIGHT,
                      index * ITEM_HEIGHT,
                      (index + 1) * ITEM_HEIGHT,
                    ];
                    const opacity = diaScrollY.interpolate({
                      inputRange,
                      outputRange: [0.25, 1, 0.25],
                      extrapolate: 'clamp',
                    });
                    const scale = diaScrollY.interpolate({
                      inputRange,
                      outputRange: [0.9, 1.6, 0.9],
                      extrapolate: 'clamp',
                    });
                    return (
                      <View key={item} style={{ height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
                        <Animated.Text style={[styles.wheelItemText, { opacity, transform: [{ scale }] }]}>
                          {item}
                        </Animated.Text>
                      </View>
                    );
                  })}
                </Animated.ScrollView>
              </View>
              <Text style={styles.pressureUnit}>mmHg</Text>
            </View>
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

// (Estilos)
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
  pickerRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButton: {
    padding: 10,
  },
  wheelContainer: {
    width: 120,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 8,
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
  wheelItemText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#004A61',
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

