// HealthCare_FrontEnd/src/components/Account/changeProfileModal.tsx

/**
 * @file Modal para visualização e seleção de perfis de usuário.
 * Inspirado na imagem fornecida, permite alternar entre perfis existentes
 * e acionar a criação de um novo perfil.
 */
import { Feather } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// --- Tipos de Dados (Props) ---

// Define a estrutura de um único perfil
type Profile = {
  id: string;
  name: string;
  relationship: string;
};

interface ProfileItemProps {
  profile: Profile;
  isActive: boolean;
  onSelect: () => void;
}

// Define as propriedades que o componente Modal espera receber
interface ChangeProfileModalProps {
  visible: boolean;
  onClose: () => void;
  profiles: Profile[]; // Uma lista de perfis disponíveis
  activeProfileId: string; // O ID do perfil atualmente ativo
  onSelectProfile: (profileId: string) => void; // Função para mudar o perfil ativo
  onAddProfile: () => void; // Função para abrir a tela de adicionar perfil
}

// --- Componente de Item de Perfil (usado na lista) ---
const ProfileItem = ({ profile, isActive, onSelect }: ProfileItemProps) => (
  <TouchableOpacity
    style={[styles.profileButton, isActive && styles.profileButtonActive]}
    onPress={onSelect}>
    <View style={styles.profileInfo}>
      <Feather 
        name="smile" 
        size={24} 
        color={isActive ? '#FFFFFF' : '#4A5568'} 
      />
      <View style={styles.profileTextContainer}>
        <Text style={[styles.profileName, isActive && styles.profileTextActive]}>
          {profile.name}
        </Text>
        {profile.relationship && (
           <Text style={[styles.profileRelationship, isActive && styles.profileTextActive]}>
            Parentesco: {profile.relationship}
          </Text>
        )}
      </View>
    </View>
    <View style={[styles.radioButton, isActive && styles.radioButtonActive]}>
      {isActive && <View style={styles.radioButtonInner} />}
    </View>
  </TouchableOpacity>
);

// --- Componente Principal do Modal ---
export default function ChangeProfileModal({
  visible,
  onClose,
  profiles,
  activeProfileId,
  onSelectProfile,
  onAddProfile,
}: ChangeProfileModalProps) {
  
  const [currentActiveId, setCurrentActiveId] = useState(activeProfileId);

  // Sincroniza o ID ativo quando a prop do pai mudar
  useEffect(() => {
    setCurrentActiveId(activeProfileId);
  }, [activeProfileId, visible]);
  
  const handleSelect = (profileId: string) => {
    setCurrentActiveId(profileId);
    // Simula o tempo de salvar a seleção antes de fechar
    setTimeout(() => {
        onSelectProfile(profileId);
        onClose();
    }, 300);
  };
  
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Feather name="arrow-left" size={24} color="#004A61" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Alterar perfil</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          {/* Lista de Perfis */}
          <FlatList
            data={profiles}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ProfileItem
                profile={item}
                isActive={item.id === currentActiveId}
                onSelect={() => handleSelect(item.id)}
              />
            )}
            contentContainerStyle={styles.listContainer}
          />

          {/* Botão de Adicionar Perfil */}
          <TouchableOpacity 
            style={[styles.profileButton, styles.addButton]}
            onPress={() => {
              onClose(); // Fecha o modal atual antes de navegar
              onAddProfile();
            }}
          >
            <Feather name="plus" size={24} color="#FFFFFF" />
            <Text style={[styles.profileName, styles.addButtonText]}>
              Adicionar perfil
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'white' },
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#004A61' },
  headerPlaceholder: { width: 24 },
  listContainer: {
    padding: 20,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E0F7FA',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  profileButtonActive: {
    backgroundColor: '#004A61',
    borderColor: '#007B9A',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileTextContainer: {
    marginLeft: 15,
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A5568',
  },
  profileRelationship: {
    fontSize: 14,
    color: '#718096',
  },
  profileTextActive: {
    color: '#FFFFFF',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CBD5E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonActive: {
    borderColor: '#FFFFFF',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#4A5568',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  addButtonText: {
    color: '#FFFFFF',
    marginLeft: 10,
  },
});