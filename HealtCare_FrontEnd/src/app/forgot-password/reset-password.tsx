// HealthCare_FrontEnd/src/app/reset-password.tsx

import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';
import ApiService from '@/services/apiService';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email, code } = useLocalSearchParams<{ email: string, code: string }>();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Senha Inválida', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (!email || !code) {
      Alert.alert('Erro', 'Dados incompletos. Por favor, volte e tente novamente.');
      router.back();
      return;
    }

    setIsLoading(true);

    try {
      const result = await ApiService.resetPassword(email, code, newPassword);

      if (result.success) {
        Alert.alert(
          'Sucesso!',
          result.message || 'Sua senha foi alterada com sucesso. Você já pode fazer o login.',
          [{ 
            text: 'OK', 
            onPress: () => router.replace('/login') // replace para não voltar
          }]
        );
      } else {
        Alert.alert(
          'Erro',
          result.error || 'Não foi possível alterar a senha. Verifique o código e tente novamente.'
        );
      }
    } catch (error: any) {
      console.error('Erro ao resetar senha:', error);
      Alert.alert(
        'Erro',
        'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#004A61" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Senha</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.form}>
        <Text style={styles.welcomeTitle}>Esqueceu a senha?</Text>
        <Text style={styles.welcomeSubtitle}>Vamos recuperá-la!</Text>

        <Text style={styles.label}>Nova senha</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="********"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!isPasswordVisible}
          />
          <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            <Feather name={isPasswordVisible ? 'eye-off' : 'eye'} size={24} color="gray" />
          </TouchableOpacity>
        </View>
        <PasswordStrengthIndicator password={newPassword} />

        <Text style={styles.label}>Digite novamente a senha</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="********"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!isConfirmPasswordVisible}
          />
          <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
            <Feather name={isConfirmPasswordVisible ? 'eye-off' : 'eye'} size={24} color="gray" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]} 
          onPress={handleResetPassword}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Alterar senha</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// Estilos
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        width: '100%',
    },
    backButton: {},
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#004A61' },
    form: { flex: 1, paddingHorizontal: 25, paddingTop: 10 },
    welcomeTitle: { fontSize: 28, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
    welcomeSubtitle: { fontSize: 16, color: '#64748B', marginBottom: 30 },
    label: { fontSize: 16, color: '#334155', marginBottom: 8, marginTop: 15 },
    passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingRight: 15 },
    passwordInput: { flex: 1, paddingHorizontal: 15, paddingVertical: 18, fontSize: 16 },
    button: { backgroundColor: '#004A61', paddingVertical: 18, borderRadius: 12, alignItems: 'center', marginTop: 40 },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});