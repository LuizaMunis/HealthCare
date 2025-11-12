// HealthCare_FrontEnd/src/components/Account/manageProfiles.tsx

import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import ApiService from '@/services/apiService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator
} from 'react-native';

// Tela para Criar (dependentes), Editar e Excluir perfis.
export default function GerenciarPerfilScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const profileIdToEdit = params.profileId as string;
  const isEditMode = !!profileIdToEdit;

  const [isLoading, setIsLoading] = useState(isEditMode); // Inicia carregando se estiver editando
  const [nomePerfil, setNomePerfil] = useState('');
  const [parentesco, setParentesco] = useState('');
  // ... outros estados
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [genero, setGenero] = useState('');
  const [showGeneroModal, setShowGeneroModal] = useState(false);
  const [showParentescoModal, setShowParentescoModal] = useState(false);

  const parentescoOptions = [
    'Pai / Mãe', 'Filho / Filha', 'Cônjuge', 'Irmão / Irmã', 'Avô / Avó', 'Bisavô / Bisavó', 'Neto / Neta', 'Tio / Tia', 'Sobrinho / Sobrinha', 'Primo / Prima', 'Sogro / Sogra', 'Genro / Nora', 'Cunhado / Cunhada', 'Padrasto / Madrasta', 'Enteado / Enteada', 'Padrinho / Madrinha', 'Afilhado / Afilhada'
  ];

  // --- Funções de Formatação (Máscaras) ---
  const formatCPF = (text: string) => text.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2').slice(0, 14);
  const formatTelefone = (text: string) => text.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 15);
  const formatData = (text: string) => text.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 10);
  const formatPeso = (text: string) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length === 0) return '';
    
    // UX: 1-2 dígitos como inteiro; a partir de 3, vírgula nos dois últimos
    if (numbers.length <= 2) {
      const inteiro = parseInt(numbers, 10);
      if (inteiro > 500) return '500';
      return String(inteiro);
    }

    const valorNumerico = parseInt(numbers, 10) / 100;
    if (valorNumerico > 500) return '500,00';

    const kg = numbers.slice(0, -2);
    const g = numbers.slice(-2);
    return `${kg},${g}`;
  };
  const formatAltura = (text: string) => text.replace(/\D/g, '').slice(0, 3);
  
  // Função para processar peso antes de enviar ao backend
  const processarPeso = (peso: string): string => {
    if (!peso) return '';
    
    // Se começar com vírgula (ex: ",55"), adiciona "0" antes
    if (peso.startsWith(',')) {
      return `0${peso.replace(',', '.')}`;
    }
    
    // Se for apenas números (ex: "5"), adiciona ".00"
    if (!peso.includes(',') && !peso.includes('.')) {
      return `${peso}.00`;
    }
    
    return peso.replace(',', '.'); // converte vírgula em ponto
  };

  // Busca dados do perfil se estiver em modo de edição.
  useEffect(() => {
    if (isEditMode) {
      const fetchProfileData = async () => {
        try {
          const result = await ApiService.getProfileById(profileIdToEdit);
          if (result.success && result.data) {
            const data = result.data;
            setNomePerfil(data.nome_perfil || '');
            setParentesco(data.parentesco || '');
            setCpf(data.cpf ? formatCPF(data.cpf) : '');
            setTelefone(data.celular ? formatTelefone(data.celular) : '');
            setDataNascimento(data.data_nascimento ? new Date(data.data_nascimento).toLocaleDateString('pt-BR') : '');
            setPeso(data.peso ? String(data.peso).replace('.', ',') : '');
            setAltura(data.altura ? String(data.altura) : '');
            setGenero(data.genero === 'MASCULINO' ? 'Masculino' : data.genero === 'FEMININO' ? 'Feminino' : 'Prefiro não dizer');
          } else {
            Alert.alert('Erro', result.error || 'Não foi possível carregar os dados do perfil.');
            router.back();
          }
        } catch (error) {
          Alert.alert('Erro', 'Ocorreu um erro de conexão.');
          router.back();
        } finally {
          setIsLoading(false);
        }
      };
      fetchProfileData();
    }
  }, [isEditMode, profileIdToEdit]);

  // --- Função para Salvar (Cria ou Atualiza) ---
  const handleSave = async () => {
    // ... (lógica de salvar idêntica à anterior, mas sem a verificação de 'isCreatingFirstProfile')
    if (!nomePerfil.trim()) {
      Alert.alert('Atenção', 'O nome do perfil é obrigatório.');
      return;
    }
    setIsLoading(true);
    try {
      const dataParts = dataNascimento.split('/');
      const dataFormatada = dataParts.length === 3 ? `${dataParts[2]}-${dataParts[1]}-${dataParts[0]}` : null;
      const generoMapeado = genero === 'Masculino' ? 'MASCULINO' : genero === 'Feminino' ? 'FEMININO' : 'OUTRO';
      const profileData = {
        nome_perfil: nomePerfil.trim(),
        parentesco: parentesco.trim(),
        cpf: cpf.replace(/\D/g, '') || null,
        celular: telefone.replace(/\D/g, '') || null,
        data_nascimento: dataFormatada,
        peso: peso ? parseFloat(processarPeso(peso)) : null,
        altura: altura ? parseInt(altura) : null,
        genero: genero ? generoMapeado : null,
      };
      let result;
      if (isEditMode) {
        result = await ApiService.updateProfile(profileIdToEdit, profileData);
      } else {
        result = await ApiService.createProfile(profileData);
      }
      if (result.success) {
        Alert.alert('Sucesso!', `Perfil ${isEditMode ? 'atualizado' : 'criado'} com sucesso.`);
        router.back(); // Sempre volta para a tela anterior
      } else {
        Alert.alert('Erro', result.error || 'Erro ao salvar o perfil.');
      }
    } catch (error: any) {
      Alert.alert('Erro', 'Erro ao conectar com o servidor.');
    } finally {
        setIsLoading(false);
    }
  };

  // --- Função para Excluir o Perfil ---
  const handleDelete = () => {
    Alert.alert(
      "Excluir Perfil",
      "Tem certeza que deseja excluir este perfil? Esta ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: async () => {
          setIsLoading(true);
          try {
            const result = await ApiService.deleteProfile(profileIdToEdit);
            if (result.success) {
              Alert.alert('Sucesso', 'Perfil excluído com sucesso.');
              router.back();
            } else {
              Alert.alert('Erro', result.error || 'Não foi possível excluir o perfil.');
            }
          } catch (error) {
            Alert.alert('Erro', 'Erro de conexão ao tentar excluir o perfil.');
          } finally {
            setIsLoading(false);
          }
        }}
      ]
    );
  };

  if (isLoading && isEditMode) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#004A61" /></View>;
  }

  return (
    <View style={styles.container}>
       <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#004A61" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEditMode ? 'Editar Perfil' : 'Novo Perfil'}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.form}>
                <Text style={styles.label}>Nome do Perfil *</Text>
                <TextInput style={styles.input} value={nomePerfil} onChangeText={setNomePerfil} placeholder="Nome do dependente" />

                <Text style={styles.label}>Parentesco</Text>
                <TouchableOpacity style={styles.input} onPress={() => setShowParentescoModal(true)}>
                    <Text style={parentesco ? styles.inputText : styles.placeholderText}>{parentesco || 'Selecione o parentesco'}</Text>
                </TouchableOpacity>

                {/* ... outros campos ... */}
                 <Text style={styles.label}>CPF</Text>
                <TextInput style={styles.input} placeholder="000.000.000-00" value={cpf} onChangeText={text => setCpf(formatCPF(text))} keyboardType="numeric" />

                <Text style={styles.label}>Telefone</Text>
                <TextInput style={styles.input} placeholder="(00) 90000-0000" value={telefone} onChangeText={text => setTelefone(formatTelefone(text))} keyboardType="numeric" />

                <Text style={styles.label}>Data de Nascimento</Text>
                <TextInput style={styles.input} placeholder="DD/MM/AAAA" value={dataNascimento} onChangeText={text => setDataNascimento(formatData(text))} keyboardType="numeric" />

                <Text style={styles.label}>Peso (Kg)</Text>
                <TextInput style={styles.input} placeholder="00,00" value={peso} onChangeText={text => setPeso(formatPeso(text))} keyboardType="decimal-pad" />

                <Text style={styles.label}>Altura (cm)</Text>
                <TextInput style={styles.input} placeholder="000" value={altura} onChangeText={text => setAltura(formatAltura(text))} keyboardType="numeric" />
                
                <Text style={styles.label}>Gênero</Text>
                <TouchableOpacity style={styles.input} onPress={() => setShowGeneroModal(true)}>
                <Text style={genero ? styles.inputText : styles.placeholderText}>{genero || 'Selecione o gênero'}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
            {isEditMode && (
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={isLoading}>
                    <Text style={styles.deleteButtonText}>Excluir Perfil</Text>
                </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.button} onPress={handleSave} disabled={isLoading}>
                {isLoading ? <ActivityIndicator color="#FFFFFF" /> :<Text style={styles.buttonText}>Salvar Alterações</Text>}
            </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>

      {/* Modais (Gênero e Parentesco) */}
      <Modal visible={showGeneroModal} transparent={true} animationType="fade" onRequestClose={() => setShowGeneroModal(false)}>
        {/* ... Modal de Gênero ... */}
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setShowGeneroModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione o gênero</Text>
            {['Masculino', 'Feminino', 'Prefiro não dizer'].map(option => (
              <TouchableOpacity key={option} style={styles.modalOption} onPress={() => { setGenero(option); setShowGeneroModal(false); }}>
                <Text style={styles.modalOptionText}>{option}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowGeneroModal(false)}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showParentescoModal} transparent={true} animationType="fade" onRequestClose={() => setShowParentescoModal(false)}>
        {/* ... Modal de Parentesco ... */}
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setShowParentescoModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione o Parentesco</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              {parentescoOptions.map(option => (
                <TouchableOpacity key={option} style={styles.modalOption} onPress={() => { setParentesco(option); setShowParentescoModal(false); }}>
                  <Text style={styles.modalOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalCancel} onPress={() => setShowParentescoModal(false)}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// Estilos
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  scrollContainer: { paddingBottom: 20 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  backButton: {},
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#004A61' },
  form: { paddingHorizontal: 25, paddingTop: 10 },
  label: { fontSize: 16, color: '#334155', marginBottom: 8, marginTop: 15, fontWeight: '500' },
  input: {
    backgroundColor: '#F8FAFC', paddingHorizontal: 15, height: 58, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', color: '#1E293B',
  },
  inputText: { fontSize: 16, color: '#1E293B', },
  placeholderText: { fontSize: 16, color: '#94A3B8', },
  footer: {
    backgroundColor: '#FFFFFF', paddingHorizontal: 25, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  button: {
    backgroundColor: '#004A61', paddingVertical: 18, borderRadius: 12, alignItems: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  deleteButton: {
    backgroundColor: '#FFF1F2', paddingVertical: 18, borderRadius: 12, alignItems: 'center', marginBottom: 10,
  },
  deleteButtonText: {
    color: '#DC2626', fontSize: 16, fontWeight: 'bold'
  },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 30, width: '100%',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#004A61' },
  modalOption: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalOptionText: { fontSize: 16, textAlign: 'center', color: '#334155' },
  modalCancel: {
    paddingVertical: 15, marginTop: 10, backgroundColor: '#F1F5F9', borderRadius: 12,
  },
  modalCancelText: {
    fontSize: 16, color: '#64748B', textAlign: 'center', fontWeight: 'bold',
  },
});
