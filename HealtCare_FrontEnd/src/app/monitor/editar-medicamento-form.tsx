import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  Animated,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface Medicamento {
  id: string;
  nome: string;
  tomado: boolean;
  dosesPorDia: number;
  dosagem: string;
  horario1: string;
  horario2: string;
}

export default function EditarMedicamentoFormScreen() {
  const router = useRouter();
  const { medicamento } = useLocalSearchParams();
  const [medicamentoData, setMedicamentoData] = useState<Medicamento | null>(null);
  const [nome, setNome] = useState('');
  const [dosesPorDia, setDosesPorDia] = useState('');
  const [dosagem, setDosagem] = useState('');
  const [horario1, setHorario1] = useState('');
  const [horario2, setHorario2] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentTimeField, setCurrentTimeField] = useState<'horario1' | 'horario2'>('horario1');
  const [selectedHour, setSelectedHour] = useState(8);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [showDosagemPicker, setShowDosagemPicker] = useState(false);
  const [selectedDosagemIndex, setSelectedDosagemIndex] = useState(2); // 150 mg é o índice 2
  const [showDosesPicker, setShowDosesPicker] = useState(false);
  const [selectedDosesIndex, setSelectedDosesIndex] = useState(1); // 2 doses é o índice 1

  // Configurações dos seletores (baseado na tela de pressão arterial)
  const ITEM_HEIGHT = 44;
  const VISIBLE_ITEMS = 3; // 1 acima, 1 central, 1 abaixo
  const HOUR_MIN = 0;
  const HOUR_MAX = 23;
  const MINUTE_MIN = 0;
  const MINUTE_MAX = 45; // Intervalos de 15 minutos

  const hourValues = useMemo(() => Array.from({ length: HOUR_MAX - HOUR_MIN + 1 }, (_, i) => HOUR_MIN + i), []);
  const minuteValues = useMemo(() => Array.from({ length: (MINUTE_MAX - MINUTE_MIN) / 15 + 1 }, (_, i) => MINUTE_MIN + i * 15), []);
  const dosagemValues = useMemo(() => ['50 mg', '100 mg', '150 mg', '200 mg', '250 mg', '500 mg'], []);
  const dosesValues = useMemo(() => ['1', '2', '3', '4'], []);

  const hourScrollRef = useRef<ScrollView | null>(null);
  const minuteScrollRef = useRef<ScrollView | null>(null);
  const dosagemScrollRef = useRef<ScrollView | null>(null);
  const dosesScrollRef = useRef<ScrollView | null>(null);
  const hourScrollY = useRef(new Animated.Value(0)).current;
  const minuteScrollY = useRef(new Animated.Value(0)).current;
  const dosagemScrollY = useRef(new Animated.Value(0)).current;
  const dosesScrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (medicamento) {
      try {
        const parsedMedicamento = JSON.parse(medicamento as string);
        setMedicamentoData(parsedMedicamento);
        setNome(parsedMedicamento.nome);
        const dosesInicial = parsedMedicamento.dosesPorDia.toString();
        setDosesPorDia(dosesInicial);
        const dosesIndex = dosesValues.findIndex(d => d === dosesInicial);
        setSelectedDosesIndex(dosesIndex >= 0 ? dosesIndex : 1);
        const dosagemInicial = parsedMedicamento.dosagem || '150 mg';
        setDosagem(dosagemInicial);
        const dosagemIndex = dosagemValues.findIndex(d => d === dosagemInicial);
        setSelectedDosagemIndex(dosagemIndex >= 0 ? dosagemIndex : 2);
        setHorario1(parsedMedicamento.horario1);
        setHorario2(parsedMedicamento.horario2);
        
        // Inicializar valores do seletor de hora
        if (parsedMedicamento.horario1) {
          const [hour, minute] = parsedMedicamento.horario1.split(':').map(Number);
          setSelectedHour(hour);
          setSelectedMinute(minute);
        }
      } catch (error) {
        console.error('Erro ao parsear medicamento:', error);
        router.back();
      }
    }
  }, [medicamento]);

  // Centraliza valores iniciais ao abrir o modal
  useEffect(() => {
    if (showTimePicker) {
      const initialHourIndex = Math.min(Math.max(selectedHour - HOUR_MIN, 0), hourValues.length - 1);
      const initialMinuteIndex = Math.min(Math.max(selectedMinute / 15, 0), minuteValues.length - 1);
      const t = setTimeout(() => {
        hourScrollRef.current?.scrollTo({ y: initialHourIndex * ITEM_HEIGHT, animated: false });
        minuteScrollRef.current?.scrollTo({ y: initialMinuteIndex * ITEM_HEIGHT, animated: false });
      }, 100);
      return () => clearTimeout(t);
    }
  }, [showTimePicker, selectedHour, selectedMinute]);

  // Centraliza valores iniciais do seletor de dosagem
  useEffect(() => {
    if (showDosagemPicker) {
      const initialDosagemIndex = Math.min(Math.max(selectedDosagemIndex, 0), dosagemValues.length - 1);
      const t = setTimeout(() => {
        dosagemScrollRef.current?.scrollTo({ y: initialDosagemIndex * ITEM_HEIGHT, animated: false });
      }, 100);
      return () => clearTimeout(t);
    }
  }, [showDosagemPicker, selectedDosagemIndex]);

  // Centraliza valores iniciais do seletor de doses
  useEffect(() => {
    if (showDosesPicker) {
      const initialDosesIndex = Math.min(Math.max(selectedDosesIndex, 0), dosesValues.length - 1);
      const t = setTimeout(() => {
        dosesScrollRef.current?.scrollTo({ y: initialDosesIndex * ITEM_HEIGHT, animated: false });
      }, 100);
      return () => clearTimeout(t);
    }
  }, [showDosesPicker, selectedDosesIndex]);

  const handleSave = () => {
    if (!nome.trim()) {
      Alert.alert('Erro', 'Por favor, insira o nome do medicamento');
      return;
    }

    if (!dosesPorDia || parseInt(dosesPorDia) < 1) {
      Alert.alert('Erro', 'Por favor, insira um número válido de doses por dia');
      return;
    }

    if (!dosagem.trim()) {
      Alert.alert('Erro', 'Por favor, insira a dosagem do medicamento');
      return;
    }

    if (!horario1.trim()) {
      Alert.alert('Erro', 'Por favor, insira pelo menos um horário de lembrete');
      return;
    }

    // Aqui você implementaria a lógica para salvar no backend
    Alert.alert('Sucesso', 'Medicamento atualizado com sucesso!');
    router.back();
  };

  const openDosesPicker = () => {
    setShowDosesPicker(true);
  };

  const confirmDosesSelection = () => {
    const selectedDoses = dosesValues[selectedDosesIndex];
    setDosesPorDia(selectedDoses);
    setShowDosesPicker(false);
  };

  const cancelDosesSelection = () => {
    setShowDosesPicker(false);
  };

  const openDosagemPicker = () => {
    setShowDosagemPicker(true);
  };

  const confirmDosagemSelection = () => {
    const selectedDosagem = dosagemValues[selectedDosagemIndex];
    setDosagem(selectedDosagem);
    setShowDosagemPicker(false);
  };

  const cancelDosagemSelection = () => {
    setShowDosagemPicker(false);
  };

  const openTimePicker = (field: 'horario1' | 'horario2') => {
    setCurrentTimeField(field);
    const currentTime = field === 'horario1' ? horario1 : horario2;
    
    if (currentTime) {
      const [hour, minute] = currentTime.split(':').map(Number);
      setSelectedHour(hour);
      setSelectedMinute(minute);
    }
    
    setShowTimePicker(true);
  };

  const confirmTimeSelection = () => {
    const timeString = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    
    if (currentTimeField === 'horario1') {
      setHorario1(timeString);
    } else {
      setHorario2(timeString);
    }
    
    setShowTimePicker(false);
  };

  const cancelTimeSelection = () => {
    setShowTimePicker(false);
  };

  if (!medicamentoData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#004A61" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.titleButton}>
            <Text style={styles.title}>Editar medicamento</Text>
          </View>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* Formulário */}
        <View style={styles.form}>
          {/* Nome do medicamento */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome do medicamento</Text>
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Digite o nome do medicamento"
              placeholderTextColor="#999"
            />
          </View>

          {/* Número de ingestões por dia */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Número de ingestões por dia</Text>
            <TouchableOpacity style={styles.input} onPress={openDosesPicker}>
              <Text style={styles.inputText}>{dosesPorDia}</Text>
              <Feather name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Dosagem */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dosagem</Text>
            <TouchableOpacity 
              style={styles.input} 
              onPress={openDosagemPicker}
              activeOpacity={0.7}
            >
              <Text style={styles.inputText}>{dosagem || 'Selecionar dosagem'}</Text>
              <Feather name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Hora do lembrete 1 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hora do lembrete 1</Text>
            <TouchableOpacity style={styles.input} onPress={() => openTimePicker('horario1')}>
              <Text style={styles.inputText}>{horario1 || 'Selecionar horário'}</Text>
              <Feather name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Hora do lembrete 2 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hora do lembrete 2</Text>
            <TouchableOpacity style={styles.input} onPress={() => openTimePicker('horario2')}>
              <Text style={styles.inputText}>{horario2 || 'Selecionar horário'}</Text>
              <Feather name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Botão Salvar */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Salvar</Text>
      </TouchableOpacity>

      {/* Modal do Seletor de Hora */}
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={cancelTimeSelection}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.timePickerModal}>
            <View style={styles.timePickerHeader}>
              <TouchableOpacity onPress={cancelTimeSelection}>
                <Text style={styles.cancelButton}>Cancelar</Text>
              </TouchableOpacity>
              <Text style={styles.timePickerTitle}>
                Hora do lembrete {currentTimeField === 'horario1' ? '1' : '2'}
              </Text>
              <TouchableOpacity onPress={confirmTimeSelection}>
                <Text style={styles.confirmButton}>Confirmar</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.timePickerContainer}>
              {/* Seletor de Hora */}
              <View style={styles.timeCard}>
                <View style={styles.timeCardHeader}>
                  <Text style={styles.timeCardHeaderText}>Hora</Text>
                  <Text style={styles.timeCardHeaderValue}>{selectedHour.toString().padStart(2, '0')}</Text>
                </View>
                <View style={styles.timeCardBody}>
                  <View style={styles.pickerRow}>
                    <View style={[styles.wheelContainer, { height: ITEM_HEIGHT * VISIBLE_ITEMS }]}>
                      <Animated.ScrollView
                        ref={hourScrollRef}
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
                          [{ nativeEvent: { contentOffset: { y: hourScrollY } } }],
                          { useNativeDriver: true }
                        )}
                        onMomentumScrollEnd={(ev) => {
                          const offsetY = ev.nativeEvent.contentOffset.y;
                          const rawIndex = Math.round(offsetY / ITEM_HEIGHT);
                          const clampedIndex = Math.min(Math.max(rawIndex, 0), hourValues.length - 1);
                          setSelectedHour(HOUR_MIN + clampedIndex);
                        }}
                        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * ((VISIBLE_ITEMS - 1) / 2) }}
                      >
                        {hourValues.map((item, index) => {
                          const inputRange = [
                            (index - 1) * ITEM_HEIGHT,
                            index * ITEM_HEIGHT,
                            (index + 1) * ITEM_HEIGHT,
                          ];
                          const opacity = hourScrollY.interpolate({
                            inputRange,
                            outputRange: [0.25, 1, 0.25],
                            extrapolate: 'clamp',
                          });
                          const scale = hourScrollY.interpolate({
                            inputRange,
                            outputRange: [0.9, 1.6, 0.9],
                            extrapolate: 'clamp',
                          });
                          return (
                            <View key={item} style={{ height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
                              <Animated.Text style={[styles.wheelItemText, { opacity, transform: [{ scale }] }]}>
                                {item.toString().padStart(2, '0')}
                              </Animated.Text>
                            </View>
                          );
                        })}
                      </Animated.ScrollView>
                    </View>
                  </View>
                </View>
              </View>

              {/* Separador */}
              <Text style={styles.timeSeparator}>:</Text>

              {/* Seletor de Minuto */}
              <View style={styles.timeCard}>
                <View style={styles.timeCardHeader}>
                  <Text style={styles.timeCardHeaderText}>Minuto</Text>
                  <Text style={styles.timeCardHeaderValue}>{selectedMinute.toString().padStart(2, '0')}</Text>
                </View>
                <View style={styles.timeCardBody}>
                  <View style={styles.pickerRow}>
                    <View style={[styles.wheelContainer, { height: ITEM_HEIGHT * VISIBLE_ITEMS }]}>
                      <Animated.ScrollView
                        ref={minuteScrollRef}
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
                          [{ nativeEvent: { contentOffset: { y: minuteScrollY } } }],
                          { useNativeDriver: true }
                        )}
                        onMomentumScrollEnd={(ev) => {
                          const offsetY = ev.nativeEvent.contentOffset.y;
                          const rawIndex = Math.round(offsetY / ITEM_HEIGHT);
                          const clampedIndex = Math.min(Math.max(rawIndex, 0), minuteValues.length - 1);
                          setSelectedMinute(MINUTE_MIN + clampedIndex * 15);
                        }}
                        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * ((VISIBLE_ITEMS - 1) / 2) }}
                      >
                        {minuteValues.map((item, index) => {
                          const inputRange = [
                            (index - 1) * ITEM_HEIGHT,
                            index * ITEM_HEIGHT,
                            (index + 1) * ITEM_HEIGHT,
                          ];
                          const opacity = minuteScrollY.interpolate({
                            inputRange,
                            outputRange: [0.25, 1, 0.25],
                            extrapolate: 'clamp',
                          });
                          const scale = minuteScrollY.interpolate({
                            inputRange,
                            outputRange: [0.9, 1.6, 0.9],
                            extrapolate: 'clamp',
                          });
                          return (
                            <View key={item} style={{ height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
                              <Animated.Text style={[styles.wheelItemText, { opacity, transform: [{ scale }] }]}>
                                {item.toString().padStart(2, '0')}
                              </Animated.Text>
                            </View>
                          );
                        })}
                      </Animated.ScrollView>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal do Seletor de Dosagem */}
      <Modal
        visible={showDosagemPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={cancelDosagemSelection}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.timePickerModal}>
            <View style={styles.timePickerHeader}>
              <TouchableOpacity onPress={cancelDosagemSelection}>
                <Text style={styles.cancelButton}>Cancelar</Text>
              </TouchableOpacity>
              <Text style={styles.timePickerTitle}>Dosagem</Text>
              <TouchableOpacity onPress={confirmDosagemSelection}>
                <Text style={styles.confirmButton}>Confirmar</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.timePickerContainer}>
              {/* Seletor de Dosagem */}
              <View style={styles.timeCard}>
                <View style={styles.timeCardHeader}>
                  <Text style={styles.timeCardHeaderText}>Dosagem</Text>
                  <Text style={styles.timeCardHeaderValue}>{dosagemValues[selectedDosagemIndex]}</Text>
                </View>
                <View style={styles.timeCardBody}>
                  <View style={styles.pickerRow}>
                    <View style={[styles.wheelContainer, { height: ITEM_HEIGHT * VISIBLE_ITEMS }]}>
                      <Animated.ScrollView
                        ref={dosagemScrollRef}
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
                          [{ nativeEvent: { contentOffset: { y: dosagemScrollY } } }],
                          { useNativeDriver: true }
                        )}
                        onMomentumScrollEnd={(ev) => {
                          const offsetY = ev.nativeEvent.contentOffset.y;
                          const rawIndex = Math.round(offsetY / ITEM_HEIGHT);
                          const clampedIndex = Math.min(Math.max(rawIndex, 0), dosagemValues.length - 1);
                          setSelectedDosagemIndex(clampedIndex);
                        }}
                        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * ((VISIBLE_ITEMS - 1) / 2) }}
                      >
                        {dosagemValues.map((item, index) => {
                          const inputRange = [
                            (index - 1) * ITEM_HEIGHT,
                            index * ITEM_HEIGHT,
                            (index + 1) * ITEM_HEIGHT,
                          ];
                          const opacity = dosagemScrollY.interpolate({
                            inputRange,
                            outputRange: [0.25, 1, 0.25],
                            extrapolate: 'clamp',
                          });
                          const scale = dosagemScrollY.interpolate({
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
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal do Seletor de Doses */}
      <Modal
        visible={showDosesPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={cancelDosesSelection}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.timePickerModal}>
            <View style={styles.timePickerHeader}>
              <TouchableOpacity onPress={cancelDosesSelection}>
                <Text style={styles.cancelButton}>Cancelar</Text>
              </TouchableOpacity>
              <Text style={styles.timePickerTitle}>Número de ingestões por dia</Text>
              <TouchableOpacity onPress={confirmDosesSelection}>
                <Text style={styles.confirmButton}>Confirmar</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.timePickerContainer}>
              {/* Seletor de Doses */}
              <View style={styles.timeCard}>
                <View style={styles.timeCardHeader}>
                  <Text style={styles.timeCardHeaderText}>Doses</Text>
                  <Text style={styles.timeCardHeaderValue}>{dosesValues[selectedDosesIndex]}</Text>
                </View>
                <View style={styles.timeCardBody}>
                  <View style={styles.pickerRow}>
                    <View style={[styles.wheelContainer, { height: ITEM_HEIGHT * VISIBLE_ITEMS }]}>
                      <Animated.ScrollView
                        ref={dosesScrollRef}
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
                          [{ nativeEvent: { contentOffset: { y: dosesScrollY } } }],
                          { useNativeDriver: true }
                        )}
                        onMomentumScrollEnd={(ev) => {
                          const offsetY = ev.nativeEvent.contentOffset.y;
                          const rawIndex = Math.round(offsetY / ITEM_HEIGHT);
                          const clampedIndex = Math.min(Math.max(rawIndex, 0), dosesValues.length - 1);
                          setSelectedDosesIndex(clampedIndex);
                        }}
                        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * ((VISIBLE_ITEMS - 1) / 2) }}
                      >
                        {dosesValues.map((item, index) => {
                          const inputRange = [
                            (index - 1) * ITEM_HEIGHT,
                            index * ITEM_HEIGHT,
                            (index + 1) * ITEM_HEIGHT,
                          ];
                          const opacity = dosesScrollY.interpolate({
                            inputRange,
                            outputRange: [0.25, 1, 0.25],
                            extrapolate: 'clamp',
                          });
                          const scale = dosesScrollY.interpolate({
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
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  // Estilos do Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  timePickerModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Para iPhone com home indicator
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
  },
  timePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  confirmButton: {
    fontSize: 16,
    color: '#004A61',
    fontWeight: '600',
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  timeSelector: {
    alignItems: 'center',
    flex: 1,
  },
  timeLabel: {
    fontSize: 14,
    color: '#004A61',
    fontWeight: '600',
    marginBottom: 16,
  },
  numberSelector: {
    alignItems: 'center',
  },
  arrowButton: {
    padding: 8,
    marginVertical: 4,
  },
  numberDisplay: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginVertical: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  numberText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#004A61',
  },
  timeSeparator: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#004A61',
    marginHorizontal: 20,
    marginTop: 40,
  },
  // Estilos baseados na pressão arterial
  timeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    flex: 1,
  },
  timeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#B2EBF2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  timeCardHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#004A61',
  },
  timeCardHeaderValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#004A61',
  },
  timeCardBody: {
    paddingVertical: 15,
    paddingHorizontal: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelContainer: {
    width: 150,
    overflow: 'hidden',
    position: 'relative',
  },
  wheelItemText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#004A61',
    textAlign: 'center',
  },
});
