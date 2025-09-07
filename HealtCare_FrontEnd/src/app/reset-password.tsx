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
} from 'react-native';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email, code } = useLocalSearchParams<{ email: string, code: string }>();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const handleResetPassword = () => {
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

    // --- LÓGICA DA API (Simulação) ---
    // Aqui você enviaria o email, código e a newPassword para a API.
    console.log(`Resetando senha para ${email} com o código ${code}`);
    
    Alert.alert(
      'Sucesso!',
      'Sua senha foi alterada. Você já pode fazer o login.',
      [{ text: 'OK', onPress: () => router.replace('/login') }] // replace para não voltar
    );
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

        <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
          <Text style={styles.buttonText}>Alterar senha</Text>
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
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});