// HealthCare_FrontEnd/src/app/Perfil.tsx

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

export default function PerfilScreen() {
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
        console.log('Token na tela Perfil:', token ? 'Presente' : 'Ausente');
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

  // Função para aplicar máscara de peso com formatação automática
  const formatPeso = (text: string) => {
    // Remove todos os caracteres não numéricos
    const numbers = text.replace(/\D/g, '');
    
    if (numbers.length === 0) {
      return '';
    }
    
    // Se tem 3 ou mais dígitos, formata automaticamente com vírgula
    if (numbers.length >= 3) {
      const kg = numbers.slice(0, -2);
      const g = numbers.slice(-2);
      return `${kg},${g}`;
    }
    
    // Se tem 1 ou 2 dígitos, retorna como está (será interpretado como gramas)
    return numbers;
  };

  // Função para aplicar máscara de altura - apenas números
  const formatAltura = (text: string) => {
    // Remove todos os caracteres não numéricos
    return text.replace(/[^\d]/g, '');
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
      
      // Extrair peso (converter vírgula para ponto)
      // Se o peso não tem vírgula, assume que são gramas e converte para kg
      let pesoLimpo;
      if (peso.includes(',')) {
        pesoLimpo = peso.replace(',', '.');
      } else {
        // Se não tem vírgula, assume que são gramas (ex: "500" = 0.5 kg)
        pesoLimpo = (parseFloat(peso) / 1000).toString();
      }
      
      // Altura já está limpa (apenas números)
      const alturaLimpa = altura;
      
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
        Alert.alert('Erro', result.error || 'Erro ao salvar dados do perfil.');
      }
    } catch (error) {
      console.error('Erro ao salvar dados do perfil:', error);
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
            <Text style={styles.headerTitle}>Perfil</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={styles.form}>
            <Text style={styles.welcomeTitle}>Complete seu perfil!</Text>
            <Text style={styles.welcomeSubtitle}>Adicione suas informações pessoais.</Text>

            <Text style={styles.label}>CPF</Text>
            <TextInput
              style={styles.input}
              placeholder="000.000.000-00"
              placeholderTextColor="#CBD5E1"
              value={cpf}
              onChangeText={(text) => setCpf(formatCPF(text))}
              keyboardType="numeric"
              maxLength={14}
            />

            <Text style={styles.label}>Telefone</Text>
            <TextInput
              style={styles.input}
              placeholder="(00) 90000-0000"
              placeholderTextColor="#CBD5E1"
              value={telefone}
              onChangeText={(text) => setTelefone(formatTelefone(text))}
              keyboardType="numeric"
              maxLength={15}
            />

            <Text style={styles.label}>Data de Nascimento</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#CBD5E1"
              value={dataNascimento}
              onChangeText={(text) => setDataNascimento(formatData(text))}
              keyboardType="numeric"
              maxLength={10}
            />

            <Text style={styles.label}>Peso (Kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="00,00"
              placeholderTextColor="#CBD5E1"
              value={peso}
              onChangeText={(text) => setPeso(formatPeso(text))}
              keyboardType="numeric"
              maxLength={6}
            />

            <Text style={styles.label}>Altura (CM)</Text>
            <TextInput
              style={styles.input}
              placeholder="000"
              placeholderTextColor="#CBD5E1"
              value={altura}
              onChangeText={(text) => setAltura(formatAltura(text))}
              keyboardType="numeric"
              maxLength={3}
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
              <Text style={styles.buttonText}>Salvar Perfil</Text>
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
