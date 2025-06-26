// HealtCare_FrontEnd/src/hooks/useAccount.ts

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import ApiService from '@/services/apiService';

// --- Interfaces para garantir a tipagem dos dados ---
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

interface ChangePasswordData {
    current: string;
    new: string;
    confirm: string;
}

type ModalType = 'personalInfo' | 'additionalData' | 'changePassword' | 'logout' | null;

// --- Funções auxiliares para conversão de dados ---
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
  
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({ fullName: 'A carregar...', email: 'A carregar...' });
  const [additionalData, setAdditionalData] = useState<AdditionalData>({ birthDate: '', phone: '', gender: '', cpf: '', weight: '', height: '' });

  const handleLogout = useCallback(async () => {
    await ApiService.logout();
    router.replace('/login');
  }, [router]);

  const fetchUserData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [userResult, profileResult] = await Promise.all([
        ApiService.getProfile(),
        ApiService.getAdditionalProfile(),
      ]);
      
      if (userResult.success && userResult.data?.data) {
        setPersonalInfo({
          fullName: userResult.data.data.nome_completo,
          email: userResult.data.data.email,
        });
      } else {
        Alert.alert('Sessão Expirada', 'Por favor, faça o login novamente.');
        
        return;
      }

      if (profileResult.success && profileResult.data.data) {
        const { data_nascimento, celular, genero, cpf, peso, altura } = profileResult.data.data;
        setAdditionalData({
          birthDate: data_nascimento ? new Date(data_nascimento).toISOString().split('T')[0] : '',
          phone: celular || '',
          gender: genderToFrontend(genero),
          cpf: cpf || '',
          weight: peso ? String(peso) : '',
          height: altura ? String(altura) : '',
        });
      }
      
    } catch (error) {
      console.error('Erro ao buscar dados completos do utilizador:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao carregar os seus dados.');
    } finally {
      setIsLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const openModal = (modalName: ModalType) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);

  const handleSavePersonalInfo = async (newData: PersonalInfo) => {
    const payload = {
        nome_completo: newData.fullName,
        email: newData.email,
    };
    const result = await ApiService.saveProfile(payload); 
    if (result.success) {
        await fetchUserData(); 
        Alert.alert('Sucesso', 'As suas informações foram atualizadas!');
        closeModal();
    } else {
        Alert.alert('Erro', result.error || 'Não foi possível salvar os dados.');
    }
  };

  const handleSaveAdditionalData = async (newData: Partial<AdditionalData>) => {
    const payload = {
      data_nascimento: newData.birthDate || null,
      celular: newData.phone || null,
      genero: genderToBackend(newData.gender ?? ''),
      cpf: newData.cpf || null,
      peso: newData.weight ? parseFloat(newData.weight) : null,
      altura: newData.height != null ? parseInt(newData.height, 10) : null,
    };
    const result = await ApiService.saveAdditionalProfile(payload);
    if (result.success) {
      await fetchUserData();
      Alert.alert('Sucesso', 'Os seus dados foram salvos!');
      closeModal();
    } else {
      Alert.alert("Erro", result.error || 'Não foi possível salvar os dados.');
    }
  };
  
  const handleChangePassword = async (passwords: ChangePasswordData) => {
     if (passwords.new !== passwords.confirm) {
        Alert.alert('Erro', 'As novas senhas não coincidem.');
        return;
     }
     if (passwords.new.length < 6) {
        Alert.alert('Erro', 'A nova senha deve ter pelo menos 6 caracteres.');
        return;
     }
     const result = await ApiService.changePassword({
        senha_atual: passwords.current,
        nova_senha: passwords.new,
     });
     if (result.success) {
        Alert.alert('Sucesso', 'A sua senha foi alterada!');
        closeModal();
     } else {
        Alert.alert('Erro', result.error || 'Não foi possível alterar a senha.');
     }
  };

  return {
    isLoading,
    activeModal,
    openModal,
    closeModal,
    personalInfo,
    additionalData,
    handleSavePersonalInfo,
    handleSaveAdditionalData,
    handleChangePassword,
    handleLogout,
  };
}
