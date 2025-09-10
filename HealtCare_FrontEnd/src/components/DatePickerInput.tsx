import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, StyleProp, ViewStyle } from 'react-native';

// --- Funções Auxiliares (internas ao componente) ---
const formatDateToBR = (dateString: string) => {
  if (!dateString || !dateString.includes('-')) return '';
  const [year, month, day] = dateString.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
};

const formatDateToISO = (dateString: string) => {
  if (!dateString || !dateString.includes('/')) return '';
  const [day, month, year] = dateString.split('/');
  return `${year}-${month}-${day}`;
};

// --- Tipos das Props do Componente ---
interface DatePickerInputProps {
  label: string;
  initialValue: string; // Sempre espera o formato AAAA-MM-DD
  onDateChange: (isoDate: string) => void; // Devolve o formato AAAA-MM-DD
  containerStyle?: StyleProp<ViewStyle>;
}

// --- Definição do Componente ---
export default function DatePickerInput({ label, initialValue, onDateChange, containerStyle }: DatePickerInputProps) {
  // Estado interno apenas para a exibição no formato DD/MM/AAAA
  const [displayDate, setDisplayDate] = useState('');

  // Sincroniza o estado de exibição quando o valor inicial (vindo do pai) muda
  useEffect(() => {
    setDisplayDate(formatDateToBR(initialValue));
  }, [initialValue]);

  /**
   * Lida com a mudança de texto no input.
   * Atualiza o estado de exibição e notifica o componente pai com a data no formato ISO.
   */
  const handleTextChange = (text: string) => {
    // Permite que o usuário veja o que está digitando
    setDisplayDate(text);

    // Valida e, se o formato estiver completo, envia a data no formato ISO para o pai
    if (text.length === 10 && text.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const isoDate = formatDateToISO(text);
      onDateChange(isoDate);
    }
  };

  return (
    <View style={[styles.dateContainer, containerStyle]}>
      <Text style={styles.dateLabel}>{label}</Text>
      <TextInput
        style={styles.dateInput}
        value={displayDate}
        onChangeText={handleTextChange}
        placeholder="DD/MM/AAAA"
        placeholderTextColor="#C7C7CD"
        maxLength={10}
        keyboardType="numeric"
      />
    </View>
  );
}

// --- Estilos do Componente ---
const styles = StyleSheet.create({
  dateContainer: {
    marginBottom: 20,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  dateInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    color: '#333',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
});