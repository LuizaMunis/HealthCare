import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, ENDPOINTS } from '@/constants/api';

interface HeartRateItem {
  id: number;
  data_hora_medicao: string;
  bpm: number;
}

const HistoryItem: React.FC<{
  item: HeartRateItem;
  onEdit: (item: HeartRateItem) => void;
  onDelete: (id: number) => void;
}> = ({ item, onEdit, onDelete }) => {
  const formattedDate = new Date(item.data_hora_medicao).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  return (
    <View style={styles.itemContainer}>
      <View style={styles.itemDetails}>
        <Text style={styles.itemDate}>{formattedDate}</Text>
        <Text style={styles.itemValues}>BPM: <Text style={styles.boldText}>{item.bpm}</Text> bpm</Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionButton}><Feather name="edit" size={22} color="#004A61" /></TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.actionButton}><Feather name="trash-2" size={22} color="#D9534F" /></TouchableOpacity>
      </View>
    </View>
  );
};

export default function HeartRateHistoryScreen() {
  const router = useRouter();
  const [records, setRecords] = useState<HeartRateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HeartRateItem | null>(null);
  const [bpm, setBpm] = useState('');
  const [date, setDate] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      if (!token) throw new Error('Token de autenticação não encontrado.');

      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.HEART_RATE_RECORDS}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Falha ao buscar o histórico.');

      const rows = Array.isArray(result.data) ? result.data : [];
      rows.sort((a: HeartRateItem, b: HeartRateItem) => new Date(b.data_hora_medicao).getTime() - new Date(a.data_hora_medicao).getTime());
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
            const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.HEART_RATE_RECORDS}/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
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

  const handleEdit = (item: HeartRateItem) => {
    setEditingRecord(item);
    setBpm(String(item.bpm));
    setDate(new Date(item.data_hora_medicao).toISOString().split('T')[0]);
    setIsModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!editingRecord) return;
    const bpmNum = parseInt(bpm, 10);
    if (isNaN(bpmNum) || bpmNum < 30 || bpmNum > 250) {
      Alert.alert('Atenção', 'Informe um BPM entre 30 e 250');
      return;
    }
    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.HEART_RATE_RECORDS}/${editingRecord.id}`;
      const time = new Date(editingRecord.data_hora_medicao).toTimeString().slice(0,8);
      const response = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ bpm: bpmNum, data_hora_medicao: `${date}T${time}` })
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#004A61" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico de Frequência Cardíaca</Text>
        <View style={{ width: 24 }} />
      </View>

      {records.length === 0 ? (
        <View style={styles.centered}><Text style={styles.emptyText}>Nenhum registro encontrado.</Text></View>
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
              <Text style={styles.formLabel}>BPM</Text>
              <View style={styles.tempRow}>
                <TouchableOpacity style={styles.controlButton} onPress={() => setBpm((prev) => String(Math.max(30, (parseInt(prev || '0', 10) - 1))))}><Feather name="minus-circle" size={32} color="#6c757d" /></TouchableOpacity>
                <Text style={styles.tempValue}>{bpm}</Text>
                <TouchableOpacity style={styles.controlButton} onPress={() => setBpm((prev) => String(Math.min(250, (parseInt(prev || '0', 10) + 1))))}><Feather name="plus-circle" size={32} color="#6c757d" /></TouchableOpacity>
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
  emptyText: { fontSize: 16, color: 'gray' },
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


