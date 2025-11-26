import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, TextInput, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, ENDPOINTS } from '@/constants/api';

interface VaccineItem {
  id: number;
  nome: string;
  dose: string;
  data_vacinacao: string;
}

// Utilitário para formatar apenas a data dd/MM/yyyy (sem horário)
const formatDate = (value: string): string => {
  const d = new Date(value);
  if (isNaN(d.getTime())) return 'Data inválida';
  const day = `${d.getDate()}`.padStart(2, '0');
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function VaccinationHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [records, setRecords] = useState<VaccineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtro período
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [filteredRecords, setFilteredRecords] = useState<VaccineItem[] | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      if (!token) throw new Error('Token de autenticação não encontrado.');

      const profileId = await AsyncStorage.getItem('active_profile_id');
      if (!profileId) throw new Error('Nenhum perfil ativo encontrado.');

      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.VACCINE_RECORDS}?perfil_id=${profileId}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Falha ao buscar o histórico.');

      const rows: VaccineItem[] = Array.isArray(result.data) ? result.data : [];
      rows.sort((a, b) => new Date(b.data_vacinacao).getTime() - new Date(a.data_vacinacao).getTime());
      setRecords(rows);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchHistory(); }, []));

  const handleDelete = async (id: number) => {
    Alert.alert('Confirmar Exclusão', 'Você tem certeza que deseja excluir este registro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        try {
          const token = await AsyncStorage.getItem('healthcare_auth_token');
          const profileId = await AsyncStorage.getItem('active_profile_id');
          if (!profileId) { Alert.alert('Erro', 'Nenhum perfil ativo encontrado.'); return; }
          const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.VACCINE_RECORDS}/${id}?perfil_id=${profileId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
          if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || 'Falha ao excluir o registro.');
          }
          setRecords(prev => prev.filter(r => r.id !== id));
          Alert.alert('Sucesso', 'Registro excluído com sucesso.');
        } catch (e: any) {
          Alert.alert('Erro ao Excluir', e.message || 'Erro inesperado');
        }
      } }
    ]);
  };

  const handleEdit = (item: VaccineItem) => {
    router.push({ pathname: '/monitor/editar-vacina', params: { vacina: JSON.stringify(item) } });
  };

  // Máscara DD/MM/AAAA
  const formatDateMask = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    let r = '';
    for (let i = 0; i < digits.length; i++) { r += digits[i]; if (i === 1 || i === 3) r += '/'; }
    return r;
  };

  const applyFilter = () => {
    if (!startDate && !endDate) { setFilteredRecords(null); return; }
    const parseDate = (val: string, end: boolean = false): number => {
      const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(val.trim());
      if (!m) return NaN; const [, dd, mm, yyyy] = m; const day = +dd; const month = +mm - 1; const year = +yyyy;
      const h = end ? 23 : 0, mi = end ? 59 : 0, s = end ? 59 : 0;
      return new Date(year, month, day, h, mi, s).getTime();
    };
    const start = startDate ? parseDate(startDate, false) : -Infinity;
    const end = endDate ? parseDate(endDate, true) : Infinity;
    if (isNaN(start) || isNaN(end)) { Alert.alert('Filtro inválido', 'Formato DD/MM/AAAA.'); return; }
    if (start > end) { Alert.alert('Intervalo inválido', 'Início maior que fim.'); return; }
    const subset = records.filter(r => {
      const t = new Date(r.data_vacinacao).getTime();
      return t >= start && t <= end;
    });
    setFilteredRecords(subset);
  };

  const clearFilter = () => { setStartDate(''); setEndDate(''); setFilteredRecords(null); };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#004A61" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Histórico de Vacinação</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#004A61" />
          <Text style={styles.loadingText}>Carregando histórico...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && records.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#004A61" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Histórico de Vacinação</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={48} color="#D9534F" />
          <Text style={styles.errorText}>Erro ao carregar histórico</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity onPress={fetchHistory} style={styles.retryButton}>
            <Feather name="refresh-cw" size={20} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const dataToShow = filteredRecords || records;
  const isEmpty = dataToShow.length === 0;

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#004A61" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico de Vacinação</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filtro por período */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Filtrar por Período</Text>
        <View style={styles.filterRow}>
          <View style={styles.filterField}>
            <Text style={styles.filterLabel}>Início</Text>
            <TextInput style={styles.input} placeholder="DD/MM/AAAA" value={startDate} keyboardType="number-pad" onChangeText={t => setStartDate(formatDateMask(t))} />
          </View>
          <View style={styles.filterField}>
            <Text style={styles.filterLabel}>Fim</Text>
            <TextInput style={styles.input} placeholder="DD/MM/AAAA" value={endDate} keyboardType="number-pad" onChangeText={t => setEndDate(formatDateMask(t))} />
          </View>
        </View>
        <View style={styles.filterActions}>
          <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={applyFilter}><Text style={styles.buttonPrimaryText}>Aplicar</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonOutline]} onPress={clearFilter}><Text style={styles.buttonOutlineText}>Limpar</Text></TouchableOpacity>
        </View>
        {filteredRecords && <View style={styles.badgeInfo}><Text style={styles.badgeInfoText}>Mostrando {filteredRecords.length} / {records.length}</Text></View>}
      </View>

      {/* Tabela de Vacinas */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Registros de Vacinação</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Data</Text>
          <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Vacina</Text>
          <Text style={styles.tableHeaderCell}>Dose</Text>
          <Text style={styles.tableHeaderCell}>Ações</Text>
        </View>
        {isEmpty ? (
          <View style={styles.emptyWrapper}>
            <Text style={styles.emptyText}>Nenhum registro encontrado.</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => router.push('/monitor/nova-vacina')}>
              <Feather name="plus" size={18} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Adicionar Vacina</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={dataToShow}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => {
              const dt = formatDate(item.data_vacinacao);
              return (
                <View style={[styles.tableRow, item.id % 2 === 0 && styles.tableRowAlt]}>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{dt}</Text>
                  <Text style={[styles.tableCell, { flex: 2 }]}>{item.nome}</Text>
                  <Text style={styles.tableCell}>{item.dose}</Text>
                  <View style={[styles.tableCell, styles.rowActions]}>
                    <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Feather name="edit" size={18} color="#007094" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Feather name="trash-2" size={18} color="#D9534F" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
            contentContainerStyle={styles.tableListContent}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  backButton: { padding: 4 },

  card: { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 14, borderRadius: 14, padding: 14, ...Platform.select({ web: { boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }, default: { elevation: 3, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6 } }) },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#004A61', marginBottom: 10 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#D0D7DE', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#1F2D3D' },
  button: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  buttonPrimary: { backgroundColor: '#007094' },
  buttonPrimaryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  buttonOutline: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#CBD5E1' },
  buttonOutlineText: { color: '#334155', fontSize: 14, fontWeight: '600' },
  badgeInfo: { alignSelf: 'flex-start', marginTop: 10, backgroundColor: '#E0F2FE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeInfoText: { fontSize: 12, fontWeight: '600', color: '#0369A1' },
  filterRow: { flexDirection: 'row', justifyContent: 'space-between' },
  filterField: { flex: 1, marginRight: 10 },
  filterLabel: { fontSize: 12, fontWeight: '600', color: '#475569', marginBottom: 4 },
  filterActions: { flexDirection: 'row', marginTop: 14 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { fontSize: 16, color: '#666', marginTop: 12, fontWeight: '500' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  errorText: { fontSize: 18, color: '#D9534F', textAlign: 'center', marginTop: 16, fontWeight: 'bold' },
  errorSubtext: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8, marginBottom: 24, lineHeight: 20 },
  retryButton: { backgroundColor: '#004A61', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, flexDirection: 'row', alignItems: 'center' },
  retryButtonText: { fontSize: 16, color: '#FFFFFF', fontWeight: 'bold', marginLeft: 8 },

  tableHeader: { flexDirection: 'row', backgroundColor: '#004A61', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, marginTop: 4 },
  tableHeaderCell: { flex: 1, color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  tableRow: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  tableRowAlt: { backgroundColor: '#F8FAFC' },
  tableCell: { flex: 1, fontSize: 12, color: '#334155' },
  rowActions: { flexDirection: 'row', justifyContent: 'flex-start' },
  iconButton: { padding: 4, marginRight: 6, borderRadius: 8, backgroundColor: '#F1F5F9' },
  tableListContent: {},
  emptyWrapper: { paddingVertical: 16, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 16 },

  addButton: { backgroundColor: '#004A61', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, flexDirection: 'row', alignItems: 'center' },
  addButtonText: { fontSize: 14, color: '#FFFFFF', fontWeight: '700', marginLeft: 8 },
});


