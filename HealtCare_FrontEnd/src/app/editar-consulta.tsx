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
  const [selectedDay, setSelectedDay] = useState(3);
  const [selectedMonth, setSelectedMonth] = useState(10); // 0-indexed (novembro = 10)
  const [selectedYear, setSelectedYear] = useState(2024);

  // Configurações dos seletores (baseado na tela de pressão arterial)
  const ITEM_HEIGHT = 44;
  const VISIBLE_ITEMS = 3; // 1 acima, 1 central, 1 abaixo
  const HOUR_MIN = 0;
  const HOUR_MAX = 23;
  const MINUTE_MIN = 0;
  const MINUTE_MAX = 55;
  const DAY_MIN = 1;
  const DAY_MAX = 31;
  const MONTH_MIN = 0;
  const MONTH_MAX = 11;
  const YEAR_MIN = 2024;
  const YEAR_MAX = 2030; // Intervalos de 5 minutos

  const hourValues = useMemo(() => Array.from({ length: HOUR_MAX - HOUR_MIN + 1 }, (_, i) => HOUR_MIN + i), []);
  const minuteValues = useMemo(() => Array.from({ length: (MINUTE_MAX - MINUTE_MIN) / 5 + 1 }, (_, i) => MINUTE_MIN + i * 5), []);
  const dayValues = useMemo(() => Array.from({ length: DAY_MAX - DAY_MIN + 1 }, (_, i) => DAY_MIN + i), []);
  const monthValues = useMemo(() => Array.from({ length: MONTH_MAX - MONTH_MIN + 1 }, (_, i) => MONTH_MIN + i), []);
  const yearValues = useMemo(() => Array.from({ length: YEAR_MAX - YEAR_MIN + 1 }, (_, i) => YEAR_MIN + i), []);

  const hourScrollRef = useRef<ScrollView | null>(null);
  const minuteScrollRef = useRef<ScrollView | null>(null);
  const dayScrollRef = useRef<ScrollView | null>(null);
  const monthScrollRef = useRef<ScrollView | null>(null);
  const yearScrollRef = useRef<ScrollView | null>(null);
  const hourScrollY = useRef(new Animated.Value(0)).current;
  const minuteScrollY = useRef(new Animated.Value(0)).current;
  const dayScrollY = useRef(new Animated.Value(0)).current;
  const monthScrollY = useRef(new Animated.Value(0)).current;
  const yearScrollY = useRef(new Animated.Value(0)).current;

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
        setHora(parsedConsulta.horario || parsedConsulta.hora || '11:30');
        setData(parsedConsulta.data || '03/11/2024');
        setDescricao(parsedConsulta.descricao || '');
        setNomeMedico(parsedConsulta.nomeMedico || parsedConsulta.nome_medico || '');
        
        // Inicializar valores do seletor de hora
        const horaAtual = parsedConsulta.horario || parsedConsulta.hora || '11:30';
        // Converter "11h30" para "11:30" se necessário
        const horaFormatada = horaAtual.replace('h', ':');
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
            setSelectedDay(day);
            setSelectedMonth(month - 1); // 0-indexed
            setSelectedYear(year);
          } else {
            // Se não conseguir fazer parse, usar data atual
            const hoje = new Date();
            setSelectedDate(hoje);
            setSelectedDay(hoje.getDate());
            setSelectedMonth(hoje.getMonth());
            setSelectedYear(hoje.getFullYear());
          }
        } else {
          // Se a data não estiver no formato esperado, usar data atual
          const hoje = new Date();
          setSelectedDate(hoje);
          setSelectedDay(hoje.getDate());
          setSelectedMonth(hoje.getMonth());
          setSelectedYear(hoje.getFullYear());
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
        hourScrollRef.current?.scrollTo({ y: initialHourIndex * ITEM_HEIGHT, animated: false });
        minuteScrollRef.current?.scrollTo({ y: initialMinuteIndex * ITEM_HEIGHT, animated: false });
      }, 100);
      return () => clearTimeout(t);
    }
  }, [showTimePicker, selectedHour, selectedMinute]);

  // Centraliza valores iniciais do seletor de data
  useEffect(() => {
    if (showDatePicker) {
      const initialDayIndex = Math.min(Math.max(selectedDay - DAY_MIN, 0), dayValues.length - 1);
      const initialMonthIndex = Math.min(Math.max(selectedMonth - MONTH_MIN, 0), monthValues.length - 1);
      const initialYearIndex = Math.min(Math.max(selectedYear - YEAR_MIN, 0), yearValues.length - 1);
      const t = setTimeout(() => {
        dayScrollRef.current?.scrollTo({ y: initialDayIndex * ITEM_HEIGHT, animated: false });
        monthScrollRef.current?.scrollTo({ y: initialMonthIndex * ITEM_HEIGHT, animated: false });
        yearScrollRef.current?.scrollTo({ y: initialYearIndex * ITEM_HEIGHT, animated: false });
      }, 100);
      return () => clearTimeout(t);
    }
  }, [showDatePicker, selectedDay, selectedMonth, selectedYear]);

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
      // Combinar data e hora em um objeto Date
      const [horas, minutos] = hora.split(':').map(Number);
      const dataHoraConsulta = new Date(year, month - 1, day, horas, minutos, 0, 0);

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
      const dadosUpdate = {
        especialidade: especialidade.trim(),
        data_hora_consulta: dataHoraConsulta.toISOString(), // Formato ISO para o backend
        nome_medico: nomeMedico.trim(),
        local: endereco.trim(),
        observacoes: descricao.trim() || null,
      };

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
    const timeString = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    setHora(timeString);
    setShowTimePicker(false);
  };

  const cancelTimeSelection = () => {
    setShowTimePicker(false);
  };

  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  const confirmDateSelection = () => {
    const newDate = new Date(selectedYear, selectedMonth, selectedDay);
    setSelectedDate(newDate);
    const formattedDate = newDate.toLocaleDateString('pt-BR');
    setData(formattedDate);
    setShowDatePicker(false);
  };

  const cancelDateSelection = () => {
    setShowDatePicker(false);
  };

  const getMonthName = (monthIndex: number) => {
    const months = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];
    return months[monthIndex];
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
            <TouchableOpacity style={styles.input} onPress={openDatePicker}>
              <Text style={styles.inputText}>{data}</Text>
              <Feather name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
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
                          setSelectedMinute(MINUTE_MIN + clampedIndex * 5);
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

      {/* Modal do Seletor de Data */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={cancelDateSelection}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.timePickerModal}>
            <View style={styles.timePickerHeader}>
              <TouchableOpacity onPress={cancelDateSelection}>
                <Text style={styles.cancelButton}>Cancelar</Text>
              </TouchableOpacity>
              <Text style={styles.timePickerTitle}>Data da consulta</Text>
              <TouchableOpacity onPress={confirmDateSelection}>
                <Text style={styles.confirmButton}>Confirmar</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.timePickerContainer}>
              {/* Seletor de Dia */}
              <View style={styles.timeCard}>
                <View style={styles.timeCardHeader}>
                  <Text style={styles.timeCardHeaderText}>Dia</Text>
                  <Text style={styles.timeCardHeaderValue}>{selectedDay.toString().padStart(2, '0')}</Text>
                </View>
                <View style={styles.timeCardBody}>
                  <View style={styles.pickerRow}>
                    <View style={[styles.wheelContainer, { height: ITEM_HEIGHT * VISIBLE_ITEMS }]}>
                      <Animated.ScrollView
                        ref={dayScrollRef}
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
                          [{ nativeEvent: { contentOffset: { y: dayScrollY } } }],
                          { useNativeDriver: true }
                        )}
                        onMomentumScrollEnd={(ev) => {
                          const offsetY = ev.nativeEvent.contentOffset.y;
                          const rawIndex = Math.round(offsetY / ITEM_HEIGHT);
                          const clampedIndex = Math.min(Math.max(rawIndex, 0), dayValues.length - 1);
                          setSelectedDay(DAY_MIN + clampedIndex);
                        }}
                        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * ((VISIBLE_ITEMS - 1) / 2) }}
                      >
                        {dayValues.map((item, index) => {
                          const inputRange = [
                            (index - 1) * ITEM_HEIGHT,
                            index * ITEM_HEIGHT,
                            (index + 1) * ITEM_HEIGHT,
                          ];
                          const opacity = dayScrollY.interpolate({
                            inputRange,
                            outputRange: [0.25, 1, 0.25],
                            extrapolate: 'clamp',
                          });
                          const scale = dayScrollY.interpolate({
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
              <Text style={styles.timeSeparator}>/</Text>

              {/* Seletor de Mês */}
              <View style={styles.timeCard}>
                <View style={styles.timeCardHeader}>
                  <Text style={styles.timeCardHeaderText}>Mês</Text>
                  <Text style={styles.timeCardHeaderValue}>{getMonthName(selectedMonth)}</Text>
                </View>
                <View style={styles.timeCardBody}>
                  <View style={styles.pickerRow}>
                    <View style={[styles.wheelContainer, { height: ITEM_HEIGHT * VISIBLE_ITEMS }]}>
                      <Animated.ScrollView
                        ref={monthScrollRef}
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
                          [{ nativeEvent: { contentOffset: { y: monthScrollY } } }],
                          { useNativeDriver: true }
                        )}
                        onMomentumScrollEnd={(ev) => {
                          const offsetY = ev.nativeEvent.contentOffset.y;
                          const rawIndex = Math.round(offsetY / ITEM_HEIGHT);
                          const clampedIndex = Math.min(Math.max(rawIndex, 0), monthValues.length - 1);
                          setSelectedMonth(MONTH_MIN + clampedIndex);
                        }}
                        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * ((VISIBLE_ITEMS - 1) / 2) }}
                      >
                        {monthValues.map((item, index) => {
                          const inputRange = [
                            (index - 1) * ITEM_HEIGHT,
                            index * ITEM_HEIGHT,
                            (index + 1) * ITEM_HEIGHT,
                          ];
                          const opacity = monthScrollY.interpolate({
                            inputRange,
                            outputRange: [0.25, 1, 0.25],
                            extrapolate: 'clamp',
                          });
                          const scale = monthScrollY.interpolate({
                            inputRange,
                            outputRange: [0.9, 1.6, 0.9],
                            extrapolate: 'clamp',
                          });
                          return (
                            <View key={item} style={{ height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' }}>
                              <Animated.Text style={[styles.wheelItemText, { opacity, transform: [{ scale }] }]}>
                                {getMonthName(item)}
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
              <Text style={styles.timeSeparator}>/</Text>

              {/* Seletor de Ano */}
              <View style={styles.timeCard}>
                <View style={styles.timeCardHeader}>
                  <Text style={styles.timeCardHeaderText}>Ano</Text>
                  <Text style={styles.timeCardHeaderValue}>{selectedYear}</Text>
                </View>
                <View style={styles.timeCardBody}>
                  <View style={styles.pickerRow}>
                    <View style={[styles.wheelContainer, { height: ITEM_HEIGHT * VISIBLE_ITEMS }]}>
                      <Animated.ScrollView
                        ref={yearScrollRef}
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
                          [{ nativeEvent: { contentOffset: { y: yearScrollY } } }],
                          { useNativeDriver: true }
                        )}
                        onMomentumScrollEnd={(ev) => {
                          const offsetY = ev.nativeEvent.contentOffset.y;
                          const rawIndex = Math.round(offsetY / ITEM_HEIGHT);
                          const clampedIndex = Math.min(Math.max(rawIndex, 0), yearValues.length - 1);
                          setSelectedYear(YEAR_MIN + clampedIndex);
                        }}
                        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * ((VISIBLE_ITEMS - 1) / 2) }}
                      >
                        {yearValues.map((item, index) => {
                          const inputRange = [
                            (index - 1) * ITEM_HEIGHT,
                            index * ITEM_HEIGHT,
                            (index + 1) * ITEM_HEIGHT,
                          ];
                          const opacity = yearScrollY.interpolate({
                            inputRange,
                            outputRange: [0.25, 1, 0.25],
                            extrapolate: 'clamp',
                          });
                          const scale = yearScrollY.interpolate({
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




