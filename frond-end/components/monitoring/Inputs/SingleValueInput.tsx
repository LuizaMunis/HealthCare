/**
 * Componente de Input para um valor único.
 * Usado para Glicemia e Temperatura.
 * Arquivo: components/Records/Inputs/SingleValueInput.tsx
 */
import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { recordInputStyles as styles } from '../recordStyles';

export const SingleValueInput = ({ label, unit, value, setValue }) => (
  <View>
    <Text style={styles.label}>{label}</Text>
    <View style={[styles.card, styles.highlightCard]}>
      <View style={styles.mainValueContainer}>
          <TextInput
            style={styles.mainValue}
            value={value}
            onChangeText={setValue}
            keyboardType="decimal-pad"
            textAlign="center"
          />
          <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  </View>
);