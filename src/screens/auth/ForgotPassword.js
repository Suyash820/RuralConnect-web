// src/screens/auth/ForgotPassword.js
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
  HelperText
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

export default function ForgotPassword() {
  const navigation = useNavigation();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: New Password
  const [timer, setTimer] = useState(0);
  const [otpSent, setOtpSent] = useState(false);

  // Timer for OTP resend
  React.useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const validatePhone = () => {
    const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile numbers
    if (!phone) {
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }
    if (!phoneRegex.test(phone)) {
      Alert.alert('Error', 'Please enter a valid 10-digit Indian mobile number');
      return false;
    }
    return true;
  };

  const handleSendOTP = async () => {
    if (!validatePhone()) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo, OTP is 123456
      setOtpSent(true);
      setStep(2);
      setTimer(60); // 60 seconds timer
      Alert.alert('OTP Sent', 'An OTP has been sent to your phone number');
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit OTP');
      return;
    }

    // Demo verification - any 6 digit OTP works
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep(3);
      Alert.alert('Success', 'OTP verified successfully');
    } catch (error) {
      Alert.alert('Error', 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please enter and confirm your new password');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Success',
        'Password reset successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    if (timer > 0) {
      Alert.alert('Wait', `Please wait ${timer} seconds before resending OTP`);
      return;
    }
    
    setOtp('');
    handleSendOTP();
  };

  const formatTimer = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Reset Password</Title>
            <Text style={styles.subtitle}>
              {step === 1 && 'Enter your registered phone number'}
              {step === 2 && 'Enter the OTP sent to your phone'}
              {step === 3 && 'Set your new password'}
            </Text>

            {/* Step 1: Phone Number */}
            {step === 1 && (
              <View style={styles.stepContainer}>
                <TextInput
                  label="Phone Number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  style={styles.input}
                  mode="outlined"
                  left={<TextInput.Icon icon="phone" />}
                  placeholder="Enter 10-digit mobile number"
                  maxLength={10}
                />
                <HelperText type="info">
                  Enter the phone number associated with your account
                </HelperText>
                
                <Button
                  mode="contained"
                  onPress={handleSendOTP}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                  icon="send"
                >
                  Send OTP
                </Button>
              </View>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <View style={styles.stepContainer}>
                <View style={styles.phoneDisplay}>
                  <Icon name="cellphone" size={20} color="#666" />
                  <Text style={styles.phoneText}>OTP sent to +91-{phone}</Text>
                  <Button
                    mode="text"
                    onPress={() => setStep(1)}
                    compact
                  >
                    Change
                  </Button>
                </View>

                <TextInput
                  label="Enter OTP"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  style={styles.input}
                  mode="outlined"
                  left={<TextInput.Icon icon="numeric" />}
                  placeholder="6-digit OTP"
                  maxLength={6}
                />
                
                <View style={styles.timerContainer}>
                  <Text style={styles.timerText}>
                    OTP valid for: {formatTimer()}
                  </Text>
                  <Button
                    mode="text"
                    onPress={handleResendOTP}
                    disabled={timer > 0}
                    compact
                  >
                    Resend OTP
                  </Button>
                </View>
                
                <HelperText type="info">
                  For demo, you can enter any 6-digit number
                </HelperText>

                <Button
                  mode="contained"
                  onPress={handleVerifyOTP}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                  icon="check-circle"
                >
                  Verify OTP
                </Button>
              </View>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <View style={styles.stepContainer}>
                <TextInput
                  label="New Password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  style={styles.input}
                  mode="outlined"
                  left={<TextInput.Icon icon="lock" />}
                  placeholder="At least 6 characters"
                />
                
                <TextInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  style={styles.input}
                  mode="outlined"
                  left={<TextInput.Icon icon="lock-check" />}
                  placeholder="Re-enter your password"
                />
                
                <HelperText type="info">
                  Make sure both passwords match
                </HelperText>

                <Button
                  mode="contained"
                  onPress={handleResetPassword}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                  icon="lock-reset"
                >
                  Reset Password
                </Button>
              </View>
            )}

            {/* Navigation Links */}
            <View style={styles.linksContainer}>
              <Button
                mode="text"
                onPress={() => navigation.navigate('Login')}
                style={styles.linkButton}
              >
                Back to Login
              </Button>
              
              {step > 1 && (
                <Button
                  mode="text"
                  onPress={() => setStep(step - 1)}
                  style={styles.linkButton}
                >
                  Go Back
                </Button>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* Security Info */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoRow}>
              <Icon name="shield-check" size={20} color="#4CAF50" />
              <Text style={styles.infoText}>
                Your password reset is secure and encrypted
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="clock-outline" size={20} color="#FF9800" />
              <Text style={styles.infoText}>
                OTP expires in 10 minutes
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="information" size={20} color="#2196F3" />
              <Text style={styles.infoText}>
                Contact support if you don't receive OTP
              </Text>
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
  stepContainer: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
  },
  phoneDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  phoneText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timerText: {
    color: '#f44336',
    fontSize: 14,
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  linkButton: {
    minWidth: 120,
  },
  infoCard: {
    marginTop: 24,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    flex: 1,
    color: '#555',
  },
});