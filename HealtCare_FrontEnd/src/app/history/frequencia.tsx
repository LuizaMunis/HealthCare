import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, ScrollView, Platform } from 'react-native';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, ScrollView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, ENDPOINTS } from '@/constants/api';

interface HeartRateItem { id: number; data_hora_medicao: string; bpm: number; }
interface HeartRateItem { id: number; data_hora_medicao: string; bpm: number; }

const formatDateTime = (value:string): string => {
  const d = new Date(value); if (isNaN(d.getTime())) return 'Data inválida';
  const dd = `${d.getDate()}`.padStart(2,'0'); const mm = `${d.getMonth()+1}`.padStart(2,'0'); const yyyy = d.getFullYear();
  const hh = `${d.getHours()}`.padStart(2,'0'); const mi = `${d.getMinutes()}`.padStart(2,'0');
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
};

const HeartRateChart: React.FC<{ data: HeartRateItem[] }> = ({ data }) => {
  const [svgLib, setSvgLib] = React.useState<any>(null);
  const [selectedPoint, setSelectedPoint] = React.useState<{ x:number; y:number; item:HeartRateItem } | null>(null);
  React.useEffect(()=> { let mounted=true; import('react-native-svg').then(m=> mounted && setSvgLib(m)).catch(()=>{}); return ()=> { mounted=false; }; }, []);
  if (!data || data.length===0) return <Text style={styles.chartEmpty}>Sem dados para o gráfico.</Text>;
  if (!svgLib) return <View style={styles.chartFallback}><Text style={styles.chartEmpty}>Carregando módulo de gráfico...</Text><Text style={styles.chartHint}>Instalar: expo install react-native-svg</Text></View>;
  const { default: Svg, Polyline, Circle } = svgLib;
  const sorted = [...data].sort((a,b)=> new Date(a.data_hora_medicao).getTime() - new Date(b.data_hora_medicao).getTime());
  const values = sorted.map(r=> r.bpm);
  const min = Math.min(...values) - 5; const max = Math.max(...values) + 5;
  const chartHeight = 170; const chartWidth = Math.max(360, sorted.length * 70);
  const valueToY = (v:number) => { const range = max - min || 1; return chartHeight - ((v - min)/range)*(chartHeight-20) - 10; };
  const xForIndex = (i:number) => (i/(sorted.length-1||1))*(chartWidth-40)+20;
  const points = values.map((v,i)=> `${xForIndex(i)},${valueToY(v)}`).join(' ');
  const renderTooltip = () => { if(!selectedPoint) return null; const { x,y,item } = selectedPoint; const date = formatDateTime(item.data_hora_medicao); const adjustedX = Math.min(Math.max(x-60,4), chartWidth-140); const adjustedY = y < 65 ? y+20 : y-55; return (<View style={[styles.tooltipContainer,{ left:adjustedX, top:adjustedY }]}> <Text style={styles.tooltipTitle}>{date}</Text><Text style={styles.tooltipValue}>BPM: {item.bpm}</Text></View>); };
const formatDateTime = (value:string): string => {
  const d = new Date(value); if (isNaN(d.getTime())) return 'Data inválida';
  const dd = `${d.getDate()}`.padStart(2,'0'); const mm = `${d.getMonth()+1}`.padStart(2,'0'); const yyyy = d.getFullYear();
  const hh = `${d.getHours()}`.padStart(2,'0'); const mi = `${d.getMinutes()}`.padStart(2,'0');
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
};

const HeartRateChart: React.FC<{ data: HeartRateItem[] }> = ({ data }) => {
  const [svgLib, setSvgLib] = React.useState<any>(null);
  const [selectedPoint, setSelectedPoint] = React.useState<{ x:number; y:number; item:HeartRateItem } | null>(null);
  React.useEffect(()=> { let mounted=true; import('react-native-svg').then(m=> mounted && setSvgLib(m)).catch(()=>{}); return ()=> { mounted=false; }; }, []);
  if (!data || data.length===0) return <Text style={styles.chartEmpty}>Sem dados para o gráfico.</Text>;
  if (!svgLib) return <View style={styles.chartFallback}><Text style={styles.chartEmpty}>Carregando módulo de gráfico...</Text><Text style={styles.chartHint}>Instalar: expo install react-native-svg</Text></View>;
  const { default: Svg, Polyline, Circle } = svgLib;
  const sorted = [...data].sort((a,b)=> new Date(a.data_hora_medicao).getTime() - new Date(b.data_hora_medicao).getTime());
  const values = sorted.map(r=> r.bpm);
  const min = Math.min(...values) - 5; const max = Math.max(...values) + 5;
  const chartHeight = 170; const chartWidth = Math.max(360, sorted.length * 70);
  const valueToY = (v:number) => { const range = max - min || 1; return chartHeight - ((v - min)/range)*(chartHeight-20) - 10; };
  const xForIndex = (i:number) => (i/(sorted.length-1||1))*(chartWidth-40)+20;
  const points = values.map((v,i)=> `${xForIndex(i)},${valueToY(v)}`).join(' ');
  const renderTooltip = () => { if(!selectedPoint) return null; const { x,y,item } = selectedPoint; const date = formatDateTime(item.data_hora_medicao); const adjustedX = Math.min(Math.max(x-60,4), chartWidth-140); const adjustedY = y < 65 ? y+20 : y-55; return (<View style={[styles.tooltipContainer,{ left:adjustedX, top:adjustedY }]}> <Text style={styles.tooltipTitle}>{date}</Text><Text style={styles.tooltipValue}>BPM: {item.bpm}</Text></View>); };
  return (
    <View style={styles.chartCard}>
      <Text style={styles.sectionTitle}>Evolução da Frequência Cardíaca</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartInnerWrapper}>
          <Svg width={chartWidth} height={chartHeight}>
            <Polyline points={`20,10 20,${chartHeight-10}`} stroke="#ccc" strokeWidth={1} />
            <Polyline points={`20,${chartHeight-10} ${chartWidth-20},${chartHeight-10}`} stroke="#ccc" strokeWidth={1} />
            <Polyline points={points} fill="none" stroke="#D32F2F" strokeWidth={3} />
            {values.map((v,i)=> <Circle key={`hr-${i}`} cx={xForIndex(i)} cy={valueToY(v)} r={5} fill="#D32F2F" onPress={()=> setSelectedPoint({ x:xForIndex(i), y:valueToY(v), item:sorted[i] })} />)}
          </Svg>
          <View style={styles.chartLabelsRow}>
            {sorted.map((r,i)=> { const d=new Date(r.data_hora_medicao); const label=`${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}`; return <Text key={r.id} style={[styles.chartLabel,{ left:xForIndex(i)-10, position:'absolute' }]}>{label}</Text>; })}
          </View>
          {renderTooltip()}
        </View>
      </ScrollView>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}><View style={[styles.legendDot,{ backgroundColor:'#D32F2F' }]} /><Text style={styles.legendLabel}>BPM</Text></View>
        <View style={styles.legendRangeBadge}><Text style={styles.legendRangeText}>{min+5} - {max-5} bpm</Text></View>
    <View style={styles.chartCard}>
      <Text style={styles.sectionTitle}>Evolução da Frequência Cardíaca</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chartInnerWrapper}>
          <Svg width={chartWidth} height={chartHeight}>
            <Polyline points={`20,10 20,${chartHeight-10}`} stroke="#ccc" strokeWidth={1} />
            <Polyline points={`20,${chartHeight-10} ${chartWidth-20},${chartHeight-10}`} stroke="#ccc" strokeWidth={1} />
            <Polyline points={points} fill="none" stroke="#D32F2F" strokeWidth={3} />
            {values.map((v,i)=> <Circle key={`hr-${i}`} cx={xForIndex(i)} cy={valueToY(v)} r={5} fill="#D32F2F" onPress={()=> setSelectedPoint({ x:xForIndex(i), y:valueToY(v), item:sorted[i] })} />)}
          </Svg>
          <View style={styles.chartLabelsRow}>
            {sorted.map((r,i)=> { const d=new Date(r.data_hora_medicao); const label=`${d.getDate().toString().padStart(2,'0')}/${(d.getMonth()+1).toString().padStart(2,'0')}`; return <Text key={r.id} style={[styles.chartLabel,{ left:xForIndex(i)-10, position:'absolute' }]}>{label}</Text>; })}
          </View>
          {renderTooltip()}
        </View>
      </ScrollView>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}><View style={[styles.legendDot,{ backgroundColor:'#D32F2F' }]} /><Text style={styles.legendLabel}>BPM</Text></View>
        <View style={styles.legendRangeBadge}><Text style={styles.legendRangeText}>{min+5} - {max-5} bpm</Text></View>
      </View>
    </View>
  );
};

