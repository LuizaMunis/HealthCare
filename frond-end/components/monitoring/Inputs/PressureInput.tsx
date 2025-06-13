/**
 * Componente de Input para Pressão Arterial (Sistólica e Diastólica).
 * Arquivo: components/Records/Inputs/PressureInput.tsx
 */

import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { recordInputStyles as styles } from '../recordStyles';

export const PressureInput = ({ sistolica, setSistolica, diastolica, setDiastolica }) => (
  <View>
      <Text style={styles.label}>Sistólica</Text>
      <View srtyle={styles.pressureInputCard}>
          <TextInput style={styles.pressureValue} value={sistolica} onChangeText={setSistolica} keyboardType="number-pad"/>
          <Text style={styles.pressureUnit}>mmHg</Text>
      </View>
      <Text style={styles.label}>Diastólica</Text>
      <View style={styles.pressureInputCard}>
          <TextInput style={styles.pressureValue} value={diastolica} onChangeText={setDiastolica} keyboardType="number-pad"/>
          <Text style={styles.pressureUnit}>mmHg</Text>
      </View>
  </View>
);