import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import RecordCard from './RecordCard'; // Importando nosso novo componente

interface Record {
  id: string | number;
  systolic: number | null;
  diastolic: number | null;
  date: string;
  time: string;
}

interface HistoryListProps {
  records: Record[];
  onEdit: (item: Record) => void;
  onDelete: (item: Record) => void;
}

const HistoryList = ({ records, onEdit, onDelete }: HistoryListProps) => {
  return (
    <View style={styles.content}>
      <Text style={styles.historyTitle}>Histórico de Registros</Text>

      {records.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Nenhum registro encontrado</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <RecordCard
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 20,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default HistoryList;