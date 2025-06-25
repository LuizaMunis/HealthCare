// hooks/useBloodPressureRecords.ts
import { useEffect, useState } from 'react';

// Funções de utilidade que não dependem do estado podem ficar fora do hook
const validateValues = (sys: string, dia: string) => {
  const systolicNum = parseInt(sys, 10);
  const diastolicNum = parseInt(dia, 10);

  if (sys && (systolicNum < 80 || systolicNum > 250)) return false;
  if (dia && (diastolicNum < 50 || diastolicNum > 150)) return false;
  return true;
};

const validateDate = (selectedDate: string) => {
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Garante que o dia de hoje seja válido
  const selected = new Date(selectedDate);
  return selected <= today;
};

const checkCriticalValues = (sys: string, dia: string) => {
  const systolicNum = parseInt(sys, 10);
  const diastolicNum = parseInt(dia, 10);

  if ((systolicNum && systolicNum >= 140) || (diastolicNum && diastolicNum >= 90)) {
    return 'hipertensão';
  }
  if ((systolicNum && systolicNum < 90) || (diastolicNum && diastolicNum < 60)) {
    return 'hipotensão';
  }
  return null;
};


export function useBloodPressureRecords() {
  const [records, setRecords] = useState<any[]>([]);
  const [currentView, setCurrentView] = useState('register'); // 'register' ou 'history'
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<any | null>(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Form fields
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  // Função para limpar e resetar o formulário
  const resetForm = () => {
    const now = new Date();
    // Adiciona o fuso horário local para evitar problemas com UTC
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setDate(now.toISOString().split('T')[0]);
    setTime(now.toTimeString().split(' ')[0].substring(0, 5));
    setSystolic('');
    setDiastolic('');
  };

  useEffect(() => {
    resetForm();
  }, []);

  const showMessage = (text: string, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleSave = () => {
    if (!date || (!systolic && !diastolic)) {
      showMessage('Preencha os campos de data e pelo menos um valor de pressão!', 'error');
      return;
    }
    if (!validateDate(date)) {
      showMessage('Não é possível cadastrar datas futuras', 'error');
      return;
    }
    if (!validateValues(systolic, diastolic)) {
      showMessage('Registro fora do padrão', 'error');
      return;
    }

    const newRecord = {
      id: editingRecord ? editingRecord.id : Date.now(),
      systolic: systolic || null,
      diastolic: diastolic || null,
      date,
      time,
      timestamp: new Date(`${date}T${time}`).getTime()
    };

    if (editingRecord) {
      setRecords(records.map(r => r.id === editingRecord.id ? newRecord : r));
      showMessage('Alterado com Sucesso!');
      setEditingRecord(null);
      setCurrentView('history');
    } else {
      setRecords([...records, newRecord]);
      const criticalType = checkCriticalValues(systolic, diastolic);
      if (criticalType) {
        showMessage('Sua pressão está fora do padrão esperado. Por favor, tente medir novamente e vigie todas as alterações', 'warning');
      } else {
        showMessage('Registrado com Sucesso!');
      }
    }
    resetForm();
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setSystolic(record.systolic?.toString() || '');
    setDiastolic(record.diastolic?.toString() || '');
    setDate(record.date);
    setTime(record.time);
    setCurrentView('register');
  };

  const handleDelete = (record: any) => {
    setShowDeleteConfirm(record);
  };

  const confirmDelete = () => {
    if (showDeleteConfirm) {
      setRecords(records.filter(r => r.id !== showDeleteConfirm.id));
      setShowDeleteConfirm(null);
      showMessage('Registro excluído com Sucesso!');
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
    showMessage('Exclusão cancelada!', 'warning');
  };

  const cancelEdit = () => {
    setEditingRecord(null);
    resetForm();
    setCurrentView('history');
  };

  const sortedRecords = [...records].sort((a, b) => b.timestamp - a.timestamp);

  // Retorna tudo o que o componente precisa para renderizar e funcionar
  return {
    // Estados
    records: sortedRecords,
    currentView,
    editingRecord,
    showDeleteConfirm,
    message,
    form: {
      systolic,
      diastolic,
      date,
      time,
    },
    // Setters e Handlers
    setCurrentView,
    setSystolic,
    setDiastolic,
    setDate,
    setTime,
    handleSave,
    handleEdit,
    handleDelete,
    confirmDelete,
    cancelDelete,
    cancelEdit,
  };
}