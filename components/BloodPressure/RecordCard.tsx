import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Record {
  id: string | number;
  systolic: number | null;
  diastolic: number | null;
  date: string;
  time: string;
}

interface RecordCardProps {
  item: Record;
  onEdit: (item: Record) => void;
  onDelete: (item: Record) => void;
}

// Funções puras podem ser movidas para um arquivo 'utils' no futuro
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const userTimezoneDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60000);
  return userTimezoneDate.toLocaleDateString('pt-BR');
};

const getPressureStatus = (sys: number | null, dia: number | null) => {
  if ((sys && sys >= 140) || (dia && dia >= 90)) {
    return { text: 'Hipertensão', color: '#dc3545' };
  }
  if ((sys && sys < 90) || (dia && dia < 60)) {
    return { text: 'Hipotensão', color: '#ffc107' };
  }
  return { text: 'Normal', color: '#28a745' };
};

const RecordCard = ({ item, onEdit, onDelete }: RecordCardProps) => {
  const status = getPressureStatus(item.systolic, item.diastolic);

  return (
    <View style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <Text style={styles.recordDate}>
          {formatDate(item.date)} às {item.time}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
          <Text style={styles.statusText}>{status.text}</Text>
        </View>
      </View>

      <View style={styles.recordValues}>
        <Text style={styles.pressureText}>
          {item.systolic || '--'} / {item.diastolic || '--'} mmHg
        </Text>
      </View>

      <View style={styles.recordActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => onEdit(item)}>
          <Text style={styles.editButtonText}>Alterar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => onDelete(item)}>
          <Text style={styles.deleteButtonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  recordCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recordDate: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  recordValues: {
    marginBottom: 15,
  },
  pressureText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  recordActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  editButton: {
    backgroundColor: '#ffc107',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default RecordCard;