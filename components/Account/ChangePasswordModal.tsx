import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ChangePasswordModal({ visible, onClose, onSave }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = () => {
    onSave({ newPassword, confirmPassword });
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
            <Text style={styles.headerTitle}>Alterar senha</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          {/* Conteúdo do Formulário */}
          <View style={styles.content}>
            <Text style={styles.label}>Digite a nova senha</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="********"
            />

            <Text style={styles.label}>Digite novamente a senha</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="********"
            />
          </View>

          {/* Botão de Ação na parte inferior */}
          <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
            <Text style={styles.actionButtonText}>Alterar senha</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#004A61' },
  headerPlaceholder: { width: 24 },
  content: { flex: 1, paddingHorizontal: 20 },
  label: { fontSize: 16, color: 'gray', marginTop: 20, marginBottom: 8 },
  input: { backgroundColor: '#F6F6F6', padding: 15, borderRadius: 10, fontSize: 16, borderWidth: 1, borderColor: '#E8E8E8' },
  actionButton: { backgroundColor: '#004A61', margin: 20, padding: 18, borderRadius: 10, alignItems: 'center' },
  actionButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});