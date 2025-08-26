import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import NumericInput from '../ui/NumericInput';

export default function AdditionalDataModal({ visible, onClose, data, onSave }) {
  const [cpf, setCpf] = useState(data.cpf);
  const [phone, setPhone] = useState(data.phone);
  const [birthDate, setBirthDate] = useState(data.birthDate);
  const [weight, setWeight] = useState(data.weight);
  const [height, setHeight] = useState(data.height);
  const [gender, setGender] = useState(data.gender);

  useEffect(() => {
    if (visible) {
      setCpf(data.cpf);
      setPhone(data.phone);
      setBirthDate(data.birthDate);
      setWeight(data.weight);
      setHeight(data.height);
      setGender(data.gender);
    }
  }, [visible, data]);

  const handleSave = () => {
    onSave({ cpf, phone, birthDate, weight, height, gender });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingContainer}>
          {/* Header Padronizado */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Feather name="arrow-left" size={24} color="#004A61" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Dados adicionais</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          {/* Usamos ScrollView para os múltiplos campos */}
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.label}>CPF</Text>
            <TextInput style={styles.input} value={cpf} onChangeText={setCpf} placeholder="000.000.000-00" />

            <Text style={styles.label}>Telefone</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="(00) 90000-0000" />
            
            {/* Adicione os outros campos aqui... */}
            <Text style={styles.label}>Data de Nascimento</Text>
            <TextInput style={styles.input} value={birthDate} onChangeText={setBirthDate} placeholder="DD/MM/AAAA" />

            <Text style={styles.label}>Peso (Kg)</Text>
            <NumericInput 
              value={weight} 
              onChangeText={setWeight}
              allowDecimal={true}
              maxLength={6}
              placeholder="70,5" 
            />

            <Text style={styles.label}>Altura (CM)</Text>
            <NumericInput 
              value={height} 
              onChangeText={setHeight}
              allowDecimal={false}
              maxLength={3}
              placeholder="175" 
            />

            <Text style={styles.label}>Gênero</Text>
            <TextInput style={styles.input} value={gender} onChangeText={setGender} placeholder="Prefiro não dizer" />
          </ScrollView>

          {/* Botão de Ação na parte inferior */}
          <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
            <Text style={styles.actionButtonText}>Salvar informações</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

// Estilos Padronizados (iguais ao anterior)
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'white' },
  keyboardAvoidingContainer: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#004A61' },
  headerPlaceholder: { width: 24 },
  content: { paddingHorizontal: 20, paddingBottom: 20 },
  label: { fontSize: 16, color: 'gray', marginTop: 20, marginBottom: 8 },
  input: { backgroundColor: '#F6F6F6', padding: 15, borderRadius: 10, fontSize: 16, borderWidth: 1, borderColor: '#E8E8E8' },
  actionButton: { backgroundColor: '#004A61', margin: 20, padding: 18, borderRadius: 10, alignItems: 'center' },
  actionButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});