// HealtCare_FrontEnd/src/hooks/useAccount.ts

import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '@/services/apiService';
import { formatCPF, formatCelular, formatDateForInput, formatDateForDisplay, unmaskDate, parseFormattedNumber } from '@/utils/formatters';
import { captureError } from '@/services/errorMonitoringService';

// --- Tipos de Dados e Interfaces ---
type BackendProfile = {
  id: number;
  nome_perfil: string;
  parentesco?: string | null; // Pode ser nulo no banco de dados
};

export type Profile = {
  id: string;
  name: string;
  relationship: string;
};

export type PersonalInfo = {
  fullName: string;
  email: string;
};

export interface PerfilData {
  birthDate: string;
  phone: string;
  gender: 'Masculino' | 'Feminino' | 'Outro' | '';
  cpf: string;
  weight: string;
  height: string;
  nome_perfil?: string; 
}

export interface ChangePasswordData {
    current: string;
    new: string;
    confirm: string;
}

type ModalType = 'personalInfo' | 'perfil' | 'changePassword' | 'logout' | 'changeProfile' | null;

// --- Chave de Armazenamento Local ---
const ACTIVE_PROFILE_KEY = 'active_profile_id';

// --- Funções Auxiliares de Conversão ---
const genderToBackend = (gender: string): 'M' | 'F' | 'O' | null => {
  if (!gender) return null;
  const lowerGender = gender.toLowerCase();
  if (lowerGender === 'masculino') return 'M';
  if (lowerGender === 'feminino') return 'F';
  if (lowerGender === 'outro') return 'O';
  return null;
};

const genderToFrontend = (genderChar: 'M' | 'F' | 'O' | null): 'Masculino' | 'Feminino' | 'Outro' | '' => {
  if (!genderChar) return '';
  if (genderChar === 'M') return 'Masculino';
  if (genderChar === 'F') return 'Feminino';
  if (genderChar === 'O') return 'Outro';
  return '';
};

/**
 * Hook customizado para gerenciar toda a lógica da tela de Conta,
 * incluindo múltiplos perfis e manipulação de dados.
 */
