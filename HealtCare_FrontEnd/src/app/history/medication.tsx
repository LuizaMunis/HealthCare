import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, ENDPOINTS } from '@/constants/api';

interface MedicationItem {
  id: number;
  nome_medicamento: string;
  dosagem: string;
  frequencia_horas: number;
  duracao_dias_tratamento: number;
  data_inicio_tratamento: string;
  lembretes_ativos: boolean;
  uso_continuo: boolean;
}

const HistoryItem: React.FC<{ 
  item: MedicationItem; 
  onEdit: (item: MedicationItem) => void; 
  onDelete: (id: number) => void; 
}> = ({ item, onEdit, onDelete }) => {
  const formattedDate = new Date(item.data_inicio_tratamento).toLocaleString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  });

  const formatDuration = (days: number) => {
    if (days >= 365) {
      const years = Math.floor(days / 365);
      return `${years} ano${years > 1 ? 's' : ''}`;
    } else if (days >= 30) {
      const months = Math.floor(days / 30);
      return `${months} mês${months > 1 ? 'es' : ''}`;
    } else {
      return `${days} dia${days > 1 ? 's' : ''}`;
    }
  };

  return (
    <View style={styles.itemContainer}>
      <View style={styles.itemDetails}>
        <Text style={styles.itemDate}>{formattedDate}</Text>
        <Text style={styles.itemValues}>
          Medicamento: <Text style={styles.boldText}>{item.nome_medicamento}</Text>
        </Text>
        <Text style={styles.itemValues}>
          Dosagem: <Text style={styles.boldText}>{item.dosagem}</Text>
        </Text>
        <Text style={styles.itemValues}>
          Frequência: <Text style={styles.boldText}>A cada {item.frequencia_horas}h</Text>
        </Text>
        <Text style={styles.itemValues}>
          Duração: <Text style={styles.boldText}>
            {item.uso_continuo ? 'Uso contínuo' : formatDuration(item.duracao_dias_tratamento)}
          </Text>
        </Text>
        <Text style={styles.itemValues}>
          Lembretes: <Text style={styles.boldText}>
            {item.lembretes_ativos ? 'Ativos' : 'Inativos'}
          </Text>
        </Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionButton}>
          <Feather name="edit" size={22} color="#004A61" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.actionButton}>
          <Feather name="trash-2" size={22} color="#D9534F" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function MedicationHistoryScreen() {
  const router = useRouter();
  const [records, setRecords] = useState<MedicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicationItem | null>(null);
  const [nome, setNome] = useState('');
  const [dosagem, setDosagem] = useState('');
  const [frequenciaHoras, setFrequenciaHoras] = useState('');
  const [duracaoDias, setDuracaoDias] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [lembretesAtivos, setLembretesAtivos] = useState(false);
  const [usoContinuo, setUsoContinuo] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      if (!token) throw new Error('Token de autenticação não encontrado.');

      const profileId = await AsyncStorage.getItem('active_profile_id');
      if (!profileId) throw new Error('Nenhum perfil ativo encontrado.');

      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.MEDICATION_RECORDS}`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Falha ao buscar o histórico.');

      const rows = Array.isArray(result.data) ? result.data : [];
      rows.sort((a: MedicationItem, b: MedicationItem) => 
        new Date(b.data_inicio_tratamento).getTime() - new Date(a.data_inicio_tratamento).getTime()
      );
      setRecords(rows);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchHistory(); }, []));

  const handleDelete = async (id: number) => {
    Alert.alert('Confirmar Exclusão', 'Você tem certeza que deseja excluir este medicamento?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('healthcare_auth_token');
            const profileId = await AsyncStorage.getItem('active_profile_id');
            
            const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.MEDICATION_RECORDS}/${id}`, { 
              method: 'DELETE', 
              headers: { 'Authorization': `Bearer ${token}` } 
            });
            
            if (!response.ok) {
              const data = await response.json().catch(() => ({}));
              throw new Error(data.message || 'Falha ao excluir o medicamento.');
            }
            
            setRecords(prev => prev.filter(r => r.id !== id));
            Alert.alert('Sucesso', 'Medicamento excluído com sucesso.');
          } catch (e: any) {
            Alert.alert('Erro ao Excluir', e.message || 'Erro inesperado');
          }
        } }
    ]);
  };

  const handleEdit = (item: MedicationItem) => {
    setEditingRecord(item);
    setNome(item.nome_medicamento);
    setDosagem(item.dosagem || '');
    setFrequenciaHoras(item.frequencia_horas.toString());
    setDuracaoDias(item.duracao_dias_tratamento.toString());
    setDataInicio(new Date(item.data_inicio_tratamento).toISOString().split('T')[0]);
    setLembretesAtivos(item.lembretes_ativos);
    setUsoContinuo(item.uso_continuo);
    setIsModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!editingRecord) return;
    if (!nome || !dosagem || !frequenciaHoras) {
      Alert.alert('Atenção', 'Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      if (!token) throw new Error('Token de autenticação não encontrado.');

      const updateData = {
        nome_medicamento: nome,
        dosagem: dosagem,
        frequencia_horas: parseInt(frequenciaHoras),
        duracao_dias_tratamento: parseInt(duracaoDias) || 30,
        data_inicio_tratamento: dataInicio,
        lembretes_ativos: lembretesAtivos,
        uso_continuo: usoContinuo,
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.MEDICATION_RECORDS}/${editingRecord.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Falha ao atualizar o medicamento.');
      }

      setIsModalVisible(false);
      fetchHistory();
      Alert.alert('Sucesso', 'Medicamento atualizado com sucesso.');
    } catch (e: any) {
      Alert.alert('Erro ao Atualizar', e.message || 'Erro inesperado');
    }
  };

  const renderItem = ({ item }: { item: MedicationItem }) => (
    <HistoryItem item={item} onEdit={handleEdit} onDelete={handleDelete} />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#004A61" />
          <Text style={styles.loadingText}>Carregando histórico...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color="#D9534F" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchHistory}>
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#004A61" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico de Medicamentos</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Lista */}
      <FlatList
        data={records}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="pill" size={48} color="#CCC" />
            <Text style={styles.emptyText}>Nenhum medicamento registrado</Text>
            <Text style={styles.emptySubtext}>Adicione medicamentos para ver o histórico</Text>
          </View>
        }
      />

      {/* Modal de Edição */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Medicamento</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Feather name="x" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome do Medicamento *</Text>
                <TextInput
                  style={styles.input}
                  value={nome}
                  onChangeText={setNome}
                  placeholder="Digite o nome do medicamento"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Dosagem *</Text>
                <TextInput
                  style={styles.input}
                  value={dosagem}
                  onChangeText={setDosagem}
                  placeholder="Ex: 500mg"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Frequência (horas) *</Text>
                <TextInput
                  style={styles.input}
                  value={frequenciaHoras}
                  onChangeText={setFrequenciaHoras}
                  placeholder="Ex: 8"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Duração (dias)</Text>
                <TextInput
                  style={styles.input}
                  value={duracaoDias}
                  onChangeText={setDuracaoDias}
                  placeholder="Ex: 30"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Data de Início</Text>
                <TextInput
                  style={styles.input}
                  value={dataInicio}
                  onChangeText={setDataInicio}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View style={styles.checkboxGroup}>
                <TouchableOpacity
                  style={[styles.checkbox, lembretesAtivos && styles.checkboxChecked]}
                  onPress={() => setLembretesAtivos(!lembretesAtivos)}
                >
                  {lembretesAtivos && <Feather name="check" size={16} color="#FFFFFF" />}
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>Lembretes Ativos</Text>
              </View>

              <View style={styles.checkboxGroup}>
                <TouchableOpacity
                  style={[styles.checkbox, usoContinuo && styles.checkboxChecked]}
                  onPress={() => setUsoContinuo(!usoContinuo)}
                >
                  {usoContinuo && <Feather name="check" size={16} color="#FFFFFF" />}
                </TouchableOpacity>
                <Text style={styles.checkboxLabel}>Uso Contínuo</Text>
              </View>
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleUpdate}
              >
                <Text style={styles.modalSaveButtonText}>Salvar</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#D9534F',
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: '#004A61',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004A61',
  },
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemDetails: {
    flex: 1,
    marginRight: 12,
  },
  itemDate: {
    fontSize: 14,
    color: '#004A61',
    fontWeight: '600',
    marginBottom: 8,
  },
  itemValues: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  boldText: {
    fontWeight: '600',
    color: '#333',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  // Estilos do Modal
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
  modalContent: {
    padding: 20,
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#004A61',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
    color: '#333',
  },
  checkboxGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
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
    color: '#333',
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
  modalSaveButton: {
    flex: 1,
    backgroundColor: '#004A61',
    borderRadius: 10,
    paddingVertical: 12,
    marginLeft: 10,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
