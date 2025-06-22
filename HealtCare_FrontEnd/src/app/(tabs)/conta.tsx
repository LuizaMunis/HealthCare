//HealthCare_FrontEnd/src/app/(tabs)/conta.tsx

import { useAccount } from '@/src/hooks/useAccount'; // Nosso hook
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Importando os componentes de modal
import AdditionalDataModal from '@/src/components/Account/AdditionalDataModal';
import ChangePasswordModal from '@/src/components/Account/ChangePasswordModal';
import LogoutConfirmModal from '@/src/components/Account/LogoutConfirmModal';
import PersonalInfoModal from '@/src/components/Account/PersonalInfoModal';

export default function AccountScreen() {
  const {
    activeModal,
    openModal,
    closeModal,
    personalInfo,
    additionalData,
    handleSavePersonalInfo,
    handleSaveAdditionalData, // Certifique-se de que esta função está sendo exportada do seu hook
    handleChangePassword,
    handleLogout,
  } = useAccount();

  const menuItems = [
    { key: 'personalInfo', icon: 'user', label: 'Informações pessoais' },
    { key: 'additionalData', icon: 'info', label: 'Dados adicionais' },
    { key: 'changePassword', icon: 'key', label: 'Alterar senha' },
    { key: 'logout', icon: 'log-out', label: 'Sair' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>HEALTHCARE</Text>
        </View>

        <View style={styles.profileCard}>
            <Text style={styles.profileName}>Olá, {personalInfo.fullName.split(' ')[0]}!</Text>
            <Text style={styles.profileSub}>Seja bem-vindo ao Olhealth.</Text>
            <TouchableOpacity style={styles.profileAction} onPress={() => openModal('personalInfo')}>
                <Feather name="user" size={16} color="#004A61"/>
                <Text style={styles.profileActionText}>Alterar perfil</Text>
            </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionTitle}>Configurações de conta</Text>

        <View style={styles.menuContainer}>
            {menuItems.map(item => (
                <TouchableOpacity key={item.key} style={styles.menuItem} onPress={() => openModal(item.key as any)}>
                    <Feather name={item.icon as any} size={22} color="#333" />
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <Feather name="chevron-right" size={22} color="#ccc" />
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

      <AdditionalDataModal
        visible={activeModal === 'additionalData'}
        onClose={closeModal}
        data={{...personalInfo, ...additionalData}} // Passamos todos os dados necessários
        onSave={handleSaveAdditionalData}          // Conectamos com a função de salvar
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
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#E3F2F5' },
    header: { padding: 20, alignItems: 'center' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#004A61' },
    profileCard: { backgroundColor: 'white', marginHorizontal: 20, borderRadius: 15, padding: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
    profileName: { fontSize: 22, fontWeight: 'bold' },
    profileSub: { color: 'gray', marginBottom: 15 },
    profileAction: { flexDirection: 'row', alignItems: 'center' },
    profileActionText: { marginLeft: 8, color: '#004A61', fontWeight: 'bold' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', margin: 20 },
    menuContainer: { backgroundColor: 'white', marginHorizontal: 20, borderRadius: 15, paddingVertical: 10 },
    menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 20 },
    menuLabel: { flex: 1, marginLeft: 15, fontSize: 16 },
});
