import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface Medicamento {
  id: string;
  nome: string;
  tomado: boolean;
  dosesPorDia: number;
  horario1: string;
  horario2: string;
}

export default function EditarMedicamentoScreen() {
  const router = useRouter();
  const { medicamento } = useLocalSearchParams();
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);

  useEffect(() => {
    // Aqui você carregaria os medicamentos do estado global ou do backend
    // Por enquanto, usando dados mockados
    setMedicamentos([
      { id: '1', nome: 'Medicamento 1', tomado: false, dosesPorDia: 2, horario1: '08:00', horario2: '17:00' },
      { id: '2', nome: 'Medicamento 2', tomado: true, dosesPorDia: 1, horario1: '09:00', horario2: '' },
      { id: '3', nome: 'Medicamento 3', tomado: true, dosesPorDia: 3, horario1: '08:00', horario2: '14:00' },
      { id: '4', nome: 'Medicamento 4', tomado: true, dosesPorDia: 1, horario1: '20:00', horario2: '' },
    ]);
  }, []);

  const handleAddMedicamento = () => {
    router.push('/monitor/novo-medicamento');
  };

  const handleEditMedicamento = (medicamento: Medicamento) => {
    router.push({
      pathname: '/monitor/editar-medicamento-form',
      params: { medicamento: JSON.stringify(medicamento) }
    });
  };

  const handleDeleteMedicamento = (id: string) => {
    Alert.alert(
      'Excluir Medicamento',
      'Tem certeza que deseja excluir este medicamento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => {
            setMedicamentos(prev => prev.filter(med => med.id !== id));
          }
        }
      ]
    );
  };

  const handleSave = () => {
    // Aqui você pode implementar a lógica para salvar no backend
    Alert.alert('Sucesso', 'Medicamentos salvos com sucesso!');
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#004A61" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Editar medicamentos</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

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
          {medicamentos.map((medicamento) => (
            <View key={medicamento.id} style={styles.medicamentoItem}>
              <View
                style={[
                  styles.medicamentoCard,
                  medicamento.tomado ? styles.medicamentoCardTomado : styles.medicamentoCardNaoTomado
                ]}
              >
                <Text style={styles.medicamentoNome}>{medicamento.nome}</Text>
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
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Botão Salvar */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Salvar</Text>
      </TouchableOpacity>
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
  medicamentoNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
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
  saveButton: {
    backgroundColor: '#004A61',
    borderRadius: 15,
    alignItems: 'center',
    paddingVertical: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
