import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function PersonalInfoModal({ visible, onClose, data, onSave }) {
  const [name, setName] = useState(data.fullName);
  const [email, setEmail] = useState(data.email);

  // Reseta os dados para o original sempre que o modal é aberto
  useEffect(() => {
    if (visible) {
      setName(data.fullName);
      setEmail(data.email);
    }
  }, [visible, data]);

  const handleSave = () => {
    onSave({ fullName: name, email });
  };

  return (
    // O Modal agora tem animationType="slide" e não é transparente
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
            <Text style={styles.headerTitle}>Informações pessoais</Text>
            {/* View vazia para garantir que o título fique centralizado */}
            <View style={styles.headerPlaceholder} />
          </View>

          {/* Conteúdo do Formulário */}
          <View style={styles.content}>
            <Text style={styles.label}>Nome completo</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Botão de Ação na parte inferior */}
          <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
            <Text style={styles.actionButtonText}>Salvar informações</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

// Estilos Padronizados
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'white' },
  keyboardAvoidingContainer: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#004A61' },
  headerPlaceholder: { width: 24 },
  content: { flex: 1, paddingHorizontal: 20 },
  label: { fontSize: 16, color: 'gray', marginTop: 20, marginBottom: 8 },
  input: {
    backgroundColor: '#F6F6F6',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  actionButton: {
    backgroundColor: '#004A61',
    margin: 20,
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});
