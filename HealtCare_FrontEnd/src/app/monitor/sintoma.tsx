import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
  Animated,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { API_CONFIG, ENDPOINTS } from '@/constants/api';

interface Sintoma {
  id?: number;
  nome_doenca: string;
  tipo_doenca: string;
  descricao_sintoma: string;
  intensidade: 'Leve' | 'Moderada' | 'Intensa';
  data_hora_inicio: string;
  data_diagnostico: string;
  data_inicio_sintomas: string;
  data_cura: string;
  observacoes: string;
}

export default function SintomaScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sintoma, setSintoma] = useState<Sintoma>({
    nome_doenca: '',
    tipo_doenca: '',
    descricao_sintoma: '',
    intensidade: 'Leve',
    data_hora_inicio: '',
    data_diagnostico: '',
    data_inicio_sintomas: '',
    data_cura: '',
    observacoes: '',
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  
  // Estados para seletores de data - Formato pt-BR (exibição) e ISO (armazenamento)
  const [dataDiagnosticoBR, setDataDiagnosticoBR] = useState('');
  const [dataDiagnosticoISO, setDataDiagnosticoISO] = useState('');
  const [dataInicioSintomasBR, setDataInicioSintomasBR] = useState('');
  const [dataInicioSintomasISO, setDataInicioSintomasISO] = useState('');
  const [dataCuraBR, setDataCuraBR] = useState('');
  const [dataCuraISO, setDataCuraISO] = useState('');
  
  // Estados para calendário customizado (funciona na WEB)
  const [showDataHoraInicioModal, setShowDataHoraInicioModal] = useState(false);
  const [showDataDiagnosticoModal, setShowDataDiagnosticoModal] = useState(false);
  const [showDataInicioSintomasModal, setShowDataInicioSintomasModal] = useState(false);
  const [showDataCuraModal, setShowDataCuraModal] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date());
  const [selectedDataHoraInicio, setSelectedDataHoraInicio] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [activeCalendarField, setActiveCalendarField] = useState<'diagnostico' | 'inicio_sintomas' | 'cura' | 'data_hora_inicio' | null>(null);
  
  // Animação para alerta de intensidade intensa
  const pulseAnim = useMemo(() => new Animated.Value(1), []);


  // Animação de pulso para alerta de intensidade intensa
  useEffect(() => {
    if (sintoma.intensidade === 'Intensa') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [sintoma.intensidade]);

  const intensidadeOptions = [
    { 
      value: 'Leve' as const, 
      label: 'Leve', 
      color: '#4CAF50',
      bgColor: '#E8F5E9',
      icon: 'check-circle' as const,
    },
    { 
      value: 'Moderada' as const, 
      label: 'Moderada', 
      color: '#FF9800',
      bgColor: '#FFF3E0',
      icon: 'alert-circle' as const,
    },
    { 
      value: 'Intensa' as const, 
      label: 'Intensa', 
      color: '#F44336',
      bgColor: '#FFEBEE',
      icon: 'alert-triangle' as const,
    }
  ];

  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'nome_doenca':
        if (!value || value.trim().length < 2) {
          return 'Nome da doença deve ter pelo menos 2 caracteres';
        }
        break;
      case 'tipo_doenca':
        if (!value || value.trim().length < 2) {
          return 'Tipo da doença deve ter pelo menos 2 caracteres';
        }
        break;
      case 'descricao_sintoma':
        if (!value || value.trim().length < 3) {
          return 'Descrição deve ter pelo menos 3 caracteres';
        }
        break;
      case 'intensidade':
        if (!value || !['Leve', 'Moderada', 'Intensa'].includes(value)) {
          return 'Selecione uma intensidade';
        }
        break;
      case 'data_hora_inicio':
        if (!value) {
          return 'Selecione data e hora de início';
        }
        break;
      case 'data_diagnostico':
        // Campo opcional, mas se preenchido deve ser válido
        if (value && dataDiagnosticoISO) {
          const data = new Date(dataDiagnosticoISO);
          if (isNaN(data.getTime())) {
            return 'Data de diagnóstico inválida';
          }
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          if (data > today) {
            return 'Data de diagnóstico não pode ser no futuro';
          }
        }
        break;
      case 'data_inicio_sintomas':
        // Campo opcional, mas se preenchido deve ser válido
        if (value && dataInicioSintomasISO) {
          const data = new Date(dataInicioSintomasISO);
          if (isNaN(data.getTime())) {
            return 'Data de início dos sintomas inválida';
          }
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          if (data > today) {
            return 'Data de início dos sintomas não pode ser no futuro';
          }
          // Validar: data_inicio_sintomas não pode ser posterior a data_diagnostico
          if (dataDiagnosticoISO) {
            const dataDiagnostico = new Date(dataDiagnosticoISO);
            if (data > dataDiagnostico) {
              return 'Data de início dos sintomas não pode ser posterior à data de diagnóstico';
            }
          }
        }
        break;
      case 'data_cura':
        // Campo opcional, mas se preenchido deve ser válido
        if (value && dataCuraISO) {
          const data = new Date(dataCuraISO);
          if (isNaN(data.getTime())) {
            return 'Data de cura inválida';
          }
          const today = new Date();
          today.setHours(23, 59, 59, 999);
          if (data > today) {
            return 'Data de cura não pode ser no futuro';
          }
          // Validar: data_cura não pode ser anterior a data_diagnostico
          if (dataDiagnosticoISO) {
            const dataDiagnostico = new Date(dataDiagnosticoISO);
            if (data < dataDiagnostico) {
              return 'Data de cura não pode ser anterior à data de diagnóstico';
            }
          }
        }
        break;
    }
    return '';
  };

  const isFormValid = useMemo(() => {
    return (
      sintoma.nome_doenca.trim().length >= 2 &&
      sintoma.tipo_doenca.trim().length >= 2 &&
      sintoma.descricao_sintoma.trim().length >= 3 &&
      ['Leve', 'Moderada', 'Intensa'].includes(sintoma.intensidade) &&
      sintoma.data_hora_inicio.length > 0
    );
  }, [sintoma]);

  const handleFieldChange = (field: string, value: any) => {
    setSintoma(prev => ({ ...prev, [field]: value }));
    
    // Validar campo em tempo real
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
    
    // Marcar como tocado
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Funções do calendário customizado (padrão Medicamentos)
  const showDataHoraInicioPicker = () => {
    if (sintoma.data_hora_inicio) {
      const date = new Date(sintoma.data_hora_inicio);
      setSelectedCalendarDate(date);
      setSelectedDataHoraInicio(date);
      setCurrentMonth(date.getMonth());
      setCurrentYear(date.getFullYear());
    }
    setActiveCalendarField('data_hora_inicio');
    setShowDataHoraInicioModal(true);
  };

  const showDataDiagnosticoPicker = () => {
    if (dataDiagnosticoISO) {
      const date = new Date(dataDiagnosticoISO);
      setSelectedCalendarDate(date);
      setCurrentMonth(date.getMonth());
      setCurrentYear(date.getFullYear());
    }
    setActiveCalendarField('diagnostico');
    setShowDataDiagnosticoModal(true);
  };

  const showDataInicioSintomasPicker = () => {
    if (dataInicioSintomasISO) {
      const date = new Date(dataInicioSintomasISO);
      setSelectedCalendarDate(date);
      setCurrentMonth(date.getMonth());
      setCurrentYear(date.getFullYear());
    }
    setActiveCalendarField('inicio_sintomas');
    setShowDataInicioSintomasModal(true);
  };

  const showDataCuraPicker = () => {
    if (dataCuraISO) {
      const date = new Date(dataCuraISO);
      setSelectedCalendarDate(date);
      setCurrentMonth(date.getMonth());
      setCurrentYear(date.getFullYear());
    }
    setActiveCalendarField('cura');
    setShowDataCuraModal(true);
  };

  const confirmDateTimeSelection = () => {
    if (activeCalendarField === 'data_hora_inicio') {
      // Combinar data selecionada no calendário com hora selecionada
      const selectedDate = new Date(selectedCalendarDate);
      selectedDate.setHours(selectedDataHoraInicio.getHours());
      selectedDate.setMinutes(selectedDataHoraInicio.getMinutes());
      selectedDate.setSeconds(0);
      selectedDate.setMilliseconds(0);
      
      // Validar que a data/hora não seja no futuro
      const now = new Date();
      if (selectedDate > now) {
        Alert.alert('Data inválida', 'A data e hora não podem ser no futuro.');
        return;
      }
      
      const isoString = selectedDate.toISOString();
      handleFieldChange('data_hora_inicio', isoString);
      setShowDataHoraInicioModal(false);
    } else if (activeCalendarField === 'diagnostico') {
      const selectedDate = selectedCalendarDate;
      
      // Validar que a data não seja no futuro
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (selectedDate > today) {
        Alert.alert('Data inválida', 'A data não pode ser no futuro.');
        return;
      }
      
      const dataFormatada = selectedDate.toLocaleDateString('pt-BR');
      const dataISO = selectedDate.toISOString().split('T')[0];
      
      setDataDiagnosticoBR(dataFormatada);
      setDataDiagnosticoISO(dataISO);
      handleFieldChange('data_diagnostico', dataISO);
      setShowDataDiagnosticoModal(false);
      
      // Revalidar outras datas se existirem
      if (dataCuraISO) {
        const dataCura = new Date(dataCuraISO);
        if (dataCura < selectedDate) {
          setErrors(prev => ({
            ...prev,
            data_cura: 'Data de cura não pode ser anterior à data de diagnóstico'
          }));
        }
      }
      if (dataInicioSintomasISO) {
        const dataInicio = new Date(dataInicioSintomasISO);
        if (dataInicio > selectedDate) {
          setErrors(prev => ({
            ...prev,
            data_inicio_sintomas: 'Data de início dos sintomas não pode ser posterior à data de diagnóstico'
          }));
        }
      }
    } else if (activeCalendarField === 'inicio_sintomas') {
      const selectedDate = selectedCalendarDate;
      
      // Validar que a data não seja no futuro
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (selectedDate > today) {
        Alert.alert('Data inválida', 'A data não pode ser no futuro.');
        return;
      }
      
      // Validar: data_inicio_sintomas não pode ser posterior a data_diagnostico
      if (dataDiagnosticoISO) {
        const dataDiagnostico = new Date(dataDiagnosticoISO);
        if (selectedDate > dataDiagnostico) {
          Alert.alert('Data inválida', 'Data de início dos sintomas não pode ser posterior à data de diagnóstico.');
          return;
        }
      }
      
      const dataFormatada = selectedDate.toLocaleDateString('pt-BR');
      const dataISO = selectedDate.toISOString().split('T')[0];
      
      setDataInicioSintomasBR(dataFormatada);
      setDataInicioSintomasISO(dataISO);
      handleFieldChange('data_inicio_sintomas', dataISO);
      setShowDataInicioSintomasModal(false);
    } else if (activeCalendarField === 'cura') {
      const selectedDate = selectedCalendarDate;
      
      // Validar que a data não seja no futuro
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (selectedDate > today) {
        Alert.alert('Data inválida', 'A data não pode ser no futuro.');
        return;
      }
      
      // Validar: data_cura não pode ser anterior a data_diagnostico
      if (dataDiagnosticoISO) {
        const dataDiagnostico = new Date(dataDiagnosticoISO);
        if (selectedDate < dataDiagnostico) {
          Alert.alert('Data inválida', 'Data de cura não pode ser anterior à data de diagnóstico.');
          return;
        }
      }
      
      const dataFormatada = selectedDate.toLocaleDateString('pt-BR');
      const dataISO = selectedDate.toISOString().split('T')[0];
      
      setDataCuraBR(dataFormatada);
      setDataCuraISO(dataISO);
      handleFieldChange('data_cura', dataISO);
      setShowDataCuraModal(false);
    }
    
    setActiveCalendarField(null);
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const isToday = (day: number, month: number, year: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const isSelected = (day: number, month: number, year: number) => {
    const selected = selectedCalendarDate;
    return (
      day === selected.getDate() &&
      month === selected.getMonth() &&
      year === selected.getFullYear()
    );
  };

  const handleDayPress = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    
    if (activeCalendarField === 'data_hora_inicio') {
      // Manter a hora já selecionada
      newDate.setHours(selectedDataHoraInicio.getHours());
      newDate.setMinutes(selectedDataHoraInicio.getMinutes());
    }
    
    // Validar que a data não seja no futuro
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (newDate > today) {
      Alert.alert('Data inválida', 'A data não pode ser no futuro.');
      return;
    }
    
    setSelectedCalendarDate(newDate);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    // Adicionar dias vazios no início
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Adicionar os dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return (
      <View style={styles.calendarContainer}>
        {/* Header do Calendário */}
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => navigateMonth('prev')} style={styles.calendarNavButton}>
            <Feather name="chevron-left" size={24} color="#004A61" />
          </TouchableOpacity>
          <Text style={styles.calendarMonthText}>
            {monthNames[currentMonth]} {currentYear}
          </Text>
          <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.calendarNavButton}>
            <Feather name="chevron-right" size={24} color="#004A61" />
          </TouchableOpacity>
        </View>

        {/* Dias da semana */}
        <View style={styles.weekDaysContainer}>
          {weekDays.map((day, index) => (
            <View key={index} style={styles.weekDay}>
              <Text style={styles.weekDayText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Dias do mês */}
        <View style={styles.daysContainer}>
          {days.map((day, index) => {
            if (day === null) {
              return <View key={index} style={styles.dayCell} />;
            }
            const isTodayDate = isToday(day, currentMonth, currentYear);
            const isSelectedDate = isSelected(day, currentMonth, currentYear);
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  isTodayDate && styles.todayCell,
                  isSelectedDate && styles.selectedDayCell
                ]}
                onPress={() => handleDayPress(day)}
              >
                <Text style={[
                  styles.dayText,
                  isTodayDate && styles.todayText,
                  isSelectedDate && styles.selectedDayText
                ]}>
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const formatDateTime = (isoString: string): string => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      
      const dateStr = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const timeStr = date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      return `${dateStr} às ${timeStr}`;
    } catch {
      return isoString;
    }
  };

  const handleSaveSintoma = async () => {
    // Validar todos os campos
    const newErrors: {[key: string]: string} = {};
    Object.keys(sintoma).forEach(field => {
      const error = validateField(field, sintoma[field as keyof Sintoma]);
      if (error) {
        newErrors[field] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Object.keys(newErrors).forEach(field => {
        setTouched(prev => ({ ...prev, [field]: true }));
      });
      Alert.alert('Campos obrigatórios', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      if (!token) {
        Alert.alert('Erro de Autenticação', 'Você não está logado.');
        setLoading(false);
        return;
      }

      const profileId = await AsyncStorage.getItem('active_profile_id');
      if (!profileId) {
        Alert.alert('Erro', 'Nenhum perfil ativo encontrado.');
        setLoading(false);
        return;
      }

      const perfilIdParsed = parseInt(profileId);

      // Primeiro, criar a doença
      const doencaPayload: any = {
        nome_doenca: sintoma.nome_doenca.trim(),
        tipo_doenca: sintoma.tipo_doenca.trim(),
        perfil_id: perfilIdParsed
      };

      // Adicionar campos opcionais se preenchidos
      if (dataDiagnosticoISO) {
        doencaPayload.data_diagnostico = dataDiagnosticoISO;
      }
      if (dataInicioSintomasISO) {
        doencaPayload.data_inicio_sintomas = dataInicioSintomasISO;
      }
      if (dataCuraISO) {
        doencaPayload.data_cura = dataCuraISO;
      }
      if (sintoma.observacoes && sintoma.observacoes.trim()) {
        doencaPayload.observacoes = sintoma.observacoes.trim();
      }

      const doencaResponse = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.DOENCA_RECORDS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(doencaPayload)
      });

      const doencaResult = await doencaResponse.json();

      if (!doencaResponse.ok) {
        throw new Error(doencaResult.message || `Erro ao criar doença. Status: ${doencaResponse.status}`);
      }

      // Obter o ID da doença criada
      const doencaId = doencaResult.data.id;

      // Agora, criar o sintoma associado à doença
      const sintomaData = {
        descricao_sintoma: sintoma.descricao_sintoma.trim(),
        intensidade: sintoma.intensidade,
        data_hora_inicio: sintoma.data_hora_inicio,
        perfil_id: perfilIdParsed
      };

      const sintomaResponse = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.DOENCA_RECORDS}/${doencaId}/symptoms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(sintomaData)
      });

      const sintomaResult = await sintomaResponse.json();

      if (!sintomaResponse.ok) {
        throw new Error(sintomaResult.message || `Erro ao salvar sintoma. Status: ${sintomaResponse.status}`);
      }

      Alert.alert('Sucesso!', 'Sintoma registrado com sucesso!');
      router.back();
    } catch (error: any) {
      console.error('Erro ao salvar sintoma:', error);
      Alert.alert('Erro', error.message || 'Não foi possível salvar o sintoma.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#004A61" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Sintoma</Text>
            <Text style={styles.headerSubtitle}>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>
        {/* Formulário */}
        <View style={styles.form}>
          {/* Campo de Doença */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Doença <Text style={styles.required}>*</Text>
              </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.inputText,
                  errors.nome_doenca && touched.nome_doenca && styles.inputError
                ]}
                value={sintoma.nome_doenca}
                onChangeText={(text) => handleFieldChange('nome_doenca', text)}
                onBlur={() => setTouched(prev => ({ ...prev, nome_doenca: true }))}
                placeholder="Digite o nome da doença"
                placeholderTextColor="#999"
              />
                </View>
            {errors.nome_doenca && touched.nome_doenca && (
              <Text style={styles.errorText}>{errors.nome_doenca}</Text>
            )}
                </View>

          {/* Campo de Tipo da Doença */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>
              Tipo da Doença <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                        style={[
                  styles.input,
                  styles.inputText,
                  errors.tipo_doenca && touched.tipo_doenca && styles.inputError
                ]}
                value={sintoma.tipo_doenca}
                onChangeText={(text) => handleFieldChange('tipo_doenca', text)}
                onBlur={() => setTouched(prev => ({ ...prev, tipo_doenca: true }))}
                placeholder="Digite o tipo da doença (ex: Viral, Bacteriana, Crônica...)"
                placeholderTextColor="#999"
                          />
                        </View>
            {errors.tipo_doenca && touched.tipo_doenca && (
              <Text style={styles.errorText}>{errors.tipo_doenca}</Text>
              )}
            </View>

            {/* Descrição do Sintoma */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Descrição do Sintoma <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    errors.descricao_sintoma && touched.descricao_sintoma && styles.inputError
                  ]}
                value={sintoma.descricao_sintoma}
                  onChangeText={(text) => handleFieldChange('descricao_sintoma', text)}
                  onBlur={() => setTouched(prev => ({ ...prev, descricao_sintoma: true }))}
                  placeholder="Ex: Dor de cabeça, febre, náusea..."
                  placeholderTextColor="#A4A4A4"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
              {errors.descricao_sintoma && touched.descricao_sintoma && (
                <Text style={styles.errorText}>{errors.descricao_sintoma}</Text>
              )}
            </View>

            {/* Intensidade */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Intensidade <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.intensidadeContainer}>
                {intensidadeOptions.map((option) => {
                const isSelected = sintoma.intensidade === option.value;
                  const isIntensa = option.value === 'Intensa';
                  
                  return (
                    <Animated.View
                      key={option.value}
                      style={[
                        { transform: isIntensa && isSelected ? [{ scale: pulseAnim }] : [] }
                      ]}
                    >
                      <TouchableOpacity
                        style={[
                          styles.intensidadeCard,
                          isSelected && styles.intensidadeCardSelected,
                          { 
                            borderColor: option.color,
                            backgroundColor: isSelected ? option.bgColor : '#FFFFFF'
                          }
                        ]}
                        onPress={() => handleFieldChange('intensidade', option.value)}
                      >
                        <View style={[
                          styles.intensidadeIconContainer,
                          { backgroundColor: isSelected ? option.color + '20' : 'transparent' }
                        ]}>
                          <Feather 
                            name={option.icon} 
                            size={24} 
                            color={isSelected ? option.color : '#A4A4A4'} 
                          />
                        </View>
                        <Text style={[
                          styles.intensidadeLabel,
                          { color: isSelected ? option.color : '#707070' }
                        ]}>
                          {option.label}
                        </Text>
                        {isSelected && (
                          <View style={[styles.intensidadeCheck, { backgroundColor: option.color }]}>
                            <Feather name="check" size={14} color="#FFFFFF" />
                          </View>
                        )}
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </View>
            {sintoma.intensidade === 'Intensa' && (
                <View style={styles.intenseAlert}>
                  <Feather name="alert-triangle" size={16} color="#F44336" />
                  <Text style={styles.intenseAlertText}>
                    Intensidade intensa detectada. Considere buscar atendimento médico.
                  </Text>
                </View>
              )}
              {errors.intensidade && touched.intensidade && (
                <Text style={styles.errorText}>{errors.intensidade}</Text>
              )}
            </View>

            {/* Data e Hora de Início */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Data e Hora de Início <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.dateTimeInput,
                  errors.data_hora_inicio && touched.data_hora_inicio && styles.inputError
                ]}
              onPress={showDataHoraInicioPicker}
              >
                <View style={styles.dateTimeInputContent}>
                  <Feather name="calendar" size={20} color="#3B7CA6" />
                  <Text style={[
                    styles.dateTimeInputText,
                  !sintoma.data_hora_inicio && styles.dateTimeInputTextPlaceholder
                  ]}>
                  {sintoma.data_hora_inicio 
                    ? formatDateTime(sintoma.data_hora_inicio)
                      : 'Selecione data e hora'}
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color="#A4A4A4" />
              </TouchableOpacity>
              {errors.data_hora_inicio && touched.data_hora_inicio && (
                <Text style={styles.errorText}>{errors.data_hora_inicio}</Text>
              )}
            </View>

            {/* Data de Diagnóstico */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Data de Diagnóstico
              </Text>
              <TouchableOpacity
                style={[
                  styles.dateInputButton,
                  !dataDiagnosticoBR && styles.dateInputButtonPlaceholder,
                  errors.data_diagnostico && touched.data_diagnostico && styles.inputError
                ]}
                onPress={showDataDiagnosticoPicker}
              >
                <Text style={[
                  styles.dateInputButtonText,
                  !dataDiagnosticoBR && styles.dateInputButtonTextPlaceholder
                ]}>
                  {dataDiagnosticoBR || 'Selecione a data de diagnóstico'}
                </Text>
                <Feather name="chevron-down" size={20} color={dataDiagnosticoBR ? "#004A61" : "#999"} />
                    </TouchableOpacity>
              {errors.data_diagnostico && touched.data_diagnostico && (
                <Text style={styles.errorText}>{errors.data_diagnostico}</Text>
              )}
            </View>

            {/* Data de Início dos Sintomas */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Data de Início dos Sintomas
              </Text>
              <TouchableOpacity
                style={[
                  styles.dateInputButton,
                  !dataInicioSintomasBR && styles.dateInputButtonPlaceholder,
                  errors.data_inicio_sintomas && touched.data_inicio_sintomas && styles.inputError
                ]}
                onPress={showDataInicioSintomasPicker}
              >
                <Text style={[
                  styles.dateInputButtonText,
                  !dataInicioSintomasBR && styles.dateInputButtonTextPlaceholder
                ]}>
                  {dataInicioSintomasBR || 'Selecione a data de início dos sintomas'}
                </Text>
                <Feather name="chevron-down" size={20} color={dataInicioSintomasBR ? "#004A61" : "#999"} />
                    </TouchableOpacity>
              {errors.data_inicio_sintomas && touched.data_inicio_sintomas && (
                <Text style={styles.errorText}>{errors.data_inicio_sintomas}</Text>
              )}
                  </View>

            {/* Data de Cura */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Data de Cura
              </Text>
              <TouchableOpacity
                style={[
                  styles.dateInputButton,
                  !dataCuraBR && styles.dateInputButtonPlaceholder,
                  errors.data_cura && touched.data_cura && styles.inputError
                ]}
                onPress={showDataCuraPicker}
              >
                <Text style={[
                  styles.dateInputButtonText,
                  !dataCuraBR && styles.dateInputButtonTextPlaceholder
                ]}>
                  {dataCuraBR || 'Selecione a data de cura'}
                </Text>
                <Feather name="chevron-down" size={20} color={dataCuraBR ? "#004A61" : "#999"} />
              </TouchableOpacity>
              {errors.data_cura && touched.data_cura && (
                <Text style={styles.errorText}>{errors.data_cura}</Text>
              )}
            </View>

            {/* Observações */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Observações
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    errors.observacoes && touched.observacoes && styles.inputError
                  ]}
                  value={sintoma.observacoes}
                  onChangeText={(text) => handleFieldChange('observacoes', text)}
                  onBlur={() => setTouched(prev => ({ ...prev, observacoes: true }))}
                  placeholder="Informações adicionais sobre a doença..."
                  placeholderTextColor="#A4A4A4"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
              {errors.observacoes && touched.observacoes && (
                <Text style={styles.errorText}>{errors.observacoes}</Text>
              )}
            </View>
            </View>

        {/* Botão Salvar */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            !isFormValid && styles.saveButtonDisabled
          ]}
          onPress={handleSaveSintoma}
          disabled={!isFormValid || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Salvar</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de Seleção de Data e Hora de Início - Calendário Customizado (funciona na WEB) */}
      <Modal
        visible={showDataHoraInicioModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDataHoraInicioModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione a Data e Hora de Início</Text>
              <TouchableOpacity
                onPress={() => setShowDataHoraInicioModal(false)}
                style={styles.modalCloseButton}
              >
                <Feather name="x" size={24} color="#666" />
            </TouchableOpacity>
          </View>

            <ScrollView style={styles.calendarModalContent} showsVerticalScrollIndicator={false}>
              {/* Calendário */}
              {renderCalendar()}
              
              {/* Seletor de Hora */}
              <View style={styles.timePickerContainer}>
                <Text style={styles.timePickerLabel}>Selecione a hora:</Text>
                <View style={styles.timePickerWrapper}>
                  <DateTimePicker
                    value={selectedDataHoraInicio}
                    mode="time"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, date) => {
                      if (event.type === 'set' && date) {
                        setSelectedDataHoraInicio(date);
                        // Atualizar também a data do calendário com a hora selecionada
                        const newDate = new Date(selectedCalendarDate);
                        newDate.setHours(date.getHours());
                        newDate.setMinutes(date.getMinutes());
                        setSelectedCalendarDate(newDate);
                      }
                    }}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowDataHoraInicioModal(false);
                  setActiveCalendarField(null);
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={confirmDateTimeSelection}
              >
                <Text style={styles.modalConfirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Seleção de Data de Diagnóstico */}
      <Modal
        visible={showDataDiagnosticoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowDataDiagnosticoModal(false);
          setActiveCalendarField(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione a Data de Diagnóstico</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowDataDiagnosticoModal(false);
                  setActiveCalendarField(null);
                }}
                style={styles.modalCloseButton}
              >
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarModalContent}>
              {renderCalendar()}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowDataDiagnosticoModal(false);
                  setActiveCalendarField(null);
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={confirmDateTimeSelection}
              >
                <Text style={styles.modalConfirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Seleção de Data de Início dos Sintomas */}
      <Modal
        visible={showDataInicioSintomasModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowDataInicioSintomasModal(false);
          setActiveCalendarField(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione a Data de Início dos Sintomas</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowDataInicioSintomasModal(false);
                  setActiveCalendarField(null);
                }}
                style={styles.modalCloseButton}
              >
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarModalContent}>
              {renderCalendar()}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowDataInicioSintomasModal(false);
                  setActiveCalendarField(null);
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={confirmDateTimeSelection}
              >
                <Text style={styles.modalConfirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Seleção de Data de Cura */}
      <Modal
        visible={showDataCuraModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowDataCuraModal(false);
          setActiveCalendarField(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione a Data de Cura</Text>
              <TouchableOpacity
                onPress={() => {
                  setShowDataCuraModal(false);
                  setActiveCalendarField(null);
                }}
                style={styles.modalCloseButton}
              >
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarModalContent}>
              {renderCalendar()}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setShowDataCuraModal(false);
                  setActiveCalendarField(null);
                }}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={confirmDateTimeSelection}
              >
                <Text style={styles.modalConfirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
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
  form: {
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#004A61',
    marginBottom: 8,
  },
  required: {
    color: '#FF4444',
    fontWeight: 'bold',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  inputText: {
    minHeight: 50,
  },
  inputError: {
    borderColor: '#FF4444',
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  intensidadeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  intensidadeCard: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
    minHeight: 120,
    justifyContent: 'center',
  },
  intensidadeCardSelected: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  intensidadeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  intensidadeLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  intensidadeCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intenseAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  intenseAlertText: {
    flex: 1,
    fontSize: 13,
    color: '#F44336',
    lineHeight: 18,
  },
  dateTimeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
  },
  dateTimeInputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  dateTimeInputText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dateTimeInputTextPlaceholder: {
    color: '#999',
    fontWeight: '400',
  },
  // Estilos para campos de data (sem hora)
  dateInputButton: {
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
  dateInputButtonPlaceholder: {
    borderColor: '#E0E0E0',
  },
  dateInputButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  dateInputButtonTextPlaceholder: {
    color: '#999',
    fontWeight: '400',
  },
  // Estilos do Modal e Calendário Customizado (padrão Medicamentos)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calendarModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    width: '90%',
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  calendarModalContent: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004A61',
  },
  modalCloseButton: {
    padding: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingVertical: 12,
    marginRight: 10,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 1,
    backgroundColor: '#004A61',
    borderRadius: 10,
    paddingVertical: 12,
    marginLeft: 10,
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  calendarContainer: {
    width: '100%',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  calendarNavButton: {
    padding: 8,
  },
  calendarMonthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004A61',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekDay: {
    width: 40,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  dayText: {
    fontSize: 16,
    color: '#333',
  },
  todayCell: {
    backgroundColor: '#E8F4F8',
    borderRadius: 20,
  },
  todayText: {
    color: '#004A61',
    fontWeight: 'bold',
  },
  selectedDayCell: {
    backgroundColor: '#004A61',
    borderRadius: 20,
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  timePickerContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  timePickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#004A61',
    marginBottom: 12,
  },
  timePickerWrapper: {
    alignItems: 'center',
    marginTop: 10,
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
  saveButtonDisabled: {
    backgroundColor: '#A4A4A4',
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});



