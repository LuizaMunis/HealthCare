import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

// Interface para garantir que os dados do utilizador tenham o formato esperado
interface UserInfo {
  nome_completo: string;
  // Pode adicionar outras propriedades como email, id, etc., se necessário
}

/**
 * Hook personalizado para carregar os dados do utilizador logado.
 * Ele encapsula a lógica de buscar os dados do AsyncStorage e o estado de carregamento.
 * @returns {{userName: string, loading: boolean}} O primeiro nome do utilizador e o estado de carregamento.
 */
export function useUserData() {
  // O estado agora vive dentro do hook, não no componente do ecrã.
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // A lógica de `useFocusEffect` é a mesma, mas agora está encapsulada aqui.
  useFocusEffect(
    useCallback(() => {
      const loadUserData = async () => {
        // Reinicia o estado de carregamento sempre que o ecrã foca
        setLoading(true); 
        try {
          const userInfoString = await AsyncStorage.getItem('userInfo');
          if (userInfoString) {
            const userInfo: UserInfo = JSON.parse(userInfoString);
            
            // Pega o primeiro nome para uma saudação mais pessoal
            const firstName = userInfo.nome_completo.split(' ')[0];
            setUserName(firstName);
          }
        } catch (error) {
          console.error("Falha ao carregar dados do utilizador do AsyncStorage.", error);
          setUserName(''); // Limpa o nome em caso de erro para não mostrar lixo
        } finally {
          // Garante que o estado de carregamento seja desativado no final
          setLoading(false);
        }
      };

      loadUserData();
    }, []) // A dependência vazia [] garante que a lógica rode uma vez por foco.
  );

  // O hook retorna os valores que o componente precisa para renderizar.
  return { userName, loading };
}
