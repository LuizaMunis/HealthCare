import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function NotificacoesScreen() {
  const router = useRouter();
  const [medicamentosEnabled, setMedicamentosEnabled] = useState(true);
  const [consultasEnabled, setConsultasEnabled] = useState(false);

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notificações</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Medicamentos Notification */}
        <View style={[styles.notificationItem, medicamentosEnabled ? styles.notificationItemActive : styles.notificationItemInactive]}>
          <Text style={styles.notificationText}>Medicamentos</Text>
          <Switch
            value={medicamentosEnabled}
            onValueChange={setMedicamentosEnabled}
            trackColor={{
              false: '#E0E0E0',
              true: medicamentosEnabled ? '#004A61' : '#81C5D8'
            }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#E0E0E0"
            style={styles.switch}
          />
        </View>

        {/* Consultas Notification */}
        <View style={[styles.notificationItem, consultasEnabled ? styles.notificationItemActive : styles.notificationItemInactive]}>
          <Text style={styles.notificationText}>Consultas</Text>
          <Switch
            value={consultasEnabled}
            onValueChange={setConsultasEnabled}
            trackColor={{
              false: '#E0E0E0',
              true: consultasEnabled ? '#004A61' : '#81C5D8'
            }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#E0E0E0"
            style={styles.switch}
          />
        </View>
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  notificationItemActive: {
    backgroundColor: '#004A61',
  },
  notificationItemInactive: {
    backgroundColor: '#81C5D8',
  },
  notificationText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  switch: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }],
  },
});
