import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, ENDPOINTS } from '@/constants/api';

interface Medicamento {
  id: number;
  nome_medicamento: string;
  dosagem: string;
  frequencia_horas: number;
  duracao_dias_tratamento: number;
  data_inicio_tratamento: string;
  lembretes_ativos: boolean;
  uso_continuo: boolean;
  tomado?: boolean; // Para controle local de tomado/não tomado
}

export default function MedicamentoScreen() {
  const router = useRouter();
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const getCurrentDate = () => {
    const now = new Date();
    const months = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    return `${now.getDate()} de ${months[now.getMonth()]}`;
  };

  const loadMedicamentos = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      if (!token) {
        Alert.alert('Erro de Autenticação', 'Você não está logado.');
        return;
      }

      const profileId = await AsyncStorage.getItem('active_profile_id');
      if (!profileId) {
        Alert.alert('Erro', 'Nenhum perfil ativo encontrado. Por favor, selecione um perfil.');
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.MEDICATION_RECORDS}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        const medicamentosData = Array.isArray(result.data) ? result.data : [];
        
        // Adicionar estado de tomado para controle local
        const medicamentosComEstado = medicamentosData.map((med: any) => ({
          ...med,
          tomado: false, // Inicialmente não tomado
        }));
        
        setMedicamentos(medicamentosComEstado);
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao carregar medicamentos.');
      }
    } catch (err: any) {
      console.error('Erro ao carregar medicamentos:', err);
      setError(err.message || 'Erro ao carregar medicamentos.');
    } finally {
      setLoading(false);
    }
  };

  // Carregar medicamentos quando a tela ganha foco
  useFocusEffect(useCallback(() => {
    loadMedicamentos();
  }, []));

  const toggleMedicamento = (id: number) => {
    if (!isEditMode) {
      const medicamento = medicamentos.find(med => med.id === id);
      if (!medicamento) return;

      const action = medicamento.tomado ? 'não tomado' : 'tomado';
      
      Alert.alert(
        'Confirmar Uso do Medicamento',
        `Você confirma que ${action} o medicamento "${medicamento.nome_medicamento}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Confirmar', 
            style: 'default',
            onPress: () => confirmarUsoMedicamento(id, medicamento.tomado)
          }
        ]
      );
    }
  };

  const confirmarUsoMedicamento = async (id: number, estavaTomado: boolean) => {
    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      if (!token) {
        Alert.alert('Erro de Autenticação', 'Você não está logado.');
        return;
      }

      const statusUso = estavaTomado ? 'Pulado' : 'Tomado';
      
      const registroData = {
        medicamento_id: id,
        data_hora_registro: new Date().toISOString(),
        status_uso: statusUso
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.MEDICATION_USAGE_RECORDS}/${id}/usage-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(registroData)
      });

      if (response.ok) {
        // Atualizar estado local
        setMedicamentos(prev =>
          prev.map(med => 
            med.id === id ? { ...med, tomado: !estavaTomado } : med
          )
        );
        
        const mensagem = estavaTomado ? 'Medicamento marcado como não tomado' : 'Medicamento marcado como tomado';
        Alert.alert('Sucesso!', mensagem);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao registrar uso do medicamento');
      }
    } catch (error: any) {
      console.error('Erro ao registrar uso do medicamento:', error);
      Alert.alert('Erro', error.message || 'Não foi possível registrar o uso do medicamento');
    }
  };

  const handleEdit = () => {
    setIsEditMode(!isEditMode);
  };

  const handleAddMedicamento = () => {
    router.push('/monitor/novo-medicamento');
  };

  const handleEditMedicamento = (medicamento: Medicamento) => {
    router.push({
      pathname: '/monitor/editar-medicamento',
      params: { medicamento: JSON.stringify(medicamento) }
    });
  };

  const handleDeleteMedicamento = async (id: number) => {
    Alert.alert(
      'Excluir Medicamento',
      'Tem certeza que deseja excluir este medicamento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('healthcare_auth_token');
              if (!token) {
                Alert.alert('Erro de Autenticação', 'Você não está logado.');
                return;
              }

              const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.MEDICATION_RECORDS}/${id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (response.ok) {
                // Remover da lista local
                setMedicamentos(prev => prev.filter(med => med.id !== id));
                Alert.alert('Sucesso', 'Medicamento excluído com sucesso.');
              } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Erro ao excluir medicamento.');
              }
            } catch (error: any) {
              console.error('Erro ao excluir medicamento:', error);
              Alert.alert('Erro', error.message || 'Não foi possível excluir o medicamento.');
            }
          }
        }
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
          <Text style={styles.title}>Medicamentos</Text>
          <Text style={styles.date}>{getCurrentDate()}</Text>
        </View>
        <TouchableOpacity onPress={handleEdit}>
          <Text style={styles.editButton}>
            {isEditMode ? 'concluir' : 'editar'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#004A61" />
          <Text style={styles.loadingText}>Carregando medicamentos...</Text>
        </View>
      )}

      {/* Error State */}
      {error && !loading && (
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color="#D9534F" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadMedicamentos}>
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      {!loading && !error && (
        <ScrollView style={styles.content}>
          {/* Adicionar Medicamento */}
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddMedicamento}
          >
            <View style={styles.addIcon}>
              <Feather name="plus" size={20} color="#FFFFFF" />
            </View>
            <Text style={styles.addText}>Adicionar medicamento</Text>
          </TouchableOpacity>

          {/* Lista de Medicamentos */}
          <View style={styles.medicamentosList}>
            {medicamentos.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Feather name="pill" size={48} color="#CCC" />
                <Text style={styles.emptyText}>Nenhum medicamento registrado</Text>
                <Text style={styles.emptySubtext}>Toque no + para adicionar seu primeiro medicamento</Text>
              </View>
            ) : (
              medicamentos.map((medicamento) => (
                <View key={medicamento.id} style={styles.medicamentoItem}>
                  <TouchableOpacity
                    style={[
                      styles.medicamentoCard,
                      medicamento.tomado ? styles.medicamentoCardTomado : styles.medicamentoCardNaoTomado
                    ]}
                    onPress={() => toggleMedicamento(medicamento.id)}
                  >
                    <View style={styles.medicamentoInfo}>
                      <Text style={styles.medicamentoNome}>{medicamento.nome_medicamento}</Text>
                      <Text style={styles.medicamentoDosagem}>{medicamento.dosagem}</Text>
                      <Text style={styles.medicamentoFrequencia}>
                        A cada {medicamento.frequencia_horas}h
                      </Text>
                      {medicamento.lembretes_ativos && (
                        <Text style={styles.medicamentoLembrete}>🔔 Lembretes ativos</Text>
                      )}
                    </View>
                    
                    {!isEditMode && (
                      <View style={styles.checkboxContainer}>
                        {medicamento.tomado ? (
                          <View style={styles.checkboxChecked}>
                            <Feather name="check" size={16} color="#004A61" />
                          </View>
                        ) : (
                          <View style={styles.checkboxUnchecked} />
                        )}
                      </View>
                    )}
                    
                    {isEditMode && (
                      <View style={styles.editActions}>
                        <TouchableOpacity
                          onPress={() => handleEditMedicamento(medicamento)}
                          style={styles.editAction}
                        >
                          <Feather name="edit-2" size={16} color="#666" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteMedicamento(medicamento.id)}
                          style={styles.deleteAction}
                        >
                          <Feather name="x" size={16} color="#FF4444" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  editButton: {
    fontSize: 16,
    color: '#004A61',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  addIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#004A61',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  addText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  medicamentosList: {
    marginBottom: 20,
  },
  medicamentoItem: {
    marginBottom: 12,
  },
  medicamentoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  medicamentoCardTomado: {
    backgroundColor: '#4A90E2',
  },
  medicamentoCardNaoTomado: {
    backgroundColor: '#004A61',
  },
  medicamentoInfo: {
    flex: 1,
    marginRight: 12,
  },
  medicamentoNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  medicamentoDosagem: {
    fontSize: 14,
    color: '#E0E0E0',
    marginBottom: 2,
  },
  medicamentoFrequencia: {
    fontSize: 12,
    color: '#E0E0E0',
    marginBottom: 2,
  },
  medicamentoLembrete: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '500',
  },
  checkboxContainer: {
    marginLeft: 12,
  },
  checkboxChecked: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxUnchecked: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editAction: {
    marginRight: 16,
    padding: 4,
  },
  deleteAction: {
    padding: 4,
  },
  // Estados de Loading, Error e Empty
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
});
