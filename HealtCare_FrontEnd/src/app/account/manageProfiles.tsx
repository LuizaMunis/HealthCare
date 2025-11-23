// HealthCare_FrontEnd/src/components/Account/manageProfiles.tsx

import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react'; // Import React
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

// Importa os formatters
import { 
  formatCPF, unmaskCPF, 
  formatCelular, unmaskCelular, 
  formatDateForInput, unmaskDate, 
  formatPeso, unmaskPeso, 
  formatAltura, unmaskAltura 
} from '@/utils/formatters';

// NOVO: Importa os validadores
import {
  validateName,
  validateCPF,
  validateCelular,
  validateDateOfBirth,
  validatePeso,
  validateAltura
} from '@/utils/validators';

// Tela para Criar (dependentes), Editar e Excluir perfis.
export default function GerenciarPerfilScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const profileIdToEdit = params.profileId as string; //
  const isEditMode = !!profileIdToEdit; //

  const [isLoading, setIsLoading] = useState(isEditMode); //
  const [isMainProfile, setIsMainProfile] = useState(false); //
  
  const [nomePerfil, setNomePerfil] = useState(''); //
  const [parentesco, setParentesco] = useState(''); //
  const [cpf, setCpf] = useState(''); //
  const [telefone, setTelefone] = useState(''); //
  const [dataNascimento, setDataNascimento] = useState(''); //
  const [peso, setPeso] = useState(''); //
  const [altura, setAltura] = useState(''); //
  const [genero, setGenero] = useState(''); //
  
  // NOVO: Estado para guardar os erros do formulário
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showGeneroModal, setShowGeneroModal] = useState(false); //
  const [showParentescoModal, setShowParentescoModal] = useState(false); //

  const parentescoOptions = [ //
    'Pai / Mãe', 'Filho / Filha', 'Cônjuge', 'Irmão / Irmã', 'Avô / Avó', 'Bisavô / Bisavó', 'Neto / Neta', 'Tio / Tia', 'Sobrinho / Sobrinha', 'Primo / Prima', 'Sogro / Sogra', 'Genro / Nora', 'Cunhado / Cunhada', 'Padrasto / Madrasta', 'Enteado / Enteada', 'Padrinho / Madrinha', 'Afilhado / Afilhada'
  ];

  // --- Funções de Formatação (Máscaras) ---
  // (As funções de formatação que estavam aqui foram movidas para formatters.ts, 
  // agora estamos importando elas, como no exemplo: formatCPF)
  //

  // Função para processar peso antes de enviar ao backend
  const processarPeso = (peso: string): string => { //
    if (!peso) return ''; //
    if (peso.startsWith(',')) { //
      return `0${peso.replace(',', '.')}`; //
    }
    if (!peso.includes(',') && !peso.includes('.')) { //
      return `${peso}.00`; //
    }
    return peso.replace(',', '.'); //
  };

  // Busca dados do perfil se estiver em modo de edição.
  useEffect(() => { //
    if (isEditMode) { //
      const fetchProfileData = async () => { //
        try { //
          const result = await ApiService.getProfileById(profileIdToEdit); //
          if (result.success && result.data) { //
            const data = result.data; //
            
            const parentescoAtual = data.parentesco || 'Principal';
            setParentesco(parentescoAtual); //

            if (parentescoAtual === 'Principal') {
              setIsMainProfile(true);
            }

            setNomePerfil(data.nome_perfil || ''); //
            setCpf(data.cpf ? formatCPF(data.cpf) : ''); //
            setTelefone(data.celular ? formatCelular(data.celular) : ''); //
            setDataNascimento(data.data_nascimento ? formatDateForDisplay(data.data_nascimento) : ''); //
            setPeso(data.peso ? String(data.peso).replace('.', ',') : ''); //
            setAltura(data.altura ? String(data.altura) : ''); //
            setGenero(data.genero === 'MASCULINO' ? 'Masculino' : data.genero === 'FEMININO' ? 'Feminino' : 'Prefiro não dizer'); //
          } else { //
            Alert.alert('Erro', result.error || 'Não foi possível carregar os dados do perfil.'); //
            router.back(); //
          }
        } catch (error) { //
          Alert.alert('Erro', 'Ocorreu um erro de conexão.'); //
          router.back(); //
        } finally { //
          setIsLoading(false); //
        }
      };
      fetchProfileData(); //
    }
  }, [isEditMode, profileIdToEdit]); //

  // --- Função para Salvar (Cria ou Atualiza) (MODIFICADA) ---
  const handleSave = async () => { //
    // 1. Limpar erros antigos
    setErrors({}); //

    // 2. Rodar validações
    const validationErrors: Record<string, string> = {}; //

    const nomeError = validateName(nomePerfil); //
    if (nomeError) validationErrors.nome = nomeError; //

    if (!parentesco && !isMainProfile) { //
      validationErrors.parentesco = 'Selecione um parentesco.'; //
    }

    const cpfError = validateCPF(cpf); //
    if (cpfError) validationErrors.cpf = cpfError; //
    
    const celularError = validateCelular(telefone); //
    if (celularError) validationErrors.celular = celularError; //
    
    const dataNascimentoError = validateDateOfBirth(dataNascimento); //
    if (dataNascimentoError) validationErrors.dataNascimento = dataNascimentoError; //

    const pesoError = validatePeso(peso); //
    if (pesoError) validationErrors.peso = pesoError; //

    const alturaError = validateAltura(altura); //
    if (alturaError) validationErrors.altura = alturaError; //
    
    if (!genero) { //
      validationErrors.genero = 'Selecione um gênero.'; //
    }

    // 3. Verificar se há erros
    if (Object.keys(validationErrors).length > 0) { //
      setErrors(validationErrors); //
      Alert.alert('Ops! Verifique os campos', 'Por favor, corrija os campos destacados em vermelho.'); //
      return; // Para a execução //
    }
    
    // 4. Se passou, continuar com o salvamento
    setIsLoading(true); //
    try { //
      const dataFormatada = unmaskDate(dataNascimento) || null; //
      const generoMapeado = genero === 'Masculino' ? 'MASCULINO' : genero === 'Feminino' ? 'FEMININO' : 'OUTRO'; //
      const parentescoParaSalvar = isMainProfile ? 'Principal' : parentesco.trim(); //

      const profileData = { //
        nome_perfil: nomePerfil.trim(), //
        parentesco: parentescoParaSalvar, //
        cpf: unmaskCPF(cpf) || null, //
        celular: unmaskCelular(telefone) || null, //
        data_nascimento: dataFormatada, //
        peso: peso ? parseFloat(processarPeso(peso)) : null, //
        altura: altura ? parseInt(unmaskAltura(altura)) : null, //
        genero: genero ? generoMapeado : null, //
      };

      console.log("➡️ ENVIANDO PARA O BACKEND:", JSON.stringify(profileData, null, 2));
      
      let result; //
      if (isEditMode) { //
        result = await ApiService.updateProfile(profileIdToEdit, profileData); //
      } else { //
        result = await ApiService.createProfile(profileData); //
      }
      if (result.success) { //
        Alert.alert('Sucesso!', `Perfil ${isEditMode ? 'atualizado' : 'criado'} com sucesso.`); //
        router.back(); //
      } else { //
        Alert.alert('Erro', result.error || 'Erro ao salvar o perfil.'); //
      }
    } catch (error: any) { //
      Alert.alert('Erro', 'Erro ao conectar com o servidor.'); //
    } finally { //
        setIsLoading(false); //
    }
  };

  // --- Função para Excluir o Perfil ---
  const handleDelete = () => { //
    Alert.alert( //
      "Excluir Perfil", //
      "Tem certeza que deseja excluir este perfil? Esta ação não pode ser desfeita.", //
      [ //
        { text: "Cancelar", style: "cancel" }, //
        { text: "Excluir", style: "destructive", onPress: async () => { //
          setIsLoading(true); //
          try { //
            const result = await ApiService.deleteProfile(profileIdToEdit); //
            if (result.success) { //
              Alert.alert('Sucesso', 'Perfil excluído com sucesso.'); //
              router.back(); //
            } else { //
              Alert.alert('Erro', result.error || 'Não foi possível excluir o perfil.'); //
            }
          } catch (error) { //
            Alert.alert('Erro', 'Erro de conexão ao tentar excluir o perfil.'); //
          } finally { //
            setIsLoading(false); //
          }
        }}
      ]
    );
  };

  // NOVO: Função helper para limpar o erro de um campo ao digitar
  const clearError = (fieldName: string) => { //
    if (errors[fieldName]) { //
      setErrors(prev => ({ ...prev, [fieldName]: '' })); //
    }
  };

  if (isLoading && isEditMode) { //
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#004A61" /></View>; //
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
                {/* --- NOME DO PERFIL --- */}
                <Text style={styles.label}>Nome do Perfil *</Text>
                <TextInput 
                  style={[styles.input, errors.nome && styles.inputError]} 
                  value={nomePerfil} 
                  onChangeText={text => { setNomePerfil(text); clearError('nome'); }} 
                  placeholder="Nome do dependente" 
                />
                {errors.nome && <Text style={styles.errorText}>{errors.nome}</Text>}

                {/* --- PARENTESCO --- */}
                <Text style={styles.label}>Parentesco *</Text>
                <TouchableOpacity 
                  style={[styles.input, errors.parentesco && styles.inputError, isMainProfile && styles.disabledInput]}
                  onPress={() => !isMainProfile && setShowParentescoModal(true)}
                  disabled={isMainProfile}
                >
                    <Text style={parentesco ? styles.inputText : styles.placeholderText}>{parentesco || 'Selecione o parentesco'}</Text>
                </TouchableOpacity>
                {errors.parentesco && <Text style={styles.errorText}>{errors.parentesco}</Text>}

                {/* --- CPF --- */}
                <Text style={styles.label}>CPF</Text>
                <TextInput 
                  style={[styles.input, errors.cpf && styles.inputError]} 
                  placeholder="000.000.000-00" 
                  value={cpf} 
                  onChangeText={text => { setCpf(formatCPF(text)); clearError('cpf'); }} 
                  keyboardType="numeric" 
                />
                {errors.cpf && <Text style={styles.errorText}>{errors.cpf}</Text>}

                {/* --- TELEFONE --- */}
                <Text style={styles.label}>Telefone</Text>
                <TextInput 
                  style={[styles.input, errors.celular && styles.inputError]} 
                  placeholder="(00) 90000-0000" 
                  value={telefone} 
                  onChangeText={text => { setTelefone(formatCelular(text)); clearError('celular'); }} 
                  keyboardType="numeric" 
                />
                {errors.celular && <Text style={styles.errorText}>{errors.celular}</Text>}

                {/* --- DATA DE NASCIMENTO --- */}
                <Text style={styles.label}>Data de Nascimento</Text>
                <TextInput 
                  style={[styles.input, errors.dataNascimento && styles.inputError]} 
                  placeholder="DD/MM/AAAA" 
                  value={dataNascimento} 
                  onChangeText={text => { setDataNascimento(formatDateForInput(text)); clearError('dataNascimento'); }} 
                  keyboardType="numeric" 
                />
                {errors.dataNascimento && <Text style={styles.errorText}>{errors.dataNascimento}</Text>}

                {/* --- PESO --- */}
                <Text style={styles.label}>Peso (Kg)</Text>
                <TextInput 
                  style={[styles.input, errors.peso && styles.inputError]} 
                  placeholder="00,00" 
                  value={peso} 
                  onChangeText={text => { setPeso(formatPeso(text)); clearError('peso'); }} 
                  keyboardType="decimal-pad" 
                />
                {errors.peso && <Text style={styles.errorText}>{errors.peso}</Text>}

                {/* --- ALTURA --- */}
                <Text style={styles.label}>Altura (cm)</Text>
                <TextInput 
                  style={[styles.input, errors.altura && styles.inputError]} 
                  placeholder="000" 
                  value={altura} 
                  onChangeText={text => { setAltura(formatAltura(text)); clearError('altura'); }} 
                  keyboardType="numeric" 
                />
                {errors.altura && <Text style={styles.errorText}>{errors.altura}</Text>}
                
                {/* --- GÊNERO --- */}
                <Text style={styles.label}>Gênero *</Text>
                <TouchableOpacity 
                  style={[styles.input, errors.genero && styles.inputError]} 
                  onPress={() => { setShowGeneroModal(true); clearError('genero'); }}
                >
                  <Text style={genero ? styles.inputText : styles.placeholderText}>{genero || 'Selecione o gênero'}</Text>
                </TouchableOpacity>
                {errors.genero && <Text style={styles.errorText}>{errors.genero}</Text>}
            </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }]}>
            {isEditMode && !isMainProfile && ( //
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
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setShowGeneroModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione o gênero</Text>
            {['Masculino', 'Feminino', 'Prefiro não dizer'].map(option => (
              <TouchableOpacity key={option} style={styles.modalOption} onPress={() => { setGenero(option); setShowGeneroModal(false); clearError('genero'); }}>
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
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setShowParentescoModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione o Parentesco</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              {parentescoOptions.map(option => (
                <TouchableOpacity key={option} style={styles.modalOption} onPress={() => { setParentesco(option); setShowParentescoModal(false); clearError('parentesco'); }}>
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

// Estilos (COM ADIÇÃO DOS ESTILOS DE ERRO)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' }, //
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }, //
  scrollContainer: { paddingBottom: 20 }, //
  header: { //
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  backButton: {}, //
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#004A61' }, //
  form: { paddingHorizontal: 25, paddingTop: 10 }, //
  label: { fontSize: 16, color: '#334155', marginBottom: 8, marginTop: 15, fontWeight: '500' }, //
  input: { //
    backgroundColor: '#F8FAFC', paddingHorizontal: 15, height: 58, borderRadius: 12, fontSize: 16, borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center', color: '#1E293B',
  },
  
  // NOVO: Estilo para o campo com erro
  inputError: { //
    borderColor: '#DC2626', // Vermelho para destacar o erro //
    borderWidth: 1.5, //
  },

  // NOVO: Estilo para a mensagem de erro
  errorText: { //
    color: '#DC2626', //
    fontSize: 14, //
    marginTop: 5, //
    paddingLeft: 4, //
  },
  
  // NOVO: Estilo para campo desabilitado
  disabledInput: { //
    backgroundColor: '#F1F5F9', //
    color: '#94A3B8', //
  },
  
  inputText: { fontSize: 16, color: '#1E293B', }, //
  placeholderText: { fontSize: 16, color: '#94A3B8', }, //
  footer: { //
    backgroundColor: '#FFFFFF', paddingHorizontal: 25, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#F1F5F9',
  },
  button: { //
    backgroundColor: '#004A61', paddingVertical: 18, borderRadius: 12, alignItems: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }, //
  deleteButton: { //
    backgroundColor: '#FFF1F2', paddingVertical: 18, borderRadius: 12, alignItems: 'center', marginBottom: 10,
  },
  deleteButtonText: { //
    color: '#DC2626', fontSize: 16, fontWeight: 'bold'
  },
  modalOverlay: { //
    flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end',
  },
  modalContent: { //
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 30, width: '100%',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: '#004A61' }, //
  modalOption: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' }, //
  modalOptionText: { fontSize: 16, textAlign: 'center', color: '#334155' }, //
  modalCancel: { //
    paddingVertical: 15, marginTop: 10, backgroundColor: '#F1F5F9', borderRadius: 12,
  },
  modalCancelText: { //
    fontSize: 16, color: '#64748B', textAlign: 'center', fontWeight: 'bold',
  },
});