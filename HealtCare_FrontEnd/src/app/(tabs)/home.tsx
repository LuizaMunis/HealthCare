// HealthCare_FrontEnd/src/app/(tabs)/index.tsx

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useUserData } from '@/hooks/useUserData';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { API_CONFIG, ENDPOINTS } from '@/constants/api';

const EllipseImage = require('../../assets/images/Ellipse 44.png');


interface ProximoEvento {
  id: string;
  tipo: 'consulta' | 'medicamento';
  titulo: string;
  dataHora: Date;
  subtitulo: string;
}

export default function HomeScreen() {
  
  const { userName, loading } = useUserData();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [proximosEventos, setProximosEventos] = useState<ProximoEvento[]>([]);
  const [loadingEventos, setLoadingEventos] = useState(true);

  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const buscarProximosEventos = useCallback(async () => {
    try {
      setLoadingEventos(true);
      const token = await AsyncStorage.getItem('healthcare_auth_token');
      const profileId = await AsyncStorage.getItem('active_profile_id');

      if (!token || !profileId) {
        setProximosEventos([]);
        setLoadingEventos(false);
        return;
      }

      const consultas: ProximoEvento[] = [];
      const medicamentos: ProximoEvento[] = [];
      const agora = new Date();
      agora.setHours(0, 0, 0, 0);

      // Buscar consultas futuras (PRIORIDADE)
      try {
        const responseConsultas = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.CONSULTAS}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (responseConsultas.ok) {
          const resultConsultas = await responseConsultas.json();
          if (resultConsultas.success && resultConsultas.data) {
            resultConsultas.data.forEach((consulta: any) => {
              // Filtrar apenas consultas do perfil ativo
              if (consulta.perfil_id && consulta.perfil_id.toString() === profileId) {
                const dataHora = new Date(consulta.data_hora_consulta);
                // Apenas consultas futuras
                if (dataHora >= agora) {
                  consultas.push({
                    id: `consulta-${consulta.id}`,
                    tipo: 'consulta',
                    titulo: consulta.especialidade || 'Consulta',
                    dataHora: dataHora,
                    subtitulo: dataHora.toLocaleDateString('pt-BR', {
                      day: 'numeric',
                      month: 'long'
                    }),
                  });
                }
              }
            });
          }
        }
      } catch (error) {
        console.error('Erro ao buscar consultas:', error);
      }

      // Ordenar consultas por data/hora
      consultas.sort((a, b) => a.dataHora.getTime() - b.dataHora.getTime());

      // Buscar medicamentos com lembretes ativos
      try {
        const responseMedicamentos = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINTS.MEDICATION_RECORDS}?perfil_id=${profileId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (responseMedicamentos.ok) {
          const resultMedicamentos = await responseMedicamentos.json();
          if (resultMedicamentos.success && resultMedicamentos.data) {
            resultMedicamentos.data.forEach((medicamento: any) => {
              if (medicamento.lembretes_ativos) {
                const dataInicio = new Date(medicamento.data_inicio_tratamento);
                const frequenciaHoras = medicamento.frequencia_horas || 24;
                const agora = new Date();
                
                // Calcular próximo horário baseado na frequência
                let proximoHorario = new Date(dataInicio);
                
                // Se o horário de início já passou, calcular o próximo
                while (proximoHorario <= agora) {
                  proximoHorario = new Date(proximoHorario.getTime() + (frequenciaHoras * 60 * 60 * 1000));
                }
                
                // Verificar se o tratamento ainda está ativo (se não for uso contínuo, verificar duração)
                if (medicamento.uso_continuo || !medicamento.duracao_dias_tratamento) {
                  // Uso contínuo ou sem duração definida - sempre mostrar
                  medicamentos.push({
                    id: `medicamento-${medicamento.id}`,
                    tipo: 'medicamento',
                    titulo: medicamento.nome_medicamento || 'Medicamento',
                    dataHora: proximoHorario,
                    subtitulo: proximoHorario.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    }),
                  });
                } else {
                  // Verificar se ainda está dentro do período de tratamento
                  const dataFim = new Date(dataInicio);
                  dataFim.setDate(dataFim.getDate() + medicamento.duracao_dias_tratamento);
                  
                  if (proximoHorario <= dataFim) {
                    medicamentos.push({
                      id: `medicamento-${medicamento.id}`,
                      tipo: 'medicamento',
                      titulo: medicamento.nome_medicamento || 'Medicamento',
                      dataHora: proximoHorario,
                      subtitulo: proximoHorario.toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      }),
                    });
                  }
                }
              }
            });
          }
        }
      } catch (error) {
        console.error('Erro ao buscar medicamentos:', error);
      }

      // Ordenar medicamentos por data/hora
      medicamentos.sort((a, b) => a.dataHora.getTime() - b.dataHora.getTime());

      // Combinar eventos dando prioridade para consultas
      // Garantir pelo menos 1 consulta (se houver), depois adicionar medicamentos
      const eventosFinais: ProximoEvento[] = [];
      
      // Sempre adicionar pelo menos 1 consulta se houver
      if (consultas.length > 0) {
        eventosFinais.push(consultas[0]);
        
        // Se ainda há espaço, adicionar mais consultas ou medicamentos
        const restantes = 2; // Total de 3 eventos, já temos 1 consulta
        
        // Adicionar mais consultas primeiro (prioridade)
        for (let i = 1; i < consultas.length && eventosFinais.length < 3; i++) {
          eventosFinais.push(consultas[i]);
        }
        
        // Se ainda há espaço, adicionar medicamentos
        for (let i = 0; i < medicamentos.length && eventosFinais.length < 3; i++) {
          eventosFinais.push(medicamentos[i]);
        }
      } else {
        // Se não há consultas, mostrar apenas medicamentos (até 3)
        eventosFinais.push(...medicamentos.slice(0, 3));
      }

      setProximosEventos(eventosFinais);
    } catch (error) {
      console.error('Erro ao buscar próximos eventos:', error);
      setProximosEventos([]);
    } finally {
      setLoadingEventos(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      buscarProximosEventos();
    }, [buscarProximosEventos])
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#004A61" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={[]}>
      {/* Bolas azuis de fundo */}
      <Image source={EllipseImage} style={styles.ellipseTopLeft} resizeMode="contain" pointerEvents="none" />
      <Image source={EllipseImage} style={styles.ellipseBottomRight} resizeMode="contain" pointerEvents="none" />
      
      <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingTop: insets.top, paddingBottom: insets.bottom + 100 }]}>
        <View style={styles.header}>
          <Text style={styles.logoText}>Home <Text style={styles.logoIcon}>+</Text></Text>
        </View>

        <View style={styles.welcomeCard}>
          <View style={styles.welcomeStripe} />
          <View>
            <Text style={styles.welcomeTitle}>Olá, {userName || 'Usuário'}!</Text>
            <Text style={styles.welcomeSubtitle}>Bem-vindo ao HealthCare.</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Seus próximos eventos</Text>

        {loadingEventos ? (
          <View style={styles.eventCard}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={[styles.eventSubtitle, { marginLeft: 10 }]}>Carregando eventos...</Text>
          </View>
        ) : proximosEventos.length === 0 ? (
          <View style={styles.eventCard}>
            <View style={styles.eventStripe} />
            <View style={styles.eventTextContainer}>
              <Text style={styles.eventTitle}>Nenhum evento próximo</Text>
              <Text style={styles.eventSubtitle}>Você não tem eventos agendados</Text>
            </View>
          </View>
        ) : (
          proximosEventos.map((evento) => (
            <View key={evento.id} style={styles.eventCard}>
              <View style={styles.eventStripe} />
              <View style={styles.eventTextContainer}>
                <Text style={styles.eventTitle}>{evento.titulo}</Text>
                <Text style={styles.eventSubtitle}>{evento.subtitulo}</Text>
              </View>
              {evento.tipo === 'consulta' && (
                <Feather name="info" size={24} color="#FFFFFF" />
              )}
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>Acesso rápido</Text>
        <View style={styles.quickAccessContainer}>
            <TouchableOpacity 
              style={styles.quickAccessCard}
              onPress={() => router.push('/consultas')}
            >
                <Feather name="calendar" size={32} color="#004A61" />
                <Text style={styles.quickAccessTitle}>Consultas</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickAccessCard}
              onPress={() => router.push('/notificacoes')}
            >
                <Feather name="bell" size={32} color="#004A61" />
                <Text style={styles.quickAccessTitle}>Notificações</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    scrollContainer: { paddingHorizontal: 20, zIndex: 1 },
    ellipseTopLeft: {
        position: 'absolute',
        top: -80,
        left: -80,
        width: 300,
        height: 300,
        opacity: 0.4,
        zIndex: 0,
    },
    ellipseBottomRight: {
        position: 'absolute',
        bottom: 50,
        right: -60,
        width: 280,
        height: 280,
        opacity: 0.4,
        zIndex: 0,
    },
    header: { alignItems: 'center', marginBottom: 20 },
    logoText: { fontSize: 24, fontWeight: 'bold', color: '#004A61' },
    logoIcon: { color: '#00B8D4' },
    welcomeCard: { backgroundColor: '#FFFFFF', borderRadius: 15, padding: 20, flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, marginBottom: 30},
    welcomeStripe: { width: 5, height: 40, backgroundColor: '#00B8D4', borderRadius: 3, marginRight: 15 },
    welcomeTitle: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    welcomeSubtitle: { fontSize: 14, color: 'gray' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
    eventCard: { backgroundColor: '#004A61', borderRadius: 15, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 15, elevation: 3},
    eventStripe: { width: 5, height: 40, backgroundColor: '#00B8D4', borderRadius: 3, marginRight: 15 },
    eventTextContainer: { flex: 1 },
    eventTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
    eventSubtitle: { fontSize: 14, color: '#E0E0E0' },
    quickAccessContainer: { flexDirection: 'row', justifyContent: 'space-between' },
    quickAccessCard: { backgroundColor: '#FFFFFF', borderRadius: 15, width: '48%', alignItems: 'center', paddingVertical: 30, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
    quickAccessTitle: { marginTop: 10, fontSize: 14, fontWeight: 'bold', color: '#333' },
    // Estilo para o container do loading
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF'
    }
});
