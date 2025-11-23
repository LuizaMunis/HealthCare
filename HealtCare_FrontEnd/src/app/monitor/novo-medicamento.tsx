import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, ENDPOINTS } from '@/constants/api';

export default function NovoMedicamentoScreen() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [dosagem, setDosagem] = useState('');
  const [frequenciaHoras, setFrequenciaHoras] = useState('8');
  const [duracaoDias, setDuracaoDias] = useState('');
  const [dataInicial, setDataInicial] = useState('');
  const [dataInicialISO, setDataInicialISO] = useState('');
  const [usoContinuo, setUsoContinuo] = useState(false);
  const [lembretesAtivos, setLembretesAtivos] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showDosagemModal, setShowDosagemModal] = useState(false);
  const [showDataInicialModal, setShowDataInicialModal] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const handleSave = () => {
    // Validações básicas
    if (!nome.trim()) {
      Alert.alert('Erro', 'Por favor, insira o nome do medicamento');
      return;
    }

    if (!frequenciaHoras || parseInt(frequenciaHoras) < 1) {
      Alert.alert('Erro', 'Por favor, insira uma frequência válida em horas');
      return;
    }

    if (!dosagem.trim()) {
      Alert.alert('Erro', 'Por favor, insira a dosagem do medicamento');
      return;
    }

    if (!usoContinuo && (!duracaoDias || parseInt(duracaoDias) < 1)) {
      Alert.alert('Erro', 'Por favor, insira a duração do tratamento em dias ou marque como uso contínuo');
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
        return;
      }

      // Obter o perfil_id ativo do usuário
      const profileId = await AsyncStorage.getItem('active_profile_id');
      console.log('🔍 [DEBUG] ProfileId do AsyncStorage:', profileId, 'Tipo:', typeof profileId);
      if (!profileId) {
        console.error('❌ [DEBUG] ProfileId não encontrado no AsyncStorage');
        Alert.alert('Erro', 'Nenhum perfil ativo encontrado. Por favor, selecione um perfil.');
        setLoading(false);
        return;
      }

      // Usar data ISO armazenada ou converter se necessário
      let dataInicioISO = '';
      if (dataInicialISO) {
        // Usar o valor ISO armazenado
        dataInicioISO = dataInicialISO;
      } else if (dataInicial) {
        // Se já está em formato ISO (YYYY-MM-DD), usar diretamente
        if (/^\d{4}-\d{2}-\d{2}$/.test(dataInicial)) {
          dataInicioISO = dataInicial;
        } else {
          // Converter de pt-BR (DD/MM/YYYY) para ISO (YYYY-MM-DD)
          const partes = dataInicial.split('/');
          if (partes.length === 3) {
            dataInicioISO = `${partes[2]}-${partes[1]}-${partes[0]}`;
          } else {
            dataInicioISO = new Date().toISOString().split('T')[0];
          }
        }
      } else {
        dataInicioISO = new Date().toISOString().split('T')[0];
      }

      // Preparar dados para envio
      const perfilIdParsed = parseInt(profileId);
      console.log('🔍 [DEBUG] ProfileId parseado:', perfilIdParsed, 'É NaN?', isNaN(perfilIdParsed));
      
      const medicamentoData = {
        nome_medicamento: nome.trim(),
        dosagem: dosagem.trim(),
        frequencia_horas: parseInt(frequenciaHoras),
        duracao_dias_tratamento: usoContinuo ? 0 : parseInt(duracaoDias),
        data_inicio_tratamento: dataInicioISO,
        uso_continuo: usoContinuo ? 1 : 0, // Converter para número (1 ou 0)
        lembretes_ativos: lembretesAtivos ? 1 : 0, // Converter para número (1 ou 0)
        perfil_id: perfilIdParsed
      };

      console.log('📤 [DEBUG] Enviando dados do medicamento:', JSON.stringify(medicamentoData, null, 2));
      console.log('🔍 [DEBUG] URL da requisição:', `${API_CONFIG.BASE_URL}${ENDPOINTS.MEDICATION_RECORDS}`);
      console.log('🔍 [DEBUG] Token presente?', token ? 'Sim' : 'Não');

      console.log('📡 [DEBUG] Iniciando requisição POST...');
      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.MEDICATION_RECORDS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(medicamentoData),
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
        throw new Error(result.message || `Erro ao salvar medicamento. Status: ${response.status}`);
      }

      console.log('✅ [DEBUG] Medicamento salvo com sucesso:', JSON.stringify(result, null, 2));
      Alert.alert('Sucesso!', 'Medicamento registrado com sucesso!');
      router.back();
    } catch (error: any) {
      console.error('❌ [DEBUG] Erro completo ao salvar medicamento:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        error: error
      });
      Alert.alert('Erro', error.message || 'Não foi possível salvar o medicamento.');
    } finally {
      setLoading(false);
    }
  };


  const dosagens = ['50 mg', '100 mg', '150 mg', '200 mg', '250 mg', '500 mg'];

  const showDosagemPicker = () => {
    setShowDosagemModal(true);
  };

  const selectDosagem = (dosagemSelecionada: string) => {
    setDosagem(dosagemSelecionada);
    setShowDosagemModal(false);
  };

  const showDataInicialPicker = () => {
    // Inicializar com a data atual ou a data já selecionada
    if (dataInicialISO) {
      const date = new Date(dataInicialISO);
      setSelectedCalendarDate(date);
      setCurrentMonth(date.getMonth());
      setCurrentYear(date.getFullYear());
    }
    setShowDataInicialModal(true);
  };

  const confirmDateSelection = () => {
    const dataFormatada = selectedCalendarDate.toLocaleDateString('pt-BR');
    const dataISO = selectedCalendarDate.toISOString().split('T')[0];
    setDataInicial(dataFormatada);
    setDataInicialISO(dataISO);
    setShowDataInicialModal(false);
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



  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#004A61" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Medicamento</Text>
            <Text style={styles.headerSubtitle}>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>
        {/* Formulário */}
        <View style={styles.form}>
          {/* Nome do medicamento */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome do medicamento</Text>
            <TextInput
              style={styles.textInput}
              value={nome}
              onChangeText={setNome}
              placeholder="Digite o nome do medicamento"
              placeholderTextColor="#999"
            />
          </View>

          {/* Frequência em horas */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Frequência (horas)</Text>
            <TextInput
              style={styles.textInput}
              value={frequenciaHoras}
              onChangeText={setFrequenciaHoras}
              placeholder="Ex: 8 (a cada 8 horas)"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          {/* Dosagem */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dosagem</Text>
            <TouchableOpacity style={styles.input} onPress={showDosagemPicker}>
              <Text style={[styles.inputText, !dosagem && styles.inputTextPlaceholder]}>
                {dosagem || 'Selecione a dosagem'}
              </Text>
              <Feather name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Data inicial */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data inicial</Text>
            <TouchableOpacity style={styles.input} onPress={showDataInicialPicker}>
              <Text style={[styles.inputText, !dataInicial && styles.inputTextPlaceholder]}>
                {dataInicial || 'Selecione a data inicial'}
              </Text>
              <Feather name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Duração do tratamento em dias */}
          {!usoContinuo && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Duração do tratamento (dias)</Text>
            <TextInput
                style={styles.textInput}
              value={duracaoDias}
              onChangeText={setDuracaoDias}
              placeholder="Ex: 30 (30 dias)"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>
          )}

          {/* Checkbox Uso contínuo */}
          <View style={styles.checkboxContainer}>
            <TouchableOpacity 
              style={[styles.checkbox, usoContinuo && styles.checkboxChecked]}
              onPress={() => setUsoContinuo(!usoContinuo)}
            >
              {usoContinuo && <Feather name="check" size={16} color="#FFFFFF" />}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Uso contínuo?</Text>
          </View>

          {/* Lembretes ativos */}
          <View style={styles.checkboxContainer}>
            <TouchableOpacity 
              style={[styles.checkbox, lembretesAtivos && styles.checkboxChecked]}
              onPress={() => setLembretesAtivos(!lembretesAtivos)}
            >
              {lembretesAtivos && <Feather name="check" size={16} color="#FFFFFF" />}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Lembretes ativos?</Text>
          </View>
        </View>

        {/* Botão Salvar */}
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>Salvar</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de Confirmação */}
      <Modal
        visible={showConfirmationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Confirmar Medicamento</Text>
              <TouchableOpacity
                onPress={() => setShowConfirmationModal(false)}
                style={styles.modalCloseButton}
              >
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalSubtitle}>Confirme os dados do medicamento:</Text>
              
              <View style={styles.confirmationItem}>
                <Text style={styles.confirmationLabel}>Nome:</Text>
                <Text style={styles.confirmationValue}>{nome}</Text>
              </View>

              <View style={styles.confirmationItem}>
                <Text style={styles.confirmationLabel}>Dosagem:</Text>
                <Text style={styles.confirmationValue}>{dosagem}</Text>
              </View>

              <View style={styles.confirmationItem}>
                <Text style={styles.confirmationLabel}>Frequência (horas):</Text>
                <Text style={styles.confirmationValue}>{frequenciaHoras}</Text>
              </View>

              <View style={styles.confirmationItem}>
                <Text style={styles.confirmationLabel}>Data inicial:</Text>
                <Text style={styles.confirmationValue}>
                  {dataInicial || 'Hoje'}
                </Text>
              </View>

              <View style={styles.confirmationItem}>
                <Text style={styles.confirmationLabel}>Duração (dias):</Text>
                <Text style={styles.confirmationValue}>{duracaoDias}</Text>
              </View>

              <View style={styles.confirmationItem}>
                <Text style={styles.confirmationLabel}>Uso contínuo:</Text>
                <Text style={styles.confirmationValue}>
                  {usoContinuo ? 'Sim' : 'Não'}
                </Text>
              </View>

              <View style={styles.confirmationItem}>
                <Text style={styles.confirmationLabel}>Lembretes ativos:</Text>
                <Text style={styles.confirmationValue}>
                  {lembretesAtivos ? 'Sim' : 'Não'}
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

      {/* Modal de Seleção de Dosagem */}
      <Modal
        visible={showDosagemModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDosagemModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.dosagemModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione a Dosagem</Text>
              <TouchableOpacity
                onPress={() => setShowDosagemModal(false)}
                style={styles.modalCloseButton}
              >
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.dosagemModalContent}>
              {dosagens.map((dosagemItem, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dosagemOption,
                    dosagem === dosagemItem && styles.dosagemOptionSelected
                  ]}
                  onPress={() => selectDosagem(dosagemItem)}
                >
                  <Text style={[
                    styles.dosagemOptionText,
                    dosagem === dosagemItem && styles.dosagemOptionTextSelected
                  ]}>
                    {dosagemItem}
                  </Text>
                  {dosagem === dosagemItem && (
                    <Feather name="check" size={20} color="#004A61" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowDosagemModal(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Seleção de Data Inicial - Calendário */}
      <Modal
        visible={showDataInicialModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDataInicialModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione a Data Inicial</Text>
              <TouchableOpacity
                onPress={() => setShowDataInicialModal(false)}
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
                onPress={() => setShowDataInicialModal(false)}
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
  inputText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  inputTextPlaceholder: {
    color: '#999',
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
    backgroundColor: '#999',
    elevation: 0,
  },
  saveButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#004A61',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#004A61',
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#004A61',
  },
  // Estilos do Modal de Confirmação
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    width: '100%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
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
  modalContent: {
    padding: 20,
    maxHeight: 300,
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
  // Estilos do Modal de Dosagem
  dosagemModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    width: '90%',
    maxWidth: 400,
    maxHeight: '70%',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  dosagemModalContent: {
    padding: 20,
    maxHeight: 300,
  },
  dosagemOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  dosagemOptionSelected: {
    backgroundColor: '#E8F4F8',
    borderColor: '#004A61',
    borderWidth: 2,
  },
  dosagemOptionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  dosagemOptionTextSelected: {
    color: '#004A61',
    fontWeight: 'bold',
  },
  // Estilos do Calendário
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
});
