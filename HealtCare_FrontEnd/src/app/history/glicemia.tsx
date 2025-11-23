import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, ENDPOINTS } from '@/constants/api';

interface GlycemiaItem {
  id: number;
  data_hora_medicao: string;
  valor_mg_dl: number;
}

const HistoryItem: React.FC<{ item: GlycemiaItem; onEdit: (item: GlycemiaItem) => void; onDelete: (id: number) => void; }>
 = ({ item, onEdit, onDelete }) => {
  const formattedDate = new Date(item.data_hora_medicao).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  return (
    <View style={styles.itemContainer}>
      <View style={styles.itemDetails}>
        <Text style={styles.itemDate}>{formattedDate}</Text>
        <Text style={styles.itemValues}>Glicemia: <Text style={styles.boldText}>{item.valor_mg_dl}</Text> mg/dL</Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionButton}><Feather name="edit" size={22} color="#004A61" /></TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.actionButton}><Feather name="trash-2" size={22} color="#D9534F" /></TouchableOpacity>
      </View>
    </View>
  );
};

export default function GlycemiaHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [records, setRecords] = useState<GlycemiaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<GlycemiaItem | null>(null);
  const [value, setValue] = useState('');
  const [date, setDate] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      if (!token) throw new Error('Token de autenticação não encontrado.');

      const profileId = await AsyncStorage.getItem('active_profile_id');
      if (!profileId) throw new Error('Nenhum perfil ativo encontrado.');

      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.GLYCEMIA_RECORDS}?perfil_id=${profileId}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Falha ao buscar o histórico.');

      const rows = Array.isArray(result.data) ? result.data : [];
      rows.sort((a: GlycemiaItem, b: GlycemiaItem) => new Date(b.data_hora_medicao).getTime() - new Date(a.data_hora_medicao).getTime());
      setRecords(rows);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchHistory(); }, []));

  const handleDelete = async (id: number) => {
    Alert.alert('Confirmar Exclusão', 'Você tem certeza que deseja excluir este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('healthcare_auth_token');
            const profileId = await AsyncStorage.getItem('active_profile_id');
            if (!profileId) {
              Alert.alert('Erro', 'Nenhum perfil ativo encontrado.');
              return;
            }
            const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.GLYCEMIA_RECORDS}/${id}?perfil_id=${profileId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) {
              const data = await response.json().catch(() => ({}));
              throw new Error(data.message || 'Falha ao excluir o registro.');
            }
            setRecords(prev => prev.filter(r => r.id !== id));
            Alert.alert('Sucesso', 'Registro excluído com sucesso.');
          } catch (e: any) {
            Alert.alert('Erro ao Excluir', e.message || 'Erro inesperado');
          }
        } }
    ]);
  };

  const handleEdit = (item: GlycemiaItem) => {
    setEditingRecord(item);
    setValue(String(item.valor_mg_dl));
    setDate(new Date(item.data_hora_medicao).toISOString().split('T')[0]);
    setIsModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!editingRecord) return;
    const v = parseInt(value, 10);
    if (isNaN(v) || v < 40 || v > 600) {
      Alert.alert('Atenção', 'Informe um valor entre 40 e 600 mg/dL');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      const profileId = await AsyncStorage.getItem('active_profile_id');
      if (!profileId) {
        Alert.alert('Erro', 'Nenhum perfil ativo encontrado.');
        return;
      }
      const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.GLYCEMIA_RECORDS}/${editingRecord.id}?perfil_id=${profileId}`;
      const time = new Date(editingRecord.data_hora_medicao).toTimeString().slice(0,8);
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ valor_mg_dl: v, data_hora_medicao: `${date}T${time}`, perfil_id: parseInt(profileId) })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Falha ao atualizar o registro.');
      Alert.alert('Sucesso!', 'Registro atualizado com sucesso.');
      setIsModalVisible(false);
      setEditingRecord(null);
      fetchHistory();
    } catch (e: any) {
      Alert.alert('Erro ao Atualizar', e.message || 'Erro inesperado');
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#004A61" style={styles.centered} />;

  if (error && records.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Erro ao carregar dados: {error}</Text>
        <TouchableOpacity onPress={fetchHistory} style={styles.retryButton}><Text style={styles.saveButtonText}>Tentar Novamente</Text></TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#004A61" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico de Glicemia</Text>
        <View style={{ width: 24 }} />
      </View>

      {records.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="droplet" size={64} color="#CCCCCC" />
          <Text style={styles.emptyText}>Nenhum registro de glicemia</Text>
          <Text style={styles.emptySubtext}>Adicione sua primeira medição para começar o histórico</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/monitor/glicemia')}
          >
            <Feather name="plus" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Adicionar Glicemia</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (<HistoryItem item={item} onEdit={handleEdit} onDelete={handleDelete} />)}
          contentContainerStyle={styles.listContainer}
        />
      )}

      <Modal animationType="slide" transparent visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Registro</Text>

            <View style={styles.formContainer}>
              <Text style={styles.formLabel}>Glicemia (mg/dL)</Text>
              <View style={styles.tempRow}>
                <TouchableOpacity style={styles.controlButton} onPress={() => setValue((prev) => String(Math.max(40, (parseInt(prev || '0', 10) - 1))))}><Feather name="minus-circle" size={32} color="#6c757d" /></TouchableOpacity>
                <Text style={styles.tempValue}>{value}</Text>
                <TouchableOpacity style={styles.controlButton} onPress={() => setValue((prev) => String(Math.min(600, (parseInt(prev || '0', 10) + 1))))}><Feather name="plus-circle" size={32} color="#6c757d" /></TouchableOpacity>
              </View>

              <Text style={styles.formLabel}>Data (AAAA-MM-DD)</Text>
              <TextInput style={styles.dateInput} value={date} onChangeText={setDate} placeholder="AAAA-MM-DD" />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleUpdate}>
                <Text style={styles.saveButtonText}>Salvar Alterações</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F8' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  backButton: {},
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  listContainer: { padding: 20 },
  itemContainer: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 15, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
  itemDetails: { flex: 1 },
  itemDate: { fontSize: 12, color: 'gray', marginBottom: 8 },
  itemValues: { fontSize: 16, color: '#333' },
  boldText: { fontWeight: 'bold' },
  itemActions: { flexDirection: 'row' },
  actionButton: { padding: 8, marginLeft: 8 },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: { 
    fontSize: 18, 
    color: '#666', 
    marginTop: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  addButton: {
    backgroundColor: '#004A61',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  errorText: { fontSize: 16, color: 'red', textAlign: 'center', marginBottom: 20 },
  retryButton: { backgroundColor: '#004A61', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  saveButtonText: { fontSize: 16, color: '#FFFFFF', fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '90%', backgroundColor: '#F0F4F8', borderRadius: 20, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  formContainer: { width: '100%' },
  formLabel: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10, marginTop: 10 },
  tempRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  tempValue: { fontSize: 44, fontWeight: 'bold', color: '#333', minWidth: 80, textAlign: 'center' },
  controlButton: { padding: 10 },
  dateInput: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 15, fontSize: 16, color: '#333', elevation: 1 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 20 },
  modalButton: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  cancelButton: { backgroundColor: '#f0f0f0', marginRight: 10 },
  cancelButtonText: { color: '#333', fontWeight: 'bold' },
  saveButton: { backgroundColor: '#004A61' },
});


