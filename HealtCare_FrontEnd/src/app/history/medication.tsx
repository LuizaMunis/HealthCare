import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
  statusHoje?: 'Tomado' | 'Pulado' | 'Adiado' | null;
}

const HistoryItem: React.FC<{ 
  item: MedicationItem; 
  onEdit: (item: MedicationItem) => void; 
  onDelete: (id: number) => void; 
}> = ({ item, onEdit, onDelete }) => {
  const formattedDate = new Date(item.data_inicio_tratamento).toLocaleString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
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

  const getStatusColor = (status?: string | null) => {
    switch (status) {
      case 'Tomado':
        return '#28A745';
      case 'Pulado':
        return '#FFC107';
      case 'Adiado':
        return '#17A2B8';
      default:
        return '#6C757D';
    }
  };

  const getStatusText = (status?: string | null) => {
    switch (status) {
      case 'Tomado':
        return 'Tomado hoje';
      case 'Pulado':
        return 'Pulado hoje';
      case 'Adiado':
        return 'Adiado hoje';
      default:
        return 'Não tomado hoje';
    }
  };

  return (
    <View style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        <View style={styles.medicationIcon}>
          <Feather name="activity" size={20} color="#004A61" />
        </View>
        <View style={styles.itemDetails}>
          <Text style={styles.itemDate}>{formattedDate}</Text>
          <Text style={styles.itemTitle}>{item.nome_medicamento}</Text>
          <Text style={styles.itemSubtitle}>Dosagem: {item.dosagem}</Text>
          <Text style={styles.itemSubtitle}>
            {item.uso_continuo ? 'Uso contínuo' : `Duração: ${formatDuration(item.duracao_dias_tratamento)}`}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.statusHoje) + '20', borderColor: getStatusColor(item.statusHoje) }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.statusHoje) }]}>
              {getStatusText(item.statusHoje)}
            </Text>
          </View>
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

export default function MedicationHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [records, setRecords] = useState<MedicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatusHoje = async (medicamentoId: number, token: string, profileId: string): Promise<'Tomado' | 'Pulado' | 'Adiado' | null> => {
    try {
      const hoje = new Date().toISOString().split('T')[0];
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${ENDPOINTS.MEDICATION_USAGE_RECORDS}/${medicamentoId}/usage-logs?perfil_id=${profileId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      if (response.ok) {
        const result = await response.json();
        const registros = Array.isArray(result.data) ? result.data : [];
        
        // Buscar registro do dia atual
        const registroHoje = registros.find((r: any) => {
          const dataRegistro = new Date(r.data_hora_registro).toISOString().split('T')[0];
          return dataRegistro === hoje;
        });
        
        return registroHoje ? registroHoje.status_uso : null;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar status de uso:', error);
      return null;
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      if (!token) throw new Error('Token de autenticação não encontrado.');

      const profileId = await AsyncStorage.getItem('active_profile_id');
      if (!profileId) throw new Error('Nenhum perfil ativo encontrado.');

      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.MEDICATION_RECORDS}?perfil_id=${profileId}`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Falha ao buscar o histórico.');

      const rows = Array.isArray(result.data) ? result.data : [];
      
      // Buscar status de uso do dia para cada medicamento
      const rowsComStatus = await Promise.all(
        rows.map(async (item: MedicationItem) => {
          const statusHoje = await fetchStatusHoje(item.id, token, profileId);
          return { ...item, statusHoje };
        })
      );
      
      // Ordenação decrescente por data (mais recente primeiro)
      rowsComStatus.sort((a: MedicationItem, b: MedicationItem) => {
        const dateA = new Date(a.data_inicio_tratamento).getTime();
        const dateB = new Date(b.data_inicio_tratamento).getTime();
        return dateB - dateA; // Decrescente (mais recente primeiro)
      });
      
      setRecords(rowsComStatus);
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
            const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.MEDICATION_RECORDS}/${id}?perfil_id=${profileId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
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

  const handleEdit = (item: MedicationItem) => {
    // Navegar para a tela de novo medicamento com os dados para edição
    router.push({
      pathname: '/monitor/novo-medicamento',
      params: { 
        medicamento: JSON.stringify(item),
        editMode: 'true'
      }
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#004A61" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Histórico de Medicamentos</Text>
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
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#004A61" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Histórico de Medicamentos</Text>
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
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#004A61" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico de Medicamentos</Text>
        <View style={{ width: 24 }} />
      </View>

      {records.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Feather name="activity" size={64} color="#CCCCCC" />
          <Text style={styles.emptyText}>Nenhum medicamento registrado</Text>
          <Text style={styles.emptySubtext}>Adicione sua primeira medicação para começar o histórico</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push('/monitor/medicamento')}
          >
            <Feather name="plus" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Adicionar Medicamento</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList 
          data={records} 
          keyExtractor={(item) => item.id.toString()} 
          renderItem={({ item }) => (
            <HistoryItem item={item} onEdit={handleEdit} onDelete={handleDelete} />
          )} 
          contentContainerStyle={styles.listContainer} 
        />
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
  medicationIcon: {
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
  statusBadge: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
