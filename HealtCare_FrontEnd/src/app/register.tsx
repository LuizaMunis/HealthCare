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
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '@/services/apiService';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_CONFIG, ENDPOINTS } from '@/constants/api';

export default function RegisterScreen() {
  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    // Validações de cliente (permanecem as mesmas)
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
      // Seus logs de debug (mantidos)
      console.log('🚀 Iniciando cadastro...');
      console.log('📡 URL da API:', `${API_CONFIG.BASE_URL}${ENDPOINTS.USERS.REGISTER}`);
      
      const response = await ApiService.register({
        nome_completo: nomeCompleto,
        email: email,
        password: password
      });

      console.log('📋 Resposta completa do servidor:', JSON.stringify(response, null, 2));

      if (response.success) {
        // ---- LÓGICA DE SUCESSO ----
        const user = response.data?.data?.user;
        const token = response.data?.data?.token;

        if (token) {
          await AsyncStorage.setItem('healthcare_auth_token', token);
          console.log('✅ Token salvo com sucesso');
        }
        if (user) {
          await AsyncStorage.setItem('userInfo', JSON.stringify(user));
          console.log('✅ Dados do usuário salvos');
        }
        
        // Alerta de sucesso que redireciona o usuário ao pressionar OK
        Alert.alert(
          'Sucesso!', 
          'Sua conta foi criada com sucesso. Agora, complete seu perfil.', 
          [{ text: 'OK', onPress: () => router.replace('/Perfil') }]
        );

      } else {
        // ---- LÓGICA PARA ERROS DE NEGÓCIO (EX: EMAIL JÁ EXISTE) ----
        // Lê a mensagem da propriedade 'response.error'.
        const errorMessage = response.error || 'Não foi possível criar a conta.';
        Alert.alert('Erro no Cadastro', errorMessage);
      }
    } catch (error: any) {
      // ---- LÓGICA PARA ERROS DE CONEXÃO OU INESPERADOS ----
      console.error("❌ Erro inesperado na tela de cadastro:", error);
      Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.');
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

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Cadastrar-me</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    width: '100%',
  },
  backButton: {},
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#004A61',
  },
  form: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 10,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    color: '#334155',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 15,
    paddingVertical: 18,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingRight: 15,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 18,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#004A61',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: 'gray',
  },
  linkText: {
    fontSize: 14,
    color: '#004A61',
    fontWeight: 'bold',
  },
});