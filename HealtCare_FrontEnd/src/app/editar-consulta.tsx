import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, ENDPOINTS } from '@/constants/api';

interface Consulta {
  id: string;
  especialidade: string;
  endereco: string;
  hora: string;
  data: string;
  descricao: string;
}

export default function EditarConsultaScreen() {
  const router = useRouter();
  const { consulta } = useLocalSearchParams();
  const [consultaData, setConsultaData] = useState<Consulta | null>(null);
  const [especialidade, setEspecialidade] = useState('');
  const [endereco, setEndereco] = useState('');
  const [hora, setHora] = useState('');
  const [data, setData] = useState('');
  const [descricao, setDescricao] = useState('');
  const [nomeMedico, setNomeMedico] = useState('');
  const [saving, setSaving] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedHour, setSelectedHour] = useState(8);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Configurações dos seletores (baseado na tela de pressão arterial)
  const ITEM_HEIGHT = 44;
  const VISIBLE_ITEMS = 3; // 1 acima, 1 central, 1 abaixo
  const HOUR_MIN = 0;
  const HOUR_MAX = 23;
  const MINUTE_MIN = 0;
  const MINUTE_MAX = 55;

  const hourValues = useMemo(() => Array.from({ length: HOUR_MAX - HOUR_MIN + 1 }, (_, i) => HOUR_MIN + i), []);
  const minuteValues = useMemo(() => Array.from({ length: (MINUTE_MAX - MINUTE_MIN) / 5 + 1 }, (_, i) => MINUTE_MIN + i * 5), []);
  const hourScrollRef = useRef<ScrollView | null>(null);
  const minuteScrollRef = useRef<ScrollView | null>(null);
  const hourScrollY = useRef(new Animated.Value(0)).current;
  const minuteScrollY = useRef(new Animated.Value(0)).current;

  const especialidades = [
    'Cardiologista',
    'Dermatologista',
    'Endocrinologista',
    'Ginecologista',
    'Neurologista',
    'Oftalmologista',
    'Ortopedista',
    'Pediatra',
    'Psiquiatra',
    'Reumatologista',
    'Urologista'
  ];

  useEffect(() => {
    if (consulta) {
      try {
        const parsedConsulta = JSON.parse(consulta as string);
        setConsultaData(parsedConsulta);
        setEspecialidade(parsedConsulta.especialidade || '');
        setEndereco(parsedConsulta.endereco || '');
        // Normalizar o horário para sempre usar ":" como separador
        const horaRaw = parsedConsulta.horario || parsedConsulta.hora || '11:30';
        const horaNormalizada = horaRaw.replace(/[h;.,]/g, ':');
        setHora(horaNormalizada);
        setData(parsedConsulta.data || '03/11/2024');
        setDescricao(parsedConsulta.descricao || '');
        setNomeMedico(parsedConsulta.nomeMedico || parsedConsulta.nome_medico || '');
        
        // Inicializar valores do seletor de hora
        const horaAtual = horaNormalizada;
        // Garantir que está no formato HH:mm (normalizar qualquer separador)
        const horaFormatada = horaAtual.replace(/[h;.,]/g, ':');
        const [hour, minute] = horaFormatada.split(':').map(Number);
        
        if (!isNaN(hour) && !isNaN(minute)) {
          setSelectedHour(hour);
          // Arredondar o minuto para o múltiplo de 5 mais próximo
          const minuteRounded = Math.round(minute / 5) * 5;
          setSelectedMinute(Math.min(55, Math.max(0, minuteRounded)));
        } else {
          setSelectedHour(11);
          setSelectedMinute(30);
        }
        
        // Inicializar data selecionada
        const dataAtual = parsedConsulta.data || '03/11/2024';
        // Verificar se a data está no formato DD/MM/AAAA
        if (dataAtual.includes('/')) {
          const [day, month, year] = dataAtual.split('/').map(Number);
          if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            setSelectedDate(new Date(year, month - 1, day));
          } else {
            setSelectedDate(new Date());
          }
        } else {
          setSelectedDate(new Date());
        }
      } catch (error) {
        console.error('Erro ao parsear consulta:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados da consulta. Por favor, tente novamente.');
        router.back();
      }
    }
  }, [consulta]);

  // Centraliza valores iniciais ao abrir o modal
  useEffect(() => {
    if (showTimePicker) {
      const initialHourIndex = Math.min(Math.max(selectedHour - HOUR_MIN, 0), hourValues.length - 1);
      const initialMinuteIndex = Math.min(Math.max(selectedMinute / 5, 0), minuteValues.length - 1);
      const t = setTimeout(() => {
        hourScrollRef.current?.scrollTo({ 
          y: initialHourIndex * ITEM_HEIGHT, 
          animated: false 
        });
        minuteScrollRef.current?.scrollTo({ 
          y: initialMinuteIndex * ITEM_HEIGHT, 
          animated: false 
        });
      }, 100);
      return () => clearTimeout(t);
    }
  }, [showTimePicker, selectedHour, selectedMinute]);


  const handleSave = async () => {
    console.log('handleSave chamado na edição');

    // Validações
    if (!especialidade.trim()) {
      Alert.alert('Erro', 'Por favor, selecione uma especialidade');
      return;
    }

    if (!endereco.trim()) {
      Alert.alert('Erro', 'Por favor, insira o endereço');
      return;
    }

    // Validar formato de hora (HH:mm)
    const horaRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!hora.trim() || !horaRegex.test(hora)) {
      Alert.alert('Erro', 'Por favor, insira uma hora válida no formato HH:mm (ex: 14:30)');
      return;
    }

    // Validar data
    if (!data.trim() || data.length !== 10) {
      Alert.alert('Erro', 'Por favor, insira uma data válida no formato DD/MM/AAAA');
      return;
    }

    // Parsear data DD/MM/AAAA
    const [day, month, year] = data.split('/').map(Number);
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      Alert.alert('Erro', 'Por favor, insira uma data válida no formato DD/MM/AAAA');
      return;
    }

    if (!nomeMedico.trim()) {
      Alert.alert('Erro', 'Por favor, insira o nome do médico');
      return;
    }

    if (!consultaData || !consultaData.id) {
      Alert.alert('Erro', 'ID da consulta não encontrado');
      return;
    }

    setSaving(true);
    console.log('Iniciando atualização...');

    try {
      // Normalizar o horário antes de processar (garantir que usa ":")
      const horaNormalizada = hora.replace(/[h;.,]/g, ':');
      // Combinar data e hora em um objeto Date
      const [horas, minutos] = horaNormalizada.split(':').map(Number);
      
      // Criar data no timezone local sem conversão para UTC
      // Usar formato que preserve o horário local: YYYY-MM-DD HH:mm:ss
      const dataHoraLocal = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:00`;
      
      // Para enviar ao backend, criar Date e converter para ISO, mas vamos usar o formato local
      const dataHoraConsulta = new Date(year, month - 1, day, horas, minutos, 0, 0);
      
      console.log('🕐 [DEBUG] Horário selecionado:', horaNormalizada);
      console.log('📅 [DEBUG] Data selecionada:', `${day}/${month}/${year}`);
      console.log('🔧 [DEBUG] Data/Hora Local (formato):', dataHoraLocal);
      console.log('🔧 [DEBUG] Data/Hora Date object:', dataHoraConsulta);
      console.log('🔧 [DEBUG] Data/Hora ISO:', dataHoraConsulta.toISOString());

      // Verificar se a data/hora não é no passado
      const agora = new Date();
      if (dataHoraConsulta < agora) {
        Alert.alert('Erro', 'A data e hora da consulta não podem ser no passado');
        setSaving(false);
        return;
      }

      const token = await AsyncStorage.getItem('healthcare_auth_token');

      if (!token) {
        setSaving(false);
        Alert.alert('Erro', 'Você precisa estar logado para atualizar uma consulta');
        return;
      }

      // Preparar dados para enviar ao backend
      // Usar formato local para evitar problemas de timezone
      // Formato: YYYY-MM-DD HH:mm:ss (sem timezone, será tratado como local pelo backend)
      const dataHoraFormatada = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:00`;
      
      const dadosUpdate = {
        especialidade: especialidade.trim(),
        data_hora_consulta: dataHoraFormatada, // Formato local sem timezone
        nome_medico: nomeMedico.trim(),
        local: endereco.trim(),
        observacoes: descricao.trim() || null,
      };
      
      console.log('📤 [DEBUG] Dados enviados ao backend:', dadosUpdate);

      console.log('Dados a serem enviados:', dadosUpdate);
      console.log('URL:', `${API_CONFIG.BASE_URL}${ENDPOINTS.CONSULTAS}/${consultaData.id}`);

      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.CONSULTAS}/${consultaData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosUpdate),
      });

      console.log('Status da resposta:', response.status);

      const result = await response.json();
      console.log('Resposta do servidor:', result);

      if (!response.ok) {
        if (response.status === 401) {
          setSaving(false);
          Alert.alert('Erro', 'Sessão expirada. Por favor, faça login novamente');
          return;
        }
        throw new Error(result.message || 'Erro ao atualizar consulta');
      }

      if (result.success) {
        setSaving(false);
        Alert.alert('Sucesso', 'Consulta atualizada com sucesso!', [
          {
            text: 'OK',
            onPress: () => router.push('/consultas'),
          },
        ]);
      } else {
        setSaving(false);
        throw new Error(result.message || 'Erro ao atualizar consulta');
      }
    } catch (error: any) {
      setSaving(false);
      console.error('Erro ao atualizar consulta:', error);
      Alert.alert('Erro', error.message || 'Não foi possível atualizar a consulta. Tente novamente.');
    }
  };

  const showEspecialidadePicker = () => {
    Alert.alert(
      'Especialidade',
      'Selecione a especialidade:',
      [
        ...especialidades.map(esp => ({
          text: esp,
          onPress: () => setEspecialidade(esp)
        })),
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const openTimePicker = () => {
    setShowTimePicker(true);
  };

  const confirmTimeSelection = () => {
    // Garantir que sempre use ":" como separador
    const timeString = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    // Normalizar para garantir que não há outros separadores
    const horaNormalizada = timeString.replace(/[h;.,]/g, ':');
    setHora(horaNormalizada);
    setShowTimePicker(false);
  };

  const cancelTimeSelection = () => {
    setShowTimePicker(false);
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (event.type === 'set' && selectedDate) {
      setSelectedDate(selectedDate);
      const day = selectedDate.getDate();
      const month = selectedDate.getMonth() + 1;
      const year = selectedDate.getFullYear();
      const formattedDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
      setData(formattedDate);
      if (Platform.OS === 'ios') {
        setShowDatePicker(false);
      }
    } else if (event.type === 'dismissed') {
      setShowDatePicker(false);
    }
  };


  if (!consultaData) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <Text>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#004A61" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Editar consulta</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* Formulário */}
        <View style={styles.form}>
          {/* Especialidade */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Especialidade</Text>
            <TouchableOpacity style={styles.input} onPress={showEspecialidadePicker}>
              <Text style={styles.inputText}>{especialidade}</Text>
              <Feather name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Endereço */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Endereço</Text>
            <TextInput
              style={styles.input}
              value={endereco}
              onChangeText={setEndereco}
              placeholder="endereço"
              placeholderTextColor="#999"
            />
          </View>

          {/* Hora */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hora</Text>
            <TouchableOpacity style={styles.input} onPress={openTimePicker}>
              <Text style={styles.inputText}>{hora}</Text>
              <Feather name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Data */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data</Text>
            <View style={styles.dataInputContainer}>
              <TextInput
                style={styles.dataInput}
                value={data}
                onChangeText={setData}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={10}
              />
              <TouchableOpacity 
                style={styles.calendarButton}
                onPress={openDatePicker}
              >
                <Feather name="calendar" size={20} color="#004A61" />
              </TouchableOpacity>
            </View>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
              />
            )}
          </View>

          {/* Nome do médico */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome do médico</Text>
            <TextInput
              style={styles.input}
              value={nomeMedico}
              onChangeText={setNomeMedico}
              placeholder="Alfredo"
              placeholderTextColor="#999"
            />
          </View>

          {/* Descrição */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={descricao}
              onChangeText={setDescricao}
              placeholder="descrição"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>

      {/* Botão Salvar */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Salvar</Text>
        </TouchableOpacity>
      </View>

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
              <Text style={styles.timePickerTitle}>Hora da consulta</Text>
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
                          { 
                            useNativeDriver: true,
                            listener: (ev: any) => {
                              const offsetY = ev.nativeEvent.contentOffset.y;
                              const rawIndex = Math.round(offsetY / ITEM_HEIGHT);
                              const clampedIndex = Math.min(Math.max(rawIndex, 0), hourValues.length - 1);
                              const newHour = HOUR_MIN + clampedIndex;
                              if (newHour !== selectedHour) {
                                setSelectedHour(newHour);
                              }
                            }
                          }
                        )}
                        onMomentumScrollEnd={(ev) => {
                          const offsetY = ev.nativeEvent.contentOffset.y;
                          const rawIndex = Math.round(offsetY / ITEM_HEIGHT);
                          const clampedIndex = Math.min(Math.max(rawIndex, 0), hourValues.length - 1);
                          const newHour = HOUR_MIN + clampedIndex;
                          setSelectedHour(newHour);
                          // Garantir alinhamento preciso após o scroll parar
                          const targetY = clampedIndex * ITEM_HEIGHT;
                          if (Math.abs(offsetY - targetY) > 1) {
                            hourScrollRef.current?.scrollTo({
                              y: targetY,
                              animated: false,
                            });
                          }
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
                          { 
                            useNativeDriver: true,
                            listener: (ev: any) => {
                              const offsetY = ev.nativeEvent.contentOffset.y;
                              const rawIndex = Math.round(offsetY / ITEM_HEIGHT);
                              const clampedIndex = Math.min(Math.max(rawIndex, 0), minuteValues.length - 1);
                              const newMinute = MINUTE_MIN + clampedIndex * 5;
                              if (newMinute !== selectedMinute) {
                                setSelectedMinute(newMinute);
                              }
                            }
                          }
                        )}
                        onMomentumScrollEnd={(ev) => {
                          const offsetY = ev.nativeEvent.contentOffset.y;
                          const rawIndex = Math.round(offsetY / ITEM_HEIGHT);
                          const clampedIndex = Math.min(Math.max(rawIndex, 0), minuteValues.length - 1);
                          const newMinute = MINUTE_MIN + clampedIndex * 5;
                          setSelectedMinute(newMinute);
                          // Garantir alinhamento preciso após o scroll parar
                          const targetY = clampedIndex * ITEM_HEIGHT;
                          if (Math.abs(offsetY - targetY) > 1) {
                            minuteScrollRef.current?.scrollTo({
                              y: targetY,
                              animated: false,
                            });
                          }
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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
  dataInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingRight: 8,
  },
  dataInput: {
    flex: 1,
    borderWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  calendarButton: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textArea: {
    minHeight: 100,
    alignItems: 'flex-start',
    paddingTop: 12,
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
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  saveButton: {
    backgroundColor: '#004A61',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
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
    paddingHorizontal: 20,
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
    width: 80,
    overflow: 'hidden',
    position: 'relative',
  },
  wheelItemText: {
    fontSize: 28,
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
});











