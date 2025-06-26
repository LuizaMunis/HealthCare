import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Reutilize a variável de ambiente
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.15.7:3000';

// Componente para renderizar cada item da lista
const HistoryItem = ({ item, onEdit, onDelete }) => {
  // Formata a data para um formato mais legível
  const formattedDate = new Date(item.data_hora_medicao).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.itemContainer}>
      <View style={styles.itemDetails}>
        <Text style={styles.itemDate}>{formattedDate}</Text>
        <Text style={styles.itemValues}>
          Sistólica: <Text style={styles.boldText}>{item.sistolica_mmhg}</Text> mmHg
        </Text>
        <Text style={styles.itemValues}>
          Diastólica: <Text style={styles.boldText}>{item.diastolica_mmhg}</Text> mmHg
        </Text>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity onPress={() => onEdit(item)} style={styles.actionButton}>
          <Feather name="edit" size={22} color="#004A61" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.actionButton}>
          <Feather name="trash-2" size={22} color="#D9534F" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function PressureHistoryScreen() {
  const router = useRouter();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar o histórico de medições
  const fetchHistory = async () => {
      setLoading(true);
      // Limpa erros anteriores ao tentar novamente
      setError(null); 
      
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          throw new Error('Token de autenticação não encontrado.');
        }

        const response = await fetch(`${API_URL}/api/pressao-arterial`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const result = await response.json();
        
        // Depuração para ver o que a API está retornando
        console.log("Resposta da API recebida:", JSON.stringify(result, null, 2));
        
        // Se a resposta da API não for 'ok' (ex: erro 400, 500), joga um erro
        if (!response.ok) {
          // Usa a mensagem de erro do backend, se houver, ou uma padrão
          throw new Error(result.message || 'Falha ao buscar o histórico.');
        }
        
        const recordsArray = result.data; 
        if (Array.isArray(recordsArray)) {
          // Se for um Array, ordena e atualiza o estado
          recordsArray.sort((a, b) => new Date(b.data_hora_medicao).getTime() - new Date(a.data_hora_medicao).getTime());
          setRecords(recordsArray);
        } else {
          // Se NÃO for um Array, define o estado como um array vazio
          console.warn("A API não retornou um array de registros. Definindo como vazio.");
          setRecords([]);
        }

      } catch (err: any) {
        // O 'catch' captura QUALQUER erro que acontecer dentro do 'try'
        console.error("Erro em fetchHistory:", err);
        setError(err.message);
        // O Alert pode ser opcional se você já mostra o erro na tela
        // Alert.alert('Erro ao Carregar', err.message);
      } finally {
        // O 'finally' sempre executa, independentemente de sucesso ou erro
        setLoading(false);
      }
  };

  // useFocusEffect garante que os dados sejam recarregados sempre que a tela entra em foco
  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [])
  );

  // Função para lidar com a exclusão de um registro
  const handleDelete = async (id: number) => {
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
              const token = await AsyncStorage.getItem('userToken');

              const response = await fetch(`${API_URL}/api/pressao-arterial/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
                },
              });

              if (!response.ok) {
                const result = await response.json();
                let errorMessage = 'Falha ao excluir o registro.';
                try {
                  const errorResult = await response.json();
                  errorMessage = errorResult.message || errorMessage;
                } catch (e) {
                  errorMessage = `Erro do servidor: ${response.status} ${response.statusText}`;
                }
                throw new Error(result.message || 'Falha ao excluir o registro.');
              }

              // Remove o item da lista localmente para atualizar a UI instantaneamente
              setRecords(prevRecords => prevRecords.filter(record => record.id !== id));
              Alert.alert('Sucesso', 'Registro excluído com sucesso.');
            } catch (err: any) {
              Alert.alert('Erro ao Excluir', err.message);
            }
          },
        },
      ]
    );
  };

  // Função para navegar para a tela de edição, passando os dados do item
  const handleEdit = (item: any) => {
    router.push({
      pathname: '/monitor/pressure',
      params: { ...item } // Passa todos os dados do item como parâmetros
    });
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#004A61" style={styles.centered} />;
  }

  if (error && records.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Erro ao carregar dados: {error}</Text>
        <TouchableOpacity onPress={fetchHistory} style={styles.retryButton}>
            <Text style={styles.saveButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#004A61" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico de Pressão</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {records.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Nenhum registro encontrado.</Text>
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  backButton: {},
  listContainer: { padding: 20 },
  itemContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  itemDetails: { flex: 1 },
  itemDate: { fontSize: 12, color: 'gray', marginBottom: 8 },
  itemValues: { fontSize: 16, color: '#333' },
  boldText: { fontWeight: 'bold' },
  itemActions: { flexDirection: 'row' },
  actionButton: { padding: 8, marginLeft: 8 },
  emptyText: { fontSize: 16, color: 'gray' },
  errorText: { fontSize: 16, color: 'red', textAlign: 'center', marginBottom: 20, },
  retryButton: {
    backgroundColor: '#004A61',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
   saveButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});