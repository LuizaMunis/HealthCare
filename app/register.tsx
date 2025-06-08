import { Feather } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const router = useRouter();

  const handleRegister = () => {
    // Aqui virá sua lógica de cadastro real (ex: chamada a uma API)
    console.log('Cadastrando com:', { name, email, password });
    // Após o sucesso, redireciona para a home
    router.replace('/(tabs)/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* O Expo Router cria o botão de voltar automaticamente */}
        <Text style={styles.headerTitle}>Cadastro</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.welcomeTitle}>Seja bem-vindo!</Text>
        <Text style={styles.welcomeSubtitle}>Cadastre sua conta.</Text>

        <Text style={styles.label}>Nome Completo</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome"
          value={name}
          onChangeText={setName}
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
    </SafeAreaView>
  );
}

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
    button: { backgroundColor: '#004A61', paddingVertical: 18, borderRadius: 10, alignItems: 'center', marginTop: 40 },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
    footerText: { fontSize: 14, color: 'gray' },
    linkText: { fontSize: 14, color: '#004A61', fontWeight: 'bold' },
});