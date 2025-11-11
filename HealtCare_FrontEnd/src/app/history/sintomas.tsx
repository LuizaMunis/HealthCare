import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, ENDPOINTS } from '@/constants/api';

interface SintomaItem {
  id: number;
  doenca_id: number;
  descricao_sintoma: string;
  intensidade: 'Leve' | 'Moderada' | 'Intensa';
  data_hora_inicio: string;
}

const HistoryItem: React.FC<{ 
  item: SintomaItem; 
  onEdit: (item: SintomaItem) => void; 
  onDelete: (id: number) => void; 
}> = ({ item, onEdit, onDelete }) => {
  const getIntensidadeColor = (intensidade: string) => {
    const colors = {
      'Leve': '#4CAF50',
      'Moderada': '#FFC107',
      'Intensa': '#F44336'
    };
    return colors[intensidade as keyof typeof colors] || '#666';
  };

  const getIntensidadeLabel = (intensidade: string) => {
    return intensidade;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={styles.itemContainer}>
      <View style={styles.itemHeader}>
        <View style={styles.sintomaIcon}>
          <Feather name="activity" size={20} color="#004A61" />
        </View>
        <View style={styles.itemDetails}>
          <Text style={styles.itemDate}>{formatDate(item.data_hora_inicio)}</Text>
          <Text style={styles.itemTitle}>{item.descricao_sintoma}</Text>
          <Text style={styles.itemSubtitle}>
            Intensidade: {getIntensidadeLabel(item.intensidade)}
          </Text>
        </View>
        <View style={styles.itemActions}>
          <View style={[
            styles.intensidadeBadge,
            { backgroundColor: getIntensidadeColor(item.intensidade) }
          ]}>
            <Text style={styles.intensidadeText}>{item.intensidade}</Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onEdit(item)}
          >
            <Feather name="edit-2" size={18} color="#004A61" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(item.id)}
          >
            <Feather name="trash-2" size={18} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function SintomasHistoryScreen() {
  const router = useRouter();
  const [sintomas, setSintomas] = useState<SintomaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSintoma, setEditingSintoma] = useState<SintomaItem | null>(null);
  const [editForm, setEditForm] = useState<SintomaItem>({
    id: 0,
    doenca_id: 0,
    descricao_sintoma: '',
    intensidade: 'Leve',
    data_hora_inicio: '',
  });

  const intensidadeOptions = [
    { value: 'Leve', label: 'Leve', color: '#4CAF50' },
    { value: 'Moderada', label: 'Moderada', color: '#FFC107' },
    { value: 'Intensa', label: 'Intensa', color: '#F44336' }
  ];

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      if (!token) {
        setError('Você não está logado');
        return;
      }

      const profileId = await AsyncStorage.getItem('active_profile_id');
      if (!profileId) {
        setError('Nenhum perfil ativo encontrado');
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.SYMPTOMS_RECORDS}?perfil_id=${profileId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        const sintomasData = Array.isArray(result.data) ? result.data : [];
        setSintomas(sintomasData);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao carregar histórico');
      }
    } catch (error: any) {
      console.error('Erro ao carregar histórico de sintomas:', error);
      setError(error.message || 'Erro ao carregar histórico de sintomas');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(fetchHistory);

  const handleEdit = (item: SintomaItem) => {
    setEditingSintoma(item);
    setEditForm({
      id: item.id,
      doenca_id: item.doenca_id,
      descricao_sintoma: item.descricao_sintoma,
      intensidade: item.intensidade,
      data_hora_inicio: item.data_hora_inicio.split('T')[0],
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!editingSintoma) return;

    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      if (!token) {
        Alert.alert('Erro de Autenticação', 'Você não está logado.');
        return;
      }

      const profileId = await AsyncStorage.getItem('active_profile_id');
      if (!profileId) {
        Alert.alert('Erro', 'Nenhum perfil ativo encontrado.');
        return;
      }

      const updateData = {
        descricao_sintoma: editForm.descricao_sintoma.trim(),
        intensidade: editForm.intensidade,
        data_hora_inicio: `${editForm.data_hora_inicio}T00:00:00`
      };

      const updateDataWithPerfil = {
        ...updateData,
        perfil_id: parseInt(profileId)
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.SYMPTOMS_RECORDS}/${editingSintoma.id}?perfil_id=${profileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateDataWithPerfil)
      });

      if (response.ok) {
        const result = await response.json();
        setSintomas(prev => 
          prev.map(sintoma => 
            sintoma.id === editingSintoma.id 
              ? { ...sintoma, ...result.data }
              : sintoma
          )
        );
        
        setShowEditModal(false);
        setEditingSintoma(null);
        Alert.alert('Sucesso!', 'Sintoma atualizado com sucesso!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar sintoma');
      }
    } catch (error: any) {
      console.error('Erro ao atualizar sintoma:', error);
      Alert.alert('Erro', error.message || 'Não foi possível atualizar o sintoma');
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este sintoma?',
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

              const profileId = await AsyncStorage.getItem('active_profile_id');
              if (!profileId) {
                Alert.alert('Erro', 'Nenhum perfil ativo encontrado.');
                return;
              }

              const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.SYMPTOMS_RECORDS}/${id}?perfil_id=${profileId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (response.ok) {
                setSintomas(prev => prev.filter(s => s.id !== id));
                Alert.alert('Sucesso!', 'Sintoma excluído com sucesso!');
              } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao excluir sintoma');
              }
            } catch (error: any) {
              console.error('Erro ao excluir sintoma:', error);
              Alert.alert('Erro', error.message || 'Não foi possível excluir o sintoma');
            }
          }
        }
      ]
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Feather name="activity" size={64} color="#CCCCCC" />
      <Text style={styles.emptyTitle}>Nenhum sintoma registrado</Text>
      <Text style={styles.emptySubtitle}>
        Registre seus sintomas para acompanhar sua saúde
      </Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => router.push('/monitor/sintoma')}
      >
        <Feather name="plus" size={20} color="#FFFFFF" />
        <Text style={styles.addButtonText}>Registrar Sintoma</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Feather name="alert-circle" size={64} color="#F44336" />
      <Text style={styles.errorTitle}>Erro ao carregar histórico</Text>
      <Text style={styles.errorSubtitle}>{error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={fetchHistory}
      >
        <Feather name="refresh-cw" size={20} color="#FFFFFF" />
        <Text style={styles.retryButtonText}>Tentar Novamente</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#004A61" />
      <Text style={styles.loadingText}>Carregando histórico...</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={24} color="#004A61" />
          </TouchableOpacity>
          <Text style={styles.title}>Histórico de Sintomas</Text>
          <View style={styles.placeholder} />
        </View>
        {renderLoadingState()}
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={24} color="#004A61" />
          </TouchableOpacity>
          <Text style={styles.title}>Histórico de Sintomas</Text>
          <View style={styles.placeholder} />
        </View>
        {renderErrorState()}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color="#004A61" />
        </TouchableOpacity>
        <Text style={styles.title}>Histórico de Sintomas</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/monitor/sintoma')}
        >
          <Feather name="plus" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {sintomas.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={sintomas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <HistoryItem
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modal de Edição */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowEditModal(false)}
            >
              <Feather name="x" size={24} color="#004A61" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Editar Sintoma</Text>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleUpdate}
            >
              <Text style={styles.modalSaveText}>Salvar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Descrição do Sintoma</Text>
              <TextInput
                style={styles.input}
                value={editForm.descricao_sintoma}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, descricao_sintoma: text }))}
                placeholder="Ex: Dor de cabeça, febre, náusea..."
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Intensidade</Text>
              <View style={styles.intensidadeContainer}>
                {intensidadeOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.intensidadeOption,
                      editForm.intensidade === option.value && styles.intensidadeOptionSelected,
                      { borderColor: option.color }
                    ]}
                    onPress={() => setEditForm(prev => ({ ...prev, intensidade: option.value }))}
                  >
                    <Text style={[
                      styles.intensidadeOptionText,
                      editForm.intensidade === option.value && styles.intensidadeOptionTextSelected,
                      { color: editForm.intensidade === option.value ? option.color : '#666' }
                    ]}>
                      {option.value}
                    </Text>
                    <Text style={[
                      styles.intensidadeOptionLabel,
                      editForm.intensidade === option.value && styles.intensidadeOptionLabelSelected,
                      { color: editForm.intensidade === option.value ? option.color : '#666' }
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Data de Início</Text>
              <TextInput
                style={styles.input}
                value={editForm.data_hora_inicio}
                onChangeText={(text) => setEditForm(prev => ({ ...prev, data_hora_inicio: text }))}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#004A61',
  },
  addButton: {
    backgroundColor: '#004A61',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
  },
  listContainer: {
    padding: 20,
  },
  itemContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#004A61',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sintomaIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#004A61',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  intensidadeBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intensidadeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  addButton: {
    backgroundColor: '#004A61',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F44336',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#F44336',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004A61',
  },
  modalSaveButton: {
    backgroundColor: '#004A61',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#004A61',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  intensidadeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  intensidadeOption: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  intensidadeOptionSelected: {
    backgroundColor: '#F0F8FF',
  },
  intensidadeOptionText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  intensidadeOptionTextSelected: {
    fontWeight: 'bold',
  },
  intensidadeOptionLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  intensidadeOptionLabelSelected: {
    fontWeight: '600',
  },
});
