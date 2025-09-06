//HealthCare_FrontEnd/src/app/login.tsx

import { Feather } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '@/services/apiService';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha o email e a senha.');
      return;
    }

    try {
      const result = await ApiService.login({ email, password });

      if (result.success) {
        // Salvar informações do usuário
        await AsyncStorage.setItem('userInfo', JSON.stringify(result.data.data.user));

        // Verificar se o perfil foi preenchido
        const profileResult = await ApiService.getAdditionalProfile();
        
        if (profileResult.success && profileResult.data && profileResult.data.data) {
          const profileData = profileResult.data.data;
          
          // Verificar se o perfil tem dados essenciais preenchidos
          const hasEssentialData = profileData.cpf && 
                                  profileData.celular && 
                                  profileData.data_nascimento && 
                                  profileData.peso && 
                                  profileData.altura && 
                                  profileData.genero;
          
          if (hasEssentialData) {
            // Perfil completo, navegar para home
            router.replace('/(tabs)/home');
          } else {
            // Perfil incompleto, navegar para perfil
            router.replace('/Perfil');
          }
        } else {
          // Erro ao buscar perfil ou perfil não existe, navegar para perfil
          router.replace('/Perfil');
        }
      } else {
        Alert.alert('Falha no Login', result.error || 'Credenciais inválidas.');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      Alert.alert('Erro', 'Não foi possível conectar ao servidor. Tente novamente mais tarde.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Login</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.welcomeTitle}>Seja bem-vindo de volta!</Text>
        <Text style={styles.welcomeSubtitle}>Faça o login na sua conta.</Text>

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
        
        <View style={styles.optionsContainer}>
            <Text>Lembre-me</Text>
            <TouchableOpacity>
                <Text style={styles.linkText}>Esqueceu a sua senha?</Text>
            </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Não tem uma conta? </Text>
          <Link href="/register" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Cadastre-se</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}

// Os estilos são muito parecidos com a tela de cadastro, pode reutilizá-los ou ajustá-los
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    header: { padding: 20, alignItems: 'center' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#004A61' },
    form: { flex: 1, paddingHorizontal: 25, paddingTop: 20 },
    welcomeTitle: { fontSize: 28, fontWeight: 'bold', color: '#333' },
    welcomeSubtitle: { fontSize: 16, color: 'gray', marginBottom: 30 },
    label: { fontSize: 16, color: '#333', marginBottom: 8, marginTop: 15 },
    input: { backgroundColor: '#F6F6F6', padding: 15, borderRadius: 10, fontSize: 16, borderWidth: 1, borderColor: '#E8E8E8' },
    passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F6F6F6', borderRadius: 10, borderWidth: 1, borderColor: '#E8E8E8' },
    passwordInput: { flex: 1, padding: 15, fontSize: 16 },
    optionsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15, alignItems: 'center'},
    button: { backgroundColor: '#004A61', paddingVertical: 18, borderRadius: 10, alignItems: 'center', marginTop: 40 },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
    footerText: { fontSize: 14, color: 'gray' },
    linkText: { fontSize: 14, color: '#004A61', fontWeight: 'bold' },
});