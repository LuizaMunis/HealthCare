// HealthCare_FrontEnd/src/app/AdditionalData.tsx

import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import ApiService from '@/services/apiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  Modal
} from 'react-native';

export default function AdditionalDataScreen() {
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [genero, setGenero] = useState('');
  const [showGeneroModal, setShowGeneroModal] = useState(false);
  const router = useRouter();

  // Verificar token ao carregar a tela
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('healthcare_auth_token');
        console.log('Token na tela AdditionalData:', token ? 'Presente' : 'Ausente');
        if (token) {
          console.log('Token completo:', token.substring(0, 50) + '...');
        }
      } catch (error) {
        console.error('Erro ao verificar token:', error);
      }
    };
    
    checkToken();
  }, []);

  // Função para aplicar máscara de CPF
  const formatCPF = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return text;
  };

  // Função para aplicar máscara de telefone
  const formatTelefone = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return text;
  };

  // Função para aplicar máscara de data
  const formatData = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
    }
    return text;
  };

  // Função para aplicar máscara de peso
  const formatPeso = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 4) {
      const kg = numbers.slice(0, -2);
      const g = numbers.slice(-2);
      if (g.length > 0) {
        return `${kg || '0'},${g} Kg`;
      }
      return kg ? `${kg} Kg` : '';
    }
    return text;
  };

  // Função para aplicar máscara de altura
  const formatAltura = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 3) {
      return numbers ? `${numbers} CM` : '';
    }
    return text;
  };

  const handleContinue = async () => {
    console.log('Valores dos campos:');
    console.log('CPF:', cpf);
    console.log('Telefone:', telefone);
    console.log('Data Nascimento:', dataNascimento);
    console.log('Peso:', peso);
    console.log('Altura:', altura);
    console.log('Gênero:', genero);
    
    if (!cpf.trim() || !telefone.trim() || 
        !dataNascimento.trim() || !peso.trim() || !altura.trim() || !genero) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      // Limpar dados para enviar ao backend
      const cpfLimpo = cpf.replace(/\D/g, '');
      const telefoneLimpo = telefone.replace(/\D/g, '');
      
      // Converter data de DD/MM/AAAA para AAAA-MM-DD
      const dataParts = dataNascimento.split('/');
      const dataFormatada = dataParts.length === 3 
        ? `${dataParts[2]}-${dataParts[1]}-${dataParts[0]}`
        : dataNascimento;
      
      // Extrair peso (remover "Kg" e converter vírgula para ponto)
      const pesoLimpo = peso.replace(/[^\d,]/g, '').replace(',', '.');
      
      // Extrair altura (remover "CM")
      const alturaLimpa = altura.replace(/\D/g, '');
      
      // Mapear gênero para o formato do backend - TESTE: usar nome completo
      const generoMapeado = genero === 'masculino' ? 'MASCULINO' : 
                           genero === 'feminino' ? 'FEMININO' : 'OUTRO';
      
      console.log('Gênero original:', genero);
      console.log('Gênero mapeado:', generoMapeado);

      const profileData = {
        cpf: cpfLimpo,
        celular: telefoneLimpo,
        data_nascimento: dataFormatada,
        peso: parseFloat(pesoLimpo),
        altura: parseInt(alturaLimpa),
        genero: generoMapeado
      };

      console.log('Enviando dados para API:', profileData);
      const result = await ApiService.saveAdditionalProfile(profileData);
      console.log('Resposta da API:', result);

      if (result.success) {
        console.log('✅ Navegando para home...');
        setTimeout(() => {
          router.replace('/(tabs)/home');
        }, 100);
      } else {
        Alert.alert('Erro', result.error || 'Erro ao salvar dados adicionais.');
      }
    } catch (error) {
      console.error('Erro ao salvar dados adicionais:', error);
      Alert.alert('Erro', 'Erro ao conectar com o servidor. Tente novamente.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color="#004A61" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Dados adicionais</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.form}>
            <Text style={styles.welcomeTitle}>Seja bem-vindo!</Text>
            <Text style={styles.welcomeSubtitle}>Cadastre sua conta.</Text>

            <Text style={styles.label}>CPF</Text>
            <TextInput
              style={styles.input}
              placeholder="000.000.000-00"
              value={cpf}
              onChangeText={(text) => setCpf(formatCPF(text))}
              keyboardType="numeric"
              maxLength={14}
            />

            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              placeholder="(00) 90000-0000"
              value={telefone}
              onChangeText={(text) => setTelefone(formatTelefone(text))}
              keyboardType="numeric"
              maxLength={15}
            />

            <Text style={styles.label}>Data de Nascimento</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/AAAA"
              value={dataNascimento}
              onChangeText={(text) => setDataNascimento(formatData(text))}
              keyboardType="numeric"
              maxLength={10}
            />

            <Text style={styles.label}>Peso (Kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="00,00 Kg"
              value={peso}
              onChangeText={(text) => setPeso(formatPeso(text))}
              keyboardType="numeric"
              maxLength={8}
            />

            <Text style={styles.label}>Altura (CM)</Text>
            <TextInput
              style={styles.input}
              placeholder="000 CM"
              value={altura}
              onChangeText={(text) => setAltura(formatAltura(text))}
              keyboardType="numeric"
              maxLength={6}
            />

            <Text style={styles.label}>Gênero</Text>
            <TouchableOpacity 
              style={styles.input} 
              onPress={() => setShowGeneroModal(true)}
            >
              <Text style={genero ? { color: '#334155' } : { color: '#64748B' }}>
                {genero === 'masculino' ? 'Masculino' : 
                 genero === 'feminino' ? 'Feminino' : 
                 genero === 'nao_informado' ? 'Prefiro não dizer' : 
                 'Selecione o gênero'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleContinue}>
              <Text style={styles.buttonText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal para seleção de gênero */}
      <Modal
        visible={showGeneroModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowGeneroModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione o gênero</Text>
            
            <TouchableOpacity 
              style={styles.modalOption} 
              onPress={() => {
                setGenero('masculino');
                setShowGeneroModal(false);
              }}
            >
              <Text style={styles.modalOptionText}>Masculino</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalOption} 
              onPress={() => {
                setGenero('feminino');
                setShowGeneroModal(false);
              }}
            >
              <Text style={styles.modalOptionText}>Feminino</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalOption} 
              onPress={() => {
                setGenero('nao_informado');
                setShowGeneroModal(false);
              }}
            >
              <Text style={styles.modalOptionText}>Prefiro não dizer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalCancel} 
              onPress={() => setShowGeneroModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  scrollContainer: { 
    flexGrow: 1, 
    justifyContent: 'center' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    width: '100%',
  },
  backButton: {},
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#004A61',
  },
  form: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 10,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    color: '#334155',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 15,
    paddingVertical: 18,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  button: {
    backgroundColor: '#004A61',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004A61',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#334155',
    textAlign: 'center',
  },
  modalCancel: {
    paddingVertical: 15,
    marginTop: 10,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
});
