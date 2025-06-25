// HealthCare_FrontEnd/src/app/(tabs)/conta.tsx

import { useAccount } from '@/hooks/useAccount'; // <-- Apenas este hook é necessário
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useUserData } from '@/hooks/useUserData';

// Não precisamos do useUserData aqui, pois o useAccount já lida com a busca de dados.
import AdditionalDataModal from '@/components/Account/AdditionalDataModal';
import ChangePasswordModal from '@/components/Account/ChangePasswordModal';
import LogoutConfirmModal from '@/components/Account/LogoutConfirmModal';
import PersonalInfoModal from '@/components/Account/PersonalInfoModal';

export default function AccountScreen() {
  const { userName, loading } = useUserData();

  // Chamamos apenas o useAccount, que já contém toda a lógica para este ecrã.
  const {
    isLoading, // Usamos este estado de loading único.
    activeModal,
    openModal,
    closeModal,
    personalInfo, // Usamos estes dados para o nome e email.
    additionalData,
    handleSavePersonalInfo,
    handleSaveAdditionalData,
    handleChangePassword,
    handleLogout,
  } = useAccount();

  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  const menuItems = [
    { key: 'personalInfo', icon: 'user', label: 'Informações pessoais' },
    { key: 'additionalData', icon: 'clipboard', label: 'Dados adicionais' },
    { key: 'changePassword', icon: 'key', label: 'Alterar senha' },
    { key: 'logout', icon: 'log-out', label: 'Sair' },
  ];

  // Apenas uma verificação de loading é necessária.
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView>
        <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: themeColors.primary }]}>HEALTHCARE</Text>
        </View>

        <View style={[styles.profileCard, { backgroundColor: themeColors.card }]}>
            {/* Usamos personalInfo.fullName, que já vem do hook useAccount */}
            <Text style={[styles.profileName, { color: themeColors.text }]}>Olá, {userName || 'Usuário'}!</Text>
            <Text style={[styles.profileSub, { color: themeColors.textSecondary }]}>Seja bem-vindo ao Olhealth.</Text>
            <TouchableOpacity style={styles.profileAction} onPress={() => openModal('personalInfo')}>
                <Feather name="user" size={16} color={themeColors.primary}/>
                <Text style={[styles.profileActionText, { color: themeColors.primary }]}>Alterar perfil</Text>
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
      <AdditionalDataModal
        visible={activeModal === 'additionalData'}
        onClose={closeModal}
        data={{ ...personalInfo, ...additionalData }}
        onSave={handleSaveAdditionalData}
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
    container: { flex: 1 },
    loadingContainer: { justifyContent: 'center', alignItems: 'center' },
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
