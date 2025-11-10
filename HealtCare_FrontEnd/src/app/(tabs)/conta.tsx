// HealthCare_FrontEnd/src/app/(tabs)/conta.tsx

import { Feather } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
//import {useUserData} from '@/hooks/useUserData';
import { useAccount } from '@/hooks/useAccount';

const EllipseImage = require('../../assets/images/Ellipse 44.png');

// Importação de todos os modais
import PerfilModal from '@/components/Account/PerfilModal';
import ChangePasswordModal from '@/components/Account/ChangePasswordModal';
import LogoutConfirmModal from '@/components/Account/LogoutConfirmModal';
import PersonalInfoModal from '@/components/Account/PersonalInfoModal';
import ChangeProfileModal from '@/components/Account/changeProfileModal';

export default function AccountScreen() {
  const params = useLocalSearchParams();
  console.log(params); // ou use params.id, params.nome, etc.
  
  //const { userName } = useUserData();
  const {
    activeModal,
    openModal,
    closeModal,
    personalInfo, // Usamos estes dados para o nome e email.
    perfilData,
    profiles, 
    activeProfile, 
    handleSavePersonalInfo,
    handleSavePerfilData,
    handleChangePassword,
    handleLogout,
    handleSelectProfile, 
    handleAddProfile,    
  } = useAccount();

  // Modo escuro removido - sempre usar modo claro
  const themeColors = Colors['light'];

  const menuItems = [
    { key: 'personalInfo', icon: 'user', label: 'Informações pessoais' },
    { key: 'perfil', icon: 'clipboard', label: 'Perfil' },
    { key: 'changePassword', icon: 'key', label: 'Alterar senha' },
    { key: 'logout', icon: 'log-out', label: 'Sair' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#FFFFFF' }]} edges={['top', 'bottom']}>
      {/* Bolas azuis de fundo */}
      <Image source={EllipseImage} style={styles.ellipseTopLeft} resizeMode="contain" pointerEvents="none" />
      <Image source={EllipseImage} style={styles.ellipseBottomRight} resizeMode="contain" pointerEvents="none" />
      
      <ScrollView style={{ zIndex: 1 }}>
        <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: themeColors.primary }]}>Seu Conta</Text>
        </View>

        <View style={[styles.profileCard, { backgroundColor: themeColors.card }]}>
            {/* Exibe o nome do perfil ativo */}
            <Text style={[styles.profileName, { color: themeColors.text }]}>Olá, {activeProfile?.name || 'Usuário'}!</Text>
            <Text style={[styles.profileSub, { color: themeColors.textSecondary }]}>Seja bem-vindo ao HealthCare.</Text>
            <TouchableOpacity style={styles.profileAction} onPress={() => openModal('changeProfile')}>
                <Feather name="users" size={16} color={themeColors.primary}/>
                <Text style={[styles.profileActionText, { color: themeColors.primary }]}>Mudar perfil</Text>
            </TouchableOpacity>
        </View>
        
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Configurações de conta</Text>

        <View style={[styles.menuContainer, { backgroundColor: themeColors.card }]}>
            {menuItems.map(item => (
                <TouchableOpacity key={item.key} style={styles.menuItem} onPress={() => openModal(item.key as any)}>
                    <Feather name={item.icon as any} size={22} color={themeColors.text} />
                    <Text style={[styles.menuLabel, { color: themeColors.text }]}>{item.label}</Text>
                    <Feather name="chevron-right" size={22} color={themeColors.textSecondary} />
                </TouchableOpacity>
            ))}
        </View>
      </ScrollView>

      {/* --- Modais --- */}
      <PersonalInfoModal 
        visible={activeModal === 'personalInfo'}
        onClose={closeModal}
        data={personalInfo}
        onSave={handleSavePersonalInfo}
      />
      <PerfilModal
        visible={activeModal === 'perfil'}
        onClose={closeModal}
        data={{ ...personalInfo, ...perfilData }}
        onSave={handleSavePerfilData}
      />
      <ChangePasswordModal
        visible={activeModal === 'changePassword'}
        onClose={closeModal}
        onSave={handleChangePassword}
      />
      <LogoutConfirmModal
        visible={activeModal === 'logout'}
        onClose={closeModal}
        onConfirm={handleLogout}
      />
      <ChangeProfileModal
        visible={activeModal === 'changeProfile'}
        onClose={closeModal}
        profiles={profiles}
        activeProfileId={activeProfile?.id}
        onSelectProfile={handleSelectProfile}
        onAddProfile={handleAddProfile}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loadingContainer: { justifyContent: 'center', alignItems: 'center' },
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
    header: { padding: 20, alignItems: 'center' },
    headerTitle: { fontSize: 24, fontWeight: 'bold' },
    profileCard: { marginHorizontal: 20, borderRadius: 15, padding: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
    profileName: { fontSize: 22, fontWeight: 'bold' },
    profileSub: { marginBottom: 15 },
    profileAction: { flexDirection: 'row', alignItems: 'center' },
    profileActionText: { marginLeft: 8, fontWeight: 'bold' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', margin: 20 },
    menuContainer: { marginHorizontal: 20, borderRadius: 15, paddingVertical: 10 },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 20 },
    menuLabel: { flex: 1, marginLeft: 15, fontSize: 16 },
});
