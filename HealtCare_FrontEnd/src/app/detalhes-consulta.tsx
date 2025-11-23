import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface Consulta {
  id: string;
  especialidade: string;
  endereco: string;
  hora: string;
  data: string;
  descricao: string;
}

export default function DetalhesConsultaScreen() {
  const router = useRouter();
  const { consulta } = useLocalSearchParams();
  const [consultaData, setConsultaData] = useState<Consulta | null>(null);
  const [especialidade, setEspecialidade] = useState('');
  const [endereco, setEndereco] = useState('');
  const [hora, setHora] = useState('');
  const [data, setData] = useState('');
  const [descricao, setDescricao] = useState('');

  const especialidades = [
    'Cardiologista',
    'Dermatologista',
    'Endocrinologista',
    'Ginecologista',
    'Neurologista',
    'Oftalmologista',
    'Ortopedista',
    'Pediatra',
    'Psiquiatra',
    'Reumatologista',
    'Urologista'
  ];

  useEffect(() => {
    if (consulta) {
      try {
        const parsedConsulta = JSON.parse(consulta as string);
        setConsultaData(parsedConsulta);
        setEspecialidade(parsedConsulta.especialidade);
        setEndereco(parsedConsulta.endereco || 'Hospital Anchieta, Taguatinga Norte');
        // Aceitar tanto 'hora' quanto 'horario' como campo de horário
        // Converter "11h30" para "11:30" se necessário
        const horarioRaw = parsedConsulta.horario || parsedConsulta.hora || '';
        const horarioFormatado = horarioRaw.replace('h', ':');
        setHora(horarioFormatado);
        setData(parsedConsulta.data);
        setDescricao(parsedConsulta.descricao || 'Levar carteirinha');
      } catch (error) {
        console.error('Erro ao parsear consulta:', error);
        // Dados mockados para demonstração
        setConsultaData({
          id: '1',
          especialidade: 'Reumatologista',
          endereco: 'Hospital Anchieta, Taguatinga Norte',
          hora: '11:30',
          data: '03/11/2024',
          descricao: 'Levar carteirinha'
        });
        setEspecialidade('Reumatologista');
        setEndereco('Hospital Anchieta, Taguatinga Norte');
        setHora('11:30');
        setData('03/11/2024');
        setDescricao('Levar carteirinha');
      }
    }
  }, [consulta]);

  const handleEdit = () => {
    router.push({
      pathname: '/editar-consulta',
      params: { consulta: JSON.stringify(consultaData) }
    });
  };


  if (!consultaData) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <Text>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#004A61" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{especialidade}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* Formulário */}
        <View style={styles.form}>
          {/* Especialidade */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Especialidade</Text>
            <View style={[styles.input, styles.inputDisabled]}>
              <Text style={[styles.inputText, styles.inputTextDisabled]}>
                {especialidade}
              </Text>
            </View>
          </View>

          {/* Endereço */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Endereço</Text>
            <View style={[styles.input, styles.inputDisabled]}>
              <Text style={[styles.inputText, styles.inputTextDisabled]}>
                {endereco}
              </Text>
            </View>
          </View>

          {/* Hora */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hora</Text>
            <View style={[styles.input, styles.inputDisabled]}>
              <Text style={[styles.inputText, styles.inputTextDisabled]}>
                {hora || 'Não informado'}
              </Text>
            </View>
          </View>

          {/* Data */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data</Text>
            <View style={[styles.input, styles.inputDisabled]}>
              <Text style={[styles.inputText, styles.inputTextDisabled]}>
                {data}
              </Text>
            </View>
          </View>

          {/* Descrição */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descrição</Text>
            <View style={[styles.input, styles.textArea, styles.inputDisabled]}>
              <Text style={[styles.inputText, styles.inputTextDisabled]}>
                {descricao}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Botão Editar */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleEdit}>
          <Text style={styles.actionButtonText}>Editar consulta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerSpacer: {
    width: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  form: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputDisabled: {
    backgroundColor: '#F8F8F8',
  },
  textArea: {
    minHeight: 100,
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  inputText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  inputTextDisabled: {
    color: '#999',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
});
