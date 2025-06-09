import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

// Define os tipos de modais que podem ser abertos para evitar erros de digitação.
type ModalType = 'personalInfo' | 'additionalData' | 'changePassword' | 'logout' | null;

export function useAccount() {
  const router = useRouter();
  
  // Estado para controlar qual modal está visível no momento.
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // --- Dados do Usuário (simulados) ---
  // Em um app real, estes dados viriam de uma API ou de um contexto de autenticação.
  const [personalInfo, setPersonalInfo] = useState({
    fullName: 'José da Silva Antônio',
    email: 'josedasilva@gmail.com',
  });

  const [additionalData, setAdditionalData] = useState({
    cpf: '000.000.000-00',
    phone: '(00)90000-0000',
    birthDate: '00/00/0000',
    weight: '00,00 Kg',
    height: '155 CM',
    gender: 'Prefiro não dizer',
  });

  // Funções para controlar a visibilidade dos modais.
  const openModal = (modalName: ModalType) => setActiveModal(modalName);
  const closeModal = () => setActiveModal(null);

  // Função para salvar as informações pessoais.
  const handleSavePersonalInfo = (newData) => {
    console.log('Salvando informações pessoais:', newData);
    setPersonalInfo(newData);
    Alert.alert('Sucesso', 'Informações salvas!');
    closeModal();
  };

  // Função para salvar os dados adicionais.
  const handleSaveAdditionalData = (newData) => {
    console.log('Salvando dados adicionais:', newData);
    setAdditionalData(newData);
    Alert.alert('Sucesso', 'Dados salvos!');
    closeModal();
  };

  // Função para alterar a senha.
  const handleChangePassword = (passwords) => {
    console.log('Alterando senha...');
    // Lógica para verificar e salvar a nova senha...
    Alert.alert('Sucesso', 'Senha alterada!');
    closeModal();
  };

  // Função para fazer logout.
  const handleLogout = () => {
    console.log('Fazendo logout...');
    closeModal();
    // Redireciona o usuário para a tela inicial/login, limpando o histórico de navegação.
    router.replace('/'); 
  };

  // Retorna todos os estados e funções que a UI precisará.
  return {
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