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
  FlatList,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';

export default function NovaConsultaScreen() {
  const router = useRouter();
  const [especialidade, setEspecialidade] = useState('');
  const [endereco, setEndereco] = useState('');
  const [hora, setHora] = useState('');
  const [data, setData] = useState(new Date());
  const [nomeMedico, setNomeMedico] = useState('');
  const [descricao, setDescricao] = useState('');
  const [arquivosAnexados, setArquivosAnexados] = useState<DocumentPicker.DocumentResult[]>([]);
  const [showEspecialidadeModal, setShowEspecialidadeModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dataTexto, setDataTexto] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedHour, setSelectedHour] = useState(8);
  const [selectedMinute, setSelectedMinute] = useState(0);

  // Configurações dos seletores de hora
  const ITEM_HEIGHT = 44;
  const VISIBLE_ITEMS = 3;
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

  // Formatar data para exibição
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR');
  };

  // Parsear data do texto (DD/MM/YYYY)
  const parseDate = (text: string): Date | null => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length !== 8) return null;
    
    const day = parseInt(cleaned.slice(0, 2), 10);
    const month = parseInt(cleaned.slice(2, 4), 10) - 1; // month é 0-indexed
    const year = parseInt(cleaned.slice(4, 8), 10);
    
    if (day < 1 || day > 31 || month < 0 || month > 11 || year < 1900) {
      return null;
    }
    
    const parsedDate = new Date(year, month, day);
    // Verificar se a data é válida
    if (parsedDate.getDate() !== day || parsedDate.getMonth() !== month || parsedDate.getFullYear() !== year) {
      return null;
    }
    
    return parsedDate;
  };

  // Formatar data digitada (DD/MM/YYYY)
  const formatDataTexto = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    const limited = numbers.slice(0, 8);
    
    if (limited.length === 0) return '';
    if (limited.length <= 2) return limited;
    if (limited.length <= 4) return `${limited.slice(0, 2)}/${limited.slice(2, 4)}`;
    return `${limited.slice(0, 2)}/${limited.slice(2, 4)}/${limited.slice(4, 8)}`;
  };

  // Inicializar dataTexto quando o componente carrega
  useEffect(() => {
    setDataTexto(formatDate(data));
  }, []);

  // Centraliza valores iniciais ao abrir o modal de hora
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

  const handleDataTextoChange = (text: string) => {
    const formatted = formatDataTexto(text);
    setDataTexto(formatted);
    
    // Tentar parsear a data
    if (formatted.length === 10) {
      const parsed = parseDate(formatted);
      if (parsed) {
        setData(parsed);
      }
    }
  };

  // Validar e formatar hora (HH:mm)
  const formatHora = (text: string) => {
    // Normalizar separadores: substituir qualquer separador (:, ;, ., etc) por :
    let normalized = text.replace(/[;.,]/g, ':');
    
    // Remove tudo que não é número ou dois pontos
    const cleaned = normalized.replace(/[^0-9:]/g, '');
    
    // Se já tem dois pontos, manter apenas o primeiro e remover números extras
    if (cleaned.includes(':')) {
      const parts = cleaned.split(':');
      const hours = parts[0].slice(0, 2);
      const minutes = parts[1] ? parts[1].slice(0, 2) : '';
      if (minutes) {
        return `${hours}:${minutes}`;
      }
      return hours.length === 2 ? `${hours}:` : hours;
    }
    
    // Se não tem separador, formatar como números
    const numbers = cleaned.replace(/\D/g, '');
    const limited = numbers.slice(0, 4);
    
    // Formata como HH:mm
    if (limited.length === 0) return '';
    if (limited.length <= 2) return limited;
    return `${limited.slice(0, 2)}:${limited.slice(2, 4)}`;
  };

  const handleHoraChange = (text: string) => {
    const formatted = formatHora(text);
    setHora(formatted);
  };

  const openTimePicker = () => {
    // Inicializar com o horário atual se existir
    if (hora && hora.includes(':')) {
      const [h, m] = hora.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        setSelectedHour(h);
        const minuteRounded = Math.round(m / 5) * 5;
        setSelectedMinute(Math.min(55, Math.max(0, minuteRounded)));
      }
    }
    setShowTimePicker(true);
  };

  const confirmTimeSelection = () => {
    const timeString = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
    const horaNormalizada = timeString.replace(/[h;.,]/g, ':');
    setHora(horaNormalizada);
    setShowTimePicker(false);
  };

  const cancelTimeSelection = () => {
    setShowTimePicker(false);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (event.type === 'set' && selectedDate) {
      setData(selectedDate);
      setDataTexto(formatDate(selectedDate));
    } else if (event.type === 'dismissed') {
      setShowDatePicker(false);
    }
  };

  const handleSave = async () => {
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
    if (!dataTexto.trim() || dataTexto.length !== 10) {
      Alert.alert('Erro', 'Por favor, insira uma data válida no formato DD/MM/AAAA');
      return;
    }
    const parsedData = parseDate(dataTexto);
    if (!parsedData) {
      Alert.alert('Erro', 'Por favor, insira uma data válida no formato DD/MM/AAAA');
      return;
    }

    if (!nomeMedico.trim()) {
      Alert.alert('Erro', 'Por favor, insira o nome do médico');
      return;
    }

    setSaving(true);

    try {
      // Obter token e perfil_id
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      const profileId = await AsyncStorage.getItem('active_profile_id');

      if (!token) {
        setSaving(false);
        Alert.alert('Erro', 'Você precisa estar logado para criar uma consulta');
        return;
      }

      if (!profileId) {
        setSaving(false);
        Alert.alert('Erro', 'Nenhum perfil ativo encontrado. Por favor, selecione um perfil.');
        return;
      }

      // Normalizar o horário antes de processar (garantir que usa ":")
      const horaNormalizada = hora.replace(/[h;.,]/g, ':');
      // Combinar data e hora
      const [horas, minutos] = horaNormalizada.split(':').map(Number);
      const [day, month, year] = dataTexto.split('/').map(Number);
      
      // Criar data no timezone local sem conversão para UTC
      // Usar formato que preserve o horário local: YYYY-MM-DD HH:mm:ss
      const dataHoraFormatada = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:00`;
      
      console.log('🕐 [DEBUG Nova Consulta] Horário selecionado:', horaNormalizada);
      console.log('📅 [DEBUG Nova Consulta] Data selecionada:', dataTexto);
      console.log('🔧 [DEBUG Nova Consulta] Data/Hora formatada:', dataHoraFormatada);

      // Preparar dados para enviar ao backend
      const dadosConsulta = {
        perfil_id: parseInt(profileId),
        especialidade: especialidade.trim(),
        data_hora_consulta: dataHoraFormatada, // Formato local sem timezone
        nome_medico: nomeMedico.trim(),
        local: endereco.trim(),
        observacoes: descricao.trim() || null,
      };

      console.log('📤 [DEBUG Nova Consulta] Dados enviados:', dadosConsulta);

      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.CONSULTAS}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosConsulta),
      });

      const result = await response.json();
      console.log('📥 [DEBUG Nova Consulta] Resposta do servidor:', result);

      if (!response.ok) {
        if (response.status === 401) {
          setSaving(false);
          Alert.alert('Erro', 'Sessão expirada. Por favor, faça login novamente');
          return;
        }
        
        const errorMessage = result.message || 'Erro ao criar consulta. Tente novamente.';
        setSaving(false);
        Alert.alert('Erro', errorMessage);
        return;
      }

      if (result.success) {
        Alert.alert('Sucesso', 'Consulta agendada com sucesso!');
        router.back();
      } else {
        setSaving(false);
        Alert.alert('Erro', result.message || 'Erro ao criar consulta. Tente novamente.');
      }
    } catch (error: any) {
      console.error('Erro ao criar consulta:', error);
      setSaving(false);
      Alert.alert('Erro', 'Não foi possível criar a consulta. Verifique sua conexão e tente novamente.');
    }
  };

  const handleAttachFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        setArquivosAnexados(prev => [...prev, ...result.assets]);
        Alert.alert('Sucesso', `${result.assets.length} arquivo(s) anexado(s) com sucesso!`);
      }
    } catch (error) {
      console.error('Erro ao selecionar arquivo:', error);
      Alert.alert('Erro', 'Não foi possível anexar o arquivo. Tente novamente.');
    }
  };

  const removeFile = (index: number) => {
    setArquivosAnexados(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#004A61" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Nova consulta</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* Formulário */}
        <View style={styles.form}>
          {/* Especialidade */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Especialidade</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowEspecialidadeModal(true)}>
              <Text style={[styles.inputText, !especialidade && styles.placeholder]}>
                {especialidade || 'especialidade'}
              </Text>
              <Feather name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Endereço */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Endereço</Text>
            <TextInput
              style={styles.textInput}
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
              <Text style={[styles.inputText, !hora && styles.placeholder]}>
                {hora || 'HH:mm'}
              </Text>
              <Feather name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Data */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data</Text>
            <View style={styles.dataInputContainer}>
              <TextInput
                style={[styles.textInput, styles.dataInput]}
                value={dataTexto}
                onChangeText={handleDataTextoChange}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#999"
                keyboardType="numeric"
                maxLength={10}
              />
              <TouchableOpacity 
                style={styles.calendarButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Feather name="calendar" size={20} color="#004A61" />
              </TouchableOpacity>
            </View>
            {showDatePicker && (
              <DateTimePicker
                value={data}
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
              style={styles.textInput}
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
              style={[styles.textInput, styles.textArea]}
              value={descricao}
              onChangeText={setDescricao}
              placeholder="descrição"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Anexar arquivos */}
          <View style={styles.inputGroup}>
            <TouchableOpacity style={styles.attachButton} onPress={handleAttachFiles}>
              <Text style={styles.attachButtonText}>Anexar arquivos</Text>
            </TouchableOpacity>
          </View>

          {/* Lista de arquivos anexados */}
          {arquivosAnexados.length > 0 && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Arquivos anexados</Text>
              {arquivosAnexados.map((arquivo, index) => (
                <View key={index} style={styles.fileItem}>
                  <View style={styles.fileInfo}>
                    <Feather name="file" size={20} color="#004A61" />
                    <View style={styles.fileDetails}>
                      <Text style={styles.fileName} numberOfLines={1}>
                        {arquivo.name}
                      </Text>
                      <Text style={styles.fileSize}>
                        {formatFileSize(arquivo.size || 0)}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => removeFile(index)}
                  >
                    <Feather name="x" size={20} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
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

      {/* Modal de Especialidade */}
      <Modal
        visible={showEspecialidadeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEspecialidadeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione a especialidade</Text>
              <TouchableOpacity onPress={() => setShowEspecialidadeModal(false)}>
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={especialidades}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    especialidade === item && styles.modalItemSelected
                  ]}
                  onPress={() => {
                    setEspecialidade(item);
                    setShowEspecialidadeModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    especialidade === item && styles.modalItemTextSelected
                  ]}>
                    {item}
                  </Text>
                  {especialidade === item && (
                    <Feather name="check" size={20} color="#004A61" />
                  )}
                </TouchableOpacity>
              )}
            />
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
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
    color: '#333',
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
    paddingRight: 8,
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
  placeholder: {
    color: '#999',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  saveButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  attachButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    alignItems: 'flex-start',
  },
  attachButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#004A61',
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
  },
  removeButton: {
    padding: 4,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalItemSelected: {
    backgroundColor: '#F0F8FF',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  modalItemTextSelected: {
    color: '#004A61',
    fontWeight: '600',
  },
  // Estilos do Seletor de Hora
  timePickerModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
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
    marginHorizontal: 10,
  },
});
