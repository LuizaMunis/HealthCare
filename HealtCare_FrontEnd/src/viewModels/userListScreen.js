// frontend/src/components/screens/UsersListScreen.js
import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useUserViewModel } from '../../viewmodels/UserViewModel';
import { COLORS, SPACING } from '../../utils/constants';

const UserCard = ({ user }) => (
  <View style={styles.userCard}>
    <View style={styles.userAvatar}>
      <Text style={styles.userAvatarText}>
        {user.getInitials()}
      </Text>
    </View>
    
    <View style={styles.userInfo}>
      <Text style={styles.userName}>{user.getDisplayName()}</Text>
      <Text style={styles.userEmail}>{user.email}</Text>
      {user.createdAt && (
        <Text style={styles.userDate}>
          Registrado em: {new Date(user.createdAt).toLocaleDateString('pt-BR')}
        </Text>
      )}
    </View>
  </View>
);

const UsersListScreen = () => {
  const { 
    users, 
    loading, 
    error, 
    fetchAllUsers 
  } = useUserViewModel();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const result = await fetchAllUsers();
    if (!result.success) {
      Alert.alert('Erro', result.error);
    }
  };

  const renderUser = ({ item }) => <UserCard user={item} />;

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Nenhum usuário encontrado</Text>
    </View>
  );

  if (loading && users.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Carregando usuários...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUser}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadUsers}
            colors={[COLORS.PRIMARY]}
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.LIGHT,
  },
  listContainer: {
    padding: SPACING.MD,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.XL * 2,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.SECONDARY,
    textAlign: 'center',
  },
  userCard: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 8,
    padding: SPACING.MD,
    marginBottom: SPACING.MD,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: COLORS.BLACK,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.MD,
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.WHITE,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.DARK,
    marginBottom: SPACING.XS,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.SECONDARY,
    marginBottom: SPACING.XS,
  },
  userDate: {
    fontSize: 12,
    color: COLORS.SECONDARY,
  },
});

export default UsersListScreen;