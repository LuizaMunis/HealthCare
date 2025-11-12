/**
 * @file Componente de input de texto customizado que aceita apenas valores numéricos.
 * Ele encapsula o TextInput padrão do React Native e adiciona lógica para filtrar
 * a entrada do usuário em tempo real.
 */

import React from 'react';
import { TextInput, TextInputProps, StyleSheet } from 'react-native';

interface NumericInputProps extends Omit<TextInputProps, 'onChangeText'> {
  value: string;
  onChangeText: (text: string) => void;
  allowDecimal?: boolean; // Prop para permitir ou não números decimais.
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
  // Função que manipula a mudança de texto no input.
  const handleChangeText = (text: string) => {
    let cleanText = text;
    
    if (allowDecimal) {
      // Se decimais são permitidos, remove tudo exceto dígitos, vírgula e ponto.
      cleanText = text.replace(/[^\d,.]/g, '');
      
      // Lógica para permitir apenas um separador decimal (vírgula ou ponto).
      const parts = cleanText.split(/[,.]/);
      if (parts.length > 2) {
        return; // Impede a digitação de múltiplos separadores.
      }
      
    } else {
      // Se decimais não são permitidos, remove tudo exceto dígitos.
      cleanText = text.replace(/[^\d]/g, '');
    }
    
    // Aplica o limite de caracteres, se definido.
    if (maxLength && cleanText.length > maxLength) {
      return;
    }
    
    // Chama a função onChangeText original com o texto já filtrado.
    onChangeText(cleanText);
  };

  return (
    <TextInput
      value={value}
      onChangeText={handleChangeText}
      keyboardType="numeric" // Exibe o teclado numérico no celular.
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