//HealthCare_FrontEnd/src/app/(tabs)/_layout.tsx

import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { HapticTab } from '@/components/ui/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import ApiService from '@/services/apiService';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  // Verificar se o perfil foi preenchido ao entrar nas tabs
  useEffect(() => {
    const checkProfileAndRedirect = async () => {
      try {
        // Verificar se há token
        const token = await AsyncStorage.getItem('healthcare_auth_token');
        if (!token) {
          router.replace('/login');
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
          
          if (!hasEssentialData) {
            // Perfil incompleto, redirecionar para perfil
            router.replace('/Perfil');
          }
        } else {
          // Erro ao buscar perfil ou perfil não existe, redirecionar para perfil
          router.replace('/Perfil');
        }
      } catch (error) {
        console.error('Erro ao verificar perfil:', error);
        router.replace('/Perfil');
      }
    };

    checkProfileAndRedirect();
  }, [router]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: '#8e8e93',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>

      {/* Aba Home: Ícone de casa. */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }: { color: string }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />

      {/* Aba Registros. Ícone de uma pasta/maleta com um "+". */}
      <Tabs.Screen
        name="registros"
        options={{
          title: 'Registros',
          tabBarIcon: ({ color }: { color: string }) => (
            // Exemplo de ícone, pode variar conforme sua biblioteca.
            <IconSymbol size={28} name="plus.rectangle.fill" color={color} />
          ),
        }}
      />

      {/* Aba Relatórios. Ícone de gráfico de barras. */}
      <Tabs.Screen
        name="relatorios"
        options={{
          title: 'Relatórios',
          tabBarIcon: ({ color }: { color:string }) => (
            <IconSymbol size={28} name="chart.bar.fill" color={color} />
          ),
        }}
      />

      {/* Aba Conta. Ícone de pessoa. */}
      <Tabs.Screen
        name="conta"
        options={{
          title: 'Conta',
          tabBarIcon: ({ color }: { color: string }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />

    </Tabs>
  );
}
