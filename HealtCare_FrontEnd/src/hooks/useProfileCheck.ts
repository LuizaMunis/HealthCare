import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '@/services/apiService';

export const useProfileCheck = () => {
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const checkProfile = async () => {
    try {
      setLoading(true);
      
      // Verificar se há token
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      if (!token) {
        setHasProfile(false);
        setLoading(false);
        return;
      }

      // Buscar perfil do usuário
      const result = await ApiService.getAdditionalProfile();
      
      if (result.success && result.data && result.data.data) {
        const profileData = result.data.data;
        
        // Verificar se o perfil tem dados essenciais preenchidos
        const hasEssentialData = profileData.cpf && 
                                profileData.celular && 
                                profileData.data_nascimento && 
                                profileData.peso && 
                                profileData.altura && 
                                profileData.genero;
        
        setHasProfile(!!hasEssentialData);
      } else {
        setHasProfile(false);
      }
    } catch (error) {
      console.error('Erro ao verificar perfil:', error);
      setHasProfile(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkProfile();
  }, []);

  return { hasProfile, loading, checkProfile };
};
