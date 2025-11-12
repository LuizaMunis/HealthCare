import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
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
        if (!value.trim()) {
          error = 'Data de aplicação é obrigatória';
        } else if (value.includes('/')) {
          const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
          if (!dateRegex.test(value)) {
            error = 'Data deve estar no formato DD/MM/AAAA';
          } else {
            const [day, month, year] = value.split('/');
            const selectedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            
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

    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      if (!token) {
        Alert.alert('Erro de Autenticação', 'Você não está logado.');
        return;
      }

      // Converter data para formato ISO se necessário
      let dataISO = dataAplicacao;
      if (dataAplicacao.includes('/')) {
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
    } catch (error: any) {
      console.error('Erro geral na função handleSave:', error);
      Alert.alert('Erro', 'Ocorreu um erro inesperado. Tente novamente.');
    }
  };

  const handleDateInputChange = (text: string) => {
    // Remove todos os caracteres não numéricos
    let cleanedText = text.replace(/\D/g, '');

    // Aplica o formato DD/MM/AAAA automaticamente
    if (cleanedText.length > 2) {
      cleanedText = cleanedText.slice(0, 2) + '/' + cleanedText.slice(2);
    }
    if (cleanedText.length > 5) {
      cleanedText = cleanedText.slice(0, 5) + '/' + cleanedText.slice(5, 9);
    }

    // Limita a 10 caracteres (DD/MM/AAAA)
    if (cleanedText.length > 10) {
      cleanedText = cleanedText.slice(0, 10);
    }

    handleFieldChange('dataAplicacao', cleanedText);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#004A61" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.titleButton}>
            <Text style={styles.title}>Nova vacina</Text>
          </View>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
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
            <TextInput
              style={[
                styles.input,
                touched.dataAplicacao && errors.dataAplicacao && styles.inputError
              ]}
              value={dataAplicacao}
              onChangeText={handleDateInputChange}
              onBlur={() => handleFieldBlur('dataAplicacao')}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={10}
            />
            {touched.dataAplicacao && errors.dataAplicacao && (
              <Text style={styles.errorText}>{errors.dataAplicacao}</Text>
            )}
          </View>

        </View>
      </ScrollView>

      {/* Botão Salvar */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Salvar</Text>
      </TouchableOpacity>

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
});
