// Arquivo: app/monitor/temperature.tsx
import React, { useState } from 'react';
import { Alert } from 'react-native';
import MonitoringScreenLayout from '@/components/monitoring/MonitoringScreenLayout';
import { SingleValueInput } from '@/components/monitoring/Inputs/SingleValueInput';

export default function TemperatureScreen() {
  const [value, setValue] = useState('37.5');
  const handleSave = () => Alert.alert('Salvo!', `Temperatura de ${value}°C registrada.`);

  return (
    <MonitoringScreenLayout title="Temperatura" time="18:00" onSave={handleSave}>
      <SingleValueInput
        label="Temperatura basal"
        unit="°C"
        value={value}
        setValue={setValue}
      />
    </MonitoringScreenLayout>
  );
}