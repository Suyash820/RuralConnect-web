// src/screens/auth/Login.js
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Title } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';

export default function Login({ navigation, route }) {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      alert('Please enter phone and password');
      return;
    }

    setLoading(true);
    const role = route.params?.role || 'citizen';
    const result = await login(phone, password, role);
    setLoading(false);

    if (!result.success) {
      alert(result.error || 'Login failed');
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Login to Rural e-Governance</Title>
      
      <TextInput
        label="Phone Number"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
        style={styles.input}
        mode="outlined"
        left={<TextInput.Icon icon="phone" />}
      />
      
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        mode="outlined"
        left={<TextInput.Icon icon="lock" />}
      />
      
      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Login
      </Button>
      
      <View style={styles.links}>
        <Button
          mode="text"
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          Forgot Password?
        </Button>
        <Button
          mode="text"
          onPress={() => navigation.navigate('Register')}
        >
          Create New Account
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
    paddingVertical: 5,
  },
  links: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});