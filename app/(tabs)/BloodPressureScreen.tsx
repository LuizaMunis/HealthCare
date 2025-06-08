// BloodPressureScreen.tsx
// Este arquivo é responsável por renderizar a tela de Pressão Arterial, incluindo o gráfico, histórico e formulário de registro.
// Ele utiliza o Hook useBloodPressureRecords para gerenciar o estado e as ações relacionadas aos registros de pressão arterial.
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Importa o Hook que centraliza toda a lógica
import { useBloodPressureRecords } from '@/hooks/useBloodPressureRecords';

// Importa os novos componentes visuais
import BloodPressureChart from '@/components/BloodPressure/BloodPressureChart';
import DeleteConfirmModal from '@/components/BloodPressure/DeleteConfirmModal';
import HistoryList from '@/components/BloodPressure/HistoryList';
import RegistrationForm from '@/components/BloodPressure/RegistrationForm';

const BloodPressureScreen = () => {
  // 1. Pega todos os estados e funções do nosso hook customizado
  const {
    records,
    currentView,
    editingRecord,
    showDeleteConfirm,
    message,
    form,
    setCurrentView,
    setSystolic,
    setDiastolic,
    setDate,
    setTime,
    handleSave,
    handleEdit,
    handleDelete,
    confirmDelete,
    cancelDelete,
    cancelEdit,
  } = useBloodPressureRecords();

  // 2. Função intermediária para passar os setters para o formulário
  const handleFormChange = (field, value) => {
    const setters = {
      systolic: setSystolic,
      diastolic: setDiastolic,
      date: setDate,
      time: setTime,
    };
    if (setters[field]) {
      setters[field](value);
    }
  };
  
  // 3. Renderiza a tela, distribuindo os dados e funções para os componentes filhos
  return (
    <SafeAreaView style={styles.container}>
      {/* Header com os botões de navegação */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pressão Arterial</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.headerButton, currentView === 'register' && styles.activeButton]}
            onPress={() => setCurrentView('register')}
          >
            <Text style={[styles.headerButtonText, currentView === 'register' && styles.activeButtonText]}>
              Novo Registro
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, currentView === 'history' && styles.activeButton]}
            onPress={() => setCurrentView('history')}
          >
            <Text style={[styles.headerButtonText, currentView === 'history' && styles.activeButtonText]}>
              Histórico
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Componente de Mensagem para feedback ao usuário */}
      {message.text ? (
        <View style={[styles.message, styles[`message${message.type.charAt(0).toUpperCase() + message.type.slice(1)}`]]}>
          <Text style={styles.messageText}>{message.text}</Text>
        </View>
      ) : null}

      {/* Renderização Condicional: ou mostra o formulário, ou mostra o histórico */}
      {currentView === 'register' ? (
        <RegistrationForm
          isEditing={!!editingRecord}
          formState={form}
          onFormChange={handleFormChange}
          onSave={handleSave}
          onCancelEdit={cancelEdit}
        />
      ) : (
        <> 
          <BloodPressureChart records={records} />
          <HistoryList
            records={records}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </>
      )}

      {/* O Modal de Confirmação, que aparece sobre toda a tela quando ativado */}
      <DeleteConfirmModal
        visible={showDeleteConfirm !== null}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
    </SafeAreaView>
  );
};

// Estilos que pertencem apenas ao layout da tela (container, header, message)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  headerButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  activeButton: {
    backgroundColor: 'white',
  },
  headerButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  activeButtonText: {
    color: '#2196F3',
  },
  message: {
    padding: 15,
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 8,
  },
  messageSuccess: {
    backgroundColor: '#d4edda',
  },
  messageError: {
    backgroundColor: '#f8d7da',
  },
  messageWarning: {
    backgroundColor: '#fff3cd',
  },
  messageText: {
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default BloodPressureScreen;