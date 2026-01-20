// src/navigation/AuthNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';

// Import auth screens
import Login from '../screens/auth/Login';
import Register from '../screens/auth/Register';
import ForgotPassword from '../screens/auth/ForgotPassword';
import OTPVerification from '../screens/auth/OTPVerification';

const Stack = createStackNavigator();

// Welcome Screen Component
function WelcomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rural e-Governance</Text>
      <Text style={styles.subtitle}>Empowering Rural Communities</Text>
      
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Login')}
          style={styles.button}
          icon="login"
        >
          Login
        </Button>
        
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('Register')}
          style={styles.button}
          icon="account-plus"
        >
          Register
        </Button>
        
        <Button
          mode="text"
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.button}
        >
          Forgot Password?
        </Button>
      </View>
      
      <View style={styles.roleSelector}>
        <Text style={styles.roleTitle}>Continue as:</Text>
        <View style={styles.roleButtons}>
          <Button
            mode="text"
            onPress={() => navigation.navigate('Login', { role: 'citizen' })}
            style={styles.roleButton}
          >
            Citizen
          </Button>
          <Button
            mode="text"
            onPress={() => navigation.navigate('Login', { role: 'officer' })}
            style={styles.roleButton}
          >
            Officer
          </Button>
          <Button
            mode="text"
            onPress={() => navigation.navigate('Login', { role: 'admin' })}
            style={styles.roleButton}
          >
            Admin
          </Button>
        </View>
      </View>
    </View>
  );
}

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2196F3',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen 
        name="Welcome" 
        component={WelcomeScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Login" 
        component={Login} 
        options={{ title: 'Login' }}
      />
      <Stack.Screen 
        name="Register" 
        component={Register} 
        options={{ title: 'Register' }}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPassword} 
        options={{ title: 'Reset Password' }}
      />
      <Stack.Screen 
        name="OTPVerification" 
        component={OTPVerification} 
        options={{ title: 'Verify OTP' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    marginVertical: 8,
  },
  roleSelector: {
    marginTop: 40,
    alignItems: 'center',
  },
  roleTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  roleButton: {
    marginHorizontal: 5,
  },
});