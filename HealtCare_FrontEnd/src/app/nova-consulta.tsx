import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';

export default function NovaConsultaScreen() {
  const router = useRouter();
  const [especialidade, setEspecialidade] = useState('');
  const [endereco, setEndereco] = useState('');
  const [hora, setHora] = useState('08:00');
  const [data, setData] = useState('12/12/2024');
  const [nomeMedico, setNomeMedico] = useState('');
  const [descricao, setDescricao] = useState('');
  const [arquivosAnexados, setArquivosAnexados] = useState<DocumentPicker.DocumentResult[]>([]);

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

  const handleSave = () => {
    if (!especialidade.trim()) {
      Alert.alert('Erro', 'Por favor, selecione uma especialidade');
      return;
    }

    if (!endereco.trim()) {
      Alert.alert('Erro', 'Por favor, insira o endereço');
      return;
    }

    if (!hora.trim()) {
      Alert.alert('Erro', 'Por favor, selecione a hora');
      return;
    }

    if (!data.trim()) {
      Alert.alert('Erro', 'Por favor, selecione a data');
      return;
    }

    if (!nomeMedico.trim()) {
      Alert.alert('Erro', 'Por favor, insira o nome do médico');
      return;
    }

    // Aqui você implementaria a lógica para salvar no backend
    Alert.alert('Sucesso', 'Consulta agendada com sucesso!');
    router.back();
  };

  const showEspecialidadePicker = () => {
    Alert.alert(
      'Especialidade',
      'Selecione a especialidade:',
      [
        ...especialidades.map(esp => ({
          text: esp,
          onPress: () => setEspecialidade(esp)
        })),
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const showHoraPicker = () => {
    const horas = [];
    for (let h = 6; h <= 22; h++) {
      for (let m = 0; m < 60; m += 15) {
        const horaStr = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        horas.push(horaStr);
      }
    }

    Alert.alert(
      'Hora',
      'Selecione a hora:',
      [
        ...horas.slice(0, 20).map(h => ({ // Limitando para não sobrecarregar o alert
          text: h,
          onPress: () => setHora(h)
        })),
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const showDataPicker = () => {
    const hoje = new Date();
    const datas = [];
    
    // Gerar próximas 30 datas
    for (let i = 0; i < 30; i++) {
      const data = new Date(hoje);
      data.setDate(hoje.getDate() + i);
      const dataStr = data.toLocaleDateString('pt-BR');
      datas.push(dataStr);
    }

    Alert.alert(
      'Data',
      'Selecione a data:',
      [
        ...datas.slice(0, 15).map(d => ({ // Limitando para não sobrecarregar o alert
          text: d,
          onPress: () => setData(d)
        })),
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const handleAttachFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled && result.assets) {
        setArquivosAnexados(prev => [...prev, ...result.assets]);
        Alert.alert('Sucesso', `${result.assets.length} arquivo(s) anexado(s) com sucesso!`);
      }
    } catch (error) {
      console.error('Erro ao selecionar arquivo:', error);
      Alert.alert('Erro', 'Não foi possível anexar o arquivo. Tente novamente.');
    }
  };

  const removeFile = (index: number) => {
    setArquivosAnexados(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#004A61" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Nova consulta</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* Formulário */}
        <View style={styles.form}>
          {/* Especialidade */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Especialidade</Text>
            <TouchableOpacity style={styles.input} onPress={showEspecialidadePicker}>
              <Text style={[styles.inputText, !especialidade && styles.placeholder]}>
                {especialidade || 'especialidade'}
              </Text>
              <Feather name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Endereço */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Endereço</Text>
            <TextInput
              style={styles.input}
              value={endereco}
              onChangeText={setEndereco}
              placeholder="endereço"
              placeholderTextColor="#999"
            />
          </View>

          {/* Hora */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hora</Text>
            <TouchableOpacity style={styles.input} onPress={showHoraPicker}>
              <Text style={styles.inputText}>{hora}</Text>
              <Feather name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Data */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Data</Text>
            <TouchableOpacity style={styles.input} onPress={showDataPicker}>
              <Text style={styles.inputText}>{data}</Text>
              <Feather name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Nome do médico */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome do médico</Text>
            <TextInput
              style={styles.input}
              value={nomeMedico}
              onChangeText={setNomeMedico}
              placeholder="Alfredo"
              placeholderTextColor="#999"
            />
          </View>

          {/* Descrição */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={descricao}
              onChangeText={setDescricao}
              placeholder="descrição"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Anexar arquivos */}
          <View style={styles.inputGroup}>
            <TouchableOpacity style={styles.attachButton} onPress={handleAttachFiles}>
              <Text style={styles.attachButtonText}>Anexar arquivos</Text>
            </TouchableOpacity>
          </View>

          {/* Lista de arquivos anexados */}
          {arquivosAnexados.length > 0 && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Arquivos anexados</Text>
              {arquivosAnexados.map((arquivo, index) => (
                <View key={index} style={styles.fileItem}>
                  <View style={styles.fileInfo}>
                    <Feather name="file" size={20} color="#004A61" />
                    <View style={styles.fileDetails}>
                      <Text style={styles.fileName} numberOfLines={1}>
                        {arquivo.name}
                      </Text>
                      <Text style={styles.fileSize}>
                        {formatFileSize(arquivo.size || 0)}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => removeFile(index)}
                  >
                    <Feather name="x" size={20} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Botão Salvar */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Salvar</Text>
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
  placeholder: {
    color: '#999',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  saveButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  attachButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    alignItems: 'flex-start',
  },
  attachButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#004A61',
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fileDetails: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
  },
  removeButton: {
    padding: 4,
    marginLeft: 8,
  },
});
