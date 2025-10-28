import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Platform, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { API_CONFIG, ENDPOINTS } from '@/constants/api';

export default function TemperaturaScreen() {
  const router = useRouter();
  const [temperature, setTemperature] = useState(37.5);
  const [dateISO, setDateISO] = useState(new Date().toISOString().slice(0,10));
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

  // Wheel picker config (32°C a 45°C, passo 0.1)
  const ITEM_HEIGHT = 60;
  const VISIBLE_ITEMS = 3;
  const MIN_TEMP = 32.0;
  const MAX_TEMP = 45.0;
  const values = useMemo(() => {
    const arr: number[] = [];
    for (let t = MIN_TEMP; t <= MAX_TEMP + 1e-9; t += 0.1) {
      arr.push(parseFloat(t.toFixed(1)));
    }
    return arr;
  }, []);
  const scrollRef = useRef(null as any);
  const scrollY = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const idx = Math.round((temperature - MIN_TEMP) / 0.1);
    const t = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated: false });
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const handleSave = async () => {
    // Validações
    if (temperature < 32 || temperature > 45) {
      Alert.alert('Atenção', 'O intervalo de temperatura deve ser entre 32° e 45°');
      return;
    }
    const chosen = new Date(dateISO + 'T00:00:00');
    const now = new Date(); now.setHours(0,0,0,0);
    if (chosen.getTime() > now.getTime()) {
      Alert.alert('Atenção', 'Não cadastre uma data futura');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      if (!token) {
        Alert.alert('Erro de Autenticação', 'Você não está logado.');
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.TEMPERATURE_RECORDS}` , {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          graus_celsius: temperature,
          // ISO 8601 no app; o backend normaliza para MySQL automaticamente
          data_hora_medicao: `${dateISO}T${new Date().toTimeString().slice(0,8)}`,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Falha ao salvar');

      // Alerta crítico
      if (temperature < 36) Alert.alert('Muito baixa', 'Sua temperatura está abaixo do normal.');
      if (temperature > 38) Alert.alert('Muito elevada', 'Sua temperatura está acima do normal.');

      Alert.alert('Sucesso!', 'Temperatura registrada com sucesso.');
      router.back();
    } catch (e: any) {
      Alert.alert('Falha: Tente Novamente', e.message || 'Erro inesperado');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#004A61" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Temperatura</Text>
          <Text style={styles.headerSubtitle}>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}> 
          <Text style={styles.cardHeaderText}>Temperatura basal</Text>
          <Text style={styles.cardHeaderValue}>{temperature.toFixed(1)}</Text>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.pickerRow}>
            <View style={[styles.wheelContainer, { height: ITEM_HEIGHT * VISIBLE_ITEMS }]}>
              <Animated.ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                bounces={false}
                decelerationRate="fast"
                snapToInterval={ITEM_HEIGHT}
                snapToAlignment="start"
                scrollEventThrottle={16}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
                onMomentumScrollEnd={(ev) => {
                  const offsetY = ev.nativeEvent.contentOffset.y;
                  const index = Math.round(offsetY / ITEM_HEIGHT);
                  const clamped = Math.min(Math.max(index, 0), values.length - 1);
                  setTemperature(values[clamped]);
                }}
                contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * ((VISIBLE_ITEMS - 1) / 2) }}
              >
                {values.map((item, index) => {
                  const inputRange = [
                    (index - 1) * ITEM_HEIGHT,
                    index * ITEM_HEIGHT,
                    (index + 1) * ITEM_HEIGHT,
                  ];
                  const opacity = scrollY.interpolate({ inputRange, outputRange: [0.25, 1, 0.25], extrapolate: 'clamp' });
                  const scale = scrollY.interpolate({ inputRange, outputRange: [0.9, 1.6, 0.9], extrapolate: 'clamp' });
                  return (
                    <View key={item} style={{ height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
                      <Animated.Text style={[styles.wheelItemText, { opacity, transform: [{ scale }] }]}>
                        {item.toFixed(1)}
                      </Animated.Text>
                    </View>
                  );
                })}
              </Animated.ScrollView>
            </View>
            <Text style={styles.unit}>°C</Text>
          </View>
        </View>
      </View>

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
              const chosen = new Date(selectedDate); chosen.setHours(0,0,0,0);
              if (chosen.getTime() > today.getTime()) {
                Alert.alert('Data inválida', 'Data não pode ser no futuro');
                return;
              }
              setDateISO(toLocalISODate(chosen));
            }}
          />
        )}
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Salvar</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, padding: 20 },
  backButton: {},
  headerTitleContainer: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  headerSubtitle: { fontSize: 14, color: 'gray' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 15, marginHorizontal: 20, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#B2EBF2', paddingVertical: 12, paddingHorizontal: 20, borderTopLeftRadius: 15, borderTopRightRadius: 15 },
  cardHeaderText: { fontSize: 16, fontWeight: 'bold', color: '#004A61' },
  cardHeaderValue: { fontSize: 16, fontWeight: 'bold', color: '#004A61' },
  cardBody: { paddingVertical: 20, paddingHorizontal: 20 },
  pickerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  wheelContainer: { width: 140, overflow: 'hidden', position: 'relative', marginRight: 8 },
  wheelItemText: { fontSize: 36, fontWeight: 'bold', color: '#004A61' },
  unit: { fontSize: 20, color: '#004A61', fontWeight: '500', marginLeft: 8 },
  dateContainer: { marginHorizontal: 20, marginTop: 10, marginBottom: 30 },
  dateLabel: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  dateInput: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 15, fontSize: 16, color: '#333', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  dateInputText: { fontSize: 16, color: '#333' },
  saveButton: { backgroundColor: '#004A61', borderRadius: 15, alignItems: 'center', paddingVertical: 15, elevation: 3, marginHorizontal: 20 },
  saveButtonText: { fontSize: 18, color: '#FFFFFF', fontWeight: 'bold' },
});





