import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function NavigationDebug() {
  const router = useRouter();

  const testDirectNavigation = () => {
    console.log('🧪 Teste 1: Navegação direta com router.replace');
    try {
      router.replace('/Perfil');
      console.log('✅ router.replace executado');
    } catch (error) {
      console.error('❌ router.replace falhou:', error);
    }
  };

  const testWindowLocation = () => {
    if (Platform.OS === 'web') {
      console.log('🧪 Teste 2: window.location.href');
      try {
        window.location.href = '/Perfil';
        console.log('✅ window.location.href executado');
      } catch (error) {
        console.error('❌ window.location.href falhou:', error);
      }
    } else {
      console.log('❌ Teste 2: Apenas para web');
    }
  };

  const testRouterPush = () => {
    console.log('🧪 Teste 3: router.push');
    try {
      router.push('/Perfil');
      console.log('✅ router.push executado');
    } catch (error) {
      console.error('❌ router.push falhou:', error);
    }
  };

  const testWindowReplace = () => {
    if (Platform.OS === 'web') {
      console.log('🧪 Teste 4: window.location.replace');
      try {
        window.location.replace('/Perfil');
        console.log('✅ window.location.replace executado');
      } catch (error) {
        console.error('❌ window.location.replace falhou:', error);
      }
    } else {
      console.log('❌ Teste 4: Apenas para web');
    }
  };

  const testAllMethods = () => {
    console.log('🧪 Testando todos os métodos...');
    console.log('🌐 Plataforma:', Platform.OS);
    
    testDirectNavigation();
    
    setTimeout(() => {
      testWindowLocation();
    }, 100);
    
    setTimeout(() => {
      testRouterPush();
    }, 200);
    
    setTimeout(() => {
      testWindowReplace();
    }, 300);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug de Navegação</Text>
      <Text style={styles.subtitle}>Plataforma: {Platform.OS}</Text>
      
      <TouchableOpacity style={styles.button} onPress={testDirectNavigation}>
        <Text style={styles.buttonText}>Teste 1: Router.replace</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={testWindowLocation}>
        <Text style={styles.buttonText}>Teste 2: Window.location.href</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={testRouterPush}>
        <Text style={styles.buttonText}>Teste 3: Router.push</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={testWindowReplace}>
        <Text style={styles.buttonText}>Teste 4: Window.replace</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={testAllMethods}>
        <Text style={styles.buttonText}>Testar Todos</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    margin: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
