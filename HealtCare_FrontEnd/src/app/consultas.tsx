import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, ENDPOINTS } from '@/constants/api';

interface Consulta {
  id: string;
  especialidade: string;
  data: string;
  horario: string;
  endereco?: string;
  descricao?: string;
}

export default function ConsultasScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConsultas = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('healthcare_auth_token');

      if (!token) {
        Alert.alert('Erro', 'Você precisa estar logado para ver as consultas');
        setConsultas([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.CONSULTAS}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          Alert.alert('Erro', 'Sessão expirada. Por favor, faça login novamente');
          return;
        }
        throw new Error('Erro ao buscar consultas');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Transformar os dados do backend para o formato esperado
        const consultasFormatadas: Consulta[] = result.data.map((consulta: any) => {
          // Parsear data_hora_consulta (formato ISO ou timestamp)
          const dataHora = new Date(consulta.data_hora_consulta);
          // Formatar data como "3 de novembro" (sem ano)
          const dataFormatada = dataHora.toLocaleDateString('pt-BR', {
            day: 'numeric',
            month: 'long'
          });
          // Formatar horário como "11h30"
          const horarioFormatado = dataHora.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
          }).replace(':', 'h');

          return {
            id: consulta.id.toString(),
            especialidade: consulta.especialidade || '',
            data: dataFormatada,
            horario: horarioFormatado,
            endereco: consulta.local || consulta.endereco,
            descricao: consulta.observacoes || consulta.descricao,
          };
        });
        setConsultas(consultasFormatadas);
      } else {
        setConsultas([]);
      }
    } catch (error: any) {
      console.error('Erro ao buscar consultas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as consultas. Tente novamente.');
      setConsultas([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchConsultas();
    }, [fetchConsultas])
  );

  const filteredConsultas = consultas.filter(consulta =>
    consulta.especialidade.toLowerCase().includes(searchText.toLowerCase()) ||
    consulta.data.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleAddConsulta = () => {
    router.push('/nova-consulta');
  };

  const handleConsultaPress = (consulta: Consulta) => {
    router.push({
      pathname: '/detalhes-consulta',
      params: { consulta: JSON.stringify(consulta) }
    });
  };

  const handleEditConsulta = async (consulta: Consulta) => {
    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      if (!token) {
        Alert.alert('Erro', 'Você precisa estar logado para editar uma consulta');
        return;
      }

      // Buscar a consulta completa do backend para ter os dados originais
      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.CONSULTAS}/${consulta.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          Alert.alert('Erro', 'Sessão expirada. Por favor, faça login novamente');
          return;
        }
        throw new Error('Erro ao buscar consulta');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Converter os dados do backend para o formato esperado pela tela de edição
        const dataHora = new Date(result.data.data_hora_consulta);
        
        // Formatar data como DD/MM/AAAA
        const dia = String(dataHora.getDate()).padStart(2, '0');
        const mes = String(dataHora.getMonth() + 1).padStart(2, '0');
        const ano = dataHora.getFullYear();
        const dataFormatada = `${dia}/${mes}/${ano}`;
        
        // Formatar horário como HH:mm
        const horas = String(dataHora.getHours()).padStart(2, '0');
        const minutos = String(dataHora.getMinutes()).padStart(2, '0');
        const horarioFormatado = `${horas}:${minutos}`;

        const consultaParaEdicao = {
          id: result.data.id.toString(),
          especialidade: result.data.especialidade || '',
          data: dataFormatada,
          horario: horarioFormatado,
          endereco: result.data.local || result.data.endereco || '',
          descricao: result.data.observacoes || result.data.descricao || '',
          nomeMedico: result.data.nome_medico || '',
        };

        router.push({
          pathname: '/editar-consulta',
          params: { consulta: JSON.stringify(consultaParaEdicao) }
        });
      } else {
        throw new Error('Erro ao buscar consulta');
      }
    } catch (error: any) {
      console.error('Erro ao buscar consulta para edição:', error);
      Alert.alert('Erro', 'Não foi possível carregar a consulta para edição. Tente novamente.');
    }
  };

  const handleDeleteConsulta = async (consulta: Consulta) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Você tem certeza que deseja excluir este registro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('healthcare_auth_token');
              if (!token) {
                Alert.alert('Erro', 'Você precisa estar logado para excluir uma consulta');
                return;
              }

              const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.CONSULTAS}/${consulta.id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (!response.ok) {
                let errorMessage = 'Falha ao excluir o registro.';
                try {
                  const result = await response.json();
                  errorMessage = result.message || errorMessage;
                } catch (e) {
                  errorMessage = `Erro do servidor: ${response.status} ${response.statusText}`;
                }
                throw new Error(errorMessage);
              }

              // Remove o item da lista localmente para atualizar a UI instantaneamente
              setConsultas(prevConsultas => prevConsultas.filter(c => c.id !== consulta.id));
              Alert.alert('Sucesso', 'Registro excluído com sucesso.');
            } catch (err: any) {
              Alert.alert('Erro ao Excluir', err.message);
            }
          },
        },
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
          <Text style={styles.title}>Consultas</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Botão Adicionar Consulta */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddConsulta}>
          <View style={styles.addIcon}>
            <Feather name="plus" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.addText}>Adicionar consultas</Text>
        </TouchableOpacity>
      </View>

      {/* Barra de Busca */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar item"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Lista de Consultas */}
      <ScrollView style={styles.consultasList} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#004A61" />
            <Text style={styles.loadingText}>Carregando consultas...</Text>
          </View>
        ) : filteredConsultas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="calendar" size={48} color="#999" />
            <Text style={styles.emptyText}>
              {searchText ? 'Nenhuma consulta encontrada' : 'Nenhuma consulta cadastrada'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchText ? 'Tente buscar com outros termos' : 'Clique em "Adicionar consultas" para criar uma nova'}
            </Text>
          </View>
        ) : (
          filteredConsultas.map((consulta) => (
            <TouchableOpacity
              key={consulta.id}
              style={styles.consultaCard}
              onPress={() => handleConsultaPress(consulta)}
            >
              <View style={styles.consultaStripe} />
              <View style={styles.consultaContent}>
                <View style={styles.consultaInfo}>
                  <Text style={styles.especialidade}>{consulta.especialidade}</Text>
                  <Text style={styles.data}>{consulta.data}</Text>
                  <Text style={styles.horario}>{consulta.horario}</Text>
                </View>
                <View style={styles.actionsContainer}>
                  <TouchableOpacity
                    style={styles.infoButton}
                    onPress={() => handleConsultaPress(consulta)}
                  >
                    <Feather name="info" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEditConsulta(consulta)}
                  >
                    <Feather name="edit" size={22} color="#004A61" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDeleteConsulta(consulta)}
                  >
                    <Feather name="trash-2" size={22} color="#D9534F" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
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
  headerSpacer: {
    width: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  addIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#004A61',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  addText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  consultasList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  consultaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  consultaStripe: {
    width: 5,
    backgroundColor: '#004A61',
  },
  consultaContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  consultaInfo: {
    flex: 1,
  },
  especialidade: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#004A61',
    marginBottom: 4,
  },
  data: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  horario: {
    fontSize: 14,
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  infoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#004A61',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
});
