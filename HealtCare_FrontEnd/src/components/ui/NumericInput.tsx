// HealtCare_FrontEnd/src/components/ui/NumericInput.tsx

import React from 'react';
import { TextInput, TextInputProps, StyleSheet } from 'react-native';

interface NumericInputProps extends Omit<TextInputProps, 'onChangeText'> {
  value: string;
  onChangeText: (text: string) => void;
  allowDecimal?: boolean;
  maxLength?: number;
  placeholder?: string;
  style?: any;
}

export default function NumericInput({
  value,
  onChangeText,
  allowDecimal = false,
  maxLength,
  placeholder,
  style,
  ...props
}: NumericInputProps) {
  const handleChangeText = (text: string) => {
    let cleanText = text;
    
    if (allowDecimal) {
      // Remove caracteres não numéricos exceto vírgula e ponto
      cleanText = text.replace(/[^\d,.]/g, '');
      
      // Permite apenas uma vírgula ou ponto
      const parts = cleanText.split(/[,.]/);
      if (parts.length > 2) {
        return; // Não permite múltiplos separadores decimais
      }
      
      // Se tem mais de uma parte, verifica se a parte decimal tem no máximo 2 dígitos
      if (parts.length === 2 && parts[1].length > 2) {
        return;
      }
    } else {
      // Remove todos os caracteres não numéricos
      cleanText = text.replace(/[^\d]/g, '');
    }
    
    // Aplica limite de comprimento se especificado
    if (maxLength && cleanText.length > maxLength) {
      return;
    }
    
    onChangeText(cleanText);
  };

  return (
    <TextInput
      value={value}
      onChangeText={handleChangeText}
      keyboardType="numeric"
      placeholder={placeholder}
      style={[styles.input, style]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#F6F6F6',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
});


