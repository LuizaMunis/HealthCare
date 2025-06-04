// frontend/src/components/screens/ProfileScreen.js
import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useUserViewModel } from '../../viewmodels/UserViewModel';
import { COLORS, SPACING } from '../../utils/constants';

const ProfileScreen = ({ navigation }) => {
  const { 
    user, 
    loading, 
    error, 
    fetchProfile, 
    logout, 
    checkApiHealth 
  } = useUserViewModel();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const result = await fetchProfile();
    if (!result.success) {
      Alert.alert('Erro', result.error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirmar Logout',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.navigate('Login');
          },
        },
      ]
    );
  };

  const handleCheckApi = async () => {
    const result = await checkApiHealth();
    Alert.alert(
      'Status da API',
      result.success ? 'API funcionando normalmente!' : 'API com problemas'
    );
  };

  if (loading && !user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.getInitials() || 'U'}
            </Text>
          </View>
          
          <Text style={styles.name}>
            {user?.getDisplayName() || 'Nome não disponível'}
          </Text>
          
          <Text style={styles.email}>
            {user?.email || 'Email não disponível'}
          </Text>
          
          {user?.createdAt && (
            <Text style={styles.memberSince}>
              Membro desde: {new Date(user.createdAt).toLocaleDateString('pt-BR')}
            </Text>
          )}
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('UsersList')}
          >
            <Text style={styles.actionButtonText}>Ver Usuários</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleCheckApi}
          >
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
              Verificar API
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.actionButtonText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.LIGHT,
  },
  content: {
    flex: 1,
    padding: SPACING.LG,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.WHITE,
  },
  loadingText: {
    marginTop: SPACING.MD,
    fontSize: 16,
    color: COLORS.SECONDARY,
  },
  profileCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    padding: SPACING.XL,
    alignItems: 'center',
    marginBottom: SPACING.LG,
    elevation: 2,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.MD,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.DARK,
    marginBottom: SPACING.SM,
  },
  email: {
    fontSize: 16,
    color: COLORS.SECONDARY,
    marginBottom: SPACING.SM,
  },
  memberSince: {
    fontSize: 14,
    color: COLORS.SECONDARY,
  },
  actionsContainer: {
    gap: SPACING.MD,
  },
  actionButton: {
    backgroundColor: COLORS.PRIMARY,
    padding: SPACING.MD,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: COLORS.WHITE,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
  },
  logoutButton: {
    backgroundColor: COLORS.DANGER,
  },
  actionButtonText: {
    color: COLORS.WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButtonText: {
    color: COLORS.PRIMARY,
  },
});

export default ProfileScreen;