export const useAccount = () => {
  const router = useRouter();
  
  // --- Estados do Hook ---
  const [isLoading, setIsLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Controla se a tela está aguardando a seleção inicial do perfil.
  const [isAwaitingInitialProfileSelection, setIsAwaitingInitialProfileSelection] = useState(true);
  
  // Dados da conta principal
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({ fullName: '', email: '' });
  
  // Dados do perfil ATIVO
  const [perfilData, setPerfilData] = useState<PerfilData>({ birthDate: '', phone: '', gender: '', cpf: '', weight: '', height: '' });
  
  // Gerenciamento de múltiplos perfis
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);

  const handleLogout = useCallback(async () => {
    await ApiService.logout();
    router.replace('/login');
  }, [router]);

  const handleError = useCallback(async (error: Error, context: string) => {
    console.error(`[${context}] Erro:`, error);
    await captureError(error, { context }); // Envia o erro para o serviço de monitoramento
    
    // Lógica para logout em caso de erro de autenticação
    if (error.message.includes('expirada') || error.message.includes('401')) {
      Alert.alert('Sessão Expirada', 'Por favor, faça o login novamente.', [
        { text: 'OK', onPress: handleLogout }
      ]);
    } else {
      Alert.alert('Erro', error.message || 'Ocorreu um erro inesperado.');
    }
  }, [handleLogout]);

  /**
   * Função principal para buscar todos os dados da conta e dos perfis.
   */
  const fetchData = useCallback(async (isInitialLoad = false) => {
    setIsLoading(true);
    try {
      // 1. Busca as informações da conta principal (nome, email)
      const personalInfoResult = await ApiService.getProfile();
      if (!personalInfoResult.success || !personalInfoResult.data) { 
        throw new Error('Falha ao buscar informações da conta. Sua sessão pode ter expirado.');
      }
      const { nome_completo, email } = personalInfoResult.data;
      setPersonalInfo({ fullName: nome_completo, email });

      // 2. Busca a lista de todos os perfis associados a esta conta
      const profilesResult = await ApiService.getAllProfiles();
      if (!profilesResult.success || !profilesResult.data) {
        throw new Error('Falha ao buscar a lista de perfis.');
      }
      
      const profilesArray = Array.isArray(profilesResult.data) ? profilesResult.data : []; 

      const fetchedProfiles: Profile[] = profilesArray.map((p: BackendProfile) => ({
          id: p.id.toString(),
          name: p.nome_perfil || nome_completo, // Usando `nome_perfil` conforme a tabela
          relationship: p.parentesco || 'Principal'
      }));
      setProfiles(fetchedProfiles);

      // 3. Define o perfil ativo
      const storedActiveProfileId = await AsyncStorage.getItem(ACTIVE_PROFILE_KEY);
      const active = fetchedProfiles.find(p => p.id === storedActiveProfileId) || fetchedProfiles[0];
      
      if (active) {
        setActiveProfile(active);
        // 4. Busca os dados detalhados (CPF, etc.) do perfil que está ativo
        const activePerfilDataResult = await ApiService.getProfileById(active.id);
        if (activePerfilDataResult.success && activePerfilDataResult.data) {
            const { data_nascimento, celular, genero, cpf, peso, altura } = activePerfilDataResult.data;
            setPerfilData({
                birthDate: data_nascimento ? formatDateForDisplay(data_nascimento) : '',
                phone: celular ? formatCelular(celular) : '',
                gender: genderToFrontend(genero),
                cpf: cpf ? formatCPF(cpf) : '',
                weight: peso ? String(peso) : '',
                height: altura ? String(altura) : '',
            });
        }
      } else {
        // Se não houver perfis, limpa os dados
        setActiveProfile(null);
        setPerfilData({ birthDate: '', phone: '', gender: '', cpf: '', weight: '', height: '' });
      }

      if (isInitialLoad && fetchedProfiles.length > 0) {
        openModal('changeProfile');
      } else if (fetchedProfiles.length === 0) {
        // Se não houver perfis, não precisa esperar a seleção.
        setIsAwaitingInitialProfileSelection(false);
      }

    } catch (error: any) {
      handleError(error, 'fetchData');
      Alert.alert("Erro ao Carregar", error.message || "Não foi possível carregar os dados da sua conta.");
      setIsAwaitingInitialProfileSelection(false); // Libera a tela em caso de erro
      if (error.message.includes('expirada')) {
        handleLogout();
      }
    } finally {
      setIsLoading(false);
    }
  }, [handleError, handleLogout]);

  // Recarrega os dados sempre que a tela entra em foco
  useFocusEffect(
    useCallback(() => {
      // Busca os dados mais recentes toda vez que a tela é focada
      fetchData();

      // Abre o modal de seleção de perfil toda vez que a aba 'Conta' é acessada
      //setActiveModal('changeProfile');
    }, [fetchData]) // <-- adiciona fetchData aqui
  );
  // --- Funções de Manipulação ---

  const openModal = (modalName: ModalType) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);

  const handleSelectProfile = async (profileId: string) => {
    setIsAwaitingInitialProfileSelection(false); 
    const selectedProfile = profiles.find(p => p.id === profileId);
    if (selectedProfile) {
      await AsyncStorage.setItem(ACTIVE_PROFILE_KEY, profileId);
      //setActiveProfile(selectedProfile);
      // Recarrega os dados para refletir o novo perfil ativo
      await fetchData(false);
    }
  };

  const handleAddProfile = () => router.push('/account/manageProfiles');
  
  const handleSavePersonalInfo = async (newData: PersonalInfo) => {
    const result = await ApiService.saveProfile({ nome_completo: newData.fullName, email: newData.email }); 
    if (result.success) {
        await fetchData(); 
        Alert.alert('Sucesso', 'As suas informações foram atualizadas!');
        closeModal();
    } else {
        handleError(new Error(result.error), 'handleSavePersonalInfo');
    }
  };

  const handleSavePerfilData = async (newData: Partial<PerfilData>) => {
    if (!activeProfile) {
        Alert.alert('Erro', 'Nenhum perfil ativo selecionado.');
        return;
    }
    // Lógica de limpeza e formatação dos dados
    const payload = {
      data_nascimento: newData.birthDate ? `${newData.birthDate.split('/')[2]}-${newData.birthDate.split('/')[1]}-${newData.birthDate.split('/')[0]}` : null,
      celular: newData.phone ? newData.phone.replace(/\D/g, '') : null,
      genero: genderToBackend(newData.gender ?? ''),
      cpf: newData.cpf ? newData.cpf.replace(/\D/g, '') : null,
      peso: newData.weight ? parseFormattedNumber(newData.weight) : null,
      altura: newData.height ? parseInt(newData.height, 10) : null,
      nome_perfil: newData.nome_perfil || activeProfile.name,
    };
    // Se temos um profileId, usamos PUT; caso contrário, criamos/completamos com POST
    const result = activeProfile.id ? await ApiService.updatePerfilDataById(activeProfile.id, payload as any) : await ApiService.savePerfilData(payload as any);
    if (result.success) {
      await fetchData();
      Alert.alert('Sucesso', 'Os seus dados foram salvos!');
      closeModal();
    } else {
      handleError(new Error(result.error), 'handleSavePerfilData');
    }
  };
  
  const handleChangePassword = async (passwords: ChangePasswordData) => {
     if (passwords.new !== passwords.confirm) {
        Alert.alert('Erro', 'As novas senhas não coincidem.');
        return;
     }
     const result = await ApiService.changePassword({ senha_atual: passwords.current, nova_senha: passwords.new });
     if (result.success) {
        Alert.alert('Sucesso', 'A sua senha foi alterada!');
        closeModal();
     } else {
        handleError(new Error(result.error), 'handleChangePassword');
     }
  };

  return {
    isLoading, isAwaitingInitialProfileSelection, activeModal, openModal, closeModal,
    personalInfo, perfilData, profiles, activeProfile,
    handleSavePersonalInfo, handleSavePerfilData, handleChangePassword,
    handleLogout, handleSelectProfile, handleAddProfile,
  };
};

