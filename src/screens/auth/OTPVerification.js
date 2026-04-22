// src/screens/auth/OTPVerification.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Alert,
  Keyboard,
  TouchableWithoutFeedback,
  BackHandler
} from 'react-native';
import {
  Button,
  Title,
  Card,
  Paragraph,
  HelperText,
  ActivityIndicator
} from 'react-native-paper';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function OTPVerification() {
  const navigation = useNavigation();
  const route = useRoute();
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60); // 60 seconds
  const [canResend, setCanResend] = useState(false);
  const [verificationError, setVerificationError] = useState(false);
  
  const { phone, email, purpose = 'registration' } = route.params || {};
  
  // Handle back button press
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handleBackPress
    );
    
    return () => backHandler.remove();
  }, []);

  // Timer for OTP resend
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleBackPress = () => {
    Alert.alert(
      'Cancel Verification?',
      'Are you sure you want to cancel OTP verification?',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes', 
          style: 'destructive',
          onPress: () => navigation.goBack()
        }
      ]
    );
    return true;
  };

  const formatTimer = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleOTPComplete = async (otp) => {
    if (otp.length !== 6) {
      setVerificationError(true);
      return;
    }

    setLoading(true);
    setVerificationError(false);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Demo verification - accept any 6 digit OTP
      if (otp.length === 6) {
        handleVerificationSuccess();
      } else {
        throw new Error('Invalid OTP');
      }
    } catch (error) {
      setVerificationError(true);
      Alert.alert('Verification Failed', 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationSuccess = () => {
    Alert.alert(
      'Success!',
      'Phone number verified successfully',
      [
        {
          text: 'Continue',
          onPress: () => {
            if (purpose === 'registration') {
              navigation.navigate('Login', { verified: true });
            } else if (purpose === 'forgotPassword') {
              navigation.navigate('ResetPassword', { phone });
            } else {
              navigation.navigate('Home');
            }
          }
        }
      ]
    );
  };

  const handleResendOTP = async () => {
    if (!canResend) {
      Alert.alert('Wait', `Please wait ${formatTimer()} before resending`);
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTimer(60);
      setCanResend(false);
      setVerificationError(false);
      
      Alert.alert('OTP Sent', 'A new OTP has been sent to your phone');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const maskedPhone = phone ? phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2') : '';
  const maskedEmail = email ? email.replace(/(.{3}).*@(.*)/, '$1***@$2') : '';

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <Icon 
                name="shield-check" 
                size={60} 
                color="#4CAF50" 
                style={styles.icon}
              />
              <Title style={styles.title}>Verify OTP</Title>
              <Paragraph style={styles.subtitle}>
                Enter the 6-digit code sent to
              </Paragraph>
              
              {phone && (
                <View style={styles.contactInfo}>
                  <Icon name="phone" size={20} color="#666" />
                  <Text style={styles.contactText}>+91 {maskedPhone}</Text>
                </View>
              )}
              
              {email && (
                <View style={styles.contactInfo}>
                  <Icon name="email" size={20} color="#666" />
                  <Text style={styles.contactText}>{maskedEmail}</Text>
                </View>
              )}
            </View>

            {/* OTP Input */}
            <View style={styles.otpContainer}>
              <OTPInputView
                style={styles.otpInput}
                pinCount={6}
                codeInputFieldStyle={[
                  styles.otpField,
                  verificationError && styles.otpFieldError
                ]}
                codeInputHighlightStyle={styles.otpFieldHighlight}
                onCodeFilled={handleOTPComplete}
                autoFocusOnLoad
                keyboardType="number-pad"
              />
              
              {verificationError && (
                <HelperText type="error" visible={verificationError}>
                  Invalid OTP. Please try again.
                </HelperText>
              )}
            </View>

            {/* Timer and Resend */}
            <View style={styles.timerContainer}>
              <View style={styles.timerRow}>
                <Icon name="clock-outline" size={20} color="#FF9800" />
                <Text style={styles.timerText}>
                  OTP expires in: {formatTimer()}
                </Text>
              </View>
              
              <Button
                mode="text"
                onPress={handleResendOTP}
                disabled={!canResend || loading}
                loading={loading}
                icon="refresh"
              >
                Resend OTP {canResend ? '' : `(${formatTimer()})`}
              </Button>
            </View>

            {/* Loading Indicator */}
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
                <Text style={styles.loadingText}>Verifying OTP...</Text>
              </View>
            )}

            {/* Help Text */}
            <View style={styles.helpContainer}>
              <HelperText type="info">
                For demo purposes, you can enter any 6-digit number
              </HelperText>
              <HelperText type="info" style={styles.helpText}>
                Didn't receive OTP? Check your spam folder or try resend
              </HelperText>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={handleBackPress}
                style={styles.button}
                icon="arrow-left"
              >
                Back
              </Button>
              
              <Button
                mode="contained"
                onPress={() => {
                  // Auto-submit if OTP is 123456 (demo)
                  handleOTPComplete('123456');
                }}
                style={styles.button}
                icon="check-circle"
              >
                Use Demo OTP (123456)
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* Security Info */}
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoRow}>
              <Icon name="shield-lock" size={20} color="#2196F3" />
              <Text style={styles.infoText}>
                This verification ensures your account security
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="information" size={20} color="#4CAF50" />
              <Text style={styles.infoText}>
                Never share your OTP with anyone
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Icon name="phone-lock" size={20} color="#FF9800" />
              <Text style={styles.infoText}>
                OTP is valid for 10 minutes only
              </Text>
            </View>
          </Card.Content>
        </Card>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  card: {
    elevation: 4,
    borderRadius: 12,
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginBottom: 12,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  contactText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  otpContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  otpInput: {
    width: '80%',
    height: 60,
  },
  otpField: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
    fontSize: 20,
    color: '#333',
  },
  otpFieldError: {
    borderColor: '#f44336',
    borderWidth: 2,
  },
  otpFieldHighlight: {
    borderColor: '#2196F3',
    borderWidth: 2,
  },
  timerContainer: {
    marginVertical: 20,
    padding: 16,
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  timerText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#FF8F00',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  helpContainer: {
    marginTop: 20,
  },
  helpText: {
    marginTop: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  infoCard: {
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
    fontSize: 14,
  },
});