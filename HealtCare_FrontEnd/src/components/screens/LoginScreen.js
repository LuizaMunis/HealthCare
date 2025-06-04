// frontend/src/components/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { useUserViewModel } from '../../viewmodels/UserViewModel';
import { COLORS, SPACING } from '../../utils/constants';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useUserViewModel();

  const handleLogin = async () => {
    const result = await login({ email, password });
    
    if (result.success) {
      Alert.alert('Sucesso', result.message);
      navigation.navigate('Profile');
    } else {
      Alert.alert('Erro', result.error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Login</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.linkText}>
            Não tem conta? Registre-se
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
  },
  content: {
    flex: 1,
    padding: SPACING.LG,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.XL,
    color: COLORS.DARK,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.LIGHT,
    borderRadius: 8,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
    fontSize: 16,
  },
  button: {
    backgroundColor: COLORS.PRIMARY,
    padding: SPACING.MD,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  buttonDisabled: {
    backgroundColor: COLORS.SECONDARY,
  },
  buttonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: SPACING.MD,
  },
  linkText: {
    color: COLORS.PRIMARY,
    fontSize: 16,
  },
});

export default LoginScreen;