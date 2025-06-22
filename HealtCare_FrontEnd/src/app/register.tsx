//HealthCare_FrontEnd/src/app/register.tsx

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
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import ApiService from '@/src/services/apiService'; // Importa o serviço unificado

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }
    
    setIsLoading(true);
    const result = await ApiService.register({ name, email, password });
    setIsLoading(false);

    if (result.success) {
      Alert.alert('Sucesso!', 'Conta criada. Faça o login para continuar.');
      router.push('/login');
    } else {
      Alert.alert('Falha no Registro', result.error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cadastro</Text>
      </View>
      <View style={styles.form}>
        {/* Seus campos de input aqui... */}
        <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Cadastrar-me</Text>}
        </TouchableOpacity>
        {/* Resto do seu JSX */}
      </View>
    </SafeAreaView>
  );
}

// Seus estilos...
const styles = StyleSheet.create({ /* ... */ });
