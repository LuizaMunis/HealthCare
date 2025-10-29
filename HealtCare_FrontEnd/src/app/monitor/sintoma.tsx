import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, ENDPOINTS } from '@/constants/api';

interface Sintoma {
  id?: number;
  doenca_id: number;
  descricao_sintoma: string;
  intensidade: 'Leve' | 'Moderada' | 'Intensa';
  data_hora_inicio: string;
}

export default function SintomaScreen() {
  const router = useRouter();
  const [sintomas, setSintomas] = useState<Sintoma[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSintoma, setNewSintoma] = useState<Sintoma>({
    doenca_id: 0,
    descricao_sintoma: '',
    intensidade: 'Leve',
    data_hora_inicio: new Date().toISOString().split('T')[0],
  });
  const [doencas, setDoencas] = useState<{id: number, nome_doenca: string}[]>([]);
  const [loadingDoencas, setLoadingDoencas] = useState(false);

  const loadDoencas = async () => {
    setLoadingDoencas(true);
    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      if (!token) return;

      const profileId = await AsyncStorage.getItem('active_profile_id');
      if (!profileId) return;

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/doencas`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        const doencasData = Array.isArray(result.data) ? result.data : [];
        setDoencas(doencasData);
      }
    } catch (error) {
      console.error('Erro ao carregar doenças:', error);
    } finally {
      setLoadingDoencas(false);
    }
  };

  const loadSintomas = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      if (!token) return;

      const profileId = await AsyncStorage.getItem('active_profile_id');
      if (!profileId) return;

      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.SYMPTOMS_RECORDS}`, {
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
      }
    } catch (error) {
      console.error('Erro ao carregar sintomas:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSintomas = async (sintomas: Sintoma[]) => {
    // Função removida - agora usamos API real
  };

  useEffect(() => {
    loadDoencas();
    loadSintomas();
  }, []);

  const intensidadeOptions = [
    { value: 'Leve', label: 'Leve', color: '#4CAF50' },
    { value: 'Moderada', label: 'Moderada', color: '#FFC107' },
    { value: 'Intensa', label: 'Intensa', color: '#F44336' }
  ];

  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'descricao_sintoma':
        if (!value || value.trim().length < 3) {
          return 'Descrição deve ter pelo menos 3 caracteres';
        }
        if (value.trim().length > 45) {
          return 'Descrição deve ter no máximo 45 caracteres';
        }
        break;
      case 'intensidade':
        if (!value || !['Leve', 'Moderada', 'Intensa'].includes(value)) {
          return 'Intensidade deve ser Leve, Moderada ou Intensa';
        }
        break;
      case 'doenca_id':
        if (!value || value === 0) {
          return 'Selecione uma doença';
        }
        break;
      case 'data_hora_inicio':
        if (!value) {
          return 'Data é obrigatória';
        }
        break;
    }
    return '';
  };

  const validateAllFields = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    Object.keys(newSintoma).forEach(field => {
      const error = validateField(field, newSintoma[field as keyof Sintoma]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (field: string, value: any) => {
    setNewSintoma(prev => ({ ...prev, [field]: value }));
    
    // Validar campo em tempo real
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleFieldBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSaveSintoma = async () => {
    if (!validateAllFields()) {
      Alert.alert('Campos obrigatórios', 'Por favor, corrija os erros nos campos destacados em vermelho.');
      return;
    }

    setLoading(true);
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

      const sintomaData = {
        doenca_id: newSintoma.doenca_id,
        descricao_sintoma: newSintoma.descricao_sintoma.trim(),
        intensidade: newSintoma.intensidade,
        data_hora_inicio: `${newSintoma.data_hora_inicio}T00:00:00`
      };

      // Usar a rota de sintomas
      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.SYMPTOMS_RECORDS}/${newSintoma.doenca_id}/symptoms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(sintomaData)
      });

      if (response.ok) {
        const result = await response.json();
        const novoSintoma = {
          id: result.data.id,
          ...sintomaData
        };

        setSintomas(prev => [novoSintoma, ...prev]);
        setShowAddModal(false);
        setNewSintoma({
          doenca_id: 0,
          descricao_sintoma: '',
          intensidade: 'Leve',
          data_hora_inicio: new Date().toISOString().split('T')[0],
        });
        setErrors({});
        setTouched({});

        Alert.alert('Sucesso!', 'Sintoma registrado com sucesso!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao registrar sintoma');
      }
    } catch (error: any) {
      console.error('Erro ao salvar sintoma:', error);
      Alert.alert('Erro', error.message || 'Não foi possível salvar o sintoma. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSintoma = async (id: number) => {
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

              const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.SYMPTOMS_RECORDS}/${id}`, {
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

  const getIntensidadeColor = (intensidade: string) => {
    const option = intensidadeOptions.find(opt => opt.value === intensidade);
    return option?.color || '#666';
  };

  const getIntensidadeLabel = (intensidade: string) => {
    return intensidade;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color="#004A61" />
        </TouchableOpacity>
        <Text style={styles.title}>Registro de Sintomas</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Feather name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {sintomas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="activity" size={64} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>Nenhum sintoma registrado</Text>
            <Text style={styles.emptySubtitle}>
              Toque no botão + para registrar um novo sintoma
            </Text>
          </View>
        ) : (
          <View style={styles.sintomasList}>
            {sintomas.map((sintoma) => (
              <View key={sintoma.id} style={styles.sintomaCard}>
                <View style={styles.sintomaHeader}>
                  <View style={styles.sintomaInfo}>
                    <Text style={styles.sintomaDescricao}>
                      {sintoma.descricao_sintoma}
                    </Text>
                    <Text style={styles.sintomaData}>
                      {formatDate(sintoma.data_hora_inicio)}
                    </Text>
                  </View>
                  <View style={styles.sintomaActions}>
                    <View style={[
                      styles.intensidadeBadge,
                      { backgroundColor: getIntensidadeColor(sintoma.intensidade) }
                    ]}>
                      <Text style={styles.intensidadeText}>
                        {sintoma.intensidade}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteSintoma(sintoma.id!)}
                    >
                      <Feather name="trash-2" size={20} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.intensidadeLabel}>
                  Intensidade: {getIntensidadeLabel(sintoma.intensidade)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal para adicionar sintoma */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowAddModal(false)}
            >
              <Feather name="x" size={24} color="#004A61" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Novo Sintoma</Text>
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleSaveSintoma}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.modalSaveText}>Salvar</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Doença <Text style={styles.required}>*</Text>
              </Text>
              {loadingDoencas ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#004A61" />
                  <Text style={styles.loadingText}>Carregando doenças...</Text>
                </View>
              ) : (
                <View style={styles.selectContainer}>
                  {doencas.map((doenca) => (
                    <TouchableOpacity
                      key={doenca.id}
                      style={[
                        styles.selectOption,
                        newSintoma.doenca_id === doenca.id && styles.selectOptionSelected
                      ]}
                      onPress={() => handleFieldChange('doenca_id', doenca.id)}
                    >
                      <Text style={[
                        styles.selectOptionText,
                        newSintoma.doenca_id === doenca.id && styles.selectOptionTextSelected
                      ]}>
                        {doenca.nome_doenca}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
              {errors.doenca_id && touched.doenca_id && (
                <Text style={styles.errorText}>{errors.doenca_id}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Descrição do Sintoma <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  errors.descricao_sintoma && touched.descricao_sintoma && styles.inputError
                ]}
                value={newSintoma.descricao_sintoma}
                onChangeText={(text) => handleFieldChange('descricao_sintoma', text)}
                onBlur={() => handleFieldBlur('descricao_sintoma')}
                placeholder="Ex: Dor de cabeça, febre, náusea..."
                multiline
                numberOfLines={3}
              />
              {errors.descricao_sintoma && touched.descricao_sintoma && (
                <Text style={styles.errorText}>{errors.descricao_sintoma}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Intensidade <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.intensidadeContainer}>
                {intensidadeOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.intensidadeOption,
                      newSintoma.intensidade === option.value && styles.intensidadeOptionSelected,
                      { borderColor: option.color }
                    ]}
                    onPress={() => handleFieldChange('intensidade', option.value)}
                  >
                    <Text style={[
                      styles.intensidadeOptionText,
                      newSintoma.intensidade === option.value && styles.intensidadeOptionTextSelected,
                      { color: newSintoma.intensidade === option.value ? option.color : '#666' }
                    ]}>
                      {option.value}
                    </Text>
                    <Text style={[
                      styles.intensidadeOptionLabel,
                      newSintoma.intensidade === option.value && styles.intensidadeOptionLabelSelected,
                      { color: newSintoma.intensidade === option.value ? option.color : '#666' }
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.intensidade && touched.intensidade && (
                <Text style={styles.errorText}>{errors.intensidade}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Data de Início <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  errors.data_hora_inicio && touched.data_hora_inicio && styles.inputError
                ]}
                value={newSintoma.data_hora_inicio}
                onChangeText={(text) => handleFieldChange('data_hora_inicio', text)}
                onBlur={() => handleFieldBlur('data_hora_inicio')}
                placeholder="YYYY-MM-DD"
              />
              {errors.data_hora_inicio && touched.data_hora_inicio && (
                <Text style={styles.errorText}>{errors.data_hora_inicio}</Text>
              )}
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
  content: {
    flex: 1,
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  sintomasList: {
    gap: 16,
  },
  sintomaCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#004A61',
  },
  sintomaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  sintomaInfo: {
    flex: 1,
  },
  sintomaDescricao: {
    fontSize: 16,
    fontWeight: '600',
    color: '#004A61',
    marginBottom: 4,
  },
  sintomaData: {
    fontSize: 14,
    color: '#666',
  },
  sintomaActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  intensidadeBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intensidadeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  intensidadeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  deleteButton: {
    padding: 8,
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
  required: {
    color: '#F44336',
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
  inputError: {
    borderColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
    fontSize: 14,
    marginTop: 4,
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  selectContainer: {
    gap: 8,
  },
  selectOption: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  selectOptionSelected: {
    borderColor: '#004A61',
    backgroundColor: '#E3F2FD',
  },
  selectOptionText: {
    fontSize: 16,
    color: '#666',
  },
  selectOptionTextSelected: {
    color: '#004A61',
    fontWeight: '600',
  },
});