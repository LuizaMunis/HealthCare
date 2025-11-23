import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, ENDPOINTS } from '@/constants/api';

export default function NovaVacinaScreen() {
  const router = useRouter();
  const [nomeVacina, setNomeVacina] = useState('');
  const [dose, setDose] = useState('');
  const [dataAplicacao, setDataAplicacao] = useState('');
  const [dataAplicacaoISO, setDataAplicacaoISO] = useState('');
  
  // Estados para calendário customizado (funciona na WEB)
  const [showDataAplicacaoModal, setShowDataAplicacaoModal] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Estados para validação e feedback visual
  const [errors, setErrors] = useState({
    nomeVacina: '',
    dose: '',
    dataAplicacao: ''
  });
  const [touched, setTouched] = useState({
    nomeVacina: false,
    dose: false,
    dataAplicacao: false
  });

  // Funções de validação
  const validateField = (field: string, value: string) => {
    let error = '';
    
    switch (field) {
      case 'nomeVacina':
        if (!value.trim()) {
          error = 'Nome da vacina é obrigatório';
        } else if (value.trim().length < 2) {
          error = 'Nome deve ter pelo menos 2 caracteres';
        } else if (value.trim().length > 100) {
          error = 'Nome deve ter no máximo 100 caracteres';
        }
        break;
        
      case 'dose':
        if (!value.trim()) {
          error = 'Dose é obrigatória';
        } else if (value.trim().length < 2) {
          error = 'Dose deve ter pelo menos 2 caracteres';
        } else if (value.trim().length > 50) {
          error = 'Dose deve ter no máximo 50 caracteres';
        }
        break;
        
      case 'dataAplicacao':
        if (!value.trim() && !dataAplicacaoISO) {
          error = 'Data de aplicação é obrigatória';
        } else if (dataAplicacaoISO) {
          const selectedDate = new Date(dataAplicacaoISO);
          
          if (isNaN(selectedDate.getTime())) {
            error = 'Data inválida';
          } else {
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            
            if (selectedDate > today) {
              error = 'Data não pode ser no futuro';
            } else {
              const minDate = new Date();
              minDate.setFullYear(minDate.getFullYear() - 10);
              
              if (selectedDate < minDate) {
                error = 'Data muito antiga (máximo 10 anos)';
              }
            }
          }
        }
        break;
    }
    
    return error;
  };

  const validateAllFields = () => {
    const newErrors = {
      nomeVacina: validateField('nomeVacina', nomeVacina),
      dose: validateField('dose', dose),
      dataAplicacao: validateField('dataAplicacao', dataAplicacao)
    };
    
    setErrors(newErrors);
    
    // Marcar todos os campos como tocados
    setTouched({
      nomeVacina: true,
      dose: true,
      dataAplicacao: true
    });
    
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleFieldChange = (field: string, value: string) => {
    // Atualizar o valor do campo
    switch (field) {
      case 'nomeVacina':
        setNomeVacina(value);
        break;
      case 'dose':
        setDose(value);
        break;
      case 'dataAplicacao':
        setDataAplicacao(value);
        break;
    }
    
    // Validar o campo em tempo real se já foi tocado
    if (touched[field as keyof typeof touched]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const value = field === 'nomeVacina' ? nomeVacina : 
                 field === 'dose' ? dose :
                 field === 'dataAplicacao' ? dataAplicacao : '';
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSave = async () => {
    // Validar todos os campos antes de prosseguir
    if (!validateAllFields()) {
      Alert.alert('Campos obrigatórios', 'Por favor, corrija os erros nos campos destacados em vermelho.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      if (!token) {
        Alert.alert('Erro de Autenticação', 'Você não está logado.');
        return;
      }

      // Obter o perfil_id ativo do usuário
      const profileId = await AsyncStorage.getItem('active_profile_id');
      if (!profileId) {
        Alert.alert('Erro', 'Nenhum perfil ativo encontrado. Por favor, selecione um perfil.');
        return;
      }

      // Usar data ISO se disponível, senão converter do formato DD/MM/AAAA
      let dataISO = dataAplicacaoISO;
      if (!dataISO && dataAplicacao.includes('/')) {
        const [day, month, year] = dataAplicacao.split('/');
        const fullYear = parseInt(year, 10);
        dataISO = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.VACCINE_RECORDS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: nomeVacina,
          dose: dose,
          data_vacinacao: dataISO,
          perfil_id: parseInt(profileId),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao salvar vacina.');
      }

      Alert.alert('Sucesso!', 'Vacina registrada com sucesso!');
      router.back();
    } catch (error: any) {
      console.error('Erro ao salvar vacina:', error);
      Alert.alert('Erro', error.message || 'Não foi possível salvar a vacina.');
    }
  };

  // Funções do calendário customizado (padrão Medicamentos)
  const showDataAplicacaoPicker = () => {
    if (dataAplicacaoISO) {
      const date = new Date(dataAplicacaoISO);
      setSelectedCalendarDate(date);
      setCurrentMonth(date.getMonth());
      setCurrentYear(date.getFullYear());
    }
    setShowDataAplicacaoModal(true);
  };

  const confirmDateSelection = () => {
    const selectedDate = selectedCalendarDate;
    
    // Validar que a data não seja no futuro
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (selectedDate > today) {
      Alert.alert('Data inválida', 'A data não pode ser no futuro.');
      return;
    }
    
    // Validar que a data não seja muito antiga (máximo 10 anos)
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 10);
    if (selectedDate < minDate) {
      Alert.alert('Data inválida', 'A data não pode ser muito antiga (máximo 10 anos).');
      return;
    }
    
    const dataFormatada = selectedDate.toLocaleDateString('pt-BR');
    const dataISO = selectedDate.toISOString().split('T')[0];
    
    setDataAplicacao(dataFormatada);
    setDataAplicacaoISO(dataISO);
    handleFieldChange('dataAplicacao', dataFormatada);
    setShowDataAplicacaoModal(false);
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#004A61" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Vacinação</Text>
            <Text style={styles.headerSubtitle}>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>
        {/* Formulário */}
        <View style={styles.form}>
          {/* Nome da vacina */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Nome da vacina <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                touched.nomeVacina && errors.nomeVacina && styles.inputError
              ]}
              value={nomeVacina}
              onChangeText={(value) => handleFieldChange('nomeVacina', value)}
              onBlur={() => handleFieldBlur('nomeVacina')}
              placeholder="Digite o nome da vacina"
              placeholderTextColor="#999"
            />
            {touched.nomeVacina && errors.nomeVacina && (
              <Text style={styles.errorText}>{errors.nomeVacina}</Text>
            )}
          </View>

          {/* Dose */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Dose <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                touched.dose && errors.dose && styles.inputError
              ]}
              value={dose}
              onChangeText={(value) => handleFieldChange('dose', value)}
              onBlur={() => handleFieldBlur('dose')}
              placeholder="Ex: 1ª dose, 2ª dose, reforço"
              placeholderTextColor="#999"
            />
            {touched.dose && errors.dose && (
              <Text style={styles.errorText}>{errors.dose}</Text>
            )}
          </View>

          {/* Data de aplicação */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Data de aplicação <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={[
                styles.dateInputButton,
                !dataAplicacao && styles.dateInputButtonPlaceholder,
                touched.dataAplicacao && errors.dataAplicacao && styles.inputError
              ]}
              onPress={showDataAplicacaoPicker}
            >
              <Text style={[
                styles.dateInputButtonText,
                !dataAplicacao && styles.dateInputButtonTextPlaceholder
              ]}>
                {dataAplicacao || 'Selecione a data de aplicação'}
              </Text>
              <Feather name="chevron-down" size={20} color={dataAplicacao ? "#004A61" : "#999"} />
            </TouchableOpacity>
            {touched.dataAplicacao && errors.dataAplicacao && (
              <Text style={styles.errorText}>{errors.dataAplicacao}</Text>
            )}
          </View>

        </View>

        {/* Botão Salvar */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Salvar</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modal de Seleção de Data de Aplicação - Calendário Customizado (funciona na WEB) */}
      <Modal
        visible={showDataAplicacaoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDataAplicacaoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.calendarModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione a Data de Aplicação</Text>
              <TouchableOpacity
                onPress={() => setShowDataAplicacaoModal(false)}
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
                onPress={() => setShowDataAplicacaoModal(false)}
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
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#FF4444',
    backgroundColor: '#FFF5F5',
  },
  required: {
    color: '#FF4444',
    fontWeight: 'bold',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
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
  // Estilos do Modal e Calendário Customizado (padrão Medicamentos)
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
});
