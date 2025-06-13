import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Hook que centraliza a lógica
import { useBloodPressureRecords } from '@/hooks/useBloodPressureRecords';

// Componentes de UI
import DeleteConfirmModal from '@/components/BloodPressure/DeleteConfirmModal';
import HistoryView from '@/components/BloodPressure/HistoryView'; // <-- NOVO
import RegistrationView from '@/components/BloodPressure/RegistrationView'; // <-- NOVO

const BloodPressureScreen = () => {
  // 1. O hook continua sendo a única fonte da verdade para o estado.
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

  // 2. Função intermediária para o formulário.
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
  
  // 3. Renderiza o layout e a view correta (Registro ou Histórico)
  return (
    <SafeAreaView style={styles.container}>
      {/* O Header e a Mensagem continuam aqui, pois são comuns a ambas as views. */}
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

      {message.text ? (
        <View style={[styles.message, styles[`message${message.type.charAt(0).toUpperCase() + message.type.slice(1)}`]]}>
          <Text style={styles.messageText}>{message.text}</Text>
        </View>
      ) : null}

      {/* Renderização Condicional dos novos componentes de view */}
      {currentView === 'register' ? (
        <RegistrationView
          isEditing={!!editingRecord}
          formState={form}
          onFormChange={handleFormChange}
          onSave={handleSave}
          onCancelEdit={cancelEdit}
        />
      ) : (
        <HistoryView
          records={records}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* O Modal de confirmação continua aqui, pois pode ser chamado de qualquer view. */}
      <DeleteConfirmModal
        visible={showDeleteConfirm !== null}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
    </SafeAreaView>
  );
};

// Os estilos para o layout principal permanecem os mesmos.
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