import { Feather } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LogoutConfirmModal({ visible, onClose, onConfirm }) {
  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header Padronizado */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Feather name="arrow-left" size={24} color="#004A61" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sair da conta</Text>
            <View style={styles.headerPlaceholder} />
          </View>

          {/* Conteúdo de Confirmação */}
          <View style={styles.content}>
            <Feather name="log-out" size={60} color="#004A61" style={{ alignSelf: 'center', marginBottom: 30 }} />
            <Text style={styles.confirmationTitle}>Deseja mesmo sair da sua conta?</Text>
            <Text style={styles.confirmationSubtitle}>Você precisará fazer login novamente para acessar seus dados.</Text>
          </View>

          {/* Botões de Ação na parte inferior */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
                <Text style={styles.secondaryButtonText}>Não, quero continuar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={onConfirm}>
                <Text style={styles.primaryButtonText}>Sim, sair</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: 'white' },
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#004A61' },
  headerPlaceholder: { width: 24 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  confirmationTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', color: '#333' },
  confirmationSubtitle: { fontSize: 16, color: 'gray', textAlign: 'center', marginTop: 10 },
  buttonContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  primaryButton: {
    backgroundColor: '#D32F2F', // Um vermelho para ação destrutiva
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  secondaryButtonText: { color: '#333', fontWeight: 'bold', fontSize: 16 },
});