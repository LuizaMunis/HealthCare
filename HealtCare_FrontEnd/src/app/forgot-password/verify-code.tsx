// HealthCare_FrontEnd/src/app/forgot-password/verify-code.tsx

import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useRef } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function VerifyCodeScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>(); // Recebe o email da tela anterior
  const [code, setCode] = useState(['', '', '', '']);
  const inputs = useRef<TextInput[]>([]);

  const handleCodeChange = (text: string, index: number) => {
    if (/^\d*$/.test(text)) { // Apenas números
      const newCode = [...code];
      newCode[index] = text;
      setCode(newCode);

      // Move para o próximo campo
      if (text && index < 3) {
        inputs.current[index + 1].focus();
      }
    }
  };

  const handleVerifyCode = () => {
    const fullCode = code.join('');
    if (fullCode.length !== 4) {
      Alert.alert('Código Inválido', 'Por favor, insira o código de 4 dígitos.');
      return;
    }

    // --- LÓGICA DA API (Simulação) ---
    // Aqui você validaria o código junto com o email.
    console.log(`Verificando código ${fullCode} para o email ${email}`);

    Alert.alert(
      'Código Verificado!',
      'Agora você pode criar uma nova senha.',
      [
        { text: 'OK', onPress: () => router.push({
            pathname: '/forgot-password/reset-password',
            params: { email: email, code: fullCode } // Passa email e código para a próxima tela
        })}
      ]
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
        <Text style={styles.welcomeTitle}>Digite o código recebido</Text>
        <Text style={styles.welcomeSubtitle}>Não recebeu um código?</Text>

        <View style={styles.codeInputContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => inputs.current[index] = ref as TextInput}
              style={styles.codeInput}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
                  inputs.current[index - 1].focus();
                }
              }}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleVerifyCode}>
          <Text style={styles.buttonText}>Inserir código</Text>
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
    form: { flex: 1, paddingHorizontal: 25, paddingTop: 10, alignItems: 'center' },
    welcomeTitle: { fontSize: 28, fontWeight: 'bold', color: '#1E293B', marginBottom: 4, textAlign: 'center' },
    welcomeSubtitle: { fontSize: 16, color: '#004A61', textDecorationLine: 'underline', marginBottom: 40 },
    codeInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginBottom: 40,
    },
    codeInput: {
        width: 60,
        height: 60,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 12,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
        backgroundColor: '#F8FAFC',
    },
    button: { backgroundColor: '#004A61', paddingVertical: 18, borderRadius: 12, alignItems: 'center', width: '100%' },
    buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});