// src/screens/citizen/Settings.js
import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  Linking
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  List,
  Divider,
  RadioButton,
  TextInput,
  Dialog,
  Portal,
  HelperText
} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { changeLanguage } from '../../i18n';
import { useAuth } from '../../contexts/AuthContext';

export default function Settings() {
  const navigation = useNavigation();
  const { user, updateProfile, logout } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    offlineMode: true,
    autoSync: true,
    lowBandwidthMode: false,
    darkMode: false,
    dataSaver: true,
    vibration: true,
    sound: true,
    language: 'en',
    fontSize: 'medium'
  });
  
  const [showLanguageDialog, setShowLanguageDialog] = useState(false);
  const [showFontDialog, setShowFontDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [cacheSize, setCacheSize] = useState('0 MB');
  const [appVersion, setAppVersion] = useState('1.0.0');

  useEffect(() => {
    loadSettings();
    calculateCacheSize();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('app_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  const calculateCacheSize = async () => {
    try {
      // In a real app, calculate actual cache size
      setCacheSize('24.5 MB');
    } catch (error) {
      console.error('Error calculating cache:', error);
    }
  };

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
    
    // Handle special cases
    if (key === 'language') {
      changeLanguage(value);
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will remove all offline data including downloaded videos and images. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // Clear AsyncStorage except for user data and settings
              const keys = await AsyncStorage.getAllKeys();
              const keysToKeep = ['user', 'app_settings', 'app_language'];
              const keysToRemove = keys.filter(key => !keysToKeep.includes(key));
              
              await AsyncStorage.multiRemove(keysToRemove);
              setCacheSize('0 MB');
              
              Alert.alert('Success', 'Cache cleared successfully');
            } catch (error) {
              console.error('Error clearing cache:', error);
              Alert.alert('Error', 'Failed to clear cache');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleResetSettings = () => {
    const defaultSettings = {
      notifications: true,
      offlineMode: true,
      autoSync: true,
      lowBandwidthMode: false,
      darkMode: false,
      dataSaver: true,
      vibration: true,
      sound: true,
      language: 'en',
      fontSize: 'medium'
    };
    
    saveSettings(defaultSettings);
    setShowResetDialog(false);
    Alert.alert('Success', 'Settings reset to default');
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@ruralegov.gov.in?subject=App Support');
  };

  const handleRateApp = () => {
    // In a real app, link to app store
    Alert.alert('Rate App', 'Thank you for using our app!');
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://ruralegov.gov.in/privacy');
  };

  const handleTermsOfService = () => {
    Linking.openURL('https://ruralegov.gov.in/terms');
  };

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  ];

  const fontSizes = [
    { id: 'small', name: 'Small', size: 12 },
    { id: 'medium', name: 'Medium', size: 14 },
    { id: 'large', name: 'Large', size: 16 },
    { id: 'xlarge', name: 'Extra Large', size: 18 },
  ];

  const getLanguageName = (code) => {
    const lang = languages.find(l => l.code === code);
    return lang ? `${lang.name} (${lang.nativeName})` : 'English';
  };

  const getFontSizeName = (id) => {
    const size = fontSizes.find(f => f.id === id);
    return size ? size.name : 'Medium';
  };

  return (
    <ScrollView style={styles.container}>
      {/* App Info Header */}
      <Card style={styles.headerCard}>
        <Card.Content style={styles.headerContent}>
          <View style={styles.appIcon}>
            <Icon name="government" size={40} color="#2196F3" />
          </View>
          <View style={styles.appInfo}>
            <Title style={styles.appName}>Rural e-Governance</Title>
            <Text style={styles.appVersion}>Version {appVersion}</Text>
            <Text style={styles.appDescription}>Empowering Rural Communities</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Account Settings */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>
            <Icon name="account-cog" size={20} color="#2196F3" />
            <Text style={{ marginLeft: 10 }}>Account Settings</Text>
          </Title>
          
          <List.Item
            title="Change Password"
            description="Update your login password"
            left={props => <List.Icon {...props} icon="lock-reset" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('ChangePassword')}
            style={styles.listItem}
          />
          
          <Divider />
          
          <List.Item
            title="Privacy Settings"
            description="Control your data and privacy"
            left={props => <List.Icon {...props} icon="shield-lock" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('PrivacySettings')}
            style={styles.listItem}
          />
          
          <Divider />
          
          <List.Item
            title="Delete Account"
            description="Permanently delete your account"
            left={props => <List.Icon {...props} icon="account-remove" color="#F44336" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => Alert.alert('Delete Account', 'This action cannot be undone')}
            style={styles.listItem}
          />
        </Card.Content>
      </Card>

      {/* App Settings */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>
            <Icon name="cog" size={20} color="#FF9800" />
            <Text style={{ marginLeft: 10 }}>App Settings</Text>
          </Title>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="bell" size={24} color="#666" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive updates about complaints and schemes
                </Text>
              </View>
            </View>
            <Switch
              value={settings.notifications}
              onValueChange={(value) => handleSettingChange('notifications', value)}
              color="#2196F3"
            />
          </View>
          
          <Divider style={styles.settingDivider} />
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="cloud-off" size={24} color="#666" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Offline Mode</Text>
                <Text style={styles.settingDescription}>
                  Work without internet connection
                </Text>
              </View>
            </View>
            <Switch
              value={settings.offlineMode}
              onValueChange={(value) => handleSettingChange('offlineMode', value)}
              color="#2196F3"
            />
          </View>
          
          <Divider style={styles.settingDivider} />
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="sync" size={24} color="#666" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Auto Sync</Text>
                <Text style={styles.settingDescription}>
                  Automatically sync data when online
                </Text>
              </View>
            </View>
            <Switch
              value={settings.autoSync}
              onValueChange={(value) => handleSettingChange('autoSync', value)}
              color="#2196F3"
            />
          </View>
          
          <Divider style={styles.settingDivider} />
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="speedometer-slow" size={24} color="#666" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Low Bandwidth Mode</Text>
                <Text style={styles.settingDescription}>
                  Optimize for slow internet connections
                </Text>
              </View>
            </View>
            <Switch
              value={settings.lowBandwidthMode}
              onValueChange={(value) => handleSettingChange('lowBandwidthMode', value)}
              color="#2196F3"
            />
          </View>
          
          <Divider style={styles.settingDivider} />
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Icon name="theme-light-dark" size={24} color="#666" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Dark Mode</Text>
                <Text style={styles.settingDescription}>
                  Use dark theme (Coming Soon)
                </Text>
              </View>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={(value) => handleSettingChange('darkMode', value)}
              color="#2196F3"
              disabled
            />
          </View>
        </Card.Content>
      </Card>

      {/* Language & Display */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>
            <Icon name="translate" size={20} color="#4CAF50" />
            <Text style={{ marginLeft: 10 }}>Language & Display</Text>
          </Title>
          
          <List.Item
            title="Language"
            description={getLanguageName(settings.language)}
            left={props => <List.Icon {...props} icon="translate" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setShowLanguageDialog(true)}
            style={styles.listItem}
          />
          
          <Divider />
          
          <List.Item
            title="Text Size"
            description={getFontSizeName(settings.fontSize)}
            left={props => <List.Icon {...props} icon="format-size" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setShowFontDialog(true)}
            style={styles.listItem}
          />
        </Card.Content>
      </Card>

      {/* Storage & Data */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>
            <Icon name="database" size={20} color="#9C27B0" />
            <Text style={{ marginLeft: 10 }}>Storage & Data</Text>
          </Title>
          
          <List.Item
            title="Clear Cache"
            description={`Currently using ${cacheSize}`}
            left={props => <List.Icon {...props} icon="delete" />}
            right={props => <Button 
              onPress={handleClearCache} 
              loading={loading}
              disabled={loading}
            >
              Clear
            </Button>}
            style={styles.listItem}
          />
          
          <Divider />
          
          <List.Item
            title="Data Saver"
            description="Reduce data usage"
            left={props => <List.Icon {...props} icon="data-matrix" />}
            right={props => <Switch
              value={settings.dataSaver}
              onValueChange={(value) => handleSettingChange('dataSaver', value)}
              color="#2196F3"
            />}
            style={styles.listItem}
          />
        </Card.Content>
      </Card>

      {/* About & Support */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>
            <Icon name="information" size={20} color="#FF5722" />
            <Text style={{ marginLeft: 10 }}>About & Support</Text>
          </Title>
          
          <List.Item
            title="Help & Support"
            description="Get help with using the app"
            left={props => <List.Icon {...props} icon="help-circle" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleContactSupport}
            style={styles.listItem}
          />
          
          <Divider />
          
          <List.Item
            title="Rate App"
            description="Share your feedback"
            left={props => <List.Icon {...props} icon="star" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleRateApp}
            style={styles.listItem}
          />
          
          <Divider />
          
          <List.Item
            title="Privacy Policy"
            left={props => <List.Icon {...props} icon="shield-check" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={handlePrivacyPolicy}
            style={styles.listItem}
          />
          
          <Divider />
          
          <List.Item
            title="Terms of Service"
            left={props => <List.Icon {...props} icon="file-document" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleTermsOfService}
            style={styles.listItem}
          />
          
          <Divider />
          
          <List.Item
            title="App Version"
            description={`Version ${appVersion} (Build 1)`}
            left={props => <List.Icon {...props} icon="tag" />}
            style={styles.listItem}
          />
        </Card.Content>
      </Card>

      {/* Reset Settings */}
      <Card style={styles.resetCard}>
        <Card.Content>
          <Title style={styles.resetTitle}>Reset Settings</Title>
          <Text style={styles.resetDescription}>
            Reset all settings to default values
          </Text>
          <Button
            mode="outlined"
            onPress={() => setShowResetDialog(true)}
            style={styles.resetButton}
            icon="restore"
          >
            Reset to Default
          </Button>
        </Card.Content>
      </Card>

      {/* Logout Button */}
      <Button
        mode="outlined"
        onPress={() => {
          Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Logout', onPress: logout, style: 'destructive' }
            ]
          );
        }}
        style={styles.logoutButton}
        icon="logout"
        textColor="#F44336"
      >
        Logout
      </Button>

      {/* Language Selection Dialog */}
      <Portal>
        <Dialog
          visible={showLanguageDialog}
          onDismiss={() => setShowLanguageDialog(false)}
        >
          <Dialog.Title>Select Language</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              value={settings.language}
              onValueChange={(value) => {
                handleSettingChange('language', value);
                setShowLanguageDialog(false);
              }}
            >
              {languages.map((lang) => (
                <View key={lang.code} style={styles.radioItem}>
                  <RadioButton value={lang.code} />
                  <Text style={styles.radioText}>
                    {lang.name} ({lang.nativeName})
                  </Text>
                </View>
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowLanguageDialog(false)}>
              Cancel
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Font Size Dialog */}
      <Portal>
        <Dialog
          visible={showFontDialog}
          onDismiss={() => setShowFontDialog(false)}
        >
          <Dialog.Title>Select Text Size</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              value={settings.fontSize}
              onValueChange={(value) => {
                handleSettingChange('fontSize', value);
                setShowFontDialog(false);
              }}
            >
              {fontSizes.map((size) => (
                <View key={size.id} style={styles.radioItem}>
                  <RadioButton value={size.id} />
                  <View style={styles.fontSample}>
                    <Text style={[styles.fontText, { fontSize: size.size }]}>
                      {size.name}
                    </Text>
                    <Text style={[styles.fontPreview, { fontSize: size.size }]}>
                      Sample text for {size.name} size
                    </Text>
                  </View>
                </View>
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowFontDialog(false)}>
              Cancel
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Reset Confirmation Dialog */}
      <Portal>
        <Dialog
          visible={showResetDialog}
          onDismiss={() => setShowResetDialog(false)}
        >
          <Dialog.Title>Reset Settings</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to reset all settings to default values?
            </Text>
            <HelperText type="info" style={styles.resetWarning}>
              This will not affect your account data or downloaded content.
            </HelperText>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowResetDialog(false)}>
              Cancel
            </Button>
            <Button
              onPress={handleResetSettings}
              mode="contained"
            >
              Reset
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    margin: 10,
    elevation: 4,
    backgroundColor: '#E3F2FD',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  appVersion: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  appDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  sectionCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItem: {
    paddingVertical: 12,
    minHeight: 60,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    flex: 1,
    marginLeft: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  settingDivider: {
    marginHorizontal: -16,
  },
  resetCard: {
    marginHorizontal: 10,
    marginBottom: 10,
    elevation: 2,
    borderRadius: 8,
    backgroundColor: '#FFF8E1',
  },
  resetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#FF8F00',
  },
  resetDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  resetButton: {
    alignSelf: 'flex-start',
    borderColor: '#FF8F00',
  },
  logoutButton: {
    marginHorizontal: 10,
    marginVertical: 20,
    borderColor: '#F44336',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  radioText: {
    marginLeft: 10,
    fontSize: 16,
  },
  fontSample: {
    marginLeft: 10,
    flex: 1,
  },
  fontText: {
    fontWeight: '500',
    marginBottom: 4,
  },
  fontPreview: {
    color: '#666',
  },
  resetWarning: {
    marginTop: 10,
  },
});