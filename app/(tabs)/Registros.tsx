import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const BloodPressureScreen = () => {
  const [records, setRecords] = useState([]);
  const [currentView, setCurrentView] = useState('register'); // 'register' ou 'history'
  const [editingRecord, setEditingRecord] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Form fields
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  useEffect(() => {
    // Definir data e hora atual como padrão
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5);
    setDate(currentDate);
    setTime(currentTime);
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const validateValues = (sys, dia) => {
    const systolicNum = parseInt(sys);
    const diastolicNum = parseInt(dia);
    
    if (sys && (systolicNum < 80 || systolicNum > 250)) {
      return false;
    }
    if (dia && (diastolicNum < 50 || diastolicNum > 150)) {
      return false;
    }
    return true;
  };

  const validateDate = (selectedDate) => {
    const today = new Date();
    const selected = new Date(selectedDate);
    return selected <= today;
  };

  const checkCriticalValues = (sys, dia) => {
    const systolicNum = parseInt(sys);
    const diastolicNum = parseInt(dia);
    
    if ((systolicNum && systolicNum >= 140) || (diastolicNum && diastolicNum >= 90)) {
      return 'hipertensão';
    }
    if ((systolicNum && systolicNum < 90) || (diastolicNum && diastolicNum < 60)) {
      return 'hipotensão';
    }
    return null;
  };

  const handleSave = () => {
    // Validar campos obrigatórios
    if (!date || (!systolic && !diastolic)) {
      showMessage('Preencha todos os campos!', 'error');
      return;
    }

    // Validar data futura
    if (!validateDate(date)) {
      showMessage('Não é possível cadastrar datas futuras', 'error');
      return;
    }

    // Validar valores
    if (!validateValues(systolic, diastolic)) {
      showMessage('Registro fora do padrão', 'error');
      return;
    }

    const newRecord = {
      id: editingRecord ? editingRecord.id : Date.now(),
      systolic: systolic || null,
      diastolic: diastolic || null,
      date,
      time,
      timestamp: new Date(`${date}T${time}`).getTime()
    };

    if (editingRecord) {
      setRecords(records.map(r => r.id === editingRecord.id ? newRecord : r));
      showMessage('Alterado com Sucesso!');
      setEditingRecord(null);
      setCurrentView('history');
    } else {
      setRecords([...records, newRecord]);
      
      // Verificar valores críticos
      const criticalType = checkCriticalValues(systolic, diastolic);
      if (criticalType) {
        showMessage('Sua pressão está fora do padrão esperado. Por favor, tente medir novamente e vigie todas as alterações', 'warning');
      } else {
        showMessage('Registrado com Sucesso!');
      }
    }

    // Limpar formulário
    setSystolic('');
    setDiastolic('');
    const now = new Date();
    setDate(now.toISOString().split('T')[0]);
    setTime(now.toTimeString().split(' ')[0].substring(0, 5));
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setSystolic(record.systolic?.toString() || '');
    setDiastolic(record.diastolic?.toString() || '');
    setDate(record.date);
    setTime(record.time);
    setCurrentView('register');
  };

  const handleDelete = (record) => {
    setShowDeleteConfirm(record);
  };

  const confirmDelete = () => {
    setRecords(records.filter(r => r.id !== showDeleteConfirm.id));
    setShowDeleteConfirm(null);
    showMessage('Registro excluído com Sucesso!');
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
    showMessage('Cancelado!');
  };

  const cancelEdit = () => {
    setEditingRecord(null);
    setSystolic('');
    setDiastolic('');
    const now = new Date();
    setDate(now.toISOString().split('T')[0]);
    setTime(now.toTimeString().split(' ')[0].substring(0, 5));
    setCurrentView('history');
  };

  const sortedRecords = [...records].sort((a, b) => b.timestamp - a.timestamp);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  const getPressureStatus = (sys, dia) => {
    if ((sys && sys >= 140) || (dia && dia >= 90)) {
      return { text: 'Hipertensão', color: '#dc3545' };
    }
    if ((sys && sys < 90) || (dia && dia < 60)) {
      return { text: 'Hipotensão', color: '#ffc107' };
    }
    return { text: 'Normal', color: '#28a745' };
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
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

      {/* Message */}
      {message.text ? (
        <View style={[styles.message, styles[`message${message.type.charAt(0).toUpperCase() + message.type.slice(1)}`]]}>
          <Text style={styles.messageText}>{message.text}</Text>
        </View>
      ) : null}

      {currentView === 'register' ? (
        /* Register View */
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <Text style={styles.formTitle}>
              {editingRecord ? 'Editar Registro' : 'Novo Registro'}
            </Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Pressão Sistólica (mmHg)</Text>
              <TextInput
                style={styles.input}
                value={systolic}
                onChangeText={setSystolic}
                keyboardType="numeric"
                placeholder="Ex: 120"
                placeholderTextColor="#999"
              />
              <Text style={styles.hint}>Valores válidos: 80-250 mmHg</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Pressão Diastólica (mmHg)</Text>
              <TextInput
                style={styles.input}
                value={diastolic}
                onChangeText={setDiastolic}
                keyboardType="numeric"
                placeholder="Ex: 80"
                placeholderTextColor="#999"
              />
              <Text style={styles.hint}>Valores válidos: 50-150 mmHg</Text>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>Data</Text>
                <TextInput
                  style={styles.input}
                  value={date}
                  onChangeText={setDate}
                  placeholder="AAAA-MM-DD"
                  placeholderTextColor="#999"
                />
              </View>
              
              <View style={[styles.inputGroup, styles.flex1, styles.ml10]}>
                <Text style={styles.label}>Hora</Text>
                <TextInput
                  style={styles.input}
                  value={time}
                  onChangeText={setTime}
                  placeholder="HH:MM"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Salvar</Text>
              </TouchableOpacity>
              
              {editingRecord && (
                <TouchableOpacity style={styles.cancelButton} onPress={cancelEdit}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      ) : (
        /* History View */
        <View style={styles.content}>
          <Text style={styles.historyTitle}>Histórico de Registros</Text>
          
          {records.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nenhum registro encontrado</Text>
            </View>
          ) : (
            <FlatList
              data={sortedRecords}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const status = getPressureStatus(item.systolic, item.diastolic);
                return (
                  <View style={styles.recordCard}>
                    <View style={styles.recordHeader}>
                      <Text style={styles.recordDate}>
                        {formatDate(item.date)} às {item.time}
                      </Text>
                      <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
                        <Text style={styles.statusText}>{status.text}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.recordValues}>
                      <Text style={styles.pressureText}>
                        {item.systolic || '--'} / {item.diastolic || '--'} mmHg
                      </Text>
                    </View>
                    
                    <View style={styles.recordActions}>
                      <TouchableOpacity 
                        style={styles.editButton}
                        onPress={() => handleEdit(item)}
                      >
                        <Text style={styles.editButtonText}>Alterar</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => handleDelete(item)}
                      >
                        <Text style={styles.deleteButtonText}>Excluir</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              }}
            />
          )}
        </View>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteConfirm !== null}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Exclusão</Text>
            <Text style={styles.modalText}>
              Tem certeza que deseja excluir o registro?
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.modalButtonNo} onPress={cancelDelete}>
                <Text style={styles.modalButtonTextNo}>Não</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.modalButtonYes} onPress={confirmDelete}>
                <Text style={styles.modalButtonTextYes}>Sim</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

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
  content: {
    flex: 1,
    padding: 20,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  ml10: {
    marginLeft: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  recordCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recordDate: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  recordValues: {
    marginBottom: 15,
  },
  pressureText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  recordActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  editButton: {
    backgroundColor: '#ffc107',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    minWidth: 300,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  modalButtonNo: {
    backgroundColor: '#6c757d',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 6,
  },
  modalButtonTextNo: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalButtonYes: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 6,
  },
  modalButtonTextYes: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default BloodPressureScreen;