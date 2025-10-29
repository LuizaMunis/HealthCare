import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, ENDPOINTS } from '@/constants/api';

interface VaccineItem {
  id: number;
  nome: string;
  dose: string;
  data_vacinacao: string;
}

const HistoryItem: React.FC<{ item: VaccineItem; onEdit: (item: VaccineItem) => void; onDelete: (id: number) => void; }>
 = ({ item, onEdit, onDelete }) => {
  const formattedDate = new Date(item.data_vacinacao).toLocaleString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return (
    <View style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        <View style={styles.vaccineIcon}>
          <Feather name="shield" size={20} color="#004A61" />
        </View>
        <View style={styles.itemDetails}>
          <Text style={styles.itemDate}>{formattedDate}</Text>
          <Text style={styles.itemTitle}>{item.nome}</Text>
          <Text style={styles.itemSubtitle}>Dose: {item.dose}</Text>
        </View>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionButton}>
          <Feather name="edit" size={20} color="#004A61" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.actionButton}>
          <Feather name="trash-2" size={20} color="#D9534F" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function VaccinationHistoryScreen() {
  const router = useRouter();
  const [records, setRecords] = useState<VaccineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      if (!token) throw new Error('Token de autenticação não encontrado.');

      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.VACCINE_RECORDS}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Falha ao buscar o histórico.');

      const rows = Array.isArray(result.data) ? result.data : [];
      
      // Ordenação decrescente por data (mais recente primeiro)
      rows.sort((a: VaccineItem, b: VaccineItem) => {
        const dateA = new Date(a.data_vacinacao).getTime();
        const dateB = new Date(b.data_vacinacao).getTime();
        return dateB - dateA; // Decrescente (mais recente primeiro)
      });
      
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
            const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.VACCINE_RECORDS}/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
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

  const handleEdit = (item: VaccineItem) => {
    // Navegar para a tela de edição com os dados da vacina
    router.push({
      pathname: '/monitor/editar-vacina',
      params: { vacina: JSON.stringify(item) }
    });
  };


  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#004A61" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Histórico de Vacinação</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#004A61" />
          <Text style={styles.loadingText}>Carregando histórico...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && records.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#004A61" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Histórico de Vacinação</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color="#D9534F" />
          <Text style={styles.errorText}>Erro ao carregar histórico</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity onPress={fetchHistory} style={styles.retryButton}>
            <Feather name="refresh-cw" size={20} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#004A61" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico de Vacinação</Text>
        <View style={{ width: 24 }} />
      </View>

      {records.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="shield" size={64} color="#CCCCCC" />
          <Text style={styles.emptyText}>Nenhuma vacina registrada</Text>
          <Text style={styles.emptySubtext}>Adicione sua primeira vacina para começar o histórico</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/monitor/nova-vacina')}
          >
            <Feather name="plus" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Adicionar Vacina</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList data={records} keyExtractor={(item) => item.id.toString()} renderItem={({ item }) => (
          <HistoryItem item={item} onEdit={handleEdit} onDelete={handleDelete} />
        )} contentContainerStyle={styles.listContainer} />
      )}

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
  itemContainer: { 
    backgroundColor: '#FFFFFF', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 12, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    elevation: 2, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 5 
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  vaccineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F4F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemDetails: { 
    flex: 1 
  },
  itemDate: { 
    fontSize: 12, 
    color: '#666', 
    marginBottom: 4,
    fontWeight: '500'
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#004A61',
    marginBottom: 2,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 1,
  },
  itemValues: { fontSize: 16, color: '#333' },
  boldText: { fontWeight: 'bold' },
  itemActions: { flexDirection: 'row' },
  actionButton: { padding: 8, marginLeft: 8 },
  
  // Estados de loading e erro melhorados
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: { 
    fontSize: 18, 
    color: '#D9534F', 
    textAlign: 'center', 
    marginTop: 16,
    fontWeight: 'bold'
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: { 
    backgroundColor: '#004A61', 
    paddingVertical: 12, 
    paddingHorizontal: 24, 
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  retryButtonText: { 
    fontSize: 16, 
    color: '#FFFFFF', 
    fontWeight: 'bold',
    marginLeft: 8,
  },
  
  // Estado vazio melhorado
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
  },
  addButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});


