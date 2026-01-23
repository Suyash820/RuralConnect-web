// src/screens/auth/Register.js
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Title,
  Card,
  HelperText,
  RadioButton,
  Divider
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';

export default function Register() {
  const navigation = useNavigation();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'citizen',
    address: '',
    aadhar: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit Indian mobile number';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (formData.aadhar && !/^\d{12}$/.test(formData.aadhar)) {
      newErrors.aadhar = 'Aadhar must be 12 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const result = await register(formData);
      
      if (result.success) {
        Alert.alert(
          'Registration Successful',
          'Your account has been created successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        Alert.alert('Registration Failed', result.error || 'Please try again');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const roles = [
    { label: 'Citizen', value: 'citizen', icon: 'account', color: '#4CAF50' },
    { label: 'Government Officer', value: 'officer', icon: 'badge-account', color: '#2196F3' },
    { label: 'Admin', value: 'admin', icon: 'shield-account', color: '#FF9800' },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Create Account</Title>
            <Text style={styles.subtitle}>Join Rural e-Governance Platform</Text>

            {/* Personal Information */}
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <TextInput
              label="Full Name *"
              value={formData.name}
              onChangeText={(value) => handleFieldChange('name', value)}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="account" />}
              error={!!errors.name}
            />
            {errors.name && <HelperText type="error">{errors.name}</HelperText>}

            <TextInput
              label="Phone Number *"
              value={formData.phone}
              onChangeText={(value) => handleFieldChange('phone', value)}
              keyboardType="phone-pad"
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="phone" />}
              maxLength={10}
              error={!!errors.phone}
            />
            {errors.phone && <HelperText type="error">{errors.phone}</HelperText>}

            <TextInput
              label="Email Address"
              value={formData.email}
              onChangeText={(value) => handleFieldChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="email" />}
              error={!!errors.email}
            />
            {errors.email && <HelperText type="error">{errors.email}</HelperText>}

            <TextInput
              label="Address"
              value={formData.address}
              onChangeText={(value) => handleFieldChange('address', value)}
              multiline
              numberOfLines={2}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="home" />}
            />

            <TextInput
              label="Aadhar Number (Optional)"
              value={formData.aadhar}
              onChangeText={(value) => handleFieldChange('aadhar', value)}
              keyboardType="number-pad"
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="card-account-details" />}
              maxLength={12}
              error={!!errors.aadhar}
            />
            {errors.aadhar && <HelperText type="error">{errors.aadhar}</HelperText>}

            {/* Role Selection */}
            <Text style={styles.sectionTitle}>Select Role</Text>
            <RadioButton.Group
              value={formData.role}
              onValueChange={(value) => handleFieldChange('role', value)}
            >
              <View style={styles.roleContainer}>
                {roles.map((role) => (
                  <View key={role.value} style={styles.roleOption}>
                    <View style={styles.roleIconContainer}>
                      <Icon name={role.icon} size={20} color={role.color} />
                    </View>
                    <View style={styles.roleTextContainer}>
                      <Text style={styles.roleLabel}>{role.label}</Text>
                      <Text style={styles.roleDescription}>
                        {role.value === 'citizen' && 'File complaints, check schemes, learn'}
                        {role.value === 'officer' && 'Manage complaints, assign tasks'}
                        {role.value === 'admin' && 'Manage users, analytics, settings'}
                      </Text>
                    </View>
                    <RadioButton value={role.value} />
                  </View>
                ))}
              </View>
            </RadioButton.Group>

            <Divider style={styles.divider} />

            {/* Password Section */}
            <Text style={styles.sectionTitle}>Security</Text>
            
            <TextInput
              label="Password *"
              value={formData.password}
              onChangeText={(value) => handleFieldChange('password', value)}
              secureTextEntry={!showPassword}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="lock" />}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              error={!!errors.password}
            />
            {errors.password && <HelperText type="error">{errors.password}</HelperText>}

            <TextInput
              label="Confirm Password *"
              value={formData.confirmPassword}
              onChangeText={(value) => handleFieldChange('confirmPassword', value)}
              secureTextEntry={!showConfirmPassword}
              style={styles.input}
              mode="outlined"
              left={<TextInput.Icon icon="lock-check" />}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
              error={!!errors.confirmPassword}
            />
            {errors.confirmPassword && (
              <HelperText type="error">{errors.confirmPassword}</HelperText>
            )}

            {/* Terms and Conditions */}
            <View style={styles.termsContainer}>
              <Icon name="information" size={20} color="#2196F3" />
              <Text style={styles.termsText}>
                By registering, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>

            {/* Register Button */}
            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              disabled={loading}
              style={styles.registerButton}
              icon="account-plus"
            >
              Create Account
            </Button>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account?</Text>
              <Button
                mode="text"
                onPress={() => navigation.navigate('Login')}
                compact
              >
                Login here
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    elevation: 4,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    color: '#333',
  },
  input: {
    marginBottom: 8,
  },
  roleContainer: {
    marginBottom: 16,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  roleIconContainer: {
    marginRight: 12,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  roleDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  divider: {
    marginVertical: 16,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  termsText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#1976D2',
  },
  registerButton: {
    marginTop: 8,
    paddingVertical: 6,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  loginText: {
    marginRight: 8,
    color: '#666',
  },
});