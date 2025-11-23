/**
 * @file Modal para alteração de senha do usuário.
 * Permite que o usuário insira a senha atual e defina uma nova.
 */

import { Feather } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  Alert,
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
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  // Limpar campos quando o modal fechar
  useEffect(() => {
    if (!visible) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsCurrentPasswordVisible(false);
      setIsNewPasswordVisible(false);
      setIsConfirmPasswordVisible(false);
    }
  }, [visible]);

  const handleSave = () => {
    // Validações
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Atenção', 'A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Atenção', 'As novas senhas não coincidem.');
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Atenção', 'A nova senha deve ser diferente da senha atual.');
      return;
    }

    // Verificar se a nova senha tem pelo menos uma letra maiúscula, uma minúscula e um número
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      Alert.alert(
        'Atenção',
        'A nova senha deve conter pelo menos:\n- Uma letra maiúscula\n- Uma letra minúscula\n- Um número'
      );
      return;
    }

    onSave({ current: currentPassword, new: newPassword, confirm: confirmPassword });
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
            <Text style={styles.label}>Senha atual</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                secureTextEntry={!isCurrentPasswordVisible}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="********"
              />
              <TouchableOpacity onPress={() => setIsCurrentPasswordVisible(!isCurrentPasswordVisible)}>
                <Feather name={isCurrentPasswordVisible ? 'eye-off' : 'eye'} size={24} color="gray" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Nova senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                secureTextEntry={!isNewPasswordVisible}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="********"
              />
              <TouchableOpacity onPress={() => setIsNewPasswordVisible(!isNewPasswordVisible)}>
                <Feather name={isNewPasswordVisible ? 'eye-off' : 'eye'} size={24} color="gray" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Confirmar nova senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                secureTextEntry={!isConfirmPasswordVisible}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="********"
              />
              <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
                <Feather name={isConfirmPasswordVisible ? 'eye-off' : 'eye'} size={24} color="gray" />
              </TouchableOpacity>
            </View>
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
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F6F6F6', borderRadius: 10, borderWidth: 1, borderColor: '#E8E8E8' },
  passwordInput: { flex: 1, padding: 15, fontSize: 16 },
  actionButton: { backgroundColor: '#004A61', margin: 20, padding: 18, borderRadius: 10, alignItems: 'center' },
  actionButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
});