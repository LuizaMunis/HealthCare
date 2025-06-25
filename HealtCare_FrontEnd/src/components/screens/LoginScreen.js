import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather'; // Ou outro pacote de ícones de sua preferência, como MaterialCommunityIcons

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    // Lógica de login aqui (você conectará com o UserViewModel e apiService depois)
    console.log('Email:', email);
    console.log('Senha:', password);
    console.log('Lembrar-me:', rememberMe);
    alert('Funcionalidade de login a ser implementada!');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => console.log('Voltar')}>
        <Icon name="arrow-left" size={24} color="#000" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Icon name="plus" size={30} color="#fff" style={styles.headerIcon} />
        <Text style={styles.headerText}>Login</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.welcomeText}>Seja bem-vindo de volta!</Text>
        <Text style={styles.subtitleText}>Faça o login na sua conta.</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="nome@exemplo.com"
          placeholderTextColor="#A0A0A0"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Senha</Text>
        <View style={styles.passwordInputContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="********"
            placeholderTextColor="#A0A0A0"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Icon name={showPassword ? 'eye-off' : 'eye'} size={20} color="#888" />
          </TouchableOpacity>
        </View>

        <View style={styles.optionsContainer}>
          <View style={styles.rememberMeContainer}>
            <Switch
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={rememberMe ? '#f5dd4b' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
              onValueChange={setRememberMe}
              value={rememberMe}
              style={styles.switch}
            />
            <Text style={styles.rememberMeText}>Lembre-me</Text>
          </View>
          <TouchableOpacity onPress={() => console.log('Esqueceu a senha?')}>
            <Text style={styles.forgotPasswordText}>Esqueceu a sua senha?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Não tem um conta?</Text>
          <TouchableOpacity onPress={() => console.log('Cadastre-se')}>
            <Text style={styles.signupLink}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  backButton: {
    position: 'absolute',
    top: 50, // Ajuste conforme necessário para o seu layout
    left: 20,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    backgroundColor: '#2C3E50', // Cor de fundo do cabeçalho
    width: '100%',
  },
  headerIcon: {
    marginRight: 10,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 30,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  subtitleText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 10,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }], // Reduz o tamanho do switch
    marginRight: 0,
  },
  rememberMeText: {
    fontSize: 14,
    color: '#666',
    marginLeft: -5, // Ajusta a posição do texto devido à redução do switch
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#007BFF',
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: '#2C3E50',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 16,
    color: '#666',
    marginRight: 5,
  },
  signupLink: {
    fontSize: 16,
    color: '#007BFF',
    fontWeight: 'bold',
  },
});

export default LoginScreen;