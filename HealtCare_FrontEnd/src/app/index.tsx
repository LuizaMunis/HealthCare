//HealthCare_FrontEnd/src/app/index.tsx

import { Link } from 'expo-router'; 
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
const HealthLogo = require('../assets/images/iconLogo.png');

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>
          HEALTHCARE 
          <Text style={styles.logoIcon}>+</Text>
        </Text>
        <Text style={styles.tagline}>Aqui, cuidar é uma forma de amar.</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          Descubra uma nova maneira de cuidar de quem mais importa.
        </Text>
      </View>


      <View style={styles.buttonContainer}>
        <Link href="/register" asChild>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Cadastre-se</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/login" asChild>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Faça login</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/home" asChild>
          <TouchableOpacity style={styles.tertiaryButton}>
            <Text style={styles.tertiaryButtonText}>Comece agora</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

// Estilos...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 36,
    height: 36,
    marginBottom: 8,
    color: '#B2EBF2',
  },
  logoImage: {
    width: 120,
    height: 70,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#004A61',
  },
  logoInlineIcon: {
    width: 42,
    height: 42,
    marginLeft: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#555',
    marginTop: 8,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  primaryButton: {
    backgroundColor: '#004A61',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#B2EBF2',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  secondaryButtonText: {
    color: '#004A61',
    fontSize: 16,
    fontWeight: 'bold',
  },  
  tertiaryButton: {
    backgroundColor: '#81C5D8',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  tertiaryButtonText: {
    color: '#004A61',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
