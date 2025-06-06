// frontend/src/App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './components/screens/LoginScreen';
import RegisterScreen from './components/screens/RegisterScreen';
import ProfileScreen from './components/screens/ProfileScreen';
import UsersListScreen from './components/screens/UsersListScreen';
import { COLORS } from './utils/constants';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.PRIMARY,
          },
          headerTintColor: COLORS.WHITE,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ title: 'Entrar' }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen}
          options={{ title: 'Registrar' }}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen}
          options={{ title: 'Perfil' }}
        />
        <Stack.Screen 
          name="UsersList" 
          component={UsersListScreen}
          options={{ title: 'Usuários' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}