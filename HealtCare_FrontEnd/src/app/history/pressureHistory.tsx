import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Reutilize a variável de ambiente
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.15.7:3000';

// Defina a interface para o item de histórico
interface PressureHistoryItem {
  id: number;
  data_hora_medicao: string;
  sistolica_mmhg: number;
  diastolica_mmhg: number;
}

// Componente para renderizar cada item da lista
const HistoryItem: React.FC<{
  item: PressureHistoryItem;
  onEdit: (item: PressureHistoryItem) => void;
  onDelete: (id: number) => void;
}> = ({ item, onEdit, onDelete }) => {
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
    <View style={styles.itemDetails}><Text style={styles.itemDate}>{formattedDate}</Text><Text style={styles.itemValues}>Sistólica: <Text style={styles.boldText}>{item.sistolica_mmhg}</Text> mmHg</Text><Text style={styles.itemValues}>Diastólica: <Text style={styles.boldText}>{item.diastolica_mmhg}</Text> mmHg</Text></View>
    <View style={styles.itemActions}><TouchableOpacity onPress={() => onEdit(item)} style={styles.actionButton}><Feather name="edit" size={22} color="#004A61" /></TouchableOpacity><TouchableOpacity onPress={() => onDelete(item.id)} style={styles.actionButton}><Feather name="trash-2" size={22} color="#D9534F" /></TouchableOpacity></View>
  </View>
  );
};

export default function PressureHistoryScreen() {
  const router = useRouter();
  const [records, setRecords] = useState<PressureHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PressureHistoryItem | null>(null);

  const [systolic, setSystolic] = useState(0);
  const [diastolic, setDiastolic] = useState(0);
  const [date, setDate] = useState('');  

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
  const handleEdit = (item: PressureHistoryItem) => {
    setEditingRecord(item); // Guarda o item inteiro que estamos editando
    // Preenche os estados do formulário com os dados do item clicado
    setSystolic(item.sistolica_mmhg);
    setDiastolic(item.diastolica_mmhg);
    setDate(new Date(item.data_hora_medicao).toISOString().split('T')[0]);
    setIsModalVisible(true); // Abre o modal
  };

  const handleUpdate = async () => {
    if (!editingRecord) return; // Segurança: só continua se houver um registro em edição

    // Validação dos dados
    if (!systolic || !diastolic || systolic <= 0 || diastolic <= 0) {
      Alert.alert('Atenção', 'Por favor, insira valores de pressão válidos.');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');
      const url = `${API_URL}/api/pressao-arterial/${editingRecord.id}`;
      const method = 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          sistolica_mmhg: systolic,
          diastolica_mmhg: diastolic,
          data_hora_medicao: `${date} ${new Date(editingRecord.data_hora_medicao).toTimeString().slice(0, 8)}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao atualizar o registro.');
      }

      Alert.alert('Sucesso!', 'Registro atualizado com sucesso.');
      setIsModalVisible(false); // Fecha o modal
      setEditingRecord(null); // Limpa o registro em edição
      fetchHistory(); // Atualiza a lista para mostrar os novos dados

    } catch (err: any) {
      Alert.alert('Erro ao Atualizar', err.message);
    }
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
    <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Registro</Text>
            
            {/* Formulário de Edição (reaproveitando a lógica e estilo) */}
            <View style={styles.formContainer}>
              {/* Card Sistólica */}
              <View style={styles.pressureCard}><View style={styles.pressureBody}><TouchableOpacity style={styles.controlButton} onPress={() => setSystolic(prev => prev - 1)}><Feather name="minus-circle" size={32} color="#6c757d" /></TouchableOpacity><View style={styles.pressureValueContainer}><Text style={styles.pressureValueMain}>{systolic}</Text><Text style={styles.pressureUnit}>mmHg</Text></View><TouchableOpacity style={styles.controlButton} onPress={() => setSystolic(prev => prev + 1)}><Feather name="plus-circle" size={32} color="#6c757d" /></TouchableOpacity></View></View>
              {/* Card Diastólica */}
              <View style={styles.pressureCard}><View style={styles.pressureBody}><TouchableOpacity style={styles.controlButton} onPress={() => setDiastolic(prev => prev - 1)}><Feather name="minus-circle" size={32} color="#6c757d" /></TouchableOpacity><View style={styles.pressureValueContainer}><Text style={styles.pressureValueMain}>{diastolic}</Text><Text style={styles.pressureUnit}>mmHg</Text></View><TouchableOpacity style={styles.controlButton} onPress={() => setDiastolic(prev => prev + 1)}><Feather name="plus-circle" size={32} color="#6c757d" /></TouchableOpacity></View></View>
              {/* Data */}
              <Text style={styles.dateLabel}>Data do registro</Text>
              <TextInput style={styles.dateInput} value={date} onChangeText={setDate} placeholder="AAAA-MM-DD" />
            </View>

            {/* Botões do Modal */}
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
  // ... (estilos existentes)
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  backButton: {},
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  listContainer: { padding: 20 },
  itemContainer: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 15, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, },
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
  // Modal Styles
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '90%', backgroundColor: '#F0F4F8', borderRadius: 20, padding: 20, alignItems: 'center' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  formContainer: { width: '100%' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 20 },
  modalButton: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  cancelButton: { backgroundColor: '#f0f0f0', marginRight: 10 },
  cancelButtonText: { color: '#333', fontWeight: 'bold' },
  saveButton: { backgroundColor: '#004A61' },
  // Estilos do formulário (reaproveitados de pressure.tsx)
  pressureCard: { backgroundColor: '#FFFFFF', borderRadius: 15, marginBottom: 15, elevation: 1 },
  pressureBody: { paddingVertical: 10, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  controlButton: { padding: 10 },
  pressureValueContainer: { flexDirection: 'row', alignItems: 'baseline' },
  pressureValueMain: { fontSize: 50, fontWeight: 'bold', color: '#333', textAlign: 'center', minWidth: 80 },
  pressureUnit: { fontSize: 18, color: '#333', marginLeft: 8 },
  dateLabel: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 10, marginTop: 10 },
  dateInput: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 15, fontSize: 16, color: '#333', elevation: 1 },
});