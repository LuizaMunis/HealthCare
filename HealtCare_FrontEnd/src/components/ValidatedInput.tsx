// src/components/ValidatedInput.tsx
import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ValidatedInputProps extends TextInputProps {
  label: string;
  error?: string;
  isTouched?: boolean;
}

export default function ValidatedInput({ label, error, isTouched, ...props }: ValidatedInputProps) {
  const showError = isTouched && !!error;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, showError && styles.inputError]}
        placeholderTextColor="#CBD5E1"
        {...props}
      />
      {showError && (
        <View style={styles.errorContainer}>
          <Feather name="x" size={16} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 5, // Espaço entre os campos
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
  inputError: {
    borderColor: '#ff6b6b', // Borda vermelha em caso de erro
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
    paddingHorizontal: 5,
  },
  errorText: {
    fontSize: 13,
    color: '#ff6b6b',
  },
});