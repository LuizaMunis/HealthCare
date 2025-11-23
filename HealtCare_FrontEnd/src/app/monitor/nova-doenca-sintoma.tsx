import React, { useState, useEffect, useMemo, useRef } from 'react';
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

interface DoencaData {
  nome_doenca: string;
  tipo_doenca: string;
  data_diagnostico: string;
  data_inicio_sintomas: string;
  data_cura: string;
  observacoes: string;
}

interface SintomaData {
  descricao_sintoma: string;
  intensidade: 'Leve' | 'Moderada' | 'Intensa';
  data_hora_inicio: string;
}

export default function NovaDoencaSintomaScreen() {
  const router = useRouter();
  
  // Estados da Doença
  const [doencaData, setDoencaData] = useState<DoencaData>({
    nome_doenca: '',
    tipo_doenca: '',
    data_diagnostico: '',
    data_inicio_sintomas: '',
    data_cura: '',
    observacoes: '',
  });
  
  // Estados do Sintoma
  const [sintomaData, setSintomaData] = useState<SintomaData>({
    descricao_sintoma: '',
    intensidade: 'Leve',
    data_hora_inicio: '',
  });
  
  // Estados de controle
  const [doencaId, setDoencaId] = useState<number | null>(null);
  const [doencaSalva, setDoencaSalva] = useState(false);
  const [loadingDoenca, setLoadingDoenca] = useState(false);
  const [loadingSintoma, setLoadingSintoma] = useState(false);
  
  // ✅ Estados de proteção contra double-click
  const [isSavingDoenca, setIsSavingDoenca] = useState(false);
  const [isSavingSintoma, setIsSavingSintoma] = useState(false);
  
  // Estados de validação - Doença
  const [errorsDoenca, setErrorsDoenca] = useState<{[key: string]: string}>({});
  const [touchedDoenca, setTouchedDoenca] = useState<{[key: string]: boolean}>({});
  
  // Estados de validação - Sintoma
  const [errorsSintoma, setErrorsSintoma] = useState<{[key: string]: string}>({});
  const [touchedSintoma, setTouchedSintoma] = useState<{[key: string]: boolean}>({});
  
  // Estados para seletores de data - Formato pt-BR (exibição) e ISO (armazenamento)
  const [dataDiagnosticoBR, setDataDiagnosticoBR] = useState('');
  const [dataDiagnosticoISO, setDataDiagnosticoISO] = useState('');
  const [dataInicioSintomasBR, setDataInicioSintomasBR] = useState('');
  const [dataInicioSintomasISO, setDataInicioSintomasISO] = useState('');
  const [dataCuraBR, setDataCuraBR] = useState('');
  const [dataCuraISO, setDataCuraISO] = useState('');
  
  // Estados para modais de calendário
  const [showDataDiagnosticoModal, setShowDataDiagnosticoModal] = useState(false);
  const [showDataInicioSintomasModal, setShowDataInicioSintomasModal] = useState(false);
  const [showDataCuraModal, setShowDataCuraModal] = useState(false);
  const [showDataHoraInicioModal, setShowDataHoraInicioModal] = useState(false);
  
  // Estados para calendário customizado
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [activeCalendarField, setActiveCalendarField] = useState<'diagnostico' | 'inicio_sintomas' | 'cura' | 'data_hora_inicio' | null>(null);
  
  // Estados para Data e Hora de Início (formato pt-BR para exibição e ISO para armazenamento)
  const [dataHoraInicioBR, setDataHoraInicioBR] = useState('');
  const [selectedDataHoraInicio, setSelectedDataHoraInicio] = useState(new Date());
  
  // Animação para alerta de intensidade intensa
  const pulseAnim = useMemo(() => new Animated.Value(1), []);
  
  // Prevenir saída sem salvar
  const hasUnsavedChanges = useRef(false);
  
  useEffect(() => {
    // ✅ Verificar se há dados realmente preenchidos
    const hasDoencaData = doencaData.nome_doenca.trim().length > 0 || 
                          doencaData.tipo_doenca.trim().length > 0 ||
                          dataDiagnosticoISO.length > 0 ||
                          dataInicioSintomasISO.length > 0 ||
                          dataCuraISO.length > 0 ||
                          doencaData.observacoes.trim().length > 0;
    
    const hasSintomaData = sintomaData.descricao_sintoma.trim().length > 0 ||
                           sintomaData.data_hora_inicio.length > 0;
    
    // Só marcar como alterações não salvas se houver dados preenchidos E não salvos
    hasUnsavedChanges.current = (hasDoencaData && !doencaSalva) || 
                                 (hasSintomaData && doencaSalva);
  }, [doencaSalva, doencaData, sintomaData, dataDiagnosticoISO, dataInicioSintomasISO, dataCuraISO]);

  // ✅ Sincronizar dataHoraInicioBR quando sintomaData.data_hora_inicio mudar
  useEffect(() => {
    if (sintomaData.data_hora_inicio) {
      try {
        const date = new Date(sintomaData.data_hora_inicio);
        if (!isNaN(date.getTime())) {
          const dataFormatada = date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
          const horaFormatada = date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          });
          setDataHoraInicioBR(`${dataFormatada} às ${horaFormatada}`);
        }
      } catch (error) {
        console.error('Erro ao formatar data e hora:', error);
      }
    }
  }, [sintomaData.data_hora_inicio]);
  
  // Animação de pulso para intensidade intensa
  useEffect(() => {
    if (sintomaData.intensidade === 'Intensa') {
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
  }, [sintomaData.intensidade]);
  
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
  
  // Validação - Doença
  const validateDoencaField = (field: string, value: string): string => {
    switch (field) {
      case 'nome_doenca':
        if (!value.trim()) {
          return 'Nome da doença é obrigatório';
        }
        if (value.trim().length < 2) {
          return 'Nome deve ter pelo menos 2 caracteres';
        }
        if (value.trim().length > 100) {
          return 'Nome deve ter no máximo 100 caracteres';
        }
        break;
      case 'tipo_doenca':
        if (!value.trim()) {
          return 'Tipo da doença é obrigatório';
        }
        if (value.trim().length < 2) {
          return 'Tipo deve ter pelo menos 2 caracteres';
        }
        break;
    }
    return '';
  };
  
  // Validação - Sintoma
  const validateSintomaField = (field: string, value: any): string => {
    switch (field) {
      case 'descricao_sintoma':
        if (!value || value.trim().length < 3) {
          return 'Descrição deve ter pelo menos 3 caracteres';
        }
        // ✅ VALIDAÇÃO DE MÁXIMO ADICIONADA
        if (value.trim().length > 45) {
          return 'Descrição deve ter no máximo 45 caracteres';
        }
        break;
      case 'intensidade':
        if (!value || !['Leve', 'Moderada', 'Intensa'].includes(value)) {
          return 'Selecione uma intensidade';
        }
        break;
      case 'data_hora_inicio':
        if (!value) {
          return 'Data e hora de início são obrigatórias';
        }
        break;
    }
    return '';
  };
  
  const handleDoencaFieldChange = (field: keyof DoencaData, value: string) => {
    setDoencaData(prev => {
      const newData = { ...prev, [field]: value };
      
      // ✅ VALIDAÇÃO LÓGICA DE DATAS (usando valores ISO)
      // Validar: data_cura não pode ser anterior a data_diagnostico
      if (field === 'data_cura' && dataCuraISO && dataDiagnosticoISO) {
        const dataCura = new Date(dataCuraISO);
        const dataDiagnostico = new Date(dataDiagnosticoISO);
        
        if (dataCura < dataDiagnostico) {
          setErrorsDoenca(prev => ({
            ...prev,
            data_cura: 'Data de cura não pode ser anterior à data de diagnóstico'
          }));
        } else {
          setErrorsDoenca(prev => {
            const { data_cura, ...rest } = prev;
            return rest;
          });
        }
      }
      
      // Validar: data_inicio_sintomas não pode ser posterior a data_diagnostico
      if (field === 'data_inicio_sintomas' && dataInicioSintomasISO && dataDiagnosticoISO) {
        const dataInicio = new Date(dataInicioSintomasISO);
        const dataDiagnostico = new Date(dataDiagnosticoISO);
        
        if (dataInicio > dataDiagnostico) {
          setErrorsDoenca(prev => ({
            ...prev,
            data_inicio_sintomas: 'Data de início dos sintomas não pode ser posterior à data de diagnóstico'
          }));
        } else {
          setErrorsDoenca(prev => {
            const { data_inicio_sintomas, ...rest } = prev;
            return rest;
          });
        }
      }
      
      // Validar também quando data_diagnostico muda
      if (field === 'data_diagnostico') {
        // Revalidar data_cura se existir
        if (dataCuraISO && dataDiagnosticoISO) {
          const dataCura = new Date(dataCuraISO);
          const dataDiagnostico = new Date(dataDiagnosticoISO);
          
          if (dataCura < dataDiagnostico) {
            setErrorsDoenca(prev => ({
              ...prev,
              data_cura: 'Data de cura não pode ser anterior à data de diagnóstico'
            }));
          } else {
            setErrorsDoenca(prev => {
              const { data_cura, ...rest } = prev;
              return rest;
            });
          }
        }
        
        // Revalidar data_inicio_sintomas se existir
        if (dataInicioSintomasISO && dataDiagnosticoISO) {
          const dataInicio = new Date(dataInicioSintomasISO);
          const dataDiagnostico = new Date(dataDiagnosticoISO);
          
          if (dataInicio > dataDiagnostico) {
            setErrorsDoenca(prev => ({
              ...prev,
              data_inicio_sintomas: 'Data de início dos sintomas não pode ser posterior à data de diagnóstico'
            }));
          } else {
            setErrorsDoenca(prev => {
              const { data_inicio_sintomas, ...rest } = prev;
              return rest;
            });
          }
        }
      }
      
      return newData;
    });
    
    // Validação em tempo real se campo foi tocado
    if (touchedDoenca[field]) {
      const error = validateDoencaField(field, value);
      setErrorsDoenca(prev => ({ ...prev, [field]: error }));
    }
  };
  
  const handleSintomaFieldChange = (field: keyof SintomaData, value: any) => {
    setSintomaData(prev => ({ ...prev, [field]: value }));
    
    if (touchedSintoma[field]) {
      const error = validateSintomaField(field, value);
      setErrorsSintoma(prev => ({ ...prev, [field]: error }));
    }
  };
  
  const formatDateToBR = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  const formatDateToISO = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  // ✅ FUNÇÕES DO CALENDÁRIO CUSTOMIZADO (Padrão Novo Medicamento)
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

  const showDataHoraInicioPicker = () => {
    if (sintomaData.data_hora_inicio) {
      const date = new Date(sintomaData.data_hora_inicio);
      setSelectedCalendarDate(date);
      setSelectedDataHoraInicio(date);
      setCurrentMonth(date.getMonth());
      setCurrentYear(date.getFullYear());
    }
    setActiveCalendarField('data_hora_inicio');
    setShowDataHoraInicioModal(true);
  };

  const confirmDateTimeSelection = () => {
    // Combinar data selecionada no calendário com hora selecionada
    const selectedDate = new Date(selectedCalendarDate);
    selectedDate.setHours(selectedDataHoraInicio.getHours());
    selectedDate.setMinutes(selectedDataHoraInicio.getMinutes());
    selectedDate.setSeconds(0);
    selectedDate.setMilliseconds(0);
    
    const dataFormatada = selectedDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const horaFormatada = selectedDate.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
    const dataHoraFormatada = `${dataFormatada} às ${horaFormatada}`;
    const isoString = selectedDate.toISOString();
    
    setDataHoraInicioBR(dataHoraFormatada);
    handleSintomaFieldChange('data_hora_inicio', isoString);
    setShowDataHoraInicioModal(false);
    setActiveCalendarField(null);
  };

  const confirmDateSelection = () => {
    const dataFormatada = selectedCalendarDate.toLocaleDateString('pt-BR');
    const dataISO = selectedCalendarDate.toISOString().split('T')[0];
    
    // ✅ VALIDAÇÃO LÓGICA DE DATAS
    if (activeCalendarField === 'cura' && dataDiagnosticoISO) {
      const dataCura = new Date(dataISO);
      const dataDiagnostico = new Date(dataDiagnosticoISO);
      if (dataCura < dataDiagnostico) {
        Alert.alert('Erro', 'Data de cura não pode ser anterior à data de diagnóstico');
        return;
      }
    }
    
    if (activeCalendarField === 'inicio_sintomas' && dataDiagnosticoISO) {
      const dataInicio = new Date(dataISO);
      const dataDiagnostico = new Date(dataDiagnosticoISO);
      if (dataInicio > dataDiagnostico) {
        Alert.alert('Erro', 'Data de início dos sintomas não pode ser posterior à data de diagnóstico');
        return;
      }
    }
    
    if (activeCalendarField === 'diagnostico') {
      setDataDiagnosticoBR(dataFormatada);
      setDataDiagnosticoISO(dataISO);
      handleDoencaFieldChange('data_diagnostico', dataISO);
      setShowDataDiagnosticoModal(false);
      
      // Revalidar outras datas se existirem
      if (dataCuraISO) {
        const dataCura = new Date(dataCuraISO);
        const dataDiagnostico = new Date(dataISO);
        if (dataCura < dataDiagnostico) {
          setErrorsDoenca(prev => ({
            ...prev,
            data_cura: 'Data de cura não pode ser anterior à data de diagnóstico'
          }));
        }
      }
      if (dataInicioSintomasISO) {
        const dataInicio = new Date(dataInicioSintomasISO);
        const dataDiagnostico = new Date(dataISO);
        if (dataInicio > dataDiagnostico) {
          setErrorsDoenca(prev => ({
            ...prev,
            data_inicio_sintomas: 'Data de início dos sintomas não pode ser posterior à data de diagnóstico'
          }));
        }
      }
    } else if (activeCalendarField === 'inicio_sintomas') {
      setDataInicioSintomasBR(dataFormatada);
      setDataInicioSintomasISO(dataISO);
      handleDoencaFieldChange('data_inicio_sintomas', dataISO);
      setShowDataInicioSintomasModal(false);
    } else if (activeCalendarField === 'cura') {
      setDataCuraBR(dataFormatada);
      setDataCuraISO(dataISO);
      handleDoencaFieldChange('data_cura', dataISO);
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
    // Se estiver selecionando data e hora, manter a hora já selecionada
    if (activeCalendarField === 'data_hora_inicio') {
      newDate.setHours(selectedDataHoraInicio.getHours());
      newDate.setMinutes(selectedDataHoraInicio.getMinutes());
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
            <Feather name="chevron-left" size={24} color="#16425B" />
          </TouchableOpacity>
          <Text style={styles.calendarMonthText}>
            {monthNames[currentMonth]} {currentYear}
          </Text>
          <TouchableOpacity onPress={() => navigateMonth('next')} style={styles.calendarNavButton}>
            <Feather name="chevron-right" size={24} color="#16425B" />
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
  
  // ✅ FUNÇÃO AUXILIAR PARA PARSING SEGURO DE RESPOSTAS
  const parseResponse = async (response: Response) => {
    const contentType = response.headers.get('content-type');
    
    // Verificar se a resposta é JSON
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Resposta não-JSON recebida:', text.substring(0, 200));
      throw new Error('Resposta inválida do servidor. Tente novamente.');
    }
    
    // Tentar fazer parse do JSON
    try {
      return await response.json();
    } catch (error) {
      console.error('Erro ao fazer parse do JSON:', error);
      throw new Error('Erro ao processar resposta do servidor.');
    }
  };
  
  // ✅ FUNÇÃO AUXILIAR COM TIMEOUT PARA REQUISIÇÕES
  const fetchWithTimeout = async (
    url: string,
    options: RequestInit,
    timeout: number = 30000 // 30 segundos padrão
  ): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Tempo de espera esgotado. Verifique sua conexão e tente novamente.');
      }
      throw error;
    }
  };
  
  const handleSaveDoenca = async () => {
    // ✅ PROTEÇÃO ADICIONADA: Prevenir múltiplos cliques
    if (isSavingDoenca || loadingDoenca) {
      return; // Já está salvando, ignorar clique
    }
    
    // Validar campos obrigatórios
    const newErrors: {[key: string]: string} = {};
    const camposObrigatorios: (keyof DoencaData)[] = ['nome_doenca', 'tipo_doenca'];
    
    camposObrigatorios.forEach(field => {
      const error = validateDoencaField(field, doencaData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });
    
    // Marcar todos os campos obrigatórios como tocados
    const newTouched: {[key: string]: boolean} = {};
    camposObrigatorios.forEach(field => {
      newTouched[field] = true;
    });
    
    setTouchedDoenca(prev => ({ ...prev, ...newTouched }));
    setErrorsDoenca(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      Alert.alert('Campos obrigatórios', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    // ✅ Setar flags de bloqueio antes da requisição
    setIsSavingDoenca(true);
    setLoadingDoenca(true);
    
    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      if (!token) {
        Alert.alert('Erro de Autenticação', 'Você não está logado.');
        // ✅ Resetar flags antes de retornar
        setIsSavingDoenca(false);
        setLoadingDoenca(false);
        return;
      }
      
      const profileId = await AsyncStorage.getItem('active_profile_id');
      if (!profileId) {
        Alert.alert('Erro', 'Nenhum perfil ativo encontrado.');
        // ✅ Resetar flags antes de retornar
        setIsSavingDoenca(false);
        setLoadingDoenca(false);
        return;
      }
      
      const doencaPayload: any = {
        nome_doenca: doencaData.nome_doenca.trim(),
        tipo_doenca: doencaData.tipo_doenca.trim(),
        perfil_id: parseInt(profileId),
      };
      
      // Adicionar campos opcionais apenas se preenchidos (usar formato ISO)
      if (dataDiagnosticoISO) {
        doencaPayload.data_diagnostico = dataDiagnosticoISO;
      }
      if (dataInicioSintomasISO) {
        doencaPayload.data_inicio_sintomas = dataInicioSintomasISO;
      }
      if (dataCuraISO) {
        doencaPayload.data_cura = dataCuraISO;
      }
      if (doencaData.observacoes) {
        doencaPayload.observacoes = doencaData.observacoes.trim();
      }
      
      // ✅ USAR FETCH COM TIMEOUT
      const response = await fetchWithTimeout(
        `${API_CONFIG.BASE_URL}${ENDPOINTS.DOENCA_RECORDS}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(doencaPayload),
        },
        30000 // 30 segundos
      );
      
      // ✅ USAR PARSING SEGURO
      const result = await parseResponse(response);
      
      if (!response.ok) {
        throw new Error(result.message || 'Erro ao salvar doença.');
      }
      
      // ✅ VALIDAÇÃO ADICIONADA: Verificar estrutura da resposta
      if (!result || !result.data || typeof result.data.id !== 'number') {
        console.error('Resposta inválida do servidor:', result);
        throw new Error('Resposta inválida do servidor. ID da doença não encontrado.');
      }
      
      // Salvar o ID da doença criada
      const novaDoencaId = result.data.id;
      setDoencaId(novaDoencaId);
      setDoencaSalva(true);
      hasUnsavedChanges.current = false;
      
      Alert.alert('Sucesso!', 'Doença registrada com sucesso! Agora você pode cadastrar o sintoma.');
    } catch (error: any) {
      console.error('Erro ao salvar doença:', error);
      
      let errorMessage = 'Não foi possível salvar a doença.';
      
      // ✅ DETECÇÃO DE ERRO DE REDE
      if (
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('NetworkError') ||
        error.message?.includes('Network request failed') ||
        (error.name === 'TypeError' && error.message?.includes('fetch'))
      ) {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      } 
      // ✅ DETECÇÃO DE TIMEOUT
      else if (error.message?.includes('Tempo de espera esgotado')) {
        errorMessage = error.message; // Já tem mensagem adequada
      }
      // ✅ DETECÇÃO DE ERRO DO BACKEND
      else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Erro', errorMessage);
    } finally {
      // ✅ Resetar flags de bloqueio
      setIsSavingDoenca(false);
      setLoadingDoenca(false);
    }
  };
  
  const handleSaveSintoma = async () => {
    // ✅ PROTEÇÃO ADICIONADA: Prevenir múltiplos cliques
    if (isSavingSintoma || loadingSintoma) {
      return; // Já está salvando, ignorar clique
    }
    
    if (!doencaId) {
      Alert.alert('Erro', 'Por favor, salve a doença primeiro.');
      return;
    }
    
    // Validar campos obrigatórios
    const newErrors: {[key: string]: string} = {};
    const camposObrigatorios: (keyof SintomaData)[] = ['descricao_sintoma', 'intensidade', 'data_hora_inicio'];
    
    camposObrigatorios.forEach(field => {
      const error = validateSintomaField(field, sintomaData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });
    
    // Marcar todos os campos obrigatórios como tocados
    const newTouched: {[key: string]: boolean} = {};
    camposObrigatorios.forEach(field => {
      newTouched[field] = true;
    });
    
    setTouchedSintoma(prev => ({ ...prev, ...newTouched }));
    setErrorsSintoma(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      Alert.alert('Campos obrigatórios', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    // ✅ Setar flags de bloqueio antes da requisição
    setIsSavingSintoma(true);
    setLoadingSintoma(true);
    
    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      if (!token) {
        Alert.alert('Erro de Autenticação', 'Você não está logado.');
        // ✅ Resetar flags antes de retornar
        setIsSavingSintoma(false);
        setLoadingSintoma(false);
        return;
      }
      
      const profileId = await AsyncStorage.getItem('active_profile_id');
      if (!profileId) {
        Alert.alert('Erro', 'Nenhum perfil ativo encontrado.');
        // ✅ Resetar flags antes de retornar
        setIsSavingSintoma(false);
        setLoadingSintoma(false);
        return;
      }
      
      const sintomaPayload = {
        descricao_sintoma: sintomaData.descricao_sintoma.trim(),
        intensidade: sintomaData.intensidade,
        data_hora_inicio: sintomaData.data_hora_inicio,
        perfil_id: parseInt(profileId),
      };
      
      // ✅ USAR FETCH COM TIMEOUT
      const response = await fetchWithTimeout(
        `${API_CONFIG.BASE_URL}${ENDPOINTS.SYMPTOMS_RECORDS}/${doencaId}/symptoms`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(sintomaPayload),
        },
        30000 // 30 segundos
      );
      
      // ✅ USAR PARSING SEGURO
      const result = await parseResponse(response);
      
      if (!response.ok) {
        throw new Error(result.message || 'Erro ao salvar sintoma.');
      }
      
      // ✅ Redirecionar automaticamente após salvamento bem-sucedido
      hasUnsavedChanges.current = false;
      
      // Mostrar alerta de sucesso (não bloqueante)
      Alert.alert('Sucesso!', 'Sintoma registrado com sucesso!');
      
      // ✅ Redirecionar imediatamente após salvamento
      router.push('/monitor/sintoma');
    } catch (error: any) {
      console.error('Erro ao salvar sintoma:', error);
      
      let errorMessage = 'Não foi possível salvar o sintoma.';
      
      // ✅ DETECÇÃO DE ERRO DE REDE
      if (
        error.message?.includes('Failed to fetch') ||
        error.message?.includes('NetworkError') ||
        error.message?.includes('Network request failed') ||
        (error.name === 'TypeError' && error.message?.includes('fetch'))
      ) {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      } 
      // ✅ DETECÇÃO DE TIMEOUT
      else if (error.message?.includes('Tempo de espera esgotado')) {
        errorMessage = error.message; // Já tem mensagem adequada
      }
      // ✅ DETECÇÃO DE ERRO DO BACKEND
      else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Erro', errorMessage);
    } finally {
      // ✅ Resetar flags de bloqueio
      setIsSavingSintoma(false);
      setLoadingSintoma(false);
    }
  };
  
  const handleBack = () => {
    if (hasUnsavedChanges.current) {
      Alert.alert(
        'Atenção',
        'Você tem alterações não salvas. Deseja realmente sair?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sair',
            style: 'destructive',
            onPress: () => {
              hasUnsavedChanges.current = false;
              router.back();
            },
          },
        ]
      );
    } else {
      router.back();
    }
  };
  
  const isDoencaValid = useMemo(() => {
    return (
      doencaData.nome_doenca.trim().length >= 2 &&
      doencaData.tipo_doenca.trim().length >= 2
    );
  }, [doencaData]);
  
  const isSintomaValid = useMemo(() => {
    return (
      sintomaData.descricao_sintoma.trim().length >= 3 &&
      sintomaData.descricao_sintoma.trim().length <= 45 && // ✅ VALIDAÇÃO DE MÁXIMO
      ['Leve', 'Moderada', 'Intensa'].includes(sintomaData.intensidade) &&
      sintomaData.data_hora_inicio.length > 0
    );
  }, [sintomaData]);
  
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Feather name="arrow-left" size={24} color="#16425B" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.titleButton}>
            <Text style={styles.title}>Nova Doença e Sintoma</Text>
          </View>
        </View>
        <View style={styles.headerSpacer} />
      </View>
      
      {/* Indicador de Progresso */}
      <View style={styles.progressContainer}>
        <View style={styles.progressStep}>
          <View style={[styles.progressCircle, doencaSalva && styles.progressCircleCompleted]}>
            {doencaSalva ? (
              <Feather name="check" size={16} color="#FFFFFF" />
            ) : (
              <Text style={styles.progressNumber}>1</Text>
            )}
          </View>
          <Text style={[styles.progressLabel, doencaSalva && styles.progressLabelCompleted]}>
            Doença
          </Text>
        </View>
        <View style={[styles.progressLine, doencaSalva && styles.progressLineCompleted]} />
        <View style={styles.progressStep}>
          <View style={[styles.progressCircle, doencaSalva && styles.progressCircleActive]}>
            <Text style={[styles.progressNumber, doencaSalva && styles.progressNumberActive]}>
              2
            </Text>
          </View>
          <Text style={[styles.progressLabel, doencaSalva && styles.progressLabelActive]}>
            Sintoma
          </Text>
        </View>
      </View>
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* SEÇÃO 1: DADOS DA DOENÇA */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Feather name="file-text" size={20} color="#16425B" />
              <Text style={styles.sectionTitle}>Dados da Doença</Text>
            </View>
            {doencaSalva && (
              <View style={styles.checkBadge}>
                <Feather name="check" size={14} color="#4CAF50" />
              </View>
            )}
          </View>
          
          {/* Nome da Doença */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Nome da Doença <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                touchedDoenca.nome_doenca && errorsDoenca.nome_doenca && styles.inputError
              ]}
              value={doencaData.nome_doenca}
              onChangeText={(value) => handleDoencaFieldChange('nome_doenca', value)}
              onBlur={() => {
                setTouchedDoenca(prev => ({ ...prev, nome_doenca: true }));
                const error = validateDoencaField('nome_doenca', doencaData.nome_doenca);
                setErrorsDoenca(prev => ({ ...prev, nome_doenca: error }));
              }}
              placeholder="Ex: Gripe, Hipertensão, Diabetes..."
              placeholderTextColor="#A4A4A4"
              editable={!doencaSalva}
            />
            {touchedDoenca.nome_doenca && errorsDoenca.nome_doenca && (
              <Text style={styles.errorText}>{errorsDoenca.nome_doenca}</Text>
            )}
          </View>
          
          {/* Tipo da Doença */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Tipo da Doença <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                touchedDoenca.tipo_doenca && errorsDoenca.tipo_doenca && styles.inputError
              ]}
              value={doencaData.tipo_doenca}
              onChangeText={(value) => handleDoencaFieldChange('tipo_doenca', value)}
              onBlur={() => {
                setTouchedDoenca(prev => ({ ...prev, tipo_doenca: true }));
                const error = validateDoencaField('tipo_doenca', doencaData.tipo_doenca);
                setErrorsDoenca(prev => ({ ...prev, tipo_doenca: error }));
              }}
              placeholder="Ex: Aguda, Crônica, Infecciosa..."
              placeholderTextColor="#A4A4A4"
              editable={!doencaSalva}
            />
            {touchedDoenca.tipo_doenca && errorsDoenca.tipo_doenca && (
              <Text style={styles.errorText}>{errorsDoenca.tipo_doenca}</Text>
            )}
          </View>
          
          {/* Data de Diagnóstico */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data de Diagnóstico</Text>
            <TouchableOpacity 
              style={[styles.dateInputButton, !dataDiagnosticoBR && styles.dateInputButtonPlaceholder]} 
              onPress={() => !doencaSalva && showDataDiagnosticoPicker()}
              disabled={doencaSalva}
            >
              <Text style={[styles.dateInputButtonText, !dataDiagnosticoBR && styles.dateInputButtonTextPlaceholder]}>
                {dataDiagnosticoBR || 'Selecione a data inicial'}
              </Text>
              <Feather name="chevron-down" size={20} color={doencaSalva ? "#A4A4A4" : "#3B7CA6"} />
            </TouchableOpacity>
          </View>
          
          {/* Data de Início dos Sintomas */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data de Início dos Sintomas</Text>
            <TouchableOpacity 
              style={[styles.dateInputButton, !dataInicioSintomasBR && styles.dateInputButtonPlaceholder]} 
              onPress={() => !doencaSalva && showDataInicioSintomasPicker()}
              disabled={doencaSalva}
            >
              <Text style={[styles.dateInputButtonText, !dataInicioSintomasBR && styles.dateInputButtonTextPlaceholder]}>
                {dataInicioSintomasBR || 'Selecione a data inicial'}
              </Text>
              <Feather name="chevron-down" size={20} color={doencaSalva ? "#A4A4A4" : "#3B7CA6"} />
            </TouchableOpacity>
          </View>
          
          {/* Data de Cura */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data de Cura</Text>
            <TouchableOpacity 
              style={[styles.dateInputButton, !dataCuraBR && styles.dateInputButtonPlaceholder]} 
              onPress={() => !doencaSalva && showDataCuraPicker()}
              disabled={doencaSalva}
            >
              <Text style={[styles.dateInputButtonText, !dataCuraBR && styles.dateInputButtonTextPlaceholder]}>
                {dataCuraBR || 'Selecione a data inicial'}
              </Text>
              <Feather name="chevron-down" size={20} color={doencaSalva ? "#A4A4A4" : "#3B7CA6"} />
            </TouchableOpacity>
          </View>
          
          {/* Observações */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Observações</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={doencaData.observacoes}
              onChangeText={(value) => handleDoencaFieldChange('observacoes', value)}
              placeholder="Informações adicionais sobre a doença..."
              placeholderTextColor="#A4A4A4"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!doencaSalva}
            />
          </View>
          
          {/* Botão Salvar Doença */}
          {!doencaSalva && (
            <TouchableOpacity
              style={[
                styles.saveButton,
                (!isDoencaValid || loadingDoenca || isSavingDoenca) && styles.saveButtonDisabled
              ]}
              onPress={handleSaveDoenca}
              disabled={!isDoencaValid || loadingDoenca || isSavingDoenca}
            >
              {loadingDoenca ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="check" size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Salvar Doença</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
        
        {/* SEÇÃO 2: DADOS DO SINTOMA */}
        <View style={[
          styles.section,
          !doencaSalva && styles.sectionDisabled
        ]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <Feather name="activity" size={20} color={doencaSalva ? "#16425B" : "#A4A4A4"} />
              <Text style={[
                styles.sectionTitle,
                !doencaSalva && styles.sectionTitleDisabled
              ]}>
                Dados do Sintoma
              </Text>
            </View>
            {!doencaSalva && (
              <Text style={styles.disabledHint}>Salve a doença primeiro</Text>
            )}
          </View>
          
          {/* Descrição do Sintoma */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Descrição do Sintoma <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  touchedSintoma.descricao_sintoma && errorsSintoma.descricao_sintoma && styles.inputError
                ]}
                value={sintomaData.descricao_sintoma}
                onChangeText={(value) => handleSintomaFieldChange('descricao_sintoma', value)}
                onBlur={() => {
                  setTouchedSintoma(prev => ({ ...prev, descricao_sintoma: true }));
                  const error = validateSintomaField('descricao_sintoma', sintomaData.descricao_sintoma);
                  setErrorsSintoma(prev => ({ ...prev, descricao_sintoma: error }));
                }}
                placeholder="Ex: Dor de cabeça, febre, náusea..."
                placeholderTextColor="#A4A4A4"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={doencaSalva}
              />
            </View>
            {touchedSintoma.descricao_sintoma && errorsSintoma.descricao_sintoma && (
              <Text style={styles.errorText}>{errorsSintoma.descricao_sintoma}</Text>
            )}
          </View>
          
          {/* Intensidade */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Intensidade <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.intensidadeContainer}>
              {intensidadeOptions.map((option) => {
                const isSelected = sintomaData.intensidade === option.value;
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
                          backgroundColor: isSelected ? option.bgColor : '#FFFFFF',
                          opacity: doencaSalva ? 1 : 0.5
                        }
                      ]}
                      onPress={() => doencaSalva && handleSintomaFieldChange('intensidade', option.value)}
                      disabled={!doencaSalva}
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
            {sintomaData.intensidade === 'Intensa' && doencaSalva && (
              <View style={styles.intenseAlert}>
                <Feather name="alert-triangle" size={16} color="#F44336" />
                <Text style={styles.intenseAlertText}>
                  Intensidade intensa detectada. Considere buscar atendimento médico.
                </Text>
              </View>
            )}
            {touchedSintoma.intensidade && errorsSintoma.intensidade && (
              <Text style={styles.errorText}>{errorsSintoma.intensidade}</Text>
            )}
          </View>
          
          {/* Data e Hora de Início */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Data e Hora de Início <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity 
              style={[
                styles.dateInputButton, 
                !dataHoraInicioBR && styles.dateInputButtonPlaceholder,
                errorsSintoma.data_hora_inicio && touchedSintoma.data_hora_inicio && styles.inputError
              ]} 
              onPress={() => doencaSalva && showDataHoraInicioPicker()}
              disabled={!doencaSalva}
            >
              <Text style={[
                styles.dateInputButtonText, 
                !dataHoraInicioBR && styles.dateInputButtonTextPlaceholder
              ]}>
                {dataHoraInicioBR || 'Selecione a data e hora inicial'}
              </Text>
              <Feather name="chevron-down" size={20} color={doencaSalva ? "#3B7CA6" : "#A4A4A4"} />
            </TouchableOpacity>
            {touchedSintoma.data_hora_inicio && errorsSintoma.data_hora_inicio && (
              <Text style={styles.errorText}>{errorsSintoma.data_hora_inicio}</Text>
            )}
          </View>
          
          {/* Botão Salvar Sintoma */}
          {doencaSalva && (
            <TouchableOpacity
              style={[
                styles.saveButton,
                (!isSintomaValid || loadingSintoma || isSavingSintoma) && styles.saveButtonDisabled
              ]}
              onPress={handleSaveSintoma}
              disabled={!isSintomaValid || loadingSintoma || isSavingSintoma}
            >
              {loadingSintoma ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="check" size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Salvar Sintoma</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* ✅ MODAIS DE CALENDÁRIO (Padrão Novo Medicamento) */}
      
      {/* Modal de Seleção de Data de Diagnóstico */}
      <Modal
        visible={showDataDiagnosticoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDataDiagnosticoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione a Data de Diagnóstico</Text>
              <TouchableOpacity
                onPress={() => setShowDataDiagnosticoModal(false)}
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
                onPress={() => setShowDataDiagnosticoModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={confirmDateSelection}
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
        onRequestClose={() => setShowDataInicioSintomasModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione a Data de Início dos Sintomas</Text>
              <TouchableOpacity
                onPress={() => setShowDataInicioSintomasModal(false)}
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
                onPress={() => setShowDataInicioSintomasModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={confirmDateSelection}
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
        onRequestClose={() => setShowDataCuraModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione a Data de Cura</Text>
              <TouchableOpacity
                onPress={() => setShowDataCuraModal(false)}
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
                onPress={() => setShowDataCuraModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={confirmDateSelection}
              >
                <Text style={styles.modalConfirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Seleção de Data e Hora de Início */}
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
                onPress={() => setShowDataHoraInicioModal(false)}
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
    backgroundColor: '#F7F7F7',
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
    backgroundColor: '#16425B',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#81C4D7',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  progressStep: {
    alignItems: 'center',
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#A4A4A4',
  },
  progressCircleCompleted: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  progressCircleActive: {
    backgroundColor: '#3B7CA6',
    borderColor: '#3B7CA6',
  },
  progressNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#707070',
  },
  progressNumberActive: {
    color: '#FFFFFF',
  },
  progressLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#707070',
    fontWeight: '500',
  },
  progressLabelCompleted: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  progressLabelActive: {
    color: '#3B7CA6',
    fontWeight: '600',
  },
  progressLine: {
    width: 60,
    height: 2,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 10,
  },
  progressLineCompleted: {
    backgroundColor: '#4CAF50',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  sectionDisabled: {
    opacity: 0.6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#16425B',
  },
  sectionTitleDisabled: {
    color: '#A4A4A4',
  },
  checkBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledHint: {
    fontSize: 12,
    color: '#FF9800',
    fontStyle: 'italic',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16425B',
    marginBottom: 8,
  },
  required: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
    color: '#16425B',
  },
  textArea: {
    minHeight: 100,
  },
  inputError: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  inputDisabled: {
    backgroundColor: '#F5F5F5',
    opacity: 0.6,
  },
  errorText: {
    color: '#F44336',
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 12,
  },
  dateInputPlaceholder: {
    borderColor: '#E0E0E0',
  },
  dateInputText: {
    flex: 1,
    fontSize: 16,
    color: '#16425B',
    fontWeight: '500',
  },
  dateInputTextPlaceholder: {
    color: '#A4A4A4',
    fontWeight: '400',
  },
  dateInputWeb: {
    // @ts-ignore - type="date" é válido para web
    type: 'date',
  },
  datePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 12,
    overflow: 'hidden',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  datePickerCancel: {
    fontSize: 16,
    color: '#707070',
    fontWeight: '500',
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16425B',
  },
  datePickerConfirm: {
    fontSize: 16,
    color: '#3B7CA6',
    fontWeight: '600',
  },
  dateTimeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateTimeInputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  dateTimeInputText: {
    fontSize: 16,
    color: '#16425B',
    fontWeight: '500',
  },
  dateTimeInputTextPlaceholder: {
    color: '#A4A4A4',
    fontWeight: '400',
  },
  dateTimeInputWeb: {
    // @ts-ignore - type="datetime-local" é válido para web
    type: 'datetime-local',
  },
  dateTimePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 12,
    overflow: 'hidden',
  },
  dateTimePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dateTimePickerCancel: {
    fontSize: 16,
    color: '#707070',
    fontWeight: '500',
  },
  dateTimePickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16425B',
  },
  dateTimePickerConfirm: {
    fontSize: 16,
    color: '#3B7CA6',
    fontWeight: '600',
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
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B7CA6',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginTop: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#A4A4A4',
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  // ✅ ESTILOS DO CALENDÁRIO E MODAIS (Padrão Novo Medicamento)
  dateInputButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
    color: '#16425B',
    fontWeight: '500',
    flex: 1,
  },
  dateInputButtonTextPlaceholder: {
    color: '#A4A4A4',
    fontWeight: '400',
  },
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
    color: '#16425B',
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
    backgroundColor: '#3B7CA6',
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
    color: '#16425B',
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
    color: '#16425B',
    fontWeight: 'bold',
  },
  selectedDayCell: {
    backgroundColor: '#3B7CA6',
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
    color: '#16425B',
    marginBottom: 12,
  },
  timePickerWrapper: {
    alignItems: 'center',
    marginTop: 10,
  },
});

