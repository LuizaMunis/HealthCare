import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, ENDPOINTS } from '@/constants/api';

interface Sintoma {
  id?: number;
  doenca_id: number;
  descricao_sintoma: string;
  intensidade: 'Leve' | 'Moderada' | 'Intensa';
  data_hora_inicio: string;
}

export default function SintomaScreen() {
  const router = useRouter();
  const [sintomas, setSintomas] = useState<Sintoma[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [newSintoma, setNewSintoma] = useState<Sintoma>({
    doenca_id: 0,
    descricao_sintoma: '',
    intensidade: 'Leve',
    data_hora_inicio: new Date().toISOString().split('T')[0],
  });
  const [doencas, setDoencas] = useState<{id: number, nome_doenca: string}[]>([]);
  const [loadingDoencas, setLoadingDoencas] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  const [showDataInicioModal, setShowDataInicioModal] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const loadDoencas = async () => {
    setLoadingDoencas(true);
    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      if (!token) return;

      const profileId = await AsyncStorage.getItem('active_profile_id');
      if (!profileId) return;

      const response = await fetch(`${API_CONFIG.BASE_URL}/doencas?perfil_id=${profileId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        const doencasData = Array.isArray(result.data) ? result.data : [];
        setDoencas(doencasData);
      }
    } catch (error) {
      console.error('Erro ao carregar doenças:', error);
    } finally {
      setLoadingDoencas(false);
    }
  };

  const loadSintomas = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      if (!token) return;

      const profileId = await AsyncStorage.getItem('active_profile_id');
      if (!profileId) return;

      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.SYMPTOMS_RECORDS}?perfil_id=${profileId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        const sintomasData = Array.isArray(result.data) ? result.data : [];
        setSintomas(sintomasData);
      }
    } catch (error) {
      console.error('Erro ao carregar sintomas:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSintomas = async (sintomas: Sintoma[]) => {
    // Função removida - agora usamos API real
  };

  useEffect(() => {
    loadDoencas();
    loadSintomas();
  }, []);

  const intensidadeOptions = [
    { value: 'Leve', label: 'Leve', color: '#4CAF50' },
    { value: 'Moderada', label: 'Moderada', color: '#FFC107' },
    { value: 'Intensa', label: 'Intensa', color: '#F44336' }
  ];

  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'descricao_sintoma':
        if (!value || value.trim().length < 3) {
          return 'Descrição deve ter pelo menos 3 caracteres';
        }
        if (value.trim().length > 45) {
          return 'Descrição deve ter no máximo 45 caracteres';
        }
        break;
      case 'intensidade':
        if (!value || !['Leve', 'Moderada', 'Intensa'].includes(value)) {
          return 'Intensidade deve ser Leve, Moderada ou Intensa';
        }
        break;
      case 'doenca_id':
        if (!value || value === 0) {
          return 'Selecione uma doença';
        }
        break;
      case 'data_hora_inicio':
        if (!value) {
          return 'Data é obrigatória';
        }
        break;
    }
    return '';
  };

  const validateAllFields = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    Object.keys(newSintoma).forEach(field => {
      const error = validateField(field, newSintoma[field as keyof Sintoma]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field: string, value: any) => {
    setNewSintoma(prev => ({ ...prev, [field]: value }));
    
    // Validar campo em tempo real
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSaveSintoma = () => {
    // Validações básicas
    if (!validateAllFields()) {
      Alert.alert('Campos obrigatórios', 'Por favor, corrija os erros nos campos destacados em vermelho.');
      return;
    }

    // Validar se doenca_id é válido antes de mostrar o modal
    if (!newSintoma.doenca_id || newSintoma.doenca_id === 0) {
      Alert.alert('Erro', 'Por favor, selecione uma doença antes de salvar o sintoma.');
      return;
    }

    // Mostrar modal de confirmação
    setShowConfirmationModal(true);
  };

  const handleConfirmSave = async () => {
    setShowConfirmationModal(false);
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      if (!token) {
        Alert.alert('Erro de Autenticação', 'Você não está logado.');
        setLoading(false);
        return;
      }

      const profileId = await AsyncStorage.getItem('active_profile_id');
      console.log('🔍 [DEBUG] ProfileId do AsyncStorage:', profileId, 'Tipo:', typeof profileId);
      if (!profileId) {
        console.error('❌ [DEBUG] ProfileId não encontrado no AsyncStorage');
        Alert.alert('Erro', 'Nenhum perfil ativo encontrado. Por favor, selecione um perfil.');
        setLoading(false);
        return;
      }

      // Preparar dados para envio
      const perfilIdParsed = parseInt(profileId);
      console.log('🔍 [DEBUG] ProfileId parseado:', perfilIdParsed, 'É NaN?', isNaN(perfilIdParsed));

      const sintomaData = {
        descricao_sintoma: newSintoma.descricao_sintoma.trim(),
        intensidade: newSintoma.intensidade,
        data_hora_inicio: `${newSintoma.data_hora_inicio}T00:00:00`,
        perfil_id: perfilIdParsed
      };

      console.log('📤 [DEBUG] Enviando dados do sintoma:', JSON.stringify(sintomaData, null, 2));
      console.log('📤 [DEBUG] doenca_id (URL):', newSintoma.doenca_id);
      console.log('🔍 [DEBUG] URL da requisição:', `${API_CONFIG.BASE_URL}${ENDPOINTS.SYMPTOMS_RECORDS}/${newSintoma.doenca_id}/symptoms`);
      console.log('🔍 [DEBUG] Token presente?', token ? 'Sim' : 'Não');

      console.log('📡 [DEBUG] Iniciando requisição POST...');
      // Usar a rota de sintomas - doenca_id vem como parâmetro da URL, perfil_id apenas no body
      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.SYMPTOMS_RECORDS}/${newSintoma.doenca_id}/symptoms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(sintomaData)
      });

      console.log('📥 [DEBUG] Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      const result = await response.json();
      console.log('📥 [DEBUG] Corpo da resposta:', JSON.stringify(result, null, 2));

      if (!response.ok) {
        console.error('❌ [DEBUG] Erro na resposta do servidor:', {
          status: response.status,
          statusText: response.statusText,
          result: JSON.stringify(result, null, 2)
        });
        throw new Error(result.message || `Erro ao salvar sintoma. Status: ${response.status}`);
      }

      console.log('✅ [DEBUG] Sintoma salvo com sucesso:', JSON.stringify(result, null, 2));

      const novoSintoma = {
        id: result.data.id,
        doenca_id: newSintoma.doenca_id,
        ...sintomaData
      };

      setSintomas(prev => [novoSintoma, ...prev]);
      setShowAddModal(false);
      setNewSintoma({
        doenca_id: 0,
        descricao_sintoma: '',
        intensidade: 'Leve',
        data_hora_inicio: new Date().toISOString().split('T')[0],
      });
      setErrors({});
      setTouched({});

      Alert.alert('Sucesso!', 'Sintoma registrado com sucesso!');
    } catch (error: any) {
      console.error('❌ [DEBUG] Erro completo ao salvar sintoma:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        error: error
      });
      Alert.alert('Erro', error.message || 'Não foi possível salvar o sintoma.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSintoma = async (id: number) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este sintoma?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('healthcare_auth_token');
              if (!token) {
                Alert.alert('Erro de Autenticação', 'Você não está logado.');
                return;
              }

              const profileId = await AsyncStorage.getItem('active_profile_id');
              if (!profileId) {
                Alert.alert('Erro', 'Nenhum perfil ativo encontrado.');
                return;
              }

              const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.SYMPTOMS_RECORDS}/${id}?perfil_id=${profileId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (response.ok) {
                setSintomas(prev => prev.filter(s => s.id !== id));
                Alert.alert('Sucesso!', 'Sintoma excluído com sucesso!');
              } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao excluir sintoma');
              }
            } catch (error: any) {
              console.error('Erro ao excluir sintoma:', error);
              Alert.alert('Erro', error.message || 'Não foi possível excluir o sintoma');
            }
          }
        }
      ]
    );
  };

  const getIntensidadeColor = (intensidade: string) => {
    const option = intensidadeOptions.find(opt => opt.value === intensidade);
    return option?.color || '#666';
  };

  const getIntensidadeLabel = (intensidade: string) => {
    return intensidade;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // Retorna a string original se a data for inválida
      }
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString; // Retorna a string original em caso de erro
    }
  };

  // Funções do calendário
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
            {`${monthNames[currentMonth]} ${String(currentYear)}`}
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

  const showDataInicioPicker = () => {
    // Inicializar com a data atual ou a data já selecionada
    if (newSintoma.data_hora_inicio) {
      const date = new Date(newSintoma.data_hora_inicio);
      if (!isNaN(date.getTime())) {
        setSelectedCalendarDate(date);
        setCurrentMonth(date.getMonth());
        setCurrentYear(date.getFullYear());
      }
    }
    setShowDataInicioModal(true);
  };

  const confirmDateSelection = () => {
    const dataISO = selectedCalendarDate.toISOString().split('T')[0];
    handleFieldChange('data_hora_inicio', dataISO);
    setShowDataInicioModal(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color="#004A61" />
        </TouchableOpacity>
        <Text style={styles.title}>Registro de Sintomas</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Feather name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {sintomas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="activity" size={64} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>Nenhum sintoma registrado</Text>
            <Text style={styles.emptySubtitle}>
              Toque no botão + para registrar um novo sintoma
            </Text>
          </View>
        ) : (
          <View style={styles.sintomasList}>
            {sintomas.map((sintoma) => (
              <View key={sintoma.id} style={styles.sintomaCard}>
                <View style={styles.sintomaHeader}>
                  <View style={styles.sintomaInfo}>
                    <Text style={styles.sintomaDescricao}>
                      {sintoma.descricao_sintoma}
                    </Text>
                    <Text style={styles.sintomaData}>
                      {formatDate(sintoma.data_hora_inicio)}
                    </Text>
                  </View>
                  <View style={styles.sintomaActions}>
                    <View style={[
                      styles.intensidadeBadge,
                      { backgroundColor: getIntensidadeColor(sintoma.intensidade) }
                    ]}>
                      <Text style={styles.intensidadeText}>
                        {sintoma.intensidade}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteSintoma(sintoma.id!)}
                    >
                      <Feather name="trash-2" size={20} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.intensidadeLabel}>
                  Intensidade: {getIntensidadeLabel(sintoma.intensidade)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal para adicionar sintoma */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        accessibilityViewIsModal={true}
        accessibilityLabel="Modal para adicionar novo sintoma"
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowAddModal(false)}
            >
              <Feather name="x" size={24} color="#004A61" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Novo Sintoma</Text>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleSaveSintoma}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.modalSaveText}>Salvar</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Doença <Text style={styles.required}>*</Text>
              </Text>
              {loadingDoencas ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#004A61" />
                  <Text style={styles.loadingText}>Carregando doenças...</Text>
                </View>
              ) : (
                <View style={styles.selectContainer}>
                  {doencas.map((doenca) => (
                    <TouchableOpacity
                      key={doenca.id}
                      style={[
                        styles.selectOption,
                        newSintoma.doenca_id === doenca.id && styles.selectOptionSelected
                      ]}
                      onPress={() => handleFieldChange('doenca_id', doenca.id)}
                    >
                      <Text style={[
                        styles.selectOptionText,
                        newSintoma.doenca_id === doenca.id && styles.selectOptionTextSelected
                      ]}>
                        {doenca.nome_doenca}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {errors.doenca_id && touched.doenca_id && (
                <Text style={styles.errorText}>{errors.doenca_id}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Descrição do Sintoma <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  errors.descricao_sintoma && touched.descricao_sintoma && styles.inputError
                ]}
                value={newSintoma.descricao_sintoma}
                onChangeText={(text) => handleFieldChange('descricao_sintoma', text)}
                onBlur={() => handleFieldBlur('descricao_sintoma')}
                placeholder="Ex: Dor de cabeça, febre, náusea..."
                multiline
                numberOfLines={3}
              />
              {errors.descricao_sintoma && touched.descricao_sintoma && (
                <Text style={styles.errorText}>{errors.descricao_sintoma}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Intensidade <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.intensidadeContainer}>
                {intensidadeOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.intensidadeOption,
                      newSintoma.intensidade === option.value && styles.intensidadeOptionSelected,
                      { borderColor: option.color }
                    ]}
                    onPress={() => handleFieldChange('intensidade', option.value)}
                  >
                    <Text style={[
                      styles.intensidadeOptionText,
                      newSintoma.intensidade === option.value && styles.intensidadeOptionTextSelected,
                      { color: newSintoma.intensidade === option.value ? option.color : '#666' }
                    ]}>
                      {option.value}
                    </Text>
                    <Text style={[
                      styles.intensidadeOptionLabel,
                      newSintoma.intensidade === option.value && styles.intensidadeOptionLabelSelected,
                      { color: newSintoma.intensidade === option.value ? option.color : '#666' }
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.intensidade && touched.intensidade && (
                <Text style={styles.errorText}>{errors.intensidade}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Data de Início <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.dateInput,
                  errors.data_hora_inicio && touched.data_hora_inicio && styles.inputError
                ]}
                onPress={showDataInicioPicker}
                onBlur={() => handleFieldBlur('data_hora_inicio')}
              >
                <Text style={[
                  styles.dateInputText,
                  !newSintoma.data_hora_inicio && styles.dateInputTextPlaceholder
                ]}>
                  {newSintoma.data_hora_inicio 
                    ? (() => {
                        try {
                          const date = new Date(newSintoma.data_hora_inicio);
                          return isNaN(date.getTime()) ? newSintoma.data_hora_inicio : date.toLocaleDateString('pt-BR');
                        } catch {
                          return newSintoma.data_hora_inicio;
                        }
                      })()
                    : 'Selecione a data de início'}
                </Text>
                <Feather name="calendar" size={20} color="#666" />
              </TouchableOpacity>
              {errors.data_hora_inicio && touched.data_hora_inicio && (
                <Text style={styles.errorText}>{errors.data_hora_inicio}</Text>
              )}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Modal de Confirmação */}
      <Modal
        visible={showConfirmationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmationModal(false)}
        accessibilityViewIsModal={true}
        accessibilityLabel="Modal de confirmação de sintoma"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirmar Sintoma</Text>
              <TouchableOpacity
                onPress={() => setShowConfirmationModal(false)}
                style={styles.modalCloseButton}
              >
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalSubtitle}>Confirme os dados do sintoma:</Text>
              
              <View style={styles.confirmationItem}>
                <Text style={styles.confirmationLabel}>Doença:</Text>
                <Text style={styles.confirmationValue}>
                  {doencas.find(d => d.id === newSintoma.doenca_id)?.nome_doenca || 'Não selecionada'}
                </Text>
              </View>

              <View style={styles.confirmationItem}>
                <Text style={styles.confirmationLabel}>Descrição:</Text>
                <Text style={styles.confirmationValue}>{newSintoma.descricao_sintoma || '-'}</Text>
              </View>

              <View style={styles.confirmationItem}>
                <Text style={styles.confirmationLabel}>Intensidade:</Text>
                <Text style={styles.confirmationValue}>{newSintoma.intensidade}</Text>
              </View>

              <View style={styles.confirmationItem}>
                <Text style={styles.confirmationLabel}>Data de início:</Text>
                <Text style={styles.confirmationValue}>
                  {newSintoma.data_hora_inicio 
                    ? (() => {
                        try {
                          const date = new Date(newSintoma.data_hora_inicio);
                          return isNaN(date.getTime()) ? newSintoma.data_hora_inicio : date.toLocaleDateString('pt-BR');
                        } catch {
                          return newSintoma.data_hora_inicio;
                        }
                      })()
                    : 'Não selecionada'}
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowConfirmationModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleConfirmSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalConfirmButtonText}>Confirmar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Seleção de Data de Início - Calendário */}
      <Modal
        visible={showDataInicioModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDataInicioModal(false)}
        accessibilityViewIsModal={true}
        accessibilityLabel="Modal de seleção de data de início"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione a Data de Início</Text>
              <TouchableOpacity
                onPress={() => setShowDataInicioModal(false)}
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
                onPress={() => setShowDataInicioModal(false)}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#004A61',
  },
  addButton: {
    backgroundColor: '#004A61',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  sintomasList: {
    gap: 16,
  },
  sintomaCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#004A61',
  },
  sintomaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  sintomaInfo: {
    flex: 1,
  },
  sintomaDescricao: {
    fontSize: 16,
    fontWeight: '600',
    color: '#004A61',
    marginBottom: 4,
  },
  sintomaData: {
    fontSize: 14,
    color: '#666',
  },
  sintomaActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  intensidadeBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intensidadeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  intensidadeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  deleteButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004A61',
  },
  modalSaveButton: {
    backgroundColor: '#004A61',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
    maxHeight: 300,
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
    color: '#F44336',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginTop: 4,
  },
  intensidadeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  intensidadeOption: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  intensidadeOptionSelected: {
    backgroundColor: '#F0F8FF',
  },
  intensidadeOptionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  intensidadeOptionTextSelected: {
    fontWeight: 'bold',
  },
  intensidadeOptionLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  intensidadeOptionLabelSelected: {
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  selectContainer: {
    gap: 8,
  },
  selectOption: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  selectOptionSelected: {
    borderColor: '#004A61',
    backgroundColor: '#E3F2FD',
  },
  selectOptionText: {
    fontSize: 16,
    color: '#666',
  },
  selectOptionTextSelected: {
    color: '#004A61',
    fontWeight: '600',
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  dateInputText: {
    fontSize: 16,
    color: '#333',
  },
  dateInputTextPlaceholder: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  // Estilos do Modal de Confirmação
  confirmationModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    width: '100%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  confirmationLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#004A61',
    flex: 1,
  },
  confirmationValue: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  calendarModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  calendarModalContent: {
    padding: 20,
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
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    marginRight: 10,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#004A61',
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});