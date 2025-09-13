// HealtCare_FrontEnd/src/hooks/useAccount.ts

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import ApiService from '@/services/apiService';
import { formatNumberForDisplay, parseFormattedNumber, formatCPF, formatPhoneNumber, formatDate } from '@/utils/formatters';
import { useApiErrorHandler } from '@/hooks/useErrorHandler';
import { captureError } from '@/services/errorMonitoringService';

// --- Interfaces para garantir a tipagem dos dados ---
interface PersonalInfo {
  fullName: string;
  email: string;
}

interface PerfilData {
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

type ModalType = 'personalInfo' | 'perfil' | 'changePassword' | 'logout' | null;

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
  const { handleError, clearError } = useApiErrorHandler();
  const [isLoading, setIsLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({ fullName: 'A carregar...', email: 'A carregar...' });
  const [perfilData, setPerfilData] = useState<PerfilData>({ birthDate: '', phone: '', gender: '', cpf: '', weight: '', height: '' });

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
        setPerfilData({
          birthDate: data_nascimento ? formatDate(data_nascimento) : '',
          phone: celular ? formatPhoneNumber(celular) : '',
          gender: genderToFrontend(genero),
          cpf: cpf ? formatCPF(cpf) : '',
          weight: peso ? formatNumberForDisplay(peso) : '',
          height: altura ? String(altura) : '',
        });
      }
      
    } catch (error) {
      console.error('Erro ao buscar dados completos do utilizador:', error);
      handleError(error as Error, 'fetchUserData');
      await captureError(error as Error, { context: 'fetchUserData' });
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
        const error = new Error(result.error || 'Não foi possível salvar os dados.');
        handleError(error, 'handleSavePersonalInfo');
        await captureError(error, { context: 'handleSavePersonalInfo' });
    }
  };

  const handleSavePerfilData = async (newData: Partial<PerfilData>) => {
    // Remover formatação dos dados antes de enviar para o backend
    const cleanCPF = newData.cpf ? newData.cpf.replace(/\D/g, '') : null;
    const cleanPhone = newData.phone ? newData.phone.replace(/\D/g, '') : null;
    
    // Converter data de DD/MM/YYYY para YYYY-MM-DD
    let cleanBirthDate = null;
    if (newData.birthDate) {
      const dateParts = newData.birthDate.split('/');
      if (dateParts.length === 3) {
        cleanBirthDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
      }
    }
    
    const payload = {
      data_nascimento: cleanBirthDate,
      celular: cleanPhone,
      genero: genderToBackend(newData.gender ?? ''),
      cpf: cleanCPF,
      peso: newData.weight ? parseFormattedNumber(newData.weight) : null,
      altura: newData.height ? parseInt(newData.height, 10) : null,
    };
    const result = await ApiService.savePerfilData(payload);
    if (result.success) {
      await fetchUserData();
      Alert.alert('Sucesso', 'Os seus dados foram salvos!');
      closeModal();
    } else {
      const error = new Error(result.error || 'Não foi possível salvar os dados.');
      handleError(error, 'handleSavePerfilData');
      await captureError(error, { context: 'handleSavePerfilData' });
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
        const error = new Error(result.error || 'Não foi possível alterar a senha.');
        handleError(error, 'handleChangePassword');
        await captureError(error, { context: 'handleChangePassword' });
     }
  };

      return {
      isLoading,
      activeModal,
      openModal,
      closeModal,
      personalInfo,
      perfilData,
      handleSavePersonalInfo,
      handleSavePerfilData,
      handleChangePassword,
      handleLogout,
    };
}
