// HealthCare_FrontEnd/src/app/monitor/glicemia.tsx

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, Alert, Animated, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, ENDPOINTS } from '../../constants/api';

export default function GlicemiaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const isEditMode = !!params.id;

  // Estados para armazenar os valores que mudarão
  const [glicose, setGlicose] = useState(
    isEditMode ? Number(params.glicose_mg_dl) : 100
  );
  const [dateISO, setDateISO] = useState(
    isEditMode ? new Date(params.data_hora_medicao as string).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
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

  // Configurações do seletor rolável
  const MIN_VALUE = 40;
  const MAX_VALUE = 400;
  const ITEM_HEIGHT = 44;
  const VISIBLE_ITEMS = 3; // 1 acima, 1 central, 1 abaixo
  const values = useMemo(() => Array.from({ length: MAX_VALUE - MIN_VALUE + 1 }, (_, i) => MIN_VALUE + i), []);

  const scrollRef = useRef<ScrollView | null>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  // Centralizar o valor inicial ao abrir a tela
  useEffect(() => {
    const initialIndex = Math.min(Math.max(glicose - MIN_VALUE, 0), values.length - 1);
    const initialOffset = initialIndex * ITEM_HEIGHT;
    const timeout = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: initialOffset, animated: false });
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  /**
   * Função para salvar o registro de glicemia, conectada ao backend.
   */
  const handleSave = async () => {
    if (!glicose || glicose <= 0) {
      Alert.alert('Atenção', 'Por favor, insira um valor de glicemia válido.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      if (!token) {
        Alert.alert('Erro de Autenticação', 'Você não está logado. Por favor, faça o login novamente.');
        return;
      }

      const url = isEditMode
        ? `${API_CONFIG.BASE_URL}${ENDPOINTS.GLYCEMIA_RECORDS}/${params.id}`
        : `${API_CONFIG.BASE_URL}${ENDPOINTS.GLYCEMIA_RECORDS}`;  
      const method = isEditMode ? 'PUT' : 'POST'; // Método PUT para atualizar, POST para criar

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          glicose_mg_dl: glicose,
          data_hora_medicao: `${dateISO}T${new Date().toTimeString().slice(0, 8)}`
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
            <View style={styles.pickerRow}>
              <View style={[styles.wheelContainer, { height: ITEM_HEIGHT * VISIBLE_ITEMS }]}>                

                <Animated.ScrollView
                  ref={scrollRef}
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                  snapToInterval={ITEM_HEIGHT}
                  decelerationRate="fast"
                  onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true }
                  )}
                  onMomentumScrollEnd={(ev) => {
                    const offsetY = ev.nativeEvent.contentOffset.y;
                    const rawIndex = Math.round(offsetY / ITEM_HEIGHT);
                    const clampedIndex = Math.min(Math.max(rawIndex, 0), values.length - 1);
                    const value = MIN_VALUE + clampedIndex;
                    setGlicose(value);
                    scrollRef.current?.scrollTo({ y: clampedIndex * ITEM_HEIGHT, animated: true });
                  }}
                  contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * ((VISIBLE_ITEMS - 1) / 2) }}
                >
                  {values.map((item, index) => {
                    const inputRange = [
                      (index - 1) * ITEM_HEIGHT,
                      index * ITEM_HEIGHT,
                      (index + 1) * ITEM_HEIGHT,
                    ];
                    const opacity = scrollY.interpolate({
                      inputRange,
                      outputRange: [0.25, 1, 0.25],
                      extrapolate: 'clamp',
                    });
                    const scale = scrollY.interpolate({
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
              <Text style={styles.glicemiaUnit}>mg/dL</Text>
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
  // Estilos do seletor rolável
  pickerRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelContainer: {
    width: 140,
    overflow: 'hidden',
    position: 'relative',
    marginRight: 8,
  },
  centerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 74, 97, 0.08)',
    borderRadius: 8,
  },
  wheelItemText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#004A61',
  },
});
