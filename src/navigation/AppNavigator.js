// src/navigation/AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../components/common/Loading';
import AuthNavigator from './AuthNavigator';
import CitizenNavigator from './CitizenNavigator';
import OfficerNavigator from './OfficerNavigator';
import AdminNavigator from './AdminNavigator';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  const getRoleNavigator = () => {
    switch (user?.role) {
      case 'officer':
        return OfficerNavigator;
      case 'admin':
        return AdminNavigator;
      default:
        return CitizenNavigator;
    }
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <Stack.Screen name="Main" component={getRoleNavigator()} />
      )}
    </Stack.Navigator>
  );
}