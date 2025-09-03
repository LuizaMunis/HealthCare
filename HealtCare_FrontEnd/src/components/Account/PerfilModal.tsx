import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Dimensions,
} from 'react-native';
import NumericInput from '../ui/NumericInput';
import { formatCPF, formatPhoneNumber } from '@/utils/formatters';

interface PerfilData {
  cpf: string;
  phone: string;
  birthDate: string;
  weight: string;
  height: string;
  gender: string;
}

interface PerfilModalProps {
  visible: boolean;
  onClose: () => void;
  data: PerfilData;
  onSave: (data: PerfilData) => Promise<void>;
}

export default function PerfilModal({ visible, onClose, data, onSave }: PerfilModalProps) {
  const [cpf, setCpf] = useState(data.cpf);
  const [phone, setPhone] = useState(data.phone);
  const [birthDate, setBirthDate] = useState(data.birthDate);
  const [weight, setWeight] = useState(data.weight);
  const [height, setHeight] = useState(data.height);
  const [gender, setGender] = useState(data.gender);
  const [cpfError, setCpfError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Calcular altura da tela para espaçamento dinâmico
  const screenHeight = Dimensions.get('window').height;
  const dynamicSpacing = Math.max(screenHeight * 0.15, 150); // 15% da tela ou mínimo 150px

  useEffect(() => {
    if (visible) {
      setCpf(data.cpf);
      setPhone(data.phone);
      setBirthDate(data.birthDate);
      setWeight(data.weight);
      setHeight(data.height);
      setGender(data.gender);
      setCpfError('');
    }
  }, [visible, data]);

  // Formatação automática de CPF
  const handleCpfChange = (text: string) => {
    const formattedCpf = formatCPF(text);
    setCpf(formattedCpf);
    setCpfError(''); // Limpa erro quando usuário digita
  };

  // Formatação automática de telefone
  const handlePhoneChange = (text: string) => {
    const formattedPhone = formatPhoneNumber(text);
    setPhone(formattedPhone);
  };

  // Formatação automática de data
  const handleDateChange = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 8) {
      const formatted = numbers.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
      setBirthDate(formatted);
    } else {
      setBirthDate(text);
    }
  };

  const validateForm = () => {
    // Validar CPF
    if (cpf && cpf.replace(/\D/g, '').length !== 11) {
      setCpfError('CPF deve ter 11 dígitos');
      return false;
    }

    // Validar telefone
    if (phone && phone.replace(/\D/g, '').length < 10) {
      Alert.alert('Erro', 'Telefone deve ter pelo menos 10 dígitos');
      return false;
    }

    // Validar data de nascimento
    if (birthDate && birthDate.replace(/\D/g, '').length !== 8) {
      Alert.alert('Erro', 'Data de nascimento deve ter 8 dígitos (DD/MM/AAAA)');
      return false;
    }

    // Validar peso
    if (weight && (parseFloat(weight.replace(',', '.')) < 20 || parseFloat(weight.replace(',', '.')) > 500)) {
      Alert.alert('Erro', 'Peso deve estar entre 20 e 500 kg');
      return false;
    }

    // Validar altura
    if (height && (parseInt(height) < 50 || parseInt(height) > 250)) {
      Alert.alert('Erro', 'Altura deve estar entre 50 e 250 cm');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave({ cpf, phone, birthDate, weight, height, gender });
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
                 <KeyboardAvoidingView
           behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
           style={styles.keyboardAvoidingContainer}
           keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
          
          {/* Header Padronizado */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Feather name="arrow-left" size={24} color="#004A61" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Dados do Perfil</Text>
            <View style={styles.headerPlaceholder} />
          </View>

                     {/* ScrollView para os campos */}
           <ScrollView 
             style={styles.scrollView}
             contentContainerStyle={[styles.scrollContent, { flexGrow: 1 }]}
             showsVerticalScrollIndicator={false}
             keyboardShouldPersistTaps="handled">
            
            <Text style={styles.label}>CPF</Text>
            <TextInput 
              style={[styles.input, cpfError ? styles.inputError : null]} 
              value={cpf} 
              onChangeText={handleCpfChange} 
              placeholder="000.000.000-00"
              keyboardType="numeric"
              maxLength={14}
            />
            {cpfError ? <Text style={styles.errorText}>{cpfError}</Text> : null}

            <Text style={styles.label}>Telefone</Text>
            <TextInput 
              style={styles.input} 
              value={phone} 
              onChangeText={handlePhoneChange} 
              placeholder="(00) 90000-0000"
              keyboardType="numeric"
              maxLength={15}
            />
            
            <Text style={styles.label}>Data de Nascimento</Text>
            <TextInput 
              style={styles.input} 
              value={birthDate} 
              onChangeText={handleDateChange} 
              placeholder="DD/MM/AAAA"
              keyboardType="numeric"
              maxLength={10}
            />

            <Text style={styles.label}>Peso (Kg)</Text>
            <NumericInput 
              value={weight} 
              onChangeText={setWeight}
              allowDecimal={true}
              maxLength={6}
              placeholder="70,5" 
            />

            <Text style={styles.label}>Altura (CM)</Text>
            <NumericInput 
              value={height} 
              onChangeText={setHeight}
              allowDecimal={false}
              maxLength={3}
              placeholder="170" 
            />

            <Text style={styles.label}>Gênero</Text>
            <View style={styles.genderContainer}>
              {['Masculino', 'Feminino', 'Outro'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.genderOption,
                    gender === option && styles.genderOptionSelected
                  ]}
                  onPress={() => setGender(option)}
                >
                  <Text style={[
                    styles.genderOptionText,
                    gender === option && styles.genderOptionTextSelected
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
                         {/* Botão de Ação dentro do ScrollView */}
             <TouchableOpacity 
               style={[styles.actionButton, isLoading && styles.actionButtonDisabled]} 
               onPress={handleSave}
               disabled={isLoading}
             >
               <Text style={styles.actionButtonText}>
                 {isLoading ? 'Salvando...' : 'Salvar perfil'}
               </Text>
             </TouchableOpacity>
             
             {/* Espaço extra no final para garantir que o botão não fique colado */}
             <View style={[styles.finalSpacer, { height: dynamicSpacing }]} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

// Estilos Padronizados
const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: 'white',
  },
  keyboardAvoidingContainer: { 
    flex: 1 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f0f0f0' 
  },
  headerTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: '#004A61' 
  },
  headerPlaceholder: { 
    width: 24 
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: { 
    paddingHorizontal: 20, 
    paddingTop: 20,
    paddingBottom: 40, // Padding adequado para o conteúdo
  },
  label: { 
    fontSize: 16, 
    color: 'gray', 
    marginTop: 20, 
    marginBottom: 8 
  },
  input: { 
    backgroundColor: '#F6F6F6', 
    padding: 15, 
    borderRadius: 10, 
    fontSize: 16, 
    borderWidth: 1, 
    borderColor: '#E8E8E8' 
  },
  inputError: { 
    borderColor: '#ff6b6b' 
  },
  errorText: { 
    color: '#ff6b6b', 
    fontSize: 12, 
    marginTop: 4 
  },
  genderContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 10 
  },
  genderOption: { 
    flex: 1, 
    padding: 12, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#E8E8E8', 
    marginHorizontal: 4,
    alignItems: 'center'
  },
  genderOptionSelected: { 
    backgroundColor: '#004A61', 
    borderColor: '#004A61' 
  },
  genderOptionText: { 
    color: 'gray', 
    fontSize: 14 
  },
  genderOptionTextSelected: { 
    color: 'white', 
    fontWeight: 'bold' 
  },
  actionButton: { 
    backgroundColor: '#004A61', 
    padding: 18, 
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  finalSpacer: {
    // Altura será definida dinamicamente baseada na altura da tela
  },
  actionButtonDisabled: { 
    backgroundColor: '#ccc' 
  },
  actionButtonText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 16 
  },
});