export default function HeartRateHistoryScreen() {
  const router = useRouter();
  const [records, setRecords] = useState<HeartRateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredRecords, setFilteredRecords] = useState<HeartRateItem[] | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filteredRecords, setFilteredRecords] = useState<HeartRateItem[] | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HeartRateItem | null>(null);
  const [bpm, setBpm] = useState('');
  const [date, setDate] = useState('');

  const fetchHistory = async () => {
    setLoading(true); setError(null);
    setLoading(true); setError(null);
    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token'); if(!token) throw new Error('Token de autenticação não encontrado.');
      const profileId = await AsyncStorage.getItem('active_profile_id'); if(!profileId) throw new Error('Nenhum perfil ativo encontrado.');
      const resp = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.HEART_RATE_RECORDS}?perfil_id=${profileId}`, { headers:{ 'Authorization':`Bearer ${token}` } });
      const result = await resp.json(); if(!resp.ok) throw new Error(result.message || 'Falha ao buscar o histórico.');
      const rows = Array.isArray(result.data)? result.data: [];
      rows.sort((a:HeartRateItem,b:HeartRateItem)=> new Date(b.data_hora_medicao).getTime() - new Date(a.data_hora_medicao).getTime());
      const token = await AsyncStorage.getItem('healthcare_auth_token'); if(!token) throw new Error('Token de autenticação não encontrado.');
      const profileId = await AsyncStorage.getItem('active_profile_id'); if(!profileId) throw new Error('Nenhum perfil ativo encontrado.');
      const resp = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.HEART_RATE_RECORDS}?perfil_id=${profileId}`, { headers:{ 'Authorization':`Bearer ${token}` } });
      const result = await resp.json(); if(!resp.ok) throw new Error(result.message || 'Falha ao buscar o histórico.');
      const rows = Array.isArray(result.data)? result.data: [];
      rows.sort((a:HeartRateItem,b:HeartRateItem)=> new Date(b.data_hora_medicao).getTime() - new Date(a.data_hora_medicao).getTime());
      setRecords(rows);
    } catch(e:any){ setError(e.message); } finally { setLoading(false); }
    } catch(e:any){ setError(e.message); } finally { setLoading(false); }
  };

  useFocusEffect(useCallback(()=> { fetchHistory(); }, []));
  useFocusEffect(useCallback(()=> { fetchHistory(); }, []));

  const handleDelete = (id:number) => {
    Alert.alert('Confirmar Exclusão','Você tem certeza que deseja excluir este registro?',[
      { text:'Cancelar', style:'cancel' },
      { text:'Excluir', style:'destructive', onPress: async ()=> {
        try {
          const token = await AsyncStorage.getItem('healthcare_auth_token');
          const profileId = await AsyncStorage.getItem('active_profile_id'); if(!profileId){ Alert.alert('Erro','Nenhum perfil ativo encontrado.'); return; }
          const resp = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.HEART_RATE_RECORDS}/${id}?perfil_id=${profileId}`, { method:'DELETE', headers:{ 'Authorization':`Bearer ${token}` } });
          if(!resp.ok){ const d = await resp.json().catch(()=>({})); throw new Error(d.message || 'Falha ao excluir o registro.'); }
          setRecords(prev=> prev.filter(r=> r.id !== id));
          Alert.alert('Sucesso','Registro excluído com sucesso.');
        } catch(e:any){ Alert.alert('Erro ao Excluir', e.message); }
      }}
  const handleDelete = (id:number) => {
    Alert.alert('Confirmar Exclusão','Você tem certeza que deseja excluir este registro?',[
      { text:'Cancelar', style:'cancel' },
      { text:'Excluir', style:'destructive', onPress: async ()=> {
        try {
          const token = await AsyncStorage.getItem('healthcare_auth_token');
          const profileId = await AsyncStorage.getItem('active_profile_id'); if(!profileId){ Alert.alert('Erro','Nenhum perfil ativo encontrado.'); return; }
          const resp = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.HEART_RATE_RECORDS}/${id}?perfil_id=${profileId}`, { method:'DELETE', headers:{ 'Authorization':`Bearer ${token}` } });
          if(!resp.ok){ const d = await resp.json().catch(()=>({})); throw new Error(d.message || 'Falha ao excluir o registro.'); }
          setRecords(prev=> prev.filter(r=> r.id !== id));
          Alert.alert('Sucesso','Registro excluído com sucesso.');
        } catch(e:any){ Alert.alert('Erro ao Excluir', e.message); }
      }}
    ]);
  };

  const handleEdit = (item:HeartRateItem) => { setEditingRecord(item); setBpm(String(item.bpm)); setDate(new Date(item.data_hora_medicao).toISOString().split('T')[0]); setIsModalVisible(true); };
  const handleEdit = (item:HeartRateItem) => { setEditingRecord(item); setBpm(String(item.bpm)); setDate(new Date(item.data_hora_medicao).toISOString().split('T')[0]); setIsModalVisible(true); };

  const handleUpdate = async () => {
    if(!editingRecord) return; const bpmNum = parseInt(bpm,10); if(isNaN(bpmNum) || bpmNum < 30 || bpmNum > 250){ Alert.alert('Atenção','Informe um BPM entre 30 e 250'); return; }
    if(!editingRecord) return; const bpmNum = parseInt(bpm,10); if(isNaN(bpmNum) || bpmNum < 30 || bpmNum > 250){ Alert.alert('Atenção','Informe um BPM entre 30 e 250'); return; }
    try {
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      const profileId = await AsyncStorage.getItem('active_profile_id'); if(!profileId){ Alert.alert('Erro','Nenhum perfil ativo encontrado.'); return; }
      const profileId = await AsyncStorage.getItem('active_profile_id'); if(!profileId){ Alert.alert('Erro','Nenhum perfil ativo encontrado.'); return; }
      const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.HEART_RATE_RECORDS}/${editingRecord.id}?perfil_id=${profileId}`;
      const time = new Date(editingRecord.data_hora_medicao).toTimeString().slice(0,8);
      const resp = await fetch(url, { method:'PUT', headers:{ 'Content-Type':'application/json','Authorization':`Bearer ${token}` }, body: JSON.stringify({ bpm: bpmNum, data_hora_medicao: `${date}T${time}`, perfil_id: parseInt(profileId) }) });
      const dataResp = await resp.json(); if(!resp.ok) throw new Error(dataResp.message || 'Falha ao atualizar o registro.');
      Alert.alert('Sucesso!','Registro atualizado.'); setIsModalVisible(false); setEditingRecord(null); fetchHistory();
    } catch(e:any){ Alert.alert('Erro ao Atualizar', e.message); }
  };

  // Filtro período
  const formatDateMask = (value:string): string => { const digits = value.replace(/\D/g,'').slice(0,8); let r=''; for(let i=0;i<digits.length;i++){ r+=digits[i]; if(i===1||i===3) r+='/'; } return r; };
  const applyFilter = () => {
    if(!startDate && !endDate){ setFilteredRecords(null); return; }
    const parseDate = (v:string,end:boolean=false): number => { const m=/(\d{2})\/(\d{2})\/(\d{4})$/.exec(v.trim()); if(!m) return NaN; const [_,dd,mm,yyyy]=m; const h=end?23:0, mi=end?59:0, s=end?59:0; return new Date(parseInt(yyyy), parseInt(mm)-1, parseInt(dd), h, mi, s).getTime(); };
    const start = startDate? parseDate(startDate,false): -Infinity; const end = endDate? parseDate(endDate,true): Infinity;
    if(isNaN(start)||isNaN(end)){ Alert.alert('Filtro inválido','Formato DD/MM/AAAA'); return; }
    if(start > end){ Alert.alert('Intervalo inválido','Início maior que fim'); return; }
    const subset = records.filter(r=> { const t=new Date(r.data_hora_medicao).getTime(); return t>=start && t<=end; }); setFilteredRecords(subset);
  };
  const clearFilter = () => { setStartDate(''); setEndDate(''); setFilteredRecords(null); };

  if (loading) return <ActivityIndicator size="large" color="#004A61" style={styles.centered} />;
  if (error && records.length===0) return (<View style={styles.centered}><Text style={styles.errorText}>Erro ao carregar dados: {error}</Text><TouchableOpacity onPress={fetchHistory} style={styles.retryButton}><Text style={styles.saveButtonText}>Tentar Novamente</Text></TouchableOpacity></View>);
  if (error && records.length===0) return (<View style={styles.centered}><Text style={styles.errorText}>Erro ao carregar dados: {error}</Text><TouchableOpacity onPress={fetchHistory} style={styles.retryButton}><Text style={styles.saveButtonText}>Tentar Novamente</Text></TouchableOpacity></View>);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} nestedScrollEnabled>
        <View style={styles.header}>
          <TouchableOpacity onPress={()=> router.back()} style={styles.backButton}><Feather name="arrow-left" size={24} color="#004A61" /></TouchableOpacity>
          <Text style={styles.headerTitle}>Histórico de Frequência Cardíaca</Text>
          <View style={{ width:24 }} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Filtrar por Período</Text>
          <View style={styles.filterRow}>
            <View style={styles.filterField}><Text style={styles.filterLabel}>Início</Text><TextInput style={styles.input} placeholder="DD/MM/AAAA" value={startDate} keyboardType="number-pad" onChangeText={t=> setStartDate(formatDateMask(t))} /></View>
            <View style={styles.filterField}><Text style={styles.filterLabel}>Fim</Text><TextInput style={styles.input} placeholder="DD/MM/AAAA" value={endDate} keyboardType="number-pad" onChangeText={t=> setEndDate(formatDateMask(t))} /></View>
          </View>
          <View style={styles.filterActions}>
            <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={applyFilter}><Text style={styles.buttonPrimaryText}>Aplicar</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.buttonOutline]} onPress={clearFilter}><Text style={styles.buttonOutlineText}>Limpar</Text></TouchableOpacity>
          </View>
          {filteredRecords && <View style={styles.badgeInfo}><Text style={styles.badgeInfoText}>Mostrando {filteredRecords.length} / {records.length}</Text></View>}
        </View>
      <ScrollView contentContainerStyle={styles.scrollContent} nestedScrollEnabled>
        <View style={styles.header}>
          <TouchableOpacity onPress={()=> router.back()} style={styles.backButton}><Feather name="arrow-left" size={24} color="#004A61" /></TouchableOpacity>
          <Text style={styles.headerTitle}>Histórico de Frequência Cardíaca</Text>
          <View style={{ width:24 }} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Filtrar por Período</Text>
          <View style={styles.filterRow}>
            <View style={styles.filterField}><Text style={styles.filterLabel}>Início</Text><TextInput style={styles.input} placeholder="DD/MM/AAAA" value={startDate} keyboardType="number-pad" onChangeText={t=> setStartDate(formatDateMask(t))} /></View>
            <View style={styles.filterField}><Text style={styles.filterLabel}>Fim</Text><TextInput style={styles.input} placeholder="DD/MM/AAAA" value={endDate} keyboardType="number-pad" onChangeText={t=> setEndDate(formatDateMask(t))} /></View>
          </View>
          <View style={styles.filterActions}>
            <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={applyFilter}><Text style={styles.buttonPrimaryText}>Aplicar</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.buttonOutline]} onPress={clearFilter}><Text style={styles.buttonOutlineText}>Limpar</Text></TouchableOpacity>
          </View>
          {filteredRecords && <View style={styles.badgeInfo}><Text style={styles.badgeInfoText}>Mostrando {filteredRecords.length} / {records.length}</Text></View>}
        </View>

        <HeartRateChart data={filteredRecords || records} />

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Registros de BPM</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell,{flex:2}]}>Data</Text>
            <Text style={styles.tableHeaderCell}>BPM</Text>
            <Text style={styles.tableHeaderCell}>Ações</Text>
          </View>
          {(filteredRecords ? filteredRecords.length===0 : records.length===0) ? (
            <View style={styles.emptyWrapper}><Text style={styles.emptyText}>Nenhum registro encontrado.</Text></View>
          ) : (
            <FlatList
              data={filteredRecords || records}
              keyExtractor={item=> item.id.toString()}
              renderItem={({ item }) => {
                const dt = formatDateTime(item.data_hora_medicao);
                return (
                  <View style={[styles.tableRow, item.id % 2 === 0 && styles.tableRowAlt]}>
                    <Text style={[styles.tableCell,{flex:2}]}>{dt}</Text>
                    <Text style={styles.tableCell}>{item.bpm}</Text>
                    <View style={[styles.tableCell, styles.rowActions]}>
                      <TouchableOpacity onPress={()=> handleEdit(item)} style={styles.iconButton} hitSlop={{top:8,bottom:8,left:8,right:8}}><Feather name="edit" size={18} color="#007094" /></TouchableOpacity>
                      <TouchableOpacity onPress={()=> handleDelete(item.id)} style={styles.iconButton} hitSlop={{top:8,bottom:8,left:8,right:8}}><Feather name="trash-2" size={18} color="#D9534F" /></TouchableOpacity>
                    </View>
                  </View>
                );
              }}
              contentContainerStyle={styles.tableListContent}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>
        <HeartRateChart data={filteredRecords || records} />

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Registros de BPM</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell,{flex:2}]}>Data</Text>
            <Text style={styles.tableHeaderCell}>BPM</Text>
            <Text style={styles.tableHeaderCell}>Ações</Text>
          </View>
          {(filteredRecords ? filteredRecords.length===0 : records.length===0) ? (
            <View style={styles.emptyWrapper}><Text style={styles.emptyText}>Nenhum registro encontrado.</Text></View>
          ) : (
            <FlatList
              data={filteredRecords || records}
              keyExtractor={item=> item.id.toString()}
              renderItem={({ item }) => {
                const dt = formatDateTime(item.data_hora_medicao);
                return (
                  <View style={[styles.tableRow, item.id % 2 === 0 && styles.tableRowAlt]}>
                    <Text style={[styles.tableCell,{flex:2}]}>{dt}</Text>
                    <Text style={styles.tableCell}>{item.bpm}</Text>
                    <View style={[styles.tableCell, styles.rowActions]}>
                      <TouchableOpacity onPress={()=> handleEdit(item)} style={styles.iconButton} hitSlop={{top:8,bottom:8,left:8,right:8}}><Feather name="edit" size={18} color="#007094" /></TouchableOpacity>
                      <TouchableOpacity onPress={()=> handleDelete(item.id)} style={styles.iconButton} hitSlop={{top:8,bottom:8,left:8,right:8}}><Feather name="trash-2" size={18} color="#D9534F" /></TouchableOpacity>
                    </View>
                  </View>
                );
              }}
              contentContainerStyle={styles.tableListContent}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      <Modal animationType="slide" transparent visible={isModalVisible} onRequestClose={()=> setIsModalVisible(false)}>
      <Modal animationType="slide" transparent visible={isModalVisible} onRequestClose={()=> setIsModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalCard}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar Registro</Text>
            <View style={styles.formContainer}>
              <Text style={styles.inputLabel}>BPM</Text>
              <View style={styles.metricBody}>
                <TouchableOpacity style={styles.metricControl} onPress={()=> setBpm(prev => String(Math.max(30,(parseInt(prev||'0',10)-1))))}><Feather name="minus" size={22} color="#555" /></TouchableOpacity>
                <View style={styles.metricValueWrap}><Text style={styles.metricValue}>{bpm}</Text><Text style={styles.metricUnit}>bpm</Text></View>
                <TouchableOpacity style={styles.metricControl} onPress={()=> setBpm(prev => String(Math.min(250,(parseInt(prev||'0',10)+1))))}><Feather name="plus" size={22} color="#555" /></TouchableOpacity>
              <Text style={styles.inputLabel}>BPM</Text>
              <View style={styles.metricBody}>
                <TouchableOpacity style={styles.metricControl} onPress={()=> setBpm(prev => String(Math.max(30,(parseInt(prev||'0',10)-1))))}><Feather name="minus" size={22} color="#555" /></TouchableOpacity>
                <View style={styles.metricValueWrap}><Text style={styles.metricValue}>{bpm}</Text><Text style={styles.metricUnit}>bpm</Text></View>
                <TouchableOpacity style={styles.metricControl} onPress={()=> setBpm(prev => String(Math.min(250,(parseInt(prev||'0',10)+1))))}><Feather name="plus" size={22} color="#555" /></TouchableOpacity>
              </View>
              <Text style={styles.inputLabel}>Data (AAAA-MM-DD)</Text>
              <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="AAAA-MM-DD" />
              <Text style={styles.inputLabel}>Data (AAAA-MM-DD)</Text>
              <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="AAAA-MM-DD" />
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.button, styles.buttonNeutral]} onPress={()=> setIsModalVisible(false)}><Text style={styles.buttonNeutralText}>Cancelar</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={handleUpdate}><Text style={styles.buttonPrimaryText}>Salvar</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonNeutral]} onPress={()=> setIsModalVisible(false)}><Text style={styles.buttonNeutralText}>Cancelar</Text></TouchableOpacity>
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
  scrollContent: { paddingBottom:48 },
  centered: { flex:1, justifyContent:'center', alignItems:'center', padding:24 },
  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical:18, paddingHorizontal:20, backgroundColor:'#FFFFFF', borderBottomWidth:1, borderBottomColor:'#E2E8F0' },
  headerTitle: { fontSize:20, fontWeight:'700', color:'#1F2D3D' },
  backButton: { padding:4 },
  card: { backgroundColor:'#FFFFFF', marginHorizontal:16, marginTop:14, borderRadius:14, padding:14, ...Platform.select({ web:{ boxShadow:'0 4px 12px rgba(0,0,0,0.06)' }, default:{ elevation:3, shadowColor:'#000', shadowOpacity:0.08, shadowRadius:6 } }) },
  sectionTitle: { fontSize:16, fontWeight:'700', color:'#004A61', marginBottom:10 },
  inputLabel: { fontSize:13, fontWeight:'600', color:'#334155', marginBottom:6, marginTop:4 },
  input: { backgroundColor:'#F9FAFB', borderWidth:1, borderColor:'#D0D7DE', borderRadius:10, paddingHorizontal:12, paddingVertical:10, fontSize:14, color:'#1F2D3D' },
  button: { flex:1, paddingVertical:12, borderRadius:10, alignItems:'center', justifyContent:'center', marginRight:10 },
  buttonPrimary: { backgroundColor:'#007094' },
  buttonPrimaryText: { color:'#FFFFFF', fontSize:14, fontWeight:'700' },
  buttonOutline: { backgroundColor:'#FFFFFF', borderWidth:1, borderColor:'#CBD5E1' },
  buttonOutlineText: { color:'#334155', fontSize:14, fontWeight:'600' },
  buttonNeutral: { backgroundColor:'#EEF2F6' },
  buttonNeutralText: { color:'#334155', fontSize:14, fontWeight:'600' },
  badgeInfo: { alignSelf:'flex-start', marginTop:10, backgroundColor:'#E0F2FE', paddingHorizontal:10, paddingVertical:4, borderRadius:8 },
  badgeInfoText: { fontSize:12, fontWeight:'600', color:'#0369A1' },
  emptyWrapper: { paddingVertical:16 },
  emptyText: { fontSize:14, color:'#64748B', textAlign:'center' },
  errorText: { fontSize:16, color:'#DC2626', textAlign:'center', marginBottom:20 },
  retryButton: { backgroundColor:'#004A61', paddingVertical:12, paddingHorizontal:24, borderRadius:12 },
  saveButtonText: { fontSize:16, color:'#FFFFFF', fontWeight:'700' },
  filterRow: { flexDirection:'row', justifyContent:'space-between' },
  filterField: { flex:1, marginRight:10 },
  filterLabel: { fontSize:12, fontWeight:'600', color:'#475569', marginBottom:4 },
  filterActions: { flexDirection:'row', marginTop:14 },
  chartCard: { backgroundColor:'#FFFFFF', marginHorizontal:16, marginTop:14, borderRadius:14, paddingVertical:12, paddingHorizontal:16, ...Platform.select({ web:{ boxShadow:'0 4px 12px rgba(0,0,0,0.06)' }, default:{ elevation:3, shadowColor:'#000', shadowOpacity:0.08, shadowRadius:6 } }) },
  chartInnerWrapper: { position:'relative', paddingBottom:6 },
  chartEmpty: { textAlign:'center', color:'#64748B', marginVertical:12 },
  chartLabelsRow: { height:26, marginTop:6, position:'relative' },
  chartLabel: { fontSize:10, color:'#334155' },
  legendRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginTop:10 },
  legendItem: { flexDirection:'row', alignItems:'center', marginRight:14 },
  legendDot: { width:12, height:12, borderRadius:6, marginRight:6 },
  legendLabel: { fontSize:12, fontWeight:'600', color:'#334155' },
  legendRangeBadge: { backgroundColor:'#F1F5F9', paddingHorizontal:10, paddingVertical:4, borderRadius:8 },
  legendRangeText: { fontSize:11, fontWeight:'600', color:'#475569' },
  chartFallback: { padding:12, borderRadius:10, backgroundColor:'#FFF', marginHorizontal:16, marginTop:8 },
  chartHint: { fontSize:12, color:'#475569', marginTop:4, textAlign:'center' },
  tooltipContainer: { position:'absolute', padding:8, backgroundColor:'#004A61', borderRadius:8, minWidth:130 },
  tooltipTitle: { color:'#fff', fontSize:11, fontWeight:'700' },
  tooltipValue: { color:'#fff', fontSize:11, marginTop:2 },
  tableHeader: { flexDirection:'row', backgroundColor:'#004A61', paddingVertical:8, paddingHorizontal:12, borderRadius:10, marginTop:4 },
  tableHeaderCell: { flex:1, color:'#FFFFFF', fontSize:12, fontWeight:'700' },
  tableRow: { flexDirection:'row', paddingVertical:10, paddingHorizontal:12, borderBottomWidth:1, borderBottomColor:'#E2E8F0' },
  tableRowAlt: { backgroundColor:'#F8FAFC' },
  tableCell: { flex:1, fontSize:12, color:'#334155' },
  rowActions: { flexDirection:'row', justifyContent:'flex-start' },
  iconButton: { padding:4, marginRight:6, borderRadius:8, backgroundColor:'#F1F5F9' },
  tableListContent: {},
  modalContainer: { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(15,23,42,0.45)' },
  modalCard: { width:'90%', backgroundColor:'#FFFFFF', borderRadius:20, padding:20, ...Platform.select({ web:{ boxShadow:'0 8px 24px rgba(0,0,0,0.12)' }, default:{ elevation:6, shadowColor:'#000', shadowOpacity:0.18, shadowRadius:12 } }) },
  modalTitle: { fontSize:18, fontWeight:'700', color:'#004A61', marginBottom:16 },
  formContainer: { width:'100%' },
  modalActions: { flexDirection:'row', justifyContent:'space-between', width:'100%', marginTop:24 },
  metricBody: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:12 },
  metricControl: { width:42, height:42, borderRadius:10, backgroundColor:'#E2E8F0', alignItems:'center', justifyContent:'center' },
  metricValueWrap: { flexDirection:'row', alignItems:'baseline' },
  metricValue: { fontSize:42, fontWeight:'700', color:'#1F2D3D', minWidth:70, textAlign:'center' },
  metricUnit: { fontSize:14, color:'#475569', marginLeft:6, fontWeight:'600' }
  container: { flex:1, backgroundColor:'#F5F7FA' },
  scrollContent: { paddingBottom:48 },
  centered: { flex:1, justifyContent:'center', alignItems:'center', padding:24 },
  header: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical:18, paddingHorizontal:20, backgroundColor:'#FFFFFF', borderBottomWidth:1, borderBottomColor:'#E2E8F0' },
  headerTitle: { fontSize:20, fontWeight:'700', color:'#1F2D3D' },
  backButton: { padding:4 },
  card: { backgroundColor:'#FFFFFF', marginHorizontal:16, marginTop:14, borderRadius:14, padding:14, ...Platform.select({ web:{ boxShadow:'0 4px 12px rgba(0,0,0,0.06)' }, default:{ elevation:3, shadowColor:'#000', shadowOpacity:0.08, shadowRadius:6 } }) },
  sectionTitle: { fontSize:16, fontWeight:'700', color:'#004A61', marginBottom:10 },
  inputLabel: { fontSize:13, fontWeight:'600', color:'#334155', marginBottom:6, marginTop:4 },
  input: { backgroundColor:'#F9FAFB', borderWidth:1, borderColor:'#D0D7DE', borderRadius:10, paddingHorizontal:12, paddingVertical:10, fontSize:14, color:'#1F2D3D' },
  button: { flex:1, paddingVertical:12, borderRadius:10, alignItems:'center', justifyContent:'center', marginRight:10 },
  buttonPrimary: { backgroundColor:'#007094' },
  buttonPrimaryText: { color:'#FFFFFF', fontSize:14, fontWeight:'700' },
  buttonOutline: { backgroundColor:'#FFFFFF', borderWidth:1, borderColor:'#CBD5E1' },
  buttonOutlineText: { color:'#334155', fontSize:14, fontWeight:'600' },
  buttonNeutral: { backgroundColor:'#EEF2F6' },
  buttonNeutralText: { color:'#334155', fontSize:14, fontWeight:'600' },
  badgeInfo: { alignSelf:'flex-start', marginTop:10, backgroundColor:'#E0F2FE', paddingHorizontal:10, paddingVertical:4, borderRadius:8 },
  badgeInfoText: { fontSize:12, fontWeight:'600', color:'#0369A1' },
  emptyWrapper: { paddingVertical:16 },
  emptyText: { fontSize:14, color:'#64748B', textAlign:'center' },
  errorText: { fontSize:16, color:'#DC2626', textAlign:'center', marginBottom:20 },
  retryButton: { backgroundColor:'#004A61', paddingVertical:12, paddingHorizontal:24, borderRadius:12 },
  saveButtonText: { fontSize:16, color:'#FFFFFF', fontWeight:'700' },
  filterRow: { flexDirection:'row', justifyContent:'space-between' },
  filterField: { flex:1, marginRight:10 },
  filterLabel: { fontSize:12, fontWeight:'600', color:'#475569', marginBottom:4 },
  filterActions: { flexDirection:'row', marginTop:14 },
  chartCard: { backgroundColor:'#FFFFFF', marginHorizontal:16, marginTop:14, borderRadius:14, paddingVertical:12, paddingHorizontal:16, ...Platform.select({ web:{ boxShadow:'0 4px 12px rgba(0,0,0,0.06)' }, default:{ elevation:3, shadowColor:'#000', shadowOpacity:0.08, shadowRadius:6 } }) },
  chartInnerWrapper: { position:'relative', paddingBottom:6 },
  chartEmpty: { textAlign:'center', color:'#64748B', marginVertical:12 },
  chartLabelsRow: { height:26, marginTop:6, position:'relative' },
  chartLabel: { fontSize:10, color:'#334155' },
  legendRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginTop:10 },
  legendItem: { flexDirection:'row', alignItems:'center', marginRight:14 },
  legendDot: { width:12, height:12, borderRadius:6, marginRight:6 },
  legendLabel: { fontSize:12, fontWeight:'600', color:'#334155' },
  legendRangeBadge: { backgroundColor:'#F1F5F9', paddingHorizontal:10, paddingVertical:4, borderRadius:8 },
  legendRangeText: { fontSize:11, fontWeight:'600', color:'#475569' },
  chartFallback: { padding:12, borderRadius:10, backgroundColor:'#FFF', marginHorizontal:16, marginTop:8 },
  chartHint: { fontSize:12, color:'#475569', marginTop:4, textAlign:'center' },
  tooltipContainer: { position:'absolute', padding:8, backgroundColor:'#004A61', borderRadius:8, minWidth:130 },
  tooltipTitle: { color:'#fff', fontSize:11, fontWeight:'700' },
  tooltipValue: { color:'#fff', fontSize:11, marginTop:2 },
  tableHeader: { flexDirection:'row', backgroundColor:'#004A61', paddingVertical:8, paddingHorizontal:12, borderRadius:10, marginTop:4 },
  tableHeaderCell: { flex:1, color:'#FFFFFF', fontSize:12, fontWeight:'700' },
  tableRow: { flexDirection:'row', paddingVertical:10, paddingHorizontal:12, borderBottomWidth:1, borderBottomColor:'#E2E8F0' },
  tableRowAlt: { backgroundColor:'#F8FAFC' },
  tableCell: { flex:1, fontSize:12, color:'#334155' },
  rowActions: { flexDirection:'row', justifyContent:'flex-start' },
  iconButton: { padding:4, marginRight:6, borderRadius:8, backgroundColor:'#F1F5F9' },
  tableListContent: {},
  modalContainer: { flex:1, justifyContent:'center', alignItems:'center', backgroundColor:'rgba(15,23,42,0.45)' },
  modalCard: { width:'90%', backgroundColor:'#FFFFFF', borderRadius:20, padding:20, ...Platform.select({ web:{ boxShadow:'0 8px 24px rgba(0,0,0,0.12)' }, default:{ elevation:6, shadowColor:'#000', shadowOpacity:0.18, shadowRadius:12 } }) },
  modalTitle: { fontSize:18, fontWeight:'700', color:'#004A61', marginBottom:16 },
  formContainer: { width:'100%' },
  modalActions: { flexDirection:'row', justifyContent:'space-between', width:'100%', marginTop:24 },
  metricBody: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:12 },
  metricControl: { width:42, height:42, borderRadius:10, backgroundColor:'#E2E8F0', alignItems:'center', justifyContent:'center' },
  metricValueWrap: { flexDirection:'row', alignItems:'baseline' },
  metricValue: { fontSize:42, fontWeight:'700', color:'#1F2D3D', minWidth:70, textAlign:'center' },
  metricUnit: { fontSize:14, color:'#475569', marginLeft:6, fontWeight:'600' }
});


