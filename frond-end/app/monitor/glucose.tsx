// Arquivo: app/monitor/glucose.tsx
import React, { useState } from 'react';
import { Alert } from 'react-native';
import MonitoringScreenLayout from '@/components/monitoring/MonitoringScreenLayout';
import { SingleValueInput } from '@/components/monitoring/Inputs/SingleValueInput';

export default function GlucoseScreen() {
  const [value, setValue] = useState('100');
  const handleSave = () => Alert.alert('Salvo!', `Glicose de ${value} mg/dL registrada.`);
  
  return (
    <MonitoringScreenLayout title="Glicemia" time="8:45" onSave={handleSave}>
      <SingleValueInput
        label="Glicose no sangue"
        unit="mg/dL"
        value={value}
        setValue={setValue}
      />
    </MonitoringScreenLayout>
  );
}