// Arquivo: app/monitor/heart.tsx
import React, { useState } from 'react';
import { Alert } from 'react-native';
import MonitoringScreenLayout from '@/components/monitoring/MonitoringScreenLayout';
import { HeartRateInput } from '@/components/monitoring/Inputs/HeartRateInput';

export default function HeartScreen() {
  const [value, setValue] = useState('70');
  const handleSave = () => Alert.alert('Salvo!', `Pulsação de ${value} bpm registrada.`);

  return (
    <MonitoringScreenLayout title="Coração" time="8:45" onSave={handleSave}>
      <HeartRateInput
        label="Pulsação"
        unit="bpm"
        value={value}
        setValue={setValue}
      />
    </MonitoringScreenLayout>
  );
}