// Arquivo: app/monitor/pressure.tsx
import React, { useState } from 'react';
import { Alert } from 'react-native';
import MonitoringScreenLayout from '@/components/monitoring/MonitoringScreenLayout';
import { PressureInput } from '@/components/monitoring/Inputs/PressureInput';

export default function PressureScreen() {
  const [sistolica, setSistolica] = useState('120');
  const [diastolica, setDiastolica] = useState('80');
  const handleSave = () => Alert.alert('Salvo!', `Pressão de ${sistolica}/${diastolica} mmHg registrada.`);

  return (
    <MonitoringScreenLayout title="Pressão arterial" time="8:45" onSave={handleSave}>
      <PressureInput
        sistolica={sistolica}
        setSistolica={setSistolica}
        diastolica={diastolica}
        setDiastolica={setDiastolica}
      />
    </MonitoringScreenLayout>
  );
}