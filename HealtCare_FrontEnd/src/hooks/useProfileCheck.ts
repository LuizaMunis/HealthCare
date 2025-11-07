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

      // Buscar perfis do usuário (backend retorna { success, data: Perfil[] })
      const result = await ApiService.getAdditionalProfile();
      const profiles = result?.data;

      if (result.success && Array.isArray(profiles) && profiles.length > 0) {
        const p = profiles[0];
        // Verificar dados essenciais
        const hasEssentialData = Boolean(
          (p?.cpf && String(p.cpf).trim() !== '') &&
          (p?.celular && String(p.celular).trim() !== '') &&
          (p?.data_nascimento && String(p.data_nascimento).trim() !== '') &&
          (p?.peso !== null && p?.peso !== undefined && String(p.peso).trim() !== '') &&
          (p?.altura !== null && p?.altura !== undefined && String(p.altura).trim() !== '') &&
          (p?.genero && String(p.genero).trim() !== '')
        );
        setHasProfile(hasEssentialData);
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
