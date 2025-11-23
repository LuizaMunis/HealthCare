import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
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
    data_hora_inicio: '',
  });
  const [doencas, setDoencas] = useState<{id: number, nome_doenca: string}[]>([]);
  const [loadingDoencas, setLoadingDoencas] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  
  // Estados para data e hora
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  
  // Modo rápido para múltiplos sintomas
  const [fastMode, setFastMode] = useState(false);
  
  // Animação para alerta de intensidade intensa
  const pulseAnim = useMemo(() => new Animated.Value(1), []);

  const loadDoencas = async () => {
    setLoadingDoencas(true);
    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      if (!token) return;

      const profileId = await AsyncStorage.getItem('active_profile_id');
      if (!profileId) return;

      const response = await fetch(`${API_CONFIG.BASE_URL}/doencas?perfil_id=${profileId}`, {
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
      }
    } catch (error) {
      console.error('Erro ao carregar sintomas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoencas();
    loadSintomas();
  }, []);

  // Animação de pulso para alerta de intensidade intensa
  useEffect(() => {
    if (newSintoma.intensidade === 'Intensa') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [newSintoma.intensidade]);

  const intensidadeOptions = [
    { 
      value: 'Leve' as const, 
      label: 'Leve', 
      color: '#4CAF50',
      bgColor: '#E8F5E9',
      icon: 'check-circle' as const,
    },
    { 
      value: 'Moderada' as const, 
      label: 'Moderada', 
      color: '#FF9800',
      bgColor: '#FFF3E0',
      icon: 'alert-circle' as const,
    },
    { 
      value: 'Intensa' as const, 
      label: 'Intensa', 
      color: '#F44336',
      bgColor: '#FFEBEE',
      icon: 'alert-triangle' as const,
    }
  ];

  const validateField = (field: string, value: any): string => {
    switch (field) {
      case 'descricao_sintoma':
        if (!value || value.trim().length < 3) {
          return 'Descrição deve ter pelo menos 3 caracteres';
        }
        break;
      case 'intensidade':
        if (!value || !['Leve', 'Moderada', 'Intensa'].includes(value)) {
          return 'Selecione uma intensidade';
        }
        break;
      case 'doenca_id':
        if (!value || value === 0) {
          return 'Selecione uma doença';
        }
        break;
      case 'data_hora_inicio':
        if (!value) {
          return 'Selecione data e hora de início';
        }
        break;
    }
    return '';
  };

  const isFormValid = useMemo(() => {
    return (
      newSintoma.doenca_id > 0 &&
      newSintoma.descricao_sintoma.trim().length >= 3 &&
      ['Leve', 'Moderada', 'Intensa'].includes(newSintoma.intensidade) &&
      newSintoma.data_hora_inicio.length > 0
    );
  }, [newSintoma]);

  const handleFieldChange = (field: string, value: any) => {
    setNewSintoma(prev => ({ ...prev, [field]: value }));
    
    // Validar campo em tempo real
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
    
    // Marcar como tocado
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleDateTimeChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDateTimePicker(false);
    }
    
    if (event.type === 'set' && date) {
      setSelectedDateTime(date);
      // Formatar como ISO string com data e hora
      const isoString = date.toISOString();
      handleFieldChange('data_hora_inicio', isoString);
    } else if (event.type === 'dismissed') {
      setShowDateTimePicker(false);
    }
  };

  const formatDateTime = (isoString: string): string => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      
      const dateStr = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const timeStr = date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      return `${dateStr} às ${timeStr}`;
    } catch {
      return isoString;
    }
  };

  const handleSaveSintoma = async () => {
    // Validar todos os campos
    const newErrors: {[key: string]: string} = {};
    Object.keys(newSintoma).forEach(field => {
      const error = validateField(field, newSintoma[field as keyof Sintoma]);
      if (error) {
        newErrors[field] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Object.keys(newErrors).forEach(field => {
        setTouched(prev => ({ ...prev, [field]: true }));
      });
      Alert.alert('Campos obrigatórios', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      if (!token) {
        Alert.alert('Erro de Autenticação', 'Você não está logado.');
        setLoading(false);
        return;
      }

      const profileId = await AsyncStorage.getItem('active_profile_id');
      if (!profileId) {
        Alert.alert('Erro', 'Nenhum perfil ativo encontrado.');
        setLoading(false);
        return;
      }

      const perfilIdParsed = parseInt(profileId);
      const sintomaData = {
        descricao_sintoma: newSintoma.descricao_sintoma.trim(),
        intensidade: newSintoma.intensidade,
        data_hora_inicio: newSintoma.data_hora_inicio,
        perfil_id: perfilIdParsed
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.SYMPTOMS_RECORDS}/${newSintoma.doenca_id}/symptoms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(sintomaData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Erro ao salvar sintoma. Status: ${response.status}`);
      }

      const novoSintoma = {
        id: result.data.id,
        doenca_id: newSintoma.doenca_id,
        ...sintomaData
      };

      setSintomas(prev => [novoSintoma, ...prev]);
      
      // Se não estiver em modo rápido, fechar modal e resetar
      if (!fastMode) {
        setShowAddModal(false);
        resetForm();
      } else {
        // Modo rápido: manter modal aberto e resetar apenas alguns campos
        setNewSintoma(prev => ({
          ...prev,
          descricao_sintoma: '',
          intensidade: 'Leve',
          data_hora_inicio: '',
        }));
        setSelectedDateTime(new Date());
        setErrors({});
        setTouched({});
      }

      Alert.alert('Sucesso!', 'Sintoma registrado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar sintoma:', error);
      Alert.alert('Erro', error.message || 'Não foi possível salvar o sintoma.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewSintoma({
      doenca_id: 0,
      descricao_sintoma: '',
      intensidade: 'Leve',
      data_hora_inicio: '',
    });
    setSelectedDateTime(new Date());
    setErrors({});
    setTouched({});
    setFastMode(false);
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

  const getIntensidadeColor = (intensidade: string) => {
    const option = intensidadeOptions.find(opt => opt.value === intensidade);
    return option?.color || '#666';
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color="#16425B" />
        </TouchableOpacity>
        <Text style={styles.title}>Sintomas</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={openAddModal}
        >
          <Feather name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {sintomas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Feather name="activity" size={64} color="#81C4D7" />
            </View>
            <Text style={styles.emptyTitle}>Nenhum sintoma registrado</Text>
            <Text style={styles.emptySubtitle}>
              Toque no botão + para registrar um novo sintoma
            </Text>
          </View>
        ) : (
          <View style={styles.sintomasList}>
            {sintomas.map((sintoma) => {
              const doenca = doencas.find(d => d.id === sintoma.doenca_id);
              return (
                <View key={sintoma.id} style={styles.sintomaCard}>
                  <View style={styles.sintomaHeader}>
                    <View style={styles.sintomaInfo}>
                      <Text style={styles.sintomaDoenca}>
                        {doenca?.nome_doenca || 'Doença não encontrada'}
                      </Text>
                      <Text style={styles.sintomaDescricao}>
                        {sintoma.descricao_sintoma}
                      </Text>
                      <View style={styles.sintomaMeta}>
                        <Feather name="calendar" size={14} color="#707070" />
                        <Text style={styles.sintomaData}>
                          {formatDate(sintoma.data_hora_inicio)}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteSintoma(sintoma.id!)}
                    >
                      <Feather name="trash-2" size={20} color="#EB9481" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.sintomaFooter}>
                    <View style={[
                      styles.intensidadeBadge,
                      { backgroundColor: getIntensidadeColor(sintoma.intensidade) + '20' }
                    ]}>
                      <View style={[
                        styles.intensidadeDot,
                        { backgroundColor: getIntensidadeColor(sintoma.intensidade) }
                      ]} />
                      <Text style={[
                        styles.intensidadeText,
                        { color: getIntensidadeColor(sintoma.intensidade) }
                      ]}>
                        {sintoma.intensidade}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Modal para adicionar sintoma */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setShowAddModal(false);
                resetForm();
              }}
            >
              <Feather name="x" size={24} color="#16425B" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Novo Sintoma</Text>
            <TouchableOpacity
              style={styles.fastModeButton}
              onPress={() => setFastMode(!fastMode)}
            >
              <Feather 
                name={fastMode ? "zap" : "zap-off"} 
                size={20} 
                color={fastMode ? "#FF9800" : "#707070"} 
              />
            </TouchableOpacity>
          </View>

          {fastMode && (
            <View style={styles.fastModeBanner}>
              <Feather name="zap" size={16} color="#FF9800" />
              <Text style={styles.fastModeText}>Modo Rápido Ativado</Text>
            </View>
          )}

          <ScrollView 
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Seleção de Doença */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Doença <Text style={styles.required}>*</Text>
              </Text>
              {loadingDoencas ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#3B7CA6" />
                  <Text style={styles.loadingText}>Carregando doenças...</Text>
                </View>
              ) : doencas.length === 0 ? (
                <View style={styles.emptyDoencasContainer}>
                  <Feather name="alert-circle" size={24} color="#EB9481" />
                  <Text style={styles.emptyDoencasText}>
                    Nenhuma doença cadastrada. Cadastre uma doença primeiro.
                  </Text>
                  <TouchableOpacity
                    style={styles.createDoencaButton}
                    onPress={() => router.push('/monitor/nova-doenca-sintoma')}
                  >
                    <Feather name="plus" size={18} color="#FFFFFF" />
                    <Text style={styles.createDoencaButtonText}>
                      Cadastrar Doença e Sintoma
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.diseaseScrollContainer}
                >
                  <View style={styles.diseaseCardContainer}>
                    {doencas.map((doenca) => (
                      <TouchableOpacity
                        key={doenca.id}
                        style={[
                          styles.diseaseCard,
                          newSintoma.doenca_id === doenca.id && styles.diseaseCardSelected
                        ]}
                        onPress={() => handleFieldChange('doenca_id', doenca.id)}
                      >
                        <View style={[
                          styles.diseaseCardIcon,
                          newSintoma.doenca_id === doenca.id && styles.diseaseCardIconSelected
                        ]}>
                          <Feather 
                            name={newSintoma.doenca_id === doenca.id ? "check" : "circle"} 
                            size={20} 
                            color={newSintoma.doenca_id === doenca.id ? "#FFFFFF" : "#81C4D7"} 
                          />
                        </View>
                        <Text style={[
                          styles.diseaseCardText,
                          newSintoma.doenca_id === doenca.id && styles.diseaseCardTextSelected
                        ]}>
                          {doenca.nome_doenca}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              )}
              {errors.doenca_id && touched.doenca_id && (
                <Text style={styles.errorText}>{errors.doenca_id}</Text>
              )}
            </View>

            {/* Descrição do Sintoma */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Descrição do Sintoma <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[
                    styles.input,
                    errors.descricao_sintoma && touched.descricao_sintoma && styles.inputError
                  ]}
                  value={newSintoma.descricao_sintoma}
                  onChangeText={(text) => handleFieldChange('descricao_sintoma', text)}
                  onBlur={() => setTouched(prev => ({ ...prev, descricao_sintoma: true }))}
                  placeholder="Ex: Dor de cabeça, febre, náusea..."
                  placeholderTextColor="#A4A4A4"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
              {errors.descricao_sintoma && touched.descricao_sintoma && (
                <Text style={styles.errorText}>{errors.descricao_sintoma}</Text>
              )}
            </View>

            {/* Intensidade */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Intensidade <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.intensidadeContainer}>
                {intensidadeOptions.map((option) => {
                  const isSelected = newSintoma.intensidade === option.value;
                  const isIntensa = option.value === 'Intensa';
                  
                  return (
                    <Animated.View
                      key={option.value}
                      style={[
                        { transform: isIntensa && isSelected ? [{ scale: pulseAnim }] : [] }
                      ]}
                    >
                      <TouchableOpacity
                        style={[
                          styles.intensidadeCard,
                          isSelected && styles.intensidadeCardSelected,
                          { 
                            borderColor: option.color,
                            backgroundColor: isSelected ? option.bgColor : '#FFFFFF'
                          }
                        ]}
                        onPress={() => handleFieldChange('intensidade', option.value)}
                      >
                        <View style={[
                          styles.intensidadeIconContainer,
                          { backgroundColor: isSelected ? option.color + '20' : 'transparent' }
                        ]}>
                          <Feather 
                            name={option.icon} 
                            size={24} 
                            color={isSelected ? option.color : '#A4A4A4'} 
                          />
                        </View>
                        <Text style={[
                          styles.intensidadeLabel,
                          { color: isSelected ? option.color : '#707070' }
                        ]}>
                          {option.label}
                        </Text>
                        {isSelected && (
                          <View style={[styles.intensidadeCheck, { backgroundColor: option.color }]}>
                            <Feather name="check" size={14} color="#FFFFFF" />
                          </View>
                        )}
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </View>
              {newSintoma.intensidade === 'Intensa' && (
                <View style={styles.intenseAlert}>
                  <Feather name="alert-triangle" size={16} color="#F44336" />
                  <Text style={styles.intenseAlertText}>
                    Intensidade intensa detectada. Considere buscar atendimento médico.
                  </Text>
                </View>
              )}
              {errors.intensidade && touched.intensidade && (
                <Text style={styles.errorText}>{errors.intensidade}</Text>
              )}
            </View>

            {/* Data e Hora de Início */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Data e Hora de Início <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={[
                  styles.dateTimeInput,
                  errors.data_hora_inicio && touched.data_hora_inicio && styles.inputError
                ]}
                onPress={() => setShowDateTimePicker(true)}
              >
                <View style={styles.dateTimeInputContent}>
                  <Feather name="calendar" size={20} color="#3B7CA6" />
                  <Text style={[
                    styles.dateTimeInputText,
                    !newSintoma.data_hora_inicio && styles.dateTimeInputTextPlaceholder
                  ]}>
                    {newSintoma.data_hora_inicio 
                      ? formatDateTime(newSintoma.data_hora_inicio)
                      : 'Selecione data e hora'}
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color="#A4A4A4" />
              </TouchableOpacity>
              {errors.data_hora_inicio && touched.data_hora_inicio && (
                <Text style={styles.errorText}>{errors.data_hora_inicio}</Text>
              )}
              
              {Platform.OS === 'ios' && showDateTimePicker && (
                <View style={styles.dateTimePickerContainer}>
                  <View style={styles.dateTimePickerHeader}>
                    <TouchableOpacity onPress={() => setShowDateTimePicker(false)}>
                      <Text style={styles.dateTimePickerCancel}>Cancelar</Text>
                    </TouchableOpacity>
                    <Text style={styles.dateTimePickerTitle}>Data e Hora</Text>
                    <TouchableOpacity onPress={() => {
                      setShowDateTimePicker(false);
                      handleDateTimeChange({ type: 'set' }, selectedDateTime);
                    }}>
                      <Text style={styles.dateTimePickerConfirm}>Confirmar</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={selectedDateTime}
                    mode="datetime"
                    display="spinner"
                    onChange={handleDateTimeChange}
                    maximumDate={new Date()}
                  />
                </View>
              )}
              
              {Platform.OS === 'android' && showDateTimePicker && (
                <DateTimePicker
                  value={selectedDateTime}
                  mode="datetime"
                  display="default"
                  onChange={handleDateTimeChange}
                  maximumDate={new Date()}
                />
              )}
            </View>
          </ScrollView>

          {/* Botão Salvar */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                !isFormValid && styles.saveButtonDisabled
              ]}
              onPress={handleSaveSintoma}
              disabled={!isFormValid || loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="check" size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Salvar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
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
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#16425B',
  },
  addButton: {
    backgroundColor: '#3B7CA6',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8F4F8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#16425B',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#707070',
    textAlign: 'center',
    lineHeight: 22,
  },
  sintomasList: {
    gap: 16,
  },
  sintomaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#81C4D7',
  },
  sintomaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sintomaInfo: {
    flex: 1,
  },
  sintomaDoenca: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B7CA6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  sintomaDescricao: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16425B',
    marginBottom: 8,
    lineHeight: 22,
  },
  sintomaMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sintomaData: {
    fontSize: 14,
    color: '#707070',
  },
  deleteButton: {
    padding: 8,
  },
  sintomaFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  intensidadeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  intensidadeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  intensidadeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#16425B',
  },
  fastModeButton: {
    padding: 8,
  },
  fastModeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3E0',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
  },
  fastModeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9800',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 28,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16425B',
    marginBottom: 12,
  },
  required: {
    color: '#F44336',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#707070',
  },
  emptyDoencasContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    gap: 12,
  },
  emptyDoencasText: {
    fontSize: 14,
    color: '#F44336',
    lineHeight: 20,
    textAlign: 'center',
  },
  createDoencaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B7CA6',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
    marginTop: 8,
  },
  createDoencaButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  diseaseScrollContainer: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  diseaseCardContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  diseaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    gap: 10,
    minWidth: 140,
  },
  diseaseCardSelected: {
    borderColor: '#3B7CA6',
    backgroundColor: '#E8F4F8',
  },
  diseaseCardIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F7F7F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  diseaseCardIconSelected: {
    backgroundColor: '#3B7CA6',
  },
  diseaseCardText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#707070',
  },
  diseaseCardTextSelected: {
    color: '#16425B',
    fontWeight: '600',
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#16425B',
    minHeight: 100,
  },
  inputError: {
    borderColor: '#F44336',
  },
  errorText: {
    color: '#F44336',
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
  intensidadeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  intensidadeCard: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
    minHeight: 120,
    justifyContent: 'center',
  },
  intensidadeCardSelected: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  intensidadeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  intensidadeLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  intensidadeCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intenseAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  intenseAlertText: {
    flex: 1,
    fontSize: 13,
    color: '#F44336',
    lineHeight: 18,
  },
  dateTimeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateTimeInputContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  dateTimeInputText: {
    fontSize: 16,
    color: '#16425B',
    fontWeight: '500',
  },
  dateTimeInputTextPlaceholder: {
    color: '#A4A4A4',
    fontWeight: '400',
  },
  dateTimePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 12,
    overflow: 'hidden',
  },
  dateTimePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dateTimePickerCancel: {
    fontSize: 16,
    color: '#707070',
    fontWeight: '500',
  },
  dateTimePickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16425B',
  },
  dateTimePickerConfirm: {
    fontSize: 16,
    color: '#3B7CA6',
    fontWeight: '600',
  },
  modalFooter: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B7CA6',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#A4A4A4',
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
});
