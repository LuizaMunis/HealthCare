// HealthCare_FrontEnd/src/app/forgot-password/forgot-password.tsx

import { Feather } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import ApiService from '@/services/apiService';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRecoverPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Atenção', 'Por favor, insira seu email.');
      return;
    }

    // Validar formato básico de email
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Email Inválido', 'Por favor, insira um email válido.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await ApiService.forgotPassword(email.trim());

      if (result.success) {
        Alert.alert(
          'Código Enviado',
          result.message || 'Se o email estiver cadastrado, você receberá um código de recuperação em breve.',
          [
            { 
              text: 'OK', 
              onPress: () => router.push({
                pathname: '/forgot-password/verify-code',
                params: { email: email.trim() }
              })
            }
          ]
        );
      } else {
        Alert.alert(
          'Erro',
          result.error || 'Não foi possível enviar o código de recuperação. Tente novamente mais tarde.'
        );
      }
    } catch (error: any) {
      console.error('Erro ao solicitar recuperação de senha:', error);
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color="#004A61" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Senha</Text>
            <View style={{ width: 24 }} />
        </View>

        <View style={styles.form}>
            <Text style={styles.welcomeTitle}>Esqueceu a senha?</Text>
            <Text style={styles.welcomeSubtitle}>Vamos enviar um código para o seu email.</Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="nome@exemplo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]} 
              onPress={handleRecoverPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Recuperar senha</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Lembrou-se da senha? </Text>
              <Link href="/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.linkText}>Faça login</Text>
                </TouchableOpacity>
              </Link>
            </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Estilos reutilizados da tela de Login/Cadastro
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
    input: { backgroundColor: '#F8FAFC', paddingHorizontal: 15, paddingVertical: 18, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: '#E2E8F0' },
    button: { backgroundColor: '#004A61', paddingVertical: 18, borderRadius: 12, alignItems: 'center', marginTop: 40 },
    buttonDisabled: { opacity: 0.6 },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25 },
    footerText: { fontSize: 14, color: 'gray' },
    linkText: { fontSize: 14, color: '#004A61', fontWeight: 'bold' },
});