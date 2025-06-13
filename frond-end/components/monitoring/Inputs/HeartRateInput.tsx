/**
 * Componente de Input para Pulsação/Coração.
 * Mostra o valor atual, e os valores anterior e seguinte como referência visual.
 * Arquivo: components/Records/Inputs/HeartRateInput.tsx
 */
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { recordInputStyles as styles } from '../recordStyles';

export const HeartRateInput = ({ label, unit, value, setValue }) => (
  <View>
    <Text style={styles.label}>{label}</Text>
    <View style={[styles.card, styles.highlightCard]}>
      <Text style={styles.secondaryValue}>{parseInt(value, 10) - 1 || ''}</Text>
      <View style={styles.mainValueContainer}>
        <TextInput
          style={styles.mainValue}
          value={value}
          onChangeText={setValue}
          keyboardType="number-pad"
          textAlign="center"
          maxLength={3}
        />
        <Text style={styles.unit}>{unit}</Text>
      </View>
      <Text style={styles.secondaryValue}>{parseInt(value, 10) + 1 || ''}</Text>
    </View>
  </View>
);