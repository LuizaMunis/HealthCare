import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, ENDPOINTS } from '@/constants/api';

interface VaccineData {
  id: number;
  nome: string;
  dose: string;
  data_vacinacao: string;
}

export default function EditarVacinaScreen() {
  const router = useRouter();
  const { vacina } = useLocalSearchParams();
  
  // Estados dos campos
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
  
  // Estados de controle
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Carregar dados da vacina
  useEffect(() => {
    if (vacina) {
      try {
        const vacinaData: VaccineData = JSON.parse(vacina as string);
        setNomeVacina(vacinaData.nome || '');
        setDose(vacinaData.dose || '');
        
        // Converter data para formato DD/MM/AAAA
        const date = new Date(vacinaData.data_vacinacao);
        const formattedDate = date.toLocaleDateString('pt-BR');
        setDataAplicacao(formattedDate);
      } catch (error) {
        console.error('Erro ao carregar dados da vacina:', error);
        Alert.alert('Erro', 'Erro ao carregar dados da vacina');
        router.back();
      }
    }
    setInitialLoading(false);
  }, [vacina]);

  // Funções de validação (reutilizadas da nova-vacina.tsx)
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

  const handleSave = async () => {
    // Validar todos os campos antes de prosseguir
    if (!validateAllFields()) {
      Alert.alert('Campos obrigatórios', 'Por favor, corrija os erros nos campos destacados em vermelho.');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      if (!token) {
        Alert.alert('Erro de Autenticação', 'Você não está logado.');
        return;
      }

      const activeProfileId = await AsyncStorage.getItem('active_profile_id');
      if (!activeProfileId) {
        Alert.alert('Erro', 'Perfil não encontrado.');
        return;
      }

      // Converter data DD/MM/AAAA para formato ISO
      let formattedDate = dataAplicacao;
      if (dataAplicacao.includes('/')) {
        const [day, month, year] = dataAplicacao.split('/');
        formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }

      const vacinaData = {
        nome: nomeVacina.trim(),
        dose: dose.trim(),
        data_vacinacao: `${formattedDate}T00:00:00`,
        perfil_id: parseInt(activeProfileId)
      };

      const vacinaId = JSON.parse(vacina as string).id;
      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.VACCINE_RECORDS}/${vacinaId}?perfil_id=${activeProfileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(vacinaData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao atualizar vacina.');
      }

      Alert.alert('Sucesso!', 'Vacina atualizada com sucesso!');
      router.back();
    } catch (error: any) {
      console.error('Erro ao atualizar vacina:', error);
      Alert.alert('Erro', error.message || 'Não foi possível atualizar a vacina.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancelar Edição',
      'Tem certeza que deseja cancelar? As alterações serão perdidas.',
      [
        { text: 'Continuar Editando', style: 'cancel' },
        { text: 'Cancelar', style: 'destructive', onPress: () => router.back() }
      ]
    );
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#004A61" />
          <Text style={styles.loadingText}>Carregando dados da vacina...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#004A61" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.titleButton}>
            <Text style={styles.title}>Editar Vacina</Text>
          </TouchableOpacity>
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

      {/* Botões de Ação */}
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={handleCancel}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        
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
      </View>
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
  backButton: {
    padding: 8,
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
  required: {
    color: '#FF4444',
    fontWeight: 'bold',
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
  errorText: {
    color: '#FF4444',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#004A61',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 12,
  },
  saveButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    fontWeight: '500',
  },
});
