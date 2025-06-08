import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface FormState {
  systolic: string;
  diastolic: string;
  date: string;
  time: string;
}

interface RegistrationFormProps {
  isEditing: boolean;
  formState: FormState;
  onFormChange: (field: keyof FormState, value: string) => void;
  onSave: () => void;
  onCancelEdit: () => void;
}

const RegistrationForm = ({ isEditing, formState, onFormChange, onSave, onCancelEdit }: RegistrationFormProps) => {
  return (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        <Text style={styles.formTitle}>
          {isEditing ? 'Editar Registro' : 'Novo Registro'}
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Pressão Sistólica (mmHg)</Text>
          <TextInput
            style={styles.input}
            value={formState.systolic}
            onChangeText={(text) => onFormChange('systolic', text)}
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
            value={formState.diastolic}
            onChangeText={(text) => onFormChange('diastolic', text)}
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
              value={formState.date}
              onChangeText={(text) => onFormChange('date', text)}
              placeholder="AAAA-MM-DD"
              placeholderTextColor="#999"
            />
          </View>

          <View style={[styles.inputGroup, styles.flex1, styles.ml10]}>
            <Text style={styles.label}>Hora</Text>
            <TextInput
              style={styles.input}
              value={formState.time}
              onChangeText={(text) => onFormChange('time', text)}
              placeholder="HH:MM"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.saveButton} onPress={onSave}>
            <Text style={styles.saveButtonText}>Salvar</Text>
          </TouchableOpacity>

          {isEditing && (
            <TouchableOpacity style={styles.cancelButton} onPress={onCancelEdit}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
});


export default RegistrationForm;