import React, { useState } from 'react';
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
  Modal,
} from 'react-native';
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
  const [usoContinuo, setUsoContinuo] = useState(false);
  const [lembretesAtivos, setLembretesAtivos] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

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

    if (!duracaoDias || parseInt(duracaoDias) < 1) {
      Alert.alert('Erro', 'Por favor, insira a duração do tratamento em dias');
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

      // Obter o profileId do usuário (assumindo que existe um perfil ativo)
      const profileId = await AsyncStorage.getItem('active_profile_id');
      if (!profileId) {
        Alert.alert('Erro', 'Nenhum perfil ativo encontrado. Por favor, selecione um perfil.');
        return;
      }

      // Preparar dados para envio
      const medicamentoData = {
        nome_medicamento: nome.trim(),
        dosagem: dosagem.trim(),
        frequencia_horas: parseInt(frequenciaHoras),
        duracao_dias_tratamento: parseInt(duracaoDias),
        data_inicio_tratamento: dataInicial || new Date().toISOString().split('T')[0],
        uso_continuo: usoContinuo,
        lembretes_ativos: lembretesAtivos,
        perfil_id: parseInt(profileId)
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.MEDICATION_RECORDS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(medicamentoData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Erro ao salvar medicamento.');
      }

      Alert.alert('Sucesso!', 'Medicamento registrado com sucesso!');
      router.back();
    } catch (error: any) {
      console.error('Erro ao salvar medicamento:', error);
      Alert.alert('Erro', error.message || 'Não foi possível salvar o medicamento.');
    } finally {
      setLoading(false);
    }
  };

  const showDosesPicker = () => {
    Alert.alert(
      'Número de ingestões por dia',
      'Selecione o número de doses:',
      [
        { text: '1', onPress: () => setDosesPorDia('1') },
        { text: '2', onPress: () => setDosesPorDia('2') },
        { text: '3', onPress: () => setDosesPorDia('3') },
        { text: '4', onPress: () => setDosesPorDia('4') },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const showDosagemPicker = () => {
    const dosagens = ['50 mg', '100 mg', '150 mg', '200 mg', '250 mg', '500 mg'];
    Alert.alert(
      'Dosagem',
      'Selecione a dosagem:',
      [
        ...dosagens.map(d => ({
          text: d,
          onPress: () => setDosagem(d)
        })),
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const showDataInicialPicker = () => {
    const hoje = new Date();
    const datas = [];
    
    for (let i = 0; i < 365; i++) {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() + i);
      const dataStr = data.toLocaleDateString('pt-BR');
      datas.push(dataStr);
    }

    Alert.alert(
      'Data inicial',
      'Selecione a data:',
      [
        ...datas.slice(0, 20).map(d => ({
          text: d,
          onPress: () => setDataInicial(d)
        })),
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const showDuracaoPicker = () => {
    const duracoes = ['1 semana', '2 semanas', '1 mês', '3 meses', '6 meses', '1 ano', '2 anos'];
    Alert.alert(
      'Duração do tratamento',
      'Selecione a duração:',
      [
        ...duracoes.map(d => ({
          text: d,
          onPress: () => setDuracaoTratamento(d)
        })),
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const showFrequenciaPicker = () => {
    const frequencias = [
      'Todo dia - 8:00',
      'Todo dia - 12:00',
      'Todo dia - 18:00',
      'A cada 8 horas',
      'A cada 12 horas',
      '2 vezes ao dia',
      '3 vezes ao dia'
    ];
    Alert.alert(
      'Frequência do lembrete',
      'Selecione a frequência:',
      [
        ...frequencias.map(f => ({
          text: f,
          onPress: () => setFrequenciaLembrete(f)
        })),
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };


  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#004A61" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.titleButton}>
            <Text style={styles.title}>Novo medicamento</Text>
          </View>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* Formulário */}
        <View style={styles.form}>
          {/* Nome do medicamento */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome do medicamento</Text>
            <TextInput
              style={styles.input}
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
              style={styles.input}
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
              <Text style={styles.inputText}>{dosagem}</Text>
              <Feather name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Data inicial */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data inicial</Text>
            <TouchableOpacity style={styles.input} onPress={showDataInicialPicker}>
              <Text style={styles.inputText}>{dataInicial}</Text>
              <Feather name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Duração do tratamento em dias */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Duração do tratamento (dias)</Text>
            <TextInput
              style={styles.input}
              value={duracaoDias}
              onChangeText={setDuracaoDias}
              placeholder="Ex: 30 (30 dias)"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
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
});
