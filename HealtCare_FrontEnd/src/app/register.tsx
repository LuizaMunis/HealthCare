// HealthCare_FrontEnd/src/app/register.tsx

import { Feather } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
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
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RegisterScreen() {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!nomeCompleto.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Email Inválido', 'Por favor, insira um email válido.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Senha Inválida', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      const response = await ApiService.register({
        nome_completo: nomeCompleto,
        email: email,
        password: password
      });

      if (response.success) {
        Alert.alert(
          'Sucesso!', 
          'Sua conta foi criada. Agora, complete seu perfil principal.', 
          [{ 
            text: 'OK', 
            onPress: () => router.replace({
              pathname: '/CompletarPerfilInicial',
              params: {
                isCreatingFirstProfile: 'true',
                accountName: nomeCompleto // Passa o nome completo do usuário
              }
            }) 
          }]
        );
      } else {
        Alert.alert('Erro no Cadastro', response.error || 'Não foi possível criar a conta.');
      }
    } catch (error: any) {
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor.');
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
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Feather name="arrow-left" size={24} color="#004A61" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Cadastro</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.form}>
            <Text style={styles.welcomeTitle}>Seja bem-vindo!</Text>
            <Text style={styles.welcomeSubtitle}>Cadastre sua conta.</Text>
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Seu nome completo"
              value={nomeCompleto}
              onChangeText={setNomeCompleto}
              autoCapitalize="words"
            />
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="nome@exemplo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={styles.label}>Senha</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="********"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
              />
              <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                <Feather name={isPasswordVisible ? 'eye-off' : 'eye'} size={24} color="gray" />
              </TouchableOpacity>
            </View>
            <PasswordStrengthIndicator password={password} />
            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Cadastrar-me</Text>}
            </TouchableOpacity>
            <View style={styles.footer}>
              <Text style={styles.footerText}>Já tem uma conta? </Text>
              <Link href="/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.linkText}>Faça login</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, width: '100%' },
  backButton: {},
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#004A61' },
  form: { flex: 1, paddingHorizontal: 25, paddingTop: 10 },
  welcomeTitle: { fontSize: 28, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  welcomeSubtitle: { fontSize: 16, color: '#64748B', marginBottom: 30 },
  label: { fontSize: 16, color: '#334155', marginBottom: 8, marginTop: 15 },
  input: { backgroundColor: '#F8FAFC', paddingHorizontal: 15, paddingVertical: 18, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0', paddingRight: 15 },
  passwordInput: { flex: 1, paddingHorizontal: 15, paddingVertical: 18, fontSize: 16 },
  button: { backgroundColor: '#004A61', paddingVertical: 18, borderRadius: 12, alignItems: 'center', marginTop: 40, minHeight: 58 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 25, paddingBottom: 20 },
  footerText: { fontSize: 14, color: 'gray' },
  linkText: { fontSize: 14, color: '#004A61', fontWeight: 'bold' },
});

