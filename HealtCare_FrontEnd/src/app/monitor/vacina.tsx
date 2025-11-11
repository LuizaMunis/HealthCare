import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, ENDPOINTS } from '@/constants/api';

interface Vacina {
  id?: string;
  nome_vacina: string;
  dose: string;
  data_vacinacao: string;
}

export default function VacinaScreen() {
  const router = useRouter();
  const [vacinas, setVacinas] = useState<Vacina[]>([]);
  const [filteredVacinas, setFilteredVacinas] = useState<Vacina[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadVacinas();
  }, []);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredVacinas(vacinas);
    } else {
      const filtered = vacinas.filter(vacina =>
        vacina.nome_vacina.toLowerCase().includes(searchText.toLowerCase()) ||
        vacina.dose.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredVacinas(filtered);
    }
  }, [searchText, vacinas]);

  const loadVacinas = async () => {
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

      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.VACCINE_RECORDS}?perfil_id=${profileId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Verificar se a resposta tem o formato esperado
        if (data && Array.isArray(data)) {
          setVacinas(data);
          setFilteredVacinas(data);
        } else if (data && data.data && Array.isArray(data.data)) {
          // Se a resposta tem formato { success: true, data: [...] }
          setVacinas(data.data);
          setFilteredVacinas(data.data);
        } else {
          console.warn('Formato de resposta inesperado:', data);
          setVacinas([]);
          setFilteredVacinas([]);
        }
      } else {
        console.error('Erro na resposta da API:', response.status, response.statusText);
        setVacinas([]);
        setFilteredVacinas([]);
      }
    } catch (error) {
      console.error('Erro ao carregar vacinas:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteVacina = async (id: string) => {
    Alert.alert(
      'Excluir Vacina',
      'Tem certeza que deseja excluir este registro de vacina?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('healthcare_auth_token');
              if (!token) return;

              const profileId = await AsyncStorage.getItem('active_profile_id');
              if (!profileId) {
                Alert.alert('Erro', 'Nenhum perfil ativo encontrado.');
                return;
              }

              const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.VACCINE_RECORDS}/${id}?perfil_id=${profileId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

              if (response.ok) {
                Alert.alert('Sucesso!', 'Vacina excluída com sucesso.');
                loadVacinas();
              }
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir a vacina.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const formatDateForDisplay = (dateString: string) => {
    try {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long'
      });
    } catch {
      return dateString || '';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };


  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loaderContainer}>
          <Text>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Tratamento de erro para renderização
  try {

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#004A61" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Vacinas</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Adicionar Nova Vacina */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/monitor/nova-vacina')}
        >
          <View style={styles.addIcon}>
            <Feather name="plus" size={16} color="#FFFFFF" />
          </View>
          <Text style={styles.addText}>Adicionar nova vacina</Text>
        </TouchableOpacity>

        {/* Barra de Busca */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar item"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <ScrollView style={styles.vacinasList}>
          {/* Lista de Vacinas */}
          {filteredVacinas.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="shield" size={48} color="#CCC" />
              <Text style={styles.emptyStateText}>
                {searchText ? 'Nenhuma vacina encontrada' : 'Nenhuma vacina registrada'}
              </Text>
              <Text style={styles.emptyStateSubtext}>
                {searchText ? 'Tente outro termo de busca' : 'Toque no + para adicionar sua primeira vacina'}
              </Text>
            </View>
          ) : (
            filteredVacinas.map((vacina) => {
              // Validar se a vacina tem os dados necessários
              if (!vacina || !vacina.id || !vacina.nome_vacina) {
                return null;
              }
              
              return (
                <View key={vacina.id} style={styles.vacinaCard}>
                  <View style={styles.vacinaBar} />
                  <View style={styles.vacinaContent}>
                    <Text style={styles.vacinaNome}>{vacina.nome_vacina || 'Nome não disponível'}</Text>
                    <Text style={styles.vacinaData}>{formatDateForDisplay(vacina.data_vacinacao || '')}</Text>
                    <Text style={styles.vacinaTime}>{formatTime(vacina.data_vacinacao || '')}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteVacina(vacina.id!)}
                    style={styles.deleteButton}
                  >
                    <Feather name="trash-2" size={16} color="#FF4444" />
                  </TouchableOpacity>
                </View>
              );
            }).filter(Boolean)
          )}
        </ScrollView>
      </View>

    </SafeAreaView>
  );
  } catch (error) {
    console.error('Erro na renderização da tela de vacinação:', error);
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loaderContainer}>
          <Text style={{ color: 'red', textAlign: 'center' }}>
            Erro ao carregar a tela. Tente novamente.
          </Text>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    width: 20,
    height: 20,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  vacinasList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  vacinaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  vacinaBar: {
    width: 4,
    height: '100%',
    backgroundColor: '#004A61',
  },
  vacinaContent: {
    flex: 1,
    padding: 16,
  },
  vacinaNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  vacinaData: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  vacinaTime: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    padding: 16,
  },
});
