// HealthCare_FrontEnd/src/app/CompletarPerfilInicial.tsx

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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatCPF, unmaskCPF, formatCelular, unmaskCelular, formatDateForInput, unmaskDate, formatPeso, unmaskPeso, formatAltura, unmaskAltura } from '@/utils/formatters';

// Tela para o usuário completar seu próprio perfil pela primeira vez.
export default function CompletarPerfilInicialScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(false);

  const [nomePerfil, setNomePerfil] = useState('');
  const [parentesco] = useState('Eu mesmo'); // Fixo e não editável.
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [genero, setGenero] = useState('');

  const [showGeneroModal, setShowGeneroModal] = useState(false);

  // Crie um useEffect para carregar o nome do usuário dinamicamente
  useEffect(() => {
    const loadUserName = async () => {
      let finalName = 'Usuário'; // Valor padrão final

      try {
        // 1. Tenta pegar do AsyncStorage (fonte mais confiável)
        const userInfoString = await AsyncStorage.getItem('userInfo');
        if (userInfoString) {
          const userInfo = JSON.parse(userInfoString);
          if (userInfo.nome_completo) {
            finalName = userInfo.nome_completo;
          }
        } else if (params.accountName) {
          // 2. Se não houver no AsyncStorage, usa o parâmetro da rota como fallback
          finalName = params.accountName as string;
        }
      } catch (error) {
        console.error("Falha ao carregar nome do usuário.", error);
        // Se der erro, ainda podemos usar o parâmetro da rota se ele existir
        if (params.accountName) {
          finalName = params.accountName as string;
        }
      }
      
      setNomePerfil(finalName);
    };

    loadUserName();
  }, [params.accountName]);

  // --- Função para Salvar o Perfil Inicial ---
  const handleSave = async () => {
    if (!nomePerfil.trim()) {
      Alert.alert('Atenção', 'O nome do perfil é obrigatório.');
      return;
    }
    setIsLoading(true);
    try {
      const generoMapeado = genero === 'Masculino' ? 'MASCULINO' : genero === 'Feminino' ? 'FEMININO' : 'OUTRO';
      
      const profileData = {
        nome_perfil: nomePerfil.trim(),
        parentesco: parentesco,
        cpf: unmaskCPF(cpf) || '', 
        celular: unmaskCelular(telefone) || '',
        data_nascimento: unmaskDate(dataNascimento) || '',
        peso: peso ? String(parseFloat(unmaskPeso(peso))) : 0,
        altura: altura ? String(parseInt(unmaskAltura(altura))) : 0,
        genero: genero ? generoMapeado : '',
      };

      const result = await ApiService.savePerfilData(profileData);

      if (result.success) {
        Alert.alert('Sucesso!', 'Seu perfil foi criado com sucesso.');
        router.replace('/(tabs)/home'); // Direciona para a home
      } else {
        Alert.alert('Erro', result.error || 'Erro ao salvar seu perfil.');
      }
    } catch (error: any) {
      Alert.alert('Erro', 'Erro ao conectar com o servidor. Tente novamente.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
           <View style={{ width: 24 }} />
           <Text style={styles.headerTitle}>Complete seu Perfil</Text>
           <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.form}>
            <Text style={styles.welcomeTitle}>Bem-vindo(a)!</Text>
            <Text style={styles.welcomeSubtitle}>Complete com suas informações para começar.</Text>

            <Text style={styles.label}>Nome do Perfil *</Text>
            <TextInput style={styles.input} value={nomePerfil} onChangeText={setNomePerfil} placeholder="Seu nome completo" />

            <Text style={styles.label}>Parentesco</Text>
            <View style={[styles.input, styles.disabledInput]}>
              <Text style={styles.disabledInputText}>{parentesco}</Text>
            </View>
            
            {/* ... outros campos do formulário ... */}
            <Text style={styles.label}>CPF</Text>
            <TextInput style={styles.input} placeholder="000.000.000-00" value={cpf} onChangeText={text => setCpf(formatCPF(text))} keyboardType="numeric" />

            <Text style={styles.label}>Telefone</Text>
            <TextInput style={styles.input} placeholder="(00) 90000-0000" value={telefone} onChangeText={text => setTelefone(formatCelular(text))} keyboardType="numeric" />

            <Text style={styles.label}>Data de Nascimento</Text>
            <TextInput style={styles.input} placeholder="DD/MM/AAAA" value={dataNascimento} onChangeText={text => setDataNascimento(formatDateForInput(text))} keyboardType="numeric" />

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
          <TouchableOpacity style={styles.button} onPress={handleSave} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Salvar e Continuar</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

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
    </View>
  );
}

// Estilos 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollView: { flex: 1 },
  scrollContainer: { paddingBottom: 20 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#004A61' },
  form: { paddingHorizontal: 25, paddingTop: 10 },
  welcomeTitle: { fontSize: 28, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  welcomeSubtitle: { fontSize: 16, color: '#64748B', marginBottom: 30 },
  label: { fontSize: 16, color: '#334155', marginBottom: 8, marginTop: 15, fontWeight: '500' },
  input: {
    backgroundColor: '#F8FAFC', paddingHorizontal: 15, height: 58, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', color: '#1E293B',
  },
  disabledInput: {
    backgroundColor: '#F1F5F9',
  },
  disabledInputText: {
    color: '#64748B', fontSize: 16,
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
