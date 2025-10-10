import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface Consulta {
  id: string;
  especialidade: string;
  data: string;
  horario: string;
  endereco?: string;
  descricao?: string;
}

export default function ConsultasScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  
  const [consultas] = useState<Consulta[]>([
    {
      id: '1',
      especialidade: 'Reumatologista',
      data: '03/11/2024',
      horario: '11:30',
      endereco: 'Hospital Anchieta, Taguatinga Norte',
      descricao: 'Levar carteirinha'
    },
    {
      id: '2',
      especialidade: 'Endócrinologista',
      data: '03/12/2024',
      horario: '18:45',
      endereco: 'Clínica Endocrino, Asa Sul',
      descricao: 'Exame de glicemia em jejum'
    },
    {
      id: '3',
      especialidade: 'Cardiologista',
      data: '15/12/2024',
      horario: '14:00',
      endereco: 'Hospital do Coração, Brasília',
      descricao: 'Consulta de rotina'
    },
    {
      id: '4',
      especialidade: 'Dermatologista',
      data: '20/12/2024',
      horario: '09:15',
      endereco: 'Clínica Derma, Águas Claras',
      descricao: 'Avaliação de manchas na pele'
    }
  ]);

  const filteredConsultas = consultas.filter(consulta =>
    consulta.especialidade.toLowerCase().includes(searchText.toLowerCase()) ||
    consulta.data.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleAddConsulta = () => {
    router.push('/nova-consulta');
  };

  const handleConsultaPress = (consulta: Consulta) => {
    router.push({
      pathname: '/detalhes-consulta',
      params: { consulta: JSON.stringify(consulta) }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#004A61" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Consultas</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Botão Adicionar Consulta */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddConsulta}>
          <View style={styles.addIcon}>
            <Feather name="plus" size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.addText}>Adicionar consultas</Text>
        </TouchableOpacity>
      </View>

      {/* Barra de Busca */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar item"
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {/* Lista de Consultas */}
      <ScrollView style={styles.consultasList} showsVerticalScrollIndicator={false}>
        {filteredConsultas.map((consulta) => (
          <TouchableOpacity
            key={consulta.id}
            style={styles.consultaCard}
            onPress={() => handleConsultaPress(consulta)}
          >
            <View style={styles.consultaStripe} />
            <View style={styles.consultaContent}>
              <View style={styles.consultaInfo}>
                <Text style={styles.especialidade}>{consulta.especialidade}</Text>
                <Text style={styles.data}>{consulta.data}</Text>
                <Text style={styles.horario}>{consulta.horario}</Text>
              </View>
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => handleConsultaPress(consulta)}
              >
                <Feather name="info" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerSpacer: {
    width: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  addIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#004A61',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  addText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  consultasList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  consultaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  consultaStripe: {
    width: 5,
    backgroundColor: '#004A61',
  },
  consultaContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  consultaInfo: {
    flex: 1,
  },
  especialidade: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#004A61',
    marginBottom: 4,
  },
  data: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  horario: {
    fontSize: 14,
    color: '#666',
  },
  infoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#004A61',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});
