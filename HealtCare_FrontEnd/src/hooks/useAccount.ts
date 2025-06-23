import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import ApiService from '@/services/apiService'; // Usa o nosso serviço de API centralizado

// Tipos para os dados do perfil, para um código mais seguro.
interface PersonalInfo {
  fullName: string;
  email: string;
}

interface AdditionalData {
  birthDate: string;
  phone: string;
  gender: 'Masculino' | 'Feminino' | 'Outro' | '';
  cpf: string;
  weight: string;
  height: string;
}

type ModalType = 'personalInfo' | 'additionalData' | 'changePassword' | 'logout' | null;

// Funções para converter o formato do género entre o frontend e o backend.
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

export function useAccount() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: 'A carregar...',
    email: 'A carregar...',
  });
  
  const [additionalData, setAdditionalData] = useState<AdditionalData>({
    birthDate: '', phone: '', gender: '', cpf: '', weight: '', height: '',
  });

  const handleLogout = useCallback(async () => {
    await ApiService.logout();
    router.replace('/login');
  }, [router]);

  const fetchUserData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Faz chamadas paralelas para os endpoints de perfil do utilizador e dados adicionais.
      const [userResult, profileResult] = await Promise.all([
        ApiService.getProfile(), // Busca dados básicos do utilizador (nome, email)
        ApiService.getAdditionalProfile(), // Busca dados adicionais (cpf, peso, etc.)
      ]);
      
      if (userResult.success) {
        setPersonalInfo({
          fullName: userResult.data.data.name,
          email: userResult.data.data.email,
        });
      } else {
        Alert.alert('Sessão Expirada', 'Por favor, faça o login novamente.');
        await handleLogout();
        return;
      }

      if (profileResult.success && profileResult.data.data) {
        const { data_nascimento, celular, genero, cpf, peso, altura } = profileResult.data.data;
        setAdditionalData({
          birthDate: data_nascimento ? new Date(data_nascimento).toISOString().split('T')[0] : '',
          phone: celular || '',
          gender: genderToFrontend(genero), // Converte 'M'/'F'/'O' para o texto completo
          cpf: cpf || '',
          weight: peso ? String(peso) : '',
          height: altura ? String(altura) : '',
        });
      }
      
    } catch (error) {
      console.error('Erro ao buscar dados completos do utilizador:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao carregar os seus dados. Verifique a sua conexão.');
    } finally {
      setIsLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const openModal = (modalName: ModalType) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);

  const handleSaveAdditionalData = async (newData: Partial<AdditionalData>) => {
    const payload = {
      data_nascimento: newData.birthDate || null,
      celular: newData.phone || null,
      genero: genderToBackend(newData.gender),
      cpf: newData.cpf || null,
      peso: newData.weight ? parseFloat(newData.weight) : null,
      altura: newData.height ? parseInt(newData.height, 10) : null,
    };

    const result = await ApiService.saveAdditionalProfile(payload);
    if (result.success) {
      // Atualiza o estado local com os dados retornados e formatados do backend
      fetchUserData(); // Recarrega todos os dados para garantir consistência
      Alert.alert('Sucesso', 'Os seus dados foram salvos!');
      closeModal();
    } else {
      Alert.alert("Erro", `Não foi possível salvar os dados: ${result.error}`);
    }
  };
  
  const handleChangePassword = async (passwords: { current: string; new: string }) => {
     // Lógica para chamar o serviço de troca de senha
  };

  return {
    isLoading,
    activeModal,
    openModal,
    closeModal,
    personalInfo,
    additionalData,
    handleSaveAdditionalData,
    handleChangePassword,
    handleLogout,
  };
}
