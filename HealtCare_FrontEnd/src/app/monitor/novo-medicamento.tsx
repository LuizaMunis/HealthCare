import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function NovoMedicamentoScreen() {
  const router = useRouter();
  const [nome, setNome] = useState('Medicamento 5');
  const [dosesPorDia, setDosesPorDia] = useState('2');
  const [dosagem, setDosagem] = useState('150 mg');
  const [dataInicial, setDataInicial] = useState('12/06/2025');
  const [duracaoTratamento, setDuracaoTratamento] = useState('1 ano');
  const [usoContinuo, setUsoContinuo] = useState(true);
  const [frequenciaLembrete, setFrequenciaLembrete] = useState('Todo dia - 8:00');

  const handleSave = () => {
    if (!nome.trim()) {
      Alert.alert('Erro', 'Por favor, insira o nome do medicamento');
      return;
    }

    if (!dosesPorDia || parseInt(dosesPorDia) < 1) {
      Alert.alert('Erro', 'Por favor, insira um número válido de doses por dia');
      return;
    }

    if (!frequenciaLembrete.trim()) {
      Alert.alert('Erro', 'Por favor, selecione a frequência do lembrete');
      return;
    }

    // Aqui você implementaria a lógica para salvar no backend
    Alert.alert('Sucesso', 'Medicamento adicionado com sucesso!');
    router.back();
  };

  const showDosesPicker = () => {
    Alert.alert(
      'Número de ingestões por dia',
      'Selecione o número de doses:',
      [
        { text: '1', onPress: () => setDosesPorDia('1') },
        { text: '2', onPress: () => setDosesPorDia('2') },
        { text: '3', onPress: () => setDosesPorDia('3') },
        { text: '4', onPress: () => setDosesPorDia('4') },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const showDosagemPicker = () => {
    const dosagens = ['50 mg', '100 mg', '150 mg', '200 mg', '250 mg', '500 mg'];
    Alert.alert(
      'Dosagem',
      'Selecione a dosagem:',
      [
        ...dosagens.map(d => ({
          text: d,
          onPress: () => setDosagem(d)
        })),
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const showDataInicialPicker = () => {
    const hoje = new Date();
    const datas = [];
    
    for (let i = 0; i < 365; i++) {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() + i);
      const dataStr = data.toLocaleDateString('pt-BR');
      datas.push(dataStr);
    }

    Alert.alert(
      'Data inicial',
      'Selecione a data:',
      [
        ...datas.slice(0, 20).map(d => ({
          text: d,
          onPress: () => setDataInicial(d)
        })),
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const showDuracaoPicker = () => {
    const duracoes = ['1 semana', '2 semanas', '1 mês', '3 meses', '6 meses', '1 ano', '2 anos'];
    Alert.alert(
      'Duração do tratamento',
      'Selecione a duração:',
      [
        ...duracoes.map(d => ({
          text: d,
          onPress: () => setDuracaoTratamento(d)
        })),
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const showFrequenciaPicker = () => {
    const frequencias = [
      'Todo dia - 8:00',
      'Todo dia - 12:00',
      'Todo dia - 18:00',
      'A cada 8 horas',
      'A cada 12 horas',
      '2 vezes ao dia',
      '3 vezes ao dia'
    ];
    Alert.alert(
      'Frequência do lembrete',
      'Selecione a frequência:',
      [
        ...frequencias.map(f => ({
          text: f,
          onPress: () => setFrequenciaLembrete(f)
        })),
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };


  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#004A61" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.titleButton}>
            <Text style={styles.title}>Novo medicamento</Text>
          </View>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* Formulário */}
        <View style={styles.form}>
          {/* Nome do medicamento */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome do medicamento</Text>
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Digite o nome do medicamento"
              placeholderTextColor="#999"
            />
          </View>

          {/* Número de ingestões por dia */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Número de ingestões por dia</Text>
            <TouchableOpacity style={styles.input} onPress={showDosesPicker}>
              <Text style={styles.inputText}>{dosesPorDia}</Text>
              <Feather name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Dosagem */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dosagem</Text>
            <TouchableOpacity style={styles.input} onPress={showDosagemPicker}>
              <Text style={styles.inputText}>{dosagem}</Text>
              <Feather name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Data inicial */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data inicial</Text>
            <TouchableOpacity style={styles.input} onPress={showDataInicialPicker}>
              <Text style={styles.inputText}>{dataInicial}</Text>
              <Feather name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Duração do tratamento */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Duração do tratamento</Text>
            <TouchableOpacity style={styles.input} onPress={showDuracaoPicker}>
              <Text style={styles.inputText}>{duracaoTratamento}</Text>
              <Feather name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Checkbox Uso contínuo */}
          <View style={styles.checkboxContainer}>
            <TouchableOpacity 
              style={[styles.checkbox, usoContinuo && styles.checkboxChecked]}
              onPress={() => setUsoContinuo(!usoContinuo)}
            >
              {usoContinuo && <Feather name="check" size={16} color="#FFFFFF" />}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>Uso contínuo?</Text>
          </View>

          {/* Frequência do lembrete */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Frequência do lembrete</Text>
            <TouchableOpacity style={styles.input} onPress={showFrequenciaPicker}>
              <Text style={styles.inputText}>{frequenciaLembrete}</Text>
              <Feather name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Botão Salvar */}
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Salvar</Text>
        </TouchableOpacity>
      </ScrollView>

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
  titleButton: {
    backgroundColor: '#004A61',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#81C5D8',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
    color: '#004A61',
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
  inputText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#004A61',
    borderRadius: 15,
    alignItems: 'center',
    paddingVertical: 15,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#004A61',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#004A61',
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#004A61',
  },
});
