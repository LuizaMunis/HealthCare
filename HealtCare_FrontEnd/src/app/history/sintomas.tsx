import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, ScrollView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, ENDPOINTS } from '@/constants/api';

interface SintomaItem {
  id: number;
  doenca_id: number;
  descricao_sintoma: string;
  intensidade: 'Leve' | 'Moderada' | 'Intensa';
  data_hora_inicio: string;
}

const formatDateTime = (value: string): string => {
  const d = new Date(value);
  if (isNaN(d.getTime())) return 'Data inválida';
  const day = `${d.getDate()}`.padStart(2, '0');
  const month = `${d.getMonth() + 1}`.padStart(2, '0');
  const year = d.getFullYear();
  const hours = `${d.getHours()}`.padStart(2, '0');
  const minutes = `${d.getMinutes()}`.padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const intensidadeColors: Record<string, string> = {
  Leve: '#4CAF50',
  Moderada: '#FFC107',
  Intensa: '#F44336'
};

export default function SintomasHistoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [sintomas, setSintomas] = useState<SintomaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSintoma, setEditingSintoma] = useState<SintomaItem | null>(null);
  const [editForm, setEditForm] = useState<SintomaItem>({
    id: 0,
    doenca_id: 0,
    descricao_sintoma: '',
    intensidade: 'Leve',
    data_hora_inicio: '',
  });

  // Filtros
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [intensidadeFilter, setIntensidadeFilter] = useState<'Todas' | 'Leve' | 'Moderada' | 'Intensa'>('Todas');
  const [filteredRecords, setFilteredRecords] = useState<SintomaItem[] | null>(null);


  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      if (!token) {
        setError('Você não está logado');
        return;
      }

      const profileId = await AsyncStorage.getItem('active_profile_id');
      if (!profileId) {
        setError('Nenhum perfil ativo encontrado');
        return;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.SYMPTOMS_RECORDS}?perfil_id=${profileId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        const sintomasData: SintomaItem[] = Array.isArray(result.data) ? result.data : [];
        sintomasData.sort((a, b) => new Date(b.data_hora_inicio).getTime() - new Date(a.data_hora_inicio).getTime());
        setSintomas(sintomasData);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao carregar histórico');
      }
    } catch (error: any) {
      console.error('Erro ao carregar histórico de sintomas:', error);
      setError(error.message || 'Erro ao carregar histórico de sintomas');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    fetchHistory();
  }, [fetchHistory]));

  const handleEdit = (item: SintomaItem) => {
    setEditingSintoma(item);
    setEditForm({
      id: item.id,
      doenca_id: item.doenca_id,
      descricao_sintoma: item.descricao_sintoma,
      intensidade: item.intensidade,
      data_hora_inicio: item.data_hora_inicio.split('T')[0],
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!editingSintoma) return;

    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      if (!token) {
        Alert.alert('Erro de Autenticação', 'Você não está logado.');
        return;
      }

      const profileId = await AsyncStorage.getItem('active_profile_id');
      if (!profileId) {
        Alert.alert('Erro', 'Nenhum perfil ativo encontrado.');
        return;
      }

      const updateData = {
        descricao_sintoma: editForm.descricao_sintoma.trim(),
        intensidade: editForm.intensidade,
        data_hora_inicio: `${editForm.data_hora_inicio}T00:00:00`
      };

      const updateDataWithPerfil = {
        ...updateData,
        perfil_id: parseInt(profileId)
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.SYMPTOMS_RECORDS}/${editingSintoma.id}?perfil_id=${profileId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateDataWithPerfil)
      });

      if (response.ok) {
        const result = await response.json();
        setSintomas(prev => 
          prev.map(sintoma => 
            sintoma.id === editingSintoma.id 
              ? { ...sintoma, ...result.data }
              : sintoma
          )
        );
        
        setShowEditModal(false);
        setEditingSintoma(null);
        Alert.alert('Sucesso!', 'Sintoma atualizado com sucesso!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao atualizar sintoma');
      }
    } catch (error: any) {
      console.error('Erro ao atualizar sintoma:', error);
      Alert.alert('Erro', error.message || 'Não foi possível atualizar o sintoma');
    }
  };

  const handleDelete = async (id: number) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este sintoma?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('healthcare_auth_token');
              if (!token) {
                Alert.alert('Erro de Autenticação', 'Você não está logado.');
                return;
              }

              const profileId = await AsyncStorage.getItem('active_profile_id');
              if (!profileId) {
                Alert.alert('Erro', 'Nenhum perfil ativo encontrado.');
                return;
              }

              const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.SYMPTOMS_RECORDS}/${id}?perfil_id=${profileId}`;
              console.log('Deletando sintoma:', url);

              const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
              });

              console.log('Resposta do servidor:', response.status, response.statusText);

              const responseData = await response.json().catch(() => null);
              console.log('Dados da resposta:', responseData);

              if (!response.ok) {
                const errorMessage = responseData?.message || `Erro ao excluir sintoma. Status: ${response.status}`;
                throw new Error(errorMessage);
              }

              // Verificar se a resposta indica sucesso
              if (responseData && responseData.success === false) {
                throw new Error(responseData.message || 'Erro ao excluir sintoma');
              }

              // Atualizar a lista local
              setSintomas(prev => prev.filter(s => s.id !== id));
              Alert.alert('Sucesso!', 'Sintoma excluído com sucesso!');
            } catch (error: any) {
              console.error('Erro ao excluir sintoma:', error);
              Alert.alert('Erro', error.message || 'Não foi possível excluir o sintoma');
            }
          }
        }
      ]
    );
  };

  // Máscara DD/MM/AAAA
  const dateMask = (value: string): string => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    let r = '';
    for (let i = 0; i < digits.length; i++) { r += digits[i]; if (i === 1 || i === 3) r += '/'; }
    return r;
  };

  const applyFilter = () => {
    let subset = [...sintomas];
    // Intervalo
    if (startDate || endDate) {
      const parseDate = (val: string, end: boolean = false): number => {
        const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(val.trim());
        if (!m) return NaN; const [, dd, mm, yyyy] = m; const day = +dd; const month = +mm - 1; const year = +yyyy;
        const h = end ? 23 : 0, mi = end ? 59 : 0, s = end ? 59 : 0;
        return new Date(year, month, day, h, mi, s).getTime();
      };
      const startTs = startDate ? parseDate(startDate) : -Infinity;
      const endTs = endDate ? parseDate(endDate, true) : Infinity;
      if (isNaN(startTs) || isNaN(endTs)) { Alert.alert('Filtro inválido', 'Formato DD/MM/AAAA.'); return; }
      if (startTs > endTs) { Alert.alert('Intervalo inválido', 'Início maior que fim.'); return; }
      subset = subset.filter(r => {
        const t = new Date(r.data_hora_inicio).getTime();
        return t >= startTs && t <= endTs;
      });
    }
    // Intensidade
    if (intensidadeFilter !== 'Todas') {
      subset = subset.filter(r => r.intensidade === intensidadeFilter);
    }
    setFilteredRecords(subset);
  };

  const clearFilter = () => {
    setStartDate('');
    setEndDate('');
    setIntensidadeFilter('Todas');
    setFilteredRecords(null);
  };

  const dataToShow = filteredRecords || sintomas;
  const isEmpty = dataToShow.length === 0;


  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#004A61" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Histórico de Sintomas</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#004A61" />
          <Text style={styles.loadingText}>Carregando histórico...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && sintomas.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={[]}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#004A61" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Histórico de Sintomas</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Feather name="alert-circle" size={64} color="#F44336" />
            <Text style={styles.errorTitle}>Erro ao carregar histórico</Text>
            <Text style={styles.errorSubtitle}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchHistory}>
              <Feather name="refresh-cw" size={20} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#004A61" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico de Sintomas</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filtros */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Filtros</Text>
        <View style={styles.filterRow}> 
          <View style={styles.filterField}>
            <Text style={styles.filterLabel}>Início</Text>
            <TextInput style={styles.input} placeholder="DD/MM/AAAA" value={startDate} keyboardType="number-pad" onChangeText={t => setStartDate(dateMask(t))} />
          </View>
          <View style={styles.filterField}>
            <Text style={styles.filterLabel}>Fim</Text>
            <TextInput style={styles.input} placeholder="DD/MM/AAAA" value={endDate} keyboardType="number-pad" onChangeText={t => setEndDate(dateMask(t))} />
          </View>
        </View>
        <View style={styles.intensityRow}>
          {(['Todas','Leve','Moderada','Intensa'] as const).map(opt => (
            <TouchableOpacity key={opt} style={[styles.intensityChip, intensidadeFilter === opt && styles.intensityChipActive]} onPress={() => setIntensidadeFilter(opt)}>
              <Text style={[styles.intensityChipText, intensidadeFilter === opt && styles.intensityChipTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.filterActions}>
          <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={applyFilter}><Text style={styles.buttonPrimaryText}>Aplicar</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.buttonOutline]} onPress={clearFilter}><Text style={styles.buttonOutlineText}>Limpar</Text></TouchableOpacity>
        </View>
        {filteredRecords && <View style={styles.badgeInfo}><Text style={styles.badgeInfoText}>Mostrando {filteredRecords.length} / {sintomas.length}</Text></View>}
      </View>

      {/* Tabela */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Registros de Sintomas</Text>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell,{flex:2}]}>Data</Text>
          <Text style={[styles.tableHeaderCell,{flex:2}]}>Sintoma</Text>
          <Text style={styles.tableHeaderCell}>Intensidade</Text>
          <Text style={styles.tableHeaderCell}>Ações</Text>
        </View>
        {isEmpty ? (
          <View style={styles.emptyWrapper}>
            <Text style={styles.emptyText}>Nenhum registro encontrado.</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => router.push('/monitor/sintoma')}>
              <Feather name="plus" size={16} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Registrar Sintoma</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={dataToShow}
            keyExtractor={i => i.id.toString()}
            renderItem={({ item }) => (
              <View style={[styles.tableRow, item.id % 2 === 0 && styles.tableRowAlt]}>
                <Text style={[styles.tableCell,{flex:2}]}>{formatDateTime(item.data_hora_inicio)}</Text>
                <Text style={[styles.tableCell,{flex:2}]}>{item.descricao_sintoma}</Text>
                <View style={[styles.tableCell,{flexDirection:'row',alignItems:'center'}]}>
                  <View style={[styles.intensityDot,{backgroundColor:intensidadeColors[item.intensidade]||'#666'}]} />
                  <Text style={styles.intensityText}>{item.intensidade}</Text>
                </View>
                <View style={[styles.tableCell, styles.rowActions]}>
                  <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconButton} hitSlop={{top:8,bottom:8,left:8,right:8}}>
                    <Feather name="edit" size={18} color="#007094" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.iconButton} hitSlop={{top:8,bottom:8,left:8,right:8}}>
                    <Feather name="trash-2" size={18} color="#D9534F" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            contentContainerStyle={styles.tableListContent}
          />
        )}
      </View>

      {/* Modal Edição */}
      <Modal visible={showEditModal} animationType="slide" transparent onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar Sintoma</Text>
            <ScrollView style={{maxHeight:380}}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Descrição</Text>
                <TextInput style={styles.input} value={editForm.descricao_sintoma} onChangeText={t => setEditForm(p=>({...p,descricao_sintoma:t}))} multiline />
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Intensidade</Text>
                <View style={styles.intensityRow}>
                  {(['Leve','Moderada','Intensa'] as const).map(opt => (
                    <TouchableOpacity key={opt} style={[styles.intensityChipSmall, editForm.intensidade===opt && styles.intensityChipSmallActive]} onPress={()=> setEditForm(p=>({...p,intensidade:opt}))}>
                      <Text style={[styles.intensityChipSmallText, editForm.intensidade===opt && styles.intensityChipSmallTextActive]}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Data de Início (AAAA-MM-DD)</Text>
                <TextInput style={styles.input} value={editForm.data_hora_inicio} onChangeText={t=> setEditForm(p=>({...p,data_hora_inicio:t}))} placeholder="YYYY-MM-DD" />
              </View>
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.button, styles.buttonOutline,{marginRight:8}]} onPress={()=> setShowEditModal(false)}><Text style={styles.buttonOutlineText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleUpdate}><Text style={styles.buttonPrimaryText}>Salvar</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#F5F7FA' },
  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:20, backgroundColor:'#FFFFFF', borderBottomWidth:1, borderBottomColor:'#E0E0E0' },
  backButton:{ padding:4 },
  headerTitle:{ fontSize:18, fontWeight:'bold', color:'#333' },

  card:{ backgroundColor:'#FFFFFF', marginHorizontal:16, marginTop:14, borderRadius:14, padding:14, ...Platform.select({ web:{ boxShadow:'0 4px 12px rgba(0,0,0,0.06)' }, default:{ elevation:3, shadowColor:'#000', shadowOpacity:0.08, shadowRadius:6 } }) },
  sectionTitle:{ fontSize:16, fontWeight:'700', color:'#004A61', marginBottom:10 },
  filterRow:{ flexDirection:'row', justifyContent:'space-between' },
  filterField:{ flex:1, marginRight:10 },
  filterLabel:{ fontSize:12, fontWeight:'600', color:'#475569', marginBottom:4 },
  input:{ backgroundColor:'#F9FAFB', borderWidth:1, borderColor:'#D0D7DE', borderRadius:10, paddingHorizontal:12, paddingVertical:10, fontSize:14, color:'#1F2D3D' },
  intensityRow:{ flexDirection:'row', flexWrap:'wrap', marginTop:12 },
  intensityChip:{ paddingHorizontal:12, paddingVertical:8, backgroundColor:'#EEF2F6', borderRadius:20, marginRight:8, marginBottom:8 },
  intensityChipActive:{ backgroundColor:'#004A61' },
  intensityChipText:{ fontSize:12, fontWeight:'600', color:'#334155' },
  intensityChipTextActive:{ color:'#FFFFFF' },
  button:{ flex:1, paddingVertical:12, borderRadius:10, alignItems:'center', justifyContent:'center', marginRight:10 },
  buttonPrimary:{ backgroundColor:'#007094' },
  buttonPrimaryText:{ color:'#FFFFFF', fontSize:14, fontWeight:'700' },
  buttonOutline:{ backgroundColor:'#FFFFFF', borderWidth:1, borderColor:'#CBD5E1' },
  buttonOutlineText:{ color:'#334155', fontSize:14, fontWeight:'600' },
  filterActions:{ flexDirection:'row', marginTop:14 },
  badgeInfo:{ alignSelf:'flex-start', marginTop:10, backgroundColor:'#E0F2FE', paddingHorizontal:10, paddingVertical:4, borderRadius:8 },
  badgeInfoText:{ fontSize:12, fontWeight:'600', color:'#0369A1' },

  loadingContainer:{ flex:1, justifyContent:'center', alignItems:'center', padding:40 },
  loadingText:{ fontSize:16, color:'#666', marginTop:12, fontWeight:'500' },
  errorContainer:{ flex:1, justifyContent:'center', alignItems:'center', padding:40 },
  errorTitle:{ fontSize:20, fontWeight:'600', color:'#F44336', marginTop:16, marginBottom:8, textAlign:'center' },
  errorSubtitle:{ fontSize:16, color:'#666', textAlign:'center', lineHeight:22, marginBottom:24 },
  retryButton:{ backgroundColor:'#F44336', flexDirection:'row', alignItems:'center', paddingHorizontal:20, paddingVertical:12, borderRadius:8 },
  retryButtonText:{ color:'#FFFFFF', fontSize:16, fontWeight:'600', marginLeft:8 },

  tableHeader:{ flexDirection:'row', backgroundColor:'#004A61', paddingVertical:8, paddingHorizontal:12, borderRadius:10, marginTop:4 },
  tableHeaderCell:{ flex:1, color:'#FFFFFF', fontSize:12, fontWeight:'700' },
  tableRow:{ flexDirection:'row', paddingVertical:10, paddingHorizontal:12, borderBottomWidth:1, borderBottomColor:'#E2E8F0' },
  tableRowAlt:{ backgroundColor:'#F8FAFC' },
  tableCell:{ flex:1, fontSize:12, color:'#334155' },
  rowActions:{ flexDirection:'row', justifyContent:'flex-start' },
  iconButton:{ padding:4, marginRight:6, borderRadius:8, backgroundColor:'#F1F5F9' },
  tableListContent:{},
  emptyWrapper:{ paddingVertical:16, alignItems:'center' },
  emptyText:{ fontSize:14, color:'#64748B', textAlign:'center', marginBottom:16 },
  addButton:{ backgroundColor:'#004A61', paddingVertical:10, paddingHorizontal:20, borderRadius:10, flexDirection:'row', alignItems:'center' },
  addButtonText:{ fontSize:14, color:'#FFFFFF', fontWeight:'700', marginLeft:8 },
  intensityDot:{ width:12, height:12, borderRadius:6, marginRight:6 },
  intensityText:{ fontSize:12, fontWeight:'600', color:'#334155' },

  modalBackdrop:{ flex:1, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'center', alignItems:'center', padding:20 },
  modalCard:{ width:'100%', backgroundColor:'#FFFFFF', borderRadius:18, padding:18, ...Platform.select({ web:{ boxShadow:'0 8px 24px rgba(0,0,0,0.12)' }, default:{ elevation:6, shadowColor:'#000', shadowOpacity:0.18, shadowRadius:12 } }) },
  modalTitle:{ fontSize:18, fontWeight:'700', color:'#004A61', marginBottom:12 },
  formGroup:{ marginBottom:16 },
  label:{ fontSize:13, fontWeight:'600', color:'#334155', marginBottom:6 },
  modalActions:{ flexDirection:'row', justifyContent:'space-between', marginTop:8 },
  intensityChipSmall:{ paddingHorizontal:10, paddingVertical:6, backgroundColor:'#EEF2F6', borderRadius:16, marginRight:8, marginTop:8 },
  intensityChipSmallActive:{ backgroundColor:'#004A61' },
  intensityChipSmallText:{ fontSize:12, fontWeight:'600', color:'#334155' },
  intensityChipSmallTextActive:{ color:'#FFFFFF' }
});
