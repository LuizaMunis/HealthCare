import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const [telefone, setTelefone] = useState(data.phone);
  const [dataNascimento, setDataNascimento] = useState(data.birthDate);
  const [peso, setPeso] = useState(data.weight);
  const [altura, setAltura] = useState(data.height);
  const [genero, setGenero] = useState(data.gender);
  const [showGeneroModal, setShowGeneroModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      setCpf(data.cpf);
      setTelefone(data.phone);
      setDataNascimento(data.birthDate);
      setPeso(data.weight);
      setAltura(data.height);
      setGenero(data.gender);
    }
  }, [visible, data]);

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

  const handleSave = async () => {
    if (!cpf.trim() || !telefone.trim() || 
        !dataNascimento.trim() || !peso.trim() || !altura.trim() || !genero) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsLoading(true);
    try {
      // Processar dados no mesmo formato que Perfil.tsx
      const cpfLimpo = cpf.replace(/\D/g, '');
      const telefoneLimpo = telefone.replace(/\D/g, '');
      
      // Converter data de DD/MM/AAAA para AAAA-MM-DD
      const dataParts = dataNascimento.split('/');
      const dataFormatada = dataParts.length === 3 
        ? `${dataParts[2]}-${dataParts[1]}-${dataParts[0]}`
        : dataNascimento;
      
      // Extrair peso (converter vírgula para ponto)
      let pesoLimpo;
      if (peso.includes(',')) {
        pesoLimpo = peso.replace(',', '.');
      } else {
        // Se não tem vírgula, assume que são kg (não gramas)
        pesoLimpo = peso;
      }
      
      // Altura já está limpa (apenas números)
      const alturaLimpa = altura;
      
      // Mapear gênero para o formato do backend (igual ao Perfil.tsx)
      const generoMapeado = genero === 'masculino' ? 'MASCULINO' : 
                           genero === 'feminino' ? 'FEMININO' : 'OUTRO';

      await onSave({ 
        cpf: cpfLimpo, 
        phone: telefoneLimpo, 
        birthDate: dataFormatada, 
        weight: pesoLimpo, 
        height: alturaLimpa, 
        gender: generoMapeado 
      });
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* Header fixo */}
          <View style={[styles.header, { paddingTop: insets.top }]}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color="#004A61" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Dados do Perfil</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* ScrollView apenas para os campos */}
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.form}>
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
            </View>
          </ScrollView>

          {/* Footer fixo com o botão */}
          <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={handleSave}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Salvando...' : 'Salvar Perfil'}
              </Text>
            </TouchableOpacity>
          </View>
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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFFFFF' 
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: { 
    paddingBottom: 20, // Espaço para o footer
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
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  button: {
    backgroundColor: '#004A61',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
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